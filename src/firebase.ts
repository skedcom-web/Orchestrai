import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const CURRENT_APP_VERSION = '1.2.6'; // Incremented to clear any old client-side local storage configs

// Self-executing cache-buster check on startup
(function checkLocalStorageVersion() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const localVersion = window.localStorage.getItem('orchestrai_app_version');
    if (localVersion !== CURRENT_APP_VERSION) {
      console.log(`[Version Control] App version mismatch. Local: ${localVersion}, Current: ${CURRENT_APP_VERSION}. Clearing outdated local storage configs...`);
      
      const keysToClear = [
        'orchestrai_db_config',
        'orchestrai_db_users',
        'orchestrai_db_submissions',
        'orchestrai_db_logs',
        'orchestrai_db_audit_logs',
        'orchestrai_db_visitors'
      ];
      
      keysToClear.forEach(key => window.localStorage.removeItem(key));
      window.localStorage.setItem('orchestrai_app_version', CURRENT_APP_VERSION);
    }
  }
})();

let currentConfigString = '';

/**
 * Dynamically initializes and retrieves the Firebase App instance.
 * Reads the settings from localStorage (orchestrai_db_config).
 * Returns `null` if firebase settings are incomplete, which flags the app
 * to fall back to Simulation Mode.
 */
export const getFirebaseApp = (forceReinit = false) => {
  try {
    const configStr = localStorage.getItem('orchestrai_db_config');
    const config = configStr ? JSON.parse(configStr) : {};
    
    // Default to production Firebase Realtime Database
    const dbUrl = config.firebaseDatabaseUrl !== undefined
      ? config.firebaseDatabaseUrl
      : (config.databaseURL || 'https://vthinkorchestrai-auth-default-rtdb.asia-southeast1.firebasedatabase.app');

    // We need at least the Database URL to initialize the Realtime Database
    if (!dbUrl) {
      return null;
    }

    const firebaseConfig: any = {
      projectId: config.firebaseProjectId || 'vthinkorchestrai-auth',
      databaseURL: dbUrl,
    };

    const defaultApiKey = 'AIzaSyDb2WxO-sGsKEHWGYwBaSSCI058F8gcwB0';
    const defaultAuthDomain = 'vthinkorchestrai-auth.firebaseapp.com';
    const defaultStorageBucket = 'vthinkorchestrai-auth.firebasestorage.app';
    const defaultMessagingSenderId = '180718842396';
    const defaultAppId = '1:180718842396:web:55fc55d5e2668389d065d9';

    firebaseConfig.apiKey = config.firebaseApiKey !== undefined ? config.firebaseApiKey : defaultApiKey;
    firebaseConfig.authDomain = config.firebaseAuthDomain !== undefined ? config.firebaseAuthDomain : defaultAuthDomain;
    firebaseConfig.storageBucket = config.firebaseStorageBucket !== undefined ? config.firebaseStorageBucket : defaultStorageBucket;
    firebaseConfig.messagingSenderId = config.firebaseMessagingSenderId !== undefined ? config.firebaseMessagingSenderId : defaultMessagingSenderId;
    firebaseConfig.appId = config.firebaseAppId !== undefined ? config.firebaseAppId : defaultAppId;

    const newConfigStr = JSON.stringify(firebaseConfig);
    const configChanged = newConfigStr !== currentConfigString;

    if (getApps().length > 0 && (forceReinit || configChanged)) {
      console.log("[Firebase] Configuration changed or re-initialization forced. Re-initializing app...");
      const app = getApp();
      deleteApp(app).catch(err => console.error("Error deleting firebase app:", err));
      currentConfigString = newConfigStr;
      return initializeApp(firebaseConfig);
    }

    if (getApps().length === 0) {
      currentConfigString = newConfigStr;
      return initializeApp(firebaseConfig);
    } else {
      return getApp();
    }
  } catch (error) {
    console.error('Firebase app initialization error:', error);
    return null;
  }
};

/**
 * Exposes the Firebase Auth instance.
 */
export const getFirebaseAuth = () => {
  const app = getFirebaseApp();
  if (!app || !app.options.apiKey) return null;
  return getAuth(app);
};

/**
 * Exposes the Firebase Realtime Database instance.
 */
export const getFirebaseDb = () => {
  const app = getFirebaseApp();
  return app ? getDatabase(app) : null;
};
