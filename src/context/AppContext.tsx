import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme Type
export type ThemeMode = 'light' | 'dark' | 'glass';

// User Schema
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  accountStatus: 'FREE_TIER' | 'PENDING_APPROVAL' | 'APPROVED';
  quizPassed: boolean;
  paymentId?: string;
}

// System Config Schema
export interface SystemConfig {
  freeModulesLimit: number;
  approvalMode: 'MANUAL' | 'AUTOMATED';
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
  adminEmail: string;
  templates: {
    [key: string]: { subject: string; body: string };
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
  submissions: Submission[];
  addSubmission: (githubRepoUrl: string, promptLogUrl: string) => void;
  updateSubmissionStatus: (id: string, status: Submission['status'], score: number) => void;
  login: (email: string, name: string) => void;
  logout: () => void;
  seedAdminAccount: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial default config values
const DEFAULT_CONFIG: SystemConfig = {
  freeModulesLimit: 2,
  approvalMode: 'MANUAL',
  emailjsServiceId: '',
  emailjsTemplateId: '',
  emailjsPublicKey: '',
  adminEmail: 'skedcom@gmail.com',
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
      body: "Hi {{name}},\n\nYour portfolio review is complete. You scored {{score}}% and have been certified as an OrchestrAI Lead!\n\nStatus: {{status}}\n\nKeep up the great work!\nFounder, Sithanandham R."
    }
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state persisted in localStorage
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('orchestrai_theme') as ThemeMode) || 'glass';
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

  // 2. Load DB values from localStorage and hook up multi-tab listener for real-time synchronization
  const loadDatabase = () => {
    const localUsers = localStorage.getItem('orchestrai_db_users');
    const localConfig = localStorage.getItem('orchestrai_db_config');
    const localLogs = localStorage.getItem('orchestrai_db_logs');
    const localSubmissions = localStorage.getItem('orchestrai_db_submissions');

    if (localUsers) setUsersList(JSON.parse(localUsers));
    if (localConfig) setSystemConfig(JSON.parse(localConfig));
    if (localLogs) setNotificationLogs(JSON.parse(localLogs));
    if (localSubmissions) setSubmissions(JSON.parse(localSubmissions));
  };

  useEffect(() => {
    // Initial load
    loadDatabase();

    // Trigger seed configuration if missing
    if (!localStorage.getItem('orchestrai_db_config')) {
      localStorage.setItem('orchestrai_db_config', JSON.stringify(DEFAULT_CONFIG));
      setSystemConfig(DEFAULT_CONFIG);
    }

    // Real-time synchronization callback for multi-tab testing
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('orchestrai_db_')) {
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
    };
  }, []);

  // Update DB list utility
  const saveUsersList = (newUsers: UserProfile[]) => {
    setUsersList(newUsers);
    localStorage.setItem('orchestrai_db_users', JSON.stringify(newUsers));
  };

  // 3. User Login/Logout mockup
  const login = (email: string, name: string) => {
    const formattedEmail = email.trim().toLowerCase();
    const dbUsersStr = localStorage.getItem('orchestrai_db_users') || '[]';
    const dbUsers: UserProfile[] = JSON.parse(dbUsersStr);

    let profile = dbUsers.find(u => u.email === formattedEmail);

    if (!profile) {
      // Create user record
      profile = {
        uid: Math.random().toString(36).substring(2, 11),
        email: formattedEmail,
        name: name || formattedEmail.split('@')[0],
        role: formattedEmail === 'skedcom@gmail.com' ? 'ADMIN' : 'USER',
        accountStatus: 'FREE_TIER',
        quizPassed: false
      };
      const updatedList = [...dbUsers, profile];
      saveUsersList(updatedList);
    }

    setCurrentUser(profile);
    sessionStorage.setItem('orchestrai_session_user', JSON.stringify(profile));
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('orchestrai_session_user');
  };

  // Explicitly seed the admin profile for direct testing convenience
  const seedAdminAccount = () => {
    const dbUsersStr = localStorage.getItem('orchestrai_db_users') || '[]';
    const dbUsers: UserProfile[] = JSON.parse(dbUsersStr);
    const hasAdmin = dbUsers.some(u => u.email === 'skedcom@gmail.com');

    if (!hasAdmin) {
      const adminProfile: UserProfile = {
        uid: 'admin-master-uid',
        email: 'skedcom@gmail.com',
        name: 'Sithanandham Radhakrishnan',
        role: 'ADMIN',
        accountStatus: 'APPROVED',
        quizPassed: true
      };
      saveUsersList([...dbUsers, adminProfile]);
    }
  };

  // 4. Update Profile
  const updateUserProfile = (uid: string, updates: Partial<UserProfile>) => {
    const dbUsersStr = localStorage.getItem('orchestrai_db_users') || '[]';
    const dbUsers: UserProfile[] = JSON.parse(dbUsersStr);

    const updated = dbUsers.map(u => {
      if (u.uid === uid) {
        const result = { ...u, ...updates };
        // If updating the active user session
        if (currentUser && currentUser.uid === uid) {
          setCurrentUser(result);
          sessionStorage.setItem('orchestrai_session_user', JSON.stringify(result));
        }
        return result;
      }
      return u;
    });

    saveUsersList(updated);
  };

  // 5. Update System Settings
  const updateSystemConfig = (updates: Partial<SystemConfig>) => {
    const updated = { ...systemConfig, ...updates };
    setSystemConfig(updated);
    localStorage.setItem('orchestrai_db_config', JSON.stringify(updated));
  };

  // 6. Notification logs logging
  const addNotificationLog = (log: Omit<NotificationLog, 'id' | 'timestamp'>) => {
    const dbLogsStr = localStorage.getItem('orchestrai_db_logs') || '[]';
    const dbLogs: NotificationLog[] = JSON.parse(dbLogsStr);

    const newLog: NotificationLog = {
      ...log,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { day: '2-digit', month: 'short' })
    };

    const updatedList = [newLog, ...dbLogs];
    setNotificationLogs(updatedList);
    localStorage.setItem('orchestrai_db_logs', JSON.stringify(updatedList));
  };

  const clearNotificationLogs = () => {
    setNotificationLogs([]);
    localStorage.setItem('orchestrai_db_logs', JSON.stringify([]));
  };

  // 7. Portfolio Submissions
  const addSubmission = (githubRepoUrl: string, promptLogUrl: string) => {
    if (!currentUser) return;
    const dbSubmissionsStr = localStorage.getItem('orchestrai_db_submissions') || '[]';
    const dbSubmissions: Submission[] = JSON.parse(dbSubmissionsStr);

    const newSub: Submission = {
      id: Math.random().toString(36).substring(2, 11),
      userId: currentUser.uid,
      userName: currentUser.name,
      userEmail: currentUser.email,
      githubRepoUrl,
      promptLogUrl,
      status: 'SUBMITTED',
      automatedTotal: 0
    };

    const updatedList = [newSub, ...dbSubmissions];
    setSubmissions(updatedList);
    localStorage.setItem('orchestrai_db_submissions', JSON.stringify(updatedList));
  };

  const updateSubmissionStatus = (id: string, status: Submission['status'], score: number) => {
    const dbSubmissionsStr = localStorage.getItem('orchestrai_db_submissions') || '[]';
    const dbSubmissions: Submission[] = JSON.parse(dbSubmissionsStr);

    const updated = dbSubmissions.map(s => {
      if (s.id === id) {
        return { ...s, status, automatedTotal: score };
      }
      return s;
    });

    setSubmissions(updated);
    localStorage.setItem('orchestrai_db_submissions', JSON.stringify(updated));
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
        submissions,
        addSubmission,
        updateSubmissionStatus,
        login,
        logout,
        seedAdminAccount
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
