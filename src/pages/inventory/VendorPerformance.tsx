import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
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
import { useToast } from "@/components/ui/use-toast"

interface VendorPerformanceMetric {
  id: string;
  vendorId: string;
  period: string;
  totalOrders: number;
  onTimeDelivery: number;
  avgDeliveryTime: number;
  priceConsistency: number;
  productQuality: number;
  returnRate: number;
  reliabilityScore: number;
  createdAt: string;
}

const VendorPerformance = () => {
  const [metrics, setMetrics] = useState<VendorPerformanceMetric[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vendorId: '',
    period: '',
    totalOrders: 0,
    onTimeDelivery: 0,
    avgDeliveryTime: 0,
    priceConsistency: 0,
    productQuality: 0,
    returnRate: 0,
    reliabilityScore: 0,
  });
  const { toast } = useToast()

  useEffect(() => {
    // Mock data for demonstration
    const mockMetrics: VendorPerformanceMetric[] = [
      {
        id: '1',
        vendorId: 'vendor1',
        period: '2023-Q1',
        totalOrders: 50,
        onTimeDelivery: 95,
        avgDeliveryTime: 7,
        priceConsistency: 90,
        productQuality: 92,
        returnRate: 3,
        reliabilityScore: 93,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        vendorId: 'vendor2',
        period: '2023-Q1',
        totalOrders: 40,
        onTimeDelivery: 90,
        avgDeliveryTime: 10,
        priceConsistency: 85,
        productQuality: 88,
        returnRate: 5,
        reliabilityScore: 87,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        vendorId: 'vendor1',
        period: '2023-Q2',
        totalOrders: 60,
        onTimeDelivery: 97,
        avgDeliveryTime: 6,
        priceConsistency: 92,
        productQuality: 94,
        returnRate: 2,
        reliabilityScore: 95,
        createdAt: new Date().toISOString()
      }
    ];
    setMetrics(mockMetrics);
  }, []);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setIsEditMode(false);
    setFormData({
      vendorId: '',
      period: '',
      totalOrders: 0,
      onTimeDelivery: 0,
      avgDeliveryTime: 0,
      priceConsistency: 0,
      productQuality: 0,
      returnRate: 0,
      reliabilityScore: 0,
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (isEditMode && selectedMetricId) {
      // Update existing metric
      setMetrics(prevMetrics =>
        prevMetrics.map(metric =>
          metric.id === selectedMetricId
            ? { ...metric, ...formData }
            : metric
        )
      );
      toast({
        title: "Success",
        description: "Vendor performance metric updated successfully.",
      })
    } else {
      // Add new metric
      const newMetric: VendorPerformanceMetric = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        ...formData,
      } as VendorPerformanceMetric;
      setMetrics(prevMetrics => [...prevMetrics, newMetric]);
      toast({
        title: "Success",
        description: "Vendor performance metric added successfully.",
      })
    }

    handleCloseDialog();
  };

  const handleEdit = (metric: VendorPerformanceMetric) => {
    setIsEditMode(true);
    setSelectedMetricId(metric.id);
    setFormData({
      vendorId: metric.vendorId,
      period: metric.period,
      totalOrders: metric.totalOrders,
      onTimeDelivery: metric.onTimeDelivery,
      avgDeliveryTime: metric.avgDeliveryTime,
      priceConsistency: metric.priceConsistency,
      productQuality: metric.productQuality,
      returnRate: metric.returnRate,
      reliabilityScore: metric.reliabilityScore,
    });
    setIsDialogOpen(true);
  };

  const handleRemove = (metricId: string, vendorId: string) => {
    setMetrics(prevMetrics => prevMetrics.filter(metric => metric.id !== metricId));
    toast({
      title: "Success",
      description: `Vendor performance metric for ${vendorId} deleted successfully.`,
    })
  };

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Inventory Management | Vendor Performance</title>
      </Helmet>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Vendor Performance Metrics</h1>
        <Button onClick={handleOpenDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Metric
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor ID</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>On-Time Delivery (%)</TableHead>
              <TableHead>Avg Delivery Time (Days)</TableHead>
              <TableHead>Price Consistency (%)</TableHead>
              <TableHead>Product Quality (%)</TableHead>
              <TableHead>Return Rate (%)</TableHead>
              <TableHead>Reliability Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.id}>
                <TableCell>{metric.vendorId}</TableCell>
                <TableCell>{metric.period}</TableCell>
                <TableCell>{metric.totalOrders}</TableCell>
                <TableCell>{metric.onTimeDelivery}</TableCell>
                <TableCell>{metric.avgDeliveryTime}</TableCell>
                <TableCell>{metric.priceConsistency}</TableCell>
                <TableCell>{metric.productQuality}</TableCell>
                <TableCell>{metric.returnRate}</TableCell>
                <TableCell>{metric.reliabilityScore}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(metric)}>
                    <Edit className="h-4 w-4 mr-2" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(metric.id, metric.vendorId)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog for Adding/Editing Metric */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isEditMode ? "Edit" : "Add"} Vendor Performance Metric</AlertDialogTitle>
            <AlertDialogDescription>
              {isEditMode
                ? "Update the vendor performance metric details."
                : "Enter the details for the new vendor performance metric."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="vendorId" className="text-right">
                Vendor ID
              </label>
              <Input
                type="text"
                id="vendorId"
                name="vendorId"
                value={formData.vendorId}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="period" className="text-right">
                Period
              </label>
              <Input
                type="text"
                id="period"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="totalOrders" className="text-right">
                Total Orders
              </label>
              <Input
                type="number"
                id="totalOrders"
                name="totalOrders"
                value={formData.totalOrders}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="onTimeDelivery" className="text-right">
                On-Time Delivery (%)
              </label>
              <Input
                type="number"
                id="onTimeDelivery"
                name="onTimeDelivery"
                value={formData.onTimeDelivery}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="avgDeliveryTime" className="text-right">
                Avg Delivery Time (Days)
              </label>
              <Input
                type="number"
                id="avgDeliveryTime"
                name="avgDeliveryTime"
                value={formData.avgDeliveryTime}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="priceConsistency" className="text-right">
                Price Consistency (%)
              </label>
              <Input
                type="number"
                id="priceConsistency"
                name="priceConsistency"
                value={formData.priceConsistency}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="productQuality" className="text-right">
                Product Quality (%)
              </label>
              <Input
                type="number"
                id="productQuality"
                name="productQuality"
                value={formData.productQuality}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="returnRate" className="text-right">
                Return Rate (%)
              </label>
              <Input
                type="number"
                id="returnRate"
                name="returnRate"
                value={formData.returnRate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="reliabilityScore" className="text-right">
                Reliability Score
              </label>
              <Input
                type="number"
                id="reliabilityScore"
                name="reliabilityScore"
                value={formData.reliabilityScore}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              {isEditMode ? "Update" : "Add"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorPerformance;
