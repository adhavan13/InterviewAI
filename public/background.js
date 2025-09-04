// background.js
function scrapeData() {}

// Generate session ID
function generateSessionId() {}

// Get or create session ID using Chrome storage
async function getOrCreateSessionId() {}

// Check if URL is accessible for content script injection
function isAccessibleUrl(url) {}

async function makeInitialRequest() {}

chrome.runtime.onInstalled.addListener(() => {
  // Ensure the side panel can be opened by clicking the extension icon
  console.log("Extension enabled here");
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  console.log("Extension enabled");
});

// (Optional) If you want extra control:
// Open the side panel only when the user clicks the icon
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (err) {
    console.error("Failed to open side panel:", err);
  }
});
