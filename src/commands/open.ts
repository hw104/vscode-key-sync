import * as vscode from "vscode";
import { getGitApi } from "../git_api";
import { getPaths } from "../paths";
import { Repository } from "../types/git";
import { initHandler } from "./init";

export async function openHandler(
  context: vscode.ExtensionContext
): Promise<Repository> {
  const gitApi = await getGitApi();
  const paths = getPaths(context);

  const repo = await gitApi.openRepository(vscode.Uri.parse(paths.localRepo));
  if (repo != null) {
    return repo;
  }
  const res = await vscode.window.showInformationMessage(
    "Cannot open repository that was not initialized.",
    "Initialize",
    "Close"
  );
  if (res !== "Initialize") {
    throw new Error("Failed to open repository");
  }
  return await initHandler(context);
}
