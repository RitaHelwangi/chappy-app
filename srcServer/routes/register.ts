import { Router } from 'express'
import type { Request, Response } from 'express'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
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
			return res.status(400).json({
				success: false,
				error: validation.error
			})
		}

		const { username, password } = validation.data

		const hashedPassword = await bcrypt.hash(password, 10)
		const userId = Date.now().toString()
	
		const user: User = {
			pk: `USER#${username}`, 
			sk: 'PROFILE',          
			userId: userId,         
			name: username,
			password: hashedPassword
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
