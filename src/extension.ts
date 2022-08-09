import * as vscode from "vscode";
import { initHandler } from "./commands/init";
import { openHandler } from "./commands/open";
import { ErrorWithAction } from "./types/errors";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function activate(context: vscode.ExtensionContext) {
  const handler = async (cb: () => Promise<unknown>) => {
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
        if (context.extensionMode === vscode.ExtensionMode.Development) {
          throw e;
        }
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
  const init = vscode.commands.registerCommand("key-sync.init", async () =>
    handler(() => initHandler(context))
  );

  context.subscriptions.push(save);
  context.subscriptions.push(load);
  context.subscriptions.push(open);
  context.subscriptions.push(init);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/explicit-module-boundary-types
export function deactivate() {}
