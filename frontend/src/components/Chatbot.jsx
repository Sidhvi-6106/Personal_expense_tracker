import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Loader2 } from "lucide-react";
import axios from "axios";
import { useFinanceContext } from "../context/FinanceContext";
import { API_BASE_URL } from "../utils/apiBase";

const Chatbot = ({ onClose }) => {
  const { token, settings } = useFinanceContext();
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("chatbot-messages");
    if (saved) return JSON.parse(saved);
    return [
      { role: "assistant", content: "Hi! I'm your AI financial assistant. Ask me anything about your expenses, income, or budget." }
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const isDark = settings.theme === "dark";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    sessionStorage.setItem("chatbot-messages", JSON.stringify(messages));
  }, [messages]);

  const clearChat = () => {
    const defaultMessages = [{ role: "assistant", content: "Hi! I'm your AI financial assistant. Ask me anything about your expenses, income, or budget." }];
    setMessages(defaultMessages);
    sessionStorage.setItem("chatbot-messages", JSON.stringify(defaultMessages));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/ai-api/chat-bot`,
        { message: userMessage.content },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.payload.reply }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err.response?.data?.message ||
            "Sorry, I encountered an error connecting to the AI service."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`h-full flex flex-col ${isDark ? "text-slate-100" : "text-slate-800"}`}>
      {/* Header */}
      <div className={`p-4 border-b flex justify-between items-center ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-indigo-50"}`}>
        <div className="flex items-center gap-2">
          <Bot className="text-indigo-500" size={24} />
          <h2 className="font-bold text-lg">AI Assistant</h2>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={clearChat} className="text-xs px-3 py-1.5 font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border border-indigo-200 dark:border-indigo-800">
            Clear Chat
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-300/20 rounded-full transition-colors ml-1">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-emerald-500 text-white"}`}>
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm ${
              msg.role === "user" 
                ? "bg-indigo-600 text-white rounded-tr-none" 
                : isDark 
                  ? "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700" 
                  : "bg-white text-slate-700 rounded-tl-none border border-slate-200 shadow-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 flex-row">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className={`px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2 ${isDark ? "bg-slate-800" : "bg-white border border-slate-200"}`}>
              <Loader2 size={16} className="animate-spin text-indigo-500" />
              <span className="text-xs text-slate-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your finances..."
            className={`flex-1 px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              isDark 
                ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" 
                : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
            }`}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center h-10 w-10 shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
