
import React from "react";
import { Link } from "react-router-dom";
import { Wrench, Package, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to Copier Command Center</h1>
        <p className="text-muted-foreground text-lg">
          Manage your copier service business with our comprehensive dashboard.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/service" className="block">
          <div className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow p-6 h-full">
            <div className="flex items-center gap-3 mb-4">
              <Wrench className="h-8 w-8 text-brand-500" />
              <h2 className="text-xl font-semibold">Service Management</h2>
            </div>
            <p className="text-muted-foreground">
              Track and manage service calls, assign engineers, and monitor performance.
            </p>
          </div>
        </Link>
        
        <Link to="/inventory" className="block">
          <div className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow p-6 h-full">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-8 w-8 text-brand-500" />
              <h2 className="text-xl font-semibold">Inventory Control</h2>
            </div>
            <p className="text-muted-foreground">
              Keep track of parts, supplies, and equipment across all your locations.
            </p>
          </div>
        </Link>
        
        <Link to="/customers" className="block">
          <div className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow p-6 h-full">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-brand-500" />
              <h2 className="text-xl font-semibold">Customer Management</h2>
            </div>
            <p className="text-muted-foreground">
              Maintain customer records, service histories, and machine information.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Index;
