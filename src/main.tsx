import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { weeklyMeal } from "./data/meals";
import "./styles.css";

async function loadMealData() {
  if (import.meta.env.DEV && import.meta.env.MODE === "e2e-verified") {
    return (await import("./data/fixtures/e2eVerifiedMeal")).e2eVerifiedMeal;
  }

  if (import.meta.env.DEV && import.meta.env.MODE === "e2e-unverified") {
    return (await import("./data/fixtures/e2eUnverifiedMeal"))
      .e2eUnverifiedMeal;
  }

  if (import.meta.env.DEV && import.meta.env.MODE === "e2e-sample") {
    return (await import("./data/fixtures/e2eSampleMeal")).e2eSampleMeal;
  }

  return weeklyMeal;
}

async function renderApp() {
  const mealData = await loadMealData();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App mealData={mealData} />
    </StrictMode>,
  );
}

void renderApp();
