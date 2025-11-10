import { Router } from 'express'
import type { Request, Response } from 'express'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { db, tableName } from '../data/dynamoDB.js'
import { createToken } from '../data/auth.js'
import { loginSchema, validateInput } from '../data/validation.js'
import bcrypt from 'bcrypt'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
	try {
		const validation = validateInput(loginSchema, req.body)
		if (!validation.success) {
			return res.status(400).json({ success: false, error: validation.error })
		}

		const { username, password } = validation.data

		const result = await db.send(new GetCommand({
			TableName: tableName,
			Key: { pk: `USER#${username}`, sk: 'PROFILE' }
		}))
		
		const user = result.Item
		const loginError = { success: false, error: 'Invalid username or password' }

		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json(loginError)
		}

		const userId = user.userId || user.pk.replace('USER#', '')  
		const token = createToken(userId, username)

		console.log(`User logged in: ${username} (ID: ${userId})`)

		return res.json({
			success: true,
			token,
			user: { id: userId, username: user.name }
		})

	} catch (error) {
		console.error('Login error:', error)
		return res.status(500).json({ success: false, error: 'Failed to login' })
	}
})

export default router
