"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Send, 
  Sparkles,
  RefreshCw,
  FolderDot,
  FileCheck2,
  FileX2,
  AlertCircle
} from "lucide-react";
import { DndContext, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";

// Droppable Kanban Column
function DroppableColumn({ id, title, count, children, onAddCard }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const [newTitle, setNewTitle] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddCard(id, newTitle.trim());
    setNewTitle("");
    setShowAddForm(false);
  };

  const getColColor = (colId) => {
    switch (colId) {
      case "subject": return "border-t-indigo-500";
      case "ideation": return "border-t-pink-500";
      case "proposal": return "border-t-amber-500";
      case "final": return "border-t-emerald-500";
      default: return "border-t-primary";
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      className={`flex flex-col h-full rounded-2xl border-t-[3px] border-x border-b bg-card/25 backdrop-blur-md transition-all min-h-[500px] shrink-0 w-80 md:w-auto md:flex-1 ${getColColor(id)} ${
        isOver 
          ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20 shadow-lg" 
          : "border-border/80"
      }`}
    >
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-sm">{title}</span>
          <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-extrabold text-muted-foreground">
            {count}
          </span>
        </div>

        {/* Quick add toggle button */}
        {id !== "final" && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Add card"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Add Form inside Column */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-3 bg-secondary/20 border-b border-border/40 shrink-0 animate-fade-in">
          <input
            type="text"
            placeholder="Name your idea..."
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border focus:border-primary text-foreground text-xs font-semibold outline-none placeholder-muted-foreground transition-all"
            maxLength={60}
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 text-[10px] font-bold text-muted-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2.5 py-1 rounded bg-primary hover:bg-primary/95 text-white text-[10px] font-bold cursor-pointer"
            >
              Deploy
            </button>
          </div>
        </form>
      )}

      {/* Card Container list */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[400px]">
        {children}
      </div>
    </div>
  );
}

// Draggable Kanban Card
function DraggableCard({ card, currentUserId, currentUserRole, onApprove, onReject, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card._id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : 1,
  } : undefined;

  const isApproved = card.stage === "approved";
  const isRejected = card.stage === "rejected";

  const getCardBorder = () => {
    if (isApproved) return "border-emerald-500/30 bg-emerald-500/[0.04] hover:border-emerald-500/50 shadow-md shadow-emerald-500/[0.02]";
    if (isRejected) return "border-border/30 bg-secondary/10 opacity-55 hover:opacity-75";
    return "border-border/80 bg-card/45 hover:border-primary/30";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const displayCreator = card.user_id === currentUserId ? "You" : (card.creator_name || "Team Member");
  const canApproveOrReject = currentUserRole === "manager" && card.user_id !== currentUserId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all ${getCardBorder()}`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {/* Sortable drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="p-1 rounded hover:bg-secondary/60 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-colors shrink-0"
          title="Drag to reorder columns"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        <div className="min-w-0 flex-1 flex flex-col gap-1.5">
          <p className={`font-semibold text-xs leading-snug break-words ${isApproved ? "text-emerald-400" : isRejected ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {card.title}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 font-semibold tracking-wide">
            <User className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span>Proposed by: <span className="font-extrabold text-foreground/75">{displayCreator}</span></span>
          </div>
        </div>
      </div>

      {/* Footer controls & Date metadata */}
      <div className="flex items-center justify-between pt-2 border-t border-border/20 shrink-0">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{formatDate(card.created_at)}</span>
        </div>

        {/* Quick state controls */}
        <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          {canApproveOrReject && (card.stage === "proposal" || card.stage === "approved" || card.stage === "rejected") && (
            <>
              {/* Approve Toggle */}
              <button
                onClick={() => onApprove(card._id)}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  isApproved 
                    ? "bg-emerald-500/25 border border-emerald-500/40 text-emerald-400" 
                    : "bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-emerald-400"
                }`}
                title="Approve Idea"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>

              {/* Reject Toggle */}
              <button
                onClick={() => onReject(card._id)}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  isRejected 
                    ? "bg-destructive/25 border border-destructive/40 text-destructive" 
                    : "bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-destructive"
                }`}
                title="Reject Idea"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Delete Card */}
          <button
            onClick={() => onDelete(card._id)}
            className="p-1.5 rounded-md bg-destructive/5 hover:bg-destructive/15 border border-destructive/10 text-destructive/70 hover:text-destructive transition-colors cursor-pointer"
            title="Delete Card"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}


export default function BrainstormClient({ session }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const sensors = useSensors(
    useSensors(PointerSensor)
  );

  // 1. Fetch Brainstorm Pipeline
  const fetchCards = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const teamId = session.user.team_id || "null";
      const res = await fetch(`/api/brainstorm?team_id=${teamId}`);
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      } else {
        setErrorMessage("Failed to load ideation pipeline.");
      }
    } catch (err) {
      setErrorMessage("Network error fetching brainstorm cards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Auto-dismiss error message after 6 seconds for clean micro-interactions
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // 2. Add new card in any column
  const handleAddCard = async (stage, title) => {
    try {
      const res = await fetch("/api/brainstorm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          team_id: session.user.team_id || null,
          stage: stage === "final" ? "approved" : stage,
        }),
      });

      if (res.ok) {
        const newCard = await res.json();
        setCards((prev) => [newCard, ...prev]);
      } else {
        setErrorMessage("Failed to add brainstorm item.");
      }
    } catch (err) {
      setErrorMessage("Network error creating item.");
    }
  };

  // 3. Update Card Stage (Used for drag drop + approve reject)
  const updateCardStage = async (id, stage) => {
    // Optimistic UI update
    setCards((prev) =>
      prev.map((c) => (c._id === id ? { ...c, stage, updated_at: new Date() } : c))
    );

    try {
      const res = await fetch(`/api/brainstorm/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });

      if (!res.ok) {
        fetchCards(); // Rollback
        setErrorMessage("Failed to update card column.");
      }
    } catch (err) {
      fetchCards();
    }
  };

  // 4. Delete Card
  const handleDeleteCard = async (id) => {
    setCards((prev) => prev.filter((c) => c._id !== id));

    try {
      const res = await fetch(`/api/brainstorm/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        fetchCards();
        setErrorMessage("Failed to delete card.");
      }
    } catch (err) {
      fetchCards();
    }
  };

  // 5. Drag and drop drop handler
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id;
    let targetStage = over.id; // column ID: 'subject', 'ideation', 'proposal', 'final'

    // If dragged onto the fourth column 'final', default its stage to 'approved'
    if (targetStage === "final") {
      targetStage = "approved";
    }

    const card = cards.find((c) => c._id === cardId);
    if (card && card.stage !== targetStage) {
      // Validate permissions for setting/shifting finalized stage
      const isTargetFinal = targetStage === "approved" || targetStage === "rejected";
      const isCurrentFinal = card.stage === "approved" || card.stage === "rejected";

      if (isTargetFinal || isCurrentFinal) {
        if (session.user.role !== "manager") {
          setErrorMessage("Only team managers (Wardens) can approve, reject, or modify finalized brainstorm cards.");
          return;
        }
        if (card.user_id === session.user.id) {
          setErrorMessage("As the creator of this idea, you cannot approve or reject it yourself.");
          return;
        }
      }

      await updateCardStage(cardId, targetStage);
    }
  };

  // Column definitions
  const columns = [
    { id: "subject", title: "🎯 Subject" },
    { id: "ideation", title: "💭 Ideation" },
    { id: "proposal", title: "📄 Proposal" },
    { id: "final", title: "🏁 Approved / Rejected" },
  ];

  // Map database stages to respective UI columns
  const getColCards = (colId) => {
    if (colId === "final") {
      return cards.filter((c) => c.stage === "approved" || c.stage === "rejected");
    }
    return cards.filter((c) => c.stage === colId);
  };

  return (
    <AppShell session={session}>
      {/* Title greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-foreground leading-none">
            Brainstorming Pipeline 💡
          </h2>
          <p className="text-muted-foreground mt-2 font-medium">
            Map out ideas, push proposals, and cast approvals collaboratively.
          </p>
        </div>

        <button
          onClick={fetchCards}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-sm font-semibold text-foreground transition-all cursor-pointer self-start md:self-auto shrink-0 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Pipeline</span>
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4.5 h-4.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-primary border-border animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">Synthesizing Kanban pipelines...</p>
        </div>
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          {/* Scrollable grid container for desktop columns */}
          <div className="flex overflow-x-auto md:overflow-x-visible pb-6 md:pb-0 gap-6 h-full items-start">
            {columns.map((col) => {
              const colCards = getColCards(col.id);
              return (
                <DroppableColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  count={colCards.length}
                  onAddCard={handleAddCard}
                >
                  {colCards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center opacity-40 select-none">
                      <FolderDot className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Empty Section</span>
                    </div>
                  ) : (
                    colCards.map((card) => (
                      <DraggableCard
                        key={card._id}
                        card={card}
                        currentUserId={session.user.id}
                        currentUserRole={session.user.role}
                        onApprove={() => updateCardStage(card._id, "approved")}
                        onReject={() => updateCardStage(card._id, "rejected")}
                        onDelete={handleDeleteCard}
                      />
                    ))
                  )}
                </DroppableColumn>
              );
            })}
          </div>
        </DndContext>
      )}
    </AppShell>
  );
}
