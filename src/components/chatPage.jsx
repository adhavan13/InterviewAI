import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

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
    const getProbleMDes = async () => {
      try {
        chrome.storage.local.remove("sessionId", () => {
          console.log("🗑️ sessionId removed from chrome.storage");
        });
        const response = await chrome.runtime.sendMessage({
          type: "SCRAPE_DATA",
          sessionId: uuidv4(), // 👈 session id
        });

        console.log(
          "Response from background:",
          response.backendResponse.message
        );

        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            text: response.backendResponse.message || "error occurred",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        scrollToBottom();
      } catch (error) {
        console.error("Failed to get session ID:", error);
      }
    };
    getProbleMDes();
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
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem("sessionId", sessionId);
    }

    try {
      const response = await makeChatRequest({
        content: messageText,
        sessionId: sessionId,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          text: response || "error occurred",
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
      const response = await fetch("http://localhost:3000/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: data.content,
          sessionId: data.sessionId,
          role: "user",
        }),
      });

      const responseData = await response.json();
      console.log("Response from backend:", responseData);
      return responseData.message;
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
