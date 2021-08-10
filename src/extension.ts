import * as vscode from 'vscode';
import { tmpCommand } from './commands/hello_wrold';
import { uploadHandler } from './commands/upload';
import { ErrorWithAction } from './errors';

export function activate(context: vscode.ExtensionContext) {
	let helloWorld = vscode.commands.registerCommand('key-sync.helloWorld', async () => {
		try {
			await tmpCommand(context);
		} catch (e) {
			vscode.window.showErrorMessage(`${e}`);
		}
	});

	let upload = vscode.commands.registerCommand('key-sync.upload', async () => {
		try {
			await uploadHandler(context);
		} catch (e) {
			if (e instanceof ErrorWithAction) {
				const res = await vscode.window.showErrorMessage(e.message, ...Object.keys(e.actions));
				if (res !== undefined) {
					await e.actions[res]();
				}
			} else {
				vscode.window.showErrorMessage(`${e}`);
			}
		}
	});

	context.subscriptions.push(helloWorld);
	context.subscriptions.push(upload);
}

export function deactivate() { }
