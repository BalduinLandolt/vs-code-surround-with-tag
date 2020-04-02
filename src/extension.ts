import * as vscode from 'vscode';
import { window, Selection } from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.surroundWithTag', async () => {

        // check if editor is open
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.log('No text editor open. Aborting.');
            return; // No open text editor
        }

        // QUESTION: Maybe check what file type it is? should only work in .html and .xml/.xsd/.xslt
        // or do I leave that up to the user to decide?

        // let user enter tag name in input box
        let tagName = (await window.showInputBox({
            placeHolder: 'Tag Name or Emmet Abbreviation'
        })) as string;

        // handle nothing entered
        if (!tagName) {
            console.log('No tag name entered. Aborting.');
            return; // No tag name
        }

        // TODO: handle Emmet abbreviation input

        // opening and closing tag
        let prefix = '<' + tagName + '>';
        let postfix = '</' + tagName + '>';

        let original_selection = editor.selection;

        // TODO: handle empty selection
        // QUESTION: how do I want this? should it abort? or add empty tag instead? or have caret between opening and closing tag?

        editor
            .edit(builder => {
                // get previous positions
                let postfixPos = original_selection.end;
                let prefixPos = original_selection.start;

                // insert tags
                builder.insert(prefixPos, prefix);
                builder.insert(postfixPos, postfix);
            })
            .then(function () {
                // reposition caret
                let offset = tagName.length + 1;
                // new position: in opening tag, after tag name, before the closing bracket (where the attributes go)
                // QUESTION: is this how I want it?
                // Alternatively it could multi-select opening and closing tag, or set caret after closing tag or so
                let newPos = new vscode.Position(
                    original_selection.start.line,
                    original_selection.start.character + offset
                );
                // apply this selection to editor
                editor!.selection = new Selection(
                    newPos,
                    newPos
                );
            });
            // LATER: Handle multi-selections
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
