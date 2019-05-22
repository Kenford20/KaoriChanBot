const fetch = require('node-fetch');

module.exports = async function fetchTrainStopID(stationName) {
  const CTA_getTrainStops_API = `https://data.cityofchicago.org/resource/8pix-ypme.json?station_name=${stationName}`;
  
  try { 
    const response = await fetch(CTA_getTrainStops_API, {
      method: "GET",
      header: {"Content-Type": "application/json"}
    });
    const data = await response.json();
    console.log(data);

    if(data.length !== 0) {
      return data[0].stop_id;
    } else {
      return Promise.reject([
        `Enter a valid train station name, onegaishimasu~`, 
        `User failed to enter a valid train station name`
      ]);
    }
  } catch {
    return Promise.reject([
      `Failed to retrieve train stop ID! \nCTA Train Tracker servers may be down.. Try again later :c`, 
      `Failed to make a GET request to ${CTA_getTrainStops_API}. Maybe API servers are down?`
    ]);
  }
}