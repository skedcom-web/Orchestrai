import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  Send, 
  X, 
  RefreshCw, 
  Bot, 
  User, 
  Sparkles
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isFaq?: boolean;
}

export const QuickHelp: React.FC = () => {
  const { systemConfig } = useApp();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic price reference
  const currentPrice = systemConfig?.certificationPrice ?? 99;

  // FAQ List Definition (includes dynamic certification price)
  const faqList = [
    {
      id: 'faq-1',
      question: 'What is the OrchestrAI Lead Certification?',
      answer: 'OrchestrAI Lead is an elite, hands-on certification designed by Sithanandham Radhakrishnan at vThink Global Technologies to train engineers in building production-ready enterprise applications using AI orchestration rather than simple prompt engineering. Candidates build real portfolio pieces rather than toy applications.',
      keywords: ['orchestrai', 'lead', 'certification', 'what is', 'framework', 'about']
    },
    {
      id: 'faq-2',
      question: 'Are Modules 1 & 2 really free?',
      answer: 'Yes, absolutely! Modules 1 and 2, including study resources and practice quizzes, are completely free to start. This lets you learn the core framework principles before making any financial commitment.',
      keywords: ['free', 'cost', 'modules 1', 'modules 2', 'charges', 'free modules', 'study']
    },
    {
      id: 'faq-3',
      question: 'How do I pass the Quiz?',
      answer: 'You must score 80% or higher on the Module Quiz to unlock subsequent stages. This gate ensures you have fully mastered the concepts before moving on to hands-on development.',
      keywords: ['quiz', 'pass', 'gate', 'score', '80%', 'percentage', 'test', 'exam']
    },
    {
      id: 'faq-4',
      question: `What is the ₹${currentPrice} certification fee for?`,
      answer: `The certification fee of ₹${currentPrice} is a dynamic price set by the administrator to act as a "commitment signal". When candidates invest in their learning, they show serious intent. It covers our SME evaluation costs and manual project reviews for your capstone project.`,
      keywords: ['fee', 'price', 'payment', 'pay', 'charge', '99', '199', '299', 'cost', 'investment', 'money', 'rupees', 'rs']
    },
    {
      id: 'faq-5',
      question: 'What is the Capstone Project?',
      answer: 'You will build a production-grade enterprise application (like a Timesheet Portal or Issue Tracker) using the 6-stage OrchestrAI Loop. Your project is backed by a live GitHub repo for recruiters to inspect.',
      keywords: ['capstone', 'project', 'build', 'ship', 'loop', 'github', 'portfolio', 'practical']
    },
    {
      id: 'faq-6',
      question: 'How does priority hiring referral work?',
      answer: 'Candidates scoring 90% or higher are prioritized for referrals to our partner IT network, matching them directly with firms looking for skilled OrchestrAI Architects.',
      keywords: ['hiring', 'referral', 'job', 'placement', 'partner', '90%', 'interview', 'work', 'recruit']
    },
    {
      id: 'faq-7',
      question: 'Who is the founder Sithanandham Radhakrishnan?',
      answer: 'Sithanandham Radhakrishnan is the Chief OrchestrAI Architect, Strategic Advisor, and Product Owner of vThink Global Technologies. He has over 24 years of hands-on experience across Banking, Insurance, Telecom, and Capital Markets, with clients including Barclays, Verizon, ING, and Merrill Lynch. He developed the Proved-in-Practice (PIP) OrchestrAI framework to dramatically accelerate software delivery securely (OWASP-aligned, RBAC, GDPR-ready) at a fraction of traditional development costs.',
      keywords: ['founder', 'sithanandham', 'radhakrishnan', 'experience', 'advisor', 'author', 'who is sitha', 'years']
    }
  ];

  // Load chat history from sessionStorage
  useEffect(() => {
    const savedChat = sessionStorage.getItem('orchestrai_chat_history');
    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {
        initializeWelcomeMessage();
      }
    } else {
      initializeWelcomeMessage();
    }
  }, [currentPrice]); // Re-initialize if the price updates to ensure FAQs are fresh

  // Save chat history to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('orchestrai_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom whenever messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initializeWelcomeMessage = () => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! I am your OrchestrAI Ask Assistant. How can I help you today? Feel free to select any of the common topics below or type your question directly.`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMsg]);
  };

  const handleSelectFaq = (question: string, answer: string) => {
    if (isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: new Date().toISOString(),
      isFaq: true
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: answer,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleSendText = () => {
    if (!inputVal.trim() || isTyping) return;

    const userQuery = inputVal.trim();
    setInputVal('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const lowerQuery = userQuery.toLowerCase();
      
      // Keyword matching algorithm
      let bestMatch = null;
      let highestMatchCount = 0;

      faqList.forEach(faq => {
        let matchCount = 0;
        faq.keywords.forEach(keyword => {
          if (lowerQuery.includes(keyword)) {
            matchCount++;
          }
        });

        // Award extra weight if exact phrase match is found
        if (lowerQuery.includes(faq.question.toLowerCase())) {
          matchCount += 5;
        }

        if (matchCount > highestMatchCount) {
          highestMatchCount = matchCount;
          bestMatch = faq;
        }
      });

      let responseText = '';
      if (bestMatch && highestMatchCount > 0) {
        responseText = (bestMatch as any).answer;
      } else {
        // Professional fallback message
        responseText = `I couldn't find a precise match for "${userQuery}" in our standard FAQs. 

For direct assistance, you can:
- Email our support desk at **${systemConfig?.contactEmail || 'support@vthinkglobal.com'}**
- Call our team at **${systemConfig?.contactPhone || '+91 98765 43210'}**
- Try rephrasing your question or click one of the pre-listed FAQs below!`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: responseText,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleReset = () => {
    sessionStorage.removeItem('orchestrai_chat_history');
    initializeWelcomeMessage();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* ─── CHATBOX PANEL ─── */}
      <div 
        className={`glass-card mb-4 w-96 max-w-[calc(100vw-2rem)] h-[520px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] bg-[var(--bg-card)] transition-all duration-300 origin-bottom-right ${
          isOpen 
            ? 'scale-100 opacity-100 pointer-events-auto translate-y-0' 
            : 'scale-90 opacity-0 pointer-events-none translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15">
                <Bot className="h-5 w-5 text-indigo-200" />
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-indigo-750" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h4 className="text-xs font-bold tracking-tight">Ask Assistant</h4>
                <Sparkles className="h-3 w-3 text-cyan-300 animate-pulse" />
              </div>
              <span className="text-[10px] text-indigo-200 font-medium leading-none">OrchestrAI Helpdesk</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleReset}
              title="Reset Chat"
              className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-100 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-100 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-500/3">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div key={msg.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200`}>
                <div className={`flex gap-2 max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Avatar bubble */}
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border text-[10px] font-bold ${
                    isBot 
                      ? 'bg-slate-500/10 border-slate-500/20 text-[var(--text-secondary)]' 
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                  }`}>
                    {isBot ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  </div>

                  {/* Text bubble */}
                  <div className={`p-3 rounded-2xl text-[11px] leading-relaxed whitespace-pre-line shadow-sm border ${
                    isBot 
                      ? 'bg-[var(--surface-sunken)] border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-sm' 
                      : 'bg-indigo-650 dark:bg-indigo-600 border-indigo-500/20 text-white rounded-tr-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-100">
              <div className="flex gap-2 max-w-[80%]">
                <div className="h-7 w-7 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-[var(--surface-sunken)] border border-[var(--border-color)] rounded-tl-sm flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* FAQ Options Area (Pre-listed clickable questions) */}
          {!isTyping && (
            <div className="pt-2 space-y-2 border-t border-[var(--border-color)]">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-extrabold block mb-1">
                Pre-listed Help Topics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {faqList.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleSelectFaq(faq.question, faq.answer)}
                    className="text-[10px] text-left px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] text-[var(--text-primary)] hover:border-indigo-400 hover:bg-slate-500/5 transition-all duration-150 cursor-pointer animate-in fade-in zoom-in-95 duration-200"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--surface-sunken)] shrink-0 flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            placeholder="Ask a custom question..."
            disabled={isTyping}
            className="flex-grow bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
          />
          <button
            onClick={handleSendText}
            disabled={!inputVal.trim() || isTyping}
            className="h-8 w-8 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white flex items-center justify-center shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ─── FLOATING ACTION BUTTON (FAB) ─── */}
      <button 
        id="quick-help-fab"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative group ${
          isOpen ? 'rotate-90' : ''
        }`}
        style={{ boxShadow: 'var(--btn-shadow)' }}
      >
        {/* Pulsing Outer Glow */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-60 blur-sm group-hover:opacity-80 transition-opacity animate-pulse pointer-events-none" />
        
        {isOpen ? (
          <X className="h-6 w-6 relative z-10" />
        ) : (
          <MessageSquare className="h-6 w-6 relative z-10" />
        )}
      </button>
    </div>
  );
};
