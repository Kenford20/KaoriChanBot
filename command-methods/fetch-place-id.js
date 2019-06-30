const fetch = require('node-fetch');

module.exports = async function fetchPlacePhoto(placeName) {
    const placesAPI = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${placeName}&inputtype=textquery&fields=place_id&key=${process.env.GOOGLE_TRANSLATE_API_KEY}`;
    try {
        const placeData = await fetch(placesAPI, {
            method: 'GET',
            header: {"Content-Type": "application/json"}
        }).then(response => response.json());
        return placeData.candidates[0].place_id;
    } catch(err) {
        console.log(`fetch places api err: ${err}`);
    }
}
