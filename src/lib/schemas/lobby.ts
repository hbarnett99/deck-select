import { z } from 'zod';

export const CreateLobbySchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(50, 'Name must be 50 characters or less')
		.trim(),
	pool_id: z.string().uuid('Pool is required'),
	practice_mode: z.boolean().default(false)
});
