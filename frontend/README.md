# Expense Tracker Frontend

React/Vite frontend for the Personal Expense Tracker. It provides the user interface for authentication, dashboard analytics, transactions, EMIs, bill reminders, notifications, reports, profile management, settings, and the AI chatbot.

## Tech Stack

- React 19
- Vite 7
- React Router 7
- Zustand for global finance/auth state
- Axios for API requests
- Tailwind CSS 4 with custom CSS
- Chart.js and react-chartjs-2 for charts
- lucide-react for icons
- react-hot-toast for notifications

## Dependencies

| Package | Purpose |
| --- | --- |
| `react`, `react-dom` | Core UI framework |
| `vite` | Development server and build tool |
| `@vitejs/plugin-react` | React support for Vite |
| `react-router`, `react-router-dom` | App routing and protected routes |
| `zustand` | Global state management |
| `axios` | HTTP client |
| `chart.js`, `react-chartjs-2` | Dashboard and report charts |
| `lucide-react` | Icons |
| `react-hot-toast` | Toast notifications |
| `tailwindcss`, `@tailwindcss/vite` | Styling |
| `eslint` and related plugins | Code linting |

## Folder Structure

```text
frontend/
  public/
  src/
    components/
      BalanceCard.jsx
      ChartContainer.jsx
      Chatbot.jsx
      Header.jsx
      Login.jsx
      Navbar.jsx
      Register.jsx
      RootLayout.jsx
      Sidebar.jsx
      TransactionForm.jsx
      TransactionList.jsx
    context/
      FinanceContext.jsx
    pages/
      AddTransaction.jsx
      Analytics.jsx
      BillRemainder.jsx
      Dashboard.jsx
      EMITracker.jsx
      History.jsx
      Notification.jsx
      Profile.jsx
      Reports.jsx
      Setting.jsx
      Summary.jsx
      TransactionHistory.jsx
    utils/
      apiBase.js
      currencyFormatter.jsx
      dateFormatter.jsx
    App.jsx
    main.jsx
  vercel.json
  vite.config.js
```

## Environment Variables

Create `frontend/.env` only when you need to point the app directly to an absolute backend URL.

```env
VITE_API_URL=http://localhost:4000
```

For normal local development, this can be left empty because `vite.config.js` proxies API requests to `http://localhost:4000`.

For Vercel deployment, keep `VITE_API_URL` empty if you want to use `vercel.json` rewrites.

## Installation

```bash
cd frontend
npm install
```

## Run Commands

Start local development:

```bash
npm run dev
```

Build production files:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Local Development

1. Start the backend first on port `4000`.
2. Start the frontend:

```bash
cd frontend
npm run dev
```

3. Open:

```text
http://localhost:5173
```

The Vite dev server proxies these backend paths:

```text
/auth-api
/transactions-api
/emi-api
/analytics-api
/ai-api
/bill-reminder-api
```

## Main Pages

| Route | Page | Purpose |
| --- | --- | --- |
| `/login` | Login | Sign in existing users |
| `/register` | Register | Create a new account |
| `/dashboard` | Dashboard | Overview of balances, recent activity, and insights |
| `/add-transaction` | Add Transaction | Add income or expense records |
| `/history` | Transaction History | View and manage transactions |
| `/analytics` | Analytics | AI suggestions and financial analysis |
| `/emi-tracker` | EMI Tracker | Manage loan/EMI records |
| `/bill-remainder` | Bill Reminder | Manage upcoming recurring bills |
| `/profile` | Profile | Edit profile and financial details |
| `/settings` | Settings | Theme, notifications, compact mode, and AI visibility |
| `/reports` | Reports | Visual finance reports |
| `/summary` | Summary | Consolidated finance summary |
| `/notifications` | Notifications | Budget, bill, and EMI alerts |

## Frontend Features

- Protected routing using auth state from Zustand.
- Persistent login state using local storage.
- API calls with credentials enabled for cookie support.
- Transaction create, update, and delete flows.
- EMI create, update, delete, paid/unpaid, and auto-payment transaction flows.
- Bill reminder create, update, delete, paid/unpaid, and next due-date calculation.
- Notification generation for bills due soon, EMIs due soon, and high budget usage.
- Custom alerts and dismissed notification tracking in local storage.
- AI finance suggestions with fallback messaging.
- Chatbot UI for finance-project questions.
- Theme support with dark mode class handling.
- Toast feedback for user actions.

## API Configuration

The frontend imports API configuration from:

```text
src/utils/apiBase.js
```

Behavior:

- If `VITE_API_URL` is set, API calls use that base URL.
- If `VITE_API_URL` is empty, API calls use relative paths.
- In production, a localhost `VITE_API_URL` is ignored so deployed builds do not accidentally call a local backend.

## Deployment Notes

This Vite app is configured for Vercel. API requests use relative paths such as:

```text
/auth-api
/transactions-api
/emi-api
/bill-reminder-api
/analytics-api
/ai-api
```

`vercel.json` rewrites those paths to the deployed backend:

```text
https://personal-expense-tracker-3dge.onrender.com
```

If the backend URL changes, update every destination in `vercel.json` and redeploy the frontend.

## Build Output

After running:

```bash
npm run build
```

Vite creates the production build in:

```text
frontend/dist/
```
