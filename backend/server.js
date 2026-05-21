import exp from 'express'
import { connect } from "mongoose"
import { config } from "dotenv"
import { authRouter } from './routes/auth.js'
import { transactionRouter } from './routes/transactions.js'
import { emiRouter } from './routes/emi.js'
import { analyticsRouter } from './routes/analytics.js'
import { aiRouter } from './routes/ai.js'
import { billReminderRouter } from './routes/billReminder.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

// Load environment variables
config()

const app = exp()
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration setup
const allowedOrigins = [
    'http://localhost:5173', // Vite local development port
    'http://localhost:3000', 
    process.env.FRONTEND_URL  // Points to your Vercel deployment
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like Postman or server-to-server)
        if (!origin) return callback(null, true);
        
        // Check if origin is allowed, or if we are in production and it matches FRONTEND_URL
        if (allowedOrigins.indexOf(origin) !== -1 || (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)) {
            return callback(null, true);
        } else {
            const msg = `CORS Error: The origin ${origin} is not allowed access.`;
            return callback(new Error(msg), false);
        }
    },
    credentials: true
}))

// Middleware
app.use(exp.json({ limit: '10mb' }))
app.use(cookieParser())

// ─── ADDED: ROOT ROUTE HANDLER ─────────────────────────────────
// This removes the "Cannot GET /" error and helps Render healthchecks
app.get('/', (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Expense Tracker API is live and healthy!"
    });
});

// API routes
app.use('/auth-api', authRouter)
app.use('/transactions-api', transactionRouter)
app.use('/emi-api', emiRouter)
app.use('/analytics-api', analyticsRouter)
app.use('/ai-api', aiRouter)
app.use('/bill-reminder-api', billReminderRouter)

// Database connection & server initialization
const connectdb = async () => {
    try {
        await connect(process.env.DB_URL)
        console.log("Database Connection Success")
        
        // Start listening ONLY after a successful database connection
        app.listen(PORT, () => {
            console.log(`Server running securely on port ${PORT}`);
        })
    } catch (err) {
        console.log("Error in connecting database:", err)
        // Note: Do not use process.exit(1) on Render free tier right away, 
        // as it will cause an infinite crash loop. Letting it log is safer.
    }
}

connectdb()