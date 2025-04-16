
export interface TelegramConfig {
  id: string;
  bot_token: string;
  webhook_url: string | null;
  created_at: string;
  updated_at: string;
  use_polling?: boolean;  // Make this optional
  last_update_id?: number;  // Add this to match the new column
}

export interface AuthorizedChat {
  id: string;
  chat_id: string;
  chat_name: string;
  is_active: boolean;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  chat_id: string;
  service_calls: boolean;
  customer_followups: boolean;
  inventory_alerts: boolean;
}

export interface MessageLog {
  id: string;
  chat_id: string;
  message_text: string;
  message_type: string;
  direction: 'incoming' | 'outgoing';
  processed_status: string;
  created_at: string;
}

export interface WebhookInfo {
  ok: boolean;
  result: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    max_connections: number;
    ip_address: string;
    last_error_date?: number;
    last_error_message?: string;
    last_synchronization_error_date?: number;
  };
}
