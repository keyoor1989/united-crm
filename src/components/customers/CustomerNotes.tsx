
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MessageSquare, Plus, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type NoteType = {
  id: string;
  type: "call" | "chat";
  content: string;
  date: Date;
};

export default function CustomerNotes() {
  const [activeTab, setActiveTab] = useState<"call" | "chat">("call");
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { id: customerId } = useParams();
  const { toast } = useToast();

  // Fetch customer notes from the database
  useEffect(() => {
    const fetchCustomerNotes = async () => {
      if (!customerId) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('customer_notes')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching customer notes:", error);
          return;
        }
        
        // Convert the database notes to our component format
        const formattedNotes = data?.map(note => ({
          id: note.id,
          type: note.content.toLowerCase().includes('chat') ? 'chat' : 'call' as 'call' | 'chat',
          content: note.content,
          date: new Date(note.created_at)
        })) || [];
        
        setNotes(formattedNotes);
      } catch (error) {
        console.error("Error processing customer notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerNotes();
  }, [customerId]);

  const addNote = async () => {
    if (newNote.trim() === "" || !customerId) return;
    
    try {
      // Add note to the database
      const { data, error } = await supabase
        .from('customer_notes')
        .insert({
          customer_id: customerId,
          content: newNote,
          created_by: "User" // In a real app, this would be the current user
        })
        .select('*')
        .single();
      
      if (error) {
        console.error("Error adding note:", error);
        toast({
          title: "Error",
          description: "Failed to add note. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Add the new note to the state
      const newNoteItem: NoteType = {
        id: data.id,
        type: activeTab,
        content: data.content,
        date: new Date(data.created_at)
      };
      
      setNotes(prevNotes => [newNoteItem, ...prevNotes]);
      setNewNote("");
      
      toast({
        title: "Note Added",
        description: "Communication note has been saved successfully"
      });
    } catch (error) {
      console.error("Error in add note process:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Communication Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="call" className="w-full" onValueChange={(v) => setActiveTab(v as "call" | "chat")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="call">
              <Phone className="h-4 w-4 mr-2" />
              Call Log
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat Summary
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4 space-y-4">
            <Textarea 
              placeholder={`Add ${activeTab === "call" ? "call notes" : "chat summary"}...`}
              className="min-h-[80px] resize-none"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <Button onClick={addNote} className="w-full flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Note
            </Button>
          </div>
          
          <ScrollArea className="h-[300px] mt-4 pr-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {notes
                  .filter((note) => note.type === activeTab)
                  .map((note) => (
                    <div key={note.id} className="mb-4 border-b pb-3 last:border-b-0">
                      <p className="text-sm text-muted-foreground">
                        {note.date.toLocaleDateString()}
                      </p>
                      <p className="mt-1">{note.content}</p>
                    </div>
                  ))}
                {notes.filter((note) => note.type === activeTab).length === 0 && (
                  <p className="text-center text-muted-foreground py-6">
                    No {activeTab === "call" ? "call logs" : "chat summaries"} found.
                  </p>
                )}
              </>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
