import { DiceExpression } from './DiceExpression';
import { expect } from 'chai';

describe('DiceExpression', () => {
    it('should return 1d20', () => {
        const result: DiceExpression = new DiceExpression(1, 20);
        const resultText = result.toString(true);
        expect(resultText).to.equal('1d20');
    });

    it('should return - 5d10', () => {
        const result: DiceExpression = new DiceExpression(5, 10, false);
        const resultText = result.toString(true);
        expect(resultText).to.equal(' - 5d10');
    });

    it('should return 2d6 damage', () => {
        const result: DiceExpression = new DiceExpression(2, 6, true, 'damage');
        const resultText = result.toString(true);
        expect(resultText).to.equal('2d6 damage');
    });
});