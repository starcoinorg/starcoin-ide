# Starcoin IDE

This is the repository for [the Starcoin IDE](https://marketplace.visualstudio.com/items?itemName=starcoinorg.starcoin-ide).

## Configuration

See available configuration options in the extension's settings window.

## Available commands

This extension wraps around Starcoin's `mpm` in macos and ubuntu and provides quick access to the folllowing commands:

- Starcoin: Check - `mpm check-compatibility` - checks and verifies the current project
- Starcoin: Test Unit - `mpm package test` - runs unit tests in the current project
- Starcoin: Test Functional - `mpm spectest` - runs functional tests in the current project
- Starcoin: Publish - `mpm sandbox publish` - publishes the current project to sandbox
- Starcoin: Run - `mpm sandbox run` - runs the opened file in sandbox
- Starcoin: Doctor - `mpm sandbox doctor` - doctors the current project in sandbox
- Starcoin: Clean - `mpm sandbox clean` - cleans project's default `storage/` and `build/` directories

And this extension wraps around Starcoin's `move-cli` in windows and provides quick access to the folllowing commands:

- Starcoin: Check - `move check` - checks and verifies the opened file
- Starcoin: Test Unit - `move unit-test` - runs unit tests in the current file
- Starcoin: Test Functional - `move test-functional` - runs functional tests in the current file
- Starcoin: Publish - `move publish` - publishes the opened file
- Starcoin: Run - `move run` - runs the opened file
- Starcoin: Doctor - `move doctor` - doctors project's default `storage/` and `build/` directories
- Starcoin: Clean - `move clean` - cleans project's default `storage/` and `build/` directories


To run any of these commands, use [VSCode's command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette). 

## Syntax highlighting

This extension uses [vscode-move-syntax](https://marketplace.visualstudio.com/items?itemName=damirka.move-syntax) extension as a dependency for syntax highlighting.

## License

MIT
