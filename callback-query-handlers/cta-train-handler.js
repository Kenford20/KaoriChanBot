const fetch = require('node-fetch');
const emojis = require('../telegram-emojis');
const officialTrainColorCodes = require('../cta-data-files/official_train_color_codes');

function calculateTrainArrivalTime(trainData) {
    if(trainData.length > 0) {
      const currentTime = trainData[0].prdt.split('T')[1]; // prdt = predictionTime or time of request (format: YYYY-MM-DD T HH:MM:SS)
      const predictedArrivalTime = trainData[0].arrT.split('T')[1]; // arrT = predicted arrivalTime (format: YYYY-MM-DD T HH:MM:SS)

      // subtract the minutes between the arrival time and the current time
      let minutesUntilArrival = predictedArrivalTime.slice(3, 5) - currentTime.slice(3, 5);

      // time borrow
      if(minutesUntilArrival < 0) {
          minutesUntilArrival += 60;
      }

      return minutesUntilArrival;
    } 
    else {
      console.log('Failed to get train arrival times atleast one of the directions, prdt/arrT undefined');
    }
}

module.exports = async function CTA_busHandler(callbackQuery, bot) {
    const chatId = callbackQuery.message.chat.id;
    const [color, stationName, stationID, trainColorEmoji] = callbackQuery.data.split('|');
    const colorCode = officialTrainColorCodes[color];
    const colorName = color[0].toUpperCase() + color.slice(1).toLowerCase(); // camel case the color just for output purposes
    const CTA_getTrainTimes_API = `http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${process.env.CTA_TRAIN_TRACKER_API_KEY}&mapid=${stationID}&rt=${colorCode}&outputType=JSON`;

    try {
        const response = await fetch(CTA_getTrainTimes_API, {
          method: "GET",
          header: {"Content-Type": "application/json"}
        });
        const data = await response.json();
        const trainArrivals = data.ctatt.eta;

        if(data.ctatt.eta) {
            // trDr = train direction, 1 = one direction, 5 = opposite
            const trainData1 = trainArrivals.filter(arrival => arrival.trDr == 1);
            const minutesUntilArrival1 = calculateTrainArrivalTime(trainData1);
            
            const trainData2 = trainArrivals.filter(arrival => arrival.trDr == 5);
            const minutesUntilArrival2 = calculateTrainArrivalTime(trainData2);


            bot.sendMessage(chatId, `
              ${trainColorEmoji} Next ${colorName} Line trains at ${stationName} station... 
              ${
                trainData1.length > 0 
                ? `\n${emojis.train} ${trainData1[0].destNm.toUpperCase()}: arriving in ${minutesUntilArrival1} minutes!`
                : `\n${emojis.train} No data right now for this direction`
              }
              ${
                trainData2.length > 0 
                ? `\n${emojis.train} ${trainData2[0].destNm.toUpperCase()}: arriving in ${minutesUntilArrival2} minutes!`
                : `\n${emojis.train} No data right now for this direction`
              }
            `);
        } else {
            console.log(`error code from train command: ${data.ctatt.errCd}`);
            console.log(`error message from train command: ${data.ctatt.errNm}`);
            // error code 0 is an OK, which returns an empty array, probably for successful requests for train routes that are stopped for the night
            const errorMessage = data.ctatt.errCd == 0 
              ? `${colorName} line trains at ${stationName} are currently not in service, \nPerhaps you should call an Uber senpai! ${emojis.taxi}`
              : data.ctatt.errNm;

            bot.sendMessage(chatId, errorMessage);
        }
    } catch(err) {
      console.log(err);
      bot.sendMessage(chatId, `Failed to fetch train arrival data :c`);
    }
}