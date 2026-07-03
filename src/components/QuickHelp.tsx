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

type FQA_Category = 'general' | 'syllabus' | 'capstone';

export const QuickHelp: React.FC = () => {
  const { systemConfig } = useApp();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<FQA_Category>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic price reference
  const currentPrice = systemConfig?.certificationPrice ?? 99;

  // FAQ List Definition categorized for neatness
  const faqCategories = {
    general: [
      {
        id: 'gen-1',
        question: 'What is the OrchestrAI Lead Certification?',
        answer: 'OrchestrAI Lead is an elite, hands-on certification designed by Sithanandham Radhakrishnan at vThink Global Technologies to train engineers in building production-ready enterprise applications using AI orchestration rather than simple prompt engineering. Candidates build real portfolio pieces rather than toy applications.',
        keywords: ['orchestrai', 'lead', 'certification', 'what is', 'framework', 'about']
      },
      {
        id: 'gen-2',
        question: 'Are Modules 1 & 2 really free?',
        answer: 'Yes, absolutely! Modules 1 and 2, including study resources and practice quizzes, are completely free to start. This lets you learn the core framework principles before making any financial commitment.',
        keywords: ['free', 'cost', 'modules 1', 'modules 2', 'charges', 'free modules', 'study']
      },
      {
        id: 'gen-3',
        question: `What is the ₹${currentPrice} certification fee for?`,
        answer: `The certification fee of ₹${currentPrice} is a dynamic price set by the administrator to act as a "commitment signal". When candidates invest in their learning, they show serious intent. It covers our SME evaluation costs and manual project reviews for your capstone project.`,
        keywords: ['fee', 'price', 'payment', 'pay', 'charge', '99', '199', '299', 'cost', 'investment', 'money', 'rupees', 'rs']
      },
      {
        id: 'gen-4',
        question: 'Who is the founder Sithanandham Radhakrishnan?',
        answer: 'Sithanandham Radhakrishnan is the Chief OrchestrAI Architect, Strategic Advisor, and Product Owner of vThink Global Technologies. He has over 24 years of hands-on experience across Banking, Insurance, Telecom, and Capital Markets, with clients including Barclays, Verizon, ING, and Merrill Lynch. He developed the Proved-in-Practice (PIP) OrchestrAI framework to dramatically accelerate software delivery securely (OWASP-aligned, RBAC, GDPR-ready) at a fraction of traditional development costs.',
        keywords: ['founder', 'sithanandham', 'radhakrishnan', 'experience', 'advisor', 'author', 'who is sitha', 'years']
      }
    ],
    syllabus: [
      {
        id: 'syl-1',
        question: 'Tell me key highlights of Modules 1 & 2',
        answer: '• Module 1 (The Mindset): Shifting from manual coding to AI orchestration. Includes the Prompt Simulator lab.\n• Module 2 (Architecture): The 6 Core Principles and the 6-stage lifecycle loop (Intent → Orchestrate → Generate → Validate → Evolve → Deploy). Requires an 80% score on the Quiz gate to pass.',
        keywords: ['module 1', 'module 2', 'mindset', 'architecture', 'loop', 'principles']
      },
      {
        id: 'syl-2',
        question: 'What do we learn in Modules 3, 4 & 5?',
        answer: '• Module 3 (The Bible): Setup OGE (Observability, Guardrails, Evaluation) and master T1 + T2 prompts.\n• Module 4 (Foundation): Day 1-3 of building the Issue Tracker (Auth, Shell, Dashboard).\n• Module 5 (Workflow): Day 4-5 of the build (16-transition status matrix, comment logs, Git commit workflows).',
        keywords: ['module 3', 'module 4', 'module 5', 'bible', 'auth', 'dashboard', 'workflow', 'transition']
      },
      {
        id: 'syl-3',
        question: 'What do we learn in Modules 6 & 7?',
        answer: '• Module 6 (Going Live): Day 6-7 of build (Admin, excel/pdf reports export, UAT testing, pushing to GitHub).\n• Module 7 (Capstone): Self-paced 5-day project choosing from 30 enterprise projects, deployed to Firebase.',
        keywords: ['module 6', 'module 7', 'admin', 'reports', 'pdf', 'excel', 'capstone', 'deploy']
      },
      {
        id: 'syl-4',
        question: 'Which module is easy/hard?',
        answer: '• Easiest: Module 1 is the easiest conceptually as it focuses on mindset alignment and completing the initial Prompt Simulator lab.\n• Hardest: Module 7 is the most challenging, requiring you to build, deploy, and document a complete enterprise application from scratch in 5 days.',
        keywords: ['easy', 'hard', 'difficult', 'easiest', 'hardest', 'simple', 'challenge']
      }
    ],
    capstone: [
      {
        id: 'cap-1',
        question: 'How is the Capstone project scored?',
        answer: 'The capstone is scored out of 100 points:\n• Workflow logic: 20 pts\n• RBAC security: 15 pts\n• Business Transactions: 15 pts\n• Authentication: 10 pts\n• Dashboard interface: 10 pts\n• Master Data: 10 pts\n• PDF/Excel Reports: 10 pts\n• Firebase Deployment: 5 pts\n• Documentation (README & DESIGN.md): 5 pts',
        keywords: ['scoring', 'rubric', 'score', 'points', 'matrix', 'marks', 'grading']
      },
      {
        id: 'cap-2',
        question: 'What are the passing & referral scores?',
        answer: 'According to the Master Capstone Manual v7.0:\n• Score >= 85: Certified (Outstanding)\n• Score >= 70: Certified (Pass)\n• Score 50-69: Rework Recommended\n• Score < 50: Rebuild Required\n\n*Note: Scorers >= 90% are flagged for priority hiring referrals to our partner IT placement network!*',
        keywords: ['passing', 'pass', 'referral', 'score requirement', 'outstanding', 'rework', 'fail']
      },
      {
        id: 'cap-3',
        question: 'What is in the mandatory submission package?',
        answer: 'You must submit the following package:\n1. GitHub Repository URL (must contain clean code & documentation)\n2. Deployed Firebase App URL\n3. README explaining the project\n4. Screenshots of key screens\n5. Visual Workflow Diagram showing transitions',
        keywords: ['submission', 'package', 'checklist', 'submit', 'requirements', 'github', 'diagram']
      },
      {
        id: 'cap-4',
        question: 'How do I deploy my demo app effectively?',
        answer: 'We recommend deploying your demo app to Firebase Hosting:\n1. Build your production package: run `npm run build` in your project folder.\n2. Initialize hosting: run `firebase init hosting` if not already initialized.\n3. Deploy the application: run `firebase deploy --only hosting` to publish. This generates a public URL you can submit.',
        keywords: ['deploy', 'firebase', 'hosting', 'host', 'publish', 'demo', 'url', 'how to deploy']
      }
    ]
  };

  // Flattened FAQ list for matching algorithm
  const allFaqs = [
    ...faqCategories.general,
    ...faqCategories.syllabus,
    ...faqCategories.capstone
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
  }, [currentPrice]);

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
      text: `Hello! I am your OrchestrAI Ask Assistant. How can I help you today?\n\nSelect a category below to browse topics, or type any question regarding modules, capstones, scoring, or deployment.`,
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

  // Robust query parser
  const parseUserQuery = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    // 1. Module specific highlights
    if (lowerQuery.includes('module 1') || lowerQuery.includes(' m1 ') || lowerQuery.includes(' m1') && lowerQuery.endsWith('m1') || lowerQuery.includes('mindset')) {
      return 'Module 1 teaches "The OrchestrAI Mindset". You learn to shift from manual coding to AI orchestration (Intent → Constraints → Review). It features slide decks with avatar audio and the Prompt Simulator lab.';
    }
    if (lowerQuery.includes('module 2') || lowerQuery.includes(' m2 ') || lowerQuery.includes(' m2') && lowerQuery.endsWith('m2') || lowerQuery.includes('principle') || lowerQuery.includes('lifecycle')) {
      return 'Module 2 details the "OrchestrAI Framework Architecture". You study the 6 Core Principles and the 6-stage lifecycle loop (Intent → Orchestrate → Generate → Validate → Evolve → Deploy). To complete it, you must pass the Module Quiz (≥ 80%).';
    }
    if (lowerQuery.includes('module 3') || lowerQuery.includes(' m3 ') || lowerQuery.includes(' m3') && lowerQuery.endsWith('m3') || lowerQuery.includes('bible') || lowerQuery.includes('oge')) {
      return 'Module 3 is "The OrchestrAI Bible — Governance-First Setup". You establish OGE (Observability, Guardrails, Evaluation) rules, master T1/T2 prompts, and inspect the 5 core specifications (FDD, TDD, DB, UI, Test Plan) that build our Issue Tracker reference project.';
    }
    if (lowerQuery.includes('module 4') || lowerQuery.includes(' m4 ') || lowerQuery.includes(' m4') && lowerQuery.endsWith('m4') || lowerQuery.includes('foundation') || lowerQuery.includes('auth')) {
      return 'Module 4 details the "Foundation Build" (Auth, Shell, Dashboard) representing Day 1–3 of building the Issue Tracker app. You perform manual setups, orchestrate authentication, and design the main layouts.';
    }
    if (lowerQuery.includes('module 5') || lowerQuery.includes(' m5 ') || lowerQuery.includes(' m5') && lowerQuery.endsWith('m5') || lowerQuery.includes('workflow') || lowerQuery.includes('transition') || lowerQuery.includes('comments')) {
      return 'Module 5 covers "The Workflow Engine" representing Day 4–5 of the Issue Tracker. You coordinate status transitions (16-state matrix), comment threads, secure attachments, and strict Git commit-per-component workflows.';
    }
    if (lowerQuery.includes('module 6') || lowerQuery.includes(' m6 ') || lowerQuery.includes(' m6') && lowerQuery.endsWith('m6') || lowerQuery.includes('admin') || lowerQuery.includes('excel') || lowerQuery.includes('pdf')) {
      return 'Module 6 details "Admin, Reports & Going Live" representing Day 6–7. You construct Admin control panels, excel/pdf exporters, and prepare the project repo (DESIGN.md) for GitHub submission.';
    }
    if (lowerQuery.includes('module 7') || lowerQuery.includes(' m7 ') || lowerQuery.includes(' m7') && lowerQuery.endsWith('m7')) {
      return 'Module 7 is "Your Capstone Build". You choose from 30 enterprise projects (like HRIMS or Sprint Tracker), develop it in 5 days using the OrchestrAI Loop, deploy to Firebase, and submit the URLs.';
    }

    // 2. Difficulty mappings
    if (lowerQuery.includes('easy') || lowerQuery.includes('easiest') || lowerQuery.includes('simple')) {
      return 'Module 1 (The Mindset) is the easiest conceptually since it introduces the framework principles and runs in a sandbox lab. However, it requires a mindset shift (learning NOT to manually code) which is vital for the rest of the course!';
    }
    if (lowerQuery.includes('hard') || lowerQuery.includes('hardest') || lowerQuery.includes('difficult') || lowerQuery.includes('complex') || lowerQuery.includes('tough')) {
      return 'Module 7 (Capstone Build) is the most challenging and intensive. You build a complete multi-role enterprise application with DB, RBAC, workflows, and reports, deploy it, and publish the repository in just 5 days.';
    }

    // 3. Capstone Scoring & Rules
    if (lowerQuery.includes('score') || lowerQuery.includes('rubric') || lowerQuery.includes('matrix') || lowerQuery.includes('marks') || lowerQuery.includes('points') || lowerQuery.includes('grade') || lowerQuery.includes('grading')) {
      return 'Capstone projects are scored out of 100 points:\n• Workflow logic: 20 pts\n• RBAC security: 15 pts\n• Business Transactions: 15 pts\n• Authentication: 10 pts\n• Dashboard interface: 10 pts\n• Master Data: 10 pts\n• PDF/Excel Reports: 10 pts\n• Firebase Hosting: 5 pts\n• Documentation (README/DESIGN): 5 pts';
    }
    if (lowerQuery.includes('pass') || lowerQuery.includes('outstanding') || lowerQuery.includes('rework') || lowerQuery.includes('rebuild')) {
      return 'The grading decisions are:\n• Score ≥ 85: Outstanding\n• Score ≥ 70: Pass & Certified\n• Score 50-69: Rework Recommended\n• Score < 50: Rebuild Required\n\nScoring ≥ 90% grants priority referral to partner hiring networks.';
    }
    if (lowerQuery.includes('submit') || lowerQuery.includes('submission') || lowerQuery.includes('package') || lowerQuery.includes('checklist')) {
      return 'Mandatory submission package checklist:\n1. GitHub URL (clean code & history)\n2. Firebase Deployed Web URL\n3. README / DESIGN.md files\n4. Screenshots of key views\n5. Visual state transition diagram';
    }

    // 4. Deployment
    if (lowerQuery.includes('deploy') || lowerQuery.includes('hosting') || lowerQuery.includes('firebase') || lowerQuery.includes('host') || lowerQuery.includes('publish')) {
      return 'To deploy your capstone app to Firebase Hosting:\n1. Compile the production code: `npm run build` (generates the "dist" or "build" folder).\n2. Login & deploy: run `npx firebase deploy --only hosting` in your project folder.\n3. Make sure to check the generated Firebase URL before submitting it in the portal.';
    }

    // 5. Framework Loop / Lifecycle
    if (lowerQuery.includes('loop') || lowerQuery.includes('lifecycle') || lowerQuery.includes('stages') || lowerQuery.includes('6-stage')) {
      return 'The OrchestrAI Lifecycle Loop has 6 stages:\n1. Intent: Frame needs into specs.\n2. Orchestrate: Map dependencies & design API contracts.\n3. Generate: Orchestrate AI code generation (no manual code lines!).\n4. Validate: Test security, OWASP, and data integrity.\n5. Evolve: Prompt iterative feedback.\n6. Deploy: Publish to production.';
    }

    // 6. Overlap Keyword Search against general queries (Founder, Fees, Program definition)
    let bestMatch = null;
    let highestMatchCount = 0;

    allFaqs.forEach(faq => {
      let matchCount = 0;
      faq.keywords.forEach(keyword => {
        if (lowerQuery.includes(keyword)) {
          matchCount++;
        }
      });

      if (lowerQuery.includes(faq.question.toLowerCase())) {
        matchCount += 5;
      }

      if (matchCount > highestMatchCount) {
        highestMatchCount = matchCount;
        bestMatch = faq;
      }
    });

    if (bestMatch && highestMatchCount > 0) {
      return (bestMatch as any).answer;
    }

    // Fallback response
    return `I couldn't find a precise match in our database.

Try querying about:
- "Syllabus modules" or a specific module like "Module 3"
- "Which module is easy/hard"
- "How is the capstone scored" or "passing criteria"
- "How to deploy my demo"
- Email us directly at: **${systemConfig?.contactEmail || 'vthinkorchestrai@gmail.com'}** or call **+91 9962574842**`;
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

    setTimeout(() => {
      const responseText = parseUserQuery(userQuery);

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
        className={`glass-card mb-4 w-96 max-w-[calc(100vw-2rem)] h-[540px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] bg-[var(--bg-card)] transition-all duration-300 origin-bottom-right ${
          isOpen 
            ? 'scale-100 opacity-100 pointer-events-auto translate-y-0' 
            : 'scale-90 opacity-0 pointer-events-none translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-750 to-purple-700 text-white flex items-center justify-between shadow-md shrink-0">
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
        <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-500/3 flex flex-col">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div key={msg.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200 shrink-0`}>
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
                      : 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-650 text-white border-indigo-500/25 rounded-tr-sm font-medium'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-100 shrink-0">
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

          {/* FAQ Navigation & Pills */}
          {!isTyping && (
            <div className="pt-3 mt-auto border-t border-[var(--border-color)] shrink-0">
              {/* Category tabs */}
              <div className="flex border-b border-[var(--border-color)] pb-2 mb-2 justify-between">
                {[
                  { id: 'general', label: '📁 General' },
                  { id: 'syllabus', label: '📚 Syllabus' },
                  { id: 'capstone', label: '🎓 Capstone' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as FQA_Category)}
                    className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      activeCategory === cat.id 
                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                        : 'text-[var(--text-secondary)] hover:bg-slate-500/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Categorized Pills */}
              <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                {faqCategories[activeCategory].map((faq) => (
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
