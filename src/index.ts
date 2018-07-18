const fs = require('fs');
const ini = require('ini');
const Discord = require('discord.js');
const random = require('./random');
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

// client.login(token);

function executeCommand(command): string {
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

function executeExpression(expression: string): string {
  return parser.parse(expression).getChildrenString();
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

console.log(executeExpression(''));
console.log(executeExpression('3d8 cold + 1d6 bludgeoning dmg+3d4 piercing-1 STR mod'));
console.log(executeExpression('3d10-7+d4'));
console.log(executeExpression('3d10 stuff name-7 some modifier+d4 guidance'));
console.log(executeExpression('min(2d20)+7'));
console.log(executeExpression('max(2d20)+7'));
console.log(executeExpression('3d10 stuff name-7 some modifier-d6 some debuff+d4 guidance + max(2d20) advantage'));
console.log(executeExpression('3d10 stuff name-7 some modifier-d6 some debuff+d4 guidance + max(2d20 + 3d10) advantage'));
console.log(executeExpression('3d10 stuff name-7 some modifier-d6 some debuff+d4 guidance'));
console.log(executeExpression('d20 - min(2d20) + 15'));