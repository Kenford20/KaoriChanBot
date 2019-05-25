const fetch = require('node-fetch');

module.exports = async function fetchTrainStations(colorCode) {
  const CTA_getTrainStations_API = `https://data.cityofchicago.org/resource/8pix-ypme.json?${colorCode}=true`;
  console.log(CTA_getTrainStations_API);

  try { 
    const response = await fetch(CTA_getTrainStations_API, {
      method: "GET",
      header: {"Content-Type": "application/json"}
    });
    const data = await response.json();
    
    if(data.length !== 0 && !data.error) {
      // map to grab stopname/id, then filter them to be unique since they come in pairs (one for both directions)
      // i.e Halsted will have a stopname for going toward the loop and one going toward midway (both have same stopID doe)
      // ex stopName: Halsted (Loop-bound), replace gets rid of the loop bound portion to display all unique station names to the user
      const stationNames = data.map(station => station.stop_name.replace(/ \(.+\)/, ''));
      const uniqueStops = stationNames.filter((stop, i) => stationNames.indexOf(stop) === i);
      const stationIDs = data.map(station => station.map_id);
      const uniqueIDs = stationIDs.filter((stopID, i) => stationIDs.indexOf(stopID) === i);

      const trainNameIDpairs = [];

      for(let i = 0; i < uniqueStops.length; i++) {
        trainNameIDpairs.push([uniqueStops[i], uniqueIDs[i]]);
      }
      return trainNameIDpairs.sort();
    } 
    else {
      console.log(data.message);
      return Promise.reject([
        `Enter a valid train line color, onegaishimasu~`, 
        `User failed to enter a valid train line color`
      ]);
    }
  } catch {
    return Promise.reject([
      `Failed to retrieve train stop ID! \nCTA Train Tracker servers may be down.. Try again later :c`, 
      `Failed to make a GET request to ${CTA_getTrainStations_API}. Maybe API servers are down?`
    ]);
  }
}