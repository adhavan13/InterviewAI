import React from "react";
// import scrapeData from "./content/content";
import axios from "axios";
import ChatbotUI from "./components/chatPage";

function App() {
  // Function that will be injected into the active tab
  function scrapeData() {
    const container = document.querySelector(
      ".flex.w-full.flex-1.flex-col.gap-4.overflow-y-auto.px-4.py-5"
    );

    if (!container) {
      console.log("❌ Container not found");
      return null;
    } else {
      const data = Array.from(container.querySelectorAll("*"))
        .map((el) => (el.innerText ? el.innerText.trim() : ""))
        .filter(Boolean);

      const text = data.join("\n"); // merge into one string

      console.log("✅ Scraped text:", text);
      return text;
    }
  }

  // React button handler
  const handleClick = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: scrapeData, // inject function into the page
      },
      (injectionResults) => {
        if (!injectionResults || !injectionResults[0]) return;
        const data = injectionResults[0].result;
        console.log("Scraped Data:", data);
        // Send data to backend
        const response = axios.post(
          "https://your-backend-endpoint.com/api/data",
          { scrapedData: data }
        );
        console.log("Data sent to backend:", response);
        alert(JSON.stringify(data, null, 2)); // quick test (you can update UI instead)
      }
    );
  };

  return (
    // <div className="h-[600px] w-[350px] bg-amber-50 flex flex-col items-center justify-center gap-4 z-50 border-r border-gray-800">
    //   <h1 className="text-3xl font-bold underline">Hello world!</h1>

    //   <button
    //     onClick={handleClick}
    //     className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    //   >
    //     Get Data
    //   </button>
    // </div>
    <ChatbotUI />
  );
}

export default App;
