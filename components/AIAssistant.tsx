import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { aiService } from '../services/aiService';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_CONTEXT = `You are A.D.E.P.T. (Autonomous Defensive & Emergency Protocol Thread), the AI assistant embedded in the EquiNex Universal Dashboard. You have access to real-time system telemetry including:

- Module status (Biome Generation, User Tracker, Multimodal Nexus, Syntax AI Captcoder)
- Security events (firewall rules, brute-force detection, DDoS mitigation)
- File integrity monitoring (hash verification, tampering detection)
- Network traffic analysis (packet counts, attack detection)
- Endpoint inventory (Windows EOL tracking, isolation status)

You are authoritative, direct, and security-focused. You provide actionable intelligence, not vague suggestions. When discussing threats, be specific about CVEs, attack vectors, and mitigation steps. Keep responses concise and tactical.

If the user asks about system status, reference the dashboard modules. If they ask about security, reference the threat landscape. If they ask about operations, reference the A.D.E.P.T. operative actions.`;

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content: 'A.D.E.P.T. online. All modules reporting. How can I assist with system operations?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .slice(-10) // Last 10 messages for context window
        .map((m) => `${m.role === 'user' ? 'User' : 'A.D.E.P.T.'}: ${m.content}`)
        .join('\n');

      const prompt = conversationHistory
        ? `${SYSTEM_CONTEXT}\n\nRecent conversation:\n${conversationHistory}\n\nUser: ${trimmed}\n\nA.D.E.P.T.:`
        : `${SYSTEM_CONTEXT}\n\nUser: ${trimmed}\n\nA.D.E.P.T.:`;

      const response = await aiService.generateText(prompt);

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Connection to AI core interrupted. Retry or check API key configuration.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: 'Session cleared. A.D.E.P.T. online. How can I assist?',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="glass-panel p-4 rounded-xl h-full flex flex-col min-h-[400px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--color-primary-from)]" />
          <h3 className="text-xl font-black font-display text-[var(--color-text-primary)] tracking-wider">
            AI ASSISTANT
          </h3>
        </div>
        <button
          onClick={clearChat}
          className="p-1.5 rounded-lg hover:bg-[var(--color-bg-card)] transition-colors text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-primary-from)]/20 flex items-center justify-center mt-1">
                <Bot className="w-4 h-4 text-[var(--color-primary-from)]" />
              </div>
            )}
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm font-mono leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--color-primary-from)]/15 text-[var(--color-text-primary)] border border-[var(--color-primary-from)]/20'
                  : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center mt-1">
                <User className="w-4 h-4 text-[var(--color-text-secondary)]" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-primary-from)]/20 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-[var(--color-primary-from)] animate-spin" />
            </div>
            <div className="px-3 py-2 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              <span className="text-sm font-mono text-[var(--color-text-tertiary)] animate-pulse">
                Processing...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask A.D.E.P.T. anything..."
          disabled={isLoading}
          className="flex-1 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm font-mono text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-from)]/50 transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-3 py-2 rounded-lg bg-[var(--color-primary-from)]/20 border border-[var(--color-primary-from)]/30 text-[var(--color-primary-from)] hover:bg-[var(--color-primary-from)]/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
