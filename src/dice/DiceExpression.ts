import { IRandomProvider } from '../random/random';
import { DiceFunction, FunctionType } from './DiceFunction';

export class DiceExpression extends DiceFunction {
  public diceCount: number;
  public dieSize: number;
  public values: number[] = [];

  public constructor(diceCount: number, dieSize: number, positive: boolean = true, name: string = null) {
    super(FunctionType.DICE, positive, name);
    this.diceCount = diceCount;
    this.dieSize = dieSize;
  }

  public process(random: IRandomProvider) {
    if (this.diceCount === 1) {
      this.value = random.getRandomWithMin(1, this.dieSize);
    } else {
      for (let i = 0; i < this.diceCount; i++) {
        const val = random.getRandomWithMin(1, this.dieSize);
        this.values.push(val);
      }
      this.value = this.processTotal(this.values, this.parent.type);
    }
    if (!this.positive) {
      this.value = -this.value;
    }
  }

  public toString(first: boolean): string {
    let text = this.getSignString(!first);
    text += this.diceCount + 'd' + this.dieSize + this.getNameString();
    return text;
  }

  public toResultString(whitespace: string): string {
    let signToInclude = '';
    if (this.parent && this.parent.children.length === 1) {
      signToInclude = this.parent.getSignString(false).trim();
    }
    let text = '**' + signToInclude + this.value + '**' + this.getNameString();
    if (!this.values || this.values.length === 0) {
      return text;
    }
    text += whitespace + '(';
    for (let i = 0; i < this.values.length; i++) {
      if (i !== 0) {
        text += ',' + whitespace;
      }
      text += Number(this.values[i]);
    }
    text += ')';
    return text;
  }
}
