"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { 
  Users, 
  ShieldCheck, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Coffee, 
  Briefcase,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  Trophy,
  Activity,
  User,
  ExternalLink,
  PlusCircle,
  QrCode
} from "lucide-react";

// Local Custom Progress Bar
function CustomProgress({ value, className = "" }) {
  return (
    <div className={`w-full bg-secondary/80 h-2.5 rounded-full overflow-hidden border border-border/10 ${className}`}>
      <div 
        className="bg-gradient-to-r from-primary to-indigo-500 h-full transition-all duration-700 ease-out rounded-full shadow-[0_0_8px_rgba(139,92,246,0.3)]" 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export default function TeamClient({ session }) {
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [weeklyRankings, setWeeklyRankings] = useState([]);
  const [monthlyRankings, setMonthlyRankings] = useState([]);
  const [topWeekly, setTopWeekly] = useState(null);
  const [topMonthly, setTopMonthly] = useState(null);
  
  // Active date for task inspection
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  
  // Selected member to inspect tasks
  const [selectedMemberId, setSelectedMemberId] = useState("");
  
  // Team actions
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isWarden = session?.user?.role === "manager";
  const teamId = session?.user?.team_id;

  const fetchTeamAndStats = async () => {
    if (!teamId) return;
    setLoading(true);
    setError("");

    try {
      // 1. Fetch team members and their today's tasks
      const membersRes = await fetch(`/api/teams/${teamId}/members?date=${date}`);
      // 2. Fetch weekly/monthly leaderboards
      const statsRes = await fetch(`/api/teams/${teamId}/leaderboard?date=${date}`);

      if (membersRes.ok && statsRes.ok) {
        const membersData = await membersRes.json();
        const statsData = await statsRes.json();

        setTeam(membersData.team);
        setMembers(membersData.members);
        
        setWeeklyRankings(statsData.weekly);
        setMonthlyRankings(statsData.monthly);
        setTopWeekly(statsData.topWeekly);
        setTopMonthly(statsData.topMonthly);

        // Pre-select first non-warden member to inspect by default if present
        if (membersData.members.length > 0 && !selectedMemberId) {
          const firstMember = membersData.members.find(m => m.id !== session.user.id);
          if (firstMember) {
            setSelectedMemberId(firstMember.id);
          } else {
            setSelectedMemberId(membersData.members[0].id);
          }
        }
      } else {
        setError("Failed to synchronize team stats.");
      }
    } catch (err) {
      setError("Network error fetching team statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchTeamAndStats();
    }
  }, [teamId, date]);

  // Handle Team Creation
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        session.user.team_id = data.team._id;
        session.user.role = "manager";
        window.location.reload();
      } else {
        const err = await res.json();
        setError(err.error || "Failed to create team.");
      }
    } catch (err) {
      setError("Network error creating team.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Team Joining
  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: inviteCode.trim().toUpperCase() }),
      });

      if (res.ok) {
        const data = await res.json();
        session.user.team_id = data.team._id;
        session.user.role = "member";
        window.location.reload();
      } else {
        const err = await res.json();
        setError(err.error || "Invalid invite code.");
      }
    } catch (err) {
      setError("Network error joining team.");
    } finally {
      setLoading(false);
    }
  };

  // Get selected member details for task inspection
  const activeInspectMember = members.find(m => m.id === selectedMemberId);

  // Type configs for inspector
  const taskTypeConfig = {
    task: { badge: "Work", color: "bg-indigo-500/15 border-indigo-500/20 text-indigo-400", icon: Briefcase },
    break: { badge: "Break", color: "bg-teal-500/15 border-teal-500/20 text-teal-400", icon: Coffee },
    meeting: { badge: "Meeting", color: "bg-amber-500/15 border-amber-500/20 text-amber-400", icon: Clock },
  };

  return (
    <AppShell session={session}>
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide">
            <Users className="w-3.5 h-3.5" />
            <span>Team</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-white leading-none">
            {isWarden ? "Warden Oversight Dashboard 👑" : "team space 🤝"}
          </h2>
          <p className="text-muted-foreground mt-2 font-medium">
            {isWarden 
              ? "Inspect members' dashboards in real-time, aggregate scores, and view weekly productivity awards."
              : "View team stats, invite links, and competitive productivity records."}
          </p>
        </div>

        {teamId && (
          <div className="flex items-center gap-2 p-1.5 rounded-xl border border-border bg-card/30 backdrop-blur-md self-start md:self-auto shrink-0 shadow-lg">
            <Calendar className="w-4 h-4 text-primary ml-2" />
            <input
              type="date"
              id="team-inspect-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-sm text-foreground font-semibold outline-none py-1 px-2 border-none rounded-lg focus:bg-secondary/40 transition-colors"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center gap-2 animate-shake">
          <AlertTriangle className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. NOT REGISTERED IN A TEAM */}
      {/* ============================================================== */}
      {!teamId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Team */}
          <div className="glass p-8 rounded-2xl flex flex-col justify-between border-glow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-foreground">Create a Team Cohort</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Initialize a team. You will become the <strong>Warden / Manager</strong>, and will be able to invite members and inspect their active lists.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTeam} className="mt-8 space-y-4">
              <div className="space-y-2">
                <label htmlFor="team-create-name" className="text-xs font-bold text-muted-foreground">Team Name</label>
                <input
                  id="team-create-name"
                  type="text"
                  required
                  placeholder="e.g. Apex Predators"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="block w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary text-foreground placeholder-muted-foreground outline-none transition-all text-sm font-semibold"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-sm transition-all cursor-pointer shadow-lg shadow-primary/20"
              >
                {loading ? "Initializing..." : "Register Team (Warden) 👑"}
              </button>
            </form>
          </div>

          {/* Join Team */}
          <div className="glass p-8 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-foreground">Join a Team</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Enter the 6-character alphanumeric invite code shared by your Warden to join their competitive cohort.
                </p>
              </div>
            </div>

            <form onSubmit={handleJoinTeam} className="mt-8 space-y-4">
              <div className="space-y-2">
                <label htmlFor="team-join-code" className="text-xs font-bold text-muted-foreground">Invite Code</label>
                <input
                  id="team-join-code"
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
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-white font-extrabold text-sm transition-all cursor-pointer"
              >
                {loading ? "Validating..." : "Join Squad ⚔️"}
              </button>
            </form>
          </div>
        </div>
      ) : (

        // ==============================================================
        // 2. ACTIVE TEAM REGISTERED
        // ==============================================================
        <div className="space-y-8 animate-fade-in">
          
          {/* Team Details & Invite Banner */}
          <div className="glass-premium p-6 rounded-2xl border-glow flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Users className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight flex items-center gap-2">
                  <span>{team?.name || "Loading squad..."}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                    isWarden 
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-500" 
                      : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                  }`}>
                    {isWarden ? "Warden 👑" : "Squad Member ⚔️"}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {isWarden 
                    ? "You are managing this squad. Copy the invite code to invite team members."
                    : "Work hard, collaborate with your cohort, and win weekly awards."}
                </p>
              </div>
            </div>

            {/* Invite Code Panel */}
            <div className="flex items-center gap-3 bg-background/50 border border-border p-2.5 rounded-xl self-start md:self-auto shrink-0 animate-pulse-slow">
              <div className="px-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Cohort Invite Code</p>
                <p className="text-xl font-black text-primary tracking-wider mt-1">{team?.invite_code || "------"}</p>
              </div>
              <button
                onClick={() => {
                  if (team?.invite_code) {
                    navigator.clipboard.writeText(team.invite_code);
                    const btn = document.getElementById("copy-invite-btn");
                    if (btn) {
                      btn.textContent = "Copied! ✓";
                      btn.classList.add("bg-emerald-500/20", "text-emerald-400", "border-emerald-500/30");
                      setTimeout(() => {
                        btn.textContent = "Copy Code";
                        btn.classList.remove("bg-emerald-500/20", "text-emerald-400", "border-emerald-500/30");
                      }, 2000);
                    }
                  }
                }}
                id="copy-invite-btn"
                className="px-3.5 py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                Copy Code
              </button>
            </div>
          </div>

          {/* A. Top Performer Awards Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Weekly Award */}
            <div className="glass-premium p-6 rounded-2xl relative overflow-hidden border-glow">
              {/* background decoration */}
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-primary/10 select-none pointer-events-none">
                <Trophy className="w-40 h-40" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Trophy className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none">Weekly Productive Award</span>
                  <h4 className="text-lg font-bold text-foreground mt-1">Employee of the Week</h4>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-extrabold text-base border border-border">
                  {topWeekly ? topWeekly.official_name.slice(0,2).toUpperCase() : "?"}
                </div>
                <div>
                  <p className="font-extrabold text-base text-foreground">
                    {topWeekly ? topWeekly.official_name : "No awards calculated yet"}
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    {topWeekly ? `⭐ Outstanding average: ${topWeekly.average}% score` : "Aggregating past 7 days reports..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Monthly Award */}
            <div className="glass-premium p-6 rounded-2xl relative overflow-hidden">
              {/* background decoration */}
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-violet-500/10 select-none pointer-events-none">
                <Award className="w-40 h-40" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                  <Award className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest leading-none">Monthly Productive Award</span>
                  <h4 className="text-lg font-bold text-foreground mt-1">Employee of the Month</h4>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-extrabold text-base border border-border">
                  {topMonthly ? topMonthly.official_name.slice(0,2).toUpperCase() : "?"}
                </div>
                <div>
                  <p className="font-extrabold text-base text-foreground">
                    {topMonthly ? topMonthly.official_name : "No awards calculated yet"}
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    {topMonthly ? `⭐ Outstanding average: ${topMonthly.average}% score` : "Aggregating past 30 days reports..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* B. Warden Inspector Panel & Historical Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 1 Column: Member Selector List */}
            <div className="glass p-6 rounded-2xl space-y-6 self-start">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Inspect Cohort Members</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select a member below to inspect their daily productivity board in real-time.
                </p>
              </div>

              <div className="space-y-2">
                {members.map(member => {
                  const isSelected = member.id === selectedMemberId;
                  const isMemberWarden = member.role === "manager";
                  const isSelf = member.id === session.user.id;

                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMemberId(member.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all group cursor-pointer ${
                        isSelected 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/10" 
                          : "bg-background/40 border-border/80 hover:border-primary/40 hover:bg-secondary/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                          isSelected ? "bg-white/20 text-white" : "bg-secondary text-white"
                        }`}>
                          {member.official_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`font-bold text-sm truncate ${isSelected ? "text-white" : "text-foreground"}`}>
                              {member.official_name}
                            </p>
                            {isMemberWarden && (
                              <span className={`px-1 py-0.5 rounded text-[7px] font-extrabold uppercase shrink-0 ${
                                isSelected ? "bg-white/20 text-white" : "bg-amber-500/15 text-amber-500 border border-amber-500/10"
                              }`}>
                                Warden
                              </span>
                            )}
                          </div>
                          <p className={`text-[10px] truncate mt-0.5 font-medium ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? "text-white translate-x-0.5" : "text-muted-foreground group-hover:text-foreground"
                      }`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right 2 Columns: Selected Member Inspector Grid (Warden Only View) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Daily Board Inspect Card */}
              <div className="glass p-6 rounded-2xl">
                {activeInspectMember ? (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Header showing inspected user */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white">
                            Focus Board: {activeInspectMember.official_name}
                          </h3>
                          {activeInspectMember.id === session.user.id && (
                            <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-extrabold text-primary uppercase">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Viewing registered task blocks for {date}.
                        </p>
                      </div>

                      {/* Score Badge */}
                      <div className="p-2.5 rounded-xl bg-secondary/80 border border-border/80 text-center shrink-0 min-w-[100px]">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Productivity Score</p>
                        <p className="font-extrabold text-xl text-primary mt-0.5">
                          {activeInspectMember.eod ? `${activeInspectMember.eod.productivity_percentage}%` : "No EOD yet"}
                        </p>
                      </div>
                    </div>

                    {/* Inspected user's list */}
                    {!isWarden ? (
                      <div className="p-8 text-center text-sm font-semibold text-muted-foreground border border-dashed border-border/60 rounded-xl bg-background/20">
                        🔒 Detailed daily lists inspection is restricted to the team Warden.
                      </div>
                    ) : !activeInspectMember.tasks || activeInspectMember.tasks.length === 0 ? (
                      <div className="p-8 text-center text-sm font-medium text-muted-foreground border border-dashed border-border/60 rounded-xl bg-background/20">
                        No active task blocks loaded by this user for {date}.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeInspectMember.tasks.map((task) => {
                          const isDone = task.status === "done";
                          const isCarried = task.status === "carried";
                          
                          const config = taskTypeConfig[task.type] || taskTypeConfig.task;
                          const Icon = config.icon;

                          return (
                            <div
                              key={task._id}
                              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                                isDone 
                                  ? "bg-secondary/15 border-border/40 opacity-75"
                                  : isCarried
                                  ? "bg-secondary/5 border-dashed border-border/60 opacity-60"
                                  : "bg-background/40 border-border/80"
                              }`}
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                  isDone 
                                    ? "bg-primary border-primary text-white" 
                                    : "border-muted-foreground/30 text-transparent"
                                }`}>
                                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>

                                <div className="min-w-0">
                                  <p className={`font-semibold text-xs leading-snug truncate ${
                                    isDone ? "line-through text-muted-foreground" : "text-foreground"
                                  }`}>
                                    {task.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8px] font-extrabold uppercase tracking-wider ${config.color}`}>
                                      <Icon className="w-2.5 h-2.5" />
                                      {config.badge}
                                    </span>
                                    {isCarried && (
                                      <span className="px-1.5 py-0.5 rounded bg-secondary border border-border text-[8px] font-extrabold text-muted-foreground uppercase tracking-wider">
                                        Carried
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                isDone ? "text-emerald-400" : isCarried ? "text-muted-foreground" : "text-amber-400"
                              }`}>
                                {task.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                ) : (
                  <p className="text-sm font-semibold text-muted-foreground text-center py-12">
                    Please select a member to inspect.
                  </p>
                )}
              </div>

              {/* 2. Historical Aggregates Leaderboard list */}
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span>Historical Average Leaderboards</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Weekly Averages List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 border-b border-border/40 pb-2">
                      Weekly Rank (Past 7 Days)
                    </h4>
                    
                    {weeklyRankings.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">No weekly scores calculated.</p>
                    ) : (
                      <div className="space-y-2">
                        {weeklyRankings.map((rank, idx) => (
                          <div key={rank.user_id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-background/30 border border-border/40">
                            <span className="font-bold text-foreground">{idx + 1}. {rank.official_name}</span>
                            <span className="font-extrabold text-primary">{rank.average}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Monthly Averages List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 border-b border-border/40 pb-2">
                      Monthly Rank (Past 30 Days)
                    </h4>
                    
                    {monthlyRankings.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">No monthly scores calculated.</p>
                    ) : (
                      <div className="space-y-2">
                        {monthlyRankings.map((rank, idx) => (
                          <div key={rank.user_id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-background/30 border border-border/40">
                            <span className="font-bold text-foreground">{idx + 1}. {rank.official_name}</span>
                            <span className="font-extrabold text-primary">{rank.average}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 3. Team-wide Productivity Overview */}
          <div className="glass p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-card/50 to-primary/5 border border-primary/20 space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary animate-pulse" />
                  <span>Team Overall Productivity Status</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Aggregated real-time metrics for all team members active today.
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="p-3.5 rounded-xl bg-background/50 border border-border/80 text-center shrink-0 min-w-[120px]">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Users Active</span>
                  <span className="text-2xl font-black text-white">{members.length}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-center shrink-0 min-w-[150px]">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">Team Productivity</span>
                  <span className="text-2xl font-black text-primary">
                    {members.filter(m => m.eod !== null).length > 0
                      ? Math.round(
                          members.filter(m => m.eod !== null).reduce((sum, m) => sum + m.eod.productivity_percentage, 0) /
                          members.filter(m => m.eod !== null).length
                        )
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </AppShell>
  );
}
