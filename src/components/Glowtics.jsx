import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Home, ScanLine, BarChart2, Leaf, UserCircle, Bell, Camera, Scan,
  Droplets, Zap, Moon, Wind, Thermometer, AlertCircle, Apple, Activity,
  CheckCircle, XCircle, Lightbulb, AlertTriangle, Salad, Fish, Plus, X,
  Package, Flame, Clock, Shield, HelpCircle, LogOut, ChevronRight, Star,
  GlassWater, Minus, FileText,
} from "lucide-react";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const C = {
  bg: "#F7F7F5", surface: "#FFFFFF", tint: "#F0EFEB",
  teal: "#1A9E8F", amber: "#D4860B", coral: "#D95F5F", green: "#2BAD6A",
  muted: "#9A9A9A", body: "#111111", dark: "#000000",
  border: "rgba(0,0,0,0.07)", tealTint: "#E6F5F3", amberTint: "#FBF2E0",
  coralTint: "#FBE7E7", greenTint: "#E3F5EB",
};

const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

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
  logDays: [],
};

const card = {
  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
};

const label = {
  fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em",
  fontSize: 10, color: C.muted,
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

// ---------- helpers ----------
const fmtTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso); const diff = (Date.now() - d.getTime()) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

const fileToBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});

// ---------- Provider ----------
function AppProvider({ children }) {
  const [data, setData] = useState(emptyData);
  const [tab, setTab] = useState("home");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
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
          dailyLog: { ...emptyData.dailyLog, ...parsed?.dailyLog },
        }));
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }, []);

  useEffect(() => {
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
    } catch {}
    setData(emptyData);
  };

  const pushActivity = (icon, text) => update((d) => {
    d.activity.unshift({ icon, text, time: new Date().toISOString() });
    d.activity = d.activity.slice(0, 20);
    const today = new Date().toDateString();
    if (!d.logDays.includes(today)) d.logDays.push(today);
  });

  return (
    <AppCtx.Provider value={{ data, setData, update, tab, setTab, reset, pushActivity }}>
      {children}
    </AppCtx.Provider>
  );
}

// ---------- Onboarding ----------
function Onboarding() {
  const { update } = useApp();
  const [name, setName] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="glow-fadeup" style={{ ...card, padding: 32, maxWidth: 380, width: "100%", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Leaf size={28} color={C.teal} />
        </div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Glowtics</h1>
        <p style={{ color: C.muted, marginBottom: 28, fontSize: 14 }}>Intelligent skin, hair & nutrition care</p>
        <div style={{ ...label, textAlign: "left", marginBottom: 8 }}>Your name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name"
          style={{ width: "100%", padding: "14px 16px", border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 15, marginBottom: 20, outline: "none", background: C.bg }} />
        <button className="glow-tap" disabled={!name.trim()} onClick={() => {
          update((d) => { d.user.name = name.trim(); d.user.memberSince = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }); });
        }} style={{ width: "100%", padding: 14, borderRadius: 12, background: name.trim() ? C.teal : C.tint, color: name.trim() ? "#fff" : C.muted, fontWeight: 600, fontSize: 15, transition: "all 0.2s" }}>
          Get Started
        </button>
      </div>
    </div>
  );
}

// ---------- Bottom Nav ----------
function BottomNav() {
  const { tab, setTab } = useApp();
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "analyze", icon: ScanLine, label: "Analyze" },
    { id: "reports", icon: BarChart2, label: "Reports" },
    { id: "nutrition", icon: Leaf, label: "Nutrition" },
    { id: "profile", icon: UserCircle, label: "Profile" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 80, background: "#fff", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "center", zIndex: 50 }}>
      <div style={{ display: "flex", maxWidth: 430, width: "100%", alignItems: "center", justifyContent: "space-around", padding: "0 8px" }}>
        {tabs.map((t) => {
          const active = tab === t.id; const Icon = t.icon;
          return (
            <button key={t.id} className="glow-tap" onClick={() => setTab(t.id)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 4px", borderRadius: 12, background: active ? C.tealTint : "transparent", transition: "all 0.25s", transform: active ? "scale(1)" : "scale(0.95)" }}>
              <Icon size={20} color={active ? C.teal : C.muted} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 500, color: active ? C.teal : C.muted, letterSpacing: "0.04em" }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- HOME ----------
function GlowRing({ score = 0 }) {
  const r = 70, c = 2 * Math.PI * r;
  const [dash, setDash] = useState(c);
  useEffect(() => { const t = setTimeout(() => setDash(c - (c * score) / 100), 50); return () => clearTimeout(t); }, [score, c]);
  return (
    <svg width={180} height={180} viewBox="0 0 180 180">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.teal} />
          <stop offset="50%" stopColor={C.amber} />
          <stop offset="100%" stopColor={C.green} />
        </linearGradient>
      </defs>
      <circle cx="90" cy="90" r={r} fill="none" stroke={C.tint} strokeWidth="10" />
      <circle cx="90" cy="90" r={r} fill="none" stroke="url(#grad)" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={dash} transform="rotate(-90 90 90)"
        style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      <text x="90" y="92" textAnchor="middle" fontSize="36" fontWeight="700" fill={C.dark}>{score}</text>
      <text x="90" y="112" textAnchor="middle" fontSize="10" fill={C.muted} style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}>Glow Score</text>
    </svg>
  );
}

const iconMap = { droplets: Droplets, zap: Zap, moon: Moon, wind: Wind, thermometer: Thermometer };
const dotColor = { teal: C.teal, amber: C.amber, coral: C.coral, green: C.green };

function HomeTab() {
  const { data, setTab } = useApp();
  const sa = data.analysisResults.skinAnalysis || data.analysisResults.hairAnalysis;
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning"; if (h < 18) return "Good afternoon"; return "Good evening";
  })();
  const initials = (data.user?.name || "").split(" ").map((s) => s[0] || "").join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>{greeting}, {data.user.name}</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            {sa ? sa.dailySummary : "Complete your first scan to get started"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="glow-tap" style={{ width: 38, height: 38, borderRadius: 12, background: "#fff", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={16} color={C.body} />
          </button>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.tealTint, color: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>{initials}</div>
        </div>
      </div>

      {sa ? (
        <div className="glow-fadeup" style={{ ...card, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
          <GlowRing score={sa.glowScore} />
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {[["Skin", sa.skinScore, C.teal], ["Hair", sa.hairScore, C.amber], ["Nutrition", sa.nutritionScore, C.green]].map(([n, v, col]) => (
              <div key={n} style={{ padding: "6px 12px", borderRadius: 999, background: C.tint, fontSize: 12, color: C.body, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: col }} />
                {n} {v}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glow-fadeup" style={{ ...card, padding: 28, textAlign: "center", marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <ScanLine size={24} color={C.teal} />
          </div>
          <h3 style={{ fontSize: 16, marginBottom: 6 }}>No scan yet</h3>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Run your first analysis to unlock your Glow Score</p>
          <button className="glow-tap" onClick={() => setTab("analyze")} style={{ padding: "10px 18px", borderRadius: 10, background: C.teal, color: "#fff", fontWeight: 600, fontSize: 13 }}>Start Scan</button>
        </div>
      )}

      <div style={{ ...label, marginBottom: 10, padding: "0 4px" }}>Today's insights</div>
      <div className="glow-scroll-x" style={{ display: "flex", gap: 12, marginBottom: 20, marginLeft: -20, paddingLeft: 20, paddingRight: 20 }}>
        {sa && Array.isArray(sa.insights) ? (
          sa.insights.map((ins, i) => {
            const Ic = iconMap[ins.icon] || Droplets;
            return (
              <div key={i} className="glow-fadeup" style={{ ...card, padding: 16, minWidth: 150, animationDelay: `${i * 60}ms` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <Ic size={18} color={C.body} />
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor[ins.colorDot] || C.teal }} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.dark }}>{ins.value}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{ins.title}</div>
              </div>
            );
          })
        ) : (
          <div style={{ ...card, padding: 16, width: "100%", textAlign: "center", border: `1px dashed ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Lightbulb size={20} color={C.teal} />
            <span style={{ fontSize: 12, color: C.muted }}>Daily health insights will appear here once you complete a scan.</span>
          </div>
        )}
      </div>

      <div className="glow-fadeup" style={{ background: C.tealTint, borderLeft: `3px solid ${C.teal}`, borderRadius: 12, padding: 16, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 2 }}>Routine Reminder</div>
          <div style={{ fontSize: 12, color: C.body }}>{sa ? sa.routineReminder : "Complete your scan to get a routine"}</div>
        </div>
        <button className="glow-tap" onClick={() => setTab("analyze")} style={{ padding: "8px 12px", borderRadius: 10, background: C.teal, color: "#fff", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>Analyze →</button>
      </div>

      <div style={{ ...label, marginBottom: 10, padding: "0 4px" }}>Recent activity</div>
      <div style={{ ...card, padding: 8 }}>
        {data.activity.slice(0, 3).length === 0 ? (
          <div style={{ padding: 16, fontSize: 13, color: C.muted, textAlign: "center" }}>No activity yet</div>
        ) : data.activity.slice(0, 3).map((a, i) => {
          const Ic = iconMap[a.icon] || Activity;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ic size={16} color={C.teal} />
              </div>
              <div style={{ flex: 1, fontSize: 13, color: C.body }}>{a.text}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{fmtTime(a.time)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- ANALYZE ----------
const skinQs = [
  { q: "How does your skin feel by midday?", a: ["Oily", "Dry", "Combination", "Normal"] },
  { q: "How often do you experience breakouts?", a: ["Rarely", "Sometimes", "Often", "Always"] },
  { q: "Do you notice redness or irritation?", a: ["Never", "Occasionally", "Frequently"] },
  { q: "How would you describe your skin texture?", a: ["Smooth", "Rough", "Uneven", "Bumpy"] },
  { q: "What is your primary skin concern? (Select one or more)", a: ["Acne", "Dryness", "Dark Spots", "Aging", "Dullness"], multiSelect: true },
];
const hairQs = [
  { q: "How does your scalp feel?", a: ["Oily", "Dry", "Balanced", "Itchy"] },
  { q: "How often does hair fall noticeably?", a: ["Rarely", "Sometimes", "Often", "Daily"] },
  { q: "What is your hair texture?", a: ["Fine", "Medium", "Thick", "Coarse"] },
  { q: "How frequently do you wash your hair?", a: ["Daily", "Every 2–3 days", "Weekly", "Less often"] },
  { q: "What is your primary hair concern?", a: ["Hair fall", "Dandruff", "Dryness", "Oiliness", "Frizz"] },
];

function UploadZone({ icon: Icon, title, image, onPick, onClear, accept = "image/*", showCamera = true }) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async (e) => {
    e.stopPropagation(); // Avoid triggering file pick
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
        onPick(dataUrl); // Passes base64 string directly
      }
      stopCamera();
    }
  };

  const isPdf = image && image.startsWith("data:application/pdf");

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ ...label, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{title}</span>
        {image ? (
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} style={{ fontSize: 11, color: C.coral, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <X size={12} /> Clear
          </button>
        ) : (
          <span style={{ fontSize: 10, fontWeight: 600, color: C.coral, background: C.coralTint, padding: "2px 6px", borderRadius: 4 }}>Required</span>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept={accept} hidden onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const r = new FileReader();
          r.onload = () => onPick(r.result);
          r.readAsDataURL(file);
        }
      }} />

      {isCameraActive ? (
        <div style={{ width: "100%", height: 220, borderRadius: 16, border: `2px solid ${C.teal}`, background: "#000", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 10, zIndex: 10 }}>
            <button onClick={capturePhoto} style={{ padding: "8px 16px", borderRadius: 20, background: C.teal, color: "#fff", fontSize: 12, fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
              Capture
            </button>
            <button onClick={stopCamera} style={{ padding: "8px 16px", borderRadius: 20, background: "#fff", color: C.dark, fontSize: 12, fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="glow-upload glow-tap" onClick={() => fileInputRef.current?.click()}
            style={{
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
            }}>
            {image ? (
              isPdf ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: C.teal }}>
                  <FileText size={32} color={C.teal} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>PDF Report Uploaded</span>
                </div>
              ) : (
                <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )
            ) : (
              <>
                <Icon size={28} color={C.teal} />
                <span style={{ fontSize: 12, color: C.body, fontWeight: 500 }}>Tap to upload file</span>
              </>
            )}
          </button>

          {!image && showCamera && (
            <button onClick={startCamera} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.teal}`, background: C.tealTint, color: C.teal, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s" }}>
              <Camera size={14} /> Open Live Camera
            </button>
          )}

          {cameraError && (
            <div style={{ fontSize: 11, color: C.coral, fontWeight: 500, marginTop: 2, textAlign: "center" }}>
              {cameraError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionBlock({ qs, answers, setAnswers }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
      {qs.map((qq, i) => {
        const isAnswered = answers[i] !== null && (!Array.isArray(answers[i]) || answers[i].length > 0);
        return (
          <div key={i} className="glow-fadeup"
            style={{
              ...card,
              padding: 14,
              animationDelay: `${i * 60}ms`,
              border: isAnswered ? `1px solid ${C.border}` : `1px solid rgba(239, 68, 68, 0.2)`,
              background: isAnswered ? C.surface : "rgba(239, 68, 68, 0.02)",
              transition: "all 0.25s"
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{qq.q}</div>
              {!isAnswered && (
                <span style={{ fontSize: 10, fontWeight: 600, color: C.coral, background: C.coralTint, padding: "2px 6px", borderRadius: 4 }}>Required</span>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {qq.a.map((opt) => {
                const isMulti = qq.multiSelect;
                const currentAns = answers[i];
                const sel = isMulti 
                  ? Array.isArray(currentAns) && currentAns.includes(opt)
                  : currentAns === opt;

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

                return (
                  <button key={opt} className="glow-tap" onClick={handleClick}
                    style={{ padding: "8px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500, background: sel ? C.teal : C.tint, color: sel ? "#fff" : C.body, transition: "all 0.15s" }}>{opt}</button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TagInput({ tags, setTags, placeholder }) {
  const [v, setV] = useState("");
  const add = () => { const t = v.trim(); if (t) { setTags([...tags, t]); setV(""); } };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {tags.map((t, i) => (
          <span key={i} style={{ padding: "6px 10px", borderRadius: 999, background: C.tealTint, color: C.teal, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            {t}
            <button onClick={() => setTags(tags.filter((_, j) => j !== i))} style={{ display: "flex" }}><X size={12} color={C.teal} /></button>
          </span>
        ))}
      </div>
      <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        placeholder={placeholder} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, outline: "none", background: C.bg }} />
    </div>
  );
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
            data: match[2],
          },
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
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    }),
  });

  if (!res.ok) {
    let errMsg = `Status ${res.status}`;
    try {
      const errJson = await res.json();
      errMsg = errJson.error?.message || JSON.stringify(errJson);
    } catch {}
    throw new Error(`Gemini API Error: ${errMsg}`);
  }
  
  const j = await res.json();
  const txt = j.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return JSON.parse(txt);
}

const ANALYSIS_SYSTEM = "You are Glowtics, an expert AI skin, hair and nutrition health coach. First, validate if the uploaded photo is indeed a valid close-up or clear shot of a human face, skin area, scalp, or hair. If the photo is invalid (e.g. an animal, landscape, random object, extremely blurry, or not human skin/hair), respond ONLY with a JSON object where \"isValidImage\" is false, and \"invalidImageError\" is a helpful string explaining what is wrong (e.g. \"The uploaded photo does not appear to be a human face or scalp. Please upload or capture a clear, close-up photo.\"), and all other keys can be null or empty. If the photo is valid, analyze the photo along with the diagnostic answers and lifestyle data. Respond ONLY with a valid JSON object, no markdown, no preamble, no explanation. JSON keys required: isValidImage (boolean, set to true), invalidImageError (string, set to null), glowScore (number 0-100), skinScore (number 0-100), hairScore (number 0-100), nutritionScore (number 0-100), dailySummary (string, one sentence), rootCause (string), routineReminder (string), insights (array of 3 objects each with: icon (one of: droplets, zap, moon, wind, thermometer), title (string), value (string), colorDot (one of: teal, amber, coral, green)), skinAdvice (object: headline string, explanation string), nutritionAdvice (object: headline string, explanation string), lifestyleAdvice (object: headline string, explanation string), topIngredients (array of 3 strings), avoidIngredients (array of 3 strings), dailyTip (string), triggers (array of objects each with: label string, percentage number), nutrientDeficiencies (object with keys: vitaminC, zinc, omega3, iron, biotin — each a number 0-100 representing current level vs ideal), nutritionPlan (object: vitaminC object with current number and target number, same for vitaminD, biotin, zinc, omega3), recommendedFoods (array of 7 objects each with: name string, benefit string)).";

const BLOOD_REPORT_SYSTEM = "You are Glowtics, an expert AI skin, hair and nutrition health coach. First, validate if the uploaded document or photo is indeed a valid medical blood report or lab test result. If the document is invalid (e.g. not a blood report, random document, landscape, animal, receipt, or unrelated image), respond ONLY with a JSON object where \"isValidReport\" is false, and \"invalidReportError\" is a helpful string explaining what is wrong (e.g. \"The uploaded file does not appear to be a valid medical blood report. Please upload a clear document or image containing blood test results.\"), and all other keys can be null or empty. If the report is valid, analyze the blood biomarkers (e.g. iron, ferritin, vitamins, thyroid, lipids, etc.) in the context of skin, hair, and overall health. Respond ONLY with a valid JSON object, no markdown, no preamble, no explanation. JSON keys required: isValidReport (boolean, set to true), invalidReportError (string, set to null), glowScore (number 0-100), skinScore (number 0-100), hairScore (number 0-100), nutritionScore (number 0-100), dailySummary (string, one sentence summarizing the blood report findings), rootCause (string identifying key biomarker deficiencies or insights), routineReminder (string), insights (array of 3 objects each with: icon (one of: droplets, zap, moon, wind, thermometer), title (string), value (string), colorDot (one of: teal, amber, coral, green)), skinAdvice (object: headline string, explanation string), nutritionAdvice (object: headline string, explanation string), lifestyleAdvice (object: headline string, explanation string), topIngredients (array of 3 strings), avoidIngredients (array of 3 strings), dailyTip (string), triggers (array of objects each with: label string, percentage number), nutrientDeficiencies (object with keys: vitaminC, zinc, omega3, iron, biotin — each a number 0-100 representing current level vs ideal), nutritionPlan (object: vitaminC object with current number and target number, same for vitaminD, biotin, zinc, omega3), recommendedFoods (array of 7 objects each with: name string, benefit string)).";

function AnalyzeTab() {
  const { data, update, pushActivity, setTab } = useApp();
  const [analysisType, setAnalysisType] = useState("skin"); // "skin", "hair", or "blood"
  const [bloodTarget, setBloodTarget] = useState("skin"); // "skin" or "hair" focus target
  const [skinImg, setSkinImg] = useState(null);
  const [hairImg, setHairImg] = useState(null);
  const [bloodReportFile, setBloodReportFile] = useState(null);
  const [skinAns, setSkinAns] = useState(Array(5).fill(null));
  const [hairAns, setHairAns] = useState(Array(5).fill(null));
  const [sleep, setSleep] = useState(data.dailyLog.sleep);
  const [stress, setStress] = useState(data.dailyLog.stress);
  const [water, setWater] = useState(data.dailyLog.water);
  const [skincareProducts, setSkincareProducts] = useState({
    facewash: { used: null, brand: "" },
    serum: { used: null, brand: "" },
    moisturizer: { used: null, brand: "" },
  });
  const [hairProducts, setHairProducts] = useState({
    shampoo: { used: null, brand: "" },
    conditioner: { used: null, brand: "" },
    oil: { used: null, brand: "" },
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [result, setResult] = useState(null);

  const skinDone = skinImg && skinAns.every((val) => val !== null && (!Array.isArray(val) || val.length > 0));
  const hairDone = hairImg && hairAns.every(Boolean);
  const ready = analysisType === "skin" ? skinDone : (analysisType === "hair" ? hairDone : !!bloodReportFile);

  const handlePick = (which, b64) => {
    if (which === "skin") setSkinImg(b64);
    else if (which === "hair") setHairImg(b64);
    else setBloodReportFile(b64);
  };

  const analyze = async () => {
    setLoading(true); setErr(null);
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

        const userText = `Analysis Target: ${analysisType.toUpperCase()}\nUser diagnostic answers: ${JSON.stringify(targetAns)}\nSleep: ${sleep}h, Stress: ${stress}/5, Water: ${water} glasses\nSkincare/Haircare products: ${activeProducts.join(", ") || "None"}\nReturn the required JSON only.`;
        const images = [targetImg].filter(Boolean);
        json = await callGemini(ANALYSIS_SYSTEM, userText, images);
        
        // Enforce image content validation checks
        if (json.isValidImage === false) {
          throw new Error(json.invalidImageError || "The uploaded image does not appear to be a human face or scalp. Please capture a clear, close-up photo.");
        }
      } else {
        // Blood report analysis flow
        const userText = `Analysis Target: BLOOD REPORT ANALYSIS (Focusing on ${bloodTarget.toUpperCase()} health and nutrition insights)\nSleep: ${sleep}h, Stress: ${stress}/5, Water: ${water} glasses\nReturn the required JSON only.`;
        const files = [bloodReportFile].filter(Boolean);
        json = await callGemini(BLOOD_REPORT_SYSTEM, userText, files);
        
        // Enforce blood report content validation checks
        if (json.isValidReport === false) {
          throw new Error(json.invalidReportError || "The uploaded file does not appear to be a valid medical blood report. Please upload a clear document or image containing blood test results.");
        }
      }

      const now = new Date().toISOString();
      update((d) => {
        if (analysisType === "skin" || analysisType === "hair") {
          if (analysisType === "skin") d.analysisResults.skinAnalysis = json;
          else d.analysisResults.hairAnalysis = json;
        } else {
          // Set blood report results to the selected bloodTarget report
          if (bloodTarget === "skin") d.analysisResults.skinAnalysis = json;
          else d.analysisResults.hairAnalysis = json;
        }
        d.analysisResults.lastAnalyzedAt = now;
        d.reports.glowScoreHistory.push({ score: json.glowScore, at: now });
        d.dailyLog = { sleep, stress, water, food: [], productsUsed: activeProducts };
        if (!d.achievements.includes("First Scan")) d.achievements.push("First Scan");
        const today = new Date().toDateString();
        if (!d.logDays.includes(today)) d.logDays.push(today);
      });
      pushActivity("zap", (analysisType === "skin" || analysisType === "hair") ? `Completed AI ${analysisType} analysis` : `Completed AI blood report analysis focusing on ${bloodTarget}`);
      setResult(json);
    } catch (e) {
      setErr(e.message || "Analysis failed");
    } finally { setLoading(false); }
  };

  if (result) {
    return (
      <div style={{ padding: "24px 20px 100px" }}>
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>Your Results</h1>
        <div className="glow-fadeup" style={{ background: C.amberTint, borderLeft: `3px solid ${C.amber}`, borderRadius: 12, padding: 16, marginBottom: 12, display: "flex", gap: 12 }}>
          <AlertCircle size={18} color={C.amber} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ ...label, marginBottom: 4 }}>Root cause</div>
            <div style={{ fontSize: 13, color: C.body }}>{result.rootCause}</div>
          </div>
        </div>
        {[
          { icon: Droplets, key: "skinAdvice" },
          { icon: Apple, key: "nutritionAdvice" },
          { icon: Activity, key: "lifestyleAdvice" },
        ].map((x, i) => {
          const Ic = x.icon; const v = result[x.key];
          return (
            <div key={x.key} className="glow-fadeup" style={{ ...card, padding: 16, marginBottom: 10, animationDelay: `${i * 80}ms` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic size={16} color={C.teal} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{v.headline}</div>
              </div>
              <p style={{ fontSize: 13, color: C.body, marginBottom: 8 }}>{v.explanation}</p>
              <button style={{ fontSize: 12, color: C.teal, fontWeight: 600 }}>Learn more →</button>
            </div>
          );
        })}
        <div style={{ ...label, margin: "20px 0 8px" }}>Recommended ingredients</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {result.topIngredients.map((t, i) => (
            <span key={i} style={{ padding: "8px 12px", borderRadius: 999, background: C.tealTint, color: C.teal, fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
              <CheckCircle size={12} /> {t}
            </span>
          ))}
        </div>
        <div style={{ ...label, marginBottom: 8 }}>Avoid</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {result.avoidIngredients.map((t, i) => (
            <span key={i} style={{ padding: "8px 12px", borderRadius: 999, background: C.coralTint, color: C.coral, fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
              <XCircle size={12} /> {t}
            </span>
          ))}
        </div>
        <div style={{ background: C.tealTint, borderRadius: 12, padding: 16, display: "flex", gap: 12 }}>
          <Lightbulb size={18} color={C.teal} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ ...label, marginBottom: 4, color: C.teal }}>Daily tip</div>
            <div style={{ fontSize: 13, color: C.body }}>{result.dailyTip}</div>
          </div>
        </div>
        <button className="glow-tap" onClick={() => setTab("reports")} style={{ width: "100%", marginTop: 20, padding: 14, borderRadius: 12, background: C.teal, color: "#fff", fontWeight: 600, fontSize: 14 }}>View full report</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px 100px", position: "relative" }}>
      <h1 style={{ fontSize: 24, marginBottom: 6 }}>Analyze</h1>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Upload a photo or submit a medical report for personalized AI insights.</p>

      {/* Main Analysis Category Pill Selector */}
      <div style={{ display: "flex", background: C.tint, borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {[
          { id: "skin", label: "Skin Care" },
          { id: "hair", label: "Hair Care" },
          { id: "blood", label: "Blood Analysis" },
        ].map((t) => {
          const active = analysisType === t.id;
          return (
            <button key={t.id} className="glow-tap" onClick={() => setAnalysisType(t.id)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: active ? C.teal : "transparent", color: active ? "#fff" : C.muted, fontWeight: 600, fontSize: 13, transition: "all 0.2s" }}>
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }}>
        {analysisType === "skin" ? (
          <div className="glow-fadein">
            <UploadZone icon={Camera} title="Skin Photo" image={skinImg} onPick={(b64) => handlePick("skin", b64)} onClear={() => setSkinImg(null)} />
            {skinImg && <QuestionBlock qs={skinQs} answers={skinAns} setAnswers={setSkinAns} />}
          </div>
        ) : analysisType === "hair" ? (
          <div className="glow-fadein">
            <UploadZone icon={Scan} title="Scalp / Hair Photo" image={hairImg} onPick={(b64) => handlePick("hair", b64)} onClear={() => setHairImg(null)} />
            {hairImg && <QuestionBlock qs={hairQs} answers={hairAns} setAnswers={setHairAns} />}
          </div>
        ) : (
          <div className="glow-fadein" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Guide Card of what report includes */}
            <div style={{ ...card, padding: 14, background: C.greenTint, border: `1px solid ${C.green}33`, borderRadius: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.green, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={14} color={C.green} /> Supported Test Biomarkers:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.body, display: "flex", flexDirection: "column", gap: 4 }}>
                <li><strong>CBC</strong> (Complete Blood Count)</li>
                <li><strong>Thyroid Profile</strong> (TSH, T3, T4)</li>
                <li><strong>Vitamins</strong> (Vitamin D, B12, Iron/Ferritin)</li>
                <li><strong>Lipids</strong> (Cholesterol, Triglycerides)</li>
                <li>Other clinical observations for skin and hair health</li>
              </ul>
            </div>

            {/* Target analysis Focus Toggle */}
            <div style={{ ...card, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 10 }}>Focus of Blood Analysis</div>
              <div style={{ display: "flex", background: C.tint, borderRadius: 10, padding: 3 }}>
                {[
                  { id: "skin", label: "Skin Care Focus" },
                  { id: "hair", label: "Hair Care Focus" },
                ].map((bt) => {
                  const sel = bloodTarget === bt.id;
                  return (
                    <button key={bt.id} className="glow-tap" onClick={() => setBloodTarget(bt.id)}
                      style={{ flex: 1, padding: "8px 0", borderRadius: 8, background: sel ? C.teal : "transparent", color: sel ? "#fff" : C.muted, fontWeight: 600, fontSize: 12, transition: "all 0.15s" }}>
                      {bt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <UploadZone icon={FileText} title="Blood Report Document" image={bloodReportFile} onPick={(b64) => handlePick("blood", b64)} onClear={() => setBloodReportFile(null)} accept="image/*,application/pdf" showCamera={false} />
          </div>
        )}
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 16 }}>
        <div style={{ ...label, marginBottom: 14 }}>Daily log</div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.body }}>Sleep</span>
            <span style={{ padding: "2px 10px", borderRadius: 999, background: C.tealTint, color: C.teal, fontSize: 11, fontWeight: 600 }}>{sleep}h</span>
          </div>
          <input type="range" min="0" max="12" step="0.5" value={sleep} onChange={(e) => setSleep(Number(e.target.value))} style={{ width: "100%", accentColor: C.teal }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: C.body, marginBottom: 8 }}>Stress level</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => {
              const sel = stress >= n;
              const col = n <= 2 ? C.green : n === 3 ? C.amber : C.coral;
              return <button key={n} onClick={() => setStress(n)} style={{ width: 28, height: 28, borderRadius: "50%", background: sel ? col : C.tint, transition: "all 0.2s" }} />;
            })}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.body }}>Water intake</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setWater(Math.max(0, water - 1))} style={{ width: 28, height: 28, borderRadius: 8, background: C.tint, display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} color={C.body} /></button>
              <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{water}</span>
              <button onClick={() => setWater(water + 1)} style={{ width: 28, height: 28, borderRadius: 8, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} color={C.teal} /></button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <GlassWater key={i} size={18} color={i < water ? C.teal : C.tint} fill={i < water ? C.tealTint : "none"} style={{ transition: "all 0.3s" }} />
            ))}
          </div>
        </div>

        {(analysisType === "skin" || analysisType === "hair") && (
          <div style={{ marginTop: 8 }}>
            <div style={{ ...label, marginBottom: 12 }}>
              {analysisType === "skin" ? "Skincare Products Used" : "Haircare Products Used"}
            </div>
            {(analysisType === "skin"
              ? [
                  { id: "facewash", label: "Face Wash" },
                  { id: "serum", label: "Serum" },
                  { id: "moisturizer", label: "Moisturizer" },
                ]
              : [
                  { id: "shampoo", label: "Shampoo" },
                  { id: "conditioner", label: "Conditioner" },
                  { id: "oil", label: "Hair Oil/Serum" },
                ]
            ).map((prod) => {
              const state = analysisType === "skin" ? skincareProducts[prod.id] : hairProducts[prod.id];
              const setProducts = analysisType === "skin" ? setSkincareProducts : setHairProducts;
              return (
                <div key={prod.id} style={{ marginBottom: 12, background: C.bg, padding: 12, borderRadius: 12, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{prod.label}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[
                        { val: true, text: "Yes" },
                        { val: false, text: "No" },
                      ].map((btn) => {
                        const sel = state.used === btn.val;
                        return (
                          <button key={btn.text} className="glow-tap" onClick={() => setProducts((p) => ({ ...p, [prod.id]: { ...p[prod.id], used: btn.val } }))}
                            style={{ padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: sel ? C.teal : C.tint, color: sel ? "#fff" : C.muted, transition: "all 0.15s" }}>
                            {btn.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {state.used === true && (
                    <div className="glow-fadein">
                      <input value={state.brand} onChange={(e) => {
                        const v = e.target.value;
                        setProducts((p) => ({ ...p, [prod.id]: { ...p[prod.id], brand: v } }));
                      }} placeholder={`What brand do you use?`}
                        style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, background: C.surface, outline: "none", color: C.dark }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {err && (
        <div style={{ ...card, padding: 16, marginBottom: 16, textAlign: "center" }}>
          <AlertTriangle size={24} color={C.coral} style={{ margin: "0 auto 8px" }} />
          <div style={{ fontSize: 13, color: C.body, marginBottom: 10 }}>Analysis failed: {err}</div>
          <button className="glow-tap" onClick={analyze} style={{ padding: "8px 16px", borderRadius: 10, background: C.teal, color: "#fff", fontSize: 12, fontWeight: 600 }}>Retry</button>
        </div>
      )}

      {!ready && (
        <div className="glow-fadein" style={{ background: "rgba(239, 68, 68, 0.02)", borderRadius: 12, padding: 12, marginBottom: 16, border: `1px dashed rgba(239, 68, 68, 0.2)` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.coral, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle size={14} color={C.coral} /> Remaining steps:
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.body, display: "flex", flexDirection: "column", gap: 4 }}>
            {analysisType === "skin" ? (
              <>
                {!skinImg && <li>Upload or capture a Skin Photo</li>}
                {skinAns.map((ans, idx) => {
                  const isAnswered = ans !== null && (!Array.isArray(ans) || ans.length > 0);
                  if (!isAnswered) {
                    return <li key={idx}>Answer question {idx + 1}: "{skinQs[idx].q}"</li>;
                  }
                  return null;
                })}
              </>
            ) : analysisType === "hair" ? (
              <>
                {!hairImg && <li>Upload or capture a Scalp / Hair Photo</li>}
                {hairAns.map((ans, idx) => {
                  if (ans === null) {
                    return <li key={idx}>Answer question {idx + 1}: "{hairQs[idx].q}"</li>;
                  }
                  return null;
                })}
              </>
            ) : (
              <>
                {!bloodReportFile && <li>Upload a Blood Report (PDF or Image)</li>}
              </>
            )}
          </ul>
        </div>
      )}

      <button className="glow-tap" disabled={!ready || loading} onClick={analyze}
        style={{ width: "100%", padding: 16, borderRadius: 12, background: ready ? C.teal : C.tint, color: ready ? "#fff" : C.muted, fontWeight: 600, fontSize: 15, transition: "all 0.2s" }}>
        {loading ? "Analyzing..." : "Analyze Now"}
      </button>

      {loading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(247,247,245,0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="glow-shimmer" style={{ width: 80, height: 80, borderRadius: "50%", marginBottom: 20 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: C.dark }}>Analyzing your skin & hair...</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>This may take a moment</div>
        </div>
      )}
    </div>
  );
}

// ---------- REPORTS ----------
function LineChart({ points }) {
  const W = 320, H = 140, pad = 16;
  if (points.length === 0) return null;
  if (points.length === 1) {
    return (
      <div style={{ textAlign: "center", padding: 30 }}>
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.teal, margin: "0 auto 10px" }} />
        <div style={{ fontSize: 12, color: C.muted }}>Scan again tomorrow to see your trend</div>
      </div>
    );
  }
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const xs = points.map((_, i) => pad + (i * (W - pad * 2)) / (points.length - 1));
  const ys = points.map((p) => H - pad - ((p - min) / range) * (H - pad * 2));
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < points.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2;
    d += ` Q ${cx} ${ys[i - 1]} ${cx} ${(ys[i - 1] + ys[i]) / 2} T ${xs[i]} ${ys[i]}`;
  }
  const fill = d + ` L ${xs[xs.length - 1]} ${H - pad} L ${xs[0]} ${H - pad} Z`;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={C.teal} stopOpacity="0.3" />
          <stop offset="100%" stopColor={C.teal} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#lg)" />
      <path d={d} stroke={C.teal} strokeWidth="2.5" fill="none" strokeLinecap="round"
        strokeDasharray="1000" style={{ animation: "drawLine 1.2s ease-out forwards" }} />
      {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r="3" fill={C.teal} />)}
    </svg>
  );
}

function ReportsTab() {
  const { data, update } = useApp();
  const [filter, setFilter] = useState("Week");
  const sa = data.analysisResults.skinAnalysis || data.analysisResults.hairAnalysis;
  const history = data.reports.glowScoreHistory.map((h) => h.score);
  const [newProd, setNewProd] = useState("");
  const [newCat, setNewCat] = useState("");

  if (!sa) {
    return (
      <div style={{ padding: "60px 20px 100px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <BarChart2 size={28} color={C.teal} />
        </div>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>No reports yet</h2>
        <p style={{ fontSize: 13, color: C.muted }}>Run your first scan to see reports</p>
      </div>
    );
  }

  const prev = history.length > 1 ? history[history.length - 2] : null;
  const cur = history[history.length - 1];

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Reports</h1>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["Week", "Month", "3 Months"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="glow-tap"
            style={{ padding: "8px 14px", borderRadius: 999, background: filter === f ? C.teal : C.tint, color: filter === f ? "#fff" : C.muted, fontSize: 12, fontWeight: 500 }}>{f}</button>
        ))}
      </div>

      <div className="glow-fadeup" style={{ ...card, padding: 16, marginBottom: 16 }}>
        <div style={{ ...label, marginBottom: 4 }}>Glow Score Trend</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{cur}<span style={{ fontSize: 12, color: C.muted, marginLeft: 6 }}>current</span></div>
        <LineChart points={history} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[["Skin", sa.skinScore, C.teal], ["Hair", sa.hairScore, C.amber], ["Nutrition", sa.nutritionScore, C.green]].map(([n, v, col], i) => (
          <div key={n} className="glow-fadeup" style={{ ...card, padding: 14, animationDelay: `${i * 60}ms` }}>
            <div style={{ ...label, marginBottom: 6 }}>{n}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: col }}>{v}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
              {prev ? `vs ${prev} last scan` : "First scan"}
            </div>
          </div>
        ))}
      </div>

      <div className="glow-fadeup" style={{ ...card, padding: 16, marginBottom: 16 }}>
        <div style={{ ...label, marginBottom: 12 }}>Trigger Analysis</div>
        {sa.triggers?.map((t, i) => {
          const col = [C.teal, C.amber, C.coral, C.green][i % 4];
          return (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: C.body }}>{t.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: col }}>{t.percentage}%</span>
              </div>
              <div style={{ height: 6, background: C.tint, borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${t.percentage}%`, height: "100%", background: col, borderRadius: 999, transition: "width 0.8s ease-out" }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...label, marginBottom: 12 }}>Product Effectiveness</div>
        {data.reports.productLog.length === 0 ? (
          <div style={{ fontSize: 13, color: C.muted, padding: "10px 0" }}>No products logged yet</div>
        ) : data.reports.productLog.map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < data.reports.productLog.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.dark }}>{p.name}</div>
              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, background: C.tealTint, color: C.teal, fontSize: 10, marginTop: 2 }}>{p.category}</span>
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} color={s <= (p.rating || 4) ? C.amber : C.tint} fill={s <= (p.rating || 4) ? C.amber : "none"} />)}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <input value={newProd} onChange={(e) => setNewProd(e.target.value)} placeholder="Product name" style={{ flex: 1, padding: 10, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, outline: "none" }} />
          <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Category" style={{ width: 100, padding: 10, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, outline: "none" }} />
        </div>
        <button className="glow-tap" onClick={() => {
          if (!newProd.trim()) return;
          update((d) => d.reports.productLog.push({ name: newProd.trim(), category: newCat.trim() || "General", rating: 4 }));
          setNewProd(""); setNewCat("");
        }} style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 10, border: `1px solid ${C.teal}`, color: C.teal, fontSize: 12, fontWeight: 600 }}>Add Product</button>
      </div>
    </div>
  );
}

// ---------- NUTRITION ----------
function RadarChart({ values }) {
  const keys = ["vitaminC", "zinc", "omega3", "iron", "biotin"];
  const labels = ["Vit C", "Zinc", "Omega-3", "Iron", "Biotin"];
  const cx = 130, cy = 120, R = 80;
  const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  const pt = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  const outer = keys.map((_, i) => pt(i, R).join(",")).join(" ");
  const inner = keys.map((k, i) => pt(i, R * ((values?.[k] ?? 0) / 100)).join(",")).join(" ");
  return (
    <svg width="100%" height="240" viewBox="0 0 260 240">
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon key={s} points={keys.map((_, i) => pt(i, R * s).join(",")).join(" ")} fill="none" stroke={C.border} strokeWidth="1" />
      ))}
      <polygon points={outer} fill="none" stroke={C.teal} strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points={inner} fill={C.amber} fillOpacity="0.35" stroke={C.amber} strokeWidth="2"
        style={{ transformOrigin: `${cx}px ${cy}px`, animation: "radarExpand 0.8s ease-out" }} />
      {labels.map((l, i) => {
        const [x, y] = pt(i, R + 18);
        return <text key={l} x={x} y={y + 4} textAnchor="middle" fontSize="10" fill={C.body}>{l}</text>;
      })}
    </svg>
  );
}

function NutritionTab() {
  const { data, update, pushActivity } = useApp();
  const sa = data.analysisResults.skinAnalysis || data.analysisResults.hairAnalysis;
  const [expanded, setExpanded] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [addingFor, setAddingFor] = useState(null);
  const [val, setVal] = useState("");

  if (!sa) {
    return (
      <div style={{ padding: "60px 20px 100px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Leaf size={28} color={C.teal} />
        </div>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>No nutrition plan yet</h2>
        <p style={{ fontSize: 13, color: C.muted }}>Run your first scan to unlock</p>
      </div>
    );
  }

  const nutrients = [
    { key: "vitaminC", name: "Vitamin C", unit: "mg" },
    { key: "vitaminD", name: "Vitamin D", unit: "IU" },
    { key: "biotin", name: "Biotin", unit: "mcg" },
    { key: "zinc", name: "Zinc", unit: "mg" },
    { key: "omega3", name: "Omega-3", unit: "mg" },
  ];

  const addFood = (section) => {
    if (!val.trim()) return;
    update((d) => d.nutritionLog[section].push(val.trim()));
    pushActivity("droplets", `Logged ${val.trim()} for ${section}`);
    setVal(""); setAddingFor(null);
  };

  const getInsights = async () => {
    setInsightLoading(true);
    try {
      const sys = "You are Glowtics nutrition AI. Analyze the user's meal log and respond ONLY with valid JSON. Keys: macroBreakdown (object: protein number 0-100, carbs number 0-100, fats number 0-100), nutritionFeedback (string, one sentence), suggestions (array of 3 strings).";
      const txt = `Meal log: ${JSON.stringify(data.nutritionLog)}`;
      const json = await callGemini(sys, txt);
      update((d) => { d.nutritionInsights = json; });
    } catch (e) { console.error(e); }
    finally { setInsightLoading(false); }
  };

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Nutrition</h1>

      <div className="glow-fadeup" style={{ ...card, padding: 16, marginBottom: 16 }}>
        <div style={{ ...label, marginBottom: 4 }}>Your nutrition plan</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.dark }}>{sa.nutritionAdvice.headline}</div>
      </div>

      <div className="glow-fadeup" style={{ ...card, padding: 16, marginBottom: 16 }}>
        <div style={{ ...label, marginBottom: 4 }}>Nutrient deficiency radar</div>
        <RadarChart values={sa.nutrientDeficiencies} />
        <div style={{ display: "flex", gap: 16, justifyContent: "center", fontSize: 11, color: C.muted }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: C.amber, borderRadius: 2 }} /> Current</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, border: `1.5px dashed ${C.teal}` }} /> Ideal</span>
        </div>
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 16 }}>
        <div style={{ ...label, marginBottom: 12 }}>Today's nutrition goals</div>
        {nutrients.map((n, i) => {
          const v = sa.nutritionPlan?.[n.key];
          if (!v) return null;
          const pct = Math.min(100, (v.current / v.target) * 100);
          const isExp = expanded === n.key;
          return (
            <div key={n.key} onClick={() => setExpanded(isExp ? null : n.key)} style={{ padding: "12px 0", borderBottom: i < nutrients.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Apple size={16} color={C.teal} />
                <div style={{ flex: 1, fontSize: 13, color: C.body }}>{n.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{v.current} of {v.target} {n.unit}</div>
              </div>
              <div style={{ height: 5, background: C.tint, borderRadius: 999, marginTop: 8, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: C.teal, transition: "width 0.8s ease-out" }} />
              </div>
              {isExp && (
                <div className="glow-fadein" style={{ marginTop: 8, fontSize: 11, color: C.muted }}>
                  Sources: {sa.recommendedFoods?.slice(0, 3).map((f) => f.name).join(", ")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ ...label, marginBottom: 10, padding: "0 4px" }}>Recommended foods</div>
      <div className="glow-scroll-x" style={{ display: "flex", gap: 10, marginBottom: 20, marginLeft: -20, paddingLeft: 20, paddingRight: 20 }}>
        {sa.recommendedFoods?.map((f, i) => (
          <div key={i} style={{ ...card, padding: 14, minWidth: 140 }}>
            <Salad size={20} color={C.teal} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 4 }}>{f.name}</div>
            <span style={{ padding: "3px 8px", borderRadius: 999, background: C.tealTint, color: C.teal, fontSize: 10 }}>Good for: {f.benefit}</span>
          </div>
        ))}
      </div>

      <div style={{ ...label, marginBottom: 10, padding: "0 4px" }}>Meal log (today)</div>
      {["breakfast", "lunch", "dinner", "snacks"].map((sec) => (
        <div key={sec} style={{ ...card, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, textTransform: "capitalize" }}>{sec}</div>
            <button onClick={() => setAddingFor(addingFor === sec ? null : sec)} style={{ width: 26, height: 26, borderRadius: 8, background: C.tealTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plus size={14} color={C.teal} />
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.nutritionLog[sec].length === 0 && addingFor !== sec && <span style={{ fontSize: 12, color: C.muted }}>Nothing logged</span>}
            {data.nutritionLog[sec].map((f, i) => (
              <span key={i} style={{ padding: "5px 10px", borderRadius: 999, background: C.tint, fontSize: 11, color: C.body, display: "flex", alignItems: "center", gap: 5 }}>
                {f}
                <button onClick={() => update((d) => { d.nutritionLog[sec].splice(i, 1); })}><X size={10} color={C.muted} /></button>
              </span>
            ))}
          </div>
          {addingFor === sec && (
            <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFood(sec)}
              placeholder="Type food and press Enter" style={{ width: "100%", marginTop: 8, padding: 8, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, outline: "none" }} />
          )}
        </div>
      ))}

      <button className="glow-tap" disabled={insightLoading} onClick={getInsights}
        style={{ width: "100%", marginTop: 12, padding: 14, borderRadius: 12, background: C.teal, color: "#fff", fontWeight: 600, fontSize: 14 }}>
        {insightLoading ? "Analyzing meals..." : "Get AI Nutrition Insights"}
      </button>

      {data.nutritionInsights && (
        <div className="glow-fadeup" style={{ ...card, padding: 16, marginTop: 16 }}>
          <div style={{ ...label, marginBottom: 10 }}>AI Insights</div>
          <p style={{ fontSize: 13, color: C.body, marginBottom: 12 }}>{data.nutritionInsights.nutritionFeedback}</p>
          <div style={{ marginBottom: 12 }}>
            {["protein", "carbs", "fats"].map((m) => {
              const v = data.nutritionInsights.macroBreakdown?.[m] || 0;
              const col = { protein: C.teal, carbs: C.amber, fats: C.green }[m];
              return (
                <div key={m} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                    <span style={{ textTransform: "capitalize", color: C.body }}>{m}</span><span style={{ color: col, fontWeight: 600 }}>{v}%</span>
                  </div>
                  <div style={{ height: 5, background: C.tint, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${v}%`, height: "100%", background: col, transition: "width 0.8s" }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ ...label, marginBottom: 6 }}>Suggestions</div>
          {data.nutritionInsights.suggestions?.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: C.body, marginBottom: 6 }}>
              <CheckCircle size={14} color={C.teal} style={{ flexShrink: 0, marginTop: 2 }} />{s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- PROFILE ----------
function Sparkline({ data }) {
  const pts = data.filter((x) => x !== null);
  if (pts.length < 2) return <div style={{ fontSize: 10, color: C.muted }}>Not enough data</div>;
  const W = 80, H = 24;
  const min = Math.min(...pts), max = Math.max(...pts);
  const range = max - min || 1;
  const xs = pts.map((_, i) => (i * W) / (pts.length - 1));
  const ys = pts.map((p) => H - ((p - min) / range) * H);
  const d = xs.map((x, i) => `${i ? "L" : "M"} ${x} ${ys[i]}`).join(" ");
  return <svg width={W} height={H}><path d={d} stroke={C.teal} strokeWidth="1.5" fill="none" /></svg>;
}

function ProfileTab() {
  const { data, update, reset, setTab } = useApp();
  const [edit, setEdit] = useState(false);
  const [nm, setNm] = useState(data.user?.name || "");
  const [newProd, setNewProd] = useState("");
  const sa = data.analysisResults.skinAnalysis || data.analysisResults.hairAnalysis;
  const initials = (data.user?.name || "").split(" ").map((s) => s[0] || "").join("").slice(0, 2).toUpperCase();
  const history = data.reports.glowScoreHistory.map((h) => h.score);
  const padded = [...Array(Math.max(0, 7 - history.length)).fill(null), ...history].slice(-7);

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.tealTint, color: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, margin: "0 auto 12px", border: `3px solid ${C.teal}` }}>{initials || <UserCircle size={40} />}</div>
        {edit ? (
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            <input value={nm} onChange={(e) => setNm(e.target.value)} style={{ padding: 8, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, textAlign: "center", outline: "none" }} />
            <button className="glow-tap" onClick={() => { update((d) => { d.user.name = nm; }); setEdit(false); }} style={{ padding: "8px 14px", borderRadius: 8, background: C.teal, color: "#fff", fontSize: 12, fontWeight: 600 }}>Save</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20 }}>{data.user.name}</h2>
            <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Glowtics member since {data.user.memberSince}</p>
            <button className="glow-tap" onClick={() => setEdit(true)} style={{ marginTop: 10, padding: "6px 14px", borderRadius: 10, border: `1px solid ${C.teal}`, color: C.teal, fontSize: 11, fontWeight: 600 }}>Edit Name</button>
          </>
        )}
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 12 }}>
        <div style={{ ...label, marginBottom: 12 }}>Skin & Hair Profile</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { l: "Skin Type", v: sa ? skinQs[0].q && "Custom" : "—" },
            { l: "Hair Type", v: sa ? "Custom" : "—" },
            { l: "Primary Concern", v: sa?.rootCause?.split(" ").slice(0, 2).join(" ") || "—" },
            { l: "Goal", v: sa ? "Healthy glow" : "—" },
          ].map((x) => (
            <div key={x.l}>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{x.l}</div>
              <span style={{ padding: "4px 10px", borderRadius: 999, background: C.tealTint, color: C.teal, fontSize: 11, fontWeight: 500 }}>{x.v}</span>
            </div>
          ))}
        </div>
      </div>

      {sa && (
        <div style={{ ...card, padding: 16, marginBottom: 12 }}>
          <div style={{ ...label, marginBottom: 8 }}>Last analysis</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{fmtTime(data.analysisResults.lastAnalyzedAt)}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[["Glow", sa.glowScore], ["Skin", sa.skinScore], ["Hair", sa.hairScore]].map(([l, v]) => (
              <div key={l} style={{ flex: 1, padding: 10, borderRadius: 10, background: C.tint, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{l}</div>
              </div>
            ))}
          </div>
          <button className="glow-tap" onClick={() => setTab("analyze")} style={{ width: "100%", padding: 10, borderRadius: 10, background: C.teal, color: "#fff", fontSize: 12, fontWeight: 600 }}>Re-analyze</button>
        </div>
      )}

      <div style={{ ...card, padding: 16, marginBottom: 12 }}>
        <div style={{ ...label, marginBottom: 12 }}>Lifestyle Snapshot</div>
        {[
          { l: "Sleep", v: `${data.dailyLog.sleep}h` },
          { l: "Stress", v: `${data.dailyLog.stress}/5` },
          { l: "Water", v: `${data.dailyLog.water} cups` },
          { l: "Activity", v: `${data.logDays.length} days` },
        ].map((x) => (
          <div key={x.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 12, color: C.muted }}>{x.l}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{x.v}</div>
            </div>
            <Sparkline data={padded} />
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 12 }}>
        <div style={{ ...label, marginBottom: 10 }}>Current Products</div>
        {data.products.length === 0 && <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>No products added</div>}
        {data.products.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < data.products.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <Package size={16} color={C.body} />
            <div style={{ flex: 1, fontSize: 13, color: C.body }}>{p}</div>
            <button onClick={() => update((d) => d.products.splice(i, 1))}><X size={14} color={C.muted} /></button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <input value={newProd} onChange={(e) => setNewProd(e.target.value)} placeholder="Product name" style={{ flex: 1, padding: 8, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, outline: "none" }} />
          <button className="glow-tap" onClick={() => { if (newProd.trim()) { update((d) => d.products.push(newProd.trim())); setNewProd(""); } }} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.teal}`, color: C.teal, fontSize: 12, fontWeight: 600 }}>Add</button>
        </div>
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ ...label, marginBottom: 4 }}>Streak</div>
            <div style={{ fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <Flame size={20} color={C.amber} />{data.logDays.length}
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>days</span>
            </div>
          </div>
        </div>
        <div className="glow-scroll-x" style={{ display: "flex", gap: 8 }}>
          {data.achievements.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>Complete actions to unlock</div>}
          {data.achievements.map((a, i) => {
            const col = [C.teal, C.amber, C.green][i % 3];
            const bg = [C.tealTint, C.amberTint, C.greenTint][i % 3];
            return <span key={i} style={{ padding: "6px 12px", borderRadius: 999, background: bg, color: col, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{a}</span>;
          })}
        </div>
      </div>

      <div style={{ ...card, padding: 4 }}>
        {[
          { icon: Bell, l: "Notifications" }, { icon: Clock, l: "Reminder Time" }, { icon: Shield, l: "Privacy" }, { icon: HelpCircle, l: "Help" },
        ].map((x, i) => {
          const Ic = x.icon;
          return (
            <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderBottom: `1px solid ${C.border}` }}>
              <Ic size={16} color={C.body} />
              <div style={{ flex: 1, fontSize: 13, color: C.body }}>{x.l}</div>
              <ChevronRight size={14} color={C.muted} />
            </div>
          );
        })}
        <button className="glow-tap" onClick={() => { if (confirm("Logout and clear all data?")) reset(); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 14, color: C.coral }}>
          <LogOut size={16} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Logout</span>
        </button>
      </div>
    </div>
  );
}

// ---------- Shell ----------
function Shell() {
  const { data, tab } = useApp();
  if (!data.user.name) return <Onboarding />;
  const tabs = { home: HomeTab, analyze: AnalyzeTab, reports: ReportsTab, nutrition: NutritionTab, profile: ProfileTab };
  const Cur = tabs[tab];
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ maxWidth: 430, margin: "0 auto", background: C.bg, minHeight: "100vh" }}>
        <div key={tab} className="glow-fadeup">
          <Cur />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export default function Glowtics() {
  return (
    <div className="glow-root">
      <style>{styles}</style>
      <AppProvider><Shell /></AppProvider>
    </div>
  );
}
