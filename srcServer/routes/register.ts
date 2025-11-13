import { Router } from 'express'
import type { Request, Response } from 'express'
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { db, tableName } from '../data/dynamoDB.js'
import { createToken } from '../data/auth.js'
import type { User } from '../data/types.js'
import { registerSchema, validateInput } from '../data/validation.js'
import bcrypt from 'bcrypt'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
	try {
		const validation = validateInput(registerSchema, req.body)
		if (!validation.success) {
			return res.status(400).json({ success: false, error: validation.error })
		}

	const { username, password } = validation.data

	const existingUser = await db.send(new GetCommand({
		TableName: tableName,
		Key: { pk: `USER#${username}`, sk: 'PROFILE' }
	}))

	if (existingUser.Item) {
		return res.status(409).json({ 
			success: false, 
			error: 'Username already exists. Please choose a different username.' 
		})
	}

	const hashedPassword = await bcrypt.hash(password, 10)
	const userId = Date.now().toString()
	
	await Promise.all([
			db.send(new PutCommand({
				TableName: tableName,
				Item: {
					pk: `USER#${username}`, 
					sk: 'PROFILE',          
					userId,         
					name: username,
					password: hashedPassword
				} as User
			})),
			db.send(new PutCommand({
				TableName: tableName,
				Item: { pk: 'USERS', sk: username, userId }
			}))
		])

		const token = createToken(userId, username)
		console.log(`✅ User registered: ${username} (ID: ${userId})`)

		return res.json({
			success: true,
			token,
			user: { id: userId, username }
		})

	} catch (error) {
		console.error('Registration error:', error)
		return res.status(500).json({ success: false, error: 'Failed to register user' })
	}
})

export default router
