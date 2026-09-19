"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "AgriPulse AI",
  "/dashboard": "Agricultural Intelligence Dashboard",
  "/market": "Market Forecast",
  "/comparison": "Crop Comparison",
  "/weather": "Weather Risk",
  "/profit": "Profit Simulator",
  "/insights": "Farmer Insights",
};

export default function Header() {
  const pathname = usePathname();

  const title =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(
      ([path]) => path !== "/" && pathname.startsWith(path)
    )?.[1] ||
    "Agricultural Intelligence";

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      {/* Page title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Data-driven agricultural market decision support
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Demo data status */}
        <div className="hidden items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-amber-500" />

          <span className="text-xs font-medium text-amber-700">
            Development Data
          </span>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            F
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">
              Farmer Dashboard
            </p>
            <p className="text-[11px] text-slate-500">
              Decision Support
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}