import * as path from 'path';
import * as vscode from 'vscode';

export interface Paths {
    repo: string;
    globalStorage: string;
    code: string;
    user: string;
    srcKeybindngs: string;
    repoKeybindings: string;
}

export function getPaths(context: vscode.ExtensionContext): Paths {
    const globalStorage = context.globalStorageUri.path;
    const codePath = path.resolve(globalStorage, '../../..');
    const userPath = path.resolve(codePath, 'User');
    const srcPath = path.resolve(userPath, 'keybindings.json');

    const repoPath = path.resolve(globalStorage, 'git');
    const repoKeybindingsPath = path.resolve(repoPath, 'keybindings.json');

    return {
        globalStorage: globalStorage,
        repo: repoPath,
        code: codePath,
        srcKeybindngs: srcPath,
        repoKeybindings: repoKeybindingsPath,
        user: userPath,
    };
}