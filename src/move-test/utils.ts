import * as vscode from 'vscode';
export type MoveTestKind = 'file' | 'module' | 'func';

// The subset of vscode.FileSystem that is used by the test explorer.
export type FileSystem = Pick<vscode.FileSystem, 'readFile' | 'readDirectory'>;

// The subset of vscode.workspace that is used by the test explorer.
export interface Workspace
	extends Pick<typeof vscode.workspace, 'workspaceFolders' | 'getWorkspaceFolder' | 'textDocuments'> {
	// use custom FS type
	readonly fs: FileSystem;

	// only include one overload
	openTextDocument(uri: vscode.Uri): Thenable<vscode.TextDocument>;
}


/**
 * Gen Move test id
 *
 * @param uri
 * @param kind
 * @param name
 * @returns
 */
export function genMoveTestId(uri: vscode.Uri, kind: MoveTestKind, name?: string): string {
  uri = uri.with({ query: kind });
  if (name) uri = uri.with({ fragment: name });
  return uri.toString();
}

/**
 *  Parses the ID as a URI and extracts the kind and name.
 *  The URI of the relevant file or folder should be retrieved wil
 *  TestItem.uri.
 * @param id
 * @returns
 */
export function parseMoveTestId(id: string): { kind: MoveTestKind; name?: string } {
  const u = vscode.Uri.parse(id);
  const kind = u.query as MoveTestKind;
  const name = u.fragment;
  return { kind, name };
}

// Check whether the process is running as a test.
export function isInTest() {
  return process.env.VSCODE_GO_IN_TEST === '1';
}
