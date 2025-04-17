
import { format, parse, isValid, isBefore, addDays, addHours } from "date-fns";
import { Task, TaskPriority, TaskStatus, TaskType, User } from "@/types/task";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";

// Create a simple user object for the current user
const defaultUser: User = {
  id: "current-user",
  name: "Current User",
  email: "user@example.com",
  role: "User",
  department: "Admin"
};

export interface ParsedTaskCommand {
  customerName: string;
  taskTitle: string;
  dueDate: Date | null;
  notes: string;
  assignedTo: string; // User ID
  isValid: boolean;
  missingFields: string[];
}

export const parseTaskCommand = (command: string): ParsedTaskCommand => {
  const result: ParsedTaskCommand = {
    customerName: "",
    taskTitle: "",
    dueDate: null,
    notes: "",
    assignedTo: defaultUser.id,
    isValid: false,
    missingFields: []
  };

  // Extract customer name
  const customerRegex = /(?:for|with|to)\s+([A-Za-z\s]+)(?=[,\s]|on\s|at\s|tomorrow|next|$)/i;
  const customerMatch = command.match(customerRegex);
  
  if (customerMatch && customerMatch[1]) {
    result.customerName = customerMatch[1].trim();
  } else {
    result.missingFields.push("customerName");
  }

  // Extract date and time
  const now = new Date();
  
  // Check for specific date patterns
  const dateTimeRegex = /(?:on|at)\s+(\d{1,2}(?:st|nd|rd|th)?[\s,]+(?:january|february|march|april|may|june|july|august|september|october|november|december)|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;
  const dateTimeMatch = command.match(dateTimeRegex);
  
  // Check for relative dates
  const relativeDateRegex = /(tomorrow|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week))\s+(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?/i;
  const relativeDateMatch = command.match(relativeDateRegex);
  
  // Check for time only (assume today)
  const timeOnlyRegex = /(?:at|by)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)(?!\s+(?:on|at)\s+)/i;
  const timeOnlyMatch = command.match(timeOnlyRegex);
  
  if (dateTimeMatch) {
    const dateStr = dateTimeMatch[1];
    const timeStr = dateTimeMatch[2];
    
    // Handle various date formats
    let parsedDate: Date | null = null;
    
    // Try MM/DD/YYYY format
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length >= 2) {
        const monthIndex = parseInt(parts[0]) - 1;
        const day = parseInt(parts[1]);
        const year = parts.length > 2 ? parseInt(parts[2]) : now.getFullYear();
        parsedDate = new Date(year, monthIndex, day);
      }
    } else {
      // Try to parse month name + day
      const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
      let month = -1;
      let day = -1;
      
      for (let i = 0; i < monthNames.length; i++) {
        if (dateStr.toLowerCase().includes(monthNames[i])) {
          month = i;
          // Extract day number from string
          const dayMatch = dateStr.match(/\d{1,2}/);
          if (dayMatch) {
            day = parseInt(dayMatch[0]);
          }
          break;
        }
      }
      
      if (month !== -1 && day !== -1) {
        parsedDate = new Date(now.getFullYear(), month, day);
      }
    }
    
    if (parsedDate && isValid(parsedDate)) {
      // Parse time
      let hours = 0;
      let minutes = 0;
      
      if (timeStr) {
        if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
          const isPM = timeStr.toLowerCase().includes('pm');
          const timeDigits = timeStr.match(/\d{1,2}(?::\d{2})?/);
          
          if (timeDigits) {
            const timeParts = timeDigits[0].split(':');
            hours = parseInt(timeParts[0]);
            if (isPM && hours < 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
            minutes = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;
          }
        } else {
          // 24-hour format
          const timeParts = timeStr.split(':');
          hours = parseInt(timeParts[0]);
          minutes = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;
        }
      }
      
      parsedDate.setHours(hours, minutes, 0, 0);
      result.dueDate = parsedDate;
    }
  } else if (relativeDateMatch) {
    const relativeDate = relativeDateMatch[1].toLowerCase();
    const timeStr = relativeDateMatch[2];
    let parsedDate = new Date(now);
    
    // Handle relative date
    if (relativeDate.includes('tomorrow')) {
      parsedDate = addDays(parsedDate, 1);
    } else if (relativeDate.includes('next')) {
      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      for (let i = 0; i < days.length; i++) {
        if (relativeDate.includes(days[i])) {
          const targetDay = i;
          const currentDay = now.getDay();
          const daysToAdd = (targetDay + 7 - currentDay) % 7;
          parsedDate = addDays(parsedDate, daysToAdd === 0 ? 7 : daysToAdd);
          break;
        }
      }
      
      if (relativeDate.includes('week')) {
        parsedDate = addDays(parsedDate, 7);
      }
    }
    
    // Parse time if available
    if (timeStr) {
      let hours = 0;
      let minutes = 0;
      
      if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
        const isPM = timeStr.toLowerCase().includes('pm');
        const timeDigits = timeStr.match(/\d{1,2}(?::\d{2})?/);
        
        if (timeDigits) {
          const timeParts = timeDigits[0].split(':');
          hours = parseInt(timeParts[0]);
          if (isPM && hours < 12) hours += 12;
          if (!isPM && hours === 12) hours = 0;
          minutes = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;
        }
      } else {
        // 24-hour format
        const timeParts = timeStr.split(':');
        hours = parseInt(timeParts[0]);
        minutes = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;
      }
      
      parsedDate.setHours(hours, minutes, 0, 0);
    } else {
      // Default to 9 AM if no time specified
      parsedDate.setHours(9, 0, 0, 0);
    }
    
    result.dueDate = parsedDate;
  } else if (timeOnlyMatch) {
    const timeStr = timeOnlyMatch[1];
    let parsedDate = new Date(now);
    
    // Parse time
    let hours = 0;
    let minutes = 0;
    
    if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
      const isPM = timeStr.toLowerCase().includes('pm');
      const timeDigits = timeStr.match(/\d{1,2}(?::\d{2})?/);
      
      if (timeDigits) {
        const timeParts = timeDigits[0].split(':');
        hours = parseInt(timeParts[0]);
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        minutes = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;
      }
    } else {
      // 24-hour format
      const timeParts = timeStr.split(':');
      hours = parseInt(timeParts[0]);
      minutes = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;
    }
    
    parsedDate.setHours(hours, minutes, 0, 0);
    
    // If time is earlier than current time, assume tomorrow
    if (isBefore(parsedDate, now)) {
      parsedDate = addDays(parsedDate, 1);
    }
    
    result.dueDate = parsedDate;
  }
  
  if (!result.dueDate) {
    result.missingFields.push("dueDate");
  }

  // Extract task title/purpose
  const purposeRegex = /(?:regarding|about|for|to)\s+(?:the\s+)?(call|meet|discuss|follow\s+up\s+on|remind\s+about|check|review|update)(?:\s+(?:with|on|about))?\s+([^,.]+)/i;
  const purposeMatch = command.match(purposeRegex);
  
  if (purposeMatch) {
    result.taskTitle = `${purposeMatch[1]} ${purposeMatch[2]}`.trim();
  } else if (result.customerName) {
    // Default title based on customer name
    result.taskTitle = `Follow up with ${result.customerName}`;
  } else {
    result.missingFields.push("taskTitle");
  }

  // Extract notes (anything else in the command)
  const notesRegex = /notes?:?\s+([^,]+)(?:,|$)/i;
  const notesMatch = command.match(notesRegex);
  
  if (notesMatch) {
    result.notes = notesMatch[1].trim();
  }

  // Determine if command has enough information
  result.isValid = !result.missingFields.includes("customerName") && !result.missingFields.includes("dueDate");

  return result;
};

export const formatTaskTime = (date: Date): string => {
  return format(date, "d MMM, h:mm a"); // Example: "15 Apr, 10:30 AM"
};

export const createNewTask = (data: ParsedTaskCommand): Task => {
  return {
    id: `task-${Date.now()}`,
    title: data.taskTitle,
    description: data.notes || `Follow up with ${data.customerName}`,
    assignedTo: {
      id: data.assignedTo,
      name: defaultUser.name,
      email: defaultUser.email,
      role: defaultUser.role,
      department: "Sales"
    },
    createdBy: defaultUser,
    department: "Sales",
    dueDate: data.dueDate || new Date(),
    priority: "Medium" as TaskPriority,
    type: "Personal" as TaskType,
    hasReminder: true,
    branch: "Indore", // Default
    status: "Assigned" as TaskStatus,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};
