import * as vscode from "vscode";
import { getGitApi } from "../git_api";
import { getPaths } from "../paths";
import { initHandler } from "./init";

export async function openHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  const gitApi = await getGitApi();
  const paths = getPaths(context);

  const repo = await gitApi.openRepository(vscode.Uri.parse(paths.repo));
  if (repo != null) {
    return;
  }
  const res = await vscode.window.showInformationMessage(
    "Cannot open repository that was not initialized.",
    "Initialize",
    "Close"
  );
  if (res !== "Initialize") {
    return;
  }
  await initHandler(context);
}
