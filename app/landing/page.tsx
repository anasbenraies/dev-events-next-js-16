"use client";

import React, { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";

const GLOBAL_CSS = `
    @font-face { font-family:'DM Sans'; src:url('/fonts/DM-Sans.woff2') format('woff2'); font-weight:400; font-style:normal; }
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { background:#080c10; color:#f0f4f8; font-family:'DM Sans',sans-serif; font-size:16px; line-height:1.6; overflow-x:hidden; }
  body::before { content:''; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:.5;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); }
  @keyframes drift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(80px,60px)} }
  @keyframes drift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-60px,-80px)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(0.8)} }
  @keyframes msgPop { from{opacity:0;transform:scale(0.9) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes typ    { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
  @keyframes glow   { 0%,100%{box-shadow:0 0 6px rgba(34,197,94,.5)} 50%{box-shadow:0 0 14px rgba(34,197,94,.8)} }
  @keyframes countUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes notifSlide { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  .speedy-fade { opacity:0; transform:translateY(24px); transition:opacity .65s ease,transform .65s ease; }
  .speedy-fade.visible { opacity:1; transform:translateY(0); }
`;

const T = {
  bg:'#080c10', surface:'#0f1419', surface2:'#161d26',
  accent:'#00e5a0', accent2:'#0099ff', text:'#f0f4f8',
  muted:'#6b7a8d', border:'rgba(255,255,255,0.07)',
};

function useInView(ref: React.RefObject<Element | null | null>, opts = {}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold:.1, rootMargin:'0px 0px -40px 0px', ...opts });
    io.observe(el); return () => io.disconnect();
  }, []);
  return visible;
}

function FadeIn({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  return (
    <div ref={ref} className={`speedy-fade${visible ? ' visible' : ''}`} style={{ transitionDelay:`${delay}s`, ...style }}>
      {children}
    </div>
  );
}

async function submitEmail(email: string, source: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'apikey':SUPABASE_ANON_KEY, 'Authorization':`Bearer ${SUPABASE_ANON_KEY}`, 'Prefer':'return=minimal' },
    body: JSON.stringify({ email, source, created_at: new Date().toISOString() }),
  });
  if (res.ok || res.status === 201) return 'ok';
  if (res.status === 409) return 'duplicate';
  throw new Error('server');
}

function EmailForm({ source, align = 'left' }: { source: string; align?: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const centered = align === 'center';
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setState('loading');
    try { const r = await submitEmail(email, source); setState(r); setEmail(''); }
    catch { setState('error'); }
  };
  return (
    <div style={{ width:'100%' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre@email.com" required disabled={state==='loading'}
            style={{ flex:'1 1 200px', background:T.surface, border:`1px solid ${T.border}`, color:T.text, padding:'14px 20px', borderRadius:12, fontSize:15, fontFamily:"'DM Sans',sans-serif", outline:'none', transition:'border .2s, box-shadow .2s', minWidth:0 }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(0,229,160,.4)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 4px rgba(0,229,160,.06)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = T.border; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
          />
          <button type="submit" disabled={state==='loading'||state==='ok'||state==='duplicate'}
            style={{ background:'linear-gradient(135deg,#00e5a0,#00c87a)', color:'#080c10', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, padding:'14px 28px', borderRadius:12, border:'none', cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s', opacity:state==='ok'||state==='duplicate'?.7:1 }}
            onMouseEnter={(e) => { if (!(e.target as HTMLButtonElement).disabled) { (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.target as HTMLButtonElement).style.boxShadow = '0 12px 30px rgba(0,229,160,.25)'; } }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = ''; (e.target as HTMLButtonElement).style.boxShadow = ''; }}>
            {state==='loading'?'...':state==='ok'||state==='duplicate'?'✓ Inscrit':source==='hero'?'Rejoindre →':'Je veux accès →'}
          </button>
        </div>
      </form>
      <p style={{ fontSize:12, color:T.muted, marginTop:10, textAlign:centered?'center':'left' }}>🔒 Aucun spam. Accès prioritaire garanti.</p>
      {(state==='ok'||state==='duplicate') && <div style={{ marginTop:10, background:'rgba(0,229,160,.1)', border:'1px solid rgba(0,229,160,.25)', color:T.accent, padding:'12px 18px', borderRadius:12, fontSize:14, fontWeight:500, textAlign:centered?'center':'left', animation:'fadeUp .4s ease both' }}>✓ {state==='duplicate'?'Vous êtes déjà sur la liste !':"Parfait ! On vous contacte bientôt."}</div>}
      {state==='error' && <div style={{ marginTop:10, background:'rgba(255,80,80,.1)', border:'1px solid rgba(255,80,80,.25)', color:'#ff6060', padding:'12px 18px', borderRadius:12, fontSize:14, animation:'fadeUp .4s ease both' }}>Une erreur est survenue. Réessayez.</div>}
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 30); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'20px 0', borderBottom:`1px solid ${scrolled?T.border:'transparent'}`, backdropFilter:'blur(20px)', background:scrolled?'rgba(8,12,16,.85)':'transparent', transition:'all .3s' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:'-0.5px' }}>Speedy<span style={{ color:T.accent }}>.</span></div>
        <button onClick={() => document.getElementById('cta-section')?.scrollIntoView({behavior:'smooth'})}
          style={{ background:'rgba(0,229,160,.1)', border:'1px solid rgba(0,229,160,.2)', color:T.accent, fontSize:12, fontWeight:500, padding:'6px 16px', borderRadius:100, cursor:'pointer', transition:'all .2s', fontFamily:"'DM Sans',sans-serif" }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.background = 'rgba(0,229,160,.2)'} onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'rgba(0,229,160,.1)'}>
          Accès Anticipé →
        </button>
      </div>
    </nav>
  );
}

const CHAT_MESSAGES = [
  { type:'bot', text:'Marhba! 👋 Je suis l\'assistante de <strong>Boutique Lina</strong>. Comment puis-je vous aider ?', delay:400 },
  { type:'user', text:'Combien coûte la robe bleue ?', delay:1200 },
  { type:'bot', text:'La <strong>Robe Bleue Méditerranée</strong> est à <span style="color:#00e5a0;font-weight:700">89 TND</span> 🌊<br>Dispo en S, M, L. Seulement <strong>3 pièces</strong> restantes !', delay:2200 },
  { type:'user', text:'Je veux la taille M', delay:3200 },
  { type:'bot', text:'Parfait ! Donnez-moi votre nom et adresse de livraison 📦', delay:4600 },
];

function ChatDemo() {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    CHAT_MESSAGES.forEach((msg, i) => {
      if (msg.type === 'bot' && i > 0) { setTimeout(()=>setTyping(true), msg.delay-800); setTimeout(()=>{setTyping(false);setShown(i+1);}, msg.delay); }
      else { setTimeout(()=>setShown(i+1), msg.delay); }
    });
  }, []);
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,.5)' }}>
      <div style={{ background:T.surface2, padding:'14px 18px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#00e5a0,#0099ff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>👗</div>
        <div><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14 }}>Boutique Lina</div><div style={{ fontSize:11, color:T.muted }}>Assistant IA · Répond instantanément</div></div>
        <div style={{ marginLeft:'auto', width:8, height:8, background:'#22c55e', borderRadius:'50%', animation:'glow 2s ease infinite' }} />
      </div>
      <div style={{ padding:16, display:'flex', flexDirection:'column', gap:10, minHeight:220 }}>
        {CHAT_MESSAGES.slice(0,shown).map((msg,i)=>(
          <div key={i} style={{ padding:'10px 14px', borderRadius:10, fontSize:13, lineHeight:1.5, maxWidth:'85%', alignSelf:msg.type==='user'?'flex-end':'flex-start', background:msg.type==='user'?'linear-gradient(135deg,rgba(0,229,160,.15),rgba(0,153,255,.1))':T.surface2, border:msg.type==='user'?'1px solid rgba(0,229,160,.2)':`1px solid ${T.border}`, animation:'msgPop .35s cubic-bezier(.34,1.56,.64,1) both' }} dangerouslySetInnerHTML={{__html:msg.text}} />
        ))}
        {typing && <div style={{ padding:'10px 14px', background:T.surface2, border:`1px solid ${T.border}`, borderRadius:10, display:'flex', gap:4, width:'fit-content' }}>{[0,.2,.4].map((d,i)=><span key={i} style={{ width:6, height:6, background:T.muted, borderRadius:'50%', display:'block', animation:`typ 1.2s ${d}s ease infinite` }} />)}</div>}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop:`1px solid ${T.border}` }}>
        {[['24/7','Disponible'],['3s','Réponse moy.'],['+40%','Ventes']].map(([num,label],i)=>(
          <div key={i} style={{ padding:14, textAlign:'center', borderRight:i<2?`1px solid ${T.border}`:'none' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:T.accent }}>{num}</div>
            <div style={{ fontSize:11, color:T.muted }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════ VISUAL ILLUSTRATIONS ══════════ */

function DashboardVisual() {
  const ref = useRef(null);
  const visible = useInView(ref);
  const bars = [
    {l:'Lun',v:62},{l:'Mar',v:84},{l:'Mer',v:48},{l:'Jeu',v:91},{l:'Ven',v:76},{l:'Sam',v:100},{l:'Dim',v:55}
  ];
  return (
    <div ref={ref} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 30px 70px rgba(0,0,0,.5)' }}>
      <div style={{ background:T.surface2, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:'flex', gap:6 }}>{['#ff5f57','#febc2e','#28c840'].map((c,i)=><div key={i} style={{ width:10, height:10, borderRadius:'50%', background:c }} />)}</div>
        <div style={{ fontSize:11, color:T.muted, fontFamily:"'Syne',sans-serif", fontWeight:600 }}>Dashboard Speedy</div>
        <div />
      </div>
      <div style={{ padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
          {[['2 840 TND','Revenus','↑ 23%'],['47','Commandes','↑ 8%'],['94%','Taux réponse','stable']].map(([val,label,delta],i)=>(
            <div key={i} style={{ background:T.surface2, borderRadius:10, padding:'10px 12px', border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:10, color:T.muted, marginBottom:4 }}>{label}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:T.text, animation:visible?`countUp .5s ${.1+i*.1}s ease both`:'', opacity:visible?1:0 }}>{val}</div>
              <div style={{ fontSize:10, color:i<2?T.accent:T.muted, marginTop:2 }}>{delta}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:11, color:T.muted, marginBottom:8, fontWeight:500 }}>Commandes · cette semaine</div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:72, marginBottom:14 }}>
          {bars.map((b,i)=>(
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:'100%', borderRadius:'4px 4px 0 0', background:b.v===100?T.accent:`rgba(0,229,160,${.4+b.v/200})`, height: visible?`${b.v*.65}px`:'0px', transition:`height .6s ${i*.07}s ease`, boxShadow:b.v===100?`0 0 10px rgba(0,229,160,.4)`:'' }} />
              <div style={{ fontSize:9, color:T.muted }}>{b.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:11, color:T.muted, fontWeight:500, marginBottom:8 }}>Dernières commandes</div>
        {[['Fatma B.','Robe bleue M','89 TND'],['Amira K.','Sac cuir beige','145 TND'],['Sana M.','Sandales 38','62 TND']].map(([name,item,price],i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:i<2?`1px solid ${T.border}`:'none', animation:visible?`notifSlide .4s ${.3+i*.1}s ease both`:'', opacity:visible?1:0 }}>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ width:24, height:24, borderRadius:6, background:`linear-gradient(135deg,rgba(0,229,160,.15),rgba(0,153,255,.1))`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10 }}>👤</div>
              <div><div style={{ fontSize:11, fontWeight:500 }}>{name}</div><div style={{ fontSize:10, color:T.muted }}>{item}</div></div>
            </div>
            <div style={{ textAlign:'right' }}><div style={{ fontSize:11, color:T.accent, fontWeight:700 }}>{price}</div><div style={{ fontSize:10, color:'#22c55e' }}>✓</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LangVisual() {
  const ref = useRef(null);
  const visible = useInView(ref);
  const convs = [
    { flag:'🇫🇷', lang:'Français détecté', q:'Bonjour, quel est le prix ?', a:'Bonjour ! Ce modèle est à 89 TND 😊', dir:'ltr', qC:'rgba(0,153,255,.15)', qB:'rgba(0,153,255,.25)' },
    { flag:'🇹🇳', lang:'Darija détectée', q:'Bchhal had la robe ?', a:'Marhba ! Had la robe b 89 dinars 🌟', dir:'ltr', qC:'rgba(0,229,160,.1)', qB:'rgba(0,229,160,.2)' },
    { flag:'🌍', lang:'عربية مكتشفة', q:'كم سعر هذا المنتج؟', a:'أهلاً ! سعر هذا المنتج 89 دينار 💚', dir:'rtl', qC:'rgba(245,158,11,.1)', qB:'rgba(245,158,11,.25)' },
  ];
  return (
    <div ref={ref} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 30px 60px rgba(0,0,0,.4)' }}>
      <div style={{ background:T.surface2, padding:'12px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>🤖 Détection automatique de langue</div>
      </div>
      <div style={{ padding:14, display:'flex', flexDirection:'column', gap:14 }}>
        {convs.map((c,i)=>(
          <div key={i} style={{ animation:visible?`fadeUp .5s ${i*.12}s ease both`:'', opacity:visible?1:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
              <span style={{ fontSize:14 }}>{c.flag}</span>
              <span style={{ fontSize:10, color:T.muted, fontWeight:500 }}>{c.lang}</span>
              <span style={{ marginLeft:'auto', fontSize:10, background:'rgba(0,229,160,.1)', color:T.accent, padding:'1px 6px', borderRadius:100 }}>auto</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <div style={{ alignSelf:'flex-end', background:c.qC, border:`1px solid ${c.qB}`, borderRadius:'8px 8px 2px 8px', padding:'6px 10px', fontSize:12, maxWidth:'85%', direction: c.dir as any }}>{c.q}</div>
              <div style={{ background:T.surface2, border:`1px solid ${T.border}`, borderRadius:'2px 8px 8px 8px', padding:'6px 10px', fontSize:12, maxWidth:'85%', direction: c.dir as any }}>{c.a}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StockVisual() {
  const ref = useRef(null);
  const visible = useInView(ref);
  const products = [
    { name:'Robe Bleue', sizes:['S','M','L','XL'], stock:[12,3,8,15] },
    { name:'Sandales Dorées', sizes:['37','38','39','40'], stock:[0,4,9,2] },
    { name:'Sac Cuir Beige', sizes:['Unique'], stock:[7] },
  ];
  return (
    <div ref={ref} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 30px 60px rgba(0,0,0,.4)' }}>
      <div style={{ background:T.surface2, padding:'12px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>📦 Stock en temps réel</div>
        <div style={{ fontSize:10, color:T.accent, display:'flex', alignItems:'center', gap:4 }}><span style={{ width:6, height:6, background:T.accent, borderRadius:'50%', animation:'pulse 2s ease infinite', display:'inline-block' }} />Live</div>
      </div>
      <div style={{ padding:14, display:'flex', flexDirection:'column', gap:10 }}>
        {products.map((p,pi)=>(
          <div key={pi} style={{ background:T.surface2, borderRadius:10, padding:'10px 12px', border:`1px solid ${T.border}` }}>
            <div style={{ fontSize:12, fontWeight:600, marginBottom:8 }}>{p.name}</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {p.sizes.map((s,si)=>{
                const qty = p.stock[si];
                const col = qty===0?'#ef4444':qty<=4?'#f59e0b':T.accent;
                const bg = qty===0?'rgba(239,68,68,.1)':qty<=4?'rgba(245,158,11,.1)':'rgba(0,229,160,.1)';
                const br = qty===0?'rgba(239,68,68,.3)':qty<=4?'rgba(245,158,11,.3)':'rgba(0,229,160,.25)';
                return (
                  <div key={si} style={{ textAlign:'center', minWidth:38 }}>
                    <div style={{ fontSize:10, color:T.muted, marginBottom:3 }}>{s}</div>
                    <div style={{ background:bg, border:`1px solid ${br}`, borderRadius:6, padding:'4px 8px', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:col, animation:visible?`countUp .4s ${.1+si*.05}s ease both`:'', opacity:visible?1:0 }}>{qty===0?'✕':qty}</div>
                    {qty===0&&<div style={{ fontSize:9, color:'#ef4444', marginTop:2 }}>Épuisé</div>}
                    {qty>0&&qty<=4&&<div style={{ fontSize:9, color:'#f59e0b', marginTop:2 }}>Bas</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ background:'rgba(0,229,160,.06)', border:'1px solid rgba(0,229,160,.2)', borderRadius:10, padding:'8px 12px', display:'flex', gap:8, alignItems:'center', animation:visible?'notifSlide .5s .4s ease both':'', opacity:visible?1:0 }}>
          <span style={{ fontSize:14 }}>🔔</span>
          <div style={{ fontSize:11 }}><span style={{ color:T.accent, fontWeight:600 }}>Alerte stock :</span> Robe Bleue M → seulement <strong>3</strong> pièces</div>
        </div>
      </div>
    </div>
  );
}

function CartVisual() {
  const ref = useRef(null);
  const visible = useInView(ref);
  const timeline = [
    { time:'14:23', icon:'🛍️', label:'Panier créé', sub:'Robe Bleue M + Sac Cuir', col:T.accent },
    { time:'14:31', icon:'⏸️', label:'Client inactif', sub:'Aucune action depuis 8 min', col:T.muted },
    { time:'16:23', icon:'💬', label:'Relance envoyée', sub:'«Vous avez oublié quelque chose...»', col:'#f59e0b' },
    { time:'16:41', icon:'✅', label:'Commande finalisée', sub:'+234 TND récupérés !', col:'#22c55e' },
  ];
  return (
    <div ref={ref} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 30px 60px rgba(0,0,0,.4)' }}>
      <div style={{ background:T.surface2, padding:'12px 16px', borderBottom:`1px solid ${T.border}` }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>🔁 Récupération automatique</div>
      </div>
      <div style={{ padding:14 }}>
        <div style={{ position:'relative', paddingLeft:20 }}>
          <div style={{ position:'absolute', left:6, top:8, bottom:8, width:1, background:`linear-gradient(to bottom, ${T.accent}, rgba(0,229,160,.1))` }} />
          {timeline.map((s,i)=>(
            <div key={i} style={{ position:'relative', marginBottom:i<3?12:0, animation:visible?`notifSlide .4s ${i*.1}s ease both`:'', opacity:visible?1:0 }}>
              <div style={{ position:'absolute', left:-17, top:10, width:12, height:12, borderRadius:'50%', background:i===1?T.surface2:s.col, border:`2px solid ${s.col}`, display:'flex', alignItems:'center', justifyContent:'center' }} />
              <div style={{ background:T.surface2, borderRadius:10, padding:'8px 12px', border:`1px solid ${i===3?'rgba(34,197,94,.2)':T.border}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:s.col }}>{s.icon} {s.label}</div>
                  <div style={{ fontSize:10, color:T.muted }}>{s.time}</div>
                </div>
                <div style={{ fontSize:11, color:T.muted }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:12, background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', borderRadius:10, padding:'8px 12px', textAlign:'center', fontSize:12, color:'#22c55e', fontWeight:600, animation:visible?'fadeUp .5s .45s ease both':'', opacity:visible?1:0 }}>
          ↑ 23% de ventes récupérées automatiquement
        </div>
      </div>
    </div>
  );
}

function UpsellVisual() {
  const ref = useRef(null);
  const visible = useInView(ref);
  return (
    <div ref={ref} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 30px 60px rgba(0,0,0,.4)' }}>
      <div style={{ background:T.surface2, padding:'12px 16px', borderBottom:`1px solid ${T.border}` }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>⬆️ Suggestions intelligentes</div>
      </div>
      <div style={{ padding:14 }}>
        <div style={{ background:T.surface2, borderRadius:10, padding:'10px 12px', border:`1px solid ${T.border}`, marginBottom:10, display:'flex', alignItems:'center', gap:10, animation:visible?'fadeUp .4s ease both':'', opacity:visible?1:0 }}>
          <div style={{ width:36, height:36, borderRadius:8, background:'linear-gradient(135deg,rgba(0,229,160,.2),rgba(0,153,255,.2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>👗</div>
          <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:600 }}>Robe Bleue taille M</div><div style={{ fontSize:11, color:T.muted }}>Ajouté au panier</div></div>
          <div style={{ color:T.accent, fontWeight:700, fontSize:13 }}>89 TND</div>
        </div>
        <div style={{ background:'rgba(0,229,160,.06)', border:'1px solid rgba(0,229,160,.2)', borderRadius:'2px 12px 12px 12px', padding:'10px 12px', fontSize:12, lineHeight:1.6, marginBottom:10, animation:visible?'fadeUp .4s .12s ease both':'', opacity:visible?1:0 }}>
          Excellent choix ! 🎉 Ces articles vont parfaitement avec votre robe :
        </div>
        {[['👜','Sac Cuir Caramel','78 TND','Best-seller'],['💍','Collier Doré','35 TND','Nouveau']].map(([icon,name,price,tag],i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, background:T.surface2, borderRadius:10, padding:'8px 12px', marginBottom:8, border:`1px solid ${T.border}`, animation:visible?`notifSlide .4s ${.22+i*.1}s ease both`:'', opacity:visible?1:0 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'rgba(0,229,160,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{icon}</div>
            <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:500 }}>{name}</div><div style={{ fontSize:10, color:T.accent }}>{tag}</div></div>
            <div style={{ textAlign:'right' }}><div style={{ fontSize:12, fontWeight:700, color:T.accent }}>{price}</div><div style={{ fontSize:10, background:'rgba(0,229,160,.15)', border:'1px solid rgba(0,229,160,.3)', color:T.accent, borderRadius:6, padding:'1px 8px', marginTop:2, cursor:'pointer' }}>+ Ajouter</div></div>
          </div>
        ))}
        <div style={{ textAlign:'center', fontSize:11, color:T.muted, marginTop:4, animation:visible?'fadeUp .4s .42s ease both':'', opacity:visible?1:0 }}>Panier moyen augmenté de <span style={{ color:T.accent, fontWeight:700 }}>+67 TND</span> en moyenne</div>
      </div>
    </div>
  );
}

function OrderSheetVisual() {
  const ref = useRef(null);
  const visible = useInView(ref);
  return (
    <div ref={ref} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 30px 60px rgba(0,0,0,.4)' }}>
      <div style={{ background:T.surface2, padding:'12px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>🧾 Bon de commande</div>
        <div style={{ fontSize:10, background:'rgba(34,197,94,.15)', color:'#22c55e', padding:'2px 8px', borderRadius:100, fontWeight:600 }}>Confirmé ✓</div>
      </div>
      <div style={{ padding:14, fontSize:12, animation:visible?'fadeUp .5s ease both':'', opacity:visible?1:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
          <div><div style={{ fontSize:10, color:T.muted }}>N° commande</div><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:T.accent, fontSize:15 }}>#SPD-0847</div></div>
          <div style={{ textAlign:'right' }}><div style={{ fontSize:10, color:T.muted }}>Date</div><div style={{ fontWeight:500 }}>Sam 14 Jan · 16:41</div></div>
        </div>
        <div style={{ background:T.surface2, borderRadius:10, padding:'10px 12px', marginBottom:10, border:`1px solid ${T.border}` }}>
          <div style={{ fontSize:10, color:T.muted, marginBottom:6 }}>Client</div>
          <div style={{ fontWeight:600 }}>Fatma Belhaj</div>
          <div style={{ color:T.muted, fontSize:11 }}>📍 12 Rue de Carthage, Ariana 2080</div>
          <div style={{ color:T.muted, fontSize:11 }}>📞 +216 55 123 456</div>
        </div>
        {[['Robe Bleue Méditerranée (M) ×1','89 TND'],['Sac Cuir Caramel ×1','78 TND']].map(([item,price],i)=>(
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${T.border}`, fontSize:11 }}>
            <span style={{ color:T.muted }}>{item}</span><span style={{ fontWeight:600 }}>{price}</span>
          </div>
        ))}
        <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontWeight:700 }}>
          <span>Total</span><span style={{ color:T.accent }}>167 TND</span>
        </div>
        <div style={{ background:'rgba(0,229,160,.06)', border:'1px solid rgba(0,229,160,.2)', borderRadius:8, padding:'6px 10px', fontSize:11, color:T.muted }}>
          🚚 Livraison à domicile · Paiement à la livraison
        </div>
      </div>
    </div>
  );
}

/* ── PHOTO CATALOG VISUAL ── */
function CatalogVisual() {
  const ref = useRef(null);
  const visible = useInView(ref);
  const products = [
    { emoji:'👗', name:'Robe Bleue Méditerranée', price:'89 TND', badge:'3 restants', badgeColor:'#f59e0b' },
    { emoji:'👜', name:'Sac Cuir Caramel', price:'78 TND', badge:'Disponible', badgeColor:T.accent },
    { emoji:'👡', name:'Sandales Dorées', price:'62 TND', badge:'Épuisé 37', badgeColor:'#ef4444' },
    { emoji:'💍', name:'Collier Doré Fin', price:'35 TND', badge:'Nouveau', badgeColor:T.accent2 },
  ];
  return (
    <div ref={ref} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 30px 60px rgba(0,0,0,.4)' }}>
      <div style={{ background:T.surface2, padding:'12px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>📸 Catalogue photo</div>
        <div style={{ fontSize:10, color:T.muted }}>4 produits</div>
      </div>
      <div style={{ padding:14 }}>
        {/* Bot message */}
        <div style={{ background:'rgba(0,229,160,.06)', border:'1px solid rgba(0,229,160,.15)', borderRadius:'2px 12px 12px 12px', padding:'8px 12px', fontSize:12, marginBottom:12, animation:visible?'fadeUp .4s ease both':'', opacity:visible?1:0 }}>
          Voici notre catalogue complet 📸 Cliquez sur un article pour commander !
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {products.map((p,i)=>(
            <div key={i} style={{ background:T.surface2, borderRadius:10, overflow:'hidden', border:`1px solid ${T.border}`, animation:visible?`notifSlide .4s ${i*.08}s ease both`:'', opacity:visible?1:0, cursor:'pointer', transition:'border .2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,229,160,.3)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
              <div style={{ height:64, background:`linear-gradient(135deg,rgba(0,229,160,.08),rgba(0,153,255,.06))`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>{p.emoji}</div>
              <div style={{ padding:'8px 10px' }}>
                <div style={{ fontSize:11, fontWeight:600, marginBottom:2, lineHeight:1.3 }}>{p.name}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ color:T.accent, fontWeight:700, fontSize:12 }}>{p.price}</span>
                  <span style={{ fontSize:9, background:`${p.badgeColor}20`, color:p.badgeColor, padding:'1px 6px', borderRadius:100, fontWeight:600 }}>{p.badge}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── FEATURE SECTIONS DATA ── */
const FEATURES = [
  { icon:'📊', name:'Analytics comportementales', desc:'Produits les plus demandés, heures de pointe, taux de conversion — des données que vous n\'avez jamais eues, maintenant dans votre dashboard en temps réel.', badge:'Dashboard Inclus', visual:<DashboardVisual /> },
  { icon:'🤖', name:'Détection de langue automatique', desc:'Darija, français, arabe standard — le bot détecte et s\'adapte à chaque client en temps réel. Zéro friction, zéro configuration.', badge:'IA Avancée', visual:<LangVisual /> },
  { icon:'📦', name:'Gestion du stock en temps réel', desc:'Le bot connaît vos stocks à la pièce près. Alertes automatiques quand c\'est bas. Fini les commandes impossibles à honorer.', visual:<StockVisual /> },
  { icon:'🔁', name:'Récupération de panier abandonné', desc:'Un client commence une commande puis disparaît ? Relance douce et intelligente après 2h. Des ventes récupérées sans lever le petit doigt.', badge:'+23% revenus', visual:<CartVisual /> },
  { icon:'⬆️', name:'Upsell automatique intelligent', desc:'Commande une robe ? Le bot suggère le sac assorti au bon moment. L\'IA détecte le contexte et propose intelligemment.', visual:<UpsellVisual /> },
  { icon:'📸', name:'Catalogue photo interactif', desc:'Vos clients voient vos produits directement dans la conversation — photos, prix, disponibilité. Ils cliquent, ils commandent.', visual:<CatalogVisual /> },
  { icon:'🧾', name:'Fiche commande structurée', desc:'Chaque commande génère un bon numéroté avec client, articles, total et adresse. Fini les DM en désordre.', visual:<OrderSheetVisual /> },
];

function FeatureSection({ feat, index }: { feat: { icon: string; badge?: string; name: string; desc: string; visual: React.ReactNode }; index: number }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  const isEven = index % 2 === 0;
  return (
    <div ref={ref} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center', opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(32px)', transition:'all .7s ease', transitionDelay:`${index*.04}s` }}>
      <div style={{ order:isEven?0:1 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(0,229,160,.08)', border:'1px solid rgba(0,229,160,.15)', borderRadius:100, padding:'5px 14px', fontSize:12, color:T.accent, fontWeight:500, marginBottom:16 }}>
          <span style={{ fontSize:14 }}>{feat.icon}</span>
          {feat.badge && <span style={{ background:'rgba(0,229,160,.18)', padding:'1px 8px', borderRadius:100, fontSize:10, fontWeight:700 }}>{feat.badge}</span>}
        </div>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(22px,2.5vw,32px)', letterSpacing:-1, marginBottom:16, lineHeight:1.2, color:T.text }}>{feat.name}</h3>
        <p style={{ color:T.muted, fontSize:16, lineHeight:1.75 }}>{feat.desc}</p>
      </div>
      <div style={{ order:isEven?1:0 }}>{feat.visual}</div>
    </div>
  );
}

/* ── HOW IT WORKS ── */
function StepsSection() {
  const steps = [
    { n:1, title:'Créez votre compte', desc:'Inscription simple. Aucune carte de crédit.',
      visual:(
        <div style={{ background:T.surface2, borderRadius:10, padding:14 }}>
          {[['Nom de la boutique','Boutique Lina'],['Email','lina@boutique.tn'],['Mot de passe','••••••••']].map(([l,v],i)=>(
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ fontSize:10, color:T.muted, marginBottom:3 }}>{l}</div>
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:'7px 10px', fontSize:11 }}>{v}</div>
            </div>
          ))}
          <div style={{ background:'linear-gradient(135deg,#00e5a0,#00c87a)', color:'#080c10', borderRadius:8, padding:9, fontSize:12, fontWeight:700, textAlign:'center', fontFamily:"'Syne',sans-serif", marginTop:4 }}>Commencer →</div>
        </div>
      )
    },
    { n:2, title:'Ajoutez vos produits', desc:'Nom, prix, photos, stocks. L\'IA apprend votre catalogue.',
      visual:(
        <div style={{ background:T.surface2, borderRadius:10, padding:14 }}>
          {[['👗','Robe Bleue','89 TND'],['👜','Sac Cuir','78 TND'],['👡','Sandales','62 TND']].map(([e,n,p],i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:T.surface, borderRadius:8, padding:'7px 10px', marginBottom:6, border:`1px solid ${T.border}` }}>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}><span style={{ fontSize:14 }}>{e}</span><span style={{ fontSize:11 }}>{n}</span></div>
              <span style={{ fontSize:11, color:T.accent, fontWeight:700 }}>{p}</span>
            </div>
          ))}
          <div style={{ border:`1px dashed rgba(0,229,160,.3)`, background:'rgba(0,229,160,.04)', color:T.accent, borderRadius:8, padding:7, fontSize:11, textAlign:'center', cursor:'pointer' }}>+ Ajouter un produit</div>
        </div>
      )
    },
    { n:3, title:'Partagez votre lien', desc:'Un lien unique généré. Mettez-le dans votre bio ou vos DMs.',
      visual:(
        <div style={{ background:T.surface2, borderRadius:10, padding:14 }}>
          <div style={{ background:T.surface, border:'1px solid rgba(0,229,160,.25)', borderRadius:8, padding:'8px 10px', fontSize:11, color:T.accent, marginBottom:10, display:'flex', justifyContent:'space-between' }}>
            <span>speedy.tn/<strong>boutique-lina</strong></span><span style={{ color:T.muted }}>📋</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {[['📘','Facebook'],['📸','Instagram'],['💬','WhatsApp']].map(([i,l],k)=>(
              <div key={k} style={{ flex:1, background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:'8px 4px', textAlign:'center' }}>
                <div style={{ fontSize:16 }}>{i}</div><div style={{ fontSize:9, color:T.muted, marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    { n:4, title:'Recevez vos commandes', desc:'Notification instantanée. Gérez tout depuis votre dashboard.',
      visual:(
        <div style={{ background:T.surface2, borderRadius:10, padding:14 }}>
          {[['#SPD-0847','Fatma B.','167 TND','2 min'],['#SPD-0846','Amira K.','89 TND','18 min'],['#SPD-0845','Sana M.','62 TND','1h']].map(([id,name,total,time],i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:i<2?`1px solid ${T.border}`:'none' }}>
              <div><div style={{ fontSize:11, fontWeight:600, color:T.accent }}>{id}</div><div style={{ fontSize:10, color:T.muted }}>{name} · il y a {time}</div></div>
              <div style={{ textAlign:'right' }}><div style={{ fontSize:12, fontWeight:700 }}>{total}</div><div style={{ fontSize:10, color:'#22c55e' }}>✓ Confirmé</div></div>
            </div>
          ))}
        </div>
      )
    },
  ];
  return (
    <section style={{ padding:'80px 0 120px', position:'relative', zIndex:1 }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>
        <FadeIn><div style={{ fontSize:12, fontWeight:600, letterSpacing:2, textTransform:'uppercase', color:T.accent, marginBottom:16 }}>Comment ça marche</div></FadeIn>
        <FadeIn delay={.1}><h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(32px,4vw,48px)', letterSpacing:-1.5, marginBottom:16, lineHeight:1.1 }}>Opérationnel en<br />10 minutes.</h2></FadeIn>
        <FadeIn delay={.2}><p style={{ color:T.muted, fontSize:18, marginBottom:64 }}>Pas de code, pas de technique. Juste votre boutique, automatisée.</p></FadeIn>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:24 }}>
          {steps.map((step,i)=>(
            <FadeIn key={i} delay={i*.1}>
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden' }}>
                <div style={{ background:T.surface2, padding:'14px 18px', display:'flex', alignItems:'center', gap:12, borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#00e5a0,#0099ff)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:'#080c10', flexShrink:0 }}>{step.n}</div>
                  <div><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14 }}>{step.title}</div><div style={{ fontSize:11, color:T.muted }}>{step.desc}</div></div>
                </div>
                <div style={{ padding:14 }}>{step.visual}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── MAIN ── */
export default function SpeedyLanding() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div style={{ background:T.bg, minHeight:'100vh', position:'relative' }}>
      <div style={{ position:'fixed', width:600, height:600, borderRadius:'50%', filter:'blur(120px)', pointerEvents:'none', zIndex:0, background:'radial-gradient(circle,rgba(0,229,160,.12),transparent 70%)', top:-200, left:-200, animation:'drift1 12s ease-in-out infinite' }} />
      <div style={{ position:'fixed', width:500, height:500, borderRadius:'50%', filter:'blur(120px)', pointerEvents:'none', zIndex:0, background:'radial-gradient(circle,rgba(0,153,255,.1),transparent 70%)', bottom:-100, right:-100, animation:'drift2 15s ease-in-out infinite' }} />
      <Nav />

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'120px 0 80px', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', width:'100%' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:80, alignItems:'center' }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(0,229,160,.08)', border:'1px solid rgba(0,229,160,.15)', borderRadius:100, padding:'6px 16px', fontSize:13, color:T.accent, fontWeight:500, marginBottom:28, animation:'fadeUp .6s ease both' }}>
                <span style={{ width:6, height:6, background:T.accent, borderRadius:'50%', animation:'pulse 2s ease infinite' }} />Bientôt disponible en Tunisie
              </div>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(38px,5vw,62px)', fontWeight:800, lineHeight:1.08, letterSpacing:-2, marginBottom:24, animation:'fadeUp .6s .1s ease both' }}>
                Votre assistant<br />de vente<br /><span style={{ background:'linear-gradient(135deg,#00e5a0,#0099ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>24h/24.</span>
              </h1>
              <p style={{ color:T.muted, fontSize:18, lineHeight:1.7, marginBottom:40, animation:'fadeUp .6s .2s ease both' }}>Un chatbot IA qui prend les commandes, répond aux clients, et booste vos ventes — en darija, français et arabe — pendant que vous dormez.</p>
              <div style={{ animation:'fadeUp .6s .3s ease both' }}><EmailForm source="hero" /></div>
            </div>
            <div style={{ animation:'fadeUp .6s .2s ease both' }}><ChatDemo /></div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <div style={{ borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, padding:'30px 0', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', gap:32, flexWrap:'wrap', justifyContent:'center' }}>
          {[['🇹🇳','Conçu pour la Tunisie'],['💬','Darija · Français · العربية'],['📱','Facebook · Instagram · Web'],['🔒','Données sécurisées']].map(([icon,label],i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, color:T.muted, fontSize:14 }}>
              <span style={{ fontSize:18 }}>{icon}</span>{label}{i<3&&<span style={{ marginLeft:16, color:T.border }}>|</span>}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section style={{ padding:'120px 0 40px', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>
          <FadeIn><div style={{ fontSize:12, fontWeight:600, letterSpacing:2, textTransform:'uppercase', color:T.accent, marginBottom:16 }}>Fonctionnalités</div></FadeIn>
          <FadeIn delay={.1}><h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(32px,4vw,48px)', letterSpacing:-1.5, marginBottom:16, lineHeight:1.1 }}>Tout ce dont une boutique<br />a besoin, enfin réuni.</h2></FadeIn>
          <FadeIn delay={.2}><p style={{ color:T.muted, fontSize:18, maxWidth:560, marginBottom:80 }}>Speedy n'est pas juste un chatbot. C'est votre équipe de vente complète, automatisée.</p></FadeIn>
          <div style={{ display:'flex', flexDirection:'column', gap:100 }}>
            {FEATURES.map((f,i) => <FeatureSection key={i} feat={f} index={i} />)}
          </div>
        </div>
      </section>

      <StepsSection />

      {/* CTA */}
      <section id="cta-section" style={{ padding:'80px 0 120px', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ background:'linear-gradient(135deg,rgba(0,229,160,.06),rgba(0,153,255,.04))', border:'1px solid rgba(0,229,160,.15)', borderRadius:24, padding:'64px 48px', textAlign:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:'-50%', background:'radial-gradient(ellipse at center,rgba(0,229,160,.06) 0%,transparent 70%)', pointerEvents:'none' }} />
            <FadeIn>
              <div style={{ fontSize:12, fontWeight:600, letterSpacing:2, textTransform:'uppercase', color:T.accent, marginBottom:16, position:'relative' }}>Accès anticipé gratuit</div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(28px,4vw,44px)', letterSpacing:-1.5, marginBottom:16, lineHeight:1.1, position:'relative' }}>Prêt à vendre<br />pendant que vous dormez ?</h2>
              <p style={{ color:T.muted, fontSize:18, marginBottom:40, position:'relative' }}>Rejoignez les premières boutiques tunisiennes à utiliser Speedy.<br />Les 100 premiers inscrits obtiennent 3 mois gratuits.</p>
              <div style={{ maxWidth:460, margin:'0 auto', position:'relative' }}><EmailForm source="cta" align="center" /></div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${T.border}`, padding:'32px 0', color:T.muted, fontSize:13, position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20 }}>Speedy<span style={{ color:T.accent }}>.</span></div>
          <div>Fait avec ❤️ en Tunisie · 2024</div>
          <div style={{ fontSize:12 }}>Vos données sont protégées et ne seront jamais partagées.</div>
        </div>
      </footer>
    </div>
  );
}