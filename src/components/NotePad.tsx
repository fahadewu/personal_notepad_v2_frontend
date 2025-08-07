import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, StickyNote, Filter, LogOut, RefreshCw } from "lucide-react";
import { NoteCard, Note, Priority } from "./NoteCard";
import { NoteDialog } from "./NoteDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import dojoLomLogo from "@/assets/dojo-lom-complete-logo.png";
import axios from "axios";

export function NotePad() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [backendUrl, setBackendUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const { toast } = useToast();
  const { logout } = useAuth();

  // API endpoint for notes - you can change this to your actual API endpoint
  const NOTES_API_URL =  "http://localhost:3000/api/notepad/getNotes";

  // Fetch notes from API on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoadingNotes(true);
      try {
        const response = await axios.get(NOTES_API_URL);
        
        const transformedNotes: Note[] = response.data.slice(0, 10).map((item: any) => ({
          id: item.id.toString(),
          title: item.title || "Untitled Note",
          content: item.note || item.content || "No content available",
          priority: (item.priority as Priority) || "medium" as Priority,
          hasReminder: item.hasReminder || false,
          createdAt: item.created_at ? new Date(item.createdat) : new Date(),
          updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
        }));
        
        setNotes(transformedNotes);
        toast({
          title: "Notes Loaded",
          description: `Successfully loaded ${transformedNotes.length} notes from the server.`,
        });
      } catch (error) {
        console.error("Error fetching notes:", error);
        
        // Fallback to sample data if API fails
        const fallbackNotes: Note[] = [
          {
            id: "1",
            title: "Welcome Note",
            content: "Failed to load notes from server. This is a sample note. Please check your API connection.",
            priority: "high" as Priority,
            hasReminder: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ];
        
        setNotes(fallbackNotes);
        toast({
          title: "Connection Failed",
          description: "Could not load notes from server. Showing sample data.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [toast]);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || note.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleRefreshNotes = async () => {
    setIsLoadingNotes(true);
    try {
      const response = await axios.get(NOTES_API_URL);
      
      const transformedNotes: Note[] = response.data.slice(0, 10).map((item: any) => ({
        id: item.id.toString(),
        title: item.title || "Untitled Note",
        content: item.body || item.content || "No content available",
        priority: (item.priority as Priority) || "medium" as Priority,
        hasReminder: item.hasReminder || false,
        createdAt: item.created_at ? new Date(item.created_t) : new Date(),
        updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
      }));
      
      setNotes(transformedNotes);
      toast({
        title: "Notes Refreshed",
        description: `Successfully refreshed ${transformedNotes.length} notes.`,
      });
    } catch (error) {
      console.error("Error refreshing notes:", error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh notes from server.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleCreateNote = async () => {
    setSelectedNote(null);
    setIsDialogOpen(true);

  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsDialogOpen(true);
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedNote) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === selectedNote.id 
          ? { ...note, ...noteData, updatedAt: new Date() }
          : note
      ));

    } else {
      // Create new note
      const newNote: Note = {
        ...noteData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes([newNote, ...notes]);

    }
  };

  const handleDeleteNote = async(id: string) => {
    await axios.get(`/deleteNotes/${id}`).then(() => {

      setNotes(notes.filter(note => note.id !== id));
      toast({
        title: "Note deleted",
        description: "Your note has been successfully deleted.",
      });
    }).catch((error) => {
      console.error("Error deleting note:", error);
      toast({
        title: "Delete Failed",
        description: "Could not delete the note. Please try again.",
        variant: "destructive",
      });
      
    }
    );
  };

  const handleToggleReminder = (id: string) => {
    setNotes(notes.map(note =>
      note.id === id 
        ? { ...note, hasReminder: !note.hasReminder, updatedAt: new Date() }
        : note
    ));
    
    const note = notes.find(n => n.id === id);
    if (note) {
      toast({
        title: note.hasReminder ? "Reminder removed" : "Reminder set",
        description: note.hasReminder 
          ? "Reminder has been removed from this note."
          : "Reminder has been set for this note.",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      toast({
        title: "Search Applied",
        description: `Searching for "${value}"`,
      });
    }
  };

  const handlePriorityFilterChange = (value: Priority | "all") => {
    setPriorityFilter(value);
    toast({
      title: "Filter Applied",
      description: value === "all" ? "Showing all priorities" : `Filtered by ${value} priority`,
    });
  };

  const handleFetchAcademicData = async () => {
    if (!backendUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a backend URL to fetch academic data.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: "Fetching Data",
      description: "Connecting to your backend to fetch academic records...",
    });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This would be replaced with actual fetch logic
      toast({
        title: "Data Fetched Successfully",
        description: "Academic records have been loaded from your backend.",
      });
    } catch (error) {
      toast({
        title: "Fetch Failed",
        description: "Failed to connect to your backend. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card shadow-[var(--shadow-soft)]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={dojoLomLogo} 
                alt="Dojo LoM" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleRefreshNotes}
                variant="outline" 
                size="sm"
                disabled={isLoadingNotes}
                className="bg-card border-border hover:bg-accent/10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingNotes ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={handleCreateNote}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-soft)]"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={priorityFilter} onValueChange={handlePriorityFilterChange}>
              <SelectTrigger className="w-40 bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notes Grid */}
        {isLoadingNotes ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            <h3 className="text-lg font-semibold text-card-foreground mt-4 mb-2">
              Loading Notes...
            </h3>
            <p className="text-muted-foreground">
              Fetching your notes from the server
            </p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <StickyNote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              {notes.length === 0 ? "No notes yet" : "No notes found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {notes.length === 0 
                ? "Create your first note to get started!"
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {notes.length === 0 && (
              <Button onClick={handleCreateNote} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create First Note
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onToggleReminder={handleToggleReminder}
              />
            ))}
          </div>
        )}
      </div>

      {/* News Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 border-t border-border">
        <h2 className="text-2xl font-bold text-card-foreground mb-8 flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
          Latest News
        </h2>
        
        <div className="space-y-6">
          {/* News Item 1 */}
          <div className="group flex items-start gap-6 p-6 bg-gradient-to-r from-card via-card to-secondary/30 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-[var(--shadow-hover)]">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-priority-high to-priority-high/70 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-priority-high/10 text-priority-high border border-priority-high/20">
                  BREAKING
                </span>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                Tech Update
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Latest advancements in AI technology continue to reshape how we work and interact with digital systems.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* News Item 2 */}
          <div className="group flex items-start gap-6 p-6 bg-gradient-to-l from-card via-card to-accent/20 rounded-2xl border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-[var(--shadow-hover)]">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-priority-medium to-priority-medium/70 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-priority-medium/10 text-priority-medium border border-priority-medium/20">
                  MARKET
                </span>
                <span className="text-xs text-muted-foreground">4 hours ago</span>
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-accent transition-colors">
                Market News
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Global markets show positive trends as investors remain optimistic about upcoming economic indicators.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* News Item 3 */}
          <div className="group flex items-start gap-6 p-6 bg-gradient-to-r from-card via-card to-muted/30 rounded-2xl border border-border/50 hover:border-muted/40 transition-all duration-300 hover:shadow-[var(--shadow-hover)]">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-priority-low to-priority-low/70 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-priority-low/10 text-priority-low border border-priority-low/20">
                  REPORT
                </span>
                <span className="text-xs text-muted-foreground">6 hours ago</span>
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-muted-foreground transition-colors">
                Industry Report
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                New research reveals significant improvements in productivity tools and their impact on remote work.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center group-hover:bg-muted/30 transition-colors">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academics Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 border-t border-border">
        <h2 className="text-2xl font-bold text-card-foreground mb-8 flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full"></div>
          Academic Records
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fetch Controls */}
          <div className="bg-gradient-to-br from-card to-accent/10 rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              Data Source
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Backend URL
                </label>
                <Input
                  type="url"
                  placeholder="https://your-api.com/academics"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  className="w-full bg-background border-border"
                />
              </div>
              <Button 
                onClick={handleFetchAcademicData}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-accent to-primary text-white hover:shadow-lg font-medium"
              >
                {isLoading ? "Fetching..." : "Fetch Academic Data"}
              </Button>
            </div>
          </div>

          {/* Academic Stats */}
          <div className="bg-gradient-to-br from-card to-primary/10 rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-2xl font-bold text-primary">--</div>
                <div className="text-xs text-muted-foreground">Total Courses</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-2xl font-bold text-accent">--</div>
                <div className="text-xs text-muted-foreground">GPA</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-2xl font-bold text-priority-low">--</div>
                <div className="text-xs text-muted-foreground">Credits</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="text-2xl font-bold text-priority-medium">--</div>
                <div className="text-xs text-muted-foreground">Semester</div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Records List */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-card to-secondary/20 rounded-2xl border border-border/50 overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                Course Records
              </h3>
            </div>
            
            {/* Placeholder content - replace with actual data */}
            <div className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-card-foreground mb-2">No Academic Data</h4>
                <p className="text-muted-foreground">
                  Connect your backend to fetch and display your academic records
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Dialog */}
      <NoteDialog
        note={selectedNote}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveNote}
      />
    </div>
  );
}