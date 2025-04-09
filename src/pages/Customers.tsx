
import React from "react";
import Layout from "@/components/layout/Layout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  FilterX, 
  Filter,
  MoreVertical,
  Phone,
  Mail,
  FileText,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Customers = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage your customer relationships and follow-ups
            </p>
          </div>
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8 w-full"
            />
          </div>

          <div className="flex gap-2 self-end">
            <Button variant="outline" className="gap-1">
              <FilterX className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </div>

        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">Machines</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  Govt. Medical College
                  <div className="text-xs text-muted-foreground">Last contact: 5 days ago</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>9876543210</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>admin@gmch.in</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">Indore</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex gap-1">
                    <Badge variant="outline" className="bg-slate-50">Kyocera 2554ci</Badge>
                    <Badge variant="outline" className="bg-slate-50">+2 more</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-amber-500">Contract Renewal</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" title="Call">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Email">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="WhatsApp">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Machine History</DropdownMenuItem>
                        <DropdownMenuItem>Create Quotation</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Service</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Delete Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">
                  Sunrise Hospital
                  <div className="text-xs text-muted-foreground">Last contact: 2 days ago</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>8765432109</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>admin@sunrise.co.in</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">Bhopal</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex gap-1">
                    <Badge variant="outline" className="bg-slate-50">Xerox 7845</Badge>
                    <Badge variant="outline" className="bg-slate-50">Kyocera 2040</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Active</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" title="Call">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Email">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="WhatsApp">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Machine History</DropdownMenuItem>
                        <DropdownMenuItem>Create Quotation</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Service</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Delete Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell className="font-medium">
                  Rajesh Enterprises
                  <div className="text-xs text-muted-foreground">Last contact: Today</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>7654321098</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>info@rajeshent.com</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">Jabalpur</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex gap-1">
                    <Badge variant="outline" className="bg-slate-50">Ricoh MP2014</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-blue-500">Need Toner</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" title="Call">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Email">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="WhatsApp">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Machine History</DropdownMenuItem>
                        <DropdownMenuItem>Create Quotation</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Service</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Delete Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default Customers;
