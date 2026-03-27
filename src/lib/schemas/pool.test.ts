// src/lib/schemas/pool.test.ts
import { describe, it, expect } from 'vitest';
import { CreatePoolSchema, AddCommanderSchema, RemoveCommanderSchema } from './pool';

describe('CreatePoolSchema', () => {
	it('accepts a valid name', () => {
		expect(CreatePoolSchema.safeParse({ name: 'Budget Legends' }).success).toBe(true);
	});

	it('rejects empty name', () => {
		expect(CreatePoolSchema.safeParse({ name: '' }).success).toBe(false);
	});

	it('rejects name over 50 chars', () => {
		expect(CreatePoolSchema.safeParse({ name: 'a'.repeat(51) }).success).toBe(false);
	});

	it('trims whitespace', () => {
		const result = CreatePoolSchema.safeParse({ name: '  My Pool  ' });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.name).toBe('My Pool');
	});
});

describe('AddCommanderSchema', () => {
	it('accepts a valid commander name', () => {
		expect(AddCommanderSchema.safeParse({ commanderName: 'Atraxa, Praetors\' Voice' }).success).toBe(true);
	});

	it('rejects empty commander name', () => {
		expect(AddCommanderSchema.safeParse({ commanderName: '' }).success).toBe(false);
	});
});

describe('RemoveCommanderSchema', () => {
	it('accepts a valid UUID', () => {
		expect(RemoveCommanderSchema.safeParse({ commanderId: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(true);
	});

	it('rejects non-UUID', () => {
		expect(RemoveCommanderSchema.safeParse({ commanderId: 'not-a-uuid' }).success).toBe(false);
	});

	it('rejects empty string', () => {
		expect(RemoveCommanderSchema.safeParse({ commanderId: '' }).success).toBe(false);
	});
});
