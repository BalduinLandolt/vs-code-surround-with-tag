import { describe } from 'mocha';
import { expect } from 'chai';
import { handleLiteral, handleEmmet } from "./lib";

describe('When handling a literal input', () => {
    it('should correctly surround it', () => {
        const surroundedLiteral = handleLiteral('i', 'foo');
        const expectedResult = '<i>foo</i>';
        expect(surroundedLiteral).to.equal(expectedResult);
    });
});

describe('When handling an emmet input', () => {
    it('should correctly surround it', () => {
        const surroundedLiteral = handleEmmet('i>j*2', 'foo', 4);
        const expectedResult = '<i>\n        <j>foo</j>\n        <j>foo</j>\n    </i>';
        expect(surroundedLiteral).to.equal(expectedResult);
    });
});
