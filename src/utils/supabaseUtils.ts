
import { supabase } from "@/integrations/supabase/client";

/**
 * Add the shipment_method and shipment_details columns to the sales table if they don't exist
 */
export async function ensureShipmentFieldsExist(): Promise<boolean> {
  try {
    // Execute SQL to add columns if they don't exist
    const { error } = await supabase.rpc('add_columns_if_not_exist', {
      _table_name: 'sales',
      _column_defs: [
        { column_name: 'shipment_method', column_type: 'text' },
        { column_name: 'shipment_details', column_type: 'text' }
      ]
    });
    
    if (error) {
      console.error("Error ensuring shipment fields exist:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception ensuring shipment fields exist:", error);
    return false;
  }
}
