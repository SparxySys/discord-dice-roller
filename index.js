const fs = require('fs');
const ini = require('ini');
const Discord = require('discord.js');

var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

const client = new Discord.Client();
const token = config.token;
const commandPrefix = config.prefix;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  try {
    if (msg.content.startsWith(commandPrefix)) {
      let reply = executeCommand(msg.content.substr(1, msg.content.length - 1));
      msg.reply(reply);
    }
  }
  catch(err) {
    console.log(err);
  }
});

client.login(token);

function executeCommand(command) {
  if(command.startsWith('roll ')) {
    return executeExpression(command.substr(4, command.length - 4));
  }
  else if(command.startsWith('rollcode ')) {
    return '`' + executeExpression(command.substr(8, command.length - 8)) + '`';
  }
  else {
    return 'Unknown command: ' + command;
  }
}

function doRoll(expression) {
  expression = expression.trim();
  let result = [];

  if(expression.length === 0) {
    result.push(getResultObject("d20", getRandom(20), true));
    return result;
  }
  let expressions = expression.split(/(?=[+-])/);
  for(let i = 0; i < expressions.length; i++) {
    let current = expressions[i].trim().match(/([^0-9]*[0-9]*d[0-9]+[ ]?)(.*)/);
    if(current === null) {
      current = expressions[i].trim().match(/([^0-9]*[0-9]*)(.*)/);
    }

    let diceExp = current[1].trim();
    let diceExpWithSign = diceExp;

    let positive = true;
    if(diceExp.startsWith('+')) {
      positive = true;
    }
    else if(diceExp.startsWith('-')) {
      positive = false;
    }

    if(diceExp.startsWith('+') || diceExp.startsWith('-')) {
      diceExp = diceExp.substr(1, diceExp.length - 1).trim();
    }

    if(diceExp.startsWith('min(') || diceExp.trim().startsWith('max(')) {
      // sub-expression
      let first = expressions[i].indexOf('(') + 1;
      let last = expressions[i].lastIndexOf(')');
      let subExp = expressions[i].substr(first, last - first);

      let subResult = doRoll(subExp);
      let data = {
        fixedNumber: false,
        expression: subExp,
        total: null,
        value: [],
        positive: positive
      };
      let totals = [];
      for(let j = 0; j < subResult.length; j++) {
        if(typeof subResult[j].value === 'number') {
          data.value.push(subResult[j].value);
          totals.push(subResult[j].total);
        }
        else if(Array.isArray(subResult[j].value)) {
          subResult[j].value.forEach(element => {
            data.value.push(element);
            totals.push(element);
          });
        }
      }
      if(diceExp.trim().startsWith('min(')) {
        data.total = Math.min.apply(Math, totals);
        data.expression = 'min(' + data.expression + ')';
      }
      else {
        data.total = Math.max.apply(Math, totals);
        data.expression = 'max(' + data.expression + ')';
      }

      result.push(data);
      continue;
    }

    let name = '';
    if(typeof current[2] !== 'undefined') {
      name = current[2].trim();
    }

    if(diceExp.length === 0) {
      throw `Invalid dice expression [${diceExp}]`;
    }

    if(diceExp.indexOf('d') < 0) {
      if(isNaN(diceExp)) {
        throw `Invalid modifier [${diceExp}]`;
      }
      result.push(getResultObject(diceExpWithSign, Number(diceExp), positive, name, true));
      continue;
    }

    let expressionParts = diceExp.split("d", 2);
    let diceNum = 1;
    if(expressionParts[0].trim().length !== 0) {
      if(isNaN(expressionParts[0])) {
        throw `Invalid dice count [${diceExp}]`;
      }
      else {
        diceNum = Number(expressionParts[0].trim());
      }
    }
    if(diceNum < 1 || diceNum > 200) {
      throw `Invalid dice count [${diceExp}]`;
    }

    let dieSizeString = expressionParts[1];
    if(typeof dieSizeString === 'undefined') {
      throw `Invalid dice expression [${diceExp}]`;
    }
    dieSizeString = dieSizeString.trim();
    if(dieSizeString.length === 0) {
      throw `Invalid die size [${diceExp}]`;
    }

    if(isNaN(dieSizeString)) {
      throw `Invalid die size [${diceExp}]`;
    }

    let dieSize = Number(dieSizeString);

    if(dieSize < 2 || dieSize >= 1000000) {
      throw `Invalid die size [${diceExp}]`;
    }

    if(diceNum > 1) {
      let diceResults = [];
      for(let j = 0; j < diceNum; j++) {
        diceResults[j] = getRandom(dieSize);
      }
      result.push(getResultObject(diceExpWithSign, diceResults, positive, name));
    }
    else {
      result.push(getResultObject(diceExpWithSign, getRandom(dieSize), positive, name));
    }
  }
  return result;
}

function getResultObject(expression, value, positive, name, fixedNumber = false) {
  let total = 0;
  if(typeof value === 'number') {
    total = value;
  }
  else if(Array.isArray(value)) {
    for(let i = 0; i < value.length; i++) {
      total += value[i];
    }
  }
  else {
    throw 'Invalid value type';
  }

  if(typeof name === 'undefined' || !name) {
    return {
      fixedNumber: fixedNumber,
      expression: expression,
      total: total,
      value: value,
      positive: positive
    };
  }
  return {
    fixedNumber: fixedNumber,
    expression: expression,
    total: total,
    name: name,
    value: value,
    positive: positive
  };
}

function resultArrayToString(results) {
  let text = '';
  if(results.length === 1 && (typeof results[0].value === 'number' || (Array.isArray(results[0].value) && results[0].length === 1))) {
    text = String(results[0].total);
    
    if(results[0].name) {
      text += '    ' + results[0].name;
    }

    return text;
  }

  let total = 0;
  for(let i = 0; i < results.length; i++) {
    if(results[i].positive) {
      total += results[i].total;
    }
    else {
      total -= results[i].total;
    }
    text += resultToString(results[i]);
    if(i < results.length - 1) {
      text += ', ';
    }
  }
  text = '_**' + String(total) + '**_: ' + text;
  return text;
}

function resultToString(result) {

  let sign = '';
  if(!result.positive) {
    sign = '-';
  }
  else {
    sign = '+';
  }
  let text = '**' + sign + String(result.total) + '**';

  let prefix = '';
  let fixedNumber = result.fixedNumber;
  if(!fixedNumber) {
    prefix = '_';
  }

  if(!result.positive) {
    prefix = prefix + '-';
  }

  if(!fixedNumber) {
    text = prefix + result.expression + '_  ' + text;
  }

  if(result.name) {
    text += ' ' + result.name;
  }

  if(typeof result.value === 'number') {
    // nop
  }
  else if(Array.isArray(result.value)) {
    text += ' (';
    for(let i = 0; i < result.value.length; i++) {
      text += String(result.value[i]);
      if(i < result.value.length - 1) {
        text += ',  ';
      }
    }
    text += ')';
  }
  else {
    throw 'Invalid result object';
  }

  return text;
}

function getRandom(max) {
  return getRandomWithMin(1, max);
}

function getRandomWithMin(min, max) {
  return Math.floor(min + (Math.random() * (max-min+1)));
}

function executeExpression(expression) {
  try {
    return resultArrayToString(doRoll(expression));
  }
  catch(err) {
    return "Error: " + err;
  }
}

/*let results = [];
for(let i = 0; i < 1000; i++) {
  let rand = getRandom(1, 20);
  if(typeof results[rand] === 'undefined') {
    results[rand] = 0;
  }
  results[rand] = results[rand] + 1;
}

for(let i = 0; i < results.length; i++) {
  console.log(i + ": " + results[i]);
}*/

/*
console.log(executeExpression('3d8 cold + 1d6 bludgeoning dmg+3d4 piercing-1 STR mod'));
console.log(executeExpression('3d10-7+d4'));
console.log(executeExpression('3d10 stuff name-7 some modifier+d4 guidance'));
console.log(executeExpression('min(2d20)+7'));
console.log(executeExpression('max(2d20)+7'));
console.log(executeExpression('3d10 stuff name-7 some modifier+d4 guidance + max(2d20) advantage'));
*/