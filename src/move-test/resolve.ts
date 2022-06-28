import * as path from 'path';
import * as vscode from 'vscode';
import { IDEExtensionContext } from '../context';
import { MoveTestKind, genMoveTestId, parseMoveTestId } from './utils';

export class GoTestResolver {
  private ctx: IDEExtensionContext;
  private ctrl: vscode.TestController;
  public readonly all = new Map<string, vscode.TestItem>();

  constructor(ctx: IDEExtensionContext, ctrl: vscode.TestController) {
    this.ctx = ctx;
    this.ctrl = ctrl;
  }

  public async provideDocumentSymbols(document: vscode.TextDocument): Promise<vscode.DocumentSymbol[]> {
    const symbols: vscode.DocumentSymbol[] | undefined = await vscode.commands.executeCommand(
      'vscode.executeDocumentSymbolProvider',
      document.uri
    );

    if (!symbols || symbols.length === 0) {
      return [];
    }

    return symbols;
  }

  get items() {
    return this.ctrl.items;
  }

  get allItems() {
    function* it(coll: vscode.TestItemCollection): Generator<vscode.TestItem> {
      const arr: vscode.TestItem[] = [];
      coll.forEach((x) => arr.push(x));

      for (const item of arr) {
        yield item;
        yield* it(item.children);
      }
    }

    return it(this.items);
  }

  public updateGoTestContext() {
    const items: Array<string> = [];
    for (const item of this.allItems) {
      items.push(item.id);
    }
    vscode.commands.executeCommand('setContext', 'go.tests', items);
  }

  // Processes a Move document, calling processSymbol for each symbol in the
  // document.
  //
  // Any previously existing tests that no longer have a corresponding symbol in
  // the file will be disposed. If the document contains no tests, it will be
  // disposed.
  async processDocument(doc: vscode.TextDocument, ranges: vscode.Range[] | undefined) {
    const seen = new Set<string>();
    const item = await this.getFile(doc.uri);
    const symbols = await this.provideDocumentSymbols(doc);

    for (const symbol of symbols) {
      await this.processSymbol(doc, item, seen, symbol);
    }

    item.children.forEach((child) => {
      const { name } = parseMoveTestId(child.id);
      if (!name || !seen.has(name)) {
        this.dispose(child);
        return;
      }

      if (ranges?.some((r: vscode.Range) => !!child.range?.intersection(r))) {
        item.children.forEach((x) => this.dispose(x));
      }
    });

    this.disposeIfEmpty(item);
  }

  // Create an item.
  private createItem(label: string, uri: vscode.Uri, kind: MoveTestKind, name?: string): vscode.TestItem {
    const id = genMoveTestId(uri, kind, name);
    const item = this.ctrl.createTestItem(id, label, uri.with({ query: '', fragment: '' }));
    this.all.set(id, item);
    return item;
  }

  // Retrieve an item.
  private getItem(
    parent: vscode.TestItem | undefined,
    uri: vscode.Uri,
    kind: MoveTestKind,
    name?: string
  ): vscode.TestItem | undefined {
    return (parent?.children || this.ctrl.items).get(genMoveTestId(uri, kind, name));
  }

  // Create or retrieve an item.
  private getOrCreateItem(
    parent: vscode.TestItem | undefined,
    label: string,
    uri: vscode.Uri,
    kind: MoveTestKind,
    name?: string
  ): vscode.TestItem {
    const existing = this.getItem(parent, uri, kind, name);
    if (existing) return existing;

    const item = this.createItem(label, uri, kind, name);
    (parent?.children || this.ctrl.items).add(item);
    return item;
  }

  // Retrieve or create an item for a Go file.
  private async getFile(uri: vscode.Uri): Promise<vscode.TestItem> {
    const label = path.basename(uri.path);
    const item = this.getOrCreateItem(undefined, label, uri, 'file');
    item.canResolveChildren = true;
    return item;
  }

  private dispose(item: vscode.TestItem) {
    this.all.delete(item.id);
    item.parent?.children.delete(item.id);
  }

  // Dispose of the item if it has no children, recursively. This facilitates
  // cleaning up package/file trees that contain no tests.
  private disposeIfEmpty(item: vscode.TestItem | undefined) {
    if (!item) return;
    // Don't dispose of empty top-level items
    const { kind } = parseMoveTestId(item.id);
    if (kind === 'module') {
      return;
    }

    if (item.children.size > 0) {
      return;
    }

    this.dispose(item);
    this.disposeIfEmpty(item.parent);
  }

  // Recursively process a Go AST symbol. If the symbol represents a test, fuzz test,
  // benchmark, or example function, a test item will be created for it, if one
  // does not already exist. If the symbol is not a function and contains
  // children, those children will be processed recursively.
  private async processSymbol(
    doc: vscode.TextDocument,
    file: vscode.TestItem,
    seen: Set<string>,
    symbol: vscode.DocumentSymbol
  ) {
    // Recursively process symbols that are nested
    if (symbol.kind !== vscode.SymbolKind.Function && symbol.kind !== vscode.SymbolKind.Method) {
      for (const sym of symbol.children) await this.processSymbol(doc, file, seen, sym);
      return;
    }

    const match = symbol.detail.indexOf('test') > 0;
    if (!match) {
      return;
    }

    seen.add(symbol.name);
    const item = this.getOrCreateItem(file, symbol.name, doc.uri, 'func', symbol.name);
    item.range = symbol.range;
    this.all.set(item.id, item);
  }
}
