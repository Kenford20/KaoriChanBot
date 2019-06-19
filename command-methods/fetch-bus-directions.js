const fetch = require('node-fetch');

module.exports = async function fetchBusDirections(route, chatId, bot) {
    const CTA_getBusDirections_API = `http://www.ctabustracker.com/bustime/api/v2/getdirections?key=${process.env.CTA_BUS_TRACKER_API_KEY}&rt=${route}&format=json`;
    const busData = await fetch(CTA_getBusDirections_API, {
      method: "GET",
      header: {"Content-Type": "application/json"}
    }).then(response => response.json());
  
    if(busData["bustime-response"].directions) {
      const directions = busData["bustime-response"].directions.map(direction => direction.dir);
      return directions;
    } else {
      console.log(busData["bustime-response"].error[0]);
      bot.sendMessage(chatId, `Gomen senpai.. please enter a valid bus number ${emojis.sadFace2}`);
    }
}