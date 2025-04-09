
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MessageSquare, Plus } from "lucide-react";

type NoteType = {
  id: number;
  type: "call" | "chat";
  content: string;
  date: Date;
};

export default function CustomerNotes() {
  const [activeTab, setActiveTab] = useState<"call" | "chat">("call");
  const [notes, setNotes] = useState<NoteType[]>([
    {
      id: 1,
      type: "call",
      content: "Customer inquired about Kyocera 2554ci pricing and features",
      date: new Date(2025, 3, 5),
    },
    {
      id: 2,
      type: "chat",
      content: "Sent brochure and quotation via WhatsApp",
      date: new Date(2025, 3, 7),
    },
    {
      id: 3,
      type: "call",
      content: "Follow-up call: Customer requesting site visit for installation assessment",
      date: new Date(2025, 3, 8),
    },
  ]);
  const [newNote, setNewNote] = useState("");

  const addNote = () => {
    if (newNote.trim() === "") return;
    
    const note: NoteType = {
      id: Date.now(),
      type: activeTab,
      content: newNote,
      date: new Date(),
    };
    
    setNotes([note, ...notes]);
    setNewNote("");
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
                No {activeTab === "call" ? "call logs" : "chat summaries"} yet.
              </p>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
