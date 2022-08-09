import * as fs from "fs";
import * as vscode from "vscode";
import { Configuration } from "../config";
import { Paths } from "../paths";
import { API as GitApi, Repository } from "../types/git";

export async function initLocalRepo(
  gitApi: GitApi,
  config: Required<Configuration>,
  paths: Paths
) {
  if (!fs.existsSync(paths.globalStorage)) {
    fs.mkdirSync(paths.globalStorage);
  }

  if (!fs.existsSync(paths.repo)) {
    fs.mkdirSync(paths.repo);
  }

  let repo: Repository | null = await gitApi.openRepository(
    vscode.Uri.parse(paths.repo)
  );
  if (repo === null) {
    repo = await gitApi.init(vscode.Uri.parse(paths.repo));
  }

  if (repo === null) {
    throw Error("Initialize git repository failure");
  }

  await repo.status();

  if (repo.state.remotes.length === 0) {
    await repo.addRemote("origin", config.remoteRepo);
    await repo.status();
  }

  await repo.fetch();

  if (repo.state.HEAD?.name !== config.branch) {
    await repo.checkout(config.branch);
  }
}
