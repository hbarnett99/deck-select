import { z } from 'zod';

export const CreateLobbySchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Name is required')
		.max(50, 'Name must be 50 characters or less'),
	pool_id: z.string().uuid('Invalid pool selected'),
	practice_mode: z.boolean().default(false)
});
