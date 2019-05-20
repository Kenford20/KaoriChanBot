module.exports = function findSecondsToElapse(reminderHours, reminderMinutes, am_pm) {
    const today = new Date();
    console.log(`date of reminder request: ${today}`);
  
    // -5 to match my timezone, (2:00 pm CDT -> 14:00) = 19:00 UTC8 or whatever that is above
    let currHours = today.getHours()-5; 
    const currMinutes = today.getMinutes();
  
    reminderHours = /(pm|PM)/.test(am_pm) && reminderHours < 12 ? parseInt(reminderHours) + 12 : parseInt(reminderHours);

    // (12:00 am).gethours = 0 hours, add 12 to keep my calculations correct
    if(currHours == 0) {
      currHours += 12;
    }
  
    let hoursToElapse = reminderHours - currHours;
    let minutesToElapse = parseInt(reminderMinutes) - currMinutes;
  
    // going from pm to am or when time difference is greater than 12 hours
    if(hoursToElapse < 0) {
      hoursToElapse += 24;
    } 
    // 9:30 pm to 9:35 pm = 2:30(utc8) - 5 hours = -3:30 => 9:35 pm = 21:35 pm - (-3):30 = 24:05 to elapse - 24 = 5 mins
    else if(hoursToElapse >= 24) {
      hoursToElapse -= 24;
    }
  
    // time borrow
    if(minutesToElapse < 0) {
      minutesToElapse += 60;
      hoursToElapse--;
  
      // 7:30 am to 7:00 am or with pm
      if(hoursToElapse < 0) {
        hoursToElapse += 24;
      }
    }
    console.log(`New reminder posted! Currhours: ${currHours} currMins: ${currMinutes}`);
    console.log(`reminderHrs: ${reminderHours} and reminderMins: ${reminderMinutes}`);
    console.log(`hoursToElapse: ${hoursToElapse} and minutesToElapse: ${minutesToElapse}`);
    return (hoursToElapse*60 + minutesToElapse)*60;
}

