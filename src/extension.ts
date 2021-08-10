import * as vscode from 'vscode';
import { updateHandler } from './commands/update';
import { uploadHandler } from './commands/upload';
import { ErrorWithAction } from './types/errors';

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

	const upload = vscode.commands.registerCommand('key-sync.upload', async () => handler(() => uploadHandler(context)));
	const uploadForce = vscode.commands.registerCommand('key-sync.uploadForce', async () => handler(() => uploadHandler(context, {force: true})));

	const update = vscode.commands.registerCommand('key-sync.update', async () => handler(() => updateHandler(context)));
	const updateForce = vscode.commands.registerCommand('key-sync.updateForce', async () => handler(() => updateHandler(context, {force: true})));

	context.subscriptions.push(upload);
	context.subscriptions.push(uploadForce);
	context.subscriptions.push(update);
	context.subscriptions.push(updateForce);
}

export function deactivate() { }
