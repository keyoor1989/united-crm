
/**
 * Parse a task assignment command from a message
 */
export function parseTaskCommand(text: string): any {
  const result: any = {
    engineer: '',
    customer: '',
    issue: '',
    deadline: '',
    priority: '',
    isValid: false
  };
  
  // Extract engineer
  const engineerMatch = text.match(/Engineer:?\s+([^,\n]+)/i);
  if (engineerMatch && engineerMatch[1]) {
    result.engineer = engineerMatch[1].trim();
  }
  
  // Extract customer
  const customerMatch = text.match(/Customer:?\s+([^,\n]+)/i);
  if (customerMatch && customerMatch[1]) {
    result.customer = customerMatch[1].trim();
  }
  
  // Extract issue
  const issueMatch = text.match(/Issue:?\s+([^,\n]+)/i) || text.match(/Problem:?\s+([^,\n]+)/i);
  if (issueMatch && issueMatch[1]) {
    result.issue = issueMatch[1].trim();
  }
  
  // Extract deadline
  const deadlineMatch = text.match(/Deadline:?\s+([^,\n]+)/i) || text.match(/Due:?\s+([^,\n]+)/i);
  if (deadlineMatch && deadlineMatch[1]) {
    result.deadline = deadlineMatch[1].trim();
  }
  
  // Extract priority
  const priorityMatch = text.match(/Priority:?\s+([^,\n]+)/i);
  if (priorityMatch && priorityMatch[1]) {
    result.priority = priorityMatch[1].trim();
  } else {
    // Default priority is Medium
    result.priority = 'Medium';
  }
  
  // Check if mandatory fields are present
  result.isValid = Boolean(result.engineer && result.customer);
  
  return result;
}

/**
 * Calculate deadline date from a text description
 */
export function parseDeadlineDate(deadlineText: string): Date {
  const now = new Date();
  
  if (!deadlineText) {
    // Default to tomorrow if no deadline provided
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  const lowerDeadline = deadlineText.toLowerCase();
  
  if (lowerDeadline === 'today') {
    return now;
  } else if (lowerDeadline === 'tomorrow') {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  } else if (lowerDeadline.includes('next week')) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  } else if (lowerDeadline.includes('hour')) {
    // Parse something like "2 hours"
    const hoursMatch = lowerDeadline.match(/(\d+)\s*hour/);
    if (hoursMatch && hoursMatch[1]) {
      const hoursToAdd = parseInt(hoursMatch[1]);
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + hoursToAdd);
      return deadline;
    }
  }
  
  // Try to parse an actual date
  const parsedDate = new Date(deadlineText);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }
  
  // Default to tomorrow if parsing fails
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

/**
 * Determine issue type based on description
 */
export function determineIssueType(issueDescription: string): string {
  if (!issueDescription) return 'General';
  
  const lowerIssue = issueDescription.toLowerCase();
  
  if (lowerIssue.includes('toner') || lowerIssue.includes('cartridge') || 
      lowerIssue.includes('ink')) {
    return 'Supplies';
  } else if (lowerIssue.includes('paper') || lowerIssue.includes('jam') || 
            lowerIssue.includes('feed')) {
    return 'Paper Feed';
  } else if (lowerIssue.includes('quality') || lowerIssue.includes('print') || 
            lowerIssue.includes('image')) {
    return 'Print Quality';
  } else if (lowerIssue.includes('network') || lowerIssue.includes('connect') || 
            lowerIssue.includes('wifi')) {
    return 'Connectivity';
  } else if (lowerIssue.includes('error') || lowerIssue.includes('code') || 
            lowerIssue.includes('message')) {
    return 'Error Code';
  } else if (lowerIssue.includes('drum') || lowerIssue.includes('fuser') || 
            lowerIssue.includes('maintenance')) {
    return 'Component Replacement';
  } else {
    return 'General';
  }
}
