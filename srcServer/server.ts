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
import channelRoute from './routes/channel.js'
app.use('/api/channels', channelRoute)

import chatRoute from './routes/chat.js'
app.use('/api/messages', chatRoute)

import registerRoute from './routes/register.js'
app.use('/api/register', registerRoute)

import loginRoute from './routes/login.js'
app.use('/api/login', loginRoute)

import usersRoute from './routes/users.js'
app.use('/api/users', usersRoute)

import dmRoute from './routes/dm.js'
app.use('/api/dm', dmRoute)


app.use(express.static('./dist/'))

app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})