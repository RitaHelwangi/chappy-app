import { Router } from 'express'
import type { Request, Response } from 'express'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { db, tableName } from '../data/dynamoDB.js'
import { createToken } from '../data/auth.js'
import type { User } from '../data/types.js'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
	try { //todo: validation
		const { username, password } = req.body

		if (!username || !password) {
			return res.status(400).json({
				success: false,
				error: 'Username and password are required'
			})
		}


		const userId = Date.now().toString()

	
		const user: User = {
			pk: `USER#${userId}`,
			sk: `USER#${userId}`,
			name: username,
			password //todo: hash password
		}

		const putCommand = new PutCommand({
			TableName: tableName,
			Item: user
		})

		await db.send(putCommand)

		
		const token = createToken(userId)

		console.log(`✅ User registered: ${username} (ID: ${userId})`)

		return res.json({
			success: true,
			token,
			user: {
				id: userId,
				username: user.name
			}
		})

	} catch (error) {
		console.error('Registration error:', error)
		return res.status(500).json({
			success: false,
			error: 'Failed to register user'
		})
	}
})

export default router
