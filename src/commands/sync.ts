import * as vscode from "vscode";
import { getGitApi } from "../git_api";
import { getPaths, Paths } from "../paths";
import { Repository } from "../types/git";
import { showYesNoMessage } from "../util";
import { closeRepoIfOpen } from "./close";
import { openHandler } from "./open";
import { saveHandler } from "./save";

export async function syncHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  await saveHandler(context);
  const repo = await openHandler(context);
  const paths = getPaths(context);

  const actions = await sync(repo, paths);

  let toClose: boolean;
  if (actions == null) {
    vscode.window.showInformationMessage("There was nothing to do.");
    toClose = true;
  } else {
    toClose = await showYesNoMessage(
      "Sync finished. Do you want to close repository?"
    );
  }
  if (toClose) {
    await closeRepoIfOpen(paths, await getGitApi());
  }
}

async function sync(
  repo: Repository,
  paths: Paths
): Promise<("commit" | "push" | "pull")[] | undefined> {
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

  if (!isChanged && !isAhead && !isBehind) {
    return;
  }

  if (isChanged) {
    if (await showYesNoMessage("Changes detected. Do you want to commit?")) {
      await vscode.commands.executeCommand("git.commit", paths.localRepo);
      return ["commit", ...((await sync(repo, paths)) ?? [])];
    }
  }

  if (isAhead) {
    const message =
      `Your branch is ahead of ` +
      `'${repo.state.HEAD?.upstream?.remote}/${repo.state.HEAD?.upstream?.name}'` +
      ` by ${repo.state.HEAD?.ahead} commit. Do you want to push?`;
    if (await showYesNoMessage(message)) {
      await repo.push();
      return ["push", ...((await sync(repo, paths)) ?? [])];
    }
  }

  if (isBehind) {
    const message =
      `Your branch is behind ` +
      `'${repo.state.HEAD?.upstream?.remote}/${repo.state.HEAD?.upstream?.name}'` +
      ` by ${repo.state.HEAD?.behind} commit. Do you want to pull?`;

    if (await showYesNoMessage(message)) {
      await repo.pull();
      return ["pull"];
    }
  }

  return [];
}
