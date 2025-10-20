
const toggleSwitch = document.getElementById("toggleSwitch");
const label = document.getElementById("toggleLabel");
const scrollPositionEl = document.getElementById("scrollPosition");
const currentURLEl = document.getElementById("currentURL");
const lastVideoEl = document.getElementById("lastVideo");
const lastVideoLink = document.getElementById("lastVideoLink");

// Load saved state
chrome.storage.sync.get(["enabled", "scrollY", "url", "lastVideo"], (result) => {
    const enabled = result.enabled ?? false;
    const scrollY = result.scrollY ?? 0;
    const url = result.url;
    const lastVideo = result.lastVideo ?? "--";

    toggleSwitch.checked = enabled;
    updateUI(enabled, scrollY, url, lastVideo);
});

// Update toggle and notify content script
toggleSwitch.addEventListener("change", () => {

    const enabled = toggleSwitch.checked;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggle", enabled });
    });

    chrome.storage.sync.set({ enabled });
    updateUI(enabled);
});

const getCurrentTabUrl = async () => {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true }, (tabs) => {
            resolve(tabs[0]?.url);
        });
    });

}

// Update UI function
async function updateUI(enabled, scrollY = null, url = null, lastVideo = null) {
    label.textContent = `Extension is ${enabled ? "ON" : "OFF"}`;
    if (scrollY !== null) scrollPositionEl.textContent = `${scrollY}px`;

    if (url !== null && (await getCurrentTabUrl()).includes("youtube")) {
        currentURLEl.textContent = shortenLink(url);
    }

    if (lastVideo !== null) lastVideoEl.textContent = shortenLink(lastVideo);
    if (lastVideo !== null) lastVideoLink.href = lastVideo;
}

// Listen for content script updates
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "update") {
        updateUI(toggleSwitch.checked, msg.scrollY, msg.url, msg.lastVideo);
    }
});


// linkShorterner
const shortenLink = (url) => {
    if (url.length > 25) {
        return url.slice(0, 25) + "...";
    }
    return url;
}