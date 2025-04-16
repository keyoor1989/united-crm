
export interface TelegramConfig {
  id: string;
  bot_token: string;
  webhook_url: string | null;
  created_at: string;
  updated_at: string;
  use_polling?: boolean;  // Make this optional
  last_update_id?: number;  // Add this to match the new column
}
