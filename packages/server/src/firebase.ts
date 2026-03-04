import admin from 'firebase-admin';
import { config } from './config';

if (!admin.apps.length) {
  const {
    serviceAccountJson,
    projectId,
    clientEmail,
    privateKey,
  } = config.firebase;

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else if (projectId && clientEmail && privateKey) {
    // Fall back to individual env vars
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    throw new Error('Firebase credentials are not properly configured');
  }
}

export default admin;
