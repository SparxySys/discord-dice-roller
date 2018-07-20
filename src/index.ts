import { Dice, parse } from './DiceExpression';
import { DefaultRandomProvider } from './random';

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
    let parsed: Dice = parse(expression);
    let inputParsed = parsed.getChildrenString();
    parsed.process(new DefaultRandomProvider());
    let output = parsed.toResultString('    ').trim();
    return inputParsed + '\n' + output;
  }
  catch(err) {
    const errorMessage = err.message;
    return 'Sorry, I failed to process your request due to an error.\n' + errorMessage;
  }
}
