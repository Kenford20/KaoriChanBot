require('dotenv').config();

async function quickstart(
    projectId = process.env.GOOGLE_TRANSLATE_PROJECT_ID
  ) {
    // Imports the Google Cloud client library
    const {Translate} = require('@google-cloud/translate');
  
    // Instantiates a client
    const translate = new Translate({projectId});
  
    // The text to translate
    const text = 'hola';
  
    // The target language
    const target = 'en';
  
    // Translates some text into Russian
    const [translation] = await translate.translate(text, target);
    console.log(`Text: ${text}`);
    console.log(`Translation: ${translation}`);
  }
  
quickstart();