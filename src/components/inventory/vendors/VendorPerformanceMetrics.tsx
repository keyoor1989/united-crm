
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Vendor, VendorPerformanceMetric } from "@/types/inventory";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Star, 
  Package, 
  Percent, 
  ShieldCheck,
  RotateCcw
} from "lucide-react";

interface VendorPerformanceMetricsProps {
  vendor: Vendor;
  performanceData: VendorPerformanceMetric[];
  timePeriods: string[];
}

const VendorPerformanceMetrics: React.FC<VendorPerformanceMetricsProps> = ({
  vendor,
  performanceData,
  timePeriods
}) => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(timePeriods[0]);
  const [activeTab, setActiveTab] = useState("summary");

  // Filter data by selected time period
  const filteredData = performanceData.filter(
    (item) => item.vendorId === vendor.id && item.period === selectedTimePeriod
  );

  const currentPeriodData = filteredData[0] || null;

  // Get previous period data for comparison
  const previousPeriodIndex = timePeriods.indexOf(selectedTimePeriod) + 1;
  const previousPeriod = previousPeriodIndex < timePeriods.length ? timePeriods[previousPeriodIndex] : null;
  
  const previousPeriodData = previousPeriod
    ? performanceData.find(
        (item) => item.vendorId === vendor.id && item.period === previousPeriod
      )
    : null;

  // Calculate trends
  const calculateTrend = (current: number, previous: number | undefined) => {
    if (!previous) return { value: 0, isPositive: true };
    const diff = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(parseFloat(diff.toFixed(1))),
      isPositive: diff >= 0
    };
  };

  // Prepare data for charts
  const getTimeSeriesData = () => {
    return performanceData
      .filter((item) => item.vendorId === vendor.id)
      .sort((a, b) => timePeriods.indexOf(a.period) - timePeriods.indexOf(b.period))
      .map((item) => ({
        period: item.period,
        deliverySpeed: item.avgDeliveryTime,
        quality: item.productQuality,
        reliability: item.reliabilityScore
      }));
  };

  const getRadarChartData = () => {
    if (!currentPeriodData) return [];

    return [
      { 
        metric: "Delivery Speed", 
        value: 5 - Math.min(currentPeriodData.avgDeliveryTime, 5), 
        fullMark: 5 
      },
      { 
        metric: "Product Quality", 
        value: currentPeriodData.productQuality, 
        fullMark: 5 
      },
      { 
        metric: "Price Consistency", 
        value: currentPeriodData.priceConsistency, 
        fullMark: 5 
      },
      { 
        metric: "Return Rate", 
        value: 5 - (currentPeriodData.returnRate / 5), 
        fullMark: 5 
      },
      { 
        metric: "On-Time Delivery", 
        value: currentPeriodData.onTimeDelivery / currentPeriodData.totalOrders * 5, 
        fullMark: 5 
      },
    ];
  };

  // Get badge variant based on score
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "success";
    if (score >= 80) return "default";
    if (score >= 70) return "secondary";
    return "outline";
  };

  if (!currentPeriodData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-muted-foreground">No performance data available for this vendor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{vendor.name} - Performance Metrics</h2>
        <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {timePeriods.map((period) => (
              <SelectItem key={period} value={period}>
                {period}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reliability Score</p>
                <p className="text-2xl font-bold">{currentPeriodData.reliabilityScore}%</p>
                {previousPeriodData && (
                  <div className="flex items-center mt-1">
                    {calculateTrend(currentPeriodData.reliabilityScore, previousPeriodData.reliabilityScore).isPositive ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {calculateTrend(currentPeriodData.reliabilityScore, previousPeriodData.reliabilityScore).value}% Improvement
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {calculateTrend(currentPeriodData.reliabilityScore, previousPeriodData.reliabilityScore).value}% Decline
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Delivery Time</p>
                <p className="text-2xl font-bold">{currentPeriodData.avgDeliveryTime} days</p>
                {previousPeriodData && (
                  <div className="flex items-center mt-1">
                    {calculateTrend(previousPeriodData.avgDeliveryTime, currentPeriodData.avgDeliveryTime).isPositive ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {calculateTrend(previousPeriodData.avgDeliveryTime, currentPeriodData.avgDeliveryTime).value}% Faster
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {calculateTrend(previousPeriodData.avgDeliveryTime, currentPeriodData.avgDeliveryTime).value}% Slower
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product Quality</p>
                <p className="text-2xl font-bold">{currentPeriodData.productQuality}/5</p>
                {previousPeriodData && (
                  <div className="flex items-center mt-1">
                    {calculateTrend(currentPeriodData.productQuality, previousPeriodData.productQuality).isPositive ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {calculateTrend(currentPeriodData.productQuality, previousPeriodData.productQuality).value}% Improvement
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {calculateTrend(currentPeriodData.productQuality, previousPeriodData.productQuality).value}% Decline
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Star className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">Performance Summary</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="comparison">Radar Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary for {selectedTimePeriod}</CardTitle>
              <CardDescription>
                Key performance indicators for {vendor.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Total Orders</span>
                    </div>
                    <span>{currentPeriodData.totalOrders}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">On-Time Delivery</span>
                    </div>
                    <span>
                      {currentPeriodData.onTimeDelivery} of {currentPeriodData.totalOrders} (
                      {Math.round((currentPeriodData.onTimeDelivery / currentPeriodData.totalOrders) * 100)}%)
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Return Rate</span>
                    </div>
                    <span>{currentPeriodData.returnRate}%</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Price Consistency</span>
                    </div>
                    <span>{currentPeriodData.priceConsistency}/5</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Product Quality</span>
                    </div>
                    <span>{currentPeriodData.productQuality}/5</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Overall Reliability</span>
                    </div>
                    <Badge variant={getScoreBadgeVariant(currentPeriodData.reliabilityScore)}>
                      {currentPeriodData.reliabilityScore}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends Over Time</CardTitle>
              <CardDescription>
                Track how {vendor.name}'s performance has changed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getTimeSeriesData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" orientation="left" domain={[0, 5]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="deliverySpeed" 
                      name="Delivery Time (days)" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="quality" 
                      name="Product Quality (0-5)" 
                      stroke="#82ca9d" 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="reliability" 
                      name="Reliability Score (%)" 
                      stroke="#ff7300" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Radar Analysis</CardTitle>
              <CardDescription>
                Visualize overall performance across key metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius="70%" data={getRadarChartData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis domain={[0, 5]} />
                    <Radar
                      name={vendor.name}
                      dataKey="value"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p className="font-medium">How to read this chart:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Each axis represents a performance metric on a scale of 0-5</li>
                  <li>Higher values (further from center) indicate better performance</li>
                  <li>For metrics like delivery time and return rate, values are inverted so higher is better</li>
                  <li>A perfect vendor would create a complete pentagon at the outer edge</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button>
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default VendorPerformanceMetrics;
