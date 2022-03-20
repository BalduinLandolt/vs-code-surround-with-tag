'use strict';

import * as vscode from 'vscode';
import { window, Selection } from 'vscode';
import * as vscemmet from '@vscode/emmet-helper';
import { handleEmmet, handleLiteral, Error } from "./lib";
import path = require('path');

export function activate(context: vscode.ExtensionContext) {

    const commandName = 'extension.surroundWithTag';

    // show news if a new release has been published but the user not yet informed
    checkIfShowNews(context);

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

        // get a replacement object for each selection in case of a multi select
        const replacements = editor.selections.map((selection) => {
            const selectedText = editor.document.getText(selection);
            // get replacement string and new cursor position for the current selection
            const [replacement, newSelection] = getReplacement(editor, input, selectedText, selection);
            if (!replacement || !newSelection) {
                return;
            }
            return new Replacement(replacement, selection, newSelection);
        }).filter((r): r is Replacement => !!r);

        // apply the replacements
        editor.edit(builder => {
            replacements.forEach(r => {
                // replace text
                builder.replace(r.previousSelection, r.replacement);
            });
        }).then(() => {
            // place the carrets
            const newSelections = replacements.map(r => r.newSelection);
            editor.selections = newSelections;
        });

        // QUESTION: how do I want empty selection? should it abort? or add empty tag instead? or have caret between opening and closing tag?

    });

    context.subscriptions.push(disposable);
}

function getReplacement(editor: vscode.TextEditor, input: string, selectedText: string, selection: vscode.Selection): [string | undefined, vscode.Selection | undefined] {
    // check if input is emmet or literal
    const re = /^\w+$/;
    if (re.test(input)) {
        const replacement = handleLiteral(input, selectedText);

        const offset = input.length + 1;
        // new position: in opening tag, after tag name, before the closing bracket (where the attributes go)
        // QUESTION: is this how I want it?
        // Alternatively it could multi-select opening and closing tag, or set caret after closing tag or so
        const cursorPosition = new vscode.Position(
            selection.start.line,
            selection.start.character + offset
        );
        const newSelection = new Selection(cursorPosition, cursorPosition);
        return [replacement, newSelection];
    } else {
        if (!vscemmet.isAbbreviationValid('markup', input)) {
            // obviously invalid emmet
            console.log('Invalid emmet abbreviation provided. Aborting.');
            return [undefined, undefined];
        }
        const e = handleEmmet(input, selectedText, selection.start.character);
        if (e instanceof Error) {
            // not so obviously invalid emmet
            console.log('Invalid emmet abbreviation provided. Aborting.');
            return [undefined, undefined];
        }
        const replacement = e;
        const lines = e.split('\n');
        const deltaLines = lines.length - 1;
        const deltaChars = lines[lines.length - 1].length - editor.selection.start.character;
        const cursorPosition = editor.selection.start.translate(deltaLines, deltaChars);
        const newSelection = new Selection(cursorPosition, cursorPosition);
        return [replacement, newSelection];
    }
}

async function checkIfShowNews(context: vscode.ExtensionContext) {
    const lastVersion: string | undefined = context.globalState.get('lastNewsVersion');
    const currentVersion: string = context.extension.packageJSON.version;

    if (lastVersion === undefined || versionIsSmaller(lastVersion, currentVersion)) {
        context.globalState.update('lastNewsVersion', currentVersion);
        showNews(context);
    }
}

function versionIsSmaller(last: string, current: string): boolean {
    const l_versions = last.split('.');
    const c_versions = current.split('.');
    const pairs = l_versions.map((l, i) => {
        return [Number(l), Number(c_versions[i])];
    });
    pairs.forEach((p) => {
        if (p[0] < p[1]) return true;
    });
    return false;
}

function showNews(context: vscode.ExtensionContext) {
    const filepath = path.join(context.extensionPath, 'news.md');
    console.log(filepath);
    vscode.commands.executeCommand('markdown.showPreview', vscode.Uri.file(filepath));
}

class Replacement {
    replacement: string;
    previousSelection: vscode.Selection;
    newSelection: vscode.Selection;
    constructor(replacement: string, previousSelection: vscode.Selection, newSelection: vscode.Selection) {
        this.replacement = replacement;
        this.previousSelection = previousSelection;
        this.newSelection = newSelection;
    }
}
