import React from "react";
import IngredientsListItems from "./ingredientsListItems";
import Recipe from "./Recipe";

export default function Form() {
  const [ingredients, setIngredients] = React.useState([]);
  const [recipeShown, setRecipeShown] = React.useState(false);

  function showRecipe() {
    setRecipeShown((prevShown) => !prevShown);
  }

  function addIngredient(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const raw = formData.get("ingredient");
    const newIngredient = raw ? String(raw).trim() : "";
    if (!newIngredient) return;
    // منع التكرار (اختياري) - منع التكرار بغض النظر عن حالة الأحرف
    setIngredients((prev) =>
      prev.some((i) => String(i).toLowerCase() === newIngredient.toLowerCase())
        ? prev
        : [...prev, newIngredient],
    );
    form.reset();
    const input = form.elements.namedItem("ingredient");
    if (input && typeof input.focus === "function") input.focus();
  }

  return (
    <main>
      <form onSubmit={addIngredient} className="add-ingredient-form">
        <input
          type="text"
          placeholder="e.g. oregano"
          aria-label="Add ingredient"
          name="ingredient"
        />
        <button type="submit">Add ingredient</button>
      </form>

      {ingredients.length > 0 && (
        <IngredientsListItems
          ingredients={ingredients}
          showRecipe={showRecipe}
        />
      )}

      {recipeShown && <Recipe ingredients={ingredients} />}
    </main>
  );
}
