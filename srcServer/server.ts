import express from 'express'
import cors from 'cors'
import { logger } from './middleware.js'

const app = express()
const port: number = Number(process.env.PORT) || 1337

// Middleware
app.use(logger)
app.use(cors())
app.use(express.json())


app.get('/api/exempel', (req, res) => {
	res.json({ message: 'Hello from server!', timestamp: new Date().toISOString() })
})


// endpoints
app.get('/api/channels', (req, res) => {
	res.json({ message: 'Get channels endpoint' })
})

app.get('/api/messages/:channelId', (req, res) => {
	res.json({ message: 'Get messages endpoint' })
})

import registerRoute from './routes/register.js'
app.use('/api/register', registerRoute)

app.post('/api/login', (req, res) => {
	res.json({ message: 'Login endpoint' })
})

app.post('/api/messages', (req, res) => {
	res.json({ message: 'Send message endpoint' })
})

app.use(express.static('./dist/'))

app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})