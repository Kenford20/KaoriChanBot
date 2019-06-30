const fetch = require('node-fetch');

module.exports = async function fetchPlacePhoto(photoReference) {
    const placePhotoAPI = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoReference}&sensor=false&maxheight=500&maxwidth=500&key=${process.env.GOOGLE_TRANSLATE_API_KEY}`;
    try {
        const photo = await fetch(placePhotoAPI, {
            method: 'GET',
            header: {"Content-Type": "application/json"}
        });
        return photo.url;
    } catch(err) {
        console.log(`fetch place photo api err: ${err}`);
    }
}
