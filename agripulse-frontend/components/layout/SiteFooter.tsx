"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const APP_ROUTES = [
  "/dashboard",
  "/market",
  "/comparison",
  "/weather",
  "/profit",
  "/insights",
  "/profile",
];

export default function SiteFooter() {
  const pathname = usePathname();
  const isAppPage = APP_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  return (
    <footer
      className={
        isAppPage
          ? "border-t border-slate-200 bg-slate-950 text-slate-300 lg:ml-64"
          : "border-t border-slate-200 bg-slate-950 text-slate-300"
      }
    >
      <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg text-white">
                🌱
              </div>
              <div>
                <p className="text-lg font-bold text-white">AgriPulse AI</p>
                <p className="text-xs text-slate-400">
                  Agricultural market intelligence
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
              A hackathon decision-support prototype that brings market
              forecasts, weather-risk context, crop suitability and economic
              scenarios into one farmer-focused workspace.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
              Explore
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              {[
                ["Dashboard", "/dashboard"],
                ["Market Forecast", "/market"],
                ["Crop Comparison", "/comparison"],
                ["Weather Risk", "/weather"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="w-fit text-slate-400 transition hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
              Decision tools
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              {[
                ["Profit Simulator", "/profit"],
                ["Farmer Insights", "/insights"],
                ["Farmer Profile", "/profile"],
                ["Home", "/"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="w-fit text-slate-400 transition hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6">
          <div className="flex flex-col gap-3 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} AgriPulse AI · Built as a hackathon
              prototype.
            </p>
            <p className="max-w-3xl sm:text-right">
              Demo Data Notice: this prototype uses validated development
              datasets to demonstrate the intelligence pipeline. Production
              deployment should connect verified live agricultural and weather
              data sources.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
