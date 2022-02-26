'use strict';

import * as vscode from 'vscode';
import { window, Selection } from 'vscode';
import * as vscemmet from '@vscode/emmet-helper';
import { handleEmmet, handleLiteral, Error } from "./lib";

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
        const input = (await window.showInputBox({
            placeHolder: 'Tag Name or Emmet Abbreviation'
        })) as string;

        // handle nothing entered
        if (!input) {
            console.log('No tag name entered. Aborting.');
            return; // No tag name
        }

        let replacement: string;
        let cursorPosition: vscode.Position;

        // check if input is emmet or literal
        const re = /^\w+$/;
        const selectedText = editor.document.getText(editor.selection);
        if (re.test(input)) {

            replacement = handleLiteral(input, selectedText);

            const offset = input.length + 1;
            // new position: in opening tag, after tag name, before the closing bracket (where the attributes go)
            // QUESTION: is this how I want it?
            // Alternatively it could multi-select opening and closing tag, or set caret after closing tag or so
            cursorPosition = new vscode.Position(
                editor.selection.start.line,
                editor.selection.start.character + offset
            );
        } else {
            if (!vscemmet.isAbbreviationValid('markup', input)) {
                // obviousely invalid emmet
                console.log('Invalid emmet abbreviation provided. Aborting.');
                return;
            }
            const e = handleEmmet(input, selectedText, editor.selection.start.character);
            if (e instanceof Error) {
                // not so obviousely invalid emmet
                console.log('Invalid emmet abbreviation provided. Aborting.');
                return;
            }
            replacement = e;
            const lines = e.split('\n');
            const deltaLines = lines.length - 1;
            const deltaChars = lines[lines.length - 1].length;
            cursorPosition = editor.selection.start.translate(deltaLines, deltaChars);
        }

        // QUESTION: how do I want empty selection? should it abort? or add empty tag instead? or have caret between opening and closing tag?

        editor
            .edit(builder => {
                // replace text
                builder.replace(editor.selection, replacement);
            })
            .then(function () {
                // reposition caret
                editor!.selection = new Selection(
                    cursorPosition,
                    cursorPosition
                );
            });
        // LATER: Handle multi-selections
    });

    context.subscriptions.push(disposable);
}
