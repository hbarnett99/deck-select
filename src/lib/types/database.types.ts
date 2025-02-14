export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	public: {
		Tables: {
			colors: {
				Row: {
					id: number;
					name: string;
				};
				Insert: {
					id?: never;
					name: string;
				};
				Update: {
					id?: never;
					name?: string;
				};
				Relationships: [];
			};
			instruments: {
				Row: {
					id: number;
					name: string;
				};
				Insert: {
					id?: never;
					name: string;
				};
				Update: {
					id?: never;
					name?: string;
				};
				Relationships: [];
			};
			lobbies: {
				Row: {
					created_at: string | null;
					created_by: string | null;
					game_started: boolean | null;
					id: string;
					is_practice: boolean | null;
					max_players: number | null;
					name: string;
					settings: Json | null;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					created_by?: string | null;
					game_started?: boolean | null;
					id?: string;
					is_practice?: boolean | null;
					max_players?: number | null;
					name: string;
					settings?: Json | null;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					created_by?: string | null;
					game_started?: boolean | null;
					id?: string;
					is_practice?: boolean | null;
					max_players?: number | null;
					name?: string;
					settings?: Json | null;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			lobby_players: {
				Row: {
					id: string;
					is_admin: boolean | null;
					is_ready: boolean | null;
					joined_at: string | null;
					lobby_id: string | null;
					user_id: string | null;
				};
				Insert: {
					id?: string;
					is_admin?: boolean | null;
					is_ready?: boolean | null;
					joined_at?: string | null;
					lobby_id?: string | null;
					user_id?: string | null;
				};
				Update: {
					id?: string;
					is_admin?: boolean | null;
					is_ready?: boolean | null;
					joined_at?: string | null;
					lobby_id?: string | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'lobby_players_lobby_id_fkey';
						columns: ['lobby_id'];
						isOneToOne: false;
						referencedRelation: 'lobbies';
						referencedColumns: ['id'];
					}
				];
			};
			notes: {
				Row: {
					created_at: string;
					id: number;
					note: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					id?: never;
					note: string;
					user_id?: string;
				};
				Update: {
					created_at?: string;
					id?: never;
					note?: string;
					user_id?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			make_player_admin: {
				Args: {
					lobby_id: string;
					target_user_id: string;
				};
				Returns: undefined;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
				Database[PublicTableNameOrOptions['schema']]['Views'])
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
			Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
		: never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
		? PublicSchema['Enums'][PublicEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema['CompositeTypes']
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
		? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;
