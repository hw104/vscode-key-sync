import * as vscode from "vscode";
import { Uri } from "vscode";
import { FullfiledConfig } from "./config";

export interface Paths {
  globalStorage: Uri;
  originalKeybindngs: Uri;
  localRepo: Uri;
  repoKeybindings: (config: FullfiledConfig) => Uri;
  repoFile: (repoRelativePath: string) => Uri;
}

export function getPaths(context: vscode.ExtensionContext): Paths {
  const localRepoUri = vscode.Uri.joinPath(
    context.globalStorageUri,
    "key-sync-git"
  );
  const originalUri = Uri.joinPath(
    context.globalStorageUri,
    "../../../User/keybindings.json"
  );
  const repoFile = (path: string) => Uri.joinPath(localRepoUri, path);

  return {
    globalStorage: context.globalStorageUri,
    originalKeybindngs: originalUri,
    localRepo: localRepoUri,
    repoKeybindings: (config) => repoFile(config.srcPath),
    repoFile: repoFile,
  };
}
