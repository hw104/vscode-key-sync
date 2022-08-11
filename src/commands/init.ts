/* eslint-disable eqeqeq */
import * as fs from "fs";
import * as vscode from "vscode";
import {
  complementAndSaveConfig,
  FullfiledConfig,
  loadAllConfig as loadAllConfig,
} from "../config";
import { getGitApi } from "../git_api";
import { getPaths, Paths } from "../paths";
import { API as GitApi } from "../types/git";

export async function initLocalRepo(
  gitApi: GitApi,
  config: FullfiledConfig,
  paths: Paths
): Promise<void> {
  if (!fs.existsSync(paths.globalStorage)) {
    fs.mkdirSync(paths.globalStorage, { recursive: true });
  }

  if (!fs.existsSync(paths.localRepo)) {
    fs.mkdirSync(paths.localRepo, { recursive: true });
  } else {
    fs.rmSync(paths.localRepo, { recursive: true, force: true });
    fs.rmdir(paths.localRepo, () => null);
  }

  const repo = await gitApi.init(vscode.Uri.parse(paths.localRepo));
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
  const config = await complementAndSaveConfig(await loadAllConfig());
  console.log("config", config);

  const gitApi = await getGitApi();
  const paths = getPaths(context);

  await initLocalRepo(gitApi, config, paths);
}
