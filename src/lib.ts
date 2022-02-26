import * as emmet from 'emmet';
import { AbbreviationNode, Abbreviation } from '@emmetio/abbreviation';
import * as os from 'os';

export function handleLiteral(input: string, selectedText: string): string {
    // opening and closing tag
    const prefix = '<' + input + '>';
    const postfix = '</' + input + '>';
    // TODO: handle multi selection

    return prefix + selectedText + postfix;
}

export function handleEmmet(input: string, selectedText: string, indent: number): string | Error {
    // console.log("handling emmet");
    // console.log('input: ', input);
    try {
        // parse emmet
        const config = emmet.resolveConfig(undefined);
        // TODO: only remove snippets, if not HTML!
        config.snippets = {};
        config.options['output.indent'] = '    ';
        config.options['output.baseIndent'] = ' '.repeat(indent);
        const em = emmet.parseMarkup(input, config);

        // insert text to all leaf nodes
        em.children.forEach((c) => { traverseEmmet(c, selectedText); });
        const emString = emmet.stringifyMarkup(em, config);
        // console.log(emString);
        return emString;
    } catch (error: any) {
        console.log(`Error parsing emmet abbreviation "${input}": ${error}`);
        return new Error(error);
    }
    // TODO: handle multi selection
}

export function traverseEmmet(node: AbbreviationNode, value: string): void {
    if (node.children && node.children.length >= 1) {
        node.children.forEach((c) => { traverseEmmet(c, value); });
    } else {
        node.value = [value];
    }
}

export class Error {
    e: any;

    constructor(e: any) {
        this.e = e;
    }
}
