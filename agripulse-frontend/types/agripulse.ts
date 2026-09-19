export type Signal =
  | "RISING"
  | "FALLING"
  | "STABLE"
  | string;

export type WeatherRiskLevel =
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "UNAVAILABLE"
  | string;

export type Forecast = {
  state: string;
  district: string;
  market: string | null;
  commodity: string;
  forecast_horizon_months: number;
  current_price: number;
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
  signal: Signal;
  percentage_change?: number;
};

export type MonthlyMarket = {
  state: string;
  district: string;
  market: string | null;
  commodity: string;
  arrival_date?: string;
  avg_min_price: number;
  avg_max_price: number;
  avg_modal_price: number;
  min_modal_price: number;
  max_modal_price: number;
  median_modal_price: number;
  std_modal_price: number;
  observation_count: number;
};

export type WeatherRisk = {
  state: string;
  district: string;
  market?: string | null;
  commodity: string;
  weather_risk_level: WeatherRiskLevel;
  weather_risk_score: number;
  rainfall_total_mm: number;
  rainy_days: number;
  heavy_rain_days: number;
  extreme_rain_days: number;
  max_rainfall_mm: number;
  temperature_mean_c: number;
  weather_data_status: string;
};

export type FarmerInsight = {
  state: string;
  district: string;
  market?: string | null;
  commodity: string;
  market_signal: Signal;
  weather_risk_level: WeatherRiskLevel;
  uncertainty_level: string;
  farmer_explanation: string;
  profit_scenario_available: string;
  explanation_type: string;
  numerical_prediction_source: string;
  weather_context_source: string;
  economic_scenario_source: string;
  llm_status: string;
  guarantee_status: string;
  data_status: string;
  provenance_note: string;
};

export type CropComparison = {
  state: string;
  district: string;
  market?: string | null;
  commodity: string;
  forecast_1m: number;
  forecast_2m: number;
  forecast_3m: number;
  trajectory: string;
  multi_horizon_signal: string;
  suitability_status?: string;
  profitability_status?: string;
};

export type CropSuitability = {
  state: string;
  district: string;
  commodity: string;
  farmer_location?: string;
  acres?: number;
  irrigation?: string;
  soil_type?: string;
  season?: string;
  suitability_class: string;
  suitability_reason?: string;
  suitability_data_status?: string;
};

export type FarmerDecision = {
  state: string;
  district: string;
  commodity: string;
  decision_support_status: string;
  recommendation_policy: string;
  market_signal?: string;
  weather_risk_level?: string;
  suitability_class?: string;
  profitability_status?: string;
  decision_note?: string;
};

export type ProfitSimulation = {
  state: string;
  district: string;
  market?: string | null;
  commodity: string;
  acres: number;
  yield_quintals_per_acre?: number;
  total_yield_quintals: number;
  cost_per_acre?: number;
  total_cost: number;
  expected_price: number;
  expected_revenue: number;
  expected_gross_margin: number;
  break_even_price: number;
  economic_assumption_status?: string;
  profitability_data_status?: string;
};

export type Scenario = {
  state?: string;
  district?: string;
  market?: string | null;
  commodity: string;
  scenario: "DOWNSIDE" | "EXPECTED" | "UPSIDE" | string;
  scenario_price: number;
  yield_quintals_per_acre?: number;
  total_yield_quintals: number;
  cost_per_acre?: number;
  total_cost: number;
  revenue: number;
  gross_margin: number;
  break_even_price: number;
};

export type FarmerExplanation = {
  state: string;
  district: string;
  market?: string | null;
  commodity: string;
  market_signal: Signal;
  weather_risk_level: WeatherRiskLevel;
  uncertainty_level: string;
  farmer_explanation: string;
  profit_scenario_available: string;
  explanation_type: string;
  numerical_prediction_source: string;
  weather_context_source: string;
  economic_scenario_source: string;
  llm_status: string;
  guarantee_status: string;
  data_status: string;
  provenance_note: string;
};

export type ApiEnvelope<T> = {
  status: string;
  count: number;
  data: T[];
  disclaimer?: string;
};

export type ApiHealthDataset = {
  status: string;
  rows: number;
  columns: number;
};

export type ApiHealth = {
  status: string;
  storage: string;
  datasets: Record<string, ApiHealthDataset>;
};