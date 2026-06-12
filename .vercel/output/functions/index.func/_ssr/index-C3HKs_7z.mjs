import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Leaf, g as CircleUser, P as Package, X, j as Flame, B as Bell, i as Clock, q as Shield, f as CircleQuestionMark, c as ChevronRight, l as LogOut, a as Apple, S as Salad, n as Plus, e as CircleCheckBig, b as ChartNoAxesColumn, r as Star, d as CircleAlert, D as Droplets, A as Activity, h as CircleX, k as Lightbulb, C as Camera, o as Scan, F as FileText, M as Minus, G as GlassWater, s as TriangleAlert, p as ScanLine, T as Thermometer, W as Wind, m as Moon, Z as Zap, H as House } from "../_libs/lucide-react.mjs";
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
const C = {
  bg: "#F7F7F5",
  surface: "#FFFFFF",
  tint: "#F0EFEB",
  teal: "#1A9E8F",
  amber: "#D4860B",
  coral: "#D95F5F",
  green: "#2BAD6A",
  muted: "#9A9A9A",
  body: "#111111",
  dark: "#000000",
  border: "rgba(0,0,0,0.07)",
  tealTint: "#E6F5F3",
  amberTint: "#FBF2E0",
  coralTint: "#FBE7E7",
  greenTint: "#E3F5EB"
};
const AppCtx = reactExports.createContext(null);
const useApp = () => reactExports.useContext(AppCtx);
const STORAGE_KEY = "glowtics_app_data_v1";
const emptyData = {
  user: { name: "", memberSince: "", streak: 0 },
  analysisResults: { skinAnalysis: null, hairAnalysis: null, lastAnalyzedAt: null },
  nutritionLog: { breakfast: [], lunch: [], dinner: [], snacks: [] },
  nutritionInsights: null,
  reports: { glowScoreHistory: [], triggerHistory: [], productLog: [] },
  products: [],
  dailyLog: { sleep: 7, stress: 2, water: 4, food: [], productsUsed: [] },
  activity: [],
  achievements: [],
  logDays: []
};
const card = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
};
const label = {
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: 10,
  color: C.muted
};
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
.glow-root, .glow-root * { font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-shadow: none !important; }
.glow-root button { font-family: inherit; cursor: pointer; border: none; background: none; outline: none; -webkit-appearance: none; appearance: none; }
.glow-root input { font-family: inherit; outline: none; -webkit-appearance: none; appearance: none; }
.glow-root h1, .glow-root h2, .glow-root h3 { letter-spacing: -0.02em; font-weight: 700; margin: 0; color: ${C.dark}; }
.glow-root p { margin: 0; color: ${C.body}; line-height: 1.6; }
.glow-tap:active { transform: scale(0.97); transition: transform 0.1s; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px);} to {opacity:1; transform:translateY(0);} }
@keyframes fadeIn { from { opacity: 0;} to {opacity:1;} }
@keyframes shimmer { 0% { background-position: -400px 0;} 100% { background-position: 400px 0;} }
@keyframes drawLine { from { stroke-dashoffset: 1000;} to { stroke-dashoffset: 0;} }
@keyframes radarExpand { from { transform: scale(0); } to { transform: scale(1); } }
.glow-fadeup { animation: fadeUp 0.45s ease-out both; }
.glow-fadein { animation: fadeIn 0.35s ease-out both; }
.glow-shimmer { background: linear-gradient(90deg, #eee, #f7f7f5, #eee); background-size: 800px 100%; animation: shimmer 1.4s infinite linear; }
.glow-scroll-x { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.glow-scroll-x::-webkit-scrollbar { display: none; }
.glow-upload:hover { transform: scale(1.02); border-color: ${C.teal} !important; transition: all 0.2s; }
`;
const fmtTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 6e4;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};
function AppProvider({ children }) {
  const [data, setData] = reactExports.useState(emptyData);
  const [tab, setTab] = reactExports.useState("home");
  const [isMounted, setIsMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData((d) => ({
          ...emptyData,
          ...parsed,
          user: { ...emptyData.user, ...parsed?.user },
          analysisResults: { ...emptyData.analysisResults, ...parsed?.analysisResults },
          reports: { ...emptyData.reports, ...parsed?.reports },
          dailyLog: { ...emptyData.dailyLog, ...parsed?.dailyLog }
        }));
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }, []);
  reactExports.useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }, [data, isMounted]);
  const update = (fn) => setData((d) => {
    const next = structuredClone(d);
    fn(next);
    return next;
  });
  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
    setData(emptyData);
  };
  const pushActivity = (icon, text) => update((d) => {
    d.activity.unshift({ icon, text, time: (/* @__PURE__ */ new Date()).toISOString() });
    d.activity = d.activity.slice(0, 20);
    const today = (/* @__PURE__ */ new Date()).toDateString();
    if (!d.logDays.includes(today)) d.logDays.push(today);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppCtx.Provider, { value: { data, setData, update, tab, setTab, reset, pushActivity }, children });
}
function Onboarding() {
  const { update } = useApp();
  const [name, setName] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadeup", style: { ...card, padding: 32, maxWidth: 380, width: "100%", textAlign: "center" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 64, height: 64, borderRadius: 20, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 28, color: C.teal }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: 28, marginBottom: 8 }, children: "Glowtics" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: C.muted, marginBottom: 28, fontSize: 14 }, children: "Intelligent skin, hair & nutrition care" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, textAlign: "left", marginBottom: 8 }, children: "Your name" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        value: name,
        onChange: (e) => setName(e.target.value),
        placeholder: "Enter your name",
        style: { width: "100%", padding: "14px 16px", border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 15, marginBottom: 20, outline: "none", background: C.bg }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "glow-tap", disabled: !name.trim(), onClick: () => {
      update((d) => {
        d.user.name = name.trim();
        d.user.memberSince = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      });
    }, style: { width: "100%", padding: 14, borderRadius: 12, background: name.trim() ? C.teal : C.tint, color: name.trim() ? "#fff" : C.muted, fontWeight: 600, fontSize: 15, transition: "all 0.2s" }, children: "Get Started" })
  ] }) });
}
function BottomNav() {
  const { tab, setTab } = useApp();
  const tabs = [
    { id: "home", icon: House, label: "Home" },
    { id: "analyze", icon: ScanLine, label: "Analyze" },
    { id: "reports", icon: ChartNoAxesColumn, label: "Reports" },
    { id: "nutrition", icon: Leaf, label: "Nutrition" },
    { id: "profile", icon: CircleUser, label: "Profile" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "fixed", bottom: 0, left: 0, right: 0, height: 80, background: "#fff", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "center", zIndex: 50 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", maxWidth: 430, width: "100%", alignItems: "center", justifyContent: "space-around", padding: "0 8px" }, children: tabs.map((t) => {
    const active = tab === t.id;
    const Icon = t.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "glow-tap",
        onClick: () => setTab(t.id),
        style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 4px", borderRadius: 12, background: active ? C.tealTint : "transparent", transition: "all 0.25s", transform: active ? "scale(1)" : "scale(0.95)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 20, color: active ? C.teal : C.muted, strokeWidth: active ? 2.2 : 1.8 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 10, fontWeight: active ? 600 : 500, color: active ? C.teal : C.muted, letterSpacing: "0.04em" }, children: t.label })
        ]
      },
      t.id
    );
  }) }) });
}
function GlowRing({ score = 0 }) {
  const r = 70, c = 2 * Math.PI * r;
  const [dash, setDash] = reactExports.useState(c);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setDash(c - c * score / 100), 50);
    return () => clearTimeout(t);
  }, [score, c]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: 180, height: 180, viewBox: "0 0 180 180", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "grad", x1: "0", y1: "0", x2: "1", y2: "1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: C.teal }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "50%", stopColor: C.amber }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: C.green })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "90", cy: "90", r, fill: "none", stroke: C.tint, strokeWidth: "10" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "circle",
      {
        cx: "90",
        cy: "90",
        r,
        fill: "none",
        stroke: "url(#grad)",
        strokeWidth: "10",
        strokeLinecap: "round",
        strokeDasharray: c,
        strokeDashoffset: dash,
        transform: "rotate(-90 90 90)",
        style: { transition: "stroke-dashoffset 1s ease-out" }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: "90", y: "92", textAnchor: "middle", fontSize: "36", fontWeight: "700", fill: C.dark, children: score }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: "90", y: "112", textAnchor: "middle", fontSize: "10", fill: C.muted, style: { letterSpacing: "0.1em", textTransform: "uppercase" }, children: "Glow Score" })
  ] });
}
const iconMap = { droplets: Droplets, zap: Zap, moon: Moon, wind: Wind, thermometer: Thermometer };
const dotColor = { teal: C.teal, amber: C.amber, coral: C.coral, green: C.green };
function HomeTab() {
  const { data, setTab } = useApp();
  const sa = data.analysisResults.skinAnalysis || data.analysisResults.hairAnalysis;
  const greeting = (() => {
    const h = (/* @__PURE__ */ new Date()).getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();
  const initials = (data.user?.name || "").split(" ").map((s) => s[0] || "").join("").slice(0, 2).toUpperCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px 20px 100px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { style: { fontSize: 26 }, children: [
          greeting,
          ", ",
          data.user.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: C.muted, fontSize: 13, marginTop: 4 }, children: sa ? sa.dailySummary : "Complete your first scan to get started" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "glow-tap", style: { width: 38, height: 38, borderRadius: 12, background: "#fff", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 16, color: C.body }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 38, height: 38, borderRadius: "50%", background: C.tealTint, color: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }, children: initials })
      ] })
    ] }),
    sa ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadeup", style: { ...card, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GlowRing, { score: sa.glowScore }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }, children: [["Skin", sa.skinScore, C.teal], ["Hair", sa.hairScore, C.amber], ["Nutrition", sa.nutritionScore, C.green]].map(([n, v, col]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "6px 12px", borderRadius: 999, background: C.tint, fontSize: 12, color: C.body, display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: 6, height: 6, borderRadius: "50%", background: col } }),
        n,
        " ",
        v
      ] }, n)) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadeup", style: { ...card, padding: 28, textAlign: "center", marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 56, height: 56, borderRadius: 16, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { size: 24, color: C.teal }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontSize: 16, marginBottom: 6 }, children: "No scan yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 13, color: C.muted, marginBottom: 16 }, children: "Run your first analysis to unlock your Glow Score" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "glow-tap", onClick: () => setTab("analyze"), style: { padding: "10px 18px", borderRadius: 10, background: C.teal, color: "#fff", fontWeight: 600, fontSize: 13 }, children: "Start Scan" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 10, padding: "0 4px" }, children: "Today's insights" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glow-scroll-x", style: { display: "flex", gap: 12, marginBottom: 20, marginLeft: -20, paddingLeft: 20, paddingRight: 20 }, children: sa && Array.isArray(sa.insights) ? sa.insights.map((ins, i) => {
      const Ic = iconMap[ins.icon] || Droplets;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadeup", style: { ...card, padding: 16, minWidth: 150, animationDelay: `${i * 60}ms` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ic, { size: 18, color: C.body }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: dotColor[ins.colorDot] || C.teal } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 18, fontWeight: 700, color: C.dark }, children: ins.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, color: C.muted, marginTop: 2 }, children: ins.title })
      ] }, i);
    }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 16, width: "100%", textAlign: "center", border: `1px dashed ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { size: 20, color: C.teal }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 12, color: C.muted }, children: "Daily health insights will appear here once you complete a scan." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadeup", style: { background: C.tealTint, borderLeft: `3px solid ${C.teal}`, borderRadius: 12, padding: 16, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 2 }, children: "Routine Reminder" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 12, color: C.body }, children: sa ? sa.routineReminder : "Complete your scan to get a routine" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "glow-tap", onClick: () => setTab("analyze"), style: { padding: "8px 12px", borderRadius: 10, background: C.teal, color: "#fff", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }, children: "Analyze →" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 10, padding: "0 4px" }, children: "Recent activity" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...card, padding: 8 }, children: data.activity.slice(0, 3).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: 16, fontSize: 13, color: C.muted, textAlign: "center" }, children: "No activity yet" }) : data.activity.slice(0, 3).map((a, i) => {
      const Ic = iconMap[a.icon] || Activity;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 34, height: 34, borderRadius: 10, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ic, { size: 16, color: C.teal }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, fontSize: 13, color: C.body }, children: a.text }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, color: C.muted }, children: fmtTime(a.time) })
      ] }, i);
    }) })
  ] });
}
const skinQs = [
  { q: "How does your skin feel by midday?", a: ["Oily", "Dry", "Combination", "Normal"] },
  { q: "How often do you experience breakouts?", a: ["Rarely", "Sometimes", "Often", "Always"] },
  { q: "Do you notice redness or irritation?", a: ["Never", "Occasionally", "Frequently"] },
  { q: "How would you describe your skin texture?", a: ["Smooth", "Rough", "Uneven", "Bumpy"] },
  { q: "What is your primary skin concern? (Select one or more)", a: ["Acne", "Dryness", "Dark Spots", "Aging", "Dullness"], multiSelect: true }
];
const hairQs = [
  { q: "How does your scalp feel?", a: ["Oily", "Dry", "Balanced", "Itchy"] },
  { q: "How often does hair fall noticeably?", a: ["Rarely", "Sometimes", "Often", "Daily"] },
  { q: "What is your hair texture?", a: ["Fine", "Medium", "Thick", "Coarse"] },
  { q: "How frequently do you wash your hair?", a: ["Daily", "Every 2–3 days", "Weekly", "Less often"] },
  { q: "What is your primary hair concern?", a: ["Hair fall", "Dandruff", "Dryness", "Oiliness", "Frizz"] }
];
function UploadZone({ icon: Icon, title, image, onPick, onClear, accept = "image/*", showCamera = true }) {
  const fileInputRef = reactExports.useRef(null);
  const videoRef = reactExports.useRef(null);
  const [stream, setStream] = reactExports.useState(null);
  const [isCameraActive, setIsCameraActive] = reactExports.useState(false);
  const [cameraError, setCameraError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);
  const startCamera = async (e) => {
    e.stopPropagation();
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError("Camera access denied or unavailable.");
      setIsCameraActive(false);
    }
  };
  const stopCamera = (e) => {
    if (e) e.stopPropagation();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };
  const capturePhoto = (e) => {
    e.stopPropagation();
    if (videoRef.current && stream) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        onPick(dataUrl);
      }
      stopCamera();
    }
  };
  const isPdf = image && image.startsWith("data:application/pdf");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 16 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...label, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
      image ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: (e) => {
        e.stopPropagation();
        onClear();
      }, style: { fontSize: 11, color: C.coral, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }),
        " Clear"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 10, fontWeight: 600, color: C.coral, background: C.coralTint, padding: "2px 6px", borderRadius: 4 }, children: "Required" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept, hidden: true, onChange: (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const r = new FileReader();
        r.onload = () => onPick(r.result);
        r.readAsDataURL(file);
      }
    } }),
    isCameraActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { width: "100%", height: 220, borderRadius: 16, border: `2px solid ${C.teal}`, background: "#000", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, style: { width: "100%", height: "100%", objectFit: "cover" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 10, zIndex: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: capturePhoto, style: { padding: "8px 16px", borderRadius: 20, background: C.teal, color: "#fff", fontSize: 12, fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }, children: "Capture" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: stopCamera, style: { padding: "8px 16px", borderRadius: 20, background: "#fff", color: C.dark, fontSize: 12, fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }, children: "Cancel" })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "glow-upload glow-tap",
          onClick: () => fileInputRef.current?.click(),
          style: {
            width: "100%",
            height: 140,
            borderRadius: 16,
            border: image ? `2px dashed ${C.teal}` : `2px dashed rgba(239, 68, 68, 0.3)`,
            background: image ? "#fff" : "rgba(239, 68, 68, 0.01)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            overflow: "hidden",
            position: "relative",
            transition: "all 0.25s"
          },
          children: image ? isPdf ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: C.teal }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 32, color: C.teal }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 12, fontWeight: 600 }, children: "PDF Report Uploaded" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: image, alt: "", style: { width: "100%", height: "100%", objectFit: "cover" } }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 28, color: C.teal }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 12, color: C.body, fontWeight: 500 }, children: "Tap to upload file" })
          ] })
        }
      ),
      !image && showCamera && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: startCamera, style: { width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.teal}`, background: C.tealTint, color: C.teal, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 14 }),
        " Open Live Camera"
      ] }),
      cameraError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, color: C.coral, fontWeight: 500, marginTop: 2, textAlign: "center" }, children: cameraError })
    ] })
  ] });
}
function QuestionBlock({ qs, answers, setAnswers }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }, children: qs.map((qq, i) => {
    const isAnswered = answers[i] !== null && (!Array.isArray(answers[i]) || answers[i].length > 0);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "glow-fadeup",
        style: {
          ...card,
          padding: 14,
          animationDelay: `${i * 60}ms`,
          border: isAnswered ? `1px solid ${C.border}` : `1px solid rgba(239, 68, 68, 0.2)`,
          background: isAnswered ? C.surface : "rgba(239, 68, 68, 0.02)",
          transition: "all 0.25s"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 13, fontWeight: 600, color: C.dark }, children: qq.q }),
            !isAnswered && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 10, fontWeight: 600, color: C.coral, background: C.coralTint, padding: "2px 6px", borderRadius: 4 }, children: "Required" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: qq.a.map((opt) => {
            const isMulti = qq.multiSelect;
            const currentAns = answers[i];
            const sel = isMulti ? Array.isArray(currentAns) && currentAns.includes(opt) : currentAns === opt;
            const handleClick = () => {
              const n = [...answers];
              if (isMulti) {
                const arr = Array.isArray(currentAns) ? [...currentAns] : [];
                if (arr.includes(opt)) {
                  const filtered = arr.filter((x) => x !== opt);
                  n[i] = filtered.length > 0 ? filtered : null;
                } else {
                  arr.push(opt);
                  n[i] = arr;
                }
              } else {
                n[i] = opt;
              }
              setAnswers(n);
            };
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: "glow-tap",
                onClick: handleClick,
                style: { padding: "8px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500, background: sel ? C.teal : C.tint, color: sel ? "#fff" : C.body, transition: "all 0.15s" },
                children: opt
              },
              opt
            );
          }) })
        ]
      },
      i
    );
  }) });
}
async function callGemini(systemPrompt, userText, images = []) {
  const parts = [{ text: userText }];
  for (const img of images) {
    if (img.startsWith("data:")) {
      const match = img.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }
  }
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4
      }
    })
  });
  if (!res.ok) {
    let errMsg = `Status ${res.status}`;
    try {
      const errJson = await res.json();
      errMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {
    }
    throw new Error(`Gemini API Error: ${errMsg}`);
  }
  const j = await res.json();
  const txt = j.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return JSON.parse(txt);
}
const ANALYSIS_SYSTEM = 'You are Glowtics, an expert AI skin, hair and nutrition health coach. First, validate if the uploaded photo is indeed a valid close-up or clear shot of a human face, skin area, scalp, or hair. If the photo is invalid (e.g. an animal, landscape, random object, extremely blurry, or not human skin/hair), respond ONLY with a JSON object where "isValidImage" is false, and "invalidImageError" is a helpful string explaining what is wrong (e.g. "The uploaded photo does not appear to be a human face or scalp. Please upload or capture a clear, close-up photo."), and all other keys can be null or empty. If the photo is valid, analyze the photo along with the diagnostic answers and lifestyle data. Respond ONLY with a valid JSON object, no markdown, no preamble, no explanation. JSON keys required: isValidImage (boolean, set to true), invalidImageError (string, set to null), glowScore (number 0-100), skinScore (number 0-100), hairScore (number 0-100), nutritionScore (number 0-100), dailySummary (string, one sentence), rootCause (string), routineReminder (string), insights (array of 3 objects each with: icon (one of: droplets, zap, moon, wind, thermometer), title (string), value (string), colorDot (one of: teal, amber, coral, green)), skinAdvice (object: headline string, explanation string), nutritionAdvice (object: headline string, explanation string), lifestyleAdvice (object: headline string, explanation string), topIngredients (array of 3 strings), avoidIngredients (array of 3 strings), dailyTip (string), triggers (array of objects each with: label string, percentage number), nutrientDeficiencies (object with keys: vitaminC, zinc, omega3, iron, biotin — each a number 0-100 representing current level vs ideal), nutritionPlan (object: vitaminC object with current number and target number, same for vitaminD, biotin, zinc, omega3), recommendedFoods (array of 7 objects each with: name string, benefit string)).';
const BLOOD_REPORT_SYSTEM = 'You are Glowtics, an expert AI skin, hair and nutrition health coach. First, validate if the uploaded document or photo is indeed a valid medical blood report or lab test result. If the document is invalid (e.g. not a blood report, random document, landscape, animal, receipt, or unrelated image), respond ONLY with a JSON object where "isValidReport" is false, and "invalidReportError" is a helpful string explaining what is wrong (e.g. "The uploaded file does not appear to be a valid medical blood report. Please upload a clear document or image containing blood test results."), and all other keys can be null or empty. If the report is valid, analyze the blood biomarkers (e.g. iron, ferritin, vitamins, thyroid, lipids, etc.) in the context of skin, hair, and overall health. Respond ONLY with a valid JSON object, no markdown, no preamble, no explanation. JSON keys required: isValidReport (boolean, set to true), invalidReportError (string, set to null), glowScore (number 0-100), skinScore (number 0-100), hairScore (number 0-100), nutritionScore (number 0-100), dailySummary (string, one sentence summarizing the blood report findings), rootCause (string identifying key biomarker deficiencies or insights), routineReminder (string), insights (array of 3 objects each with: icon (one of: droplets, zap, moon, wind, thermometer), title (string), value (string), colorDot (one of: teal, amber, coral, green)), skinAdvice (object: headline string, explanation string), nutritionAdvice (object: headline string, explanation string), lifestyleAdvice (object: headline string, explanation string), topIngredients (array of 3 strings), avoidIngredients (array of 3 strings), dailyTip (string), triggers (array of objects each with: label string, percentage number), nutrientDeficiencies (object with keys: vitaminC, zinc, omega3, iron, biotin — each a number 0-100 representing current level vs ideal), nutritionPlan (object: vitaminC object with current number and target number, same for vitaminD, biotin, zinc, omega3), recommendedFoods (array of 7 objects each with: name string, benefit string)).';
function AnalyzeTab() {
  const { data, update, pushActivity, setTab } = useApp();
  const [analysisType, setAnalysisType] = reactExports.useState("skin");
  const [bloodTarget, setBloodTarget] = reactExports.useState("skin");
  const [skinImg, setSkinImg] = reactExports.useState(null);
  const [hairImg, setHairImg] = reactExports.useState(null);
  const [bloodReportFile, setBloodReportFile] = reactExports.useState(null);
  const [skinAns, setSkinAns] = reactExports.useState(Array(5).fill(null));
  const [hairAns, setHairAns] = reactExports.useState(Array(5).fill(null));
  const [sleep, setSleep] = reactExports.useState(data.dailyLog.sleep);
  const [stress, setStress] = reactExports.useState(data.dailyLog.stress);
  const [water, setWater] = reactExports.useState(data.dailyLog.water);
  const [skincareProducts, setSkincareProducts] = reactExports.useState({
    facewash: { used: null, brand: "" },
    serum: { used: null, brand: "" },
    moisturizer: { used: null, brand: "" }
  });
  const [hairProducts, setHairProducts] = reactExports.useState({
    shampoo: { used: null, brand: "" },
    conditioner: { used: null, brand: "" },
    oil: { used: null, brand: "" }
  });
  const [loading, setLoading] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState(null);
  const [result, setResult] = reactExports.useState(null);
  const skinDone = skinImg && skinAns.every((val) => val !== null && (!Array.isArray(val) || val.length > 0));
  const hairDone = hairImg && hairAns.every(Boolean);
  const ready = analysisType === "skin" ? skinDone : analysisType === "hair" ? hairDone : !!bloodReportFile;
  const handlePick = (which, b64) => {
    if (which === "skin") setSkinImg(b64);
    else if (which === "hair") setHairImg(b64);
    else setBloodReportFile(b64);
  };
  const analyze = async () => {
    setLoading(true);
    setErr(null);
    try {
      let json;
      let activeProducts = [];
      if (analysisType === "skin" || analysisType === "hair") {
        const targetImg = analysisType === "skin" ? skinImg : hairImg;
        const targetAns = analysisType === "skin" ? skinAns : hairAns;
        if (analysisType === "skin") {
          if (skincareProducts.facewash.used) activeProducts.push(`Face Wash (Brand: ${skincareProducts.facewash.brand || "Not specified"})`);
          if (skincareProducts.serum.used) activeProducts.push(`Serum (Brand: ${skincareProducts.serum.brand || "Not specified"})`);
          if (skincareProducts.moisturizer.used) activeProducts.push(`Moisturizer (Brand: ${skincareProducts.moisturizer.brand || "Not specified"})`);
        } else {
          if (hairProducts.shampoo.used) activeProducts.push(`Shampoo (Brand: ${hairProducts.shampoo.brand || "Not specified"})`);
          if (hairProducts.conditioner.used) activeProducts.push(`Conditioner (Brand: ${hairProducts.conditioner.brand || "Not specified"})`);
          if (hairProducts.oil.used) activeProducts.push(`Hair Oil/Serum (Brand: ${hairProducts.oil.brand || "Not specified"})`);
        }
        const userText = `Analysis Target: ${analysisType.toUpperCase()}
User diagnostic answers: ${JSON.stringify(targetAns)}
Sleep: ${sleep}h, Stress: ${stress}/5, Water: ${water} glasses
Skincare/Haircare products: ${activeProducts.join(", ") || "None"}
Return the required JSON only.`;
        const images = [targetImg].filter(Boolean);
        json = await callGemini(ANALYSIS_SYSTEM, userText, images);
        if (json.isValidImage === false) {
          throw new Error(json.invalidImageError || "The uploaded image does not appear to be a human face or scalp. Please capture a clear, close-up photo.");
        }
      } else {
        const userText = `Analysis Target: BLOOD REPORT ANALYSIS (Focusing on ${bloodTarget.toUpperCase()} health and nutrition insights)
Sleep: ${sleep}h, Stress: ${stress}/5, Water: ${water} glasses
Return the required JSON only.`;
        const files = [bloodReportFile].filter(Boolean);
        json = await callGemini(BLOOD_REPORT_SYSTEM, userText, files);
        if (json.isValidReport === false) {
          throw new Error(json.invalidReportError || "The uploaded file does not appear to be a valid medical blood report. Please upload a clear document or image containing blood test results.");
        }
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      update((d) => {
        if (analysisType === "skin" || analysisType === "hair") {
          if (analysisType === "skin") d.analysisResults.skinAnalysis = json;
          else d.analysisResults.hairAnalysis = json;
        } else {
          if (bloodTarget === "skin") d.analysisResults.skinAnalysis = json;
          else d.analysisResults.hairAnalysis = json;
        }
        d.analysisResults.lastAnalyzedAt = now;
        d.reports.glowScoreHistory.push({ score: json.glowScore, at: now });
        d.dailyLog = { sleep, stress, water, food: [], productsUsed: activeProducts };
        if (!d.achievements.includes("First Scan")) d.achievements.push("First Scan");
        const today = (/* @__PURE__ */ new Date()).toDateString();
        if (!d.logDays.includes(today)) d.logDays.push(today);
      });
      pushActivity("zap", analysisType === "skin" || analysisType === "hair" ? `Completed AI ${analysisType} analysis` : `Completed AI blood report analysis focusing on ${bloodTarget}`);
      setResult(json);
    } catch (e) {
      setErr(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };
  if (result) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px 20px 100px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: 24, marginBottom: 16 }, children: "Your Results" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadeup", style: { background: C.amberTint, borderLeft: `3px solid ${C.amber}`, borderRadius: 12, padding: 16, marginBottom: 12, display: "flex", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 18, color: C.amber, style: { flexShrink: 0, marginTop: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 4 }, children: "Root cause" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 13, color: C.body }, children: result.rootCause })
        ] })
      ] }),
      [
        { icon: Droplets, key: "skinAdvice" },
        { icon: Apple, key: "nutritionAdvice" },
        { icon: Activity, key: "lifestyleAdvice" }
      ].map((x, i) => {
        const Ic = x.icon;
        const v = result[x.key];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadeup", style: { ...card, padding: 16, marginBottom: 10, animationDelay: `${i * 80}ms` }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 34, height: 34, borderRadius: 10, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ic, { size: 16, color: C.teal }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 14, fontWeight: 600, color: C.dark }, children: v.headline })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 13, color: C.body, marginBottom: 8 }, children: v.explanation }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: { fontSize: 12, color: C.teal, fontWeight: 600 }, children: "Learn more →" })
        ] }, x.key);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, margin: "20px 0 8px" }, children: "Recommended ingredients" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }, children: result.topIngredients.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { padding: "8px 12px", borderRadius: 999, background: C.tealTint, color: C.teal, fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 12 }),
        " ",
        t
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 8 }, children: "Avoid" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }, children: result.avoidIngredients.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { padding: "8px 12px", borderRadius: 999, background: C.coralTint, color: C.coral, fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 12 }),
        " ",
        t
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: C.tealTint, borderRadius: 12, padding: 16, display: "flex", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { size: 18, color: C.teal, style: { flexShrink: 0, marginTop: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 4, color: C.teal }, children: "Daily tip" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 13, color: C.body }, children: result.dailyTip })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "glow-tap", onClick: () => setTab("reports"), style: { width: "100%", marginTop: 20, padding: 14, borderRadius: 12, background: C.teal, color: "#fff", fontWeight: 600, fontSize: 14 }, children: "View full report" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px 20px 100px", position: "relative" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: 24, marginBottom: 6 }, children: "Analyze" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 13, color: C.muted, marginBottom: 20 }, children: "Upload a photo or submit a medical report for personalized AI insights." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", background: C.tint, borderRadius: 12, padding: 4, marginBottom: 20 }, children: [
      { id: "skin", label: "Skin Care" },
      { id: "hair", label: "Hair Care" },
      { id: "blood", label: "Blood Analysis" }
    ].map((t) => {
      const active = analysisType === t.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "glow-tap", onClick: () => setAnalysisType(t.id), style: { flex: 1, padding: "10px 0", borderRadius: 10, background: active ? C.teal : "transparent", color: active ? "#fff" : C.muted, fontWeight: 600, fontSize: 13, transition: "all 0.2s" }, children: t.label }, t.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }, children: analysisType === "skin" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadein", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UploadZone, { icon: Camera, title: "Skin Photo", image: skinImg, onPick: (b64) => handlePick("skin", b64), onClear: () => setSkinImg(null) }),
      skinImg && /* @__PURE__ */ jsxRuntimeExports.jsx(QuestionBlock, { qs: skinQs, answers: skinAns, setAnswers: setSkinAns })
    ] }) : analysisType === "hair" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadein", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UploadZone, { icon: Scan, title: "Scalp / Hair Photo", image: hairImg, onPick: (b64) => handlePick("hair", b64), onClear: () => setHairImg(null) }),
      hairImg && /* @__PURE__ */ jsxRuntimeExports.jsx(QuestionBlock, { qs: hairQs, answers: hairAns, setAnswers: setHairAns })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadein", style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 14, background: C.greenTint, border: `1px solid ${C.green}33`, borderRadius: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 13, fontWeight: 600, color: C.green, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 14, color: C.green }),
          " Supported Test Biomarkers:"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { style: { margin: 0, paddingLeft: 18, fontSize: 12, color: C.body, display: "flex", flexDirection: "column", gap: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "CBC" }),
            " (Complete Blood Count)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Thyroid Profile" }),
            " (TSH, T3, T4)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Vitamins" }),
            " (Vitamin D, B12, Iron/Ferritin)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Lipids" }),
            " (Cholesterol, Triglycerides)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Other clinical observations for skin and hair health" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 10 }, children: "Focus of Blood Analysis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", background: C.tint, borderRadius: 10, padding: 3 }, children: [
          { id: "skin", label: "Skin Care Focus" },
          { id: "hair", label: "Hair Care Focus" }
        ].map((bt) => {
          const sel = bloodTarget === bt.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "glow-tap",
              onClick: () => setBloodTarget(bt.id),
              style: { flex: 1, padding: "8px 0", borderRadius: 8, background: sel ? C.teal : "transparent", color: sel ? "#fff" : C.muted, fontWeight: 600, fontSize: 12, transition: "all 0.15s" },
              children: bt.label
            },
            bt.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(UploadZone, { icon: FileText, title: "Blood Report Document", image: bloodReportFile, onPick: (b64) => handlePick("blood", b64), onClear: () => setBloodReportFile(null), accept: "image/*,application/pdf", showCamera: false })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 16, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 14 }, children: "Daily log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 13, color: C.body }, children: "Sleep" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { padding: "2px 10px", borderRadius: 999, background: C.tealTint, color: C.teal, fontSize: 11, fontWeight: 600 }, children: [
            sleep,
            "h"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: "0", max: "12", step: "0.5", value: sleep, onChange: (e) => setSleep(Number(e.target.value)), style: { width: "100%", accentColor: C.teal } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 13, color: C.body, marginBottom: 8 }, children: "Stress level" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8 }, children: [1, 2, 3, 4, 5].map((n) => {
          const sel = stress >= n;
          const col = n <= 2 ? C.green : n === 3 ? C.amber : C.coral;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStress(n), style: { width: 28, height: 28, borderRadius: "50%", background: sel ? col : C.tint, transition: "all 0.2s" } }, n);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 13, color: C.body }, children: "Water intake" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setWater(Math.max(0, water - 1)), style: { width: 28, height: 28, borderRadius: 8, background: C.tint, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { size: 14, color: C.body }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }, children: water }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setWater(water + 1), style: { width: 28, height: 28, borderRadius: 8, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, color: C.teal }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 4 }, children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(GlassWater, { size: 18, color: i < water ? C.teal : C.tint, fill: i < water ? C.tealTint : "none", style: { transition: "all 0.3s" } }, i)) })
      ] }),
      (analysisType === "skin" || analysisType === "hair") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 12 }, children: analysisType === "skin" ? "Skincare Products Used" : "Haircare Products Used" }),
        (analysisType === "skin" ? [
          { id: "facewash", label: "Face Wash" },
          { id: "serum", label: "Serum" },
          { id: "moisturizer", label: "Moisturizer" }
        ] : [
          { id: "shampoo", label: "Shampoo" },
          { id: "conditioner", label: "Conditioner" },
          { id: "oil", label: "Hair Oil/Serum" }
        ]).map((prod) => {
          const state = analysisType === "skin" ? skincareProducts[prod.id] : hairProducts[prod.id];
          const setProducts = analysisType === "skin" ? setSkincareProducts : setHairProducts;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 12, background: C.bg, padding: 12, borderRadius: 12, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 13, fontWeight: 600, color: C.dark }, children: prod.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 6 }, children: [
                { val: true, text: "Yes" },
                { val: false, text: "No" }
              ].map((btn) => {
                const sel = state.used === btn.val;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: "glow-tap",
                    onClick: () => setProducts((p) => ({ ...p, [prod.id]: { ...p[prod.id], used: btn.val } })),
                    style: { padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: sel ? C.teal : C.tint, color: sel ? "#fff" : C.muted, transition: "all 0.15s" },
                    children: btn.text
                  },
                  btn.text
                );
              }) })
            ] }),
            state.used === true && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glow-fadein", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: state.brand,
                onChange: (e) => {
                  const v = e.target.value;
                  setProducts((p) => ({ ...p, [prod.id]: { ...p[prod.id], brand: v } }));
                },
                placeholder: `What brand do you use?`,
                style: { width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, background: C.surface, outline: "none", color: C.dark }
              }
            ) })
          ] }, prod.id);
        })
      ] })
    ] }),
    err && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 16, marginBottom: 16, textAlign: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 24, color: C.coral, style: { margin: "0 auto 8px" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 13, color: C.body, marginBottom: 10 }, children: [
        "Analysis failed: ",
        err
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "glow-tap", onClick: analyze, style: { padding: "8px 16px", borderRadius: 10, background: C.teal, color: "#fff", fontSize: 12, fontWeight: 600 }, children: "Retry" })
    ] }),
    !ready && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadein", style: { background: "rgba(239, 68, 68, 0.02)", borderRadius: 12, padding: 12, marginBottom: 16, border: `1px dashed rgba(239, 68, 68, 0.2)` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 12, fontWeight: 600, color: C.coral, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 14, color: C.coral }),
        " Remaining steps:"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { style: { margin: 0, paddingLeft: 18, fontSize: 12, color: C.body, display: "flex", flexDirection: "column", gap: 4 }, children: analysisType === "skin" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        !skinImg && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Upload or capture a Skin Photo" }),
        skinAns.map((ans, idx) => {
          const isAnswered = ans !== null && (!Array.isArray(ans) || ans.length > 0);
          if (!isAnswered) {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "Answer question ",
              idx + 1,
              ': "',
              skinQs[idx].q,
              '"'
            ] }, idx);
          }
          return null;
        })
      ] }) : analysisType === "hair" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        !hairImg && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Upload or capture a Scalp / Hair Photo" }),
        hairAns.map((ans, idx) => {
          if (ans === null) {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "Answer question ",
              idx + 1,
              ': "',
              hairQs[idx].q,
              '"'
            ] }, idx);
          }
          return null;
        })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: !bloodReportFile && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Upload a Blood Report (PDF or Image)" }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "glow-tap",
        disabled: !ready || loading,
        onClick: analyze,
        style: { width: "100%", padding: 16, borderRadius: 12, background: ready ? C.teal : C.tint, color: ready ? "#fff" : C.muted, fontWeight: 600, fontSize: 15, transition: "all 0.2s" },
        children: loading ? "Analyzing..." : "Analyze Now"
      }
    ),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "fixed", inset: 0, background: "rgba(247,247,245,0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 100 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glow-shimmer", style: { width: 80, height: 80, borderRadius: "50%", marginBottom: 20 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 15, fontWeight: 600, color: C.dark }, children: "Analyzing your skin & hair..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 12, color: C.muted, marginTop: 6 }, children: "This may take a moment" })
    ] })
  ] });
}
function LineChart({ points }) {
  const W = 320, H = 140, pad = 16;
  if (points.length === 0) return null;
  if (points.length === 1) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: 30 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 14, height: 14, borderRadius: "50%", background: C.teal, margin: "0 auto 10px" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 12, color: C.muted }, children: "Scan again tomorrow to see your trend" })
    ] });
  }
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const xs = points.map((_, i) => pad + i * (W - pad * 2) / (points.length - 1));
  const ys = points.map((p) => H - pad - (p - min) / range * (H - pad * 2));
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < points.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` Q ${cx} ${ys[i - 1]} ${cx} ${(ys[i - 1] + ys[i]) / 2} T ${xs[i]} ${ys[i]}`;
  }
  const fill = d + ` L ${xs[xs.length - 1]} ${H - pad} L ${xs[0]} ${H - pad} Z`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "100%", height: H, viewBox: `0 0 ${W} ${H}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "lg", x1: "0", x2: "0", y1: "0", y2: "1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: C.teal, stopOpacity: "0.3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: C.teal, stopOpacity: "0" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: fill, fill: "url(#lg)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "path",
      {
        d,
        stroke: C.teal,
        strokeWidth: "2.5",
        fill: "none",
        strokeLinecap: "round",
        strokeDasharray: "1000",
        style: { animation: "drawLine 1.2s ease-out forwards" }
      }
    ),
    xs.map((x, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: x, cy: ys[i], r: "3", fill: C.teal }, i))
  ] });
}
function ReportsTab() {
  const { data, update } = useApp();
  const [filter, setFilter] = reactExports.useState("Week");
  const sa = data.analysisResults.skinAnalysis || data.analysisResults.hairAnalysis;
  const history = data.reports.glowScoreHistory.map((h) => h.score);
  const [newProd, setNewProd] = reactExports.useState("");
  const [newCat, setNewCat] = reactExports.useState("");
  if (!sa) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "60px 20px 100px", textAlign: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 64, height: 64, borderRadius: 16, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { size: 28, color: C.teal }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: 18, marginBottom: 8 }, children: "No reports yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 13, color: C.muted }, children: "Run your first scan to see reports" })
    ] });
  }
  const prev = history.length > 1 ? history[history.length - 2] : null;
  const cur = history[history.length - 1];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px 20px 100px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: 24, marginBottom: 16 }, children: "Reports" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 6, marginBottom: 16 }, children: ["Week", "Month", "3 Months"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setFilter(f),
        className: "glow-tap",
        style: { padding: "8px 14px", borderRadius: 999, background: filter === f ? C.teal : C.tint, color: filter === f ? "#fff" : C.muted, fontSize: 12, fontWeight: 500 },
        children: f
      },
      f
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadeup", style: { ...card, padding: 16, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 4 }, children: "Glow Score Trend" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 22, fontWeight: 700, marginBottom: 8 }, children: [
        cur,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 12, color: C.muted, marginLeft: 6 }, children: "current" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LineChart, { points: history })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }, children: [["Skin", sa.skinScore, C.teal], ["Hair", sa.hairScore, C.amber], ["Nutrition", sa.nutritionScore, C.green]].map(([n, v, col], i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadeup", style: { ...card, padding: 14, animationDelay: `${i * 60}ms` }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 6 }, children: n }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 22, fontWeight: 700, color: col }, children: v }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 10, color: C.muted, marginTop: 4 }, children: prev ? `vs ${prev} last scan` : "First scan" })
    ] }, n)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadeup", style: { ...card, padding: 16, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 12 }, children: "Trigger Analysis" }),
      sa.triggers?.map((t, i) => {
        const col = [C.teal, C.amber, C.coral, C.green][i % 4];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 12, color: C.body }, children: t.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: 12, fontWeight: 600, color: col }, children: [
              t.percentage,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 6, background: C.tint, borderRadius: 999, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: `${t.percentage}%`, height: "100%", background: col, borderRadius: 999, transition: "width 0.8s ease-out" } }) })
        ] }, i);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 12 }, children: "Product Effectiveness" }),
      data.reports.productLog.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 13, color: C.muted, padding: "10px 0" }, children: "No products logged yet" }) : data.reports.productLog.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < data.reports.productLog.length - 1 ? `1px solid ${C.border}` : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 13, fontWeight: 500, color: C.dark }, children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-block", padding: "2px 8px", borderRadius: 999, background: C.tealTint, color: C.teal, fontSize: 10, marginTop: 2 }, children: p.category })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 2 }, children: [1, 2, 3, 4, 5].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 12, color: s <= (p.rating || 4) ? C.amber : C.tint, fill: s <= (p.rating || 4) ? C.amber : "none" }, s)) })
      ] }, i)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, marginTop: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newProd, onChange: (e) => setNewProd(e.target.value), placeholder: "Product name", style: { flex: 1, padding: 10, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, outline: "none" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newCat, onChange: (e) => setNewCat(e.target.value), placeholder: "Category", style: { width: 100, padding: 10, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, outline: "none" } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "glow-tap", onClick: () => {
        if (!newProd.trim()) return;
        update((d) => d.reports.productLog.push({ name: newProd.trim(), category: newCat.trim() || "General", rating: 4 }));
        setNewProd("");
        setNewCat("");
      }, style: { width: "100%", marginTop: 8, padding: 10, borderRadius: 10, border: `1px solid ${C.teal}`, color: C.teal, fontSize: 12, fontWeight: 600 }, children: "Add Product" })
    ] })
  ] });
}
function RadarChart({ values }) {
  const keys = ["vitaminC", "zinc", "omega3", "iron", "biotin"];
  const labels = ["Vit C", "Zinc", "Omega-3", "Iron", "Biotin"];
  const cx = 130, cy = 120, R = 80;
  const angle = (i) => -Math.PI / 2 + i * 2 * Math.PI / 5;
  const pt = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  const outer = keys.map((_, i) => pt(i, R).join(",")).join(" ");
  const inner = keys.map((k, i) => pt(i, R * ((values?.[k] ?? 0) / 100)).join(",")).join(" ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "100%", height: "240", viewBox: "0 0 260 240", children: [
    [0.25, 0.5, 0.75, 1].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: keys.map((_, i) => pt(i, R * s).join(",")).join(" "), fill: "none", stroke: C.border, strokeWidth: "1" }, s)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { points: outer, fill: "none", stroke: C.teal, strokeWidth: "1.5", strokeDasharray: "4 3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "polygon",
      {
        points: inner,
        fill: C.amber,
        fillOpacity: "0.35",
        stroke: C.amber,
        strokeWidth: "2",
        style: { transformOrigin: `${cx}px ${cy}px`, animation: "radarExpand 0.8s ease-out" }
      }
    ),
    labels.map((l, i) => {
      const [x, y] = pt(i, R + 18);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x, y: y + 4, textAnchor: "middle", fontSize: "10", fill: C.body, children: l }, l);
    })
  ] });
}
function NutritionTab() {
  const { data, update, pushActivity } = useApp();
  const sa = data.analysisResults.skinAnalysis || data.analysisResults.hairAnalysis;
  const [expanded, setExpanded] = reactExports.useState(null);
  const [insightLoading, setInsightLoading] = reactExports.useState(false);
  const [addingFor, setAddingFor] = reactExports.useState(null);
  const [val, setVal] = reactExports.useState("");
  if (!sa) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "60px 20px 100px", textAlign: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 64, height: 64, borderRadius: 16, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 28, color: C.teal }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: 18, marginBottom: 8 }, children: "No nutrition plan yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 13, color: C.muted }, children: "Run your first scan to unlock" })
    ] });
  }
  const nutrients = [
    { key: "vitaminC", name: "Vitamin C", unit: "mg" },
    { key: "vitaminD", name: "Vitamin D", unit: "IU" },
    { key: "biotin", name: "Biotin", unit: "mcg" },
    { key: "zinc", name: "Zinc", unit: "mg" },
    { key: "omega3", name: "Omega-3", unit: "mg" }
  ];
  const addFood = (section) => {
    if (!val.trim()) return;
    update((d) => d.nutritionLog[section].push(val.trim()));
    pushActivity("droplets", `Logged ${val.trim()} for ${section}`);
    setVal("");
    setAddingFor(null);
  };
  const getInsights = async () => {
    setInsightLoading(true);
    try {
      const sys = "You are Glowtics nutrition AI. Analyze the user's meal log and respond ONLY with valid JSON. Keys: macroBreakdown (object: protein number 0-100, carbs number 0-100, fats number 0-100), nutritionFeedback (string, one sentence), suggestions (array of 3 strings).";
      const txt = `Meal log: ${JSON.stringify(data.nutritionLog)}`;
      const json = await callGemini(sys, txt);
      update((d) => {
        d.nutritionInsights = json;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setInsightLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px 20px 100px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: 24, marginBottom: 16 }, children: "Nutrition" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadeup", style: { ...card, padding: 16, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 4 }, children: "Your nutrition plan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 15, fontWeight: 600, color: C.dark }, children: sa.nutritionAdvice.headline })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadeup", style: { ...card, padding: 16, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 4 }, children: "Nutrient deficiency radar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RadarChart, { values: sa.nutrientDeficiencies }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 16, justifyContent: "center", fontSize: 11, color: C.muted }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: 10, height: 10, background: C.amber, borderRadius: 2 } }),
          " Current"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: 10, height: 10, border: `1.5px dashed ${C.teal}` } }),
          " Ideal"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 16, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 12 }, children: "Today's nutrition goals" }),
      nutrients.map((n, i) => {
        const v = sa.nutritionPlan?.[n.key];
        if (!v) return null;
        const pct = Math.min(100, v.current / v.target * 100);
        const isExp = expanded === n.key;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setExpanded(isExp ? null : n.key), style: { padding: "12px 0", borderBottom: i < nutrients.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Apple, { size: 16, color: C.teal }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, fontSize: 13, color: C.body }, children: n.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 11, color: C.muted }, children: [
              v.current,
              " of ",
              v.target,
              " ",
              n.unit
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 5, background: C.tint, borderRadius: 999, marginTop: 8, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: `${pct}%`, height: "100%", background: C.teal, transition: "width 0.8s ease-out" } }) }),
          isExp && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadein", style: { marginTop: 8, fontSize: 11, color: C.muted }, children: [
            "Sources: ",
            sa.recommendedFoods?.slice(0, 3).map((f) => f.name).join(", ")
          ] })
        ] }, n.key);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 10, padding: "0 4px" }, children: "Recommended foods" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glow-scroll-x", style: { display: "flex", gap: 10, marginBottom: 20, marginLeft: -20, paddingLeft: 20, paddingRight: 20 }, children: sa.recommendedFoods?.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 14, minWidth: 140 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Salad, { size: 20, color: C.teal, style: { marginBottom: 8 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 4 }, children: f.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { padding: "3px 8px", borderRadius: 999, background: C.tealTint, color: C.teal, fontSize: 10 }, children: [
        "Good for: ",
        f.benefit
      ] })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 10, padding: "0 4px" }, children: "Meal log (today)" }),
    ["breakfast", "lunch", "dinner", "snacks"].map((sec) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 14, marginBottom: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 13, fontWeight: 600, color: C.dark, textTransform: "capitalize" }, children: sec }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setAddingFor(addingFor === sec ? null : sec), style: { width: 26, height: 26, borderRadius: 8, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, color: C.teal }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 }, children: [
        data.nutritionLog[sec].length === 0 && addingFor !== sec && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 12, color: C.muted }, children: "Nothing logged" }),
        data.nutritionLog[sec].map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { padding: "5px 10px", borderRadius: 999, background: C.tint, fontSize: 11, color: C.body, display: "flex", alignItems: "center", gap: 5 }, children: [
          f,
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => update((d) => {
            d.nutritionLog[sec].splice(i, 1);
          }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 10, color: C.muted }) })
        ] }, i))
      ] }),
      addingFor === sec && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          autoFocus: true,
          value: val,
          onChange: (e) => setVal(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && addFood(sec),
          placeholder: "Type food and press Enter",
          style: { width: "100%", marginTop: 8, padding: 8, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, outline: "none" }
        }
      )
    ] }, sec)),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "glow-tap",
        disabled: insightLoading,
        onClick: getInsights,
        style: { width: "100%", marginTop: 12, padding: 14, borderRadius: 12, background: C.teal, color: "#fff", fontWeight: 600, fontSize: 14 },
        children: insightLoading ? "Analyzing meals..." : "Get AI Nutrition Insights"
      }
    ),
    data.nutritionInsights && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-fadeup", style: { ...card, padding: 16, marginTop: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 10 }, children: "AI Insights" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 13, color: C.body, marginBottom: 12 }, children: data.nutritionInsights.nutritionFeedback }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: 12 }, children: ["protein", "carbs", "fats"].map((m) => {
        const v = data.nutritionInsights.macroBreakdown?.[m] || 0;
        const col = { protein: C.teal, carbs: C.amber, fats: C.green }[m];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { textTransform: "capitalize", color: C.body }, children: m }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: col, fontWeight: 600 }, children: [
              v,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 5, background: C.tint, borderRadius: 999, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: `${v}%`, height: "100%", background: col, transition: "width 0.8s" } }) })
        ] }, m);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 6 }, children: "Suggestions" }),
      data.nutritionInsights.suggestions?.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, fontSize: 12, color: C.body, marginBottom: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 14, color: C.teal, style: { flexShrink: 0, marginTop: 2 } }),
        s
      ] }, i))
    ] })
  ] });
}
function Sparkline({ data }) {
  const pts = data.filter((x) => x !== null);
  if (pts.length < 2) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 10, color: C.muted }, children: "Not enough data" });
  const W = 80, H = 24;
  const min = Math.min(...pts), max = Math.max(...pts);
  const range = max - min || 1;
  const xs = pts.map((_, i) => i * W / (pts.length - 1));
  const ys = pts.map((p) => H - (p - min) / range * H);
  const d = xs.map((x, i) => `${i ? "L" : "M"} ${x} ${ys[i]}`).join(" ");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: W, height: H, children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d, stroke: C.teal, strokeWidth: "1.5", fill: "none" }) });
}
function ProfileTab() {
  const { data, update, reset, setTab } = useApp();
  const [edit, setEdit] = reactExports.useState(false);
  const [nm, setNm] = reactExports.useState(data.user?.name || "");
  const [newProd, setNewProd] = reactExports.useState("");
  const sa = data.analysisResults.skinAnalysis || data.analysisResults.hairAnalysis;
  const initials = (data.user?.name || "").split(" ").map((s) => s[0] || "").join("").slice(0, 2).toUpperCase();
  const history = data.reports.glowScoreHistory.map((h) => h.score);
  const padded = [...Array(Math.max(0, 7 - history.length)).fill(null), ...history].slice(-7);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "24px 20px 100px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", marginBottom: 20 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 80, height: 80, borderRadius: "50%", background: C.tealTint, color: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, margin: "0 auto 12px", border: `3px solid ${C.teal}` }, children: initials || /* @__PURE__ */ jsxRuntimeExports.jsx(CircleUser, { size: 40 }) }),
      edit ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, justifyContent: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: nm, onChange: (e) => setNm(e.target.value), style: { padding: 8, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, textAlign: "center", outline: "none" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "glow-tap", onClick: () => {
          update((d) => {
            d.user.name = nm;
          });
          setEdit(false);
        }, style: { padding: "8px 14px", borderRadius: 8, background: C.teal, color: "#fff", fontSize: 12, fontWeight: 600 }, children: "Save" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: 20 }, children: data.user.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: 12, color: C.muted, marginTop: 2 }, children: [
          "Glowtics member since ",
          data.user.memberSince
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "glow-tap", onClick: () => setEdit(true), style: { marginTop: 10, padding: "6px 14px", borderRadius: 10, border: `1px solid ${C.teal}`, color: C.teal, fontSize: 11, fontWeight: 600 }, children: "Edit Name" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 16, marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 12 }, children: "Skin & Hair Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
        { l: "Skin Type", v: sa ? skinQs[0].q && "Custom" : "—" },
        { l: "Hair Type", v: sa ? "Custom" : "—" },
        { l: "Primary Concern", v: sa?.rootCause?.split(" ").slice(0, 2).join(" ") || "—" },
        { l: "Goal", v: sa ? "Healthy glow" : "—" }
      ].map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }, children: x.l }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "4px 10px", borderRadius: 999, background: C.tealTint, color: C.teal, fontSize: 11, fontWeight: 500 }, children: x.v })
      ] }, x.l)) })
    ] }),
    sa && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 16, marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 8 }, children: "Last analysis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 12, color: C.muted, marginBottom: 10 }, children: fmtTime(data.analysisResults.lastAnalyzedAt) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8, marginBottom: 12 }, children: [["Glow", sa.glowScore], ["Skin", sa.skinScore], ["Hair", sa.hairScore]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, padding: 10, borderRadius: 10, background: C.tint, textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 16, fontWeight: 700 }, children: v }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 10, color: C.muted }, children: l })
      ] }, l)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "glow-tap", onClick: () => setTab("analyze"), style: { width: "100%", padding: 10, borderRadius: 10, background: C.teal, color: "#fff", fontSize: 12, fontWeight: 600 }, children: "Re-analyze" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 16, marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 12 }, children: "Lifestyle Snapshot" }),
      [
        { l: "Sleep", v: `${data.dailyLog.sleep}h` },
        { l: "Stress", v: `${data.dailyLog.stress}/5` },
        { l: "Water", v: `${data.dailyLog.water} cups` },
        { l: "Activity", v: `${data.logDays.length} days` }
      ].map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 12, color: C.muted }, children: x.l }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 14, fontWeight: 600 }, children: x.v })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkline, { data: padded })
      ] }, x.l))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 16, marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 10 }, children: "Current Products" }),
      data.products.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 12, color: C.muted, marginBottom: 10 }, children: "No products added" }),
      data.products.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < data.products.length - 1 ? `1px solid ${C.border}` : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 16, color: C.body }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, fontSize: 13, color: C.body }, children: p }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => update((d) => d.products.splice(i, 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14, color: C.muted }) })
      ] }, i)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, marginTop: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newProd, onChange: (e) => setNewProd(e.target.value), placeholder: "Product name", style: { flex: 1, padding: 8, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, outline: "none" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "glow-tap", onClick: () => {
          if (newProd.trim()) {
            update((d) => d.products.push(newProd.trim()));
            setNewProd("");
          }
        }, style: { padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.teal}`, color: C.teal, fontSize: 12, fontWeight: 600 }, children: "Add" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 16, marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...label, marginBottom: 4 }, children: "Streak" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 20, color: C.amber }),
          data.logDays.length,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 12, color: C.muted, fontWeight: 400 }, children: "days" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-scroll-x", style: { display: "flex", gap: 8 }, children: [
        data.achievements.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 12, color: C.muted }, children: "Complete actions to unlock" }),
        data.achievements.map((a, i) => {
          const col = [C.teal, C.amber, C.green][i % 3];
          const bg = [C.tealTint, C.amberTint, C.greenTint][i % 3];
          return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "6px 12px", borderRadius: 999, background: bg, color: col, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }, children: a }, i);
        })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...card, padding: 4 }, children: [
      [
        { icon: Bell, l: "Notifications" },
        { icon: Clock, l: "Reminder Time" },
        { icon: Shield, l: "Privacy" },
        { icon: CircleQuestionMark, l: "Help" }
      ].map((x, i) => {
        const Ic = x.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: 14, borderBottom: `1px solid ${C.border}` }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ic, { size: 16, color: C.body }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, fontSize: 13, color: C.body }, children: x.l }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14, color: C.muted })
        ] }, x.l);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "glow-tap", onClick: () => {
        if (confirm("Logout and clear all data?")) reset();
      }, style: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 14, color: C.coral }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 13, fontWeight: 500 }, children: "Logout" })
      ] })
    ] })
  ] });
}
function Shell() {
  const { data, tab } = useApp();
  if (!data.user.name) return /* @__PURE__ */ jsxRuntimeExports.jsx(Onboarding, {});
  const tabs = { home: HomeTab, analyze: AnalyzeTab, reports: ReportsTab, nutrition: NutritionTab, profile: ProfileTab };
  const Cur = tabs[tab];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { minHeight: "100vh", background: C.bg }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { maxWidth: 430, margin: "0 auto", background: C.bg, minHeight: "100vh" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glow-fadeup", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Cur, {}) }, tab) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {})
  ] });
}
function Glowtics() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glow-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: styles }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shell, {}) })
  ] });
}
const SplitComponent = Glowtics;
export {
  SplitComponent as component
};
