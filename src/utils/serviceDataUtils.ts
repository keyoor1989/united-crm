
import { ServiceCall, Engineer, EngineerStatus, EngineerSkillLevel, Part, Feedback } from "@/types/service";

export const transformEngineersData = (data: any[]): Engineer[] => {
  return data.map(eng => {
    return {
      id: eng.id,
      name: eng.name,
      phone: eng.phone,
      email: eng.email,
      location: eng.location,
      status: eng.status as EngineerStatus,
      skillLevel: eng.skill_level as EngineerSkillLevel,
      currentJob: eng.current_job,
      currentLocation: eng.current_location,
      // Handle leave_end_date property safely
      leaveEndDate: eng.leave_end_date as string | undefined
    };
  });
};

export const transformServiceCallsData = (data: any[]): ServiceCall[] => {
  return data.map(call => {
    let parsedPartsUsed: Part[] = [];
    if (Array.isArray(call.parts_used)) {
      parsedPartsUsed = call.parts_used.map((part: any) => ({
        id: part.id || "",
        name: part.name || "",
        partNumber: part.partNumber || "",
        quantity: part.quantity || 0,
        price: part.price || 0,
        isReconciled: part.isReconciled || false
      }));
    }
    
    let parsedFeedback: Feedback | null = null;
    if (call.feedback && typeof call.feedback === 'object' && !Array.isArray(call.feedback)) {
      const feedbackObj = call.feedback as Record<string, any>;
      parsedFeedback = {
        rating: typeof feedbackObj.rating === 'number' ? feedbackObj.rating : 0,
        comment: typeof feedbackObj.comment === 'string' ? feedbackObj.comment : null,
        date: typeof feedbackObj.date === 'string' ? feedbackObj.date : new Date().toISOString()
      };
    }
    
    return {
      id: call.id,
      customerId: call.customer_id,
      customerName: call.customer_name,
      phone: call.phone,
      machineId: call.machine_id || "",
      machineModel: call.machine_model,
      serialNumber: call.serial_number || "",
      location: call.location,
      issueType: call.issue_type,
      issueDescription: call.issue_description,
      callType: call.call_type,
      priority: call.priority,
      status: call.status,
      engineerId: call.engineer_id,
      engineerName: call.engineer_name || "",
      createdAt: call.created_at,
      slaDeadline: call.sla_deadline || new Date().toISOString(),
      startTime: call.start_time,
      completionTime: call.completion_time,
      partsUsed: parsedPartsUsed,
      feedback: parsedFeedback,
      // Handle additional fields safely
      serviceCharge: typeof call.service_charge === 'number' ? call.service_charge : 0,
      isPaid: Boolean(call.is_paid),
      paymentDate: call.payment_date as string | undefined,
      paymentMethod: call.payment_method as string | undefined,
      partsReconciled: Boolean(call.parts_reconciled)
    };
  });
};

export const filterServiceCalls = (serviceCalls: ServiceCall[], status: string, searchTerm: string) => {
  const filteredByStatus = status === "all" 
    ? serviceCalls 
    : serviceCalls.filter(call => call.status.toLowerCase() === status.toLowerCase());
  
  if (!searchTerm) return filteredByStatus;
  
  return filteredByStatus.filter(call => 
    call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
