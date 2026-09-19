"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: "⌂",
  },
  {
    name: "Market Forecast",
    href: "/market",
    icon: "↗",
  },
  {
    name: "Crop Comparison",
    href: "/comparison",
    icon: "▦",
  },
  {
    name: "Weather Risk",
    href: "/weather",
    icon: "☁",
  },
  {
    name: "Profit Simulator",
    href: "/profit",
    icon: "₹",
  },
  {
    name: "Farmer Insights",
    href: "/insights",
    icon: "✦",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-slate-200 px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white shadow-sm">
            🌱
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              AgriPulse
            </h1>
            <p className="text-xs text-slate-500">AI Agriculture Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Intelligence
        </p>

        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                }`}
              >
                {item.icon}
              </span>

              <span>{item.name}</span>

              {isActive && (
                <span className="ml-auto h-2 w-2 rounded-full bg-emerald-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Data status */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-700">
              System Online
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-500">
            Agricultural intelligence and decision-support services are
            available.
          </p>
        </div>
      </div>
    </aside>
  );
}