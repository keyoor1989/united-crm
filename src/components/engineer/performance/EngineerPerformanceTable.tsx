
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export const EngineerPerformanceTable = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Engineer Performance Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Engineer Name</TableHead>
              <TableHead>Assigned Jobs</TableHead>
              <TableHead>Completed Jobs</TableHead>
              <TableHead>SLA Breaches</TableHead>
              <TableHead>Avg Time/Job</TableHead>
              <TableHead>Most Used Parts</TableHead>
              <TableHead>Expenses</TableHead>
              <TableHead>Avg Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-amber-50">
              <TableCell className="font-medium">Rahul Sharma</TableCell>
              <TableCell>38</TableCell>
              <TableCell>34</TableCell>
              <TableCell>
                <Badge variant="destructive" className="font-bold">3</Badge>
              </TableCell>
              <TableCell>3.8h</TableCell>
              <TableCell>Drum Units</TableCell>
              <TableCell>₹12,450</TableCell>
              <TableCell>
                <div className="flex items-center">
                  3.8 <Star className="h-3 w-3 fill-amber-500 text-amber-500 ml-1" />
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Ankit Patel</TableCell>
              <TableCell>42</TableCell>
              <TableCell>38</TableCell>
              <TableCell>1</TableCell>
              <TableCell>3.2h</TableCell>
              <TableCell>Toner Cartridges</TableCell>
              <TableCell>₹14,820</TableCell>
              <TableCell>
                <div className="flex items-center">
                  4.6 <Star className="h-3 w-3 fill-amber-500 text-amber-500 ml-1" />
                </div>
              </TableCell>
            </TableRow>
            <TableRow className="bg-red-50">
              <TableCell className="font-medium">Sunil Verma</TableCell>
              <TableCell>26</TableCell>
              <TableCell>21</TableCell>
              <TableCell>
                <Badge variant="destructive" className="font-bold">2</Badge>
              </TableCell>
              <TableCell>5.1h</TableCell>
              <TableCell>Fuser Units</TableCell>
              <TableCell>
                <Badge variant="destructive" className="font-bold">₹22,340</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Badge variant="destructive">3.2</Badge>
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500 ml-1" />
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Vikram Singh</TableCell>
              <TableCell>18</TableCell>
              <TableCell>18</TableCell>
              <TableCell>0</TableCell>
              <TableCell>2.9h</TableCell>
              <TableCell>Transfer Belts</TableCell>
              <TableCell>₹8,250</TableCell>
              <TableCell>
                <div className="flex items-center">
                  4.8 <Star className="h-3 w-3 fill-amber-500 text-amber-500 ml-1" />
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
