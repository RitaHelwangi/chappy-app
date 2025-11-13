import { Router } from 'express'
import type { Request, Response } from 'express'
import { QueryCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { db, tableName } from '../data/dynamoDB.js'
import { verifyToken } from '../middleware.js'
import { validateInput, createChannelSchema } from '../data/validation.js'

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

router.post('/', verifyToken, async (req: Request, res: Response) => {
	try {
		const validation = validateInput(createChannelSchema, req.body)
		
		if (!validation.success) {
			return res.status(400).json({ success: false, error: validation.error })
		}

		const { name, isLocked } = validation.data
		const channelId = `${Date.now()}`
		
		await db.send(new PutCommand({
			TableName: tableName,
			Item: {
				pk: 'CHANNEL',
				sk: channelId,
				name: name,
				isLocked: isLocked || false
			}
		}))

		console.log(`Created channel: ${name} (ID: ${channelId})`)
		
		return res.json({ 
			success: true, 
			channel: { 
				id: channelId, 
				name, 
				isLocked: isLocked || false 
			} 
		})

	} catch (error) {
		console.error('Create channel error:', error)
		return res.status(500).json({ success: false, error: 'Failed to create channel' })
	}
})

router.delete('/:channelId', verifyToken, async (req: Request, res: Response) => {
	try {
		const channelId = decodeURIComponent(req.params.channelId || '')
		
		await db.send(new DeleteCommand({
			TableName: tableName,
			Key: {
				pk: 'CHANNEL',
				sk: channelId
			}
		}))

		console.log(`Deleted channel: ${channelId}`)
		
		return res.json({ success: true })

	} catch (error) {
		console.error('Delete channel error:', error)
		return res.status(500).json({ success: false, error: 'Failed to delete channel' })
	}
})

export default router