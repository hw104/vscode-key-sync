import * as vscode from "vscode";
import { closeHandler } from "./commands/close";
import { initHandler } from "./commands/init";
import { loadHandler } from "./commands/load";
import { openHandler } from "./commands/open";
import { saveHandler } from "./commands/save";
import { syncHandler } from "./commands/sync";
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
    handler(() => saveHandler(context))
  );
  const load = vscode.commands.registerCommand("key-sync.load", async () =>
    handler(() => loadHandler(context))
  );
  const open = vscode.commands.registerCommand("key-sync.open", async () =>
    handler(() => openHandler(context))
  );
  const init = vscode.commands.registerCommand("key-sync.init", async () =>
    handler(() => initHandler(context))
  );
  const sync = vscode.commands.registerCommand("key-sync.sync", async () =>
    handler(() => syncHandler(context))
  );
  const close = vscode.commands.registerCommand("key-sync.close", async () =>
    handler(() => closeHandler(context))
  );

  context.subscriptions.push(save);
  context.subscriptions.push(load);
  context.subscriptions.push(open);
  context.subscriptions.push(init);
  context.subscriptions.push(sync);
  context.subscriptions.push(close);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/explicit-module-boundary-types
export function deactivate() {}
