// src/lib/schemas/pool.test.ts
import { describe, it, expect } from 'vitest';
import { CreatePoolSchema, AddCommanderSchema } from './pool';

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
