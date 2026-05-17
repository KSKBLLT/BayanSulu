import React, { useState, useCallback, useEffect, useRef } from 'react';
import { fetchAllSessions, fetchAllEvents } from '../utils/db';

const OPENAI_KEY = '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';
const DEV_PASSWORD = 'devmode';

const C = {
  bg: '#090f1e', surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(90,170,255,0.13)', accent: '#5ab4ff',
  green: '#34d399', orange: '#fbbf24', red: '#f87171', purple: '#a78bfa',
  text: '#ddeeff', muted: '#4a6e9e',
};

const css = {
  shell: { position:'fixed', inset:0, background:C.bg, color:C.text, fontFamily:'"JetBrains Mono","Fira Code",monospace', display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar: { flexShrink:0, display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1rem', background:'rgba(0,0,0,0.45)', borderBottom:`1px solid ${C.border}` },
  tabBar: { flexShrink:0, display:'flex', gap:'0.2rem', padding:'0.4rem 0.75rem', background:'rgba(0,0,0,0.25)', borderBottom:`1px solid ${C.border}`, overflowX:'auto' },
  body: { flex:1, overflowY:'auto', padding:'0.85rem', display:'flex', flexDirection:'column', gap:'0.7rem' },
  card: { background:C.surface, border:`1px solid ${C.border}`, borderRadius:'10px', padding:'0.85rem' },
  cardTitle: { fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.14em', color:C.accent, textTransform:'uppercase', marginBottom:'0.6rem' },
  pre: { background:'rgba(0,0,0,0.45)', border:`1px solid ${C.border}`, borderRadius:'7px', padding:'0.65rem', fontSize:'0.67rem', lineHeight:1.6, color:'#7ab8ff', overflowX:'auto', overflowY:'auto', maxHeight:'240px', whiteSpace:'pre-wrap', wordBreak:'break-all', margin:0 },
  badge: { fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.12em', background:'rgba(90,180,255,0.15)', color:C.accent, border:`1px solid rgba(90,180,255,0.3)`, borderRadius:'4px', padding:'0.1rem 0.35rem' },
  stat: { background:'rgba(0,0,0,0.3)', borderRadius:'8px', padding:'0.5rem 0.35rem', textAlign:'center' },
  statVal: { fontSize:'1.2rem', fontWeight:700, color:'#fff', display:'block' },
  statLbl: { fontSize:'0.56rem', color:C.muted, letterSpacing:'0.05em' },
  insight: { background:'rgba(0,0,0,0.3)', borderRadius:'8px', padding:'0.8rem', fontSize:'0.77rem', lineHeight:1.75, color:'#c8deff', whiteSpace:'pre-wrap', borderLeft:`3px solid ${C.accent}` },
  row: { display:'flex', gap:'0.4rem', flexWrap:'wrap' },
};

const btn = (bg, color, border) => ({
  display:'inline-flex', alignItems:'center', gap:'0.35rem',
  padding:'0.4rem 0.8rem', borderRadius:'7px', border: border||'none',
  cursor:'pointer', fontSize:'0.72rem', fontFamily:'inherit', fontWeight:600,
  background:bg, color, transition:'opacity 0.15s', whiteSpace:'nowrap',
});

const Spin = () => <span style={{ display:'inline-block', width:'11px', height:'11px', border:`2px solid rgba(90,180,255,0.2)`, borderTopColor:C.accent, borderRadius:'50%', animation:'_spin 0.7s linear infinite' }}/>;

async function callOpenAI(messages, maxTokens = 900) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model:'gpt-4o-mini', messages, max_tokens:maxTokens, temperature:0.72 }),
  });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message||`HTTP ${res.status}`); }
  return (await res.json()).choices?.[0]?.message?.content || '';
}

/* ── aggregation helpers ── */
function aggregate(sessions, events) {
  const total = sessions.length;
  if (!total) return null;
  const withName = sessions.filter(s=>s.user_name).length;
  const ages = sessions.map(s=>parseInt(s.user_age)).filter(n=>!isNaN(n));
  const avgAge = ages.length ? (ages.reduce((a,b)=>a+b,0)/ages.length).toFixed(1) : '?';
  const langKz = sessions.filter(s=>s.lang==='kz').length;
  const c0 = sessions.filter(s=>!(s.completed_games||[]).length).length;
  const c1 = sessions.filter(s=>(s.completed_games||[]).length===1).length;
  const c2 = sessions.filter(s=>(s.completed_games||[]).length===2).length;
  const c3 = sessions.filter(s=>(s.completed_games||[]).length===3).length;
  const mathDone   = sessions.filter(s=>(s.completed_games||[]).includes('math')).length;
  const memDone    = sessions.filter(s=>(s.completed_games||[]).includes('memory')).length;
  const wordsDone  = sessions.filter(s=>(s.completed_games||[]).includes('words')).length;
  const avgCoins   = Math.round(sessions.reduce((a,s)=>a+(s.coins||0),0)/total);
  const qrUsers    = sessions.filter(s=>(s.unlocked_locations||[]).length>0).length;
  const bonusUsers = sessions.filter(s=>(s.reward_requests_count||0)>0).length;
  const last7      = new Date(Date.now()-7*864e5).toISOString();
  const active7d   = sessions.filter(s=>s.updated_at>last7).length;
  const evtCounts  = {};
  events.forEach(e=>{ evtCounts[e.event_type]=(evtCounts[e.event_type]||0)+1; });
  return { total, withName, avgAge, langKz, c0, c1, c2, c3, mathDone, memDone, wordsDone, avgCoins, qrUsers, bonusUsers, active7d, evtCounts };
}

function buildProductPrompt(agg, sessions, events) {
  if (!agg) return null;
  const { total,withName,avgAge,langKz,c0,c1,c2,c3,mathDone,memDone,wordsDone,avgCoins,qrUsers,bonusUsers,active7d,evtCounts } = agg;
  return `РЕАЛЬНЫЕ ДАННЫЕ «БАЯН СУЛУ» на ${new Date().toLocaleDateString('ru-RU')}:

АУДИТОРИЯ (${total} устройств):
• Заполнили профиль: ${withName}/${total} (${Math.round(withName/total*100)}%)
• Средний возраст: ${avgAge} лет | На казахском: ${langKz}/${total}
• Активны за 7 дней: ${active7d}/${total} (${Math.round(active7d/total*100)}%)

ВОРОНКА ИГР:
• 0 игр: ${c0} (${Math.round(c0/total*100)}%) | 1 игра: ${c1} (${Math.round(c1/total*100)}%)
• 2 игры: ${c2} (${Math.round(c2/total*100)}%) | Все 3: ${c3} (${Math.round(c3/total*100)}%)
• Математика: ${mathDone}/${total} | Память: ${memDone}/${total} | Слова: ${wordsDone}/${total}

МОНЕТИЗАЦИЯ:
• Средний баланс: ${avgCoins} монет | QR разблокировали: ${qrUsers}/${total}
• Запрашивали бонус: ${bonusUsers}/${total}

СОБЫТИЯ (${events.length} total): ${Object.entries(evtCounts).map(([k,v])=>`${k}:${v}`).join(', ')}

Дай 5 приоритизированных инсайтов. Используй КОНКРЕТНЫЕ цифры из данных выше.
Формат каждого (разделяй строкой ---):
[HIGH/MEDIUM/LOW] Эмодзи Заголовок
Что: ...
Почему важно: ...
Действие: ...`;
}

function buildChildPrompt(s) {
  return `Ребёнок: ${s.user_name||'?'}, ${s.user_age||'?'} лет, язык: ${s.lang}.
Игры: ${(s.completed_games||[]).join(', ')||'нет'} (${(s.completed_games||[]).length}/3).
Монет: ${s.coins||0} | QR: ${(s.unlocked_locations||[]).length} | Запросов бонусов: ${s.reward_requests_count||0}.
Экранное время: ${s.screen_time_minutes||0} мин.
Последняя активность: ${s.updated_at ? new Date(s.updated_at).toLocaleDateString('ru-RU') : '?'}.

Напиши педагогический отчёт (4 коротких абзаца): текущий уровень, что освоено хорошо, что нужно улучшить, конкретный совет родителю на эту неделю. Используй имя. По-русски.`;
}

/* ── MiniBar ── */
const MiniBar = ({v, max, color=C.accent}) => (
  <div style={{flex:1, height:'5px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden'}}>
    <div style={{height:'100%', width:`${Math.round(v/max*100)}%`, background:color, borderRadius:'3px'}}/>
  </div>
);

/* ── DataTable ── */
function DataTable({ sessions }) {
  if (!sessions.length) return <p style={{color:C.muted,fontSize:'0.72rem'}}>Нет данных</p>;
  const cols = ['user_name','user_age','lang','coins','completed_games','unlocked_locations','updated_at'];
  const labels = {'user_name':'Имя','user_age':'Возраст','lang':'Язык','coins':'Монеты','completed_games':'Игры','unlocked_locations':'QR','updated_at':'Активность'};
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{borderCollapse:'collapse',fontSize:'0.64rem',width:'100%',minWidth:'560px'}}>
        <thead>
          <tr>{cols.map(c=><th key={c} style={{padding:'0.35rem 0.55rem',textAlign:'left',color:C.accent,borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap',fontWeight:700}}>{labels[c]||c}</th>)}</tr>
        </thead>
        <tbody>
          {sessions.map((row,i)=>(
            <tr key={i} style={{background:i%2===0?'rgba(255,255,255,0.02)':'transparent'}}>
              {cols.map(c=>{
                let val=row[c];
                if (Array.isArray(val)) val=val.length?val.join(', '):'—';
                if (typeof val==='string' && val.includes('T') && val.includes('Z'))
                  val=new Date(val).toLocaleString('ru-RU',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
                return <td key={c} style={{padding:'0.3rem 0.55rem',borderBottom:`1px solid rgba(90,180,255,0.05)`,color:val==='—'?C.muted:C.text,whiteSpace:'nowrap',maxWidth:'140px',overflow:'hidden',textOverflow:'ellipsis'}}>{val??'—'}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── EventFeed ── */
function EventFeed({ events, limit=60 }) {
  const typeColor = {game_complete:C.green,qr_unlock:C.accent,onboarding_complete:C.purple,reward_request:C.orange};
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'0.25rem',maxHeight:'280px',overflowY:'auto'}}>
      {events.slice(0,limit).map((e,i)=>(
        <div key={i} style={{display:'flex',gap:'0.5rem',alignItems:'baseline',fontSize:'0.67rem'}}>
          <span style={{color:C.muted,flexShrink:0,fontSize:'0.58rem',minWidth:'38px'}}>
            {new Date(e.created_at).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}
          </span>
          <span style={{background:(typeColor[e.event_type]||'#888')+'20',color:typeColor[e.event_type]||'#888',border:`1px solid ${(typeColor[e.event_type]||'#888')}40`,borderRadius:'4px',padding:'0.03rem 0.35rem',fontSize:'0.6rem',flexShrink:0}}>
            {e.event_type}
          </span>
          {e.game_id && <span style={{color:C.muted}}>{e.game_id}</span>}
          {e.coins_earned>0 && <span style={{color:C.orange}}>+{e.coins_earned}🪙</span>}
        </div>
      ))}
      {!events.length && <p style={{color:C.muted,fontSize:'0.72rem',margin:0}}>Нет событий</p>}
    </div>
  );
}

/* ── AIBlock ── */
function AIBlock({ text }) {
  if (!text) return null;
  const blocks = text.split(/\n---\n|^---$/m).map(s=>s.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block,i)=>{
        const lines = block.split('\n').filter(Boolean);
        const hdr = lines[0]||'';
        const body = lines.slice(1).join('\n');
        const pri = hdr.match(/\[(HIGH|MEDIUM|LOW)\]/i)?.[1]?.toUpperCase();
        const pc = pri==='HIGH'?C.red:pri==='MEDIUM'?C.orange:C.green;
        return (
          <div key={i} style={{...css.card,borderLeft:`3px solid ${pc||C.accent}`,padding:'0.75rem'}}>
            {pri && <span style={{fontSize:'0.58rem',color:pc,fontWeight:700,letterSpacing:'0.08em'}}>{pri} </span>}
            <span style={{fontSize:'0.77rem',fontWeight:700,color:'#fff'}}>{hdr.replace(/\[.*?\]/g,'').trim()}</span>
            <div style={{fontSize:'0.73rem',lineHeight:1.72,color:'#b8d0f0',whiteSpace:'pre-line',marginTop:'0.4rem'}}>{body}</div>
          </div>
        );
      })}
    </>
  );
}

/* ═══════════════════════════════════════════════════════ MAIN ═══ */
function DevModePage({ appState, goToScreen, resetProfile }) {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [pinErr, setPinErr] = useState('');
  const [tab, setTab] = useState('business');

  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbErr, setDbErr] = useState('');
  const [lastSync, setLastSync] = useState(null);

  const [productAI, setProductAI] = useState('');
  const [childAI, setChildAI] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChildLoading, setAiChildLoading] = useState(false);
  const [aiChildTarget, setAiChildTarget] = useState(null);
  const [aiErr, setAiErr] = useState('');

  const [injected, setInjected] = useState(false);

  const agg = aggregate(sessions, events);

  const loadData = useCallback(async () => {
    setDbLoading(true); setDbErr('');
    try {
      const [s,e] = await Promise.all([fetchAllSessions(), fetchAllEvents()]);
      setSessions(s); setEvents(e); setLastSync(new Date());
    } catch(err) { setDbErr(err.message); }
    finally { setDbLoading(false); }
  }, []);

  useEffect(() => { if (unlocked) loadData(); }, [unlocked, loadData]);

  // auto-refresh every 60s
  useEffect(() => {
    if (!unlocked) return;
    const t = setInterval(loadData, 60000);
    return () => clearInterval(t);
  }, [unlocked, loadData]);

  const genProductAI = useCallback(async () => {
    const prompt = buildProductPrompt(agg, sessions, events);
    if (!prompt) { setAiErr('Нет данных в БД'); return; }
    setAiLoading(true); setAiErr('');
    try {
      const res = await callOpenAI([
        {role:'system',content:'Ты — product-аналитик. Отвечай по-русски. Используй конкретные цифры. Не пиши общих слов.'},
        {role:'user',content:prompt}
      ], 1000);
      setProductAI(res);
    } catch(err) { setAiErr(err.message); }
    finally { setAiLoading(false); }
  }, [agg, sessions, events]);

  const genChildAI = useCallback(async (session) => {
    setAiChildTarget(session.session_id); setAiChildLoading(true); setAiErr('');
    try {
      const res = await callOpenAI([
        {role:'system',content:'Ты — детский педагог. Отвечай по-русски. Кратко, тепло, полезно.'},
        {role:'user',content:buildChildPrompt(session)}
      ], 500);
      setChildAI(res);
    } catch(err) { setAiErr(err.message); }
    finally { setAiChildLoading(false); }
  }, []);

  const handlePin = e => {
    e.preventDefault();
    if (pin === DEV_PASSWORD) { setUnlocked(true); setPinErr(''); }
    else { setPinErr('Неверный пароль'); setPin(''); }
  };

  const handleInject = () => {
    const cur = JSON.parse(localStorage.getItem('bs_appState')||'{}');
    localStorage.setItem('bs_appState', JSON.stringify({...cur, name:'Алия', age:'9', coins:45, completedGames:['math','words','memory'], unlockedCollectibles:['c-math','c-memory','c-words'], screenTimeMinutes:22}));
    setInjected(true);
    setTimeout(()=>window.location.reload(), 700);
  };

  const tabs = [
    {id:'business', label:'📊 Business'},
    {id:'users',    label:'👥 Users'},
    {id:'events',   label:'⚡ Events'},
    {id:'ai',       label:'🤖 AI'},
    {id:'tools',    label:'🛠️ Tools'},
  ];

  /* ── Lock screen ── */
  if (!unlocked) return (
    <div style={{...css.shell,justifyContent:'center',alignItems:'center'}}>
      <style>{`@keyframes _spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:'100%',maxWidth:'320px',padding:'2rem',textAlign:'center'}}>
        <div style={{fontSize:'2rem',marginBottom:'0.3rem'}}>⚙️</div>
        <p style={{fontSize:'0.58rem',letterSpacing:'0.2em',color:C.muted,margin:'0 0 0.15rem'}}>BAYAN SULU</p>
        <h2 style={{color:C.accent,margin:'0 0 0.2rem',fontSize:'1rem',fontWeight:700}}>Developer Console</h2>
        <p style={{color:C.muted,fontSize:'0.7rem',marginBottom:'1.5rem'}}>Restricted access</p>
        <form onSubmit={handlePin} style={{display:'flex',flexDirection:'column',gap:'0.6rem'}}>
          <input type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="password" autoFocus
            style={{width:'100%',boxSizing:'border-box',background:'rgba(0,0,0,0.5)',border:`1px solid ${C.border}`,borderRadius:'8px',padding:'0.7rem',color:C.text,fontFamily:'inherit',fontSize:'1rem',textAlign:'center',letterSpacing:'0.3em',outline:'none'}}/>
          {pinErr && <p style={{color:C.red,fontSize:'0.7rem',margin:0}}>{pinErr}</p>}
          <button type="submit" style={btn('linear-gradient(135deg,#5ab4ff,#3060d0)','#fff')}>Войти</button>
        </form>
        <button onClick={()=>goToScreen('map')} style={{...btn('rgba(255,255,255,0.05)',C.muted,`1px solid ${C.border}`),marginTop:'0.65rem',fontSize:'0.68rem'}}>← Назад</button>
      </div>
    </div>
  );

  const total = sessions.length;

  return (
    <div style={css.shell}>
      <style>{`
        @keyframes _spin{to{transform:rotate(360deg)}}
        ._dt:hover{color:#8ab4ff!important;border-color:rgba(90,180,255,0.28)!important}
        ._db:hover{opacity:0.8}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(90,180,255,0.18);border-radius:3px}
      `}</style>

      {/* ── Topbar ── */}
      <div style={css.topbar}>
        <span style={css.badge}>DEV</span>
        <span style={{flex:1,fontWeight:700,fontSize:'0.82rem',color:'#fff'}}>Bayan Sulu Console</span>
        {lastSync && <span style={{fontSize:'0.58rem',color:C.muted}}>sync {lastSync.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</span>}
        {dbLoading ? <Spin/> : <span style={{width:7,height:7,borderRadius:'50%',background:C.green,boxShadow:`0 0 5px ${C.green}`,display:'inline-block'}}/>}
        <button className="_db" onClick={loadData} style={btn('rgba(90,180,255,0.1)',C.accent,`1px solid ${C.border}`)}>↻</button>
        <button className="_db" onClick={()=>goToScreen('map')} style={btn('rgba(255,255,255,0.05)',C.muted,`1px solid ${C.border}`)}>← Map</button>
      </div>

      {/* ── Tabbar ── */}
      <div style={css.tabBar}>
        {tabs.map(t=>(
          <button key={t.id} className="_dt"
            style={{...css.tab,...(tab===t.id?{background:'rgba(90,180,255,0.13)',color:C.accent,borderColor:'rgba(90,180,255,0.28)'}:{})}}
            onClick={()=>setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div style={css.body}>
        {dbErr && <div style={{...css.card,borderColor:'rgba(248,113,113,0.3)',background:'rgba(248,113,113,0.06)'}}><span style={{color:C.red,fontSize:'0.72rem'}}>⚠️ {dbErr}</span></div>}
        {aiErr && <div style={{...css.card,borderColor:'rgba(248,113,113,0.3)',background:'rgba(248,113,113,0.06)'}}><span style={{color:C.red,fontSize:'0.72rem'}}>🤖 {aiErr}</span></div>}

        {/* ══ BUSINESS ══ */}
        {tab==='business' && (
          <>
            {/* KPI strip */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
              {[
                {v:total,              l:'Пользователей', c:C.accent},
                {v:agg?.c3??0,         l:'Прошли всё',    c:C.green},
                {v:agg?.active7d??0,   l:'Активны 7 дней',c:C.purple},
                {v:agg?.qrUsers??0,    l:'QR сканов',     c:C.orange},
                {v:agg?.bonusUsers??0, l:'Бонус-запросы', c:'#f472b6'},
                {v:agg?.avgCoins??0,   l:'Средн. монеты', c:C.green},
              ].map(({v,l,c},i)=>(
                <div key={i} style={{...css.stat,borderTop:`2px solid ${c}40`}}>
                  <span style={{...css.statVal,color:c}}>{v}</span>
                  <span style={css.statLbl}>{l}</span>
                </div>
              ))}
            </div>

            {/* Game funnel */}
            <div style={css.card}>
              <div style={css.cardTitle}>Воронка игр</div>
              {[
                {l:'Математика',  v:agg?.mathDone??0,  c:C.accent},
                {l:'Память',      v:agg?.memDone??0,   c:C.purple},
                {l:'Слова',       v:agg?.wordsDone??0, c:C.green},
              ].map(({l,v,c})=>(
                <div key={l} style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.3rem'}}>
                  <span style={{fontSize:'0.65rem',color:C.text,minWidth:'80px'}}>{l}</span>
                  <MiniBar v={v} max={Math.max(total,1)} color={c}/>
                  <span style={{fontSize:'0.68rem',color:C.text,minWidth:'60px',textAlign:'right'}}>
                    {v}/{total} ({total?Math.round(v/total*100):0}%)
                  </span>
                </div>
              ))}
            </div>

            {/* Events breakdown */}
            <div style={css.card}>
              <div style={css.cardTitle}>Events ({events.length})</div>
              {Object.entries(agg?.evtCounts??{}).sort((a,b)=>b[1]-a[1]).map(([type,count])=>{
                const ec = {game_complete:C.green,qr_unlock:C.accent,onboarding_complete:C.purple,reward_request:C.orange}[type]||C.muted;
                const mx = Math.max(...Object.values(agg?.evtCounts??{1:1}));
                return (
                  <div key={type} style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.28rem'}}>
                    <span style={{fontSize:'0.63rem',color:ec,minWidth:'160px'}}>{type}</span>
                    <MiniBar v={count} max={mx} color={ec}/>
                    <span style={{fontSize:'0.68rem',color:C.text,minWidth:'20px',textAlign:'right'}}>{count}</span>
                  </div>
                );
              })}
              {!Object.keys(agg?.evtCounts??{}).length && <p style={{color:C.muted,fontSize:'0.72rem',margin:0}}>Нет событий — сыграй в приложении</p>}
            </div>

            {/* Language split */}
            <div style={css.card}>
              <div style={css.cardTitle}>Аудитория</div>
              <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',fontSize:'0.72rem'}}>
                <span style={{color:C.text}}>🇷🇺 РУ: <b style={{color:'#fff'}}>{total-(agg?.langKz??0)}</b></span>
                <span style={{color:C.text}}>🇰🇿 КЗ: <b style={{color:'#fff'}}>{agg?.langKz??0}</b></span>
                <span style={{color:C.text}}>📛 Профиль: <b style={{color:'#fff'}}>{agg?.withName??0}/{total}</b></span>
                <span style={{color:C.text}}>🎂 Ср. возраст: <b style={{color:'#fff'}}>{agg?.avgAge??'?'}</b></span>
              </div>
            </div>

            {/* Open full dashboard */}
            <button className="_db" onClick={()=>goToScreen('analytics')}
              style={{...btn('linear-gradient(135deg,rgba(90,180,255,0.18),rgba(167,139,250,0.18))','#fff',`1px solid rgba(90,180,255,0.3)`),width:'100%',justifyContent:'center',padding:'0.65rem'}}>
              📊 Открыть полный Business Dashboard →
            </button>

            {/* Recent events */}
            <div style={css.card}>
              <div style={css.cardTitle}>Последние события</div>
              <EventFeed events={events} limit={15}/>
            </div>
          </>
        )}

        {/* ══ USERS ══ */}
        {tab==='users' && (
          <>
            <div style={css.card}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.6rem'}}>
                <div style={css.cardTitle}>Все сессии ({total})</div>
              </div>
              <DataTable sessions={sessions}/>
            </div>

            <div style={css.card}>
              <div style={css.cardTitle}>Персональный AI-анализ</div>
              <p style={{color:C.muted,fontSize:'0.7rem',marginBottom:'0.65rem'}}>Выбери пользователя → GPT напишет педагогический отчёт</p>
              <div style={{display:'flex',flexDirection:'column',gap:'0.3rem',marginBottom:'0.65rem'}}>
                {sessions.filter(s=>s.user_name).slice(0,15).map((s,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                    <button className="_db" onClick={()=>genChildAI(s)}
                      disabled={aiChildLoading && aiChildTarget===s.session_id}
                      style={btn('rgba(90,180,255,0.09)',C.accent,`1px solid ${C.border}`)}>
                      {aiChildLoading && aiChildTarget===s.session_id ? <Spin/> : '✨'}
                      {s.user_name}, {s.user_age}л
                    </button>
                    <span style={{fontSize:'0.62rem',color:C.muted}}>
                      {(s.completed_games||[]).length}/3 · {s.coins||0}🪙 · {s.lang}
                    </span>
                  </div>
                ))}
                {!sessions.filter(s=>s.user_name).length && <p style={{color:C.muted,fontSize:'0.72rem'}}>Нет профилей с именем</p>}
              </div>
              {childAI && <div style={css.insight}>{childAI}</div>}
            </div>
          </>
        )}

        {/* ══ EVENTS ══ */}
        {tab==='events' && (
          <>
            <div style={css.card}>
              <div style={css.cardTitle}>Event Log · {events.length} записей</div>
              <EventFeed events={events} limit={200}/>
            </div>
            <div style={css.card}>
              <div style={css.cardTitle}>Raw JSON (последние 5)</div>
              <pre style={css.pre}>{JSON.stringify(events.slice(0,5),null,2)}</pre>
            </div>
          </>
        )}

        {/* ══ AI ══ */}
        {tab==='ai' && (
          <>
            <div style={{...css.card,background:'linear-gradient(135deg,rgba(90,180,255,0.06),rgba(167,139,250,0.06))',borderColor:'rgba(167,139,250,0.25)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{...css.cardTitle,color:C.purple}}>🤖 AI Product Insights</div>
                  <p style={{color:C.muted,fontSize:'0.68rem',margin:0}}>
                    {total>0 ? `${total} сессий · ${events.length} событий · GPT-4o-mini` : 'Нет данных в БД'}
                  </p>
                </div>
                <button className="_db" onClick={genProductAI} disabled={aiLoading}
                  style={btn(aiLoading?'rgba(167,139,250,0.15)':'linear-gradient(135deg,#a78bfa,#7c3aed)','#fff')}>
                  {aiLoading ? <><Spin/> Анализирую...</> : '⚡ Generate'}
                </button>
              </div>
            </div>

            {productAI
              ? <AIBlock text={productAI}/>
              : <div style={css.card}><p style={{color:C.muted,fontSize:'0.72rem',textAlign:'center',padding:'0.75rem 0',margin:0}}>
                  {total===0 ? '📭 Нет данных. Поиграй — данные появятся.' : `${total} сессий готовы. Нажми Generate.`}
                </p></div>
            }
          </>
        )}

        {/* ══ TOOLS ══ */}
        {tab==='tools' && (
          <>
            <div style={css.card}>
              <div style={css.cardTitle}>Quick Navigate</div>
              <div style={css.row}>
                {['map','studio','cards','shop','parent','analytics','math','memory','words','onboarding'].map(sc=>(
                  <button key={sc} className="_db" onClick={()=>goToScreen(sc)}
                    style={btn('rgba(90,180,255,0.09)',C.accent,`1px solid ${C.border}`)}>
                    {sc}
                  </button>
                ))}
              </div>
            </div>

            <div style={css.card}>
              <div style={css.cardTitle}>Current App State</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.4rem',marginBottom:'0.6rem'}}>
                {[
                  ['Имя',      appState.name||'—'],
                  ['Возраст',  appState.age||'—'],
                  ['Монеты',   appState.coins||0],
                  ['Игры',     `${(appState.completedGames||[]).length}/3`],
                  ['Язык',     localStorage.getItem('bs_lang')||'ru'],
                  ['QR',       (appState.unlockedLocations||[]).length],
                ].map(([l,v])=>(
                  <div key={l} style={css.stat}>
                    <span style={{...css.statVal,fontSize:'0.85rem'}}>{v}</span>
                    <span style={css.statLbl}>{l}</span>
                  </div>
                ))}
              </div>
              <pre style={{...css.pre,maxHeight:'160px'}}>{JSON.stringify(appState,null,2)}</pre>
            </div>

            <div style={css.card}>
              <div style={css.cardTitle}>Inject Demo Data</div>
              <button className="_db" onClick={handleInject} disabled={injected}
                style={btn(injected?'rgba(52,211,153,0.08)':'rgba(52,211,153,0.14)',C.green,`1px solid rgba(52,211,153,0.25)`)}>
                {injected ? '✓ Готово, перезагрузка...' : '💉 Inject Demo (Алия, все 3 игры)'}
              </button>
            </div>

            <div style={{...css.card,borderColor:'rgba(248,113,113,0.18)'}}>
              <div style={{...css.cardTitle,color:C.red}}>⚠️ Danger Zone</div>
              <div style={css.row}>
                <button className="_db"
                  onClick={()=>{if(confirm('Сбросить профиль?')){resetProfile?.();goToScreen('onboarding');}}}
                  style={btn('rgba(248,113,113,0.09)',C.red,`1px solid rgba(248,113,113,0.22)`)}>
                  ↺ Reset Profile
                </button>
                <button className="_db"
                  onClick={()=>{if(confirm('Полный сброс? Все данные удалятся.')){localStorage.clear();window.location.reload();}}}
                  style={btn('rgba(248,113,113,0.09)',C.red,`1px solid rgba(248,113,113,0.22)`)}>
                  🗑️ Clear LocalStorage
                </button>
              </div>
            </div>

            <div style={css.card}>
              <div style={css.cardTitle}>Info</div>
              <pre style={css.pre}>{[
                `App:      Bayan Sulu Kids v0.0.0 (build19)`,
                `DB:       Supabase vlcukhheamegpitpxqiz`,
                `Sessions: ${total} | Events: ${events.length}`,
                `AI:       GPT-4o-mini`,
                `Entry:    tap 🌟 × 7 → password: devmode`,
                `Auto-refresh: 60s`,
              ].join('\n')}</pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


export default DevModePage;
