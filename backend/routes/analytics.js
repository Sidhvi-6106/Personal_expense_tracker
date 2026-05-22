import express from 'express'
import mongoose from 'mongoose'
import Transaction from '../models/Transaction.js'
import EMI from '../models/EMI.js'
import User from '../models/User.js'
import { checkUser } from '../middleware/checkUser.js'

export const analyticsRouter = express.Router()


const calculateEMI = (principal, annualRate, months) => {
  const monthlyRate = annualRate / 12 / 100;

  const emi =
    (principal *
      monthlyRate *
      Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return Number(emi.toFixed(2));
};


// Calculate key financial metrics with intelligent interpretation
const calculateMetrics = (user, transactions, emis) => {
  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0)
  
  // Calculate EMI metrics properly
  const emiDetails = emis.map(e => {
  const monthlyEMI = calculateEMI(
    e.loanAmount,
    e.interestRate,
    e.tenureMonths
  );

  return {
    monthlyEMI,
    remainingMonths: e.remainingMonths || e.tenureMonths,
    totalRemaining:
      monthlyEMI *
      (e.remainingMonths || e.tenureMonths)
  };
});
  
  const totalMonthlyEMI = emiDetails.reduce((sum, e) => sum + e.monthlyEMI, 0)
  const totalRemainingEMI = emiDetails.reduce((sum, e) => sum + e.totalRemaining, 0)
  
  // Calculate key ratios
  const expenseRatio = user.monthlyIncome > 0 
    ? (totalExpenses / user.monthlyIncome) * 100 
    : 0
  
  const emiRatio = user.monthlyIncome > 0 
    ? (totalMonthlyEMI / user.monthlyIncome) * 100 
    : 0
  
  const totalUsage = expenseRatio + emiRatio
  const savings = user.monthlyIncome - (totalExpenses + totalMonthlyEMI)
  const savingsRatio = user.monthlyIncome > 0 
    ? (savings / user.monthlyIncome) * 100 
    : 0

  // Category breakdown
  const categorySpending = {}
  transactions.forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount
  })

  // Sort categories by amount
  const topCategories = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: user.monthlyIncome > 0 ? (amount / user.monthlyIncome) * 100 : 0
    }))

  return {
    metrics: {
      expenseRatio: Math.round(expenseRatio),
      emiRatio: Math.round(emiRatio),
      totalUsage: Math.round(totalUsage),
      savings: Math.round(savings),
      savingsRatio: Math.round(savingsRatio),
      monthlyIncome: user.monthlyIncome,
      totalExpenses,
      totalMonthlyEMI,
      totalRemainingEMI: Math.round(totalRemainingEMI)
    },
    interpretations: {
      expenseRatio: expenseRatio > 70 ? 'high' : expenseRatio > 50 ? 'moderate' : 'good',
      emiRatio: emiRatio > 40 ? 'high' : emiRatio > 20 ? 'moderate' : 'ok',
      totalUsage: totalUsage > 90 ? '🚨 risky' : totalUsage > 80 ? '⚠️ caution' : '✅ stable',
      savings: savings < 5000 ? 'very low' : savings < 10000 ? 'low' : savings < 20000 ? 'moderate' : 'good'
    },
    topCategories: topCategories.slice(0, 3),
    alerts: generateAlerts({ expenseRatio, emiRatio, totalUsage, savings })
  }
}

// Generate smart alerts based on metrics
const generateAlerts = (metrics) => {
  const alerts = []
  
  if (metrics.expenseRatio > 70) {
    alerts.push({
      type: 'warning',
      message: `Expenses are ${metrics.expenseRatio}% of income - very high`,
      severity: 'high',
      action: 'Review discretionary spending'
    })
  }
  
  if (metrics.emiRatio > 40) {
    alerts.push({
      type: 'danger',
      message: `EMI burden is ${metrics.emiRatio}% - debt stress high`,
      severity: 'high',
      action: 'Consider debt consolidation'
    })
  } else if (metrics.emiRatio > 20) {
    alerts.push({
      type: 'info',
      message: `EMI ratio at ${metrics.emiRatio}% - manageable but monitor`,
      severity: 'medium'
    })
  }
  
  if (metrics.totalUsage > 90) {
    alerts.push({
      type: 'danger',
      message: `Total ${metrics.totalUsage}% income usage - critical`,
      severity: 'critical',
      action: 'Immediate budget review needed'
    })
  }
  
  if (metrics.savings < 5000) {
    alerts.push({
      type: 'warning',
      message: `Savings of ₹${metrics.savings} is very low`,
      severity: 'high',
      action: 'Build emergency fund urgently'
    })
  }
  
  return alerts
}

// Prepare AI prompt with metrics
const prepareAIPrompt = (metrics, transactions, emis, user) => {
  const recentTransactions = transactions.slice(0, 10).map(t => ({
    amount: t.amount,
    category: t.category,
    date: new Date(t.date).toLocaleDateString('en-IN')
  }))

  return `
You are a financial analyst. Analyze this user's financial data and return ONLY valid JSON.

METRICS:
${JSON.stringify(metrics, null, 2)}

RECENT TRANSACTIONS:
${JSON.stringify(recentTransactions, null, 2)}

ACTIVE EMIs: ${emis.length}

INSTRUCTIONS:
Based on the metrics above, provide insights exactly like this format:
{
  "interpretation": {
    "expenseRatio": "Correct interpretation of your data",
    "emiRatio": "Correct interpretation",
    "totalUsage": "Correct interpretation with emoji",
    "savings": "Correct interpretation"
  },
  "insights": [
    "Specific insight about their spending pattern",
    "Another data-backed insight"
  ],
  "suggestions": [
    {
      "action": "Specific actionable advice",
      "impact": "What will improve",
      "priority": "high/medium/low"
    }
  ],
  "warnings": [
    {
      "issue": "Specific risk identified",
      "urgency": "immediate/soon/future"
    }
  ],
  "monthlyBreakdown": {
    "income": ${user.monthlyIncome},
    "expenses": ${metrics.totalExpenses},
    "emi": ${metrics.totalMonthlyEMI},
    "savings": ${metrics.savings}
  },
  "healthScore": ${Math.max(0, 100 - (metrics.totalUsage - 50))}
}

Make interpretations personal and specific to their actual numbers.
`
}

// Main analytics endpoint - AI decides everything
analyticsRouter.get('/ai-analysis', checkUser, async (req, res) => {
  try {
    const userId = req.user._id
    
    // Fetch data in parallel
    const [user, transactions, emis] = await Promise.all([
      User.findById(userId),
      Transaction.find({userId,isActive: true}).sort({ date: -1 }),
      EMI.find({userId, isActive: true})
    ])

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      })
    }

    // Calculate all metrics
    const { metrics, interpretations, topCategories, alerts } = calculateMetrics(user, transactions, emis)

    // Try AI analysis, but our metrics are already smart
    let aiAnalysis = null
    try {
      const prompt = prepareAIPrompt(metrics, transactions, emis, user)
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 500,
          temperature: 0.3, // Lower temperature for consistent formatting
          messages: [
            {
              role: "system",
              content: "You are a precise financial analyst. Return ONLY valid JSON matching the requested format."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      })

      const result = await response.json()
      let aiText = result?.choices?.[0]?.message?.content || ""
      
      // Clean and parse
      aiText = aiText.replace(/```json|```/g, '').trim()
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0])
      }
    } catch (aiError) {
      console.log('AI analysis unavailable, using smart metrics')
    }

    // Format response exactly like your example
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        metrics: {
          expenseRatio: `${metrics.expenseRatio}%`,
          emiRatio: `${metrics.emiRatio}%`,
          totalUsage: `${metrics.totalUsage}%`,
          savings: `₹${metrics.savings.toLocaleString('en-IN')}`
        },
        interpretation: {
          expenseRatio: interpretations.expenseRatio,
          emiRatio: interpretations.emiRatio,
          totalUsage: interpretations.totalUsage,
          savings: interpretations.savings
        }
      },
      topSpending: topCategories,
      alerts: alerts,
      monthlyBreakdown: {
        income: `₹${user.monthlyIncome.toLocaleString('en-IN')}`,
        expenses: `₹${metrics.totalExpenses.toLocaleString('en-IN')} (${metrics.expenseRatio}%)`,
        emi: `₹${metrics.totalMonthlyEMI.toLocaleString('en-IN')} (${metrics.emiRatio}%)`,
        savings: `₹${metrics.savings.toLocaleString('en-IN')} (${metrics.savingsRatio}%)`
      }
    }

    // If AI analysis succeeded, merge it
    if (aiAnalysis) {
      response.aiInsights = aiAnalysis.insights || []
      response.aiSuggestions = aiAnalysis.suggestions || []
      response.aiWarnings = aiAnalysis.warnings || []
      response.healthScore = aiAnalysis.healthScore || Math.max(0, 100 - (metrics.totalUsage - 50))
    } else {
      // AI-driven fallback based on actual data
      response.insights = [
        metrics.expenseRatio > 70 
          ? `Your expenses are ${metrics.expenseRatio}% of income - ₹${metrics.totalExpenses.toLocaleString('en-IN')} monthly`
          : `Expenses at ${metrics.expenseRatio}% - within manageable range`,
        
        metrics.emiRatio > 0 
          ? `EMI commitment is ${metrics.emiRatio}% (₹${metrics.totalMonthlyEMI.toLocaleString('en-IN')}/month)`
          : `No active EMIs - good debt management`,
        
        metrics.totalUsage > 90
          ? `⚠️ Using ${metrics.totalUsage}% of income - critical situation`
          : `Total usage ${metrics.totalUsage}% - ${metrics.totalUsage > 80 ? 'needs attention' : 'healthy'}`
      ]
      
      response.suggestions = [
        metrics.savings < 5000
          ? { action: "Build emergency fund", impact: "Target ₹50,000 minimum", priority: "high" }
          : { action: "Invest surplus", impact: "Grow wealth", priority: "medium" },
        
        metrics.expenseRatio > 70
          ? { action: "Cut discretionary spending", impact: `Save ₹${Math.round(metrics.totalExpenses * 0.1)} monthly`, priority: "high" }
          : { action: "Track expenses", impact: "Better visibility", priority: "medium" }
      ]
      
      response.healthScore = Math.max(0, Math.min(100, 100 - (metrics.totalUsage - 50)))
    }

    res.json(response)

  } catch (err) {
    console.error('Analytics error:', err)
    res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    })
  }
})

// Quick financial health endpoint
analyticsRouter.get('/quick-health', checkUser, async (req, res) => {
  try {
    const userId = req.user._id
    
    const [user, transactions, emis] = await Promise.all([
      User.findById(userId),
      Transaction.find({
        userId,
        isActive: true
      }).sort({ date: -1 }),
      EMI.find({ userId, isActive: true })
    ])

    const { metrics, interpretations } = calculateMetrics(user, transactions, emis)

    // Format exactly like your example
    res.json({
      success: true,
      data: [
        {
          metric: "Expense ratio",
          value: `${metrics.expenseRatio}%`,
          meaning: interpretations.expenseRatio
        },
        {
          metric: "EMI ratio",
          value: `${metrics.emiRatio}%`,
          meaning: interpretations.emiRatio
        },
        {
          metric: "Total usage",
          value: `${metrics.totalUsage}%`,
          meaning: interpretations.totalUsage
        },
        {
          metric: "Savings",
          value: `₹${metrics.savings.toLocaleString('en-IN')}`,
          meaning: interpretations.savings
        }
      ],
      riskLevel: metrics.totalUsage > 90 ? "🚨 critical" : 
                 metrics.totalUsage > 80 ? "⚠️ high" : 
                 metrics.totalUsage > 70 ? "👀 moderate" : "✅ healthy"
    })

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    })
  }
})

export default analyticsRouter
