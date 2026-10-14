import { allItems, sumNutrition, nutritionFor } from "./nutrition.js";

const $ = (id) => document.getElementById(id);
const whole = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
const decimal = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(n);

export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

export function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3500);
}

export function renderMetrics(profile, needs) {
  $("bmiValue").textContent = decimal(needs.bmi);
  $("bmiLabel").textContent = needs.bmiLabel;
  $("maintenanceValue").textContent = whole(needs.maintenance);
  $("goalValue").textContent = whole(needs.goalCalories);
  $("proteinValue").textContent = `${needs.protein} g`;

  const goals = { muscle: "Muscle gain", gain: "Weight gain", maintain: "Weight maintenance", lose: "Weight loss" };
  $("resultSubtitle").textContent = `${profile.age} years · ${profile.height} cm · ${profile.weight} kg · ${goals[profile.goal]}`;

  const targets = [
    { name: "Protein", value: needs.protein, unit: "g", color: "#7658ed", max: 200 },
    { name: "Carbohydrates", value: needs.carbs, unit: "g", color: "#ed9638", max: 500 },
    { name: "Fat", value: needs.fat, unit: "g", color: "#d95791", max: 150 }
  ];
  $("targetList").innerHTML = targets.map((item) => `
    <div class="target-row"><div class="target-top"><span>${item.name}</span><strong>${whole(item.value)} ${item.unit}</strong></div>
    <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, item.value / item.max * 100)}%;background:${item.color}"></div></div></div>
  `).join("");
}

export function renderMeals(meals) {
  $("mealPlan").innerHTML = meals.map((meal) => `
    <article class="meal-card">
      <div class="meal-heading"><span class="meal-emoji">${meal.emoji}</span><div><h3>${escapeHTML(meal.name)}</h3><p>${whole(meal.nutrition.kcal)} kcal estimated</p></div></div>
      ${meal.items.length ? meal.items.map((item) => {
        const n = nutritionFor(item.food, item.grams);
        return `<div class="food-line"><span>${escapeHTML(item.food.name)} <span class="field-hint">${item.grams} g</span></span><strong>${whole(n.kcal)} kcal</strong></div>`;
      }).join("") : `<p class="field-hint">No suitable foods matched your current preferences.</p>`}
      <div class="meal-macros">P: ${decimal(meal.nutrition.protein)} g · C: ${decimal(meal.nutrition.carbs)} g · F: ${decimal(meal.nutrition.fat)} g</div>
    </article>
  `).join("");
}

export function renderFoodTable(meals, needs) {
  const items = allItems(meals);
  const totals = sumNutrition(items);
  $("foodTable").innerHTML = items.map((item) => {
    const n = nutritionFor(item.food, item.grams);
    return `<tr><td>${escapeHTML(item.food.name)}</td><td>${item.grams} g</td><td>${whole(n.kcal)}</td><td>${decimal(n.protein)} g</td><td>${decimal(n.carbs)} g</td><td>${decimal(n.fat)} g</td></tr>`;
  }).join("");

  $("foodTableFoot").innerHTML = `<tr><td>Total</td><td>—</td><td>${whole(totals.kcal)}</td><td>${decimal(totals.protein)} g</td><td>${decimal(totals.carbs)} g</td><td>${decimal(totals.fat)} g</td></tr>`;
  $("planTotals").innerHTML = [
    ["Energy", `${whole(totals.kcal)} kcal`],
    ["Protein", `${decimal(totals.protein)} g`],
    ["Carbohydrates", `${decimal(totals.carbs)} g`],
    ["Fat", `${decimal(totals.fat)} g`]
  ].map(([label, value]) => `<div class="total-card"><span>${label}</span><strong>${value}</strong></div>`).join("");

  const diff = Math.round(totals.kcal - needs.goalCalories);
  const gapText = diff >= 0 ? `${whole(diff)} kcal above` : `${whole(Math.abs(diff))} kcal below`;
  $("planSummary").innerHTML = `<span class="summary-chip">🎯 Target: ${whole(needs.goalCalories)} kcal</span><span class="summary-chip">🍽️ ${meals.length} meals</span><span class="summary-chip">📌 Menu: ${whole(totals.kcal)} kcal</span>`;
  $("planNote").textContent = `The generated menu is ${gapText} your estimated calorie target. The starter generator uses a limited sample dataset; review portions and food choices rather than treating this as an exact prescription.`;
}

export function renderWarnings(profile, needs, meals, settings) {
  const warnings = [];
  if (needs.bmi < settings.adultBmiReference.underweightBelow) warnings.push(["BMI is below the adult reference range", "Consider discussing your weight and nutritional needs with a healthcare professional, particularly if weight loss was unintentional."]);
  if (needs.bmi >= settings.adultBmiReference.obeseAtOrAbove) warnings.push(["BMI is in the obesity range", "BMI is a screening measure, not a diagnosis. Individual health assessment may be helpful."]);
  if (profile.goal === "lose" && needs.bmi < settings.adultBmiReference.underweightBelow) warnings.push(["Weight-loss deficit not applied", "Calories have not been reduced because BMI is below the usual adult reference range."]);
  if (profile.avoid.length) warnings.push(["Review exclusions carefully", "Name matching cannot detect hidden ingredients, cross-contact or all allergens. Do not rely on this tool for allergy safety."]);
  if (meals.some((meal) => !meal.items.length)) warnings.push(["Some meals are incomplete", "Your filters removed all available foods for a meal. Change preferences or expand the food dataset."]);

  $("warningArea").innerHTML = warnings.map(([title, text]) => `<div class="warning-message"><strong>${escapeHTML(title)}</strong><p>${escapeHTML(text)}</p></div>`).join("");
}
