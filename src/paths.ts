import * as path from "path";
import * as vscode from "vscode";
import { FullfiledConfig } from "./config";

export interface Paths {
  localRepo: string;
  globalStorage: string;
  vscode: string;
  user: string;
  originalKeybindngs: string;
  repoKeybindings: (config: FullfiledConfig) => string;
}

export function getPaths(context: vscode.ExtensionContext): Paths {
  const globalStorage = context.globalStorageUri.path;
  const localRepo = path.resolve(globalStorage, "key-sync-git");

  const codePath = path.resolve(globalStorage, "../../..");
  const userPath = path.resolve(codePath, "User");
  const originalKeybindngs = path.resolve(userPath, "keybindings.json");


  return {
    globalStorage,
    localRepo,
    vscode: codePath,
    originalKeybindngs,
    repoKeybindings: (config) => path.resolve(localRepo, config.srcPath),
    user: userPath,
  };
}
