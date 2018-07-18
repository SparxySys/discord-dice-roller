import { Dice } from "./DiceExpression";
import { DefaultRandomProvider } from "./random";

const fs = require('fs');
const ini = require('ini');
const Discord = require('discord.js');
const parser = require('./DiceExpression');

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

function executeCommand(command): string {
  if(command.startsWith('rollcode')) {
    return '```\n' + executeExpression(command.substr(8, command.length - 8)) + '\n```';
  }
  else if(command.startsWith('roll')) {
    return executeExpression(command.substr(4, command.length - 4));
  }
  else {
    return 'Unknown command: ' + command;
  }
}

function executeExpression(expression: string): string {
  try {
    let parsed: Dice = parser.parse(expression);
    let inputParsed = parsed.getChildrenString();
    parsed.process(new DefaultRandomProvider());
    let output = parsed.toResultString().trim().replace(/\s+/g, '    ');
    return inputParsed + '\n' + output;
  }
  catch(err) {
    return 'Sorry, I failed to process your request due to an error.\n' + err;
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

/*console.log(executeExpression('') + '\n');
console.log(executeExpression('3d8 cold + 1d6 bludgeoning dmg+3d4 piercing-1 STR mod') + '\n');
console.log(executeExpression('3d10-7+d4') + '\n');
console.log(executeExpression('3d10 stuff name-7 some modifier+d4 guidance') + '\n');
console.log(executeExpression('min(2d20)+7') + '\n');
console.log(executeExpression('max(2d20)+7') + '\n');
console.log(executeExpression('3d10 stuff name-7 some modifier-d6 some debuff+d4 guidance + max(2d20) advantage') + '\n');
console.log(executeExpression('3d10 stuff name-7 some modifier-d6 some debuff+d4 guidance + max(2d20, 3d10) advantage') + '\n');
console.log(executeExpression('3d10 stuff name-7 some modifier-d6 some debuff+d4 guidance') + '\n');
console.log(executeExpression('d20 - min(2d20) + 15') + '\n');*/
