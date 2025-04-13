
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink } from "lucide-react";
import { Progress } from "../ui/progress";
import { SalesFollowUp } from "./machines/types";
import FollowUpItem from "./followups/FollowUpItem";
import EmptyFollowUps from "./followups/EmptyFollowUps";
import FollowUpsLoading from "./followups/FollowUpsLoading";
import { 
  fetchFollowUps, 
  markFollowUpComplete, 
  filterFollowUps, 
  calculateCompletionStats 
} from "./followups/followupUtils";

const TodaysFollowUps = () => {
  const [followUps, setFollowUps] = useState<SalesFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"today" | "week" | "all">("today");
  
  useEffect(() => {
    loadFollowUps();
  }, []);
  
  const loadFollowUps = async () => {
    const data = await fetchFollowUps();
    setIsLoading(false);
    if (data) {
      setFollowUps(data);
    }
  };
  
  const handleMarkComplete = async (id: number) => {
    const success = await markFollowUpComplete(id);
    if (success) {
      // Update local state
      setFollowUps(followUps.filter(item => item.id !== id));
    }
  };
  
  // Filter follow-ups based on selected tab
  const filteredFollowUps = filterFollowUps(followUps, activeTab);
  
  // Calculate completion stats
  const { todayTotal, todayCompleted, todayProgress } = calculateCompletionStats(followUps);
  
  if (isLoading) {
    return <FollowUpsLoading />;
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
            <Button variant="outline" size="sm" onClick={loadFollowUps} className="h-8">
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="all">All Pending</TabsTrigger>
            </TabsList>
            
            {activeTab === "today" && (
              <TabsContent value="today">
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>Today's progress</span>
                    <span>{todayCompleted} of {todayTotal} completed</span>
                  </div>
                  <Progress value={todayProgress} className="h-2" />
                </div>
                
                {filteredFollowUps.length === 0 ? (
                  <EmptyFollowUps activeTab={activeTab} />
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {filteredFollowUps.map((followUp) => (
                      <FollowUpItem 
                        key={followUp.id}
                        followUp={followUp} 
                        onMarkComplete={handleMarkComplete} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
            
            {activeTab === "week" && (
              <TabsContent value="week">
                {filteredFollowUps.length === 0 ? (
                  <EmptyFollowUps activeTab={activeTab} />
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {filteredFollowUps.map((followUp) => (
                      <FollowUpItem 
                        key={followUp.id}
                        followUp={followUp} 
                        onMarkComplete={handleMarkComplete} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
            
            {activeTab === "all" && (
              <TabsContent value="all">
                {filteredFollowUps.length === 0 ? (
                  <EmptyFollowUps activeTab={activeTab} />
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {filteredFollowUps.map((followUp) => (
                      <FollowUpItem 
                        key={followUp.id}
                        followUp={followUp} 
                        onMarkComplete={handleMarkComplete} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaysFollowUps;
