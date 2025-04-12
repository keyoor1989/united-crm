
import { supabase } from "@/integrations/supabase/client";
import { ServiceCall, Part } from "@/types/service";
import { toast } from "@/hooks/use-toast";

export const fetchServiceCallsWithParts = async (): Promise<ServiceCall[]> => {
  try {
    const { data, error } = await supabase
      .from('service_calls')
      .select('*')
      .not('parts_used', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching service calls with parts:", error);
      toast({
        title: "Error",
        description: "Failed to load service calls with parts",
        variant: "destructive",
      });
      return [];
    }
    
    const serviceCalls: ServiceCall[] = data.map(call => ({
      id: call.id,
      customerId: call.customer_id,
      customerName: call.customer_name,
      phone: call.phone || "",
      machineId: call.machine_id || "",
      machineModel: call.machine_model,
      serialNumber: call.serial_number || "",
      location: call.location || "",
      issueType: call.issue_type || "",
      issueDescription: call.issue_description || "",
      callType: call.call_type || "",
      priority: call.priority || "",
      status: call.status,
      engineerId: call.engineer_id || null,
      engineerName: call.engineer_name || "Unassigned",
      createdAt: call.created_at,
      slaDeadline: call.sla_deadline || "",
      startTime: call.start_time || null,
      completionTime: call.completion_time || null,
      partsUsed: Array.isArray(call.parts_used) ? call.parts_used.map((part: any) => ({
        id: part.id,
        name: part.name,
        partNumber: part.partNumber,
        quantity: part.quantity,
        price: part.price,
        cost: part.cost || undefined,
        profit: part.profit || undefined,
        isReconciled: part.isReconciled || false
      })) : [],
      feedback: null,
      serviceCharge: call.service_charge || 0,
      isPaid: call.is_paid || false,
      paymentDate: call.payment_date,
      paymentMethod: call.payment_method,
      partsReconciled: call.parts_reconciled || false
    }));
    
    console.log("Fetched service calls with parts:", serviceCalls);
    return serviceCalls;
  } catch (err) {
    console.error("Unexpected error fetching service calls with parts:", err);
    return [];
  }
};

export const updatePartReconciliation = async (
  serviceCallId: string, 
  partId: string, 
  reconciled: boolean
): Promise<boolean> => {
  try {
    const { data: serviceCall, error: fetchError } = await supabase
      .from('service_calls')
      .select('parts_used, engineer_id')
      .eq('id', serviceCallId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching service call for reconciliation:", fetchError);
      return false;
    }
    
    if (!Array.isArray(serviceCall.parts_used)) {
      console.error("parts_used is not an array:", serviceCall.parts_used);
      return false;
    }
    
    const partsUsed = serviceCall.parts_used as any[];
    const part = partsUsed.find(p => p.id === partId);
    
    if (!part) {
      console.error("Part not found in service call:", partId);
      return false;
    }
    
    // Only update engineer inventory if reconciling (not unreconciling)
    if (reconciled && !part.isReconciled) {
      // Check if the part has already been reconciled in the database
      const { data: existingRecords, error: recordsError } = await supabase
        .from('part_reconciliations')
        .select('*')
        .eq('service_call_id', serviceCallId)
        .eq('part_id', partId)
        .limit(1);
      
      if (recordsError) {
        console.error("Error checking part reconciliation records:", recordsError);
      }
      
      // If not already reconciled in database, update engineer inventory and save reconciliation record
      if (!existingRecords || existingRecords.length === 0) {
        const { data: engineerItems, error: itemsError } = await supabase
          .from('engineer_inventory')
          .select('*')
          .eq('engineer_id', serviceCall.engineer_id)
          .ilike('item_name', `%${part.name}%`);
          
        if (itemsError) {
          console.error("Error fetching engineer inventory:", itemsError);
        } else if (engineerItems && engineerItems.length > 0) {
          const matchingItem = engineerItems[0];
          
          const newQuantity = Math.max(0, matchingItem.quantity - part.quantity);
          
          // Update engineer inventory
          if (newQuantity === 0) {
            const { error: deleteError } = await supabase
              .from('engineer_inventory')
              .delete()
              .eq('id', matchingItem.id);
              
            if (deleteError) {
              console.error("Error removing item from engineer inventory:", deleteError);
            } else {
              console.log(`Removed item ${matchingItem.item_name} from engineer inventory`);
              toast({
                title: "Inventory Updated",
                description: `Removed ${matchingItem.item_name} from ${serviceCall.engineer_id}'s inventory`,
                variant: "default",
              });
            }
          } else {
            const { error: updateError } = await supabase
              .from('engineer_inventory')
              .update({ quantity: newQuantity })
              .eq('id', matchingItem.id);
              
            if (updateError) {
              console.error("Error updating engineer inventory:", updateError);
            } else {
              console.log(`Updated item ${matchingItem.item_name} quantity to ${newQuantity}`);
              toast({
                title: "Inventory Updated",
                description: `Updated ${matchingItem.item_name} quantity to ${newQuantity}`,
                variant: "default",
              });
            }
          }
          
          // Get purchase price from opening_stock_entries
          const { data: stockEntries, error: stockError } = await supabase
            .from('opening_stock_entries')
            .select('purchase_price')
            .eq('part_name', part.name)
            .limit(1);
            
          const purchasePrice = stockEntries && stockEntries.length > 0 
            ? Number(stockEntries[0].purchase_price) 
            : 0;
          
          // Record this reconciliation in the database with purchase price
          const { error: insertError } = await supabase
            .from('part_reconciliations')
            .insert({
              service_call_id: serviceCallId,
              part_id: partId,
              part_name: part.name,
              quantity: part.quantity,
              engineer_id: serviceCall.engineer_id,
              purchase_price: purchasePrice
            });
            
          if (insertError) {
            console.error("Error recording part reconciliation:", insertError);
          }
        } else {
          console.log("No matching item found in engineer inventory for:", part.name);
        }
      }
    } else if (!reconciled && part.isReconciled) {
      // Handle unreconciling if needed (optional - could add inventory back)
      // For now, we'll just delete the reconciliation record
      const { error: deleteError } = await supabase
        .from('part_reconciliations')
        .delete()
        .eq('service_call_id', serviceCallId)
        .eq('part_id', partId);
        
      if (deleteError) {
        console.error("Error removing reconciliation record:", deleteError);
      }
    }
    
    // Update the part's reconciliation status in the service call
    const updatedPartsUsed = partsUsed.map(p => {
      if (p.id === partId) {
        return { ...p, isReconciled: reconciled };
      }
      return p;
    });
    
    const allReconciled = updatedPartsUsed.every(p => p.isReconciled);
    
    const { error: updateError } = await supabase
      .from('service_calls')
      .update({ 
        parts_used: updatedPartsUsed,
        parts_reconciled: allReconciled
      })
      .eq('id', serviceCallId);
    
    if (updateError) {
      console.error("Error updating part reconciliation:", updateError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Unexpected error updating part reconciliation:", err);
    return false;
  }
};

export const updateServiceCallReconciliation = async (
  serviceCallId: string, 
  reconciled: boolean
): Promise<boolean> => {
  try {
    const { data: serviceCall, error: fetchError } = await supabase
      .from('service_calls')
      .select('parts_used, engineer_id')
      .eq('id', serviceCallId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching service call for reconciliation:", fetchError);
      return false;
    }
    
    if (!Array.isArray(serviceCall.parts_used)) {
      console.error("parts_used is not an array:", serviceCall.parts_used);
      return false;
    }
    
    const partsUsed = serviceCall.parts_used as any[];
    
    if (reconciled) {
      for (const part of partsUsed) {
        if (!part.isReconciled) {
          // Check if this part has already been reconciled in the database
          const { data: existingRecords, error: recordsError } = await supabase
            .from('part_reconciliations')
            .select('*')
            .eq('service_call_id', serviceCallId)
            .eq('part_id', part.id)
            .limit(1);
            
          if (recordsError) {
            console.error("Error checking part reconciliation records:", recordsError);
            continue;
          }
          
          // Only update inventory if not already reconciled in database
          if (!existingRecords || existingRecords.length === 0) {
            const { data: engineerItems, error: itemsError } = await supabase
              .from('engineer_inventory')
              .select('*')
              .eq('engineer_id', serviceCall.engineer_id)
              .ilike('item_name', `%${part.name}%`);
              
            if (itemsError) {
              console.error("Error fetching engineer inventory:", itemsError);
              continue;
            }
            
            if (engineerItems && engineerItems.length > 0) {
              const matchingItem = engineerItems[0];
              
              const newQuantity = Math.max(0, matchingItem.quantity - part.quantity);
              
              if (newQuantity === 0) {
                const { error: deleteError } = await supabase
                  .from('engineer_inventory')
                  .delete()
                  .eq('id', matchingItem.id);
                  
                if (deleteError) {
                  console.error("Error removing item from engineer inventory:", deleteError);
                } else {
                  console.log(`Removed item ${matchingItem.item_name} from engineer inventory`);
                  toast({
                    title: "Inventory Updated",
                    description: `Removed ${matchingItem.item_name} from engineer's inventory`,
                    variant: "default",
                  });
                }
              } else {
                const { error: updateError } = await supabase
                  .from('engineer_inventory')
                  .update({ quantity: newQuantity })
                  .eq('id', matchingItem.id);
                  
                if (updateError) {
                  console.error("Error updating engineer inventory:", updateError);
                } else {
                  console.log(`Updated item ${matchingItem.item_name} quantity to ${newQuantity}`);
                  toast({
                    title: "Inventory Updated",
                    description: `Updated ${matchingItem.item_name} quantity to ${newQuantity}`,
                    variant: "default",
                  });
                }
              }
              
              // Get purchase price from opening_stock_entries
              const { data: stockEntries, error: stockError } = await supabase
                .from('opening_stock_entries')
                .select('purchase_price')
                .eq('part_name', part.name)
                .limit(1);
                
              const purchasePrice = stockEntries && stockEntries.length > 0 
                ? Number(stockEntries[0].purchase_price) 
                : 0;
              
              // Record this reconciliation with purchase price
              const { error: insertError } = await supabase
                .from('part_reconciliations')
                .insert({
                  service_call_id: serviceCallId,
                  part_id: part.id,
                  part_name: part.name,
                  quantity: part.quantity,
                  engineer_id: serviceCall.engineer_id,
                  purchase_price: purchasePrice
                });
                
              if (insertError) {
                console.error("Error recording part reconciliation:", insertError);
              }
            } else {
              console.log("No matching item found in engineer inventory for:", part.name);
            }
          }
        }
      }
    } else if (!reconciled) {
      // Handle unreconciling all parts if needed (optional - could add inventory back)
      // For now, just delete reconciliation records
      const { error: deleteError } = await supabase
        .from('part_reconciliations')
        .delete()
        .eq('service_call_id', serviceCallId);
        
      if (deleteError) {
        console.error("Error removing reconciliation records:", deleteError);
      }
    }
    
    const updatedPartsUsed = partsUsed.map(part => ({
      ...part,
      isReconciled: reconciled
    }));
    
    const { error: updateError } = await supabase
      .from('service_calls')
      .update({ 
        parts_used: updatedPartsUsed,
        parts_reconciled: reconciled
      })
      .eq('id', serviceCallId);
    
    if (updateError) {
      console.error("Error updating service call reconciliation:", updateError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Unexpected error updating service call reconciliation:", err);
    return false;
  }
};

export const addPartToServiceCall = async (
  serviceCallId: string,
  part: Partial<Part>
): Promise<boolean> => {
  try {
    const { data: serviceCall, error: fetchError } = await supabase
      .from('service_calls')
      .select('parts_used')
      .eq('id', serviceCallId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching service call for adding part:", fetchError);
      return false;
    }
    
    const currentParts = Array.isArray(serviceCall.parts_used) ? serviceCall.parts_used : [];
    
    const newPart = {
      id: crypto.randomUUID(),
      name: part.name || "Unknown Part",
      partNumber: part.partNumber || "N/A",
      quantity: part.quantity || 1,
      price: part.price || 0,
      cost: part.cost,
      profit: part.profit,
      isReconciled: false
    };
    
    const updatedPartsUsed = [...currentParts, newPart];
    
    const { error: updateError } = await supabase
      .from('service_calls')
      .update({ 
        parts_used: updatedPartsUsed,
        parts_reconciled: false
      })
      .eq('id', serviceCallId);
    
    if (updateError) {
      console.error("Error adding part to service call:", updateError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Unexpected error adding part to service call:", err);
    return false;
  }
};
