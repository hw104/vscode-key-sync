/* eslint-disable eqeqeq */
import * as fs from "fs";
import * as vscode from "vscode";
import { complementAndSaveConfig, FullfiledConfig, getConfiguration as loadConfig } from "../config";
import { getGitApi } from "../git_api";
import { getPaths, Paths } from "../paths";
import { API as GitApi } from "../types/git";

export async function initLocalRepo(
  gitApi: GitApi,
  config: FullfiledConfig,
  paths: Paths
): Promise<void> {
  if (!fs.existsSync(paths.globalStorage)) {
    fs.mkdirSync(paths.globalStorage);
  }

  if (!fs.existsSync(paths.repo)) {
    fs.mkdirSync(paths.repo);
  } else {
    fs.rmSync(paths.repo, { recursive: true, force: true });
    fs.rmdir(paths.repo, () => null);
  }

  const repo = await gitApi.init(vscode.Uri.parse(paths.repo));
  if (repo == null) {
    throw Error("Initialize git repository failure");
  }
  await repo.addRemote("origin", config.remoteRepo);
  await repo.fetch();
  await repo.checkout(config.branch);
}

export async function initHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  const config = await complementAndSaveConfig(await loadConfig());
  console.log("config", config);

  const gitApi = await getGitApi();
  const paths = getPaths(context);

  await initLocalRepo(gitApi, config, paths);
}
