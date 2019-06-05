const emojis = require('../telegram-emojis');

module.exports = function getWeatherEmoji(weatherCode) {
// weather codes at: https://openweathermap.org/weather-conditions
    switch(true) {
        case (weatherCode >= 200 && weatherCode <= 232): weatherEmoji = emojis.thunderstorm; break;
        case (weatherCode >= 300 && weatherCode <= 321): weatherEmoji = emojis.droplet; break;
        case (weatherCode >= 500 && weatherCode <= 531): weatherEmoji = emojis.rain; break;
        case (weatherCode >= 600 && weatherCode <= 622): weatherEmoji = emojis.snowflake; break;
        case (weatherCode >= 700 && weatherCode <= 781): weatherEmoji = emojis.atmosphere; break;
        case weatherCode === 800: weatherEmoji = emojis.sun; break;
        case (weatherCode === 801 || weatherCode === 802): weatherEmoji = emojis.sunCloud; break;
        case (weatherCode === 803 || weatherCode === 804): weatherEmoji = emojis.cloud; break;
        default: weatherEmoji = emojis.defaultEmoji;
    }
    return weatherEmoji;
}