"use client";

import { useState } from "react";
import Link from "next/link";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  village: string;
  farmSize: string;
  irrigation: string;
  soilType: string;
  season: string;
  primaryCrop: string;
  forecastHorizon: string;
};

const initialProfile: ProfileData = {
  name: "AgriPulse Farmer",
  email: "farmer@example.com",
  phone: "+91 98765 43210",
  state: "Bihar",
  district: "Gaya",
  village: "Gaya",
  farmSize: "2",
  irrigation: "Available",
  soilType: "Loamy",
  season: "Kharif",
  primaryCrop: "Onion",
  forecastHorizon: "1 Month",
};

const stateDistricts: Record<string, string[]> = {
  Bihar: ["Gaya", "Patna", "Muzaffarpur", "Bhagalpur"],
  Jharkhand: ["Ranchi", "Dhanbad", "Jamshedpur", "Hazaribagh"],
  "West Bengal": ["Kolkata", "Burdwan", "Malda", "Siliguri"],
  Odisha: ["Bhubaneswar", "Cuttack", "Puri", "Sambalpur"],
};

const crops = ["Onion", "Potato", "Rice", "Tomato", "Wheat"];
const seasons = ["Kharif", "Rabi", "Zaid"];
const irrigationOptions = ["Available", "Not Available", "Partial"];
const soilTypes = ["Loamy", "Clay", "Sandy", "Silty", "Black Soil"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [draft, setDraft] = useState<ProfileData>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    market: true,
    weather: true,
    price: false,
  });

  const updateField = (field: keyof ProfileData, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "state") {
      const districts = stateDistricts[value] || [];
      setDraft((prev) => ({
        ...prev,
        state: value,
        district: districts[0] || "",
      }));
    }
  };

  const handleEdit = () => {
    setDraft(profile);
    setSaved(false);
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
    setSaved(false);
  };

  const handleSave = () => {
    setProfile(draft);
    setEditing(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const currentProfile = editing ? draft : profile;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              <span className="text-lg">←</span>
              Dashboard
            </Link>

            <span className="text-slate-300">/</span>

            <span className="text-sm font-semibold text-slate-900">
              Profile
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 sm:inline-flex">
              Development Demo
            </span>

            {!editing ? (
              <button
                onClick={handleEdit}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Success Message */}
        {saved && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 font-bold">
              ✓
            </span>

            <div>
              <p className="font-semibold">Profile updated successfully</p>
              <p className="text-xs text-emerald-700">
                Changes are currently stored only for this demo session.
              </p>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600" />

          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-emerald-100 text-3xl font-bold text-emerald-700 shadow-md">
                  {currentProfile.name.charAt(0).toUpperCase()}
                </div>

                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      {currentProfile.name}
                    </h1>

                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {currentProfile.email}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>
                      📍 {currentProfile.district}, {currentProfile.state}
                    </span>

                    <span className="hidden text-slate-300 sm:inline">
                      •
                    </span>

                    <span>🌱 {currentProfile.farmSize} acres</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Account Type
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Farmer / Demo Account
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Personal Information */}
            <ProfileSection
              title="Personal Information"
              description="Basic information associated with your AgriPulse account."
              icon="👤"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Full Name"
                  value={currentProfile.name}
                  editing={editing}
                  onChange={(value) => updateField("name", value)}
                />

                <Field
                  label="Email Address"
                  value={currentProfile.email}
                  type="email"
                  editing={editing}
                  onChange={(value) => updateField("email", value)}
                />

                <Field
                  label="Mobile Number"
                  value={currentProfile.phone}
                  editing={editing}
                  onChange={(value) => updateField("phone", value)}
                />

                <Field
                  label="Village / City"
                  value={currentProfile.village}
                  editing={editing}
                  onChange={(value) => updateField("village", value)}
                />
              </div>
            </ProfileSection>

            {/* Farm Information */}
            <ProfileSection
              title="Farm Information"
              description="Farm characteristics used to personalize agricultural insights."
              icon="🌾"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="State"
                  value={currentProfile.state}
                  options={Object.keys(stateDistricts)}
                  editing={editing}
                  onChange={(value) => updateField("state", value)}
                />

                <SelectField
                  label="District"
                  value={currentProfile.district}
                  options={stateDistricts[currentProfile.state] || []}
                  editing={editing}
                  onChange={(value) => updateField("district", value)}
                />

                <Field
                  label="Farm Size"
                  value={currentProfile.farmSize}
                  suffix="acres"
                  type="number"
                  editing={editing}
                  onChange={(value) => updateField("farmSize", value)}
                />

                <SelectField
                  label="Irrigation Availability"
                  value={currentProfile.irrigation}
                  options={irrigationOptions}
                  editing={editing}
                  onChange={(value) => updateField("irrigation", value)}
                />

                <SelectField
                  label="Soil Type"
                  value={currentProfile.soilType}
                  options={soilTypes}
                  editing={editing}
                  onChange={(value) => updateField("soilType", value)}
                />

                <SelectField
                  label="Current Season"
                  value={currentProfile.season}
                  options={seasons}
                  editing={editing}
                  onChange={(value) => updateField("season", value)}
                />
              </div>
            </ProfileSection>

            {/* Forecast Preferences */}
            <ProfileSection
              title="Forecast Preferences"
              description="Choose the default context used when viewing market intelligence."
              icon="📊"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Primary Crop"
                  value={currentProfile.primaryCrop}
                  options={crops}
                  editing={editing}
                  onChange={(value) => updateField("primaryCrop", value)}
                />

                <SelectField
                  label="Default Forecast Horizon"
                  value={currentProfile.forecastHorizon}
                  options={["1 Month", "2 Months", "3 Months"]}
                  editing={editing}
                  onChange={(value) =>
                    updateField("forecastHorizon", value)
                  }
                />
              </div>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <span className="mt-0.5">ℹ️</span>

                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Personalized dashboard context
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      These preferences are intended to control the default
                      market, weather, comparison, and insight views across
                      AgriPulse.
                    </p>
                  </div>
                </div>
              </div>
            </ProfileSection>

            {/* Notification Preferences */}
            <ProfileSection
              title="Decision-Support Notifications"
              description="Control which types of agricultural signals you want to receive."
              icon="🔔"
            >
              <div className="divide-y divide-slate-100">
                <PreferenceRow
                  title="Market Forecast Updates"
                  description="Receive updates when forecasted market conditions change."
                  enabled={notifications.market}
                  onToggle={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      market: !prev.market,
                    }))
                  }
                />

                <PreferenceRow
                  title="Weather Risk Alerts"
                  description="Receive contextual alerts for elevated weather-risk conditions."
                  enabled={notifications.weather}
                  onToggle={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      weather: !prev.weather,
                    }))
                  }
                />

                <PreferenceRow
                  title="Price Movement Alerts"
                  description="Track significant changes in expected crop prices."
                  enabled={notifications.price}
                  onToggle={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      price: !prev.price,
                    }))
                  }
                />
              </div>
            </ProfileSection>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Farm Snapshot */}
            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Farm Snapshot
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    Current Profile
                  </h2>
                </div>

                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-lg">
                  🌱
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <SnapshotItem
                  label="Location"
                  value={`${currentProfile.district}, ${currentProfile.state}`}
                />

                <SnapshotItem
                  label="Farm Size"
                  value={`${currentProfile.farmSize} acres`}
                />

                <SnapshotItem
                  label="Irrigation"
                  value={currentProfile.irrigation}
                />

                <SnapshotItem
                  label="Soil"
                  value={currentProfile.soilType}
                />

                <SnapshotItem
                  label="Season"
                  value={currentProfile.season}
                />

                <SnapshotItem
                  label="Primary Crop"
                  value={currentProfile.primaryCrop}
                />
              </div>
            </aside>

            {/* Data Status */}
            <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg">
                  ⚠️
                </div>

                <div>
                  <h3 className="text-sm font-bold text-amber-900">
                    Development Data
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-amber-800">
                    This AgriPulse environment currently uses development/demo
                    data. It should not be interpreted as a live agricultural
                    data service.
                  </p>
                </div>
              </div>
            </aside>

            {/* Responsible AI */}
            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                  🛡️
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Responsible AI
                  </h3>

                  <p className="text-xs text-slate-500">
                    How AgriPulse presents intelligence
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <InfoPoint text="Forecasts are estimates, not guaranteed outcomes." />
                <InfoPoint text="Weather information is presented as contextual risk." />
                <InfoPoint text="Profit simulations depend on user-provided assumptions." />
                <InfoPoint text="AI-generated explanations do not create numerical forecasts." />
              </div>
            </aside>

            {/* Account Actions */}
            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">
                Account & Security
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Manage your account access and session.
              </p>

              <div className="mt-4 space-y-2">
                <button className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  <span>Change Password</span>
                  <span className="text-slate-400">→</span>
                </button>

                <button className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  <span>Sign Out</span>
                  <span className="text-slate-400">→</span>
                </button>

                <button className="mt-2 w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50">
                  Delete Account
                </button>
              </div>
            </aside>
          </div>
        </div>

        {/* Footer Information */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              AgriPulse AI • Agricultural Market Intelligence Platform
            </p>

            <p>
              Forecasts are decision-support estimates and not guarantees.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable Components                                                        */
/* -------------------------------------------------------------------------- */

function ProfileSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg">
            {icon}
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  type = "text",
  suffix,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  suffix?: string;
  editing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      {editing ? (
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />

          {suffix && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
              {suffix}
            </span>
          )}
        </div>
      ) : (
        <div className="min-h-[42px] rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800">
          {value || "Not provided"}
          {suffix && (
            <span className="ml-1 text-xs font-normal text-slate-400">
              {suffix}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  editing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      {editing ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <div className="min-h-[42px] rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800">
          {value || "Not provided"}
        </div>
      )}
    </div>
  );
}

function SnapshotItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-medium text-slate-500">{label}</span>

      <span className="text-right text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>

        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={`${title} ${enabled ? "enabled" : "disabled"}`}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-emerald-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function InfoPoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
        ✓
      </span>

      <p className="text-xs leading-5 text-slate-600">{text}</p>
    </div>
  );
}