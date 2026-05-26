import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

// ── Hook: busca dados reais de uma rota de API ─────────────────────────────────
function useApi(url, interval = 0) {
  const [data, setData]     = useState(null);
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    if (interval > 0) {
      const t = setInterval(fetchData, interval);
      return () => clearInterval(t);
    }
  }, [fetchData, interval]);

  return { data, error, loading, refetch: fetchData };
}

// ── Utilitários ────────────────────────────────────────────────────────────────
const fmtNum  = (n) => (n == null ? "—" : Number(n).toLocaleString("pt-BR"));
const fmtDate = (s) => s ? new Date(s).toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtTime = (s) => s ? new Date(s).toLocaleTimeString("pt-BR") : "—";
const clamp   = (v, max) => Math.min(100, Math.round((v / max) * 100));

// Verificação Level → label
const VERIFY = ["Nenhum","Baixo","Médio","Alto","Máximo"];
// Boost Level → label
const BOOST_LABEL = ["Sem Boost","Nível 1","Nível 2","Nível 3"];

// ── Partículas de fundo ────────────────────────────────────────────────────────
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({length:50}, () => ({
      x: Math.random()*c.width, y: Math.random()*c.height,
      r: Math.random()*1.4+0.3, dx: (Math.random()-.5)*.25,
      dy: -Math.random()*.4-.1, a: Math.random()*.5+.1,
      h: Math.floor(Math.random()*60)+300,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.h},90%,75%,${p.a})`; ctx.fill();
        p.x+=p.dx; p.y+=p.dy;
        if(p.y<-5){p.y=c.height+5;p.x=Math.random()*c.width;}
        if(p.x<0)p.x=c.width; if(p.x>c.width)p.x=0;
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:.55}} />;
}

// ── Componentes de UI ──────────────────────────────────────────────────────────
function StatCard({icon, label, value, sub, color="#ff6b9d", pulse}) {
  return (
    <div className="sc">
      <div className="si" style={{color}}>{icon}</div>
      <div>
        <div className="sv" style={pulse?{animation:"numPop .4s ease"}:{}}>{value ?? "—"}</div>
        <div className="sl">{label}</div>
        {sub && <div className="ssub">{sub}</div>}
      </div>
    </div>
  );
}

function Badge({children, color="#ff6b9d"}) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 8px", borderRadius:4,
      background:`${color}22`, color, border:`1px solid ${color}44`,
      fontFamily:"var(--mono)", fontSize:10, fontWeight:600, whiteSpace:"nowrap",
    }}>{children}</span>
  );
}

function ProgressBar({value, max, color="#ff6b9d"}) {
  const pct = clamp(value||0, max||1);
  return (
    <div style={{height:4,background:"rgba(255,255,255,.07)",borderRadius:4,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,height:"100%",borderRadius:4,
        background:`linear-gradient(90deg,${color}88,${color})`,transition:"width .6s ease"}} />
    </div>
  );
}

function Loader() {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,color:"var(--muted)",fontFamily:"var(--mono)",fontSize:13,gap:10}}>
      <span style={{fontSize:22,animation:"spin 1s linear infinite"}}>🌸</span> Carregando dados reais...
    </div>
  );
}

function ErrorBox({msg}) {
  return (
    <div style={{background:"rgba(248,113,113,.08)",border:"1px solid rgba(248,113,113,.3)",borderRadius:12,padding:16,color:"#f87171",fontFamily:"var(--mono)",fontSize:12}}>
      ❌ {msg}
    </div>
  );
}

function GuildCard({g}) {
  return (
    <div className="guild-card">
      {g.icon
        ? <img src={g.icon} alt={g.name} className="guild-icon-img" />
        : <div className="guild-icon-placeholder">{g.name[0]}</div>
      }
      <div className="guild-name" title={g.name}>{g.name}</div>
      <div className="guild-meta">{fmtNum(g.memberCount)} membros</div>
      {g.onlineCount && <div className="guild-meta" style={{color:"#4ade80"}}>● {fmtNum(g.onlineCount)} online</div>}
      <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center"}}>
        {g.boostLevel>0 && <Badge color="#9d4edd">Boost {BOOST_LABEL[g.boostLevel]}</Badge>}
        {g.features.includes("VERIFIED") && <Badge color="#38bdf8">Verificado</Badge>}
        {g.features.includes("PARTNERED") && <Badge color="#facc15">Parceiro</Badge>}
        {g.features.includes("COMMUNITY") && <Badge color="#4ade80">Community</Badge>}
      </div>
      <div className="guild-meta" style={{marginTop:4}}>Criado em {fmtDate(g.createdAt)}</div>
    </div>
  );
}

// ── Navegação ──────────────────────────────────────────────────────────────────
const NAV = [
  {id:"overview", icon:"◈", label:"Visão Geral"},
  {id:"guilds",   icon:"⬡", label:"Servidores"},
  {id:"lookup",   icon:"🔍", label:"Buscar User/Guild"},
  {id:"gateway",  icon:"⚡", label:"Gateway & Shards"},
];

// ── Dashboard principal ────────────────────────────────────────────────────────
export default function Dashboard() {
  const [active, setActive] = useState("overview");

  // Dados reais — recarrega a cada 30s
  const bot    = useApi("/api/bot",    30_000);
  const guilds = useApi("/api/guilds", 60_000);

  // Lookup manual
  const [lookupId,   setLookupId]   = useState("");
  const [lookupType, setLookupType] = useState("user"); // "user" | "guild"
  const [lookupData, setLookupData] = useState(null);
  const [lookupErr,  setLookupErr]  = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleLookup = async () => {
    if (!lookupId.trim()) return;
    setLookupLoading(true); setLookupData(null); setLookupErr(null);
    try {
      const url = lookupType === "user" ? `/api/user/${lookupId}` : `/api/guild/${lookupId}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro desconhecido");
      setLookupData(json);
    } catch(e) {
      setLookupErr(e.message);
    } finally {
      setLookupLoading(false);
    }
  };

  // Uptime local (incrementado a cada segundo)
  const [localUptime, setLocalUptime] = useState(0);
  const [uptimeBase]  = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setLocalUptime(Math.floor((Date.now()-uptimeBase)/1000)), 1000);
    return () => clearInterval(t);
  }, [uptimeBase]);
  const fmtUptime = (s) => {
    const d=Math.floor(s/86400), h=Math.floor((s%86400)/3600), m=Math.floor((s%3600)/60), sec=s%60;
    return d>0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${sec}s`;
  };

  const b = bot.data;
  const gList = guilds.data?.guilds || [];

  return (
    <>
      <Head>
        <title>Flora 🌸 Dashboard</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;700;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      </Head>
      <Particles />

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#06060f;--bg2:#0d0d1a;--bg3:#131325;
          --glass:rgba(255,107,157,.05);--border:rgba(255,107,157,.13);
          --accent:#ff6b9d;--accent2:#c084fc;--accent3:#38bdf8;
          --gold:#ffd700;--text:#f0e6f6;--muted:#8b80a0;
          --font:'Zen Kaku Gothic New',sans-serif;--mono:'JetBrains Mono',monospace;
        }
        html,body{background:var(--bg);color:var(--text);font-family:var(--font);min-height:100vh}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg2)}::-webkit-scrollbar-thumb{background:var(--accent);border-radius:4px}

        .layout{display:flex;min-height:100vh;position:relative;z-index:1}

        /* Sidebar */
        .sidebar{
          width:210px;min-height:100vh;background:linear-gradient(180deg,#0d0d1a 0%,#080814 100%);
          border-right:1px solid var(--border);display:flex;flex-direction:column;
          flex-shrink:0;position:sticky;top:0;height:100vh;overflow-y:auto
        }
        .logo{padding:22px 18px 16px;border-bottom:1px solid var(--border)}
        .logo-name{
          font-size:20px;font-weight:900;letter-spacing:1px;
          background:linear-gradient(135deg,#ff6b9d,#c084fc);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent
        }
        .logo-sub{font-size:10px;color:var(--muted);margin-top:3px;font-family:var(--mono);letter-spacing:2px}
        .ldot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 7px #4ade80;margin-right:5px;animation:blink 1.5s infinite}
        @keyframes blink{0%,100%{opacity:1;box-shadow:0 0 7px #4ade80}50%{opacity:.4;box-shadow:0 0 14px #4ade80}}
        nav{padding:14px 10px;flex:1}
        .ni{
          display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:9px;cursor:pointer;
          font-size:13px;font-weight:700;color:var(--muted);transition:all .15s;margin-bottom:4px;
          border:1px solid transparent;letter-spacing:.4px
        }
        .ni:hover{background:var(--glass);color:var(--text);border-color:var(--border)}
        .ni.active{background:linear-gradient(135deg,rgba(255,107,157,.15),rgba(192,132,252,.07));color:var(--accent);border-color:rgba(255,107,157,.25)}
        .ni-icon{font-size:14px;width:18px;text-align:center}
        .sidebar-bot{padding:14px;border-top:1px solid var(--border)}
        .bot-card{display:flex;align-items:center;gap:9px;background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:9px 10px}
        .bot-avatar{width:34px;height:34px;border-radius:50%;object-fit:cover}
        .bot-avatar-ph{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff}
        .bot-name{font-size:12px;font-weight:700}
        .bot-tag{font-size:9px;color:var(--accent);font-family:var(--mono)}
        .fetched{font-size:9px;color:var(--muted);font-family:var(--mono);margin-top:2px}

        /* Main */
        .main{flex:1;min-width:0;padding:28px 32px;overflow-x:hidden}
        .ph{margin-bottom:22px}
        .pt{font-size:26px;font-weight:900;letter-spacing:-.5px}
        .pt span{background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .ps{color:var(--muted);font-size:11px;margin-top:3px;font-family:var(--mono)}

        /* Stat cards */
        .stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:12px;margin-bottom:20px}
        .sc{
          background:linear-gradient(135deg,var(--bg2),var(--bg3));border:1px solid var(--border);
          border-radius:13px;padding:14px 16px;display:flex;align-items:center;gap:12px;
          transition:transform .2s,border-color .2s
        }
        .sc:hover{transform:translateY(-2px);border-color:var(--accent)}
        .si{font-size:26px;flex-shrink:0}
        .sv{font-size:20px;font-weight:900;font-family:var(--mono);line-height:1}
        .sl{font-size:9px;color:var(--muted);margin-top:2px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
        .ssub{font-size:9px;color:var(--muted);margin-top:1px;font-family:var(--mono)}

        /* Card */
        .card{
          background:linear-gradient(135deg,var(--bg2),var(--bg3));border:1px solid var(--border);
          border-radius:14px;padding:18px;margin-bottom:16px
        }
        .card-title{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:2px;margin-bottom:14px}

        /* Grid */
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        @media(max-width:900px){.g2{grid-template-columns:1fr}}

        /* Guilds grid */
        .guild-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
        .guild-card{
          background:var(--bg3);border:1px solid var(--border);border-radius:12px;
          padding:14px;text-align:center;transition:all .2s
        }
        .guild-card:hover{transform:translateY(-2px);border-color:rgba(255,107,157,.3)}
        .guild-icon-img{width:52px;height:52px;border-radius:14px;object-fit:cover;margin:0 auto 8px;display:block}
        .guild-icon-placeholder{
          width:52px;height:52px;border-radius:14px;
          background:linear-gradient(135deg,var(--accent),var(--accent2));
          display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff;
          margin:0 auto 8px
        }
        .guild-name{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px}
        .guild-meta{font-size:10px;color:var(--muted);font-family:var(--mono)}

        /* Lookup */
        .lookup-row{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}
        .lookup-input{
          flex:1;padding:10px 14px;border-radius:9px;border:1px solid var(--border);
          background:var(--bg3);color:var(--text);font-size:13px;font-family:var(--mono);outline:none;
          min-width:200px
        }
        .lookup-input:focus{border-color:var(--accent)}
        .type-btn{
          padding:10px 16px;border-radius:9px;border:1px solid var(--border);background:var(--bg3);
          color:var(--muted);font-size:12px;cursor:pointer;font-family:var(--mono);font-weight:600;transition:all .15s
        }
        .type-btn.active{background:rgba(255,107,157,.12);color:var(--accent);border-color:rgba(255,107,157,.3)}
        .search-btn{
          padding:10px 20px;border-radius:9px;background:linear-gradient(135deg,var(--accent),var(--accent2));
          color:#fff;font-size:12px;cursor:pointer;border:none;font-family:var(--font);font-weight:700;
          transition:opacity .15s
        }
        .search-btn:hover{opacity:.85}

        /* Lookup result cards */
        .result-card{background:var(--bg3);border:1px solid var(--border);border-radius:12px;overflow:hidden}
        .result-banner{width:100%;height:80px;object-fit:cover}
        .result-body{padding:14px;position:relative}
        .result-avatar{width:56px;height:56px;border-radius:50%;object-fit:cover;border:3px solid var(--bg3)}
        .result-name{font-size:16px;font-weight:900;margin:6px 0 2px}
        .result-sub{font-size:11px;color:var(--muted);font-family:var(--mono)}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
        .info-item{background:rgba(255,255,255,.03);border-radius:8px;padding:8px 10px}
        .info-label{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-family:var(--mono);margin-bottom:2px}
        .info-value{font-size:12px;font-weight:700;font-family:var(--mono)}
        .badge-row{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}

        /* Gateway */
        .shard-dot{width:12px;height:12px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80;display:inline-block;margin-right:6px}

        /* Row */
        .row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)}
        .row:last-child{border-bottom:none}

        /* Animations */
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes numPop{0%{transform:scale(.95);opacity:.6}100%{transform:scale(1);opacity:1}}

        /* Live indicator */
        .live{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-family:var(--mono);font-weight:700;color:#4ade80}
        .live::before{content:'';width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block;box-shadow:0 0 7px #4ade80;animation:blink 1.5s infinite}

        /* Feature chips */
        .feat-chip{
          display:inline-block;padding:3px 8px;border-radius:4px;font-size:9px;font-family:var(--mono);font-weight:600;
          background:rgba(56,189,248,.1);color:#38bdf8;border:1px solid rgba(56,189,248,.25);margin:2px
        }

        @media(max-width:700px){.layout{flex-direction:column}.sidebar{width:100%;height:auto;position:relative}.main{padding:16px}}
      `}</style>

      <div className="layout">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-name">🌸 Flora</div>
            <div className="logo-sub">
              <span className="ldot" />
              {b ? "ONLINE" : "Conectando…"}
            </div>
          </div>

          <nav>
            {NAV.map(n => (
              <div key={n.id} className={`ni${active===n.id?" active":""}`} onClick={() => setActive(n.id)}>
                <span className="ni-icon">{n.icon}</span>{n.label}
              </div>
            ))}
          </nav>

          <div className="sidebar-bot">
            <div className="bot-card">
              {b?.avatar
                ? <img src={b.avatar} alt="bot" className="bot-avatar" />
                : <div className="bot-avatar-ph">F</div>}
              <div>
                <div className="bot-name">{b?.globalName || b?.username || "Flora"}</div>
                <div className="bot-tag">#{b?.discriminator || "0000"}</div>
                {b && <div className="fetched">✓ {fmtTime(b.fetchedAt)}</div>}
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main">

          {/* ══ OVERVIEW ══ */}
          {active === "overview" && (
            <>
              <div className="ph">
                <div className="pt">Visão <span>Geral</span></div>
                <div className="ps">
                  Dados reais via Discord REST API · Atualiza a cada 30s
                  {b && <> · Obtido em {fmtTime(b.fetchedAt)}</>}
                </div>
              </div>

              {bot.error && <ErrorBox msg={bot.error} />}
              {bot.loading && <Loader />}

              {b && (
                <>
                  <div className="stat-grid">
                    <StatCard icon="⬡" label="Servidores"  value={fmtNum(b.guildCount)}          color="#ff6b9d" />
                    <StatCard icon="👤" label="Membros (aprox)" value={fmtNum(b.totalMembers)}    color="#a78bfa" />
                    <StatCard icon="🟢" label="Online agora"   value={fmtNum(b.totalOnline)}      color="#4ade80" />
                    <StatCard icon="⚡" label="Shards"      value={fmtNum(b.shards)}              color="#38bdf8" />
                    <StatCard icon="⏱" label="Uptime (dashboard)" value={fmtUptime(localUptime)} color="#ffd700" />
                    <StatCard icon="🤖" label="Bot ID"      value={b.id}                          color="#c084fc" sub="Snowflake" />
                    <StatCard icon="✅" label="Verificado"  value={b.verified ? "Sim" : "Não"}    color={b.verified?"#4ade80":"#f87171"} />
                    <StatCard icon="🌐" label="Guilds (app)"value={fmtNum(b.approximateGuildCount)} color="#fb923c" sub="approximate" />
                  </div>

                  {/* Bot profile */}
                  <div className="g2">
                    <div className="card">
                      <div className="card-title">Perfil do Bot</div>
                      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                        {b.avatar
                          ? <img src={b.avatar} alt="avatar" style={{width:60,height:60,borderRadius:"50%",objectFit:"cover"}} />
                          : <div style={{width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,var(--accent),var(--accent2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,color:"#fff"}}>F</div>
                        }
                        <div>
                          <div style={{fontSize:18,fontWeight:900}}>{b.globalName || b.username}</div>
                          <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)"}}>@{b.username}#{b.discriminator}</div>
                          <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--accent)",marginTop:2}}>ID: {b.id}</div>
                        </div>
                      </div>
                      {b.appDescription && (
                        <div style={{fontSize:12,color:"var(--muted)",marginBottom:10,lineHeight:1.5}}>
                          {b.appDescription}
                        </div>
                      )}
                      <div className="info-grid">
                        <div className="info-item"><div className="info-label">App Name</div><div className="info-value">{b.appName || "—"}</div></div>
                        <div className="info-item"><div className="info-label">Shards</div><div className="info-value">{b.shards}</div></div>
                        <div className="info-item"><div className="info-label">Verificado</div><div className="info-value">{b.verified?"✅ Sim":"❌ Não"}</div></div>
                        <div className="info-item"><div className="info-label">Tipo</div><div className="info-value">Bot</div></div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-title">Session Start Limit</div>
                      {b.sessionStartLimit ? (
                        <>
                          <div className="info-grid">
                            <div className="info-item">
                              <div className="info-label">Total</div>
                              <div className="info-value" style={{color:"var(--accent)"}}>{fmtNum(b.sessionStartLimit.total)}</div>
                            </div>
                            <div className="info-item">
                              <div className="info-label">Remaining</div>
                              <div className="info-value" style={{color:"#4ade80"}}>{fmtNum(b.sessionStartLimit.remaining)}</div>
                            </div>
                            <div className="info-item">
                              <div className="info-label">Reset After</div>
                              <div className="info-value">{b.sessionStartLimit.reset_after ? `${Math.round(b.sessionStartLimit.reset_after/60000)}min` : "—"}</div>
                            </div>
                            <div className="info-item">
                              <div className="info-label">Max Concurrency</div>
                              <div className="info-value">{b.sessionStartLimit.max_concurrency}</div>
                            </div>
                          </div>
                          <div style={{marginTop:14}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:10,color:"var(--muted)",fontFamily:"var(--mono)"}}>
                              <span>Sessões usadas</span>
                              <span>{clamp((b.sessionStartLimit.total - b.sessionStartLimit.remaining), b.sessionStartLimit.total)}%</span>
                            </div>
                            <ProgressBar
                              value={b.sessionStartLimit.total - b.sessionStartLimit.remaining}
                              max={b.sessionStartLimit.total}
                              color="#38bdf8"
                            />
                          </div>
                        </>
                      ) : (
                        <div style={{color:"var(--muted)",fontFamily:"var(--mono)",fontSize:12}}>Dados não disponíveis</div>
                      )}

                      <div className="card-title" style={{marginTop:18}}>Features dos Servidores</div>
                      <div>
                        {Object.entries(b.featureCounts || {}).slice(0,8).map(([feat,cnt]) => (
                          <div className="row" key={feat}>
                            <span className="feat-chip">{feat}</span>
                            <div style={{flex:1,paddingLeft:8}}><ProgressBar value={cnt} max={b.guildCount} color="#38bdf8" /></div>
                            <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",minWidth:28,textAlign:"right"}}>{cnt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ══ GUILDS ══ */}
          {active === "guilds" && (
            <>
              <div className="ph">
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div className="pt"><span>Servidores</span></div>
                  {!guilds.loading && <span className="live">DADOS REAIS</span>}
                </div>
                <div className="ps">
                  {guilds.data ? `${guilds.data.total} guilds encontradas · ` : ""}
                  Ordenadas por nº de membros
                </div>
              </div>

              {guilds.error  && <ErrorBox msg={guilds.error} />}
              {guilds.loading && <Loader />}

              {gList.length > 0 && (
                <>
                  {/* Top 3 */}
                  <div className="g2" style={{marginBottom:16}}>
                    {gList.slice(0,2).map(g => (
                      <div className="card" key={g.id} style={{display:"flex",alignItems:"center",gap:14}}>
                        {g.icon
                          ? <img src={g.icon} alt={g.name} style={{width:52,height:52,borderRadius:12,objectFit:"cover"}} />
                          : <div style={{width:52,height:52,borderRadius:12,background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:"#fff"}}>{g.name[0]}</div>
                        }
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:900,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.name}</div>
                          <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:2}}>ID: {g.id}</div>
                          <div style={{marginTop:6,display:"flex",gap:8}}>
                            <span style={{fontFamily:"var(--mono)",fontSize:11,color:"#a78bfa"}}>👤 {fmtNum(g.memberCount)}</span>
                            {g.onlineCount && <span style={{fontFamily:"var(--mono)",fontSize:11,color:"#4ade80"}}>🟢 {fmtNum(g.onlineCount)}</span>}
                          </div>
                          {g.boostLevel > 0 && (
                            <div style={{marginTop:5}}>
                              <Badge color="#9d4edd">{BOOST_LABEL[g.boostLevel]} · {g.boostCount} boosts</Badge>
                            </div>
                          )}
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:10,color:"var(--muted)",fontFamily:"var(--mono)"}}>Criado</div>
                          <div style={{fontSize:11,fontFamily:"var(--mono)"}}>{fmtDate(g.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Grid */}
                  <div className="guild-grid">
                    {gList.slice(2).map(g => <GuildCard key={g.id} g={g} />)}
                  </div>
                </>
              )}
            </>
          )}

          {/* ══ LOOKUP ══ */}
          {active === "lookup" && (
            <>
              <div className="ph">
                <div className="pt">Buscar <span>User / Guild</span></div>
                <div className="ps">Consulta em tempo real via Discord REST API</div>
              </div>

              <div className="lookup-row">
                <button className={`type-btn${lookupType==="user"?" active":""}`} onClick={() => setLookupType("user")}>👤 Usuário</button>
                <button className={`type-btn${lookupType==="guild"?" active":""}`} onClick={() => setLookupType("guild")}>⬡ Servidor</button>
                <input
                  className="lookup-input"
                  placeholder={lookupType==="user" ? "ID do usuário Discord (ex: 612490785937424424)" : "ID do servidor Discord"}
                  value={lookupId}
                  onChange={e => setLookupId(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && handleLookup()}
                />
                <button className="search-btn" onClick={handleLookup} disabled={lookupLoading}>
                  {lookupLoading ? "Buscando…" : "Buscar"}
                </button>
              </div>

              {lookupErr && <ErrorBox msg={lookupErr} />}
              {lookupLoading && <Loader />}

              {lookupData && lookupType === "user" && (
                <div className="result-card">
                  {lookupData.banner && <img src={lookupData.banner} alt="banner" className="result-banner" />}
                  <div className="result-body">
                    <img src={lookupData.avatar} alt="avatar" className="result-avatar" />
                    <div className="result-name">{lookupData.globalName || lookupData.username}</div>
                    <div className="result-sub">@{lookupData.username}#{lookupData.discriminator}</div>
                    {lookupData.badges?.length > 0 && (
                      <div className="badge-row">
                        {lookupData.badges.map(b => <Badge key={b} color="#ffd700">{b}</Badge>)}
                      </div>
                    )}
                    <div className="info-grid" style={{marginTop:12}}>
                      <div className="info-item"><div className="info-label">User ID</div><div className="info-value">{lookupData.id}</div></div>
                      <div className="info-item"><div className="info-label">Criado em</div><div className="info-value">{fmtDate(lookupData.createdAt)}</div></div>
                      <div className="info-item"><div className="info-label">Bot</div><div className="info-value">{lookupData.bot?"✅ Sim":"❌ Não"}</div></div>
                      <div className="info-item"><div className="info-label">Accent Color</div><div className="info-value" style={{color:lookupData.accentColor||"var(--muted)"}}>{lookupData.accentColor||"—"}</div></div>
                      <div className="info-item"><div className="info-label">Public Flags</div><div className="info-value">{lookupData.publicFlags}</div></div>
                      <div className="info-item"><div className="info-label">System</div><div className="info-value">{lookupData.system?"✅ Sim":"❌ Não"}</div></div>
                    </div>
                  </div>
                </div>
              )}

              {lookupData && lookupType === "guild" && (
                <div className="result-card">
                  {lookupData.banner && <img src={lookupData.banner} alt="banner" className="result-banner" />}
                  <div className="result-body">
                    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                      {lookupData.icon
                        ? <img src={lookupData.icon} alt="icon" style={{width:56,height:56,borderRadius:14,objectFit:"cover"}} />
                        : <div style={{width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,color:"#fff"}}>{lookupData.name?.[0]}</div>
                      }
                      <div>
                        <div className="result-name" style={{marginTop:0}}>{lookupData.name}</div>
                        <div className="result-sub">ID: {lookupData.id}</div>
                        {lookupData.description && <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>{lookupData.description}</div>}
                      </div>
                    </div>

                    <div className="info-grid">
                      <div className="info-item"><div className="info-label">Membros</div><div className="info-value" style={{color:"var(--accent)"}}>{fmtNum(lookupData.memberCount)}</div></div>
                      <div className="info-item"><div className="info-label">Online</div><div className="info-value" style={{color:"#4ade80"}}>{fmtNum(lookupData.onlineCount)}</div></div>
                      <div className="info-item"><div className="info-label">Canais</div><div className="info-value">{fmtNum(lookupData.totalChannels)}</div></div>
                      <div className="info-item"><div className="info-label">Cargos</div><div className="info-value">{fmtNum(lookupData.roleCount)}</div></div>
                      <div className="info-item"><div className="info-label">Banimentos</div><div className="info-value" style={{color:"#f87171"}}>{fmtNum(lookupData.banCount)}</div></div>
                      <div className="info-item"><div className="info-label">Invites</div><div className="info-value">{fmtNum(lookupData.inviteCount)}</div></div>
                      <div className="info-item"><div className="info-label">Boost</div><div className="info-value" style={{color:"#9d4edd"}}>{BOOST_LABEL[lookupData.boostLevel||0]} ({lookupData.boostCount||0})</div></div>
                      <div className="info-item"><div className="info-label">Verificação</div><div className="info-value">{VERIFY[lookupData.verifyLevel||0]}</div></div>
                      <div className="info-item"><div className="info-label">Emojis</div><div className="info-value">{fmtNum(lookupData.emojiCount)}</div></div>
                      <div className="info-item"><div className="info-label">Stickers</div><div className="info-value">{fmtNum(lookupData.stickerCount)}</div></div>
                      <div className="info-item"><div className="info-label">Criado em</div><div className="info-value">{fmtDate(lookupData.createdAt)}</div></div>
                      <div className="info-item"><div className="info-label">Locale</div><div className="info-value">{lookupData.locale||"—"}</div></div>
                    </div>

                    {/* Canais por tipo */}
                    {lookupData.channelTypes && (
                      <div style={{marginTop:14}}>
                        <div className="card-title">Tipos de Canais</div>
                        {Object.entries(lookupData.channelTypes).map(([type, cnt]) => cnt > 0 && (
                          <div className="row" key={type}>
                            <span style={{fontFamily:"var(--mono)",fontSize:11,minWidth:70,color:"var(--muted)"}}>{type}</span>
                            <div style={{flex:1}}><ProgressBar value={cnt} max={lookupData.totalChannels} color="#38bdf8" /></div>
                            <span style={{fontFamily:"var(--mono)",fontSize:11,minWidth:24,textAlign:"right"}}>{cnt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Top roles */}
                    {lookupData.topRoles?.length > 0 && (
                      <div style={{marginTop:14}}>
                        <div className="card-title">Top Cargos</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                          {lookupData.topRoles.map(r => (
                            <Badge key={r.id} color={r.color||"#8b80a0"}>{r.name}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    {lookupData.features?.length > 0 && (
                      <div style={{marginTop:14}}>
                        <div className="card-title">Features</div>
                        <div>{lookupData.features.map(f => <span key={f} className="feat-chip">{f}</span>)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══ GATEWAY ══ */}
          {active === "gateway" && (
            <>
              <div className="ph">
                <div className="pt">Gateway & <span>Shards</span></div>
                <div className="ps">Informações do WebSocket Gateway — Discord API v10</div>
              </div>

              {bot.loading && <Loader />}
              {bot.error   && <ErrorBox msg={bot.error} />}

              {b && (
                <>
                  <div className="stat-grid">
                    <StatCard icon="🔌" label="Shards ativos"  value={b.shards}                                            color="#38bdf8" />
                    <StatCard icon="🔑" label="Sessions total" value={fmtNum(b.sessionStartLimit?.total)}                 color="#a78bfa" />
                    <StatCard icon="✅" label="Sessions restantes" value={fmtNum(b.sessionStartLimit?.remaining)}         color="#4ade80" />
                    <StatCard icon="⚡" label="Max concurrency" value={b.sessionStartLimit?.max_concurrency ?? "—"}      color="#ffd700" />
                    <StatCard icon="⏱" label="Reset em"  value={b.sessionStartLimit?.reset_after ? `${Math.round(b.sessionStartLimit.reset_after/60000)}min` : "—"} color="#fb923c" />
                    <StatCard icon="⬡" label="Guilds / Shard" value={b.shards ? Math.ceil(b.guildCount/b.shards) : "—"} color="#f472b6" sub="média" />
                  </div>

                  <div className="card">
                    <div className="card-title">Distribuição de Shards (simulada)</div>
                    {Array.from({length: b.shards || 1}, (_, i) => {
                      const guildsPerShard = Math.ceil(b.guildCount / (b.shards||1));
                      const thisGuilds = i === (b.shards||1)-1
                        ? b.guildCount - guildsPerShard*(b.shards-1||0)
                        : guildsPerShard;
                      return (
                        <div className="row" key={i}>
                          <span className="shard-dot" />
                          <span style={{fontFamily:"var(--mono)",fontSize:12,minWidth:80}}>Shard {i}</span>
                          <div style={{flex:1}}><ProgressBar value={thisGuilds} max={guildsPerShard} color="#38bdf8" /></div>
                          <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",minWidth:80,textAlign:"right"}}>{fmtNum(thisGuilds)} guilds</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="card">
                    <div className="card-title">Endpoints utilizados</div>
                    {[
                      {method:"GET", path:"/users/@me",       desc:"Info do bot"},
                      {method:"GET", path:"/applications/@me",desc:"Info da aplicação + guild count"},
                      {method:"GET", path:"/gateway/bot",     desc:"Gateway URL + shards + session limits"},
                      {method:"GET", path:"/users/@me/guilds?with_counts=true", desc:"Lista de guilds com contagens"},
                      {method:"GET", path:"/guilds/{id}?with_counts=true",      desc:"Detalhes de uma guild"},
                      {method:"GET", path:"/guilds/{id}/channels",              desc:"Canais de uma guild"},
                      {method:"GET", path:"/guilds/{id}/roles",                 desc:"Cargos de uma guild"},
                      {method:"GET", path:"/guilds/{id}/bans",                  desc:"Banimentos"},
                      {method:"GET", path:"/guilds/{id}/invites",               desc:"Convites ativos"},
                      {method:"GET", path:"/users/{id}",                        desc:"Perfil público de usuário"},
                    ].map(e => (
                      <div className="row" key={e.path}>
                        <Badge color="#4ade80">{e.method}</Badge>
                        <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--accent2)",flex:1}}>{e.path}</span>
                        <span style={{fontSize:11,color:"var(--muted)"}}>{e.desc}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

        </main>
      </div>
    </>
  );
}