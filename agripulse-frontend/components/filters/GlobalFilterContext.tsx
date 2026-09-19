"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type GlobalFilters = {
  state: string;
  district: string;
  crop: string;
  horizon: number;
};

type GlobalFilterContextType = GlobalFilters & {
  setState: (state: string) => void;
  setDistrict: (district: string) => void;
  setCrop: (crop: string) => void;
  setHorizon: (horizon: number) => void;
  resetFilters: () => void;
};

type ProfileResponse = {
  state: string | null;
  district: string | null;
  primary_crop: string | null;
  forecast_horizon: string | null;
};

const DEFAULT_FILTERS: GlobalFilters = {
  state: "ALL",
  district: "ALL",
  crop: "Onion",
  horizon: 1,
};

const STORAGE_KEY = "agripulse-global-filters";
const AUTH_STORAGE_KEY = "agripulse_auth";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const GlobalFilterContext =
  createContext<GlobalFilterContextType | undefined>(
    undefined
  );

function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedAuth =
    localStorage.getItem(AUTH_STORAGE_KEY) ||
    sessionStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedAuth) {
    return null;
  }

  try {
    const authData = JSON.parse(storedAuth);

    return authData?.accessToken || null;
  } catch (error) {
    console.error(
      "Failed to read AgriPulse authentication data:",
      error
    );

    return null;
  }
}

function convertHorizonToNumber(
  horizon: string | null
): number {
  if (horizon === "2 Month") {
    return 2;
  }

  if (horizon === "3 Month") {
    return 3;
  }

  return 1;
}

function isValidProfileFilterValue(
  value: string | null
): boolean {
  return (
    typeof value === "string" &&
    value.trim() !== ""
  );
}

export function GlobalFilterProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [filters, setFilters] =
    useState<GlobalFilters>(DEFAULT_FILTERS);

  const [hydrated, setHydrated] =
    useState(false);

  /*
   * Restore existing filters first.
   *
   * If the farmer already has saved dashboard filters,
   * we respect those choices.
   *
   * Otherwise, we load their authenticated profile
   * and use the profile preferences as the initial context.
   */
  useEffect(() => {
    async function initializeFilters() {
      let hasSavedFilters = false;

      try {
        const savedFilters =
          localStorage.getItem(STORAGE_KEY);

        if (savedFilters) {
          const parsed =
            JSON.parse(savedFilters);

          if (
            parsed &&
            typeof parsed === "object"
          ) {
            hasSavedFilters = true;

            setFilters({
              state:
                typeof parsed.state === "string"
                  ? parsed.state
                  : DEFAULT_FILTERS.state,

              district:
                typeof parsed.district === "string"
                  ? parsed.district
                  : DEFAULT_FILTERS.district,

              crop:
                typeof parsed.crop === "string"
                  ? parsed.crop
                  : DEFAULT_FILTERS.crop,

              horizon:
                typeof parsed.horizon === "number"
                  ? parsed.horizon
                  : DEFAULT_FILTERS.horizon,
            });
          }
        }
      } catch (error) {
        console.error(
          "Failed to restore AgriPulse filters:",
          error
        );
      }

      /*
       * Only use profile preferences when there is
       * no previously saved filter state.
       */
      if (!hasSavedFilters) {
        try {
          const token = getStoredToken();

          if (token) {
            const response = await fetch(
              `${API_BASE_URL}/api/auth/me`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const profile: ProfileResponse =
                await response.json();

              const profileState =
                isValidProfileFilterValue(
                  profile.state
                )
                  ? profile.state!
                  : DEFAULT_FILTERS.state;

              const profileDistrict =
                isValidProfileFilterValue(
                  profile.district
                )
                  ? profile.district!
                  : DEFAULT_FILTERS.district;

              const profileCrop =
                isValidProfileFilterValue(
                  profile.primary_crop
                )
                  ? profile.primary_crop!
                  : DEFAULT_FILTERS.crop;

              const profileHorizon =
                convertHorizonToNumber(
                  profile.forecast_horizon
                );

              setFilters({
                state: profileState,
                district:
                  profileState === "ALL"
                    ? "ALL"
                    : profileDistrict,
                crop: profileCrop,
                horizon: profileHorizon,
              });
            }
          }
        } catch (error) {
          /*
           * Profile loading should never prevent
           * the dashboard from working.
           */
          console.error(
            "Failed to load profile preferences:",
            error
          );
        }
      }

      setHydrated(true);
    }

    initializeFilters();
  }, []);

  /*
   * Save filters whenever they change.
   */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(filters)
      );
    } catch (error) {
      console.error(
        "Failed to save AgriPulse filters:",
        error
      );
    }
  }, [filters, hydrated]);

  /*
   * Changing state resets district.
   */
  function setState(state: string) {
    setFilters((current) => ({
      ...current,
      state,
      district: "ALL",
    }));
  }

  function setDistrict(district: string) {
    setFilters((current) => ({
      ...current,
      district,
    }));
  }

  function setCrop(crop: string) {
    setFilters((current) => ({
      ...current,
      crop,
    }));
  }

  function setHorizon(horizon: number) {
    setFilters((current) => ({
      ...current,
      horizon,
    }));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <GlobalFilterContext.Provider
      value={{
        ...filters,
        setState,
        setDistrict,
        setCrop,
        setHorizon,
        resetFilters,
      }}
    >
      {children}
    </GlobalFilterContext.Provider>
  );
}

export function useGlobalFilters() {
  const context =
    useContext(GlobalFilterContext);

  if (!context) {
    throw new Error(
      "useGlobalFilters must be used inside GlobalFilterProvider."
    );
  }

  return context;
}