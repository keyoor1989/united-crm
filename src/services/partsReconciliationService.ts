
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
    
    // Transform the data to match our ServiceCall type
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
      partsUsed: Array.isArray(call.parts_used) ? call.parts_used : [],
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
    // First fetch the current service call to get the parts_used array
    const { data: serviceCall, error: fetchError } = await supabase
      .from('service_calls')
      .select('parts_used')
      .eq('id', serviceCallId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching service call for reconciliation:", fetchError);
      return false;
    }
    
    // Make sure parts_used is an array before trying to use map
    if (!Array.isArray(serviceCall.parts_used)) {
      console.error("parts_used is not an array:", serviceCall.parts_used);
      return false;
    }
    
    // Update the parts_used array with the new reconciliation status
    const updatedPartsUsed = serviceCall.parts_used.map((part: Part) => {
      if (part.id === partId) {
        return { ...part, isReconciled: reconciled };
      }
      return part;
    });
    
    // Check if all parts are now reconciled
    const allReconciled = updatedPartsUsed.every((part: Part) => part.isReconciled);
    
    // Update the service call with the modified parts_used array and parts_reconciled flag
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
    // First fetch the current service call to get the parts_used array
    const { data: serviceCall, error: fetchError } = await supabase
      .from('service_calls')
      .select('parts_used')
      .eq('id', serviceCallId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching service call for reconciliation:", fetchError);
      return false;
    }
    
    // Make sure parts_used is an array before trying to use map
    if (!Array.isArray(serviceCall.parts_used)) {
      console.error("parts_used is not an array:", serviceCall.parts_used);
      return false;
    }
    
    // Update all parts in the parts_used array with the new reconciliation status
    const updatedPartsUsed = serviceCall.parts_used.map((part: Part) => ({
      ...part,
      isReconciled: reconciled
    }));
    
    // Update the service call with the modified parts_used array and parts_reconciled flag
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
