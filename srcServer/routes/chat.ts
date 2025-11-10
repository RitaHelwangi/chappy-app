import { Router } from 'express'
import type { Request, Response } from 'express'
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { db, tableName } from '../data/dynamoDB.js'
import { validateInput, sendMessageSchema } from '../data/validation.js'
import { checkChannelAccess } from '../middleware.js'
import type { MessagesResponse, MessageResponse, JwtPayload } from '../data/types.js'

const router = Router()

router.get('/:channelId', async (req: Request, res: Response<MessagesResponse>) => {
	try {
		const { channelId } = req.params;
		
		const channelResult = await db.send(new QueryCommand({
			TableName: tableName,
			KeyConditionExpression: 'pk = :channelPk AND sk = :channelSk',
			ExpressionAttributeValues: { ':channelPk': 'CHANNEL', ':channelSk': channelId }
		}));
		const channel = channelResult.Items?.[0];
		if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });
		
		const channelInfo = { id: channelId!, name: channel.name as string, isPrivate: channel.isLocked as boolean };
		
		if (channel.isLocked) {
			const token = req.headers["authorization"]?.split(" ")[1];
			if (!token) return res.status(401).json({ success: false, error: 'Authentication required for private channels', channel: channelInfo });
			
			try {
				const jwt = await import('jsonwebtoken');
				jwt.default.verify(token, process.env.JWT_SECRET || 'secret');
			} catch (err) {
				return res.status(403).json({ success: false, error: 'Invalid or expired token', channel: channelInfo });
			}
		}
		
		const messagesResult = await db.send(new QueryCommand({
			TableName: tableName,
			KeyConditionExpression: 'pk = :channelPk AND begins_with(sk, :msgPrefix)',
			ExpressionAttributeValues: { ':channelPk': `CHANNEL#${channelId}`, ':msgPrefix': 'MSG#' },
			ScanIndexForward: true
		}));
		
		const messages = messagesResult.Items?.map(item => ({
			id: item.sk as string, sender: item.sender as string, text: item.text as string,
			time: item.time as string, channelId: channelId!
		})) || [];
		
		return res.json({ success: true, messages, channel: channelInfo });
	} catch (error) {
		console.error('Get messages error:', error);
		return res.status(500).json({ success: false, error: 'Failed to get messages' });
	}
});

router.post('/', checkChannelAccess, async (req: Request, res: Response<MessageResponse>) => {
	try {
		const validation = validateInput(sendMessageSchema, req.body);
		if (!validation.success) return res.status(400).json({ success: false, error: validation.error });
		
		const { channelId, text } = validation.data as { channelId: string; text: string };
		const sender = (req as any).user ? ((req as any).user as JwtPayload).username : 'Guest';
		const messageId = `MSG#${Date.now()}`;
		const timestamp = new Date().toISOString();
		
		await db.send(new PutCommand({
			TableName: tableName,
			Item: { pk: `CHANNEL#${channelId}`, sk: messageId, text, sender, time: timestamp }
		}));
		
		return res.json({
			success: true,
			message: { id: messageId, sender, text, time: timestamp, channelId }
		});
	} catch (error) {
		console.error('Send message error:', error);
		return res.status(500).json({ success: false, error: 'Failed to send message' });
	}
});

export default router