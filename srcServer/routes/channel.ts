import { Router } from 'express'
import type { Request, Response } from 'express'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db, tableName } from '../data/dynamoDB.js'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
	try {
		const result = await db.send(new QueryCommand({
			TableName: tableName,
			KeyConditionExpression: 'pk = :pk',
			ExpressionAttributeValues: { ':pk': 'CHANNEL' }
		}))
		
		const channels = result.Items?.map(item => ({
			id: item.sk, 
			name: item.name,
			isLocked: item.isLocked || false
		})) || []

		console.log(`Retrieved ${channels.length} channels:`, channels)
		console.log('Raw channel data:', result.Items)

		return res.json({ success: true, channels })

	} catch (error) {
		console.error('Get channels error:', error)
		return res.status(500).json({ success: false, error: 'Failed to get channels' })
	}
})

export default router