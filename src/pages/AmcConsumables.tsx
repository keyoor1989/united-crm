
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, AlertTriangle, InfoIcon, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AmcConsumables = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AMC Consumable Tracker</h1>
          <p className="text-muted-foreground">
            Track consumables and manage AMC/Rental contracts
          </p>
        </div>
      </div>

      <Alert variant="default" className="bg-blue-50 border-blue-200">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>New Feature Available</AlertTitle>
        <AlertDescription>
          We've created a new improved AMC Tracker with database integration that replaces this mock data page.
          Please use the new tracker from now on.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Legacy AMC Page</CardTitle>
            <CardDescription>
              This page contains static mock data for demonstration purposes only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 flex flex-col items-center justify-center">
              <AlertTriangle size={48} className="text-amber-500 mb-4" />
              <p className="text-center text-muted-foreground mb-4">
                The data on this page is static and not connected to any database. 
                Please use our new improved AMC Tracker for real-time data management.
              </p>
              <Button asChild>
                <Link to="/amc-consumables" className="mt-2">
                  <FileText className="mr-2 h-4 w-4" />
                  View Legacy Page
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New AMC Tracker</CardTitle>
            <CardDescription>
              Database-integrated tracker with real-time data and full CRUD operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <FileText size={24} className="text-green-600" />
              </div>
              <p className="text-center text-muted-foreground mb-4">
                Our new AMC Tracker features database integration, consumable tracking,
                profit reporting, and A3/A4 counter management for AMC and rental machines.
              </p>
              <Button asChild className="bg-black hover:bg-gray-800">
                <Link to="/inventory/amc-tracker" className="mt-2">
                  Go to New AMC Tracker
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AmcConsumables;
