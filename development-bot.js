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
let bannedUsers = [];
let bannedNames = [];

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
/forecast (city) = gives you a 5 day weather forecast in the city you specify
/filter = toggles the profanity filter
/spotify (search query) = allows user to search key words from spotify and returns top result
/translate (text) = translates your text for you into a target language
/freshmix = gives you a fresh scboiz mix
/remindmeto (task) = kaori-chan will remind you to do something at a time you specify
/remindmeena (task) = kaori-chan will remind everyone in the group to do something at a time you specify
/nextbus (bus number) (bus stop name) = get the arrival time of next bus you specified. Numbered streets and named street intersections are separated with a / ex: 35th/Archer
/nexttrain (CTA train color) = get the arrival time of the next trains at a station
/exchange (amount) (currency) to (currency) = convert a money amount from one currency to another (use 3 letter currency codes)
/alky (cocktail name) = receive general information about a cocktail drink
/meme (subreddit - optional) = posts a random meme from meme related subreddits
/reddit (subreddit) = posts a random post from a specified subreddit
/weebify (text) = transliterates english into japanese
/rekt (user) = bans a user and restricts them from using kaori's commands (master-dono status required)
/rektall = bans all peasant users (master-dono status required)
/unrekt (user) = unbans a user (master-dono status required)
/unrektall = unbans all users in the rektlist (master-dono status required)
/rektlist = displays a list of all the banned bad boiz
and some weeb stuff
  `);
});

// tags everyone in my group
bot.onText(generateRegExp('^\/meena'), (msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    bot.sendMessage(msg.chat.id, process.env.TELEGRAM_GROUP_USERS);
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

// rolls a die
bot.onText(generateRegExp('^\/roll( [0-9]*)?'), (msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    let threshold = match[0].split(' ')[1]; // grabs optional parameter defined by user i.e: /roll 100
    //generateRegExp('^\/roll( [0-9]*)?');
    if(!threshold) {
      threshold = 6; // default die roll
    }
    
    bot.sendMessage(msg.chat.id, `Random Number: ${Math.floor(Math.random() * threshold) + 1}`);
  }  else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

// flips a coin
bot.onText(generateRegExp('^\/flip'), (msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    let coin = Math.round(Math.random());
    bot.sendMessage(msg.chat.id, coin === 0 ? `Heads ${emojis.smiley}` : `Tails ${emojis.peach}`);
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/(calc|convert)'), (msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    let input = /calc/.test(match[0]) ? 'expression' : 'conversion';
    bot.sendMessage(msg.chat.id, `Enter an ${input} with the command! Onigaishimasu~`);
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

// uses mathjs library to do mathematical calculations and unit conversions
bot.onText(/^\/(calc|convert) .+$/, async(msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    try {
      let result = await math.eval(match[0].slice(match[0].indexOf(' ')));
      bot.sendMessage(msg.chat.id, `Result: ${result}`);
    } catch(err) {
      console.log(err);
      bot.sendMessage(msg.chat.id, `Double check your expression ya konoyero!`);
    }
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/weather'), (msg, match) => {
  bot.sendMessage(msg.chat.id, 'Oni..g-gai, enter a city name with the command, senpai~');
});

// makes a post request to openweathermap API and sends the user the weather of a specified city
bot.onText(/^\/weather .+$/i, async(msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    const city = match[0].slice(match[0].indexOf(' ')).replace(/\s/g, '+');
    const weatherAPI = `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${process.env.WEATHER_API_KEY}&units=imperial`; // units=imperial converts temperature to Fahrenheit
    
    try {
      const weatherData = await fetch(weatherAPI, {
      method: "POST",
      header: { "Content-Type": "application/json" }
    }).then(response => response.json());
    console.log(weatherData)
    const getWeatherEmoji = require('./command-methods/determine-weather-emoji');
    const weatherCode = weatherData.weather[0].id;
    const temperatureEmoji = weatherData.main.temp > 50 ? emojis.fire : emojis.snowman;
    let weatherEmoji = getWeatherEmoji(weatherCode);
    
    bot.sendMessage(msg.chat.id, `
    Current weather in ${weatherData.name},  (${weatherData.sys.country}): \n
    ${temperatureEmoji} Temp is ${weatherData.main.temp}${String.fromCharCode(176)}F and ${emojis.droplet} humidity is ${weatherData.main.humidity}%
      ${emojis.arrowUp} ${weatherData.main.temp_max}${String.fromCharCode(176)}F high and ${emojis.arrowDown} ${weatherData.main.temp_min}${String.fromCharCode(176)}F low
      ${weatherEmoji} Forecast is ${weatherData.weather[0].main} and ${weatherData.weather[0].description}
      `);
    } catch(err) {
      console.log(err);
      bot.sendMessage(msg.chat.id, 'Go..m-men n-nasai.. double check the city name ya bakayero!');
    }
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
  });
  
bot.onText(generateRegExp('^\/forecast'), (msg, match) => {
  bot.sendMessage(msg.chat.id, 'Oni..g-gai, enter a city name with the command, senpai~');
});

bot.onText(/^\/forecast .+$/i, async(msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    const city = match[0].slice(match[0].indexOf(' ')).replace(/\s/g, '+');
    const weatherAPI = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${process.env.WEATHER_API_KEY}&units=imperial`; // units=imperial converts temperature to Fahrenheit
    
    try {
      const weather = await fetch(weatherAPI, {
        method: "POST",
        header: { "Content-Type": "application/json" }
      }).then(response => response.json());
      //console.log(weather)
      const days = ['Sun', 'M', 'T', 'W', 'Th', 'F', 'Sat'];
      let currentDay = new Date().getDay();
      const getWeatherEmoji = require('./command-methods/determine-weather-emoji');
      
      let forecastOutput = ``;
      for(let i = 0; i < weather.list.length; i += 8) { // += 8 because the daily weather data throughout the 5 day forecast is pulled every 3 hours 
        const weatherCode = weather.list[i].weather[0].id;
        const weatherEmoji = getWeatherEmoji(weatherCode);
        const temperatureEmoji = weather.list[i].main.temp > 50 ? emojis.fire : emojis.snowman;
      
      forecastOutput += `
${days[(currentDay) % 7]}: ${temperatureEmoji} Temp is ${weather.list[i].main.temp}${String.fromCharCode(176)}F and ${emojis.droplet} humidity is ${weather.list[i].main.humidity}%
${emojis.arrowUp} ${weather.list[i].main.temp_max}${String.fromCharCode(176)}F high and ${emojis.arrowDown} ${weather.list[i].main.temp_min}${String.fromCharCode(176)}F low
${weatherEmoji} Forecast is ${weather.list[i].weather[0].main} and ${weather.list[i].weather[0].description}
      `;
      currentDay++;
    }
    
      bot.sendMessage(msg.chat.id, `
      5 day forecast in ${weather.city.name},  (${weather.city.country}):
      ${forecastOutput}
      `);
    } catch(err) {
      console.log(err);
      bot.sendMessage(msg.chat.id, 'Go..m-men n-nasai.. double check the city name ya bakayero!');
    }
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/filter'), (msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    profanityMode = !profanityMode;
    console.log(`profanity mode is: ${profanityMode}`);
    bot.sendMessage(msg.chat.id, profanityMode ? `Kaori chan filter enabled! Arigato senpai ${emojis.kissFaceHeart}` : `Kaori chan filter disabled. Watashi wa kanashi ${emojis.sadFace2}`);
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
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

bot.onText(/\b(tits?|titties|deeks?|dicks?|boobs?|boobies|breasts?|cocks?|cawks?|clit(oris)?|pussy|pussies|vaginas?|nips?|nipples?|penis(es)?|ass(es)?|booty|butts?|nuts?|balls|testicles|69)\b/i, async(msg, match) => {
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


bot.onText(/\b(fags?|faggots?|assholes?|fuck|fuckers?|bitch(es)?|shits?|pricks?|cunts?|sluts?)\b/i, async(msg, match) => {
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
  if(!bannedUsers.includes(msg.from.username)) {
    const mixes = [
      // 'https://soundcloud.com/wayneechu/02-neptune-melodic-future-bass-mix-1/s-XAHJb', 
      // 'https://soundcloud.com/wayneechu/01-jupiter-feels-trap-mix',
      // 'https://soundcloud.com/wayneechu/fall-in-smoke-master',
      // 'https://soundcloud.com/wayneechu/seven-lions-sojourn-worlds-apart-wayne-edit',
      'https://soundcloud.com/wayneechu/gravity/s-TbJYV'
    ];
    
    bot.sendMessage(msg.chat.id, mixes[Math.floor(Math.random()*(mixes.length))]);
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/spotify'), (msg, match) => {
  bot.sendMessage(msg.chat.id, 'Enter a song query with the command, senpai. Onigaishimasu~');
});

bot.onText(/^\/spotify .+$/i, (msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    const songQuery = match[0].slice(match[0].indexOf(' ')+1).replace(/\s/g, '+');
    console.log(songQuery);
    
    const queryOptions = {
      reply_markup: JSON.stringify({ 
        inline_keyboard: [
          [{text:"Track", callback_data:'Track ' + songQuery}], // wrap options in brackets if you want them to be on their own line, exclude if you want options to be inline (side by side)
          [{text:"Album", callback_data:'Album ' + songQuery}],
          [{text:"Artist", callback_data:'Artist ' + songQuery}],
          [{text:"Playlist", callback_data:'Playlist ' + songQuery}]
        ]
      })
    };
    bot.sendMessage(msg.chat.id, "What are you querying for?", queryOptions);
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/translate'), (msg, match) => {
  bot.sendMessage(msg.chat.id, `Senpai, you need to give me something to translate silly goose! ${emojis.smilingColdSweatFace}`);
});

bot.onText(/^\/translate .+$/i, (msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    const textInput = match[0].slice(match[0].indexOf(' '));
    // the callback_data property for the inline keyboard options can only hold 64 bytes, so the user input is limited to a certain amount of characters
    
    const languageOptions = {
      reply_markup: JSON.stringify({ 
        inline_keyboard: [
          [{text:"English", callback_data:`en|English|${emojis.americanFlag}` + textInput}],
          [{text:"Chinese Simplified", callback_data:`zh-CN|Chinese(Simp)|${emojis.chineseFlag}` + textInput}],
          [{text:"Chinese Traditional", callback_data:`zh-TW|Chinese(Trad)|${emojis.chineseFlag}` + textInput}],
          [{text:"Filipino", callback_data:`tl|Filipino|${emojis.filipinoFlag}` + textInput}],
          [{text:"French", callback_data:`fr|French|${emojis.frenchFlag}` + textInput}],
          [{text:"German", callback_data:`de|German|${emojis.germanFlag}` + textInput}],
          [{text:"Greek", callback_data:`el|Greek|${emojis.greekFlag}` + textInput}],
          [{text:"Japanese", callback_data:`ja|Japanese|${emojis.japaneseFlag}` + textInput}],
          [{text:"Korean", callback_data:`ko|Korean|${emojis.koreanFlag}` + textInput}],
          [{text:"Latin", callback_data:`la|Latin|${emojis.bolivianFlag}` + textInput}],
          [{text:"Spanish", callback_data:`es|Spanish|${emojis.spanishFlag}` + textInput}],
          [{text:"Vietnamese", callback_data:`vi|Vietnamese|${emojis.vietnameseFlag}` + textInput}],
          [{text:"Hawaiian", callback_data:`haw|Hawaiian|${emojis.americanFlag}` + textInput}],
          [{text:"Italian", callback_data:`it|Italian|${emojis.italianFlag}` + textInput}],
          [{text:"Russian", callback_data:`ru|Russian|${emojis.russianFlag}` + textInput}],
        ]
      })
    };
    bot.sendMessage(msg.chat.id, "Translate to?", languageOptions);
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/remindmeto'), (msg, match) => {
  bot.sendMessage(msg.chat.id, `Nani is your reminder, ${msg.from.first_name}-kun? ${emojis.smilingColdSweatFace}`);
});

bot.onText(generateRegExp('^\/remindmeena'), (msg, match) => {
  bot.sendMessage(msg.chat.id, `Nani is your reminder, ${msg.from.first_name}-kun? ${emojis.smilingColdSweatFace}`);
});

bot.onText(/(^\/remindmeto .+$)|(^\/remindmeena .+$)/i, (msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    const command = match[0].slice(0, match[0].indexOf(' '));
    const reminder = match[0].slice(match[0].indexOf(' ')+1);
    const [task, time] = reminder.split(' @ ');
    
    if(/\d?\d:\d\d (AM|PM)/i.test(time)) {
      const [reminderHours, mins_am_pm] = time.split(':');
      const [reminderMinutes, am_pm] = mins_am_pm.split(' '); 
      
      if(reminderHours > 0 && reminderHours < 13 && reminderMinutes >= 0 && reminderMinutes < 60) {
        const findSecondsToElapse = require('./command-methods/find-seconds-to-elapse');
        const remindee = command === '/remindmeto' ? 'you' : 'meena';
        bot.sendMessage(msg.chat.id, `Wakatta @${msg.from.username}, I will remind ${remindee} to ${task} at ${time}. \nShinpaishinaide! ${emojis.thumbsUp}`);
        
        let timeUntilReminder = findSecondsToElapse(reminderHours, reminderMinutes, am_pm) * 1000;
        console.log(`reminding in ${timeUntilReminder} milliseconds!`);
        setTimeout(() => {
          bot.sendMessage(msg.chat.id, `
          \n${remindee === 'you' ? `@${msg.from.username}-senpai` : 'Meena'}, it is time to ${task}!! 
          \nHaiyaku ${remindee === 'you' ? 'fam' : 'boiZ'} ${emojis.blueScreamingFace}
          ${remindee === 'meena' ? `\n${process.env.TELEGRAM_GROUP_USERS}` : ''}
        `);
        }, timeUntilReminder);
      } else {
        bot.sendMessage(msg.chat.id, `Senpai, make sure to enter a valid time ya bakayero! ${emojis.smilingColdSweatFace} \n(AM/PM format) pls`);
      }
    } else {
      bot.sendMessage(msg.chat.id, `Senpai, you didn't specify am/pm or you're missing a colon ya konoyero! ${emojis.smilingColdSweatFace}`);
    }
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
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
  if(!bannedUsers.includes(msg.from.username)) {
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
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/nexttrain'), (msg, match) => {
  bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama, you didn't tell train line color, ya silly goose ${emojis.smilingColdSweatFace}`);
});

const trainColorCodes = require('./cta-data-files/train_color_codes');
bot.onText(/^\/nexttrain .+$/i, async(msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    const color = match[0].slice(match[0].indexOf(' ')+1);
    const fetchTrainStations = require('./command-methods/fetch-train-stations');
    const colorCode = trainColorCodes[color];
    
    const trainColorEmojis = {
      "red": emojis.redCircle,
      "blue": emojis.blueCircle,
      "brown": emojis.brownCircle,
      "green": emojis.greenCircle,
      "orange": emojis.orangeCircle,
      "purple": emojis.purpleCircle,
      "pink": emojis.pinkCherryBlossom,
      "yellow": emojis.yellowCircle
    }
    
    await fetchTrainStations(colorCode)
    .then(trainStations => {
      const trainStopNames = trainStations.map(([stationName, stationID]) => {
        return [{text:`${stationName}`, callback_data:`${color}|${stationName}|${stationID}|${trainColorEmojis[color]}`}];
      });
      
      const options = {
        reply_markup: JSON.stringify({ 
          inline_keyboard: trainStopNames
        })
      };
      bot.sendMessage(msg.chat.id, "Select a train station!", options);
    })
    .catch(([errMessage, errLog]) => {
      console.log(errLog);
      bot.sendMessage(msg.chat.id, errMessage);
    });
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/exchange'), (msg, match) => {
  bot.sendMessage(msg.chat.id, `${msg.from.first_name}-san, you need to tell me the currencies to exchange, kono baaaaa-ka ${emojis.smilingColdSweatFace}`);
});

// /exchange 25 USD to CAD
bot.onText(/^\/exchange .+$/i, async(msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    let [amount, baseCurrency, to, targetCurrency] = match[0].slice(match[0].indexOf(' ')+1).split(' ');
    baseCurrency = baseCurrency.toUpperCase();
    targetCurrency = targetCurrency.toUpperCase()
    const currencyAPI = `https://api.exchangeratesapi.io/latest?base=${baseCurrency}&symbols=${targetCurrency}`;
    
    const currencyData = await fetch(currencyAPI, {
      method: 'GET',
      header: {"Content-Type": "application/json"}
    }).then(response => response.json());
    console.log(currencyData);
    bot.sendMessage(msg.chat.id, `
      As of ${currencyData.date}, 
      \nThe exchange rate from ${baseCurrency} to ${targetCurrency} is ${currencyData.rates[targetCurrency]}
      \n${amount} ${baseCurrency} = ${(amount * currencyData.rates[targetCurrency]).toFixed(2)} ${targetCurrency}
    `);
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/alky'), (msg, match) => {
  bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama, you dunk? You need to tell me the alky name, kono baaaaa-ka ${emojis.smilingColdSweatFace}`);
});

bot.onText(/^\/alky .+$/i, async(msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    const alky = match[0].slice(match[0].indexOf(' ')+1).replace(/\s/g, '+');
    const alkyAPI = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${alky}`;
    const alkyEmojis = ['sake', 'wineBottle', 'wineGlass', 'tallWineGlasses', 'cocktailGlass', 'tropicalGlass', 'beerMug', 'tumblerGlass'];

    const fetchAlky = require('./command-methods/fetch-alky-data');
    await fetchAlky(alkyAPI)
    .then(([alkyData, alkyIngredients]) => {
      console.log(alkyData);
      bot.sendMessage(msg.chat.id, `
  ${emojis[alkyEmojis[Math.floor(Math.random()*alkyEmojis.length)]]} Drink: ${alkyData.strDrink}\n
Category: ${alkyData.strCategory}
Glass: ${alkyData.strGlass}
Ingredients: ${alkyIngredients.replace(/, ,/, '')}\n
How to make dis: ${alkyData.strInstructions}
      ${alkyData.strDrinkThumb}
      `);
    })
    .catch(err => bot.sendMessage(msg.chat.id, `${err} ${emojis.smilingColdSweatFace}`));
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(/^\/(meme|reddit) ?.*$/i, async(msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    const command = match[0].indexOf(' ') > 0 ? match[0].slice(0, match[0].indexOf(' ')+1).replace(/\s/, '') : match[0];
    const subreddit = match[0].indexOf(' ') > 0 ? match[0].slice(match[0].indexOf(' ')+1).replace(/\s/g, '') : 'dank';
    const randomMemeAPI = command === '/meme'
    ? `https://meme-api.herokuapp.com/gimme/${subreddit}memes`
    : `https://meme-api.herokuapp.com/gimme/${subreddit}`;
    
  console.log(randomMemeAPI)

  if(command.toLowerCase() === '/reddit' && subreddit === 'dank') {
    bot.sendMessage(msg.chat.id, `Specify the subreddit you want to pull from, senpai! ${emojis.smilingColdSweatFace}`);
    return;
  }
  
  if(command.toLowerCase() === '/reddit' 
      && msg.chat.id != process.env.NSFW_GROUP_CHAT_ID 
      && subreddit.match(/(webcam|blondes?|redheads?|gingers?|brunettes?|ebony|kinky?|veins|curv(es?|y)|stroking|fap(ping)?|daddy|wank|jiggle|pee(ing)?|piss(ing)?|strapons?|gonewild|wet|moist|erect(ions?)?|jerking|dirty|naughty|horny|lewd|perky|saggy|voluptuous|juicy|nsfw|bdsm|girls?|sexy?|throat|missionary|doggy|amateur|pov|fetish(es)?|cuck(olds?)?|cowgirl|cunnilingus|intercourse|penetrat(es?|ions?)|whores?|sluts?|nudes?|naked|strip(per)?s?|anal|porno?(graphy)?|org(y|ies)|bukkakes?|gangbangs?|(3|three)somes?|jobs?|babes?|creampies?|rimming|scissoring|jizz|orgasm|cum|squirts?|(d|g|m)ilfs?|cougars?|hentai|incests?|hubs?|tubes?|lesbians?|bondage|brazzers?|dildos?|masturbat(es?|ions?)|tit(s|ties)?|deeks?|(th|d)icks?|boob(s|ies)?|bbw|breasts?|bras?|bikinis?|cocks?|cawks?|(finger|fist)ing|vulva|pussy|pussies|vaginas?|clit(oris)?|underwears?|lingeries?|bras?|pant(y|ies)|busty?|nips?|nipples?|areolas?|pubes?|pen(is(es)?|ile)|boner|ass(es)?|cheeks?|boot(y|ies)|butts?|nuts?|balls|testicles|69)/i)
      && !subreddit.match(/(foodporn|earthporn)/) 
    ) {
      bot.sendMessage(msg.chat.id, `${msg.from.first_name} s-sen..pai ${emojis.blushFace}, k-kono.. HENTAI!! This is only for the NSFW group!`);
    } else {
      try {
        const memeData = await fetch(randomMemeAPI, {
          method: 'GET',
          header: 'application/json'
        }).then(response => response.json());
        
        if(memeData.status_code >= 400) {
          const errorMsg = command.toLowerCase() === '/reddit'
          ? `Gomenasai... that subreddit doesn't exist ya konoyero! ${emojis.smilingColdSweatFace}`
          : `${emojis.sadFace2} Gomen senpai... couldn't find memes for that subreddit!`;
          
          bot.sendMessage(msg.chat.id, errorMsg);
        } else {
          bot.sendMessage(msg.chat.id, `${memeData.title}: \n${memeData.url}`);
        }
      } catch(err) {
        console.log(err);
        bot.sendMessage(msg.chat.id, `Gomen.. couldn't fetch dank m3m3z! Try again in a bit ${emojis.sadFace}`);
      }
    }
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/weebify'), (msg, match) => {
  bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama, you need to tell me what to translate, kono baaaaa-ka ${emojis.smilingColdSweatFace}`);
});

bot.onText(/^\/weebify .+$/i, async(msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    const inputText = match[0].slice(match[0].indexOf(' ')+1);
    const weebifyAPI = `https://api.cognitive.microsofttranslator.com/transliterate?api-version=3.0&language=ja&fromScript=Jpan&toScript=Latn`;
    const getTranslatedText = require('./command-methods/get-translated-text');
    const japaneseText = await getTranslatedText(inputText, 'ja');
    
    try {
      const response = await fetch(weebifyAPI, {
        method: 'POST',
        headers: { 
          'Ocp-Apim-Subscription-Key': process.env.MICROSOFT_TRANSLATE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{'text': japaneseText}]),
        json: true
      }).then(data => data.json());
      console.log(response);
      bot.sendMessage(msg.chat.id, `In weeb: ${response[0].text}`);
    } catch(err) {
      console.log(err);
      bot.sendMessage(msg.chat.id, `Go..m-men n-nasai.. I failed to translate ${emojis.sadFace}`);
    }
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/rekt'), (msg, match) => {
  if(process.env.QQM_MASTER_DONOS.includes(msg.from.username)) {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-dono, who would you like to ban? ${emojis.blushSmiley}`);
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-kun.. only a Master-dono can ban users! ${emojis.sadFace}`);
  } 
});

const QQM_users = process.env.QQM_MEMBER_NAMES.split(' ');
const QQM_usernames = process.env.TELEGRAM_GROUP_USERS.split(' ');
const namesToUsernames = {};
for(let i = 0; i < QQM_users.length; i++) {
  namesToUsernames[QQM_users[i]] = QQM_usernames[i].replace(/@/, '');
}
bot.onText(/^\/rekt .+$/i, async(msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    if(process.env.QQM_MASTER_DONOS.includes(msg.from.username)) {
      let userToBeBanned = match[0].slice(match[0].indexOf(' ')+1)
      userToBeBanned = userToBeBanned[0].toUpperCase() + userToBeBanned.slice(1).toLowerCase();

      if(userToBeBanned === 'Kenny') {
        bot.sendMessage(msg.chat.id, `You can't rekt watashi no Kenford-sama! He is the master-dono of all masters! ${emojis.nerdFace}`);
        return;
      } else if(msg.from.username !== 'Kenford' && process.env.QQM_MASTER_DONOS.includes(namesToUsernames[userToBeBanned])) {
        bot.sendMessage(msg.chat.id, `You can't rekt another master-dono, ya konoyero ${emojis.smilingColdSweatFace}`);
        return;
      }

      if(QQM_users.includes(userToBeBanned)) {
        if(!bannedNames.includes(userToBeBanned)) {
          bannedUsers.push(namesToUsernames[userToBeBanned]);
          bannedNames.push(userToBeBanned);
          bot.sendMessage(msg.chat.id, `${emojis.faceWithHandOverMouth} Gomen ${userToBeBanned}-senpai, no moar kaori abusing! \nUse command /rektlist to see rekt users.`);
        } else {
          bot.sendMessage(msg.chat.id, `This user is already rekt, baaaka! ${emojis.smilingColdSweatFace}`);
        }
      } else {
        bot.sendMessage(msg.chat.id, `This user is not in this group silly! ${emojis.smilingColdSweatFace}`);
      }
    } else {
      bot.sendMessage(msg.chat.id, `${msg.from.first_name}-kun.. only a Master-dono can ban users! ${emojis.sadFace}`);
    } 
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(/^\/unrekt .+$/i, async(msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    if(process.env.QQM_MASTER_DONOS.includes(msg.from.username)) {
      let userToBeUnbanned = match[0].slice(match[0].indexOf(' ')+1);
      userToBeUnbanned = userToBeUnbanned[0].toUpperCase() + userToBeUnbanned.slice(1).toLowerCase();
      if(bannedNames.includes(userToBeUnbanned)) {
        bannedUsers.splice(bannedUsers.indexOf(namesToUsernames[userToBeUnbanned]), 1);
        bannedNames.splice(bannedNames.indexOf(userToBeUnbanned));
        bot.sendMessage(msg.chat.id, `Alright ${userToBeUnbanned}-senpai, take it easy on me now, okay? ${emojis.winkyTongueFace}. \nUse command /rektlist to see rekt users.`);
      } else {
        bot.sendMessage(msg.chat.id, `This user isn't even rekt, baaaka! ${emojis.smilingColdSweatFace}`);
      }
    } else {
      bot.sendMessage(msg.chat.id, `${msg.from.first_name}-san.. only a Master-dono can unban users! ${emojis.sadFace}`);
    } 
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/rektall'), (msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    if(process.env.QQM_MASTER_DONOS.includes(msg.from.username)) {
      QQM_users.map(user => {
        if(!process.env.QQM_MASTER_DONOS.includes(namesToUsernames[user])) {
          bannedNames.push(user);
          bannedUsers.push(namesToUsernames[user]);
        }
      });
      bot.sendMessage(msg.chat.id, `Rekting all the senpais, g-gom..enas..s-sai ${emojis.sadFace2}`);
    }
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/unrektall'), (msg, match) => {
  if(!bannedUsers.includes(msg.from.username)) {
    if(process.env.QQM_MASTER_DONOS.includes(msg.from.username)) {
      bannedNames = [];
      bannedUsers = [];
      bot.sendMessage(msg.chat.id, `Meena-san.. you're free, so be good now, okay? ${emojis.blushSmiley}`);
    }
  } else {
    bot.sendMessage(msg.chat.id, `${msg.from.first_name}-sama... you banned fam! ${emojis.redMadFace} \nSubmit to the QQM Master-donos for mercy...`);
  }
});

bot.onText(generateRegExp('^\/rektlist'), (msg, match) => {
  if(bannedUsers.length === 0) {
    bot.sendMessage(msg.chat.id, `No one is rekt, YEY! ${emojis.blushSmiley}`);
  } else {
    const banList = bannedNames.map(user => `\n${user}-senpai`);
    console.log(bannedUsers);
    bot.sendMessage(msg.chat.id, `${emojis.devil} Here are the warui boiz: ${banList}`);
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
  } else if(callbackQuery.message.text === "Select a train station!") {
    const CTA_trainHandler = require('./callback-query-handlers/cta-train-handler');
    CTA_trainHandler(callbackQuery, bot);
  } else {
    console.log('callback query handler error');
  }
});