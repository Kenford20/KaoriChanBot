const fetch = require('node-fetch');
const emojis = require('../telegram-emojis');

// given the bus direction, route, and user input for the stop name, it returns the given bus stop object which contains the stopid and the stopname
async function fetchBusStopID(direction, route, stopNameInput) {
    const CTA_getStops_API = `http://www.ctabustracker.com/bustime/api/v2/getstops?key=${process.env.CTA_BUS_TRACKER_API_KEY}&rt=${route}&dir=${direction}&format=json`;
    const busData = await fetch(CTA_getStops_API, {
      method: "GET",
      header: {"Content-Type": "application/json"}
    }).then(response => response.json());
  
    if(busData["bustime-response"].stops) {
      const userStopName = stopNameInput
        .toLowerCase()
        .replace(/\(.*\)/g, '') // removes train station part of a bus stop name, which is wrapped in parentheses ie (brown line) will be removed
        .replace(/(\+|\&)/g, '')
        .replace(/\s{2,}/g, ' ')
        .split(' ')
        .sort();

      const busStop = busData["bustime-response"].stops.find(stop => {
        // API returns inconsistent responses that contain '+' for one direction and '&' for other direction to separate intersection names
        // ex: Archer & Canal for southbound response and Archer + Canal for Northbound response
        // So need to add the replace method to just compare the two street names 
        // Then I do a split and sort to just compare the street names in any order to give user more input flexibility so that it doesnt have to match the CTA stop name exactly
        // ex: '31st street halsted' would match the CTA stop name, 'Halsted & 31st Street', which is essentially what a user may mean without the hassle of typing an ampersand or plus sign
        const CTA_stopName = stop.stpnm
          .toLowerCase()
          .replace(/\(.*\)/g, '') // removes train station part of a bus stop name, which is wrapped in parentheses ie (brown line) will be removed
          .replace(/(\+|\&)/g, '')
          .replace(/\s{2,}/g, ' ')
          .replace(/line station/, '')
          .replace(/\s$/, '') // remove trailing whitespace
          .split(' ')
          .sort();

        if(CTA_stopName.every((street, i) => street === userStopName[i])) {
          console.log('found da stop');
          console.log(CTA_stopName);
          return CTA_stopName;
        }
      });
  
      if(busStop) {
        return busStop;
      } else {
        return {msg: `Could not find data for your stop name`}
      }
    } else {
      return busData["bustime-response"].error[0];
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
        const data = await fetch(CTA_getPredictions_API, {
          method: "GET",
          header: {"Content-Type": "application/json"}
        }).then(response => response.json());
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
  