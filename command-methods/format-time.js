module.exports = function formatTime(str) {
    const time = str.split("T")[1];
    let [hours, minutes, seconds] = time.split(":");
    let am_pm = 'AM';

    if(hours > 12) {
        hours -= 12;
        am_pm = 'PM'
    }

    console.log(`${hours}:${minutes}:${seconds} ${am_pm}`);

    return `${hours}:${minutes}:${seconds} ${am_pm}`;
}