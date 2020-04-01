// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { window, Selection } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	//console.log('Congratulations, your extension "surround-with-tag" is now active!');
	
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.surroundWithTag', async () => {
		// The code you place here will be executed every time your command is executed

		

		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			console.log('No text editor open. Aborting.');
			return; // No open text editor
		}

		let tagName = (await window.showInputBox({
			placeHolder: 'Tag Name or Emmet Abbreviation'
		})) as string;

		if (!tagName){
			console.log('No tag name entered. Aborting.');
			return; // No tag name
		}

		// TODO: handle Emmet abbreviation input

		let prefix = '<' + tagName + '>';
		let postfix = '</' + tagName + '>';

		let original_selection = editor.selection;

		// TODO: handle empty selection

		editor
        .edit(builder => {
          let postfixPos = original_selection.end;
          let prefixPos = original_selection.start;
          builder.insert(prefixPos, prefix);
		  builder.insert(postfixPos, postfix);
		  console.log('prefix pos: '+prefixPos);
        })
         .then(function() {
			let offset = tagName.length + 1;
			let newPos = new vscode.Position(
				original_selection.start.line,
				original_selection.start.character + offset
				);
			editor!.selection = new Selection(
				newPos,
				newPos
			);
        });
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
