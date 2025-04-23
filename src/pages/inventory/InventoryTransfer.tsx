
import React, { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Plus, 
  Box, 
  Warehouse,
  Truck
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const mockWarehouses = [
  { id: "1", name: "Main Warehouse", code: "MW01", location: "Indore", isActive: true },
  { id: "2", name: "Bhopal Warehouse", code: "BW01", location: "Bhopal", isActive: true },
  { id: "3", name: "Jabalpur Storage", code: "JS01", location: "Jabalpur", isActive: true }
];

const mockItems = [
  { id: "1", name: "Black Toner", brand: "Kyocera", model: "2554ci" },
  { id: "2", name: "Drum Unit", brand: "Kyocera", model: "2554ci" },
  { id: "3", name: "Fuser Unit", brand: "Ricoh", model: "MP2014" },
  { id: "4", name: "Cyan Toner", brand: "Kyocera", model: "2554ci" }
];

const InventoryTransfer = () => {
  const [activeTab, setActiveTab] = useState("transfers");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSourceType, setFilterSourceType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [showNewTransferDialog, setShowNewTransferDialog] = useState(false);

  const [transfers, setTransfers] = useState<any[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);

  type LocationType = "Branch" | "Warehouse";

  const [transferForm, setTransferForm] = useState({
    itemId: "",
    quantity: 1,
    sourceType: "Warehouse" as LocationType,
    sourceBranch: "",
    sourceWarehouseId: "",
    destinationType: "Warehouse" as LocationType,
    destinationBranch: "",
    destinationWarehouseId: "",
    transferMethod: "Courier",
    trackingNumber: "",
    remarks: ""
  });

  // Load all transfers from Supabase
  useEffect(() => {
    const fetchTransfers = async () => {
      setLoadingTransfers(true);
      const { data, error } = await supabase
        .from("inventory_transfers")
        .select("*")
        .order("request_date", { ascending: false });
      if (error) {
        toast.error("Error fetching transfers");
        setLoadingTransfers(false);
        return;
      }
      setTransfers(data || []);
      setLoadingTransfers(false);
    };
    fetchTransfers();
  }, []);

  // Filter logic using real transfers
  const filteredTransfers = transfers.filter(transfer => {
    const searchMatch = 
      (transfer.id && transfer.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transfer.item_id && transfer.item_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transfer.source_type === "Branch" && transfer.source_branch && transfer.source_branch.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transfer.destination_type === "Branch" && transfer.destination_branch && transfer.destination_branch.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transfer.source_type === "Warehouse" && transfer.source_warehouse_id && transfer.source_warehouse_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transfer.destination_type === "Warehouse" && transfer.destination_warehouse_id && transfer.destination_warehouse_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const statusMatch = filterStatus === "all" ? true : transfer.status === filterStatus;
    const sourceTypeMatch = filterSourceType === "all" ? true : transfer.source_type === filterSourceType;
    // We match location for only id and branches
    const locationMatch = filterLocation === "all" ? true : (
      (transfer.source_type === "Branch" && transfer.source_branch === filterLocation) ||
      (transfer.destination_type === "Branch" && transfer.destination_branch === filterLocation) ||
      (transfer.source_type === "Warehouse" && transfer.source_warehouse_id === filterLocation) ||
      (transfer.destination_type === "Warehouse" && transfer.destination_warehouse_id === filterLocation)
    );

    return searchMatch && statusMatch && sourceTypeMatch && locationMatch;
  });

  const locationOptions = [
    { id: "Indore (HQ)", name: "Indore (HQ)", type: "Branch" },
    { id: "Bhopal Office", name: "Bhopal Office", type: "Branch" },
    { id: "Jabalpur Office", name: "Jabalpur Office", type: "Branch" },
    ...mockWarehouses.map(wh => ({ id: wh.id, name: wh.name, type: "Warehouse" }))
  ];

  // Handle transfer creation (insert into Supabase)
  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      (transferForm.sourceType === transferForm.destinationType) && 
      (
        (transferForm.sourceType === "Branch" && transferForm.sourceBranch === transferForm.destinationBranch) ||
        (transferForm.sourceType === "Warehouse" && transferForm.sourceWarehouseId === transferForm.destinationWarehouseId)
      )
    ) {
      toast.error("Source and destination cannot be the same!");
      return;
    }
    if (!transferForm.itemId) {
      toast.error("Please select an item.");
      return;
    }
    if (
      (transferForm.sourceType === "Branch" && !transferForm.sourceBranch) ||
      (transferForm.sourceType === "Warehouse" && !transferForm.sourceWarehouseId) ||
      (transferForm.destinationType === "Branch" && !transferForm.destinationBranch) ||
      (transferForm.destinationType === "Warehouse" && !transferForm.destinationWarehouseId)
    ) {
      toast.error("Please select both source and destination locations.");
      return;
    }
    // Make Supabase insert
    const { error } = await supabase.from("inventory_transfers").insert({
      item_id: transferForm.itemId,
      quantity: transferForm.quantity,
      source_type: transferForm.sourceType,
      source_branch: transferForm.sourceType === "Branch" ? transferForm.sourceBranch : null,
      source_warehouse_id: transferForm.sourceType === "Warehouse" ? transferForm.sourceWarehouseId : null,
      destination_type: transferForm.destinationType,
      destination_branch: transferForm.destinationType === "Branch" ? transferForm.destinationBranch : null,
      destination_warehouse_id: transferForm.destinationType === "Warehouse" ? transferForm.destinationWarehouseId : null,
      transfer_method: transferForm.transferMethod,
      tracking_number: transferForm.trackingNumber,
      remarks: transferForm.remarks,
      requested_by: "Current User", // You can fetch the real user
      status: "Requested",
      request_date: new Date().toISOString()
    });
    if (error) {
      toast.error("Failed to create transfer: " + error.message);
    } else {
      toast.success("Transfer request created successfully!");
      // Reload transfers
      const { data } = await supabase
        .from("inventory_transfers")
        .select("*")
        .order("request_date", { ascending: false });
      setTransfers(data || []);
      setShowNewTransferDialog(false);
      setTransferForm({
        itemId: "",
        quantity: 1,
        sourceType: "Warehouse",
        sourceBranch: "",
        sourceWarehouseId: "",
        destinationType: "Warehouse",
        destinationBranch: "",
        destinationWarehouseId: "",
        transferMethod: "Courier",
        trackingNumber: "",
        remarks: ""
      });
    }
  };

  const getSourceLocationName = (transfer: any) => {
    if (transfer.source_type === "Branch" && transfer.source_branch) {
      return transfer.source_branch;
    } else if (transfer.source_type === "Warehouse" && transfer.source_warehouse_id) {
      const wh = mockWarehouses.find(w => w.id === transfer.source_warehouse_id);
      return wh ? wh.name : transfer.source_warehouse_id;
    }
    return "Unknown";
  };

  const getDestinationLocationName = (transfer: any) => {
    if (transfer.destination_type === "Branch" && transfer.destination_branch) {
      return transfer.destination_branch;
    } else if (transfer.destination_type === "Warehouse" && transfer.destination_warehouse_id) {
      const wh = mockWarehouses.find(w => w.id === transfer.destination_warehouse_id);
      return wh ? wh.name : transfer.destination_warehouse_id;
    }
    return "Unknown";
  };

  const getLocationIcon = (type: LocationType) => {
    return type === "Branch" ? <Box className="h-4 w-4" /> : <Warehouse className="h-4 w-4" />;
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Stock Transfers</h1>
          <p className="text-muted-foreground">
            Manage and track inventory transfers between branches and warehouses (live from Supabase)
          </p>
        </div>
        <Button className="gap-1" onClick={() => setShowNewTransferDialog(true)}>
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
                List of all pending and in-transit stock transfers (Live)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="status-filter">Filter by Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Requested">Requested</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Dispatched">Dispatched</SelectItem>
                      <SelectItem value="Received">Received</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source-type-filter">Filter by Source Type</Label>
                  <Select value={filterSourceType} onValueChange={setFilterSourceType}>
                    <SelectTrigger id="source-type-filter">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Branch">Branch</SelectItem>
                      <SelectItem value="Warehouse">Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location-filter">Filter by Location</Label>
                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger id="location-filter">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Indore (HQ)">Indore (HQ)</SelectItem>
                      <SelectItem value="Bhopal Office">Bhopal Office</SelectItem>
                      <SelectItem value="Jabalpur Office">Jabalpur Office</SelectItem>
                      {mockWarehouses.map(wh => (
                        <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTransfers && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                    </TableRow>
                  )}
                  {!loadingTransfers && filteredTransfers.map((transfer) => {
                    const item = mockItems.find(i => i.id === transfer.item_id);
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.id}</TableCell>
                        <TableCell>
                          {item ? (
                            <>
                              <div>{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.brand} {item.model}</div>
                            </>
                          ) : transfer.item_id}
                        </TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {getLocationIcon(transfer.source_type as LocationType)}
                            {getSourceLocationName(transfer)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {getLocationIcon(transfer.destination_type as LocationType)}
                            {getDestinationLocationName(transfer)}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(transfer.request_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transfer.transfer_method}</TableCell>
                      </TableRow>
                    );
                  })}
                  {!loadingTransfers && filteredTransfers.length === 0 && (
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
                Archived list of all completed and cancelled stock transfers (Live)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTransfers && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                    </TableRow>
                  )}
                  {!loadingTransfers && transfers.map((transfer) => {
                    const item = mockItems.find(i => i.id === transfer.item_id);
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.id}</TableCell>
                        <TableCell>
                          {item ? (
                            <>
                              <div>{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.brand} {item.model}</div>
                            </>
                          ) : transfer.item_id}
                        </TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {getLocationIcon(transfer.source_type as LocationType)}
                            {getSourceLocationName(transfer)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {getLocationIcon(transfer.destination_type as LocationType)}
                            {getDestinationLocationName(transfer)}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(transfer.request_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transfer.transfer_method}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showNewTransferDialog} onOpenChange={setShowNewTransferDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Stock Transfer</DialogTitle>
            <DialogDescription>
              Create a request to transfer stock between branches and warehouses
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTransfer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transfer-item">Item</Label>
              <Select 
                value={transferForm.itemId} 
                onValueChange={(value) => setTransferForm({ ...transferForm, itemId: value })}
              >
                <SelectTrigger id="transfer-item">
                  <SelectValue placeholder="Select Item" />
                </SelectTrigger>
                <SelectContent>
                  {mockItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - {item.brand} {item.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-quantity">Quantity</Label>
              <Input
                id="transfer-quantity"
                type="number"
                min="1"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm({ ...transferForm, quantity: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Source
                  </h3>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="source-type">Source Type</Label>
                    <Select 
                      value={transferForm.sourceType} 
                      onValueChange={(value: string) => setTransferForm({ 
                        ...transferForm, 
                        sourceType: value as LocationType,
                        sourceBranch: "",
                        sourceWarehouseId: ""
                      })}
                    >
                      <SelectTrigger id="source-type">
                        <SelectValue placeholder="Select Source Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Branch">Branch</SelectItem>
                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {transferForm.sourceType === "Branch" ? (
                    <div className="space-y-2">
                      <Label htmlFor="source-branch">Source Branch</Label>
                      <Select 
                        value={transferForm.sourceBranch} 
                        onValueChange={(value) => setTransferForm({ ...transferForm, sourceBranch: value })}
                      >
                        <SelectTrigger id="source-branch">
                          <SelectValue placeholder="Select Branch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Indore (HQ)">Indore (HQ)</SelectItem>
                          <SelectItem value="Bhopal Office">Bhopal Office</SelectItem>
                          <SelectItem value="Jabalpur Office">Jabalpur Office</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="source-warehouse">Source Warehouse</Label>
                      <Select 
                        value={transferForm.sourceWarehouseId} 
                        onValueChange={(value) => setTransferForm({ ...transferForm, sourceWarehouseId: value })}
                      >
                        <SelectTrigger id="source-warehouse">
                          <SelectValue placeholder="Select Warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockWarehouses.map(warehouse => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name} ({warehouse.location})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Destination
                  </h3>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="destination-type">Destination Type</Label>
                    <Select 
                      value={transferForm.destinationType} 
                      onValueChange={(value: string) => setTransferForm({ 
                        ...transferForm, 
                        destinationType: value as LocationType,
                        destinationBranch: "",
                        destinationWarehouseId: ""
                      })}
                    >
                      <SelectTrigger id="destination-type">
                        <SelectValue placeholder="Select Destination Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Branch">Branch</SelectItem>
                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {transferForm.destinationType === "Branch" ? (
                    <div className="space-y-2">
                      <Label htmlFor="destination-branch">Destination Branch</Label>
                      <Select 
                        value={transferForm.destinationBranch} 
                        onValueChange={(value) => setTransferForm({ ...transferForm, destinationBranch: value })}
                      >
                        <SelectTrigger id="destination-branch">
                          <SelectValue placeholder="Select Branch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Indore (HQ)">Indore (HQ)</SelectItem>
                          <SelectItem value="Bhopal Office">Bhopal Office</SelectItem>
                          <SelectItem value="Jabalpur Office">Jabalpur Office</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="destination-warehouse">Destination Warehouse</Label>
                      <Select 
                        value={transferForm.destinationWarehouseId} 
                        onValueChange={(value) => setTransferForm({ ...transferForm, destinationWarehouseId: value })}
                      >
                        <SelectTrigger id="destination-warehouse">
                          <SelectValue placeholder="Select Warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockWarehouses.map(warehouse => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name} ({warehouse.location})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-method">Transfer Method</Label>
              <Select 
                value={transferForm.transferMethod} 
                onValueChange={(value) => setTransferForm({ ...transferForm, transferMethod: value })}
              >
                <SelectTrigger id="transfer-method">
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Courier">Courier</SelectItem>
                  <SelectItem value="Hand Delivery">Hand Delivery</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Company Vehicle">Company Vehicle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-remarks">Remarks</Label>
              <Input
                id="transfer-remarks"
                placeholder="Any additional information"
                value={transferForm.remarks}
                onChange={(e) => setTransferForm({ ...transferForm, remarks: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewTransferDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Transfer Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryTransfer;
