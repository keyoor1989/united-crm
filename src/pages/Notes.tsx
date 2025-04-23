
import React, { useEffect, useState } from "react";
import NoteForm from "@/components/notes/NoteForm";
import NotesList, { Note } from "@/components/notes/NotesList";

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    setLoading(true);
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">My Notes</h1>
      <NoteForm onNoteAdded={fetchNotes} />
      <div className="mt-8">
        {loading ? <div>Loading notes...</div> : <NotesList notes={notes} />}
      </div>
    </div>
  );
};

export default NotesPage;
