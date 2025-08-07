import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Note, Priority } from "./NoteCard";
import axios from "axios";
import { toast } from "sonner";

interface NoteDialogProps {
  note?: Note | null;
  open: boolean;
  edit?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function NoteDialog({ note, open,  onOpenChange, onSave }: NoteDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [hasReminder, setHasReminder] = useState(false);

  useEffect(() => {
    if (note)  {
      setTitle(note.title);
      setContent(note.content);
      setPriority(note.priority);
      setHasReminder(note.hasReminder);

      

    } else {
      setTitle("");
      setContent("");
      setPriority("medium");
      setHasReminder(false);

       
    }
  }, [note, open]);

  const handleSave = async () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      content: content.trim(),
      priority,
      hasReminder,
    });

    if (note) {
      // Update existing note
      axios.post(`/editNotes/${note.id}`, {
        title: title.trim(),
        note: content.trim(),
        priority,
        reminder: hasReminder,
      }).then(response => {
        toast.success("Note updated successfully!");
      }).catch(error => {
        toast.error("Error updating note: " + error.message);
      });
    } else {
      // Create new note
      axios.post("/addNotes", {
        title: title.trim(),
        note: content.trim(),
        priority,
        reminder: hasReminder,
      }).then(response => {
        toast.success("Note created successfully!");
      }).catch(error => {
        toast.error("Error creating note: " + error.message);
      });
    }
    

    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-[var(--shadow-medium)]">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {note ? "Edit Note" : "Create New Note"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-card-foreground">Title</Label>
            <Input
              id="title"
              placeholder="Enter note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-border focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-card-foreground">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your note content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="bg-background border-border focus:ring-ring resize-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label className="text-card-foreground">Priority</Label>
              <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-card-foreground">Reminder</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="reminder"
                  checked={hasReminder}
                  onCheckedChange={setHasReminder}
                />
                <Label htmlFor="reminder" className="text-sm text-muted-foreground">
                  Set reminder
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {note ? "Update" : "Create"} Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}