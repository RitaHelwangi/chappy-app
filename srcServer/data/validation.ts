import { z } from 'zod'

export const registerSchema = z.object({
	username: z.string()
	.min(3, 'Username must be at least 3 characters')
	.max(20, 'Username must be less than 20 characters')
	.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
	
	password: z.string()
	.min(6, 'Password must be at least 6 characters')
	.max(50, 'Password must be less than 50 characters')
})

export const loginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required')
})

export const sendMessageSchema = z.object({
	channelId: z.string().min(1, 'Channel ID is required').max(50, 'Channel ID too long'),
	text: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
})

export const createChannelSchema = z.object({
	name: z.string()
		.min(1, 'Channel name is required')
		.max(50, 'Channel name must be less than 50 characters')
		.regex(/^[a-zA-Z0-9\s\-_]+$/, 'Channel name can only contain letters, numbers, spaces, hyphens, and underscores'),
	isLocked: z.boolean().optional()
})

export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): 
| { success: true; data: T }
| { success: false; error: string } => {
	try {
		const parsedData = schema.parse(data)
		return {
			success: true,
			data: parsedData
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.issues[0]?.message || 'Validation failed'
			}
		}
		return {
			success: false,
			error: 'Invalid input'
		}
	}
}
