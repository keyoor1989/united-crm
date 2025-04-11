import React, { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

      {/* Search */}
      <div className="relative w-full mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contracts, machines, or consumables..."
          className="pl-8 w-full"
        />
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <Tabs defaultValue="contracts" className="w-full">
          <TabsList className="w-full justify-start h-auto p-0">
            <TabsTrigger 
              value="contracts" 
              className={`rounded-none px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none ${
                activeTab === "AMC Contracts" ? "border-b-2 border-black" : ""
              }`}
              onClick={() => setActiveTab("AMC Contracts")}
            >
              AMC Contracts
            </TabsTrigger>
            <TabsTrigger 
              value="machines" 
              className={`rounded-none px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none ${
                activeTab === "Machines" ? "border-b-2 border-black" : ""
              }`}
              onClick={() => setActiveTab("Machines")}
            >
              Machines
            </TabsTrigger>
            <TabsTrigger 
              value="usage" 
              className={`rounded-none px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none ${
                activeTab === "Consumable Usage" ? "border-b-2 border-black" : ""
              }`}
              onClick={() => setActiveTab("Consumable Usage")}
            >
              Consumable Usage
            </TabsTrigger>
            <TabsTrigger 
              value="billing" 
              className={`rounded-none px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none ${
                activeTab === "Billing" ? "border-b-2 border-black" : ""
              }`}
              onClick={() => setActiveTab("Billing")}
            >
              Billing
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content placeholder - would be replaced with actual content for each tab */}
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
