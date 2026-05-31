
// ── DATA ──
const ROUTES_DATA=[
  {id:'B12',nm:'B12 — Miraflores ↔ Centro Lima',col:'#1A4E8C',out:'#0d3a72',
   coords:[[-12.1185,-77.0283],[-12.0983,-77.0356],[-12.0876,-77.0388],[-12.0521,-77.0352],[-12.0464,-77.0297]],
   stops:[{lat:-12.1185,lng:-77.0283,nm:'Paradero Larco'},{lat:-12.0983,lng:-77.0356,nm:'Paradero San Isidro'},{lat:-12.0876,lng:-77.0388,nm:'Paradero Javier Prado'},{lat:-12.0521,lng:-77.0352,nm:'Paradero Wilson'},{lat:-12.0464,lng:-77.0297,nm:'Paradero Plaza Mayor'}]},
  {id:'C45',nm:'C45 — Callao ↔ San Isidro',col:'#2BB673',out:'#1a8050',
   coords:[[-12.0564,-77.1197],[-12.0487,-77.0756],[-12.0464,-77.0428],[-12.0983,-77.0366]],
   stops:[{lat:-12.0564,lng:-77.1197,nm:'Terminal Callao'},{lat:-12.0464,lng:-77.0428,nm:'Paradero Brasil'},{lat:-12.0983,lng:-77.0366,nm:'Paradero San Isidro'}]},
  {id:'A07',nm:'A07 — SJL ↔ Ate Vitarte',col:'#F5A623',out:'#b87a10',
   coords:[[-12.0089,-77.0023],[-12.0464,-77.0297],[-12.0834,-76.9756]],
   stops:[{lat:-12.0089,lng:-77.0023,nm:'Terminal SJL'},{lat:-12.0464,lng:-77.0297,nm:'Paradero Lima Centro'},{lat:-12.0834,lng:-76.9756,nm:'Terminal Ate'}]},
  {id:'MET',nm:'Metropolitano — Naranjal ↔ Benavides',col:'#9333ea',out:'#6b21a8',
   coords:[[-11.9798,-77.0423],[-12.0364,-77.0356],[-12.0712,-77.0298],[-12.1267,-77.0298]],
   stops:[{lat:-11.9798,lng:-77.0423,nm:'Est. Naranjal'},{lat:-12.0364,lng:-77.0356,nm:'Est. Quilca'},{lat:-12.0712,lng:-77.0298,nm:'Est. Canadá'},{lat:-12.1267,lng:-77.0298,nm:'Est. Benavides'}]}
];

async function osrmRoute(coords,alts=false){
  if(coords.length<2)return null;
  const str=coords.map(c=>`${c[1]},${c[0]}`).join(';');
  const url=`https://router.project-osrm.org/route/v1/driving/${str}?overview=full&geometries=geojson${alts?'&alternatives=true':''}`;
  try{
    const res=await fetch(url);
    const data=await res.json();
    if(data.code!=='Ok')return null;
    return data.routes.map(r=>({
      coords:r.geometry.coordinates.map(c=>[c[1],c[0]]),
      dist:(r.distance/1000).toFixed(1),
      dur:Math.ceil(r.duration/60)
    }));
  }catch(e){return null;}
}

const NOTIFS_DATA=[
  {ic:'🚌',t:'Bus B12 llega en 2 min',b:'Paradero Arequipa cdra. 42',ago:'Hace 1 min',c:'var(--p)'},
  {ic:'⚠️',t:'Tráfico moderado en tu ruta',b:'Av. Javier Prado — +8 min de retraso',ago:'Hace 5 min',c:'var(--y)'},
  {ic:'🔴',t:'Semáforo averiado',b:'La Marina & Brasil — evita la zona',ago:'Hace 18 min',c:'var(--r)'},
  {ic:'✅',t:'Tu reporte fue recibido',b:'REC-312 · La ATU está atendiendo el incidente',ago:'Hace 1 h',c:'var(--g)'},
  {ic:'💳',t:'Saldo bajo en tu tarjeta',b:'TIT: S/ 12.50 — ¿Recargar ahora?',ago:'Hace 2 h',c:'var(--y)'},
];

// ── STATE ──
let mode='passenger', selAmt_='10', balance=12.50;
let eta1=120, eta2=480; // seconds
let obIdx=0, map, busMs=[], routeLayers=[], showLayers=true;

// ── CLOCK ──
(function ck(){
  const d=new Date(),h=String(d.getHours()).padStart(2,'0'),m=String(d.getMinutes()).padStart(2,'0');
  const e=document.getElementById('sc');if(e)e.textContent=h+':'+m;
  setTimeout(ck,15000);
})();
document.getElementById('chatDate').textContent=new Date().toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long'});

// ── SPLASH ──
window.addEventListener('load',()=>{
  launch('passenger');
});

// ── ONBOARDING ──
let obIn=false;
document.getElementById('obn').addEventListener('click',()=>{
  if(obIn)return; obIn=true;
  if(obIdx<2){
    document.getElementById('ob'+obIdx).classList.remove('act');
    document.getElementById('ob'+obIdx).classList.add('out');
    document.getElementById('d'+obIdx).classList.remove('act');
    obIdx++;
    setTimeout(()=>{
      document.getElementById('ob'+(obIdx-1)).style.display='none';
      document.getElementById('ob'+obIdx).classList.add('act');
      document.getElementById('d'+obIdx).classList.add('act');
      obIn=false;
    },180);
    if(obIdx===2) document.getElementById('obn').textContent='¡Empezar!';
  } else showRS();
});
document.getElementById('obs').addEventListener('click',showRS);
function showRS(){document.getElementById('onboard').style.display='none';document.getElementById('rolesel').style.display='flex';}

function launch(role){
  mode=role;
  if(document.getElementById('rolesel')) document.getElementById('rolesel').style.display='none';
  if(document.getElementById('app')) document.getElementById('app').style.display='flex';
  if(role==='driver'){setMode('driver');} else {setMode('passenger');}
  initMap();
  startETA();
  startDriverSim();
  renderNotifs();
  setTimeout(()=>toast('📍 Ubicación detectada — San Isidro','g'),1200);
  if(role==='driver') setTimeout(()=>toast('⚠️ Desvío activo: Av. Arequipa desde cdra. 42','y'),3500);
}

// ── MAP ──
function initMap(){
  map=L.map('map',{zoomControl:false,attributionControl:false}).setView([-12.0720,-77.0400],13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);

  Promise.all(ROUTES_DATA.map(async r=>{
    const shadow=L.polyline(r.coords,{color:r.out,weight:8,opacity:.35,lineJoin:'round',lineCap:'round'}).addTo(map);
    const line=L.polyline(r.coords,{color:r.col,weight:4.5,opacity:.92,lineJoin:'round',lineCap:'round'}).bindPopup(`<b style="color:${r.col}">${r.id}</b><br>${r.nm}`).addTo(map);

    // Fetch precise street routing from OSRM
    const res = await osrmRoute(r.coords, false);
    if(res && res[0]){
      line.setLatLngs(res[0].coords);
      shadow.setLatLngs(res[0].coords);
      r.coords = res[0].coords; // Update base array to dense array for buses to follow
    }

    const stopsGroup = L.layerGroup().addTo(map);
    r.stops.forEach(s=>{
      const ic=L.divIcon({className:'smooth-marker',html:`<div style="width:10px;height:10px;border-radius:50%;background:#fff;border:2.5px solid ${r.col};box-shadow:0 1px 4px rgba(0,0,0,.2)"></div>`,iconSize:[10,10],iconAnchor:[5,5]});
      L.marker([s.lat,s.lng],{icon:ic}).bindPopup(`<b>${s.nm}</b><br><span style="color:${r.col};font-size:11px;font-weight:700">${r.id}</span>`).addTo(stopsGroup);
    });
    routeLayers.push({shadow,line,r,stopsGroup});
  })).then(() => {
    // Animated buses initialized AFTER routes become dense
    const bInits=[
      {ri:0,pct:0.2},{ri:0,pct:0.7},{ri:1,pct:0.4},{ri:2,pct:0.3},{ri:3,pct:0.1},{ri:3,pct:0.8}
    ];
    bInits.forEach(b=>{
      const r=ROUTES_DATA[b.ri];
      const pi=Math.floor(r.coords.length * b.pct);
      const pos=r.coords[pi];
      const ic=L.divIcon({className:'smooth-marker',html:`<div style="background:${r.col};color:#fff;border-radius:6px;padding:3px 7px;font-size:9px;font-weight:800;border:2px solid rgba(255,255,255,.5);box-shadow:0 3px 10px rgba(0,0,0,.28);white-space:nowrap;line-height:1.2">${r.id}</div>`,iconSize:[36,18],iconAnchor:[18,9]});
      busMs.push({m:L.marker(pos,{icon:ic,zIndexOffset:500}).addTo(map),ri:b.ri,pi:pi,dir:1});
    });

    setInterval(()=>{
      busMs.forEach(b=>{
        const coords=ROUTES_DATA[b.ri].coords;
        b.pi+=b.dir;
        if(b.pi>=coords.length-1){b.pi=coords.length-1; b.dir=-1;}
        if(b.pi<=0){b.pi=0; b.dir=1;}
        b.m.setLatLng(coords[b.pi]);
      });
    }, 120); // Faster interval for dense points
  });

  // User marker
  const uIc=L.divIcon({className:'smooth-marker',html:`<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#0052A3,#0066CC);border:4px solid #fff;box-shadow:0 0 0 6px rgba(0,82,163,.12),0 4px 14px rgba(0,82,163,.35);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#FFD700;animation:pulse-user 2s ease-in-out infinite">👤</div><style>@keyframes pulse-user{0%,100%{box-shadow:0 0 0 6px rgba(0,82,163,.12),0 4px 14px rgba(0,82,163,.35)}50%{box-shadow:0 0 0 10px rgba(0,82,163,.2),0 4px 18px rgba(0,82,163,.45)}}</style>`,iconSize:[48,48],iconAnchor:[24,24]});
  L.marker([-12.0983,-77.0366],{icon:uIc,zIndexOffset:1000}).bindPopup('<b style="color:#0052A3">Tu ubicación</b><br><span style="font-size:12px">San Isidro, Lima</span>').addTo(map);

  // Incident markers
  [{lat:-12.0876,lng:-77.0283,t:'⚠️ Accidente — carril bloqueado'},{lat:-12.0634,lng:-77.0856,t:'🔴 Semáforo averiado'}].forEach(i=>{
    const ic=L.divIcon({className:'smooth-marker',html:'<div style="background:rgba(230,57,70,.12);border:2px solid #E63946;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 8px rgba(230,57,70,.35)">⚠️</div>',iconSize:[24,24],iconAnchor:[12,12]});
    L.marker([i.lat,i.lng],{icon:ic}).bindPopup(i.t).addTo(map);
  });


}

function locateMe(){
  if(map) map.setView([-12.0983,-77.0366],15,{animate:true,duration:.8});
  toast('Centrando en tu ubicación','g');
}

function toggleLayers(){
  showLayers=!showLayers;
  if(showLayers) selRoute('ALL');
  else {
    routeLayers.forEach(({shadow,line,stopsGroup})=>{
      shadow.remove();line.remove();stopsGroup.remove();
    });
  }
  if(document.getElementById('rlegend')) document.getElementById('rlegend').style.opacity=showLayers?'1':'0.3';
  toast(showLayers?'Rutas visibles':'Rutas ocultas','y');
}

// ── ETA COUNTDOWN ──
function startETA(){
  setInterval(()=>{
    eta1=Math.max(30,eta1-1+(Math.random()>.8?2:0));
    eta2=Math.max(eta1+180,eta2-1+(Math.random()>.7?3:0));
    if(eta1>360)eta1=40+Math.floor(Math.random()*60);
    if(eta2>720)eta2=eta1+240+Math.floor(Math.random()*120);
    const m1=Math.floor(eta1/60),s1=eta1%60;
    const el=document.getElementById('etaMain');
    if(el) el.innerHTML=m1+(s1>0?`<span style="font-size:13px;color:var(--p)">:${String(s1).padStart(2,'0')}</span>`:'')+'<sub> min</sub>';
    const bar=document.getElementById('etaBar');
    if(bar) bar.style.width=Math.max(5,100-eta1/3.6)+'%';
    const u1=document.getElementById('u1');
    if(u1) u1.innerHTML=Math.floor(eta2/60)+'<span style="font-size:9px;color:var(--t3)"> min</span>';
    const de=document.getElementById('detETA');
    if(de) de.textContent=m1+' min';
  },1000);
}

// ── DRIVER SIM ──
function startDriverSim(){
  if(mode!=='driver')return;
  setInterval(()=>{
    const spd=Math.floor(10+Math.random()*50);
    const sv=document.getElementById('spdV');
    const sb=document.getElementById('spdB');
    if(sv)sv.textContent=spd+' km/h';
    if(sb){
      const pct=spd/80*100;
      sb.style.width=pct+'%';
      sb.style.background=spd>60?'var(--r)':spd>35?'var(--y)':'var(--g)';
    }
  },2500);
}

// ── MODE SWITCH ──
function setMode(m){
  mode=m;
  if(document.getElementById('mP')) document.getElementById('mP').classList.toggle('on',m==='passenger');
  if(document.getElementById('mD')) document.getElementById('mD').classList.toggle('on',m==='driver');
  if(document.getElementById('dvBar')) document.getElementById('dvBar').style.display=m==='driver'?'flex':'none';
  if(document.getElementById('bsPass')) document.getElementById('bsPass').style.display=m==='passenger'?'block':'none';
  if(document.getElementById('bsDrv')) document.getElementById('bsDrv').style.display=m==='driver'?'flex':'none';
  if(m==='driver'){
    if(document.getElementById('grn')) document.getElementById('grn').textContent='Conductor · MT-2347';
    if(document.getElementById('grs')) document.getElementById('grs').textContent='Ruta C45 · En servicio';
    if(document.getElementById('avEl')) document.getElementById('avEl').textContent='DR';
    if(document.getElementById('pfAv')) document.getElementById('pfAv').textContent='DR';
    if(document.getElementById('pfNm')) document.getElementById('pfNm').textContent='Carlos Mendoza';
    startDriverSim();
  } else {
    if(document.getElementById('grn')) document.getElementById('grn').textContent='Buenos días, Luis';
    if(document.getElementById('grs')) document.getElementById('grs').textContent='Lima · Clima 22°C ☀️';
    if(document.getElementById('avEl')) document.getElementById('avEl').textContent='LR';
    if(document.getElementById('pfAv')) document.getElementById('pfAv').textContent='LR';
    if(document.getElementById('pfNm')) document.getElementById('pfNm').textContent='Luis Rodríguez';
  }
}

// ── NAVIGATION ──
function ntab(i){
  document.querySelectorAll('.nt').forEach((t,j)=>t.classList.toggle('on',j===i));
  document.getElementById('ni').style.left=(i*20)+'%';
}
function ca(){document.querySelectorAll('.panel').forEach(p=>p.classList.remove('open'));}
function op(id){document.getElementById(id).classList.add('open');}
function cl(id){document.getElementById(id).classList.remove('open');}
function closeMod(id){document.getElementById(id).classList.remove('open');}

// ── ROUTE SELECT ──
function selRoute(id){
  cl('searchP');ntab(0);
  if(document.getElementById('srchLbl')) {
    document.getElementById('srchLbl').textContent = id === 'ALL' ? '¿A dónde vas?' : 'Ruta aislada: '+id;
    document.getElementById('srchLbl').style.color = id === 'ALL' ? 'var(--t3)' : 'var(--p)';
  }
  if(map){
    routeLayers.forEach(({shadow,line,r,stopsGroup})=>{
      if(id==='ALL' || r.id===id){
        if(!map.hasLayer(shadow)) shadow.addTo(map);
        if(!map.hasLayer(line)) line.addTo(map);
        if(!map.hasLayer(stopsGroup)) stopsGroup.addTo(map);
        line.setStyle({opacity: 0.92, weight: id==='ALL'?4.5:6});
      } else {
        if(map.hasLayer(shadow)) shadow.remove();
        if(map.hasLayer(line)) line.remove();
        if(map.hasLayer(stopsGroup)) stopsGroup.remove();
      }
    });
    if(id!=='ALL'){
      const r=ROUTES_DATA.find(x=>x.id===id);
      if(r) map.fitBounds(L.polyline(r.coords).getBounds(),{padding:[20,20],animate:true,duration:.8});
    } else {
      map.setView([-12.0720,-77.0400],13,{animate:true,duration:.8});
    }
  }
  toast(id==='ALL'?'Todas las rutas visibles':'Ruta '+id+' aislada en el mapa','g');
}
function setDst(d){document.getElementById('destI').value=d;toast('Buscando rutas hacia '+d+'...','y');}



// ── CHAT ──
const BOTS={
  get bus(){return `El <b>Bus B12</b> llega en <b>${Math.floor(eta1/60)} minutos</b> al Paradero Arequipa. 🚌\n\n<b>Próximos en tu paradero:</b>\n• B12 → ${Math.floor(eta1/60)} min · Baja ocupación ✅\n• C45 → ${Math.floor(eta2/60)} min · Media ocupación ⚠️\n• A07 → 19 min · Baja ocupación ✅`;},
  mir:`Para ir a <b>Miraflores</b> desde San Isidro:\n\n⚡ <b>Más rápido — 22 min</b>\nMetropolitano Est. Javier Prado → Paradero Larco · S/ 2.50\n\n💰 <b>Más barato — 35 min</b>\nBus C45 directo (tráfico moderado) · S/ 1.50\n\n¿Cuál prefieres?`,
  traf:`🚦 <b>Estado del tráfico ahora:</b>\n\n🔴 Crítico: Javier Prado Km 8 — accidente\n🟡 Moderado: Av. Arequipa cdra 42–50\n🟡 Moderado: La Marina & Brasil\n✅ Normal: Metro L1 · Universitaria\n\nTu ruta B12 tiene <b>+8 min de demora</b>.`,
  rec:`💳 <b>Recargar Tarjeta TIT:</b>\n\nVe a <b>Perfil → Recargar</b> o toca abajo:\n• Yape o Plin — instantáneo\n• Tarjeta bancaria — Visa/Mastercard\n• Agente físico — 24 cerca de ti\n\nTu saldo actual: <b>S/ 12.50</b>`,
  metro:`🟣 <b>Estado del Metropolitano:</b>\n\nFrecuencia actual: cada 6 min\nOcupación: Alta en Est. España y Naranjal\n\n⚠️ Demora en sentido Sur por mantenimiento en Est. Benavides (~12 min extra).`,
  def:`Entendido. 🤖 Consultando la red en tiempo real...\n\n<b>Resumen del sistema:</b>\n• 1,247 buses activos\n• Nivel de servicio: 87%\n• 5 alertas activas\n\n¿Necesitas información sobre una ruta específica?`
};
function getBot(m){
  const t=m.toLowerCase();
  if(t.includes('bus')||t.includes('llega')||t.includes('próximo')) return BOTS.bus;
  if(t.includes('miraflores')||t.includes('cómo llego')||t.includes('ruta')) return BOTS.mir;
  if(t.includes('tráfico')||t.includes('trafico')||t.includes('demoran')) return BOTS.traf;
  if(t.includes('recarg')||t.includes('tarjeta')||t.includes('saldo')) return BOTS.rec;
  if(t.includes('metro')||t.includes('metropolitano')) return BOTS.metro;
  return BOTS.def;
}
function addMsg(who,txt){
  const b=document.getElementById('chatB');
  const d=document.createElement('div');
  d.className='mb '+who;
  const t=new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'});
  d.innerHTML=txt.replace(/\n/g,'<br>')+'<div class="mt">'+t+'</div>';
  b.appendChild(d); b.scrollTo({top: b.scrollHeight, behavior: 'smooth'});
}
function showTyping(){
  const b=document.getElementById('chatB');
  const d=document.createElement('div');
  d.id='typing';d.className='mb b';
  d.innerHTML='<div class="dot-anim"><span></span><span></span><span></span></div>';
  b.appendChild(d); b.scrollTo({top: b.scrollHeight, behavior: 'smooth'});
}
function hideTyping(){const t=document.getElementById('typing');if(t)t.remove();}
function sc(msg){op('chatP');setTimeout(()=>{addMsg('u',msg);showTyping();setTimeout(()=>{hideTyping();addMsg('b',getBot(msg));},900);},120);}
function sendChat(){
  const i=document.getElementById('chatI');
  const m=i.value.trim();if(!m)return;
  i.value='';addMsg('u',m);showTyping();
  setTimeout(()=>{hideTyping();addMsg('b',getBot(m));},900);
}



// ── PERSISTENCE ──
window.addEventListener('DOMContentLoaded', () => {
  // Load Theme
  if(localStorage.getItem('sf_theme') === 'dark') {
    document.body.classList.add('dark-mode');
    const tv = document.getElementById('themeVal');
    if(tv) tv.textContent = 'Oscuro';
  }
  // Load Balance
  const savedBal = localStorage.getItem('sf_balance');
  if(savedBal) {
    balance = parseFloat(savedBal);
    const els=[document.getElementById('balDisp'),document.getElementById('balTIT')];
    els.forEach(e=>{if(e)e.textContent='S/ '+balance.toFixed(2);});
  }
});

function toggleDarkMode(el){
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('sf_theme', isDark ? 'dark' : 'light');
  document.getElementById('themeVal').textContent = isDark ? 'Oscuro' : 'Claro';
  toast(isDark ? 'Modo Oscuro Activado 🌙' : 'Modo Claro Activado ☀️', 'g');
}


// ── CUSTOM AMOUNT RECHARGE ──

// ── RECHARGE ──
function selAmt(el,v){document.querySelectorAll('.amt-b').forEach(b=>b.classList.remove('sel'));el.classList.add('sel');selAmt_=v;}
function doRecharge(){
  if(selAmt_==='otro'){
    let custom = prompt('Ingresa el monto a recargar (S/):', '10.00');
    if(!custom || isNaN(custom) || parseFloat(custom) <= 0) { toast('Monto inválido', 'r'); return; }
    selAmt_ = custom;
  }
  const a=parseFloat(selAmt_); balance+=a; localStorage.setItem('sf_balance', balance);
  const els=[document.getElementById('balDisp'),document.getElementById('balTIT')];
  els.forEach(e=>{if(e)e.textContent='S/ '+balance.toFixed(2);});
  cl('rechargeP');
  setTimeout(()=>toast('✅ Recarga de S/ '+a+' exitosa · Saldo: S/ '+balance.toFixed(2),'g'),200);
}

// ── NOTIFICATIONS ──
function renderNotifs(){
  document.getElementById('notifBody').innerHTML=NOTIFS_DATA.map(n=>`
    <div class="ni-item" onclick="cl('notifP')">
      <div class="ni-ic" style="background:${n.c}20">${n.ic}</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:700;color:var(--tx)">${n.t}</div>
        <div style="font-size:11px;color:var(--t2);margin-top:2px">${n.b}</div>
        <div style="font-size:9px;color:var(--t3);margin-top:3px">${n.ago}</div>
      </div>
    </div>`).join('');
}

// ── TOAST ──
function toast(msg,type='g'){
  const w=document.getElementById('toastStack');
  const t=document.createElement('div');
  t.className='toast';
  const c=type==='r'?'var(--r)':type==='y'?'var(--y)':'var(--g)';
  t.style.borderLeftColor=c;
  const ic=type==='r'?'🚨':type==='y'?'⚠️':'✅';
  t.innerHTML=`<span>${ic}</span><span style="font-size:11px;line-height:1.4">${msg}</span>`;
  w.appendChild(t);
  setTimeout(()=>t.style.cssText+=';opacity:0;transform:translateY(-8px);transition:.3s',3000);
  setTimeout(()=>t.remove(),3350);
}

// ── LIVE ALERTS ──
const LIVE=[
  {m:'Bus B12 se acerca a tu paradero',t:'g'},
  {m:'⚠️ Tráfico en tu ruta habitual — revisa opciones',t:'y'},
  {m:'Nuevo desvío activo: Av. Brasil cdra 12',t:'y'},
  {m:'🔴 Incidente reportado por 3 usuarios en Javier Prado',t:'r'},
  {m:'✅ Ruta C45 normalizada',t:'g'},
];
let li=0;
setInterval(()=>{if(document.getElementById('app').style.display==='flex'){const a=LIVE[li%LIVE.length];toast(a.m,a.t);li++;}},22000);
