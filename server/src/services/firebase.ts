/**
 * Firebase Admin SDK singleton — initialised from environment variables.
 *
 * Required env vars:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   (include literal \n in the string)
 *   FIREBASE_DATABASE_URL
 */

import * as admin from 'firebase-admin';

let initialised = false;

function ensureInitialised(): void {
  if (initialised) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (!projectId || !clientEmail || !privateKey || !databaseURL) {
    throw new Error(
      'Missing Firebase env vars. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, ' +
        'FIREBASE_PRIVATE_KEY, and FIREBASE_DATABASE_URL.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    databaseURL,
  });

  initialised = true;
}

/**
 * Returns the Firebase Realtime Database instance, initialising the Admin SDK
 * on the first call.
 */
export function getDb(): admin.database.Database {
  ensureInitialised();
  return admin.database();
}
