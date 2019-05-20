# Konnichiwa! I'm Kaori-chan :)

Kaori-chan is a chat bot made for Telegram, which is a popular, cloud based instant messaging application. I've been using Telegram for many years now and I've always loved it. She is one of my side projects that I've decided to work on for my own personal development, practice, and fun of course!

## *Telegram Bots*
Download Telegram [here](https://desktop.telegram.org/ "Telegram Download")!

Telegram gives developers a very easy and user friendly way to create your own chat bot. If you're an avid Telegram user or if you're interested at all in creating one yourself, [visit here](https://core.telegram.org/bots "Telegram Bots Page") to get started! You may reference the API [here](https://core.telegram.org/bots/api "Telegram Bots API").

## *Commands*
* `/roll` = rolls a die by default, 
* `/roll (number)` = gives a random number up to the number you input
* `/meena` = tags everyone in the group
* `/flip` = flips a coin
* `/calc` (expression) = calculator
* `/convert` (unit) to (unit) = general units conversion
* `/weather (city)` = gives you the weather in the city you specify
* `/filter` = toggles the profanity filter
* `/spotify (search query)` = allows user to search key words from spotify and returns top result
* `/translate (text)` = translates your text for you into a target language
* `/freshmix` = gives you a fresh scboiz mix
* `/remindmeto (task)` = kaori-chan will remind you to do something at a time you specify
* `/nextbus (bus number) (bus stop name)` = get the arrival time of next bus you specified \n   Numbered streets and named street intersections are separated with a / ex: 35th/Archer
* and some weeb stuff ;)

## *Demos*
Examples and pictures and descriptions of commands

## *Technologies used*
* Kaori-chan is mainly developed using JavaScript. 
* A simple Node Express server is set up to host her logic. 
* I personally have this server deployed to Heroku, which is an awesome, easy to use, cloud platform as a service that provides many application management/hosting services and supports several popular programming languages.
* mathjs library is used to handle calculator operations
* fetch API and axios are used to make http requests

## How does she work?
An instance of a Telegram bot is initialized with the unique token you are given when you create a bot with `BotFather`. This instance then listens to the chat through either *polling* or *Webhooks*, from which you can handle these messages with your server side code. 
Now how does your server get access to the telegram messages? The Telegram Bot API acts as an intermediary service that takes updates from the chat and makes them available to your server side code. If your bot needs to communicate back to the users, you continue to use the Bot API to send any messages/prompts/questions to it and it will forward them back to the chat.
This back and forth communication between the telegram application, the Bot API, and your server describes the general flow of data within a telegram chat with its users and bots. 

The statements above are solely from my own basic understanding and experience with building Kaori-chan. 
Please feel free to correct me if I am misinformed in anyway.
For a more in depth explanation, please visit [here](https://core.telegram.org/bots "Telegram Bots Page")

## *APIs*
Kaori Chan utilizes serveral Apis to help her retrieve the necessary data for her users. 


## *Add Kaori-chan*
Bot username: `@qqm-weeb-bot`
If you'd like you try this bot out yourself, install the Telegram application on your desktop or download it from the app store. To add a bot to your group chat, click add members and search for the bot's username in the input box. Once Kaori-chan is added to your group, you can type /help to get a list of commands that she offers.
