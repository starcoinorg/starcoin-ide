import * as vscode from 'vscode';

import { CommandFactory } from '.';

export const openDeployPage: CommandFactory = () => {
  return async (): Promise<void> => {
    vscode.env.openExternal(vscode.Uri.parse('https://movetool.app/constract/deploy'));
  };
};
