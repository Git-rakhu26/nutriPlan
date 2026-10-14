// Preference and exclusion filtering is kept separate from menu generation.
export function isFoodAllowed(food, profile) {
  if (profile.diet === "veg" && !["all", "veg"].includes(food.diet)) return false;
  if (profile.diet === "egg" && food.diet === "nonveg") return false;
  if (profile.budget === "budget" && !food.budget) return false;
  if (profile.cuisine === "indian" && !food.cuisine.includes("indian") &&
      !food.cuisine.includes("all")) return false;

  // This is only a convenience filter. Never rely on it to prevent allergen exposure.
  const terms = profile.avoid;
  const searchable = [food.id, food.name, ...(food.aliases || [])].join(" ").toLowerCase();
  if (terms.some((term) => term && searchable.includes(term))) return false;
  return true;
}

export function candidatesForGroup(foods, group, profile) {
  return foods.filter((food) => food.group === group && isFoodAllowed(food, profile));
}
