# AgriPulse AI — Hackathon Presentation & Live Demo Script

> **Tagline:** See the market before you sow.  
> **Presenter:** Single presenter  
> **Recommended duration:** 10–12 minutes  
> **Format:** Professional spoken script + live-demo directions + technical explanation + judge Q&A

---

## How to use this script

Everything under **SAY:** is spoken aloud. Everything under **ACTION:** is a demo instruction.

The presentation should communicate one coherent story:

**Farmer problem → AgriPulse solution → live product → ML/data pipeline → decision support → limitations → production vision.**

The goal is not to claim that the system can perfectly predict agriculture. The goal is to demonstrate a technically grounded decision-support system that helps a farmer understand possible future market conditions before committing land, money and time.

> **Important data disclosure:** The current hackathon implementation uses validated development/demo datasets. Current development metrics must not be presented as live national agricultural accuracy. Production deployment would connect verified real-world agricultural and weather sources.

---

# 1. Opening — Start With the Farmer

### ACTION
Open the AgriPulse landing page.

### SAY

Imagine I give a farmer two acres of land and ask one simple question:

**"What should you cultivate this season?"**

The farmer might look at today's mandi price, previous experience, local demand, weather expectations, input costs and what other farmers are cultivating.

But there is a fundamental problem.

**The farmer makes the decision today, while the economic outcome arrives months later.**

Suppose today's onion price is ₹3,500 per quintal.

It may look attractive today.

But what happens if the price falls by the time the crop is ready?

By then, the farmer may already have invested in seeds, fertilizer, labour, irrigation and land.

So the real question is not simply:

**"What is the price today?"**

The real question is:

**"What could the market look like when my crop is ready, and what could that mean for my farm?"**

That is the problem we set out to address with **AgriPulse AI**.

**AgriPulse AI — See the market before you sow.**

---

# 2. Introduce AgriPulse AI

### ACTION
Show the landing page and briefly point to the major product areas.

### SAY

AgriPulse AI is an agricultural market-intelligence and farmer decision-support platform.

The idea is simple.

We start with historical agricultural market behaviour.

We transform that history into time-series features.

We use a machine-learning model to estimate future market prices for one, two and three months ahead.

Then we put that forecast into context using weather-risk information, farmer profile data, crop suitability, profit calculations and scenario analysis.

So the farmer doesn't receive only a number.

The farmer receives a decision picture:

**What is happening now?**

**What could happen next?**

**What risks should I consider?**

**What happens if conditions become better or worse?**

And most importantly:

**How does all of this relate to my own farm?**

---

# 3. Our Core Principle

### SAY

There is one principle behind the entire product.

**AgriPulse does not claim to know the future with certainty.**

Agriculture is affected by uncertainty, weather, supply, demand, market behaviour and events that historical data cannot always anticipate.

So instead of saying:

> "This is exactly what will happen."

we communicate an estimate, its context and alternative scenarios.

We are not trying to replace the farmer's judgement.

**We are trying to improve the information available before the farmer makes the decision.**

---

# 4. Farmer Profile

### ACTION
Click Profile.

### SAY

Let's experience the product from the farmer's perspective.

AgriPulse begins with the farmer profile.

Here we capture information such as:

- State
- District
- Land area
- Irrigation availability
- Soil type
- Season
- Primary crop
- Forecast horizon

For this demonstration, we have a sample farmer with a defined location, farm size, irrigation condition, soil and crop preference.

This matters because agricultural decisions are not generic.

A crop can have an attractive market outlook but still be unsuitable for a particular farm.

The profile therefore provides context for the suitability, economic and decision-support layers.

### IF ASKED

The profile does not magically change the underlying Random Forest forecast. The market forecast comes from the forecasting pipeline. The profile helps personalise filtering, suitability, assumptions and interpretation.

---

# 5. Dashboard — The Farmer's Intelligence View

### ACTION
Click Dashboard.

### SAY

This is the main AgriPulse intelligence dashboard.

The farmer can select:

**State → District → Crop → Forecast Horizon.**

### ACTION
Change the filters slowly and show that the interface responds.

### SAY

Once the market context is selected, AgriPulse brings several signals together.

### ACTION
Point to current price.

First, we show the current observed market price.

### ACTION
Point to forecast.

Then we show the estimated future market price for the selected horizon.

### ACTION
Point to market signal.

From the relationship between the current price and forecast, we derive a simple market signal such as **Rising, Falling or Stable**.

### ACTION
Point to weather risk.

And separately, we show contextual weather risk.

So instead of asking the farmer to interpret one isolated number, AgriPulse presents the current market, a possible future direction and contextual risk together.

---

# 6. Scenario Analysis — Why One Number Is Not Enough

### ACTION
Scroll to the Dashboard Scenario Analysis section.

### SAY

This is one of the most important concepts in AgriPulse.

Agriculture does not have one guaranteed future.

If we show one number and call it "the answer", we can create false confidence.

Instead, AgriPulse shows:

**DOWNSIDE — EXPECTED — UPSIDE**

### ACTION
Point to Downside.

The downside scenario represents less favourable conditions, such as a lower market price, lower yield and higher costs.

### ACTION
Point to Expected.

The expected scenario uses the current forecast together with baseline yield and cost assumptions.

### ACTION
Point to Upside.

The upside scenario represents a more favourable combination of price, yield and cost assumptions.

### SAY

This changes the question from:

**"What will happen?"**

to:

**"What could happen under different conditions?"**

That is much closer to how a farmer actually has to think about risk.

---

# 7. Where the Data Comes From

### ACTION
Move to the ML/data explanation slide if available.

### SAY

Now let's go behind the interface.

The foundation of AgriPulse is the data pipeline.

Our intended agricultural market source is mandi-market information containing fields such as:

- State
- District
- Market
- Commodity
- Variety
- Grade
- Arrival date
- Minimum price
- Maximum price
- Modal price

For the core forecasting prototype, the modal price is the primary market value we model.

### DATA HONESTY — IMPORTANT

For this hackathon implementation, the complete pipeline has been validated using clearly labelled development/demo datasets.

We investigated official agricultural data access, but we did not want to pretend that an unreliable API connection was a live production feed.

So we made a deliberate engineering decision:

**Use validated development data to prove the pipeline, while keeping the data-source boundary explicit.**

That means we do not fabricate a live government feed, credentials, metrics or predictions.

---

# 8. Daily Data to Monthly Time Series

### SAY

The raw market observations are daily.

But our product question is primarily a one-to-three-month forecasting problem.

So we aggregate daily observations into monthly market series.

Conceptually:

\`\`\`
Daily observations
       ↓
Group by market + commodity + month
       ↓
Monthly price statistics
       ↓
Monthly time series
\`\`\`

For each market-commodity series, we calculate statistics such as average prices, median price, minimum and maximum observed modal price, standard deviation and observation count.

The result is a cleaner monthly time series that matches the decision horizon.

### CURRENT DEVELOPMENT PIPELINE

In our validated development pipeline, the market dataset contains approximately **80,340 daily observations**.

These become approximately **2,640 monthly rows**, representing **60 market-commodity series across 44 months**.

These figures describe our development dataset; they are not a claim about the size of India's entire agricultural market.

---

# 9. Data Quality Validation

### SAY

Before training a model, we do not immediately start fitting algorithms.

We first validate the data.

We check:

- required columns,
- valid dates,
- missing values,
- duplicate records,
- price consistency,
- chronological ordering,
- monthly continuity,
- completeness of market-commodity series.

Our development validation checks passed.

This matters because a model can only be as reliable as the data pipeline feeding it.

---

# 10. Feature Engineering

### SAY

A machine-learning model cannot directly understand a sentence like:

**"Onion prices have been increasing recently."**

We have to convert historical behaviour into numerical features.

That process is called **feature engineering**.

## 10.1 Lag features

We create:

- 1-month lag
- 2-month lag
- 3-month lag
- 6-month lag
- 12-month lag

If we are predicting July, the model can look at June, May, April, January and July of the previous year.

This gives the model historical memory.

## 10.2 Rolling features

We calculate:

- 3-month rolling mean
- 6-month rolling mean
- 12-month rolling mean
- 3-month rolling standard deviation
- 6-month rolling standard deviation
- 12-month rolling standard deviation

These represent historical level and volatility.

## 10.3 Momentum features

We calculate:

- 1-month price change
- 3-month price change
- 6-month price change
- 1-month percentage change
- 3-month percentage change
- 6-month percentage change

These help represent recent market movement.

## 10.4 Seasonality

Agriculture is seasonal.

We therefore represent:

- month number
- sine of month
- cosine of month

The cyclical representation allows the model to understand that the end and beginning of a year are seasonally connected rather than treating the calendar as a simple straight line.

---

# 11. Data Leakage — A Critical ML Control

### SAY

There is a major danger in time-series machine learning:

**Data leakage.**

Imagine we want to predict August.

If the model receives August's actual price while predicting August, the model is effectively seeing the answer.

That can produce impressive-looking but meaningless accuracy.

### ACTION
Show:

\`\`\`
Future information
       ↓
Training feature
       ↓
Artificially good result
\`\`\`

### SAY

We specifically designed the feature pipeline to prevent this.

Our rolling calculations use shifted historical observations so the target period is not included in its own historical feature.

Our target variables are shifted forward:

- target_1m = next month
- target_2m = two months ahead
- target_3m = three months ahead

We also performed an explicit leakage audit across the feature set.

This is one of the most important technical controls in the project.

---

# 12. Chronological Train / Validation / Test

### SAY

Another important decision is how we evaluate the model.

For ordinary machine learning, people often randomly split the dataset.

For time series, that can allow future information to influence the past.

So we use chronological splitting.

\`\`\`
TRAIN
Jan 2023 → Dec 2024

VALIDATION
Jan 2025 → Dec 2025

TEST
Jan 2026 → Aug 2026
\`\`\`

The model learns from the past, validates on a later period and tests on an even later unseen period.

This better represents how a forecasting system would actually operate.

---

# 13. Baseline Models

### SAY

Before claiming that a machine-learning model works, we need to ask:

**Does it actually beat simple forecasting approaches?**

So we evaluated simple baselines including:

- Naive-1
- Naive-3
- Seasonal-12

The seasonal baseline is particularly important because agricultural markets can contain strong annual patterns.

Only after establishing these baselines did we evaluate the Random Forest.

---

# 14. Random Forest — The Core Forecasting Model

### SAY

Our core forecasting model is a **Random Forest Regressor**.

Conceptually, Random Forest is a collection of decision trees.

\`\`\`
Tree 1 ─┐
Tree 2 ─┤
Tree 3 ─┤
Tree 4 ─┤
  ...   ├──→ Combined regression prediction
Tree N ─┘
\`\`\`

Each tree learns different relationships in the feature space, and the forest combines those predictions.

We selected it because, after feature engineering, our problem is structured tabular regression.

It can capture nonlinear relationships and provides useful feature-importance information without requiring heavy deep-learning infrastructure.

---

# 15. What Did the Model Learn?

### SAY

One of the most interesting findings from our development dataset was the importance of the **12-month price lag**.

Its feature importance was approximately **0.9282** in the development model.

That tells us the model was strongly using annual historical behaviour in this dataset.

We then performed feature ablation.

With all 20 features, one-month validation MAE was approximately **₹49.53**.

When we removed the 12-month lag, MAE increased to approximately **₹55.96**.

### IMPORTANT QUALIFICATION

Because our development dataset contains synthetic seasonal structure, we do not claim that 12-month historical price will necessarily have the same dominance on real-world agricultural data.

What we can say is that the development experiment demonstrates that the model is using the seasonal signal present in that dataset.

---

# 16. Multi-Horizon Forecasting

### SAY

We don't stop at one month.

We evaluate:

**1 month, 2 months and 3 months ahead.**

Development validation results:

| Horizon | MAE | RMSE | MAPE |
|---|---:|---:|---:|
| 1 month | ₹49.53 | ₹69.64 | 1.84% |
| 2 months | ₹55.90 | ₹83.71 | 2.12% |
| 3 months | ₹61.58 | ₹90.52 | 2.29% |

The error increases with forecasting horizon.

That is expected because uncertainty accumulates further into the future.

### ACCURACY DISCLAIMER

These are development-dataset validation metrics.

They are **not** a claim of production agricultural accuracy.

Once verified real-world historical data is integrated, we would repeat the complete evaluation and report those real-world results separately.

---

# 17. Walk-Forward Validation

### SAY

We also performed walk-forward evaluation.

Instead of training once and assuming the future behaves exactly like the past, we repeatedly move the forecasting window forward.

\`\`\`
Train on available history
        ↓
Predict future period
        ↓
Move forward
        ↓
Use newly available history
        ↓
Predict again
\`\`\`

This provides a more realistic view of how a forecasting system behaves as time progresses.

---

# 18. Market Signal

### ACTION
Open the Market page or return to Dashboard.

### SAY

Once the model generates a forecast, we compare it with the current observed price.

If the forecast is above the current price, we can derive a **Rising** signal.

If it is below, we can derive a **Falling** signal.

If the difference is relatively small, we can classify the trajectory as **Stable**.

This is a derived interpretation of the forecast, not a separate claim that the model has perfect classification ability.

---

# 19. Weather Risk — A Separate Context Layer

### ACTION
Click Weather.

### SAY

Now let's bring weather into the decision.

Agriculture is obviously exposed to rainfall and temperature conditions.

Our weather pipeline aggregates weather observations into monthly contextual features.

From these features we derive a weather-risk signal such as:

**Low, Moderate or High.**

But there is an important scientific distinction.

In our current implementation, weather is a **contextual risk layer**.

We do not say:

**"This weather event caused this price movement."**

Because correlation is not the same as causation.

The current weather layer is also clearly labelled as development/demo data rather than being presented as a live official weather feed.

---

# 20. Crop Comparison — Market Attractiveness Is Not Suitability

### ACTION
Click Crop Comparison.

### SAY

Suppose the farmer isn't sure which crop to investigate.

AgriPulse provides a crop comparison view.

We can compare supported crops using their forecast trajectories and contextual indicators.

But we deliberately avoid automatically declaring:

**"This is the best crop."**

Why?

Because market attractiveness and farm suitability are different questions.

A crop can have a strong market outlook and still be unsuitable for a farmer's soil, irrigation or season.

---

# 21. Crop Suitability

### SAY

That is why AgriPulse has a separate crop-suitability layer.

It considers the farmer's stated:

- location,
- soil,
- irrigation,
- season.

It then provides a suitability signal such as:

**Suitable** or **Conditionally Suitable**.

This separation prevents a high market forecast from automatically overriding agronomic constraints.

---

# 22. Profit Simulator — Turning Price Into Farm Economics

### ACTION
Click Profit Simulator.

### SAY

Now we move from market intelligence to farm economics.

A farmer does not ultimately care only about price.

They care about what that price could mean for their farm.

The Profit Simulator brings together:

- farm size,
- yield per acre,
- total yield,
- cost per acre,
- total cost,
- forecast price,
- expected revenue,
- gross margin,
- break-even price.

---

# 23. Explain the Profit Calculation

### SAY

Let's take a simple example.

Suppose the farmer has two acres.

If the assumed yield is 60 quintals per acre:

\`\`\`
2 acres × 60 quintals
= 120 quintals
\`\`\`

If the expected price is approximately ₹3,506 per quintal:

\`\`\`
Expected Revenue
=
Expected Price × Total Yield
\`\`\`

If total production cost is ₹80,000:

\`\`\`
Gross Margin
=
Revenue − Total Cost
\`\`\`

And:

\`\`\`
Break-even Price
=
Total Cost ÷ Total Yield
\`\`\`

The important point is:

**This is not another machine-learning prediction.**

It is a transparent economic calculation using the forecast and explicit assumptions.

---

# 24. Profit Scenarios

### ACTION
Show Downside / Expected / Upside.

### SAY

We again combine the forecast with scenarios.

**Downside:** lower price, lower yield and higher costs.

**Expected:** current forecast, baseline yield and baseline cost.

**Upside:** more favourable price, yield and cost assumptions.

So instead of telling a farmer:

**"You will earn ₹X."**

we tell them:

**"Under these assumptions, this is the expected economic outcome — and here is how it changes when conditions become less favourable or more favourable."**

That is a more responsible approach to agricultural decision support.

---

# 25. Farmer Insights

### ACTION
Click Insights.

### SAY

Finally, we bring the outputs together in Farmer Insights.

A farmer shouldn't need to understand Random Forest, feature engineering, rolling windows, APIs or target shifting.

They need understandable information.

So the insight layer converts the existing forecast, weather context and scenario outputs into human-readable explanations.

For example, the system can communicate:

- whether the market signal is rising, falling or stable,
- the forecast horizon,
- weather-risk context,
- and what the economic scenarios imply under the displayed assumptions.

In our current implementation, this explanation layer is **rule-based**.

The numerical forecast comes from the forecasting pipeline.

The economic values come from scenario calculations.

The explanation layer does not invent new numbers.

---

# 26. Why Not Just Use ChatGPT?

### IF ASKED — OR INCLUDE IF TIME ALLOWS

A natural question is:

**"Why not simply ask ChatGPT to predict the price?"**

Because a language model generating a number does not make that number a statistically grounded agricultural forecast.

Our numerical forecast comes from structured historical data and a trained regression model.

A language model can eventually assist with natural-language explanation, question answering and interaction around grounded results.

But we keep the responsibilities separate:

**Prediction is grounded in the numerical forecasting pipeline.**

**Explanation is grounded in the resulting outputs.**

---

# 27. Backend Architecture

### ACTION
Optionally open the FastAPI documentation at http://127.0.0.1:8000/docs.

### SAY

From an engineering perspective, the backend is built using **FastAPI** and the frontend using **Next.js**.

The runtime flow is:

\`\`\`
Next.js Frontend
       │
       │ REST API
       ▼
FastAPI Backend
       │
       ▼
Repository / Data Layer
       │
       ├── Market
       ├── Weather
       ├── Insights
       ├── Comparison
       ├── Suitability
       ├── Profit
       └── Scenarios
\`\`\`

The frontend requests structured information from the backend, and the backend returns JSON responses that the UI renders into cards, tables, scenarios and insights.

---

# 28. Authentication and Profile Flow

### ACTION
Optionally show Login/Register.

### SAY

AgriPulse also has a working authentication flow.

A farmer can register and log in.

Authentication uses JWT-based access tokens.

Protected profile endpoints allow the application to retrieve and update farmer information.

The profile and dashboard context are connected so that farmer-specific settings can be reused across the application.

This is important because the project is not simply a static UI mockup.

It is an end-to-end frontend and backend application.

---

# 29. What Actually Happens When the Dashboard Opens?

### SAY

Let me simplify the runtime flow.

The farmer selects:

**State → District → Crop → Horizon.**

The Next.js frontend sends a request to the FastAPI backend.

The backend retrieves the relevant validated forecast and contextual information.

It returns structured JSON.

The frontend converts that response into:

**Current Price + Forecast + Market Signal + Weather Risk + Scenario Analysis.**

The farmer sees the result without needing to understand the underlying machine-learning implementation.

---

# 30. What Is Running at Runtime?

### SAY

One important engineering distinction:

In this hackathon version, the forecasting pipeline was trained and validated offline and the validated forecast artifacts are served through the backend.

The browser is **not retraining a Random Forest every time the dashboard opens**.

That makes the hackathon demo fast, reproducible and reliable.

A production system would move toward scheduled data ingestion, feature generation, model inference, model versioning and a proper forecast store.

---

# 31. What Makes AgriPulse Different?

### SAY

There are already platforms that provide agricultural prices.

There are platforms that provide weather information.

There are platforms that provide crop information.

Our objective is to connect those pieces around the farmer's actual decision.

\`\`\`
Market Forecast
       +
Weather Context
       +
Farmer Profile
       +
Crop Suitability
       +
Profit Simulation
       +
Scenario Analysis
       +
Explainability
       =
Farmer Decision Support
\`\`\`

We are not trying to replace the farmer's knowledge.

**We are trying to give the farmer more structured information before committing land, money and time.**

---

# 32. Current Limitations — Present Them Confidently

### SAY

A strong engineering project should also be honest about its limitations.

Our biggest current limitation is **data availability and verification**.

The forecasting pipeline is validated on development data, but production-grade agricultural intelligence requires:

- verified real-world historical data,
- sufficient geographic coverage,
- reliable weather history,
- consistent market data,
- and enough history to establish generalisation.

We have deliberately not hidden that limitation.

Instead, we designed the application so that the data-ingestion layer can eventually be replaced with verified production sources without redesigning the farmer-facing workflow.

---

# 33. Future Vision — From Prototype to Production

### ACTION
Show the future-roadmap slide.

### SAY

What you have seen today is the foundation.

Our long-term vision is to evolve AgriPulse from a forecasting prototype into a broader agricultural intelligence platform.

## 33.1 Verified Live Agricultural Data

First, we would connect verified live and historical sources for:

- mandi prices,
- market arrivals,
- production,
- yield,
- rainfall,
- temperature,
- imports,
- exports,
- commodity markets,
- and other relevant agricultural indicators.

Every source would carry provenance, freshness information and validation checks.

## 33.2 Multi-Factor Forecasting

Today the validated core forecasting pipeline focuses on historical market-price behaviour.

With verified data, we can test additional signals:

\`\`\`
Historical Prices
       +
Weather
       +
Production
       +
Market Arrivals
       +
Trade
       +
Supply Conditions
       +
Global Commodity Signals
       ↓
Multi-Factor Forecast
\`\`\`

The important word is **test**.

We would not simply add every available variable and assume it improves the model.

Each new signal would be evaluated through controlled experiments and time-aware validation.

## 33.3 Event Intelligence

Imagine a major agricultural disruption:

- flood,
- drought,
- cyclone,
- export restriction,
- supply disruption,
- commodity shock.

A future AgriPulse could represent that event as structured information and identify potentially exposed commodities and regions.

But we would not automatically claim that the event caused a specific price.

We would evaluate potential effects through evidence and controlled scenario analysis.

## 33.4 What-If Simulation

The next step is interactive simulation.

A farmer could ask:

**"What if rainfall is lower than expected?"**

The system could model a changed yield scenario and show potential effects on revenue and margin.

Or:

**"What if the market price falls by 15%?"**

The system could immediately show the resulting revenue and margin sensitivity.

Or:

**"What if input costs increase?"**

The system could show how the break-even price changes.

This turns AgriPulse from a forecasting dashboard into a **decision simulator**.

## 33.5 Personalised Farm Intelligence

Eventually, AgriPulse could combine:

**Farmer profile + farm conditions + crop suitability + market forecast + weather + input costs + local market access + scenarios.**

The output would not simply be:

**"Grow crop X."**

Instead, it could say:

**"For your stated farm conditions, this crop has this market outlook, this suitability profile and these economic sensitivities. Here are the downside, expected and upside outcomes."**

That is closer to responsible decision support.

## 33.6 Early-Warning System

Eventually, farmers should not have to constantly open the dashboard.

AgriPulse could monitor:

- market changes,
- weather anomalies,
- supply conditions,
- trade changes,
- external events.

If the outlook changes significantly, the farmer could receive an early warning.

That transforms AgriPulse from a dashboard into an **agricultural early-warning system**.

## 33.7 Production ML Infrastructure

At production scale, the architecture could evolve into:

\`\`\`
Verified Live Sources
        ↓
Data Ingestion
        ↓
Data Validation
        ↓
Feature Engineering
        ↓
Model Inference
        ↓
Model Monitoring
        ↓
Forecast Store
        ↓
FastAPI
        ↓
Next.js
        ↓
Farmer
\`\`\`

We would also introduce model versioning, scheduled retraining, data-drift monitoring, model-performance monitoring, source-health monitoring, production database infrastructure, caching, scalable deployment and stronger auditability.

---

# 34. The Long-Term Farmer Vision

### SAY — SLOW DOWN

Imagine a farmer standing on two acres of land.

Before cultivation, instead of only knowing today's price, the farmer can ask:

**What could the market look like when my crop is ready?**

**What weather risks should I consider?**

**Does this crop fit my farm?**

**What happens if the price falls?**

**What happens if yield is lower?**

**What happens if input costs rise?**

**How sensitive is my decision to those changes?**

That is the future we want to build.

---

# 35. The Responsible Farmer-Income Message

### SAY

Our ambition is not to promise that software will make farmers rich.

No responsible forecasting system can guarantee agricultural profit.

Our ambition is more practical:

**To reduce avoidable information gaps before farmers commit their land, money and time.**

If better information helps a farmer identify opportunities earlier, understand downside risk, evaluate alternatives and make better-informed cultivation decisions, then technology can contribute to better income potential and more resilient farming.

We don't want to replace the farmer's judgement.

**We want to give that judgement better information.**

---

# 36. Final Closing

### ACTION
Return to the Dashboard or Landing page.

### SAY

At the beginning, we asked:

**"What is the price today?"**

But a farmer doesn't cultivate for today's price.

They cultivate for the market they will face months later.

And that is the gap AgriPulse is designed to address.

We take:

**Data**

and turn it into:

**Forecasts**

then add:

**Risk**

**Scenarios**

**Farm Context**

and finally:

**Decision Support.**

We don't want to tell farmers what to do.

**We want to give them better information before they decide.**

### PAUSE

**AgriPulse AI — See the market before you sow.**

Thank you.

---

# 37. Judge Q&A Cheat Sheet

## Q1. Why Random Forest?

After feature engineering, our core problem becomes structured tabular regression. Random Forest can capture nonlinear relationships, works well with engineered numerical features, requires relatively lightweight infrastructure and provides feature importance. We selected it as a strong interpretable baseline rather than choosing a complex model simply because it is complex.

## Q2. Why not LSTM?

LSTM is a valid option for sequential forecasting, but model selection should follow the data and problem. For our current feature-engineered tabular problem, Random Forest is a strong baseline. With verified real-world data, we would benchmark it against gradient boosting and temporal deep-learning approaches using the same chronological evaluation framework.

## Q3. Why not XGBoost?

XGBoost is a strong candidate for the next iteration. Our current focus was establishing a clean, leakage-safe baseline and validating the complete end-to-end pipeline. We can then compare models fairly using the same walk-forward evaluation.

## Q4. What exactly is your target?

The target is future monthly modal market price. We have separate targets for one, two and three months ahead.

## Q5. How do you prevent data leakage?

We use time-aware target shifting, historical-only lag features, shifted rolling calculations, chronological train-validation-test splits and an explicit leakage audit. The target period's realised price is not intentionally supplied as a feature for predicting that same period.

## Q6. Why monthly instead of daily?

The product is intended to support cultivation planning over a one-to-three-month horizon. Monthly aggregation reduces daily noise and aligns the prediction frequency with the decision we are supporting.

## Q7. Why is the 12-month lag important?

Our development dataset contains strong seasonal structure, so the model learned that the same period one year earlier is highly informative. We confirmed the signal through feature importance and ablation. We would need verified real-world data before assuming the same relationship in production.

## Q8. What does the 1.84% MAPE mean?

It is the one-month validation MAPE on our development dataset. It is not a claim of production agricultural accuracy. Real-world accuracy must be established after integrating and validating verified historical data.

## Q9. Can your system guarantee profit?

No. We deliberately do not guarantee profit. Agriculture is uncertain, so we show downside, expected and upside scenarios and expose the assumptions behind the economic calculation.

## Q10. How do you calculate profit?

Profit is not predicted by the ML model. Revenue is calculated from forecast price multiplied by total assumed yield. Gross margin is revenue minus total cost. Break-even price is total cost divided by total yield.

## Q11. Does weather directly affect your prediction?

Currently weather is primarily a contextual risk layer. We do not claim causal price effects. With verified aligned weather and market data, weather features could be tested as model inputs through controlled experiments.

## Q12. Is your data real?

The current hackathon datasets are clearly labelled development/demo datasets. We are not presenting them as a live official national feed. The purpose is to validate the pipeline honestly. Production would connect verified real-world sources.

## Q13. What happens if data is missing?

We don't fabricate it. The pipeline validates availability and distinguishes unavailable information from actual zero values. Production would add freshness and source-health monitoring.

## Q14. What does the farmer profile change?

It provides context for suitability, economic assumptions, filtering and interpretation. It does not automatically change the underlying market forecast unless those attributes are explicitly introduced as model features in a future validated model.

## Q15. Why not automatically tell the farmer the best crop?

Because market attractiveness is not the same as agronomic suitability. A crop can have a strong market outlook but be unsuitable for the farmer's soil, irrigation or season. We therefore keep those dimensions separate.

## Q16. What happens during an unprecedented event?

Historical models can struggle when the future is fundamentally different from the past. The production vision therefore includes external-event intelligence, scenario analysis, uncertainty communication and model monitoring rather than pretending the model always knows.

## Q17. What is your biggest limitation?

Data availability and verification. Production-grade agricultural intelligence requires sufficiently long, reliable, geographically representative and verified real-world data. The current hackathon implementation proves the pipeline, but production accuracy must be established with production-grade data.

## Q18. How will you productionise this?

We would introduce verified live data ingestion, automated validation, a production database, scheduled feature generation, model serving, model versioning, drift monitoring, performance monitoring, scalable deployment and source provenance.

## Q19. How can this scale?

The current hackathon version is intentionally lightweight. At production scale, ingestion, feature generation, model inference and API serving can be separated, with a production database, caching, monitoring and horizontally scalable services. The exact architecture would depend on usage volume and latency requirements.

## Q20. Why is this an AI project?

The core forecasting component is a machine-learning regression model trained on historical time-series-derived features. The broader system combines that model with structured data processing, contextual risk analysis, scenario simulation and an intelligent farmer-facing decision-support layer.

---

# 38. 30-Second Emergency Pitch

If a judge says **"Explain your project in 30 seconds"**, say:

> **AgriPulse AI is a farmer decision-support platform built around agricultural market forecasting. We take historical market data, transform it into time-series features such as price lags, rolling statistics, momentum and seasonality, and use a Random Forest regression model to estimate one-, two- and three-month market prices. We then combine those forecasts with weather-risk context, farmer information, crop suitability and transparent downside, expected and upside economic scenarios. Instead of promising a single future outcome, AgriPulse helps farmers understand possible market conditions and economic risk before committing their land and resources.**

---

# 39. Ten Lines to Memorise

1. **"A farmer makes the cultivation decision today, but faces the market months later."**

2. **"The real question isn't today's price; it's what the market could look like when the crop is ready."**

3. **"We treat the core problem as time-series forecasting."**

4. **"We deliberately prevent future information from entering our features because that would create data leakage."**

5. **"We use chronological validation because future data should never be allowed to influence the past."**

6. **"The Random Forest generates the numerical forecast; the rest of AgriPulse turns that forecast into decision support."**

7. **"We deliberately separate market attractiveness from crop suitability."**

8. **"Profit is calculated from explicit assumptions; it is not another machine-learning prediction."**

9. **"Our development accuracy is a pipeline-validation result, not a claim of real-world agricultural accuracy."**

10. **"We don't want to tell farmers what to do; we want to give them better information before they decide."**

---

# 40. Final Mental Model

Before going on stage, remember this architecture:

\`\`\`
                    AGRIPULSE AI
                         │
                         ▼
                  FARMER PROFILE
                         │
                         ▼
                    MARKET DATA
                         │
                         ▼
                DATA VALIDATION
                         │
                         ▼
              MONTHLY TIME SERIES
                         │
                         ▼
              FEATURE ENGINEERING
                         │
                         ▼
                LEAKAGE AUDIT
                         │
                         ▼
             CHRONOLOGICAL SPLIT
                         │
                         ▼
                RANDOM FOREST
                         │
                ┌────────┼────────┐
                ▼        ▼        ▼
               1M       2M       3M
                │        │        │
                └────────┼────────┘
                         ▼
                  MARKET SIGNAL
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
        WEATHER       SUITABILITY  ECONOMICS
          RISK             │           │
             │             │           │
             └─────────────┼───────────┘
                           ▼
                    SCENARIO ENGINE
                           │
                 ┌─────────┼─────────┐
                 ▼         ▼         ▼
              DOWNSIDE  EXPECTED   UPSIDE
                 │         │         │
                 └─────────┼─────────┘
                           ▼
                    PROFIT SIMULATOR
                           │
                           ▼
                     FARMER INSIGHTS
                           │
                           ▼
                    DECISION SUPPORT
\`\`\`

## The message judges should remember

> **AgriPulse is not trying to predict the future perfectly. It is trying to make the future less uncertain for the farmer by bringing together historical market intelligence, forecasting, contextual risk, farm suitability and economic scenarios before the cultivation decision is made.**

---

**Document status:** Hackathon presentation script for the current AgriPulse AI implementation.  
**Data status:** Development/demo datasets; current development metrics must not be presented as production accuracy.  
**Prediction status:** Forecasts are estimates, not guarantees.  
**Economic status:** Profit outputs are scenario calculations based on explicit assumptions, not guaranteed returns.
