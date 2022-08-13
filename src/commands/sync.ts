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

  await innerHandler(repo, paths);
  if (await showYesNoMessage(
    "Sync finished. Do you want close repository?"
  )) {
    await closeRepoIfOpen(paths, await getGitApi());
  }
}

async function innerHandler(repo: Repository, paths: Paths): Promise<void> {
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

  if (isChanged) {
    if (await showYesNoMessage("Changes detected. Do you want to commit?")) {
      await vscode.commands.executeCommand("git.commit", paths.localRepo);
      return await innerHandler(repo, paths);
    }
  }

  if (isAhead) {
    const message =
      `Your branch is ahead of ` +
      `'${repo.state.HEAD?.upstream?.remote}/${repo.state.HEAD?.upstream?.name}'` +
      ` by ${repo.state.HEAD?.ahead} commit. Do you want to push?`;
    if (await showYesNoMessage(message)) {
      await repo.push();
      return await innerHandler(repo, paths);
    }
  }

  if (isBehind) {
    const message =
      `Your branch is behind ` +
      `'${repo.state.HEAD?.upstream?.remote}/${repo.state.HEAD?.upstream?.name}'` +
      ` by ${repo.state.HEAD?.behind} commit. Do you want to pull?`;

    if (await showYesNoMessage(message)) {
      await repo.pull();
    }
  }
}
