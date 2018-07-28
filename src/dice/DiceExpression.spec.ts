import { expect } from 'chai';
import { FakeRandomProvider } from '../random/FakeRandomProvider.spec';
import { DiceFunction, FunctionType } from './DiceFunction';
import { DiceExpression } from './DiceExpression';

const provider = new FakeRandomProvider();

describe('DiceExpression', () => {
  it('basic toString', () => {
      const result: DiceExpression = new DiceExpression(1, 20);
      const resultText = result.toString(true);
      expect(resultText).to.equal('1d20');
  });

  it('basic non-first toString', () => {
      const result: DiceExpression = new DiceExpression(1, 20);
      const resultText = result.toString(false);
      expect(resultText).to.equal(' + 1d20');
  });

  it('toString with negative', () => {
      const result: DiceExpression = new DiceExpression(5, 10, false);
      const resultText = result.toString(true);
      expect(resultText).to.equal(' - 5d10');
  });

  it('toString with name', () => {
      const result: DiceExpression = new DiceExpression(2, 6, true, 'damage');
      const resultText = result.toString(true);
      expect(resultText).to.equal('2d6 damage');
  });

  it('toString with negative and name', () => {
      const result: DiceExpression = new DiceExpression(2, 4, false, 'damage');
      const resultText = result.toString(true);
      expect(resultText).to.equal(' - 2d4 damage');
  });

  it('d20', () => {
      const result: DiceExpression = new DiceExpression(1, 20);
      result.process(provider);
      expect(result.value).to.equal(11);
  });

  it('- d20', () => {
      const result: DiceExpression = new DiceExpression(1, 20, false);
      result.process(provider);
      expect(result.value).to.equal(-11);
  });

  it('3d8', () => {
      const addition: DiceFunction = new DiceFunction(FunctionType.ADD, true);
      const result: DiceExpression = new DiceExpression(3, 8);
      addition.addChild(result);
      result.process(provider);
      expect(result.value).to.equal(15);
  });

  it('- 3d8', () => {
      const addition: DiceFunction = new DiceFunction(FunctionType.ADD, true);
      const result: DiceExpression = new DiceExpression(3, 8, false);
      addition.addChild(result);
      result.process(provider);
      expect(result.value).to.equal(-15);
  });
});