let trackButton = document.getElementById("website-button");
let clearButton = document.getElementById("clear-button");

// Prints Current Tab
trackButton.addEventListener("click", async function () { 
    chrome.tabs.query({active: true}, async (tabs) => {
        let url = tabs[0].url;
        alert(url);
    })
});

// Clears Time in Local storage time_spent dictionary
clearButton.addEventListener("click", () => {
    // Error Handle if gonna be a real thing
    chrome.storage.local.remove('time_spent', () => {});
})