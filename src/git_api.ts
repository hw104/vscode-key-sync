import * as vscode from 'vscode';
import { GitExtension, API } from './types/git';


export async function getGitApi(): Promise<API> {
    const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;
    const gitApi = gitExtension?.getAPI(1);
    if (gitApi === undefined) {
        throw Error('Git Extension is not found');
    }

    return gitApi;
}
