let trackButton = document.getElementById("website-button");

trackButton.addEventListener("click", async function () { 
    chrome.tabs.query({active: true}, async (tabs) => {
        let url = tabs[0].url;
        alert(url);
    })
});