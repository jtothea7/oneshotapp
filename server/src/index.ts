import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import apiKeysRouter from './routes/apiKeys.js'
import clientsRouter from './routes/clients.js'

const app = express()
const PORT = process.env.PORT || 3001
const isDev = process.env.NODE_ENV !== 'production'

app.use(helmet())
app.use(cors({
  origin: isDev ? 'http://localhost:5173' : process.env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  })
})

// Routes
app.use('/api/api-keys', apiKeysRouter)
app.use('/api/clients', clientsRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`)
})
