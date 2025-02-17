// src/lib/services/scryfall.service.ts
import type { ScryfallCard, ScryfallList } from '@scryfall/api-types';

class ScryfallService {
	private static BASE_URL = 'https://api.scryfall.com';
	private static CACHE = new Map<string, ScryfallCard.Any>();
	private static CACHE_DURATION = 1000 * 60 * 60; // 1 hour

	/**
	 * Search for cards using Scryfall's search API
	 */
	static async searchCards(query: string): Promise<ScryfallList.Cards> {
		console.log('Searching cards:', { query });
		try {
			const response = await fetch(`${this.BASE_URL}/cards/search?q=${encodeURIComponent(query)}`);

			// if (!response.ok) {
			// 	throw new Error(`Scryfall API error: ${response.statusText}`);
			// }

			const data: ScryfallList.Cards = await response.json();
			return data;
		} catch (error) {
			console.error('Error searching cards:', error);
			throw error;
		}
	}

	/**
	 * Get a specific card by its Scryfall ID
	 */
	static async getCardById(id: string): Promise<ScryfallCard.Any> {
		// Check cache first
		const cachedCard = this.CACHE.get(id);
		if (cachedCard) {
			return cachedCard;
		}

		try {
			const response = await fetch(`${this.BASE_URL}/cards/${id}`);

			if (!response.ok) {
				throw new Error(`Scryfall API error: ${response.statusText}`);
			}

			const card: ScryfallCard.Any = await response.json();

			// Cache the result
			this.CACHE.set(id, card);

			// Set cache expiration
			setTimeout(() => {
				this.CACHE.delete(id);
			}, this.CACHE_DURATION);

			return card;
		} catch (error) {
			console.error('Error fetching card:', error);
			throw error;
		}
	}

	/**
	 * Get cards by their exact names
	 */
	static async getCardByExactName(cardName: string): Promise<ScryfallCard.Any> {
		try {
			const response = await fetch(
				`${this.BASE_URL}/cards/named?exact=${encodeURIComponent(cardName)}`
			);

			if (!response.ok) {
				throw new Error(`Scryfall API error: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error fetching card by name:', error);
			throw error;
		}
	}

	/**
	 * Get multiple cards by their Scryfall IDs
	 */
	static async getCardsByIds(ids: string[]): Promise<ScryfallCard.Any[]> {
		try {
			const identifiers: { id: string }[] = ids.map((id) => ({ id }));

			const response = await fetch(`${this.BASE_URL}/cards/collection`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ identifiers })
			});

			if (!response.ok) {
				throw new Error(`Scryfall API error: ${response.statusText}`);
			}

			const data: ScryfallCard.Any[] = await response.json();
			return data;
		} catch (error) {
			console.error('Error fetching cards collection:', error);
			throw error;
		}
	}

	/**
	 * Get random card from Scryfall
	 */
	static async getRandomCard(): Promise<ScryfallCard.Any> {
		try {
			const response = await fetch(`${this.BASE_URL}/cards/random`);

			if (!response.ok) {
				throw new Error(`Scryfall API error: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error fetching random card:', error);
			throw error;
		}
	}

	/**
	 * Clear the card cache
	 */
	static clearCache(): void {
		this.CACHE.clear();
	}

	static searchCommanders = async (query: string) =>
		await ScryfallService.searchCards(`is:commander ${query}`);
}

export default ScryfallService;
