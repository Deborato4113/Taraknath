"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import Header from "../../components/Header";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Wherever the user was trying to go before we sent them here (e.g. a
  // product page they clicked "Add to Cart" on) — falls back to home if
  // they just landed on /login directly.
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-gray-900 text-white">
        <div className="max-w-md mx-auto px-5 py-4 flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 relative flex-shrink-0">
              <Image src="/logo.png" alt="Taraknath Engineering Works logo" fill sizes="32px" className="object-contain" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase heading-font">
              Taraknath Engineering Works
            </span>
          </Link>
        </div>
      </div>
      <div className="h-1 w-full bg-blue-800" />

      <div className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2 text-center">
            Account Access
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-8 text-center">
            Log In
          </h1>

          <GoogleSignInButton onError={setError} callbackUrl={callbackUrl} />

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-widest">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-blue-800"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-blue-800"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-7 py-4"
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="text-blue-800 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
