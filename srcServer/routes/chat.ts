import { Router } from 'express'
import type { Request, Response } from 'express'
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { db, tableName } from '../data/dynamoDB.js'
import { validateInput, sendMessageSchema } from '../data/validation.js'
import type { MessagesResponse, MessageResponse } from '../data/types.js'

const router = Router()

router.get('/:channelId', async (req: Request, res: Response<MessagesResponse>) => {
	try {
		const { channelId } = req.params

		const queryCommand = new QueryCommand({
			TableName: tableName,
			KeyConditionExpression: 'pk = :channelPk AND begins_with(sk, :msgPrefix)',
			ExpressionAttributeValues: {
				':channelPk': `CHANNEL#${channelId}`,
				':msgPrefix': 'MSG#'
			},
			ScanIndexForward: true
		})

		const result = await db.send(queryCommand)
		
		const messages = result.Items?.map(item => ({
			id: item.sk as string,
			sender: item.sender as string,
			text: item.text as string,
			time: item.time as string,
			channelId: channelId!
		})) || []

		console.log(`Retrieved ${messages.length} messages for channel: ${channelId}`)

		return res.json({
			success: true,
			messages
		})

	} catch (error) {
		console.error('Get messages error:', error)
		return res.status(500).json({
			success: false,
			error: 'Failed to get messages'
		})
	}
})

router.post('/', async (req: Request, res: Response<MessageResponse>) => {
	try {
		const validation = validateInput(sendMessageSchema, req.body)
		
		if (!validation.success) {
			return res.status(400).json({
				success: false,
				error: validation.error
			})
		}

		const { channelId, text } = validation.data as { channelId: string; text: string }
		const sender = 'currentUser' // TODO: Get from JWT token
		const messageId = `MSG#${Date.now()}`
		const timestamp = new Date().toISOString()

		const message = {
			pk: `CHANNEL#${channelId}`,
			sk: messageId,
			text: text,
			sender: sender,
			time: timestamp
		}

		const putCommand = new PutCommand({
			TableName: tableName,
			Item: message
		})

		await db.send(putCommand)

		console.log(`Message sent to ${channelId}: "${text}" by ${sender}`)

		return res.json({
			success: true,
			message: {
				id: messageId,
				sender: sender,
				text: text,
				time: timestamp,
				channelId: channelId
			}
		})

	} catch (error) {
		console.error('Send message error:', error)
		return res.status(500).json({
			success: false,
			error: 'Failed to send message'
		})
	}
})

export default router