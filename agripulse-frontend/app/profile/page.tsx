"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

const STATES = [
  "Bihar",
  "Jharkhand",
  "West Bengal",
  "Odisha",
];

const DISTRICTS: Record<string, string[]> = {
  Bihar: [
    "Gaya",
    "Patna",
    "Muzaffarpur",
    "Bhagalpur",
  ],
  Jharkhand: [
    "Ranchi",
    "Dhanbad",
    "Jamshedpur",
    "Hazaribagh",
  ],
  "West Bengal": [
    "Kolkata",
    "Howrah",
    "Darjeeling",
    "Malda",
  ],
  Odisha: [
    "Bhubaneswar",
    "Cuttack",
    "Puri",
    "Sambalpur",
  ],
};

const CROPS = [
  "Onion",
  "Potato",
  "Rice",
  "Tomato",
  "Wheat",
];

const SOIL_TYPES = [
  "LOAMY",
  "CLAYEY",
  "SANDY",
  "BLACK",
  "ALLUVIAL",
  "OTHER",
];

const SEASONS = [
  "KHARIF",
  "RABI",
  "ZAID",
];

const HORIZONS = [
  "1 Month",
  "2 Month",
  "3 Month",
];

type ProfileData = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  village: string | null;
  state: string | null;
  district: string | null;
  farm_size: number | null;
  irrigation: string | null;
  soil_type: string | null;
  season: string | null;
  primary_crop: string | null;
  forecast_horizon: string;
};

function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedAuth =
    localStorage.getItem("agripulse_auth") ||
    sessionStorage.getItem("agripulse_auth");

  if (!storedAuth) {
    return null;
  }

  try {
    const authData = JSON.parse(storedAuth);

    return authData?.accessToken || null;
  } catch (error) {
    console.error(
      "Unable to read authentication data:",
      error
    );

    return null;
  }
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [saved, setSaved] = useState(false);

  const [error, setError] = useState("");

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [village, setVillage] = useState("");

  const [state, setState] = useState("");

  const [district, setDistrict] = useState("");

  const [acres, setAcres] = useState("");

  const [irrigation, setIrrigation] = useState("");

  const [soil, setSoil] = useState("");

  const [season, setSeason] = useState("");

  const [defaultCrop, setDefaultCrop] = useState("");

  const [horizon, setHorizon] = useState("1 Month");

  const districts = DISTRICTS[state] || [];

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const token = getAuthToken();

        if (!token) {
          setError(
            "You are not logged in. Please log in again."
          );
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            setError(
              "Your session has expired. Please log in again."
            );
          } else {
            setError(
              "Unable to load your profile."
            );
          }

          setLoading(false);
          return;
        }

        const data: ProfileData =
          await response.json();

        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setVillage(data.village || "");
        setState(data.state || "");
        setDistrict(data.district || "");
        setAcres(
          data.farm_size !== null &&
          data.farm_size !== undefined
            ? String(data.farm_size)
            : ""
        );
        setIrrigation(data.irrigation || "");
        setSoil(data.soil_type || "");
        setSeason(data.season || "");
        setDefaultCrop(data.primary_crop || "");
        setHorizon(
          data.forecast_horizon || "1 Month"
        );
      } catch (err) {
        console.error(err);

        setError(
          "Could not connect to the AgriPulse backend."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleStateChange(
    value: string
  ) {
    setState(value);

    const availableDistricts =
      DISTRICTS[value] || [];

    if (
      !availableDistricts.includes(
        district
      )
    ) {
      setDistrict(
        availableDistricts[0] || ""
      );
    }
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const token = getAuthToken();

      if (!token) {
        setError(
          "Your session has expired. Please log in again."
        );
        return;
      }

      const farmSizeValue =
        acres.trim() === ""
          ? null
          : Number(acres);

      if (
        farmSizeValue !== null &&
        (!Number.isFinite(
          farmSizeValue
        ) ||
          farmSizeValue < 0)
      ) {
        setError(
          "Please enter a valid farm size."
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/auth/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            phone:
              phone.trim() || null,
            village:
              village.trim() || null,
            state:
              state || null,
            district:
              district || null,
            farm_size:
              farmSizeValue,
            irrigation:
              irrigation || null,
            soil_type:
              soil || null,
            season:
              season || null,
            primary_crop:
              defaultCrop || null,
            forecast_horizon:
              horizon,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.detail ||
            "Unable to save your profile."
        );
        return;
      }

      setName(data.name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setVillage(data.village || "");
      setState(data.state || "");
      setDistrict(data.district || "");
      setAcres(
        data.farm_size !== null &&
        data.farm_size !== undefined
          ? String(data.farm_size)
          : ""
      );
      setIrrigation(data.irrigation || "");
      setSoil(data.soil_type || "");
      setSeason(data.season || "");
      setDefaultCrop(
        data.primary_crop || ""
      );
      setHorizon(
        data.forecast_horizon ||
          "1 Month"
      );

      setSaved(true);
      setEditing(false);

      window.setTimeout(() => {
        setSaved(false);
      }, 3500);
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to the AgriPulse backend."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f3] text-slate-900">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />

          <p className="mt-4 text-sm font-bold text-[#123d2b]">
            Loading your profile...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Fetching your account information.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7f3] text-slate-900">

      {/* NAVBAR */}

      <nav className="border-b border-slate-200/70 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">

          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123d2b] text-lg text-white">
              🌱
            </div>

            <div>

              <p className="text-lg font-bold tracking-tight text-[#123d2b]">
                AgriPulse
              </p>

              <p className="-mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-600">
                AI
              </p>

            </div>

          </Link>

          <div className="flex items-center gap-2">

            <Link
              href="/dashboard"
              className="rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-[#123d2b] sm:px-4"
            >
              Dashboard
            </Link>

            <Link
              href="/"
              className="rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-[#123d2b] sm:px-4"
            >
              Home
            </Link>

          </div>

        </div>

      </nav>

      {/* PAGE */}

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
              Account settings
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#123d2b] sm:text-4xl">
              Farmer Profile
            </h1>

            <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-400">
              Manage your personal and farm context used to
              organize AgriPulse decision-support information.
            </p>

          </div>

          <div className="flex gap-2">

            {!editing && (

              <button
                type="button"
                onClick={() => {
                  setSaved(false);
                  setError("");
                  setEditing(true);
                }}
                className="rounded-xl bg-[#123d2b] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#0d3022]"
              >
                Edit profile
              </button>

            )}

            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              ← Dashboard
            </Link>

          </div>

        </div>

        {/* ERROR */}

        {error && (

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

            <div className="flex items-start gap-3">

              <span className="text-sm">
                ⚠️
              </span>

              <div>

                <p className="text-xs font-bold text-red-800">
                  Profile error
                </p>

                <p className="mt-1 text-[10px] leading-5 text-red-700">
                  {error}
                </p>

              </div>

            </div>

          </div>

        )}

        {/* SUCCESS */}

        {saved && (

          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">

            <div className="flex items-start gap-3">

              <span className="text-sm">
                ✓
              </span>

              <div>

                <p className="text-xs font-bold text-emerald-800">
                  Profile changes saved
                </p>

                <p className="mt-1 text-[10px] leading-5 text-emerald-700">
                  Your profile has been updated successfully.
                </p>

              </div>

            </div>

          </div>

        )}

        <form
          onSubmit={handleSave}
          className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]"
        >

          {/* PROFILE SUMMARY */}

          <aside className="space-y-6">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#123d2b] text-2xl text-white">
                  👨‍🌾
                </div>

                <div className="min-w-0">

                  <p className="truncate text-lg font-bold text-slate-900">
                    {name || "Your name"}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-400">
                    {email || "Your email"}
                  </p>

                </div>

              </div>

              <div className="mt-6 rounded-xl bg-[#f5f7f3] p-4">

                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Farm location
                </p>

                <p className="mt-2 text-sm font-bold text-slate-800">
                  {district || "—"}
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {state || "—"}
                </p>

              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">

                <ProfileStat
                  label="Land"
                  value={
                    acres
                      ? `${acres} ac`
                      : "—"
                  }
                />

                <ProfileStat
                  label="Crop"
                  value={
                    defaultCrop || "—"
                  }
                />

                <ProfileStat
                  label="Season"
                  value={
                    season || "—"
                  }
                />

                <ProfileStat
                  label="Horizon"
                  value={
                    horizon || "—"
                  }
                />

              </div>

            </div>

            {/* PROFILE STATUS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Profile status
              </p>

              <div className="mt-4 flex items-center justify-between">

                <span className="text-xs font-semibold text-slate-600">
                  Profile completion
                </span>

                <span className="text-xs font-bold text-emerald-700">
                  {getProfileCompletion({
                    name,
                    email,
                    phone,
                    village,
                    state,
                    district,
                    acres,
                    irrigation,
                    soil,
                    season,
                    defaultCrop,
                    horizon,
                  })}
                  %
                </span>

              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${getProfileCompletion({
                      name,
                      email,
                      phone,
                      village,
                      state,
                      district,
                      acres,
                      irrigation,
                      soil,
                      season,
                      defaultCrop,
                      horizon,
                    })}%`,
                  }}
                />

              </div>

              <p className="mt-4 text-[10px] leading-5 text-slate-400">
                Your profile information is now connected to
                your authenticated AgriPulse account.
              </p>

            </div>

          </aside>

          {/* PROFILE FORM */}

          <div className="space-y-6">

            {/* PERSONAL */}

            <ProfileSection
              title="Personal information"
              eyebrow="Account"
              description="Basic information associated with your AgriPulse account."
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <Field
                  label="Full name"
                  value={name}
                  onChange={setName}
                  disabled={!editing}
                />

                <Field
                  label="Email address"
                  value={email}
                  onChange={setEmail}
                  type="email"
                  disabled
                />

                <Field
                  label="Phone number"
                  value={phone}
                  onChange={setPhone}
                  disabled={!editing}
                />

                <Field
                  label="Village"
                  value={village}
                  onChange={setVillage}
                  disabled={!editing}
                />

              </div>

            </ProfileSection>

            {/* LOCATION */}

            <ProfileSection
              title="Farm location"
              eyebrow="Location"
              description="Your selected market region for agricultural intelligence."
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <SelectField
                  label="State"
                  value={state}
                  options={[
                    "",
                    ...STATES,
                  ]}
                  onChange={
                    handleStateChange
                  }
                  disabled={!editing}
                />

                <SelectField
                  label="District"
                  value={district}
                  options={
                    state
                      ? districts
                      : [""]
                  }
                  onChange={setDistrict}
                  disabled={
                    !editing ||
                    !state
                  }
                />

              </div>

            </ProfileSection>

            {/* FARM */}

            <ProfileSection
              title="Farm information"
              eyebrow="Agriculture"
              description="Farm context used for future personalization and scenario analysis."
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <Field
                  label="Land area (acres)"
                  value={acres}
                  onChange={setAcres}
                  type="number"
                  disabled={!editing}
                />

                <SelectField
                  label="Irrigation"
                  value={irrigation}
                  options={[
                    "",
                    "AVAILABLE",
                    "LIMITED",
                    "NOT_AVAILABLE",
                  ]}
                  onChange={
                    setIrrigation
                  }
                  disabled={!editing}
                />

                <SelectField
                  label="Soil type"
                  value={soil}
                  options={[
                    "",
                    ...SOIL_TYPES,
                  ]}
                  onChange={setSoil}
                  disabled={!editing}
                />

                <SelectField
                  label="Primary farming season"
                  value={season}
                  options={[
                    "",
                    ...SEASONS,
                  ]}
                  onChange={setSeason}
                  disabled={!editing}
                />

              </div>

            </ProfileSection>

            {/* PREFERENCES */}

            <ProfileSection
              title="Decision-support preferences"
              eyebrow="Preferences"
              description="Choose the crop and forecast horizon you want to see by default."
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <SelectField
                  label="Default crop"
                  value={defaultCrop}
                  options={[
                    "",
                    ...CROPS,
                  ]}
                  onChange={
                    setDefaultCrop
                  }
                  disabled={!editing}
                />

                <SelectField
                  label="Default forecast"
                  value={horizon}
                  options={HORIZONS}
                  onChange={setHorizon}
                  disabled={!editing}
                />

              </div>

              <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">

                <div className="flex items-start gap-3">

                  <span className="text-sm">
                    💡
                  </span>

                  <div>

                    <p className="text-[10px] font-bold text-emerald-800">
                      Personalization
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-emerald-700">
                      These preferences organize your AgriPulse
                      dashboard context. They do not automatically
                      determine which crop you should grow.
                    </p>

                  </div>

                </div>

              </div>

            </ProfileSection>

            {/* RESPONSIBLE AI */}

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-sm">
                  🛡️
                </div>

                <div>

                  <p className="text-xs font-bold text-amber-900">
                    Responsible decision support
                  </p>

                  <p className="mt-2 text-[10px] leading-5 text-amber-800/70">
                    Your profile helps organize information,
                    but AgriPulse does not guarantee market prices,
                    crop yields, revenue or profit. Suitability,
                    market forecasts and economic scenarios remain
                    separate decision-support layers.
                  </p>

                </div>

              </div>

            </div>

            {/* ACTIONS */}

            {editing && (

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setEditing(false)
                  }
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#123d2b] px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#0d3022] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : "Save profile"}
                </button>

              </div>

            )}

          </div>

        </form>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center">

        <p className="text-[9px] text-slate-400">
          AgriPulse AI · Agricultural Market Intelligence · Development Demo
        </p>

      </footer>

    </main>
  );
}

/* =========================================================
   PROFILE COMPLETION
========================================================= */

function getProfileCompletion({
  name,
  email,
  phone,
  village,
  state,
  district,
  acres,
  irrigation,
  soil,
  season,
  defaultCrop,
  horizon,
}: {
  name: string;
  email: string;
  phone: string;
  village: string;
  state: string;
  district: string;
  acres: string;
  irrigation: string;
  soil: string;
  season: string;
  defaultCrop: string;
  horizon: string;
}) {
  const fields = [
    name,
    email,
    phone,
    village,
    state,
    district,
    acres,
    irrigation,
    soil,
    season,
    defaultCrop,
    horizon,
  ];

  const completed =
    fields.filter(
      (value) =>
        value.trim() !== ""
    ).length;

  return Math.round(
    (completed / fields.length) * 100
  );
}

/* =========================================================
   PROFILE SECTION
========================================================= */

function ProfileSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

      <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-lg font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-[10px] leading-5 text-slate-400">
        {description}
      </p>

      <div className="mt-6">
        {children}
      </div>

    </section>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
      />

    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </label>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
      >

        {options.map(
          (option) => (
            <option
              key={option || "empty"}
              value={option}
            >
              {option || "Select"}
            </option>
          )
        )}

      </select>

    </div>
  );
}

/* =========================================================
   PROFILE STAT
========================================================= */

function ProfileStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">

      <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold text-slate-700">
        {value}
      </p>

    </div>
  );
}