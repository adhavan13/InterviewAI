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

async function makeInitialRequest(sessionId) {
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

async function makeToughTestCaseRequest(sessionId) {
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
        type: "toughTestCase",
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_SIDE_PANEL") {
    chrome.sidePanel.open({ windowId: sender.tab.windowId });
    queuedMessage = {
      type: "INTERVIEW_SIMULATION",
      problemId: message.problemId,
      content: message.content,
    };
    console.log(queuedMessage);
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "SIDE_PANEL_READY" && queuedMessage) {
    chrome.runtime.sendMessage(queuedMessage);
    queuedMessage = null;
  }
});

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
