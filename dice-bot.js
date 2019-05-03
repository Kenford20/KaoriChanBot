require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.DICE_BOT_TOKEN;

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

bot.onText(/\/rollnuts/, (msg, match) => {
    const chatId = msg.chat.id;

    let randomNum = Math.floor(Math.random() * 6) + 1;
    bot.sendMessage(chatId, `Random Number: ${randomNum}!`);
})

bot.onText(/\/ello/, (msg, match) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, `m8`);
})