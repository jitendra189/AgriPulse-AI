"use client";

import Link from "next/link";

const features = [
  {
    icon: "📈",
    title: "Market Forecasts",
    description:
      "Explore 1, 2 and 3-month crop price forecasts with modeled ranges and market signals.",
  },
  {
    icon: "🌦️",
    title: "Weather Risk",
    description:
      "Understand weather-disruption context alongside agricultural market intelligence.",
  },
  {
    icon: "🌾",
    title: "Crop Comparison",
    description:
      "Compare crop trajectories across multiple forecast horizons without automatic crop ranking.",
  },
  {
    icon: "💰",
    title: "Profit Simulator",
    description:
      "Model revenue, costs, margins and break-even prices using farmer-specific assumptions.",
  },
  {
    icon: "💡",
    title: "Farmer Insights",
    description:
      "Turn forecast signals and uncertainty ranges into understandable decision-support information.",
  },
  {
    icon: "🔍",
    title: "Explainable Intelligence",
    description:
      "See the evidence, data status and assumptions behind each decision-support insight.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose your market",
    description:
      "Select a state, district, crop and forecast horizon.",
  },
  {
    number: "02",
    title: "Understand the signals",
    description:
      "Review market forecasts, uncertainty and weather-risk context.",
  },
  {
    number: "03",
    title: "Explore scenarios",
    description:
      "Use farmer-specific assumptions to explore economic outcomes.",
  },
  {
    number: "04",
    title: "Plan with context",
    description:
      "Use the information as decision support rather than a guaranteed outcome.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f3] text-slate-900">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-[#f5f7f3]/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123d2b] text-lg text-white shadow-sm">
              🌱
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-[#123d2b]">
                AgriPulse
              </p>

              <p className="-mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-600">
                AI
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">

            <a
              href="#features"
              className="text-xs font-semibold text-slate-500 transition hover:text-[#123d2b]"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-xs font-semibold text-slate-500 transition hover:text-[#123d2b]"
            >
              How it works
            </a>

            <a
              href="#responsible-ai"
              className="text-xs font-semibold text-slate-500 transition hover:text-[#123d2b]"
            >
              Responsible AI
            </a>

          </div>

          <div className="flex items-center gap-2 sm:gap-3">

            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-[#123d2b] sm:px-4"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-[#123d2b] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0d3022] sm:px-5"
            >
              Get started
            </Link>

          </div>

        </div>

      </nav>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">

        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="absolute -right-40 top-10 h-[500px] w-[500px] rounded-full bg-lime-200/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-28 lg:pt-24">

          {/* LEFT */}

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 shadow-sm">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                Agricultural Intelligence Platform
              </span>

            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-[#123d2b] sm:text-5xl lg:text-6xl">

              Make agricultural decisions with

              <span className="block text-emerald-600">
                better market intelligence.
              </span>

            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">

              AgriPulse AI brings market forecasts, weather-risk
              context, crop intelligence and economic scenarios
              together in one decision-support workspace.

            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-[#123d2b] px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:-translate-y-0.5 hover:bg-[#0d3022]"
              >
                Start exploring
                <span className="ml-2">
                  →
                </span>
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                Explore dashboard
              </Link>

            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-semibold text-slate-400">

              <span className="flex items-center gap-2">
                <span className="text-emerald-600">
                  ✓
                </span>
                Multi-horizon forecasts
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-600">
                  ✓
                </span>
                Explainable insights
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-600">
                  ✓
                </span>
                Scenario analysis
              </span>

            </div>

          </div>

          {/* RIGHT — PRODUCT PREVIEW */}

          <div className="relative">

            <div className="absolute -inset-5 rounded-[2rem] bg-emerald-100/40 blur-2xl" />

            <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

              {/* Preview header */}

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#123d2b] text-sm">
                    🌱
                  </div>

                  <div>

                    <p className="text-xs font-bold">
                      AgriPulse AI
                    </p>

                    <p className="text-[8px] text-slate-400">
                      Market intelligence
                    </p>

                  </div>

                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-bold text-emerald-700">
                  LIVE WORKSPACE
                </span>

              </div>

              {/* Preview filters */}

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4">

                <PreviewFilter
                  label="State"
                  value="Jharkhand"
                />

                <PreviewFilter
                  label="District"
                  value="Ranchi"
                />

                <PreviewFilter
                  label="Crop"
                  value="Onion"
                />

              </div>

              {/* Preview forecast */}

              <div className="grid gap-3 p-4 sm:grid-cols-2">

                <PreviewCard
                  label="Current price"
                  value="₹3,204"
                  subtitle="/ quintal"
                />

                <PreviewCard
                  label="1M forecast"
                  value="₹3,333"
                  subtitle="+4.0%"
                  positive
                />

              </div>

              {/* Preview chart */}

              <div className="px-4 pb-4">

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                        Forecast trajectory
                      </p>

                      <p className="mt-1 text-xs font-bold">
                        Rising market signal
                      </p>

                    </div>

                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[8px] font-bold text-emerald-700">
                      RISING
                    </span>

                  </div>

                  <div className="mt-5 flex h-24 items-end gap-2">

                    {[32, 43, 38, 57, 64, 72, 82].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-md bg-emerald-300"
                          style={{
                            height: `${height}%`,
                          }}
                        />
                      )
                    )}

                  </div>

                </div>

              </div>

              {/* Preview bottom */}

              <div className="grid grid-cols-3 border-t border-slate-100">

                <PreviewBottom
                  icon="🌦️"
                  label="Weather"
                  value="LOW"
                />

                <PreviewBottom
                  icon="🌾"
                  label="Crop"
                  value="Compare"
                />

                <PreviewBottom
                  icon="💰"
                  label="Profit"
                  value="Simulate"
                />

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          TRUST STRIP
      ===================================================== */}

      <section className="border-y border-slate-200 bg-white">

        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 sm:px-8 md:grid-cols-3 lg:px-10">

          <TrustItem
            icon="📊"
            title="Forecast-driven"
            description="Multiple forecast horizons for market planning."
          />

          <TrustItem
            icon="🔎"
            title="Evidence-aware"
            description="Data status and assumptions remain visible."
          />

          <TrustItem
            icon="🛡️"
            title="Decision support"
            description="No guaranteed prices, yields or profits."
          />

        </div>

      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section
        id="features"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >

        <div className="max-w-2xl">

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            One workspace
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#123d2b] sm:text-4xl">
            From market signals to practical planning.
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            AgriPulse combines different intelligence layers so
            farmers and agricultural decision-makers can examine
            the market from multiple perspectives.
          </p>

        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => (

            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                {feature.icon}
              </div>

              <h3 className="mt-5 text-base font-bold">
                {feature.title}
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-500">
                {feature.description}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how-it-works"
        className="bg-[#123d2b] text-white"
      >

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">

          <div className="max-w-2xl">

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              A simple workflow for complex agricultural signals.
            </h2>

            <p className="mt-4 text-sm leading-7 text-emerald-50/70">
              Start with a market context, examine the available
              evidence, then explore scenarios using your own
              assumptions.
            </p>

          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {steps.map((step) => (

              <div
                key={step.number}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >

                <span className="text-3xl font-bold text-emerald-300/70">
                  {step.number}
                </span>

                <h3 className="mt-6 text-base font-bold">
                  {step.title}
                </h3>

                <p className="mt-2 text-xs leading-6 text-emerald-50/60">
                  {step.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          RESPONSIBLE AI
      ===================================================== */}

      <section
        id="responsible-ai"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >

        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

          <div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
              🛡️
            </div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
              Responsible intelligence
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#123d2b] sm:text-4xl">
              Intelligence should explain uncertainty, not hide it.
            </h2>

          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">

            <div className="space-y-6">

              <ResponsibleItem
                title="Forecasts are estimates"
                description="Market forecasts represent modeled estimates and include uncertainty ranges."
              />

              <ResponsibleItem
                title="Weather is contextual"
                description="Weather-risk signals provide context and are not presented as proof of causation."
              />

              <ResponsibleItem
                title="Profit is scenario-based"
                description="Economic results depend on farmer-entered or stated assumptions about yield and costs."
              />

              <ResponsibleItem
                title="No automatic crop ranking"
                description="AgriPulse separates market attractiveness, crop suitability and profitability rather than silently combining them into a single ranking."
              />

            </div>

            <div className="mt-7 rounded-xl bg-slate-50 p-4">

              <p className="text-[10px] leading-5 text-slate-500">
                Current implementation is a development/demo
                environment. It does not guarantee future
                prices, yields, revenue, profit or agricultural
                outcomes.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="px-5 pb-16 sm:px-8 lg:px-10 lg:pb-20">

        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#123d2b] px-6 py-12 text-center sm:px-10 sm:py-16">

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
            Start with your market
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Explore agricultural intelligence built around your decisions.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-emerald-50/70">
            Create your profile, select your market context and
            explore the AgriPulse decision-support workspace.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              href="/register"
              className="rounded-xl bg-white px-6 py-3.5 text-xs font-bold text-[#123d2b] transition hover:bg-emerald-50"
            >
              Create account →
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-bold text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#123d2b] text-sm">
              🌱
            </div>

            <div>

              <p className="text-sm font-bold text-[#123d2b]">
                AgriPulse AI
              </p>

              <p className="text-[9px] text-slate-400">
                Agricultural market intelligence
              </p>

            </div>

          </div>

          <div className="flex flex-wrap gap-5 text-[10px] font-semibold text-slate-400">

            <Link
              href="/dashboard"
              className="transition hover:text-[#123d2b]"
            >
              Dashboard
            </Link>

            <Link
              href="/login"
              className="transition hover:text-[#123d2b]"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="transition hover:text-[#123d2b]"
            >
              Register
            </Link>

          </div>

          <p className="text-[9px] text-slate-400">
            Development / Demo
          </p>

        </div>

      </footer>

    </main>
  );
}

/* =========================================================
   PREVIEW FILTER
========================================================= */

function PreviewFilter({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">

      <p className="text-[7px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[9px] font-bold text-slate-700">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   PREVIEW CARD
========================================================= */

function PreviewCard({
  label,
  value,
  subtitle,
  positive,
}: {
  label: string;
  value: string;
  subtitle: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">

      <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-xl font-bold text-slate-900">
        {value}
      </p>

      <p
        className={`mt-1 text-[9px] font-semibold ${
          positive
            ? "text-emerald-600"
            : "text-slate-400"
        }`}
      >
        {subtitle}
      </p>

    </div>
  );
}

/* =========================================================
   PREVIEW BOTTOM
========================================================= */

function PreviewBottom({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 border-r border-slate-100 p-3 last:border-r-0">

      <span className="text-sm">
        {icon}
      </span>

      <div>

        <p className="text-[7px] text-slate-400">
          {label}
        </p>

        <p className="text-[8px] font-bold text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm">
        {icon}
      </div>

      <div>

        <p className="text-xs font-bold">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-5 text-slate-400">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   RESPONSIBLE AI ITEM
========================================================= */

function ResponsibleItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">

      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
        ✓
      </div>

      <div>

        <h3 className="text-sm font-bold">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-6 text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}