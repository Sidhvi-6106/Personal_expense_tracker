# Personal Expense Tracker

A full-stack personal finance application for tracking income, expenses, EMIs, bill reminders, notifications, reports, and AI-assisted financial suggestions. The project is split into a React/Vite frontend and an Express/MongoDB backend.

## Project Structure

```text
expense-tracker/
  backend/      Express API, MongoDB models, authentication, AI routes
  frontend/     React Vite application, pages, charts, state management
  README.md     Overall project documentation
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Zustand, Axios |
| Styling | Tailwind CSS 4, custom CSS |
| Charts | Chart.js, react-chartjs-2 |
| UI Helpers | lucide-react icons, react-hot-toast |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcryptjs, HTTP-only cookie support |
| AI | Groq SDK and Groq OpenAI-compatible API |
| Deployment | Vercel frontend rewrites, Render backend |

## Main Features

- User registration and login with JWT authentication.
- Protected dashboard routes for logged-in users.
- Profile management with username, phone number, city, occupation, currency, and monthly income.
- Add, edit, view, and soft-delete income or expense transactions.
- Transaction history and spending summaries.
- EMI tracker with due dates, paid/unpaid status, and payment automation.
- Bill reminder system with recurring monthly, quarterly, and yearly bills.
- Notifications for upcoming bills, EMIs, and budget usage.
- Analytics and reports for financial health, expense ratio, EMI ratio, savings, and category spending.
- AI suggestions and chatbot support for finance-related questions.
- Local settings such as theme, compact mode, notifications, email summaries, and AI insight visibility.
- Vercel rewrite setup so the deployed frontend can call the Render backend through relative API paths.

## Prerequisites

Install these before running the project:

- Node.js 18 or newer
- npm
- MongoDB Atlas account or local MongoDB connection string
- Optional: Groq API key for AI suggestions and chatbot responses

## Quick Start

Open two terminals from the project root.

### 1. Start the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=4000
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key_optional
FRONTEND_URL=http://localhost:5173
```

Run the API:

```bash
npm run dev
```

The backend should run at:

```text
http://localhost:4000
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend should run at:

```text
http://localhost:5173
```

## Local Development Flow

1. Run the backend on port `4000`.
2. Run the frontend on port `5173`.
3. Register a user from the frontend.
4. Add transactions, EMIs, and bill reminders.
5. Visit dashboard, analytics, reports, notifications, summary, and history pages.

The frontend uses Vite proxy rules for these API prefixes:

```text
/auth-api
/transactions-api
/emi-api
/bill-reminder-api
/analytics-api
/ai-api
```

## Available Commands

### Backend

```bash
cd backend
npm install
npm run dev
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

## Environment Variables

### Backend

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | Recommended | API port. Use `4000` for local frontend proxy compatibility. |
| `DB_URL` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Secret used to sign login tokens. |
| `GROQ_API_KEY` | Optional | Enables AI suggestions, analytics, and chatbot responses. |
| `FRONTEND_URL` | Recommended | Allowed frontend origin for CORS, especially in production. |
| `NODE_ENV` | Optional | Use `production` for secure cross-site cookies in deployment. |

### Frontend

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Optional | Absolute backend URL. Leave empty when using Vite proxy locally or Vercel rewrites in production. |

## API Overview

| Module | Base Path | Purpose |
| --- | --- | --- |
| Auth | `/auth-api` | Register, login, logout, profile, password changes |
| Transactions | `/transactions-api` | Income and expense CRUD |
| EMI | `/emi-api` | EMI CRUD and paid/unpaid status |
| Bill Reminders | `/bill-reminder-api` | Recurring bill reminder CRUD and payment status |
| Analytics | `/analytics-api` | AI analysis and quick financial health |
| AI | `/ai-api` | Suggestions and chatbot |

## Deployment Notes

The frontend includes `frontend/vercel.json` rewrites that forward API calls to:

```text
https://personal-expense-tracker-3dge.onrender.com
```

If the backend deployment URL changes, update all rewrite destinations in `frontend/vercel.json`.

For backend deployment, set production environment variables in the hosting provider:

```env
DB_URL=your_production_mongodb_url
JWT_SECRET=your_secure_secret
GROQ_API_KEY=your_groq_key_optional
FRONTEND_URL=your_deployed_frontend_url
NODE_ENV=production
```

## More Documentation

- Frontend details: [frontend/README.md](frontend/README.md)
- Backend details: [backend/README.md](backend/README.md)
