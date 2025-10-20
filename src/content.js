let currentScrollPosition = 0;

const pagesToScroll = ["/", "/results"];
const userProfile = /^\/@[a-zA-Z0-9]/;

let selectedCategoryChip = null;
let extensionEnabled = false;

// Load initial enabled state
chrome.storage.sync.get(["enabled"], (result) => {
  extensionEnabled = result.enabled ?? false;
  sendUpdate();
});

// Listen for changes in storage (from popup toggle)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    extensionEnabled = changes.enabled.newValue;
    sendUpdate();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "toggle") {
    extensionEnabled = msg.enabled;
    chrome.storage.sync.set({ enabled: extensionEnabled });
    sendUpdate();
  }
});

// Determine if current page should track scroll
const shouldPageScroll = () =>
  pagesToScroll.includes(location.pathname) || userProfile.test(location.pathname);

// Save scroll position
document.addEventListener("scroll", () => {
  if (extensionEnabled && shouldPageScroll()) {
    currentScrollPosition = window.scrollY;
    sendUpdate();
  }
});

// Restore scroll position after SPA navigation
const handleNavigation = () => {
  if (!extensionEnabled) return;

  if (shouldPageScroll()) {
    window.scrollTo({ top: currentScrollPosition, behavior: "smooth" });
  }

  if (userProfile.test(location.pathname)) {
    const chips = document.querySelectorAll("yt-chip-cloud-chip-renderer");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        selectedCategoryChip = chip;
      });
    });

    if (selectedCategoryChip) {
      selectedCategoryChip.click();
    }
  }

  sendUpdate();
};

// Detect URL changes on YouTube SPA
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    handleNavigation();
  }
}).observe(document, { subtree: true, childList: true });

// Send scroll position and URL to popup
function sendUpdate() {
  chrome.storage.sync.set({
    scrollY: parseInt(currentScrollPosition),
    url: location.href,
  });
  chrome.runtime.sendMessage({
    action: "update",
    scrollY: parseInt(currentScrollPosition),
    url: location.href,
  });
}

// Initial call
handleNavigation();
