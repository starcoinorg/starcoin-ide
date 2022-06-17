# Starcoin IDE

This is the repository for [the Starcoin IDE](https://marketplace.visualstudio.com/items?itemName=starcoinorg.starcoin-ide).


## Available commands

This extension wraps around Starcoin's `mpm` and provides quick access to the folllowing commands:

- Starcoin: Build - `mpm package build` - runs build in the current project
- Starcoin: Unit Test - `mpm package test` - runs unit tests in the current project
- Starcoin: Integration Test - `mpm integration-test` - runs integration tests in the current project
- Starcoin: Publish - `mpm sandbox publish` -  Publish the resulting bytecodes on the `storage/` directories
- Starcoin: Doctor - `mpm sandbox doctor` - Run well-formedness checks on the `storage/` directories
- Starcoin: Check Compatibility - `mpm check-compatibility` - Check compatibility of the current project's modules comparing with remote chain state
- Starcoin: Release - `mpm release` - release the package to `release/` directories
- Starcoin: Clean - cleans project's default `storage/`,`build/` and `release/` directories

To run any of these commands, use [VSCode's command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette),
or right-click the Move.toml and select the command Run from the context menu that appears,
or right-click the Move file in the source folder to run unit tests, 
or right-click the Move file in the integration tests folder to run integration tests.

## Syntax highlighting

This extension uses [vscode-move-syntax](https://marketplace.visualstudio.com/items?itemName=damirka.move-syntax) extension as a dependency for syntax highlighting.

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
