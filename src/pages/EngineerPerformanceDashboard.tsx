import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Star, 
  XCircle,
  Trophy,
  Mail,
  FileText,
  Filter,
  User,
  Users,
  ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PerformanceSummaryCard } from "@/components/engineer/PerformanceSummaryCard";
import EngineerJobsChart from "@/components/engineer/EngineerJobsChart";
import JobTypeDistributionChart from "@/components/engineer/JobTypeDistributionChart";
import CompletionTimeChart from "@/components/engineer/CompletionTimeChart";
import SlaComplianceChart from "@/components/engineer/SlaComplianceChart";
import { EngineerLeaderboard } from "@/components/engineer/EngineerLeaderboard";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";

const EngineerPerformanceDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedEngineer, setSelectedEngineer] = useState("all");
  const [location, setLocation] = useState("All Locations");
  const [jobType, setJobType] = useState("All Types");
  const [jobPriority, setJobPriority] = useState("All Priorities");
  const [engineerFilter, setEngineerFilter] = useState("All Engineers");
  const [showFilters, setShowFilters] = useState(false);
  
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Engineer Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and analyze service engineer performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          <Button className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            Email Report
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-range">Date Range</Label>
                <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Office Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Locations">All Locations</SelectItem>
                    <SelectItem value="Indore">Indore</SelectItem>
                    <SelectItem value="Bhopal">Bhopal</SelectItem>
                    <SelectItem value="Jabalpur">Jabalpur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-type">Job Type</Label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger id="job-type">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    <SelectItem value="AMC">AMC</SelectItem>
                    <SelectItem value="Warranty">Warranty</SelectItem>
                    <SelectItem value="Rental">Rental</SelectItem>
                    <SelectItem value="Out of Warranty">Out of Warranty</SelectItem>
                    <SelectItem value="Paid Call">Paid Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Job Priority</Label>
                <Select value={jobPriority} onValueChange={setJobPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Priorities">All Priorities</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="engineer">Engineer</Label>
                <Select value={engineerFilter} onValueChange={setEngineerFilter}>
                  <SelectTrigger id="engineer">
                    <SelectValue placeholder="Select engineer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Engineers">All Engineers</SelectItem>
                    <SelectItem value="Rahul Sharma">Rahul Sharma</SelectItem>
                    <SelectItem value="Ankit Patel">Ankit Patel</SelectItem>
                    <SelectItem value="Sunil Verma">Sunil Verma</SelectItem>
                    <SelectItem value="Vikram Singh">Vikram Singh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <PerformanceSummaryCard 
          title="Total Jobs Assigned"
          value="124"
          icon={<FileText className="h-4 w-4" />}
          trend={{ value: 8, isPositive: true }}
        />
        <PerformanceSummaryCard 
          title="Jobs Completed"
          value="98"
          icon={<CheckCircle2 className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
        />
        <PerformanceSummaryCard 
          title="Avg Time to Complete"
          value="4.2h"
          icon={<Clock className="h-4 w-4" />}
          trend={{ value: 0.3, isPositive: true }}
        />
        <PerformanceSummaryCard 
          title="SLA Breaches"
          value="7"
          icon={<XCircle className="h-4 w-4" />}
          trend={{ value: 2, isPositive: false }}
        />
        <PerformanceSummaryCard 
          title="Jobs Delayed"
          value="14"
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={{ value: 1, isPositive: false }}
        />
        <PerformanceSummaryCard 
          title="Avg Customer Rating"
          value="4.2"
          icon={<Star className="h-4 w-4" />}
          trend={{ value: 0.3, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Jobs Completed per Engineer</CardTitle>
          </CardHeader>
          <CardContent>
            <EngineerJobsChart 
              engineerId={selectedEngineer} 
              dateRange={dateRange}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Job Distribution by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <JobTypeDistributionChart 
              engineerId={selectedEngineer} 
              dateRange={dateRange}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Avg Completion Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <CompletionTimeChart 
              engineerId={selectedEngineer} 
              dateRange={dateRange}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>SLA Met vs Breached</CardTitle>
          </CardHeader>
          <CardContent>
            <SlaComplianceChart 
              engineerId={selectedEngineer} 
              dateRange={dateRange}
            />
          </CardContent>
        </Card>
      </div>

      {/* Engineer Table Section */}
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

      {/* Leaderboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Engineers Requiring Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 p-3 rounded-md border border-red-200 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Rahul Sharma has 3 SLA breaches in the last 7 days</p>
                  <p className="text-sm text-red-700">Recommend: Performance review and additional training</p>
                </div>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 flex items-start gap-3">
                <Star className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Sunil Verma has below average customer rating (3.2 stars)</p>
                  <p className="text-sm text-amber-700">Recommend: Customer service training</p>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Sunil Verma has highest average job completion time (5.1h)</p>
                  <p className="text-sm text-blue-700">Recommend: Process efficiency training</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EngineerLeaderboard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EngineerPerformanceDashboard;
