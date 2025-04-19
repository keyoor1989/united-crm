
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Phone, FileText } from "lucide-react";

const LocationBhopal = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bhopal Office</h1>
          <p className="text-muted-foreground">
            Regional office serving central MP
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Contact Information</CardTitle>
              <Phone className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-medium">Address:</p>
              <p className="text-sm text-muted-foreground">456 MP Nagar, Bhopal, MP 462011</p>
              <p className="font-medium mt-2">Phone:</p>
              <p className="text-sm text-muted-foreground">+91-755-987-6543</p>
              <p className="font-medium mt-2">Email:</p>
              <p className="text-sm text-muted-foreground">bhopal@unitedcopier.com</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Staff</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-medium">Branch Manager:</p>
              <p className="text-sm text-muted-foreground">Amit Patel</p>
              <p className="font-medium mt-2">Service Manager:</p>
              <p className="text-sm text-muted-foreground">Vikram Singh</p>
              <p className="font-medium mt-2">Sales Executive:</p>
              <p className="text-sm text-muted-foreground">Neha Joshi</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Performance</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-medium">Monthly Target:</p>
              <p className="text-sm text-muted-foreground">₹15,00,000</p>
              <p className="font-medium mt-2">Current Achievement:</p>
              <p className="text-sm text-muted-foreground">₹13,20,000 (88%)</p>
              <p className="font-medium mt-2">Service Calls:</p>
              <p className="text-sm text-muted-foreground">132 this month (95% resolved)</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Location Information</CardTitle>
            <CardDescription>Detailed information about Bhopal office operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p>The Bhopal office is our regional center serving the state capital and surrounding districts. The facility includes:</p>
              <ul>
                <li>Service center with 5 engineers</li>
                <li>Small showroom with essential display units</li>
                <li>Inventory management for the central region</li>
                <li>Government liaison office</li>
              </ul>
              <p>The Bhopal office specializes in government and educational institution accounts, with strong relationships with state departments.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocationBhopal;
