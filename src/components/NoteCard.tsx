import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type Priority = "high" | "medium" | "low";

export interface Note {
  id: string;
  title: string;
  content: string;
  priority: Priority;
  hasReminder: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleReminder: (id: string) => void;
}

const priorityStyles = {
  high: "bg-priority-high text-white",
  medium: "bg-priority-medium text-foreground",
  low: "bg-priority-low text-white",
};

const priorityLabels = {
  high: "High",
  medium: "Medium", 
  low: "Low",
};

export function NoteCard({ note, onEdit, onDelete, onToggleReminder }: NoteCardProps) {
  return (
    <Card className="group relative p-4 bg-card border-border shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <h3 className="font-semibold text-card-foreground text-lg line-clamp-1">
            {note.title}
          </h3>
          <Badge className={cn("text-xs font-medium", priorityStyles[note.priority])}>
            {priorityLabels[note.priority]}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleReminder(note.id)}
            className="h-7 w-7 p-0 hover:bg-accent"
          >
            {note.hasReminder ? (
              <Bell className="h-4 w-4 text-priority-medium" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(note)}
            className="h-7 w-7 p-0 hover:bg-accent"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(note.id)}
            className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-3">
        {note.content}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {note.updatedAt.toLocaleDateString()} {note.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {note.hasReminder && (
          <div className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            <span>Reminder set</span>
          </div>
        )}
      </div>
    </Card>
  );
}