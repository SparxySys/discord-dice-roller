import { IRandomProvider } from '../random/random';
import { DiceFunction, FunctionType } from './DiceFunction';

export class Absolute extends DiceFunction {

  constructor(value: number, positive: boolean = true, name: string = null) {
    super(FunctionType.ABSOLUTE, positive, name);
    this.positive = positive;
    this.value = value;
  }

  public process(random: IRandomProvider) {
    if (!this.positive) {
      this.value = -this.value;
    }
  }

  public toString(first: boolean): string {
    return this.getSignString(!first) + String(this.value) + this.getNameString();
  }

  public toResultString(): string {
    return '**' + this.value + '**' + this.getNameString();
  }
}
