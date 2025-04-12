export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customer_machines: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          installation_date: string | null
          is_external_purchase: boolean | null
          last_service: string | null
          machine_name: string
          machine_serial: string | null
          machine_type: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          installation_date?: string | null
          is_external_purchase?: boolean | null
          last_service?: string | null
          machine_name: string
          machine_serial?: string | null
          machine_type?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          installation_date?: string | null
          is_external_purchase?: boolean | null
          last_service?: string | null
          machine_name?: string
          machine_serial?: string | null
          machine_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_machines_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          customer_id: string
          id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          id?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          area: string
          created_at: string | null
          customer_type: string
          date_of_birth: string | null
          email: string | null
          id: string
          last_contact: string | null
          lead_status: string
          name: string
          phone: string
          source: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          area: string
          created_at?: string | null
          customer_type: string
          date_of_birth?: string | null
          email?: string | null
          id?: string
          last_contact?: string | null
          lead_status: string
          name: string
          phone: string
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          area?: string
          created_at?: string | null
          customer_type?: string
          date_of_birth?: string | null
          email?: string | null
          id?: string
          last_contact?: string | null
          lead_status?: string
          name?: string
          phone?: string
          source?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      engineers: {
        Row: {
          created_at: string | null
          current_job: string | null
          current_location: string
          email: string
          id: string
          location: string
          name: string
          phone: string
          skill_level: string
          status: string
        }
        Insert: {
          created_at?: string | null
          current_job?: string | null
          current_location: string
          email: string
          id?: string
          location: string
          name: string
          phone: string
          skill_level: string
          status: string
        }
        Update: {
          created_at?: string | null
          current_job?: string | null
          current_location?: string
          email?: string
          id?: string
          location?: string
          name?: string
          phone?: string
          skill_level?: string
          status?: string
        }
        Relationships: []
      }
      inventory_brands: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_models: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "inventory_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          created_at: string
          customer_id: string | null
          customer_name: string
          grand_total: number
          id: string
          items: Json
          notes: string | null
          quotation_number: string
          status: string
          subtotal: number
          terms: string | null
          total_gst: number
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          customer_name: string
          grand_total: number
          id?: string
          items: Json
          notes?: string | null
          quotation_number: string
          status: string
          subtotal: number
          terms?: string | null
          total_gst: number
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          grand_total?: number
          id?: string
          items?: Json
          notes?: string | null
          quotation_number?: string
          status?: string
          subtotal?: number
          terms?: string | null
          total_gst?: number
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_followups: {
        Row: {
          contact_phone: string | null
          customer_id: string
          customer_name: string
          date: string
          id: number
          location: string | null
          notes: string | null
          status: string
          type: string
        }
        Insert: {
          contact_phone?: string | null
          customer_id: string
          customer_name: string
          date: string
          id?: number
          location?: string | null
          notes?: string | null
          status: string
          type: string
        }
        Update: {
          contact_phone?: string | null
          customer_id?: string
          customer_name?: string
          date?: string
          id?: number
          location?: string | null
          notes?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_followups_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_calls: {
        Row: {
          call_type: string
          completion_time: string | null
          created_at: string
          customer_id: string
          customer_name: string
          engineer_id: string | null
          engineer_name: string | null
          feedback: Json | null
          id: string
          issue_description: string
          issue_type: string
          location: string
          machine_id: string | null
          machine_model: string
          parts_used: Json | null
          phone: string
          priority: string
          serial_number: string | null
          sla_deadline: string | null
          start_time: string | null
          status: string
        }
        Insert: {
          call_type: string
          completion_time?: string | null
          created_at?: string
          customer_id: string
          customer_name: string
          engineer_id?: string | null
          engineer_name?: string | null
          feedback?: Json | null
          id?: string
          issue_description: string
          issue_type: string
          location: string
          machine_id?: string | null
          machine_model: string
          parts_used?: Json | null
          phone: string
          priority: string
          serial_number?: string | null
          sla_deadline?: string | null
          start_time?: string | null
          status: string
        }
        Update: {
          call_type?: string
          completion_time?: string | null
          created_at?: string
          customer_id?: string
          customer_name?: string
          engineer_id?: string | null
          engineer_name?: string | null
          feedback?: Json | null
          id?: string
          issue_description?: string
          issue_type?: string
          location?: string
          machine_id?: string | null
          machine_model?: string
          parts_used?: Json | null
          phone?: string
          priority?: string
          serial_number?: string | null
          sla_deadline?: string | null
          start_time?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_calls_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_calls_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "customer_machines"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
