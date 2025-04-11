
import { useState } from "react";
import { Message } from "../types/chatTypes";
import { CustomerType } from "@/types/customer";
import { parseCustomerCommand, createNewCustomer } from "@/utils/chatCommands/customerParser";
import { parsePhoneNumberCommand, findCustomerByPhone } from "@/utils/chatCommands/customerLookupParser";
import { parseTaskCommand, createNewTask } from "@/utils/chatCommands/taskParser";
import { parseInventoryCommand } from "@/utils/chatCommands/inventoryParser";
import { parseQuotationCommand } from "@/utils/chatCommands/quotationParser";
import CustomerLookupView from "../CustomerLookupView";
import CustomerCreationView from "../CustomerCreationView";
import TaskCreationView from "../TaskCreationView";
import InventoryResultView from "../InventoryResultView";
import QuotationGenerator from "../QuotationGenerator";

interface UseCommandProcessorProps {
  customers: CustomerType[];
  addMessageToChat: (message: Message) => void;
}

export const useCommandProcessor = ({ customers, addMessageToChat }: UseCommandProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processStructuredCommand = async (message: string): Promise<{handled: boolean, response?: React.ReactNode}> => {
    // Check for phone number lookup command
    const phoneNumber = parsePhoneNumberCommand(message);
    if (phoneNumber) {
      const customer = findCustomerByPhone(phoneNumber, customers);
      if (customer) {
        return {
          handled: true,
          response: <CustomerLookupView customer={customer} />
        };
      } else {
        return {
          handled: true,
          response: `❌ No customer found with the number ${phoneNumber}`
        };
      }
    }

    // Check for customer creation command
    const parsedCustomer = parseCustomerCommand(message);
    if (parsedCustomer.isValid) {
      // Check for duplicate customer
      const existingCustomer = customers.find(
        (c) => c.phone === parsedCustomer.phone
      );

      if (existingCustomer) {
        return {
          handled: true,
          response: `⚠️ Customer with phone ${parsedCustomer.phone} already exists as "${existingCustomer.name}"`
        };
      }

      const newCustomer = createNewCustomer(parsedCustomer);
      return {
        handled: true,
        response: <CustomerCreationView customer={newCustomer} />
      };
    }

    // Check for task creation command
    const taskResult = parseTaskCommand(message);
    if (taskResult.isValid) {
      // Create a new task from the parsed data
      const newTask = createNewTask(taskResult);
      return {
        handled: true,
        response: <TaskCreationView task={newTask} />
      };
    }

    // Check for inventory command
    const inventoryResult = parseInventoryCommand(message);
    if (inventoryResult.matchedItems.length > 0 || 
        (message.toLowerCase().includes("inventory") || 
         message.toLowerCase().includes("stock"))) {
      return {
        handled: true,
        response: <InventoryResultView queryResult={inventoryResult} />
      };
    }

    // Check for quotation command
    const quotationResult = parseQuotationCommand(message);
    // Check if this is a quotation command based on the pattern
    if (message.toLowerCase().includes("quotation") || 
        message.toLowerCase().includes("quote") || 
        quotationResult.models.length > 0) {
      return {
        handled: true,
        response: <QuotationGenerator initialData={quotationResult} onComplete={() => {}} onCancel={() => {}} />
      };
    }

    // No structured command matched
    return { handled: false };
  };

  const processCommand = async (messageText: string): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      // First check if it's a structured command
      const commandResult = await processStructuredCommand(messageText);
      
      if (commandResult.handled) {
        // It's a structured command, show the result
        const botMessage: Message = {
          id: `msg-${Date.now()}-bot`,
          content: commandResult.response || "Command processed successfully",
          sender: "bot",
          timestamp: new Date(),
        };
        
        addMessageToChat(botMessage);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error processing command:", error);
      const errorMessage = error instanceof Error ? String(error.message) : String(error || "Unknown error");
      const botMessage: Message = {
        id: `msg-${Date.now()}-bot`,
        content: `Sorry, I encountered an error processing your command. ${errorMessage}`,
        sender: "bot",
        timestamp: new Date(),
      };
      
      addMessageToChat(botMessage);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return { processCommand, isProcessing };
};
