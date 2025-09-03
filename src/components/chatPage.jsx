import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const ChatbotUI = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const getProbleMDes = async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          type: "SCRAPE_DATA",
        });
        console.log(
          "Response from background:",
          response.backendResponse.message
        );
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            text: response.backendResponse.message || "error occured",
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

  const simulateBotResponse = (userMessage) => {
    const responses = [
      "That's an interesting question! Let me think about that for a moment.",
      "I understand what you're asking. Here's what I think...",
      "Great point! I'd be happy to help you with that.",
      "That's a thoughtful question. Based on what you've shared...",
      "I see what you mean. Let me provide some insights on that topic.",
      "Thanks for asking! Here's my perspective on this...",
      "That's something I can definitely help you with. Consider this...",
      "Interesting! Let me break this down for you...",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: simulateBotResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          text: e || "error occured",
          sender: "user",
          timestamp: new Date(),
        },
      ]);
      const response = await makeChatRequest({
        messages: e.target.value,
        sessionId: "l",
      });
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          text: response || "error occured",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setInputValue("");
      scrollToBottom();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const makeChatRequest = async (message) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/chatbot/chat",
        {
          content: data.message,
          sessionId: data.sessionId,
          role: "user",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response from backend:", response.data);
      return response.data.message;
    } catch (error) {
      console.error("Error fetching chat response:", error);
      return "Sorry, I couldn't process your request.";
    }
  };

  return (
    <div className="h-[600px] w-[350px] bg-amber-50 flex flex-col items-center justify-center gap-4 z-50 border-r border-gray-800">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">AI Assistant</h1>
          <p className="text-sm text-gray-400">Online</p>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === "user"
                  ? "bg-gradient-to-br from-green-500 to-teal-600"
                  : "bg-gradient-to-br from-blue-500 to-purple-600"
              }`}
            >
              {message.sender === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${
                message.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-3 rounded-2xl shadow-lg ${
                  message.sender === "user"
                    ? "bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-br-md"
                    : "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              <p
                className={`text-xs text-gray-500 mt-1 ${
                  message.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-md p-3 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-end gap-3 max-w-full">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="w-full bg-gray-700 border border-gray-600 rounded-2xl px-4 py-3 pr-12 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 max-h-32"
              rows="1"
              style={{
                minHeight: "48px",
                maxHeight: "128px",
                overflowY: inputValue.length > 100 ? "auto" : "hidden",
              }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === "" || isTyping}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
              inputValue.trim() === "" || isTyping
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 active:scale-95 shadow-lg hover:shadow-xl"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatbotUI;
