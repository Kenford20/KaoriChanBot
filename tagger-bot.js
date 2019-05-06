require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TAGGER_BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});


bot.onText(/(^\/taskete$)|(^\/h(e|a)lp$)/, async(msg, match) => {
  bot.sendMessage(msg.chat.id, `
/roll = rolls a die by default, 
/roll # = gives a random number up to the number you input
/meena = tags everyone in the group
/flip = flips a coin
/calc # (op) # = calculator
  `);
});

// tags everyone in my group
bot.onText(/^\/meena$/, async(msg, match) => {
    //const user = msg.from.id;
    //const member = await bot.getChatMember(chatId, user);
    //console.log(member);
    bot.sendMessage(msg.chat.id, process.env.TELEGRAM_GROUP_USERS);
  });

// rolls a die
bot.onText(/^\/roll( [0-9]*)?$/, (msg, match) => {
  let threshold = match[0].split(' ')[1]; // grabs optional parameter defined by user i.e: /roll 100
  
  if(!threshold) {
    threshold = 6; // default die roll
  }

  bot.sendMessage(msg.chat.id, `Random Number: ${Math.floor(Math.random() * threshold) + 1}!`);
});

bot.onText(/(\/flip)/, (msg, match) => {
  let coin = Math.round(Math.random());
  console.log(coin)
  bot.sendMessage(msg.chat.id, coin === 0 ? 'Heads' : 'Tails');
});

bot.onText(/^\/calc \d+ ?(\+|\-|\*|\/){1} ?\d+$/, (msg, match) => {
  let operand1 = parseInt(match[0].split(' ')[1]);
  let operand2 = parseInt(match[0].split(' ')[3]);
  let operation = match[0].split(' ')[2];
  let result;
  console.log(match);
  console.log(match[0]);

  switch(operation) {
    case '+': result = operand1 + operand2; break;
    case '-': result = oprand1 - operand2; break;
    case '*': result = operand1 * operand2; break;
    case '/': result = operand1 / operand2; break;
    default: result = 'Something is wrong with your input! Be sure to add spaces between numbers.'; break;
  }

  bot.sendMessage(msg.chat.id, `Result: ${result}`);
});