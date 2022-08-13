import * as vscode from "vscode";
import { getGitApi } from "../git_api";
import { getPaths } from "../paths";
import { openHandler } from "./open";
import { saveHandler } from "./save";

export async function syncHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  await saveHandler(context);
  const repo = await openHandler(context);
  const paths = getPaths(context);
  // const git = await getGitApi();

  await repo.fetch();
  await repo.status();
  const isChanged =
    [
      ...repo.state.indexChanges,
      ...repo.state.mergeChanges,
      ...repo.state.workingTreeChanges,
    ].length !== 0;

    repo.state.HEAD.

  if (isChanged) {
    vscode.window.showInformationMessage(
      "Changes detected. Do you want to commit?",
      "Commit",
      "Commit & Push",
      "No"
    );
  }

  // commit
  /* if (changes.length !== 0) {
    const res = await vscode.commands.executeCommand(
      "git.commit",
      paths.localRepo
    );
    console.log("res", res);
  } */
}
