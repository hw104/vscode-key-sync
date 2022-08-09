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
  remoteRepo: string | undefined;
  branch: string | undefined;
  srcPath: string | undefined;
}
type Fullfiled<T> = { [K in keyof T]: NonNullable<T[K]> };
export type FullfiledConfig = Fullfiled<Configuration>;

type IRepo<T, K extends keyof T> = {
  get: () => Promise<T[K]>;
  set: (value: T[K]) => Promise<void>;
};
type Repo<T> = { [K in keyof T]: IRepo<T, K> };

const configKey: Record<keyof Configuration, string> = {
  branch: CONFIG_GIT_BRANCH,
  remoteRepo: CONFIG_REMOTE_REPO,
  srcPath: CONFIG_GIT_SRC_PATH,
};

export function isEqualConfig(a: Configuration, b: Configuration): boolean {
  return (
    a.branch === b.branch &&
    a.remoteRepo === b.remoteRepo &&
    a.srcPath === b.srcPath
  );
}

export function configRepo(): Repo<Configuration> {
  const c = vscode.workspace.getConfiguration(EXTENSION_NAME);
  const key: (keyof Configuration)[] = ["branch", "remoteRepo", "srcPath"];
  return key.reduce<Repo<Configuration>>(
    (prev, current) => ({
      ...prev,
      [current]: {
        get: () => c.get(configKey[current]) ?? undefined,
        set: async (value: unknown) =>
          await c.update(configKey[current], value),
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any
  );
}

export async function getConfiguration(): Promise<Configuration> {
  const repo = configRepo();
  return {
    remoteRepo: await repo.remoteRepo.get(),
    branch: await repo.branch.get(),
    srcPath: await repo.srcPath.get(),
  };
}

export function checkConfiguration(
  config: Configuration
): config is FullfiledConfig {
  return !!config.branch && !!config.remoteRepo && !!config.srcPath;
}

export async function complementAndSaveConfig(
  config: Configuration
): Promise<FullfiledConfig> {
  let remoteRepo = config.remoteRepo;
  let branch = config.branch;
  let srcPath = config.srcPath;

  if (!remoteRepo) {
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
  if (!remoteRepo) {
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

  if (!branch) {
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
  if (!branch) {
    throw new ErrorWithAction("Please specify an existing git branch", {
      "Open Configuration": async () =>
        await vscode.commands.executeCommand(
          "workbench.action.openSettings",
          `${EXTENSION_NAME}.${CONFIG_GIT_BRANCH}`
        ),
    });
  }

  if (!srcPath) {
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
  if (!srcPath) {
    throw new ErrorWithAction(
      "Please specify an existing json file path  aaa",
      {
        "Open Configuration": async () =>
          await vscode.commands.executeCommand(
            "workbench.action.openSettings",
            `${EXTENSION_NAME}.${CONFIG_GIT_SRC_PATH}`
          ),
      }
    );
  }

  const res = {
    branch,
    remoteRepo,
    srcPath,
  };

  if (!isEqualConfig(res, config)) {
    const res = await vscode.window.showInformationMessage(
      "Do you want save configuration change?",
      "Save",
      "Close"
    );
    if (res === "Save") {
      const repo = configRepo();
      await Promise.all([
        repo.branch.set(branch),
        repo.remoteRepo.set(remoteRepo),
        repo.srcPath.set(srcPath),
      ]);
      await vscode.window.showInformationMessage("Save configuration!");
    }
  }

  return res;
}
