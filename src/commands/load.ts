import * as fs from "fs";
import * as vscode from "vscode";
import { checkConfig, loadAllConfig } from "../config";
import { getPaths } from "../paths";
import { openHandler } from "./open";

export async function loadHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  await openHandler(context);

  const paths = getPaths(context);
  const config = await loadAllConfig();
  if (!checkConfig(config)) {
    throw new Error("Unreachable");
  }

  const src = paths.repoKeybindings(config);
  const dist = paths.originalKeybindngs;

  if (!fs.existsSync(src)) {
    throw new Error(`${src} is not exists`);
  }

  fs.copyFileSync(src, dist);
}
