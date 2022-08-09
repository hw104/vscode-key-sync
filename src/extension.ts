import * as vscode from "vscode";
import { openHandler } from "./commands/open";
import { ErrorWithAction } from "./types/errors";

export function activate(context: vscode.ExtensionContext) {
  const handler = async (cb: () => Promise<any>) => {
    try {
      await cb();
    } catch (e) {
      if (e instanceof ErrorWithAction) {
        const res = await vscode.window.showErrorMessage(
          e.message,
          ...Object.keys(e.actions)
        );
        if (res !== undefined) {
          await e.actions[res]();
        }
      } else {
        vscode.window.showErrorMessage(`${e}`);
      }
    }
  };

  const save = vscode.commands.registerCommand("key-sync.save", async () =>
    handler(() => openHandler(context))
  );
  const load = vscode.commands.registerCommand("key-sync.load", async () =>
    handler(() => openHandler(context))
  );
  const open = vscode.commands.registerCommand("key-sync.open", async () =>
    handler(() => openHandler(context))
  );

  context.subscriptions.push(save);
  context.subscriptions.push(load);
  context.subscriptions.push(open);
}

export function deactivate() {}
