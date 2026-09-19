"use client";

import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { useGlobalFilters } from "@/components/filters/GlobalFilterContext";

const API_BASE = "http://127.0.0.1:8000";

/* =========================================================
   TYPES
========================================================= */

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
  percentage_change: number;
};

type WeatherRisk = {
  state: string;
  district: string;
  commodity: string;

  weather_risk_level: string;
  weather_risk_score?: number;
  weather_disruption_score?: number;

  rainfall_total_mm: number;
  rainy_days: number;
  heavy_rain_days: number;
  extreme_rain_days: number;
  max_rainfall_mm: number;
  temperature_mean_c: number;

  weather_data_status: string;
};

type Comparison = {
  state: string;
  district: string;
  commodity: string;

  current_price: number;

  forecast_price_1m: number;
  forecast_price_2m: number;
  forecast_price_3m: number;

  price_change_pct_1m: number;
  price_change_pct_2m: number;
  price_change_pct_3m: number;

  market_signal_1m: string;
  market_signal_2m: string;
  market_signal_3m: string;

  forecast_trajectory: string;
  multi_horizon_signal: string;
};

type Suitability = {
  state: string;
  district: string;
  commodity: string;
  suitability_class: string;
  farmer_profile_status?: string;
};

type Profit = {
  state: string;
  district: string;
  commodity: string;

  farmer_acres: number;
  yield_per_acre_quintal: number;
  total_yield_quintal: number;

  cost_per_acre_inr: number;
  total_cost_inr: number;

  expected_price_1m: number;
  expected_revenue_inr: number;
  expected_gross_margin_inr: number;

  break_even_price_inr_per_quintal: number;
};

type Scenario = {
  commodity: string;
  scenario: string;
  scenario_price: number;
  total_yield_quintals: number;
  total_cost: number;
  revenue: number;
  gross_margin: number;
  break_even_price: number;
};

type Explanation = {
  state: string;
  district: string;
  commodity: string;
  market_signal: string;
  weather_risk_level: string;
  uncertainty_level: string;
  farmer_explanation: string;
  data_status: string;
};

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

const numberValue = (
  value: number | null | undefined,
  fallback = 0
) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return fallback;
  }

  return Number(value);
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

function riskClass(risk: string) {
  if (risk === "HIGH") {
    return "bg-red-100 text-red-700";
  }

  if (risk === "MODERATE") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

/* =========================================================
   PAGE
========================================================= */

export default function Home() {
  const [forecasts, setForecasts] =
    useState<Forecast[]>([]);

  const [weather, setWeather] =
    useState<WeatherRisk[]>([]);

  const [comparison, setComparison] =
    useState<Comparison[]>([]);

  const [suitability, setSuitability] =
    useState<Suitability[]>([]);

  const [profits, setProfits] =
    useState<Profit[]>([]);

  const [scenarios, setScenarios] =
    useState<Scenario[]>([]);

  const [explanations, setExplanations] =
    useState<Explanation[]>([]);

  /* =======================================================
     GLOBAL FILTERS
  ======================================================= */

  const {
    state: stateFilter,
    district: districtFilter,
    crop: cropFilter,
    horizon,
    setState: setStateFilter,
    setDistrict: setDistrictFilter,
    setCrop: setCropFilter,
    setHorizon,
    resetFilters,
  } = useGlobalFilters();

  const [loading, setLoading] =
    useState(true);

  const [apiError, setApiError] =
    useState("");

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setApiError("");

        const [
          forecastRes,
          weatherRes,
          comparisonRes,
          suitabilityRes,
          profitRes,
          scenarioRes,
          explanationRes,
        ] = await Promise.all([
          fetch(
            `${API_BASE}/api/market/forecasts?limit=180`
          ),

          fetch(
            `${API_BASE}/api/weather/risk?limit=180`
          ),

          fetch(
            `${API_BASE}/api/comparison/?limit=60`
          ),

          fetch(
            `${API_BASE}/api/suitability/?limit=5`
          ),

          fetch(
            `${API_BASE}/api/profit/?limit=5`
          ),

          fetch(
            `${API_BASE}/api/scenarios/?limit=15`
          ),

          fetch(
            `${API_BASE}/api/explanations/?limit=180`
          ),
        ]);

        if (
          !forecastRes.ok ||
          !weatherRes.ok ||
          !comparisonRes.ok ||
          !suitabilityRes.ok ||
          !profitRes.ok ||
          !scenarioRes.ok ||
          !explanationRes.ok
        ) {
          throw new Error(
            "One or more API requests failed."
          );
        }

        const [
          forecastData,
          weatherData,
          comparisonData,
          suitabilityData,
          profitData,
          scenarioData,
          explanationData,
        ] = await Promise.all([
          forecastRes.json(),
          weatherRes.json(),
          comparisonRes.json(),
          suitabilityRes.json(),
          profitRes.json(),
          scenarioRes.json(),
          explanationRes.json(),
        ]);

        setForecasts(
          forecastData.data || []
        );

        setWeather(
          weatherData.data || []
        );

        setComparison(
          comparisonData.data || []
        );

        setSuitability(
          suitabilityData.data || []
        );

        setProfits(
          profitData.data || []
        );

        setScenarios(
          scenarioData.data || []
        );

        setExplanations(
          explanationData.data || []
        );
      } catch (error) {
        console.error(error);

        setApiError(
          "Unable to connect to AgriPulse API. Make sure FastAPI is running on port 8000."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /* =======================================================
     FILTER OPTIONS
  ======================================================= */

  const states = useMemo(
    () =>
      [
        ...new Set(
          forecasts.map(
            (item) => item.state
          )
        ),
      ].sort(),
    [forecasts]
  );

  const districts = useMemo(() => {
    const filtered =
      stateFilter === "ALL"
        ? forecasts
        : forecasts.filter(
            (item) =>
              item.state === stateFilter
          );

    return [
      ...new Set(
        filtered.map(
          (item) => item.district
        )
      ),
    ].sort();
  }, [
    forecasts,
    stateFilter,
  ]);

  const crops = useMemo(
    () =>
      [
        ...new Set(
          forecasts.map(
            (item) => item.commodity
          )
        ),
      ].sort(),
    [forecasts]
  );

  /* =======================================================
     SELECTED FORECAST
  ======================================================= */

  const selectedForecasts =
    useMemo(() => {
      return forecasts.filter(
        (item) => {
          const stateMatch =
            stateFilter === "ALL" ||
            item.state === stateFilter;

          const districtMatch =
            districtFilter === "ALL" ||
            item.district === districtFilter;

          const cropMatch =
            cropFilter === "ALL" ||
            item.commodity === cropFilter;

          const horizonMatch =
            item.forecast_horizon_months ===
            horizon;

          return (
            stateMatch &&
            districtMatch &&
            cropMatch &&
            horizonMatch
          );
        }
      );
    }, [
      forecasts,
      stateFilter,
      districtFilter,
      cropFilter,
      horizon,
    ]);

  const selectedForecast =
    selectedForecasts[0];

  /* =======================================================
     SELECTED WEATHER
  ======================================================= */

  const selectedWeather =
    useMemo(() => {
      if (!selectedForecast) {
        return undefined;
      }

      return weather.find(
        (item) =>
          item.state ===
            selectedForecast.state &&
          item.district ===
            selectedForecast.district &&
          item.commodity.toLowerCase() ===
            selectedForecast.commodity.toLowerCase()
      );
    }, [
      selectedForecast,
      weather,
    ]);

  /* =======================================================
     SELECTED COMPARISON
  ======================================================= */

  const selectedComparison =
    useMemo(() => {
      if (!selectedForecast) {
        return undefined;
      }

      return comparison.find(
        (item) =>
          item.state ===
            selectedForecast.state &&
          item.district ===
            selectedForecast.district &&
          item.commodity ===
            selectedForecast.commodity
      );
    }, [
      selectedForecast,
      comparison,
    ]);

  /* =======================================================
     SELECTED PROFIT
  ======================================================= */

  const selectedProfit =
    useMemo(() => {
      if (!selectedForecast) {
        return undefined;
      }

      /*
       * IMPORTANT:
       *
       * Match by state + district + commodity.
       *
       * This prevents Gaya/Bihar economic data from
       * appearing for Ranchi/Jharkhand.
       */
      return profits.find(
        (item) =>
          item.state ===
            selectedForecast.state &&
          item.district ===
            selectedForecast.district &&
          item.commodity ===
            selectedForecast.commodity
      );
    }, [
      selectedForecast,
      profits,
    ]);

  /* =======================================================
     SELECTED EXPLANATION
  ======================================================= */

  const selectedExplanation =
    useMemo(() => {
      if (!selectedForecast) {
        return undefined;
      }

      return explanations.find(
        (item) =>
          item.state ===
            selectedForecast.state &&
          item.district ===
            selectedForecast.district &&
          item.commodity ===
            selectedForecast.commodity
      );
    }, [
      selectedForecast,
      explanations,
    ]);

  /* =======================================================
     SELECTED SCENARIOS
  ======================================================= */

  const selectedScenarios =
    useMemo(() => {
      if (!selectedForecast) {
        return [];
      }

      /*
       * Scenario records currently do not contain
       * state/district fields.
       *
       * Therefore we only use them when a matching
       * location-specific profit record exists.
       *
       * This prevents Gaya scenarios from appearing
       * for Ranchi.
       */
      if (!selectedProfit) {
        return [];
      }

      return scenarios.filter(
        (item) =>
          item.commodity ===
          selectedForecast.commodity
      );
    }, [
      selectedForecast,
      selectedProfit,
      scenarios,
    ]);

  /* =======================================================
     REGIONAL TABLE
  ======================================================= */

  const dashboardForecasts =
    useMemo(() => {
      return forecasts
        .filter(
          (item) =>
            item.forecast_horizon_months === 1
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
        )
        .slice(0, 12);
    }, [
      forecasts,
      stateFilter,
      districtFilter,
      cropFilter,
    ]);

  /* =======================================================
     STATE CHANGE
  ======================================================= */

  function changeState(
    value: string
  ) {
    setStateFilter(value);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <PageContainer>

      <div className="min-h-screen bg-[#f5f7f3] text-slate-900">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-[#123d2b] p-7 text-white shadow-sm sm:p-9">

          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-2xl" />

          <div className="absolute -bottom-24 right-40 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />

          <div className="relative max-w-3xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-100">

              <span>✦</span>

              AI-powered agricultural intelligence

            </div>

            <h3 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">

              Turn market signals into

              <span className="text-emerald-300">
                {" "}
                smarter crop decisions.
              </span>

            </h3>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/80 sm:text-base">
              Explore market forecasts, weather-risk
              context, crop suitability and economic
              scenarios in one decision-support workspace.
            </p>

          </div>

        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="-mt-6 relative z-10 mx-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:mx-8">

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

            <Filter
              label="State"
              value={stateFilter}
              options={[
                "ALL",
                ...states,
              ]}
              onChange={
                changeState
              }
            />

            <Filter
              label="District"
              value={districtFilter}
              options={[
                "ALL",
                ...districts,
              ]}
              onChange={
                setDistrictFilter
              }
            />

            <Filter
              label="Crop"
              value={cropFilter}
              options={[
                "ALL",
                ...crops,
              ]}
              onChange={
                setCropFilter
              }
            />

            <Filter
              label="Forecast"
              value={`${horizon} Month`}
              options={[
                "1 Month",
                "2 Month",
                "3 Month",
              ]}
              onChange={(value) =>
                setHorizon(
                  Number(
                    value.split(" ")[0]
                  )
                )
              }
            />

            <button
              onClick={
                resetFilters
              }
              className="mt-auto h-10 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Reset Filters
            </button>

          </div>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {apiError && (

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <strong>
              API connection error:
            </strong>{" "}

            {apiError}

          </div>

        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="flex min-h-[400px] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading AgriPulse intelligence...
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* =================================================
                KPI CARDS
            ================================================= */}

            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <MetricCard
                label="Current Price"
                value={
                  selectedForecast
                    ? money(
                        selectedForecast.current_price
                      )
                    : "—"
                }
                suffix="/ quintal"
                icon="₹"
              />

              <MetricCard
                label={`${horizon}M Forecast`}
                value={
                  selectedForecast
                    ? money(
                        selectedForecast.predicted_price
                      )
                    : "—"
                }
                suffix="/ quintal"
                icon="↗"
              />

              <MetricCard
                label="Market Signal"
                value={
                  selectedForecast?.signal ||
                  "—"
                }
                suffix={
                  selectedForecast
                    ? pct(
                        selectedForecast.percentage_change
                      )
                    : ""
                }
                icon="◉"
                accent
              />

              <MetricCard
                label="Weather Risk"
                value={
                  selectedWeather?.weather_risk_level ||
                  "—"
                }
                suffix={
                  selectedWeather
                    ? `Score ${
                        selectedWeather.weather_risk_score ??
                        selectedWeather.weather_disruption_score ??
                        "—"
                      }`
                    : ""
                }
                icon="☁"
              />

            </section>

            {/* =================================================
                MARKET FORECAST
            ================================================= */}

            <section className="mt-7 grid gap-6 xl:grid-cols-[1.6fr_1fr]">

              {/* MARKET */}

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                      Market intelligence
                    </p>

                    <h3 className="mt-1 text-xl font-bold">
                      {selectedForecast?.commodity ||
                        cropFilter}{" "}
                      Market
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {selectedForecast
                        ? `${selectedForecast.state} · ${selectedForecast.district}`
                        : "Select a location and crop"}
                    </p>

                  </div>

                  {selectedForecast && (

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${signalClass(
                        selectedForecast.signal
                      )}`}
                    >
                      {
                        selectedForecast.signal
                      }
                    </span>

                  )}

                </div>

                <div className="p-6">

                  {selectedForecast ? (

                    <>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

                        <SmallStat
                          label="Current"
                          value={money(
                            selectedForecast.current_price
                          )}
                        />

                        <SmallStat
                          label="Forecast"
                          value={money(
                            selectedForecast.predicted_price
                          )}
                        />

                        <SmallStat
                          label="Lower"
                          value={money(
                            selectedForecast.lower_bound
                          )}
                        />

                        <SmallStat
                          label="Upper"
                          value={money(
                            selectedForecast.upper_bound
                          )}
                        />

                      </div>

                      <div className="mt-8">

                        <div className="mb-3 flex justify-between text-[11px] text-slate-400">

                          <span>
                            Forecast range
                          </span>

                          <span>
                            {pct(
                              selectedForecast.percentage_change
                            )}{" "}
                            modeled change
                          </span>

                        </div>

                        <div className="relative h-14 rounded-xl bg-slate-50">

                          <div className="absolute left-[8%] right-[8%] top-1/2 h-2 -translate-y-1/2 rounded-full bg-emerald-100" />

                          <div
                            className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-4 border-white bg-emerald-600 shadow"
                            style={{
                              left: "48%",
                            }}
                          />

                          <div
                            className="absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-4 border-white bg-[#123d2b] shadow"
                            style={{
                              left: "64%",
                            }}
                          />

                          <div className="absolute left-[7%] top-8 text-[9px] text-slate-400">
                            Lower
                          </div>

                          <div className="absolute left-[45%] top-8 text-[9px] text-slate-400">
                            Current
                          </div>

                          <div className="absolute right-[6%] top-8 text-[9px] text-slate-400">
                            Upper
                          </div>

                        </div>

                      </div>
                    </>

                  ) : (

                    <EmptyState
                      text="No forecast matches the selected filters."
                    />

                  )}

                </div>

              </div>

              {/* WEATHER */}

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 p-6">

                  <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">
                    Environmental context
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    Weather Risk
                  </h3>

                </div>

                <div className="p-6">

                  {selectedWeather ? (

                    <>
                      <div className="flex items-center justify-between">

                        <div>

                          <p className="text-3xl">
                            ☁️
                          </p>

                          <p className="mt-3 text-sm font-bold">
                            Contextual risk
                          </p>

                        </div>

                        <span
                          className={`rounded-full px-4 py-2 text-xs font-bold ${riskClass(
                            selectedWeather.weather_risk_level
                          )}`}
                        >
                          {
                            selectedWeather.weather_risk_level
                          }
                        </span>

                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">

                        <WeatherStat
                          label="Rainfall"
                          value={`${numberValue(
                            selectedWeather.rainfall_total_mm
                          ).toFixed(
                            0
                          )} mm`}
                        />

                        <WeatherStat
                          label="Rainy Days"
                          value={`${numberValue(
                            selectedWeather.rainy_days
                          )}`}
                        />

                        <WeatherStat
                          label="Heavy Rain"
                          value={`${numberValue(
                            selectedWeather.heavy_rain_days
                          )}`}
                        />

                        <WeatherStat
                          label="Mean Temp."
                          value={`${numberValue(
                            selectedWeather.temperature_mean_c
                          ).toFixed(
                            1
                          )}°C`}
                        />

                      </div>

                      <p className="mt-5 text-[10px] leading-4 text-slate-400">
                        Weather is shown as contextual risk
                        information, not as a future weather
                        forecast or proof of causation.
                      </p>

                    </>

                  ) : (

                    <EmptyState
                      text="Weather data unavailable for this selection."
                    />

                  )}

                </div>

              </div>

            </section>

            {/* =================================================
                FORECAST TABLE
            ================================================= */}

            <section className="mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 p-6">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                    Regional market view
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    Available Forecast Series
                  </h3>

                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                  {
                    dashboardForecasts.length
                  }{" "}
                  shown
                </span>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[760px] text-left">

                  <thead>

                    <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400">

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
                        1M Forecast
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

                    {dashboardForecasts.map(
                      (
                        item,
                        index
                      ) => (

                        <tr
                          key={`${item.state}-${item.district}-${item.commodity}-${index}`}
                          className="border-b border-slate-50 transition hover:bg-slate-50"
                        >

                          <td className="px-6 py-4">

                            <p className="text-sm font-semibold">
                              {
                                item.district
                              }
                            </p>

                            <p className="text-[11px] text-slate-400">
                              {
                                item.state
                              }
                            </p>

                          </td>

                          <td className="px-6 py-4 text-sm">
                            {
                              item.commodity
                            }
                          </td>

                          <td className="px-6 py-4 text-sm font-medium">
                            {money(
                              item.current_price
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm font-bold">
                            {money(
                              item.predicted_price
                            )}
                          </td>

                          <td className="px-6 py-4 text-xs font-bold">
                            {pct(
                              item.percentage_change
                            )}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${signalClass(
                                item.signal
                              )}`}
                            >
                              {
                                item.signal
                              }
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                    {dashboardForecasts.length ===
                      0 && (

                      <tr>

                        <td colSpan={6}>

                          <EmptyState
                            text="No forecast records match these filters."
                          />

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* =================================================
                CROP COMPARISON
            ================================================= */}

            <section className="mt-7">

              <SectionHeading
                eyebrow="Crop intelligence"
                title="Crop Comparison"
                description="Compare modeled market trajectories without automatically ranking crops."
              />

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">

                {comparison
                  .filter(
                    (item) =>
                      stateFilter ===
                        "ALL" ||
                      item.state ===
                        stateFilter
                  )
                  .filter(
                    (item) =>
                      districtFilter ===
                        "ALL" ||
                      item.district ===
                        districtFilter
                  )
                  .slice(0, 5)
                  .map(
                    (item) => {

                      const cropSuitability =
                        suitability.find(
                          (s) =>
                            s.state ===
                              item.state &&
                            s.district ===
                              item.district &&
                            s.commodity ===
                              item.commodity
                        );

                      /*
                       * IMPORTANT:
                       *
                       * Match profit by state + district +
                       * commodity.
                       *
                       * This prevents Gaya profit numbers
                       * appearing inside Ranchi cards.
                       */
                      const cropProfit =
                        profits.find(
                          (p) =>
                            p.state ===
                              item.state &&
                            p.district ===
                              item.district &&
                            p.commodity ===
                              item.commodity
                        );

                      return (

                        <div
                          key={`${item.state}-${item.district}-${item.commodity}`}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >

                          <div className="flex items-center justify-between">

                            <span className="text-2xl">
                              {cropIcon(
                                item.commodity
                              )}
                            </span>

                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
                              {
                                item.commodity
                              }
                            </span>

                          </div>

                          <p className="mt-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            1M / 2M / 3M
                          </p>

                          <div className="mt-2 flex items-end gap-1">

                            <span className="text-xl font-bold">
                              {money(
                                item.forecast_price_1m
                              )}
                            </span>

                          </div>

                          <div className="mt-3 flex gap-1">

                            <MiniBar
                              value={
                                item.forecast_price_1m
                              }
                            />

                            <MiniBar
                              value={
                                item.forecast_price_2m
                              }
                            />

                            <MiniBar
                              value={
                                item.forecast_price_3m
                              }
                            />

                          </div>

                          <p className="mt-4 text-[10px] font-medium leading-4 text-slate-500">
                            {
                              item.multi_horizon_signal
                            }
                          </p>

                          <div className="mt-4 border-t border-slate-100 pt-4">

                            <div className="flex justify-between text-[10px]">

                              <span className="text-slate-400">
                                Suitability
                              </span>

                              <span className="font-semibold">
                                {
                                  cropSuitability?.suitability_class ||
                                  "NOT ASSESSED"
                                }
                              </span>

                            </div>

                            <div className="mt-2 flex justify-between text-[10px]">

                              <span className="text-slate-400">
                                Gross margin
                              </span>

                              <span className="font-semibold">
                                {cropProfit
                                  ? money(
                                      cropProfit.expected_gross_margin_inr
                                    )
                                  : "NOT ASSESSED"}
                              </span>

                            </div>

                          </div>

                        </div>

                      );
                    }
                  )}

              </div>

            </section>

            {/* =================================================
                PROFIT + SCENARIOS
            ================================================= */}

            <section className="mt-7 grid gap-6 xl:grid-cols-2">

              {/* =================================================
                  PROFIT SIMULATOR
              ================================================= */}

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 p-6">

                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
                    Economic simulation
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    Profit Simulator
                  </h3>

                </div>

                <div className="p-6">

                  {selectedForecast ? (

                    <>

                      {/* LOCATION CONTEXT */}

                      <div className="rounded-2xl bg-[#f5f7f3] p-5">

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              Selected market
                            </p>

                            <p className="mt-2 text-lg font-bold">
                              {
                                selectedForecast.commodity
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {
                                selectedForecast.district
                              }{" "}
                              ·{" "}
                              {
                                selectedForecast.state
                              }
                            </p>

                          </div>

                          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[9px] font-bold text-emerald-700">
                            {
                              selectedForecast.signal
                            }
                          </span>

                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">

                          <EconomicStat
                            label="Current Price"
                            value={money(
                              selectedForecast.current_price
                            )}
                          />

                          <EconomicStat
                            label={`${horizon}M Forecast`}
                            value={money(
                              selectedForecast.predicted_price
                            )}
                          />

                        </div>

                      </div>

                      {/* LOCATION-SPECIFIC ECONOMIC RECORD */}

                      {selectedProfit ? (

                        <>

                          <div className="mt-5 rounded-2xl bg-emerald-50 p-5">

                            <p className="text-xs text-slate-400">
                              Expected gross margin
                            </p>

                            <p className="mt-2 text-3xl font-bold text-emerald-700">
                              {money(
                                selectedProfit.expected_gross_margin_inr
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Existing economic scenario
                            </p>

                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">

                            <EconomicStat
                              label="Expected Revenue"
                              value={money(
                                selectedProfit.expected_revenue_inr
                              )}
                            />

                            <EconomicStat
                              label="Total Cost"
                              value={money(
                                selectedProfit.total_cost_inr
                              )}
                            />

                            <EconomicStat
                              label="Break-even"
                              value={money(
                                selectedProfit.break_even_price_inr_per_quintal
                              )}
                            />

                            <EconomicStat
                              label="Land Area"
                              value={`${selectedProfit.farmer_acres} acres`}
                            />

                          </div>

                        </>

                      ) : (

                        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">

                          <p className="text-xs font-bold text-blue-800">
                            Economic simulation available
                          </p>

                          <p className="mt-2 text-[11px] leading-5 text-blue-700">
                            No location-specific economic
                            record is stored for this
                            selection. The Profit Simulator
                            can calculate the scenario using
                            the selected market forecast
                            together with farmer-entered
                            yield and cultivation-cost
                            assumptions.
                          </p>

                          <div className="mt-4">

                            <a
                              href="/profit"
                              className="inline-flex items-center rounded-xl bg-[#123d2b] px-4 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#0d3022]"
                            >
                              Open Profit Simulator →
                            </a>

                          </div>

                        </div>

                      )}

                      <p className="mt-5 text-[10px] leading-4 text-slate-400">
                        The Dashboard does not reuse
                        economic assumptions from another
                        location. Location-specific market
                        forecasts are kept separate from
                        farmer-entered yield and cost
                        assumptions.
                      </p>

                    </>

                  ) : (

                    <EmptyState
                      text="Select a valid location, crop and forecast to open the Profit Simulator."
                    />

                  )}

                </div>

              </div>

              {/* =================================================
                  SCENARIO ANALYSIS
              ================================================= */}

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 p-6">

                  <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600">
                    Scenario analysis
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    Downside · Expected · Upside
                  </h3>

                </div>

                <div className="space-y-3 p-6">

                  {selectedForecast ? (

                    <>

                      {/* MARKET CONTEXT */}

                      <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="text-[9px] font-bold uppercase tracking-widest text-purple-600">
                              Selected market
                            </p>

                            <p className="mt-1 text-sm font-bold">
                              {
                                selectedForecast.commodity
                              }
                            </p>

                            <p className="text-[10px] text-slate-400">
                              {
                                selectedForecast.district
                              }{" "}
                              ·{" "}
                              {
                                selectedForecast.state
                              }
                            </p>

                          </div>

                          <span className="text-sm font-bold text-purple-700">
                            {money(
                              selectedForecast.predicted_price
                            )}
                          </span>

                        </div>

                      </div>

                      {selectedScenarios.length >
                      0 ? (

                        selectedScenarios.map(
                          (scenario) => (

                            <div
                              key={
                                scenario.scenario
                              }
                              className="rounded-xl border border-slate-100 p-4"
                            >

                              <div className="flex items-center justify-between">

                                <span className="text-xs font-bold">
                                  {
                                    scenario.scenario
                                  }
                                </span>

                                <span className="text-xs font-semibold text-slate-500">
                                  {money(
                                    scenario.scenario_price
                                  )}
                                </span>

                              </div>

                              <div className="mt-3 grid grid-cols-3 gap-3">

                                <div>

                                  <p className="text-[9px] text-slate-400">
                                    Revenue
                                  </p>

                                  <p className="mt-1 text-xs font-bold">
                                    {money(
                                      scenario.revenue
                                    )}
                                  </p>

                                </div>

                                <div>

                                  <p className="text-[9px] text-slate-400">
                                    Margin
                                  </p>

                                  <p className="mt-1 text-xs font-bold text-emerald-700">
                                    {money(
                                      scenario.gross_margin
                                    )}
                                  </p>

                                </div>

                                <div>

                                  <p className="text-[9px] text-slate-400">
                                    Break-even
                                  </p>

                                  <p className="mt-1 text-xs font-bold">
                                    {money(
                                      scenario.break_even_price
                                    )}
                                  </p>

                                </div>

                              </div>

                            </div>

                          )
                        )

                      ) : (

                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">

                          <p className="text-xs font-bold text-blue-800">
                            Scenario simulation is ready
                            for this market
                          </p>

                          <p className="mt-2 text-[11px] leading-5 text-blue-700">
                            Downside, expected and upside
                            economic scenarios require
                            farmer-specific yield and
                            cultivation-cost assumptions.
                            Open the Profit Simulator to
                            enter those values for this
                            selected location and crop.
                          </p>

                          <a
                            href="/profit"
                            className="mt-4 inline-flex items-center rounded-xl bg-[#123d2b] px-4 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#0d3022]"
                          >
                            Configure Scenarios →
                          </a>

                        </div>

                      )}

                    </>

                  ) : (

                    <EmptyState
                      text="Select a valid market context to view scenario analysis."
                    />

                  )}

                </div>

              </div>

            </section>

            {/* =================================================
                FARMER INSIGHT
            ================================================= */}

            <section className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">

              <div className="flex flex-col gap-5 sm:flex-row">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white">
                  ✦
                </div>

                <div className="flex-1">

                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                    Farmer insight
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    What the model is telling you
                  </h3>

                  <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
                    {selectedExplanation?.farmer_explanation ||
                      "Select a crop and location to view the available farmer explanation."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">

                    <StatusPill label="No guarantee" />

                    <StatusPill label="Rule-based explanation" />

                    <StatusPill label="Demo data" />

                    <StatusPill label="Decision support only" />

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                PROVENANCE
            ================================================= */}

            <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col justify-between gap-4 sm:flex-row">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Data provenance
                  </p>

                  <h3 className="mt-1 text-lg font-bold">
                    Know what powers each insight.
                  </h3>

                </div>

                <span className="h-fit rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-700">
                  DEVELOPMENT / DEMO
                </span>

              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <Provenance
                  title="Market Forecast"
                  value="Random Forest"
                />

                <Provenance
                  title="Weather"
                  value="Risk Features"
                />

                <Provenance
                  title="Economics"
                  value="Scenario Analysis"
                />

                <Provenance
                  title="Explanation"
                  value="Rule-Based"
                />

              </div>

              <p className="mt-5 text-[10px] leading-5 text-slate-400">
                Current implementation uses development/demo
                data and assumptions. This interface is
                decision support and does not provide
                guaranteed prices, yields, profits or
                agricultural outcomes.
              </p>

            </section>

            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="py-8 text-center text-[10px] text-slate-400">
              AgriPulse AI · Agricultural Market Intelligence ·
              Development Demo
            </footer>

          </>

        )}

      </div>

    </PageContainer>
  );
}

/* =========================================================
   FILTER
========================================================= */

function Filter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      >

        {options.map(
          (option) => (

            <option
              key={option}
              value={option}
            >
              {option === "ALL"
                ? "All"
                : option}
            </option>

          )
        )}

      </select>

    </label>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  label,
  value,
  suffix,
  icon,
  accent,
}: {
  label: string;
  value: string;
  suffix: string;
  icon: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            accent
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {icon}
        </div>

      </div>

      <p className="mt-5 text-2xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {suffix}
      </p>

    </div>
  );
}

/* =========================================================
   SMALL STAT
========================================================= */

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">

      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   WEATHER STAT
========================================================= */

function WeatherStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">

      <p className="text-[9px] uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   ECONOMIC STAT
========================================================= */

function EconomicStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">

      <p className="text-[9px] uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>

      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
        {eyebrow}
      </p>

      <h3 className="mt-1 text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   MINI BAR
========================================================= */

function MiniBar({
  value,
}: {
  value: number;
}) {
  const safeValue =
    numberValue(value);

  const height = Math.min(
    100,
    Math.max(
      25,
      safeValue / 40
    )
  );

  return (
    <div className="flex h-12 flex-1 items-end rounded-md bg-slate-50">

      <div
        className="w-full rounded-md bg-emerald-300"
        style={{
          height: `${height}%`,
        }}
      />

    </div>
  );
}

/* =========================================================
   STATUS PILL
========================================================= */

function StatusPill({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-emerald-700">
      {label}
    </span>
  );
}

/* =========================================================
   PROVENANCE
========================================================= */

function Provenance({
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

      <p className="mt-2 text-xs font-bold text-slate-700">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="py-10 text-center text-xs text-slate-400">
      {text}
    </div>
  );
}

/* =========================================================
   CROP ICON
========================================================= */

function cropIcon(
  crop: string
) {
  const icons: Record<
    string,
    string
  > = {
    Onion: "🧅",
    Potato: "🥔",
    Rice: "🌾",
    Tomato: "🍅",
    Wheat: "🌾",
  };

  return (
    icons[crop] || "🌱"
  );
}