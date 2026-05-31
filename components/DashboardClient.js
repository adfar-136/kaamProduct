"use client";

import { useEffect, useState, useTransition } from "react";
import AppShell from "@/components/AppShell";
import { 
  Plus, 
  Trash2, 
  ArrowRight, 
  GripVertical, 
  Sparkles, 
  Clock, 
  Briefcase, 
  Coffee, 
  ListChecks, 
  Users, 
  CheckCircle2, 
  Trophy, 
  Send, 
  AlertTriangle,
  Award,
  ChevronRight,
  ShieldCheck,
  User,
  PlusCircle,
  QrCode,
  Edit2,
  Flame,
  Play,
  Pause,
  RotateCcw,
  Timer,
  BookOpen,
  RefreshCw,
  CheckCircle,
  Utensils
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Clean custom Progress bar component
function CustomProgress({ value, className = "" }) {
  return (
    <div className={`w-full bg-secondary/80 h-3 rounded-full overflow-hidden border border-border/10 ${className}`}>
      <div 
        className="bg-gradient-to-r from-primary via-violet-500 to-indigo-500 h-full transition-all duration-700 ease-out rounded-full shadow-[0_0_8px_rgba(139,92,246,0.3)]" 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// Sortable individual task element
function SortableTaskItem({ task, onToggleDone, onCarry, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editType, setEditType] = useState(task.type);
  const [editPriority, setEditPriority] = useState(task.priority || "medium");
  const [editDuration, setEditDuration] = useState(task.duration || 30);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isDone = task.status === "done";
  const isCarried = task.status === "carried";

  const typeConfig = {
    task: { badge: "Task", color: "bg-indigo-500/15 border-indigo-500/20 text-indigo-400", icon: Briefcase },
    break: { badge: "Break", color: "bg-teal-500/15 border-teal-500/20 text-teal-400", icon: Coffee },
    meeting: { badge: "Meeting", color: "bg-amber-500/15 border-amber-500/20 text-amber-400", icon: Clock },
  };

  const priorityConfig = {
    high: { label: "High", dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]", color: "bg-red-500/15 border-red-500/20 text-red-400" },
    medium: { label: "Medium", dot: "bg-amber-500", color: "bg-amber-500/15 border-amber-500/20 text-amber-400" },
    low: { label: "Low", dot: "bg-emerald-500", color: "bg-emerald-500/15 border-emerald-500/20 text-emerald-400" },
  };

  const currentType = typeConfig[task.type] || typeConfig.task;
  const TypeIcon = currentType.icon;
  
  const currentPriority = priorityConfig[task.priority || "medium"] || priorityConfig.medium;

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex flex-col gap-4 p-4 rounded-xl border border-primary bg-card/65 backdrop-blur-md shadow-xl animate-fade-in"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-background/60 border border-border focus:border-primary text-foreground text-sm font-semibold outline-none transition-all"
            placeholder="Edit task title..."
            maxLength={60}
          />
          <div className="flex gap-2">
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-background/60 border border-border text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary transition-all"
            >
              <option value="task">💼 Work</option>
              <option value="break">☕ Break</option>
              <option value="meeting">🤝 Meeting</option>
            </select>
            
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              className="px-3 py-2 rounded-xl bg-background/60 border border-border text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary transition-all"
            >
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="low">🟢 Low Priority</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border/40 pt-3">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Est. Duration:</label>
            <select
              value={editDuration}
              onChange={(e) => setEditDuration(Number(e.target.value))}
              className="px-2.5 py-1 rounded-lg bg-background/60 border border-border text-xs font-extrabold text-foreground outline-none focus:border-primary transition-all"
            >
              <option value={15}>15m</option>
              <option value={30}>30m</option>
              <option value={45}>45m</option>
              <option value={60}>1h</option>
              <option value={90}>1.5h</option>
              <option value={120}>2h</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (editTitle.trim()) {
                  onUpdate(task._id, {
                    title: editTitle.trim(),
                    type: editType,
                    priority: editPriority,
                    duration: editDuration,
                  });
                  setIsEditing(false);
                }
              }}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-extrabold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Save Block
            </button>
            <button
              onClick={() => {
                setEditTitle(task.title);
                setEditType(task.type);
                setEditPriority(task.priority || "medium");
                setEditDuration(task.duration || 30);
                setIsEditing(false);
              }}
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-extrabold cursor-pointer transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
        isDone 
          ? "bg-secondary/10 border-border/40 opacity-70"
          : isCarried
          ? "bg-secondary/5 border-dashed border-border/60 opacity-60"
          : "bg-card/40 border-border/80 hover:border-primary/30"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Sortable drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="p-1 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Done status checkbox */}
        <button
          onClick={() => onToggleDone(task._id, task.status)}
          disabled={isCarried}
          className={`flex-shrink-0 w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
            isDone 
              ? "bg-primary border-primary text-white animate-pulse-slow" 
              : "border-muted-foreground/40 bg-background/50 hover:border-primary/60"
          } disabled:opacity-40 disabled:pointer-events-none`}
        >
          {isDone && <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />}
        </button>

        {/* Task Title & Label Type */}
        <div className="min-w-0">
          <p className={`font-semibold text-sm leading-snug truncate ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {/* Type badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${currentType.color}`}>
              <TypeIcon className="w-3 h-3" />
              {currentType.badge}
            </span>
            
            {/* Priority dot badge */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${currentPriority.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentPriority.dot}`} />
              {currentPriority.label}
            </span>

            {/* Estimated time duration */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/80 border border-border/80 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              ⏱️ {task.duration || 30}m
            </span>

            {/* Progress completion selector */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/80 border border-border/80 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Progress:</span>
              <select
                value={task.completion_percentage || 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onUpdate(task._id, { 
                    completion_percentage: val,
                    status: val === 100 ? "done" : "pending" 
                  });
                }}
                className="bg-transparent text-[10px] font-extrabold text-foreground outline-none cursor-pointer border-none p-0 focus:ring-0 focus:outline-none"
              >
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => (
                  <option key={val} value={val} className="bg-card text-foreground">{val}%</option>
                ))}
              </select>
            </div>

            {isCarried && (
              <span className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Carried ➡️
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {!isDone && !isCarried && (
          <>
            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg bg-secondary/30 hover:bg-secondary border border-border/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Edit Task Details"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* End Task Button */}
            <button
              onClick={() => onToggleDone(task._id, "pending")}
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold transition-all cursor-pointer"
            >
              End Task
            </button>
            
            {/* Carry to Tomorrow */}
            <button
              onClick={() => onCarry(task._id)}
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Carry to Tomorrow"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Delete */}
        <button
          onClick={() => onDelete(task._id)}
          className="p-2 rounded-lg bg-destructive/5 hover:bg-destructive/15 border border-destructive/10 text-destructive/70 hover:text-destructive transition-all cursor-pointer"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function InteractiveBreakBlock({ title, durationMinutes, icon: Icon }) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durationMinutes * 60);
  };

  return (
    <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/[0.03] flex items-center justify-between gap-4 transition-all hover:border-teal-500/45 hover:bg-teal-500/[0.05]">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
          <Icon className="w-4 h-4 text-teal-400 animate-pulse" />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest block leading-none">Break Block</span>
          <h4 className="text-sm font-bold text-white mt-1 leading-snug truncate">{title}</h4>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">⏱️ Scheduled Duration: {durationMinutes} min</p>
        </div>
      </div>

      {/* Break Timer Engine */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right shrink-0">
          <span className="font-mono text-base font-extrabold text-teal-400 tracking-tight block">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block -mt-0.5">
            {isRunning ? "Running" : timeLeft === 0 ? "Finished" : "Ready"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsRunning(!isRunning)}
            disabled={timeLeft === 0}
            className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
              isRunning 
                ? "bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30" 
                : "bg-teal-500/20 border border-teal-500/30 text-teal-400 hover:bg-teal-500/30"
            }`}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            onClick={handleReset}
            className="px-2 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({ session }) {
  const [activeTab, setActiveTab] = useState("productivity"); // 'productivity' | 'contest'
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState("task");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  
  // Reflection & Streak states
  const [reflection, setReflection] = useState("");
  const [streak, setStreak] = useState(3);

  // Pomodoro Focus Timer states
  const [pomodoroTime, setPomodoroTime] = useState(1500); // 25 min default
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState("focus"); // 'focus' | 'short_break' | 'long_break'
  const [focusTaskId, setFocusTaskId] = useState("");
  
  // EOD Report states
  const [eodReport, setEodReport] = useState(null);
  const [eodMessage, setEodMessage] = useState("");
  const [eodSubmitted, setEodSubmitted] = useState(false);

  // Team states
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamError, setTeamError] = useState("");
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 1. Fetch tasks for selected date
  const fetchTasks = async (targetDate) => {
    setLoadingTasks(true);
    setErrorMessage("");
    try {
      const res = await fetch(`/api/tasks?date=${targetDate}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        // Check if warning needed
        if (data.length >= 10) {
          setWarningMessage("Maximum 10 tasks limit reached for the day!");
        } else {
          setWarningMessage("");
        }
      } else {
        setErrorMessage("Failed to load tasks.");
      }
    } catch (err) {
      setErrorMessage("Network error fetching tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  // 2. Fetch User's Team & Leaderboard
  const fetchTeamData = async () => {
    if (!session.user.team_id) {
      setTeam(null);
      setTeamMembers([]);
      return;
    }

    setLoadingTeam(true);
    setTeamError("");
    try {
      const res = await fetch(`/api/teams/${session.user.team_id}/members?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setTeam(data.team);
        
        // Sort members by productivity percentage descending for leaderboard
        const sortedMembers = data.members.sort((a, b) => {
          const aPercent = a.eod ? a.eod.productivity_percentage : 0;
          const bPercent = b.eod ? b.eod.productivity_percentage : 0;
          return bPercent - aPercent;
        });
        setTeamMembers(sortedMembers);
      } else {
        setTeamError("Failed to load team cohort details.");
      }
    } catch (err) {
      setTeamError("Network error fetching team details.");
    } finally {
      setLoadingTeam(false);
    }
  };

  // Trigger loads on date/session changes
  useEffect(() => {
    fetchTasks(date);
    // Check if EOD is already submitted for this date (opt-out of flash)
    setEodSubmitted(false);
    setEodReport(null);
  }, [date]);

  useEffect(() => {
    if (activeTab === "contest") {
      fetchTeamData();
    }
  }, [activeTab, date]);

  const fetchStreak = async () => {
    try {
      const res = await fetch("/api/streak");
      if (res.ok) {
        const data = await res.json();
        setStreak(data.streak);
        localStorage.setItem("kaam_streak", data.streak.toString());
      }
    } catch (err) {
      console.error("Failed to load real streak:", err);
    }
  };

  // Load streak and reflections
  useEffect(() => {
    const savedStreak = localStorage.getItem("kaam_streak");
    if (savedStreak) {
      setStreak(Number(savedStreak));
    }
    fetchStreak();
  }, []);

  useEffect(() => {
    const savedReflection = localStorage.getItem("kaam_reflection_" + date);
    setReflection(savedReflection || "");
  }, [date]);

  // Pomodoro Focus Timer tick loop
  useEffect(() => {
    let interval = null;
    if (pomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setPomodoroActive(false);
      
      // Show notification
      alert(`⏰ Pomodoro Mode Complete: ${pomodoroMode === "focus" ? "Great work! Time for a short break." : "Break is over! Time to focus."}`);
      
      if (pomodoroMode === "focus") {
        setPomodoroMode("short_break");
        setPomodoroTime(300); // 5 min
      } else {
        setPomodoroMode("focus");
        setPomodoroTime(1500); // 25 min
      }
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroTime, pomodoroMode]);

  // 3. Add a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (tasks.length >= 10) {
      setWarningMessage("Cannot add task. Show up to 10 tasks per day limit enforced!");
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          type: newTaskType,
          date,
          priority: newTaskPriority,
          duration: newTaskDuration,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => [...prev, data]);
        setNewTaskTitle("");
        setNewTaskPriority("medium");
        setNewTaskDuration(30);
        setWarningMessage("");
        if (tasks.length + 1 >= 10) {
          setWarningMessage("Maximum 10 tasks limit reached for the day!");
        }
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to create task.");
      }
    } catch (err) {
      setErrorMessage("Network error creating task.");
    }
  };

  // 4. Toggle Task Completion (Done/Pending)
  const handleToggleDone = async (id, currentStatus) => {
    const nextStatus = currentStatus === "done" ? "pending" : "done";
    const nextPct = nextStatus === "done" ? 100 : 0;
    
    // Optimistic UI Update
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: nextStatus, completion_percentage: nextPct } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, completion_percentage: nextPct }),
      });
      if (!res.ok) {
        // Rollback on fail
        setTasks((prev) =>
          prev.map((t) => (t._id === id ? { ...t, status: currentStatus, completion_percentage: currentStatus === "done" ? 100 : 0 } : t))
        );
        setErrorMessage("Failed to update task status.");
      }
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: currentStatus, completion_percentage: currentStatus === "done" ? 100 : 0 } : t))
      );
    }
  };

  // 4.5. Update Task Details
  const handleUpdateTask = async (id, updatedFields) => {
    const originalTasks = [...tasks];
    
    // Optimistic UI Update
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, ...updatedFields } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) {
        // Rollback
        setTasks(originalTasks);
        const err = await res.json();
        setErrorMessage(err.error || "Failed to update task details.");
      }
    } catch (err) {
      setTasks(originalTasks);
      setErrorMessage("Network error updating task.");
    }
  };

  // 5. Carry to Tomorrow
  const handleCarry = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "carry" }),
      });

      if (res.ok) {
        // Update task status to carried in the list
        setTasks((prev) =>
          prev.map((t) => (t._id === id ? { ...t, status: "carried" } : t))
        );
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to carry task.");
      }
    } catch (err) {
      setErrorMessage("Network error carrying task.");
    }
  };

  // 6. Delete Task
  const handleDelete = async (id) => {
    const originalTasks = [...tasks];
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t._id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWarningMessage("");
      } else {
        setTasks(originalTasks);
        setErrorMessage("Failed to delete task.");
      }
    } catch (err) {
      setTasks(originalTasks);
    }
  };

  // 7. Drag-and-drop end reorder re-save
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t._id === active.id);
    const newIndex = tasks.findIndex((t) => t._id === over.id);

    const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
    // Update local list
    setTasks(reorderedTasks);

    // Save updated index to database sequentially
    try {
      await Promise.all(
        reorderedTasks.map((task, idx) =>
          fetch(`/api/tasks/${task._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: idx }),
          })
        )
      );
    } catch (err) {
      setErrorMessage("Error saving task orders.");
    }
  };

  // 8. Submit EOD Report
  const handleSubmitEod = async () => {
    try {
      const res = await fetch("/api/eod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });

      if (res.ok) {
        const data = await res.json();
        setEodReport(data.report);
        setEodMessage(data.message);
        setEodSubmitted(true);
        fetchStreak(); // Refresh the streak immediately upon locking in EOD report!
      } else {
        setErrorMessage("Failed to submit EOD report.");
      }
    } catch (err) {
      setErrorMessage("Network error submitting EOD.");
    }
  };

  // 9. Create a team (Warden)
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setLoadingTeam(true);
    setTeamError("");
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setTeam(data.team);
        // Link team ID manually to session
        session.user.team_id = data.team._id;
        session.user.role = "manager";
        fetchTeamData();
      } else {
        const err = await res.json();
        setTeamError(err.error || "Failed to create team.");
      }
    } catch (err) {
      setTeamError("Network error creating team.");
    } finally {
      setLoadingTeam(false);
    }
  };

  // 10. Join a team (Member)
  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLoadingTeam(true);
    setTeamError("");
    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: inviteCode.trim().toUpperCase() }),
      });

      if (res.ok) {
        const data = await res.json();
        setTeam(data.team);
        // Link team ID manually to session
        session.user.team_id = data.team._id;
        session.user.role = "member";
        fetchTeamData();
      } else {
        const err = await res.json();
        setTeamError(err.error || "Invalid invite code.");
      }
    } catch (err) {
      setTeamError("Network error joining team.");
    } finally {
      setLoadingTeam(false);
    }
  };

  // Filter tasks for unified listing & calculate status
  const totalTasksCount = tasks.length;
  const doneTasksCount = tasks.filter((t) => t.status === "done").length;
  const carriedTasksCount = tasks.filter((t) => t.status === "carried").length;
  
  // Calculate average of user-inserted task completion percentages
  const totalPercentage = tasks.reduce((sum, t) => sum + (t.completion_percentage || 0), 0);
  const progressPercent = totalTasksCount > 0 ? Math.round(totalPercentage / totalTasksCount) : 0;

  // Cohort labels split lists (separate items visually by type)
  const standardTasksList = tasks.filter(t => t.type === "task");
  const meetingsList = tasks.filter(t => t.type === "meeting");
  const breaksList = tasks.filter(t => t.type === "break");

  return (
    <AppShell session={session}>
      {/* Upper Title Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for action</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-white leading-none">
            Hey {session?.user?.official_name || session?.user?.name || "Soldier"}, Buckle Up For the Day! 🚀
          </h2>
          <p className="text-muted-foreground mt-2 font-medium">
            Lock in your focus, track daily task blocks, and climb the cohort ranks.
          </p>
        </div>

        {/* Modern Date Input Box */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl border border-border bg-card/30 backdrop-blur-md self-start md:self-auto shrink-0 shadow-lg">
          <Clock className="w-4 h-4 text-primary ml-2" />
          <input
            type="date"
            id="dashboard-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-sm text-foreground font-semibold outline-none py-1 px-2 border-none rounded-lg focus:bg-secondary/40 transition-colors"
          />
        </div>
      </div>

      {/* Dual Tab Switcher Buttons */}
      <div className="flex border-b border-border mb-8">
        <button
          id="tab-productivity"
          onClick={() => setActiveTab("productivity")}
          className={`flex items-center gap-2 py-3.5 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === "productivity"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-white"
          }`}
        >
          <ListChecks className="w-4.5 h-4.5" />
          <span>Productivity Tracker</span>
        </button>

        <button
          id="tab-contest"
          onClick={() => setActiveTab("contest")}
          className={`flex items-center gap-2 py-3.5 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === "contest"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-white"
          }`}
        >
          <Trophy className="w-4.5 h-4.5" />
          <span>Team leaderboard</span>
        </button>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-center gap-2 animate-shake">
          <AlertTriangle className="w-4.5 h-4.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* COHORT 1 TAB: PERSONAL TASK TRACKER */}
      {/* ============================================================== */}
      {activeTab === "productivity" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Board - Left Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Task input header panel */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-primary" />
                <span>Initialize a Task Block</span>
              </h3>
              
              <form onSubmit={handleAddTask} className="space-y-3.5">
                <input
                  id="task-title-input"
                  type="text"
                  placeholder="What is your mission title?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="block w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary text-foreground placeholder-muted-foreground text-sm font-semibold outline-none transition-all"
                  maxLength={60}
                />
                
                <div className="flex flex-wrap items-center justify-between gap-3 bg-background/25 p-2 rounded-xl border border-border/40">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Type Select */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Type:</span>
                      <select
                        id="task-type-select"
                        value={newTaskType}
                        onChange={(e) => setNewTaskType(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-background/80 border border-border text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary transition-all"
                      >
                        <option value="task">💼 Work</option>
                        <option value="break">☕ Break</option>
                        <option value="meeting">🤝 Meeting</option>
                      </select>
                    </div>

                    {/* Priority Select */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Priority:</span>
                      <select
                        id="task-priority-select"
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-background/80 border border-border text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary transition-all"
                      >
                        <option value="high">🔴 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                      </select>
                    </div>

                    {/* Duration Select */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Duration:</span>
                      <select
                        id="task-duration-select"
                        value={newTaskDuration}
                        onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                        className="px-3 py-1.5 rounded-lg bg-background/80 border border-border text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary transition-all"
                      >
                        <option value={15}>15m</option>
                        <option value={30}>30m</option>
                        <option value={45}>45m</option>
                        <option value={60}>1h</option>
                        <option value={90}>1.5h</option>
                        <option value={120}>2h</option>
                      </select>
                    </div>
                  </div>

                  <button
                    id="task-submit-btn"
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-primary/10 transition-all cursor-pointer active:scale-95 ml-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>productivity</span>
                  </button>
                </div>
              </form>

              {/* Task Count Indicator with Warning */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs font-semibold text-muted-foreground">
                  Task Load: <strong className="text-white">{tasks.length}</strong> / 10 limit
                </span>
                {warningMessage && (
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {warningMessage}
                  </span>
                )}
              </div>
            </div>

            {/* List Board Content */}
            <div className="space-y-6">
              {loadingTasks ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-t-primary border-border animate-spin" />
                  <p className="text-sm font-semibold text-muted-foreground">Synchronizing tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="glass p-12 rounded-2xl text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground mx-auto">
                    <ListChecks className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Daily Dashboard Clear</h4>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      No blocks loaded for this date. Enter a title above to initialize your daily focus blocks!
                    </p>
                  </div>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={tasks.map((t) => t._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-6">
                      
                      {/* Section 1: Work Tasks */}
                      {standardTasksList.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2 px-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>Tasks (1–{standardTasksList.length})</span>
                          </h4>
                          <div className="space-y-2">
                            {standardTasksList.map((task, idx) => (
                              <div key={task._id} className="space-y-2">
                                <SortableTaskItem
                                  task={task}
                                  onToggleDone={handleToggleDone}
                                  onCarry={handleCarry}
                                  onDelete={handleDelete}
                                  onUpdate={handleUpdateTask}
                                />
                                {idx === 1 && (
                                  <InteractiveBreakBlock
                                    title="Tea Break 🍵"
                                    durationMinutes={15}
                                    icon={Coffee}
                                  />
                                )}
                                {idx === 2 && (
                                  <InteractiveBreakBlock
                                    title="Lunch Break 🍱"
                                    durationMinutes={30}
                                    icon={Utensils}
                                  />
                                )}
                                {idx === 4 && (
                                  <InteractiveBreakBlock
                                    title="Tea Break 🍵"
                                    durationMinutes={15}
                                    icon={Coffee}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 2: Meetings */}
                      {meetingsList.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 px-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Collaborations & Meetings ({meetingsList.length})</span>
                          </h4>
                          <div className="space-y-2">
                            {meetingsList.map((task) => (
                              <SortableTaskItem
                                key={task._id}
                                task={task}
                                onToggleDone={handleToggleDone}
                                onCarry={handleCarry}
                                onDelete={handleDelete}
                                onUpdate={handleUpdateTask}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 3: Breaks */}
                      {breaksList.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2 px-1">
                            <Coffee className="w-3.5 h-3.5" />
                            <span>Break & Recharge Blocks ({breaksList.length})</span>
                          </h4>
                          <div className="space-y-2">
                            {breaksList.map((task) => (
                              <SortableTaskItem
                                key={task._id}
                                task={task}
                                onToggleDone={handleToggleDone}
                                onCarry={handleCarry}
                                onDelete={handleDelete}
                                onUpdate={handleUpdateTask}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          {/* EOD Report panel - Right Section */}
          <div className="space-y-6">
            
            {/* STREAK WIDGET IN AN ACCENT CARD */}
            <div className="glass-premium p-5 rounded-2xl relative overflow-hidden border-glow flex items-center justify-between">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-orange-500/10 select-none pointer-events-none">
                <Flame className="w-24 h-24" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                  <Flame className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest leading-none">Cohort Streak</span>
                  <h4 className="text-base font-extrabold text-white mt-1">Focus Hotstreak!</h4>
                </div>
              </div>
              <div className="text-right z-10">
                <span className="text-2xl font-black text-orange-500 tracking-tight">{streak} Days</span>
                <p className="text-[9px] font-semibold text-muted-foreground mt-0.5">Consecutive logins</p>
              </div>
            </div>

            {/* EOD SUMMARY CARD */}
            <div className="glass-premium p-6 rounded-2xl space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Award className="w-5.5 h-5.5 text-primary" />
                  <span>Daily EOD Summary</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Calculate and submit your daily productivity report to lock in your score and compete on the leaderboard!
                </p>
              </div>

              {/* Progress metrics */}
              <div className="p-4 rounded-xl bg-background/50 border border-border/60 space-y-4">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-muted-foreground">Productivity Progress</span>
                  <span className="text-primary font-bold">{progressPercent}%</span>
                </div>
                
                <CustomProgress value={progressPercent} />
                
                <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 font-medium">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <p className="font-extrabold text-lg">{doneTasksCount}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 uppercase">Done</p>
                  </div>
                  
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <p className="font-extrabold text-lg">{carriedTasksCount}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 uppercase">Carried</p>
                  </div>

                  <div className="p-2 rounded-lg bg-secondary border border-border text-white">
                    <p className="font-extrabold text-lg">{totalTasksCount}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 uppercase">Total</p>
                  </div>
                </div>
              </div>

              {/* Submit EOD Trigger */}
              <button
                id="submit-eod-btn"
                disabled={totalTasksCount === 0 || eodSubmitted}
                onClick={handleSubmitEod}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
              >
                {eodSubmitted ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>EOD Report Locked 🔒</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit End-Of-Day 🏁</span>
                  </>
                )}
              </button>

              {/* Dynamic motivational feedback card */}
              {eodSubmitted && eodReport && (
                <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <span className="font-extrabold text-white text-sm">Report Locked In!</span>
                  </div>
                  
                  <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                    {eodMessage}
                  </p>

                  <div className="pt-3 border-t border-border/60 flex justify-between items-center text-[10px] text-muted-foreground font-bold">
                    <span>DATE: {eodReport.date}</span>
                    <span className="text-primary">{eodReport.productivity_percentage}% SCORE</span>
                  </div>

                  <button
                    onClick={() => setEodSubmitted(false)}
                    className="w-full mt-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground hover:text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    title="Unlock to update EOD report after adding or editing tasks"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Unlock EOD Submission</span>
                  </button>
                </div>
              )}
            </div>

            {/* POMODORO TIMER CARD */}
            <div className="glass-premium p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-primary animate-pulse" />
                  <h3 className="text-base font-bold text-white">Pomodoro Focus Timer</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                  pomodoroMode === "focus"
                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                    : "bg-teal-500/10 border border-teal-500/20 text-teal-400"
                }`}>
                  {pomodoroMode === "focus" ? "Focusing 🎯" : "Recharging ☕"}
                </span>
              </div>

              {/* Time display & Circle ring representation */}
              <div className="flex flex-col items-center justify-center py-4 bg-background/30 rounded-xl border border-border/40 relative">
                <span className="text-4xl font-black tracking-widest text-foreground font-mono select-none">
                  {Math.floor(pomodoroTime / 60).toString().padStart(2, "0")}
                  <span className="animate-pulse">:</span>
                  {(pomodoroTime % 60).toString().padStart(2, "0")}
                </span>
                
                {/* Active Focus Task label */}
                {focusTaskId && (
                  <p className="text-[10px] text-primary font-bold mt-2 truncate max-w-[200px] text-center">
                    🎯 Focusing on: {tasks.find(t => t._id === focusTaskId)?.title || "Selected Task"}
                  </p>
                )}
              </div>

              {/* Timer selector buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    setPomodoroActive(false);
                    setPomodoroMode("focus");
                    setPomodoroTime(1500); // 25 min
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    pomodoroMode === "focus" 
                      ? "bg-primary text-white" 
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  25m Focus
                </button>
                <button
                  onClick={() => {
                    setPomodoroActive(false);
                    setPomodoroMode("short_break");
                    setPomodoroTime(300); // 5 min
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    pomodoroMode === "short_break" 
                      ? "bg-primary text-white" 
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  5m Break
                </button>
                <button
                  onClick={() => {
                    setPomodoroActive(false);
                    setPomodoroMode("long_break");
                    setPomodoroTime(900); // 15 min
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    pomodoroMode === "long_break" 
                      ? "bg-primary text-white" 
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  15m Rest
                </button>
              </div>

              {/* Focus Task Dropdown selector */}
              {tasks.filter(t => t.status === "pending").length > 0 && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Link Timer to Task:</label>
                  <select
                    value={focusTaskId}
                    onChange={(e) => setFocusTaskId(e.target.value)}
                    className="block w-full px-3 py-2 rounded-lg bg-background/50 border border-border text-xs font-semibold text-foreground outline-none cursor-pointer"
                  >
                    <option value="">-- No linked task --</option>
                    {tasks.filter(t => t.status === "pending").map(task => (
                      <option key={task._id} value={task._id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Play/Pause control buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setPomodoroActive(!pomodoroActive)}
                  className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    pomodoroActive 
                      ? "bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/10" 
                      : "bg-primary hover:bg-primary/90 shadow-md shadow-primary/10"
                  }`}
                >
                  {pomodoroActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Session</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Focusing</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setPomodoroActive(false);
                    setPomodoroTime(pomodoroMode === "focus" ? 1500 : pomodoroMode === "short_break" ? 300 : 900);
                  }}
                  className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-all cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* DAILY REFLECTION PAD */}
            <div className="glass-premium p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-white">Daily Focus Reflection</h3>
              </div>

              <textarea
                value={reflection}
                onChange={(e) => {
                  setReflection(e.target.value);
                  localStorage.setItem("kaam_reflection_" + date, e.target.value);
                }}
                placeholder="What did you conquer today? Any blockers or strategic breakthroughs?"
                className="w-full h-24 p-3 rounded-xl bg-background/50 border border-border focus:border-primary text-foreground text-xs font-semibold outline-none transition-all resize-none placeholder-muted-foreground"
              />

              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                <span>Auto-saves to calendar</span>
                <span className="text-primary font-black uppercase">Draft mode</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* COHORT 2 TAB: TEAM LEADERBOARD & SETUP */}
      {/* ============================================================== */}
      {activeTab === "contest" && (
        <div className="space-y-8">
          
          {/* A. If not in a team, show Setup Panel */}
          {!session.user.team_id ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* Form 1: Create Team */}
              <div className="glass p-8 rounded-2xl flex flex-col justify-between border-glow">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">Create a Team Cohort</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Initialize a team. You will become the <strong>Warden / Manager</strong>, and will be able to invite members and view their work blocks.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateTeam} className="mt-8 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="team-name-input" className="text-xs font-bold text-muted-foreground">Team Name</label>
                    <input
                      id="team-name-input"
                      type="text"
                      required
                      placeholder="e.g. Apex Predators"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="block w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary text-foreground placeholder-muted-foreground outline-none transition-all text-sm font-semibold"
                    />
                  </div>
                  <button
                    id="create-team-btn"
                    type="submit"
                    disabled={loadingTeam}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-sm transition-all cursor-pointer shadow-lg shadow-primary/20 active:scale-[0.98]"
                  >
                    {loadingTeam ? "Initializing..." : "Register Team (Warden) 👑"}
                  </button>
                </form>
              </div>

              {/* Form 2: Join Team */}
              <div className="glass p-8 rounded-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">Join a Team</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Enter the 6-character alphanumeric invite code shared by your Warden to join their competitive cohort.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleJoinTeam} className="mt-8 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="team-code-input" className="text-xs font-bold text-muted-foreground">Invite Code</label>
                    <input
                      id="team-code-input"
                      type="text"
                      required
                      placeholder="e.g. AB12XY"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="block w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary text-foreground placeholder-muted-foreground outline-none transition-all text-sm font-semibold tracking-wider text-center uppercase"
                      maxLength={6}
                    />
                  </div>
                  <button
                    id="join-team-btn"
                    type="submit"
                    disabled={loadingTeam}
                    className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-white font-extrabold text-sm transition-all cursor-pointer active:scale-[0.98]"
                  >
                    {loadingTeam ? "Validating..." : "Join Squad ⚔️"}
                  </button>
                </form>
              </div>

              {teamError && (
                <div className="md:col-span-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold text-center">
                  {teamError}
                </div>
              )}
            </div>
          ) : (
            
            // B. If in a team, show Team Leaderboard!
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Team Leaderboard - Left 2 Columns */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass p-6 rounded-2xl">
                  <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <span>Daily Productivity Contest</span>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Live cohort scores based on submitted EOD percentages for {date}.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-wider">
                      {team?.name}
                    </span>
                  </div>

                  {loadingTeam ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <div className="w-8 h-8 rounded-full border-2 border-t-primary border-border animate-spin" />
                      <p className="text-sm font-semibold text-muted-foreground">Calculating leaderboard...</p>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <p className="text-sm font-semibold text-muted-foreground text-center py-8">
                      No members present in this cohort.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {teamMembers.map((member, idx) => {
                        const percent = member.eod ? member.eod.productivity_percentage : 0;
                        const hasSubmitted = !!member.eod;
                        
                        // Rank badges for top 3
                        let rankBadge = null;
                        if (idx === 0) rankBadge = "🥇";
                        else if (idx === 1) rankBadge = "🥈";
                        else if (idx === 2) rankBadge = "🥉";
                        else rankBadge = `#${idx + 1}`;

                        const isWarden = member.role === "manager";
                        const isSelf = member.id === session.user.id;

                        return (
                          <div 
                            key={member.id} 
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${
                              isSelf 
                                ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" 
                                : "bg-card/30 border-border/80"
                            }`}
                          >
                            {/* Member Name */}
                            <div className="flex items-center gap-3.5 min-w-0">
                              <span className="text-base font-bold select-none shrink-0 w-8 text-center text-muted-foreground">
                                {rankBadge}
                              </span>
                              
                              <div className="w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center text-white font-extrabold text-sm select-none">
                                {member.official_name.slice(0, 2).toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-sm text-foreground truncate">
                                    {member.official_name}
                                  </p>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[8px] font-extrabold text-primary uppercase">
                                      You
                                    </span>
                                  )}
                                  {isWarden && (
                                    <span className="inline-flex items-center gap-0.5 px-1 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-extrabold text-amber-500 uppercase tracking-wider">
                                      Warden
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5 font-medium truncate">
                                  {member.email}
                                </p>
                              </div>
                            </div>

                            {/* Productivity score progress */}
                            <div className="flex-1 max-w-md space-y-1 sm:self-center">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className={hasSubmitted ? "text-primary" : "text-muted-foreground"}>
                                  {hasSubmitted ? "Report Locked" : "Still working..."}
                                </span>
                                <span className="text-foreground">{percent}%</span>
                              </div>
                              <CustomProgress value={percent} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Cohort detail panel - Right Column */}
              <div className="space-y-6">
                <div className="glass-premium p-6 rounded-2xl space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <QrCode className="w-5.5 h-5.5 text-primary" />
                      <span>Cohort Registration</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Deploy this invite code to add other members to your leaderboard.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-background/50 border border-border/80 text-center space-y-2">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      Share Invite Code
                    </p>
                    <p className="font-extrabold text-2xl tracking-widest text-primary font-mono select-all">
                      {team?.invite_code}
                    </p>
                  </div>

                  <div className="space-y-4 text-xs font-semibold leading-relaxed text-muted-foreground border-t border-border/60 pt-4">
                    <p className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>EOD report submissions instantly updates this competitive grid.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Wardens can view all active and read-only member boards within the <strong>Team page</strong>.</span>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
