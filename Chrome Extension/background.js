// Constant Value for no website (i.e. when chrome not open)
const NO_WEBSITE = "no website"

// Notify When a New Window Takes the Foreground, or Chrome Closes
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId == chrome.windows.WINDOW_ID_NONE) {
        updateCurrentPage(NO_WEBSITE);
    }
    else {
        chrome.tabs.query({active : true, currentWindow : true})
        .then((tabs) => {
            let url = tabs[0].url;
            updateCurrentPage(url);
        });
    }
});

// Notify When a Tab Changes Its URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        updateCurrentPage(tab.url);
    }
});

// Notify when a Tab Becomes Active
chrome.tabs.onActivated.addListener((activeInfo) => {
    let tabId = activeInfo.tabId;
    chrome.tabs.get(tabId, async (tab) => {
        let url = tab.url;
        // Only Update Page if it has a URL 
        // (Don't Update for Opening a New Tab)
        if (url) {
            updateCurrentPage(url);
        }
    });
});

// When Current Website Changes, Add time spent on it to time_spent
chrome.storage.onChanged.addListener((changes, areaName) => {
    if ('current_website' in changes && 'current_time' in changes) {
        // Calculate Time Elapsed on the Website
        const website = changes['current_website'].oldValue,
              start = changes['current_time'].oldValue,
              end = changes['current_time'].newValue;
        // Don't add NO_WEBSITE to time_spent (they can track non-chrome stuff
        // on their own time)
        if (website === NO_WEBSITE) {
            return;
        }

        // Get the time_spent dictionary from local storage
        chrome.storage.local.get('time_spent', (items) => {
            let time_dict = items['time_spent'];
            // Update the dictionary, or create a new entry if the entry DNE
            if (!time_dict) {
                time_dict = {};
            }

            let startDate = new Date(start);
            let endDate = new Date(end);

            // Set TMP to midnight the day after startdate
            let tmpDate = new Date(startDate.getFullYear(), 
                                   startDate.getMonth(), 
                                   startDate.getDate() + 1);
            
            // While tmpDate before endDate 
            // (while startDate and endDate on different days)
            while (tmpDate.getTime() < endDate.getTime()) {
                let day_dict = time_dict[startDate.toDateString()];
                if (!day_dict) {
                    day_dict = {}
                }
                // Update dayDict with website and time between start and tmp
                let deltaSeconds = (tmpDate.getTime() - startDate.getTime()) / 1000;
                if (day_dict[website]) {
                    day_dict[website] += deltaSeconds;
                }
                else {
                    day_dict[website] =  deltaSeconds;
                } 
                time_dict[startDate.toDateString()] = dayDict;

                // set startDate to tmpDate
                startDate.setTime(tmp.getTime());
                // set tmpDate to 24 hours later
                tmpDate.setDate(tmpDate.getDate() + 1);
            }

            // Finally do the same thing as above for the day endDate is on
            let day_dict = time_dict[startDate.toDateString()];
            if (!day_dict) {
                day_dict = {}
            }
            let deltaSeconds = (endDate.getTime() - startDate.getTime()) / 1000;
            if (day_dict[website]) {
                day_dict[website] += deltaSeconds;
            }
            else {
                day_dict[website] =  deltaSeconds;
            } 
            time_dict[startDate.toDateString()] = day_dict;
            
            // Set time_spent to updated time_dict
            chrome.storage.local.set({'time_spent' : time_dict})
            .then(() => {console.log(time_dict)});
        });
    }
});

// Updates current_website in local storage to new page according to urlString,
// and updates current_time to the time the website was changed
function updateCurrentPage(urlString) {
    let url, website;
    // Ensure URL is valid
    try {
        // NO_WEBSITE urlString implies no current website (Chrome closed)
        if (urlString == NO_WEBSITE) {
            website = NO_WEBSITE;
        }
        else {
            url = new URL(urlString);
            website = url.host.replace("www.", "");    
        }
    }
    catch (error) {
        console.warn("Invalid Urlstring: " + urlString);
        return;
    }
    // Get current_webiste from storage to make sure host changed
    chrome.storage.local.get('current_website')
    .then((items) => {
        let oldWebsite = items['current_website'];
        // Only Update current_website if the website changed
        if (oldWebsite !== website) {
            // Update User's current_website to the new website
            const d = new Date();
            let time = d.getTime();
            chrome.storage.local.set({'current_website' : website,
                                      'current_time' : time})
            .then(() => {
                // Debug (Keep?)
                console.log("current_webiste updated to " + website + " at "
                             + d.toTimeString());
            });
        }
    });
}