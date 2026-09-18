// Firebase Admin SDK — this is the actual trust boundary for Google sign-in.
// The frontend's ID token is just a claim; this is what proves it's real.
//
// NOTE: firebase-admin v13+ removed the old namespaced API from the
// top-level import (no more `admin.auth()`, `admin.credential.cert()`,
// `admin.apps`). Each service now has to be imported from its own modular
// subpath — "firebase-admin/app" and "firebase-admin/auth" below — which is
// what this file does. If you're following an older tutorial that does
// `const admin = require("firebase-admin")`, that pattern no longer works
// on the version installed here.
//
// SETUP (one-time, ~2 minutes, after you've created the Firebase project
// per frontend/lib/firebaseClient.js):
// 1. Firebase console → Project settings (gear icon) → Service accounts
// 2. Click "Generate new private key" → confirm → a JSON file downloads
// 3. Open that JSON file and copy three fields into backend/.env:
//      FIREBASE_PROJECT_ID=<the "project_id" field>
//      FIREBASE_CLIENT_EMAIL=<the "client_email" field>
//      FIREBASE_PRIVATE_KEY="<the "private_key" field, keep the \n's literal>"
//    Keep the quotes around FIREBASE_PRIVATE_KEY — it contains literal
//    "\n" sequences that need to survive as-is in the .env file; the code
//    below converts them back into real newlines.
// 4. NEVER commit that downloaded JSON file or these values — this key can
//    impersonate any user of your Firebase project. Restart `npm run dev`
//    (or your process manager) after adding them.

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (getApps().length === 0 && projectId && clientEmail && privateKey) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}
// If the env vars aren't set yet, we deliberately don't throw here — the
// rest of the app (email/password login, products, orders, etc.) should
// keep working. The /firebase-login route checks `.apps.length` itself
// and returns a clear error instead.

// Exposes the same shape the rest of the code expects
// (firebaseAdmin.apps.length, firebaseAdmin.auth().verifyIdToken(...)),
// just backed by the modular API under the hood.
module.exports = {
  get apps() {
    return getApps();
  },
  auth() {
    return getAuth();
  },
};
