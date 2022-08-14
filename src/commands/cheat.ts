import * as fs from "fs";
import * as vscode from "vscode";
import { configRepo } from "../config";
import { getPaths } from "../paths";
import { ErrorWithAction } from "../types/errors";

export async function cheatHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  const readmePath = getPaths(context).repoFile(
    (await configRepo().readmePath.get()) ?? "README.md"
  );

  if (!fs.existsSync(readmePath.fsPath)) {
    const repo = configRepo();
    throw new ErrorWithAction(
      "Please initialize local repository or check configuration",
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "Open Configuration": async () =>
          await vscode.commands.executeCommand(
            "workbench.action.openSettings",
            repo.remoteRepo.fullConfigKey
          ),
      }
    );
  }

  await vscode.commands.executeCommand("markdown.showPreview", readmePath);
}
