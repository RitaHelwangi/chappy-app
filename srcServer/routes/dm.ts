import { Router } from 'express'
import type { Request, Response } from 'express'
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { db, tableName } from '../data/dynamoDB.js'
import { verifyToken } from '../middleware.js'
import { validateInput } from '../data/validation.js'
import { z } from 'zod'
import type { JwtPayload } from '../data/types.js'

const router = Router()

const dmSchema = z.object({
	receiverUsername: z.string().min(1, 'Receiver username is required'),
	text: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long')
})

router.get('/:username', verifyToken, async (req: Request, res: Response) => {
	try {
		const { username: otherUser } = req.params
		const currentUser = ((req as any).user as JwtPayload).username
		const users = [currentUser, otherUser].sort()
		const dmKey = `DM#${users[0]}#${users[1]}`
		
		const result = await db.send(new QueryCommand({
			TableName: tableName,
			KeyConditionExpression: 'pk = :dmKey AND begins_with(sk, :msgPrefix)',
			ExpressionAttributeValues: { ':dmKey': dmKey, ':msgPrefix': 'MSG#' },
			ScanIndexForward: true
		}))
		
		const messages = result.Items?.map(item => ({
			id: item.sk,
			sender: item.sender,
			text: item.text,
			time: item.time
		})) || []

		return res.json({
			success: true,
			messages,
			conversation: { with: otherUser, participants: [currentUser, otherUser] }
		})
	} catch (error) {
		console.error('Get DM error:', error)
		return res.status(500).json({ success: false, error: 'Failed to get messages' })
	}
})

router.post('/', verifyToken, async (req: Request, res: Response) => {
	try {
		const validation = validateInput(dmSchema, req.body)
		if (!validation.success) {
			return res.status(400).json({ success: false, error: validation.error })
		}

		const { receiverUsername, text } = validation.data
		const senderUsername = ((req as any).user as JwtPayload).username
		
		if (senderUsername === receiverUsername) {
			return res.status(400).json({ success: false, error: 'Cannot send message to yourself' })
		}

		const users = [senderUsername, receiverUsername].sort()
		const dmKey = `DM#${users[0]}#${users[1]}`
		const messageId = `MSG#${Date.now()}`
		const timestamp = new Date().toISOString()

		await db.send(new PutCommand({
			TableName: tableName,
			Item: {
				pk: dmKey,
				sk: messageId,
				sender: senderUsername,
				receiver: receiverUsername,
				text,
				time: timestamp
			}
		}))

		return res.json({
			success: true,
			message: { id: messageId, sender: senderUsername, receiver: receiverUsername, text, time: timestamp }
		})
	} catch (error) {
		console.error('Send DM error:', error)
		return res.status(500).json({ success: false, error: 'Failed to send message' })
	}
})

export default router