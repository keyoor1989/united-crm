
import React, { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

const AmcTracker = () => {
  const [activeTab, setActiveTab] = useState<string>("AMC Contracts");

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AMC Consumable Tracker</h1>
          <p className="text-muted-foreground">
            Track consumables used in AMC/Rental contracts
          </p>
        </div>
        <Button className="flex items-center gap-1 bg-black text-white hover:bg-black/90">
          <Plus className="h-4 w-4" />
          New AMC Contract
        </Button>
      </div>

      {/* Search and filter row */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts, machines, or consumables..."
            className="pl-8 w-full"
          />
        </div>
        
        <Button variant="outline" className="sm:ml-auto flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Navigation tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            className={`flex items-center gap-2 py-3 px-1 border-b-2 ${
              activeTab === "AMC Contracts" 
                ? "border-black text-black" 
                : "border-transparent text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("AMC Contracts")}
          >
            AMC Contracts
          </button>
          <button
            className={`flex items-center gap-2 py-3 px-1 border-b-2 ${
              activeTab === "Machines" 
                ? "border-black text-black" 
                : "border-transparent text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("Machines")}
          >
            Machines
          </button>
          <button
            className={`flex items-center gap-2 py-3 px-1 border-b-2 ${
              activeTab === "Consumable Usage" 
                ? "border-black text-black" 
                : "border-transparent text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("Consumable Usage")}
          >
            Consumable Usage
          </button>
          <button
            className={`flex items-center gap-2 py-3 px-1 border-b-2 ${
              activeTab === "Billing" 
                ? "border-black text-black" 
                : "border-transparent text-gray-500 hover:text-black"
            }`}
            onClick={() => setActiveTab("Billing")}
          >
            Billing
          </button>
        </div>
      </div>

      {/* Content for each tab */}
      <div className="border rounded-md p-8 text-center text-muted-foreground">
        {activeTab === "AMC Contracts" && (
          <p>AMC Contracts content would appear here</p>
        )}
        {activeTab === "Machines" && (
          <p>Machines content would appear here</p>
        )}
        {activeTab === "Consumable Usage" && (
          <p>Consumable Usage content would appear here</p>
        )}
        {activeTab === "Billing" && (
          <p>Billing content would appear here</p>
        )}
      </div>
    </div>
  );
};

export default AmcTracker;
