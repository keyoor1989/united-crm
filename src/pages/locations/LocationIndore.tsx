
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Phone, FileText } from "lucide-react";

const LocationIndore = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Indore Office (HQ)</h1>
          <p className="text-muted-foreground">
            Main office operations and management
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
              <p className="text-sm text-muted-foreground">123 Main Street, Indore, MP 452001</p>
              <p className="font-medium mt-2">Phone:</p>
              <p className="text-sm text-muted-foreground">+91-731-123-4567</p>
              <p className="font-medium mt-2">Email:</p>
              <p className="text-sm text-muted-foreground">indore@unitedcopier.com</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Staff</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-medium">Branch Manager:</p>
              <p className="text-sm text-muted-foreground">Rajesh Kumar</p>
              <p className="font-medium mt-2">Service Head:</p>
              <p className="text-sm text-muted-foreground">Sunil Verma</p>
              <p className="font-medium mt-2">Sales Head:</p>
              <p className="text-sm text-muted-foreground">Priya Sharma</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Performance</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-medium">Monthly Target:</p>
              <p className="text-sm text-muted-foreground">₹25,00,000</p>
              <p className="font-medium mt-2">Current Achievement:</p>
              <p className="text-sm text-muted-foreground">₹22,45,000 (89.8%)</p>
              <p className="font-medium mt-2">Service Calls:</p>
              <p className="text-sm text-muted-foreground">245 this month (98% resolved)</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Location Information</CardTitle>
            <CardDescription>Detailed information about Indore office operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p>The Indore office serves as our headquarters and manages operations across Madhya Pradesh. The facility includes:</p>
              <ul>
                <li>Main service center with 8 engineers</li>
                <li>Sales showroom with display units</li>
                <li>Large inventory warehouse</li>
                <li>Administrative offices</li>
                <li>Customer support center</li>
              </ul>
              <p>The Indore office handles all major corporate accounts and provides support to our branch offices.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocationIndore;
