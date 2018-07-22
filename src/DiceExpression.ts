import { RandomProvider } from "./random";

export enum FunctionType {
  ABSOLUTE,
  DICE,
  ADD,
  MIN,
  MAX
};

export interface Dice {
  toString(first: boolean): string;
  getChildrenString(): string;
  toResultString(whitespace: string): string;
  process(random: RandomProvider);
}

export class DiceFunction implements Dice {
  name: string;
  type: FunctionType;
  positive: boolean;
  children: DiceFunction[] = [];
  parent: DiceFunction;
  value: number;

  public constructor(type: FunctionType, positive: boolean, name: string = null) {
    this.type = type;
    this.name = name;
    this.positive = positive;
  }

  processChildren(random: RandomProvider) {
    this.children.forEach(element => {
      element.process(random);
    });
  }

  processTotal(numbers: number[], type: FunctionType) {
    let val = 0;
    if(type == FunctionType.ADD) {
      for(let i = 0; i < numbers.length; i++) {
        val += numbers[i];
      }
    }
    else if(type == FunctionType.MIN) {
      for(let i = 0; i < numbers.length; i++) {
        if(i === 0) {
          val = numbers[i];
        }
        val = Math.min(val, numbers[i]);
      }
    }
    else if(type == FunctionType.MAX) {
      for(let i = 0; i < numbers.length; i++) {
        if(i === 0) {
          val = numbers[i];
        }
        val = Math.max(val, numbers[i]);
      }
    }
    else {
      throw new Error('Unimplemented function type ' + this.getFunctionTypeString());
    }
    return val;
  }

  process(random: RandomProvider) {
    this.processChildren(random);
    let numbers: number[] = [];
    for(let i = 0; i < this.children.length; i++) {
      numbers.push(this.children[i].value);
    }
    this.value = this.processTotal(numbers, this.type);

    if(!this.positive) {
      this.value = -this.value;
    }
  }

  addChild(child: DiceFunction) {
    this.children.push(child);
    child.parent = this;
  }

  getSignString(includePositive: boolean): string {
    if(this.parent && (this.parent.type === FunctionType.MIN || this.parent.type === FunctionType.MAX)) {
      if(!this.positive) {
        return '-';
      }
      return '';
    }
    if(this.positive) {
      if(includePositive) {
        return ' + ';
      }
      return '';
    }
    return ' - ';
  }

  getNameString(whitespace: string = ' '): string {
    if(this.name) {
      return whitespace + this.name;
    }
    return '';
  }

  getChildrenString(): string {
    let text = '';
    let separator = ', ';
    if(this.type === FunctionType.ADD) {
      separator = '';
    }
    let firstChild = true;
    this.children.forEach(child => {
      text += child.toString(firstChild) + separator;
      firstChild = false;
    });
    text = text.substr(0, text.length - separator.length);
    return text;
  }

  getFunctionTypeString(): string {
    if(this.type === FunctionType.ADD) return '';
    return FunctionType[this.type].toLowerCase();
  }

  toString(first: boolean): string {
    let text = this.getSignString(!first) + this.getFunctionTypeString() + '(';
    text = text + this.getChildrenString() + ')' + this.getNameString();
    return text;
  }

  toResultString(whitespace: string): string {
    if(this.children.length < 2) {
      return this.children[0].toResultString(whitespace);
    }
    let text = '**' + String(this.value) + '**';
    text += this.getNameString();
    text += whitespace + '(';
    let first = true;
    this.children.forEach(child => {
      if(!first) {
        text += ',' + whitespace;
      }
      first = false;
      text += child.toResultString(whitespace);
    });
    text += ')';
    return text;
  }
}

export class DiceExpression extends DiceFunction {
  diceCount: number;
  dieSize: number;
  values: number[] = [];

  public constructor(diceCount: number, dieSize: number, positive: boolean = true, name: string = null) {
    super(FunctionType.DICE, positive, name);
    this.diceCount = diceCount;
    this.dieSize = dieSize;
  }

  process(random: RandomProvider) {
    if(this.diceCount === 1) {
      this.value = random.getRandomWithMin(1, this.dieSize);
    }
    else {
      for(let i = 0; i < this.diceCount; i++) {
        let val = random.getRandomWithMin(1, this.dieSize);
        this.values.push(val);
      }
      this.value = this.processTotal(this.values, this.parent.type);
    }
    if(!this.positive) {
      this.value = -this.value;
    }
  }

  toString(first: boolean): string {
    let text = this.getSignString(!first);
    text += this.diceCount + 'd' + this.dieSize + this.getNameString();
    return text;
  }

  toResultString(whitespace: string): string {
    let signToInclude = '';
    if(this.parent && this.parent.children.length === 1) {
      signToInclude = this.parent.getSignString(false).trim();
    }
    let text = '**' + signToInclude + this.value + '**' + this.getNameString();
    if(!this.values || this.values.length === 0) {
      return text;
    }
    text += whitespace + '(';
    for(let i = 0; i < this.values.length; i++) {
      if(i !== 0) {
        text += ',' + whitespace;
      }
      text += Number(this.values[i]);
    }
    text += ')';
    return text;
  }
}

export class Absolute extends DiceFunction {

  constructor(value: number, positive: boolean = true, name: string = null) {
    super(FunctionType.ABSOLUTE, positive, name);
    this.positive = positive;
    this.value = value;
  }

  process(random: RandomProvider) {
    if(!this.positive) {
      this.value = -this.value;
    }
  }

  toString(first: boolean): string {
    return this.getSignString(!first) + String(this.value) + this.getNameString();
  }

  toResultString(): string {
    return '**' + this.value + '**' + this.getNameString();
  }
}

export function isPositive(symbol: string) {
  if(symbol === '-') {
    return false;
  }
  else if(symbol !== '+' && symbol !== '') {
    throw new Error(`Invalid symbol`);
  }
  return true;
}

export function parse(expression: string, type: FunctionType = FunctionType.ADD): DiceFunction {
  if(expression.length === 0) {
    let collection: DiceFunction = new DiceFunction(type, true);
    collection.addChild(new DiceExpression(1, 20));
    return collection;
  }

  return parseInternal(expression, type);
}

export function parseInternal(expression: string, type: FunctionType): DiceFunction {
  expression = expression.trim();
  let collection: DiceFunction = new DiceFunction(type, true);

  const expressionMatcher = /(([\+\-,])?\s*(min|max|add)(\(.*\)))([^\+\-,]*)|([\+\-,]?((?!min|max|add)[^\+\-\(\),])+)/g;
  let matches;
  while((matches = expressionMatcher.exec(expression)) !== null) {
    if(matches[1]) {
      // subexpression
      let type: FunctionType = FunctionType.ADD;
      let positive: boolean = true;
      
      if(matches[2]) {
        positive = isPositive(matches[2]);
      }


      if(matches[3] === 'min') {
        type = FunctionType.MIN;
      }
      else if(matches[3] === 'max') {
        type = FunctionType.MAX;
      }
      else {
        type = FunctionType.ADD;
      }

      let subExpression = matches[4].substr(1, matches[4].length - 2);
      let child = parseInternal(subExpression, type);
      if(child.children.length === 0) {
        continue;
      }
      child.name = matches[5].trim();
      child.positive = positive;
      collection.addChild(child);
      continue;
    }

    const expressionContentMatcher = /[^0-9\+\-d]*([\+\-]?)\s*(\d*)d?(\d*)\s*(.*)/;
    let current = expressionContentMatcher.exec(matches[6]);

    let symbol = current[1];
    let positive: boolean = isPositive(symbol);

    if(!current[2] && !current[3]) {
      throw new Error(`Invalid expression [${current[0]}]`);
    }

    let name = current[4].trim();

    if(current[2] && !current[3]) {
      collection.addChild(new Absolute(Number(current[2]), positive, name));
    }
    else {
      let diceCount = 1;
      if(current[2]) {
        diceCount = Number(current[2]);
      }

      let dieSize = Number(current[3]);

      if(dieSize < 2 || dieSize >= 1000000) {
        throw new Error(`Invalid die size [${current[0]}]`);
      }
      if(diceCount < 1 || diceCount > 200) {
        throw new Error(`Invalid dice count [${current[0]}]`);
      }

      collection.addChild(new DiceExpression(diceCount, dieSize, positive, name));
    }
  }
  return collection;
}