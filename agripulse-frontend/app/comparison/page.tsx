"use client";

import { useEffect, useMemo, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { useGlobalFilters } from "@/components/filters/GlobalFilterContext";

type Comparison = {
  state: string;
  district: string;
  commodity: string;

  forecast_1m: number;
  forecast_2m: number;
  forecast_3m: number;

  trajectory: string;
  multi_horizon_signal: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const money = (
  value: number | string | null | undefined
) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return `₹${Math.round(
    numericValue
  ).toLocaleString("en-IN")}`;
};

function signalClass(signal: string) {
  if (
    signal === "CONSISTENTLY_RISING" ||
    signal === "RISING"
  ) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (
    signal === "CONSISTENTLY_FALLING" ||
    signal === "FALLING"
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-amber-100 text-amber-700";
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

export default function ComparisonPage() {
  const [comparison, setComparison] = useState<
    Comparison[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * GLOBAL FILTERS
   *
   * These come from the Dashboard.
   *
   * Crop Comparison intentionally keeps all crops
   * for the selected location so that the page remains
   * a comparison tool.
   */
  const {
    state: stateFilter,
    district: districtFilter,
    crop: cropFilter,
    horizon,
  } = useGlobalFilters();

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    async function loadComparison() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/api/comparison/?limit=60`
        );

        if (!response.ok) {
          throw new Error(
            "Comparison API request failed."
          );
        }

        const result = await response.json();

        /*
         * Normalize backend field names.
         */
        const normalizedData: Comparison[] = (
          result.data || []
        ).map((item: any) => ({
          state: item.state,
          district: item.district,
          commodity: item.commodity,

          forecast_1m: Number(
            item.forecast_price_1m
          ),

          forecast_2m: Number(
            item.forecast_price_2m
          ),

          forecast_3m: Number(
            item.forecast_price_3m
          ),

          trajectory:
            item.forecast_trajectory,

          multi_horizon_signal:
            item.multi_horizon_signal,
        }));

        setComparison(normalizedData);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load crop comparison data. Make sure FastAPI is running on port 8000."
        );
      } finally {
        setLoading(false);
      }
    }

    loadComparison();
  }, []);

  /* =======================================================
     FILTER BY GLOBAL LOCATION
  ======================================================= */

  const locationFilteredComparison =
    useMemo(() => {
      return comparison.filter((item) => {
        const stateMatch =
          stateFilter === "ALL" ||
          item.state === stateFilter;

        const districtMatch =
          districtFilter === "ALL" ||
          item.district === districtFilter;

        return (
          stateMatch &&
          districtMatch
        );
      });
    }, [
      comparison,
      stateFilter,
      districtFilter,
    ]);

  /* =======================================================
     SELECTED CROP
  ======================================================= */

  const selectedCropComparison =
    useMemo(() => {
      if (cropFilter === "ALL") {
        return undefined;
      }

      return locationFilteredComparison.find(
        (item) =>
          item.commodity === cropFilter
      );
    }, [
      locationFilteredComparison,
      cropFilter,
    ]);

  /* =======================================================
     SELECTED FORECAST
  ======================================================= */

  function getForecastForHorizon(
    item: Comparison
  ) {
    if (horizon === 2) {
      return item.forecast_2m;
    }

    if (horizon === 3) {
      return item.forecast_3m;
    }

    return item.forecast_1m;
  }

  /* =======================================================
     LOCATION LABEL
  ======================================================= */

  const locationLabel = useMemo(() => {
    if (
      stateFilter === "ALL" &&
      districtFilter === "ALL"
    ) {
      return "All available locations";
    }

    if (districtFilter !== "ALL") {
      return `${districtFilter}, ${stateFilter}`;
    }

    return stateFilter;
  }, [
    stateFilter,
    districtFilter,
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
              <span>◒</span>
              Crop Intelligence
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Crop Comparison
            </h1>

            <p className="mt-4 text-sm leading-6 text-emerald-50/80 sm:text-base">
              Compare modeled market trajectories across
              crops and forecast horizons without
              automatically ranking one crop above another.
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
                Crop comparison automatically follows
                the State and District selected on the
                Dashboard.
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
                label="Selected Crop"
                value={
                  cropFilter === "ALL"
                    ? "All Crops"
                    : cropFilter
                }
              />

              <FilterPill
                label="Horizon"
                value={`${horizon} Month`}
              />

            </div>

          </div>

        </section>

        {/* =================================================
            SELECTED CROP FOCUS
        ================================================= */}

        {cropFilter !== "ALL" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                  {cropIcon(cropFilter)}
                </div>

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                    Farmer Selected Crop
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    {cropFilter}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {locationLabel}
                  </p>

                </div>

              </div>

              {selectedCropComparison ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                  <FocusMetric
                    label="Current Horizon"
                    value={money(
                      getForecastForHorizon(
                        selectedCropComparison
                      )
                    )}
                  />

                  <FocusMetric
                    label="1 Month"
                    value={money(
                      selectedCropComparison
                        .forecast_1m
                    )}
                  />

                  <FocusMetric
                    label="2 Months"
                    value={money(
                      selectedCropComparison
                        .forecast_2m
                    )}
                  />

                  <FocusMetric
                    label="3 Months"
                    value={money(
                      selectedCropComparison
                        .forecast_3m
                    )}
                  />

                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 px-5 py-4 text-xs text-slate-500">
                  No comparison record exists for
                  {cropFilter} at the selected location.
                </div>
              )}

            </div>

          </section>
        )}

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
                Loading crop intelligence...
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* =================================================
                CROP CARDS
            ================================================= */}

            <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {locationFilteredComparison.map(
                (item) => (
                  <CropCard
                    key={`${item.state}-${item.district}-${item.commodity}`}
                    item={item}
                    selected={
                      item.commodity ===
                      cropFilter
                    }
                    selectedHorizon={horizon}
                  />
                )
              )}

            </section>

            {locationFilteredComparison.length === 0 && (

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">

                <p className="text-sm font-semibold text-slate-700">
                  No crop comparison records found
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  There is no comparison data for:
                  {" "}
                  {locationLabel}.
                </p>

                <p className="mt-3 text-[10px] text-slate-400">
                  Change the State or District from the
                  Dashboard to explore another location.
                </p>

              </div>
            )}

            {/* =================================================
                EXPLANATION
            ================================================= */}

            <section className="mt-7 grid gap-5 lg:grid-cols-3">

              <InfoCard
                icon="1M"
                title="1-Month Forecast"
                description="Near-term modeled market price for each crop in the selected location."
              />

              <InfoCard
                icon="2M"
                title="2-Month Forecast"
                description="Medium-horizon modeled market price for each crop."
              />

              <InfoCard
                icon="3M"
                title="3-Month Forecast"
                description="Longer-horizon modeled market price for each crop."
              />

            </section>

            {/* =================================================
                IMPORTANT NOTE
            ================================================= */}

            <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">

              <div className="flex gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  ✦
                </div>

                <div>

                  <h3 className="text-sm font-bold text-emerald-900">
                    How to interpret this comparison
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-emerald-800/80">
                    The comparison shows modeled price
                    trajectories across multiple horizons.
                    The selected crop is highlighted for
                    context, but the system does not
                    automatically determine which crop a
                    farmer should grow. Crop suitability,
                    profitability and farmer-specific
                    conditions are evaluated separately.
                  </p>

                </div>

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
                    Market forecasts are decision-support
                    outputs from the current development
                    pipeline. They do not guarantee future
                    prices, profitability or farming
                    outcomes.
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
   CROP CARD
========================================================= */

function CropCard({
  item,
  selected,
  selectedHorizon,
}: {
  item: Comparison;
  selected: boolean;
  selectedHorizon: number;
}) {
  const maxForecast = Math.max(
    item.forecast_1m,
    item.forecast_2m,
    item.forecast_3m
  );

  const selectedForecast =
    selectedHorizon === 2
      ? item.forecast_2m
      : selectedHorizon === 3
        ? item.forecast_3m
        : item.forecast_1m;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
        selected
          ? "border-emerald-400 ring-2 ring-emerald-100"
          : "border-slate-200"
      }`}
    >

      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-slate-100 p-5">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
            {cropIcon(item.commodity)}
          </div>

          <div>

            <div className="flex items-center gap-2">

              <h2 className="text-base font-bold">
                {item.commodity}
              </h2>

              {selected && (
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-emerald-700">
                  Selected
                </span>
              )}

            </div>

            <p className="text-[10px] text-slate-400">
              {item.district} · {item.state}
            </p>

          </div>

        </div>

        <span
          className={`max-w-[130px] rounded-full px-2.5 py-1.5 text-center text-[9px] font-bold ${signalClass(
            item.multi_horizon_signal
          )}`}
        >
          {item.multi_horizon_signal}
        </span>

      </div>

      {/* FORECASTS */}

      <div className="p-5">

        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Forecast trajectory
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">

          <ForecastBox
            label="1M"
            value={item.forecast_1m}
            active={
              selected &&
              selectedHorizon === 1
            }
          />

          <ForecastBox
            label="2M"
            value={item.forecast_2m}
            active={
              selected &&
              selectedHorizon === 2
            }
          />

          <ForecastBox
            label="3M"
            value={item.forecast_3m}
            active={
              selected &&
              selectedHorizon === 3
            }
          />

        </div>

        {/* SELECTED HORIZON */}

        {selected && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-3">

            <div className="flex items-center justify-between">

              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">
                Dashboard Horizon
              </span>

              <span className="text-xs font-bold text-emerald-800">
                {selectedHorizon} Month
              </span>

            </div>

            <p className="mt-1 text-lg font-bold text-emerald-700">
              {money(selectedForecast)}
            </p>

          </div>
        )}

        {/* TRAJECTORY */}

        <div className="mt-5 rounded-xl bg-slate-50 p-4">

          <div className="flex items-center justify-between">

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Trajectory
            </span>

            <span className="text-xs font-bold text-slate-700">
              {item.trajectory}
            </span>

          </div>

          <div className="mt-4 flex items-end gap-1">

            <TrajectoryBar
              value={item.forecast_1m}
              max={maxForecast}
              active={
                selected &&
                selectedHorizon === 1
              }
            />

            <TrajectoryBar
              value={item.forecast_2m}
              max={maxForecast}
              active={
                selected &&
                selectedHorizon === 2
              }
            />

            <TrajectoryBar
              value={item.forecast_3m}
              max={maxForecast}
              active={
                selected &&
                selectedHorizon === 3
              }
            />

          </div>

          <div className="mt-2 grid grid-cols-3 text-center text-[9px] text-slate-400">
            <span>1M</span>
            <span>2M</span>
            <span>3M</span>
          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   FORECAST BOX
========================================================= */

function ForecastBox({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        active
          ? "border-emerald-300 bg-emerald-50"
          : "border-slate-100 bg-white"
      }`}
    >

      <p
        className={`text-[9px] font-bold uppercase tracking-wider ${
          active
            ? "text-emerald-600"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <p className="mt-2 text-sm font-bold">
        {money(value)}
      </p>

    </div>
  );
}

/* =========================================================
   TRAJECTORY BAR
========================================================= */

function TrajectoryBar({
  value,
  max,
  active,
}: {
  value: number;
  max: number;
  active?: boolean;
}) {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(max) ||
    max <= 0
  ) {
    return (
      <div className="flex h-20 flex-1 items-end rounded-lg bg-white" />
    );
  }

  const height = Math.max(
    20,
    Math.min(100, (value / max) * 100)
  );

  return (
    <div className="flex h-20 flex-1 items-end rounded-lg bg-white">

      <div
        className={`w-full rounded-lg transition-all ${
          active
            ? "bg-emerald-600"
            : "bg-emerald-300"
        }`}
        style={{
          height: `${height}%`,
        }}
      />

    </div>
  );
}

/* =========================================================
   FOCUS METRIC
========================================================= */

function FocusMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">

      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold">
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

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-700">
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