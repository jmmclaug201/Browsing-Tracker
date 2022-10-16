let clearButton = document.getElementById("clear-button");
let getButton = document.getElementById("get-button");

// Clears Time in Local storage time_spent dictionary
clearButton.addEventListener("click", () => {
    // If going to keep, also reset timer on current website
    // Error Handle if gonna be a real thing
    chrome.storage.local.set({'time_spent' : {}}, () => {});
});

// Handles when button wanting time breakdown is clicked
getButton.addEventListener("click", () => {
    // Get Time Spent from Storage
    chrome.storage.local.get('time_spent')
    .then((items) => {
        const time_dict = items['time_spent'];
        const day_dict = time_dict[new Date(Date.now()).toDateString()];
        // Get Sorted Time Array
        const mostViewedRes = getMostViewed(day_dict);
        const mostViewed = mostViewedRes[0],
              otherTime = mostViewedRes[1];
        // Format String for Alerting
        if (mostViewed.length !== 0) {
            let displayString = "";
            Object.entries(mostViewed).forEach(([_, [website, time]]) => {
                displayString += website + " : " + timeString(time) + "\n";
            });
            if (otherTime !== 0) {
                displayString += "Other Sites : " + timeString(otherTime);
            }
            alert(displayString);
        }
        else {
            alert("No Time Logged Today Yet!");
        }
    });
});

// Given an object listing websites and times, returns an array of the websites
// sorted by time (Length of MAX_SITES or includes all if MAX_SITES = -1)
function getMostViewed(day_dict, MAX_SITES = 10) {
    if (!day_dict) {
        return [[], 0];
    }
    let mostViewed = [];
    let otherTime = 0;
    // For Each website, find where it belongs on the mostViewed array
    Object.entries(day_dict).forEach(([key, value]) => {
        let index = 0;
        while (mostViewed.length > index && mostViewed[index][1] > value) {
            index++;
        }
        mostViewed.splice(index, 0, [key, value]);
        // If the array is too long, remove from it
        if (mostViewed.length > MAX_SITES && MAX_SITES !== -1) {
            otherTime += mostViewed.pop()[1];
        }
    });
    return [mostViewed, otherTime];
}

// Turns float duration into a human-readable string
// i.e. 16322.32 => 4h 32m, 432.12 => 7m 12s
function timeString(duration) {
    duration = Math.round(duration);
    const seconds = duration % 60;
    duration -= seconds;
    const minutes = (duration % 3600) / 60;
    duration -= minutes * 60;
    const hours = duration / 3600;
    let timeString = ""
    if (hours !== 0) {
        timeString += hours + "h";
    }
    if (minutes !== 0) {
        if (timeString !== "") {
            timeString += " ";
        }
        timeString += minutes + "m";
    }
    if (hours === 0 && (minutes === 0 || seconds !== 0)) {
        if (timeString !== "") {
            timeString += " ";
        }
        timeString += seconds + "s";
    }
    return timeString;
}