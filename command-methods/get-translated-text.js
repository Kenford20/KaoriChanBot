// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate');
  
// Instantiates a client
const translate = new Translate({
  projectId: process.env.GOOGLE_TRANSLATE_PROJECT_ID,
  key: process.env.GOOGLE_TRANSLATE_API_KEY
});

module.exports = async function getTranslatedText(textInput, targetLanguageCode) {
    let [translation] = await translate.translate(textInput, targetLanguageCode);

    return translation;
}