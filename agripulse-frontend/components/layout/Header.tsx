"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
  const router = useRouter();

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

        {/* User / Profile */}
        <Link
          href="/profile"
          aria-label="Open farmer profile"
          className="group flex items-center gap-3 border-l border-slate-200 pl-4"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 transition group-hover:bg-emerald-200">
            F
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 transition group-hover:text-emerald-700">
              Farmer Dashboard
            </p>
            <p className="text-[11px] text-slate-500">
              View & edit profile
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("agripulse_auth");
            sessionStorage.removeItem("agripulse_auth");
            localStorage.removeItem("agripulse-global-filters");
            router.push("/login");
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}