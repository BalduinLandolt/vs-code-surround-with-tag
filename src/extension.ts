'use strict';

import * as vscode from 'vscode';
import { window, Selection } from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const commandName = 'extension.surroundWithTag';

    const disposable = vscode.commands.registerCommand(commandName, async () => {

        // check if editor is open
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.log('No text editor open. Aborting.');
            return; // No open text editor
        }

        // QUESTION: Maybe check what file type it is? should only work in .html and .xml/.xsd/.xslt
        // or do I leave that up to the user to decide?

        // let user enter tag name in input box
        const tagName = (await window.showInputBox({
            placeHolder: 'Tag Name or Emmet Abbreviation (Emmet not yet implemented)'
        })) as string;

        // handle nothing entered
        if (!tagName) {
            console.log('No tag name entered. Aborting.');
            return; // No tag name
        }

        // TODO: handle Emmet abbreviation input

        // opening and closing tag
        const prefix = '<' + tagName + '>';
        const postfix = '</' + tagName + '>';

        const original_selection = editor.selection;
        const selectedText = editor.document.getText(editor.selection);
        console.log(original_selection);
        // TODO: handle multi selection


        const replacement = prefix + selectedText + postfix;

        // TODO: handle empty selection
        // QUESTION: how do I want this? should it abort? or add empty tag instead? or have caret between opening and closing tag?

        editor
            .edit(builder => {
                builder.replace(original_selection, replacement);
            })
            .then(function () {
                // reposition caret
                const offset = tagName.length + 1;
                // new position: in opening tag, after tag name, before the closing bracket (where the attributes go)
                // QUESTION: is this how I want it?
                // Alternatively it could multi-select opening and closing tag, or set caret after closing tag or so
                const newPos = new vscode.Position(
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
