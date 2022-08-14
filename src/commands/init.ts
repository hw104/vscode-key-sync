import * as fs from "fs";
import * as vscode from "vscode";
import {
  complementAndSaveConfig,
  FullfiledConfig,
  loadAllConfig as loadAllConfig,
} from "../config";
import { getGitApi } from "../git_api";
import { getPaths, Paths } from "../paths";
import { API as GitApi, Repository } from "../types/git";

export async function initLocalRepo(
  gitApi: GitApi,
  config: FullfiledConfig,
  paths: Paths
): Promise<Repository> {
  if (fs.existsSync(paths.localRepo.fsPath)) {
    fs.rmSync(paths.localRepo.fsPath, { recursive: true, force: true });
    fs.rmdirSync(paths.localRepo.fsPath);
  }

  fs.mkdirSync(paths.localRepo.fsPath, { recursive: true });

  const repo = await gitApi.init(paths.localRepo);
  if (repo == null) {
    throw Error("Initialize git repository failure");
  }
  await repo.addRemote("origin", config.remoteRepo);
  await repo.fetch();
  await repo.checkout(config.branch);
  await repo.pull();

  return repo;
}

export async function initHandler(
  context: vscode.ExtensionContext
): Promise<Repository> {
  const config = await complementAndSaveConfig(await loadAllConfig());
  console.log("config", config);

  return await initLocalRepo(await getGitApi(), config, getPaths(context));
}
