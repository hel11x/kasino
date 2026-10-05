/* logging.js: login gate + bet log / tracker (from the Royal Chips set), wired into the game's saved state */
(()=>{
const who=()=>localStorage.getItem('ap-session')||'',ak=n=>'ap-acct-'+n.toLowerCase(),pk=n=>'ap-prof-'+n.toLowerCase(),NAMES={roulette:'Roulette',blackjack:'Blackjack',slots:'Slots',horses:'Grand Prix',mines:'Mines',crash:'Crash',hilo:'Higher / Lower'};
async function hs(s,p){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s+p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){let h=5381;for(const c of s+p)h=(h*33^c.charCodeAt(0))>>>0;return'x'+h}}
const mk=h=>{const d=document.createElement('div');d.innerHTML=h.trim();return d.firstElementChild},jg=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
function enterA(n,st){st?localStorage.setItem('alpine-state',st):localStorage.removeItem('alpine-state');localStorage.setItem('ap-session',n);location.reload()}
/* ---- login gate ---- */
const crown='<svg viewBox="0 0 64 64" style="width:70px;margin:auto"><defs><linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3a8"/><stop offset=".5" stop-color="#d4af37"/><stop offset="1" stop-color="#8a6a12"/></linearGradient></defs><path d="M7 50L3 18l16 14 13-23 13 23 16-14-4 32z" fill="url(#gd)" stroke="#8a6a12" stroke-width="2"/><rect x="7" y="50" width="50" height="9" rx="2" fill="url(#gd)" stroke="#8a6a12" stroke-width="2"/><circle cx="3" cy="16" r="3.5" fill="#ff4d6d"/><circle cx="32" cy="7" r="4" fill="#4cc9f0"/><circle cx="61" cy="16" r="3.5" fill="#3ddc97"/></svg>';
function gate(){const g=mk(`<div class="modal open gate" id="gate"><div class="panel">${crown}<h2>Casino Alpine Pro</h2><small class="cap">Play with virtual chips. Start with 1,000 chips, free.</small><input id="gu" placeholder="Username" maxlength="12" autocomplete="username"><input id="gp" type="password" placeholder="Password" autocomplete="current-password"><div class="err" id="ge"></div><button class="gold" id="gi">Log in</button><button id="gr">Create account</button></div></div>`);document.body.appendChild(g);
const err=t=>$('ge').textContent=t,val=()=>[$('gu').value.trim(),$('gp').value];
$('gi').onclick=async()=>{const[n,p]=val(),a=jg(ak(n));if(!a||await hs(a.s,p)!=a.h)return err('Wrong username or password.');enterA(a.n,localStorage.getItem(pk(n)))};
$('gr').onclick=async()=>{const[n,p]=val();if(!/^[A-Za-z0-9_]{3,12}$/.test(n))return err('Username: 3-12 letters, numbers or _.');if(p.length<4)return err('Password needs 4+ characters.');if(jg(ak(n)))return err('That username is taken.');
  const s=Math.random().toString(36).slice(2);localStorage.setItem(ak(n),JSON.stringify({n,s,h:await hs(s,p)}));let snap=null;if(!localStorage.getItem('ap-claimed')){snap=localStorage.getItem('alpine-state');localStorage.setItem('ap-claimed','1')}localStorage.setItem(pk(n),snap||'');enterA(n,snap)};
$('gp').onkeydown=e=>{if(e.key=='Enter')$('gi').click()}}
if(!who())gate();
/* ---- bet log ---- */
const L=()=>G.lg||(G.lg={hist:[bal],log:[],bets:0,wins:0,wag:0,won:0,big:0,gm:{}});L();
let acc={wag:0,won:0};const _sb=setBal;setBal=function(d){d<0?acc.wag-=d:acc.won+=d;_sb(d)};
const _tk=tick;tick=function(){const sec=document.querySelector('main section.on'),w=acc.wag,o=acc.won;acc={wag:0,won:0};
  if(w||o){const l=L(),g=sec?sec.id:'game';l.bets++;l.wag+=w;l.won+=o;if(o>w)l.wins++;if(o-w>l.big)l.big=o-w;l.gm[g]=(l.gm[g]||0)+o-w;l.log.unshift([g,w,o]);l.log.length=Math.min(l.log.length,40);l.hist.push(bal);if(l.hist.length>80)l.hist.shift()}_tk()};
/* ---- tracker ---- */
const T=mk('<div class="modal" id="trk"><div class="panel"><div class="mh"><h2>Tracker</h2><button data-x aria-label="Close">✕</button></div><div id="trk-b"></div></div></div>');document.body.appendChild(T);
const sg=n=>(n>=0?'+':'−')+fmt(Math.abs(n)),cl=n=>n>=0?'pos':'neg';
function openT(){const l=L(),h=l.hist,mn=Math.min(...h),R=Math.max(...h)-mn||1,pts=h.map((v,i)=>`${(i*600/Math.max(h.length-1,1)).toFixed(1)},${(130-(v-mn)/R*120).toFixed(1)}`).join(' '),p=l.won-l.wag,
 st=[['Player',who()||'Guest'],['Chips',fmt(bal)],['Rounds logged',l.bets],['Wagered',fmt(l.wag)],['Returned',fmt(l.won)],['Net result',`<b class="${cl(p)}">${sg(p)}</b>`],['Biggest win',fmt(l.big)],['Win rate',(l.bets?Math.round(l.wins/l.bets*100):0)+' %']];
 $('trk-b').innerHTML=`<div class="stats">${st.map(([a,b])=>`<div class="stat"><span>${a}</span><b>${b}</b></div>`).join('')}</div><h3>Balance history</h3><div class="hg"><svg viewBox="0 0 600 140"><polyline points="${pts}"/></svg></div><h3>Profit by game</h3><table class="loans">${Object.entries(l.gm).map(([k,v])=>`<tr><td>${NAMES[k]||k}</td><td class="${cl(v)}">${sg(v)}</td></tr>`).join('')||'<tr><td class="empty">No rounds yet.</td></tr>'}</table><h3>Last 12 rounds</h3><table class="loans"><tr><th>Game</th><th>Staked</th><th>Returned</th></tr>${l.log.slice(0,12).map(([g,w,o])=>`<tr><td>${NAMES[g]||g}</td><td>${fmt(w)}</td><td class="${o>w?'pos':o<w?'neg':''}">${fmt(o)}</td></tr>`).join('')}</table>`;T.classList.add('open')}
T.onclick=e=>{if(e.target==T||e.target.closest('[data-x]'))T.classList.remove('open')};document.addEventListener('keydown',e=>{if(e.key=='Escape')T.classList.remove('open')});
document.querySelector('.avs').appendChild(mk('<div class="venue xv" data-v="track" tabindex="0" role="button"><b class="sign">Tracker</b><div class="art">📊</div><small>Bet log &amp; balance history</small></div>'));
const hook=e=>{if(!e.target.closest('[data-v="track"]'))return;if(e.type=='keydown'&&e.key!='Enter'&&e.key!=' ')return;e.preventDefault();e.stopImmediatePropagation();openT()};
['click','keydown'].forEach(t=>$('lobby').addEventListener(t,hook,true));
})();
