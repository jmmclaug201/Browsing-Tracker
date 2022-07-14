// Notify When Active Tab is Changed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        updateCurrentPage(tab.url);
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    let tabId = activeInfo.tabId;
    chrome.tabs.get(tabId, async (tab) => {
        updateCurrentPage(tab.url);
    });
});

// Updates Current Page to new page according to urlString
async function updateCurrentPage(urlString) {
    let url = new URL(urlString);
    let host = url.host.replace("www.", "");
    console.log(host);
}