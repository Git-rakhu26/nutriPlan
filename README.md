# NutriPlan — modular vanilla JavaScript project

## File structure

- `index.html` — semantic page and input/output elements
- `style.css` — responsive UI styles
- `data/foods.json` — per-100-g approximate food nutrition dataset
- `data/meal-templates.json` — editable meal templates and serving weights
- `data/nutrition-settings.json` — equation settings, goal adjustments, and disclaimer
- `js/app.js` — application bootstrap, JSON loading, input validation, event handlers
- `js/nutrition.js` — pure BMI/BMR/calorie/macronutrient and nutrition calculations
- `js/food-filter.js` — preference and food exclusion filtering
- `js/meal-planner.js` — meal assembly, serving adjustment, and plan summaries
- `js/render.js` — DOM rendering for metrics, meals, tables and warnings
- `js/chart.js` — responsive Canvas macro chart

## Run it

Because the JavaScript uses ES modules and `fetch()` to load JSON, do not open `index.html` directly with `file://`.

Use VS Code Live Server, or run a local server from this folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Editing the dataset

`foods.json` stores approximate values per 100 g. Update each food's:
- `kcal`, `protein`, `carbs`, `fat`
- `group`, `diet`, `budget`, `cuisine`
- `aliases` used by the basic text filter

Cooked foods should use values and portion weights on a consistent cooked-weight basis. Verify values against a reliable food-composition source before using this for clinical or commercial diet planning.

## Important limitations

- This is an educational demo, not medical advice.
- The food dataset is intentionally small and values are approximate.
- Meal templates and global portion scaling do not guarantee exact calorie/macro matching or full dietary adequacy.
- Avoid-food matching is not allergy-safe; it cannot inspect ingredients, cross-contact, or packaged product labels.
- BMI is a screening metric, not a diagnosis. Individual calorie needs vary.
