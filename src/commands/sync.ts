import * as fs from "fs";
import * as vscode from "vscode";
import { checkConfig, FullfiledConfig, loadAllConfig } from "../config";
import { getGitApi } from "../git_api";
import { getPaths, Paths } from "../paths";
import { Repository } from "../types/git";
import { showYesNoMessage } from "../util";
import { closeRepoIfOpen } from "./close";
import { load } from "./load";
import { openHandler } from "./open";
import { save } from "./save";

export async function syncHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  const repo = await openHandler(context);
  const paths = getPaths(context);
  const config = await loadAllConfig();
  if (!checkConfig(config)) {
    throw new Error("Unreachable");
  }

  const actions = await sync(repo, paths, config);
  if (actions == null) {
    vscode.window.showInformationMessage("There was nothing to do.");
    await closeRepoIfOpen(paths, await getGitApi());
    return;
  }

  const res = await showYesNoMessage("Sync finished. Do you want to close repository?");
  if (res) {
    await closeRepoIfOpen(paths, await getGitApi());
  }
}

// TODO: cheat

async function sync(
  repo: Repository,
  paths: Paths,
  config: FullfiledConfig
): Promise<("commit" | "push" | "pull" | "save" | "load")[] | undefined> {
  await repo.fetch();
  await repo.status();
  const isChanged =
    [
      ...repo.state.indexChanges,
      ...repo.state.mergeChanges,
      ...repo.state.workingTreeChanges,
    ].length !== 0;
  const isAhead = (repo.state.HEAD?.ahead ?? 0) > 0;
  const isBehind = (repo.state.HEAD?.behind ?? 0) > 0;
  const isDifference =
    fs.readFileSync(paths.repoKeybindings(config).fsPath).toString() !==
    fs.readFileSync(paths.originalKeybindngs.fsPath).toString();

  if (!isChanged && !isAhead && !isBehind && !isDifference) {
    return;
  }

  if (isDifference) {
    const res = await vscode.window.showInformationMessage(
      "Your keyboard shortcuts is different from keybindings.json in the local repository. " +
        "What do you want to do?",
      "Save",
      "Load",
      "Nothing"
    );
    if (res == null) {
      return [];
    }
    if (res === "Save") {
      save(paths, config);
      return ["save", ...((await sync(repo, paths, config)) ?? [])];
    }
    if (res === "Load") {
      load(paths, config);
      return ["load", ...((await sync(repo, paths, config)) ?? [])];
    }
  }

  if (isChanged) {
    const res = await showYesNoMessage(
      "Changes detected. Do you want to commit?"
    );
    if (res == null) {
      return [];
    }
    if (res) {
      await vscode.commands.executeCommand("git.commit", paths.localRepo);
      return ["commit", ...((await sync(repo, paths, config)) ?? [])];
    }
  }

  if (isAhead) {
    const message =
      `Your branch is ahead of ` +
      `'${repo.state.HEAD?.upstream?.remote}/${repo.state.HEAD?.upstream?.name}'` +
      ` by ${repo.state.HEAD?.ahead} commit. Do you want to push?`;
    const res = await showYesNoMessage(message);
    if (res == null) {
      return [];
    }
    if (res) {
      await repo.push();
      return ["push", ...((await sync(repo, paths, config)) ?? [])];
    }
  }

  if (isBehind) {
    const message =
      `Your branch is behind ` +
      `'${repo.state.HEAD?.upstream?.remote}/${repo.state.HEAD?.upstream?.name}'` +
      ` by ${repo.state.HEAD?.behind} commit. Do you want to pull?`;
    const res = await showYesNoMessage(message);
    if (res == null) {
      return [];
    }
    if (res) {
      await repo.pull();
      return ["pull", ...((await sync(repo, paths, config)) ?? [])];
    }
  }

  return [];
}
