import * as vscode from "vscode";
import { complementConfig, getConfiguration } from "../config";
import { getGitApi } from "../git_api";
import { getPaths } from "../paths";
import { initLocalRepo } from "./init";

export async function openHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  const config = await complementConfig(await getConfiguration());
  console.log("config", config);

  const gitApi = await getGitApi();
  const paths = getPaths(context);

  await initLocalRepo(gitApi, config, paths);
}
