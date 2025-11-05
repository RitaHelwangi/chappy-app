import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from "express"
import type { JwtPayload } from './types.js'

const jwtSecret: string = process.env.JWT_SECRET || ''

function createToken (userId: string): string {
	const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' })
	return token
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers["authorization"];
	const token = authHeader?.split(" ")[1]; 
	
	if (!token) {
		return res.status(401).json({ error: "Access denied. No token provided." });
	}
	
	try {
		const payload = jwt.verify(token, jwtSecret) as JwtPayload;
		(req as any).user = payload;
		next();
	} catch (err) {
		return res.status(403).json({ error: "Invalid or expired token." });
	}
}

export { createToken }
