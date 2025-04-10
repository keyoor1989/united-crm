
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Search,
  Filter,
  Plus,
  Package,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowUpDown,
  BarChart2,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Mock data for engineers
const mockEngineers = [
  { id: "eng1", name: "Rahul Sharma", location: "Indore", activeServiceCalls: 3 },
  { id: "eng2", name: "Amit Patel", location: "Bhopal", activeServiceCalls: 1 },
  { id: "eng3", name: "Pradeep Kumar", location: "Jabalpur", activeServiceCalls: 0 },
  { id: "eng4", name: "Sunil Verma", location: "Indore", activeServiceCalls: 2 },
];

// Mock data for engineer inventory
const mockEngineerInventory = [
  { 
    id: "ei001", 
    engineerId: "eng1", 
    engineerName: "Rahul Sharma", 
    itemId: "item1", 
    itemName: "Kyocera TK-1175 Toner", 
    assignedQuantity: 2, 
    remainingQuantity: 1, 
    lastUpdated: "2025-04-05" 
  },
  { 
    id: "ei002", 
    engineerId: "eng1", 
    engineerName: "Rahul Sharma", 
    itemId: "item2", 
    itemName: "Canon NPG-59 Drum", 
    assignedQuantity: 1, 
    remainingQuantity: 0, 
    lastUpdated: "2025-04-03" 
  },
  { 
    id: "ei003", 
    engineerId: "eng2", 
    engineerName: "Amit Patel", 
    itemId: "item3", 
    itemName: "Ricoh SP 210 Toner", 
    assignedQuantity: 3, 
    remainingQuantity: 2, 
    lastUpdated: "2025-04-07" 
  },
  { 
    id: "ei004", 
    engineerId: "eng3", 
    engineerName: "Pradeep Kumar", 
    itemId: "item4", 
    itemName: "HP CF217A Toner", 
    assignedQuantity: 2, 
    remainingQuantity: 2, 
    lastUpdated: "2025-04-01" 
  },
  { 
    id: "ei005", 
    engineerId: "eng4", 
    engineerName: "Sunil Verma", 
    itemId: "item5", 
    itemName: "Xerox 3020 Drum Unit", 
    assignedQuantity: 1, 
    remainingQuantity: 0, 
    lastUpdated: "2025-04-02" 
  },
];

// Mock data for usage history
const mockUsageHistory = [
  {
    id: "uh001",
    engineerId: "eng1",
    engineerName: "Rahul Sharma",
    itemId: "item1",
    itemName: "Kyocera TK-1175 Toner",
    quantity: 1,
    date: "2025-04-04",
    serviceCallId: "SC001",
    customerName: "ABC Technologies"
  },
  {
    id: "uh002",
    engineerId: "eng1",
    engineerName: "Rahul Sharma",
    itemId: "item2",
    itemName: "Canon NPG-59 Drum",
    quantity: 1,
    date: "2025-04-03",
    serviceCallId: "SC002",
    customerName: "XYZ Corp"
  },
  {
    id: "uh003",
    engineerId: "eng2",
    engineerName: "Amit Patel",
    itemId: "item3",
    itemName: "Ricoh SP 210 Toner",
    quantity: 1,
    date: "2025-04-06",
    serviceCallId: "SC003",
    customerName: "Global Solutions"
  },
];

const EngineerInventory = () => {
  const [activeTab, setActiveTab] = useState("engineers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEngineer, setSelectedEngineer] = useState<string | null>(null);
  
  // Filter engineer inventory by engineer ID
  const getEngineerInventory = (engineerId: string) => {
    return mockEngineerInventory.filter(item => 
      item.engineerId === engineerId &&
      (searchQuery ? item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    );
  };
  
  // Filter usage history by engineer ID
  const getEngineerUsageHistory = (engineerId: string) => {
    return mockUsageHistory.filter(item => 
      item.engineerId === engineerId &&
      (searchQuery ? item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    );
  };
  
  // Handle assign new item to engineer
  const handleAssignItem = (engineerId: string) => {
    toast.success(`Item assigned to ${mockEngineers.find(e => e.id === engineerId)?.name}`);
  };
  
  // Handle refresh engineer inventory
  const handleRefreshInventory = (engineerId: string) => {
    toast.success(`${mockEngineers.find(e => e.id === engineerId)?.name}'s inventory refreshed`);
  };

  return (
    <Layout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Engineer Inventory Management</h1>
            <p className="text-muted-foreground">
              Track inventory assigned to field engineers
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="relative grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search engineers or items..."
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
            <TabsTrigger value="engineers">Engineers</TabsTrigger>
            <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
            <TabsTrigger value="usage">Usage History</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="engineers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Field Engineers</CardTitle>
                <CardDescription>
                  Select an engineer to view their inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockEngineers
                    .filter(eng => 
                      searchQuery ? 
                        eng.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        eng.location.toLowerCase().includes(searchQuery.toLowerCase())
                      : true
                    )
                    .map((engineer) => (
                      <Card 
                        key={engineer.id}
                        className={`cursor-pointer hover:border-primary transition-colors ${
                          selectedEngineer === engineer.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => {
                          setSelectedEngineer(engineer.id);
                          setActiveTab("inventory");
                        }}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{engineer.name}</h3>
                              <p className="text-sm text-muted-foreground">{engineer.location}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={engineer.activeServiceCalls > 0 ? "default" : "outline"}>
                                  {engineer.activeServiceCalls} active calls
                                </Badge>
                                <Badge variant="secondary">
                                  {getEngineerInventory(engineer.id).length} items
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignItem(engineer.id);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Assign Item
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                  {mockEngineers.filter(eng => 
                    searchQuery ? 
                      eng.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      eng.location.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                  ).length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No engineers found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedEngineer ? 
                      `${mockEngineers.find(e => e.id === selectedEngineer)?.name}'s Inventory` : 
                      "Current Engineer Inventory"
                    }
                  </CardTitle>
                  <CardDescription>
                    {selectedEngineer ? 
                      `Items currently assigned to ${mockEngineers.find(e => e.id === selectedEngineer)?.name}` : 
                      "Select an engineer from the Engineers tab first"
                    }
                  </CardDescription>
                </div>
                
                {selectedEngineer && (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleAssignItem(selectedEngineer)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Assign New Item
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRefreshInventory(selectedEngineer)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!selectedEngineer ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Please select an engineer from the Engineers tab
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("engineers")}
                    >
                      Go to Engineers
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Assigned Qty</TableHead>
                        <TableHead className="text-right">Remaining Qty</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getEngineerInventory(selectedEngineer).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.itemName}</TableCell>
                          <TableCell className="text-right">{item.assignedQuantity}</TableCell>
                          <TableCell className="text-right">{item.remainingQuantity}</TableCell>
                          <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {item.remainingQuantity === 0 ? (
                              <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Out of Stock
                              </Badge>
                            ) : item.remainingQuantity < item.assignedQuantity / 2 ? (
                              <Badge variant="warning" className="flex items-center gap-1 w-fit">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="success" className="flex items-center gap-1 w-fit">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                In Stock
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {getEngineerInventory(selectedEngineer).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No inventory items found for this engineer
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="usage" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedEngineer ? 
                      `${mockEngineers.find(e => e.id === selectedEngineer)?.name}'s Usage History` : 
                      "Engineer Usage History"
                    }
                  </CardTitle>
                  <CardDescription>
                    {selectedEngineer ? 
                      `Parts used by ${mockEngineers.find(e => e.id === selectedEngineer)?.name} during service calls` : 
                      "Select an engineer from the Engineers tab first"
                    }
                  </CardDescription>
                </div>
                
                {selectedEngineer && (
                  <div className="flex items-center gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Date Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="quarter">Last Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!selectedEngineer ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Please select an engineer from the Engineers tab
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("engineers")}
                    >
                      Go to Engineers
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Service Call</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getEngineerUsageHistory(selectedEngineer).map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell className="font-medium">{usage.itemName}</TableCell>
                          <TableCell>{usage.quantity}</TableCell>
                          <TableCell>{usage.serviceCallId}</TableCell>
                          <TableCell>{usage.customerName}</TableCell>
                          <TableCell>{new Date(usage.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      
                      {getEngineerUsageHistory(selectedEngineer).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No usage history found for this engineer
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Engineer Inventory Reports</CardTitle>
                <CardDescription>
                  Analytics and reports for engineer inventory usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <BarChart2 className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Engineer inventory reports coming soon
                  </p>
                  <p className="text-sm text-muted-foreground text-center max-w-md mt-2">
                    This section will include reports on part consumption rates, engineer efficiency in part usage, and comparisons between engineers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default EngineerInventory;
