
import React, { useState } from "react";
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, FileText, Search, MoreHorizontal, Eye, 
  Download, Trash, FilePlus, Link as LinkIcon
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Sample contract data
const contracts = [
  {
    id: "contract-1",
    name: "ABC Company Annual Maintenance Contract",
    customer: "ABC Company",
    uploadDate: "2024-03-15",
    expiryDate: "2025-03-14",
    status: "Active",
    type: "AMC",
    fileSize: "1.2 MB"
  },
  {
    id: "contract-2",
    name: "XYZ Corp Service Level Agreement",
    customer: "XYZ Corporation",
    uploadDate: "2024-02-20",
    expiryDate: "2025-02-19",
    status: "Active",
    type: "SLA",
    fileSize: "856 KB"
  },
  {
    id: "contract-3",
    name: "Global Tech Equipment Purchase Agreement",
    customer: "Global Technologies",
    uploadDate: "2023-11-10",
    expiryDate: "2024-11-09",
    status: "Active",
    type: "Purchase",
    fileSize: "2.1 MB"
  },
  {
    id: "contract-4",
    name: "Mega Industries Lease Agreement",
    customer: "Mega Industries",
    uploadDate: "2023-09-05",
    expiryDate: "2024-03-04",
    status: "Expired",
    type: "Lease",
    fileSize: "1.5 MB"
  }
];

const ContractUpload = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Filter contracts based on search term
  const filteredContracts = contracts.filter(contract =>
    contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="success" className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case "Expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "Pending":
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Form for contract upload
  const form = useForm({
    defaultValues: {
      contractName: "",
      customer: "",
      contractType: "",
      expiryDate: "",
      notes: ""
    }
  });
  
  // Handle file drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        toast.error("Only PDF files are accepted");
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        toast.error("Only PDF files are accepted");
      }
    }
  };
  
  const onSubmit = (data: any) => {
    if (!selectedFile) {
      toast.error("Please upload a contract file");
      return;
    }
    
    console.log("Form data:", data);
    console.log("Selected file:", selectedFile);
    
    toast.success("Contract uploaded successfully");
    setUploadDialogOpen(false);
    form.reset();
    setSelectedFile(null);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contract Upload</h1>
          <p className="text-muted-foreground">
            Upload and manage customer contracts and agreements
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Upload Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Contract</DialogTitle>
              <DialogDescription>
                Upload a new contract or agreement document
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                {/* File upload area */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  
                  {selectedFile ? (
                    <div className="space-y-2">
                      <Badge variant="outline" className="px-3 py-1">
                        <FileText className="h-4 w-4 mr-2" />
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </Badge>
                      <div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          Change file
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-base font-medium mb-1">
                        Drag and drop your file here
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse (PDF only)
                      </p>
                      <Input
                        type="file"
                        id="contract-file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => document.getElementById("contract-file")?.click()}
                      >
                        Browse Files
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter contract name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Select or enter customer name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contractType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select contract type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AMC">Annual Maintenance Contract</SelectItem>
                            <SelectItem value="SLA">Service Level Agreement</SelectItem>
                            <SelectItem value="Purchase">Purchase Agreement</SelectItem>
                            <SelectItem value="Lease">Lease Agreement</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter any additional notes about this contract"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setUploadDialogOpen(false);
                      form.reset();
                      setSelectedFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Upload Contract</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Contract cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">All Contracts</CardTitle>
            <CardDescription>{contracts.length} total</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{contracts.length}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="gap-1">
              <Eye className="h-4 w-4" /> View All
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Contracts</CardTitle>
            <CardDescription>Currently valid agreements</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">{contracts.filter(c => c.status === "Active").length}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="gap-1">
              <FilePlus className="h-4 w-4" /> Add New
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Expiring Soon</CardTitle>
            <CardDescription>Contracts expiring in 30 days</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">1</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="gap-1">
              <LinkIcon className="h-4 w-4" /> Link to Renewal
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Contracts table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract Name</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContracts.length > 0 ? (
              filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {contract.name}
                    </div>
                  </TableCell>
                  <TableCell>{contract.customer}</TableCell>
                  <TableCell>{new Date(contract.uploadDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(contract.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>{contract.type}</TableCell>
                  <TableCell>
                    {getStatusBadge(contract.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No contracts found</p>
                  <Button 
                    variant="link" 
                    onClick={() => setUploadDialogOpen(true)} 
                    className="mt-2"
                  >
                    Upload your first contract
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ContractUpload;
