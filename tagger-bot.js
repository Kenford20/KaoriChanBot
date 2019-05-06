require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const math = require('mathjs');

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
/convert (unit) to (unit) = general units conversion
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

// flips a coin
bot.onText(/^\/flip$/, (msg, match) => {
  let coin = Math.round(Math.random());
  bot.sendMessage(msg.chat.id, coin === 0 ? 'Heads' : 'Tails');
});

// uses mathjs library to do mathematical calculations and unit conversions
bot.onText(/^\/(calc|convert) .+$/, async(msg, match) => {
  console.log(match[0]);
  try {
    let result = await math.eval(match[0].slice(match[0].indexOf(' ')));
    bot.sendMessage(msg.chat.id, `Result: ${result}`);
  } catch(err) {
    console.log(err);
    bot.sendMessage(msg.chat.id, `Something went wrong. Double check your inputs bro!`);
  }
});

bot.onText(/weeb/i, (msg, match) => {
  bot.sendMessage(msg.chat.id, `Y-y.. yes... sen..p-pai..?`);
});

bot.onText(/senpai/i, (msg, match) => {
  bot.sendMessage(msg.chat.id, `Y-y.. yes... Mas..t-ter..?`);
});