module.exports = function GPS_Handler(callbackQuery, bot) {
    console.log(callbackQuery.data);
    let [travelMode, origin, destination] = callbackQuery.data.split('|');
    origin = origin.replace(/\s/g, '+').replace(/\,/, '%2C');
    destination = destination.replace(/\s/g, '+').replace(/\,/, '%2C');

    bot.sendMessage(callbackQuery.message.chat.id, `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelMode}`);
}
  