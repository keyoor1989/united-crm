import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";

// Mock data for issue types
const issueTypes = ["Engineer", "Customer", "Branch"];

// Mock data for engineers, customers & branches (to be replaced with real API calls later)
const engineers = [
  { id: "1", name: "Rajesh Kumar" },
  { id: "2", name: "Priya Sharma" },
  { id: "3", name: "Amit Patel" },
];

const customers = [
  { id: "1", name: "ABC Technologies" },
  { id: "2", name: "XYZ Solutions" },
  { id: "3", name: "Tech Innovations" },
];

const branches = [
  { id: "1", name: "Indore Office" },
  { id: "2", name: "Bhopal Office" },
  { id: "3", name: "Jabalpur Office" },
];

const InventoryReturns = () => {
  // State
  const [selectedIssueType, setSelectedIssueType] = useState(issueTypes[0]);
  const [selectedIssuer, setSelectedIssuer] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState("");
  const [returnStatus, setReturnStatus] = useState("Good");
  const [remarks, setRemarks] = useState("");

  // Event handlers
  const handleIssuerSelect = (value: string) => {
    setSelectedIssuer(value);
  };

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
  };

  const handleReceiveReturn = () => {
    if (!selectedItem) {
      toast.error("Please select an item to return");
      return;
    }

    if (!selectedIssuer) {
      toast.error(`Please select a ${selectedIssueType.toLowerCase()}`);
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (!returnReason) {
      toast.error("Please select a return reason");
      return;
    }

    // Handle return logic here based on issue type
    if (selectedIssueType === "Engineer") {
      // Handle engineer return
      toast.success(
        `${quantity} ${selectedItem.name} returned by engineer ${
          engineers.find((e) => e.id === selectedIssuer)?.name
        }`
      );
    } else if (selectedIssueType === "Customer") {
      // Handle customer return
      toast.success(
        `${quantity} ${selectedItem.name} returned by customer ${
          customers.find((c) => c.id === selectedIssuer)?.name
        }`
      );
    } else if (selectedIssueType === "Branch") {
      // Handle branch return
      toast.success(
        `${quantity} ${selectedItem.name} returned by branch ${
          branches.find((b) => b.id === selectedIssuer)?.name
        }`
      );
    } else {
      toast.error("Invalid issue type");
      return;
    }

    // Reset form
    setSelectedItem(null);
    setQuantity(1);
    setSelectedIssuer("");
    setReturnReason("");
    setReturnStatus("Good");
    setRemarks("");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Inventory Management | Receive Returns</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-medium">Receive inventory returns</h1>
      </div>

      <Card className="rounded-md">
        <CardContent className="p-6">
          <form className="space-y-6">
            {/* Issue Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="issueType">Issue Type</Label>
                <Select
                  value={selectedIssueType}
                  onValueChange={setSelectedIssueType}
                >
                  <SelectTrigger id="issueType">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuer">
                  {selectedIssueType} Name
                </Label>
                <Select onValueChange={handleIssuerSelect}>
                  <SelectTrigger id="issuer">
                    <SelectValue
                      placeholder={`Select ${selectedIssueType.toLowerCase()}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedIssueType === "Engineer" &&
                      engineers.map((engineer) => (
                        <SelectItem key={engineer.id} value={engineer.id}>
                          {engineer.name}
                        </SelectItem>
                      ))}

                    {selectedIssueType === "Customer" &&
                      customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}

                    {selectedIssueType === "Branch" &&
                      branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Item Selection */}
            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute top-3 left-3 text-gray-500" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 rounded-md"
                />
              </div>
              {/* Mock item list - replace with actual item list */}
              <div className="max-h-40 overflow-y-auto border rounded-md">
                {/* Replace with actual item list */}
                {/* Example: */}
                {/* <div 
                      className={`p-3 hover:bg-gray-100 cursor-pointer ${selectedItem?.id === 'item1' ? 'bg-gray-100' : ''}`}
                      onClick={() => handleItemSelect({ id: 'item1', name: 'Toner Cartridge' })}
                    >
                      Toner Cartridge
                    </div> */}
                {/* Add more mock items as needed */}
              </div>
            </div>

            {/* Quantity and Return Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnReason">Return Reason</Label>
                <Select onValueChange={setReturnReason}>
                  <SelectTrigger id="returnReason">
                    <SelectValue placeholder="Select return reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unused">Unused</SelectItem>
                    <SelectItem value="Defective">Defective</SelectItem>
                    <SelectItem value="Wrong Part">Wrong Part</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnStatus">Return Status</Label>
                <Select onValueChange={setReturnStatus}>
                  <SelectTrigger id="returnStatus">
                    <SelectValue placeholder="Select return status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Additional remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="rounded-md"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="button"
              className="w-full mt-6"
              onClick={handleReceiveReturn}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Receive Return
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryReturns;
