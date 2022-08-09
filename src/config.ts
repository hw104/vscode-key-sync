/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import {
  CONFIG_GIT_BRANCH,
  CONFIG_GIT_SRC_PATH,
  CONFIG_REMOTE_REPO,
  EXTENSION_NAME,
} from "./const";
import { ErrorWithAction } from "./types/errors";

export interface Configuration {
  remoteRepo?: string;
  branch?: string;
  srcPath?: string;
}

export async function getConfiguration(): Promise<Configuration> {
  return {
    remoteRepo:
      vscode.workspace
        .getConfiguration(EXTENSION_NAME)
        .get<string>(CONFIG_REMOTE_REPO) ?? undefined,
    branch:
      vscode.workspace
        .getConfiguration(EXTENSION_NAME)
        .get<string>(CONFIG_GIT_BRANCH) ?? undefined,
    srcPath:
      vscode.workspace
        .getConfiguration(EXTENSION_NAME)
        .get<string>(CONFIG_GIT_SRC_PATH) ?? undefined,
  };
}

/* export function checkConfiguration(
  config: Configuration
): config is Required<Configuration> {
  if (config.remoteRepo === undefined || config.remoteRepo.length === 0) {
    throw new ErrorWithAction(
      "Please specify an existing git remote repository.",
      {
        "Open Configuration": async () =>
          await vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "key-sync.GitRemoteRepository"
          ),
      }
    );
  }

  if (config.branch === undefined || config.branch.length === 0) {
    throw new ErrorWithAction("Please specify an existing git branch", {
      "Open Configuration": async () =>
        await vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "key-sync.GitBranch"
        ),
    });
  }

  return true;
} */

export async function complementConfig(
  config: Configuration
): Promise<Required<Configuration>> {
  let remoteRepo = config.remoteRepo;
  let branch = config.branch;
  let srcPath = config.srcPath;

  if (remoteRepo == null) {
    remoteRepo = await vscode.window.showInputBox({
      title: "Git remote repository",
      placeHolder: "ex: https://github.com/hw104/vscode-keybindings.git",
      validateInput: (value) => {
        if (value.length === 0) {
          return "Please specify an existing git remote repository.";
        }
        return;
      },
    });
  }
  if (remoteRepo == null || remoteRepo.length === 0) {
    throw new ErrorWithAction(
      "Please specify an existing git remote repository.",
      {
        "Open Configuration": async () =>
          await vscode.commands.executeCommand(
            "workbench.action.openSettings",
            `${EXTENSION_NAME}.${CONFIG_REMOTE_REPO}`
          ),
      }
    );
  }

  if (branch == null) {
    branch = await vscode.window.showInputBox({
      title: "Git branch",
      placeHolder: "main",
      validateInput: (value) => {
        if (value.length === 0) {
          return "Please specify an existing git branch";
        }
        return;
      },
    });
  }
  if (branch == null || branch.length === 0) {
    throw new ErrorWithAction("Please specify an existing git branch", {
      "Open Configuration": async () =>
        await vscode.commands.executeCommand(
          "workbench.action.openSettings",
          `${EXTENSION_NAME}.${CONFIG_GIT_BRANCH}`
        ),
    });
  }

  if (srcPath == null) {
    srcPath = await vscode.window.showInputBox({
      title: "src file path",
      placeHolder: "keybindings.json",
      value: "keybindings.json",
      validateInput: (value) => {
        if (value.length === 0) {
          return "Please specify an existing json file path";
        }
        return;
      },
    });
  }
  if (srcPath == null || srcPath.length === 0) {
    throw new ErrorWithAction("Please specify an existing git branch", {
      "Open Configuration": async () =>
        await vscode.commands.executeCommand(
          "workbench.action.openSettings",
          `${EXTENSION_NAME}.${CONFIG_GIT_SRC_PATH}`
        ),
    });
  }

  return {
    branch,
    remoteRepo,
    srcPath,
  };
}
