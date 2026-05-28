function IngredientsListItems(props) {
  const ingredientsListItems = props.ingredients.map((ingredient) => (
    <li key={ingredient} className="ingredient-item">
      <span className="ingredient-text">{ingredient}</span>
      <button
        type="button"
        className="remove-ingredient-btn"
        aria-label={`Remove ${ingredient}`}
        onClick={() =>
          props.removeIngredient && props.removeIngredient(ingredient)
        }>
        ×
      </button>
    </li>
  ));

  return (
    <section>
      <h2>Ingredients on hand:</h2>
      <ul className="ingredients-list" aria-live="polite">
        {ingredientsListItems}
      </ul>
      {props.ingredients.length > 3 && (
        <div className="get-recipe-container">
          <div>
            <h3>Ready for a recipe?</h3>
            <p>Generate a recipe from your list of ingredients.</p>
          </div>
          <div className="get-recipe-actions">
            <button type="button" onClick={props.showRecipe}>
              Get a recipe
            </button>
            <button
              type="button"
              className="rewrite-btn"
              onClick={props.clearIngredients}>
              Rewrite ingredients
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default IngredientsListItems;
