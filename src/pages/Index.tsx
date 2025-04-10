
import React from "react";

// Index page now just serves as an entry point
const Index = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Copier Command Center</h1>
      <p className="text-muted-foreground mb-6">
        Manage your copier service business with our comprehensive dashboard.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Service Management</h2>
          <p className="text-muted-foreground">Track and manage service calls, assign engineers, and monitor performance.</p>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Inventory Control</h2>
          <p className="text-muted-foreground">Keep track of parts, supplies, and equipment across all your locations.</p>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Customer Management</h2>
          <p className="text-muted-foreground">Maintain customer records, service histories, and machine information.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
