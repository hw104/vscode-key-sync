import * as fs from 'fs';
import * as vscode from 'vscode';
import { Configuration } from '../config';
import { Paths } from '../paths';
import { API as GitApi, Repository } from '../types/git';

export async function initRepoMaybe(gitApi: GitApi, config: Required<Configuration>, paths: Paths) {
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
