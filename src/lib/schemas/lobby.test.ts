import { describe, it, expect } from 'vitest';
import { CreateLobbySchema } from './lobby';

describe('CreateLobbySchema', () => {
	it('accepts valid input', () => {
		const result = CreateLobbySchema.safeParse({
			name: 'Friday Night',
			pool_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
			practice_mode: false
		});
		expect(result.success).toBe(true);
	});

	it('trims the name', () => {
		const result = CreateLobbySchema.safeParse({
			name: '  Trim Me  ',
			pool_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
			practice_mode: false
		});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.name).toBe('Trim Me');
	});

	it('rejects empty name', () => {
		const result = CreateLobbySchema.safeParse({
			name: '',
			pool_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
			practice_mode: false
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 50 characters', () => {
		const result = CreateLobbySchema.safeParse({
			name: 'a'.repeat(51),
			pool_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
			practice_mode: false
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid pool_id', () => {
		const result = CreateLobbySchema.safeParse({
			name: 'Test',
			pool_id: 'not-a-uuid',
			practice_mode: false
		});
		expect(result.success).toBe(false);
	});

	it('defaults practice_mode to false', () => {
		const result = CreateLobbySchema.safeParse({
			name: 'Test',
			pool_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
		});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.practice_mode).toBe(false);
	});
});
