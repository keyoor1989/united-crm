
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NoteFormProps {
  onNoteAdded: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({ onNoteAdded }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    // Insert note into Supabase (notes table)
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase
      .from("notes")
      .insert({
        title,
        content,
      });

    setLoading(false);

    if (!error) {
      setTitle("");
      setContent("");
      onNoteAdded();
    } else {
      alert("Failed to add note: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-muted/50 rounded-lg p-4 space-y-4">
      <Input
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="Your note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      <div>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Note"}
        </Button>
      </div>
    </form>
  );
};

export default NoteForm;
