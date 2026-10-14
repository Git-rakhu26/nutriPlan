// Pure calculation functions: no DOM access, so these can be tested independently.
export function calculateNeeds(profile, settings) {
  const bmi = profile.weight / ((profile.height / 100) ** 2);
  const sexConstant = profile.sex === "male" ? 5 : -161;
  const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + sexConstant;
  const maintenance = Math.round(bmr * profile.activity);
  let goalCalories = maintenance + (settings.goalAdjustmentsKcal[profile.goal] ?? 0);

  // Avoid prescribing a calorie deficit for an adult below the BMI reference range.
  if (profile.goal === "lose" && bmi < settings.adultBmiReference.underweightBelow) {
    goalCalories = maintenance;
  }

  const proteinPerKg = settings.proteinGramsPerKg[profile.goal] ?? 1.2;
  const protein = Math.round(profile.weight * proteinPerKg);
  const fat = Math.round(goalCalories * settings.fatEnergyShare / 9);
  const carbs = Math.max(0, Math.round((goalCalories - protein * 4 - fat * 9) / 4));

  let bmiLabel = "Within adult reference range";
  if (bmi < settings.adultBmiReference.underweightBelow) bmiLabel = "Below adult reference range";
  else if (bmi >= settings.adultBmiReference.obeseAtOrAbove) bmiLabel = "Obesity range";
  else if (bmi >= settings.adultBmiReference.normalBelow) bmiLabel = "Above adult reference range";

  return { bmi, bmiLabel, bmr: Math.round(bmr), maintenance, goalCalories, protein, fat, carbs, proteinPerKg };
}

export function nutritionFor(food, grams) {
  const factor = grams / 100;
  return {
    kcal: food.kcal * factor,
    protein: food.protein * factor,
    carbs: food.carbs * factor,
    fat: food.fat * factor
  };
}

export function sumNutrition(items) {
  return items.reduce((sum, item) => {
    const n = nutritionFor(item.food, item.grams);
    sum.kcal += n.kcal;
    sum.protein += n.protein;
    sum.carbs += n.carbs;
    sum.fat += n.fat;
    return sum;
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

export function allItems(meals) {
  return meals.flatMap((meal) => meal.items);
}
