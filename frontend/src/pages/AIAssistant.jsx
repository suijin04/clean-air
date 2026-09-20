import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Info,
  Clock,
  Database,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { sendChatMessage } from '../services/api';

const SUGGESTED_QUESTIONS = [
  "What is the AQI and how is it calculated?",
  "What does PM2.5 mean and why is it harmful?",
  "How can I reduce my exposure to air pollution?",
  "Why is air pollution high in major cities?",
  "Explain today's air quality in simple terms."
];

export default function AIAssistant({ activeCity, cityData }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am CleanAir AI Assistant, your environmental intelligence guide.\n\nI can explain criteria pollutants (PM2.5, PM10, NO₂, SO₂, CO, O₃), analyze current atmospheric telemetry for **${activeCity || 'selected cities'}**, compare urban conditions, and share evidence-based protective actions.\n\nHow may I help you understand your air today?`,
      source: 'CleanAir AI',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDemo: cityData?.is_demo ?? true
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText = null) => {
    const query = (questionText || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(query, activeCity, cityData);
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply,
        source: res.source || 'OpenAQ & Groq',
        timestamp: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: res.is_demo,
        provider: res.provider
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I am currently unable to process your request. Please ensure the backend is running and try again.',
        source: 'Error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Environmental Intelligence</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            CleanAir AI Assistant
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Contextual reasoning grounded in real-time OpenAQ measurements & US EPA standards
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Active Context: <strong className="text-slate-800 font-semibold">{activeCity || 'Global'}</strong></span>
        </div>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Suggested Questions:
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 shadow-2xs transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200/70 text-slate-800 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {m.role === 'assistant' && (
                  <div className="border-t border-slate-200/60 pt-2 mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3 text-emerald-600" />
                      <span>{m.source || 'OpenAQ'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{m.timestamp}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 rounded-tl-none flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-slate-400 font-medium">Synthesizing environmental telemetry...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask CleanAir AI about pollutants, health guidelines, or city air quality..."
            disabled={loading}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 shadow-2xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Grounding & Ethics Footer */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 text-[11px] text-slate-500 flex items-start gap-2.5 shadow-2xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-700 font-semibold">Responsible AI Grounding:</strong> Answers regarding current atmospheric conditions are strictly anchored in latest OpenAQ sensor feeds. CleanAir AI never fabricates measurements, timestamps, or monitoring stations. This service provides educational environmental awareness and does not substitute for licensed medical advice.
        </div>
      </div>
    </div>
  );
}
