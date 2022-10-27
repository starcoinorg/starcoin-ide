# Starcoin IDE

![这是图片](/img/show_case.jpg "Magic Gardens")

This is the repository for the [Starcoin IDE](https://marketplace.visualstudio.com/items?itemName=starcoinorg.starcoin-ide) vscode plugin.

## Available commands

This extension wraps around Starcoin's `mpm` and provides quick access to the folllowing commands:

- Starcoin: Build - `mpm package build` - runs build in the current project
- Starcoin: Unit Test - `mpm package test` - runs unit tests in the current project
- Starcoin: Integration Test - `mpm integration-test` - runs integration tests in the current project
- Starcoin: Check Compatibility - `mpm check-compatibility` - Check compatibility of the current project's modules comparing with remote chain state
- Starcoin: Release - `mpm release` - release the package to `release/` directories
- Starcoin: Open deploy page - Open [the page](https://movetool.app/constract/deploy) to deploy the release blob

To run any of these commands, use [VSCode's command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette),
or right-click the Move.toml and select the command Run from the context menu that appears,
or right-click the Move file in the source folder to run unit tests, 
or right-click the Move file in the integration tests folder to run integration tests or update integration test baseline.

## Support custom build options

Users can create a .starcoin-ide/config file in the Move project root directory to customize the options of the mpm subcommand

```toml
[mpm.package.build]
OPTIONS=["--doc", "--abi", "--force"]

[mpm.integration-test]
OPTIONS=["--current-as-stdlib"]
```

## Syntax highlighting

This extension uses [vscode-move-syntax](https://marketplace.visualstudio.com/items?itemName=damirka.move-syntax) extension as a dependency for syntax highlighting.

## Move Analyzer

This extension uses [move-analyzer](https://github.com/move-language/move/tree/main/language/move-analyzer) crate as Move Language Server.

The following LSP are now supported:
- Completion
- Hover
- GotoDefinition
- GotoTypeDefinition
- References
- DocumentSymbol

## Feedback Issue

You can give feedback [here](https://github.com/starcoinorg/starcoin-ide/issues).

## Contributing

We welcome your contributions and thank you for working to improve the Starcoin contract
development experience in VS Code. If you would like to help work on the Starcoin IDE,
please see our [contribution guide](docs/contributing.md). It
explains how to build and run the extension locally, and describes the architecture of the
of starcoin IDE.

## License

[MIT](LICENSE)
