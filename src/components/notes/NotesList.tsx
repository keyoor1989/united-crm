
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface NotesListProps {
  notes: Note[];
}

const NotesList: React.FC<NotesListProps> = ({ notes }) => {
  if (notes.length === 0) {
    return <div className="py-6 text-muted-foreground">No notes yet.</div>;
  }

  return (
    <div className="grid gap-4">
      {notes.map((note) => (
        <Card key={note.id}>
          <CardHeader>
            <CardTitle className="text-lg">{note.title}</CardTitle>
            <div className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()}</div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{note.content}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotesList;
