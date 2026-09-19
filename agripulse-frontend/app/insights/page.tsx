"use client";

import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { useGlobalFilters } from "@/components/filters/GlobalFilterContext";

type FarmerInsight = {
  state: string;
  district: string;
  commodity: string;

  current_price: number;
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
  price_change_pct: number;

  market_signal: string;
  uncertainty_level: string;
  weather_risk_level: string;
  weather_disruption_score: number;

  market_insight: string;
  uncertainty_insight: string;
  weather_insight: string;
  planning_context: string;
  farmer_insight: string;

  decision_warning: string;
  recommendation_status: string;

  market_data_status: string;
  forecast_data_status: string;
  explainability_status: string;

  weather_data_status: string;
  forecast_month: string;
  forecast_horizon_months: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/* =========================================================
   HELPERS
========================================================= */

function safeText(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return String(value);
}

function safeNumber(value: unknown) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
}

function money(value: unknown) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return `₹${Math.round(
    numericValue
  ).toLocaleString("en-IN")}`;
}

function percentage(value: unknown) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return `${numericValue >= 0 ? "+" : ""}${numericValue.toFixed(
    1
  )}%`;
}

function cropIcon(crop: string) {
  const icons: Record<string, string> = {
    Onion: "🧅",
    Potato: "🥔",
    Rice: "🌾",
    Tomato: "🍅",
    Wheat: "🌾",
  };

  return icons[crop] || "🌱";
}

function signalClass(signal: string) {
  if (
    signal === "RISING" ||
    signal === "CONSISTENTLY_RISING"
  ) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (
    signal === "FALLING" ||
    signal === "CONSISTENTLY_FALLING"
  ) {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-amber-100 text-amber-700 border-amber-200";
}

function riskClass(risk: string) {
  if (risk === "HIGH") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (risk === "MODERATE") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  if (risk === "LOW") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return "bg-slate-100 text-slate-600 border-slate-200";
}

/* =========================================================
   PAGE
========================================================= */

export default function InsightsPage() {
  const [insights, setInsights] = useState<FarmerInsight[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * GLOBAL DASHBOARD FILTERS
   *
   * State
   * District
   * Crop
   * Forecast Horizon
   */
  const {
    state: stateFilter,
    district: districtFilter,
    crop: cropFilter,
    horizon,
  } = useGlobalFilters();

  /*
   * These two filters remain local to Farmer Insights
   * because they are analysis-specific.
   */
  const [signalFilter, setSignalFilter] =
    useState("ALL");

  const [riskFilter, setRiskFilter] =
    useState("ALL");

  /* =======================================================
     LOAD INSIGHTS
  ======================================================= */

  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/api/insights/?limit=180`
        );

        if (!response.ok) {
          throw new Error(
            "Farmer insights API request failed."
          );
        }

        const result = await response.json();

        /*
         * Exact backend response mapping.
         */
        const normalizedData: FarmerInsight[] = (
          result.data || []
        ).map((item: any) => ({
          state: safeText(item.state),
          district: safeText(item.district),
          commodity: safeText(item.commodity),

          current_price: safeNumber(
            item.current_price
          ),

          predicted_price: safeNumber(
            item.predicted_price
          ),

          lower_bound: safeNumber(
            item.lower_bound
          ),

          upper_bound: safeNumber(
            item.upper_bound
          ),

          price_change_pct: safeNumber(
            item.price_change_pct
          ),

          market_signal: safeText(
            item.market_signal
          ),

          uncertainty_level: safeText(
            item.uncertainty_level
          ),

          weather_risk_level: safeText(
            item.weather_risk_level
          ),

          weather_disruption_score: safeNumber(
            item.weather_disruption_score
          ),

          market_insight: safeText(
            item.market_insight
          ),

          uncertainty_insight: safeText(
            item.uncertainty_insight
          ),

          weather_insight: safeText(
            item.weather_insight
          ),

          planning_context: safeText(
            item.planning_context
          ),

          farmer_insight: safeText(
            item.farmer_insight
          ),

          decision_warning: safeText(
            item.decision_warning
          ),

          recommendation_status: safeText(
            item.recommendation_status
          ),

          market_data_status: safeText(
            item.market_data_status
          ),

          forecast_data_status: safeText(
            item.forecast_data_status
          ),

          explainability_status: safeText(
            item.explainability_status
          ),

          weather_data_status: safeText(
            item.weather_data_status
          ),

          forecast_month: safeText(
            item.forecast_month
          ),

          forecast_horizon_months: safeNumber(
            item.forecast_horizon_months
          ),
        }));

        setInsights(normalizedData);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load farmer insights. Make sure FastAPI is running on port 8000."
        );
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, []);

  /* =======================================================
     GLOBAL FILTER + LOCAL FILTER
  ======================================================= */

  const filteredInsights = useMemo(() => {
    return insights.filter((item) => {
      /*
       * GLOBAL STATE
       */
      const stateMatch =
        stateFilter === "ALL" ||
        item.state === stateFilter;

      /*
       * GLOBAL DISTRICT
       */
      const districtMatch =
        districtFilter === "ALL" ||
        item.district === districtFilter;

      /*
       * GLOBAL CROP
       */
      const cropMatch =
        cropFilter === "ALL" ||
        item.commodity === cropFilter;

      /*
       * GLOBAL FORECAST HORIZON
       */
      const horizonMatch =
        item.forecast_horizon_months === horizon;

      /*
       * LOCAL MARKET SIGNAL
       */
      const signalMatch =
        signalFilter === "ALL" ||
        item.market_signal === signalFilter;

      /*
       * LOCAL WEATHER RISK
       */
      const riskMatch =
        riskFilter === "ALL" ||
        item.weather_risk_level === riskFilter;

      return (
        stateMatch &&
        districtMatch &&
        cropMatch &&
        horizonMatch &&
        signalMatch &&
        riskMatch
      );
    });
  }, [
    insights,
    stateFilter,
    districtFilter,
    cropFilter,
    horizon,
    signalFilter,
    riskFilter,
  ]);

  /* =======================================================
     SELECTED INSIGHT
  ======================================================= */

  const selectedInsight =
    filteredInsights[0];

  /* =======================================================
     SUMMARY
  ======================================================= */

  const risingCount = filteredInsights.filter(
    (item) =>
      item.market_signal === "RISING"
  ).length;

  const fallingCount = filteredInsights.filter(
    (item) =>
      item.market_signal === "FALLING"
  ).length;

  const stableCount = filteredInsights.filter(
    (item) =>
      item.market_signal === "STABLE"
  ).length;

  const highRiskCount = filteredInsights.filter(
    (item) =>
      item.weather_risk_level === "HIGH"
  ).length;

  /* =======================================================
     FILTER CONTEXT
  ======================================================= */

  const locationLabel = useMemo(() => {
    const parts: string[] = [];

    if (stateFilter !== "ALL") {
      parts.push(stateFilter);
    }

    if (districtFilter !== "ALL") {
      parts.push(districtFilter);
    }

    if (cropFilter !== "ALL") {
      parts.push(cropFilter);
    }

    if (!parts.length) {
      return "All available locations and crops";
    }

    return parts.join(" · ");
  }, [
    stateFilter,
    districtFilter,
    cropFilter,
  ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <PageContainer>

      <div className="min-h-screen bg-[#f5f7f3] text-slate-900">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="rounded-3xl bg-[#123d2b] p-7 text-white shadow-sm sm:p-9">

          <div className="max-w-3xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-100">

              <span>✦</span>

              Farmer Intelligence

            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Farmer Insights
            </h1>

            <p className="mt-4 text-sm leading-6 text-emerald-50/80 sm:text-base">
              Translate AgriPulse market and weather signals
              into understandable decision-support context
              without automatically ranking crops or guaranteeing
              outcomes.
            </p>

          </div>

        </section>

        {/* =================================================
            GLOBAL FILTER CONTEXT
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                Active Dashboard Filter
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {locationLabel}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Farmer Insights automatically follows the
                State, District, Crop and Forecast selected
                on the Dashboard.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <FilterPill
                label="State"
                value={
                  stateFilter === "ALL"
                    ? "All"
                    : stateFilter
                }
              />

              <FilterPill
                label="District"
                value={
                  districtFilter === "ALL"
                    ? "All"
                    : districtFilter
                }
              />

              <FilterPill
                label="Crop"
                value={
                  cropFilter === "ALL"
                    ? "All"
                    : cropFilter
                }
              />

              <FilterPill
                label="Forecast"
                value={`${horizon} Month`}
              />

            </div>

          </div>

        </section>

        {/* =================================================
            LOCAL FILTERS
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">

            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600">
              Insight-specific filters
            </p>

            <p className="mt-1 text-xs text-slate-400">
              These filters refine the Farmer Insights page
              without changing the global Dashboard selection.
            </p>

          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {/* MARKET SIGNAL */}

            <label>

              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Market Signal
              </span>

              <select
                value={signalFilter}
                onChange={(e) =>
                  setSignalFilter(
                    e.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >

                <option value="ALL">
                  All Signals
                </option>

                <option value="RISING">
                  Rising
                </option>

                <option value="STABLE">
                  Stable
                </option>

                <option value="FALLING">
                  Falling
                </option>

              </select>

            </label>

            {/* WEATHER RISK */}

            <label>

              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Weather Risk
              </span>

              <select
                value={riskFilter}
                onChange={(e) =>
                  setRiskFilter(
                    e.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >

                <option value="ALL">
                  All Risk Levels
                </option>

                <option value="LOW">
                  Low
                </option>

                <option value="MODERATE">
                  Moderate
                </option>

                <option value="HIGH">
                  High
                </option>

              </select>

            </label>

          </div>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <strong>API Error:</strong>{" "}
            {error}

          </div>

        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="flex min-h-[400px] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading farmer intelligence...
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

              <MetricCard
                title="Insights"
                value={String(
                  filteredInsights.length
                )}
                subtitle="Filtered records"
              />

              <MetricCard
                title="Rising"
                value={String(
                  risingCount
                )}
                subtitle="Market signals"
                positive
              />

              <MetricCard
                title="Stable"
                value={String(
                  stableCount
                )}
                subtitle="Market signals"
              />

              <MetricCard
                title="Falling"
                value={String(
                  fallingCount
                )}
                subtitle="Market signals"
              />

              <MetricCard
                title="High Weather Risk"
                value={String(
                  highRiskCount
                )}
                subtitle="Filtered records"
              />

            </section>

            {/* =================================================
                FEATURED INSIGHT
            ================================================= */}

            {selectedInsight && (

              <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 p-6">

                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

                    <div className="flex items-center gap-4">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                        {cropIcon(
                          selectedInsight.commodity
                        )}
                      </div>

                      <div>

                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                          Featured farmer insight
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">
                          {selectedInsight.commodity}
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                          {selectedInsight.district} ·{" "}
                          {selectedInsight.state}
                          {" · "}
                          {horizon} Month
                        </p>

                      </div>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      <span
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${signalClass(
                          selectedInsight.market_signal
                        )}`}
                      >
                        {
                          selectedInsight.market_signal
                        }
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${riskClass(
                          selectedInsight.weather_risk_level
                        )}`}
                      >
                        WEATHER{" "}
                        {
                          selectedInsight.weather_risk_level
                        }
                      </span>

                    </div>

                  </div>

                </div>

                <div className="grid gap-6 p-6 lg:grid-cols-[1.25fr_0.75fr]">

                  {/* FARMER EXPLANATION */}

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Farmer explanation
                    </p>

                    <div className="mt-3 rounded-2xl bg-emerald-50 p-5">

                      <p className="text-sm leading-7 text-emerald-950">
                        {
                          selectedInsight.farmer_insight
                        }
                      </p>

                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-5">

                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Planning context
                      </p>

                      <p className="mt-3 text-xs leading-6 text-slate-600">
                        {
                          selectedInsight.planning_context
                        }
                      </p>

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="space-y-4">

                    <InsightStatus
                      label="Market signal"
                      value={
                        selectedInsight.market_signal
                      }
                      className={signalClass(
                        selectedInsight.market_signal
                      )}
                    />

                    <InsightStatus
                      label="Weather risk"
                      value={
                        selectedInsight.weather_risk_level
                      }
                      className={riskClass(
                        selectedInsight.weather_risk_level
                      )}
                    />

                    <InsightStatus
                      label="Uncertainty"
                      value={
                        selectedInsight.uncertainty_level
                      }
                      className="bg-slate-100 text-slate-700 border-slate-200"
                    />

                    <InsightStatus
                      label="Decision support"
                      value={
                        selectedInsight.recommendation_status
                      }
                      className="bg-purple-100 text-purple-700 border-purple-200"
                    />

                  </div>

                </div>

              </section>

            )}

            {/* =================================================
                FORECAST SNAPSHOT
            ================================================= */}

            {selectedInsight && (

              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                      Forecast snapshot
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      Current market outlook
                    </h2>

                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                    {selectedInsight.forecast_horizon_months}M horizon
                  </span>

                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                  <ForecastMetric
                    label="Current Price"
                    value={money(
                      selectedInsight.current_price
                    )}
                  />

                  <ForecastMetric
                    label="Predicted Price"
                    value={money(
                      selectedInsight.predicted_price
                    )}
                  />

                  <ForecastMetric
                    label="Change"
                    value={percentage(
                      selectedInsight.price_change_pct
                    )}
                  />

                  <ForecastMetric
                    label="Lower Bound"
                    value={money(
                      selectedInsight.lower_bound
                    )}
                  />

                  <ForecastMetric
                    label="Upper Bound"
                    value={money(
                      selectedInsight.upper_bound
                    )}
                  />

                </div>

              </section>

            )}

            {/* =================================================
                INSIGHT CARDS
            ================================================= */}

            <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredInsights
                .slice(0, 12)
                .map((item, index) => (

                  <InsightCard
                    key={`${item.state}-${item.district}-${item.commodity}-${index}`}
                    item={item}
                  />

                ))}

            </section>

            {filteredInsights.length === 0 && (

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  ✦
                </div>

                <h2 className="mt-4 text-sm font-bold text-slate-700">
                  No farmer insights found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                  No insight record matches the current
                  Dashboard filters and insight-specific
                  filters.
                </p>

              </div>

            )}

            {/* =================================================
                EVIDENCE
            ================================================= */}

            {selectedInsight && (

              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Evidence & provenance
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Data and explanation status
                  </h2>

                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">

                  <SourceCard
                    title="Market data"
                    value={
                      selectedInsight.market_data_status
                    }
                  />

                  <SourceCard
                    title="Forecast data"
                    value={
                      selectedInsight.forecast_data_status
                    }
                  />

                  <SourceCard
                    title="Weather data"
                    value={
                      selectedInsight.weather_data_status
                    }
                  />

                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">

                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Explainability
                  </p>

                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    {
                      selectedInsight.explainability_status
                    }
                  </p>

                </div>

              </section>

            )}

            {/* =================================================
                INTERPRETATION
            ================================================= */}

            {selectedInsight && (

              <section className="mt-6 grid gap-5 md:grid-cols-3">

                <InterpretationCard
                  title="Market"
                  text={
                    selectedInsight.market_insight
                  }
                  icon="📈"
                />

                <InterpretationCard
                  title="Uncertainty"
                  text={
                    selectedInsight.uncertainty_insight
                  }
                  icon="◌"
                />

                <InterpretationCard
                  title="Weather"
                  text={
                    selectedInsight.weather_insight
                  }
                  icon="☁"
                />

              </section>

            )}

            {/* =================================================
                DECISION WARNING
            ================================================= */}

            {selectedInsight && (

              <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

                <div className="flex gap-3">

                  <span className="text-lg">
                    ⚠
                  </span>

                  <div>

                    <p className="text-xs font-bold text-amber-800">
                      Decision-support warning
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-amber-700">
                      {
                        selectedInsight.decision_warning
                      }
                    </p>

                  </div>

                </div>

              </section>

            )}

            {/* =================================================
                RESPONSIBLE AI
            ================================================= */}

            {selectedInsight && (

              <section className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-6">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                    Responsible AI
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-indigo-950">
                    How this insight is generated
                  </h2>

                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">

                  <StatusPanel
                    label="Explanation method"
                    value={
                      selectedInsight.explainability_status
                    }
                  />

                  <StatusPanel
                    label="Decision status"
                    value={
                      selectedInsight.recommendation_status
                    }
                  />

                  <StatusPanel
                    label="Forecast source"
                    value={
                      selectedInsight.forecast_data_status
                    }
                  />

                  <StatusPanel
                    label="Market data source"
                    value={
                      selectedInsight.market_data_status
                    }
                  />

                </div>

                <p className="mt-5 text-xs leading-6 text-indigo-900/70">
                  The current Farmer Insights layer summarizes
                  existing market and weather outputs using
                  rule-based explanations. It does not create a
                  separate numerical prediction and does not
                  guarantee future agricultural outcomes.
                </p>

              </section>

            )}

            {/* =================================================
                FINAL DISCLAIMER
            ================================================= */}

            <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

              <div className="flex gap-3">

                <span className="text-lg">
                  ⚠
                </span>

                <div>

                  <p className="text-xs font-bold text-amber-800">
                    Development / Demo Data
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-amber-700">
                    The current Farmer Insights implementation
                    uses development/demo market and weather
                    data. These outputs are decision-support
                    information and do not guarantee price,
                    yield, revenue or profit.
                  </p>

                </div>

              </div>

            </section>

          </>

        )}

      </div>

    </PageContainer>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  title,
  value,
  subtitle,
  positive,
}: {
  title: string;
  value: string;
  subtitle: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </p>

      <p
        className={`mt-4 text-2xl font-bold tracking-tight ${
          positive
            ? "text-emerald-700"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}

/* =========================================================
   INSIGHT STATUS
========================================================= */

function InsightStatus({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <span
        className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold ${className}`}
      >
        {value}
      </span>

    </div>
  );
}

/* =========================================================
   FORECAST METRIC
========================================================= */

function ForecastMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   INSIGHT CARD
========================================================= */

function InsightCard({
  item,
}: {
  item: FarmerInsight;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
            {cropIcon(item.commodity)}
          </div>

          <div>

            <h3 className="text-sm font-bold">
              {item.commodity}
            </h3>

            <p className="text-[10px] text-slate-400">
              {item.district} · {item.state}
            </p>

          </div>

        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${signalClass(
            item.market_signal
          )}`}
        >
          {item.market_signal}
        </span>

      </div>

      <div className="mt-4 flex flex-wrap gap-2">

        <span
          className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${riskClass(
            item.weather_risk_level
          )}`}
        >
          WEATHER {item.weather_risk_level}
        </span>

        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold text-slate-500">
          UNCERTAINTY{" "}
          {item.uncertainty_level}
        </span>

      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">

        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Farmer insight
        </p>

        <p className="mt-2 line-clamp-4 text-xs leading-5 text-slate-600">
          {item.farmer_insight}
        </p>

      </div>

      <div className="mt-4 flex items-center justify-between">

        <span className="text-[9px] font-semibold text-slate-400">
          Decision status
        </span>

        <span className="text-[10px] font-bold text-purple-600">
          {item.recommendation_status}
        </span>

      </div>

    </article>
  );
}

/* =========================================================
   SOURCE CARD
========================================================= */

function SourceCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </p>

      <p className="mt-3 break-words text-xs font-semibold leading-5 text-slate-700">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   INTERPRETATION CARD
========================================================= */

function InterpretationCard({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
          {icon}
        </div>

        <h3 className="text-sm font-bold">
          {title}
        </h3>

      </div>

      <p className="mt-4 text-xs leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}

/* =========================================================
   STATUS PANEL
========================================================= */

function StatusPanel({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-white/70 p-4">

      <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">
        {label}
      </p>

      <p className="mt-3 break-words text-xs font-bold text-indigo-950">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   FILTER PILL
========================================================= */

function FilterPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <span className="rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600">

      <span className="text-slate-400">
        {label}:
      </span>{" "}

      {value}

    </span>
  );
}