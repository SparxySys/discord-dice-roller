
import { expect } from 'chai';
import { FakeRandomProvider } from '../random/FakeRandomProvider.spec';
import { DiceFunction, FunctionType } from './DiceFunction';
import { Absolute } from './Absolute';

const provider = new FakeRandomProvider();

describe('Absolute', () => {
  it('positive number', () => {
      const abs = new Absolute(8);
      abs.process(provider);
      expect(abs.value).to.equal(8);
  });

  it('number with name', () => {
      const abs = new Absolute(8, true, 'some modifier');
      abs.process(provider);
      expect(abs.toString(true)).to.equal('8 some modifier');
  });

  it('positive number toString', () => {
      const abs = new Absolute(8);
      expect(abs.toString(true)).to.equal('8');
  });

  it('negative number', () => {
      const abs = new Absolute(8);
      abs.process(provider);
      expect(abs.value).to.equal(8);
  });

  it('negative number toString', () => {
      const abs = new Absolute(8, false);
      expect(abs.toString(true)).to.equal(' - 8');
  });

  it('no parent no signstring', () => {
      const abs = new Absolute(8, true);
      abs.parent = null;
      expect(abs.getSignString(false)).to.equal('');
  });

  it('parent no signstring', () => {
      const abs = new Absolute(8, true);
      abs.parent = new DiceFunction(FunctionType.ADD, true);
      expect(abs.getSignString(false)).to.equal('');
  });

  it('parent negative signstring', () => {
      const abs = new Absolute(8, false);
      abs.parent = new DiceFunction(FunctionType.ADD, true);
      expect(abs.getSignString(false)).to.equal(' - ');
  });

  it('parent include positive signstring', () => {
      const abs = new Absolute(8, true);
      abs.parent = new DiceFunction(FunctionType.ADD, true);
      expect(abs.getSignString(true)).to.equal(' + ');
  });

  it('parent force hidden positive signstring min', () => {
      const abs = new Absolute(8, true);
      abs.parent = new DiceFunction(FunctionType.MIN, true);
      expect(abs.getSignString(true)).to.equal('');
  });

  it('parent force hidden positive signstring max', () => {
      const abs = new Absolute(8, true);
      abs.parent = new DiceFunction(FunctionType.MAX, true);
      expect(abs.getSignString(true)).to.equal('');
  });

  it('parent negative signstring short min', () => {
      const abs = new Absolute(8, false);
      abs.parent = new DiceFunction(FunctionType.MIN, true);
      expect(abs.getSignString(false)).to.equal('-');
  });

  it('parent negative signstring short max', () => {
      const abs = new Absolute(8, false);
      abs.parent = new DiceFunction(FunctionType.MAX, true);
      expect(abs.getSignString(false)).to.equal('-');
  });

  it('no parent positive signstring', () => {
      const abs = new Absolute(8, true);
      abs.parent = null;
      expect(abs.getSignString(true)).to.equal(' + ');
  });
});