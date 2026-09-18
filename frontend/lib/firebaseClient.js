// Firebase client SDK — used ONLY for the "Continue with Google" popup on
// /login and /signup. It is not used for session management: once Firebase
// hands us back a signed ID token, we pass that to NextAuth's Credentials
// provider ("firebase") which verifies it server-side and issues our usual
// NextAuth JWT session. So Firebase's own auth state (onAuthStateChanged
// etc.) is intentionally never read anywhere else in the app.
//
// SETUP (one-time, ~5 minutes):
// 1. Go to https://console.firebase.google.com → Add project (or reuse one)
// 2. Project settings (gear icon) → General → "Your apps" → Add app → Web (</>)
//    Register the app, then copy the firebaseConfig values it shows you.
// 3. In the left sidebar: Build → Authentication → Get started
//    → Sign-in method tab → enable "Google" → set a support email → Save
// 4. Put the config values into frontend/.env.local as:
//      NEXT_PUBLIC_FIREBASE_API_KEY=...
//      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
//      NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
//      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
//      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
//      NEXT_PUBLIC_FIREBASE_APP_ID=...
// 5. Restart `npm run dev`.
//
// These NEXT_PUBLIC_* values are safe to expose in the browser — Firebase's
// web config is not a secret, it just tells the SDK which project to talk
// to. The actual trust boundary is the ID token verification that happens
// server-side in the backend (see backend/src/lib/firebaseAdmin.js).

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Avoid re-initializing on every hot reload / re-render in the browser.
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);

export const googleProvider = new GoogleAuthProvider();
// Forces the account chooser every time instead of silently reusing
// whichever Google account the browser last used on this device.
googleProvider.setCustomParameters({ prompt: "select_account" });
