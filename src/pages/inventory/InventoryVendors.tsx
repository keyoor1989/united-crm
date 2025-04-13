import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PlusCircle, Trash2, Pencil, Package } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { supabase } from '@/integrations/supabase/client';
import { Vendor } from '@/types/inventory';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Vendor name must be at least 2 characters.",
  }),
  contactPerson: z.string().optional(),
  gstNo: z.string().optional(),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }).optional(),
  address: z.string().optional(),
})

const InventoryVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendorName, setSelectedVendorName] = useState<string | null>(null);
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      gstNo: "",
      phone: "",
      email: "",
      address: "",
    },
  })

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      gstNo: "",
      phone: "",
      email: "",
      address: "",
    },
  })

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching vendors:', error);
          toast({
            variant: "destructive",
            title: "Failed to fetch vendors",
            description: "There was an error loading vendors. Please try again."
          });
          return;
        }

        if (data) {
          setVendors(data);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
        toast({
          variant: "destructive",
          title: "Failed to fetch vendors",
          description: "There was an error loading vendors. Please try again."
        });
      }
    };

    fetchVendors();
  }, [toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const newVendor = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        name: values.name,
        contactPerson: values.contactPerson || '',
        gstNo: values.gstNo || '',
        phone: values.phone,
        email: values.email || '',
        address: values.address || ''
      };

      const { error } = await supabase
        .from('vendors')
        .insert(newVendor);

      if (error) {
        console.error('Error creating vendor:', error);
        toast({
          variant: "destructive",
          title: "Failed to create vendor",
          description: "There was an error creating the vendor. Please try again."
        });
        return;
      }

      setVendors([...vendors, newVendor]);
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Vendor created successfully."
      })
    } catch (error) {
      console.error('Error creating vendor:', error);
      toast({
        variant: "destructive",
        title: "Failed to create vendor",
        description: "There was an error creating the vendor. Please try again."
      });
    }
  }

  const onEditSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedVendorId) {
      toast({
        variant: "destructive",
        title: "No vendor selected",
        description: "Please select a vendor to edit."
      });
      return;
    }

    try {
      const updatedVendor = {
        name: values.name,
        contact_person: values.contactPerson || '',
        gst_no: values.gstNo || '',
        phone: values.phone,
        email: values.email || '',
        address: values.address || ''
      };

      const { error } = await supabase
        .from('vendors')
        .update(updatedVendor)
        .eq('id', selectedVendorId);

      if (error) {
        console.error('Error updating vendor:', error);
        toast({
          variant: "destructive",
          title: "Failed to update vendor",
          description: "There was an error updating the vendor. Please try again."
        });
        return;
      }

      setVendors(
        vendors.map(vendor =>
          vendor.id === selectedVendorId ? { ...vendor, ...updatedVendor } : vendor
        )
      );
      setEditOpen(false);
      editForm.reset();
      toast({
        title: "Success",
        description: "Vendor updated successfully."
      })
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast({
        variant: "destructive",
        title: "Failed to update vendor",
        description: "There was an error updating the vendor. Please try again."
      });
    }
  }

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendorId(vendor.id);
    editForm.setValue("name", vendor.name);
    editForm.setValue("contactPerson", vendor.contactPerson || "");
    editForm.setValue("gstNo", vendor.gstNo || "");
    editForm.setValue("phone", vendor.phone);
    editForm.setValue("email", vendor.email || "");
    editForm.setValue("address", vendor.address || "");
    setEditOpen(true);
  };

  const handleRemove = async (vendorId: string, vendorName: string) => {
    setSelectedVendorId(vendorId);
    setSelectedVendorName(vendorName);
    setRemoveOpen(true);
  };

  const confirmRemove = async () => {
    if (!selectedVendorId) {
      toast({
        variant: "destructive",
        title: "No vendor selected",
        description: "Please select a vendor to remove."
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', selectedVendorId);

      if (error) {
        console.error('Error deleting vendor:', error);
        toast({
          variant: "destructive",
          title: "Failed to delete vendor",
          description: "There was an error deleting the vendor. Please try again."
        });
        return;
      }

      setVendors(vendors.filter(vendor => vendor.id !== selectedVendorId));
      setRemoveOpen(false);
      setSelectedVendorId(null);
      toast({
        title: "Success",
        description: "Vendor deleted successfully."
      })
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete vendor",
        description: "There was an error deleting the vendor. Please try again."
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Vendors</h1>
        <Button onClick={() => setOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <div className="rounded-md border">
        <ScrollArea>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>GST No.</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.contactPerson}</TableCell>
                  <TableCell>{vendor.gstNo}</TableCell>
                  <TableCell>{vendor.phone}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{vendor.address}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(vendor)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRemove(vendor.id, vendor.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Add Vendor Modal */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the vendor details to create a new vendor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Vendor Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact Person" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gstNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST No.</FormLabel>
                    <FormControl>
                      <Input placeholder="GST No." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => form.reset()}>Cancel</AlertDialogCancel>
                <AlertDialogAction type="submit">Add Vendor</AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Vendor Modal */}
      <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Edit the vendor details to update the vendor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Vendor Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact Person" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="gstNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST No.</FormLabel>
                    <FormControl>
                      <Input placeholder="GST No." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => editForm.reset()}>Cancel</AlertDialogCancel>
                <AlertDialogAction type="submit">Update Vendor</AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Vendor Alert */}
      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-medium">{selectedVendorName}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InventoryVendors;
