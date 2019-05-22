require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const math = require('mathjs');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.DEVELOPMENT_BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const botTag = '@qqm_development_bot';
const fetch = require('node-fetch');
const emojis = require('./telegram-emojis');
let profanityMode = false;

// handles command autocompletion through the commands list (adds the bot's tag name to the regexp)
// i.e: /help@bot_tag_name
function generateRegExp(reg) {
  return new RegExp(`${reg}(${botTag})?$`);
}

//https://api.telegram.org/bot{my_bot_token}/setWebhook?url={url_to_send_updates_to}

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

// sends user a list of commands
bot.onText(/(^\/taskete(@qqm_development_bot)?$)|(^\/h(e|a)lp$)/, (msg, match) => {
  bot.sendMessage(msg.chat.id, `
/roll = rolls a die by default, 
/roll (number) = gives a random number up to the number you input
/meena = tags everyone in the group
/flip = flips a coin
/calc (expression) = calculator
/convert (unit) to (unit) = general units conversion
/weather (city) = gives you the weather in the city you specify
/filter = toggles the profanity filter
/spotify (search query) = allows user to search key words from spotify and returns top result
/translate (text) = translates your text for you into a target language
/freshmix = gives you a fresh scboiz mix
/remindmeto (task) = kaori-chan will remind you to do something at a time you specify
/nextbus (bus number) (bus stop name) = get the arrival time of next bus you specified \n   Numbered streets and named street intersections are separated with a / ex: 35th/Archer
and some weeb stuff
  `);
});

// tags everyone in my group
bot.onText(generateRegExp('^\/meena'), (msg, match) => {
    bot.sendMessage(msg.chat.id, process.env.TELEGRAM_GROUP_USERS);
});

// rolls a die
bot.onText(generateRegExp('^\/roll( [0-9]*)?'), (msg, match) => {
  let threshold = match[0].split(' ')[1]; // grabs optional parameter defined by user i.e: /roll 100
  //generateRegExp('^\/roll( [0-9]*)?');
  if(!threshold) {
    threshold = 6; // default die roll
  }

  bot.sendMessage(msg.chat.id, `Random Number: ${Math.floor(Math.random() * threshold) + 1}`);
});

// flips a coin
bot.onText(generateRegExp('^\/flip'), (msg, match) => {
  let coin = Math.round(Math.random());

  bot.sendMessage(msg.chat.id, coin === 0 ? `Heads ${emojis.smiley}` : `Tails ${emojis.peach}`);
});

bot.onText(generateRegExp('^\/(calc|convert)'), (msg, match) => {
  let input = /calc/.test(match[0]) ? 'expression' : 'conversion';
  bot.sendMessage(msg.chat.id, `Enter an ${input} with the command! Onigaishimasu~`);
});

// uses mathjs library to do mathematical calculations and unit conversions
bot.onText(/^\/(calc|convert) .+$/, async(msg, match) => {
  console.log(match[0]);
  try {
    let result = await math.eval(match[0].slice(match[0].indexOf(' ')));
    bot.sendMessage(msg.chat.id, `Result: ${result}`);
  } catch(err) {
    console.log(err);
    bot.sendMessage(msg.chat.id, `Double check your expression ya konoyero!`);
  }
});

bot.onText(generateRegExp('^\/weather'), (msg, match) => {
  bot.sendMessage(msg.chat.id, 'Oni..g-gai, enter a city name with the command, senpai~');
});

// makes a post request to openweathermap API and sends the user the weather of a specified city
bot.onText(/^\/weather .+$/i, async(msg, match) => {
  const city = match[0].slice(match[0].indexOf(' ')).replace(/\s/g, '+');
  const weatherAPI = `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${process.env.WEATHER_API_KEY}&units=imperial`; // units=imperial converts temperature to Fahrenheit

  try {
    const response = await fetch(weatherAPI, {
      method: "POST",
      header: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    console.log(data)
    const weatherCode = data.weather[0].id;
    const temperatureEmoji = data.main.temp > 50 ? emojis.fire : emojis.snowman;
    let weatherEmoji;

    // weather codes at: https://openweathermap.org/weather-conditions
    switch(true) {
      case (weatherCode >= 200 && weatherCode <= 232): weatherEmoji = emojis.thunderstorm; break;
      case (weatherCode >= 300 && weatherCode <= 321): weatherEmoji = emojis.droplet; break;
      case (weatherCode >= 500 && weatherCode <= 531): weatherEmoji = emojis.rain; break;
      case (weatherCode >= 600 && weatherCode <= 622): weatherEmoji = emojis.snowflake; break;
      case (weatherCode >= 700 && weatherCode <= 781): weatherEmoji = emojis.atmosphere; break;
      case weatherCode === 800: weatherEmoji = emojis.sun; break;
      case (weatherCode === 801 || weatherCode === 802): weatherEmoji = emojis.sunCloud; break;
      case (weatherCode === 803 || weatherCode === 804): weatherEmoji = emojis.cloud; break;
      default: weatherEmoji = emojis.defaultEmoji;
    }

    bot.sendMessage(msg.chat.id, `
      Current weather in ${data.name},  (${data.sys.country}): \n
      ${temperatureEmoji} Temp is ${data.main.temp}${String.fromCharCode(176)}F
      ${emojis.arrowUp} ${data.main.temp_max}${String.fromCharCode(176)}F high and ${emojis.arrowDown} ${data.main.temp_min}${String.fromCharCode(176)}F low
      ${weatherEmoji} Forecast is ${data.weather[0].main} and ${data.weather[0].description}
    `);
  } catch(err) {
      console.log(err);
      bot.sendMessage(msg.chat.id, 'Go..m-men n-nasai.. double check the city name ya bakayero!');
  }
});

bot.onText(generateRegExp('^\/filter'), (msg, match) => {
  profanityMode = !profanityMode;
  console.log(`profanity mode is: ${profanityMode}`);
  bot.sendMessage(msg.chat.id, profanityMode ? `Kaori chan filter enabled! Arigato senpai ${emojis.kissFaceHeart}` : `Kaori chan filter disabled. Watashi wa kanashi ${emojis.sadFace2}`);
});

bot.onText(/\bweeb\b/i, (msg, match) => {
  bot.sendMessage(msg.chat.id, `Y-y.. yes... sen..p-pai..?`);
});

bot.onText(/\bsenpai\b/i, (msg, match) => {
  bot.sendMessage(msg.chat.id, `Y-y.. yes... Mas..t-ter..?`);
});

bot.onText(/\bkaori( ?-?chan)?\b/i, async(msg, match) => {
  const user = msg.from.id
  const member = await bot.getChatMember(msg.chat.id, user);
  bot.sendMessage(msg.chat.id, `H-a.. hai... ${member.user.first_name}-sama?`);
});

bot.onText(/\bwaifu\b/i, (msg, match) => {
  bot.sendMessage(msg.chat.id, `W-wata..shi?? K-kimi no waifu?! ${emojis.blushFace}`);
});

bot.onText(/\b(tits?|deek|dick|boobs?|cock|cawk|pussy|vaginas?|nips?|nipples?|penis|ass|booty|butt|nuts|balls|testicles|69)\b/i, async(msg, match) => {
  if(profanityMode) {
    const user = msg.from.id
    const member = await bot.getChatMember(msg.chat.id, user);
    
    const naughtyReplies = [
      `K-kono.... h-hen..tai! ${emojis.blushFace} \n Kimi wa dirty desu ${member.user.first_name}-senpai~`,
      `You're so naughty ${member.user.first_name}-sama! ${emojis.winkyTongueFace}`,
      `S-senpai...! Hazukashi desu~ ${emojis.monkeyBlockingEyes}`,
      `${emojis.blushFace} ${member.user.first_name}-kun na-n..ni  o i-itte iru..!`,
      `${emojis.blueScreamingFace} ${member.user.first_name}-senpai! w..what are you s-say..ing?`
    ];

    bot.sendMessage(msg.chat.id, naughtyReplies[Math.floor(Math.random()*(naughtyReplies.length-1))]);
  }
});


bot.onText(/\b(fags?|faggot|asshole|fuck|fucker|bitch|shit|prick|cunt|slut)\b/i, async(msg, match) => {
  if(profanityMode) {
    const user = msg.from.id
    const member = await bot.getChatMember(msg.chat.id, user);

    const profanityReplies = [
      `K-ko..wai-desu~ You're mean ${member.user.first_name}-sama ${emojis.sadFace}`,
      `${member.user.first_name}-sama... you're gonna make me kanashi ${emojis.cryFace}`,
      `Y-yamete ${member.user.first_name}-kun.. ${emojis.sadFace2} \nThat's a warui thing to say..`,
      `${emojis.redMadFace} Don't say that senpai! Sore wa yokunai ne!`,
      `Ureshikunai.. ${emojis.redMadFace}\nKaori-chan will get angry if you say that ${emojis.madFace}`,
    ];
    
    bot.sendMessage(msg.chat.id, profanityReplies[Math.floor(Math.random()*(profanityReplies.length-1))]);
  }
});

bot.onText(generateRegExp('^\/freshmix'), (msg, match) => {
  const mixes = ['https://soundcloud.com/wayneechu/02-neptune-melodic-future-bass-mix-1/s-XAHJb', 'https://soundcloud.com/wayneechu/01-jupiter-feels-trap-mix'];
  bot.sendMessage(msg.chat.id, mixes[Math.floor(Math.random()*(mixes.length))]);
});

bot.onText(generateRegExp('^\/spotify'), (msg, match) => {
  bot.sendMessage(msg.chat.id, 'Enter a song query with the command, senpai. Onigaishimasu~');
});

bot.onText(/^\/spotify .+$/i, (msg, match) => {
  const songQuery = match[0].slice(match[0].indexOf(' ')+1).replace(/\s/g, '+');
  console.log(songQuery);
  
  const queryOptions = {
    reply_markup: JSON.stringify({ 
      inline_keyboard: [
        [{text:"Track", callback_data:'Track ' + songQuery}],
        [{text:"Album", callback_data:'Album ' + songQuery}],
        [{text:"Artist", callback_data:'Artist ' + songQuery}],
        [{text:"Playlist", callback_data:'Playlist ' + songQuery}]
      ]
    })
  };
  bot.sendMessage(msg.chat.id, "What are you querying for?", queryOptions);
});

bot.onText(generateRegExp('^\/translate'), (msg, match) => {
  bot.sendMessage(msg.chat.id, `Senpai, you need to give me something to translate silly goose! ${emojis.smilingColdSweatFace}`);
});

bot.onText(/^\/translate .+$/i, (msg, match) => {
  const textInput = match[0].slice(match[0].indexOf(' '));
  // the callback_data property for the inline keyboard options can only hold 64 bytes, so the user input is limited to a certain amount of characters

  const languageOptions = {
    reply_markup: JSON.stringify({ 
      inline_keyboard: [
        [{text:"English", callback_data:'en|English' + textInput}],
        [{text:"Chinese Simplified", callback_data:'zh-CN|Chinese(Simp)' + textInput}],
        [{text:"Chinese Traditional", callback_data:'zh-TW|Chinese(Trad)' + textInput}],
        [{text:"Filipino", callback_data:'tl|Filipino' + textInput}],
        [{text:"French", callback_data:'fr|French' + textInput}],
        [{text:"German", callback_data:'de|German' + textInput}],
        [{text:"Greek", callback_data:'el|Greek' + textInput}],
        [{text:"Japanese", callback_data:'ja|Japanese' + textInput}],
        [{text:"Korean", callback_data:'ko|Korean' + textInput}],
        [{text:"Latin", callback_data:'la|Latin' + textInput}],
        [{text:"Spanish", callback_data:'es|Spanish' + textInput}]
      ]
    })
  };
  bot.sendMessage(msg.chat.id, "Translate to?", languageOptions);
});

bot.onText(/^\/remindmeto .+$/i, (msg, match) => {
  const reminder = match[0].slice(match[0].indexOf(' ')+1);
  const [task, time] = reminder.split(' @ ');

  if(/\d?\d:\d\d (AM|PM)/i.test(time)) {
    const [reminderHours, mins_am_pm] = time.split(':');
    const [reminderMinutes, am_pm] = mins_am_pm.split(' '); 

    if(reminderHours > 0 && reminderHours < 13 && reminderMinutes >= 0 && reminderMinutes < 60) {
      const findSecondsToElapse = require('./command-methods/find-seconds-to-elapse');
      bot.sendMessage(msg.chat.id, `Wakatta @${msg.from.username}, I will remind you to ${task} at ${time}. \nShinpaishinaide! ${emojis.thumbsUp}`);
  
      let timeUntilReminder = findSecondsToElapse(reminderHours, reminderMinutes, am_pm) * 1000;
      console.log(`reminding in ${timeUntilReminder} milliseconds!`);
      setTimeout(() => {
        bot.sendMessage(msg.chat.id, `@${msg.from.username}-senpai, it is time to ${task}!! \nHaiyaku fam ${emojis.blueScreamingFace}`);
      }, timeUntilReminder);
    } else {
      bot.sendMessage(msg.chat.id, `Senpai, make sure to enter a valid time ya bakayero! ${emojis.smilingColdSweatFace} \n(AM/PM format) pls`);
    }
  } else {
    bot.sendMessage(msg.chat.id, `Senpai, you didn't specify am/pm or you're missing a colon ya konoyero! ${emojis.smilingColdSweatFace}`);
  }
});

// reminder command with force reply format
// bot.onText(/^\/remindmeto .+$/i, (msg, match) => {
//   let reminder = match[0].slice(match[0].indexOf(' ')+1);

//   bot.sendMessage(
//     msg.chat.id, 
//     `When do you want to be reminded, @${msg.from.username}? \n Please use format: (HH:MM AM/PM)`, 
//     { reply_markup: { force_reply: true, selective: true }}
//   )
//   .then(botsQuestion => {
//     bot.onReplyToMessage(botsQuestion.chat.id, botsQuestion.message_id, (reply) => {
//       let [reminderHours, mins_am_pm] = reply.text.split(':');
//       let [reminderMinutes, am_pm] = mins_am_pm.split(' ');
//       if(/\d?\d:\d\d (AM|PM)/i.test(reply.text) && reminderHours > 0 && reminderHours < 13 && reminderMinutes >= 0 && reminderMinutes < 60) {
//         const findSecondsToElapse = require('./command-methods/find-seconds-to-elapse');
//         bot.sendMessage(msg.chat.id, `Wakatta, I will remind you to ${reminder} at ${reply.text}. \nShinpaishinaide! ${emojis.thumbsUp}`);

//         let timeUntilReminder = findSecondsToElapse(reminderHours, reminderMinutes, am_pm) * 1000;
//         console.log(`reminding in ${timeUntilReminder} milliseconds!`);
//         setTimeout(() => {
//           bot.sendMessage(msg.chat.id, `@${reply.from.username}-senpai, it is time to ${reminder}!! \nHaiyaku fam ${emojis.blueScreamingFace}`);
//         }, timeUntilReminder);
//       } else {
//         bot.sendMessage(msg.chat.id, 'Make sure your time is in the right format bruh!');
//       }
//     })
//   });
// });

bot.onText(generateRegExp('^\/nextbus'), (msg, match) => {
  bot.sendMessage(msg.chat.id, `${msg.from.first_name}-kun, you didn't tell me the bus number and bus stop name! \n Ya silly goose ${emojis.smilingColdSweatFace}`);
});

bot.onText(/^\/nextbus .+$/i, async(msg, match) => {
  const busDataInput = match[0].slice(match[0].indexOf(' ')+1);
  const route = busDataInput.slice(0, busDataInput.indexOf(' '));
  const stopName = busDataInput.slice(busDataInput.indexOf(' ')+1);
  const fetchBusDirections = require('./command-methods/fetch-bus-directions');
  console.log(`route: ${route} stop: ${stopName}`);

  try {
    const busDirections = await fetchBusDirections(route, msg.chat.id, bot);
    const inlineKeyboardOptions = busDirections.map(option => {
      return {text:`${option}`, callback_data:`${option}|${route}|${stopName}`}
    });

    const directionOptions = {
      reply_markup: JSON.stringify({ 
        inline_keyboard: [inlineKeyboardOptions]
      })
    };
    bot.sendMessage(msg.chat.id, "What direction senpai?", directionOptions);
  } catch(err) {
    console.log(err);
  }
});

bot.onText(generateRegExp('^\/nexttrain'), (msg, match) => {
  bot.sendMessage(msg.chat.id, `${msg.from.first_name}-kun, you didn't tell me the bus number and bus stop name! \n Ya silly goose ${emojis.smilingColdSweatFace}`);
});

// const trainData = require('./cta-data-files/l-stop-trains');
// console.log(trainData.find(train => train.station_name === '35th/Archer').stop_id);
const trainColorCodes = require('./cta-data-files/train_color_codes');
bot.onText(/^\/nexttrain .+$/i, async(msg, match) => {
  const trainDataInput = match[0].slice(match[0].indexOf(' ')+1);
  const color = trainDataInput.slice(0, trainDataInput.indexOf(' '));
  const trainStation = trainDataInput.slice(trainDataInput.indexOf(' ')+1);
  const fetchTrainStopID = require('./command-methods/fetch-train-stop-id');
  const colorCode = trainColorCodes[color];

  try {
    const trainStopID = await fetchTrainStopID(trainStation);
    console.log(trainStopID);

    const CTA_getTrainTimes_API = `http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${process.env.CTA_TRAIN_TRACKER_API_KEY}&stpid=${trainStopID}&rt=${colorCode}&outputType=JSON`;
    
    try {
      const response = await fetch(CTA_getTrainTimes_API, {
        method: "GET",
        header: {"Content-Type": "application/json"}
      });
      const data = await response.json();
      const trainData = data.ctatt.eta;
      console.log(trainData);
      const trainData1 = 'logic to grab fastest train coming in one direction'; // ie towards loop probably a .find?
      const trainData2 = 'logic to grab fastest train coming in other direction'; // ie towards midway

      bot.sendMessage(msg.chat.id, `
        ${emojis.train} Next ${trainData.rt} trains at ${trainStation} station... 
        \n${trainData1.destNm}: arriving in ${trainData1.prdt - trainData1.arrT} // prdt = prediction time (time of request basically)
        \n${trainData2.destNm}: arriving in ${trainData2.prdt - trainData2.arrT} // arrT = predicted arrival time (format is in YYYY-MM-DD timezone? HH:MM:SS)
      `);
    } catch(err) {
      console.log(err);
      bot.sendMessage(msg.chat.id, `Failed to fetch train arrival data :c`);
    }
  } catch([errMessage, errLog]) {
    console.log(errLog);
    bot.sendMessage(msg.chat.id, errMessage);
  }
});

bot.on('callback_query', async(callbackQuery) => {
  bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);

  if(callbackQuery.message.text === 'What are you querying for?') {
    const spotifyHandler = require('./callback-query-handlers/spotify-handler');
    spotifyHandler(callbackQuery, bot);
  } else if(callbackQuery.message.text === 'Translate to?') {
    const translationHandler = require('./callback-query-handlers/translation-handler');
    translationHandler(callbackQuery, bot);
  } else if(callbackQuery.message.text === "What direction senpai?") {
    const CTA_busHandler = require('./callback-query-handlers/cta-bus-handler');
    CTA_busHandler(callbackQuery, bot);
  } else {
    console.log('callback query handler error');
  }
});