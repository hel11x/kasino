/* codes.js: promo code entry. Codes multiply every payout (all games), can be re-used any time, and can be cancelled. */
(()=>{
const h=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7),PUB={SKILIFT:1.2,FONDUE:1.3,CHALET:1.5},SECRET=82619630;
const find=v=>{v=v.trim().toUpperCase();if(PUB[v])return{id:v,m:PUB[v]};if(h(v)==SECRET)return{id:'SECRET',m:5}};
const M=document.createElement('div');M.className='modal';M.innerHTML=`<div class="panel"><div class="mh"><h2>Promo codes</h2><button data-x aria-label="Close">✕</button></div><p class="cap">A code multiplies every payout in every game. Use codes as often as you like. One code is active at a time; entering a new one replaces it.</p><div class="row"><input id="pc-in" maxlength="20" placeholder="Enter code" autocomplete="off" style="text-transform:uppercase"><button class="gold" id="pc-go">Redeem</button></div><div id="pc-st" class="msg"></div><h3>Public codes</h3><table class="loans" id="pc-pub"></table></div>`;document.body.appendChild(M);
const on=(c,t)=>{G.code=c?{id:c.id,m:c.m}:undefined;if(!c)delete G.code;save();hud();draw();toast(t,c?'good':undefined)};
function draw(){const c=G.code;$('pc-st').innerHTML=c?`Active: ${c.id=='SECRET'?'secret code':c.id} · ×${c.m} payouts <button id="pc-off">Cancel code</button>`:'No code active.';
  $('pc-pub').innerHTML=Object.entries(PUB).map(([k,m])=>`<tr><td><b>${k}</b></td><td>×${m}</td><td><button data-c="${k}">Use</button></td></tr>`).join('');if(c)$('pc-off').onclick=()=>on(null,'Code cancelled.')}
const go=v=>{const r=find(v);if(!r)return toast('That code is not valid.','warn');on(r,`Code active: ×${r.m} on every payout`);$('pc-in').value=''};
M.onclick=e=>{if(e.target==M||e.target.closest('[data-x]'))M.classList.remove('open');const b=e.target.closest('[data-c]');if(b)go(b.dataset.c)};
$('pc-go').onclick=()=>go($('pc-in').value);$('pc-in').onkeydown=e=>{if(e.key=='Enter')go(e.target.value)};
$('opencode').onclick=()=>{draw();M.classList.add('open')};document.addEventListener('keydown',e=>{if(e.key=='Escape')M.classList.remove('open')});
})();
