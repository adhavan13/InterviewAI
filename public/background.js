// background.js
function scrapeData() {
  const container = document.querySelector(
    ".flex.w-full.flex-1.flex-col.gap-4.overflow-y-auto.px-4.py-5"
  );

  if (!container) {
    console.log("❌ Container not found");
    return { success: false, error: "Container not found" };
  }

  try {
    const data = Array.from(container.querySelectorAll("*"))
      .map((el) => (el.innerText ? el.innerText.trim() : ""))
      .filter(Boolean);

    const text = data.join("\n");
    // console.log("✅ Scraped text:", text);
    return { success: true, data: text };
  } catch (error) {
    console.error("❌ Error scraping data:", error);
    return { success: false, error: error.message };
  }
}

// Generate session ID
function generateSessionId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Get or create session ID using Chrome storage
async function getOrCreateSessionId() {
  try {
    const result = await chrome.storage.local.get(["sessionId"]);

    if (result.sessionId) {
      return result.sessionId;
    } else {
      const newSessionId = generateSessionId();
      await chrome.storage.local.set({ sessionId: newSessionId });
      return newSessionId;
    }
  } catch (error) {
    console.error("Error with session storage:", error);
    return generateSessionId(); // Fallback
  }
}

// Check if URL is accessible for content script injection
function isAccessibleUrl(url) {
  const restrictedSchemes = [
    "chrome:",
    "chrome-extension:",
    "moz-extension:",
    "edge:",
  ];
  return url && !restrictedSchemes.some((scheme) => url.startsWith(scheme));
}

async function makeInitialRequest() {
  try {
    // Get active tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      console.error("❌ No active tab found");
      return { success: false, error: "No active tab found" };
    }

    // Check if we can access this URL
    if (!isAccessibleUrl(tab.url)) {
      console.error("❌ Cannot access this type of page:", tab.url);
      return {
        success: false,
        error: `Cannot access ${tab.url}. Extension cannot run on chrome:// pages or extension pages.`,
      };
    }

    console.log("🔍 Attempting to scrape from:", tab.url);

    // Inject script and get results
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeData,
    });

    if (!injectionResults || !injectionResults[0]) {
      console.error("❌ Script injection failed");
      return { success: false, error: "Script injection failed" };
    }

    const result = injectionResults[0].result;

    if (!result.success) {
      console.error("❌ Scraping failed:", result.error);
      return result;
    }

    // console.log("✅ Scraped Data:", result.data);

    // Get session ID
    const sessionId = await getOrCreateSessionId();

    // Send data to backend
    const response = await fetch("http://localhost:3000/api/chatbot/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: result.data,
        sessionId: sessionId,
        role: "user",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    // console.log("✅ Data sent to backend successfully:", responseData);

    return {
      success: true,
      scrapedData: result.data,
      backendResponse: responseData,
      sessionId: sessionId,
    };
  } catch (error) {
    console.error("❌ Error in makeInitialRequest:", error);
    return { success: false, error: error.message };
  }
}

// Extension lifecycle events
chrome.runtime.onInstalled.addListener(() => {
  console.log("🚀 Extension installed");
  chrome.action.setBadgeText({ text: "OFF" });
  chrome.action.setBadgeBackgroundColor({ color: "#9E9E9E" });
  chrome.sidePanel.setOptions({ enabled: true });
});

// Handle messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCRAPE_DATA") {
    // console.log("📨 Received scrape request");

    makeInitialRequest()
      .then((result) => {
        sendResponse(result);
      })
      .catch((error) => {
        console.error("❌ Error processing request:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep message channel open for async response
  }

  if (message.type === "GET_SESSION_ID") {
    getOrCreateSessionId()
      .then((sessionId) => {
        sendResponse({ sessionId });
      })
      .catch((error) => {
        sendResponse({ error: error.message });
      });
    return true;
  }
});

// Handle action button click (if you want to trigger from extension icon)
chrome.action.onClicked.addListener(async (tab) => {
  console.log("🔘 Extension icon clicked");
  await chrome.sidePanel.open({ windowId: tab.windowId });
  if (!isAccessibleUrl(tab.url)) {
    console.error("❌ Cannot run on this page:", tab.url);
    chrome.action.setBadgeText({ text: "ERR" });
    chrome.action.setBadgeBackgroundColor({ color: "#F44336" });
    return;
  }

  const result = await makeInitialRequest();

  if (result.success) {
    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
  } else {
    chrome.action.setBadgeText({ text: "ERR" });
    chrome.action.setBadgeBackgroundColor({ color: "#F44336" });
  }
});

// Optional: Clear badge after some time
function clearBadgeAfterDelay(delay = 3000) {
  setTimeout(() => {
    chrome.action.setBadgeText({ text: "" });
  }, delay);
}
