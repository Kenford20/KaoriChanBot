require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const math = require('mathjs');
const axios = require('axios');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.DEVELOPMENT_BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const botTag = '@qqm_development_bot';
const fetch = require('node-fetch');
let profanityMode = false;

// handles command autocompletion through the commands list (adds the bot's tag name to the regexp)
// i.e: /help@bot_tag_name
function generateRegExp(reg) {
  return new RegExp(`${reg}(${botTag})?$`);
}

// # Openweathermap Weather codes and corresponding emojis
// emoji codes here: https://apps.timwhitlock.info/emoji/tables/unicode
const emojis = {
  thunderstorm: '\u{1F4A8}',    // # Code: 200's, thunderstorms
  droplet: '\u{1F4A7}',         // # Code: 300's drizzle
  rain: '\u{02614}',            // # Code: 500's rain
  snowflake: '\u{02744}',       // # Code: 600's snow
  snowman: '\u{026C4}',         // # Code: 600's snowman
  atmosphere: '\u{1F301}',      // # Code: 700's atmosphere (mist, smoke, haze, fog, dust, sand)
  sun: '\u{02600}',             // # Code: 800 clear sky
  sunCloud: '\u{026C5}',        // # Code: 801/802 partly cloudly (11-50%)
  cloud: '\u{02601}',           // # Code: 803/804 cloudy (50-100%)
  fire: '\u{1F525}',            // # Code: 904
  arrowUp: '\u{2B06}',
  arrowDown: '\u{2B07}',
  sadFace: '\u{1F61E}',
  sadFace2: '\u{1F614}',
  cryFace: '\u{1F62D}',
  cryFace2: '\u{1F622}',
  madFace: '\u{1F620}',
  redMadFace: '\u{1F621}',
  smiley: '\u{1F604}',
  blushSmiley: '\u{1F60A}',
  kissFaceHeart: '\u{1F618}',
  peach: '\u{1F351}',
  winkyTongueFace: '\u{1F61C}',
  smilingColdSweatFace: '\u{1F605}',
  blushFace: '\u{1F633}',
  monkeyBlockingEyes: '\u{1F648}',
  blueScreamingFace: '\u{1F631}',
  defaultEmoji: '\u{1F300}'     // # default emojis
};

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
and some weeb stuff
  `);
});

// tags everyone in my group
bot.onText(generateRegExp('^\/meena'), (msg, match) => {
    //const user = msg.from.id;
    //const member = await bot.getChatMember(chatId, user);
    //console.log(member);
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
  bot.sendMessage(msg.chat.id, mixes[Math.floor(Math.random()*(mixes.length-1))]);
});

bot.onText(generateRegExp('^\/spotify'), (msg, match) => {
  bot.sendMessage(msg.chat.id, 'Enter a song query with the command, senpai. Onigaishimasu~');
});

bot.onText(/^\/spotify .+$/i, (msg, match) => {
  console.log(msg.chat.id);
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

let accessToken = "BQA0ro6B7s53s-VT9DjxfsNv-8EtkqzXlO3TaDQSTo8u83z6TI2jfurvb6LrwfZSg-18BuFY0exEZmHsi-c";
function generateSpotifyToken(chatID) {
  axios({
    url: 'https://accounts.spotify.com/api/token',
    method: 'post',
    params: {grant_type: 'client_credentials'},
    headers: {
      'Accept':'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: process.env.SPOTIFY_CLIENT_ID,
      password: process.env.SPOTIFY_CLIENT_SECRET
    }
  }).then(response => {
    console.log(`successfully made a token!! yay`);
    console.log(response.data);
    accessToken = response.data.access_token;
  }).catch(tokenErr => {
    console.log(`axios err: ${tokenErr}`);
    bot.sendMessage(chatID, 'Failed to generate a new access token for some reason, look into it Kenford!!');
  });
}

async function spotifyHandler(callbackQuery) {
  const queryType = callbackQuery.data.slice(0, callbackQuery.data.indexOf(' '));
  const queryInput = callbackQuery.data.slice(callbackQuery.data.indexOf(' ') + 1);
  console.log(queryType);

  //bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
  bot.sendMessage(callbackQuery.message.chat.id, `You queried for: ${queryType}`);
  
  const spotifyAPI = `https://api.spotify.com/v1/search?q=${(queryInput).toLowerCase()}&type=${(queryType).toLowerCase()}&limit=5&access_token=${accessToken}`

  try {
    const response = await fetch(spotifyAPI, {
      method: "GET",
      header: {"Content-Type": "application/json"}
    });
    const spotifyData = await response.json();

    if(spotifyData.error) {
      console.log('theres a spotify error!')
      console.log(spotifyData.error);
      let errResponseMsg;

      // 401 = access token expired, so generate new one. (they expire every hour)
      if(spotifyData.error.status === 401) {
        errResponseMsg = 'Spotify access token expired, generating a new one! Choto mottay and try again in a few seconds! '
        console.log('creating a new token!');
        generateSpotifyToken(callbackQuery.message.chat.id);
      } else {
        errResponseMsg = 'Failed to fetch song data, double check your query!';
      }
      bot.sendMessage(callbackQuery.message.chat.id, errResponseMsg);
    } 
    else {
      switch(queryType.replace(/\s/g, '')) {
        case 'Track': {
          bot.sendMessage(callbackQuery.message.chat.id, `
Here's the track: ${spotifyData.tracks.items[0].external_urls.spotify} 
Track album: ${spotifyData.tracks.items[0].album.name}, which has ${spotifyData.tracks.items[0].album.total_tracks} tracks
Album release: ${spotifyData.tracks.items[0].album.release_date}
If you don't have a spotify account, here's a preview fam dw: ${spotifyData.tracks.items[0].preview_url}
          `);
        } break;
        case 'Album': {
          bot.sendMessage(callbackQuery.message.chat.id, `
Here's the album: ${spotifyData.albums.items[0].external_urls.spotify} 
Album is called ${spotifyData.albums.items[0].name} has ${spotifyData.albums.items[0].total_tracks} tracks.
Album release: ${spotifyData.albums.items[0].release_date}
          `);
        } break;
        case 'Artist': {
          bot.sendMessage(callbackQuery.message.chat.id, `
Here's a profile: ${spotifyData.artists.items[0].external_urls.spotify} 
${spotifyData.artists.items[0].name} has ${spotifyData.artists.items[0].followers.total} followers! 
Artist's genres: ${spotifyData.artists.items[0].genres.join(' ')} 
          `);
        } break;
        case 'Playlist': {
          bot.sendMessage(callbackQuery.message.chat.id, `
Here's the playlist: ${spotifyData.playlists.items[0].external_urls.spotify} 
Playlist is called: ${spotifyData.playlists.items[0].name}
Created by: ${spotifyData.playlists.items[0].owner.display_name}
You can view more of his/her stuff at: ${spotifyData.playlists.items[0].owner.external_urls.spotify}
          `);
        } break;
        default: bot.sendMessage(callbackQuery.message.chat.id, 'Something went wrong, try again oof'); break;
      }
    }
  } catch(fetchErr) {
    console.log(fetchErr);
  }
}

async function translationHandler(callbackQuery) {
  console.log(callbackQuery)
  // Imports the Google Cloud client library
  const {Translate} = require('@google-cloud/translate');
  const projectId = process.env.GOOGLE_TRANSLATE_PROJECT_ID;
  // Instantiates a client
  const translate = new Translate({projectId});

  const targetLanguage = callbackQuery.data.slice(0, callbackQuery.data.indexOf(' '));
  const textInput = callbackQuery.data.slice(callbackQuery.data.indexOf(' ') + 1);

  // Translates some text into Russian
  const [translation] = await translate.translate(textInput, targetLanguage);
  bot.sendMessage(callbackQuery.message.chat.id, `Translated message: ${translation}`);
}

bot.onText(generateRegExp('^\/translate'), (msg, match) => {
  bot.sendMessage(msg.chat.id, `Senpai, you need to give me something to translate silly goose! ${emojis.smilingColdSweatFace}`);
});

bot.onText(/^\/translate .+$/i, (msg, match) => {
  const textInput = match[0].slice(match[0].indexOf(' '));

  const languageOptions = {
    reply_markup: JSON.stringify({ 
      inline_keyboard: [
        [{text:"English", callback_data:'en' + textInput}],
        [{text:"Chinese Simplified", callback_data:'zh-CN' + textInput}],
        [{text:"Chinese Traditional", callback_data:'zh-TW' + textInput}],
        [{text:"Filipino", callback_data:'tl' + textInput}],
        [{text:"French", callback_data:'fr' + textInput}],
        [{text:"German", callback_data:'de' + textInput}],
        [{text:"Greek", callback_data:'el' + textInput}],
        [{text:"Japanese", callback_data:'ja' + textInput}],
        [{text:"Korean", callback_data:'ko' + textInput}],
        [{text:"Latin", callback_data:'la' + textInput}],
        [{text:"Spanish", callback_data:'es' + textInput}]
      ]
    })
  };
  bot.sendMessage(msg.chat.id, "Translate to?", languageOptions);
});

bot.on('callback_query', async(callbackQuery) => {
  bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
  if(callbackQuery.message.text === 'What are you querying for?') {
    spotifyHandler(callbackQuery);
  } else if(callbackQuery.message.text === 'Translate to?') {
    translationHandler(callbackQuery);
  } else {
    console.log('callback query handler error');
  }
});
