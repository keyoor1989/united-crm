
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Plus, ArrowLeftRight, Building, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define types for branch transfers
type Branch = 'Indore (HQ)' | 'Bhopal Office' | 'Jabalpur Office';
type TransferStatus = 'Requested' | 'Approved' | 'Dispatched' | 'Received' | 'Cancelled';
type TransferMethod = 'Courier' | 'Hand Delivery' | 'Bus' | 'Railway';

// Real item type
interface RealItem {
  id: string;
  part_name: string;
  brand: string;
  category: string;
  model?: string;
  part_number?: string;
  compatible_models?: string[] | null;
}

const BranchTransfer = () => {
  const [activeTab, setActiveTab] = useState("transfers");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TransferStatus | "all">("all");
  const [filterBranch, setFilterBranch] = useState<Branch | "all">("all");
  const [showNewTransferDialog, setShowNewTransferDialog] = useState(false);

  // Transfers state
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);

  // Real inventory items
  const [items, setItems] = useState<RealItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // New transfer form state
  const [transferForm, setTransferForm] = useState({
    itemId: "",
    quantity: 1,
    sourceBranch: "" as Branch | "",
    destinationBranch: "" as Branch | "",
    transferMethod: "Courier" as TransferMethod,
    trackingNumber: "",
    remarks: ""
  });

  // Fetch transfers from Supabase
  useEffect(() => {
    const fetchTransfers = async () => {
      setLoadingTransfers(true);
      const { data, error } = await supabase
        .from("inventory_transfers")
        .select("*")
        .or('source_type.eq.Branch,destination_type.eq.Branch') // Only get transfers involving branches
        .order("request_date", { ascending: false });

      if (error) {
        toast.error("Error fetching transfers: " + error.message);
        setLoadingTransfers(false);
        return;
      }
      setTransfers(data || []);
      setLoadingTransfers(false);
    };

    fetchTransfers();
  }, []);

  // Fetch items from opening_stock_entries
  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      const { data, error } = await supabase
        .from("opening_stock_entries")
        .select("*")
        .order("part_name");
      if (error) {
        toast.error("Failed to load items: " + error.message);
        setLoadingItems(false);
        return;
      }
      const transformed: RealItem[] = (data || []).map((item: any) => ({
        id: item.id,
        part_name: item.part_name,
        brand: item.brand,
        category: item.category,
        model: Array.isArray(item.compatible_models) && item.compatible_models.length > 0 ? item.compatible_models[0] : "",
        part_number: item.part_number,
        compatible_models: item.compatible_models,
      }));
      setItems(transformed);
      setLoadingItems(false);
    };
    fetchItems();
  }, []);

  const filteredTransfers = transfers.filter(transfer => {
    // Search by ID, item, or branch
    const searchMatch =
      transfer.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.item_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transfer.source_branch && transfer.source_branch.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transfer.destination_branch && transfer.destination_branch.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by status
    const statusMatch = filterStatus === "all" ? true : transfer.status === filterStatus;

    // Filter by branch (source or destination)
    const branchMatch = filterBranch === "all" ? true :
      (transfer.source_branch === filterBranch || transfer.destination_branch === filterBranch);

    return searchMatch && statusMatch && branchMatch;
  });

  // Handle submitting new transfer to Supabase
  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (transferForm.sourceBranch === transferForm.destinationBranch) {
      toast.error("Source and destination branches cannot be the same!");
      return;
    }

    if (!transferForm.itemId) {
      toast.error("Please select an item.");
      return;
    }

    if (!transferForm.sourceBranch || !transferForm.destinationBranch) {
      toast.error("Please select both source and destination branches.");
      return;
    }

    try {
      const { error } = await supabase.from("inventory_transfers").insert({
        item_id: transferForm.itemId,
        quantity: transferForm.quantity,
        source_type: "Branch",
        source_branch: transferForm.sourceBranch,
        destination_type: "Branch",
        destination_branch: transferForm.destinationBranch,
        transfer_method: transferForm.transferMethod,
        tracking_number: transferForm.trackingNumber || null,
        remarks: transferForm.remarks || null,
        requested_by: "Current User", // You can fetch the real user
        status: "Requested"
      });

      if (error) {
        toast.error("Failed to create transfer: " + error.message);
      } else {
        toast.success("Branch transfer request created successfully!");

        // Reload transfers
        const { data } = await supabase
          .from("inventory_transfers")
          .select("*")
          .or('source_type.eq.Branch,destination_type.eq.Branch')
          .order("request_date", { ascending: false });

        setTransfers(data || []);

        // Reset form and close dialog
        setTransferForm({
          itemId: "",
          quantity: 1,
          sourceBranch: "",
          destinationBranch: "",
          transferMethod: "Courier",
          trackingNumber: "",
          remarks: ""
        });
        setShowNewTransferDialog(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Transfer creation error:", error);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: TransferStatus) => {
    switch (status) {
      case "Requested": return "secondary";
      case "Approved": return "warning";
      case "Dispatched": return "default";
      case "Received": return "success";
      case "Cancelled": return "destructive";
      default: return "outline";
    }
  };

  const getItemDetails = (itemId: string) => items.find(i => i.id === itemId);

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Branch Transfers</h1>
          <p className="text-muted-foreground">
            Manage and track inventory transfers between branches (Live)
          </p>
        </div>
        <Button
          className="gap-1"
          onClick={() => setShowNewTransferDialog(true)}
        >
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
          <TabsTrigger value="transfers">Active Transfers</TabsTrigger>
          <TabsTrigger value="history">Transfer History</TabsTrigger>
        </TabsList>

        <TabsContent value="transfers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Transfers</CardTitle>
              <CardDescription>
                List of all pending and in-transit branch transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="status-filter">Filter by Status</Label>
                  <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as TransferStatus | "all")}>
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
                  <Label htmlFor="branch-filter">Filter by Branch</Label>
                  <Select value={filterBranch} onValueChange={(value) => setFilterBranch(value as Branch | "all")}>
                    <SelectTrigger id="branch-filter">
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
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
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Source Branch</TableHead>
                    <TableHead>Destination Branch</TableHead>
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

                  {!loadingTransfers && filteredTransfers.filter(t => t.status !== "Received" && t.status !== "Cancelled").map((transfer) => {
                    const item = getItemDetails(transfer.item_id);
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.id}</TableCell>
                        <TableCell>
                          {item ? (
                            <>
                              <div>{item.part_name}</div>
                              <div className="text-xs text-muted-foreground">{item.brand}{item.model && ` (${item.model})`}</div>
                            </>
                          ) : transfer.item_id}
                        </TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Building className="h-4 w-4" />
                            {transfer.source_branch}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Building className="h-4 w-4" />
                            {transfer.destination_branch}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(transfer.request_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(transfer.status as TransferStatus)}>
                            {transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transfer.transfer_method || "-"}</TableCell>
                      </TableRow>
                    );
                  })}

                  {!loadingTransfers && filteredTransfers.filter(t => t.status !== "Received" && t.status !== "Cancelled").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No active transfers found
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
                Archived list of all completed and cancelled branch transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Source Branch</TableHead>
                    <TableHead>Destination Branch</TableHead>
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

                  {!loadingTransfers && filteredTransfers.filter(t => t.status === "Received" || t.status === "Cancelled").map((transfer) => {
                    const item = getItemDetails(transfer.item_id);
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.id}</TableCell>
                        <TableCell>
                          {item ? (
                            <>
                              <div>{item.part_name}</div>
                              <div className="text-xs text-muted-foreground">{item.brand}{item.model && ` (${item.model})`}</div>
                            </>
                          ) : transfer.item_id}
                        </TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Building className="h-4 w-4" />
                            {transfer.source_branch}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Building className="h-4 w-4" />
                            {transfer.destination_branch}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(transfer.request_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(transfer.status as TransferStatus)}>
                            {transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transfer.transfer_method || "-"}</TableCell>
                      </TableRow>
                    );
                  })}

                  {!loadingTransfers && filteredTransfers.filter(t => t.status === "Received" || t.status === "Cancelled").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No completed transfers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Transfer Dialog */}
      <Dialog open={showNewTransferDialog} onOpenChange={setShowNewTransferDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>New Branch Transfer</DialogTitle>
            <DialogDescription>
              Create a request to transfer inventory between branches
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
                  <SelectValue placeholder={loadingItems ? "Loading..." : "Select Item"} />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.part_name} - {item.brand}{item.model ? ` (${item.model})` : ""}
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

                  <div className="space-y-2">
                    <Label htmlFor="source-branch">Source Branch</Label>
                    <Select
                      value={transferForm.sourceBranch}
                      onValueChange={(value) => setTransferForm({ ...transferForm, sourceBranch: value as Branch })}
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
                </div>
              </div>

              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Destination
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="destination-branch">Destination Branch</Label>
                    <Select
                      value={transferForm.destinationBranch}
                      onValueChange={(value) => setTransferForm({ ...transferForm, destinationBranch: value as Branch })}
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
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer-method">Transfer Method</Label>
              <Select
                value={transferForm.transferMethod}
                onValueChange={(value: TransferMethod) => setTransferForm({ ...transferForm, transferMethod: value })}
              >
                <SelectTrigger id="transfer-method">
                  <SelectValue placeholder="Select Transfer Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Courier">Courier</SelectItem>
                  <SelectItem value="Hand Delivery">Hand Delivery</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Railway">Railway</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {transferForm.transferMethod !== "Hand Delivery" && (
              <div className="space-y-2">
                <Label htmlFor="tracking-number">Tracking Number (optional)</Label>
                <Input
                  id="tracking-number"
                  placeholder="Enter tracking number if available"
                  value={transferForm.trackingNumber}
                  onChange={(e) => setTransferForm({ ...transferForm, trackingNumber: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                placeholder="Enter any additional notes"
                value={transferForm.remarks}
                onChange={(e) => setTransferForm({ ...transferForm, remarks: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewTransferDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Create Transfer Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchTransfer;

