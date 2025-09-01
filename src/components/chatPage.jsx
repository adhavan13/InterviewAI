import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, X, Maximize2, Minimize2 } from "lucide-react";

const ChatbotExtension = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [panelWidth, setPanelWidth] = useState(380);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateBotResponse = (userMessage) => {
    const responses = [
      "That's an interesting question! Let me think about that for a moment.",
      "I understand what you're asking. Here's what I think...",
      "Great point! I'd be happy to help you with that.",
      "That's a thoughtful question. Based on what you've shared...",
      "I see what you mean. Let me provide some insights on that topic.",
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        zIndex: 999999,
        fontFamily: "system-ui, -apple-system, sans-serif",
        pointerEvents: "auto",
      }}
    >
      {/* Overlay */}
      {isExpanded && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            zIndex: 999998,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Main Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-screen bg-gray-900 text-white shadow-2xl transition-all duration-300 ease-in-out border-l border-gray-700 ${
          isExpanded ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          width: isExpanded ? `${panelWidth}px` : "0px",
          minWidth: isExpanded ? "300px" : "0px",
          height: "100vh",
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 999999,
          backgroundColor: "#111827",
          color: "white",
          boxShadow:
            "-10px 0 25px -3px rgba(0, 0, 0, 0.1), -10px 0 10px -3px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">AI Assistant</h1>
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </div>

          <button
            onClick={toggleExpanded}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Container */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
          style={{ height: "calc(100vh - 140px)" }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
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

              <div
                className={`max-w-[calc(100%-60px)] ${
                  message.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-2xl shadow-lg text-sm ${
                    message.sender === "user"
                      ? "bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-br-md"
                      : "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-md"
                  }`}
                >
                  <p className="leading-relaxed break-words">{message.text}</p>
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

          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-md p-3">
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
        <div className="bg-gray-800 border-t border-gray-700 p-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 pr-10 text-white text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows="1"
                style={{
                  minHeight: "36px",
                  maxHeight: "100px",
                  overflowY: inputValue.length > 100 ? "auto" : "hidden",
                }}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={inputValue.trim() === "" || isTyping}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                inputValue.trim() === "" || isTyping
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 active:scale-95"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button (when collapsed) */}
      {!isExpanded && (
        <button
          onClick={toggleExpanded}
          className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            width: "48px",
            height: "48px",
            zIndex: 999999,
            border: "none",
            cursor: "pointer",
          }}
          title="Open AI Assistant"
        >
          <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default ChatbotExtension;
