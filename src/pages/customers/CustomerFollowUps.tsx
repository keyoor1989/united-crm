
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format, formatDistance, isToday, isThisWeek } from "date-fns";
import { 
  Calendar, 
  PhoneCall, 
  MessageSquare, 
  ClipboardCheck, 
  ChevronLeft,
  Filter,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { SalesFollowUp } from "@/components/customers/machines/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const CustomerFollowUps = () => {
  const [followUps, setFollowUps] = useState<SalesFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"today" | "week" | "all" | "completed">("today");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchFollowUps();
  }, []);
  
  const fetchFollowUps = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching all follow-ups from database");
      // Fetch all follow-ups from the database
      const { data, error } = await supabase
        .from('sales_followups')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        console.error("Error fetching follow-ups:", error);
        toast.error("Failed to load follow-ups");
        return;
      }
      
      console.log("Follow-ups data from database:", data);
      
      if (data) {
        // Map to our SalesFollowUp type with proper type validation
        const formattedFollowUps: SalesFollowUp[] = data.map(item => ({
          id: item.id,
          date: new Date(item.date),
          customerId: item.customer_id,
          customerName: item.customer_name,
          notes: item.notes || "",
          // Ensure status matches the expected union type
          status: item.status === "completed" ? "completed" : "pending",
          // Ensure type matches the expected union type
          type: validateFollowUpType(item.type),
          contactPhone: item.contact_phone || "",
          location: item.location || ""
        }));
        
        console.log("Formatted follow-ups:", formattedFollowUps);
        setFollowUps(formattedFollowUps);
      }
    } catch (error) {
      console.error("Error in fetchFollowUps:", error);
      toast.error("An error occurred loading follow-ups");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to validate the follow-up type
  const validateFollowUpType = (type: string): "quotation" | "demo" | "negotiation" | "closure" => {
    const validTypes = ["quotation", "demo", "negotiation", "closure"];
    return validTypes.includes(type) 
      ? type as "quotation" | "demo" | "negotiation" | "closure" 
      : "quotation"; // Default to quotation if an invalid type is provided
  };
  
  const handleMarkComplete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('sales_followups')
        .update({ status: 'completed' })
        .eq('id', id);
        
      if (error) {
        console.error("Error completing follow-up:", error);
        toast.error("Failed to mark follow-up as complete");
        return;
      }
      
      // Update local state
      setFollowUps(followUps.map(item => 
        item.id === id ? { ...item, status: "completed" } : item
      ));
      
      toast.success("Follow-up marked as complete!");
    } catch (error) {
      console.error("Error in handleMarkComplete:", error);
    }
  };
  
  const handleCall = (phone?: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
      toast.info(`Calling ${phone}`);
    } else {
      toast.error("No phone number available");
    }
  };
  
  const handleWhatsApp = (phone?: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
      toast.info("Opening WhatsApp chat");
    } else {
      toast.error("No phone number available");
    }
  };
  
  // Filter follow-ups based on selected tab, type filter and search term
  const filteredFollowUps = followUps.filter(followUp => {
    // Status filter based on tab
    const matchesTab = activeTab === "all" ? true :
                     activeTab === "completed" ? followUp.status === "completed" :
                     activeTab === "today" ? followUp.status === "pending" && isToday(followUp.date) :
                     activeTab === "week" ? followUp.status === "pending" && isThisWeek(followUp.date) : false;
    
    // Type filter
    const matchesType = !typeFilter || followUp.type === typeFilter;
    
    // Search filter for customer name or notes
    const matchesSearch = !searchTerm || 
      followUp.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (followUp.notes && followUp.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (followUp.location && followUp.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesTab && matchesType && matchesSearch;
  });
  
  // Calculate completion stats for today
  const todayTotal = followUps.filter(followUp => isToday(followUp.date)).length;
  const todayCompleted = followUps.filter(followUp => isToday(followUp.date) && followUp.status === "completed").length;
  const todayProgress = todayTotal === 0 ? 0 : (todayCompleted / todayTotal) * 100;
  
  // Get follow-up type badge
  const getFollowUpTypeBadge = (type: string) => {
    switch (type) {
      case "quotation":
        return <Badge className="bg-blue-500">Quotation</Badge>;
      case "demo":
        return <Badge className="bg-purple-500">Demo</Badge>;
      case "negotiation":
        return <Badge className="bg-amber-500">Negotiation</Badge>;
      case "closure":
        return <Badge className="bg-green-500">Closure</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Link to="/customers">
            <Button variant="outline" size="sm" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Customers
            </Button>
          </Link>
        </div>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Follow-ups Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center">
              <div className="animate-pulse space-y-4 w-full">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/customers">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Customers
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight ml-2">Customer Follow-ups</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchFollowUps} 
          className="gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Follow-ups Management</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFilters}
              className="gap-1"
            >
              <Filter className="h-4 w-4" /> 
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="all">All Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {showFilters && (
              <div className="flex flex-col md:flex-row gap-2 py-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search by customer or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={typeFilter || ""} onValueChange={(value) => setTypeFilter(value || null)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="quotation">Quotation</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closure">Closure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {activeTab === "today" && (
              <div className="mb-4">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span>Today's progress</span>
                  <span>{todayCompleted} of {todayTotal} completed</span>
                </div>
                <Progress value={todayProgress} className="h-2" />
              </div>
            )}
            
            {filteredFollowUps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {activeTab === "today" 
                    ? "No follow-ups scheduled for today" 
                    : activeTab === "week" 
                      ? "No follow-ups scheduled for this week" 
                      : activeTab === "completed"
                        ? "No completed follow-ups found"
                        : "No pending follow-ups found"}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredFollowUps.map((followUp) => (
                  <div 
                    key={followUp.id} 
                    className={`border rounded-md p-3 ${followUp.status === 'completed' ? 'bg-gray-50' : 'bg-card'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{followUp.customerName}</h4>
                          {getFollowUpTypeBadge(followUp.type)}
                          {followUp.status === 'completed' && (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(followUp.date, "PPP")} 
                          {followUp.status === 'completed' ? ' • Completed' : ` • ${formatDistance(followUp.date, new Date(), { addSuffix: true })}`}
                          {followUp.location && ` • ${followUp.location}`}
                        </p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <span className="sr-only">Open menu</span>
                            <ChevronLeft className="h-4 w-4 rotate-270" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {followUp.status !== 'completed' && (
                            <DropdownMenuItem onClick={() => handleMarkComplete(followUp.id)}>
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {followUp.notes && (
                      <p className="text-sm mt-2 line-clamp-2">{followUp.notes}</p>
                    )}
                    
                    {followUp.status !== 'completed' && (
                      <div className="flex justify-end mt-3 gap-2">
                        {followUp.contactPhone && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 px-2 text-xs"
                              onClick={() => handleCall(followUp.contactPhone)}
                            >
                              <PhoneCall className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 px-2 text-xs"
                              onClick={() => handleWhatsApp(followUp.contactPhone)}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              WhatsApp
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="h-7 px-2 text-xs"
                          onClick={() => handleMarkComplete(followUp.id)}
                        >
                          <ClipboardCheck className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerFollowUps;
