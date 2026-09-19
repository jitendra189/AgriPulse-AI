const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type ApiResponse<T> = {
  status: string;
  count: number;
  data: T[];
  disclaimer?: string;
};

async function apiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `AgriPulse API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/* ============================================================
   MARKET
   ============================================================ */

export async function getMarketForecasts(params?: {
  state?: string;
  district?: string;
  commodity?: string;
  horizon?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params?.state) query.set("state", params.state);
  if (params?.district) query.set("district", params.district);
  if (params?.commodity) query.set("commodity", params.commodity);
  if (params?.horizon !== undefined) {
    query.set("horizon", String(params.horizon));
  }

  query.set("limit", String(params?.limit ?? 180));

  return apiRequest<ApiResponse<Record<string, unknown>>>(
    `/api/market/forecasts?${query.toString()}`
  );
}

export async function getMonthlyMarketData(params?: {
  state?: string;
  district?: string;
  commodity?: string;
  market?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params?.state) query.set("state", params.state);
  if (params?.district) query.set("district", params.district);
  if (params?.commodity) query.set("commodity", params.commodity);
  if (params?.market) query.set("market", params.market);

  query.set("limit", String(params?.limit ?? 100));

  return apiRequest<ApiResponse<Record<string, unknown>>>(
    `/api/market/monthly?${query.toString()}`
  );
}

/* ============================================================
   WEATHER
   ============================================================ */

export async function getWeatherRisk(params?: {
  state?: string;
  district?: string;
  commodity?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params?.state) query.set("state", params.state);
  if (params?.district) query.set("district", params.district);
  if (params?.commodity) query.set("commodity", params.commodity);

  query.set("limit", String(params?.limit ?? 180));

  return apiRequest<ApiResponse<Record<string, unknown>>>(
    `/api/weather/risk?${query.toString()}`
  );
}

/* ============================================================
   FARMER INSIGHTS
   ============================================================ */

export async function getFarmerInsights(params?: {
  state?: string;
  district?: string;
  commodity?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params?.state) query.set("state", params.state);
  if (params?.district) query.set("district", params.district);
  if (params?.commodity) query.set("commodity", params.commodity);

  query.set("limit", String(params?.limit ?? 180));

  return apiRequest<ApiResponse<Record<string, unknown>>>(
    `/api/insights/?${query.toString()}`
  );
}

/* ============================================================
   CROP COMPARISON
   ============================================================ */

export async function getCropComparison(params?: {
  state?: string;
  district?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params?.state) query.set("state", params.state);
  if (params?.district) query.set("district", params.district);

  query.set("limit", String(params?.limit ?? 60));

  return apiRequest<ApiResponse<Record<string, unknown>>>(
    `/api/comparison/?${query.toString()}`
  );
}

/* ============================================================
   CROP SUITABILITY
   ============================================================ */

export async function getCropSuitability(params?: {
  state?: string;
  district?: string;
  commodity?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params?.state) query.set("state", params.state);
  if (params?.district) query.set("district", params.district);
  if (params?.commodity) query.set("commodity", params.commodity);

  query.set("limit", String(params?.limit ?? 5));

  return apiRequest<ApiResponse<Record<string, unknown>>>(
    `/api/suitability/?${query.toString()}`
  );
}

/* ============================================================
   FARMER DECISION
   ============================================================ */

export async function getFarmerDecision(params?: {
  state?: string;
  district?: string;
  commodity?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params?.state) query.set("state", params.state);
  if (params?.district) query.set("district", params.district);
  if (params?.commodity) query.set("commodity", params.commodity);

  query.set("limit", String(params?.limit ?? 5));

  return apiRequest<ApiResponse<Record<string, unknown>>>(
    `/api/decision/?${query.toString()}`
  );
}

/* ============================================================
   PROFIT SIMULATION
   ============================================================ */

export async function getProfitSimulation(params?: {
  state?: string;
  district?: string;
  commodity?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params?.state) query.set("state", params.state);
  if (params?.district) query.set("district", params.district);
  if (params?.commodity) query.set("commodity", params.commodity);

  query.set("limit", String(params?.limit ?? 5));

  return apiRequest<ApiResponse<Record<string, unknown>>>(
    `/api/profit/?${query.toString()}`
  );
}

/* ============================================================
   SCENARIO ANALYSIS
   ============================================================ */

export async function getScenarioAnalysis(params?: {
  state?: string;
  district?: string;
  commodity?: string;
  scenario?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params?.state) query.set("state", params.state);
  if (params?.district) query.set("district", params.district);
  if (params?.commodity) query.set("commodity", params.commodity);
  if (params?.scenario) query.set("scenario", params.scenario);

  query.set("limit", String(params?.limit ?? 15));

  return apiRequest<ApiResponse<Record<string, unknown>>>(
    `/api/scenarios/?${query.toString()}`
  );
}

/* ============================================================
   FARMER AI EXPLANATIONS
   ============================================================ */

export async function getFarmerExplanations(params?: {
  state?: string;
  district?: string;
  commodity?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params?.state) query.set("state", params.state);
  if (params?.district) query.set("district", params.district);
  if (params?.commodity) query.set("commodity", params.commodity);

  query.set("limit", String(params?.limit ?? 180));

  return apiRequest<ApiResponse<Record<string, unknown>>>(
    `/api/explanations/?${query.toString()}`
  );
}

/* ============================================================
   HEALTH
   ============================================================ */

export async function getApiHealth() {
  return apiRequest<Record<string, unknown>>("/health");
}