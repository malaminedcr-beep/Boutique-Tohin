"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

// ─── DONNÉES CENTRALISÉES ─────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "box",    label: "Boxes",    icon: "📦", color: "#d4956a" },
  { id: "parfum", label: "Parfums",  icon: "🌸", color: "#c47abf" },
  { id: "kenzi",  label: "Kenzi",    icon: "🍬", color: "#c4845a" },
  { id: "tapis",  label: "Tapis",    icon: "🩷", color: "#b06090" },
  { id: "tasbih", label: "Tasbih",   icon: "📿", color: "#7090c0" },
  { id: "musk",   label: "Musk",     icon: "✨", color: "#90a060" },
  { id: "coran",  label: "Coran",    icon: "📖", color: "#a08050" },
  { id: "autre",  label: "Autres",   icon: "🗂️", color: "#7a7a8a" },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

const PRODUITS_INIT = [
  // BOXES
  { id:1,  nom:"Yara Box",        emoji:"🩷", cat:"box",    prix:15, cout:8,  stock:12, alerte:3  },
  { id:2,  nom:"Asad Box",        emoji:"🖤", cat:"box",    prix:15, cout:8,  stock:15, alerte:3  },
  { id:3,  nom:"Ameer Al Arab",   emoji:"🖤", cat:"box",    prix:25, cout:14, stock:7,  alerte:2  },
  { id:4,  nom:"Box Éclair",      emoji:"💛", cat:"box",    prix:15, cout:8,  stock:15, alerte:3  },
  { id:5,  nom:"Janeiro Rose",    emoji:"🩷", cat:"box",    prix:8,  cout:4,  stock:11, alerte:3  },
  { id:6,  nom:"Janeiro Rouge",   emoji:"❤️", cat:"box",    prix:8,  cout:4,  stock:7,  alerte:2  },
  // PARFUMS
  { id:7,  nom:"Powdery",         emoji:"🌸", cat:"parfum", prix:25, cout:12, stock:4,  alerte:2  },
  { id:8,  nom:"Satin Mood",      emoji:"🎀", cat:"parfum", prix:25, cout:12, stock:3,  alerte:2  },
  { id:9,  nom:"Vanilla Exotica", emoji:"✨", cat:"parfum", prix:50, cout:25, stock:1,  alerte:1  },
  { id:10, nom:"Grand Soir",      emoji:"🌙", cat:"parfum", prix:45, cout:22, stock:0,  alerte:1  },
  { id:11, nom:"Kirke",           emoji:"🔮", cat:"parfum", prix:20, cout:10, stock:0,  alerte:1  },
  // KENZI
  { id:12, nom:"Marshmallow",     emoji:"🍬", cat:"kenzi",  prix:25, cout:12, stock:9,  alerte:3  },
  { id:13, nom:"Vanilla 70",      emoji:"🍦", cat:"kenzi",  prix:25, cout:12, stock:2,  alerte:2  },
  { id:14, nom:"Amber Litchy",    emoji:"🧡", cat:"kenzi",  prix:25, cout:12, stock:5,  alerte:2  },
  { id:15, nom:"Apple",           emoji:"🍏", cat:"kenzi",  prix:25, cout:12, stock:6,  alerte:2  },
  // TAPIS
  { id:16, nom:"Tapis Rose",      emoji:"🩷", cat:"tapis",  prix:12, cout:5,  stock:22, alerte:5  },
  { id:17, nom:"Tapis Noir",      emoji:"🖤", cat:"tapis",  prix:12, cout:5,  stock:30, alerte:5  },
  { id:18, nom:"Tapis Blanc",     emoji:"🤍", cat:"tapis",  prix:12, cout:5,  stock:26, alerte:5  },
  // TASBIH
  { id:19, nom:"Tasbih Rose",     emoji:"🩷", cat:"tasbih", prix:5,  cout:2,  stock:18, alerte:5  },
  { id:20, nom:"Tasbih Noir",     emoji:"🖤", cat:"tasbih", prix:5,  cout:2,  stock:38, alerte:5  },
  { id:21, nom:"Tasbih Blanc",    emoji:"🤍", cat:"tasbih", prix:5,  cout:2,  stock:33, alerte:5  },
  // MUSK
  { id:22, nom:"Musk Rose",       emoji:"🩷", cat:"musk",   prix:5,  cout:2,  stock:10, alerte:3  },
  { id:23, nom:"Musk Noir",       emoji:"🖤", cat:"musk",   prix:5,  cout:2,  stock:17, alerte:3  },
  { id:24, nom:"Musk Blanc",      emoji:"🤍", cat:"musk",   prix:5,  cout:2,  stock:19, alerte:3  },
  // CORAN
  { id:25, nom:"Coran Rose",      emoji:"🩷", cat:"coran",  prix:8,  cout:4,  stock:12, alerte:3  },
  { id:26, nom:"Coran Noir",      emoji:"🖤", cat:"coran",  prix:8,  cout:4,  stock:17, alerte:3  },
  { id:27, nom:"Coran Blanc",     emoji:"🤍", cat:"coran",  prix:8,  cout:4,  stock:11, alerte:3  },
];

function genHistory(produits: typeof PRODUITS_INIT) {
  const sales: any[] = [];
  const now = Date.now();
  const DAY = 86400000;
  const CHANNELS = ["En ligne", "Main propre"];
  produits.forEach(p => {
    const rate = p.cat === "box" ? 0.55 : p.cat === "parfum" ? 0.3 : 0.18;
    for (let d = 29; d >= 0; d--) {
      const n = Math.random() < rate ? Math.ceil(Math.random() * 3) : 0;
      for (let i = 0; i < n; i++) {
        sales.push({
          id: `${p.id}-${d}-${i}-${Math.random()}`,
          produitId: p.id,
          qty: 1,
          prix: p.prix - (Math.random() < 0.1 ? 2 : 0),
          canal: CHANNELS[Math.floor(Math.random() * 2)],
          date: new Date(now - d * DAY - Math.random() * DAY).toISOString(),
        });
      }
    }
  });
  return sales;
}

const INIT_SALES = genHistory(PRODUITS_INIT);

const P = {
  bg:       "#07070c",
  s1:       "#0d0d16",
  s2:       "#13131e",
  s3:       "#1a1a28",
  s4:       "#222235",
  border:   "#2a2a40",
  borderHi: "#404060",
  gold:     "#c8a055",
  goldHi:   "#e4c070",
  goldDim:  "#5a4820",
  green:    "#50c890",
  red:      "#e04560",
  orange:   "#e09040",
  blue:     "#5090e0",
  purple:   "#9060d0",
  text:     "#eeeae4",
  muted:    "#70708a",
  dim:      "#30304a",
};

const vel = (sales: any[], id: number, days = 30) => {
  const cutoff = Date.now() - days * 86400000;
  return sales.filter(s => s.produitId === id && new Date(s.date).getTime() > cutoff)
    .reduce((a, s) => a + s.qty, 0);
};

const caFor = (sales: any[], id: number, days = 30) => {
  const cutoff = Date.now() - days * 86400000;
  return sales.filter(s => s.produitId === id && new Date(s.date).getTime() > cutoff)
    .reduce((a, s) => a + s.prix * s.qty, 0);
};

const spark14 = (sales: any[], id: number) => Array.from({ length: 14 }, (_, i) => {
  const d = 13 - i;
  const from = Date.now() - (d + 1) * 86400000;
  const to = Date.now() - d * 86400000;
  return sales.filter(s => s.produitId === id && new Date(s.date).getTime() > from && new Date(s.date).getTime() <= to)
    .reduce((a, s) => a + s.qty, 0);
});

const daysLeft = (stock: number, vel30: number) => vel30 === 0 ? null : Math.round((stock / vel30) * 30);
const restock = (vel30: number, weeks: number) => Math.ceil((vel30 / 30) * 7 * weeks);
const urgency = (p: any, dl: number | null) => {
  if (p.stock === 0) return "rupture";
  if (dl !== null && dl <= 5) return "critique";
  if (p.stock <= p.alerte) return "bas";
  return "ok";
};

const fmtEuro = (n: number) => `${n.toFixed(0)}€`;
const fmtDate = (iso: string) => new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function Badge({ u }: { u: string }) {
  const cfg: any = {
    rupture:  { bg: "#2a1020", c: P.red,    t: "RUPTURE"  },
    critique: { bg: "#2a1500", c: P.orange,  t: "CRITIQUE" },
    bas:      { bg: "#1e1800", c: "#d4a030", t: "⚠ BAS"   },
    ok:       { bg: "#081a10", c: P.green,   t: "OK"       },
  }[u];
  return <span style={{ background: cfg.bg, color: cfg.c, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, letterSpacing: 1, whiteSpace: "nowrap" }}>{cfg.t}</span>;
}

function Sparkline({ data, color = P.gold, h = 36 }: { data: number[], color?: string, h?: number }) {
  const max = Math.max(...data, 1);
  const W = 100, H = h;
  if (data.length < 2) return null;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * (H - 4) - 2}`).join(" ");
  const area = `M0,${H} L${pts.split(" ").join(" L")} L${W},${H} Z`;
  const id = `g${color.replace("#","")}`;
  return (
    <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Ring({ pct, color = P.gold, size = 56, label, val }: { pct: number, color?: string, size?: number, label?: string, val?: string }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={P.s4} strokeWidth={5} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        {val !== undefined && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color }}>
            {val}
          </div>
        )}
      </div>
      {label && <span style={{ fontSize: 10, color: P.muted, letterSpacing: 1 }}>{label}</span>}
    </div>
  );
}

function ProgressBar({ val, max, color = P.gold, label, right }: { val: number, max: number, color?: string, label?: string, right?: any }) {
  const pct = max > 0 ? Math.min(100, (val / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: P.muted }}>{label}</span>
        <span style={{ fontSize: 11, color, fontWeight: 600 }}>{right ?? val}</span>
      </div>
      <div style={{ height: 3, background: P.s4, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width .6s ease" }} />
      </div>
    </div>
  );
}

function BarChart({ data, color = P.gold, h = 48 }: { data: {l:string,v:number}[], color?: string, h?: number }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: h }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%" }}>
          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
            <div style={{
              width: "100%", background: color,
              height: `${(d.v / max) * 100}%`, minHeight: d.v > 0 ? 2 : 0,
              borderRadius: "2px 2px 0 0", opacity: i === data.length - 1 ? 1 : 0.5,
              transition: "height .4s ease"
            }} />
          </div>
          <span style={{ fontSize: 8, color: P.muted, letterSpacing: 0 }}>{d.l}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments, size = 120 }: { segments: {v:number,color:string}[], size?: number }) {
  const total = segments.reduce((s, g) => s + g.v, 0);
  if (total === 0) return null;
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  const arcs = segments.map(g => {
    const dash = (g.v / total) * circ;
    const offset = circ - acc;
    acc += dash;
    return { ...g, dash, offset };
  });
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {arcs.map((a, i) => (
        <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
          stroke={a.color} strokeWidth={10}
          strokeDasharray={`${a.dash} ${circ}`}
          strokeDashoffset={-a.offset + circ}
          strokeLinecap="butt" />
      ))}
    </svg>
  );
}

function Modal({ open, onClose, title, subtitle, width = 600, children }: any) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(8px)", padding: 20,
    }}>
      <div onClick={(e: any) => e.stopPropagation()} style={{
        background: P.s2, border: `1px solid ${P.border}`, borderRadius: 20,
        width: "100%", maxWidth: width, maxHeight: "90vh",
        overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 40px 120px rgba(0,0,0,.9)",
      }}>
        <div style={{
          padding: "22px 28px", borderBottom: `1px solid ${P.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0
        }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: P.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: P.muted, marginTop: 3 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: P.s4, border: "none", color: P.muted, width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "24px 28px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, min, max, step, suffix }: any) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 10, letterSpacing: 2, color: P.muted, textTransform: "uppercase", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)}
          placeholder={placeholder} min={min} max={max} step={step}
          style={{
            width: "100%", background: P.s3, border: `1px solid ${P.border}`,
            borderRadius: 10, padding: "10px 14px", color: P.text, fontSize: 15,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
            paddingRight: suffix ? 40 : 14,
          }} />
        {suffix && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: P.muted, fontSize: 12 }}>{suffix}</span>}
      </div>
    </div>
  );
}

export default function GestionApp() {
  const [produits, setProduits] = useState(PRODUITS_INIT);
  const [sales, setSales] = useState(INIT_SALES);
  const [page, setPage] = useState("dashboard");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("vel");
  const [toast, setToast] = useState<any>(null);

  const [modalProd, setModalProd] = useState<any>(null);
  const [modalVente, setModalVente] = useState<any>(null);
  const [modalEdit, setModalEdit] = useState<any>(null);
  const [modalAdd, setModalAdd] = useState(false);

  const [vQty, setVQty] = useState(1);
  const [vPrix, setVPrix] = useState("");
  const [vCanal, setVCanal] = useState("En ligne");

  const [eStock, setEStock] = useState("");
  const [ePrix, setEPrix] = useState("");
  const [eCout, setECout] = useState("");

  const [aForm, setAForm] = useState({ nom: "", emoji: "✨", cat: "parfum", prix: "", cout: "", stock: "", alerte: "2" });

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2600);
  };

  const enriched = useMemo(() => produits.map(p => {
    const v30  = vel(sales, p.id, 30);
    const v7   = vel(sales, p.id, 7);
    const v14  = vel(sales, p.id, 14);
    const ca30 = caFor(sales, p.id, 30);
    const dl   = daysLeft(p.stock, v30);
    const urg  = urgency(p, dl);
    const sp   = spark14(sales, p.id);
    const totalSold = sales.filter(s => s.produitId === p.id).reduce((a, s) => a + s.qty, 0);
    const marge30 = ca30 - v30 * p.cout;
    const online = sales.filter(s => s.produitId === p.id && s.canal === "En ligne").length;
    const hand   = sales.filter(s => s.produitId === p.id && s.canal === "Main propre").length;
    const r4w = restock(v30, 4);
    const r8w = restock(v30, 8);
    const cat = CAT_MAP[p.cat] || CAT_MAP.autre;
    return { ...p, v30, v7, v14, ca30, dl, urg, sp, totalSold, marge30, online, hand, r4w, r8w, cat };
  }), [produits, sales]);

  const G = useMemo(() => {
    const cutoff30 = Date.now() - 30 * 86400000;
    const cutoff7  = Date.now() - 7 * 86400000;
    const s30 = sales.filter(s => new Date(s.date).getTime() > cutoff30);
    const s7  = sales.filter(s => new Date(s.date).getTime() > cutoff7);
    const today = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
    const ca30 = s30.reduce((a, s) => a + s.prix * s.qty, 0);
    const ca7  = s7.reduce((a, s) => a + s.prix * s.qty, 0);
    const caToday = today.reduce((a, s) => a + s.prix * s.qty, 0);
    const totalStock = produits.reduce((a, p) => a + p.stock, 0);
    const ruptures = produits.filter(p => p.stock === 0).length;
    const alertes  = enriched.filter(p => p.urg !== "ok").length;
    const marge30 = s30.reduce((a, s) => {
      const p = produits.find((x: any) => x.id === s.produitId);
      return a + (p ? (s.prix - p.cout) * s.qty : 0);
    }, 0);
    const ca14days = Array.from({ length: 14 }, (_, i) => {
      const d = 13 - i;
      const from = Date.now() - (d + 1) * 86400000;
      const to   = Date.now() - d * 86400000;
      const label = new Date(to).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      const v = sales.filter(s => new Date(s.date).getTime() > from && new Date(s.date).getTime() <= to)
        .reduce((a, s) => a + s.prix * s.qty, 0);
      return { l: label.slice(0, 5), v: Math.round(v) };
    });
    const caByCat = CATEGORIES.map(cat => {
      const ids = produits.filter(p => p.cat === cat.id).map(p => p.id);
      const v = s30.filter(s => ids.includes(s.produitId)).reduce((a, s) => a + s.prix * s.qty, 0);
      return { label: cat.label, v: Math.round(v), color: cat.color };
    }).filter(x => x.v > 0);
    const top5 = [...enriched].sort((a, b) => b.v30 - a.v30).slice(0, 5);
    const online30 = s30.filter(s => s.canal === "En ligne").length;
    const hand30   = s30.filter(s => s.canal === "Main propre").length;
    return { ca30, ca7, caToday, totalStock, ruptures, alertes, marge30, ca14days, caByCat, top5, online30, hand30, nbSales30: s30.length };
  }, [produits, sales, enriched]);

  const filtered = useMemo(() => {
    let list = enriched.filter(p =>
      (catFilter === "all" || p.cat.id === catFilter) &&
      (search === "" || p.nom.toLowerCase().includes(search.toLowerCase()))
    );
    if (sortKey === "vel")     list = [...list].sort((a, b) => b.v30 - a.v30);
    if (sortKey === "stock")   list = [...list].sort((a, b) => a.stock - b.stock);
    if (sortKey === "urg")     list = [...list].sort((a, b) => ["rupture","critique","bas","ok"].indexOf(a.urg) - ["rupture","critique","bas","ok"].indexOf(b.urg));
    if (sortKey === "ca")      list = [...list].sort((a, b) => b.ca30 - a.ca30);
    if (sortKey === "marge")   list = [...list].sort((a, b) => b.marge30 - a.marge30);
    return list;
  }, [enriched, catFilter, search, sortKey]);

  const doVente = () => {
    const px = parseFloat(vPrix);
    const qty = parseInt(String(vQty));
    if (!px || px <= 0) { showToast("Prix invalide", false); return; }
    if (qty > modalVente.stock) { showToast("Stock insuffisant", false); return; }
    setProduits(prev => prev.map(p => p.id === modalVente.id ? { ...p, stock: p.stock - qty } : p));
    setSales(prev => [{ id: Date.now().toString(), produitId: modalVente.id, qty, prix: px, canal: vCanal, date: new Date().toISOString() }, ...prev]);
    setModalVente(null);
    showToast(`✓ ${qty}× ${modalVente.nom} vendu${qty > 1 ? "s" : ""} — ${(px * qty).toFixed(2)}€`);
  };

  const doEdit = () => {
    setProduits(prev => prev.map(p => p.id === modalEdit.id ? {
      ...p,
      stock: eStock !== "" ? parseInt(eStock) : p.stock,
      prix:  ePrix  !== "" ? parseFloat(ePrix)  : p.prix,
      cout:  eCout  !== "" ? parseFloat(eCout)  : p.cout,
    } : p));
    setModalEdit(null);
    showToast("✓ Article mis à jour");
  };

  const doAdd = () => {
    if (!aForm.nom.trim()) { showToast("Nom requis", false); return; }
    const newP = {
      id: Date.now(), nom: aForm.nom.trim(), emoji: aForm.emoji,
      cat: aForm.cat, prix: parseFloat(aForm.prix) || 0,
      cout: parseFloat(aForm.cout) || 0, stock: parseInt(aForm.stock) || 0,
      alerte: parseInt(aForm.alerte) || 2,
    };
    setProduits(prev => [...prev, newP]);
    setModalAdd(false);
    setAForm({ nom: "", emoji: "✨", cat: "parfum", prix: "", cout: "", stock: "", alerte: "2" });
    showToast("✓ Article ajouté");
  };

  const openVente = (p: any) => { setModalVente(p); setVQty(1); setVPrix(String(p.prix)); setVCanal("En ligne"); };
  const openEdit  = (p: any) => { setModalEdit(p);  setEStock(String(p.stock)); setEPrix(String(p.prix)); setECout(String(p.cout)); };

  const T: any = {
    card: { background: P.s2, border: `1px solid ${P.border}`, borderRadius: 16 },
    muted: { fontSize: 10, color: P.muted, letterSpacing: 2, textTransform: "uppercase" as const },
    bigNum: { fontFamily: "'Syne', sans-serif", fontWeight: 800, lineHeight: 1 },
    row: { display: "flex", alignItems: "center", gap: 12 },
  };

  const NAV_ITEMS = [
    { id: "dashboard", icon: "◈", label: "Dashboard" },
    { id: "stock",     icon: "⊟", label: "Stock"     },
    { id: "ventes",    icon: "◎", label: "Ventes"    },
    { id: "analytics", icon: "◑", label: "Analytics" },
  ];

  const urgents = enriched.filter(p => p.urg !== "ok");

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", background: P.bg, color: P.text, fontFamily: "'DM Sans', sans-serif", overflow: "hidden", zIndex: 100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:${P.s1}; }
        ::-webkit-scrollbar-thumb { background:${P.border}; border-radius:2px; }
        input, select, textarea { outline:none; }
        button { cursor:pointer; }
        .row-hover:hover { background:${P.s3} !important; cursor:pointer; }
        .card-hover:hover { background:${P.s3} !important; border-color:${P.borderHi} !important; cursor:pointer; transform:translateY(-1px); }
        * { transition: none; }
        .trans { transition: all .2s ease !important; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{
        width: 220, background: P.s1, borderRight: `1px solid ${P.border}`,
        display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${P.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${P.gold}, ${P.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🕌</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: P.goldHi, letterSpacing: 0.5 }}>NOUR</div>
              <div style={{ fontSize: 9, color: P.muted, letterSpacing: 2 }}>GESTION</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {NAV_ITEMS.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "11px 14px", borderRadius: 10, border: "none", marginBottom: 4,
              background: page === n.id ? `${P.gold}18` : "transparent",
              color: page === n.id ? P.goldHi : P.muted,
              fontSize: 13, fontWeight: page === n.id ? 600 : 400,
              fontFamily: "'DM Sans', sans-serif",
              borderLeft: page === n.id ? `2px solid ${P.gold}` : "2px solid transparent",
            }}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {urgents.length > 0 && (
          <div style={{ margin: "0 12px 16px", background: "#1a0f08", border: `1px solid ${P.border}`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: P.orange, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>⚠ {urgents.length} ALERTES</div>
            {urgents.slice(0, 4).map(p => (
              <div key={p.id} onClick={() => setModalProd(p)} className="row-hover trans" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 6px", borderRadius: 6 }}>
                <span style={{ fontSize: 12 }}>{p.emoji} {p.nom.length > 12 ? p.nom.slice(0,12)+"…" : p.nom}</span>
                <Badge u={p.urg} />
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: "0 12px 20px" }}>
          <button onClick={() => setModalAdd(true)} style={{
            width: "100%", background: `${P.gold}20`, border: `1px solid ${P.goldDim}`,
            borderRadius: 10, padding: "10px", color: P.gold, fontSize: 12, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5,
          }}>+ Ajouter article</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{
          height: 56, background: P.s1, borderBottom: `1px solid ${P.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", flexShrink: 0,
        }}>
          <div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: P.text }}>
              {({ dashboard: "Vue d'ensemble", stock: "Stock", ventes: "Historique des ventes", analytics: "Analytics" } as any)[page]}
            </span>
            <span style={{ fontSize: 12, color: P.muted, marginLeft: 12 }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ fontSize: 13, color: P.muted }}>CA aujourd'hui :</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: P.green }}>{fmtEuro(G.caToday)}</div>
            <button onClick={() => setModalAdd(true)} style={{
              background: `linear-gradient(135deg, ${P.gold}, ${P.goldDim})`,
              border: "none", borderRadius: 8, padding: "7px 16px",
              color: P.bg, fontWeight: 700, fontSize: 12, fontFamily: "'DM Sans', sans-serif",
            }}>+ Nouveau</button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>

          {/* DASHBOARD */}
          {page === "dashboard" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "CA 30j", value: fmtEuro(G.ca30), sub: `+${G.nbSales30} ventes`, color: P.green, icon: "💰" },
                  { label: "CA 7j",  value: fmtEuro(G.ca7),  sub: "cette semaine",           color: P.goldHi, icon: "📈" },
                  { label: "Marge 30j", value: fmtEuro(G.marge30), sub: `${G.ca30 > 0 ? Math.round(G.marge30/G.ca30*100) : 0}% marge`, color: P.blue, icon: "📊" },
                  { label: "Stock",  value: G.totalStock,    sub: `${produits.length} réfs`,  color: P.text,   icon: "📦" },
                  { label: "Alertes",value: G.alertes,       sub: `${G.ruptures} ruptures`,   color: G.alertes > 0 ? P.red : P.green, icon: "⚠️" },
                ].map(k => (
                  <div key={k.label} style={{ ...T.card, padding: "18px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={T.muted}>{k.label}</span>
                      <span style={{ fontSize: 16 }}>{k.icon}</span>
                    </div>
                    <div style={{ ...T.bigNum, fontSize: 26, color: k.color, marginBottom: 4 }}>{k.value}</div>
                    <div style={{ fontSize: 11, color: P.muted }}>{k.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{ ...T.card, padding: "20px 20px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={T.muted}>CA — 14 derniers jours</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: P.text, marginTop: 4 }}>{fmtEuro(G.ca30)}</div>
                    </div>
                    <div style={{ fontSize: 11, color: P.green, background: `${P.green}15`, padding: "4px 10px", borderRadius: 20 }}>30 jours</div>
                  </div>
                  <BarChart data={G.ca14days} color={P.gold} h={72} />
                </div>

                <div style={{ ...T.card, padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={T.muted}>CA par catégorie</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <DonutChart segments={G.caByCat} size={90} />
                    <div style={{ flex: 1 }}>
                      {G.caByCat.slice(0,4).map((c: any) => (
                        <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: P.muted, flex: 1 }}>{c.label}</span>
                          <span style={{ fontSize: 11, color: P.text, fontWeight: 600 }}>{fmtEuro(c.v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ ...T.card, padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={T.muted}>Canaux de vente</div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                    <Ring pct={(G.online30 / Math.max(G.online30 + G.hand30, 1)) * 100} color={P.blue} size={64} label="En ligne" val={`${G.online30 > 0 ? Math.round(G.online30 / (G.online30 + G.hand30) * 100) : 0}%`} />
                    <Ring pct={(G.hand30 / Math.max(G.online30 + G.hand30, 1)) * 100} color={P.gold} size={64} label="Main propre" val={`${G.hand30 > 0 ? Math.round(G.hand30 / (G.online30 + G.hand30) * 100) : 0}%`} />
                  </div>
                  <ProgressBar val={G.online30} max={G.online30 + G.hand30} color={P.blue} label="En ligne" right={G.online30} />
                  <ProgressBar val={G.hand30}   max={G.online30 + G.hand30} color={P.gold} label="Main propre" right={G.hand30} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ ...T.card, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${P.border}`, display: "flex", justifyContent: "space-between" }}>
                    <span style={T.muted}>🏆 Top 5 — 30j</span>
                    <button onClick={() => setPage("stock")} style={{ background: "none", border: "none", color: P.gold, fontSize: 11, cursor: "pointer" }}>Voir tout →</button>
                  </div>
                  {G.top5.map((p: any, i: number) => (
                    <div key={p.id} className="row-hover trans" onClick={() => setModalProd(p)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${P.border}` }}>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: [P.goldHi, P.muted, `${P.goldDim}`, P.muted, P.muted][i], width: 20 }}>{i + 1}</span>
                      <span style={{ fontSize: 20, width: 28 }}>{p.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{p.nom}</div>
                        <div style={{ fontSize: 11, color: P.muted }}>{p.cat.label}</div>
                      </div>
                      <div style={{ width: 60 }}><Sparkline data={p.sp} color={p.cat.color} h={24} /></div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: P.goldHi }}>{p.v30}</div>
                        <div style={{ fontSize: 11, color: P.green }}>{fmtEuro(p.ca30)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ ...T.card, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${P.border}` }}>
                    <span style={T.muted}>⚠ Urgences stock</span>
                  </div>
                  {urgents.length === 0 ? (
                    <div style={{ padding: "32px 20px", textAlign: "center", color: P.green, fontSize: 13 }}>✓ Tout est en ordre</div>
                  ) : urgents.map(p => (
                    <div key={p.id} className="row-hover trans" onClick={() => setModalProd(p)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${P.border}` }}>
                      <span style={{ fontSize: 20 }}>{p.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{p.nom}</div>
                        <div style={{ fontSize: 11, color: P.muted }}>{p.dl !== null ? `~${p.dl}j restants` : "Aucune vente récente"}</div>
                      </div>
                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 4 }}>
                        <Badge u={p.urg} />
                        <span style={{ fontSize: 10, color: P.muted }}>Réappro: {p.r4w}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STOCK */}
          {page === "stock" && (
            <div>
              <div style={{ ...T.card, padding: "14px 18px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..."
                  style={{ background: P.s3, border: `1px solid ${P.border}`, borderRadius: 8, padding: "8px 12px", color: P.text, fontSize: 12, width: 180 }} />
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => setCatFilter("all")}
                    style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${catFilter === "all" ? P.gold : P.border}`, background: catFilter === "all" ? `${P.gold}20` : "transparent", color: catFilter === "all" ? P.gold : P.muted, fontSize: 11, cursor: "pointer" }}>
                    Tout
                  </button>
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => setCatFilter(c.id)}
                      style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${catFilter === c.id ? c.color : P.border}`, background: catFilter === c.id ? `${c.color}20` : "transparent", color: catFilter === c.id ? c.color : P.muted, fontSize: 11, cursor: "pointer" }}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: P.muted }}>Trier :</span>
                  {[["vel","Vélocité"],["stock","Stock"],["urg","Urgence"],["ca","CA"],["marge","Marge"]].map(([k,l]) => (
                    <button key={k} onClick={() => setSortKey(k)}
                      style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${sortKey === k ? P.gold : P.border}`, background: sortKey === k ? `${P.gold}15` : "transparent", color: sortKey === k ? P.gold : P.muted, fontSize: 11, cursor: "pointer" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ ...T.card, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                      {["Produit","Catégorie","Tendance","Stock","Vélocité 30j","CA 30j","Marge","Statut",""].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", ...T.muted, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} className="row-hover trans" onClick={() => setModalProd(p)}
                        style={{ borderBottom: `1px solid ${P.border}` }}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 20 }}>{p.emoji}</span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{p.nom}</div>
                              <div style={{ fontSize: 11, color: P.muted }}>{p.prix}€</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: 11, color: p.cat.color, background: `${p.cat.color}18`, padding: "3px 10px", borderRadius: 20 }}>
                            {p.cat.icon} {p.cat.label}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", width: 80 }}><Sparkline data={p.sp} color={p.cat.color} h={28} /></td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: p.stock === 0 ? P.red : p.stock <= p.alerte ? P.orange : P.text }}>{p.stock}</span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: p.cat.color }}>{p.v30}</div>
                          <div style={{ fontSize: 10, color: P.muted }}>~{(p.v30/30).toFixed(1)}/j</div>
                        </td>
                        <td style={{ padding: "14px 16px", color: P.green, fontWeight: 600 }}>{fmtEuro(p.ca30)}</td>
                        <td style={{ padding: "14px 16px", color: p.marge30 >= 0 ? P.blue : P.red, fontWeight: 600 }}>{fmtEuro(p.marge30)}</td>
                        <td style={{ padding: "14px 16px" }}><Badge u={p.urg} /></td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }} onClick={(e: any) => e.stopPropagation()}>
                            <button disabled={p.stock === 0} onClick={() => openVente(p)}
                              style={{ background: p.stock === 0 ? P.s4 : `${P.green}20`, color: p.stock === 0 ? P.muted : P.green, border: `1px solid ${p.stock === 0 ? P.border : P.green}40`, borderRadius: 7, padding: "6px 12px", fontSize: 11, fontWeight: 600 }}>
                              Vendre
                            </button>
                            <button onClick={() => openEdit(p)}
                              style={{ background: `${P.gold}15`, color: P.gold, border: `1px solid ${P.goldDim}`, borderRadius: 7, padding: "6px 10px", fontSize: 11 }}>
                              ✏️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VENTES */}
          {page === "ventes" && (() => {
            const ventes = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 60);
            return (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { l: "CA total",    v: fmtEuro(sales.reduce((a,s) => a+s.prix*s.qty,0)), c: P.green },
                    { l: "CA 30j",      v: fmtEuro(G.ca30), c: P.goldHi },
                    { l: "Nb ventes",   v: sales.length, c: P.text },
                    { l: "Panier moyen",v: sales.length > 0 ? fmtEuro(sales.reduce((a,s)=>a+s.prix*s.qty,0)/sales.length) : "—", c: P.blue },
                  ].map(k => (
                    <div key={k.l} style={{ ...T.card, padding: "16px 18px" }}>
                      <div style={{ ...T.muted, marginBottom: 8 }}>{k.l}</div>
                      <div style={{ ...T.bigNum, fontSize: 26, color: k.c }}>{k.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ ...T.card, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                        {["Produit","Canal","Qté","Prix unit.","Montant","Date"].map(h => (
                          <th key={h} style={{ padding: "12px 18px", textAlign: "left", ...T.muted, fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ventes.map(v => {
                        const prod = enriched.find(p => p.id === v.produitId);
                        return (
                          <tr key={v.id} style={{ borderBottom: `1px solid ${P.border}` }}>
                            <td style={{ padding: "12px 18px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 18 }}>{prod?.emoji || "?"}</span>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{prod?.nom || "Inconnu"}</span>
                              </div>
                            </td>
                            <td style={{ padding: "12px 18px" }}>
                              <span style={{ fontSize: 11, color: v.canal === "En ligne" ? P.blue : P.gold, background: v.canal === "En ligne" ? `${P.blue}18` : `${P.gold}18`, padding: "3px 9px", borderRadius: 20 }}>
                                {v.canal === "En ligne" ? "🌐" : "🤝"} {v.canal}
                              </span>
                            </td>
                            <td style={{ padding: "12px 18px", color: P.muted }}>×{v.qty}</td>
                            <td style={{ padding: "12px 18px", color: P.gold }}>{v.prix.toFixed(2)}€</td>
                            <td style={{ padding: "12px 18px", fontWeight: 700, color: P.green }}>{(v.prix * v.qty).toFixed(2)}€</td>
                            <td style={{ padding: "12px 18px", color: P.muted, fontSize: 12 }}>{fmtDate(v.date)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* ANALYTICS */}
          {page === "analytics" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                {CATEGORIES.map(cat => {
                  const prods = enriched.filter(p => p.cat.id === cat.id);
                  if (prods.length === 0) return null;
                  const totalCA = prods.reduce((a, p) => a + p.ca30, 0);
                  const totalV  = prods.reduce((a, p) => a + p.v30, 0);
                  const totalStock = prods.reduce((a, p) => a + p.stock, 0);
                  return (
                    <div key={cat.id} style={{ ...T.card, padding: "16px 18px", borderTop: `2px solid ${cat.color}`, cursor: "pointer" }}
                      className="card-hover trans" onClick={() => { setPage("stock"); setCatFilter(cat.id); }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontSize: 22 }}>{cat.icon}</span>
                        <span style={{ fontSize: 10, color: cat.color, background: `${cat.color}18`, padding: "3px 8px", borderRadius: 20, letterSpacing: 1 }}>{prods.length} réfs</span>
                      </div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: P.text, marginBottom: 2 }}>{cat.label}</div>
                      <div style={{ fontSize: 11, color: P.muted, marginBottom: 12 }}>{totalStock} en stock</div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div><div style={{ ...T.muted, marginBottom: 3 }}>CA 30j</div><div style={{ fontWeight: 700, color: cat.color }}>{fmtEuro(totalCA)}</div></div>
                        <div><div style={{ ...T.muted, marginBottom: 3 }}>Vendus</div><div style={{ fontWeight: 700, color: P.text }}>{totalV}</div></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ ...T.card, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: `1px solid ${P.border}`, ...T.muted }}>📊 Classement CA — 30 jours</div>
                  {[...enriched].sort((a,b) => b.ca30 - a.ca30).slice(0,8).map((p, i) => {
                    const topCA = [...enriched].sort((a,b) => b.ca30 - a.ca30)[0]?.ca30 || 1;
                    return (
                      <div key={p.id} className="row-hover trans" onClick={() => setModalProd(p)}
                        style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 18px", borderBottom: `1px solid ${P.border}` }}>
                        <span style={{ fontSize: 11, color: P.muted, width: 18, textAlign: "right" }}>#{i+1}</span>
                        <span style={{ fontSize: 18 }}>{p.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{p.nom}</div>
                          <div style={{ height: 3, background: P.s4, borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(p.ca30/topCA)*100}%`, background: p.cat.color }} />
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, color: P.green, fontSize: 13 }}>{fmtEuro(p.ca30)}</div>
                          <div style={{ fontSize: 10, color: P.muted }}>{p.v30} vendus</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ ...T.card, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: `1px solid ${P.border}`, ...T.muted }}>🔮 Prévisions réapprovisionnement</div>
                  <div style={{ padding: "6px 0" }}>
                    {[...enriched].filter(p => p.v30 > 0).sort((a,b) => ((a.dl??999) - (b.dl??999))).slice(0,8).map(p => (
                      <div key={p.id} className="row-hover trans" onClick={() => setModalProd(p)}
                        style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 18px", borderBottom: `1px solid ${P.border}` }}>
                        <span style={{ fontSize: 18 }}>{p.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{p.nom}</div>
                          <div style={{ fontSize: 10, color: p.dl !== null && p.dl <= 7 ? P.red : P.muted }}>
                            {p.dl !== null ? `Stock tient ~${p.dl}j` : "Aucune vente récente"}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, color: P.gold, fontWeight: 600 }}>Cmd ×{p.r4w}</div>
                          <div style={{ fontSize: 10, color: P.muted }}>{fmtEuro(p.r4w * p.cout)} budget</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ ...T.card, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${P.border}`, ...T.muted }}>💎 Analyse de marges</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                      {["Produit","Prix vente","Coût","Marge unit.","% Marge","CA 30j","Marge 30j"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", ...T.muted, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...enriched].sort((a,b) => b.marge30 - a.marge30).map(p => {
                      const margeU = p.prix - p.cout;
                      const pctMarge = p.prix > 0 ? Math.round((margeU / p.prix) * 100) : 0;
                      return (
                        <tr key={p.id} className="row-hover trans" onClick={() => setModalProd(p)} style={{ borderBottom: `1px solid ${P.border}` }}>
                          <td style={{ padding: "10px 16px" }}><span style={{ fontSize: 16, marginRight: 6 }}>{p.emoji}</span>{p.nom}</td>
                          <td style={{ padding: "10px 16px", color: P.gold }}>{p.prix}€</td>
                          <td style={{ padding: "10px 16px", color: P.muted }}>{p.cout}€</td>
                          <td style={{ padding: "10px 16px", color: margeU >= 0 ? P.green : P.red, fontWeight: 600 }}>{margeU.toFixed(2)}€</td>
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 3, background: P.s4, borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${pctMarge}%`, background: pctMarge > 50 ? P.green : pctMarge > 30 ? P.orange : P.red }} />
                              </div>
                              <span style={{ fontSize: 11, color: P.text, width: 32, textAlign: "right" }}>{pctMarge}%</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 16px", color: P.text }}>{fmtEuro(p.ca30)}</td>
                          <td style={{ padding: "10px 16px", fontWeight: 700, color: p.marge30 >= 0 ? P.green : P.red }}>{fmtEuro(p.marge30)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL DÉTAIL */}
      <Modal open={!!modalProd} onClose={() => setModalProd(null)} title={modalProd ? `${modalProd.emoji} ${modalProd.nom}` : ""} subtitle={modalProd?.cat?.label} width={720}>
        {modalProd && (() => {
          const p = modalProd;
          const recentV = sales.filter(s => s.produitId === p.id).sort((a,b) => new Date(b.date).getTime()-new Date(a.date).getTime()).slice(0,6);
          return (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
                {[
                  { l: "Stock",    v: p.stock,             c: p.stock === 0 ? P.red : P.text },
                  { l: "Vendus/30j",v: p.v30,              c: p.cat.color },
                  { l: "CA 30j",   v: fmtEuro(p.ca30),     c: P.green },
                  { l: "Marge 30j",v: fmtEuro(p.marge30),  c: p.marge30 >= 0 ? P.blue : P.red },
                ].map(k => (
                  <div key={k.l} style={{ background: P.s3, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: P.muted, letterSpacing: 2, marginBottom: 8 }}>{k.l}</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: k.c }}>{k.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ background: P.s3, borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 10, color: P.muted, letterSpacing: 2, marginBottom: 12 }}>TENDANCE 14 JOURS</div>
                  <Sparkline data={p.sp} color={p.cat.color} h={60} />
                  <div style={{ marginTop: 14 }}>
                    <ProgressBar val={p.v7}  max={p.v30 || 1} color={p.cat.color} label="7j" right={p.v7} />
                    <ProgressBar val={p.v14} max={p.v30 || 1} color={`${p.cat.color}99`} label="14j" right={p.v14} />
                  </div>
                </div>
                <div style={{ background: P.s3, borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 10, color: P.muted, letterSpacing: 2, marginBottom: 16 }}>PRÉVISIONS</div>
                  {p.v30 === 0 ? (
                    <p style={{ color: P.muted, fontSize: 13 }}>Aucune vente récente.</p>
                  ) : (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: P.muted, marginBottom: 4 }}>Stock actuel tient</div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: p.dl <= 7 ? P.red : p.dl <= 14 ? P.orange : P.green }}>
                          {p.dl}j
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[[4,p.r4w],[8,p.r8w]].map(([w,q]) => (
                          <div key={w} style={{ background: P.s4, borderRadius: 10, padding: "12px", textAlign: "center" }}>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, color: P.gold }}>{q}</div>
                            <div style={{ fontSize: 10, color: P.muted }}>{w} semaines</div>
                            <div style={{ fontSize: 10, color: P.dim, marginTop: 2 }}>{fmtEuro(q * p.cout)}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div style={{ background: P.s3, borderRadius: 14, padding: 18, marginBottom: 16, display: "flex", gap: 24, alignItems: "center" }}>
                <Ring pct={p.v30 > 0 ? (p.online / (p.online + p.hand)) * 100 : 0} color={P.blue} size={72} label="En ligne" val={String(p.online)} />
                <Ring pct={p.v30 > 0 ? (p.hand / (p.online + p.hand)) * 100 : 0} color={P.gold} size={72} label="Main propre" val={String(p.hand)} />
                <div style={{ flex: 1 }}>
                  <ProgressBar val={p.online} max={p.online + p.hand} color={P.blue} label="En ligne" right={p.online} />
                  <ProgressBar val={p.hand}   max={p.online + p.hand} color={P.gold} label="Main propre" right={p.hand} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: P.muted, letterSpacing: 2, marginBottom: 6 }}>TOTAL VENDU</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, color: P.text }}>{p.totalSold}</div>
                  <div style={{ fontSize: 11, color: P.green, marginTop: 2 }}>{fmtEuro(p.totalSold * p.prix)}</div>
                </div>
              </div>
              <div style={{ background: P.s3, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${P.border}`, fontSize: 10, color: P.muted, letterSpacing: 2 }}>DERNIÈRES VENTES</div>
                {recentV.length === 0 ? <div style={{ padding: 24, color: P.muted, fontSize: 13, textAlign: "center" }}>Aucune vente</div> : recentV.map((s: any) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${P.border}` }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>×{s.qty}</span>
                      <span style={{ fontSize: 11, color: P.muted, marginLeft: 8 }}>{s.canal} · {fmtDate(s.date)}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: P.green }}>{(s.prix * s.qty).toFixed(2)}€</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button disabled={p.stock === 0} onClick={() => { setModalProd(null); openVente(p); }}
                  style={{ flex: 2, padding: 14, background: p.stock === 0 ? P.s4 : `${P.green}25`, border: `1px solid ${p.stock === 0 ? P.border : P.green}60`, borderRadius: 12, color: p.stock === 0 ? P.muted : P.green, fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                  {p.stock === 0 ? "Rupture de stock" : "💸 Enregistrer une vente"}
                </button>
                <button onClick={() => { setModalProd(null); openEdit(p); }}
                  style={{ flex: 1, padding: 14, background: `${P.gold}15`, border: `1px solid ${P.goldDim}`, borderRadius: 12, color: P.gold, fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                  ✏️ Modifier
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* MODAL VENTE */}
      <Modal open={!!modalVente} onClose={() => setModalVente(null)} title="Enregistrer une vente" subtitle={modalVente ? `${modalVente.emoji} ${modalVente.nom} — ${modalVente.stock} en stock` : ""} width={400}>
        {modalVente && (
          <div>
            <Field label="Quantité" type="number" value={vQty} onChange={setVQty} min="1" max={modalVente.stock} />
            <Field label="Prix de vente (€)" type="number" value={vPrix} onChange={setVPrix} step="0.01" placeholder={`Suggéré : ${modalVente.prix}€`} suffix="€" />
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: P.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Canal</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["En ligne","Main propre"].map(c => (
                  <button key={c} onClick={() => setVCanal(c)} style={{
                    flex: 1, padding: "11px", borderRadius: 10,
                    background: vCanal === c ? `${P.gold}20` : P.s3,
                    border: `1px solid ${vCanal === c ? P.gold : P.border}`,
                    color: vCanal === c ? P.gold : P.muted, fontWeight: 600, fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif"
                  }}>{c === "En ligne" ? "🌐" : "🤝"} {c}</button>
                ))}
              </div>
            </div>
            {vPrix && vQty && (
              <div style={{ textAlign: "center", marginBottom: 20, fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: P.green }}>
                {(parseFloat(vPrix) * parseInt(String(vQty))).toFixed(2)}€
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModalVente(null)} style={{ flex: 1, padding: 13, background: "transparent", border: `1px solid ${P.border}`, borderRadius: 12, color: P.muted, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Annuler</button>
              <button onClick={doVente} style={{ flex: 2, padding: 13, background: `linear-gradient(135deg, ${P.gold}, ${P.goldDim})`, border: "none", borderRadius: 12, color: P.bg, fontWeight: 800, fontSize: 14, fontFamily: "'Syne', sans-serif" }}>✓ Confirmer</button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL EDIT */}
      <Modal open={!!modalEdit} onClose={() => setModalEdit(null)} title="Modifier l'article" subtitle={modalEdit ? `${modalEdit.emoji} ${modalEdit.nom}` : ""} width={400}>
        {modalEdit && (
          <div>
            <Field label="Stock actuel" type="number" value={eStock} onChange={setEStock} min="0" />
            <Field label="Prix de vente (€)" type="number" value={ePrix} onChange={setEPrix} step="0.01" suffix="€" />
            <Field label="Coût d'achat (€)" type="number" value={eCout} onChange={setECout} step="0.01" suffix="€" />
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={() => setModalEdit(null)} style={{ flex: 1, padding: 13, background: "transparent", border: `1px solid ${P.border}`, borderRadius: 12, color: P.muted, fontFamily: "'DM Sans', sans-serif" }}>Annuler</button>
              <button onClick={doEdit} style={{ flex: 2, padding: 13, background: `linear-gradient(135deg, ${P.gold}, ${P.goldDim})`, border: "none", borderRadius: 12, color: P.bg, fontWeight: 800, fontSize: 14, fontFamily: "'Syne', sans-serif" }}>✓ Enregistrer</button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL AJOUTER */}
      <Modal open={modalAdd} onClose={() => setModalAdd(false)} title="Ajouter un article" width={460}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
          <div style={{ gridColumn: "1/-1" }}><Field label="Nom *" value={aForm.nom} onChange={(v: string) => setAForm(p=>({...p,nom:v}))} placeholder="Ex: Satin Mood" /></div>
          <Field label="Emoji" value={aForm.emoji} onChange={(v: string) => setAForm(p=>({...p,emoji:v}))} placeholder="🌸" />
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: P.muted, textTransform: "uppercase", marginBottom: 6 }}>CATÉGORIE</div>
            <select value={aForm.cat} onChange={e => setAForm(p=>({...p,cat:e.target.value}))}
              style={{ width: "100%", background: P.s3, border: `1px solid ${P.border}`, borderRadius: 10, padding: "10px 14px", color: P.text, fontSize: 14 }}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <Field label="Prix vente (€)" type="number" value={aForm.prix} onChange={(v: string) => setAForm(p=>({...p,prix:v}))} step="0.01" suffix="€" />
          <Field label="Coût achat (€)" type="number" value={aForm.cout} onChange={(v: string) => setAForm(p=>({...p,cout:v}))} step="0.01" suffix="€" />
          <Field label="Stock initial" type="number" value={aForm.stock} onChange={(v: string) => setAForm(p=>({...p,stock:v}))} min="0" />
          <Field label="Seuil alerte" type="number" value={aForm.alerte} onChange={(v: string) => setAForm(p=>({...p,alerte:v}))} min="1" />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={() => setModalAdd(false)} style={{ flex: 1, padding: 13, background: "transparent", border: `1px solid ${P.border}`, borderRadius: 12, color: P.muted, fontFamily: "'DM Sans', sans-serif" }}>Annuler</button>
          <button onClick={doAdd} style={{ flex: 2, padding: 13, background: `linear-gradient(135deg, ${P.gold}, ${P.goldDim})`, border: "none", borderRadius: 12, color: P.bg, fontWeight: 800, fontSize: 14, fontFamily: "'Syne', sans-serif" }}>✓ Ajouter</button>
        </div>
      </Modal>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 2000,
          background: toast.ok ? "#0a1e12" : "#1e080a",
          border: `1px solid ${toast.ok ? P.green : P.red}30`,
          color: toast.ok ? P.green : P.red,
          borderRadius: 12, padding: "12px 20px", fontSize: 13, fontWeight: 600,
          boxShadow: "0 12px 40px rgba(0,0,0,.8)", letterSpacing: 0.3
        }}>{toast.msg}</div>
      )}
    </div>
  );
}
