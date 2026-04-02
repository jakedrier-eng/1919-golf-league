import { useState } from "react";

const FORMATS = ["Individual", "Best Ball", "Alt Shot", "Shamble"];
const TOTAL_REGULAR_WEEKS = 10;
const PLAYOFF_WEEKS = [
  { week: 11, label: "Quarterfinals" },
  { week: 12, label: "Semifinals" },
  { week: 13, label: "Championship" },
];

const INITIAL_ROSTER = [
  {
    id: 1,
    name: "Alex Martin",
    handicap: 15.9,
    wins: 1,
    losses: 3,
    ties: 0,
    points: 2,
    appearances: 4,
    formatStats: { Individual: 0, "Best Ball": 1, "Alt Shot": 1, Shamble: 2 },
    available: true,
  },
  {
    id: 2,
    name: "Chase Jarvis",
    handicap: 6.7,
    wins: 2,
    losses: 1,
    ties: 1,
    points: 5,
    appearances: 5,
    formatStats: { Individual: 1, "Best Ball": 2, "Alt Shot": 1, Shamble: 1 },
    available: true,
  },
  {
    id: 3,
    name: "Colton Dades",
    handicap: 5.4,
    wins: 1,
    losses: 2,
    ties: 1,
    points: 3,
    appearances: 3,
    formatStats: { Individual: 2, "Best Ball": 1, "Alt Shot": 0, Shamble: 0 },
    available: true,
  },
  {
    id: 4,
    name: "Dan Gallagher",
    handicap: 2.2,
    wins: 0,
    losses: 6,
    ties: 0,
    points: 0,
    appearances: 5,
    formatStats: { Individual: 2, "Best Ball": 1, "Alt Shot": 1, Shamble: 1 },
    available: true,
  },
  {
    id: 5,
    name: "David Totten",
    handicap: 2.4,
    wins: 0,
    losses: 6,
    ties: 0,
    points: 0,
    appearances: 5,
    formatStats: { Individual: 2, "Best Ball": 2, "Alt Shot": 0, Shamble: 1 },
    available: true,
  },
  {
    id: 6,
    name: "Erik Severson",
    handicap: 21.2,
    wins: 1,
    losses: 4,
    ties: 0,
    points: 2,
    appearances: 4,
    formatStats: { Individual: 1, "Best Ball": 0, "Alt Shot": 1, Shamble: 2 },
    available: true,
  },
  {
    id: 7,
    name: "Jake Drier",
    handicap: 3.1,
    wins: 3,
    losses: 5,
    ties: 1,
    points: 7,
    appearances: 5,
    formatStats: { Individual: 1, "Best Ball": 2, "Alt Shot": 1, Shamble: 1 },
    available: true,
  },
  {
    id: 8,
    name: "Josiah Johnson",
    handicap: 13.1,
    wins: 2,
    losses: 3,
    ties: 0,
    points: 4,
    appearances: 5,
    formatStats: { Individual: 2, "Best Ball": 1, "Alt Shot": 1, Shamble: 1 },
    available: true,
  },
  {
    id: 9,
    name: "Mike Dades",
    handicap: 14.7,
    wins: 2,
    losses: 4,
    ties: 0,
    points: 4,
    appearances: 3,
formatStats: { Individual: 0, "Best Ball": 1, "Alt Shot": 0, Shamble: 2 },
    available: true,
  },
  {
    id: 10,
    name: "Tyler Kalberg",
    handicap: 10,
    wins: 4,
    losses: 4,
    ties: 1,
    points: 9,
    appearances: 5,
    formatStats: { Individual: 1, "Best Ball": 1, "Alt Shot": 2, Shamble: 1 },
    available: true,
  },
];

const winPct = (p) => {
  const total = p.wins + p.losses + (p.ties || 0);
  if (total === 0) return 0;
  return Math.round(((p.wins + (p.ties || 0) * 0.5) / total) * 100);
};

const hcpColor = (h) =>
  h <= 5 ? "#4ade80" : h <= 12 ? "#facc15" : "#f87171";

const recordStr = (p) =>
  p.ties ? `${p.wins}-${p.losses}-${p.ties}` : `${p.wins}-${p.losses}`;

const TABS = ["Schedule", "Roster", "Matchups", "Results"];

const allWeeks = [
  ...Array.from({ length: TOTAL_REGULAR_WEEKS }, (_, i) => ({
    week: i + 1,
    label: `Wk ${i + 1}`,
    playoff: false,
  })),
  ...PLAYOFF_WEEKS.map((p) => ({
    week: p.week,
    label: p.label.slice(0, 6),
    playoff: true,
  })),
];

export default function App() {
  const [tab, setTab] = useState("Schedule");
  const [roster, setRoster] = useState(INITIAL_ROSTER);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weekData, setWeekData] = useState({});
  const [toast, setToast] = useState("");

  const notify = (msg) => {
    setToast(msg);

   setTimeout(() => setToast(""), 2800);
  };

  const getWD = (w) =>
    weekData[w] || {
      matchups: [],
      approved: [],
      results: [],
      aiRationale: "",
      format: FORMATS[0],
    };

  const setWD = (w, upd) =>
    setWeekData((prev) => ({
      ...prev,
      [w]: { ...getWD(w), ...upd },
    }));

  const wd = getWD(currentWeek);
  const availPlayers = roster.filter((p) => p.available);

  return (
    <div style={{ minHeight: "100vh", background: "#0a1628", color: "#e8dfc8" }}>
      <h1 style={{ padding: 20 }}>League Captain</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 16, padding: "0 20px" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? "#1a3a5c" : "transparent",
              color: tab === t ? "#fff" : "#7a9ab8",

              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20 }}>{toast}</div>
      )}
    </div>
  );
}
