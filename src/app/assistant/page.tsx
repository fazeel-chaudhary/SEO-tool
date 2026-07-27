'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useOrg } from '@/context/org-context';
import { AiAssistantService } from '@/services/ai-assistant-service';
import { ChatMessage } from '@/lib/types';
import { Send, Bot, User, Building2, HelpCircle, ArrowRight, Table as TableIcon } from 'lucide-react';

/** Smart Markdown & Table Formatter Component */
function FormattedMessage({ content }: { content: string }) {
  // Parse inline text (bold, badges, status indicators)
  const renderInline = (text: string) => {
    // Replace **bold** with styled spans
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\])/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-extrabold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('[') && part.endsWith(']')) {
        const badgeText = part.slice(1, -1);
        const isHigh = badgeText.includes('HIGH') || badgeText.includes('URGENT');
        return (
          <span
            key={idx}
            className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mx-1 ${
              isHigh
                ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300'
                : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
            }`}
          >
            {badgeText}
          </span>
        );
      }
      return part;
    });
  };

  // Split content into blocks (paragraphs, headers, tables, lists)
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let tableLines: string[] = [];

  const flushTable = (key: number) => {
    if (tableLines.length === 0) return;

    // Filter out separator lines (|---|)
    const validLines = tableLines.filter((l) => !l.replace(/\|/g, '').replace(/-/g, '').trim().length === false);
    if (validLines.length > 0) {
      const headerLine = validLines[0];
      const headers = headerLine
        .split('|')
        .map((h) => h.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      const rowLines = validLines.slice(1).filter((l) => !l.includes('---'));
      const rows = rowLines.map((row) =>
        row
          .split('|')
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      );

      elements.push(
        <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-750 shadow-sm bg-white dark:bg-slate-900">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-3.5 py-2.5">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="odd:bg-white even:bg-slate-50/60 dark:odd:bg-slate-900 dark:even:bg-slate-850/50 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-slate-800 dark:text-slate-200">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableLines = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check if line belongs to a markdown table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableLines.push(trimmed);
      return;
    } else {
      flushTable(idx);
    }

    if (!trimmed) {
      elements.push(<div key={idx} className="h-1.5" />);
      return;
    }

    // Markdown Headers (###)
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="font-extrabold text-sm text-slate-900 dark:text-white mt-3 mb-1 flex items-center">
          {renderInline(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      return;
    }

    // Numbered lists or bullet items
    if (/^\d+\.\s+/.test(trimmed) || trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      elements.push(
        <div key={idx} className="flex items-start space-x-2 my-1 pl-1 text-slate-800 dark:text-slate-200">
          <span className="text-brand-500 font-bold shrink-0 mt-0.5">•</span>
          <div className="flex-1">{renderInline(trimmed.replace(/^(\d+\.|\•|-)\s+/, ''))}</div>
        </div>
      );
      return;
    }

    // Regular text paragraph
    elements.push(
      <p key={idx} className="my-1 text-slate-800 dark:text-slate-200">
        {renderInline(trimmed)}
      </p>
    );
  });

  flushTable(lines.length);

  return <div className="space-y-1">{elements}</div>;
}

export default function AssistantPage() {
  const { activeLocation, locations } = useOrg();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content: `### 👋 Welcome to your AI Local SEO Advisor!\n\nI have live access to all **${locations.length} connected business profile${locations.length !== 1 ? 's' : ''}**, rankings, citations, reviews, and competitor intelligence for **${activeLocation?.name}**.\n\nAsk me any question — including **competitor comparisons**, **multi-location benchmarking**, or **action plans**!`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!activeLocation) {
    return (
      <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-800 dark:text-slate-200">No Location Selected</h2>
        <p className="text-xs text-slate-500">Select a location to chat with the AI Assistant.</p>
      </div>
    );
  }

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    try {
      const aiReplyText = await AiAssistantService.answerUserQuery(activeLocation, query, locations);
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: aiReplyText,
        timestamp: new Date().toISOString(),
      };
      setMessages([...newHistory, aiMsg]);
    } catch (err) {
      console.error('AI query call failure:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const samplePrompts = [
    'Compare all my locations',
    'Analyze my competitors vs my business',
    'Why did my rankings drop?',
    'Show citation opportunities table',
    'Generate step-by-step action plan',
    'What optimization strategies should I use?',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
          <Bot className="w-7 h-7 mr-2.5 text-brand-600 dark:text-brand-400" />
          AI Local SEO Chat Assistant
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Structured AI data advisor with Markdown tables & live retrieval for <span className="font-bold">{activeLocation.name}</span>
        </p>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm flex items-center"
          >
            <span>{prompt}</span>
            <ArrowRight className="w-3 h-3 ml-1.5 text-brand-500" />
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[440px] max-h-[550px] overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-brand-600 text-white font-medium shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100'
              }`}
            >
              {m.role === 'user' ? m.content : <FormattedMessage content={m.content} />}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 font-bold text-xs">
                You
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center space-x-2">
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-3"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask AI Assistant anything (e.g. 'Compare all my locations in a table')..."
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
        />
        <button
          type="submit"
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm shadow-brand-600/20 flex items-center space-x-1.5"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
