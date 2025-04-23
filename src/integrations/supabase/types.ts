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
      amc_billing: {
        Row: {
          a3_closing_reading: number | null
          a3_extra_copies: number | null
          a3_extra_copy_charge: number | null
          a3_extra_copy_rate: number | null
          a3_free_copies: number | null
          a3_opening_reading: number | null
          a3_total_copies: number | null
          a4_closing_reading: number
          a4_extra_copies: number
          a4_extra_copy_charge: number
          a4_extra_copy_rate: number
          a4_free_copies: number
          a4_opening_reading: number
          a4_total_copies: number
          bill_date: string
          bill_status: string
          billing_month: string
          contract_id: string
          created_at: string
          customer_id: string
          customer_name: string
          department: string | null
          gst_amount: number
          gst_percent: number
          id: string
          invoice_no: string | null
          machine_id: string
          machine_model: string
          machine_type: string
          rent: number
          rent_gst: number
          serial_number: string
          total_bill: number
        }
        Insert: {
          a3_closing_reading?: number | null
          a3_extra_copies?: number | null
          a3_extra_copy_charge?: number | null
          a3_extra_copy_rate?: number | null
          a3_free_copies?: number | null
          a3_opening_reading?: number | null
          a3_total_copies?: number | null
          a4_closing_reading: number
          a4_extra_copies: number
          a4_extra_copy_charge: number
          a4_extra_copy_rate: number
          a4_free_copies: number
          a4_opening_reading: number
          a4_total_copies: number
          bill_date: string
          bill_status: string
          billing_month: string
          contract_id: string
          created_at?: string
          customer_id: string
          customer_name: string
          department?: string | null
          gst_amount: number
          gst_percent: number
          id?: string
          invoice_no?: string | null
          machine_id: string
          machine_model: string
          machine_type: string
          rent: number
          rent_gst: number
          serial_number: string
          total_bill: number
        }
        Update: {
          a3_closing_reading?: number | null
          a3_extra_copies?: number | null
          a3_extra_copy_charge?: number | null
          a3_extra_copy_rate?: number | null
          a3_free_copies?: number | null
          a3_opening_reading?: number | null
          a3_total_copies?: number | null
          a4_closing_reading?: number
          a4_extra_copies?: number
          a4_extra_copy_charge?: number
          a4_extra_copy_rate?: number
          a4_free_copies?: number
          a4_opening_reading?: number
          a4_total_copies?: number
          bill_date?: string
          bill_status?: string
          billing_month?: string
          contract_id?: string
          created_at?: string
          customer_id?: string
          customer_name?: string
          department?: string | null
          gst_amount?: number
          gst_percent?: number
          id?: string
          invoice_no?: string | null
          machine_id?: string
          machine_model?: string
          machine_type?: string
          rent?: number
          rent_gst?: number
          serial_number?: string
          total_bill?: number
        }
        Relationships: [
          {
            foreignKeyName: "amc_billing_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "amc_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amc_billing_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "amc_machines"
            referencedColumns: ["id"]
          },
        ]
      }
      amc_consumable_usage: {
        Row: {
          contract_id: string
          cost: number
          created_at: string
          customer_id: string
          customer_name: string
          date: string
          department: string | null
          engineer_id: string | null
          engineer_name: string | null
          id: string
          inventory_deducted: boolean | null
          item_id: string | null
          item_name: string
          machine_id: string
          machine_model: string
          machine_type: string
          quantity: number
          remarks: string | null
          serial_number: string
        }
        Insert: {
          contract_id: string
          cost: number
          created_at?: string
          customer_id: string
          customer_name: string
          date: string
          department?: string | null
          engineer_id?: string | null
          engineer_name?: string | null
          id?: string
          inventory_deducted?: boolean | null
          item_id?: string | null
          item_name: string
          machine_id: string
          machine_model: string
          machine_type: string
          quantity: number
          remarks?: string | null
          serial_number: string
        }
        Update: {
          contract_id?: string
          cost?: number
          created_at?: string
          customer_id?: string
          customer_name?: string
          date?: string
          department?: string | null
          engineer_id?: string | null
          engineer_name?: string | null
          id?: string
          inventory_deducted?: boolean | null
          item_id?: string | null
          item_name?: string
          machine_id?: string
          machine_model?: string
          machine_type?: string
          quantity?: number
          remarks?: string | null
          serial_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "amc_consumable_usage_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "amc_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amc_consumable_usage_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "amc_machines"
            referencedColumns: ["id"]
          },
        ]
      }
      amc_contracts: {
        Row: {
          billing_cycle: string
          contract_type: string
          copy_limit_a3: number | null
          copy_limit_a4: number
          created_at: string
          customer_id: string
          customer_name: string
          department: string | null
          end_date: string
          extra_a3_copy_charge: number | null
          extra_a4_copy_charge: number
          gst_percent: number
          id: string
          location: string | null
          machine_model: string
          machine_type: string
          monthly_rent: number
          notes: string | null
          serial_number: string
          start_date: string
          status: string
        }
        Insert: {
          billing_cycle: string
          contract_type: string
          copy_limit_a3?: number | null
          copy_limit_a4: number
          created_at?: string
          customer_id: string
          customer_name: string
          department?: string | null
          end_date: string
          extra_a3_copy_charge?: number | null
          extra_a4_copy_charge: number
          gst_percent?: number
          id?: string
          location?: string | null
          machine_model: string
          machine_type: string
          monthly_rent: number
          notes?: string | null
          serial_number: string
          start_date: string
          status: string
        }
        Update: {
          billing_cycle?: string
          contract_type?: string
          copy_limit_a3?: number | null
          copy_limit_a4?: number
          created_at?: string
          customer_id?: string
          customer_name?: string
          department?: string | null
          end_date?: string
          extra_a3_copy_charge?: number | null
          extra_a4_copy_charge?: number
          gst_percent?: number
          id?: string
          location?: string | null
          machine_model?: string
          machine_type?: string
          monthly_rent?: number
          notes?: string | null
          serial_number?: string
          start_date?: string
          status?: string
        }
        Relationships: []
      }
      amc_machines: {
        Row: {
          contract_id: string
          contract_type: string
          copy_limit_a3: number | null
          copy_limit_a4: number
          created_at: string
          current_rent: number
          customer_id: string
          customer_name: string
          department: string | null
          end_date: string
          id: string
          last_a3_reading: number | null
          last_a4_reading: number | null
          last_reading_date: string | null
          location: string
          machine_type: string
          model: string
          serial_number: string
          start_date: string
        }
        Insert: {
          contract_id: string
          contract_type: string
          copy_limit_a3?: number | null
          copy_limit_a4: number
          created_at?: string
          current_rent: number
          customer_id: string
          customer_name: string
          department?: string | null
          end_date: string
          id?: string
          last_a3_reading?: number | null
          last_a4_reading?: number | null
          last_reading_date?: string | null
          location: string
          machine_type: string
          model: string
          serial_number: string
          start_date: string
        }
        Update: {
          contract_id?: string
          contract_type?: string
          copy_limit_a3?: number | null
          copy_limit_a4?: number
          created_at?: string
          current_rent?: number
          customer_id?: string
          customer_name?: string
          department?: string | null
          end_date?: string
          id?: string
          last_a3_reading?: number | null
          last_a4_reading?: number | null
          last_reading_date?: string | null
          location?: string
          machine_type?: string
          model?: string
          serial_number?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "amc_machines_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "amc_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      amc_profit_reports: {
        Row: {
          consumables_cost: number
          contract_id: string
          created_at: string
          customer_id: string
          customer_name: string
          department: string | null
          engineer_visit_cost: number | null
          extra_copy_income: number
          food_expense: number | null
          id: string
          machine_id: string
          machine_model: string
          machine_type: string
          month: string
          other_expense: number | null
          profit: number
          profit_margin: number
          rent_received: number
          serial_number: string
          total_expense: number
          total_income: number
          travel_expense: number | null
        }
        Insert: {
          consumables_cost: number
          contract_id: string
          created_at?: string
          customer_id: string
          customer_name: string
          department?: string | null
          engineer_visit_cost?: number | null
          extra_copy_income: number
          food_expense?: number | null
          id?: string
          machine_id: string
          machine_model: string
          machine_type: string
          month: string
          other_expense?: number | null
          profit: number
          profit_margin: number
          rent_received: number
          serial_number: string
          total_expense: number
          total_income: number
          travel_expense?: number | null
        }
        Update: {
          consumables_cost?: number
          contract_id?: string
          created_at?: string
          customer_id?: string
          customer_name?: string
          department?: string | null
          engineer_visit_cost?: number | null
          extra_copy_income?: number
          food_expense?: number | null
          id?: string
          machine_id?: string
          machine_model?: string
          machine_type?: string
          month?: string
          other_expense?: number | null
          profit?: number
          profit_margin?: number
          rent_received?: number
          serial_number?: string
          total_expense?: number
          total_income?: number
          travel_expense?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "amc_profit_reports_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "amc_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amc_profit_reports_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "amc_machines"
            referencedColumns: ["id"]
          },
        ]
      }
      app_users: {
        Row: {
          branch: string | null
          created_at: string
          email: string
          has_set_password: boolean | null
          id: string
          is_active: boolean
          mobile: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          branch?: string | null
          created_at?: string
          email: string
          has_set_password?: boolean | null
          id?: string
          is_active?: boolean
          mobile: string
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          branch?: string | null
          created_at?: string
          email?: string
          has_set_password?: boolean | null
          id?: string
          is_active?: boolean
          mobile?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      cash_entries: {
        Row: {
          amount: number
          branch: string | null
          category: string
          created_at: string
          date: string
          department: string
          description: string
          entered_by: string
          id: string
          invoice_number: string | null
          narration: string | null
          payment_method: string
          po_number: string | null
          reference: string | null
          type: string
        }
        Insert: {
          amount: number
          branch?: string | null
          category: string
          created_at?: string
          date: string
          department: string
          description: string
          entered_by: string
          id?: string
          invoice_number?: string | null
          narration?: string | null
          payment_method: string
          po_number?: string | null
          reference?: string | null
          type: string
        }
        Update: {
          amount?: number
          branch?: string | null
          category?: string
          created_at?: string
          date?: string
          department?: string
          description?: string
          entered_by?: string
          id?: string
          invoice_number?: string | null
          narration?: string | null
          payment_method?: string
          po_number?: string | null
          reference?: string | null
          type?: string
        }
        Relationships: []
      }
      credit_terms: {
        Row: {
          created_at: string | null
          credit_limit: number | null
          due_date: string
          follow_up_date: string | null
          id: string
          last_follow_up_notes: string | null
          sale_id: string | null
          status: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          credit_limit?: number | null
          due_date: string
          follow_up_date?: string | null
          id?: string
          last_follow_up_notes?: string | null
          sale_id?: string | null
          status: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          credit_limit?: number | null
          due_date?: string
          follow_up_date?: string | null
          id?: string
          last_follow_up_notes?: string | null
          sale_id?: string | null
          status?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_terms_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_machine_interests: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          machine_name: string
          machine_type: string | null
          notes: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          machine_name: string
          machine_type?: string | null
          notes?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          machine_name?: string
          machine_type?: string | null
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_machine_interests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
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
      engineer_inventory: {
        Row: {
          assigned_date: string | null
          created_at: string | null
          engineer_id: string
          engineer_name: string
          id: string
          item_id: string
          item_name: string
          model_brand: string | null
          model_number: string | null
          quantity: number
          warehouse_id: string | null
          warehouse_source: string | null
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string | null
          engineer_id: string
          engineer_name: string
          id?: string
          item_id: string
          item_name: string
          model_brand?: string | null
          model_number?: string | null
          quantity: number
          warehouse_id?: string | null
          warehouse_source?: string | null
        }
        Update: {
          assigned_date?: string | null
          created_at?: string | null
          engineer_id?: string
          engineer_name?: string
          id?: string
          item_id?: string
          item_name?: string
          model_brand?: string | null
          model_number?: string | null
          quantity?: number
          warehouse_id?: string | null
          warehouse_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_inventory_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "engineers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineer_inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      engineers: {
        Row: {
          created_at: string | null
          current_job: string | null
          current_location: string
          email: string
          id: string
          leave_end_date: string | null
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
          leave_end_date?: string | null
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
          leave_end_date?: string | null
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
      inventory_returns: {
        Row: {
          condition: string
          created_at: string | null
          engineer_id: string
          engineer_name: string
          id: string
          item_id: string
          item_name: string
          notes: string | null
          quantity: number
          reason: string
          return_date: string | null
          warehouse_id: string | null
          warehouse_name: string | null
        }
        Insert: {
          condition: string
          created_at?: string | null
          engineer_id: string
          engineer_name: string
          id?: string
          item_id: string
          item_name: string
          notes?: string | null
          quantity: number
          reason: string
          return_date?: string | null
          warehouse_id?: string | null
          warehouse_name?: string | null
        }
        Update: {
          condition?: string
          created_at?: string | null
          engineer_id?: string
          engineer_name?: string
          id?: string
          item_id?: string
          item_name?: string
          notes?: string | null
          quantity?: number
          reason?: string
          return_date?: string | null
          warehouse_id?: string | null
          warehouse_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_returns_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "engineers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_returns_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transfers: {
        Row: {
          approved_by: string | null
          approved_date: string | null
          created_at: string
          destination_branch: string | null
          destination_type: string
          destination_warehouse_id: string | null
          dispatch_date: string | null
          id: string
          item_id: string
          quantity: number
          received_date: string | null
          remarks: string | null
          request_date: string
          requested_by: string | null
          source_branch: string | null
          source_type: string
          source_warehouse_id: string | null
          status: string
          tracking_number: string | null
          transfer_method: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string
          destination_branch?: string | null
          destination_type: string
          destination_warehouse_id?: string | null
          dispatch_date?: string | null
          id?: string
          item_id: string
          quantity?: number
          received_date?: string | null
          remarks?: string | null
          request_date?: string
          requested_by?: string | null
          source_branch?: string | null
          source_type: string
          source_warehouse_id?: string | null
          status?: string
          tracking_number?: string | null
          transfer_method?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string
          destination_branch?: string | null
          destination_type?: string
          destination_warehouse_id?: string | null
          dispatch_date?: string | null
          id?: string
          item_id?: string
          quantity?: number
          received_date?: string | null
          remarks?: string | null
          request_date?: string
          requested_by?: string | null
          source_branch?: string | null
          source_type?: string
          source_warehouse_id?: string | null
          status?: string
          tracking_number?: string | null
          transfer_method?: string | null
        }
        Relationships: []
      }
      opening_stock_entries: {
        Row: {
          brand: string
          category: string
          compatible_models: Json | null
          created_at: string
          created_by: string | null
          full_item_name: string | null
          id: string
          min_stock: number
          part_name: string
          part_number: string | null
          purchase_price: number
          quantity: number
          warehouse_id: string | null
          warehouse_name: string | null
        }
        Insert: {
          brand: string
          category: string
          compatible_models?: Json | null
          created_at?: string
          created_by?: string | null
          full_item_name?: string | null
          id?: string
          min_stock?: number
          part_name: string
          part_number?: string | null
          purchase_price: number
          quantity?: number
          warehouse_id?: string | null
          warehouse_name?: string | null
        }
        Update: {
          brand?: string
          category?: string
          compatible_models?: Json | null
          created_at?: string
          created_by?: string | null
          full_item_name?: string | null
          id?: string
          min_stock?: number
          part_name?: string
          part_number?: string | null
          purchase_price?: number
          quantity?: number
          warehouse_id?: string | null
          warehouse_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opening_stock_entries_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      part_reconciliations: {
        Row: {
          created_at: string
          engineer_id: string
          id: string
          part_id: string
          part_name: string
          purchase_price: number | null
          quantity: number
          reconciled_at: string
          service_call_id: string
        }
        Insert: {
          created_at?: string
          engineer_id: string
          id?: string
          part_id: string
          part_name: string
          purchase_price?: number | null
          quantity: number
          reconciled_at?: string
          service_call_id: string
        }
        Update: {
          created_at?: string
          engineer_id?: string
          id?: string
          part_id?: string
          part_name?: string
          purchase_price?: number | null
          quantity?: number
          reconciled_at?: string
          service_call_id?: string
        }
        Relationships: []
      }
      payables: {
        Row: {
          amount: number
          amount_paid: number | null
          balance: number
          branch: string | null
          created_at: string
          department: string | null
          description: string | null
          due_date: string
          id: string
          invoice_number: string | null
          last_follow_up: string | null
          notes: string | null
          payment_method: string | null
          po_number: string | null
          priority: string
          status: string
          updated_at: string
          vendor_id: string | null
          vendor_name: string
        }
        Insert: {
          amount: number
          amount_paid?: number | null
          balance: number
          branch?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          due_date: string
          id?: string
          invoice_number?: string | null
          last_follow_up?: string | null
          notes?: string | null
          payment_method?: string | null
          po_number?: string | null
          priority?: string
          status?: string
          updated_at?: string
          vendor_id?: string | null
          vendor_name: string
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          balance?: number
          branch?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string | null
          last_follow_up?: string | null
          notes?: string | null
          payment_method?: string | null
          po_number?: string | null
          priority?: string
          status?: string
          updated_at?: string
          vendor_id?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "payables_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          delivery_date: string | null
          due_date: string | null
          grand_total: number
          id: string
          invoice_number: string | null
          items: Json
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          po_number: string
          status: string
          subtotal: number
          terms: string | null
          total_gst: number
          vendor_id: string | null
          vendor_name: string
        }
        Insert: {
          created_at?: string
          delivery_date?: string | null
          due_date?: string | null
          grand_total: number
          id?: string
          invoice_number?: string | null
          items: Json
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          po_number: string
          status: string
          subtotal: number
          terms?: string | null
          total_gst: number
          vendor_id?: string | null
          vendor_name: string
        }
        Update: {
          created_at?: string
          delivery_date?: string | null
          due_date?: string | null
          grand_total?: number
          id?: string
          invoice_number?: string | null
          items?: Json
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          po_number?: string
          status?: string
          subtotal?: number
          terms?: string | null
          total_gst?: number
          vendor_id?: string | null
          vendor_name?: string
        }
        Relationships: []
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
      receivables: {
        Row: {
          amount: number
          amountpaid: number | null
          balance: number
          branch: string | null
          contactnumber: string | null
          contactperson: string | null
          created_at: string
          customer: string
          customer_id: string | null
          date: string
          department: string | null
          duedate: string
          id: string
          invoicenumber: string
          lastfollowup: string | null
          notes: string | null
          paymentmethod: string | null
          paymentmode: string | null
          priority: string
          status: string
        }
        Insert: {
          amount: number
          amountpaid?: number | null
          balance: number
          branch?: string | null
          contactnumber?: string | null
          contactperson?: string | null
          created_at?: string
          customer: string
          customer_id?: string | null
          date: string
          department?: string | null
          duedate: string
          id?: string
          invoicenumber: string
          lastfollowup?: string | null
          notes?: string | null
          paymentmethod?: string | null
          paymentmode?: string | null
          priority?: string
          status?: string
        }
        Update: {
          amount?: number
          amountpaid?: number | null
          balance?: number
          branch?: string | null
          contactnumber?: string | null
          contactperson?: string | null
          created_at?: string
          customer?: string
          customer_id?: string | null
          date?: string
          department?: string | null
          duedate?: string
          id?: string
          invoicenumber?: string
          lastfollowup?: string | null
          notes?: string | null
          paymentmethod?: string | null
          paymentmode?: string | null
          priority?: string
          status?: string
        }
        Relationships: []
      }
      sale_payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string
          reference_number: string | null
          sale_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method: string
          reference_number?: string | null
          sale_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string
          reference_number?: string | null
          sale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          bill_generated: boolean | null
          billing_address: string | null
          created_at: string | null
          created_by: string | null
          created_by_user_id: string | null
          customer_id: string | null
          customer_name: string
          customer_type: string
          date: string
          due_date: string | null
          gst_number: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          payment_method: string | null
          payment_status: string
          payment_terms: string | null
          sales_number: string
          sales_type: string | null
          shipping_address: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          total_amount: number
        }
        Insert: {
          bill_generated?: boolean | null
          billing_address?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_user_id?: string | null
          customer_id?: string | null
          customer_name: string
          customer_type: string
          date?: string
          due_date?: string | null
          gst_number?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_status: string
          payment_terms?: string | null
          sales_number: string
          sales_type?: string | null
          shipping_address?: string | null
          status: string
          subtotal: number
          tax_amount?: number | null
          total_amount: number
        }
        Update: {
          bill_generated?: boolean | null
          billing_address?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_user_id?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_type?: string
          date?: string
          due_date?: string | null
          gst_number?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          payment_terms?: string | null
          sales_number?: string
          sales_type?: string | null
          shipping_address?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
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
          reminder_sent: boolean | null
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
          reminder_sent?: boolean | null
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
          reminder_sent?: boolean | null
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
      sales_items: {
        Row: {
          category: string | null
          description: string | null
          gst_amount: number | null
          gst_percent: number | null
          id: string
          item_id: string | null
          item_name: string
          quantity: number
          sale_id: string | null
          total: number
          unit_price: number
        }
        Insert: {
          category?: string | null
          description?: string | null
          gst_amount?: number | null
          gst_percent?: number | null
          id?: string
          item_id?: string | null
          item_name: string
          quantity: number
          sale_id?: string | null
          total: number
          unit_price: number
        }
        Update: {
          category?: string | null
          description?: string | null
          gst_amount?: number | null
          gst_percent?: number | null
          id?: string
          item_id?: string | null
          item_name?: string
          quantity?: number
          sale_id?: string | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
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
          is_paid: boolean | null
          issue_description: string
          issue_type: string
          location: string
          machine_id: string | null
          machine_model: string
          parts_reconciled: boolean | null
          parts_used: Json | null
          payment_date: string | null
          payment_method: string | null
          phone: string
          priority: string
          serial_number: string | null
          service_charge: number | null
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
          is_paid?: boolean | null
          issue_description: string
          issue_type: string
          location: string
          machine_id?: string | null
          machine_model: string
          parts_reconciled?: boolean | null
          parts_used?: Json | null
          payment_date?: string | null
          payment_method?: string | null
          phone: string
          priority: string
          serial_number?: string | null
          service_charge?: number | null
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
          is_paid?: boolean | null
          issue_description?: string
          issue_type?: string
          location?: string
          machine_id?: string | null
          machine_model?: string
          parts_reconciled?: boolean | null
          parts_used?: Json | null
          payment_date?: string | null
          payment_method?: string | null
          phone?: string
          priority?: string
          serial_number?: string | null
          service_charge?: number | null
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
      service_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          customer_id: string | null
          customer_name: string | null
          date: string
          description: string
          engineer_id: string
          engineer_name: string
          id: string
          is_reimbursed: boolean
          receipt_image_url: string | null
          service_call_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          date: string
          description: string
          engineer_id: string
          engineer_name: string
          id?: string
          is_reimbursed?: boolean
          receipt_image_url?: string | null
          service_call_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          date?: string
          description?: string
          engineer_id?: string
          engineer_name?: string
          id?: string
          is_reimbursed?: boolean
          receipt_image_url?: string | null
          service_call_id?: string
        }
        Relationships: []
      }
      shipment_details: {
        Row: {
          additional_details: string | null
          bus_details: string | null
          courier_name: string | null
          created_at: string | null
          created_by: string | null
          id: string
          sale_id: string | null
          shipment_method: Database["public"]["Enums"]["shipment_method_type"]
          status: string | null
          tracking_number: string | null
          train_details: string | null
        }
        Insert: {
          additional_details?: string | null
          bus_details?: string | null
          courier_name?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          sale_id?: string | null
          shipment_method: Database["public"]["Enums"]["shipment_method_type"]
          status?: string | null
          tracking_number?: string | null
          train_details?: string | null
        }
        Update: {
          additional_details?: string | null
          bus_details?: string | null
          courier_name?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          sale_id?: string | null
          shipment_method?: Database["public"]["Enums"]["shipment_method_type"]
          status?: string | null
          tracking_number?: string | null
          train_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_details_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string
          assigned_to_user_id: string | null
          attachments: string[] | null
          branch: string | null
          created_at: string
          created_by: string
          created_by_user_id: string | null
          department: string
          description: string
          due_date: string
          has_reminder: boolean | null
          id: string
          priority: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          assigned_to_user_id?: string | null
          attachments?: string[] | null
          branch?: string | null
          created_at?: string
          created_by: string
          created_by_user_id?: string | null
          department: string
          description: string
          due_date: string
          has_reminder?: boolean | null
          id?: string
          priority: string
          status: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          assigned_to_user_id?: string | null
          attachments?: string[] | null
          branch?: string | null
          created_at?: string
          created_by?: string
          created_by_user_id?: string | null
          department?: string
          description?: string
          due_date?: string
          has_reminder?: boolean | null
          id?: string
          priority?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_assigned_to_user"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_created_by_user"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_authorized_chats: {
        Row: {
          authorized_by: string | null
          chat_id: string
          created_at: string
          id: string
          is_active: boolean
          notes: string | null
          user_name: string | null
        }
        Insert: {
          authorized_by?: string | null
          chat_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          user_name?: string | null
        }
        Update: {
          authorized_by?: string | null
          chat_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      telegram_config: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      telegram_message_logs: {
        Row: {
          chat_id: string
          created_at: string
          direction: string
          error_message: string | null
          id: string
          message_text: string | null
          message_type: string
          processed_status: string | null
        }
        Insert: {
          chat_id: string
          created_at?: string
          direction: string
          error_message?: string | null
          id?: string
          message_text?: string | null
          message_type: string
          processed_status?: string | null
        }
        Update: {
          chat_id?: string
          created_at?: string
          direction?: string
          error_message?: string | null
          id?: string
          message_text?: string | null
          message_type?: string
          processed_status?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          gst_no: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gst_no?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gst_no?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      warehouse_stock: {
        Row: {
          id: string
          item_id: string
          last_updated: string
          quantity: number
          warehouse_id: string
        }
        Insert: {
          id?: string
          item_id: string
          last_updated?: string
          quantity?: number
          warehouse_id: string
        }
        Update: {
          id?: string
          item_id?: string
          last_updated?: string
          quantity?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string
          code: string
          contact_person: string
          contact_phone: string
          created_at: string
          id: string
          is_active: boolean
          location: string
          name: string
        }
        Insert: {
          address: string
          code: string
          contact_person: string
          contact_phone: string
          created_at?: string
          id?: string
          is_active?: boolean
          location: string
          name: string
        }
        Update: {
          address?: string
          code?: string
          contact_person?: string
          contact_phone?: string
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_app_user: {
        Args: {
          user_id: string
          user_name: string
          user_email: string
          user_mobile: string
          user_role: string
          user_branch: string
          user_is_active: boolean
          user_has_set_password: boolean
        }
        Returns: Json
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      shipment_method_type: "By Hand" | "By Bus" | "By Courier" | "By Train"
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
    Enums: {
      shipment_method_type: ["By Hand", "By Bus", "By Courier", "By Train"],
    },
  },
} as const
