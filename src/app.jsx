import { useState } from "react";
const FORMATS = ["Individual", "Best Ball", "Alt Shot", "Shamble"];
const TOTAL_REGULAR_WEEKS = 10;
const PLAYOFF_WEEKS = [
 { week: 11, label: "Quarterfinals" },
 { week: 12, label: "Semifinals" },
 { week: 13, label: "Championship" },
];
const INITIAL_ROSTER = [
 { id: 1, name: "Alex Martin", handicap: 10, wins: 1, losses: 3, ties: 0, points: 2, appearances: 4, formatStats: { Individual: 0, "Best Ball": 1, "Alt Shot": 1, Shamble: 2 }, available: true },
 { id: 2, name: "Chase Jarvis", handicap: 10, wins: 2, losses: 1, ties: 1, points: 5, appearances: 5, formatStats: { Individual: 1, "Best Ball": 2, "Alt Shot": 1, Shamble: 1 }, available: true },
 { id: 3, name: "Colton Dades", handicap: 10, wins: 1, losses: 2, ties: 1, points: 3, appearances: 3, formatStats: { Individual: 2, "Best Ball": 1, "Alt Shot": 0, Shamble: 0 }, available: true },
 { id: 4, name: "Dan Gallagher", handicap: 10, wins: 0, losses: 6, ties: 0, points: 0, appearances: 5, formatStats: { Individual: 2, "Best Ball": 1, "Alt Shot": 1, Shamble: 1 }, available: true },
 { id: 5, name: "David Totten", handicap: 10, wins: 0, losses: 6, ties: 0, points: 0, appearances: 5, formatStats: { Individual: 2, "Best Ball": 2, "Alt Shot": 0, Shamble: 1 }, available: true },
 { id: 6, name: "Erik Severson", handicap: 10, wins: 1, losses: 4, ties: 0, points: 2, appearances: 4, formatStats: { Individual: 1, "Best Ball": 0, "Alt Shot": 1, Shamble: 2 }, available: true },
 { id: 7, name: "Jake Drier", handicap: 10, wins: 3, losses: 5, ties: 1, points: 7, appearances: 5, formatStats: { Individual: 1, "Best Ball": 2, "Alt Shot": 1, Shamble: 1 }, available: true },
 { id: 8, name: "Josiah Johnson", handicap: 10, wins: 2, losses: 3, ties: 0, points: 4, appearances: 5, formatStats: { Individual: 2, "Best Ball": 1, "Alt Shot": 1, Shamble: 1 }, available: true },
 { id: 9, name: "Mike Dades", handicap: 10, wins: 2, losses: 4, ties: 0, points: 4, appearances: 3, formatStats: { Individual: 0, "Best Ball": 1, "Alt Shot": 0, Shamble: 2 }, available: true },
 { id: 10, name: "Tyler Kalberg", handicap: 10, wins: 4, losses: 4, ties: 1, points: 9, appearances: 5, formatStats: { Individual: 1, "Best Ball": 1, "Alt Shot": 2, Shamble: 1 }, available: true },
];
const winPct = (p) => {
 const total = p.wins + p.losses + (p.ties || 0);
 return total === 0 ? 0 : Math.round((p.wins + (p.ties || 0) * 0.5) / total * 100);
};
const hcpColor = (h) => h <= 5 ? "#4ade80" : h <= 12 ? "#facc15" : "#f87171";
const recordStr = (p) => p.ties ? `${p.wins}-${p.losses}-${p.ties}` : `${p.wins}-${p.losses}`;
const S = {
 input: { background: "#0a1628", border: "1px solid #2a4a6b", color: "#e8dfc8", padding: "8px 12px", borderRadius: 6, fontSize: 13, fontFamily: "Georgia, serif", outline: "none" },
 btnGreen: { background: "#1a4a2e", border: "1px solid #4a9a6b", color: "#4ade80", padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif" },
 btnGhost: { background: "transparent", border: "1px solid #2a4a6b", color: "#7a9ab8", padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif" },
 btnTiny: { background: "transparent", border: "1px solid #1e3d5a", color: "#7a9ab8", padding: "5px 11px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontFamily: "Georgia, serif" },
};
const TABS = ["Schedule", "Roster", "Matchups", "Results"];
const allWeeks = [
 ...Array.from({ length: TOTAL_REGULAR_WEEKS }, (_, i) => ({ week: i + 1, label: `Wk ${i + 1}`, playoff: false })),
 ...PLAYOFF_WEEKS.map(p => ({ week: p.week, label: p.label.slice(0, 6), playoff: true })),
];
export default function App() {
 const [tab, setTab] = useState("Schedule");
 const [roster, setRoster] = useState(INITIAL_ROSTER);
 const [currentWeek, setCurrentWeek] = useState(1);
 const [weekData, setWeekData] = useState({});
 const [aiLoading, setAiLoading] = useState(false);
 const [showAdd, setShowAdd] = useState(false);
 const [newP, setNewP] = useState({ name: "", handicap: "", wins: 0, losses: 0, ties: 0, available: true });
 const [editingId, setEditingId] = useState(null);
 const [editP, setEditP] = useState({});
 const [toast, setToast] = useState("");
 const [rosterView, setRosterView] = useState("current");
 const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };
 const isPlayoff = currentWeek > TOTAL_REGULAR_WEEKS;
 const playoffInfo = PLAYOFF_WEEKS.find(p => p.week === currentWeek);
 const weekLabel = isPlayoff ? playoffInfo?.label : `Week ${currentWeek}`;
 const getWD = (w) => weekData[w] || { matchups: [], approved: [], results: [], aiRationale: "", format: FORMATS[0] };
 const setWD = (w, upd) => setWeekData(prev => ({ ...prev, [w]: { ...getWD(w), ...upd } }));
 const wd = getWD(currentWeek);
 const availPlayers = roster.filter(p => p.available);
 const seeded = [...roster].sort((a, b) => b.points - a.points || winPct(b) - winPct(a));
 const toggleAvail = (id) => setRoster(r => r.map(p => p.id === id ? { ...p, available: !p.available } : p));
 const addPlayer = () => {
 if (!newP.name || newP.handicap === "") return;
 setRoster(r => [...r, { ...newP, id: Date.now(), handicap: +newP.handicap, wins: +newP.wins || 0, losses: +newP.losses || 0, ties: +newP.ties || 0, points: 0, appearances: 0, formatStats: { Individual: 0, "Best Ball": 0, "Alt Shot": 0, Shamble: 0 } }]);
 setNewP({ name: "", handicap: "", wins: 0, losses: 0, ties: 0, available: true });
 setShowAdd(false);
 notify("Player added.");
 };
 const removePlayer = (id) => { setRoster(r => r.filter(p => p.id !== id)); notify("Player removed."); };
 const saveEdit = () => {
 setRoster(r => r.map(p => p.id === editingId ? { ...p, ...editP, handicap: +editP.handicap, wins: +editP.wins || 0, losses: +editP.losses || 0, ties: +editP.ties || 0 } : p));
 setEditingId(null);
 notify("Player updated.");
 };
 // ── AI matchup generation — calls /api/matchups server route ──
 const generateMatchups = async () => {
 if (availPlayers.length < 2) return;
 setAiLoading(true);
 setWD(currentWeek, { matchups: [], aiRationale: "" });
 const playersForPrompt = availPlayers.map(p => ({
 name: p.name, handicap: p.handicap,
 record: recordStr(p), points: p.points, winPct: winPct(p) + "%",
 lastSeasonFormatAppearances: p.formatStats,
 }));
 const playoffContext = isPlayoff
 ? `This is a PLAYOFF round: ${playoffInfo?.label}. Seed players by points — top vs bottom seeds. Seedings: ${seeded.map((p, i) => `#${i + 1} ${p.name} (${p.points}pts)`).join(", ")}.`
 : `Regular season ${weekLabel} of ${TOTAL_REGULAR_WEEKS}. Avoid repeat matchups where possible.`;
 const prompt = `You are a golf league captain's assistant for a 10-player league. ${playoffContext}
This week's format: "${wd.format}"
Available players: ${JSON.stringify(playersForPrompt, null, 2)}
Format rules:
- Individual: rank players into flights by handicap.
- Best Ball (2v2): pair strong+weak handicap teammates, match teams by avg handicap.
- Alt Shot (2v2): same logic as Best Ball; Alt Shot rewards chemistry.
- Shamble: balanced teams of 3-5 with equal avg handicap.
Consider last season format appearances for variety across the season.
Respond ONLY with valid JSON, no markdown:
{
 "matchups": [{ "label": "Match 1", "players": ["Name A", "Name B"] }],
 "rationale": "2-3 sentences."
}
For team formats use "teamA": [...] and "teamB": [...] instead of "players".`;
 try {
 const res = await fetch("/api/matchups", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ prompt }),
 });
 const data = await res.json();
 if (data.error) throw new Error(data.error);
 setWD(currentWeek, { matchups: data.matchups || [], aiRationale: data.rationale || "" });
 } catch (e) {
 setWD(currentWeek, { aiRationale: `Error: ${e.message || "Could not generate suggestions. Please try again."}` });
 }
 setAiLoading(false);
 };
 const approveMatchup = (m) => {
 setWD(currentWeek, {
 matchups: wd.matchups.filter(x => x.label !== m.label),
 approved: [...wd.approved, { ...m, week: currentWeek, weekLabel, format: wd.format, date: new Date().toLocaleDateString() }],
 });
 notify(`${m.label} approved!`);
 };
 const rejectMatchup = (m) => {
 setWD(currentWeek, { matchups: wd.matchups.filter(x => x.label !== m.label) });
 notify(`${m.label} removed.`);
 };
 const recordResult = (matchup, result) => {
 setWD(currentWeek, {
 approved: wd.approved.filter(m => !(m.label === matchup.label && m.date === matchup.date)),
 results: [...wd.results, { ...matchup, result, recordedAt: new Date().toLocaleDateString() }],
 });
 if (matchup.players?.length === 2) {
 const winner = result === "Halved" ? null : result;
 const loser = winner ? matchup.players.find(n => n !== winner) : null;
 setRoster(r => r.map(p => {
 if (p.name === winner) return { ...p, wins: p.wins + 1, points: p.points + 1 };
 if (p.name === loser) return { ...p, losses: p.losses + 1 };
 if (result === "Halved" && matchup.players.includes(p.name)) return { ...p, ties: (p.ties || 0) + 1, points: p.points + 0.5 };
 return p;
 }));
 }
 notify("Result recorded & standings updated.");
 };
 const allResults = Object.entries(weekData).flatMap(([, d]) => d.results || []);
 return (
 <div style={{ minHeight: "100vh", background: "#0a1628", fontFamily: "Georgia, serif", color: "#e8dfc8" }}>
 {/* Header */}
 <div style={{ background: "linear-gradient(135deg, #0d2137, #163050, #0a1628)", borderBottom: "1px solid #2a4a6b", padding: "env(safe-area-inset-top, 0px) 0 0", }}>
 <div style={{ padding: "18px 20px 0" }}>
 <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
 <span style={{ fontSize: 24 }}> </span>
 <div>
 <div style={{ fontSize: 17, fontWeight: "bold", letterSpacing: 1, color: "#f0e6c8" }}>LEAGUE CAPTAIN</div>
 <div style={{ fontSize: 9, letterSpacing: 2.5, color: "#7a9ab8" }}>GOLF ROSTER & MATCHUP MANAGER</div>
 </div>
 <div style={{ marginLeft: "auto", display: "flex", gap: 14, fontSize: 10, color: "#7a9ab8" }}>
 <span><strong style={{ color: "#f0e6c8" }}>{roster.length}</strong> Players</span>
 <span><strong style={{ color: "#4ade80" }}>{availPlayers.length}</strong> Avail</span>
 <span><strong style={{ color: "#facc15" }}>{allResults.length}</strong> Results</span>
 </div>
 </div>
 <div style={{ display: "flex", gap: 0, marginTop: 10, overflowX: "auto" }}>
 {TABS.map(t => (
 <button key={t} onClick={() => setTab(t)} style={{
 background: tab === t ? "#1a3a5c" : "transparent",
 color: tab === t ? "#f0e6c8" : "#7a9ab8",
 border: "none", borderBottom: tab === t ? "2px solid #4a9a6b" : "2px solid transparent",
 padding: "9px 0", marginRight: 22, cursor: "pointer", fontSize: 11, letterSpacing: 1.5,
 fontFamily: "inherit", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0,
 }}>{t}</button>
 ))}
 </div>
 </div>
 </div>
 {/* Toast */}
 {toast && (
 <div style={{ position: "fixed", top: "calc(env(safe-area-inset-top, 0px) + 16px)", right: 16, background: "#1a4a2e", border: "1px solid #4ade80", color: "#4ade80", padding: "9px 16px", borderRadius: 8, fontSize: 12, zIndex: 1000, boxShadow: "0 4px 20px #00000090" }}>
 ✓ {toast}
 </div>
 )}
 <div style={{ padding: "20px 16px", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)", maxWidth: 700, margin: "0 auto" }}>
 {/* ── SCHEDULE TAB ── */}
 {tab === "Schedule" && (
 <div>
 <div style={{ fontSize: 10, color: "#7a9ab8", letterSpacing: 2, marginBottom: 14 }}>SEASON CALENDAR</div>
 <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 22 }}>
 {allWeeks.map(({ week, label, playoff }) => {
 const wdItem = getWD(week);
 const done = (wdItem.results || []).length > 0;
 const pending = (wdItem.approved || []).length > 0;
 return (
 <button key={week} onClick={() => { setCurrentWeek(week); setTab("Matchups"); }} style={{
 background: done ? (playoff ? "#1a0a3a" : "#0a1e10") : "#0d2137",
 border: `1px solid ${done ? (playoff ? "#6d28d9" : "#2a6a3a") : playoff ? "#3a2a5a" : "#2a4a6b"}`,
 color: done ? (playoff ? "#a78bfa" : "#4ade80") : "#7a9ab8",
 borderRadius: 8, padding: "8px 9px", cursor: "pointer", fontSize: 10,
 fontFamily: "inherit", minWidth: 50, textAlign: "center", position: "relative",
 }}>
 <div style={{ fontSize: 7, letterSpacing: 1, color: playoff ? "#6d28d9" : "#3a5a4a", marginBottom: 2 }}>{playoff ? " " : "REG"}</div>
 <div style={{ fontWeight: "bold" }}>{label}</div>
 {done && <div style={{ width: 5, height: 5, borderRadius: "50%", background: playoff ? "#8b5cf6" : "#4ade80", position: "absolute", top: 3, right: 3 }} />}
 {pending && !done && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#facc15", position: "absolute", top: 3, right: 3 }} />}
 </button>
 );
 })}
 </div>
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
 <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderRadius: 10, padding: 14 }}>
 <div style={{ fontSize: 9, letterSpacing: 2, color: "#7a9ab8", marginBottom: 10 }}>REGULAR SEASON</div>
 <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
 {Array.from({ length: TOTAL_REGULAR_WEEKS }, (_, i) => i + 1).map(w => {
 const done = (getWD(w).results || []).length > 0;
 return (
 <div key={w} onClick={() => { setCurrentWeek(w); setTab("Matchups"); }}
 style={{ width: 30, height: 30, borderRadius: 5, background: done ? "#0a2a14" : "#0a1628", border: `1px solid ${done ? "#3a7a4a" : "#2a4a6b"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: done ? "#4ade80" : "#4a6a7a", cursor: "pointer", fontWeight: done ? "bold" : "normal" }}>
 {w}
 </div>
 );
 })}
 </div>
 </div>
 <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderRadius: 10, padding: 14 }}>
 <div style={{ fontSize: 9, letterSpacing: 2, color: "#7a9ab8", marginBottom: 10 }}>PLAYOFFS</div>
 {PLAYOFF_WEEKS.map(p => {
 const done = (getWD(p.week).results || []).length > 0;
 return (
 <div key={p.week} onClick={() => { setCurrentWeek(p.week); setTab("Matchups"); }}
 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}>
 <div style={{ width: 26, height: 26, borderRadius: 5, background: done ? "#1a0a3a" : "#0a1628", border: `1px solid ${done ? "#6d28d9" : "#3a2a5a"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: done ? "#a78bfa" : "#4a6a7a" }}>
 {done ? "✓" : p.week}
 </div>
 <div style={{ fontSize: 11, color: done ? "#a78bfa" : "#7a9ab8" }}>{p.label}</div>
 </div>
 );
 })}
 </div>
 </div>
 <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderRadius: 10, padding: 16 }}>
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
 <div style={{ fontSize: 9, letterSpacing: 2, color: "#7a9ab8" }}>STANDINGS</div>
 <div style={{ fontSize: 9, color: "#4a6a7a" }}>Top 4 → playoffs</div>
 </div>
 {seeded.map((p, i) => (
 <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, padding: "5px 8px", borderRadius: 5, background: i < 4 ? "#0a1e10" : "transparent", border: i < 4 ? "1px solid #1a3a2a" : "1px solid transparent" }}>
 <div style={{ width: 18, fontSize: 11, color: i === 0 ? "#facc15" : i < 4 ? "#4ade80" : "#4a6a7a", fontWeight: "bold" }}>{i + 1}</div>
 <div style={{ flex: 1, fontSize: 12 }}>{p.name}</div>
 <div style={{ fontSize: 10, color: "#7a9ab8", minWidth: 44 }}>{recordStr(p)}</div>
 <div style={{ fontSize: 11, color: "#facc15", fontWeight: "bold", minWidth: 28 }}>{p.points}pt</div>
 <div style={{ width: 60, background: "#0a1628", borderRadius: 3, height: 4 }}>
 <div style={{ width: `${Math.min(winPct(p), 100)}%`, height: "100%", background: i === 0 ? "#facc15" : i < 4 ? "#4ade80" : "#4a6a7a", borderRadius: 3 }} />
 </div>
 {i < 4 && <div style={{ fontSize: 7, color: "#a78bfa", letterSpacing: 1 }}>PO</div>}
 </div>
 ))}
 </div>
 </div>
 )}
 {/* ── ROSTER TAB ── */}
 {tab === "Roster" && (
 <div>
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
 <div style={{ display: "flex", gap: 5 }}>
 <button onClick={() => setRosterView("current")} style={{ ...S.btnGhost, borderColor: rosterView === "current" ? "#4a7a9b" : "#2a4a6b", color: rosterView === "current" ? "#f0e6c8" : "#7a9ab8", fontSize: 10, padding: "6px 12px" }}>This Season</button>
 <button onClick={() => setRosterView("history")} style={{ ...S.btnGhost, borderColor: rosterView === "history" ? "#4a7a9b" : "#2a4a6b", color: rosterView === "history" ? "#f0e6c8" : "#7a9ab8", fontSize: 10, padding: "6px 12px" }}>Last Season</button>
 </div>
 <button onClick={() => setShowAdd(v => !v)} style={{ ...S.btnGreen, fontSize: 11, padding: "6px 14px" }}>+ Player</button>
 </div>
 {showAdd && (
 <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderRadius: 10, padding: 14, marginBottom: 14 }}>
 <div style={{ fontSize: 9, color: "#7a9ab8", marginBottom: 10, letterSpacing: 1 }}>NEW PLAYER</div>
 <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
 <input placeholder="Full Name" value={newP.name} onChange={e => setNewP({ ...newP, name: e.target.value })} style={{ ...S.input, flex: 1, minWidth: 130 }} />
 <input placeholder="HCP" type="number" value={newP.handicap} onChange={e => setNewP({ ...newP, handicap: e.target.value })} style={{ ...S.input, width: 70 }} />
 <button onClick={addPlayer} style={S.btnGreen}>Add</button>
 <button onClick={() => setShowAdd(false)} style={S.btnGhost}>✕</button>
 </div>
 </div>
 )}
 {rosterView === "current" ? (
 <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
 {roster.map(p => (
 <div key={p.id} style={{ background: "#0d2137", border: `1px solid ${p.available ? "#1e3d5a" : "#161e2e"}`, borderRadius: 10, padding: "11px 14px", display: "flex", alignItems: "center", gap: 8, opacity: p.available ? 1 : 0.5 }}>
 {editingId === p.id ? (
 <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap", alignItems: "center" }}>
 <input value={editP.name} onChange={e => setEditP({ ...editP, name: e.target.value })} style={{ ...S.input, flex: 1, minWidth: 120 }} />
 <input type="number" placeholder="HCP" value={editP.handicap} onChange={e => setEditP({ ...editP, handicap: e.target.value })} style={{ ...S.input, width: 65 }} />
 <input type="number" placeholder="W" value={editP.wins} onChange={e => setEditP({ ...editP, wins: e.target.value })} style={{ ...S.input, width: 52 }} />
 <input type="number" placeholder="L" value={editP.losses} onChange={e => setEditP({ ...editP, losses: e.target.value })} style={{ ...S.input, width: 52 }} />
 <input type="number" placeholder="T" value={editP.ties || 0} onChange={e => setEditP({ ...editP, ties: e.target.value })} style={{ ...S.input, width: 52 }} />
 <button onClick={saveEdit} style={{ ...S.btnGreen, padding: "6px 12px" }}>Save</button>
 <button onClick={() => setEditingId(null)} style={{ ...S.btnGhost, padding: "6px 12px" }}>✕</button>
 </div>
 ) : (
 <>
 <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.available ? "#4ade80" : "#475569", flexShrink: 0 }} />
 <div style={{ flex: 1, fontWeight: "bold", fontSize: 13 }}>{p.name}</div>
 <span style={{ background: hcpColor(p.handicap), color: "#0a1628", borderRadius: 4, padding: "2px 6px", fontWeight: "bold", fontSize: 10 }}>{p.handicap}</span>
 <span style={{ fontSize: 11, color: "#e8dfc8", minWidth: 44 }}>{recordStr(p)}</span>
 <span style={{ fontSize: 11, color: "#facc15", fontWeight: "bold", minWidth: 28 }}>{p.points}pt</span>
 <div style={{ display: "flex", gap: 4 }}>
 <button onClick={() => toggleAvail(p.id)} style={{ ...S.btnTiny, color: p.available ? "#facc15" : "#4ade80", padding: "4px 8px" }}>{p.available ? "Away" : "In"}</button>
 <button onClick={() => { setEditingId(p.id); setEditP({ ...p }); }} style={{ ...S.btnTiny, color: "#93c5fd", padding: "4px 8px" }}>Edit</button>
 <button onClick={() => removePlayer(p.id)} style={{ ...S.btnTiny, color: "#f87171", padding: "4px 8px" }}>✕</button>
 </div>
 </>
 )}
 </div>
 ))}
 </div>
 ) : (
 <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
 <div style={{ fontSize: 9, color: "#7a9ab8", letterSpacing: 1.5, marginBottom: 10 }}>LAST SEASON PERFORMANCE</div>
 <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 480 }}>
 <thead>
 <tr style={{ borderBottom: "1px solid #2a4a6b" }}>
 {["PLAYER","REC","PTS","APP","IND","BB","ALT","SHAM"].map((h, i) => (
 <th key={h} style={{ textAlign: i === 0 ? "left" : "center", padding: "6px 6px", color: i > 3 ? "#4a9a6b" : "#7a9ab8", fontSize: 9, fontWeight: "normal", letterSpacing: 1 }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {[...INITIAL_ROSTER].sort((a, b) => b.points - a.points).map((p, i) => (
 <tr key={p.id} style={{ borderBottom: "1px solid #1a2a3a", background: i % 2 === 0 ? "#0d2137" : "transparent" }}>
 <td style={{ padding: "8px 6px", fontWeight: "bold", color: "#f0e6c8" }}>{p.name}</td>
 <td style={{ padding: "8px 6px", textAlign: "center", color: "#e8dfc8" }}>{p.wins}-{p.losses}-{p.ties}</td>
 <td style={{ padding: "8px 6px", textAlign: "center", color: "#facc15", fontWeight: "bold" }}>{p.points}</td>
 <td style={{ padding: "8px 6px", textAlign: "center", color: "#7a9ab8" }}>{p.appearances}</td>
 {FORMATS.map(f => (
 <td key={f} style={{ padding: "8px 6px", textAlign: "center", color: (p.formatStats?.[f] || 0) > 0 ? "#e8dfc8" : "#2a3a2a" }}>
 {p.formatStats?.[f] || 0}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 )}
 {/* ── MATCHUPS TAB ── */}
 {tab === "Matchups" && (
 <div>
 <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
 {allWeeks.map(({ week, label, playoff }) => {
 const done = (getWD(week).results || []).length > 0;
 return (
 <button key={week} onClick={() => setCurrentWeek(week)} style={{
 background: currentWeek === week ? (playoff ? "#2a1a4a" : "#1a3a5c") : done ? (playoff ? "#130a22" : "#0a1e10") : "#0d2137",
 border: `1px solid ${currentWeek === week ? (playoff ? "#8b5cf6" : "#4a7a9b") : done ? (playoff ? "#4a2a7a" : "#2a5a3a") : "#2a4a6b"}`,
 color: currentWeek === week ? "#f0e6c8" : done ? (playoff ? "#8b5cf6" : "#4ade80") : "#4a6a7a",
 borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 9, fontFamily: "inherit", flexShrink: 0,
 }}>{label}</button>
 );
 })}
 </div>
 <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
 <div>
 <div style={{ fontSize: 18, fontWeight: "bold", color: "#f0e6c8" }}>{weekLabel}</div>
 <div style={{ fontSize: 9, color: isPlayoff ? "#a78bfa" : "#4a9a6b", letterSpacing: 2 }}>
 {isPlayoff ? " PLAYOFFS" : `REGULAR SEASON · WEEK ${currentWeek} OF ${TOTAL_REGULAR_WEEKS}`}
 </div>
 </div>
 {isPlayoff && (
 <div style={{ background: "#1a0a3a", border: "1px solid #3a2a5a", borderRadius: 8, padding: "8px 12px", fontSize: 10, color: "#a78bfa", lineHeight: 1.8, flex: 1 }}>
 <div style={{ fontSize: 8, letterSpacing: 2, color: "#6d28d9", marginBottom: 3 }}>SEEDS</div>
 {seeded.map((p, i) => <div key={p.id}>#{i + 1} {p.name} <span style={{ color: "#6d28d9" }}>{p.points}pt</span></div>)}
 </div>
 )}
 </div>
 <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
 <div style={{ fontSize: 9, color: "#7a9ab8", letterSpacing: 1 }}>FORMAT:</div>
 {FORMATS.map(f => (
 <button key={f} onClick={() => setWD(currentWeek, { format: f })} style={{
 background: wd.format === f ? "#1a3a5c" : "transparent",
 border: `1px solid ${wd.format === f ? "#4a7a9b" : "#2a4a6b"}`,
 color: wd.format === f ? "#f0e6c8" : "#7a9ab8",
 padding: "5px 10px", borderRadius: 20, cursor: "pointer", fontSize: 10, fontFamily: "inherit"
 }}>{f}</button>
 ))}
 </div>
 <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 11, color: "#7a9ab8" }}>
 <span style={{ color: "#4ade80", fontWeight: "bold" }}>{availPlayers.length}</span> available: {availPlayers.map((p, i) => (
 <span key={p.id}><span style={{ color: "#e8dfc8" }}>{p.name.split(" ")[0]}</span>{i < availPlayers.length - 1 ? ", " : ""}</span>
 ))}
 </div>
 <button onClick={generateMatchups} disabled={aiLoading || availPlayers.length < 2} style={{
 background: aiLoading ? "#1a2a3a" : "linear-gradient(135deg, #1a4a2e, #0d3a1e)",
 border: `1px solid ${isPlayoff ? "#6d28d9" : "#4a9a6b"}`,
 color: aiLoading ? "#4a6a5a" : isPlayoff ? "#a78bfa" : "#4ade80",
 padding: "12px 20px", borderRadius: 8, cursor: aiLoading ? "default" : "pointer",
 fontSize: 11, letterSpacing: 1.5, fontFamily: "inherit", marginBottom: 16,
 textTransform: "uppercase", width: "100%",
 }}>
 {aiLoading ? " Generating Matchups..." : isPlayoff ? " Generate Playoff Matchups" : "✦ Ask AI for Matchup Suggestions"}
 </button>
 {wd.aiRationale && (
 <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderLeft: `3px solid ${isPlayoff ? "#8b5cf6" : "#4ade80"}`, borderRadius: 8, padding: "11px 14px", marginBottom: 14, fontSize: 12, color: "#a8c8b8", lineHeight: 1.7 }}>
 <div style={{ fontSize: 8, color: isPlayoff ? "#a78bfa" : "#4ade80", letterSpacing: 2, marginBottom: 4 }}>AI RATIONALE</div>
 {wd.aiRationale}
 </div>
 )}
 {wd.matchups.length > 0 && (
 <div style={{ marginBottom: 20 }}>
 <div style={{ fontSize: 9, color: "#7a9ab8", letterSpacing: 1.5, marginBottom: 8 }}>SUGGESTED — APPROVE OR REJECT</div>
 <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
 {wd.matchups.map(m => (
 <div key={m.label} style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
 <div style={{ flex: 1 }}>
 <div style={{ fontSize: 8, color: isPlayoff ? "#a78bfa" : "#4a9a6b", letterSpacing: 2, marginBottom: 4 }}>{m.label} · {wd.format}</div>
 {m.players ? (
 <div style={{ fontSize: 13, color: "#f0e6c8" }}>
 {m.players.map((name, i) => {
 const p = roster.find(r => r.name === name);
 return (
 <span key={name}>
 {name}{p && <span style={{ color: "#7a9ab8", fontSize: 10 }}> ({p.points}pt)</span>}
 {i < m.players.length - 1 && <span style={{ color: "#4a9a6b", margin: "0 6px" }}>vs</span>}
 </span>
 );
 })}
 </div>
 ) : (
 <div style={{ fontSize: 12, color: "#e8dfc8" }}>
 <span style={{ color: "#facc15", fontSize: 8, marginRight: 4 }}>A</span>{(m.teamA || []).join(", ")}
 <span style={{ color: "#4a9a6b", margin: "0 6px" }}>vs</span>
 <span style={{ color: "#93c5fd", fontSize: 8, marginRight: 4 }}>B</span>{(m.teamB || []).join(", ")}
 </div>
 )}
 </div>
 <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
 <button onClick={() => approveMatchup(m)} style={{ ...S.btnGreen, padding: "6px 12px", fontSize: 11 }}>✓</button>
 <button onClick={() => rejectMatchup(m)} style={{ ...S.btnGhost, padding: "6px 10px", fontSize: 11 }}>✕</button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 {wd.approved.length > 0 && (
 <div style={{ marginBottom: 20 }}>
 <div style={{ fontSize: 9, color: "#7a9ab8", letterSpacing: 1.5, marginBottom: 8 }}>APPROVED — AWAITING RESULTS</div>
 <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
 {wd.approved.map((m, i) => (
 <div key={i} style={{ background: "#0a1e10", border: "1px solid #1a4a2e", borderRadius: 10, padding: "12px 14px" }}>
 <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: m.players?.length === 2 ? 8 : 0 }}>
 <div style={{ flex: 1 }}>
 <div style={{ fontSize: 8, color: "#4a9a6b", letterSpacing: 2, marginBottom: 3 }}>{m.label} · {m.format}</div>
 <div style={{ fontSize: 13, color: "#e8dfc8" }}>
 {m.players ? m.players.join(" vs ") : `${(m.teamA || []).join(", ")} vs ${(m.teamB || []).join(", ")}`}
 </div>
 </div>
 <span style={{ background: "#1a4a2e", color: "#4ade80", padding: "2px 8px", borderRadius: 8, fontSize: 9 }}>✓ Set</span>
 </div>
 {m.players?.length === 2 && (
 <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
 <span style={{ fontSize: 9, color: "#7a9ab8", alignSelf: "center" }}>Result:</span>
 <button onClick={() => recordResult(m, m.players[0])} style={{ ...S.btnTiny, color: "#e8dfc8", border: "1px solid #2a4a6b", padding: "5px 10px" }}>{m.players[0].split(" ")[0]} wins</button>
 <button onClick={() => recordResult(m, m.players[1])} style={{ ...S.btnTiny, color: "#e8dfc8", border: "1px solid #2a4a6b", padding: "5px 10px" }}>{m.players[1].split(" ")[0]} wins</button>
 <button onClick={() => recordResult(m, "Halved")} style={{ ...S.btnTiny, color: "#7a9ab8", border: "1px solid #2a4a6b", padding: "5px 10px" }}>Halved</button>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 )}
 {wd.results.length > 0 && (
 <div>
 <div style={{ fontSize: 9, color: "#7a9ab8", letterSpacing: 1.5, marginBottom: 8 }}>THIS WEEK'S RESULTS</div>
 {wd.results.map((r, i) => (
 <div key={i} style={{ background: "#0a1e10", border: "1px solid #1a3a2a", borderRadius: 8, padding: "9px 12px", marginBottom: 6, display: "flex", gap: 10, alignItems: "center" }}>
 <div style={{ flex: 1, fontSize: 12, color: "#e8dfc8" }}>{r.players ? r.players.join(" vs ") : `${(r.teamA || []).join(", ")} vs ${(r.teamB || []).join(", ")}`}</div>
 <div style={{ fontSize: 11, fontWeight: "bold", color: r.result === "Halved" ? "#7a9ab8" : "#4ade80" }}>{r.result === "Halved" ? "Halved" : `${r.result.split(" ")[0]} wins`}</div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 {/* ── RESULTS TAB ── */}
 {tab === "Results" && (
 <div>
 <div style={{ fontSize: 10, color: "#7a9ab8", letterSpacing: 2, marginBottom: 16 }}>SEASON RESULTS & STANDINGS</div>
 <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderRadius: 10, padding: 16, marginBottom: 18 }}>
 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
 <div style={{ fontSize: 9, letterSpacing: 2, color: "#7a9ab8" }}>STANDINGS</div>
 <div style={{ fontSize: 9, color: "#4a6a7a" }}>Top 4 → playoffs</div>
 </div>
 <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
 <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 320 }}>
 <thead>
 <tr style={{ borderBottom: "1px solid #2a4a6b" }}>
 {["#","PLAYER","REC","PTS","WIN%","HCP"].map((h, i) => (
 <th key={h} style={{ textAlign: i < 2 ? "left" : "center", padding: "5px 6px", color: h === "PTS" ? "#facc15" : "#7a9ab8", fontSize: 9, fontWeight: "normal" }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {seeded.map((p, i) => (
 <tr key={p.id} style={{ borderBottom: "1px solid #1a2a3a", background: i < 4 ? "#0a1e10" : "transparent" }}>
 <td style={{ padding: "8px 6px", color: i === 0 ? "#facc15" : i < 4 ? "#4ade80" : "#4a6a7a", fontWeight: "bold" }}>{i + 1}</td>
 <td style={{ padding: "8px 6px", color: "#f0e6c8", fontWeight: "bold" }}>{p.name}</td>
 <td style={{ padding: "8px 6px", textAlign: "center", color: "#e8dfc8" }}>{recordStr(p)}</td>
 <td style={{ padding: "8px 6px", textAlign: "center", color: "#facc15", fontWeight: "bold" }}>{p.points}</td>
 <td style={{ padding: "8px 6px", textAlign: "center", color: "#4ade80" }}>{winPct(p)}%</td>
 <td style={{ padding: "8px 6px", textAlign: "center", color: "#7a9ab8" }}>{p.handicap}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div style={{ marginTop: 8, fontSize: 9, color: "#4a6a7a" }}> Highlighted = playoff qualifiers. Pts = Wins + 0.5×Ties.</div>
 </div>
 {allResults.length > 0 ? (
 <div>
 <div style={{ fontSize: 9, color: "#7a9ab8", letterSpacing: 2, marginBottom: 10 }}>MATCH HISTORY</div>
 <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
 {[...allResults].reverse().map((r, i) => (
 <div key={i} style={{ background: "#0d2137", border: "1px solid #1e3d5a", borderRadius: 8, padding: "9px 12px", display: "flex", gap: 10, alignItems: "center" }}>
 <div style={{ fontSize: 9, color: "#4a9a6b", minWidth: 52 }}>{r.weekLabel}</div>
 <div style={{ flex: 1, fontSize: 11, color: "#e8dfc8" }}>{r.players ? r.players.join(" vs ") : `${(r.teamA || []).join(", ")} vs ${(r.teamB || []).join(", ")}`}</div>
 <div style={{ fontSize: 9, color: "#4a6a7a" }}>{r.format}</div>
 <div style={{ fontSize: 11, fontWeight: "bold", color: r.result === "Halved" ? "#7a9ab8" : "#4ade80" }}>
 {r.result === "Halved" ? "Halved" : `${r.result.split(" ")[0]} wins`}
 </div>
 </div>
 ))}
 </div>
 </div>
 ) : (
 <div style={{ color: "#4a6a7a", fontSize: 12, textAlign: "center", padding: "36px 0" }}>
 No results yet. Head to Matchups to get started.
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 );

}
