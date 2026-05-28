// // Do not import `@huggingface/inference` at top-level — it's intended for
// // server-side usage and can break the client bundle. We'll dynamically
// // import it only when needed on the server.

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients.
You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, 
but try not to include too many extra ingredients. Use simple headings and lists, but do not use bold markers like ** or __.
`;

function extractErrorMessage(data, status) {
  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error;
  }
  if (
    data?.error &&
    typeof data.error === "object" &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }
  if (typeof data?.details === "string" && data.details.trim()) {
    return data.details;
  }
  if (
    data?.details &&
    typeof data.details === "object" &&
    typeof data.details.error === "string"
  ) {
    return data.details.error;
  }
  return `Request failed with status ${status}`;
}

// // console.log("HF TOKEN FROM ENV:", import.meta.env.VITE_HF_ACCESS_TOKEN);

// // 🚨👉 ALERT: Read message below! You've been warned! 👈🚨
// // If you're following along on your local machine instead of
// // here on Scrimba, make sure you don't commit your API keys
// // to any repositories and don't deploy your project anywhere
// // live online. Otherwise, anyone could inspect your source
// // and find your API keys/tokens. If you want to deploy
// // this project, you'll need to create a backend of some kind,
// // either your own or using some serverless architecture where
// // your API calls can be made. Doing so will keep your
// // API keys private.

// // Make sure you set an environment variable for HF access token.
// // For Vite (client-side) put the token in a .env file as:
// // VITE_HF_ACCESS_TOKEN=hf_...
// // NOTE: using the token client-side exposes it to users. For a
// // production app keep the token on a server and proxy requests.
// const HF_TOKEN =
//   typeof window !== "undefined"
//     ? import.meta.env.VITE_HF_ACCESS_TOKEN ||
//       (typeof process !== "undefined" &&
//         process.env &&
//         process.env.HF_ACCESS_TOKEN)
//     : typeof process !== "undefined" &&
//       process.env &&
//       process.env.HF_ACCESS_TOKEN;

// if (!HF_TOKEN) {
//   console.warn(
//     "Hugging Face token missing. Set VITE_HF_ACCESS_TOKEN in .env or HF_ACCESS_TOKEN in environment.",
//   );
// }

// let hf = null;

// export async function getRecipeFromMistral(ingredientsArr) {
//   const ingredientsString = ingredientsArr.join(", ");
//   const payload = {
//     model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
//     messages: [
//       { role: "system", content: SYSTEM_PROMPT },
//       {
//         role: "user",
//         content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!`,
//       },
//     ],
//     max_tokens: 1024,
//   };

//   try {
//     // If running in the browser, prefer calling a local proxy at /api/hf
//     // if (typeof window !== "undefined") {
//     //   try {
//     //     const resp = await fetch("/api/hf", {
//     //       method: "POST",
//     //       headers: { "Content-Type": "application/json" },
//     //       body: JSON.stringify(payload),
//     //     });
//     //     const data = await resp.json();
//     //     // Try common response shapes
//     //     if (data.choices && data.choices[0] && data.choices[0].message)
//     //       return data.choices[0].message.content;
//     //     if (data.generated_text) return data.generated_text;
//     //     if (data.text) return data.text;
//     //     return data;
//     //   } catch (proxyErr) {
//     //     console.warn(
//     //       "Proxy call failed, falling back to direct HF client if available:",
//     //       proxyErr.message,
//     //     );
//     //   }
//     // }

//     // Fallback to direct HfInference usage (server-side)
//     if (!HF_TOKEN)
//       throw new Error("No HF token available to call inference directly.");

//     if (!hf) {
//       // dynamic import only on server to avoid bundling into client
//       const mod = await import("@huggingface/inference");
//       const HfInference =
//         mod.HfInference || mod.default?.HfInference || mod.default;
//       hf = new HfInference(HF_TOKEN);
//     }
//     // const response = await hf.chatCompletion(payload);
//     // return response.choices[0].message.content;

//     const response = await hf.textGeneration({
//       model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
//       inputs: `
// ${SYSTEM_PROMPT}

// User ingredients: ${ingredientsString}
// Give me a recipe.
// `,
//       parameters: {
//         max_new_tokens: 1024,
//         temperature: 0.7,
//       },
//     });

//     return response.generated_text;
//   } catch (err) {
//     console.error(err);
//   }
// }
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
    const resp = await fetch("/api/hf", {
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
      const message = extractErrorMessage(data, resp.status);
      throw new Error(message);
    }

    if (data?.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }

    if (typeof data?.generated_text === "string") {
      return data.generated_text;
    }

    if (typeof rawText === "string" && rawText.trim()) {
      return rawText;
    }

    throw new Error("No recipe content returned from API.");
  } catch (err) {
    console.error("Frontend error:", err);
    return "Failed to fetch recipe.";
  }
}
