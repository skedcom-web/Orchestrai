import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirebaseDb } from '../firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { 
  ref, 
  set, 
  update, 
  onValue, 
  remove, 
  get,
  getDatabase
} from 'firebase/database';

// Theme Type
export type ThemeMode = 'light' | 'dark' | 'glass';

// ── Gamification: Learner Progress Schema ──
export interface LearnerProgress {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;              // 'YYYY-MM-DD' — for streak math
  modulesCompleted: number[];
  slidesViewed: Record<number, number[]>;  // moduleId -> slide indexes seen
  quizScores: Record<number, number>;      // moduleId -> best %
  labsPassed: number[];                     // moduleIds whose lab is cleared
  badges: string[];                         // earned badge ids
}

// User Schema
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  accountStatus: 'FREE_TIER' | 'PENDING_APPROVAL' | 'APPROVED';
  quizPassed: boolean;
  paymentId?: string;
  progress?: LearnerProgress;
  mobile?: string;
  emailVerified?: boolean;
  mobileVerified?: boolean;
}

// Badge metadata — id, label, description, lucide icon name (UI maps icons in Change #2)
export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export const BADGES: BadgeDef[] = [
  { id: 'first-steps', name: 'First Steps',   desc: 'Explored your very first slide',        icon: 'footprints' },
  { id: 'quiz-master', name: 'Quiz Master',   desc: 'Passed a knowledge gate (≥ 80%)',       icon: 'brain' },
  { id: 'guardian',    name: 'The Guardian',  desc: 'Cleared the Prompt Simulator lab',      icon: 'shield-check' },
  { id: 'module-1',    name: 'Mindset Shift', desc: 'Completed Module 1',                    icon: 'rocket' },
  { id: 'foundation',  name: 'Foundation Laid',desc: 'Completed Modules 1 & 2',              icon: 'layers' },
  { id: 'streak-3',    name: 'On Fire',       desc: 'Maintained a 3-day learning streak',    icon: 'flame' },
  { id: 'streak-7',    name: 'Unstoppable',   desc: 'Maintained a 7-day learning streak',    icon: 'zap' },
  { id: 'level-5',     name: 'Rising Lead',   desc: 'Reached Level 5',                       icon: 'trending-up' },
];

// XP awarded per action
export const XP_VALUES = {
  slideView: 5,
  moduleComplete: 50,
  quizPass: 100,
  labPass: 75,
  dailyStreak: 10,
} as const;

export const DEFAULT_PROGRESS: LearnerProgress = {
  xp: 0,
  level: 1,
  streakDays: 0,
  lastActiveDate: '',
  modulesCompleted: [],
  slidesViewed: {},
  quizScores: {},
  labsPassed: [],
  badges: [],
};

// Backfill any missing fields so older accounts/sessions are always safe to read.
export const ensureProgress = (p?: Partial<LearnerProgress>): LearnerProgress => {
  const rawSlides = p?.slidesViewed || {};
  const cleanSlides: Record<number, number[]> = {};
  for (const [key, val] of Object.entries(rawSlides)) {
    if (val && Array.isArray(val)) {
      cleanSlides[Number(key)] = val;
    }
  }
  return {
    ...DEFAULT_PROGRESS,
    ...p,
    slidesViewed: cleanSlides,
    quizScores: { ...(p?.quizScores || {}) },
    modulesCompleted: [...(p?.modulesCompleted || [])],
    labsPassed: [...(p?.labsPassed || [])],
    badges: [...(p?.badges || [])],
  };
};

// Level curve: gentle early levels for fast dopamine. level = floor(sqrt(xp/100)) + 1
const xpForLevel = (level: number) => Math.pow(Math.max(0, level - 1), 2) * 100;

export const getLevelInfo = (xp: number) => {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const curBase = xpForLevel(level);
  const nextBase = xpForLevel(level + 1);
  const into = xp - curBase;
  const span = nextBase - curBase;
  return {
    level,
    xpIntoLevel: into,
    xpForNextLevel: span,
    xpToNext: nextBase - xp,
    progressPct: span > 0 ? Math.min(100, Math.round((into / span) * 100)) : 0,
  };
};

// Derive the full set of badges a learner has earned from their current progress (idempotent).
export const deriveBadges = (p: LearnerProgress): string[] => {
  const out: string[] = [];
  if (!p) return out;
  if (p.slidesViewed && typeof p.slidesViewed === 'object') {
    if (Object.values(p.slidesViewed).some((arr) => Array.isArray(arr) && arr.length > 0)) out.push('first-steps');
  }
  if (p.quizScores && typeof p.quizScores === 'object') {
    if (Object.values(p.quizScores).some((s) => typeof s === 'number' && s >= 80)) out.push('quiz-master');
  }
  if (Array.isArray(p.labsPassed) && p.labsPassed.length > 0) out.push('guardian');
  if (Array.isArray(p.modulesCompleted)) {
    if (p.modulesCompleted.includes(1)) out.push('module-1');
    if (p.modulesCompleted.includes(1) && p.modulesCompleted.includes(2)) out.push('foundation');
  }
  if (typeof p.streakDays === 'number') {
    if (p.streakDays >= 3) out.push('streak-3');
    if (p.streakDays >= 7) out.push('streak-7');
  }
  if (typeof p.level === 'number' && p.level >= 5) out.push('level-5');
  return out;
};

// System Config Schema
export interface SystemConfig {
  freeModulesLimit: number;
  approvalMode: 'MANUAL' | 'AUTOMATED';
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
  adminEmail: string;
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
  firebaseDatabaseUrl?: string;
  adminPassword?: string;
  templates: {
    [key: string]: { subject: string; body: string };
  };
  moduleMedia?: {
    [key: number]: {
      videoUrl?: string;
      videoType?: 'url' | 'upload';
      avatarAudioUrl?: string;
      captions?: string[];
      externalLink?: string;
      hasPresets?: boolean;
    };
  };
  moduleSlides?: {
    [key: number]: any[] | {
      conversational: any[];
      formal?: any[];
      genz?: any[];
      beginner?: any[];
    };
  };
}

// Notification Audit Log Schema
export interface NotificationLog {
  id: string;
  timestamp: string;
  type: string;
  recipient: string;
  subject: string;
  channel: string;
  status: 'Sent' | 'Failed';
}

// System Audit Log Schema
export interface AuditLog {
  id: string;
  timestamp: string;
  type: string;
  userEmail: string;
  description: string;
}

// Visitor Engagement Schema
export interface VisitorRecord {
  id: string;
  firstSeen: string;
  lastActive: string;
  viewedModule1: boolean;
  viewedModule2: boolean;
  registered: boolean;
  registeredEmail?: string;
}

// Portfolio Submission Schema
export interface Submission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  githubRepoUrl: string;
  promptLogUrl: string;
  status: 'SUBMITTED' | 'CERTIFIED' | 'HIRE_ELIGIBLE';
  automatedTotal: number;
}

// Celebration event (level-up or badge unlock) — rendered by the global CelebrationOverlay
export interface Celebration {
  id: string;
  kind: 'level' | 'badge';
  level?: number;
  badgeId?: string;
}

// Notification Toast Schema
export interface ToastConfig {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// Custom Alert/Confirm Modal Dialog Schema
export interface DialogConfig {
  title: string;
  message: string;
  type: 'alert' | 'confirm';
  iconType?: 'success' | 'error' | 'warning' | 'info';
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AppContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  usersList: UserProfile[];
  updateUserProfile: (uid: string, updates: Partial<UserProfile>) => void;
  systemConfig: SystemConfig;
  updateSystemConfig: (updates: Partial<SystemConfig>) => void;
  notificationLogs: NotificationLog[];
  addNotificationLog: (log: Omit<NotificationLog, 'id' | 'timestamp'>) => void;
  clearNotificationLogs: () => void;
  auditLogs: AuditLog[];
  visitorsList: VisitorRecord[];
  logAuditEvent: (type: string, description: string, userEmail?: string) => void;
  trackVisitorActivity: (moduleId: number) => void;
  clearAuditLogs: () => void;
  submissions: Submission[];
  addSubmission: (githubRepoUrl: string, promptLogUrl: string) => void;
  updateSubmissionStatus: (id: string, status: Submission['status'], score: number) => void;
  login: (email: string, name: string, mobile?: string, emailVerified?: boolean, mobileVerified?: boolean) => void;
  logout: () => void;
  seedAdminAccount: () => void;

  // ── Gamification / XP engine ──
  awardXP: (amount: number, reason: string) => void;
  recordSlideView: (moduleId: number, slideIdx: number) => void;
  recordModuleComplete: (moduleId: number) => void;
  recordQuizScore: (moduleId: number, score: number) => void;
  recordLabComplete: (moduleId: number) => void;
  touchStreak: () => void;
  celebrations: Celebration[];
  dismissCelebration: (id: string) => void;

  toasts: ToastConfig[];
  addToast: (message: string, type?: ToastConfig['type']) => void;
  removeToast: (id: string) => void;
  activeDialog: DialogConfig | null;
  showDialog: (config: DialogConfig) => void;
  closeDialog: () => void;
  alertUser: (title: string, message: string, iconType?: DialogConfig['iconType']) => void;
  confirmAction: (title: string, message: string, onConfirm: () => void, iconType?: DialogConfig['iconType']) => void;
  dbStatus: 'connected' | 'disconnected' | 'testing';
  testDbConnection: (url: string) => Promise<boolean>;
  disconnectDb: () => void;
  wipeAndResetDatabase: () => Promise<void>;
  refreshDatabaseData: (silent?: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial default config values
const DEFAULT_CONFIG: SystemConfig = {
  freeModulesLimit: 2,
  approvalMode: 'MANUAL',
  emailjsServiceId: '',
  emailjsTemplateId: '',
  emailjsPublicKey: '',
  adminEmail: 'vthinkorchestrai@gmail.com',
  firebaseApiKey: 'AIzaSyDb2WxO-sGsKEHWGYwBaSSCI058F8gcwB0',
  firebaseAuthDomain: 'vthinkorchestrai-auth.firebaseapp.com',
  firebaseProjectId: 'vthinkorchestrai-auth',
  firebaseStorageBucket: 'vthinkorchestrai-auth.firebasestorage.app',
  firebaseMessagingSenderId: '180718842396',
  firebaseAppId: '1:180718842396:web:55fc55d5e2668389d065d9',
  firebaseDatabaseUrl: 'https://vthinkorchestrai-auth-default-rtdb.asia-southeast1.firebasedatabase.app',
  adminPassword: '',
  templates: {
    payment_pending: {
      subject: "[OrchestrAI Alert] Payment Pending Manual Approval",
      body: "Hi Sithanandham,\n\nA student ({{name}}, email: {{email}}) has paid ₹99 INR for the OrchestrAI Lead Certification course.\nRazorpay Payment ID: {{paymentId}}.\n\nPlease review this payment in your Razorpay dashboard and approve their access in the /admin portal."
    },
    account_approved: {
      subject: "[OrchestrAI] Congratulations! Your Access has been Approved",
      body: "Hi {{name}},\n\nWe have verified your payment of ₹99 INR. Your account has been approved and you now have full access to Modules 3 to 8.\n\nStart learning here: {{loginUrl}}\n\nGood luck,\nOrchestrAI Lead Team"
    },
    project_submitted: {
      subject: "[OrchestrAI Alert] New Portfolio Submission Received",
      body: "Hi Sithanandham,\n\nStudent {{name}} ({{email}}) has submitted their project for review.\nGitHub Repo: {{githubRepoUrl}}\nPrompt Logs: {{promptLogUrl}}\n\nPlease review their work in the admin dashboard."
    },
    certified: {
      subject: "[OrchestrAI] Congratulations on Your Certification!",
      body: "Hi {{name}},\n\nYour portfolio review is complete. You scored {{score}}% and have been certified as an OrchestrAI Lead!\n\nStatus: {{status}}\n\nKeep up the great work!\nProduct Owner, Sithanandham R."
    }
  },
  moduleMedia: {
    1: {
      videoUrl: '',
      videoType: 'url',
      avatarAudioUrl: '',
      captions: [
        "Welcome to Module 1. I am your OrchestrAI Lead avatar guide.",
        "In this module, you will learn the core mindset shift of AI orchestration.",
        "Remember: the Lead orchestrates intent, while the AI builds the code."
      ],
      externalLink: '',
      hasPresets: false
    }
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state persisted in localStorage
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('orchestrai_theme') as ThemeMode) || 'dark';
  });

  // Current session user
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const sessionUser = sessionStorage.getItem('orchestrai_session_user');
    return sessionUser ? JSON.parse(sessionUser) : null;
  });

  // Database lists stored in localStorage to mock Firebase real-time DB
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [visitorsList, setVisitorsList] = useState<VisitorRecord[]>([]);

  // Premium UI Notification/Dialog states
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const [activeDialog, setActiveDialog] = useState<DialogConfig | null>(null);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);

  const pushCelebration = (c: Omit<Celebration, 'id'>) =>
    setCelebrations((prev) => [...prev, { ...c, id: Math.random().toString(36).substring(2, 9) }]);
  const dismissCelebration = (id: string) =>
    setCelebrations((prev) => prev.filter((c) => c.id !== id));

  const addToast = (message: string, type: ToastConfig['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showDialog = (config: DialogConfig) => {
    setActiveDialog(config);
  };

  const closeDialog = () => {
    setActiveDialog(null);
  };

  const alertUser = (title: string, message: string, iconType: DialogConfig['iconType'] = 'info') => {
    showDialog({
      title,
      message,
      type: 'alert',
      iconType
    });
  };

  const confirmAction = (title: string, message: string, onConfirm: () => void, iconType: DialogConfig['iconType'] = 'warning') => {
    showDialog({
      title,
      message,
      type: 'confirm',
      iconType,
      onConfirm
    });
  };

  // 1. Sync theme updates
  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('orchestrai_theme', mode);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'glass');
    root.classList.add(theme);
  }, [theme]);

  const refreshDatabaseData = (silent: boolean = false) => {
    const db = getFirebaseDb();
    if (db) {
      if (!silent) {
        console.log("[AppContext] Triggering database refresh...");
      }
      get(ref(db, 'users')).then((snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val() || {};
          const users = Object.values(val) as UserProfile[];
          setUsersList(users);
          localStorage.setItem('orchestrai_db_users', JSON.stringify(users));
        }
      }).catch(e => console.error("Periodic users sync failed:", e));

      get(ref(db, 'submissions')).then((snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val() || {};
          const subs = Object.values(val) as Submission[];
          setSubmissions(subs);
          localStorage.setItem('orchestrai_db_submissions', JSON.stringify(subs));
        }
      }).catch(e => console.error("Periodic submissions sync failed:", e));

      get(ref(db, 'visitors')).then((snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val() || {};
          const list = Object.values(val) as VisitorRecord[];
          setVisitorsList(list);
          localStorage.setItem('orchestrai_db_visitors', JSON.stringify(list));
        }
      }).catch(e => console.error("Periodic visitors sync failed:", e));

      get(ref(db, 'audit_logs')).then((snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val() || {};
          const logs = Object.values(val) as AuditLog[];
          const sortedLogs = logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          setAuditLogs(sortedLogs);
          localStorage.setItem('orchestrai_db_audit_logs', JSON.stringify(sortedLogs));
        }
      }).catch(e => console.error("Periodic audit_logs sync failed:", e));

      get(ref(db, 'logs')).then((snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val() || {};
          const logs = Object.values(val) as NotificationLog[];
          setNotificationLogs(logs);
          localStorage.setItem('orchestrai_db_logs', JSON.stringify(logs));
        }
      }).catch(e => console.error("Periodic logs sync failed:", e));

      get(ref(db, 'config')).then((snapshot) => {
        if (snapshot.exists()) {
          const config = snapshot.val() as SystemConfig;
          const localConfigStr = localStorage.getItem('orchestrai_db_config');
          const localConfig = localConfigStr ? JSON.parse(localConfigStr) : {};
          const mergedConfig = {
            ...config,
            firebaseDatabaseUrl: localConfig.firebaseDatabaseUrl !== undefined ? localConfig.firebaseDatabaseUrl : (DEFAULT_CONFIG.firebaseDatabaseUrl || ''),
            firebaseApiKey: localConfig.firebaseApiKey !== undefined ? localConfig.firebaseApiKey : (DEFAULT_CONFIG.firebaseApiKey || ''),
            firebaseAuthDomain: localConfig.firebaseAuthDomain !== undefined ? localConfig.firebaseAuthDomain : (DEFAULT_CONFIG.firebaseAuthDomain || ''),
            firebaseProjectId: localConfig.firebaseProjectId !== undefined ? localConfig.firebaseProjectId : (DEFAULT_CONFIG.firebaseProjectId || ''),
            firebaseStorageBucket: localConfig.firebaseStorageBucket !== undefined ? localConfig.firebaseStorageBucket : (DEFAULT_CONFIG.firebaseStorageBucket || ''),
            firebaseMessagingSenderId: localConfig.firebaseMessagingSenderId !== undefined ? localConfig.firebaseMessagingSenderId : (DEFAULT_CONFIG.firebaseMessagingSenderId || ''),
            firebaseAppId: localConfig.firebaseAppId !== undefined ? localConfig.firebaseAppId : (DEFAULT_CONFIG.firebaseAppId || ''),
            adminPassword: localConfig.adminPassword !== undefined ? localConfig.adminPassword : ''
          };
          setSystemConfig(mergedConfig);
          localStorage.setItem('orchestrai_db_config', JSON.stringify(mergedConfig));
        }
      }).catch(e => console.error("Periodic config sync failed:", e));

      if (!silent) {
        addToast("Real-time database sync refreshed successfully", "success");
      }
    } else {
      loadDatabase();
    }
  };

  // 2. Load DB values from localStorage and hook up multi-tab listener for real-time synchronization
  const loadDatabase = () => {
    const localUsers = localStorage.getItem('orchestrai_db_users');
    const localConfig = localStorage.getItem('orchestrai_db_config');
    const localLogs = localStorage.getItem('orchestrai_db_logs');
    const localSubmissions = localStorage.getItem('orchestrai_db_submissions');
    const localAuditLogs = localStorage.getItem('orchestrai_db_audit_logs');
    const localVisitors = localStorage.getItem('orchestrai_db_visitors');

    if (localUsers) setUsersList(JSON.parse(localUsers));
    if (localConfig) setSystemConfig(JSON.parse(localConfig));
    if (localLogs) setNotificationLogs(JSON.parse(localLogs));
    if (localSubmissions) setSubmissions(JSON.parse(localSubmissions));
    if (localAuditLogs) setAuditLogs(JSON.parse(localAuditLogs));
    if (localVisitors) setVisitorsList(JSON.parse(localVisitors));
  };

  useEffect(() => {
    const db = getFirebaseDb();

    let unsubscribeUsers: () => void;
    let unsubscribeSubmissions: () => void;
    let unsubscribeLogs: () => void;
    let unsubscribeAuditLogs: () => void;
    let unsubscribeVisitors: () => void;
    let unsubscribeConfig: () => void;
    let unsubscribeConnected: () => void;

    if (db) {
      console.log("[AppContext] Firebase Realtime Database is connected. Setting up real-time cloud listeners...");

      // 0. Listen to connection state
      const connectedRef = ref(db, '.info/connected');
      setDbStatus('testing');
      unsubscribeConnected = onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          setDbStatus('connected');
        } else {
          setDbStatus('disconnected');
        }
      });

      // 1. Listen to /users
      unsubscribeUsers = onValue(ref(db, 'users'), (snapshot) => {
        const val = snapshot.val() || {};
        const users = Object.values(val) as UserProfile[];
        setUsersList(users);
        localStorage.setItem('orchestrai_db_users', JSON.stringify(users));
      }, (err) => {
        console.error("RTDB users listen failed:", err);
      });

      // 2. Listen to /submissions
      unsubscribeSubmissions = onValue(ref(db, 'submissions'), (snapshot) => {
        const val = snapshot.val() || {};
        const subs = Object.values(val) as Submission[];
        setSubmissions(subs);
        localStorage.setItem('orchestrai_db_submissions', JSON.stringify(subs));
      });

      // 3. Listen to /logs
      unsubscribeLogs = onValue(ref(db, 'logs'), (snapshot) => {
        const val = snapshot.val() || {};
        const logs = Object.values(val) as NotificationLog[];
        setNotificationLogs(logs);
        localStorage.setItem('orchestrai_db_logs', JSON.stringify(logs));
      });

      // Listen to /audit_logs
      unsubscribeAuditLogs = onValue(ref(db, 'audit_logs'), (snapshot) => {
        const val = snapshot.val() || {};
        const logs = Object.values(val) as AuditLog[];
        const sortedLogs = logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        setAuditLogs(sortedLogs);
        localStorage.setItem('orchestrai_db_audit_logs', JSON.stringify(sortedLogs));
      });

      // Listen to /visitors
      unsubscribeVisitors = onValue(ref(db, 'visitors'), (snapshot) => {
        const val = snapshot.val() || {};
        const list = Object.values(val) as VisitorRecord[];
        setVisitorsList(list);
        localStorage.setItem('orchestrai_db_visitors', JSON.stringify(list));
      });

      // 4. Listen to /config
      unsubscribeConfig = onValue(ref(db, 'config'), (snapshot) => {
        // Get the freshest credentials from localStorage
        const localConfigStr = localStorage.getItem('orchestrai_db_config');
        const localConfig = localConfigStr ? JSON.parse(localConfigStr) : {};

        if (snapshot.exists()) {
          const config = snapshot.val() as SystemConfig;
          
          const mergedConfig = {
            ...config,
            // Enforce client-side credentials from localStorage as the absolute source of truth.
            // Fall back to DEFAULT_CONFIG credentials so that blank local storage instances connect automatically.
            firebaseDatabaseUrl: localConfig.firebaseDatabaseUrl !== undefined ? localConfig.firebaseDatabaseUrl : (DEFAULT_CONFIG.firebaseDatabaseUrl || ''),
            firebaseApiKey: localConfig.firebaseApiKey !== undefined ? localConfig.firebaseApiKey : (DEFAULT_CONFIG.firebaseApiKey || ''),
            firebaseAuthDomain: localConfig.firebaseAuthDomain !== undefined ? localConfig.firebaseAuthDomain : (DEFAULT_CONFIG.firebaseAuthDomain || ''),
            firebaseProjectId: localConfig.firebaseProjectId !== undefined ? localConfig.firebaseProjectId : (DEFAULT_CONFIG.firebaseProjectId || ''),
            firebaseStorageBucket: localConfig.firebaseStorageBucket !== undefined ? localConfig.firebaseStorageBucket : (DEFAULT_CONFIG.firebaseStorageBucket || ''),
            firebaseMessagingSenderId: localConfig.firebaseMessagingSenderId !== undefined ? localConfig.firebaseMessagingSenderId : (DEFAULT_CONFIG.firebaseMessagingSenderId || ''),
            firebaseAppId: localConfig.firebaseAppId !== undefined ? localConfig.firebaseAppId : (DEFAULT_CONFIG.firebaseAppId || ''),
            adminPassword: localConfig.adminPassword !== undefined ? localConfig.adminPassword : ''
          };

          setSystemConfig(mergedConfig);
          localStorage.setItem('orchestrai_db_config', JSON.stringify(mergedConfig));
        } else {
          // Seed initial config to RTDB if it doesn't exist yet (preserving current local settings, but omitting local credentials)
          const {
            firebaseDatabaseUrl,
            adminPassword,
            firebaseApiKey,
            firebaseAuthDomain,
            firebaseProjectId,
            firebaseStorageBucket,
            firebaseMessagingSenderId,
            firebaseAppId,
            ...dbConfigToSeed
          } = localConfig;

          // Only seed non-credential settings to the cloud config node
          set(ref(db, 'config'), dbConfigToSeed).catch((err) => {
            console.error("[AppContext] Failed to seed database configuration node:", err);
          });
        }
      });

      // 5. Cloud Database cleanup and test reset on startup
      get(ref(db, 'users')).then((snapshot) => {
        let hasAdmin = false;
        if (snapshot.exists()) {
          const val = snapshot.val();
          Object.keys(val).forEach((key) => {
            const data = val[key] as UserProfile;
            if (data.email === 'vthinkorchestrai@gmail.com') {
              hasAdmin = true;
            }
            if (data.email === 'skedcom@gmail.com') {
              remove(ref(db, `users/${key}`));
              console.log("[AppContext] Purged skedcom@gmail.com from RTDB on startup.");
            } else if (data.email !== 'vthinkorchestrai@gmail.com' && data.role === 'ADMIN') {
              update(ref(db, `users/${key}`), { role: 'USER' });
              console.log(`[AppContext] Demoted admin ${data.email} on RTDB.`);
            }
          });
        }

        if (!hasAdmin) {
          console.log("[AppContext] Seeding admin account to RTDB on startup...");
          const adminProfile: UserProfile = {
            uid: 'admin-new-uid',
            email: 'vthinkorchestrai@gmail.com',
            name: 'vThink OrchestrAI Admin',
            role: 'ADMIN',
            accountStatus: 'APPROVED',
            quizPassed: true,
            progress: ensureProgress(),
            mobile: '+919876543210',
            emailVerified: true,
            mobileVerified: true
          };
          set(ref(db, `users/${adminProfile.uid}`), adminProfile).then(() => {
            console.log("[AppContext] Seeded admin successfully to cloud RTDB.");
          }).catch(err => {
            console.error("[AppContext] Failed to seed admin to RTDB:", err);
          });
        }
      }).catch((err) => console.error("RTDB startup cleanup failed:", err));

    } else {
      setDbStatus('disconnected');
      console.log("[AppContext] Firebase Realtime Database not configured. Falling back to local storage (Simulation Mode)...");
      // Initial load
      loadDatabase();

      // Trigger seed configuration if missing
      if (!localStorage.getItem('orchestrai_db_config')) {
        localStorage.setItem('orchestrai_db_config', JSON.stringify(DEFAULT_CONFIG));
        setSystemConfig(DEFAULT_CONFIG);
      }
    }

    // Local Database cleanup and test reset on startup (Fallback)
    const localUsers = localStorage.getItem('orchestrai_db_users');
    if (localUsers) {
      try {
        const dbUsers: UserProfile[] = JSON.parse(localUsers);
        
        let hasAdmin = dbUsers.some(u => u.email === 'vthinkorchestrai@gmail.com');
        // 1. Purge skedcom@gmail.com so it acts as a completely new user
        let updatedUsers = dbUsers.filter(u => u.email !== 'skedcom@gmail.com');
        let changed = dbUsers.length !== updatedUsers.length;

        // 2. Demote any other non-vthinkorchestrai accounts carrying ADMIN role
        updatedUsers = updatedUsers.map(u => {
          if (u.email !== 'vthinkorchestrai@gmail.com' && u.role === 'ADMIN') {
            changed = true;
            return {
              ...u,
              role: 'USER' as const
            };
          }
          return u;
        });

        if (!hasAdmin) {
          const adminProfile: UserProfile = {
            uid: 'admin-new-uid',
            email: 'vthinkorchestrai@gmail.com',
            name: 'vThink OrchestrAI Admin',
            role: 'ADMIN',
            accountStatus: 'APPROVED',
            quizPassed: true,
            progress: ensureProgress(),
            mobile: '+919876543210',
            emailVerified: true,
            mobileVerified: true
          };
          updatedUsers.push(adminProfile);
          changed = true;
        }

        if (changed) {
          localStorage.setItem('orchestrai_db_users', JSON.stringify(updatedUsers));
          setUsersList(updatedUsers);
        }
      } catch (e) {
        console.error("Local database fix for testing failed:", e);
      }
    } else {
      const adminProfile: UserProfile = {
        uid: 'admin-new-uid',
        email: 'vthinkorchestrai@gmail.com',
        name: 'vThink OrchestrAI Admin',
        role: 'ADMIN',
        accountStatus: 'APPROVED',
        quizPassed: true,
        progress: ensureProgress(),
        mobile: '+919876543210',
        emailVerified: true,
        mobileVerified: true
      };
      localStorage.setItem('orchestrai_db_users', JSON.stringify([adminProfile]));
      setUsersList([adminProfile]);
    }

    // Session cleanup on startup
    const sessionUserStr = sessionStorage.getItem('orchestrai_session_user');
    if (sessionUserStr) {
      try {
        const sessionUser = JSON.parse(sessionUserStr);
        if (sessionUser.email === 'skedcom@gmail.com') {
          // Force log out skedcom to allow fresh registration testing
          sessionStorage.removeItem('orchestrai_session_user');
          setCurrentUser(null);
        } else if (sessionUser.role === 'ADMIN' && sessionUser.email !== 'vthinkorchestrai@gmail.com') {
          // Force demote other unauthorized admins
          sessionUser.role = 'USER';
          sessionStorage.setItem('orchestrai_session_user', JSON.stringify(sessionUser));
          setCurrentUser(sessionUser);
        }
      } catch (e) {
        console.error("Session storage fix failed:", e);
      }
    }

    // Real-time synchronization callback for multi-tab testing (only active if Firestore is NOT connected)
    const handleStorageChange = (e: StorageEvent) => {
      if (!db && e.key && e.key.startsWith('orchestrai_db_')) {
        loadDatabase();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Sync session updates to active user state
    const handleSessionUserSync = () => {
      const sessionUser = sessionStorage.getItem('orchestrai_session_user');
      if (sessionUser) {
        const parsed = JSON.parse(sessionUser);
        setCurrentUser(parsed);
        // Also verify the user state matches database state
        const dbUsersStr = localStorage.getItem('orchestrai_db_users');
        if (dbUsersStr) {
          const dbUsers: UserProfile[] = JSON.parse(dbUsersStr);
          const matched = dbUsers.find(u => u.uid === parsed.uid);
          if (matched && JSON.stringify(matched) !== JSON.stringify(parsed)) {
            setCurrentUser(matched);
            sessionStorage.setItem('orchestrai_session_user', JSON.stringify(matched));
          }
        }
      } else {
        setCurrentUser(null);
      }
    };

    // Poll session storage occasionally to capture active login state changes
    const interval = setInterval(handleSessionUserSync, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeSubmissions) unsubscribeSubmissions();
      if (unsubscribeLogs) unsubscribeLogs();
      if (unsubscribeAuditLogs) unsubscribeAuditLogs();
      if (unsubscribeVisitors) unsubscribeVisitors();
      if (unsubscribeConfig) unsubscribeConfig();
      if (unsubscribeConnected) unsubscribeConnected();
    };
  }, [systemConfig.firebaseDatabaseUrl]);

  // Update DB list utility
  const saveUsersList = (newUsers: UserProfile[]) => {
    setUsersList(newUsers);
    localStorage.setItem('orchestrai_db_users', JSON.stringify(newUsers));
  };

  // 3. User Login/Logout mockup
  const login = (
    email: string,
    name: string,
    mobile?: string,
    emailVerified?: boolean,
    mobileVerified?: boolean
  ) => {
    const formattedEmail = email.trim().toLowerCase();
    const db = getFirebaseDb();
    
    // Find profile in current states (synced with Firestore/LocalStorage)
    let profile = usersList.find(u => u.email === formattedEmail);

    const isAdmin = formattedEmail === 'vthinkorchestrai@gmail.com';

    const isNewUserRegistration = !profile;

    if (!profile) {
      // Create user record
      profile = {
        uid: Math.random().toString(36).substring(2, 11),
        email: formattedEmail,
        name: name || formattedEmail.split('@')[0],
        role: isAdmin ? 'ADMIN' : 'USER',
        accountStatus: isAdmin ? 'APPROVED' : 'FREE_TIER',
        quizPassed: isAdmin,
        progress: ensureProgress(),
        mobile: mobile || '',
        emailVerified: isAdmin ? true : (emailVerified || false),
        mobileVerified: isAdmin ? true : (mobileVerified || false)
      };
      
      if (db) {
        set(ref(db, `users/${profile.uid}`), profile);
      } else {
        const updatedList = [...usersList, profile];
        saveUsersList(updatedList);
      }
      logAuditEvent('USER_REGISTER', `New user registered: ${profile.name} (${formattedEmail})`, formattedEmail);
    } else {
      // Update existing profile's fields if provided
      let updated = false;

      // Enforce correct role mapping based on email
      const targetRole = isAdmin ? 'ADMIN' : 'USER';
      if (profile.role !== targetRole) {
        profile.role = targetRole;
        updated = true;
      }

      if (mobile && profile.mobile !== mobile) {
        profile.mobile = mobile;
        updated = true;
      }
      if (emailVerified !== undefined && profile.emailVerified !== emailVerified) {
        profile.emailVerified = emailVerified;
        updated = true;
      }
      if (mobileVerified !== undefined && profile.mobileVerified !== mobileVerified) {
        profile.mobileVerified = mobileVerified;
        updated = true;
      }
      
      if (db) {
        set(ref(db, `users/${profile.uid}`), profile);
      } else if (updated) {
        const updatedList = usersList.map(u => u.uid === profile!.uid ? profile! : u);
        saveUsersList(updatedList);
      }
    }

    if (!isNewUserRegistration) {
      logAuditEvent(isAdmin ? 'ADMIN_LOGIN' : 'USER_LOGIN', `${profile.name} logged in successfully`, formattedEmail);
    }

    // Link visitor record to registered user
    const visitorId = localStorage.getItem('orchestrai_visitor_id');
    if (visitorId) {
      const timestamp = new Date().toISOString();
      if (db) {
        get(ref(db, `visitors/${visitorId}`)).then((snap) => {
          let firstSeen = timestamp;
          let viewedModule1 = false;
          let viewedModule2 = false;
          if (snap.exists()) {
            const data = snap.val() as VisitorRecord;
            firstSeen = data.firstSeen;
            viewedModule1 = data.viewedModule1;
            viewedModule2 = data.viewedModule2;
          }
          set(ref(db, `visitors/${visitorId}`), {
            id: visitorId,
            firstSeen,
            lastActive: timestamp,
            viewedModule1,
            viewedModule2,
            registered: true,
            registeredEmail: formattedEmail
          });
        }).catch(e => console.error("Error updating visitor record on login:", e));
      } else {
        setVisitorsList(prev => {
          const updated = prev.map(v => {
            if (v.id === visitorId) {
              return {
                ...v,
                registered: true,
                registeredEmail: formattedEmail,
                lastActive: timestamp
              };
            }
            return v;
          });
          localStorage.setItem('orchestrai_db_visitors', JSON.stringify(updated));
          return updated;
        });
      }
    }

    setCurrentUser(profile);
    sessionStorage.setItem('orchestrai_session_user', JSON.stringify(profile));
  };

  const logout = () => {
    if (currentUser) {
      logAuditEvent(currentUser.role === 'ADMIN' ? 'ADMIN_LOGOUT' : 'USER_LOGOUT', `${currentUser.name} logged out`);
    }
    setCurrentUser(null);
    sessionStorage.removeItem('orchestrai_session_user');
  };

  // Explicitly seed the admin profile for direct testing convenience
  const seedAdminAccount = () => {
    const hasAdminNew = usersList.some(u => u.email === 'vthinkorchestrai@gmail.com');
    const db = getFirebaseDb();

    if (!hasAdminNew) {
      const adminProfile: UserProfile = {
        uid: 'admin-new-uid',
        email: 'vthinkorchestrai@gmail.com',
        name: 'vThink OrchestrAI Admin',
        role: 'ADMIN',
        accountStatus: 'APPROVED',
        quizPassed: true,
        progress: ensureProgress(),
        mobile: '+919876543210',
        emailVerified: true,
        mobileVerified: true
      };

      if (db) {
        set(ref(db, `users/${adminProfile.uid}`), adminProfile);
      } else {
        const updatedList = [...usersList, adminProfile];
        saveUsersList(updatedList);
      }
    }
  };

  // 4. Update Profile
  const updateUserProfile = (uid: string, updates: Partial<UserProfile>) => {
    const db = getFirebaseDb();
    const userToUpdate = usersList.find(u => u.uid === uid);
    if (!userToUpdate) return;

    const result = { ...userToUpdate, ...updates };

    // Guard role promotion to prevent any non-admin email from becoming ADMIN
    if (result.role === 'ADMIN' && result.email !== 'vthinkorchestrai@gmail.com') {
      result.role = 'USER';
    }

    if (updates.accountStatus === 'APPROVED' && userToUpdate.accountStatus !== 'APPROVED') {
      logAuditEvent('APPROVE_STUDENT', `Approved student account access: ${userToUpdate.name} (${userToUpdate.email})`);
    }

    // If updating the active user session
    if (currentUser && currentUser.uid === uid) {
      setCurrentUser(result);
      sessionStorage.setItem('orchestrai_session_user', JSON.stringify(result));
    }

    if (db) {
      set(ref(db, `users/${uid}`), result);
    } else {
      const updated = usersList.map(u => u.uid === uid ? result : u);
      saveUsersList(updated);
    }
  };

  // ── XP / PROGRESSION ENGINE ──
  // Single atomic core: reads the freshest progress, applies a mutation, recomputes
  // level + badges centrally, persists once, and fires the right notifications.
  const applyProgressUpdate = (
    mutate: (p: LearnerProgress) => { progress: LearnerProgress; xpGained?: number; reason?: string; silent?: boolean }
  ) => {
    if (!currentUser) return;

    // Read freshest record from the synced states to avoid stale data
    const dbUser = usersList.find((u) => u.uid === currentUser.uid) || currentUser;
    const prev = ensureProgress(dbUser.progress);

    const { progress: mutated, xpGained, reason, silent } = mutate(prev);

    // Recompute level + badges from the mutated state (idempotent).
    const level = getLevelInfo(mutated.xp).level;
    const leveledUp = level > prev.level;
    const next: LearnerProgress = { ...mutated, level };

    const earned = deriveBadges(next);
    const newBadges = earned.filter((b) => !prev.badges.includes(b));
    next.badges = Array.from(new Set([...prev.badges, ...earned]));

    updateUserProfile(currentUser.uid, { progress: next });

    // Notifications
    if (!silent && xpGained && xpGained > 0) addToast(`+${xpGained} XP · ${reason || 'Progress'}`, 'success');
    if (leveledUp) pushCelebration({ kind: 'level', level });
    newBadges.forEach((bid) => pushCelebration({ kind: 'badge', badgeId: bid }));
  };

  const awardXP = (amount: number, reason: string) => {
    applyProgressUpdate((p) => ({ progress: { ...p, xp: p.xp + amount }, xpGained: amount, reason }));
  };

  const recordSlideView = (moduleId: number, slideIdx: number) => {
    applyProgressUpdate((p) => {
      const seen = p.slidesViewed[moduleId] || [];
      if (seen.includes(slideIdx)) return { progress: p }; // already counted — no double XP
      return {
        progress: {
          ...p,
          slidesViewed: { ...p.slidesViewed, [moduleId]: [...seen, slideIdx] },
          xp: p.xp + XP_VALUES.slideView,
        },
        xpGained: XP_VALUES.slideView,
        reason: 'Slide explored',
        silent: true,
      };
    });
  };

  const recordModuleComplete = (moduleId: number) => {
    applyProgressUpdate((p) => {
      if (p.modulesCompleted.includes(moduleId)) return { progress: p };
      logAuditEvent('MODULE_COMPLETE', `Completed Module ${moduleId}`);
      return {
        progress: {
          ...p,
          modulesCompleted: [...p.modulesCompleted, moduleId],
          xp: p.xp + XP_VALUES.moduleComplete,
        },
        xpGained: XP_VALUES.moduleComplete,
        reason: `Module ${moduleId} complete`,
      };
    });
  };

  const recordQuizScore = (moduleId: number, score: number) => {
    applyProgressUpdate((p) => {
      const prevScore = p.quizScores[moduleId] ?? -1;
      const firstPass = score >= 80 && prevScore < 80; // award the pass bonus only once
      logAuditEvent('QUIZ_SUBMIT', `Submitted quiz for Module ${moduleId} with score ${score}% (${score >= 80 ? 'PASSED' : 'FAILED'})`);
      return {
        progress: {
          ...p,
          quizScores: { ...p.quizScores, [moduleId]: Math.max(prevScore, score) },
          xp: p.xp + (firstPass ? XP_VALUES.quizPass : 0),
        },
        xpGained: firstPass ? XP_VALUES.quizPass : undefined,
        reason: 'Knowledge gate passed',
      };
    });
  };

  const recordLabComplete = (moduleId: number) => {
    applyProgressUpdate((p) => {
      if (p.labsPassed.includes(moduleId)) return { progress: p };
      logAuditEvent('LAB_COMPLETE', `Cleared Prompt Simulator Lab for Module ${moduleId}`);
      return {
        progress: {
          ...p,
          labsPassed: [...p.labsPassed, moduleId],
          xp: p.xp + XP_VALUES.labPass,
        },
        xpGained: XP_VALUES.labPass,
        reason: 'Lab cleared',
      };
    });
  };

  // Called on app open / login. Increments streak once per calendar day; resets if a day is missed.
  const touchStreak = () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    applyProgressUpdate((p) => {
      if (p.lastActiveDate === today) return { progress: p }; // already checked in today
      const streakDays = p.lastActiveDate === yesterday ? p.streakDays + 1 : 1;
      return {
        progress: { ...p, streakDays, lastActiveDate: today, xp: p.xp + XP_VALUES.dailyStreak },
        xpGained: XP_VALUES.dailyStreak,
        reason: `Day ${streakDays} streak`,
      };
    });
  };

  // Run the daily streak check once whenever a user becomes active (login or session restore).
  useEffect(() => {
    if (currentUser?.uid) touchStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  // Initialize or restore visitor ID and register session activity
  useEffect(() => {
    let visitorId = localStorage.getItem('orchestrai_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('orchestrai_visitor_id', visitorId);
    }

    const db = getFirebaseDb();
    const timestamp = new Date().toISOString();

    const runVisitorInit = async () => {
      let firstSeen = timestamp;
      let viewedModule1 = false;
      let viewedModule2 = false;
      let registered = currentUser ? true : false;
      let registeredEmail = currentUser?.email || undefined;

      if (db) {
        try {
          const snap = await get(ref(db, `visitors/${visitorId}`));
          if (snap.exists()) {
            const data = snap.val() as VisitorRecord;
            firstSeen = data.firstSeen;
            viewedModule1 = data.viewedModule1;
            viewedModule2 = data.viewedModule2;
            registered = currentUser ? true : data.registered;
            registeredEmail = currentUser?.email || data.registeredEmail;
          }
        } catch (e) {
          console.error("Error reading visitor record on init:", e);
        }
      } else {
        const localVisitors = localStorage.getItem('orchestrai_db_visitors');
        if (localVisitors) {
          const list: VisitorRecord[] = JSON.parse(localVisitors);
          const found = list.find(v => v.id === visitorId);
          if (found) {
            firstSeen = found.firstSeen;
            viewedModule1 = found.viewedModule1;
            viewedModule2 = found.viewedModule2;
            registered = currentUser ? true : found.registered;
            registeredEmail = currentUser?.email || found.registeredEmail;
          }
        }
      }

      const record: VisitorRecord = {
        id: visitorId,
        firstSeen,
        lastActive: timestamp,
        viewedModule1,
        viewedModule2,
        registered
      };
      if (registeredEmail) {
        record.registeredEmail = registeredEmail;
      }

      if (db) {
        set(ref(db, `visitors/${visitorId}`), record);
      } else {
        setVisitorsList(prev => {
          const updated = prev.filter(v => v.id !== visitorId);
          updated.push(record);
          localStorage.setItem('orchestrai_db_visitors', JSON.stringify(updated));
          return updated;
        });
      }
    };

    runVisitorInit();
  }, [currentUser?.email]);

  // 5. Update System Settings
  const updateSystemConfig = (updates: Partial<SystemConfig>) => {
    const updated = { ...systemConfig, ...updates };
    const db = getFirebaseDb();

    // Log the configuration changes
    let changes: string[] = [];
    if (updates.approvalMode !== undefined && updates.approvalMode !== systemConfig.approvalMode) {
      changes.push(`Approval mode set to ${updates.approvalMode}`);
    }
    if (updates.freeModulesLimit !== undefined && updates.freeModulesLimit !== systemConfig.freeModulesLimit) {
      changes.push(`Free modules limit set to ${updates.freeModulesLimit}`);
    }
    if (updates.adminPassword !== undefined && updates.adminPassword !== systemConfig.adminPassword) {
      changes.push(`Admin password updated`);
    }
    if (updates.emailjsServiceId !== undefined || updates.emailjsTemplateId !== undefined || updates.emailjsPublicKey !== undefined) {
      changes.push(`EmailJS integration settings updated`);
    }
    if (updates.templates !== undefined) {
      changes.push(`Email templates updated`);
    }
    if (updates.firebaseDatabaseUrl !== undefined && updates.firebaseDatabaseUrl !== systemConfig.firebaseDatabaseUrl) {
      changes.push(updates.firebaseDatabaseUrl ? `Connected to Firebase database: ${updates.firebaseDatabaseUrl}` : `Disconnected from Firebase database`);
    }
    
    if (changes.length > 0) {
      logAuditEvent('CONFIG_UPDATE', changes.join(', '));
    }

    // Always update local React state and localStorage immediately so the UI is highly responsive
    // and doesn't temporarily show a state and then revert it if the database write is slow/fails.
    setSystemConfig(updated);
    localStorage.setItem('orchestrai_db_config', JSON.stringify(updated));

    if (db) {
      // Exclude connection strings, local credentials, and sensitive tokens from being written to the database node.
      // This is a major security benefit and ensures client connection configurations do not get overwritten
      // by the server or trigger circular sync/listener loops.
      const {
        firebaseDatabaseUrl,
        adminPassword,
        firebaseApiKey,
        firebaseAuthDomain,
        firebaseProjectId,
        firebaseStorageBucket,
        firebaseMessagingSenderId,
        firebaseAppId,
        ...dbConfig
      } = updated;

      set(ref(db, 'config'), dbConfig).catch((err) => {
        console.error("[AppContext] Failed to sync config updates to Realtime Database:", err);
      });
    }
  };

  // 6. Notification logs logging
  const addNotificationLog = (log: Omit<NotificationLog, 'id' | 'timestamp'>) => {
    const db = getFirebaseDb();
    const id = Math.random().toString(36).substring(2, 11);
    
    const newLog: NotificationLog = {
      ...log,
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { day: '2-digit', month: 'short' })
    };

    if (db) {
      set(ref(db, `logs/${id}`), newLog);
    } else {
      const updatedList = [newLog, ...notificationLogs];
      setNotificationLogs(updatedList);
      localStorage.setItem('orchestrai_db_logs', JSON.stringify(updatedList));
    }
  };

  const clearNotificationLogs = () => {
    const db = getFirebaseDb();
    if (db) {
      remove(ref(db, 'logs'));
    } else {
      setNotificationLogs([]);
      localStorage.setItem('orchestrai_db_logs', JSON.stringify([]));
    }
  };

  const logAuditEvent = (type: string, description: string, userEmail?: string) => {
    const db = getFirebaseDb();
    const id = Math.random().toString(36).substring(2, 11);
    const email = userEmail || currentUser?.email || 'anonymous';
    const newLog: AuditLog = {
      id,
      timestamp: new Date().toISOString(),
      type,
      userEmail: email,
      description
    };

    if (db) {
      set(ref(db, `audit_logs/${id}`), newLog);
    } else {
      setAuditLogs(prev => {
        const updated = [newLog, ...prev];
        localStorage.setItem('orchestrai_db_audit_logs', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const trackVisitorActivity = (moduleId: number) => {
    const db = getFirebaseDb();
    let visitorId = localStorage.getItem('orchestrai_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('orchestrai_visitor_id', visitorId);
    }

    const timestamp = new Date().toISOString();
    const existing = visitorsList.find(v => v.id === visitorId);
    const viewedModule1 = moduleId === 1 || (existing ? existing.viewedModule1 : false);
    const viewedModule2 = moduleId === 2 || (existing ? existing.viewedModule2 : false);
    const registered = currentUser ? true : (existing ? existing.registered : false);
    const registeredEmail = currentUser?.email || existing?.registeredEmail;

    const newRecord: VisitorRecord = {
      id: visitorId,
      firstSeen: existing ? existing.firstSeen : timestamp,
      lastActive: timestamp,
      viewedModule1,
      viewedModule2,
      registered
    };
    if (registeredEmail) {
      newRecord.registeredEmail = registeredEmail;
    }

    if (db) {
      set(ref(db, `visitors/${visitorId}`), newRecord);
    } else {
      setVisitorsList(prev => {
        const updated = prev.filter(v => v.id !== visitorId);
        updated.push(newRecord);
        localStorage.setItem('orchestrai_db_visitors', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const clearAuditLogs = () => {
    const db = getFirebaseDb();
    if (db) {
      remove(ref(db, 'audit_logs'));
    } else {
      setAuditLogs([]);
      localStorage.setItem('orchestrai_db_audit_logs', JSON.stringify([]));
    }
    logAuditEvent('CLEAR_AUDIT_LOGS', 'System audit logs cleared');
  };

  // 7. Portfolio Submissions
  const addSubmission = (githubRepoUrl: string, promptLogUrl: string) => {
    if (!currentUser) return;
    const db = getFirebaseDb();
    const id = Math.random().toString(36).substring(2, 11);

    const newSub: Submission = {
      id,
      userId: currentUser.uid,
      userName: currentUser.name,
      userEmail: currentUser.email,
      githubRepoUrl,
      promptLogUrl,
      status: 'SUBMITTED',
      automatedTotal: 0
    };

    logAuditEvent('PROJECT_SUBMIT', `Submitted project for review: ${githubRepoUrl}`);

    if (db) {
      set(ref(db, `submissions/${id}`), newSub);
    } else {
      const updatedList = [newSub, ...submissions];
      setSubmissions(updatedList);
      localStorage.setItem('orchestrai_db_submissions', JSON.stringify(updatedList));
    }
  };

  const updateSubmissionStatus = (id: string, status: Submission['status'], score: number) => {
    const db = getFirebaseDb();
    const subToUpdate = submissions.find(s => s.id === id);
    if (!subToUpdate) return;

    const updatedSub = { ...subToUpdate, status, automatedTotal: score };

    logAuditEvent('CERTIFY_STUDENT', `Evaluated submission for ${subToUpdate.userName} (${subToUpdate.userEmail}) as ${status} with score ${score}%`);

    if (db) {
      set(ref(db, `submissions/${id}`), updatedSub);
    } else {
      const updated = submissions.map(s => s.id === id ? updatedSub : s);
      setSubmissions(updated);
      localStorage.setItem('orchestrai_db_submissions', JSON.stringify(updated));
    }
  };

  const testDbConnection = async (url: string): Promise<boolean> => {
    if (!url) return false;
    try {
      const tempAppName = 'temp-test-connection-' + Date.now();
      const tempApp = initializeApp({
        projectId: systemConfig.firebaseProjectId || 'orchestrai-mock',
        databaseURL: url,
        apiKey: systemConfig.firebaseApiKey || undefined
      }, tempAppName);
      
      const tempDb = getDatabase(tempApp);
      const testRef = ref(tempDb, '.info/connected');
      
      return new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          unsubscribe();
          deleteApp(tempApp).catch(() => {});
          resolve(false);
        }, 3000);
        
        const unsubscribe = onValue(testRef, (snap) => {
          if (snap.val() === true) {
            clearTimeout(timeout);
            unsubscribe();
            deleteApp(tempApp).catch(() => {});
            resolve(true);
          }
        }, () => {
          clearTimeout(timeout);
          unsubscribe();
          deleteApp(tempApp).catch(() => {});
          resolve(false);
        });
      });
    } catch (e) {
      console.error("Test connection failed:", e);
      return false;
    }
  };

  const disconnectDb = () => {
    updateSystemConfig({
      firebaseDatabaseUrl: ''
    });
    setDbStatus('disconnected');
    addToast("Disconnected from Firebase Realtime Database.", "info");
  };

  const wipeAndResetDatabase = async () => {
    const db = getFirebaseDb();
    const adminEmail = 'vthinkorchestrai@gmail.com';
    const adminUser = usersList.find(u => u.email === adminEmail) || (currentUser?.email === adminEmail ? currentUser : null);
    
    let adminProfile = adminUser;
    if (!adminProfile) {
      adminProfile = {
        uid: 'admin-new-uid',
        email: adminEmail,
        name: 'vThink OrchestrAI Admin',
        role: 'ADMIN',
        accountStatus: 'APPROVED',
        quizPassed: true,
        progress: ensureProgress(),
        mobile: '+919876543210',
        emailVerified: true,
        mobileVerified: true
      };
    } else {
      adminProfile = {
        ...adminProfile,
        role: 'ADMIN',
        accountStatus: 'APPROVED',
        emailVerified: true,
        mobileVerified: true
      };
    }

    if (db) {
      console.log("[AppContext] Wiping cloud Realtime Database nodes...");
      try {
        await remove(ref(db, 'submissions'));
        await remove(ref(db, 'logs'));
        await remove(ref(db, 'audit_logs'));
        await remove(ref(db, 'visitors'));
        await set(ref(db, 'users'), {
          [adminProfile.uid]: adminProfile
        });
        console.log("[AppContext] Cloud database wiped successfully.");
      } catch (err) {
        console.error("Error wiping cloud database:", err);
        addToast("Error wiping cloud database. Check rules or connection.", "error");
        return;
      }
    }

    saveUsersList([adminProfile]);
    setSubmissions([]);
    localStorage.setItem('orchestrai_db_submissions', JSON.stringify([]));
    setNotificationLogs([]);
    localStorage.setItem('orchestrai_db_logs', JSON.stringify([]));
    setAuditLogs([]);
    localStorage.setItem('orchestrai_db_audit_logs', JSON.stringify([]));
    setVisitorsList([]);
    localStorage.setItem('orchestrai_db_visitors', JSON.stringify([]));

    logAuditEvent('WIPE_DATABASE', 'Wiped and reset all databases. Admin account preserved.');
    addToast("Database wiped and reset successfully. Admin account preserved.", "success");
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        currentUser,
        setCurrentUser,
        usersList,
        updateUserProfile,
        systemConfig,
        updateSystemConfig,
        notificationLogs,
        addNotificationLog,
        clearNotificationLogs,
        auditLogs,
        visitorsList,
        logAuditEvent,
        trackVisitorActivity,
        clearAuditLogs,
        submissions,
        addSubmission,
        updateSubmissionStatus,
        login,
        logout,
        seedAdminAccount,
        awardXP,
        recordSlideView,
        recordModuleComplete,
        recordQuizScore,
        recordLabComplete,
        touchStreak,
        celebrations,
        dismissCelebration,
        toasts,
        addToast,
        removeToast,
        activeDialog,
        showDialog,
        closeDialog,
        alertUser,
        confirmAction,
        dbStatus,
        testDbConnection,
        disconnectDb,
        wipeAndResetDatabase,
        refreshDatabaseData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
