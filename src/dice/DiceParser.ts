import { IRandomProvider } from '../random/random';
import { Absolute } from './Absolute';
import { DiceExpression } from './DiceExpression';
import { DiceFunction, FunctionType } from './DiceFunction';

export function isPositive(symbol: string) {
  if (symbol === '-') {
    return false;
  } else if (symbol !== '+' && symbol !== '') {
    throw new Error(`Invalid symbol`);
  }
  return true;
}

export function parse(expression: string, type: FunctionType = FunctionType.ADD): DiceFunction {
  if (expression.length === 0) {
    const collection: DiceFunction = new DiceFunction(type, true);
    collection.addChild(new DiceExpression(1, 20));
    return collection;
  }

  return parseInternal(expression, type);
}

export function parseInternal(expression: string, type: FunctionType): DiceFunction {
  expression = expression.trim();
  const collection: DiceFunction = new DiceFunction(type, true);

  const expressionMatcher = /(([\+\-,])?\s*(min|max|add)(\(.*\)))([^\+\-,]*)|([\+\-,]?((?!min|max|add)[^\+\-\(\),])+)/g;
  let matches;
  /* tslint:disable */ while ((matches = expressionMatcher.exec(expression)) !== null) { /* tslint:enable */
    if (matches[1]) {
      // subexpression
      let subType: FunctionType = FunctionType.ADD;
      let subPositive: boolean = true;

      if (matches[2]) {
        subPositive = isPositive(matches[2]);
      }

      if (matches[3] === 'min') {
        subType = FunctionType.MIN;
      } else if (matches[3] === 'max') {
        subType = FunctionType.MAX;
      } else {
        subType = FunctionType.ADD;
      }

      const subExpression = matches[4].substr(1, matches[4].length - 2);
      const child = parseInternal(subExpression, subType);
      if (child.children.length === 0) {
        continue;
      }
      child.name = matches[5].trim();
      child.positive = subPositive;
      collection.addChild(child);
      continue;
    }

    const expressionContentMatcher = /[^0-9\+\-d]*([\+\-]?)\s*(\d*)d?(\d*)\s*(.*)/;
    const current = expressionContentMatcher.exec(matches[6]);

    const symbol = current[1];
    const positive: boolean = isPositive(symbol);

    if (!current[2] && !current[3]) {
      throw new Error(`Invalid expression [${current[0]}]`);
    }

    const name = current[4].trim();

    if (current[2] && !current[3]) {
      collection.addChild(new Absolute(Number(current[2]), positive, name));
    } else {
      let diceCount = 1;
      if (current[2]) {
        diceCount = Number(current[2]);
      }

      const dieSize = Number(current[3]);

      if (dieSize < 2 || dieSize >= 1000000) {
        throw new Error(`Invalid die size [${current[0]}]`);
      }
      if (diceCount < 1 || diceCount > 200) {
        throw new Error(`Invalid dice count [${current[0]}]`);
      }

      collection.addChild(new DiceExpression(diceCount, dieSize, positive, name));
    }
  }
  return collection;
}
