import React from "react";
import MainLayout from "../layouts/MainLayout";
import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import {
  Bot, Sparkles, SendHorizontal, Mic, FileText, Search, Clock3,
  MessageSquare, Plus, History, X, Loader2, MicOff,
} from "lucide-react";

const suggestedQuestions = [
  "Why did Pump P101 fail repeatedly?",
  "Show maintenance history of Boiler B201",
  "List all safety procedures for Compressor C102",
  "Which inspections are due this week?",
];

const welcomeMessage = { id: "welcome", type: "ai", message: "Hello! I'm your Industrial AI Copilot. I can search across manuals, SOPs, maintenance logs, inspection reports, incident reports and engineering documents. Ask me anything about your organization.", time: "" };

const formatTime = (date = new Date()) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const AICopilot = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([welcomeMessage]);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [contextDocuments, setContextDocuments] = useState([]); 
  const [showHistory, setShowHistory] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState("");
  const scrollRef = useRef(null);

  // 🟢 VOICE RECOGNITION FRONTEND STATE ENGINE
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (location.state?.contextDocuments) {
      setContextDocuments(location.state.contextDocuments);
      setActiveSession(null);
      setMessages([welcomeMessage]);
    }
  }, [location.state]);

  useEffect(() => {
    const loadSessions = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get("/api/chat");
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to load chat sessions:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadSessions();
  }, []);

  // 🟢 INSTANTIATE WEB SPEECH API INITIALIZATION ON MOUNT
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false; // Stops recording immediately once the user stops talking
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      
      rec.onresult = (event) => {
        const voiceTranscript = event.results[0][0].transcript;
        if (voiceTranscript) {
          setQuestion((prev) => (prev ? `${prev} ${voiceTranscript}` : voiceTranscript));
        }
      };

      rec.onerror = (e) => {
        console.error("Speech interface pipeline error:", e.error);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => (item.title || "New Conversation").toLowerCase().includes(historySearchQuery.toLowerCase()));
  }, [history, historySearchQuery]);

  // 🟢 TOGGLES MIC CAPTURE INSTANTLY
  const toggleListeningAction = () => {
    if (!recognitionRef.current) {
      alert("Voice Dictation Interface is not fully supported on this web browser engine.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setStreamError("");
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Voice execution interface conflict:", err);
      }
    }
  };

  const selectSession = async (id) => {
    setShowHistory(false);
    setHistorySearchQuery("");
    setActiveSession(id);
    setLoadingSession(true);
    setStreamError("");
    try {
      const res = await api.get(`/api/chat/${id}`);
      setContextDocuments(res.data.contextDocuments || []);
      const loaded = (res.data.messages || []).map((m, idx) => ({
        id: `${id}-${idx}`, type: m.sender, message: m.text, time: formatTime(new Date(m.timestamp)),
      }));
      setMessages(loaded.length ? loaded : [welcomeMessage]);
    } catch (err) {
      console.error("Failed to load session:", err);
      setStreamError("Could not load that conversation.");
    } finally {
      setLoadingSession(false);
    }
  };

  const startNewChat = () => {
    setActiveSession(null);
    setMessages([welcomeMessage]);
    setContextDocuments([]);
    setStreamError("");
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/chat/${id}`);
      setHistory((prev) => prev.filter((h) => h._id !== id));
      if (activeSession === id) startNewChat();
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleSend = async () => {
    const trimmed = question.trim();
    if (!trimmed || isStreaming) return;

    if (isListening) recognitionRef.current.stop(); // Turn off mic automatically on submit

    setStreamError("");
    const userMsg = { id: `u-${Date.now()}`, type: "user", message: trimmed, time: formatTime() };
    const aiMsgId = `a-${Date.now()}`;

    const priorHistory = messages.filter((m) => m.id !== "welcome").map((m) => ({ role: m.type === "user" ? "user" : "assistant", content: m.message }));

    setMessages((prev) => [...prev, userMsg, { id: aiMsgId, type: "ai", message: "", time: formatTime() }]);
    setQuestion("");
    setIsStreaming(true);

    const doStream = async (token) => {
      return fetch(`${api.defaults.baseURL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question: trimmed,
          documentNames: contextDocuments.map((d) => d.fileName),
          documentTitles: contextDocuments.map((d) => d.title),
          history: priorHistory,
          sessionId: activeSession,
        }),
      });
    };

    try {
      let token = localStorage.getItem("accessToken");
      let response = await doStream(token);

      if (response.status === 401) {
        const refreshRes = await api.post("/users/refresh");
        token = refreshRes.data.accessToken;
        localStorage.setItem("accessToken", token);
        response = await doStream(token);
      }

      if (!response.ok || !response.body) throw new Error("Failed to connect to the AI engine.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          if (!rawEvent.startsWith("data: ")) continue;

          let evt;
          try { evt = JSON.parse(rawEvent.slice(6)); } catch { continue; }

          if (evt.type === "session") {
            setActiveSession(evt.sessionId);
            if (evt.contextDocuments) setContextDocuments(evt.contextDocuments);
          } else if (evt.type === "chunk") {
            setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, message: m.message + evt.content } : m)));
          } else if (evt.type === "done") {
            setHistory((prev) => {
              const exists = prev.some((h) => h._id === evt.sessionId);
              if (exists) return prev.map((h) => (h._id === evt.sessionId ? { ...h, title: evt.title } : h));
              return [{ _id: evt.sessionId, title: evt.title }, ...prev];
            });
          } else if (evt.type === "error") {
            setStreamError(evt.error);
          }
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
      setStreamError("Connection to the AI engine failed.");
      setMessages((prev) => prev.map((m) => (m.id === aiMsgId && !m.message ? { ...m, message: "Sorry — I couldn't reach the AI engine. Please try again." } : m)));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50/50 p-8 space-y-8 flex flex-col justify-start relative">
        <div className="bg-gradient-to-br from-[#363062] via-[#4D4C7D] to-[#363062] rounded-3xl p-10 text-white shadow-xl shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0 border border-white/10">
              <Bot size={32} className="text-[#DFCFEE]" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Industrial AI Copilot</h1>
              <p className="text-sm font-medium text-[#DFCFEE]/80 mt-2 max-w-2xl">
                Execute cross-functional neural inquiries across localized operating blueprints, historical logs, safety frameworks, and diagnostic logs.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
          {[
            { title: "System Status", value: "Operational", icon: Sparkles, state: "success" },
            { title: "Knowledge Index", value: "Live", icon: FileText, state: "default" },
            { title: "Session", value: activeSession ? "Restored" : "New", icon: Search, state: "default" },
            { title: "Latency Matrix", value: isStreaming ? "Streaming..." : "Idle", icon: Clock3, state: "default" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-[#363062]/10 shadow-sm flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border shrink-0 ${item.state === "success" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-[#DFCFEE]/40 text-[#363062] border-[#363062]/5"}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-tight text-[#4D4C7D] uppercase">{item.title}</p>
                  <h3 className={`text-xl font-bold mt-1 ${item.state === "success" ? "text-emerald-700" : "text-[#363062]"}`}>{item.value}</h3>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl border border-[#363062]/10 shadow-sm overflow-hidden flex flex-col min-h-[600px] flex-1 relative">
          <div className="flex items-center justify-between border-b border-[#363062]/10 p-6 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <button onClick={() => setShowHistory(true)} className="p-3 rounded-2xl border border-[#363062]/10 bg-white text-[#363062] hover:bg-[#DFCFEE]/30 hover:border-[#363062]/30 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 font-semibold text-sm" title="View History Pipeline">
                <History size={18} /><span>History</span>
              </button>
              <div className="h-6 w-px bg-[#363062]/10 hidden sm:block" />
              <div className="hidden sm:block">
                <h2 className="text-lg font-bold tracking-tight text-[#363062]">AI Workspace Session</h2>
                <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected to Company Knowledge Base
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {contextDocuments.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap max-w-md">
                  {contextDocuments.map((doc, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-[#DFCFEE]/40 border border-[#363062]/10 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#363062]">
                      <FileText size={12} />
                      <span className="truncate max-w-[100px]">{doc.title}</span>
                      <button onClick={() => setContextDocuments((prev) => prev.filter((_, idx) => idx !== i))} className="text-[#4D4C7D] hover:text-rose-500">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={startNewChat} className="px-5 py-2.5 rounded-2xl border border-[#363062]/10 bg-white text-[#363062] hover:bg-[#DFCFEE]/20 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-sm">
                <Plus size={14} /> New Chat
              </button>
            </div>
          </div>

          {showHistory && (
            <>
              <div className="absolute inset-0 bg-black/20 backdrop-blur-xs z-30 transition-opacity duration-300" onClick={() => { setShowHistory(false); setHistorySearchQuery(""); }} />
              <div className="absolute top-0 left-0 bottom-0 w-85 bg-white border-r border-[#363062]/10 shadow-2xl z-40 flex flex-col justify-between p-6 animate-in slide-in-from-left duration-200">
                <div className="flex flex-col h-full min-h-0">
                  <div className="flex items-center justify-between pb-4 border-b border-[#363062]/10">
                    <div className="flex items-center gap-2"><History size={16} className="text-[#363062]" /><h2 className="text-sm font-bold tracking-tight text-[#363062]">Recent Conversations</h2></div>
                    <button onClick={() => { setShowHistory(false); setHistorySearchQuery(""); }} className="p-1.5 rounded-xl text-[#4D4C7D] hover:text-[#363062] hover:bg-[#DFCFEE]/40 transition-colors"><X size={16} /></button>
                  </div>
                  <div className="my-4 flex items-center bg-slate-50 border border-[#363062]/10 focus-within:border-[#363062]/30 rounded-xl px-3 transition-colors duration-150">
                    <Search className="text-[#4D4C7D]/60 shrink-0" size={14} />
                    <input type="text" value={historySearchQuery} onChange={(e) => setHistorySearchQuery(e.target.value)} placeholder="Search session history logs..." className="w-full bg-transparent outline-none px-2 py-2 text-xs text-[#363062] placeholder-[#4D4C7D]/50 font-medium" />
                    {historySearchQuery && <button onClick={() => setHistorySearchQuery("")} className="text-[#4D4C7D]/60 hover:text-[#363062]"><X size={12} /></button>}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-8 text-[#4D4C7D] text-xs gap-2"><Loader2 size={16} className="animate-spin" /> Loading sessions...</div>
                    ) : filteredHistory.length > 0 ? (
                      filteredHistory.map((chat) => (
                        <button key={chat._id} onClick={() => selectSession(chat._id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs font-medium transition-all duration-200 group border ${activeSession === chat._id ? "bg-[#363062] border-[#363062] text-white font-semibold shadow-md" : "bg-slate-50/50 border-transparent text-[#4D4C7D] hover:bg-[#DFCFEE]/30 hover:text-[#363062]"}`}>
                          <MessageSquare size={14} className={`shrink-0 ${activeSession === chat._id ? "text-white" : "text-[#4D4C7D]/60 group-hover:text-[#363062]"}`} />
                          <span className="truncate flex-1">{chat.title || "New Conversation"}</span>
                          <span onClick={(e) => handleDeleteSession(chat._id, e)} className={`shrink-0 p-1 rounded-lg hover:bg-rose-100 hover:text-rose-600 ${activeSession === chat._id ? "text-white/70" : "text-[#4D4C7D]/40"}`}><X size={12} /></span>
                        </button>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center px-4"><Search size={20} className="text-[#4D4C7D]/40 mb-2" /><p className="text-xs font-medium text-[#4D4C7D]/60">No matched logs in pipeline data store.</p></div>
                    )}
                  </div>
                </div>
                <button onClick={() => { startNewChat(); setShowHistory(false); setHistorySearchQuery(""); }} className="mt-6 w-full py-3 rounded-2xl border-2 border-dashed border-[#363062]/20 hover:border-[#363062]/40 bg-white text-[#363062] hover:bg-[#DFCFEE]/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm shrink-0">
                  <Plus size={14} /> New Workspace Pipeline
                </button>
              </div>
            </>
          )}

          <div className="bg-slate-50/30 px-6 py-4 border-b border-[#363062]/5 flex gap-3 overflow-x-auto scrollbar-none shrink-0">
            {suggestedQuestions.map((item, index) => (
              <button key={index} onClick={() => setQuestion(item)} className="bg-white hover:bg-[#DFCFEE]/30 text-left border border-[#363062]/10 hover:border-[#363062]/30 px-4 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold text-[#4D4C7D] hover:text-[#363062] whitespace-nowrap shadow-xs shrink-0">
                {item}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-between bg-white relative">
            <div ref={scrollRef} className="absolute inset-0 bottom-24 overflow-y-auto p-6 space-y-6 scrollbar-none">
              {loadingSession ? (
                <div className="flex items-center justify-center h-full text-[#4D4C7D] gap-2 text-sm"><Loader2 size={18} className="animate-spin" /> Loading conversation...</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.type === "ai" && (
                      <div className="h-10 w-10 rounded-2xl bg-[#363062] text-white flex items-center justify-center shrink-0 border border-[#4D4C7D]/20 shadow-sm"><Bot size={20} /></div>
                    )}
                    <div className={`max-w-[75%] rounded-3xl p-5 text-sm leading-relaxed shadow-xs whitespace-pre-wrap ${msg.type === "user" ? "bg-[#363062] text-white font-medium" : "bg-slate-50 text-[#363062] border border-[#363062]/5"}`}>
                      <p>
                        {msg.message}
                        {isStreaming && msg.id.startsWith("a-") && msg === messages[messages.length - 1] && (
                          <span className="inline-block w-1.5 h-4 bg-[#363062]/40 ml-1 animate-pulse align-middle" />
                        )}
                      </p>
                      {msg.time && <span className="text-[10px] opacity-60 block mt-3 text-right">{msg.time}</span>}
                    </div>
                  </div>
                ))
              )}
              {streamError && <p className="text-xs font-semibold text-rose-500 text-center">{streamError}</p>}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-24 border-t border-[#363062]/10 p-5 bg-slate-50/50 flex items-center shrink-0">
              <div className="w-full flex items-center gap-3 bg-white border border-[#363062]/10 rounded-2xl px-4 py-2.5 focus-within:border-[#363062]/40 transition-colors shadow-xs">
                <input 
                  type="text" 
                  value={question} 
                  onChange={(e) => setQuestion(e.target.value)} 
                  onKeyDown={handleKeyDown} 
                  disabled={isStreaming} 
                  placeholder={isListening ? "Listening to your voice..." : "Query active structural plant parameters..."} 
                  className="flex-1 bg-transparent outline-none py-2 text-sm text-[#363062] placeholder-[#4D4C7D]/50 font-medium disabled:opacity-60" 
                />
                <div className="flex items-center gap-2">
                  
                  {/* 🟢 AUDIO CAPTURE BUTTON TRIGGER WITH RED GLOW ANIMATION WHEN LIVE */}
                  <button 
                    onClick={toggleListeningAction}
                    disabled={isStreaming}
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 relative ${
                      isListening 
                        ? "bg-rose-500 text-white shadow-md animate-pulse shadow-rose-300" 
                        : "text-[#4D4C7D] hover:text-[#363062] hover:bg-slate-100 bg-transparent"
                    }`}
                    title={isListening ? "Stop Recording" : "Start Voice Dictation"}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  <button onClick={handleSend} disabled={isStreaming || !question.trim()} className="h-10 w-10 rounded-xl bg-[#363062] hover:bg-[#4D4C7D] text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
                    {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AICopilot;