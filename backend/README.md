# Expense Tracker Backend

Express and MongoDB API for the Personal Expense Tracker application. It handles authentication, user profiles, transactions, EMI records, bill reminders, analytics, and AI-powered finance suggestions.

## Tech Stack

- Node.js with ES modules
- Express 5
- MongoDB and Mongoose
- JWT authentication
- bcryptjs password hashing
- cookie-parser for auth cookies
- cors for frontend access
- dotenv for environment configuration
- Groq SDK / Groq OpenAI-compatible API for AI features
- nodemon for development

## Dependencies

| Package | Purpose |
| --- | --- |
| `express` | API server and routing |
| `mongoose` | MongoDB models and database queries |
| `dotenv` | Loads `.env` configuration |
| `cors` | Allows frontend origins |
| `cookie-parser` | Reads and clears auth cookies |
| `jsonwebtoken` | Creates and verifies JWT tokens |
| `bcryptjs` | Hashes and verifies passwords |
| `groq-sdk` | AI chatbot and suggestions |
| `openai` | OpenAI-compatible AI support |
| `@google/generative-ai` | Google generative AI SDK dependency |
| `nodemon` | Restarts server during development |

## Folder Structure

```text
backend/
  middleware/
    checkUser.js
  models/
    User.js
    Transaction.js
    EMI.js
    BillReminder.js
  routes/
    auth.js
    transactions.js
    emi.js
    billReminder.js
    analytics.js
    ai.js
  req.http
  server.js
  package.json
```

## Environment Variables

Create a `.env` file inside `backend/`.

```env
PORT=4000
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key_optional
FRONTEND_URL=http://localhost:5173
```

For production, also set:

```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

## Installation

```bash
cd backend
npm install
```

## Run Commands

Start development server with automatic restart:

```bash
npm run dev
```

Start production server:

```bash
npm start
```

Default server behavior:

- Uses `PORT` from `.env`.
- Falls back to port `5000` if `PORT` is missing.
- For this project, use `PORT=4000` locally because the frontend Vite proxy points to `http://localhost:4000`.

## Health Check

```http
GET /
```

Successful response:

```json
{
  "status": "success",
  "message": "Expense Tracker API is live and healthy!"
}
```

## API Routes

### Authentication: `/auth-api`

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth` | Register a new user |
| `POST` | `/auth/login` | Login and receive token |
| `GET` | `/auth/profile` | Get logged-in user profile |
| `PUT` | `/auth/profile` | Update profile |
| `PUT` | `/auth/change-password` | Change password |
| `GET` | `/logout` | Logout user |

### Transactions: `/transactions-api`

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/transactions` | Add income or expense |
| `GET` | `/transactions` | Get active user transactions |
| `GET` | `/transactions/:id` | Get one transaction |
| `PUT` | `/transactions/:id` | Update transaction |
| `PATCH` | `/transactions/:id` | Soft-delete or restore transaction |

### EMI: `/emi-api`

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/emi` | Add EMI record |
| `GET` | `/emi` | Get active EMI records |
| `PUT` | `/emi/:id` | Update EMI record |
| `PATCH` | `/emi/:id` | Soft-delete or restore EMI |
| `PATCH` | `/emi/pay/:id` | Mark EMI paid or unpaid |

### Bill Reminders: `/bill-reminder-api`

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/bill-reminder` | Add bill reminder |
| `GET` | `/bill-reminder` | Get active bill reminders |
| `PUT` | `/bill-reminder/:id` | Update bill reminder |
| `PATCH` | `/bill-reminder/:id` | Soft-delete or restore reminder |
| `PATCH` | `/bill-reminder/pay/:id` | Mark bill paid and advance due date |

### Analytics: `/analytics-api`

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/ai-analysis` | Returns financial health metrics, alerts, and AI insights when available |
| `GET` | `/quick-health` | Returns expense ratio, EMI ratio, savings, and risk level |

### AI: `/ai-api`

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/suggestions` | Generates AI or fallback finance suggestions |
| `POST` | `/chat-bot` | Answers finance-project questions using user data |

## Data Models

### User

Stores username, email, hashed password, phone number, monthly income, occupation, city, and currency.

### Transaction

Stores amount, category, type, date, description, merchant, active status, and owner user ID.

### EMI

Stores loan amount, interest rate, tenure, start date, due date, paid status, reminder dates, and owner user ID.

### BillReminder

Stores title, category, amount, due date, frequency, paid status, active status, and owner user ID.

## Security Notes

- Passwords are hashed with bcryptjs before storage.
- Protected routes use `checkUser` middleware.
- JWT tokens are accepted through the `Authorization: Bearer <token>` header and login also sets a cookie.
- CORS allows local Vite origins and the configured `FRONTEND_URL`.
- In production, cookies use `sameSite: "none"` and `secure: true`.

## Extra Features Added

- Root health check route for deployment health checks.
- Soft delete for transactions, EMIs, and bill reminders.
- Paid/unpaid workflows for EMIs and bills.
- Automatic bill due-date advancement after payment.
- AI fallback responses when Groq is not configured or unavailable.
- Guardrails so the chatbot answers only project finance-related questions.
- Smart analytics for expense ratio, EMI ratio, usage, savings, top categories, alerts, and health score.

## Testing API Requests

The `req.http` file contains sample API requests for registration, login, profile, transactions, analytics, EMI, and logout. Use it with a REST Client extension in VS Code.
