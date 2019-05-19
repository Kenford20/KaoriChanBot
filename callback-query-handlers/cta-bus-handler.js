const fetch = require('node-fetch');
const emojis = require('../telegram-emojis');

// given the bus direction, route, and user input for the stop name, it returns the given bus stop object which contains the stopid and the stopname
async function fetchBusStopID(direction, route, stopNameInput) {
    const CTA_getStops_API = `http://www.ctabustracker.com/bustime/api/v2/getstops?key=${process.env.CTA_BUS_TRACKER_API_KEY}&rt=${route}&dir=${direction}&format=json`;
    const response = await fetch(CTA_getStops_API, {
      method: "GET",
      header: {"Content-Type": "application/json"}
    });
    const data = await response.json();
  
    if(data["bustime-response"].stops) {
      const busStop = data["bustime-response"].stops.find(stop => {
        // API returns inconsistent responses that contain '+' for one direction and '&' for other direction to separate intersection names
        // ex: Archer & Canal for southbound response and Archer + Canal for Northbound response
        // So need to add the replace method to just compare the two street names 
        return stop.stpnm.toLowerCase().replace(/(\s|\+|\&)/g, '') === stopNameInput.toLowerCase().replace(/(\s|\+|\&)/g, '');
      });
  
      if(busStop) {
        return busStop;
      } else {
        return {msg: `Could not find data for your stop name`}
      }
    } else {
      return data["bustime-response"].error[0];
    }
  }
  
  module.exports = async function CTA_busHandler(callbackQuery, bot) {
    const chatId = callbackQuery.message.chat.id;
    const [direction, route, stopName] = callbackQuery.data.split('|');
    const busStopResponse = await fetchBusStopID(direction, route, stopName);
    console.log(busStopResponse);
  
    // stpid = the bus stop id and this property exists if the user entered a valid bus stop name
    // otherwise busStopResponse is an error with a property of 'msg'
    if(busStopResponse.stpid) {
      const CTA_getPredictions_API = `http://www.ctabustracker.com/bustime/api/v2/getpredictions?key=${process.env.CTA_BUS_TRACKER_API_KEY}&rt=${route}&stpid=${busStopResponse.stpid}&format=json`;
      try {
        const response = await fetch(CTA_getPredictions_API, {
          method: "GET",
          header: {"Content-Type": "application/json"}
        });
        const data = await response.json();
        const CTA_data = data["bustime-response"];
  
        // prd = prediction and this property exists if the CTA route currently has an active schedule
        // otherwise the property is an error
        if(CTA_data.prd) {      
          console.log(CTA_data.prd.filter(prediction => prediction.rtdir === direction).map(requestedPrediction => requestedPrediction.prdctdn));
          bot.sendMessage(
            chatId, 
            `${emojis.bus} Next ${route} bus going ${direction} at ${stopName.toUpperCase()} is arriving in...  ${CTA_data.prd.find(prediction => prediction.rtdir === direction).prdctdn} minutes!` // prdctdn = prediction countdown which is the minutes until the bus arrives
          );
        } else {
          const errorMessage = CTA_data.error[0].msg === "No service scheduled" || CTA_data.error[0].msg === "No arrival times"
            ? `Gomen senpai.. there is currently no service scheduled for the route you selected. \nBetter call an Uber bruh! ${emojis.taxi}`
            : CTA_data.error[0].msg === 'No data found for parameters' 
            ? `Gomen senpai.. there is no data found for your inputs! Spell check it fam ${emojis.sadFace}`
            : `Something else went wrong, Kenford check the logs!! ${emojis.madFace}`;
  
            console.log(errorMessage);
            bot.sendMessage(chatId, errorMessage);
        }
      }
      catch(err) { // runs for failed GET requests
        console.log(err);
        bot.sendMessage(chatId, `Gomenasai.. something went wrong ${emojis.sadFace}, double check CTA servers?`);
      }
    } else {
      bot.sendMessage(chatId, `Gomen senpai.. ${busStopResponse.msg}. \nSpell check your inputs onegaishimasu! ${emojis.sadFace2}`);
    }
}
  