"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { firebaseAuth, googleProvider } from "../lib/firebaseClient";

// Drop this on /login or /signup. Clicking it:
// 1. Opens Firebase's Google account picker (a popup)
// 2. Firebase signs the user in with Google and hands back a signed ID token
// 3. That token is passed to NextAuth's "firebase" Credentials provider,
//    which verifies it server-side and upserts a User row — existing users
//    are logged in, brand-new users are created automatically (no separate
//    registration form), same as "Continue with Google" on most commercial
//    sites
// 4. NextAuth issues its normal JWT session, and the app carries on exactly
//    as it does after an email/password login
export default function GoogleSignInButton({ onError }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    onError?.("");

    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await signIn("firebase", { idToken, redirect: false });

      if (res?.error) {
        onError?.("Couldn't sign you in with Google. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      // Most common case: user closed the Google popup themselves —
      // not a real error, just don't leave them stuck on "Signing in...".
      if (err?.code !== "auth/popup-closed-by-user") {
        console.error(err);
        onError?.("Couldn't sign you in with Google. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full inline-flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 disabled:opacity-60 transition-colors text-gray-700 text-sm font-semibold px-7 py-3"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
        />
      </svg>
      {loading ? "Signing in..." : "Continue with Google"}
    </button>
  );
}
