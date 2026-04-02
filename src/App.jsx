import { useState } from "react"; 
const FORMATS = ["Individual", "Best Ball", "Alt Shot", "Shamble"]; 
const TOTAL_REGULAR_WEEKS = 10; 
const PLAYOFF_WEEKS = [ 
 { week: 11, label: "Quarterfinals" }, 
 { week: 12, label: "Semifinals" }, 
 { week: 13, label: "Championship" }, 
]; 
const INITIAL_ROSTER = [ 
 { id: 1, name: "Alex Martin", handicap: 15.9, wins: 1, losses: 3, ties: 0, points: 2, a { id: 2, name: "Chase Jarvis", handicap: 6.7, wins: 2, losses: 1, ties: 1, points: 5, a { id: 3, name: "Colton Dades", handicap: 5.4, wins: 1, losses: 2, ties: 1, points: 3, a { id: 4, name: "Dan Gallagher", handicap: 2.2, wins: 0, losses: 6, ties: 0, points: 0, a { id: 5, name: "David Totten", handicap: 2.4, wins: 0, losses: 6, ties: 0, points: 0, a { id: 6, name: "Erik Severson", handicap: 21.2, wins: 1, losses: 4, ties: 0, points: 2, a { id: 7, name: "Jake Drier", handicap: 3.1, wins: 3, losses: 5, ties: 1, points: 7, a { id: 8, name: "Josiah Johnson", handicap: 13.1, wins: 2, losses: 3, ties: 0, points: 4, a { id: 9, name: "Mike Dades", handicap: 14.7, wins: 2, losses: 4, ties: 0, points: 4, a { id: 10, name: "Tyler Kalberg", handicap: 0.2, wins: 4, losses: 4, ties: 1, points: 9, a]; 
const winPct = (p) => { 
 const total = p.wins + p.losses + (p.ties || 0); 
 return total === 0 ? 0 : Math.round((p.wins + (p.ties || 0) * 0.5) / total * 100); }; 
const hcpColor = (h) => h <= 5 ? "#4ade80" : h <= 12 ? "#facc15" : "#f87171"; const recordStr = (p) => p.ties ? `${p.wins}-${p.losses}-${p.ties}` : `${p.wins}-${p.losses}`
const S = { 
 input: { background: "#0a1628", border: "1px solid #2a4a6b", color: "#e8dfc8", padding: "8 btnGreen: { background: "#1a4a2e", border: "1px solid #4a9a6b", color: "#4ade80", padding: btnGhost: { background: "transparent", border: "1px solid #2a4a6b", color: "#7a9ab8", padd btnTiny: { background: "transparent", border: "1px solid #1e3d5a", color: "#7a9ab8", paddi}; 
const TABS = ["Schedule", "Roster", "Matchups", "Results"]; 
const allWeeks = [ 
 ...Array.from({ length: TOTAL_REGULAR_WEEKS }, (_, i) => ({ week: i + 1, label: `Wk ${i +  ...PLAYOFF_WEEKS.map(p => ({ week: p.week, label: p.label.slice(0, 6), playoff: true })), ];
export default function App() { 
 const [tab, setTab] = useState("Schedule"); 
 const [roster, setRoster] = useState(INITIAL_ROSTER); 
 const [currentWeek, setCurrentWeek] = useState(1); 
 const [weekData, setWeekData] = useState({}); 
 const [aiLoading, setAiLoading] = useState(false); 
 const [showAdd, setShowAdd] = useState(false); 
 const [newP, setNewP] = useState({ name: "", handicap: "", wins: 0, losses: 0, ties: 0, av const [editingId, setEditingId] = useState(null); 
 const [editP, setEditP] = useState({}); 
 const [toast, setToast] = useState(""); 
 const [rosterView, setRosterView] = useState("current"); 
 const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); }; 
 const isPlayoff = currentWeek > TOTAL_REGULAR_WEEKS; 
 const playoffInfo = PLAYOFF_WEEKS.find(p => p.week === currentWeek);  const weekLabel = isPlayoff ? playoffInfo?.label : `Week ${currentWeek}`; 
 const getWD = (w) => weekData[w] || { matchups: [], approved: [], results: [], aiRationale: const setWD = (w, upd) => setWeekData(prev => ({ ...prev, [w]: { ...getWD(w), ...upd } }));  const wd = getWD(currentWeek); 
 const availPlayers = roster.filter(p => p.available); 
 const seeded = [...roster].sort((a, b) => b.points - a.points || winPct(b) - winPct(a));  const toggleAvail = (id) => setRoster(r => r.map(p => p.id === id ? { ...p, available: !p.
 const addPlayer = () => { 
 if (!newP.name || newP.handicap === "") return; 
 setRoster(r => [...r, { ...newP, id: Date.now(), handicap: +newP.handicap, wins: +newP.w setNewP({ name: "", handicap: "", wins: 0, losses: 0, ties: 0, available: true });  setShowAdd(false); 
 notify("Player added."); 
 }; 
 const removePlayer = (id) => { setRoster(r => r.filter(p => p.id !== id)); notify("Player 
 const saveEdit = () => { 
 setRoster(r => r.map(p => p.id === editingId ? { ...p, ...editP, handicap: +editP.handic setEditingId(null); 
 notify("Player updated."); 
 }; 
 // ── AI matchup generation — calls /api/matchups server route ── 
 const generateMatchups = async () => { 
 if (availPlayers.length < 2) return;
 setAiLoading(true); 
 setWD(currentWeek, { matchups: [], aiRationale: "" }); 
 const playersForPrompt = availPlayers.map(p => ({ 
 name: p.name, handicap: p.handicap, 
 record: recordStr(p), points: p.points, winPct: winPct(p) + "%",  lastSeasonFormatAppearances: p.formatStats, 
 })); 
 const playoffContext = isPlayoff 
 ? `This is a PLAYOFF round: ${playoffInfo?.label}. Seed players by points — top vs bot : `Regular season ${weekLabel} of ${TOTAL_REGULAR_WEEKS}. Avoid repeat matchups where 
 const prompt = `You are a golf league captain's assistant for a 10-player league. ${play
This week's format: "${wd.format}" 
Available players: ${JSON.stringify(playersForPrompt, null, 2)} 
Format rules: 
- Individual: rank players into flights by handicap. 
- Best Ball (2v2): pair strong+weak handicap teammates, match teams by avg handicap. - Alt Shot (2v2): same logic as Best Ball; Alt Shot rewards chemistry. 
- Shamble: balanced teams of 3-5 with equal avg handicap. 
Consider last season format appearances for variety across the season. 
Respond ONLY with valid JSON, no markdown: 
{ 
 "matchups": [{ "label": "Match 1", "players": ["Name A", "Name B"] }],  "rationale": "2-3 sentences." 
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
 setWD(currentWeek, { matchups: data.matchups || [], aiRationale: data.rationale || "" } } catch (e) { 
 setWD(currentWeek, { aiRationale: `Error: ${e.message || "Could not generate suggestio } 
 setAiLoading(false); 
 };
 const approveMatchup = (m) => { 
 setWD(currentWeek, { 
 matchups: wd.matchups.filter(x => x.label !== m.label), 
 approved: [...wd.approved, { ...m, week: currentWeek, weekLabel, format: wd.format, da }); 
 notify(`${m.label} approved!`); 
 }; 
 const rejectMatchup = (m) => { 
 setWD(currentWeek, { matchups: wd.matchups.filter(x => x.label !== m.label) });  notify(`${m.label} removed.`); 
 }; 
 const recordResult = (matchup, result) => { 
 setWD(currentWeek, { 
 approved: wd.approved.filter(m => !(m.label === matchup.label && m.date === matchup.da results: [...wd.results, { ...matchup, result, recordedAt: new Date().toLocaleDateStri }); 
 if (matchup.players?.length === 2) { 
 const winner = result === "Halved" ? null : result; 
 const loser = winner ? matchup.players.find(n => n !== winner) : null;  setRoster(r => r.map(p => { 
 if (p.name === winner) return { ...p, wins: p.wins + 1, points: p.points + 1 };  if (p.name === loser) return { ...p, losses: p.losses + 1 }; 
 if (result === "Halved" && matchup.players.includes(p.name)) return { ...p, ties: (p. return p; 
 })); 
 } 
 notify("Result recorded & standings updated."); 
 }; 
 const allResults = Object.entries(weekData).flatMap(([, d]) => d.results || []); 
 return ( 
 <div style={{ minHeight: "100vh", background: "#0a1628", fontFamily: "Georgia, serif", c
 {/* Header */} 
 <div style={{ background: "linear-gradient(135deg, #0d2137, #163050, #0a1628)", border <div style={{ padding: "18px 20px 0" }}> 
 <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>  <span style={{ fontSize: 24 }}> </span> 
 <div> 
 <div style={{ fontSize: 17, fontWeight: "bold", letterSpacing: 1, color: "#f0e <div style={{ fontSize: 9, letterSpacing: 2.5, color: "#7a9ab8" }}>GOLF ROSTER </div> 
 <div style={{ marginLeft: "auto", display: "flex", gap: 14, fontSize: 10, color:
 <span><strong style={{ color: "#f0e6c8" }}>{roster.length}</strong> Players</s <span><strong style={{ color: "#4ade80" }}>{availPlayers.length}</strong> Avai <span><strong style={{ color: "#facc15" }}>{allResults.length}</strong> Result </div> 
 </div> 
 <div style={{ display: "flex", gap: 0, marginTop: 10, overflowX: "auto" }}>  {TABS.map(t => ( 
 <button key={t} onClick={() => setTab(t)} style={{ 
 background: tab === t ? "#1a3a5c" : "transparent", 
 color: tab === t ? "#f0e6c8" : "#7a9ab8", 
 border: "none", borderBottom: tab === t ? "2px solid #4a9a6b" : "2px solid t padding: "9px 0", marginRight: 22, cursor: "pointer", fontSize: 11, letterSp fontFamily: "inherit", textTransform: "uppercase", whiteSpace: "nowrap", fle }}>{t}</button> 
 ))} 
 </div> 
 </div> 
 </div> 
 {/* Toast */} 
 {toast && ( 
 <div style={{ position: "fixed", top: "calc(env(safe-area-inset-top, 0px) + 16px)",  ✓ {toast} 
 </div> 
 )} 
 <div style={{ padding: "20px 16px", paddingBottom: "calc(env(safe-area-inset-bottom, 0
 {/* ── SCHEDULE TAB ── */} 
 {tab === "Schedule" && ( 
 <div> 
 <div style={{ fontSize: 10, color: "#7a9ab8", letterSpacing: 2, marginBottom: 14
 <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 22 }}>  {allWeeks.map(({ week, label, playoff }) => { 
 const wdItem = getWD(week); 
 const done = (wdItem.results || []).length > 0; 
 const pending = (wdItem.approved || []).length > 0; 
 return ( 
 <button key={week} onClick={() => { setCurrentWeek(week); setTab("Matchups background: done ? (playoff ? "#1a0a3a" : "#0a1e10") : "#0d2137",  border: `1px solid ${done ? (playoff ? "#6d28d9" : "#2a6a3a") : playoff  color: done ? (playoff ? "#a78bfa" : "#4ade80") : "#7a9ab8",  borderRadius: 8, padding: "8px 9px", cursor: "pointer", fontSize: 10,  fontFamily: "inherit", minWidth: 50, textAlign: "center", position: "rel }}> 
 <div style={{ fontSize: 7, letterSpacing: 1, color: playoff ? "#6d28d9" :
 <div style={{ fontWeight: "bold" }}>{label}</div> 
 {done && <div style={{ width: 5, height: 5, borderRadius: "50%", backgro {pending && !done && <div style={{ width: 5, height: 5, borderRadius: "5 </button> 
 ); 
 })} 
 </div> 
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBo <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderRadius: <div style={{ fontSize: 9, letterSpacing: 2, color: "#7a9ab8", marginBottom: <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>  {Array.from({ length: TOTAL_REGULAR_WEEKS }, (_, i) => i + 1).map(w => {  const done = (getWD(w).results || []).length > 0; 
 return ( 
 <div key={w} onClick={() => { setCurrentWeek(w); setTab("Matchups"); }}  style={{ width: 30, height: 30, borderRadius: 5, background: done ?  {w} 
 </div> 
 ); 
 })} 
 </div> 
 </div> 
 <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderRadius: <div style={{ fontSize: 9, letterSpacing: 2, color: "#7a9ab8", marginBottom: {PLAYOFF_WEEKS.map(p => { 
 const done = (getWD(p.week).results || []).length > 0;  return ( 
 <div key={p.week} onClick={() => { setCurrentWeek(p.week); setTab("Match style={{ display: "flex", alignItems: "center", gap: 8, marginBottom:  <div style={{ width: 26, height: 26, borderRadius: 5, background: done {done ? "✓" : p.week} 
 </div> 
 <div style={{ fontSize: 11, color: done ? "#a78bfa" : "#7a9ab8" }}>{p. </div> 
 ); 
 })} 
 </div> 
 </div> 
 <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderRadius:  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "c <div style={{ fontSize: 9, letterSpacing: 2, color: "#7a9ab8" }}>STANDINGS</ <div style={{ fontSize: 9, color: "#4a6a7a" }}>Top 4 → playoffs</div> 
 </div> 
 {seeded.map((p, i) => ( 
 <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marg
 <div style={{ width: 18, fontSize: 11, color: i === 0 ? "#facc15" : i < 4  <div style={{ flex: 1, fontSize: 12 }}>{p.name}</div>  <div style={{ fontSize: 10, color: "#7a9ab8", minWidth: 44 }}>{recordStr(p) <div style={{ fontSize: 11, color: "#facc15", fontWeight: "bold", minWidth: <div style={{ width: 60, background: "#0a1628", borderRadius: 3, height: 4 <div style={{ width: `${Math.min(winPct(p), 100)}%`, height: "100%", bac </div> 
 {i < 4 && <div style={{ fontSize: 7, color: "#a78bfa", letterSpacing: 1 }} </div> 
 ))} 
 </div> 
 </div> 
 )} 
 {/* ── ROSTER TAB ── */} 
 {tab === "Roster" && ( 
 <div> 
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "cen <div style={{ display: "flex", gap: 5 }}> 
 <button onClick={() => setRosterView("current")} style={{ ...S.btnGhost, bor <button onClick={() => setRosterView("history")} style={{ ...S.btnGhost, bor </div> 
 <button onClick={() => setShowAdd(v => !v)} style={{ ...S.btnGreen, fontSize:  </div> 
 {showAdd && ( 
 <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderRadius: <div style={{ fontSize: 9, color: "#7a9ab8", marginBottom: 10, letterSpacing: <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>  <input placeholder="Full Name" value={newP.name} onChange={e => setNewP({ . <input placeholder="HCP" type="number" value={newP.handicap} onChange={e = <button onClick={addPlayer} style={S.btnGreen}>Add</button>  <button onClick={() => setShowAdd(false)} style={S.btnGhost}>✕</button>  </div> 
 </div> 
 )} 
 {rosterView === "current" ? ( 
 <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>  {roster.map(p => ( 
 <div key={p.id} style={{ background: "#0d2137", border: `1px solid ${p.ava {editingId === p.id ? ( 
 <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap", alig <input value={editP.name} onChange={e => setEditP({ ...editP, name:  <input type="number" placeholder="HCP" value={editP.handicap} onChan <input type="number" placeholder="W" value={editP.wins} onChange={e  <input type="number" placeholder="L" value={editP.losses} onChange={
 <input type="number" placeholder="T" value={editP.ties || 0} onChang <button onClick={saveEdit} style={{ ...S.btnGreen, padding: "6px 12p <button onClick={() => setEditingId(null)} style={{ ...S.btnGhost, p </div> 
 ) : ( 
 <> 
 <div style={{ width: 7, height: 7, borderRadius: "50%", background:  <div style={{ flex: 1, fontWeight: "bold", fontSize: 13 }}>{p.name}< <span style={{ background: hcpColor(p.handicap), color: "#0a1628", b <span style={{ fontSize: 11, color: "#e8dfc8", minWidth: 44 }}>{reco <span style={{ fontSize: 11, color: "#facc15", fontWeight: "bold", m <div style={{ display: "flex", gap: 4 }}> 
 <button onClick={() => toggleAvail(p.id)} style={{ ...S.btnTiny, c <button onClick={() => { setEditingId(p.id); setEditP({ ...p }); }} <button onClick={() => removePlayer(p.id)} style={{ ...S.btnTiny,  </div> 
 </> 
 )} 
 </div> 
 ))} 
 </div> 
 ) : ( 
 <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>  <div style={{ fontSize: 9, color: "#7a9ab8", letterSpacing: 1.5, marginBotto <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, min <thead> 
 <tr style={{ borderBottom: "1px solid #2a4a6b" }}>  {["PLAYER","REC","PTS","APP","IND","BB","ALT","SHAM"].map((h, i) => (  <th key={h} style={{ textAlign: i === 0 ? "left" : "center", padding: ))} 
 </tr> 
 </thead> 
 <tbody> 
 {[...INITIAL_ROSTER].sort((a, b) => b.points - a.points).map((p, i) => (  <tr key={p.id} style={{ borderBottom: "1px solid #1a2a3a", background: <td style={{ padding: "8px 6px", fontWeight: "bold", color: "#f0e6c8 <td style={{ padding: "8px 6px", textAlign: "center", color: "#e8dfc <td style={{ padding: "8px 6px", textAlign: "center", color: "#facc1 <td style={{ padding: "8px 6px", textAlign: "center", color: "#7a9ab {FORMATS.map(f => ( 
 <td key={f} style={{ padding: "8px 6px", textAlign: "center", colo {p.formatStats?.[f] || 0} 
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
 <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16, overf {allWeeks.map(({ week, label, playoff }) => { 
 const done = (getWD(week).results || []).length > 0; 
 return ( 
 <button key={week} onClick={() => setCurrentWeek(week)} style={{  background: currentWeek === week ? (playoff ? "#2a1a4a" : "#1a3a5c") : d border: `1px solid ${currentWeek === week ? (playoff ? "#8b5cf6" : "#4a7 color: currentWeek === week ? "#f0e6c8" : done ? (playoff ? "#8b5cf6" :  borderRadius: 6, padding: "5px 8px", cursor: "pointer", fontSize: 9, fon }}>{label}</button> 
 ); 
 })} 
 </div> 
 <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom:  <div> 
 <div style={{ fontSize: 18, fontWeight: "bold", color: "#f0e6c8" }}>{weekLab <div style={{ fontSize: 9, color: isPlayoff ? "#a78bfa" : "#4a9a6b", letterS {isPlayoff ? " PLAYOFFS" : `REGULAR SEASON · WEEK ${currentWeek} OF ${TO </div> 
 </div> 
 {isPlayoff && ( 
 <div style={{ background: "#1a0a3a", border: "1px solid #3a2a5a", borderRadi <div style={{ fontSize: 8, letterSpacing: 2, color: "#6d28d9", marginBotto {seeded.map((p, i) => <div key={p.id}>#{i + 1} {p.name} <span style={{ col </div> 
 )} 
 </div> 
 <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 14, f <div style={{ fontSize: 9, color: "#7a9ab8", letterSpacing: 1 }}>FORMAT:</div>  {FORMATS.map(f => ( 
 <button key={f} onClick={() => setWD(currentWeek, { format: f })} style={{  background: wd.format === f ? "#1a3a5c" : "transparent",  border: `1px solid ${wd.format === f ? "#4a7a9b" : "#2a4a6b"}`,  color: wd.format === f ? "#f0e6c8" : "#7a9ab8", 
 padding: "5px 10px", borderRadius: 20, cursor: "pointer", fontSize: 10, fo }}>{f}</button>
 ))} 
 </div> 
 <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderRadius:  <span style={{ color: "#4ade80", fontWeight: "bold" }}>{availPlayers.length}</ <span key={p.id}><span style={{ color: "#e8dfc8" }}>{p.name.split(" ")[0]}</ ))} 
 </div> 
 <button onClick={generateMatchups} disabled={aiLoading || availPlayers.length <  background: aiLoading ? "#1a2a3a" : "linear-gradient(135deg, #1a4a2e, #0d3a1e) border: `1px solid ${isPlayoff ? "#6d28d9" : "#4a9a6b"}`,  color: aiLoading ? "#4a6a5a" : isPlayoff ? "#a78bfa" : "#4ade80",  padding: "12px 20px", borderRadius: 8, cursor: aiLoading ? "default" : "pointe fontSize: 11, letterSpacing: 1.5, fontFamily: "inherit", marginBottom: 16,  textTransform: "uppercase", width: "100%", 
 }}> 
 {aiLoading ? " Generating Matchups..." : isPlayoff ? " Generate Playoff Ma </button> 
 {wd.aiRationale && ( 
 <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderLeft: ` <div style={{ fontSize: 8, color: isPlayoff ? "#a78bfa" : "#4ade80", letterS {wd.aiRationale} 
 </div> 
 )} 
 {wd.matchups.length > 0 && ( 
 <div style={{ marginBottom: 20 }}> 
 <div style={{ fontSize: 9, color: "#7a9ab8", letterSpacing: 1.5, marginBotto <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>  {wd.matchups.map(m => ( 
 <div key={m.label} style={{ background: "#0d2137", border: "1px solid #2 <div style={{ flex: 1 }}> 
 <div style={{ fontSize: 8, color: isPlayoff ? "#a78bfa" : "#4a9a6b", {m.players ? ( 
 <div style={{ fontSize: 13, color: "#f0e6c8" }}>  {m.players.map((name, i) => { 
 const p = roster.find(r => r.name === name);  return ( 
 <span key={name}> 
 {name}{p && <span style={{ color: "#7a9ab8", fontSize: 10 } {i < m.players.length - 1 && <span style={{ color: "#4a9a6 </span> 
 ); 
 })} 
 </div>
 ) : ( 
 <div style={{ fontSize: 12, color: "#e8dfc8" }}>  <span style={{ color: "#facc15", fontSize: 8, marginRight: 4 }}> <span style={{ color: "#4a9a6b", margin: "0 6px" }}>vs</span>  <span style={{ color: "#93c5fd", fontSize: 8, marginRight: 4 }}> </div> 
 )} 
 </div> 
 <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>  <button onClick={() => approveMatchup(m)} style={{ ...S.btnGreen, pa <button onClick={() => rejectMatchup(m)} style={{ ...S.btnGhost, pad </div> 
 </div> 
 ))} 
 </div> 
 </div> 
 )} 
 {wd.approved.length > 0 && ( 
 <div style={{ marginBottom: 20 }}> 
 <div style={{ fontSize: 9, color: "#7a9ab8", letterSpacing: 1.5, marginBotto <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>  {wd.approved.map((m, i) => ( 
 <div key={i} style={{ background: "#0a1e10", border: "1px solid #1a4a2e", <div style={{ display: "flex", alignItems: "center", gap: 8, marginBot <div style={{ flex: 1 }}> 
 <div style={{ fontSize: 8, color: "#4a9a6b", letterSpacing: 2, mar <div style={{ fontSize: 13, color: "#e8dfc8" }}>  {m.players ? m.players.join(" vs ") : `${(m.teamA || []).join(", </div> 
 </div> 
 <span style={{ background: "#1a4a2e", color: "#4ade80", padding: "2p </div> 
 {m.players?.length === 2 && ( 
 <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>  <span style={{ fontSize: 9, color: "#7a9ab8", alignSelf: "center" } <button onClick={() => recordResult(m, m.players[0])} style={{ ... <button onClick={() => recordResult(m, m.players[1])} style={{ ... <button onClick={() => recordResult(m, "Halved")} style={{ ...S.bt </div> 
 )} 
 </div> 
 ))} 
 </div> 
 </div> 
 )}
 {wd.results.length > 0 && ( 
 <div> 
 <div style={{ fontSize: 9, color: "#7a9ab8", letterSpacing: 1.5, marginBotto {wd.results.map((r, i) => ( 
 <div key={i} style={{ background: "#0a1e10", border: "1px solid #1a3a2a",  <div style={{ flex: 1, fontSize: 12, color: "#e8dfc8" }}>{r.players ? r. <div style={{ fontSize: 11, fontWeight: "bold", color: r.result === "Hal </div> 
 ))} 
 </div> 
 )} 
 </div> 
 )} 
 {/* ── RESULTS TAB ── */} 
 {tab === "Results" && ( 
 <div> 
 <div style={{ fontSize: 10, color: "#7a9ab8", letterSpacing: 2, marginBottom: 16
 <div style={{ background: "#0d2137", border: "1px solid #2a4a6b", borderRadius:  <div style={{ display: "flex", justifyContent: "space-between", marginBottom:  <div style={{ fontSize: 9, letterSpacing: 2, color: "#7a9ab8" }}>STANDINGS</ <div style={{ fontSize: 9, color: "#4a6a7a" }}>Top 4 → playoffs</div> 
 </div> 
 <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, min <thead> 
 <tr style={{ borderBottom: "1px solid #2a4a6b" }}>  {["#","PLAYER","REC","PTS","WIN%","HCP"].map((h, i) => (  <th key={h} style={{ textAlign: i < 2 ? "left" : "center", padding:  ))} 
 </tr> 
 </thead> 
 <tbody> 
 {seeded.map((p, i) => ( 
 <tr key={p.id} style={{ borderBottom: "1px solid #1a2a3a", background: <td style={{ padding: "8px 6px", color: i === 0 ? "#facc15" : i < 4  <td style={{ padding: "8px 6px", color: "#f0e6c8", fontWeight: "bold <td style={{ padding: "8px 6px", textAlign: "center", color: "#e8dfc <td style={{ padding: "8px 6px", textAlign: "center", color: "#facc1 <td style={{ padding: "8px 6px", textAlign: "center", color: "#4ade8 <td style={{ padding: "8px 6px", textAlign: "center", color: "#7a9ab </tr> 
 ))} 
 </tbody> 
 </table> 
 </div>
 <div style={{ marginTop: 8, fontSize: 9, color: "#4a6a7a" }}> Highlighted =  </div> 
 {allResults.length > 0 ? ( 
 <div> 
 <div style={{ fontSize: 9, color: "#7a9ab8", letterSpacing: 2, marginBottom: <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>  {[...allResults].reverse().map((r, i) => ( 
 <div key={i} style={{ background: "#0d2137", border: "1px solid #1e3d5a", <div style={{ fontSize: 9, color: "#4a9a6b", minWidth: 52 }}>{r.weekLa <div style={{ flex: 1, fontSize: 11, color: "#e8dfc8" }}>{r.players ? 
 <div style={{ fontSize: 9, color: "#4a6a7a" }}>{r.format}</div>  <div style={{ fontSize: 11, fontWeight: "bold", color: r.result === "H {r.result === "Halved" ? "Halved" : `${r.result.split(" ")[0]} wins`}  </div> 
 </div> 
 ))} 
 </div> 
 </div> 
 ) : ( 
 <div style={{ color: "#4a6a7a", fontSize: 12, textAlign: "center", padding: "3 No results yet. Head to Matchups to get started. 
 </div> 
 )} 
 </div> 
 )} 
 </div> 
 </div> 
 ); 
}
