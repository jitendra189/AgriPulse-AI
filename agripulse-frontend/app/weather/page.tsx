"use client";

import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { useGlobalFilters } from "@/components/filters/GlobalFilterContext";

type WeatherRisk = {
  state: string;
  district: string;
  market?: string | null;
  commodity: string;

  forecast_horizon_months?: number;

  weather_risk_level: string;
  weather_risk_score: number;

  rainfall_total_mm: number;
  rainy_days: number;
  heavy_rain_days: number;
  extreme_rain_days: number;
  max_rainfall_mm: number;
  temperature_mean_c: number;

  weather_data_status: string;
};

const API_BASE = "http://127.0.0.1:8000";

/* =========================================================
   HELPERS
========================================================= */

function numberValue(
  value: number | string | null | undefined
) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
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

function riskIcon(risk: string) {
  if (risk === "HIGH") {
    return "⚠";
  }

  if (risk === "MODERATE") {
    return "◐";
  }

  if (risk === "LOW") {
    return "✓";
  }

  return "—";
}

/* =========================================================
   PAGE
========================================================= */

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * GLOBAL FILTERS
   *
   * These are controlled from the Dashboard.
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
   * Risk level remains LOCAL to the Weather page.
   *
   * It is not part of the farmer's global market filter.
   */
  const [riskFilter, setRiskFilter] = useState("ALL");

  /* =======================================================
     LOAD WEATHER DATA
  ======================================================= */

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/api/weather/risk?limit=180`
        );

        if (!response.ok) {
          throw new Error(
            "Weather risk API request failed."
          );
        }

        const result = await response.json();

        setWeather(result.data || []);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load weather-risk data. Make sure FastAPI is running on port 8000."
        );
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, []);

  /* =======================================================
     FILTER WEATHER USING GLOBAL FILTER
  ======================================================= */

  const locationFilteredWeather = useMemo(() => {
    return weather.filter((item) => {
      const stateMatch =
        stateFilter === "ALL" ||
        item.state === stateFilter;

      const districtMatch =
        districtFilter === "ALL" ||
        item.district === districtFilter;

      const cropMatch =
        cropFilter === "ALL" ||
        item.commodity === cropFilter;

      /*
       * Weather data is forecast-horizon aware.
       *
       * If the backend record contains a horizon,
       * follow the Dashboard horizon.
       *
       * If older weather records don't contain the field,
       * keep them available rather than incorrectly removing them.
       */
      const horizonMatch =
        item.forecast_horizon_months === undefined ||
        item.forecast_horizon_months === null ||
        item.forecast_horizon_months === horizon;

      return (
        stateMatch &&
        districtMatch &&
        cropMatch &&
        horizonMatch
      );
    });
  }, [
    weather,
    stateFilter,
    districtFilter,
    cropFilter,
    horizon,
  ]);

  /* =======================================================
     LOCAL RISK FILTER
  ======================================================= */

  const filteredWeather = useMemo(() => {
    return locationFilteredWeather.filter((item) => {
      return (
        riskFilter === "ALL" ||
        item.weather_risk_level === riskFilter
      );
    });
  }, [
    locationFilteredWeather,
    riskFilter,
  ]);

  /* =======================================================
     SELECTED WEATHER
  ======================================================= */

  const selectedWeather = useMemo(() => {
    /*
     * Prefer the selected crop/location record.
     *
     * If Crop = ALL, show the first available record.
     */
    return filteredWeather[0];
  }, [filteredWeather]);

  /* =======================================================
     SUMMARY METRICS
  ======================================================= */

  const highRiskCount = filteredWeather.filter(
    (item) =>
      item.weather_risk_level === "HIGH"
  ).length;

  const moderateRiskCount = filteredWeather.filter(
    (item) =>
      item.weather_risk_level === "MODERATE"
  ).length;

  const lowRiskCount = filteredWeather.filter(
    (item) =>
      item.weather_risk_level === "LOW"
  ).length;

  const averageRainfall = useMemo(() => {
    if (!filteredWeather.length) {
      return 0;
    }

    return (
      filteredWeather.reduce(
        (sum, item) =>
          sum +
          numberValue(
            item.rainfall_total_mm
          ),
        0
      ) / filteredWeather.length
    );
  }, [filteredWeather]);

  const averageTemperature = useMemo(() => {
    if (!filteredWeather.length) {
      return 0;
    }

    return (
      filteredWeather.reduce(
        (sum, item) =>
          sum +
          numberValue(
            item.temperature_mean_c
          ),
        0
      ) / filteredWeather.length
    );
  }, [filteredWeather]);

  /* =======================================================
     ACTIVE FILTER LABEL
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

              <span>☁</span>

              Environmental Intelligence

            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Weather Risk
            </h1>

            <p className="mt-4 text-sm leading-6 text-emerald-50/80 sm:text-base">
              Understand rainfall and temperature conditions as
              contextual risk signals alongside agricultural market
              intelligence.
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
                Weather Risk automatically follows the
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
            LOCAL WEATHER FILTER
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">
                Weather-specific filter
              </p>

              <h2 className="mt-1 text-lg font-bold">
                Risk Level
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                This filter only controls weather-risk
                severity and does not change the Dashboard
                location selection.
              </p>

            </div>

            <label className="block w-full sm:w-64">

              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Risk Level
              </span>

              <select
                value={riskFilter}
                onChange={(e) =>
                  setRiskFilter(e.target.value)
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
                Loading weather-risk intelligence...
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

              <MetricCard
                title="Records"
                value={String(
                  filteredWeather.length
                )}
                subtitle="Filtered weather records"
              />

              <MetricCard
                title="High Risk"
                value={String(highRiskCount)}
                subtitle="High-risk records"
                danger
              />

              <MetricCard
                title="Moderate Risk"
                value={String(
                  moderateRiskCount
                )}
                subtitle="Moderate-risk records"
              />

              <MetricCard
                title="Average Rainfall"
                value={`${averageRainfall.toFixed(
                  1
                )} mm`}
                subtitle="Filtered records"
              />

              <MetricCard
                title="Average Temperature"
                value={`${averageTemperature.toFixed(
                  1
                )}°C`}
                subtitle="Mean temperature"
              />

            </section>

            {/* =================================================
                SELECTED WEATHER
            ================================================= */}

            {selectedWeather && (

              <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">
                      Selected weather context
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      {selectedWeather.commodity}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {selectedWeather.district} ·{" "}
                      {selectedWeather.state}
                      {" · "}
                      {horizon} Month
                    </p>

                  </div>

                  <div
                    className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${riskClass(
                      selectedWeather.weather_risk_level
                    )}`}
                  >

                    <span>
                      {riskIcon(
                        selectedWeather.weather_risk_level
                      )}
                    </span>

                    {selectedWeather.weather_risk_level}

                  </div>

                </div>

                <div className="p-6">

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <WeatherMetric
                      icon="🌧"
                      label="Total Rainfall"
                      value={`${numberValue(
                        selectedWeather.rainfall_total_mm
                      ).toFixed(1)} mm`}
                    />

                    <WeatherMetric
                      icon="☔"
                      label="Rainy Days"
                      value={String(
                        numberValue(
                          selectedWeather.rainy_days
                        )
                      )}
                    />

                    <WeatherMetric
                      icon="⚠"
                      label="Heavy Rain Days"
                      value={String(
                        numberValue(
                          selectedWeather.heavy_rain_days
                        )
                      )}
                    />

                    <WeatherMetric
                      icon="🌡"
                      label="Mean Temperature"
                      value={`${numberValue(
                        selectedWeather.temperature_mean_c
                      ).toFixed(1)}°C`}
                    />

                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">

                    <WeatherMetric
                      icon="⛈"
                      label="Extreme Rain Days"
                      value={String(
                        numberValue(
                          selectedWeather.extreme_rain_days
                        )
                      )}
                    />

                    <WeatherMetric
                      icon="📈"
                      label="Maximum Rainfall"
                      value={`${numberValue(
                        selectedWeather.max_rainfall_mm
                      ).toFixed(1)} mm`}
                    />

                  </div>

                  {/* RISK SCORE */}

                  <div className="mt-5 rounded-xl bg-slate-50 p-4">

                    <div className="flex items-center justify-between">

                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Weather Risk Score
                      </span>

                      <span className="text-lg font-bold text-slate-800">
                        {numberValue(
                          selectedWeather.weather_risk_score
                        )}
                      </span>

                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

                      <div
                        className={`h-full rounded-full ${
                          selectedWeather.weather_risk_level ===
                          "HIGH"
                            ? "bg-red-500"
                            : selectedWeather.weather_risk_level ===
                                "MODERATE"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              numberValue(
                                selectedWeather.weather_risk_score
                              ) * 10
                            )
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              </section>

            )}

            {/* =================================================
                NO DATA
            ================================================= */}

            {!selectedWeather && (

              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  ☁
                </div>

                <h2 className="mt-4 text-sm font-bold text-slate-700">
                  No weather-risk data found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                  There is no weather-risk record matching
                  the current Dashboard filters and selected
                  risk level.
                </p>

                <p className="mt-3 text-[10px] text-slate-400">
                  Try changing the filters from the Dashboard
                  or selecting a different risk level.
                </p>

              </section>

            )}

            {/* =================================================
                WEATHER TABLE
            ================================================= */}

            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 p-6">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">
                    Regional weather view
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Weather Risk Records
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {locationLabel}
                    {" · "}
                    {horizon} Month
                  </p>

                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                  {filteredWeather.length} records
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
                        Risk
                      </th>

                      <th className="px-6 py-4">
                        Rainfall
                      </th>

                      <th className="px-6 py-4">
                        Rainy Days
                      </th>

                      <th className="px-6 py-4">
                        Heavy Rain
                      </th>

                      <th className="px-6 py-4">
                        Temperature
                      </th>

                      <th className="px-6 py-4">
                        Data Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredWeather.map(
                      (item, index) => (

                        <tr
                          key={`${item.state}-${item.district}-${item.commodity}-${index}`}
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

                          <td className="px-6 py-4 text-sm font-semibold">
                            {item.commodity}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${riskClass(
                                item.weather_risk_level
                              )}`}
                            >
                              {item.weather_risk_level}
                            </span>

                          </td>

                          <td className="px-6 py-4 text-sm font-medium">
                            {numberValue(
                              item.rainfall_total_mm
                            ).toFixed(1)}{" "}
                            mm
                          </td>

                          <td className="px-6 py-4 text-sm">
                            {numberValue(
                              item.rainy_days
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm">
                            {numberValue(
                              item.heavy_rain_days
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm">
                            {numberValue(
                              item.temperature_mean_c
                            ).toFixed(1)}
                            °C
                          </td>

                          <td className="px-6 py-4">

                            <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-[9px] font-semibold text-slate-500">
                              {item.weather_data_status}
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                    {filteredWeather.length === 0 && (

                      <tr>

                        <td
                          colSpan={8}
                          className="px-6 py-16 text-center text-sm text-slate-400"
                        >
                          No weather-risk records match
                          the current Dashboard filters.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* =================================================
                RISK EXPLANATION
            ================================================= */}

            <section className="mt-6 grid gap-5 md:grid-cols-3">

              <RiskInfo
                level="LOW"
                description="Lower contextual weather-risk level in the available development data."
              />

              <RiskInfo
                level="MODERATE"
                description="Moderate contextual weather-risk level that should be considered alongside market signals."
              />

              <RiskInfo
                level="HIGH"
                description="Higher contextual weather-risk level that may warrant additional attention."
              />

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
                    Important interpretation note
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-amber-700">
                    Weather information shown here is
                    contextual risk information derived from
                    the current development dataset. It is
                    not a future weather forecast and should
                    not be interpreted as proof that weather
                    caused a particular market-price movement.
                  </p>

                </div>

              </div>

            </section>

            {/* =================================================
                DATA STATUS
            ================================================= */}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Data provenance
                  </p>

                  <h3 className="mt-1 text-lg font-bold">
                    Weather context status
                  </h3>

                </div>

                <span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-700">
                  DEVELOPMENT / DEMO
                </span>

              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                The current AgriPulse implementation uses
                development weather data for demonstration.
                Official weather data can replace this source
                in a later production integration without
                changing the dashboard concept.
              </p>

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
  danger,
}: {
  title: string;
  value: string;
  subtitle: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </p>

      <p
        className={`mt-4 text-2xl font-bold tracking-tight ${
          danger
            ? "text-red-600"
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
   WEATHER METRIC
========================================================= */

function WeatherMetric({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

      <div className="flex items-center gap-2">

        <span className="text-lg">
          {icon}
        </span>

        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

      </div>

      <p className="mt-3 text-lg font-bold">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   RISK INFO
========================================================= */

function RiskInfo({
  level,
  description,
}: {
  level: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <span
        className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${riskClass(
          level
        )}`}
      >
        {level}
      </span>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {description}
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