# Expense Tracker Frontend

## Deployment Notes

This Vite app is deployed on Vercel. API requests use relative paths such as `/auth-api`, `/transactions-api`, `/emi-api`, `/bill-reminder-api`, `/analytics-api`, and `/ai-api`.

`vercel.json` rewrites those paths to the deployed backend:

`https://personal-expense-tracker-3dge.onrender.com`

If the backend URL changes, update every destination in `vercel.json` and redeploy the frontend.

Optional: set `VITE_API_URL` only when you want the frontend to call an absolute backend URL directly. Leave it empty when using Vercel rewrites.

## Local Development

Run the backend on port `4000`, then start the frontend:

```bash
npm run dev
```

The Vite dev proxy forwards API requests to `http://localhost:4000`.
