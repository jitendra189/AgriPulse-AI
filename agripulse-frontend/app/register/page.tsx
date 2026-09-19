"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateForm = () => {
    if (!name.trim()) {
      return "Please enter your full name.";
    }

    if (name.trim().length < 2) {
      return "Name must contain at least 2 characters.";
    }

    if (!email.trim()) {
      return "Please enter your email address.";
    }

    if (!email.includes("@")) {
      return "Please enter a valid email address.";
    }

    if (!password) {
      return "Please create a password.";
    }

    if (password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (new TextEncoder().encode(password).length > 72) {
      return "Password is too long. Please use a password of 72 bytes or fewer.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let message = "Unable to create your account.";

        if (typeof data?.detail === "string") {
          message = data.detail;
        }

        setError(message);
        return;
      }

      setSuccess("Account created successfully. Redirecting to login...");

      // Never store the password.
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        "Unable to connect to the AgriPulse server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: Brand / Product Panel */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/5" />

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

          <div className="relative z-10 max-w-xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50 backdrop-blur">
              FARMER INTELLIGENCE PLATFORM
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Make more informed decisions with agricultural intelligence.
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-emerald-50/85">
              AgriPulse combines market signals, price forecasts, weather-risk
              context and scenario analysis to help farmers understand
              changing agricultural conditions.
            </p>

            <div className="mt-8 space-y-4">
              <Feature
                title="Market Intelligence"
                description="Understand historical and forecasted crop market conditions."
              />

              <Feature
                title="Weather Context"
                description="View weather-related risk alongside market information."
              />

              <Feature
                title="Decision Support"
                description="Explore scenarios instead of relying on a single prediction."
              />
            </div>
          </div>

          <div className="relative z-10 text-xs text-emerald-100/70">
            Forecasts are estimates and should not be interpreted as guaranteed
            agricultural outcomes.
          </div>
        </section>

        {/* Right: Registration Form */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile Brand */}
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
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
              <div className="mb-8">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Create Account
                </span>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  Join AgriPulse AI
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create your farmer profile to personalize agricultural
                  intelligence and decision-support tools.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                >
                  <div className="flex gap-3">
                    <span className="text-red-500">!</span>

                    <p className="text-sm leading-5 text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Success */}
              {success && (
                <div
                  role="status"
                  className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                >
                  <div className="flex gap-3">
                    <span className="text-emerald-600">✓</span>

                    <p className="text-sm leading-5 text-emerald-700">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a secure password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Minimum 8 characters.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword ? "text" : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-emerald-400"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">OR</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Sign in
                </Link>
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-center text-xs leading-5 text-slate-500">
                  By creating an account, you understand that AgriPulse
                  provides decision-support estimates rather than guaranteed
                  prices, yields, or profits.
                </p>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              AgriPulse AI • Development Environment
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
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs">
        ✓
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