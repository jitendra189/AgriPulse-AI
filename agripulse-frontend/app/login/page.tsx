"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (typeof data?.detail === "string") {
          setError(data.detail);
        } else {
          setError("Unable to sign in. Please check your credentials.");
        }

        return;
      }

      /*
       * Store only the authentication information.
       *
       * We never store the user's password.
       */
      const authData = {
        accessToken: data.access_token,
        tokenType: data.token_type,
        userId: data.user_id,
        email: data.email,
        name: data.name,
      };

      /*
       * Remember Me:
       *
       * checked  -> localStorage
       * unchecked -> sessionStorage
       *
       * This is appropriate for our current development implementation.
       * Before production deployment, authentication storage should be
       * hardened further using secure HttpOnly cookies.
       */
      if (rememberMe) {
        localStorage.setItem(
          "agripulse_auth",
          JSON.stringify(authData)
        );

        sessionStorage.removeItem("agripulse_auth");
      } else {
        sessionStorage.setItem(
          "agripulse_auth",
          JSON.stringify(authData)
        );

        localStorage.removeItem("agripulse_auth");
      }

      /*
       * Redirect authenticated user to dashboard.
       */
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Unable to connect to the AgriPulse server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setError(
      "Password recovery is not available yet. This feature will be connected after the authentication flow is complete."
    );
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ========================================================= */}
        {/* LEFT PRODUCT PANEL                                        */}
        {/* ========================================================= */}

        <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" />

          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/5" />

          {/* Brand */}
          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl font-bold backdrop-blur">
                A
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight">
                  AgriPulse AI
                </p>

                <p className="text-xs text-emerald-100">
                  Agricultural Market Intelligence
                </p>
              </div>
            </Link>
          </div>

          {/* Product Message */}
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50 backdrop-blur">
              AGRICULTURAL INTELLIGENCE
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Welcome back to
              <span className="block text-emerald-300">
                AgriPulse AI.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-emerald-50/85">
              Continue exploring market forecasts, weather-risk context,
              crop intelligence and economic scenarios from one
              agricultural intelligence workspace.
            </p>

            <div className="mt-8 space-y-4">
              <Feature
                icon="📈"
                title="Multi-horizon market forecasts"
                description="Explore estimated crop market conditions across multiple forecast horizons."
              />

              <Feature
                icon="🌦️"
                title="Weather-risk context"
                description="Understand weather-related risk alongside agricultural market signals."
              />

              <Feature
                icon="🌱"
                title="Farmer decision support"
                description="Combine market, weather and scenario information in one workspace."
              />
            </div>
          </div>

          {/* Responsible AI */}
          <div className="relative z-10 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs leading-5 text-emerald-50/75">
              AgriPulse provides decision-support estimates. Forecasts,
              weather context and economic simulations should not be
              interpreted as guaranteed agricultural outcomes.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* RIGHT LOGIN PANEL                                         */}
        {/* ========================================================= */}

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile Brand */}
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-lg font-bold text-white">
                  A
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    AgriPulse AI
                  </p>

                  <p className="text-xs text-slate-500">
                    Agricultural Intelligence
                  </p>
                </div>
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              {/* Header */}
              <div className="mb-8">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Welcome Back
                </span>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  Sign in to your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Access your agricultural intelligence workspace.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                >
                  <div className="flex gap-3">
                    <span className="mt-0.5 font-bold text-red-500">
                      !
                    </span>

                    <p className="text-sm leading-5 text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-semibold text-emerald-600 transition hover:text-emerald-700"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                    disabled={loading}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />

                  <span className="text-sm text-slate-600">
                    Remember me
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-emerald-500"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              {/* Register */}
              <div className="mt-7 text-center">
                <p className="text-sm text-slate-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Create one
                  </Link>
                </p>
              </div>

              {/* Development Notice */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-center text-xs leading-5 text-slate-500">
                  Development environment. Authentication is currently
                  connected to the local AgriPulse API.
                </p>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              AgriPulse AI • Agricultural Market Intelligence Platform
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}


/* -------------------------------------------------------------------------- */
/* Feature Component                                                          */
/* -------------------------------------------------------------------------- */

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-emerald-50/70">
          {description}
        </p>
      </div>
    </div>
  );
}