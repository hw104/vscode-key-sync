import * as vscode from 'vscode';
import { tmpCommand } from './commands/hello_wrold';
import { uploadHandler } from './commands/upload';
import { ErrorWithAction } from './errors';

export function activate(context: vscode.ExtensionContext) {
	const handler = async (cb: () => Promise<any>) => {
		try {
			await cb();
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
	};

	let upload = vscode.commands.registerCommand('key-sync.upload', async () => handler(() => uploadHandler(context, {})));
	let uploadForce = vscode.commands.registerCommand('key-sync.uploadForce', async () => handler(() => uploadHandler(context, {force: true})));

	context.subscriptions.push(upload);
	context.subscriptions.push(uploadForce);
}

export function deactivate() { }
