import { useEffect, useState } from "react";
import ChatbotUI from "./components/chatPage";
import React from "react";
import axios from "axios";

function App() {
  // const [source, setSource] = useState(null);
  useEffect(() => {
    chrome.runtime.sendMessage({ type: "SIDE_PANEL_READY" });
  }, []);

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
