import * as vscode from "vscode";
import { getGitApi } from "../git_api";
import { getPaths, Paths } from "../paths";
import { API as Git } from "../types/git";

export async function closeHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  const path = getPaths(context);
  const gitApi = await getGitApi();
  const uris = gitApi.repositories.filter(
    (repo) => repo.rootUri.path === path.localRepo
  );
}

export async function closeRepoIfOpen(paths: Paths, git: Git): Promise<boolean> {
  const repo = git.repositories.find(
    (repo) => repo.rootUri.path === paths.localRepo
  );
  if (repo == null) {
    return false;
  }
  await vscode.commands.executeCommand("git.close", paths.localRepo);
  return true;
}
