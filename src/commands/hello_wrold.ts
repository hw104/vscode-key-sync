import * as vscode from 'vscode';

export async function tmpCommand(context: vscode.ExtensionContext): Promise<void> {
    console.log('hello world called', context.globalStorageUri);

    vscode.window.showInformationMessage(`Hello World!`);
}