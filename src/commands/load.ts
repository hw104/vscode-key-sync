import * as fs from "fs";
import * as vscode from "vscode";
import { checkConfig, FullfiledConfig, loadAllConfig } from "../config";
import { getPaths, Paths } from "../paths";
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

  load(paths, config);
}

export function load(paths: Paths, config: FullfiledConfig): void {
  const src = paths.repoKeybindings(config);
  const dist = paths.originalKeybindngs;

  if (!fs.existsSync(src)) {
    throw new Error(`${src} is not exists`);
  }

  fs.copyFileSync(src, dist);
}
