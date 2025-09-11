import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const ChatbotUI = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };

  useEffect(() => {
    const listener = async (message, sender, sendResponse) => {
      try {
        // Handle INTERVIEW_SIMULATION messages
        if (message.type === "INTERVIEW_SIMULATION") {
          const { problemId, content } = message;

          if (!problemId || !content) {
            console.warn("❌ Missing problemId or content in message", message);
            return;
          }

          chrome.storage.local.set({ problemId }, () => {
            console.log("✅ problemId saved to local storage:", problemId);
          });

          const response = await axios.post(
            "http://localhost:3000/api/chatbot/chat",
            {
              role: "user",
              problemId,
              content,
            }
          );

          const botMessage =
            response?.data?.message || "Error: no response from backend";

          setMessages((prev) => [
            ...prev,
            {
              id: uuidv4(),
              text: botMessage,
              sender: "bot",
              timestamp: new Date(),
            },
          ]);

          scrollToBottom();
        }

        // Handle OPEN_SIDE_PANEL messages
        else if (message.type === "TOUGH_TESTCASES") {
          const { problemId, content } = message;
          const type = message.type;
          if (!problemId || !content) {
            console.warn("❌ Missing problemId or content in message", message);
            return;
          }

          chrome.storage.local.set({ problemId: problemId }, () => {
            console.log("✅ problemId saved to local storage:", problemId);
          });
          chrome.storage.local.set({ type: type }, () => {
            console.log("✅ problemId saved to local storage:", type);
          });

          const response = await axios.post(
            "http://localhost:3000/api/chatbot/testcases",
            {
              role: "user",
              problemId,
              content,
            }
          );

          const botMessage =
            response?.data?.message || "Error: no response from backend";

          setMessages((prev) => [
            ...prev,
            {
              id: uuidv4(),
              text: botMessage,
              sender: "bot",
              timestamp: new Date(),
            },
          ]);

          scrollToBottom();
        }
      } catch (error) {
        console.error("❌ Error handling message:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            text: "An error occurred while processing the message.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const messageText = inputValue.trim();
    const userMessage = {
      id: uuidv4(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    scrollToBottom();

    // Get or generate sessionId
    let problemId;
    let type;
    chrome.storage.local.get("problemId", (result) => {
      problemId = result.problemId;
      console.log("Retrieved problemId:", result.problemId);
    });
    chrome.storage.local.get("type", (result) => {
      type = result.type;
      console.log("Retrieved type:", result.type);
    });

    try {
      const response = await makeChatRequest({
        content: messageText,
        problemId: problemId,
        type: type,
      });
      
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          text: response.data.message || "error occurred",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    adjustTextareaHeight();
  };

  const makeChatRequest = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/chatbot/chat",
        {
          content: data.content,
          problemId: data.problemId,
          role: "user",
        }
      );
      console.log("Response from backend:", response);
      return response;
    } catch (error) {
      console.error("Error fetching chat response:", error);
      return "Sorry, I couldn't process your request.";
    }
  };

  return (
    <div className="h-screen w-full min-w-0 max-w-full bg-white flex flex-col border-l border-gray-200">
      {/* Simplified Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-medium text-gray-900 truncate">
            AI Assistant
          </h1>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="w-full">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`py-6 px-4 ${
                message.sender === "bot" ? "bg-gray-50" : "bg-white"
              }`}
            >
              <div className="flex gap-4 min-w-0">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-7 h-7 rounded-sm flex items-center justify-center ${
                      message.sender === "user"
                        ? "bg-green-600 text-white"
                        : "bg-gray-900 text-white"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                    {message.sender === "user" ? "You" : "AI Assistant"}
                  </div>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                    {message.text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        <div className="px-4 py-4">
          <div className="relative flex items-end bg-white border border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 focus-within:shadow-md transition-all duration-200 min-w-0">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Message AI Assistant..."
              className="flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 min-w-0"
              rows="1"
              style={{
                minHeight: "44px",
                maxHeight: "120px",
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={inputValue.trim() === ""}
              className={`m-1.5 flex h-8 w-8 items-center justify-center rounded-md transition-colors flex-shrink-0 ${
                inputValue.trim() === ""
                  ? "text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Press Enter to send, Shift + Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotUI;
