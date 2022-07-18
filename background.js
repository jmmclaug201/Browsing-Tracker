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
        let delta = end - start;
        // Get the time_spent dictionary from local storage
        chrome.storage.local.get('time_spent', (items) => {
            time_dict = items['time_spent'];
            // Updadte the dictionary, or create a new entry if the entry DNE
            if (time_dict) {
                if (time_dict[website]) {
                    time_dict[website] += delta;
                }
                else {
                    time_dict[website] =  delta;
                }
            }
            else {
                time_dict = {website : delta};
            }
            // Set time_spent to updated time_dict
            chrome.storage.local.set({'time_spent' : time_dict})
            .then(() => {console.log(time_dict)});
        });
    }
});

// Updates Current Page to new page according to urlString
function updateCurrentPage(urlString) {
    let url;
    // Ensure URL is valid
    try {
        url = new URL(urlString);
    }
    catch (error) {
        console.warn("Invalid Urlstring: " + urlString);
        return;
    }
    let website = url.host.replace("www.", "");

    // Update User's current_website to the new website
    const d = new Date();
    let time = d.getTime();
    chrome.storage.local.set({'current_website' : website,
                              'current_time' : time})
        .then(function () {
            // Debug (Keep?)
            console.log("current_webiste updated to " + website);
            console.log("current_time updated to " + time);
        });
}