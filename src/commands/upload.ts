import * as fs from 'fs';
import * as vscode from 'vscode';
import { checkConfiguration, Configuration, getConfiguration } from '../config';
import { EXTENSION_NAME } from '../const';
import { getGitApi } from '../git_api';
import { getPaths, Paths } from '../paths';
import { API as GitApi, ForcePushMode, Repository } from '../types/git';

interface InnerOption {
    force?: boolean;
}

export async function uploadHandler(context: vscode.ExtensionContext, option: InnerOption): Promise<void> {
    const config: Configuration = await getConfiguration();
    if (!checkConfiguration(config)) {
        throw new Error('Unreachable');
    }

    console.log('config', config);

    const gitApi = await getGitApi();
    const paths = getPaths(context);

    await initRepoMaybe(gitApi, config, paths);

    copyKeybindings(paths);

    await commitAndPush(gitApi, paths, option);
}

async function commitAndPush(gitApi: GitApi, paths: Paths, option: InnerOption) {
    const repo: Repository | null = await gitApi.openRepository(vscode.Uri.parse(paths.repo));
    const state = repo?.state;
    const changes = [
        ...state?.indexChanges ?? [],
        ...state?.mergeChanges ?? [],
        ...state?.workingTreeChanges ?? [],
    ];
    if (changes.length !== 0) {
        await repo!.commit(`commit by ${EXTENSION_NAME}`, { all: true });
    }

    if (option.force) {
        await repo!.push(undefined, undefined, undefined, ForcePushMode.Force);
    } else {
        await repo!.push();
    }

    const remote = state?.remotes.find(r => r.name === 'origin');

    vscode.window.showInformationMessage(`keybindings.json is Uploaded to ${remote?.pushUrl}`);
}

async function initRepoMaybe(gitApi: GitApi, config: Required<Configuration>, paths: Paths) {
    if (!fs.existsSync(paths.globalStorage)) {
        fs.mkdirSync(paths.globalStorage);
    }

    if (!fs.existsSync(paths.repo)) {
        fs.mkdirSync(paths.repo);
    }

    /* const readmePath = path.resolve(dirPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
        fs.writeFileSync(
            readmePath,
            `# vscode-keybindings\nManaged by "${NAME}" extension`,
        );
    } */

    let repo: Repository | null = await gitApi.openRepository(vscode.Uri.parse(paths.repo));
    if (repo === null) {
        repo = await gitApi.init(vscode.Uri.parse(paths.repo));
    }

    if (repo === null) {
        throw Error('Initialize git repository failure');
    }

    const state = repo.state;
    console.log('state', state);

    if (state.remotes.length === 0) {
        await repo.addRemote('origin', config.remoteRepo);
    }

    await repo.fetch();

    if (state.HEAD?.name !== config.branch) {
        await repo.checkout(config.branch);
    }
}

function copyKeybindings(paths: Paths) {
    if (!fs.existsSync(paths.srcKeybindngs)) {
        throw new Error('keybindings.json is not exists');
    }

    fs.copyFileSync(paths.srcKeybindngs, paths.repoKeybindings);
}
