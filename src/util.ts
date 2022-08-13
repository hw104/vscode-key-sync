import * as vscode from "vscode";

export async function showYesNoMessage(message: string): Promise<boolean | undefined> {
  const res = await vscode.window.showInformationMessage(message, "Yes", "No");
  return res != null ? res === "Yes" : undefined;
}
