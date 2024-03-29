import * as vscode from "vscode";
import { getGitApi } from "../git_api";
import { getPaths, Paths } from "../paths";
import { API as Git } from "../types/git";

export async function closeHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  const path = getPaths(context);
  const gitApi = await getGitApi();
  await closeRepoIfOpen(path, gitApi);
}

export async function closeRepoIfOpen(paths: Paths, git: Git): Promise<boolean> {
  const repo = git.repositories.find(
    (repo) => repo.rootUri.fsPath === paths.localRepo.fsPath
  );
  if (repo == null) {
    return false;
  }
  await vscode.commands.executeCommand("git.close", paths.localRepo);
  return true;
}
