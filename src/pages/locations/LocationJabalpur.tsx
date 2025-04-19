
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Phone, FileText } from "lucide-react";

const LocationJabalpur = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jabalpur Office</h1>
          <p className="text-muted-foreground">
            Regional office serving eastern MP
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
              <p className="text-sm text-muted-foreground">789 Civil Lines, Jabalpur, MP 482001</p>
              <p className="font-medium mt-2">Phone:</p>
              <p className="text-sm text-muted-foreground">+91-761-234-5678</p>
              <p className="font-medium mt-2">Email:</p>
              <p className="text-sm text-muted-foreground">jabalpur@unitedcopier.com</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Staff</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-medium">Branch Manager:</p>
              <p className="text-sm text-muted-foreground">Rahul Mishra</p>
              <p className="font-medium mt-2">Service Engineer:</p>
              <p className="text-sm text-muted-foreground">Suresh Kumar</p>
              <p className="font-medium mt-2">Sales Representative:</p>
              <p className="text-sm text-muted-foreground">Anil Tiwari</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Performance</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-medium">Monthly Target:</p>
              <p className="text-sm text-muted-foreground">₹10,00,000</p>
              <p className="font-medium mt-2">Current Achievement:</p>
              <p className="text-sm text-muted-foreground">₹8,75,000 (87.5%)</p>
              <p className="font-medium mt-2">Service Calls:</p>
              <p className="text-sm text-muted-foreground">95 this month (93% resolved)</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Location Information</CardTitle>
            <CardDescription>Detailed information about Jabalpur office operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p>The Jabalpur office serves the eastern districts of Madhya Pradesh and handles operations for nearby regions. The facility includes:</p>
              <ul>
                <li>Service center with 3 engineers</li>
                <li>Compact showroom with essential models</li>
                <li>Small inventory warehouse</li>
                <li>Local business development team</li>
              </ul>
              <p>The Jabalpur office focuses on educational institutions and small to medium businesses in the eastern MP region.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocationJabalpur;
