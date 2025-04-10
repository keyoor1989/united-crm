import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Plus, 
  Check, 
  Truck, 
  CheckCircle2, 
  Clock,
  Box,
  Send,
  PackageCheck
} from "lucide-react";
import { 
  StockTransfer, 
  Branch, 
  TransferStatus, 
  TransferMethod 
} from "@/types/inventory";

// Mock data
const mockTransfers: StockTransfer[] = [
  {
    id: "ST001",
    itemId: "1",
    quantity: 5,
    sourceBranch: "Indore (HQ)",
    destinationBranch: "Bhopal Office",
    requestDate: "2025-03-15",
    approvedDate: "2025-03-16",
    dispatchDate: "2025-03-17",
    status: "Dispatched",
    transferMethod: "Courier",
    trackingNumber: "COUR123456",
    remarks: "Urgent requirement for service",
    requestedBy: "Rajesh Kumar",
    approvedBy: "Amit Sharma",
    createdAt: "2025-03-15"
  },
  {
    id: "ST002",
    itemId: "2",
    quantity: 3,
    sourceBranch: "Bhopal Office",
    destinationBranch: "Jabalpur Office",
    requestDate: "2025-03-20",
    approvedDate: "2025-03-21",
    dispatchDate: "2025-03-22",
    status: "Received",
    transferMethod: "Bus",
    trackingNumber: "BUS789012",
    remarks: "Replenishment of low stock",
    requestedBy: "Vikram Singh",
    approvedBy: "Pooja Verma",
    createdAt: "2025-03-20"
  },
  {
    id: "ST003",
    itemId: "3",
    quantity: 2,
    sourceBranch: "Jabalpur Office",
    destinationBranch: "Indore (HQ)",
    requestDate: "2025-03-25",
    approvedDate: "2025-03-26",
    dispatchDate: "2025-03-27",
    status: "Approved",
    transferMethod: "Hand Delivery",
    remarks: "Return of excess stock",
    requestedBy: "Neha Gupta",
    approvedBy: "Amit Sharma",
    createdAt: "2025-03-25"
  },
  {
    id: "ST004",
    itemId: "4",
    quantity: 10,
    sourceBranch: "Indore (HQ)",
    destinationBranch: "Bhopal Office",
    requestDate: "2025-03-30",
    status: "Requested",
    transferMethod: "Courier",
    remarks: "Additional stock for new customer",
    requestedBy: "Rajesh Kumar",
    createdAt: "2025-03-30"
  },
];

const InventoryTransfer = () => {
  const [activeTab, setActiveTab] = useState("transfers");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TransferStatus | "">("");
  const [filterBranch, setFilterBranch] = useState<Branch | "">("");
  
  const filteredTransfers = mockTransfers.filter(transfer => {
    const searchMatch = 
      transfer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.itemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.sourceBranch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.destinationBranch.toLowerCase().includes(searchQuery.toLowerCase());
    
    const statusMatch = filterStatus ? transfer.status === filterStatus : true;
    const branchMatch = filterBranch ? transfer.sourceBranch === filterBranch || transfer.destinationBranch === filterBranch : true;
    
    return searchMatch && statusMatch && branchMatch;
  });

  return (
    <Layout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Stock Transfers</h1>
            <p className="text-muted-foreground">
              Manage and track inventory transfers between branches
            </p>
          </div>
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            New Transfer Request
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="relative grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transfers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transfers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Transfers</CardTitle>
                <CardDescription>
                  List of all pending and in-transit stock transfers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="status-filter">Filter by Status</Label>
                    <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as TransferStatus | "")}>
                      <SelectTrigger id="status-filter">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="Requested">Requested</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Dispatched">Dispatched</SelectItem>
                        <SelectItem value="Received">Received</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="branch-filter">Filter by Branch</Label>
                    <Select value={filterBranch} onValueChange={(value) => setFilterBranch(value as Branch | "")}>
                      <SelectTrigger id="branch-filter">
                        <SelectValue placeholder="All Branches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Branches</SelectItem>
                        <SelectItem value="Indore (HQ)">Indore (HQ)</SelectItem>
                        <SelectItem value="Bhopal Office">Bhopal Office</SelectItem>
                        <SelectItem value="Jabalpur Office">Jabalpur Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer ID</TableHead>
                      <TableHead>Item ID</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Source Branch</TableHead>
                      <TableHead>Destination Branch</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.id}</TableCell>
                        <TableCell>{transfer.itemId}</TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>{transfer.sourceBranch}</TableCell>
                        <TableCell>{transfer.destinationBranch}</TableCell>
                        <TableCell>{new Date(transfer.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transfer.transferMethod}</TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredTransfers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No transfers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Transfer History</CardTitle>
                <CardDescription>
                  Archived list of all completed and cancelled stock transfers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer ID</TableHead>
                      <TableHead>Item ID</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Source Branch</TableHead>
                      <TableHead>Destination Branch</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.id}</TableCell>
                        <TableCell>{transfer.itemId}</TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>{transfer.sourceBranch}</TableCell>
                        <TableCell>{transfer.destinationBranch}</TableCell>
                        <TableCell>{new Date(transfer.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transfer.transferMethod}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default InventoryTransfer;
