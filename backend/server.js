// import exp from 'express'
// import {connect } from "mongoose"
// import {config} from "dotenv"
// import { authRouter } from './routes/auth.js'

// config() //process.env
// const app=exp()
// //connect to db
// app.use(exp.json())
// //connect apis
// app.use('/auth-api',authRouter)

// //connect db function expression
// const connectdb=async()=>{
//     try{
//         await connect(process.env.DB_URL)
//         console.log("DataBase Connection Success")
//         app.listen(process.env.PORT,()=>console.log("Server Started"))
//     }catch(err){
//         console.log("err in connecting database",err)
//     }
// }

// connectdb()
import exp from 'express'
import {connect } from "mongoose"
import {config} from "dotenv"
import { authRouter } from './routes/auth.js'
import { transactionRouter } from './routes/transactions.js'
import { emiRouter } from './routes/emi.js'
import { analyticsRouter } from './routes/analytics.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

config() //process.env
const app=exp()
app.use(cors())
//connect to db
app.use(exp.json())
app.use(cookieParser()) // Add cookie-parser middleware
//connect apis  
app.use('/auth-api',authRouter)
app.use('/transactions-api',transactionRouter)
app.use('/emi-api',emiRouter)
app.use('/analytics-api',analyticsRouter)

//connect db function expression
const connectdb=async()=>{
    try{
        await connect(process.env.DB_URL)
        console.log("DataBase Connection Success")
        app.listen(process.env.PORT,()=>console.log("Server Started"))
    }catch(err){
        console.log("err in connecting database",err)
    }
}

connectdb()