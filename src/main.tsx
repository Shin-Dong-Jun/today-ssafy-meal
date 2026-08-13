import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { weeklyMeal } from "./data/meals";
import "./styles.css";

async function renderApp() {
  const mealData =
    import.meta.env.DEV && import.meta.env.MODE === "e2e-verified"
      ? (await import("./data/fixtures/e2eVerifiedMeal")).e2eVerifiedMeal
      : weeklyMeal;

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App mealData={mealData} />
    </StrictMode>,
  );
}

void renderApp();
