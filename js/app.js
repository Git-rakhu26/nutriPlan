import { calculateNeeds } from "./nutrition.js";
import { buildMeals } from "./meal-planner.js";
import { renderMacroChart } from "./chart.js";
import { renderMetrics, renderMeals, renderFoodTable, renderWarnings, showToast } from "./render.js";

const $ = (id) => document.getElementById(id);
let appData = null;
let latestNeeds = null;

async function loadData() {
  // Fetch JSON as independent datasets; use a local server (VS Code Live Server).
  const [foodsData, templateData, settings] = await Promise.all([
    fetch("./data/foods.json").then(checkResponse).then((response) => response.json()),
    fetch("./data/meal-templates.json").then(checkResponse).then((response) => response.json()),
    fetch("./data/nutrition-settings.json").then(checkResponse).then((response) => response.json())
  ]);

  appData = { foods: foodsData.foods, templates: templateData.templates, settings };
  $("disclaimer").textContent = settings.disclaimer;
}

function checkResponse(response) {
  if (!response.ok) throw new Error(`Could not load dataset (${response.status}). Run this site through a local server.`);
  return response;
}

function readProfile() {
  const profile = {
    age: Number($("age").value),
    height: Number($("height").value),
    weight: Number($("weight").value),
    sex: $("sex").value,
    activity: Number($("activity").value),
    goal: $("goal").value,
    diet: $("diet").value,
    mealCount: Number($("mealCount").value),
    budget: $("budget").value,
    cuisine: $("cuisine").value,
    avoid: $("avoid").value.toLowerCase().split(",").map((part) => part.trim()).filter(Boolean),
    notes: $("notes").value.trim()
  };

  if (!Number.isFinite(profile.age) || profile.age < 18 || profile.age > 100) throw new Error("Enter an age between 18 and 100.");
  if (!Number.isFinite(profile.height) || profile.height < 100 || profile.height > 250) throw new Error("Enter a height between 100 and 250 cm.");
  if (!Number.isFinite(profile.weight) || profile.weight < 25 || profile.weight > 350) throw new Error("Enter a weight between 25 and 350 kg.");
  if (!Number.isFinite(profile.activity) || profile.activity <= 0) throw new Error("Choose a valid activity level.");
  return profile;
}

function calculateAndRender() {
  try {
    const profile = readProfile();
    latestNeeds = calculateNeeds(profile, appData.settings);
    const meals = buildMeals({ ...profile, goalCalories: latestNeeds.goalCalories }, appData.foods, appData.templates);

    renderMetrics(profile, latestNeeds);
    renderMacroChart(latestNeeds);
    // renderMeals(meals);
    // renderFoodTable(meals, latestNeeds);
    renderWarnings(profile, latestNeeds, meals, appData.settings);

    $("results").hidden = false;
    $("results").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showToast(error.message || "Unable to calculate nutrition.");
  }
}

$("profileForm").addEventListener("submit", (event) => {
  event.preventDefault();
  calculateAndRender();
});
$("regenerateButton").addEventListener("click", calculateAndRender);
$("recalculateButton").addEventListener("click", () => {
  $("profileForm").scrollIntoView({ behavior: "smooth", block: "start" });
  $("age").focus({ preventScroll: true });
});
$("printButton").addEventListener("click", () => window.print());

let resizeFrame;
window.addEventListener("resize", () => {
  if (!latestNeeds) return;
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => renderMacroChart(latestNeeds));
});

loadData().then(() => {
  calculateAndRender();
}).catch((error) => {
  console.error(error);
  showToast(error.message || "Unable to load nutrition datasets.");
});
