import { nutritionFor, sumNutrition, allItems } from "./nutrition.js";
import { candidatesForGroup } from "./food-filter.js";

export function buildMeals(profile, foods, templates) {
  let selectedTemplates = templates.map((meal) => ({
    ...meal, foods: meal.foods.map((entry) => ({ ...entry }))
  }));

  if (profile.mealCount === 3 && selectedTemplates.length >= 4) {
    const snack = selectedTemplates.splice(2, 1)[0];
    selectedTemplates[0].foods.push(...snack.foods);
    selectedTemplates[0].name = "Breakfast + snack";
  } else if (profile.mealCount === 5 && selectedTemplates.length >= 4) {
    const snack = selectedTemplates[2];
    const nuts = snack.foods.find((entry) => entry.group === "nuts");
    if (nuts) {
      snack.foods = snack.foods.filter((entry) => entry !== nuts);
      selectedTemplates.splice(3, 0, {
        name: "Extra snack", emoji: "🥜", foods: [{ ...nuts }]
      });
    }
  }

  const meals = selectedTemplates.map((template, mealIndex) => {
    const items = template.foods.map((portion, foodIndex) => {
      const candidates = candidatesForGroup(foods, portion.group, profile);
      if (!candidates.length) return null;
      const food = candidates[(mealIndex * 2 + foodIndex) % candidates.length];
      return { food, grams: portion.grams };
    }).filter(Boolean);

    return { name: template.name, emoji: template.emoji, items, nutrition: sumNutrition(items) };
  });

  adjustPortions(meals, profile.goalCalories);
  return meals;
}

function adjustPortions(meals, targetCalories) {
  const items = allItems(meals);
  const total = sumNutrition(items);
  if (!total.kcal) return;

  // Conservative global scale keeps serving sizes bounded; targets may not match exactly.
  const scale = Math.min(1.5, Math.max(0.75, targetCalories / total.kcal));
  meals.forEach((meal) => {
    meal.items.forEach((item) => {
      item.grams = Math.max(5, Math.round(item.grams * scale / 5) * 5);
    });
    meal.nutrition = sumNutrition(meal.items);
  });
}

export function summarizePlan(meals) {
  return sumNutrition(allItems(meals));
}

export function foodNutritionRows(meals) {
  return allItems(meals).map((item) => ({
    ...item,
    nutrition: nutritionFor(item.food, item.grams)
  }));
}
