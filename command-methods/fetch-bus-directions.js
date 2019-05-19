const fetch = require('node-fetch');

module.exports = async function fetchBusDirections(route, chatId) {
    const CTA_getDirections_API = `http://www.ctabustracker.com/bustime/api/v2/getdirections?key=${process.env.CTA_BUS_TRACKER_API_KEY}&rt=${route}&format=json`;
    const response = await fetch(CTA_getDirections_API, {
      method: "GET",
      header: {"Content-Type": "application/json"}
    });
    const data = await response.json();
  
    if(data["bustime-response"].directions) {
      const directions = data["bustime-response"].directions.map(direction => direction.dir);
      //console.log(directions);
      return directions;
    } else {
      console.log(data["bustime-response"].error[0]);
      bot.sendMessage(chatId, `Gomen senpai.. please enter a valid bus number ${emojis.sadFace2}`);
    }
}