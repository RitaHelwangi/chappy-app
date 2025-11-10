import jwt from 'jsonwebtoken'

import type { JwtPayload } from './types.js';

const jwtSecret: string = process.env.JWT_SECRET || 'secret';

function createToken (userId: string, username: string): string {
	const token = jwt.sign({ userId, username }, jwtSecret, { expiresIn: '7d' });
	return token;
}

export { createToken };
