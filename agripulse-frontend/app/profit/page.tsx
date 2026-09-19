"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useGlobalFilters } from "@/components/filters/GlobalFilterContext";
import PageContainer from "@/components/layout/PageContainer";

type ProfitRecord = {
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
  lower_margin_inr?: number;
  upper_margin_inr?: number;
};

type Scenario = {
  state: string;
  district: string;
  commodity: string;
  scenario: "DOWNSIDE" | "EXPECTED" | "UPSIDE";
  scenario_price_inr_per_quintal: number;
  total_yield_quintal: number;
  total_cost_inr: number;
  revenue_inr: number;
  gross_margin_inr: number;
  break_even_price_inr_per_quintal: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const money = (value: number | undefined) =>
  Number.isFinite(value)
    ? `₹${Math.round(value as number).toLocaleString("en-IN")}`
    : "—";

const number = (value: number | undefined, digits = 1) =>
  Number.isFinite(value)
    ? (value as number).toLocaleString("en-IN", {
        maximumFractionDigits: digits,
      })
    : "—";

function scenarioClass(scenario: string) {
  if (scenario === "UPSIDE") return "border-emerald-200 bg-emerald-50";
  if (scenario === "DOWNSIDE") return "border-red-200 bg-red-50";
  return "border-amber-200 bg-amber-50";
}

export default function ProfitPage() {
  const { crop, state, district } = useGlobalFilters();
  const [profit, setProfit] = useState<ProfitRecord | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cropQuery = crop !== "ALL" ? `&commodity=${encodeURIComponent(crop)}` : "";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [profitRes, scenarioRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/profit/?limit=5${cropQuery}`, {
            cache: "no-store",
          }),
          fetch(`${API_BASE_URL}/api/scenarios/?limit=15${cropQuery}`, {
            cache: "no-store",
          }),
        ]);

        if (!profitRes.ok || !scenarioRes.ok) {
          throw new Error("Unable to load profit analysis.");
        }

        const [profitData, scenarioData] = await Promise.all([
          profitRes.json(),
          scenarioRes.json(),
        ]);

        if (cancelled) return;

        const profitRows: ProfitRecord[] = profitData.data || [];
        const scenarioRows: Scenario[] = scenarioData.data || [];

        const scopedProfit =
          district !== "ALL"
            ? profitRows.find(
                (row) =>
                  row.district?.toLowerCase() === district.toLowerCase()
              )
            : state !== "ALL"
              ? profitRows.find(
                  (row) =>
                    row.state?.toLowerCase() === state.toLowerCase()
                )
              : profitRows[0];

        setProfit(scopedProfit || profitRows[0] || null);
        setScenarios(
          scenarioRows
            .filter((row) =>
              scopedProfit
                ? row.commodity?.toLowerCase() === scopedProfit.commodity?.toLowerCase()
                : true
            )
            .sort((a, b) => {
              const order = { DOWNSIDE: 0, EXPECTED: 1, UPSIDE: 2 };
              return order[a.scenario] - order[b.scenario];
            })
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load profit analysis."
          );
          setProfit(null);
          setScenarios([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [cropQuery, state, district]);

  const selectedScenario = useMemo(
    () => scenarios.filter((row) => row.commodity === profit?.commodity),
    [scenarios, profit]
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
              Economic decision support
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Profit Simulator
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Explore expected, downside and upside economic scenarios using
              the existing AgriPulse forecast and explicit demo assumptions.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ← Dashboard
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            Crop: {crop}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            Filter state: {state}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            Filter district: {district}
          </span>
          {profit && (
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              Scenario data: {profit.district}, {profit.state}
            </span>
          )}
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
            <p className="mt-4 text-sm font-semibold">Loading profit analysis...</p>
          </div>
        )}

        {!loading && error && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-bold text-red-800">Profit analysis unavailable</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && !profit && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="font-bold text-slate-800">No profit data for this selection</p>
            <p className="mt-2 text-sm text-slate-500">
              Try another crop or reset the dashboard filters.
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white"
            >
              Back to dashboard
            </Link>
          </div>
        )}

        {!loading && !error && profit && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Expected Price", money(profit.expected_price_1m)],
                ["Expected Revenue", money(profit.expected_revenue_inr)],
                ["Gross Margin", money(profit.expected_gross_margin_inr)],
                ["Break-even Price", money(profit.break_even_price_inr_per_quintal)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Selected crop
                    </p>
                    <h2 className="mt-1 text-xl font-bold">{profit.commodity}</h2>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                    Development assumptions
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Metric label="Farm size" value={`${number(profit.farmer_acres)} acres`} />
                  <Metric label="Yield / acre" value={`${number(profit.yield_per_acre_quintal)} q`} />
                  <Metric label="Total yield" value={`${number(profit.total_yield_quintal)} q`} />
                  <Metric label="Cost / acre" value={money(profit.cost_per_acre_inr)} />
                  <Metric label="Total cost" value={money(profit.total_cost_inr)} />
                  <Metric label="Location" value={`${profit.district}, ${profit.state}`} />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Scenario analysis
                  </p>
                  <h2 className="mt-1 text-xl font-bold">
                    Downside, expected and upside
                  </h2>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {selectedScenario.map((scenario) => (
                    <div
                      key={scenario.scenario}
                      className={`rounded-xl border p-4 ${scenarioClass(scenario.scenario)}`}
                    >
                      <p className="text-xs font-bold uppercase tracking-wider">
                        {scenario.scenario}
                      </p>
                      <p className="mt-3 text-2xl font-bold">
                        {money(scenario.gross_margin_inr)}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">Gross margin</p>

                      <div className="mt-4 space-y-2 text-xs text-slate-700">
                        <Row
                          label="Scenario price"
                          value={money(scenario.scenario_price_inr_per_quintal)}
                        />
                        <Row label="Revenue" value={money(scenario.revenue_inr)} />
                        <Row label="Total cost" value={money(scenario.total_cost_inr)} />
                        <Row
                          label="Break-even"
                          value={money(scenario.break_even_price_inr_per_quintal)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {selectedScenario.length === 0 && (
                  <p className="mt-5 text-sm text-slate-500">
                    No scenario records are available for this crop.
                  </p>
                )}
              </section>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-bold text-amber-900">
                Important: these are scenario calculations, not guaranteed profit.
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-800">
                Results depend on the displayed yield, cost and price assumptions.
                The current environment uses development/demo data and should not
                be treated as a live financial or agronomic forecast.
              </p>
            </div>
          </>
        )}
      </section>
    </PageContainer>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
