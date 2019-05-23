module.exports = async function translationHandler(callbackQuery, bot) {
    // Imports the Google Cloud client library
    const {Translate} = require('@google-cloud/translate');
  
    // Instantiates a client
    const translate = new Translate({
      projectId: process.env.GOOGLE_TRANSLATE_PROJECT_ID,
      key: process.env.GOOGLE_TRANSLATE_API_KEY
    });
  
    // callback argument format: "languageCode|language userInputToTranslate"
    // ex: "es|Spanish translate this sentence please!" 
    const [targetLanguageCode, targetLanguageText, flagEmoji] = callbackQuery.data.slice(0, callbackQuery.data.indexOf(' ')).split('|');
    const textInput = callbackQuery.data.slice(callbackQuery.data.indexOf(' ') + 1);
  
    const [translation] = await translate.translate(textInput, targetLanguageCode);
    bot.sendMessage(callbackQuery.message.chat.id, `${flagEmoji} In ${targetLanguageText}: ${translation}`);
}
  