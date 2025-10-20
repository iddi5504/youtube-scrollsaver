
const toggleSwitch = document.getElementById("toggleSwitch");
const label = document.getElementById("toggleLabel");
const scrollPositionEl = document.getElementById("scrollPosition");
const currentURLEl = document.getElementById("currentURL");

// Load saved state
chrome.storage.sync.get(["enabled", "scrollY", "url"], (result) => {
    const enabled = result.enabled ?? false;
    const scrollY = result.scrollY ?? 0;
    const url = result.url ?? "N/A";

    toggleSwitch.checked = enabled;
    updateUI(enabled, scrollY, url);
});

// Update toggle and notify content script
toggleSwitch.addEventListener("change", () => {
    console.log("Toggle changed");
    const enabled = toggleSwitch.checked;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggle", enabled });
    });

    chrome.storage.sync.set({ enabled });
    updateUI(enabled);
});

// Update UI function
function updateUI(enabled, scrollY = null, url = null) {
    label.textContent = `Extension is ${enabled ? "ON" : "OFF"}`;
    if (scrollY !== null) scrollPositionEl.textContent = `${scrollY}px`;
    if (url !== null) currentURLEl.textContent = url;
}

// Listen for content script updates
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "update") {
        updateUI(toggleSwitch.checked, msg.scrollY, msg.url);
    }
});
