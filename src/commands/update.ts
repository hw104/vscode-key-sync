import * as fs from "fs";
import * as vscode from "vscode";
import { complementAndSaveConfig, getConfiguration } from "../config";
import { getGitApi } from "../git_api";
import { getPaths } from "../paths";
import { Repository } from "../types/git";
import { initLocalRepo } from "./init";

interface InnerOption {
  force: boolean;
}

export async function updateHandler(
  context: vscode.ExtensionContext,
  option: InnerOption = { force: false }
): Promise<void> {
  const config = await complementAndSaveConfig(await getConfiguration());
  console.log("config", config);

  const gitApi = await getGitApi();
  const paths = getPaths(context);

  await initLocalRepo(gitApi, config, paths);

  const repo: Repository | null = await gitApi.openRepository(
    vscode.Uri.parse(paths.repo)
  );
  const state = repo?.state;

  if (!option.force) {
    const changes = [
      ...(state?.indexChanges ?? []),
      ...(state?.mergeChanges ?? []),
      ...(state?.workingTreeChanges ?? []),
    ];
    if (changes.length !== 0) {
      vscode.window.showWarningMessage(
        'Cannot Auto Update: keybindings.json has been changed since the last commit. To Force Update, run "Key Sync: Update (Force)"'
      );
      return;
    }
  }

  await repo?.pull();

  // copy
  fs.copyFileSync(paths.repoKeybindings, paths.srcKeybindngs);

  const remote = state?.remotes.find((r) => r.name === "origin");

  vscode.window.showInformationMessage(
    `keybindings.json was updated from ${remote?.pushUrl}`
  );
}
