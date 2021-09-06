# Starcoin IDE

This is the repository for the Starcoin IDE.

## Configuration

See available configuration options in the extension's settings window.

## Available commands

This extension wraps around Starcoin's `move-cli` and provides quick access to the folllowing commands:

- Starcoin: Run - `move run` - runs the opened file
- Starcoin: Publish - `move publish` - publishes the opened file
- Starcoin: Publish Aall - `move publish` - publishes all files in the `src/` directory
- Starcoin: Test Unit - `move unit-test` - runs unit tests in the current file
- Starcoin: Test Functional - `move test-functional` - runs functional tests in the current file
- Starcoin: Check - `move check` - checks and verifies the opened file
- Starcoin: Clean - `move clean` - cleans project's default `storage/` and `build/` directories
- Starcoin: Doctor - `move doctor` - doctors project's default `storage/` and `build/` directories
- Starcoin: View - `move view` - views the contents of the `.mv` file (needs to be opened as a text)

To run any of these commands, use [VSCode's command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette). 

## Syntax highlighting

This extension uses [vscode-move-syntax](https://marketplace.visualstudio.com/items?itemName=damirka.move-syntax) extension as a dependency for syntax highlighting.

## License

MIT
