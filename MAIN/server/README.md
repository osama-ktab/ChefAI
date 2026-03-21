Run the proxy server locally to keep your Hugging Face token secret.

Steps:

1. Copy `.env.example` to `.env` and set `HF_ACCESS_TOKEN`.
2. Install deps and run:

```bash
cd server
npm install express node-fetch
node index.js
```

3. From the frontend, call `/api/hf` on this server instead of calling HF directly.
