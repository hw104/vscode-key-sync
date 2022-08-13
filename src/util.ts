import * as vscode from "vscode";

export async function showYesNoMessage(
  message: string
): Promise<boolean> {
  const res = await vscode.window.showInformationMessage(message, "Yes", "No");
  return res === "Yes";
}
