import { expect } from 'chai';
import { FakeRandomProvider } from '../random/FakeRandomProvider.spec';
import { DiceFunction, FunctionType } from './DiceFunction'
import { Absolute } from './Absolute';

const provider = new FakeRandomProvider();

describe('DiceFunction', () => {
  it('min of 10 and 20', () => {
      const func = new DiceFunction(FunctionType.MIN, true);
      func.addChild(new Absolute(10));
      func.addChild(new Absolute(20));
      func.process(provider);
      expect(func.value).to.equal(10);
  });

  it('min of 10 and 20 toString', () => {
      const func = new DiceFunction(FunctionType.MIN, true);
      func.addChild(new Absolute(10));
      func.addChild(new Absolute(20));
      expect(func.toString(true)).to.equal('min(10, 20)');
  });

  it('min of 10 and 20 toString non-first', () => {
      const func = new DiceFunction(FunctionType.MIN, true);
      func.addChild(new Absolute(10));
      func.addChild(new Absolute(20));
      expect(func.toString(false)).to.equal(' + min(10, 20)');
  });

  it('min of 10 and 20 toString negative', () => {
      const func = new DiceFunction(FunctionType.MIN, false);
      func.addChild(new Absolute(10));
      func.addChild(new Absolute(20));
      expect(func.toString(false)).to.equal(' - min(10, 20)');
  });

  it('max of 10 and 20', () => {
      const func = new DiceFunction(FunctionType.MAX, true);
      func.addChild(new Absolute(10));
      func.addChild(new Absolute(20));
      func.process(provider);
      expect(func.value).to.equal(20);
  });

  it('addition of 10 and 20', () => {
      const func = new DiceFunction(FunctionType.ADD, true);
      func.addChild(new Absolute(10));
      func.addChild(new Absolute(20));
      func.process(provider);
      expect(func.value).to.equal(30);
  });

  it('addition of 10 and -20', () => {
      const func = new DiceFunction(FunctionType.ADD, true);
      func.addChild(new Absolute(10));
      func.addChild(new Absolute(20, false));
      func.process(provider);
      expect(func.value).to.equal(-10);
  });

  it('invalid DiceFunction type', () => {
      const parseErr = () => {
          const func = new DiceFunction(FunctionType.DICE, true);
          func.process(provider);
      };
      expect(parseErr).to.throw(Error, /Unimplemented function type/);
  });
});