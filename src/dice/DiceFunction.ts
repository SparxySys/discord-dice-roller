import { IRandomProvider } from '../random/random';

export enum FunctionType {
  ABSOLUTE,
  DICE,
  ADD,
  MIN,
  MAX,
}

export interface IDice {
  toString(first: boolean): string;
  getChildrenString(): string;
  toResultString(whitespace: string): string;
  process(random: IRandomProvider);
}

export class DiceFunction implements IDice {
  public name: string;
  public type: FunctionType;
  public positive: boolean;
  public children: DiceFunction[] = [];
  public parent: DiceFunction;
  public value: number;

  public constructor(type: FunctionType, positive: boolean, name: string = null) {
    this.type = type;
    this.name = name;
    this.positive = positive;
  }

  public processChildren(random: IRandomProvider) {
    this.children.forEach((element) => {
      element.process(random);
    });
  }

  public processTotal(numbers: number[], type: FunctionType) {
    let val = 0;
    if (type === FunctionType.ADD) {
      numbers.forEach((element) => {
        val += element;
      });
    } else if (type === FunctionType.MIN) {
      for (let i = 0; i < numbers.length; i++) {
        if (i === 0) {
          val = numbers[i];
        }
        val = Math.min(val, numbers[i]);
      }
    } else if (type === FunctionType.MAX) {
      for (let i = 0; i < numbers.length; i++) {
        if (i === 0) {
          val = numbers[i];
        }
        val = Math.max(val, numbers[i]);
      }
    } else {
      throw new Error('Unimplemented function type ' + this.getFunctionTypeString());
    }
    return val;
  }

  public process(random: IRandomProvider) {
    this.processChildren(random);
    const numbers: number[] = [];
    this.children.forEach((child) => {
      numbers.push(child.value);
    });
    this.value = this.processTotal(numbers, this.type);

    if (!this.positive) {
      this.value = -this.value;
    }
  }

  public addChild(child: DiceFunction) {
    this.children.push(child);
    child.parent = this;
  }

  public getSignString(includePositive: boolean): string {
    if (this.parent && (this.parent.type === FunctionType.MIN || this.parent.type === FunctionType.MAX)) {
      if (!this.positive) {
        return '-';
      }
      return '';
    }
    if (this.positive) {
      if (includePositive) {
        return ' + ';
      }
      return '';
    }
    return ' - ';
  }

  public getNameString(whitespace: string = ' '): string {
    if (this.name) {
      return whitespace + this.name;
    }
    return '';
  }

  public getChildrenString(): string {
    let text = '';
    let separator = ', ';
    if (this.type === FunctionType.ADD) {
      separator = '';
    }
    let firstChild = true;
    this.children.forEach((child) => {
      text += child.toString(firstChild) + separator;
      firstChild = false;
    });
    text = text.substr(0, text.length - separator.length);
    return text;
  }

  public getFunctionTypeString(): string {
    if (this.type === FunctionType.ADD) { return ''; }
    return FunctionType[this.type].toLowerCase();
  }

  public toString(first: boolean): string {
    let text = this.getSignString(!first) + this.getFunctionTypeString() + '(';
    text = text + this.getChildrenString() + ')' + this.getNameString();
    return text;
  }

  public toResultString(whitespace: string): string {
    if (this.children.length < 2) {
      return this.children[0].toResultString(whitespace);
    }
    let text = '**' + String(this.value) + '**';
    text += this.getNameString();
    text += whitespace + '(';
    let first = true;
    this.children.forEach((child) => {
      if (!first) {
        text += ',' + whitespace;
      }
      first = false;
      text += child.toResultString(whitespace);
    });
    text += ')';
    return text;
  }
}
