import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  Send, 
  X, 
  RefreshCw, 
  Bot, 
  User, 
  Sparkles,
  Home,
  BookOpen,
  Lock,
  CreditCard,
  Award,
  FlaskConical,
  UserCheck,
  Settings,
  Trophy,
  LifeBuoy
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isFaq?: boolean;
}

type FaqCategoryKey = 'getting_started' | 'modules' | 'access_gating' | 'payment' | 'certification' | 'capstone' | 'sme_review' | 'admin' | 'gamification' | 'resources';

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

// ── SYNONYM MAP: maps user terms → canonical keywords for fuzzy matching ──
const SYNONYM_MAP: Record<string, string[]> = {
  'download': ['save', 'export', 'get', 'obtain', 'fetch'],
  'certificate': ['cert', 'certification', 'credential', 'diploma'],
  'cost': ['price', 'fee', 'charge', 'payment', 'pay', 'money', 'rupees', 'rs', 'inr', '₹'],
  'register': ['signup', 'sign up', 'create account', 'enroll', 'join', 'registration'],
  'login': ['sign in', 'signin', 'log in', 'authenticate', 'access'],
  'password': ['pass', 'pwd', 'credentials', 'secret'],
  'quiz': ['test', 'exam', 'assessment', 'challenge', 'knowledge check'],
  'module': ['lesson', 'chapter', 'course', 'unit', 'topic'],
  'capstone': ['project', 'final project', 'portfolio', 'assignment'],
  'sme': ['reviewer', 'evaluator', 'subject matter expert', 'grader', 'assessor'],
  'admin': ['administrator', 'manager', 'superuser', 'system admin'],
  'deploy': ['publish', 'host', 'launch', 'go live', 'release'],
  'premium': ['upgrade', 'pro', 'advanced access', 'gold tier'],
  'approve': ['approval', 'accept', 'confirm', 'authorize', 'verify'],
  'score': ['grade', 'marks', 'points', 'rating', 'result'],
  'badge': ['achievement', 'reward', 'trophy', 'milestone'],
  'xp': ['experience', 'experience points', 'points'],
  'streak': ['consecutive', 'daily', 'continuous'],
  'feedback': ['review', 'rating', 'comment', 'suggestion', 'opinion'],
  'vault': ['resources', 'downloads', 'library', 'materials', 'documents'],
  'promote': ['promotion', 'elevated', 'upgrade role', 'become reviewer'],
  'rework': ['redo', 'resubmit', 'fix', 'revise', 'improve'],
  'workflow': ['process', 'flow', 'steps', 'procedure', 'pipeline'],
  'troubleshoot': ['issue', 'problem', 'bug', 'error', 'fix', 'not working', 'broken', 'help'],
  'tier': ['account type', 'user type', 'level', 'plan', 'membership'],
  'free tier': ['guest user', 'free user', 'basic access', 'no payment', 'not paid'],
  'paid user': ['certified user', 'program access', 'approved user', 'paid candidate'],
  'approval history': ['past approvals', 'who approved', 'approved list', 'previous approvals'],
  'filter': ['search', 'sort', 'find', 'narrow', 'refine', 'look up'],
  'spiritual': ['temple', 'darshan', 'annadhanam', 'seva', 'pilgrimage', 'discourse', 'sloka', 'category 7'],
  'open innovation': ['custom capstone', 'build your own', 'category 8', 'custom enterprise', 'custom ai', 'marketplace capstone'],
};

export const QuickHelp: React.FC = () => {
  const { systemConfig } = useApp();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<FaqCategoryKey>('getting_started');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic references from system config
  const certPrice = systemConfig?.certificationPrice ?? 199;
  const premiumPrice = systemConfig?.premiumUpgradePrice ?? 499;
  const contactEmail = systemConfig?.contactEmail || 'vthinkorchestrai@gmail.com';
  const approvalMode = systemConfig?.approvalMode || 'MANUAL';

  // ════════════════════════════════════════════════════════════════════
  //  COMPREHENSIVE FAQ KNOWLEDGE BASE — 10 Categories, 80+ Entries
  // ════════════════════════════════════════════════════════════════════

  const faqCategories: Record<FaqCategoryKey, FaqEntry[]> = {

    // ── 1. GETTING STARTED ──────────────────────────────────────────
    getting_started: [
      {
        id: 'gs-1',
        question: 'What is OrchestrAI Lead Certification?',
        answer: 'OrchestrAI Lead is an elite, hands-on certification designed by Sithanandham Radhakrishnan at vThink Global Technologies. It trains engineers in building production-ready enterprise applications using AI orchestration — transitioning developers from manual code-writers to "architects of intent" (Human Orchestrators) who command AI engines to build production-grade systems.',
        keywords: ['orchestrai', 'lead', 'certification', 'what is', 'framework', 'about', 'platform', 'academy']
      },
      {
        id: 'gs-2',
        question: 'Who is the founder Sithanandham Radhakrishnan?',
        answer: 'Sithanandham Radhakrishnan is the Chief OrchestrAI Architect, Strategic Advisor, and Product Owner of vThink Global Technologies. He has over 24 years of hands-on experience across Banking, Insurance, Telecom, and Capital Markets, with clients including Barclays, Verizon, ING, and Merrill Lynch. He developed the Proved-in-Practice (PIP) OrchestrAI framework to dramatically accelerate software delivery at a fraction of traditional development costs.',
        keywords: ['founder', 'sithanandham', 'radhakrishnan', 'experience', 'advisor', 'author', 'who', 'creator', 'vthink']
      },
      {
        id: 'gs-3',
        question: 'How do I register for the academy?',
        answer: 'To register:\n1. Click the "Login" button in the header\n2. Enter your Name, Email, and Mobile number\n3. Verify your email via OTP (one-time password sent to your inbox)\n4. Set your password\n5. You\'re now enrolled as a FREE TIER candidate with access to Modules 1 & 2!\n\nOptional: Phone SMS verification may also be required depending on admin settings.',
        keywords: ['register', 'signup', 'sign up', 'create account', 'enroll', 'join', 'how to register', 'registration']
      },
      {
        id: 'gs-4',
        question: 'What are the different user types and account tiers?',
        answer: `The platform has 5 user types across 4 roles:\n\n👤 **Roles:**\n• **Guest/Visitor**: Browse the landing page, roadmap, and Modules 1 & 2 (no login needed)\n• **SME/Reviewer**: Subject Matter Expert — reviews and grades capstone submissions\n• **System Administrator**: Full platform manager — all tabs, settings, approvals\n\n🎯 **Candidate Account Tiers (within USER role):**\n⚫ **Free Tier Guest**: Newly registered — access Modules 1 & 2 only (free)\n🟡 **Pending Paid**: Payment submitted, awaiting admin approval\n🔵 **Paid User (₹${certPrice})**: Approved — full access to Modules 3-7, capstone, vault\n⭐ **Premium User (₹${premiumPrice})**: Upgraded — priority SME review, enhanced features\n\nYour tier is shown as a badge in the header. Hover over it to see what it includes.`,
        keywords: ['roles', 'user types', 'permissions', 'access levels', 'guest', 'candidate', 'sme', 'admin', 'user role', 'tier', 'free tier', 'paid user', 'premium user', 'account type', 'what type am i']
      },
      {
        id: 'gs-5',
        question: 'What browsers are supported?',
        answer: 'The platform supports:\n• Chrome v110+\n• Firefox v108+\n• Safari v16+\n• Edge v110+\n• Mobile browsers (iOS Safari, Android Chrome)\n\nFor the best experience, use the latest version of Chrome or Edge on desktop.',
        keywords: ['browser', 'supported', 'chrome', 'firefox', 'safari', 'edge', 'mobile', 'compatible', 'requirements']
      },
      {
        id: 'gs-6',
        question: 'Is the platform free to use?',
        answer: `Modules 1 & 2 are completely **FREE** — no account needed to browse, and free registration gives you full access to study materials, slides, and labs.\n\nTo unlock Modules 3-7 and the Capstone project, you need to:\n1. Pass the Module 2 Quiz (≥80% score)\n2. Pay the certification fee (currently ₹${certPrice}) or get admin approval\n\nPremium upgrade is available separately at ₹${premiumPrice}.`,
        keywords: ['free', 'cost', 'charges', 'pricing', 'free modules', 'no cost', 'trial']
      },
      {
        id: 'gs-7',
        question: 'How do I reset my password?',
        answer: 'To reset your password:\n1. Click "Login" in the header\n2. Enter your registered email\n3. Click "Forgot Password?"\n4. You\'ll receive an OTP on your email\n5. Enter the OTP and set a new password\n\nIf you\'re a legacy user (registered before the password feature), the system will guide you through setting a new password via OTP verification.',
        keywords: ['reset', 'password', 'forgot', 'change password', 'recover', 'lost password']
      },
      {
        id: 'gs-8',
        question: 'What is the OrchestrAI Delivery Framework (ODF) Lifecycle Loop?',
        answer: 'The OrchestrAI Delivery Framework (ODF) has 6 stages:\n\n1. **01 — Intent & Outcome Definition**: Define goals, success metrics, and stakeholders.\n2. **02 — Requirements & Context**: Capture business needs, constraints, and requirements.\n3. **03 — AI-Assisted Design**: AI generates architecture and solution designs.\n4. **04 — AI-Generated Development**: AI accelerates coding, APIs, and integrations.\n5. **05 — Testing & Quality Assurance**: AI + Human validation for quality and security.\n6. **06 — Deployment & Improvement**: Deliver rapidly and continuously evolve.\n\nThis loop is taught in Module 2 and applied throughout the entire curriculum.',
        keywords: ['loop', 'lifecycle', 'stages', '6-stage', 'odf', 'intent', 'requirements', 'design', 'development', 'testing', 'deployment']
      },
    ],

    // ── 2. MODULES & SYLLABUS ───────────────────────────────────────
    modules: [
      {
        id: 'mod-1',
        question: 'Tell me about Module 1 (The Mindset)',
        answer: 'Module 1: "The OrchestrAI Mindset" (4 Hours)\n\nYou learn to shift from manual coding to AI orchestration. Key topics:\n• Paradigm shift: from code-writer to architect-of-intent\n• The 7-day OrchestrAI benchmark vs traditional timelines\n• Prompt Simulator lab (hands-on practice)\n• Slide decks with avatar audio narration\n\nThis is the easiest module conceptually — it focuses on mindset alignment.',
        keywords: ['module 1', 'm1', 'mindset', 'paradigm', 'first module', 'introduction']
      },
      {
        id: 'mod-2',
        question: 'Tell me about Module 2 (Architecture & ODF)',
        answer: 'Module 2: "OrchestrAI Framework Architecture" (6 Hours)\n\nDeep dive into the framework\'s core principles:\n• The 6 Core Principles of AI orchestration\n• The 6-Stage ODF Lifecycle Loop (Intent & Outcome → Requirements → AI Design → AI Dev → Testing & QA → Deployment & Improvement)\n• Constraint-based prompt engineering\n• Quality by design approach\n\n⚠️ Ends with the **Quiz Gate** — you must score ≥80% (5/6 correct) to proceed!',
        keywords: ['module 2', 'm2', 'architecture', 'principles', 'lifecycle', 'framework', 'odf']
      },
      {
        id: 'mod-3',
        question: 'Tell me about Module 3 (The Bible)',
        answer: 'Module 3: "The OrchestrAI Bible — Governance-First Setup"\n\nYou establish OGE (Observability, Guardrails, Evaluation) rules:\n• Master T1 + T2 prompt patterns\n• Inspect the 5 core specifications (Functional Design, Technical Design, DB Design, UI Design, Test Plan)\n• Build the Issue Tracker reference project foundation\n• Guest credentials: Guest01 / Guest@123\n\n🔒 Requires paid access (Module 3+).',
        keywords: ['module 3', 'm3', 'bible', 'oge', 'governance', 'specifications', 'specs']
      },
      {
        id: 'mod-4',
        question: 'Tell me about Module 4 (Foundation Build)',
        answer: 'Module 4: "Foundation Build" (Day 1-3)\n\nHands-on building of the Issue Tracker app:\n• Authentication system setup\n• Shell & layout design\n• Dashboard interface construction\n• Manual setups before AI orchestration kicks in\n\nThis represents Day 1-3 of the 7-day build cycle.',
        keywords: ['module 4', 'm4', 'foundation', 'auth', 'dashboard', 'shell', 'day 1', 'day 2', 'day 3']
      },
      {
        id: 'mod-5',
        question: 'Tell me about Module 5 (Workflow Engine)',
        answer: 'Module 5: "The Workflow Engine" (Day 4-5)\n\nYou build the core business logic:\n• 16-transition status matrix\n• Comment threads & secure attachments\n• Git commit-per-component workflows\n• State machine design patterns\n\nThis represents Day 4-5 of the 7-day build cycle.',
        keywords: ['module 5', 'm5', 'workflow', 'transition', 'status', 'comments', 'engine']
      },
      {
        id: 'mod-6',
        question: 'Tell me about Module 6 (Admin & Reports)',
        answer: 'Module 6: "Admin, Reports & Going Live" (Day 6-7)\n\nFinal build phase:\n• Admin control panels\n• Excel/PDF report exporters\n• DESIGN.md documentation\n• GitHub repository preparation\n• UAT testing\n\nThis represents Day 6-7 of the 7-day build cycle.',
        keywords: ['module 6', 'm6', 'admin', 'reports', 'excel', 'pdf', 'going live', 'day 6', 'day 7']
      },
      {
        id: 'mod-7',
        question: 'Tell me about Module 7 (Capstone Project)',
        answer: 'Module 7: "Your Capstone Build" (Self-Paced, 5 Days)\n\nThe ultimate hands-on module:\n• Choose from 30 enterprise projects across 6 domains\n• Build the complete app using the OrchestrAI Delivery Framework (ODF) in 5 days\n• Deploy to Firebase Hosting\n• Submit GitHub URL + deployed app URL\n• Get reviewed by an SME evaluator\n\nThis is the most challenging module!',
        keywords: ['module 7', 'm7', 'capstone', 'final', 'build', 'project']
      },
      {
        id: 'mod-8',
        question: 'Which module is easy and which is hard?',
        answer: '**Easiest**: Module 1 (The Mindset) — conceptual introduction, focuses on mindset shift with a sandbox lab.\n\n**Hardest**: Module 7 (Capstone) — you build a complete multi-role enterprise application with DB, RBAC, workflows, reports, deploy it, and document everything in just 5 days.\n\n**Middle Difficulty**:\n• Modules 2-3: Theory-heavy but manageable\n• Modules 4-6: Progressive build complexity (Auth → Workflows → Reports)',
        keywords: ['easy', 'hard', 'difficult', 'easiest', 'hardest', 'simple', 'challenge', 'toughest', 'complexity']
      },
      {
        id: 'mod-9',
        question: 'How do the slide presentations work?',
        answer: 'Each module uses an interactive Slide Presenter with:\n• Breadcrumb navigation + slide index tracker\n• Multiple presentation tones: Conversational, Formal, Gen-Z, or Beginner\n• Avatar audio narration (toggle on/off)\n• Split-pane layout (illustration left, text right)\n• Locked previous/next navigation until you view all slides\n• Completion triggers a mandatory feedback modal\n\nYou must view all slides before a module is marked complete.',
        keywords: ['slides', 'presentation', 'audio', 'narration', 'presenter', 'tone', 'how to study']
      },
      {
        id: 'mod-10',
        question: 'What are the prerequisites for each module?',
        answer: 'Module prerequisites:\n\n• **Modules 1 & 2**: None — free access for everyone\n• **Module 2 Quiz**: Must complete Module 2 slides\n• **Module 3+**: Must pass the Quiz Gate (≥80%) AND pay the certification fee / get admin approval\n• **Module 7 (Capstone)**: Must complete Modules 1-6\n• **Certification**: Must submit and pass the Capstone review\n\nEach module\'s slides must be fully viewed before feedback and progression.',
        keywords: ['prerequisites', 'requirements', 'unlock', 'order', 'sequence', 'before', 'pre-requisite']
      },
    ],

    // ── 3. ACCESS & GATING ──────────────────────────────────────────
    access_gating: [
      {
        id: 'ag-1',
        question: 'What is the Quiz Gate?',
        answer: 'The Quiz Gate is a 6-question multiple-choice assessment after Module 2:\n\n• Minimum score: **80% (5 out of 6 correct)**\n• On failure: Study guide tips displayed + immediate retry available\n• On success: Gate unlocked permanently in your profile\n• Must be logged in to attempt\n\nThis ensures candidates have understood the core framework principles before advancing.',
        keywords: ['quiz', 'gate', 'assessment', 'test', 'pass', 'fail', '80%', 'quiz gate', 'knowledge check']
      },
      {
        id: 'ag-2',
        question: 'What is the Payment Gate?',
        answer: `After passing the Quiz Gate, you encounter the Payment Gate:\n\n• **Certification fee**: ₹${certPrice}\n• **Current approval mode**: ${approvalMode}\n\nIf AUTOMATED mode: Your account is approved instantly after payment.\nIf MANUAL mode: Your payment sets status to "Pending Approval" and the admin reviews your request.\n\nOnce approved, you get access to Modules 3-7 and the Capstone workspace.`,
        keywords: ['payment gate', 'access', 'unlock', 'gating', 'approval', 'pending', 'blocked']
      },
      {
        id: 'ag-3',
        question: 'What are the different account statuses?',
        answer: 'Your account can have these statuses:\n\n• **FREE_TIER**: Default after registration — access to Modules 1 & 2 only\n• **PENDING_APPROVAL**: Payment submitted, waiting for admin approval (Manual mode)\n• **APPROVED**: Full access to all modules, capstone workspace, and certification\n• **PREMIUM**: Enhanced access with premium features and priority SME review\n\nYou can check your current status from the badge in the header area.',
        keywords: ['account status', 'pending', 'approved', 'premium', 'status', 'access level']
      },
      {
        id: 'ag-4',
        question: 'How does email verification work?',
        answer: 'Email verification process:\n\n1. During registration, an OTP is sent to your email via EmailJS\n2. Enter the 6-digit OTP to verify your email\n3. Once verified, you can set your login password\n\n⚠️ Email verification may be required or optional — this is controlled by the admin in System Settings. If required, you cannot proceed without verifying.',
        keywords: ['email', 'verification', 'otp', 'verify', 'confirm email', 'email otp']
      },
      {
        id: 'ag-5',
        question: 'How does phone verification work?',
        answer: 'Phone SMS verification:\n\n1. After email verification, you may be prompted for phone verification\n2. A Firebase SMS OTP is sent to your mobile number\n3. Enter the code to verify\n\n⚠️ Phone verification is **optional** and can be enabled/disabled by the admin. Not all configurations require it.',
        keywords: ['phone', 'sms', 'mobile', 'verification', 'phone otp', 'sms otp', 'mobile verify']
      },
      {
        id: 'ag-6',
        question: 'Why can\'t I access Module 3 and beyond?',
        answer: `To unlock Modules 3-7, you need to complete TWO gates:\n\n1. ✅ **Quiz Gate**: Pass the Module 2 quiz with ≥80% score\n2. ✅ **Payment Gate**: Pay ₹${certPrice} and get approved\n\nCommon reasons for being blocked:\n• Quiz not yet passed (check your quiz score)\n• Payment not submitted\n• Payment submitted but admin approval pending (Manual mode)\n• Account still in FREE_TIER status\n\nCheck your account status in the header or contact the admin.`,
        keywords: ['cant access', 'locked', 'blocked', 'module 3', 'why locked', 'cannot access', 'restricted']
      },
      {
        id: 'ag-7',
        question: 'What is Manual vs Automated approval mode?',
        answer: `**Automated Mode**: After payment, your account is approved instantly with a confirmation email sent to you.\n\n**Manual Mode**: After payment, your status is set to "Pending Approval" and the admin is notified. The admin must manually review and approve your access.\n\nCurrent mode: **${approvalMode}**\n\nThe mode is configured by the administrator in System Settings.`,
        keywords: ['manual', 'automated', 'approval mode', 'auto approve', 'manual approve', 'how approval works']
      },
      {
        id: 'ag-8',
        question: 'How long does approval take?',
        answer: `Approval timing depends on the current mode:\n\n• **Automated mode**: Instant — you get access immediately after payment\n• **Manual mode**: Depends on admin review speed — typically within 24-48 hours\n\nCurrent mode: **${approvalMode}**\n\nIf your approval is taking too long, email the admin at: **${contactEmail}**`,
        keywords: ['how long', 'approval time', 'waiting', 'when approved', 'turnaround', 'pending how long']
      },
      {
        id: 'ag-9',
        question: 'What can a Free Tier user do?',
        answer: `A **Free Tier** user is a newly registered candidate. Here is exactly what you can and cannot do:\n\n✅ **Allowed (Free):**\n• Browse and study Module 1 & 2 slides with audio narration\n• Take the Module 2 Quiz (to unlock the payment gate)\n• Download resources from the Vault\n• Earn XP, badges, and streaks\n• Submit feedback after modules\n• Update your profile\n\n🔒 **Requires paid access (₹${certPrice} unlock):**\n• Modules 3-7 (all paid content)\n• Capstone workspace\n• Capstone submission and SME review\n• Certificate generation\n\nTo upgrade, pass the Quiz Gate and complete the payment.`,
        keywords: ['free tier', 'free user', 'free access', 'what can guest do', 'limited access', 'restrictions', 'what is included free']
      },
      {
        id: 'ag-10',
        question: 'How do I know what tier or account type I am?',
        answer: 'You can identify your account tier in two ways:\n\n**1. Header Badge** (always visible when logged in):\n• Grey/Slate badge → Free Tier Guest\n• Pulsing amber badge → Pending Paid (awaiting admin approval)\n• Indigo badge → Paid User (Modules 3-7 unlocked)\n• Gold/Amber badge → Premium User (full access)\n\n**2. Header Tooltip (? icon)**:\n• Hover over the (?) next to your name in the header\n• A panel appears explaining your current tier and what it includes\n\n**3. Admin View (for admins)**:\n• The Talent Radar shows each candidate\'s type in the Status column with the same colour-coded badges.',
        keywords: ['what tier am i', 'my account type', 'check tier', 'my status', 'account level', 'see my tier', 'how to know', 'identify account', 'badge meaning']
      },
    ],

    // ── 4. PAYMENT & PREMIUM ────────────────────────────────────────
    payment: [
      {
        id: 'pay-1',
        question: `What is the certification fee (₹${certPrice})?`,
        answer: `The certification fee of ₹${certPrice} is a dynamic price set by the administrator as a "commitment signal". When candidates invest in their learning, they show serious intent.\n\nWhat it covers:\n• Access to Modules 3-7 (paid content)\n• Capstone workspace access\n• SME evaluation and manual project review\n• Certificate generation upon passing\n\nThe price may change based on admin configuration.`,
        keywords: ['fee', 'price', 'payment', 'pay', 'charge', 'cost', 'investment', 'money', 'rupees', 'rs', 'certification fee', 'how much']
      },
      {
        id: 'pay-2',
        question: 'How do I make the payment?',
        answer: `Payment process:\n\n1. Pass the Module 2 Quiz (≥80%)\n2. Navigate to the Payment page\n3. Click "Proceed to Pay"\n4. Complete payment via Razorpay gateway (₹${certPrice})\n5. On success, a payment ID is generated\n\nIf approval mode is AUTOMATED: Access granted instantly\nIf approval mode is MANUAL: Status set to "Pending Approval"\n\nYou'll receive an email notification about your payment status.`,
        keywords: ['make payment', 'how to pay', 'pay now', 'checkout', 'razorpay', 'process payment']
      },
      {
        id: 'pay-3',
        question: 'What is Premium Upgrade?',
        answer: `Premium Upgrade (₹${premiumPrice}) is an optional enhanced tier that provides:\n\n• Priority SME review for capstone projects\n• Extended platform access\n• Enhanced features\n\nTo upgrade:\n1. Go to Payment page with premium mode (?mode=premium)\n2. Complete the premium payment\n3. Your status is set to "Premium Pending" — admin approval required\n\nPremium upgrade is separate from the standard certification fee.`,
        keywords: ['premium', 'upgrade', 'pro', 'advanced', 'premium upgrade', 'premium cost', 'premium price']
      },
      {
        id: 'pay-4',
        question: 'Is the payment refundable?',
        answer: `Please contact the administrator for refund queries:\n\n📧 Email: **${contactEmail}**\n📱 Phone: **+91 9962574842**\n\nRefund policies are managed by the academy administration on a case-by-case basis.`,
        keywords: ['refund', 'refundable', 'return', 'cancel payment', 'money back', 'chargeback']
      },
      {
        id: 'pay-5',
        question: 'What payment methods are accepted?',
        answer: 'Payments are processed through **Razorpay**, which supports:\n\n• Credit / Debit Cards (Visa, Mastercard, RuPay)\n• UPI (Google Pay, PhonePe, Paytm)\n• Net Banking\n• Wallets\n\nAll transactions are secure and encrypted.',
        keywords: ['payment methods', 'upi', 'card', 'credit card', 'debit card', 'net banking', 'wallet', 'gpay']
      },
      {
        id: 'pay-6',
        question: 'My payment was successful but I still don\'t have access',
        answer: `If your payment was successful but access is not granted:\n\n1. **Check approval mode**: Current mode is **${approvalMode}**. If MANUAL, you need admin approval.\n2. **Check account status**: Look for "Pending Approval" badge in your profile\n3. **Hard refresh**: Press Ctrl+Shift+R to reload the latest data\n4. **Contact admin**: Email **${contactEmail}** with your payment ID\n\nCommon causes:\n• Manual mode requires admin to click "Approve"\n• Browser cache showing stale data\n• Network sync delay`,
        keywords: ['payment success', 'still no access', 'paid but locked', 'payment done', 'not working after payment']
      },
      {
        id: 'pay-7',
        question: 'Can I get a payment receipt?',
        answer: `After successful payment:\n\n• A Razorpay payment ID is generated (format: pay_XXXX)\n• An email notification is sent to your registered email\n• The payment is recorded in the system audit logs\n\nFor an official receipt, contact the admin at: **${contactEmail}**`,
        keywords: ['receipt', 'invoice', 'payment proof', 'payment id', 'transaction']
      },
      {
        id: 'pay-8',
        question: 'What is the difference between a Paid User and a Premium User?',
        answer: `There are two paid tiers:\n\n🔵 **Paid User (₹${certPrice} — Program Access)**:\n• Unlocks Modules 3-7\n• Access to the Capstone workspace\n• SME evaluation and standard review queue\n• Certificate generation on passing\n• Shown as Indigo badge in the header\n\n⭐ **Premium User (₹${premiumPrice} — Premium Upgrade)**:\n• Everything in the Paid tier, PLUS:\n• Priority position in the SME review queue\n• Enhanced platform features and extended access\n• Gold/amber badge in the header\n\nYou can get the Paid tier first, then upgrade to Premium separately. Both require admin approval in Manual mode.`,
        keywords: ['paid vs premium', 'difference paid premium', 'paid user premium user', 'upgrade', 'tiers difference', 'which plan', 'paid tier premium tier']
      },
      {
        id: 'pay-9',
        question: 'What happens after the admin approves my payment?',
        answer: `When the admin approves your pending payment request:\n\n1. ✅ Your account status changes from **PENDING_APPROVAL** to **APPROVED** (or PREMIUM if premium upgrade)\n2. 📧 An approval email is automatically sent to your registered email address\n3. 🔓 Modules 3-7 unlock immediately in your account\n4. 🎯 The Capstone workspace becomes accessible\n5. 🏅 Your header badge changes from pulsing amber (Pending) to indigo (Paid) or gold (Premium)\n\n💡 Tip: If you're already logged in when approval happens, do a hard refresh (Ctrl+Shift+R) to load the updated access rights immediately.\n\nIf you don't receive an email within a few minutes, check your spam folder or contact: **${contactEmail}**`,
        keywords: ['after approval', 'approved what happens', 'once approved', 'approved now what', 'access after approval', 'email after approval', 'what changes', 'approved notification']
      },
    ],

    // ── 5. CERTIFICATION ────────────────────────────────────────────
    certification: [
      {
        id: 'cert-1',
        question: 'How do I get certified?',
        answer: 'The certification journey:\n\n1. ✅ Complete Modules 1 & 2 (free)\n2. ✅ Pass the Quiz Gate (≥80%)\n3. ✅ Pay the certification fee & get approved\n4. ✅ Complete Modules 3-6 (paid content)\n5. ✅ Choose a Capstone project (Module 7)\n6. ✅ Build & deploy the app in 5 days\n7. ✅ Submit your project (GitHub URL + deployed URL)\n8. ✅ Get reviewed by an SME evaluator\n9. ✅ Score ≥70 to pass, ≥85 for Outstanding!\n10. 🎉 Download your certificate!',
        keywords: ['how to certify', 'certification process', 'get certified', 'become certified', 'certification steps', 'path']
      },
      {
        id: 'cert-2',
        question: 'Can I download my certificate?',
        answer: 'Yes! Once you are **certified** (capstone score ≥70):\n\n1. Go to the **Certification** page (/certification)\n2. Complete the mandatory **Certification Feedback** form (one-time)\n3. Your certificate card will be displayed with your score and decision\n4. Click the **"Download Certificate"** button\n5. The certificate downloads as an HTML file\n\n📝 The certificate includes your name, score, decision (Outstanding/Pass), certified-by SME name, and date.\n\n⚠️ You must complete the feedback form before downloading.',
        keywords: ['download certificate', 'get certificate', 'save certificate', 'export certificate', 'certificate download', 'where certificate', 'certificate file']
      },
      {
        id: 'cert-3',
        question: 'What are the certification decisions?',
        answer: 'Based on your capstone score (out of 100):\n\n🏆 **Score ≥ 85: Outstanding** — Highest honor! Priority referral to partner hiring networks.\n✅ **Score ≥ 70: Pass** — Certified OrchestrAI Lead!\n🔄 **Score 50-69: Rework Recommended** — Improve specific areas and resubmit.\n❌ **Score < 50: Rebuild Required** — Significant rework needed.\n\n💡 Scorers with ≥90% are flagged for priority hiring referrals!',
        keywords: ['outstanding', 'pass', 'rework', 'rebuild', 'fail', 'certification decision', 'passing score', 'criteria', 'threshold']
      },
      {
        id: 'cert-4',
        question: 'What does the certificate contain?',
        answer: 'Your certificate includes:\n\n• Your full name\n• Certification title: "OrchestrAI Lead Certified"\n• Your capstone score (out of 100)\n• Decision badge (Outstanding / Pass)\n• Name of the SME reviewer who certified you\n• Date of certification\n• OrchestrAI branding and design\n\nThe certificate is generated client-side using jsPDF or a custom HTML template uploaded by the admin.',
        keywords: ['certificate content', 'what on certificate', 'certificate details', 'certificate format', 'certificate template']
      },
      {
        id: 'cert-5',
        question: 'I completed the capstone but can\'t see my certificate',
        answer: `If you submitted your capstone but don't see a certificate:\n\n1. **Check review status**: Go to /certification — your submission might still be "Under Review"\n2. **Review statuses**: submitted → assigned → in_review → awaiting_admin_approval → certified\n3. **Rework needed?**: If the reviewer requested rework, you'll see specific feedback and a checklist\n4. **Score too low?**: Score <70 means Rework/Rebuild, not certified\n5. **Feedback form**: You must complete the certification feedback form before the download button appears\n\nContact admin at **${contactEmail}** if your review is stuck.`,
        keywords: ['no certificate', 'where is certificate', 'cant see certificate', 'certificate not showing', 'submitted but no cert', 'waiting']
      },
      {
        id: 'cert-6',
        question: 'What if I need to rework my capstone?',
        answer: 'If the reviewer assigns "Rework Recommended" (score 50-69):\n\n1. Go to the **Certification** page — you\'ll see "Rework Required" status\n2. Review the SME\'s feedback:\n   • **Strengths**: What you did well\n   • **Gaps**: Areas that need improvement\n   • **Rework Checklist**: Specific items to fix\n3. Make improvements to your project\n4. Resubmit through the Capstone workspace\n\nIf score <50, a full "Rebuild" is recommended — significantly rework the project.',
        keywords: ['rework', 'resubmit', 'failed', 'improve', 'feedback', 'fix', 'redo', 'not passed']
      },
      {
        id: 'cert-7',
        question: 'Can I get referred for hiring after certification?',
        answer: 'Yes! OrchestrAI has a partner IT placement network:\n\n🌟 **Score ≥ 90%**: Priority hiring referral — you are flagged as a top candidate\n✅ **Score ≥ 85%**: Outstanding certification — strong referral potential\n✅ **Score ≥ 70%**: Certified — eligible for the talent pipeline\n\nThe admin uses the **Talent Radar** system to track candidates, compute Lead Readiness Scores, and manage outreach (New → Contacted → Warm → Hot Lead → Interview → Placed).',
        keywords: ['hiring', 'referral', 'placement', 'job', 'career', 'talent', 'employment', 'placement network']
      },
      {
        id: 'cert-8',
        question: 'Is the certification valid for a lifetime?',
        answer: `The OrchestrAI Lead Certification represents your demonstrated ability to build production-grade applications using AI orchestration.\n\nFor queries about certification validity and renewal, contact:\n📧 **${contactEmail}**\n📱 **+91 9962574842**`,
        keywords: ['validity', 'lifetime', 'expire', 'expiry', 'renewal', 'how long valid', 'permanent']
      },
    ],

    // ── 6. CAPSTONE PROJECTS ────────────────────────────────────────
    capstone: [
      {
        id: 'cap-1',
        question: 'How many capstone projects can I choose from?',
        answer: 'There are **40 enterprise capstone projects** across **8 domains**:\n\n📚 **Education** (CAP-01 to CAP-05)\n👔 **HR** (CAP-06 to CAP-10)\n💻 **IT Operations** (CAP-11 to CAP-15)\n🌾 **Agriculture** (CAP-16 to CAP-20)\n🏥 **Healthcare** (CAP-21 to CAP-25)\n⚙️ **Operations** (CAP-26 to CAP-30)\n🛕 **Spiritual & Community** (CAP-31 to CAP-35)\n🚀 **Open Innovation** (CAP-36 to CAP-40)\n\nEach project has Beginner, Intermediate, or Advanced complexity levels.',
        keywords: ['capstone projects', 'how many', 'domains', 'choose', 'selection', 'options', 'list', 'available projects']
      },
      {
        id: 'cap-2',
        question: 'How is the capstone scored? (Rubric)',
        answer: 'Capstone projects are scored out of **100 points** across 9 categories:\n\n• **Workflow Logic**: 20 pts\n• **RBAC Security**: 15 pts\n• **Business Transactions**: 15 pts\n• **Authentication**: 10 pts\n• **Dashboard Interface**: 10 pts\n• **Master Data Management**: 10 pts\n• **PDF/Excel Reports**: 10 pts\n• **Firebase Deployment**: 5 pts\n• **Documentation (README/DESIGN.md)**: 5 pts',
        keywords: ['scoring', 'rubric', 'score', 'points', 'matrix', 'marks', 'grading', 'categories', '100 points']
      },
      {
        id: 'cap-3',
        question: 'What is in the mandatory submission package?',
        answer: 'You must submit:\n\n1. ✅ **GitHub Repository URL** (clean code, proper history, documentation)\n2. ✅ **Deployed Firebase App URL** (live demo)\n3. ✅ **README.md** explaining the project\n4. ✅ **DESIGN.md** with architecture documentation\n5. ✅ **Screenshots** of key screens\n6. ✅ **Visual Workflow Diagram** showing state transitions\n\n⚠️ Missing items may result in point deductions in the respective categories.',
        keywords: ['submission', 'package', 'checklist', 'submit', 'requirements', 'github', 'diagram', 'deliverables', 'what to submit']
      },
      {
        id: 'cap-4',
        question: 'How do I deploy my capstone app?',
        answer: 'Deploy to Firebase Hosting:\n\n1. **Build**: Run `npm run build` in your project folder\n2. **Initialize**: Run `firebase init hosting` (if not already done)\n3. **Deploy**: Run `firebase deploy --only hosting`\n4. **Test**: Open the generated Firebase URL and test thoroughly\n5. **Submit**: Copy the URL and submit it in the Capstone submission form\n\n💡 Tip: Test the deployed version in incognito mode to ensure it works without local cache.',
        keywords: ['deploy', 'firebase', 'hosting', 'host', 'publish', 'demo', 'url', 'how to deploy', 'go live']
      },
      {
        id: 'cap-5',
        question: 'How do I choose a capstone project?',
        answer: 'To choose your capstone:\n\n1. Go to the **Capstone** page (/capstone)\n2. Browse the 40 projects across 8 domains\n3. Filter by domain or complexity (Beginner/Intermediate/Advanced)\n4. Read the project brief, actors, and workflow steps\n5. Click **"Lock Selection"** to confirm your choice\n\n⚠️ Once locked, your selection can be changed by clicking "Lock This Capstone" on any new project or contacting the admin.',
        keywords: ['choose capstone', 'select project', 'lock', 'pick project', 'which capstone', 'how to choose']
      },
      {
        id: 'cap-6',
        question: 'What does the capstone workspace include?',
        answer: 'The Capstone Workspace (/capstone/workspace) provides:\n\n• **5-Day Build Plan** — structured daily goals\n• **Project brief** with actors, masters, and workflow\n• **Trainer Extension** — guidance for each project\n• **Progress checklist** — track your daily progress\n• **Submit button** — when ready to submit deliverables\n\nYou work at your own pace but the recommended timeline is 5 days.',
        keywords: ['workspace', 'capstone workspace', 'build plan', 'daily plan', '5-day', 'work area']
      },
      {
        id: 'cap-7',
        question: 'Can I change my capstone project after locking?',
        answer: `Candidates can swap capstones anytime from the Capstone Library, or the **admin** can override capstone selections via the **Capstone Progress Editor** in the Admin panel. Contact the admin if you need assistance:\n\n📧 **${contactEmail}**`,
        keywords: ['change capstone', 'switch project', 'different project', 'unlock selection', 'wrong capstone']
      },
      {
        id: 'cap-8',
        question: 'What is the Build Plan for the capstone?',
        answer: 'The recommended 5-Day Build Plan:\n\n**Day 1**: Setup, Auth, Shell & Navigation\n**Day 2**: Dashboard & Master Data CRUD\n**Day 3**: Business Transactions & Forms\n**Day 4**: Workflow Engine & Status Transitions\n**Day 5**: Reports (PDF/Excel), RBAC Polish, Deploy & Submit\n\nThis mirrors the approach taught in Modules 4-6 using the Issue Tracker reference project.',
        keywords: ['build plan', '5 day', 'daily plan', 'schedule', 'timeline', 'how many days', 'plan']
      },
      {
        id: 'cap-9',
        question: 'What happens after I submit my capstone?',
        answer: 'After submission, the review workflow:\n\n1. **Submitted** → Your project enters the review queue\n2. **Mode Chosen** → Admin selects Manual SME review or AI Tier B review\n3. **Assigned** → An SME reviewer is assigned to your project\n4. **In Review** → SME evaluates your project against the 9-category rubric\n5. **Review Complete** → Score and feedback generated\n6. **Admin Approval** → Admin reviews the SME\'s evaluation\n7. **Decision** → Certified (≥70), Rework (50-69), or Rebuild (<50)\n8. **Notification** → You receive an email with results\n\nCheck status anytime on the Certification page.',
        keywords: ['after submit', 'what next', 'review process', 'submission status', 'workflow after submit', 'what happens']
      },
      {
        id: 'cap-10',
        question: 'What are the 8 capstone domains?',
        answer: 'The 8 capstone domains with example projects:\n\n📚 **Education**: Student Management, Placement Drive, Internship Tracker\n👔 **HR**: Leave Management, Recruitment Pipeline, Onboarding\n💻 **IT Operations**: Change Request, Asset Management, Service Desk\n🌾 **Agriculture**: Farmer Advisory, Equipment Booking, Produce Marketplace\n🏥 **Healthcare**: Patient Appointments, Lab Sample Tracker, Blood Donation\n⚙️ **Operations**: Vendor Registration, Purchase Request, Visitor Management\n🛕 **Spiritual & Community**: Temple Discovery, Pilgrimage Planner, Volunteer Seva, Digital Annadhanam, Spiritual Learning\n🚀 **Open Innovation**: Build Your Own Enterprise App, AI Product, Community Platform, Marketplace, Workflow Automation',
        keywords: ['domains', 'categories', 'types of projects', 'education', 'hr', 'it', 'agriculture', 'healthcare', 'operations', 'spiritual', 'open innovation']
      },
      {
        id: 'cap-11',
        question: 'Tell me about Category 7 — Spiritual & Community Systems capstones',
        answer: 'Category 7 includes 5 specialized capstone projects for spiritual and community systems:\n\n1. **CAP-31**: Temple Discovery & Darshan Management System (Devotee discovery, pooja catalog, darshan booking)\n2. **CAP-32**: Spiritual Event & Pilgrimage Planner (Multi-temple route planner, festival calendar, itineraries)\n3. **CAP-33**: Temple Volunteer & Seva Management (Volunteer registration, shift assignments, seva certificates)\n4. **CAP-34**: Digital Annadhanam & Donation Platform (Transparent donations, fund utilization tracking, receipts)\n5. **CAP-35**: Spiritual Learning & Discourses Portal (Courses, video discourses, sloka audio assessments)\n\nThese projects comply with all standard 9-category certification rubric requirements.',
        keywords: ['spiritual', 'temple', 'darshan', 'annadhanam', 'seva', 'pilgrimage', 'discourse', 'sloka', 'category 7', 'category 7 capstones', 'cap-31', 'cap-32', 'cap-33', 'cap-34', 'cap-35']
      },
      {
        id: 'cap-12',
        question: 'Tell me about Category 8 — Open Innovation Capstones',
        answer: 'Category 8 allows learners to choose their own project domain while complying with strict OrchestrAI certification standards:\n\n1. **CAP-36**: Build Your Own Enterprise Application\n2. **CAP-37**: Build Your Own AI Product (AI Assistant, Knowledge Bot, Recommendation Engine)\n3. **CAP-38**: Build Your Own Community Platform (Resident Portal, NGO Platform, Alumni Network)\n4. **CAP-39**: Build Your Own Marketplace (Local Services, Product, Freelancer Marketplace)\n5. **CAP-40**: Build Your Own Workflow Automation Platform (Approval System, Ticketing, Operations)\n\nMandatory Standards for Category 8:\n• 7 Mandatory Screens (Login, Dashboard, User Mgmt, Masters, Transactions, Reports, Settings)\n• Minimum 3 RBAC roles & 3 workflows\n• Minimum 3 reports & at least 1 AI-powered capability\n• Complete GitHub repo + Firebase deployment',
        keywords: ['open innovation', 'custom capstone', 'build your own', 'category 8', 'custom enterprise', 'custom ai', 'marketplace capstone', 'category 8 capstones', 'cap-36', 'cap-37', 'cap-38', 'cap-39', 'cap-40']
      },
    ],

    // ── 7. SME REVIEW ───────────────────────────────────────────────
    sme_review: [
      {
        id: 'sme-1',
        question: 'What is an SME reviewer?',
        answer: 'An **SME (Subject Matter Expert) Reviewer** is an evaluator who reviews and grades capstone project submissions.\n\nSMEs:\n• Access a restricted review panel to evaluate projects\n• Score submissions against a 9-category rubric (100 points)\n• Provide detailed feedback (strengths, gaps, rework checklist)\n• Make grading decisions (Outstanding/Pass/Rework/Rebuild)\n• Have separate login credentials (/sme-login)\n\nSMEs are appointed by the admin and can be external experts or promoted learners.',
        keywords: ['sme', 'reviewer', 'evaluator', 'subject matter expert', 'who reviews', 'grader', 'assessor']
      },
      {
        id: 'sme-2',
        question: 'How can I become an SME reviewer?',
        answer: 'There are two ways to become an SME reviewer:\n\n**1. External Appointment**: The admin adds your email as a new external reviewer in the Reviewer Pool tab. You receive login credentials via email.\n\n**2. Learner Promotion**: If you\'re an existing certified learner, the admin can **promote you to reviewer role** from the Reviewer Pool panel. Your existing account is elevated.\n\nOnce appointed, you\'ll:\n• Receive credentials via email (first login requires password change)\n• Login at /sme-login\n• Access the Capstone Reviews tab in the Admin panel',
        keywords: ['become sme', 'become reviewer', 'how to review', 'promotion', 'promoted', 'reviewer role', 'apply reviewer']
      },
      {
        id: 'sme-3',
        question: 'How does the SME review process work?',
        answer: 'The SME review process:\n\n1. **Assignment**: Admin assigns a submission to you in the review queue\n2. **Access**: Open the submission details (GitHub URL, deployed app, notes)\n3. **Score**: Rate the project across 9 categories (100 points total)\n4. **Feedback**: Write strengths, gaps, and a rework checklist (if applicable)\n5. **Decision**: System auto-calculates based on score (≥85 Outstanding, ≥70 Pass, etc.)\n6. **Submit**: Save your review — admin may do a final approval\n7. **Notification**: Candidate receives email with results\n\nYou can also save drafts before final submission.',
        keywords: ['review process', 'how to review', 'sme workflow', 'grading process', 'evaluation', 'scoring process']
      },
      {
        id: 'sme-4',
        question: 'What is AI Tier B review?',
        answer: 'Tier B is an **AI-powered automated review** option:\n\n• Uses an AI model (via OpenRouter → Qwen) to evaluate capstone projects\n• Triggered via a Firebase Cloud Function (`scoreCapstoneTierB`)\n• Provides automated scoring against the rubric categories\n• Generates AI feedback on strengths and areas for improvement\n\n⚠️ AI review is a secondary option — Manual SME review is the primary and recommended evaluation method. AI reviews may still require admin approval before certification.',
        keywords: ['ai review', 'tier b', 'automated review', 'ai scoring', 'auto review', 'machine review', 'ai grading']
      },
      {
        id: 'sme-5',
        question: 'How is an existing learner promoted to SME?',
        answer: 'Learner-to-SME promotion process:\n\n1. Admin goes to **Admin Panel → Capstone Reviews → Reviewer Pool** tab\n2. Clicks "Promote Existing Learner"\n3. Selects the learner from the registered users list\n4. The learner\'s role is elevated to SME/Reviewer\n5. Login credentials are emailed to the learner\n6. First login requires a mandatory password change\n\n✅ The promoted user retains their learning history and gains reviewer capabilities.',
        keywords: ['promote learner', 'user to sme', 'existing user', 'promote to reviewer', 'elevate role', 'learner promotion']
      },
      {
        id: 'sme-6',
        question: 'How do I log in as an SME?',
        answer: 'SME login process:\n\n1. Go to **/sme-login** page\n2. Enter your SME email and password\n3. If first login, you\'ll be prompted to change your password\n4. After login, you\'re redirected to the Admin → Capstone Reviews tab\n\n⚠️ SME credentials are separate from regular learner credentials. They are stored in the `/reviewers` database node.',
        keywords: ['sme login', 'reviewer login', 'how to login sme', 'sme access', 'reviewer access', 'sme-login']
      },
      {
        id: 'sme-7',
        question: 'Can an SME be reassigned or disabled?',
        answer: 'Yes, the admin can manage SME reviewers:\n\n• **Reassign**: Transfer a submission from one SME to another\n• **Disable**: Temporarily deactivate an SME account (they lose review access)\n• **Re-enable**: Reactivate a disabled SME account\n• **Reset Password**: Force a password reset for any SME\n\nAll these actions are available in the Reviewer Pool tab under Admin → Capstone Reviews.',
        keywords: ['reassign', 'disable sme', 'change reviewer', 'enable reviewer', 'manage reviewer', 'reviewer management']
      },
      {
        id: 'sme-8',
        question: 'What scoring categories does the SME evaluate?',
        answer: 'The 9-category rubric (100 points total):\n\n| Category | Points |\n|----------|--------|\n| Authentication | 10 |\n| Dashboard | 10 |\n| Master Data | 10 |\n| Transactions | 15 |\n| Workflow | 20 |\n| RBAC | 15 |\n| Reports | 10 |\n| Deployment | 5 |\n| Documentation | 5 |\n\nDecisions: ≥85 Outstanding, ≥70 Pass, ≥50 Rework, <50 Rebuild',
        keywords: ['scoring categories', 'rubric details', 'evaluation criteria', 'what is scored', 'grading categories', '9 categories']
      },
    ],

    // ── 8. ADMIN & SETTINGS ─────────────────────────────────────────
    admin: [
      {
        id: 'adm-1',
        question: 'What can the admin do?',
        answer: 'The admin has access to multiple management tabs:\n\n📊 **Dashboard & Insights**: Live traffic analytics, cohort stats, and funnel\n📂 **Reports & Downloads**: Filtered data export wizard (XLSX, CSV, PDF)\n📚 **Manage Modules**: Upload/edit slide decks, audio, videos\n📝 **Feedback Analytics**: Analyze learner feedback\n🎓 **Capstone Reviews**: Full SME review management\n📋 **Capstone Progress Editor**: Override capstone selections\n✅ **Manual Approvals**: Approve pending payments & premium upgrades\n🎯 **Talent Radar**: Candidate scoring, outreach management\n📅 **SME Meetings**: Manage meeting requests from candidates\n📧 **Notification Log**: Email delivery history\n🔍 **System Audit Log**: Searchable audit trail\n⚙️ **System Settings**: Full platform configuration',
        keywords: ['admin', 'administrator', 'admin capabilities', 'what admin does', 'admin features', 'management']
      },
      {
        id: 'adm-2',
        question: 'How does the admin approve pending users?',
        answer: `Admin approval process (Manual mode):\n\n1. Go to **Admin → Manual Approvals** tab\n2. See two pending tables:\n   • **Program Access Approvals (₹${certPrice})** — users who paid the certification fee\n   • **Premium Upgrade Approvals (₹${premiumPrice})** — users who paid for premium\n3. Review candidate name, email, and Razorpay Payment ID\n4. Click **"Approve"** to grant access\n5. An approval email is automatically sent to the candidate\n6. The approved user appears in the **Approval History** card at the bottom`,
        keywords: ['approve user', 'pending approval', 'manual approval', 'admin approve', 'grant access']
      },
      {
        id: 'adm-3',
        question: 'What is the Talent Radar?',
        answer: 'The Talent Radar is an advanced candidate analytics system:\n\n• **Lead Readiness Score**: Computed score based on quiz results, module progress, and certification status\n• **Standout Detection**: Candidates with ≥70 readiness AND (90+ quiz OR passed lab)\n• **User Type Badges**: Colour-coded status indicators for Free Tier / Pending / Paid / Premium / Admin/SME roles\n• **User Type Filter**: Filter the candidate list by account tier (All, Free Tier, Pending, Paid, Premium, Certified)\n• **Outreach Pipeline**: Tags candidates through stages: New → Contacted → Warm → Hot Lead → Interview → Placed → Dropped\n• **CSV Export**: Export candidate data for external use',
        keywords: ['talent radar', 'lead readiness', 'candidate tracking', 'outreach', 'hiring pipeline', 'recruitment']
      },
      {
        id: 'adm-4',
        question: 'Can the admin upload a custom certificate template?',
        answer: 'Yes! In **Admin → System Settings → Maintenance**:\n\n• Upload a custom HTML certificate template\n• Use {{placeholder}} syntax for dynamic fields (name, score, date, etc.)\n• Preview the template before activation\n• Restore the default built-in template anytime\n• View template upload history\n\nIf no custom template is uploaded, a built-in default design is used.',
        keywords: ['certificate template', 'custom certificate', 'upload template', 'design certificate', 'certificate design']
      },
      {
        id: 'adm-5',
        question: 'How does the admin manage system settings?',
        answer: 'System Settings has these sub-tabs:\n\n• **Connection**: Firebase RTDB URL, credentials, test/disconnect\n• **Gating**: Free modules limit, approval mode (Manual/Automated)\n• **Pricing**: Academy name, certification price, premium price, contact details\n• **Verification**: Toggle email/phone verification requirements\n• **EmailJS**: Service ID, template IDs (10 types), public key, admin email\n• **AI Review**: Configure Tier B AI review (model, function, enable/disable)\n• **Maintenance**: Admin password, DB wipe/reset, certificate template',
        keywords: ['system settings', 'configuration', 'configure', 'settings', 'admin settings', 'platform settings']
      },
      {
        id: 'adm-6',
        question: 'Can the admin export data?',
        answer: 'Yes! The admin has two main ways to download data:\n\n1. **Reports & Downloads tab**: A dedicated data center where you can filter and download 6 different reports (Learners Directory, Payment Logs, Capstone Submissions, Curriculum Progress, SME Meetings, and Audit Logs) as Excel (.xlsx), CSV, or PDF.\n2. **Feedback Analytics & Talent Radar**: Direct export options exist inside those specific tabs.\n\nExcel exports utilize SheetJS (XLSX) for clean multi-sheet workbooks.',
        keywords: ['export', 'csv', 'excel', 'xlsx', 'download data', 'data export', 'audit log export', 'pdf export']
      },
      {
        id: 'adm-7',
        question: 'What are the user type badges in Talent Radar?',
        answer: `The Talent Radar Status column shows colour-coded badges for every candidate's account tier:\n\n🟣 **Purple badge** → Admin or SME/Reviewer (elevated role)\n⭐ **Gold/Amber badge** → Premium User (₹${premiumPrice} upgrade approved)\n🔵 **Indigo badge** → Paid User (₹${certPrice} program fee approved, Modules 3-7 unlocked)\n🟡 **Pulsing yellow badge** → Pending Paid (payment submitted, awaiting your approval)\n⬜ **Slate/grey badge** → Free Tier Guest (registered, no payment yet)\n\nYou can filter the Talent Radar by these exact tiers using the "All User Types" dropdown:\n• Free Tier Guests\n• Pending Paid candidates\n• Paid Users\n• Premium Users\n• Certified candidates`,
        keywords: ['talent radar badges', 'user type badges', 'status badges', 'badge colors', 'badge colours', 'tier badges', 'candidate badges', 'status column', 'user types radar']
      },
      {
        id: 'adm-8',
        question: 'How do I see who I have approved in the past?',
        answer: 'The **Approval History (Already Approved)** card is at the bottom of the **Manual Approvals** tab.\n\nIt shows:\n• Candidate name and email\n• **Approved Access Tiers**: which payment tier(s) were approved (Program Access and/or Premium Upgrade) with the exact price\n• **Razorpay Payment ID** for each candidate\n• **Approval Date** — automatically logged timestamp when you clicked Approve (shown as localized date/time)\n\nCandidates are sorted with the most recently approved first.\n\n⚠️ For candidates approved before the timestamp logging was introduced, the date shows as "Historical (Prior to log)".',
        keywords: ['approval history', 'who approved', 'past approvals', 'approved users list', 'already approved', 'approval log', 'see approved', 'previous approvals']
      },
      {
        id: 'adm-9',
        question: 'How do I search or filter the Approval History table?',
        answer: `The Approval History table has a built-in filter toolbar with two controls:\n\n🔍 **Search Box** (left side):\n• Type any part of a candidate's name or email\n• Results update instantly as you type\n• Click the x button to clear the search\n\n📂 **Access Tier Dropdown** (right side):\n• **All Approved Tiers** — show all approved users\n• **Program Access** — show only users approved for the certification tier (₹${certPrice})\n• **Premium Upgrade** — show only users who upgraded to Premium (₹${premiumPrice})\n• **Both Tiers** — show only users who have BOTH approvals\n\nThe filtered count is shown live in the "Total: X users" badge at the top of the card.`,
        keywords: ['filter approvals', 'search approvals', 'filter approval history', 'search approved users', 'approval filter', 'tier filter', 'find approved user', 'approval search']
      },
      {
        id: 'adm-10',
        question: 'What is the pending count badge on the approvals tab?',
        answer: 'The **Manual Approvals** tab in the admin sidebar shows a real-time pending count badge:\n\n• The badge displays the total number of users currently in **PENDING_APPROVAL** status (waiting for you to approve their payment)\n• It is highlighted in amber/orange so you can spot it instantly\n• The count updates dynamically as you approve or as new users submit payment\n\nThis helps you never miss an approval request even when you are on a different admin tab.',
        keywords: ['pending count', 'pending badge', 'approval badge', 'notification badge', 'pending number', 'how many pending', 'approvals count', 'sidebar badge']
      },
      {
        id: 'adm-11',
        question: 'How do I change the certification or premium price?',
        answer: `To update the pricing displayed throughout the platform:\n\n1. Go to **Admin → System Settings**\n2. Click the **Pricing** sub-tab\n3. Update:\n   • **Certification Price** (Program Access fee, currently ₹${certPrice})\n   • **Premium Upgrade Price** (Premium tier fee, currently ₹${premiumPrice})\n4. Click **Save Settings**\n\n✅ The new prices are **immediately reflected everywhere** — the Payment Gate, Manual Approvals cards, Approval History tier labels, and the Ask Assistant all update dynamically without needing a redeployment.\n\n💡 You can also update the Academy Name, contact email, and contact phone number from the same Pricing sub-tab.`,
        keywords: ['change price', 'update price', 'modify price', 'pricing settings', 'set price', 'certification price', 'premium price', 'dynamic pricing', 'how to change fee']
      },
      {
        id: 'adm-12',
        question: 'What is the SME Meetings tab in the admin panel?',
        answer: 'The **SME Meetings** tab is a dedicated section for managing meeting requests submitted by candidates:\n\n• Candidates can request a 1-on-1 review or mentoring session with an SME\n• Requests appear in the SME Meetings tab with candidate details and the requested time\n• The admin can review, approve, or coordinate meeting scheduling\n• A real-time pending count badge on the sidebar tab highlights new requests\n\nThis tab is separate from the **Capstone Reviews** tab which manages project grading. The SME Meetings tab is purely for scheduling and coordination.',
        keywords: ['sme meetings', 'meetings tab', 'meeting requests', 'schedule meeting', 'meeting admin', '1 on 1', 'mentoring session', 'meeting management']
      },
      {
        id: 'adm-13',
        question: 'Can the admin see approvals done before timestamp logging was added?',
        answer: 'Yes — the **Approval History** card shows ALL currently approved users regardless of when they were approved.\n\nFor users approved **after** the timestamp logging was introduced, the exact approval date/time is shown in IST format.\n\nFor users approved **before** the logging system was in place (historical approvals), the date column shows:\n"**Historical (Prior to log)**"\n\nThis ensures no approved user is ever invisible to the admin — you will always see the complete picture of who has access, with whatever date information is available.\n\nIf you need to manually fix an approval date, contact your developer to update the `approvedAt` or `premiumApprovedAt` field directly in Firebase.',
        keywords: ['historical approvals', 'old approvals', 'before logging', 'no date', 'missing date', 'prior to log', 'approval timestamp', 'historical data']
      },
      {
        id: 'adm-14',
        question: 'What reports can I download from the Reports & Downloads tab?',
        answer: 'The **Reports & Downloads** tab provides 6 custom report modules:\n\n1. **Registered Learners Directory** — details, levels, XP, streaks, and standout status\n2. **Payment & Approvals Log** — details of certified fees, premium upgrades, payment IDs, and dates\n3. **Capstone Submissions Report** — project lock details, repository/live links, reviewing SMEs, and scores\n4. **Curriculum Progress Report** — slide progress per module, quiz scores, and lab clearances\n5. **SME Meetings Log** — scheduled virtual review sessions, links, notes, and statuses\n6. **System Audit Trail Log** — timeline log of logins, settings changes, and events\n\nEach report has inline filter dropdowns so you can refine your dataset before downloading it as Excel (.xlsx), CSV, or PDF.',
        keywords: ['download reports', 'what reports', 'report types', 'excel download', 'pdf report', 'export reports', 'learner directory', 'payments log']
      },
    ],

    // ── 9. GAMIFICATION & PROGRESS ──────────────────────────────────
    gamification: [
      {
        id: 'gam-1',
        question: 'How does the XP and level system work?',
        answer: 'The gamification system:\n\n**XP (Experience Points)**: Earned by completing activities (viewing slides, passing quizzes, submitting feedback, etc.)\n\n**Level Calculation**: Level = √(XP / 100) + 1\n• 100 XP → Level 2\n• 400 XP → Level 3\n• 900 XP → Level 4\n• 1600 XP → Level 5\n\nYour level and XP are displayed in the header next to your avatar.',
        keywords: ['xp', 'experience', 'level', 'levels', 'how levels work', 'level up', 'experience points']
      },
      {
        id: 'gam-2',
        question: 'What badges can I earn?',
        answer: 'Available badges:\n\n🏅 **FIRST_STEP**: View your first slide in any module\n🧠 **QUIZ_MASTER**: Score ≥80% on the Module 2 quiz\n🛡️ **GUARDIAN**: Pass a lab exercise\n🔥 **STREAK_3**: Maintain a 3-day active streak\n⚡ **STREAK_7**: Maintain a 7-day active streak\n🌟 **LEVEL_5**: Reach Level 5 (1600+ XP)\n\nBadges are displayed in your profile and contribute to your gamification score.',
        keywords: ['badges', 'achievements', 'earn badges', 'badge types', 'awards', 'milestones', 'rewards']
      },
      {
        id: 'gam-3',
        question: 'How do streaks work?',
        answer: 'Streaks track consecutive days of platform activity:\n\n• **Active Day**: Any day you view slides, take quizzes, or interact with content\n• **Streak Counter**: Increments each consecutive active day\n• **Streak Reset**: Resets to 0 if you miss a day\n• **Streak Badges**: Earn badges at 3-day and 7-day streaks\n\nYour streak count and last active date are tracked in your profile.',
        keywords: ['streak', 'daily streak', 'consecutive', 'active days', 'streak count', 'streak reset']
      },
      {
        id: 'gam-4',
        question: 'How is my progress tracked?',
        answer: 'Your progress is tracked across multiple dimensions:\n\n• **Slides Viewed**: Per-module slide completion percentage\n• **Modules Completed**: Total modules finished\n• **Quiz Scores**: Best score on each quiz attempt\n• **Labs Passed**: List of completed lab exercises\n• **XP & Level**: Cumulative experience points\n• **Badges Earned**: Achievement badges collected\n• **Streak Days**: Consecutive active days\n• **Last Active Date**: Most recent activity timestamp\n\nAll progress syncs in real-time with Firebase.',
        keywords: ['progress', 'tracking', 'completion', 'percentage', 'how far', 'my progress', 'profile']
      },
      {
        id: 'gam-5',
        question: 'What is the Lead Readiness Score?',
        answer: 'The Lead Readiness Score (0-100) measures your overall certification readiness:\n\n• **Quiz Component** (capped at 30 points): Based on your quiz score\n• **Module Progress** (capped at remaining): Based on slides viewed and modules completed\n• **Lab Completion**: Points for passed labs\n• **Certification Status**: Bonus for being certified\n\n**Standout Criteria**: Score ≥70 AND (90+ quiz OR passed lab)\nCandidates meeting standout criteria are flagged in the Talent Radar for priority outreach.',
        keywords: ['lead readiness', 'readiness score', 'readiness', 'candidate score', 'talent score', 'standout']
      },
      {
        id: 'gam-6',
        question: 'Where can I see my XP and badges?',
        answer: 'Your gamification stats are visible in:\n\n• **Header Bar**: Level badge, XP bar, and streak fire icon (top of every page)\n• **Profile Section**: Click your avatar to see detailed stats\n• **Modules Page**: Progress indicators per module\n\nBadges and levels are updated in real-time as you complete activities.',
        keywords: ['where xp', 'see badges', 'view progress', 'my stats', 'my level', 'where level']
      },
    ],

    // ── 10. RESOURCE VAULT & SUPPORT ────────────────────────────────
    resources: [
      {
        id: 'res-1',
        question: 'What is the Resource Vault?',
        answer: 'The Resource Vault (/resources) is a download center for study materials:\n\n• Reference documents, guides, and templates\n• Searchable and filterable document grid\n• Each document shows title, file size, and description\n\n**Access rules**:\n• Guests can browse but NOT download (triggers login prompt)\n• Registered candidates can download all files\n• Admins can upload new documents (max 8MB per file)',
        keywords: ['vault', 'resource vault', 'resources', 'study materials', 'downloads', 'library', 'documents']
      },
      {
        id: 'res-2',
        question: 'Why can\'t I download from the Resource Vault?',
        answer: 'If you cannot download files:\n\n• **Guest users**: You must register and log in first. Clicking download as a guest triggers a login prompt.\n• **Registered users**: Ensure you\'re logged in — check for your avatar in the header\n• **File issues**: If a specific file fails to download, try refreshing the page\n\nThe vault requires authentication to prevent unauthorized access to study materials.',
        keywords: ['cant download', 'download blocked', 'vault locked', 'guest download', 'login to download']
      },
      {
        id: 'res-3',
        question: 'How does the feedback system work?',
        answer: 'Feedback is mandatory at the end of every module:\n\n• **Multi-dimension ratings**: Rate pace, instruction clarity, lab engagement, etc.\n• **Written comments**: Provide detailed feedback (validated for quality)\n• **Quality checks**: Gibberish and profanity detection via regex — nonsense text is flagged\n• **Auto-save**: Drafts saved automatically after 800ms of typing\n• **Offline support**: If offline, feedback is cached locally and synced when back online\n\nYour profile details (department, organization) are pre-filled for authenticated users.',
        keywords: ['feedback', 'rating', 'review module', 'comment', 'end of module', 'feedback form', 'mandatory feedback']
      },
      {
        id: 'res-4',
        question: 'Does the platform work offline?',
        answer: 'Partial offline support:\n\n• **Feedback drafts**: Auto-saved to localStorage after 800ms of typing. If you go offline mid-feedback, the draft is cached locally.\n• **Background sync**: When connection restores, queued drafts sync automatically to Firebase.\n• **Core features**: Module browsing, quizzes, and submissions require an active internet connection.\n\n⚠️ Full offline mode is not available — internet connectivity is needed for most features.',
        keywords: ['offline', 'no internet', 'connection', 'offline mode', 'works offline', 'disconnected']
      },
      {
        id: 'res-5',
        question: 'How do I contact support?',
        answer: `For any queries not answered by this assistant:\n\n📧 **Email**: ${contactEmail}\n📱 **Phone**: +91 9962574842\n\nYou can also use the feedback forms within the platform to share suggestions or report issues.\n\nThe admin monitors notification logs and audit logs for system issues.`,
        keywords: ['contact', 'support', 'help', 'email', 'phone', 'reach out', 'talk to human', 'customer service']
      },
      {
        id: 'res-6',
        question: 'How do I report a bug or issue?',
        answer: `To report a bug or technical issue:\n\n1. **Email**: Send details to **${contactEmail}**\n2. Include: What happened, what you expected, and screenshots if possible\n3. Mention your browser, device, and any error messages\n\nThe platform automatically logs client-side errors to the **System Audit Log**, which the admin monitors. Common issues like window errors, network failures, and state mismatches are tracked automatically.`,
        keywords: ['bug', 'issue', 'problem', 'error', 'report bug', 'not working', 'broken', 'glitch']
      },
    ],
  };

  // ── Flattened FAQ list for matching ──
  const allFaqs: FaqEntry[] = Object.values(faqCategories).flat();

  // ── Category metadata for UI tabs ──
  const categoryMeta: { id: FaqCategoryKey; icon: React.ElementType; label: string }[] = [
    { id: 'getting_started', icon: Home,        label: 'Start'    },
    { id: 'modules',         icon: BookOpen,     label: 'Modules'  },
    { id: 'access_gating',   icon: Lock,         label: 'Access'   },
    { id: 'payment',         icon: CreditCard,   label: 'Payment'  },
    { id: 'certification',   icon: Award,        label: 'Certify'  },
    { id: 'capstone',        icon: FlaskConical, label: 'Capstone' },
    { id: 'sme_review',      icon: UserCheck,    label: 'SME'      },
    { id: 'admin',           icon: Settings,     label: 'Admin'    },
    { id: 'gamification',    icon: Trophy,       label: 'XP'       },
    { id: 'resources',       icon: LifeBuoy,     label: 'Support'  },
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
  }, [certPrice]);

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
      text: `Hello! 👋 I'm your OrchestrAI Ask Assistant — your comprehensive guide to the certification academy.\n\nI can help with:\n• 📚 Modules & Syllabus\n• 🎓 Certification & Scoring\n• 🧪 Capstone Projects\n• 💳 Payment & Premium\n• 👨‍🏫 SME Review Process\n• ⚙️ Admin Workflows\n• 🏆 XP, Badges & Progress\n\nBrowse categories below or type any question!`,
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

  // ════════════════════════════════════════════════════════════════
  //  ENHANCED QUERY PARSER — Synonym expansion + fuzzy matching
  // ════════════════════════════════════════════════════════════════

  const parseUserQuery = (query: string): string => {
    const lowerQuery = query.toLowerCase().trim();

    // ── Priority 1: Module-specific keyword matching ──
    const moduleMatches: [RegExp, string][] = [
      [/\b(module\s*1|m1|mindset)\b/, 'mod-1'],
      [/\b(module\s*2|m2|architecture|principles?|lifecycle)\b/, 'mod-2'],
      [/\b(module\s*3|m3|bible|oge|governance)\b/, 'mod-3'],
      [/\b(module\s*4|m4|foundation)\b/, 'mod-4'],
      [/\b(module\s*5|m5|workflow\s*engine)\b/, 'mod-5'],
      [/\b(module\s*6|m6|going\s*live)\b/, 'mod-6'],
      [/\b(module\s*7|m7|capstone\s*build)\b/, 'mod-7'],
    ];

    for (const [regex, faqId] of moduleMatches) {
      if (regex.test(lowerQuery)) {
        const faq = allFaqs.find(f => f.id === faqId);
        if (faq) return faq.answer;
      }
    }

    // ── Priority 2: Phrase-based matching (multi-word) ──
    const phraseMatches: [string[], string][] = [
      [['download certificate', 'save certificate', 'export certificate', 'get certificate', 'certificate download'], 'cert-2'],
      [['become sme', 'become reviewer', 'become evaluator', 'how to review'], 'sme-2'],
      [['promote learner', 'promote user', 'user to sme', 'promote to reviewer', 'existing user reviewer'], 'sme-5'],
      [['how to certify', 'get certified', 'certification process', 'certification steps'], 'cert-1'],
      [['premium upgrade', 'premium access', 'upgrade account', 'pro access'], 'pay-3'],
      [['payment gate', 'access gate', 'unlock modules'], 'ag-2'],
      [['quiz gate', 'quiz requirement', 'knowledge check'], 'ag-1'],
      [['build plan', '5 day plan', 'daily plan', 'capstone plan'], 'cap-8'],
      [['after submit', 'after submission', 'what happens after', 'review workflow'], 'cap-9'],
      [['scoring rubric', 'grading rubric', 'scoring categories', 'evaluation criteria'], 'sme-8'],
      [['reset password', 'forgot password', 'change password', 'lost password'], 'gs-7'],
      [['how to register', 'create account', 'sign up'], 'gs-3'],
      [['contact support', 'contact admin', 'customer service', 'need help'], 'res-5'],
      [['report bug', 'report issue', 'found bug', 'not working'], 'res-6'],
      [['xp level', 'how levels work', 'experience points', 'level system'], 'gam-1'],
      [['earn badges', 'what badges', 'badge types', 'achievements'], 'gam-2'],
      [['talent radar', 'candidate tracking', 'lead readiness'], 'adm-3'],
      [['ai review', 'tier b', 'automated review', 'ai scoring'], 'sme-4'],
      [['resource vault', 'study materials', 'download materials'], 'res-1'],
      [['account status', 'pending approval'], 'ag-3'],
      [['approval mode', 'manual automated', 'how approval'], 'ag-7'],
      // ── New entries for user types & admin workflows ──
      [['user types', 'user tiers', 'account tiers', 'different users', 'roles and tiers', 'type of user', 'what type am i'], 'gs-4'],
      [['free tier', 'what can free', 'free user can', 'guest access', 'what is free', 'free access'], 'ag-9'],
      [['what tier am i', 'my account type', 'check my tier', 'see my tier', 'how to know my tier', 'identify my account'], 'ag-10'],
      [['paid vs premium', 'paid or premium', 'difference between paid', 'paid user vs', 'program access vs premium'], 'pay-8'],
      [['after approved', 'once approved', 'approved what happens', 'approved now what', 'after admin approves'], 'pay-9'],
      [['user type badges', 'talent radar badges', 'badge colors', 'badge colours', 'status badges radar'], 'adm-7'],
      [['approval history', 'who approved', 'past approvals', 'already approved', 'see approved users'], 'adm-8'],
      [['filter approvals', 'search approvals', 'search approved', 'filter approval history', 'approval search'], 'adm-9'],
      [['pending count', 'pending badge', 'approval notification', 'pending number'], 'adm-10'],
      [['change price', 'update price', 'set fee', 'change fee', 'pricing settings', 'dynamic pricing', 'modify price'], 'adm-11'],
      [['sme meetings', 'meetings tab', 'meeting requests', 'schedule meeting'], 'adm-12'],
      [['historical approvals', 'old approvals', 'before logging', 'no date approval', 'prior to log'], 'adm-13'],
    ];

    for (const [phrases, faqId] of phraseMatches) {
      for (const phrase of phrases) {
        if (lowerQuery.includes(phrase)) {
          const faq = allFaqs.find(f => f.id === faqId);
          if (faq) return faq.answer;
        }
      }
    }

    // ── Priority 3: Difficulty keywords ──
    if (/\b(easy|easiest|simple|simplest)\b/.test(lowerQuery)) {
      const faq = allFaqs.find(f => f.id === 'mod-8');
      if (faq) return faq.answer;
    }
    if (/\b(hard|hardest|difficult|tough|complex|challenging)\b/.test(lowerQuery)) {
      const faq = allFaqs.find(f => f.id === 'mod-8');
      if (faq) return faq.answer;
    }

    // ── Priority 4: Synonym-expanded keyword overlap scoring ──
    const expandQuery = (q: string): Set<string> => {
      const tokens = new Set(q.split(/\s+/).filter(w => w.length > 2));
      for (const [canonical, synonyms] of Object.entries(SYNONYM_MAP)) {
        const allTerms = [canonical, ...synonyms];
        const hasMatch = allTerms.some(term => q.includes(term));
        if (hasMatch) {
          tokens.add(canonical);
          synonyms.forEach(s => tokens.add(s));
        }
      }
      return tokens;
    };

    const expandedQueryTokens = expandQuery(lowerQuery);

    let bestMatch: FaqEntry | null = null;
    let highestScore = 0;

    for (const faq of allFaqs) {
      let score = 0;

      for (const keyword of faq.keywords) {
        if (lowerQuery.includes(keyword)) {
          score += keyword.includes(' ') ? 3 : 1;
        }
        for (const token of expandedQueryTokens) {
          if (keyword.includes(token) || token.includes(keyword)) {
            score += 0.5;
          }
        }
      }

      if (lowerQuery.includes(faq.question.toLowerCase())) {
        score += 10;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    }

    if (bestMatch && highestScore > 0) {
      return bestMatch.answer;
    }

    return `I couldn't find a precise match for your question.\n\nTry asking about:\n• A specific module (e.g. "Tell me about Module 3")\n• User tiers (e.g. "What are the user types?")\n• Approval workflows (e.g. "How to approve users?")\n• Payment (e.g. "What is the certification fee?")\n• Capstone (e.g. "How is capstone scored?")\n\nOr contact us directly:\n📧 **${contactEmail}**\n📱 **+91 9962574842**`;
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans pointer-events-none">
      
      {/* ─── CHATBOX PANEL ─── */}
      <div 
        className={`glass-card mb-4 w-96 max-w-[calc(100vw-2rem)] h-[600px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] bg-[var(--bg-card)] transition-all duration-300 origin-bottom-right ${
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
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-indigo-700" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h4 className="text-xs font-bold tracking-tight">Ask Assistant</h4>
                <Sparkles className="h-3 w-3 text-cyan-300 animate-pulse" />
              </div>
              <span className="text-[10px] text-indigo-200 font-medium leading-none">OrchestrAI Helpdesk • 80+ Q&As</span>
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
                      : 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white border-indigo-500/25 rounded-tr-sm font-medium'
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
              {/* Category tabs — 2-row grid so all 10 are always visible */}
              <div className="grid grid-cols-5 gap-0.5 border-b border-[var(--border-color)] pb-2 mb-2">
                {categoryMeta.map(cat => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-md transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-sm'
                          : 'text-[var(--text-secondary)] hover:bg-slate-500/8 hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Icon className="h-3 w-3 shrink-0" strokeWidth={isActive ? 2.5 : 1.8} />
                      <span className="text-[7.5px] font-bold uppercase tracking-wide leading-none">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Categorized Pills */}
              <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
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
            placeholder="Ask a question about the academy..."
            disabled={isTyping}
            className="flex-grow bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
          />
          <button
            onClick={handleSendText}
            disabled={!inputVal.trim() || isTyping}
            className="h-8 w-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <button 
        id="quick-help-fab"
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer relative group ${
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
