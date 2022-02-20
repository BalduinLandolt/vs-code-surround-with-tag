'use strict';

import * as vscode from 'vscode';
import { window, Selection } from 'vscode';
import * as emmet from 'emmet';
import * as vscemmet from '@vscode/emmet-helper';
import { AbbreviationNode, Abbreviation } from '@emmetio/abbreviation';
import * as os from 'os';

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
        if (re.test(input)) {
            replacement = handleLiteral(input, editor);

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
            const e = handleEmmet(input, editor);
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

function handleLiteral(input: string, editor: vscode.TextEditor): string {
    // opening and closing tag
    const prefix = '<' + input + '>';
    const postfix = '</' + input + '>';

    const selectedText = editor.document.getText(editor.selection);
    // TODO: handle multi selection

    return prefix + selectedText + postfix;
}

function handleEmmet(input: string, editor: vscode.TextEditor): string | Error {
    console.log("handling emmet");
    console.log('input: ', input);
    try {
        // parse emmet
        const config = emmet.resolveConfig(undefined);
        // TODO: only remove snippets, if not HTML!
        // TODO: get indentation right
        config.snippets = {};
        const em = emmet.parseMarkup(input, config);

        // insert text to all leaf nodes
        const selectedText = editor.document.getText(editor.selection);
        em.children.forEach((c) => { traverseEmmet(c, selectedText); });
        const emString = emmet.stringifyMarkup(em, config);
        console.log(emString);
        return emString;
    } catch (error: any) {
        console.log(`Error parsing emmet abbreviation "${input}": ${error}`);
        return new Error(error);
    }
    // TODO: handle multi selection
}

function traverseEmmet(node: AbbreviationNode, value: string): void {
    if (node.children && node.children.length >= 1) {
        node.children.forEach((c) => { traverseEmmet(c, value); });
    } else {
        node.value = [value];
    }
}

class Error {
    e: any;

    constructor(e: any) {
        this.e = e;
    }
}
