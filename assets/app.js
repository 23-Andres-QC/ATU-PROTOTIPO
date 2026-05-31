// Simple app logic for prototype
document.addEventListener('DOMContentLoaded', ()=>{
  // Tabs
  document.querySelectorAll('.tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      btn.classList.add('active');
      openTab(btn.dataset.tab);
    });
  });
  function openTab(name){
    const el = document.getElementById('tabContent');
    if(!el) return;
    if(name==='chat'){
      document.getElementById('chatPanel').classList.remove('hidden');
      el.innerHTML = '<p>Chat abierto abajo.</p>';
    } else if(name==='recharge'){
      el.innerHTML = '<p>Métodos: Yape, Plin, tarjeta.</p>';
    } else if(name==='profile'){
      el.innerHTML = '<p>Perfil de usuario (mock).</p>';
    } else {
      el.innerHTML = '<p>Mapa con ruta activa (simulado).</p>';
    }
  }
  // Open default tab
  openTab('track');

  // Report modal
  const reportBtn = document.getElementById('reportBtn');
  const modal = document.getElementById('reportModal');
  const closeReport = document.getElementById('closeReport');
  const sendReport = document.getElementById('sendReport');
  if(reportBtn) reportBtn.addEventListener('click', ()=> modal.classList.add('show'));
  if(closeReport) closeReport.addEventListener('click', ()=> modal.classList.remove('show'));
  if(sendReport){
    sendReport.addEventListener('click', ()=>{
      const type = document.getElementById('reportType').value;
      const desc = document.getElementById('reportDesc').value;
      const reports = JSON.parse(localStorage.getItem('reports')||'[]');
      reports.unshift({type,desc,when:new Date().toLocaleString()});
      localStorage.setItem('reports', JSON.stringify(reports));
      modal.classList.remove('show');
      alert('Reporte enviado. Gracias.');
      renderReports();
    });
  }

  // Chat
  const sendChat = document.getElementById('sendChat');
  const chatBody = document.getElementById('chatBody');
  const chatInput = document.getElementById('chatInput');
  const closeChat = document.getElementById('closeChat');
  if(sendChat){
    sendChat.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', e=>{ if(e.key==='Enter') sendMessage(); });
  }
  if(closeChat) closeChat.addEventListener('click', ()=> document.getElementById('chatPanel').classList.add('hidden'));
  function sendMessage(){
    const txt = chatInput.value.trim(); if(!txt) return; appendChat('user',txt); chatInput.value='';
    setTimeout(()=>{ appendChat('bot','Simulación: respuesta sobre "'+txt+'" (demo).') },700);
  }
  function appendChat(who,txt){
    if(!chatBody) return;
    const d=document.createElement('div'); d.className=who;
    d.innerHTML = '<div class="msg">'+txt+'</div>';
    chatBody.appendChild(d);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Dashboard: render reports
  function renderReports(){
    const list = document.getElementById('reportsList'); if(!list) return;
    const reports = JSON.parse(localStorage.getItem('reports')||'[]');
    list.innerHTML = reports.slice(0,20).map(r=>`<li><strong>${r.type}</strong> — <span style="font-size:12px;color:#6b7280">${r.when}</span><div style="margin-top:6px;color:#374151">${(r.desc||'').slice(0,200)}</div></li>`).join('') || '<li>No hay reportes</li>';
  }
  renderReports();
});
