"use client";

import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { useGlobalFilters } from "@/components/filters/GlobalFilterContext";

type Forecast = {
  state: string;
  district: string;
  market: string | null;
  commodity: string;
  forecast_horizon_months: number;
  current_price: number;
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
  signal: string;
  percentage_change?: number;
};

const API_BASE = "http://127.0.0.1:8000";

/* =========================================================
   HELPERS
========================================================= */

const money = (
  value: number | null | undefined
) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return `₹${Math.round(
    Number(value)
  ).toLocaleString("en-IN")}`;
};

const pct = (
  value: number | null | undefined
) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  const numericValue = Number(value);

  return `${numericValue >= 0 ? "+" : ""}${numericValue.toFixed(
    1
  )}%`;
};

function signalClass(signal: string) {
  if (signal === "RISING") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (signal === "FALLING") {
    return "bg-red-100 text-red-700";
  }

  return "bg-amber-100 text-amber-700";
}

/* =========================================================
   PAGE
========================================================= */

export default function MarketPage() {
  const [forecasts, setForecasts] = useState<
    Forecast[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * GLOBAL FILTERS
   *
   * These values are controlled by the Dashboard.
   *
   * Example:
   *
   * Dashboard
   * Jharkhand → Ranchi → Onion → 1 Month
   *
   * automatically becomes the filter here.
   */
  const {
    state: stateFilter,
    district: districtFilter,
    crop: cropFilter,
    horizon,
  } = useGlobalFilters();

  /* =======================================================
     LOAD MARKET DATA
  ======================================================= */

  useEffect(() => {
    async function loadForecasts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/api/market/forecasts?limit=180`
        );

        if (!response.ok) {
          throw new Error(
            "Market forecast API request failed."
          );
        }

        const result = await response.json();

        setForecasts(result.data || []);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load market forecasts. Make sure FastAPI is running on port 8000."
        );
      } finally {
        setLoading(false);
      }
    }

    loadForecasts();
  }, []);

  /* =======================================================
     FILTERED FORECASTS
  ======================================================= */

  const filteredForecasts = useMemo(() => {
    return forecasts
      .filter(
        (item) =>
          item.forecast_horizon_months ===
          horizon
      )
      .filter(
        (item) =>
          stateFilter === "ALL" ||
          item.state === stateFilter
      )
      .filter(
        (item) =>
          districtFilter === "ALL" ||
          item.district === districtFilter
      )
      .filter(
        (item) =>
          cropFilter === "ALL" ||
          item.commodity === cropFilter
      );
  }, [
    forecasts,
    stateFilter,
    districtFilter,
    cropFilter,
    horizon,
  ]);

  /* =======================================================
     SUMMARY METRICS
  ======================================================= */

  const averageCurrentPrice = useMemo(() => {
    if (!filteredForecasts.length) {
      return 0;
    }

    return (
      filteredForecasts.reduce(
        (sum, item) =>
          sum + Number(item.current_price || 0),
        0
      ) / filteredForecasts.length
    );
  }, [filteredForecasts]);

  const averageForecastPrice = useMemo(() => {
    if (!filteredForecasts.length) {
      return 0;
    }

    return (
      filteredForecasts.reduce(
        (sum, item) =>
          sum + Number(item.predicted_price || 0),
        0
      ) / filteredForecasts.length
    );
  }, [filteredForecasts]);

  const risingCount = filteredForecasts.filter(
    (item) => item.signal === "RISING"
  ).length;

  const fallingCount = filteredForecasts.filter(
    (item) => item.signal === "FALLING"
  ).length;

  /* =======================================================
     SELECTED CONTEXT
  ======================================================= */

  const selectedLocationLabel = useMemo(() => {
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
      return "All available market series";
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
            PAGE INTRO
        ================================================= */}

        <section className="rounded-3xl bg-[#123d2b] p-7 text-white shadow-sm sm:p-9">

          <div className="max-w-3xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-100">
              <span>↗</span>
              Market Intelligence
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Agricultural Market Forecast
            </h1>

            <p className="mt-4 text-sm leading-6 text-emerald-50/80 sm:text-base">
              Explore modeled crop price forecasts across
              available market series, with forecast ranges
              and directional signals.
            </p>

          </div>
        </section>

        {/* =================================================
            ACTIVE GLOBAL FILTER
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                Active Dashboard Filter
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {selectedLocationLabel}
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
                Loading market forecasts...
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <MetricCard
                title="Average Current Price"
                value={
                  averageCurrentPrice
                    ? money(averageCurrentPrice)
                    : "—"
                }
                subtitle="Across filtered series"
              />

              <MetricCard
                title={`${horizon}M Average Forecast`}
                value={
                  averageForecastPrice
                    ? money(averageForecastPrice)
                    : "—"
                }
                subtitle="Modeled forecast"
              />

              <MetricCard
                title="Rising Signals"
                value={String(risingCount)}
                subtitle="Filtered series"
              />

              <MetricCard
                title="Falling Signals"
                value={String(fallingCount)}
                subtitle="Filtered series"
              />

            </section>

            {/* =================================================
                SELECTED MARKET SUMMARY
            ================================================= */}

            {filteredForecasts.length === 1 && (
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                      Selected Market
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {filteredForecasts[0].commodity}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {filteredForecasts[0].market ||
                        `${filteredForecasts[0].district} Market`}
                      {" · "}
                      {filteredForecasts[0].district}
                      {" · "}
                      {filteredForecasts[0].state}
                    </p>

                  </div>

                  <div className="flex flex-wrap gap-3">

                    <div className="rounded-xl bg-slate-50 px-4 py-3">

                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        Current
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {money(
                          filteredForecasts[0]
                            .current_price
                        )}
                      </p>

                    </div>

                    <div className="rounded-xl bg-emerald-50 px-4 py-3">

                      <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">
                        Forecast
                      </p>

                      <p className="mt-1 text-lg font-bold text-emerald-700">
                        {money(
                          filteredForecasts[0]
                            .predicted_price
                        )}
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-50 px-4 py-3">

                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        Change
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {pct(
                          filteredForecasts[0]
                            .percentage_change
                        )}
                      </p>

                    </div>

                    <div className="flex items-center">

                      <span
                        className={`rounded-full px-4 py-2 text-xs font-bold ${signalClass(
                          filteredForecasts[0].signal
                        )}`}
                      >
                        {filteredForecasts[0].signal}
                      </span>

                    </div>

                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                FORECAST TABLE
            ================================================= */}

            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                    Forecast Dataset
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Market Forecast Series
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {horizon}-month modeled price forecasts
                    · {selectedLocationLabel}
                  </p>

                </div>

                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  {filteredForecasts.length} records
                </span>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[950px] text-left">

                  <thead>

                    <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">

                      <th className="px-6 py-4">
                        Location
                      </th>

                      <th className="px-6 py-4">
                        Crop
                      </th>

                      <th className="px-6 py-4">
                        Current
                      </th>

                      <th className="px-6 py-4">
                        Forecast
                      </th>

                      <th className="px-6 py-4">
                        Lower
                      </th>

                      <th className="px-6 py-4">
                        Upper
                      </th>

                      <th className="px-6 py-4">
                        Change
                      </th>

                      <th className="px-6 py-4">
                        Signal
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredForecasts.map(
                      (item, index) => (

                        <tr
                          key={`${item.state}-${item.district}-${item.commodity}-${item.forecast_horizon_months}-${index}`}
                          className="border-b border-slate-50 transition hover:bg-slate-50"
                        >

                          <td className="px-6 py-4">

                            <p className="text-sm font-semibold">
                              {item.district}
                            </p>

                            <p className="text-[11px] text-slate-400">
                              {item.state}
                            </p>

                          </td>

                          <td className="px-6 py-4">

                            <span className="text-sm font-semibold">
                              {item.commodity}
                            </span>

                          </td>

                          <td className="px-6 py-4 text-sm font-medium">
                            {money(
                              item.current_price
                            )}
                          </td>

                          <td className="px-6 py-4">

                            <span className="text-sm font-bold">
                              {money(
                                item.predicted_price
                              )}
                            </span>

                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500">
                            {money(
                              item.lower_bound
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500">
                            {money(
                              item.upper_bound
                            )}
                          </td>

                          <td className="px-6 py-4">

                            <span className="text-xs font-bold">
                              {pct(
                                item.percentage_change
                              )}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${signalClass(
                                item.signal
                              )}`}
                            >
                              {item.signal}
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                    {filteredForecasts.length === 0 && (

                      <tr>

                        <td
                          colSpan={8}
                          className="px-6 py-16 text-center"
                        >

                          <div className="mx-auto max-w-md">

                            <p className="text-sm font-semibold text-slate-700">
                              No forecast records found
                            </p>

                            <p className="mt-2 text-xs leading-5 text-slate-400">
                              There is no market forecast
                              record matching the current
                              Dashboard filter:
                              {" "}
                              {selectedLocationLabel}
                              {" · "}
                              {horizon} month.
                            </p>

                            <p className="mt-3 text-[10px] text-slate-400">
                              Change the filters from the
                              Dashboard to explore another
                              location or crop.
                            </p>

                          </div>

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* =================================================
                FORECAST RANGE EXPLANATION
            ================================================= */}

            <section className="mt-6 grid gap-6 lg:grid-cols-3">

              <InfoCard
                icon="↗"
                title="Forecast"
                description="The modeled price estimate for the selected forecast horizon."
              />

              <InfoCard
                icon="↕"
                title="Forecast Range"
                description="Lower and upper bounds communicate uncertainty around the modeled forecast."
              />

              <InfoCard
                icon="◉"
                title="Market Signal"
                description="RISING, FALLING or STABLE describes the modeled directional movement."
              />

            </section>

            {/* =================================================
                DATA CONTEXT
            ================================================= */}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Global filter behavior
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    This page automatically follows the
                    State, District, Crop and Forecast
                    selection made on the Dashboard.
                  </p>

                </div>

                <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                  Dashboard-controlled
                </span>

              </div>

            </section>

            {/* =================================================
                DISCLAIMER
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
                    These forecasts are decision-support
                    outputs from the current AgriPulse
                    development pipeline. They should not
                    be interpreted as guaranteed future
                    prices or profits.
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
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </p>

      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {subtitle}
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

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          {icon}
        </div>

        <h3 className="text-sm font-bold">
          {title}
        </h3>

      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}