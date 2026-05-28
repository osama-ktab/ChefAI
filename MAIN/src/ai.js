// // // Do not import `@huggingface/inference` at top-level — it's intended for
// // // server-side usage and can break the client bundle. We'll dynamically
// // // import it only when needed on the server.

// const SYSTEM_PROMPT = `
// You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients.
// You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention,
// but try not to include too many extra ingredients. Use simple headings and lists, but do not use bold markers like ** or __.
// `;

// function extractErrorMessage(data, status) {
//   if (typeof data?.error === "string" && data.error.trim()) {
//     return data.error;
//   }
//   if (
//     data?.error &&
//     typeof data.error === "object" &&
//     typeof data.error.message === "string"
//   ) {
//     return data.error.message;
//   }
//   if (typeof data?.details === "string" && data.details.trim()) {
//     return data.details;
//   }
//   if (
//     data?.details &&
//     typeof data.details === "object" &&
//     typeof data.details.error === "string"
//   ) {
//     return data.details.error;
//   }
//   return `Request failed with status ${status}`;
// }

// export async function getRecipeFromMistral(ingredientsArr) {
//   const ingredientsString = ingredientsArr.join(", ");

//   const payload = {
//     model: "meta-llama/Llama-3.1-8B-Instruct",
//     messages: [
//       { role: "system", content: SYSTEM_PROMPT },
//       {
//         role: "user",
//         content: `I have ${ingredientsString}. Please give me a recipe.`,
//       },
//     ],
//     max_tokens: 1024,
//   };

//   try {
//     const resp = await fetch("/api/hf", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     const rawText = await resp.text();
//     let data = null;

//     try {
//       data = rawText ? JSON.parse(rawText) : null;
//     } catch {
//       data = null;
//     }

//     if (!resp.ok) {
//       const message = extractErrorMessage(data, resp.status);
//       throw new Error(message);
//     }

//     if (data?.choices?.[0]?.message?.content) {
//       return data.choices[0].message.content;
//     }

//     if (typeof data?.generated_text === "string") {
//       return data.generated_text;
//     }

//     if (typeof rawText === "string" && rawText.trim()) {
//       return rawText;
//     }

//     throw new Error("No recipe content returned from API.");
//   } catch (err) {
//     console.error("Frontend error:", err);
//     return "Failed to fetch recipe.";
//   }
// }

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients.
You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, 
but try not to include too many extra ingredients. Use simple headings and lists, but do not use bold markers like ** or __.
`;

export async function getRecipeFromMistral(ingredientsArr) {
  const ingredientsString = ingredientsArr.join(", ");

  const payload = {
    model: "meta-llama/Llama-3.1-8B-Instruct",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `I have ${ingredientsString}. Please give me a recipe.`,
      },
    ],
    max_tokens: 1024,
  };

  try {
    // نقرأ رابط الباك إند من متغيرات البيئة، وإذا لم يكن موجوداً (محلياً) يستخدم localhost
    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const resp = await fetch(`${BACKEND_URL}/api/hf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const rawText = await resp.text();
    let data = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = null;
    }

    if (!resp.ok) {
      throw new Error("Request failed");
    }

    if (data?.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }

    if (typeof data?.generated_text === "string") {
      return data.generated_text;
    }

    return rawText;
  } catch (err) {
    console.error("Frontend error:", err);
    return "Failed to fetch recipe.";
  }
}
