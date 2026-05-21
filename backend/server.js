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

config()

const app = exp()
const PORT = process.env.PORT || 4000

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}))

// Middleware
app.use(exp.json({ limit: '10mb' }))
app.use(cookieParser())

// API routes
app.use('/auth-api', authRouter)
app.use('/transactions-api', transactionRouter)
app.use('/emi-api', emiRouter)
app.use('/analytics-api', analyticsRouter)
app.use('/ai-api', aiRouter)
app.use('/bill-reminder-api', billReminderRouter)

// Database connection & server start
const connectdb = async () => {
    try {
        await connect(process.env.DB_URL)
        console.log("Database Connection Success")
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (err) {
        console.log("Error in connecting database:", err)
    }
}

connectdb()
