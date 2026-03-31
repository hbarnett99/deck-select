// src/lib/schemas/pool.ts
import { z } from 'zod';

export const CreatePoolSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(50, 'Name must be 50 characters or less')
		.trim()
});

export const AddCommanderSchema = z.object({
	commanderName: z.string().min(1, 'Commander name is required')
});

export const RemoveCommanderSchema = z.object({
	commanderId: z.string().uuid()
});
