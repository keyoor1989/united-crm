
import React from "react";
import Layout from "@/components/layout/Layout";
import StatCard from "@/components/dashboard/StatCard";
import { 
  Indian,
  Users, 
  Wrench, 
  Package, 
  FileText, 
  CreditCard, 
  Bell,
  AlertCircle 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Namaste! Here's what's happening in your business today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              Download Report
            </Button>
            <Button>
              New Customer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue (MTD)"
            value="₹3,42,851"
            icon={<CreditCard className="h-4 w-4" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard 
            title="Active Customers"
            value="237"
            icon={<Users className="h-4 w-4" />}
            trend={{ value: 4, isPositive: true }}
          />
          <StatCard 
            title="Pending Service Calls"
            value="14"
            icon={<Wrench className="h-4 w-4" />}
            trend={{ value: 2, isPositive: false }}
          />
          <StatCard 
            title="Low Stock Items"
            value="6"
            icon={<Package className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>
                Your priority tasks for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="bg-amber-50 p-3 rounded-md border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Follow up with Govt. Hospital for contract renewal</p>
                    <p className="text-sm text-amber-700">Due today - High Priority</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex items-start gap-3">
                  <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Send toner quotation to ABC Enterprises</p>
                    <p className="text-sm text-blue-700">Due tomorrow - Medium Priority</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">Prepare monthly service report for Bank of India</p>
                    <p className="text-sm text-gray-700">Due in 3 days - Medium Priority</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>
                New customer inquiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">WA</div>
                  <div className="flex-1">
                    <p className="font-medium">Vijay Enterprises</p>
                    <p className="text-xs text-muted-foreground">via WhatsApp • 2 hours ago</p>
                  </div>
                  <Button variant="ghost" size="sm">Contact</Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">IM</div>
                  <div className="flex-1">
                    <p className="font-medium">Kamal Office Systems</p>
                    <p className="text-xs text-muted-foreground">via IndiaMart • 1 day ago</p>
                  </div>
                  <Button variant="ghost" size="sm">Contact</Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">YT</div>
                  <div className="flex-1">
                    <p className="font-medium">Patel Associates</p>
                    <p className="text-xs text-muted-foreground">via YouTube • 2 days ago</p>
                  </div>
                  <Button variant="ghost" size="sm">Contact</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Office Performance</CardTitle>
              <CardDescription>
                Sales & service comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Indore (HQ)</p>
                  <p className="text-sm font-medium">₹1,85,250</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-darkblue-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm font-medium">Bhopal</p>
                  <p className="text-sm font-medium">₹92,450</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-brand-500 rounded-full" style={{ width: '32%' }}></div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm font-medium">Jabalpur</p>
                  <p className="text-sm font-medium">₹65,151</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>
                Items requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-red-50 border border-red-100 rounded">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Kyocera 2554ci Toner Black</span>
                  </div>
                  <div className="text-red-500 font-medium text-sm">Out of stock</div>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-amber-50 border border-amber-100 rounded">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">Ricoh MP2014 Drum Unit</span>
                  </div>
                  <div className="text-amber-500 font-medium text-sm">Low: 2 left</div>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-amber-50 border border-amber-100 rounded">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">Xerox 7845 Toner Cyan</span>
                  </div>
                  <div className="text-amber-500 font-medium text-sm">Low: 1 left</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
