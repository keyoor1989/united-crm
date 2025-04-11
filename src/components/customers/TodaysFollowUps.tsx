
import React, { useState, useEffect } from "react";
import { format, isToday, isThisWeek, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneCall, Calendar, MessageSquare, ClipboardCheck, MoreHorizontal, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SalesFollowUp } from "./machines/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "../ui/progress";

const TodaysFollowUps = () => {
  const [followUps, setFollowUps] = useState<SalesFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"today" | "week" | "all">("today");
  
  useEffect(() => {
    fetchFollowUps();
  }, []);
  
  const fetchFollowUps = async () => {
    setIsLoading(true);
    try {
      // Fetch all pending follow-ups from the database
      const { data, error } = await supabase
        .from('sales_followups')
        .select('*')
        .eq('status', 'pending')
        .order('date', { ascending: true });
      
      if (error) {
        console.error("Error fetching follow-ups:", error);
        toast.error("Failed to load follow-ups");
        return;
      }
      
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
      setFollowUps(followUps.filter(item => item.id !== id));
      
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
  
  // Filter follow-ups based on selected tab
  const filteredFollowUps = followUps.filter(followUp => {
    switch (activeTab) {
      case "today":
        return isToday(followUp.date);
      case "week":
        return isThisWeek(followUp.date);
      case "all":
        return true;
      default:
        return false;
    }
  });
  
  // Calculate completion stats
  const todayTotal = followUps.filter(followUp => isToday(followUp.date)).length;
  const todayCompleted = 0; // We're only showing pending ones, so completed is 0
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
  
  if (isLoading) {
    return (
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
    );
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Follow-ups Dashboard</span>
          <div className="flex items-center gap-2">
            <Link to="/customers/follow-ups">
              <Button variant="link" size="sm" className="gap-1 text-xs h-8 p-0">
                View All Follow-ups
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={fetchFollowUps} className="h-8">
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="all">All Pending</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
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
              <p className="text-muted-foreground">No {activeTab === "today" ? "follow-ups scheduled for today" : activeTab === "week" ? "follow-ups this week" : "pending follow-ups"}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {filteredFollowUps.map((followUp) => (
                <div key={followUp.id} className="border rounded-md p-3 bg-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{followUp.customerName}</h4>
                        {getFollowUpTypeBadge(followUp.type)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(followUp.date, "PPP")} {followUp.location && `• ${followUp.location}`}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleMarkComplete(followUp.id)}>
                          Mark Complete
                        </DropdownMenuItem>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaysFollowUps;
