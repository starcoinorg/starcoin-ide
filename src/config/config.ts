import * as toml from '@iarna/toml'
import * as fs from 'fs'
import { Logger } from '../log';

export class Config {
  config: any
  log: Logger

  constructor(log: Logger, workspaceFolder: string) {
    this.log = log;

    const configPath = `${workspaceFolder}/.starcoin-ide/config`;
    this.log.info(`Loading config from ${configPath}`);

    if (fs.existsSync(configPath)) {
      this.config = toml.parse(fs.readFileSync(configPath, 'utf-8'))
    } else {
      this.config = {}
    }
  }

  getCommandOptions(command: string): any {
    const tokens = command.split(' ');

    let opts = this.config;
    for (const token of tokens) {
      if (token in opts) {
        opts = opts[token];
      }
    }

    return opts;
  }
}