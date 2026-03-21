import React from "react";
import { getRecipeFromMistral } from "./ai";

function parseRecipeMarkdown(text) {
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (/^\*\*(.+)\*\*$/.test(line)) {
      blocks.push({
        type: "h2",
        content: line.replace(/^\*\*(.+)\*\*$/, "$1").trim(),
      });
      i += 1;
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      const level = Math.min(6, (line.match(/^#+/)?.[0]?.length ?? 1) + 1);
      blocks.push({
        type: `h${level}`,
        content: line.replace(/^#{1,6}\s+/, "").trim(),
      });
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraph = [];
    while (i < lines.length && lines[i].trim()) {
      const currentLine = lines[i].trim();
      if (
        /^\*\*(.+)\*\*$/.test(currentLine) ||
        /^#{1,6}\s+/.test(currentLine) ||
        /^[-*]\s+/.test(currentLine) ||
        /^\d+\.\s+/.test(currentLine)
      ) {
        break;
      }
      paragraph.push(currentLine);
      i += 1;
    }
    blocks.push({ type: "p", content: paragraph.join(" ") });
  }

  return blocks;
}

function Recipe({ ingredients = [] }) {
  const [loading, setLoading] = React.useState(false);
  const [recipeText, setRecipeText] = React.useState("");
  const [error, setError] = React.useState(null);
  const parsedRecipe = React.useMemo(
    () => parseRecipeMarkdown(recipeText),
    [recipeText],
  );

  React.useEffect(() => {
    let mounted = true;
    async function fetchRecipe() {
      setLoading(true);
      setError(null);
      try {
        const res = await getRecipeFromMistral(ingredients);
        if (!mounted) return;
        setRecipeText(res || "No recipe returned.");
      } catch (err) {
        if (!mounted) return;
        setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchRecipe();
    return () => {
      mounted = false;
    };
  }, [ingredients]);

  return (
    <section>
      <h2>Chef Claude Recommends:</h2>
      <article className="suggested-recipe-container" aria-live="polite">
        {loading && <p>Generating recipe… please wait.</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {!loading && !error && recipeText && (
          <div className="ai-recipe">
            {parsedRecipe.map((block, index) => {
              if (block.type === "h2") return <h2 key={index}>{block.content}</h2>;
              if (block.type === "h3") return <h3 key={index}>{block.content}</h3>;
              if (block.type === "h4") return <h4 key={index}>{block.content}</h4>;
              if (block.type === "h5") return <h5 key={index}>{block.content}</h5>;
              if (block.type === "h6") return <h6 key={index}>{block.content}</h6>;
              if (block.type === "ul") {
                return (
                  <ul key={index}>
                    {block.items.map((item, itemIndex) => (
                      <li key={`${index}-${itemIndex}`}>{item}</li>
                    ))}
                  </ul>
                );
              }
              if (block.type === "ol") {
                return (
                  <ol key={index}>
                    {block.items.map((item, itemIndex) => (
                      <li key={`${index}-${itemIndex}`}>{item}</li>
                    ))}
                  </ol>
                );
              }
              return <p key={index}>{block.content}</p>;
            })}
          </div>
        )}
      </article>
    </section>
  );
}

export default Recipe;
