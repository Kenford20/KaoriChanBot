module.exports = async function translationHandler(callbackQuery, bot) {
    // callback argument format: "languageCode|language userInputToTranslate"
    // ex: "es|Spanish translate this sentence please!" 
    const [targetLanguageCode, targetLanguageText, flagEmoji] = callbackQuery.data.slice(0, callbackQuery.data.indexOf(' ')).split('|');
    const textInput = callbackQuery.data.slice(callbackQuery.data.indexOf(' ') + 1);
    const getTranslatedText = require('../command-methods/get-translated-text');
    const translation = await getTranslatedText(textInput, targetLanguageCode);


    bot.sendMessage(callbackQuery.message.chat.id, `${flagEmoji} In ${targetLanguageText}: ${translation}`);
}
  