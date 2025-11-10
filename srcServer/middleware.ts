import type { Request, Response, RequestHandler } from "express"
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db, tableName } from './data/dynamoDB.js'
import jwt from 'jsonwebtoken';
import type { NextFunction } from "express";
const jwtSecret: string = process.env.JWT_SECRET || 'secret';

function verifyToken(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers["authorization"];
	const token = authHeader?.split(" ")[1]; 
	if (!token) {
		return res.status(401).json({ error: "Access denied. No token provided." });
	}
	try {
		const payload = jwt.verify(token, jwtSecret);
		(req as any).user = payload;
		next();
	} catch (err) {
		return res.status(403).json({ error: "Invalid or expired token." });
	}
}

const logger: RequestHandler = (req, res, next) => {
	console.log(`${req.method}  ${req.url}`)
	next()
}

const checkChannelAccess = async (req: Request, res: Response, next: any) => {
	try {
		const { channelId } = req.body
		
		const channelQuery = new QueryCommand({
			TableName: tableName,
			KeyConditionExpression: 'pk = :channelPk',
			ExpressionAttributeValues: {
				':channelPk': `CHANNEL#${channelId}`
			}
		})
		
		const result = await db.send(channelQuery)
		const channel = result.Items?.[0]
		const isPrivateChannel = channel?.isLocked || false
		
		if (isPrivateChannel) {
			return verifyToken(req, res, next)
		}
		
		const authHeader = req.headers["authorization"]
		const token = authHeader?.split(" ")[1]
		
		if (token) {
			return verifyToken(req, res, next)
		}
		
		next()
	} catch (error) {
		console.error('Channel access check error:', error)
		next()
	}
}

export { logger, checkChannelAccess, verifyToken }
