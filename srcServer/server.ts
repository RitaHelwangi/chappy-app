import express from 'express'

const app = express()

const port: number = Number(process.env.PORT) || 1337

app.use(express.json())

app.get('/api/exempel', (req, res) => {
	res.json({ message: 'Hello from server!', timestamp: new Date().toISOString() })
})

app.use(express.static('./dist/'))

app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})
