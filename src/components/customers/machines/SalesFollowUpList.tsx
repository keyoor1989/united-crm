
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, CalendarClock, Plus } from "lucide-react";

interface SalesFollowUpProps {
  customerId: string;
}

interface FollowUp {
  id: number;
  customer_id: string;
  date: string;
  customer_name: string;
  status: string;
  type: string;
  notes: string;
  location?: string;
  contact_phone?: string;
}

export const SalesFollowUpList: React.FC<SalesFollowUpProps> = ({ customerId }) => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowUps = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('sales_followups')
          .select('*')
          .eq('customer_id', customerId)
          .order('date', { ascending: false });

        if (error) throw error;
        setFollowUps(data as FollowUp[]);
      } catch (error) {
        console.error('Error fetching follow-ups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, [customerId]);

  if (loading) {
    return <div className="py-10 text-center">Loading follow-ups...</div>;
  }

  if (followUps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 border rounded-md border-dashed bg-muted/20">
        <CalendarClock className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-2">No follow-ups scheduled</p>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          <span>Schedule First Follow-up</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {followUps.map((followUp) => (
        <Card key={followUp.id} className="overflow-hidden border-l-4 border-brand-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{followUp.type} Follow-up</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(followUp.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  <Clock className="h-4 w-4 ml-3 mr-1" />
                  {new Date(followUp.date).toLocaleTimeString('en-US', {
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <Badge variant={followUp.status === 'Completed' ? 'outline' : 'default'}>
                {followUp.status}
              </Badge>
            </div>
            
            {followUp.notes && (
              <p className="text-sm text-muted-foreground mt-2 mb-3 line-clamp-2">
                {followUp.notes}
              </p>
            )}
            
            <div className="flex flex-wrap mt-2 gap-3">
              {followUp.location && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {followUp.location}
                </div>
              )}
              {followUp.contact_phone && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Phone className="h-3 w-3 mr-1" />
                  {followUp.contact_phone}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-3">
              <Button size="sm" variant="outline">Mark Complete</Button>
              <Button size="sm" variant="outline">Reschedule</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SalesFollowUpList;
