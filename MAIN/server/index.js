// // import express from "express";
// // import fetch from "node-fetch";

// // const app = express();
// // app.use(express.json());

// // const PORT = process.env.PORT || 3001;

// // // Health check
// // app.get("/api/health", (req, res) => {
// //   res.json({ ok: true, hfTokenPresent: Boolean(process.env.HF_ACCESS_TOKEN) });
// // });

// // app.post("/api/hf", async (req, res) => {
// //   try {
// //     if (!process.env.HF_ACCESS_TOKEN) {
// //       console.warn(
// //         "HF_ACCESS_TOKEN not set in environment — proxy will forward unauthenticated request",
// //       );
// //     }

// //     const resp = await fetch(
// //       "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
// //       {
// //         method: "POST",
// //         headers: {
// //           Authorization: `Bearer ${process.env.HF_ACCESS_TOKEN}`,
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify(req.body),
// //       },
// //     );

// //     const text = await resp.text();
// //     // Try to parse JSON, but return raw text if it's not JSON (avoids JSON.parse errors)
// //     let parsed;
// //     try {
// //       parsed = text ? JSON.parse(text) : null;
// //     } catch (e) {
// //       parsed = null;
// //     }

// //     if (!resp.ok) {
// //       console.error(`HF upstream returned ${resp.status}: ${text}`);
// //       return res.status(resp.status).send(parsed || text || "");
// //     }

// //     return res.json(parsed || text);
// //   } catch (err) {
// //     console.error("Proxy error:", err);
// //     res.status(500).json({ error: "Proxy error" });
// //   }
// // });

// // app.listen(PORT, () =>
// //   console.log(`HF proxy running on http://localhost:${PORT}`),
// // );
// /* eslint-env node */
// /* global process */
// import express from "express";
// import fetch from "node-fetch";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();
// app.use(express.json());

// function toErrorMessage(errorValue, fallback) {
//   if (typeof errorValue === "string" && errorValue.trim()) return errorValue;
//   if (Array.isArray(errorValue) && errorValue.length > 0) {
//     const first = errorValue[0];
//     if (typeof first === "string") return first;
//     if (first && typeof first.message === "string") return first.message;
//   }
//   if (
//     errorValue &&
//     typeof errorValue === "object" &&
//     typeof errorValue.message === "string"
//   ) {
//     return errorValue.message;
//   }
//   return fallback;
// }

// app.post("/api/hf", async (req, res) => {
//   try {
//     if (!process.env.HF_ACCESS_TOKEN) {
//       return res.status(500).json({
//         error: "HF_ACCESS_TOKEN is missing in server environment.",
//       });
//     }

//     const response = await fetch(
//       "https://router.huggingface.co/v1/chat/completions",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${process.env.HF_ACCESS_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(req.body),
//       },
//     );

//     const text = await response.text();
//     let data = null;

//     try {
//       data = text ? JSON.parse(text) : null;
//     } catch {
//       data = null;
//     }

//     if (!response.ok) {
//       const hfMessage = toErrorMessage(
//         data?.error,
//         `HF upstream error (${response.status})`,
//       );
//       return res.status(response.status).json({
//         error: hfMessage,
//         details: data || text || null,
//       });
//     }

//     return res.json(data || { raw: text });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// });

// app.listen(3001, () => console.log("Backend running on http://localhost:3001"));

/* eslint-env node */
/* global process */
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors"; // 1. استيراد حزمة cors هنا

dotenv.config();

const app = express();

// 2. تفعيل حزمة CORS للسماح بالطلبات الخارجية من الفرونت إند
app.use(cors());
app.use(express.json());

function toErrorMessage(errorValue, fallback) {
  if (typeof errorValue === "string" && errorValue.trim()) return errorValue;
  if (Array.isArray(errorValue) && errorValue.length > 0) {
    const first = errorValue[0];
    if (typeof first === "string") return first;
    if (first && typeof first.message === "string") return first.message;
  }
  if (
    errorValue &&
    typeof errorValue === "object" &&
    typeof errorValue.message === "string"
  ) {
    return errorValue.message;
  }
  return fallback;
}

// إضافة مسار اختبار بسيط (اختياري للتأكد من عمل السيرفر بعد الرفع)
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running fine!" });
});

app.post("/api/hf", async (req, res) => {
  try {
    if (!process.env.HF_ACCESS_TOKEN) {
      return res.status(500).json({
        error: "HF_ACCESS_TOKEN is missing in server environment.",
      });
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      },
    );

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const hfMessage = toErrorMessage(
        data?.error,
        `HF upstream error (${response.status})`,
      );
      return res.status(response.status).json({
        error: hfMessage,
        details: data || text || null,
      });
    }

    return res.json(data || { raw: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. جعل المنفذ ديناميكياً ليقرأ المنفذ الذي تفرضه منصة الرفع (Render تستخدم البورت 10000 أو غيره تلقائياً)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
