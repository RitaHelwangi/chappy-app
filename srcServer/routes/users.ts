import { Router } from 'express'
import type { Request, Response } from 'express'
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { db, tableName } from '../data/dynamoDB.js'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
	try {
		const result = await db.send(new QueryCommand({
			TableName: tableName,
			KeyConditionExpression: 'pk = :pk',
			ExpressionAttributeValues: { ':pk': 'USERS' }
		}))
		
		const users = result.Items?.map(item => ({
			id: item.userId,
			username: item.sk 
		})) || []

		return res.json({ success: true, users })

	} catch (error) {
		console.error('Get users error:', error)
		return res.status(500).json({ success: false, error: 'Failed to get users' })
	}
})


router.get('/:username', async (req: Request, res: Response) => {
	try {
		const { username } = req.params

		const result = await db.send(new GetCommand({
			TableName: tableName,
			Key: { pk: `USER#${username}`, sk: 'PROFILE' }
		}))
		
		const user = result.Item

		if (!user) {
			return res.status(404).json({ success: false, error: 'User not found' })
		}

		return res.json({
			success: true,
			user: {
				id: user.userId || user.pk.replace('USER#', ''),
				username: user.name
			}
		})

	} catch (error) {
		console.error('Get user error:', error)
		return res.status(500).json({ success: false, error: 'Failed to get user' })
	}
})

export default router
