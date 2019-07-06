# Konnichiwa! I'm Kaori-chan :)
![image of kaori-chan](https://s3.amazonaws.com/kenford/kaori.jpg)

Kaori-chan is a chat bot made for Telegram, which is a popular, cloud based instant messaging application. I've been using Telegram for many years now and I've always loved it. She is one of my side projects that I've decided to work on for my own personal development, practice, and fun of course!

## *Technologies used*
* Kaori-chan is mainly developed using JavaScript. 
* A simple Node Express server is set up to host her logic. 
* I personally have this server deployed to Heroku, which is an awesome, easy to use, cloud platform as a service that provides many application management/hosting services and supports several popular programming languages.
* mathjs library is used to handle calculator operations
* fetch API and axios are used to make http requests

## *APIs*
Kaori-chan utilizes several APIs to help her retrieve the necessary data for her users. 
Big thanks to the following:

* [Openweathermap API](https://openweathermap.org/api) 
* [CTA Bus Tracker API](https://www.transitchicago.com/developers/bustracker/)
* [CTA Train Tracker API](https://www.transitchicago.com/developers/ttdocs/)
* [Google Cloud Translation API](https://cloud.google.com/translate/docs/apis)
* [Google Places API](https://developers.google.com/places/web-service/intro)
* [Google Maps URL](https://developers.google.com/maps/documentation/urls/guide)
* [Microsoft Transliterate API](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/reference/v3-0-transliterate?tabs=curl)
* [Spotify API](https://developer.spotify.com/documentation/web-api/)
* [Currency Exchange API](https://exchangeratesapi.io/)
* [TheCocktailDB API](https://www.thecocktaildb.com/api.php)
* [Meme/Reddit API](https://github.com/R3l3ntl3ss/Meme_Api)

## *What can Kaori-chan do?*

### She can...

* tell you herself of course!  
`/taskete`  
![help command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/taskete2.PNG)

* tag everyone in the group  
`/meena`  
![tag everyone command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/meena.PNG)

* roll a dice for you or give you a random number up to a given limit   
`/roll` or `/roll (number)`  
![roll dice command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/roll.PNG)

* flip a coin:  
`/flip`  
![flip coin command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/flip.PNG)
  
* do math:  
`/calc (mathematical expression)`  
![math calculation command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/calc.PNG)
  
* convert units:  
`/convert (unit) to (unit)`  
![unit conversion command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/convert.PNG)
  
* give you the weather in a city:  
`/weather (city)`  
![weather command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/weather.PNG)

* give you a 5 day weather forecast in a city:  
`/forecast (city)`  
![forecast command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/forecast.PNG)
  
* give you songs, albums, playlists, and artists links from Spotify:  
`/spotify (search query)`  
![spotify command image of query](https://github.com/Kenford20/my-telegram-bot/blob/master/images/spotify.PNG)  
![spotify command image of response](https://github.com/Kenford20/my-telegram-bot/blob/master/images/spotify2.PNG)
  
* translate text to another language:  
`/translate`  
![translate command image of query](https://github.com/Kenford20/my-telegram-bot/blob/master/images/translate.PNG)  
![translate command image of response](https://github.com/Kenford20/my-telegram-bot/blob/master/images/translate2.PNG)

* remind you to do something later at a time you specify:  
`/remindmeto (reminder) @ (hh:mm am/pm)`  
![reminder command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/remindmeto.PNG)

* remind everyone in the group to do something later at a time you specify:  
`/remindmeena (reminder) @ (hh:mm am/pm)`  
![remind everyone command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/remindmeena.PNG)
  
* tell you when the next CTA bus is coming (if you live in Chicago of course!):  
`/nextbus (bus #) (bus stop name)`  
![bus command image of query](https://github.com/Kenford20/my-telegram-bot/blob/master/images/nextbus.PNG)  
![bus command image of response](https://github.com/Kenford20/my-telegram-bot/blob/master/images/nextbus2.PNG)

* tell you when the next CTA trains are coming at a station (if you live in Chicago of course!):  
`/nexttrain (CTA train color)`  
![train command image of query](https://github.com/Kenford20/my-telegram-bot/blob/master/images/nexttrain.PNG)  
![train command image of response](https://github.com/Kenford20/my-telegram-bot/blob/master/images/nexttrain2.PNG)

* convert a money amount from one currency to another (use 3 letter currency codes)  
`/exchange (amount) (base currency) to (target currency)`  
![currency exchange command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/exchange.PNG)

* receive general information about a cocktail drink  
`/alky (cocktail name)`  
![alky command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/alky.PNG)

* post a random meme from meme related subreddits  
`/meme (subreddit - optional)`  
![meme command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/meme.PNG)

* post a random post from a specified subreddit   
`/reddit (subreddit)`  
![reddit command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/reddit.PNG)

* attempt to transliterate english into Japanese, (doesn't quite produce what I expect, can't seem to find an accurate solution for transliteration)  
`/weebify (text)`  
![weebify command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/weebify.PNG)
  
* ban/unban users from using her commands (only accessible by 'admins')  
`/rekt (user)`  
`/rektall`  
`/unrekt (user)`  
`/unrektall`  
  * (list of admins are declared as an environment variable controlled by me)  
  
* display the list of banned users  
`/rektlist`  
![rekt command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/rekt.PNG)  
![rekt command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/rekt2.PNG)  
![rekt command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/rekt3.PNG)  

* provide a Google Maps URL with the start/end point you input  
`/gps (start point) to (destination)`  
![gps command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/gps.PNG)  
![gps command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/gps2.PNG)  

* give you information about a particular place/restaurant/attraction   
`/doko (text)`  
![doko command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/doko.PNG)  
![doko command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/doko2.PNG)  

* give you the current local time at a specified location  
`/timeat (location)`  
![timeat command image](https://github.com/Kenford20/my-telegram-bot/blob/master/images/timeat.PNG)  

* and some weeb stuff ;)

## How does she work?
An instance of a Telegram bot is initialized with the unique token you are given when you create a bot with `BotFather`. This instance then listens to the chat through either *polling* or *Webhooks*, from which you can handle these messages with your server side code. 

Now how does your server get access to the telegram messages? 

The Telegram Bot API acts as an intermediary service that takes updates from the chat and makes them available to your server side code. If your bot needs to communicate back to the users, you continue to use the Bot API to send any messages/prompts/questions to it and it will forward them back to the chat.

This back and forth communication between the telegram application, the Bot API, and your server describes the general flow of data within a telegram chat with its users and bots. 

\*The statements above are solely from my own basic understanding and experience with building Kaori-chan. 
Please feel free to correct me if I am misinformed in anyway.
For a more in depth explanation, please visit [here](https://core.telegram.org/bots "Telegram Bots Page")

## *Telegram Bots*
Download Telegram [here](https://desktop.telegram.org/ "Telegram Download")!

Telegram gives developers a very easy and user friendly way to create your own chat bot. If you're an avid Telegram user or if you're interested at all in creating one yourself, [visit here](https://core.telegram.org/bots "Telegram Bots Page") to get started! You may reference the API [here](https://core.telegram.org/bots/api "Telegram Bots API").

## *Add Kaori-chan*
Bot username: `@qqm-weeb-bot`  
If you'd like you try this bot out yourself, install the Telegram application on your desktop or download it from the app store on mobile. To add a bot to your group chat, click add members and search for the bot's username in the input box. Once Kaori-chan is added to your group, you can type /help to get a list of commands that she offers. You may also just directly message her to start a conversation!  
  
If you have any questions/concerns regarding Kaori-chan or have any suggestions for me, feel free to reach out at kzhou0066@gmail.com.

## *License*
MIT © [Kenny Zhou](https://github.com/Kenford20/my-telegram-bot/blob/master/LICENSE.md)
