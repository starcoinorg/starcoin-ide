# Starcoin IDE

This is the repository for [the Starcoin IDE](https://marketplace.visualstudio.com/items?itemName=starcoinorg.starcoin-ide).

## Configuration

See available configuration options in the extension's settings window.

## Available commands

This extension wraps around Starcoin's `mpm` and provides quick access to the folllowing commands:

- Starcoin: Check - `mpm check-compatibility` - checks and verifies the current project
- Starcoin: Test Unit - `mpm package test` - runs unit tests in the current project
- Starcoin: Test Functional - `mpm spectest` - runs functional tests in the current project
- Starcoin: Build - `mpm package build` - build the current project
- Starcoin: Publish - `mpm release` - publishes the current project

To run any of these commands, use [VSCode's command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette). 

## Syntax highlighting

This extension uses [vscode-move-syntax](https://marketplace.visualstudio.com/items?itemName=damirka.move-syntax) extension as a dependency for syntax highlighting.

## License

MIT
