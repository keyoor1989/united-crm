
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, FilePlus, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const Quotations = () => {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">
            View and manage all quotations
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button asChild>
            <Link to="/quotation-form">
              <FilePlus className="h-4 w-4 mr-2" />
              Create New Quotation
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotations</CardTitle>
          <CardDescription>
            Manage your customer quotations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">No Quotations Yet</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              Start by creating your first quotation to keep track of customer opportunities.
            </p>
            <Button asChild className="mt-6">
              <Link to="/quotation-form">
                <FilePlus className="h-4 w-4 mr-2" />
                Create New Quotation
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quotations;
