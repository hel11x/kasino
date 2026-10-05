/* Casino Alpine Pro - extras: Mines, Crash, Higher/Lower, Lucky Wheel, profiles, messages, trophies, passive income.
   Loaded after script.js; it reuses its globals (bal, G, setBal, tick, toast, ...). */
(()=>{
G.st=G.st||{};G.tr=G.tr||{};
const st=G.st,now=()=>Date.now(),mk=h=>{const d=document.createElement('div');d.innerHTML=h.trim();return d.firstElementChild};
const jget=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};

/* ---------- helpers: rooms and chip bars ---------- */
function room(id,title,html){const s=mk(`<section id="${id}"><h2>${title}</h2>${html}</section>`),b=mk('<button class="back">← Back to the casino floor</button>');
  b.onclick=()=>MAIN.classList.remove('open');s.prepend(b);MAIN.appendChild(s);ROOM[id]=1;return s}
function chipbar(id){[10,50,100,500].forEach(v=>{const c=document.createElement('button');c.className='chip'+(v==sel?' sel':'');c.dataset.v=v;c.textContent=v;
  c.onclick=()=>{sel=v;document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('sel',+x.dataset.v==v))};$(id).appendChild(c)})}
const broke='Not enough chips. Visit the bank.';

/* ---------- passive income (boutique items) ---------- */
SHOP.push({id:'cart',n:'Coffee Cart',e:'☕',p:600,d:'Earns 8 chips per minute',inc:8},{id:'suite',n:'Hotel Suite',e:'🏨',p:2500,d:'Earns 40 chips per minute',inc:40},
  {id:'share',n:'Slot Machine Share',e:'🎰',p:7000,d:'Earns 120 chips per minute',inc:120},{id:'stock',n:'Casino Shares',e:'📈',p:18000,d:'Earns 320 chips per minute',inc:320});
const rate=()=>SHOP.reduce((a,i)=>a+(i.inc&&has(i.id)?i.inc:0),0);
function pay(){const r=rate(),t=now();if(!r||!G.lastInc){G.lastInc=t;return}
  const m=Math.floor((t-G.lastInc)/6e4);if(m<1)return;G.lastInc=m>120?t:G.lastInc+m*6e4;   /* offline earnings capped at 2 hours */
  const a=Math.min(m,120)*r;bal+=a;log('Passive income',a);toast(`Passive income: +${fmt(a)} chips`,'good');render();save()}

/* ---------- trophies ---------- */
const TR=[['first','First Hand','Play your first round',150,()=>rounds>=1],['reg','Regular','Play 50 rounds',500,()=>rounds>=50],['vet','Veteran','Play 250 rounds',2000,()=>rounds>=250],
['big','Big Win','Win 1,000+ chips in one payout',300,()=>(st.big||0)>=1000],['jack','Jackpot','Win 10,000+ chips in one payout',1500,()=>(st.big||0)>=10000],
['clean','Debt Dodger','Fully repay a loan',300,()=>repaid>=1],['l5','Rising Star','Reach level 5',400,()=>G.lvl>=5],['l10','Casino Royale','Reach level 10',1500,()=>G.lvl>=10],
['shop','Shopaholic','Own 5 boutique items',500,()=>G.owned.length>=5],['land','Landlord','Own a passive-income item',300,()=>SHOP.some(i=>i.inc&&has(i.id))],
['rich','Five Figures','Hold 10,000 chips',700,()=>bal>=10000],['mine','Sweeper','Cash out with 5+ gems in Mines',400,()=>(st.gems||0)>=5],
['rocket','To the Moon','Cash out at 5× or more in Crash',600,()=>(st.crash||0)>=5],['hl','Card Counter','Win 5 Higher/Lower guesses in a row',500,()=>(st.hl||0)>=5],
['wheel','Lucky Spinner','Spin the free wheel 5 times',300,()=>(st.spins||0)>=5],['chat','Social Butterfly','Send a message',150,()=>(st.msgs||0)>=1]];
function check(){TR.forEach(([id,n,d,r,f])=>{if(G.tr[id]||!f())return;G.tr[id]=now();bal+=r;toast(`🏆 Trophy: ${n} (+${fmt(r)} chips)`,'good');render();save()})}
const _tick=tick;tick=function(){_tick();check()};
const _sb=setBal;setBal=function(d){if(d>(st.big||0))st.big=d;_sb(d)};

/* ---------- MINES ---------- */
const mm=(k,m)=>{let x=.97;for(let i=0;i<k;i++)x*=(25-i)/(25-m-i);return x};let M=null;
room('mines','Mines',`<p>Reveal gems, avoid mines. Every gem raises your multiplier. Cash out before you hit a mine.</p>
<div class="row"><label>Mines <select id="mn"><option>1</option><option selected>3</option><option>5</option><option>10</option></select></label><button class="gold" id="mstart">Start</button><button id="mcash" disabled>Cash out</button></div>
<div class="chips" id="mxchips"></div><div class="msg" id="mmsg">Pick a chip and press Start.</div><div class="mg" id="mg"></div>`);chipbar('mxchips');
function mdraw(rev){$('mg').innerHTML=Array.from({length:25},(_,i)=>{const o=M&&M.open.has(i),b=M&&rev&&M.m.has(i);return `<button data-i="${i}" class="${o?'gem':b?'bomb':''}" ${!M||!M.on||o?'disabled':''}>${o?'💎':b?'💣':''}</button>`}).join('')}
function minfo(){const k=M.open.size;$('mmsg').textContent=k?`${k} gem${k>1?'s':''} · ×${mm(k,M.n).toFixed(2)} · cash out ${fmt(M.bet*mm(k,M.n))} · next ×${mm(k+1,M.n).toFixed(2)}`:'Pick a tile.'}
function mend(cash){M.on=0;const k=M.open.size,x=mm(k,M.n);
  if(cash){const p=Math.round(M.bet*x);setBal(p);st.gems=Math.max(st.gems||0,k);$('mmsg').textContent=`Cashed out +${fmt(p)} chips (×${x.toFixed(2)}).`}else $('mmsg').textContent='Boom! You hit a mine. Bet lost.';
  mdraw(1);$('mstart').disabled=false;$('mcash').disabled=true;tick()}
$('mstart').onclick=()=>{if(M&&M.on)return;if(bal<sel)return $('mmsg').textContent=broke;const n=+$('mn').value,m=new Set();while(m.size<n)m.add(rnd(25));
  M={on:1,m,open:new Set(),bet:sel,n};setBal(-sel);$('mstart').disabled=true;$('mcash').disabled=true;mdraw();minfo()};
$('mg').onclick=e=>{const b=e.target.closest('button');if(!b||!M||!M.on)return;const i=+b.dataset.i;if(M.m.has(i))return mend(0);
  M.open.add(i);if(M.open.size==25-M.n)return mend(1);mdraw();$('mcash').disabled=false;minfo()};
$('mcash').onclick=()=>{if(M&&M.on&&M.open.size)mend(1)};mdraw();

/* ---------- CRASH ---------- */
let C=null;const chs=[];
function cdraw(m,bad){const k=$('cg'),g=k.getContext('2d'),W=k.width,H=k.height,t=Math.log(m)/.12,T=Math.max(8,t*1.15),Y=Math.max(2,m*1.2),P=(a,b)=>[44+a/T*(W-70),H-30-(b-1)/(Y-1)*(H-60)];g.clearRect(0,0,W,H);
 g.font='13px Outfit,sans-serif';g.fillStyle='#ffffff99';g.strokeStyle='#ffffff1c';g.lineWidth=1;
 for(let i=0;i<=5;i++){const v=1+(Y-1)*i/5,y=P(0,v)[1];g.beginPath();g.moveTo(44,y);g.lineTo(W-10,y);g.stroke();g.fillText(v.toFixed(1)+'×',4,y+4);const x=P(T*i/5,1)[0];g.beginPath();g.moveTo(x,10);g.lineTo(x,H-30);g.stroke();g.fillText((T*i/5).toFixed(0)+'s',x-8,H-10)}
 const c=bad?'#ff5a4a':'#ffd76a',pts=[];for(let i=0;i<=80;i++){const a=t*i/80;pts.push(P(a,Math.exp(.12*a)))}
 const e=pts[80],f=g.createLinearGradient(0,0,0,H);f.addColorStop(0,c+'66');f.addColorStop(1,c+'00');
 g.beginPath();g.moveTo(pts[0][0],H-30);pts.forEach(p=>g.lineTo(...p));g.lineTo(e[0],H-30);g.closePath();g.fillStyle=f;g.fill();
 g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.strokeStyle=c;g.lineWidth=4;g.shadowColor=c;g.shadowBlur=14;g.lineJoin='round';g.stroke();g.shadowBlur=0;
 const r=$('rk');r.style.left=(e[0]/W*100-3)+'%';r.style.bottom=((H-e[1])/H*100-4)+'%'}
room('crash','Crash',`<p>The multiplier keeps climbing. Cash out before it crashes. Set an auto cash-out if you like.</p>
<div class="sky"><canvas id="cg" width="720" height="300"></canvas><i class="rk" id="rk">🚀</i></div><div class="cx" id="cx">1.00×</div><div class="chips" id="cxchips"></div>
<div class="row"><label>Auto cash-out ×<input id="cauto" type="number" min="1.1" step="0.1" placeholder="off" style="width:90px"></label><button class="gold" id="cgo">Launch</button><button id="ccash" disabled>Cash out</button></div>
<div class="msg" id="cmsg">Place your bet and launch.</div><div class="chs" id="chist"></div>`);chipbar('cxchips');
function cend(cash){const c=C;C=null;$('cgo').disabled=false;$('ccash').disabled=true;chs.unshift(c.cp);cdraw(cash?c.m:c.cp,!cash);$('rk').textContent=cash?'🚀':'💥';chs.length=Math.min(chs.length,10);
  $('chist').innerHTML=chs.map(x=>`<span class="${x<2?'lo':'hi'}">${x.toFixed(2)}×</span>`).join('');
  if(cash){const p=Math.round(c.bet*c.m);setBal(p);st.crash=Math.max(st.crash||0,c.m);$('cx').textContent=c.m.toFixed(2)+'×';$('cmsg').textContent=`Cashed out at ×${c.m.toFixed(2)}: +${fmt(p)} chips. It crashed at ×${c.cp.toFixed(2)}.`}
  else{$('cx').textContent=c.cp.toFixed(2)+'×';$('cx').className='cx bust';$('cmsg').textContent=`Crashed at ×${c.cp.toFixed(2)}. Bet lost.`}tick()}
$('cgo').onclick=()=>{if(C)return;if(bal<sel)return $('cmsg').textContent=broke;
  const r=Math.random(),cp=Math.max(1,Math.min(500,Math.floor(97/(1-r))/100)),au=parseFloat($('cauto').value)||0,t0=performance.now();
  setBal(-sel);C={bet:sel,cp,m:1};$('cgo').disabled=true;$('ccash').disabled=false;$('cx').className='cx';$('cmsg').textContent='Lift off…';$('rk').textContent='🚀';cdraw(1);
  (function f(t){if(!C)return;C.m=Math.exp(.12*(t-t0)/1000);
    if(C.m>=cp)return cend(0);if(au>=1.01&&C.m>=au){C.m=au;return cend(1)}
    $('cx').textContent=C.m.toFixed(2)+'×';cdraw(C.m);requestAnimationFrame(f)})(t0)};
$('ccash').onclick=()=>{if(C)cend(1)};cdraw(1);

/* ---------- HIGHER / LOWER ---------- */
const RV='23456789TJQKA',rv=c=>RV.indexOf(c.r)+2,dr=()=>({r:RV[rnd(13)],s:'♠♥♦♣'[rnd(4)]});let H=null;
room('hilo','Higher or Lower',`<p>Will the next card be higher or lower? Ties lose. Chain correct guesses to grow your pot and cash out any time.</p>
<div class="hand" id="hlh"></div><div class="msg" id="hlmsg">Pick a chip and deal.</div><div class="chips" id="hlchips"></div>
<div class="row"><button class="gold" id="hldeal">Deal</button><button id="hlup" disabled>Higher</button><button id="hldn" disabled>Lower</button><button id="hlcash" disabled>Cash out</button></div>`);chipbar('hlchips');
const hp=()=>{const v=rv(H.c);return[(14-v)/13,(v-2)/13]};
function hupd(){const[p,q]=hp();$('hlh').innerHTML=cardEl(H.c);$('hldeal').disabled=!!H.on;
  $('hlup').textContent=p?`Higher ×${(.97/p).toFixed(2)}`:'Higher';$('hldn').textContent=q?`Lower ×${(.97/q).toFixed(2)}`:'Lower';
  $('hlup').disabled=!H.on||!p;$('hldn').disabled=!H.on||!q;$('hlcash').disabled=!H.on||H.k<1}
$('hldeal').onclick=()=>{if(H&&H.on)return;if(bal<sel)return $('hlmsg').textContent=broke;H={on:1,c:dr(),bet:sel,pot:sel,k:0};setBal(-sel);$('hlmsg').textContent='Higher or lower?';hupd()};
function hg(up){if(!H||!H.on)return;const[p,q]=hp(),mu=.97/(up?p:q),n=dr(),ok=up?rv(n)>rv(H.c):rv(n)<rv(H.c);H.c=n;
  if(ok){H.pot*=mu;H.k++;st.hl=Math.max(st.hl||0,H.k);$('hlmsg').textContent=`Correct! Pot: ${fmt(H.pot)} chips (streak ${H.k}).`}
  else{H.on=0;$('hlmsg').textContent='Wrong. Bet lost.';tick()}hupd()}
$('hlup').onclick=()=>hg(1);$('hldn').onclick=()=>hg(0);
$('hlcash').onclick=()=>{if(!H||!H.on||H.k<1)return;H.on=0;const p=Math.round(H.pot);setBal(p);$('hlmsg').textContent=`Cashed out +${fmt(p)} chips.`;hupd();tick()};

/* ---------- LUCKY WHEEL (free spin every 10 minutes) ---------- */
const WP=[[25,20],[50,22],[100,22],[150,14],[250,10],[500,7],[1000,3.5],[2500,1.5]];let wrot=0,wsp=0;
room('luckywheel','Lucky Wheel',`<p>One free spin every 10 minutes. No bet needed.</p><div class="wrap"><i class="wptr">▼</i>
<div class="wh" id="whl">${WP.map((p,i)=>`<span style="--a:${i*45+22.5}deg">${p[0]}</span>`).join('')}</div></div>
<div class="msg" id="wcd" style="text-align:center"></div><div class="row" style="justify-content:center"><button class="gold" id="wspin">Spin</button></div>`);
const wleft=()=>Math.max(0,6e5-(now()-(G.wheelAt||0)));
function wfin(){const p=G.wprize;if(!p)return;G.wprize=0;setBal(p);st.spins=(st.spins||0)+1;wsp=0;toast(`Lucky Wheel: +${fmt(p)} chips`,'good');save()}
$('wspin').onclick=()=>{if(wsp||wleft())return;let r=Math.random()*100,i=0;for(;i<WP.length-1;i++)if((r-=WP[i][1])<0)break;
  G.wheelAt=now();G.wprize=WP[i][0];save();wsp=1;$('wspin').disabled=true;
  const fin=(360-(i*45+22.5)+360)%360;wrot+=1800+((fin-wrot%360)+360)%360;$('whl').style.transform=`rotate(${wrot}deg)`;
  $('wcd').textContent='Spinning…';setTimeout(wfin,4700)};
if(G.wprize)wfin();

/* ---------- accounts, messages, profile ---------- */
const ak=n=>'ap-acct-'+n.toLowerCase(),pk=n=>'ap-prof-'+n.toLowerCase(),ik=n=>'ap-inbox-'+n.toLowerCase(),who=()=>localStorage.getItem('ap-session')||'';
const _si=Storage.prototype.setItem;   /* mirror every game save into the signed-in profile */
Storage.prototype.setItem=function(k,v){_si.call(this,k,v);if(k=='alpine-state'&&this===localStorage&&who())_si.call(this,pk(who()),v)};
async function hash(s,p){if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s+p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  let h=5381;for(const c of s+p)h=(h*33^c.charCodeAt(0))>>>0;return 'x'+h}
function enterAcct(n,state){if(state)_si.call(localStorage,'alpine-state',state);else localStorage.removeItem('alpine-state');localStorage.setItem('ap-session',n);location.reload()}
const putIn=(n,m)=>{const a=jget(ik(n),[]);a.unshift(m);a.length=Math.min(a.length,50);localStorage.setItem(ik(n),JSON.stringify(a))};
const unread=()=>who()?jget(ik(who()),[]).filter(m=>!m.r).length:0;
let mpeer=null;
function recv(m){putIn(who(),m);toast(`✉️ ${m.f}: ${m.t.slice(0,40)}`,'good')}
if(who()&&window.Peer)try{mpeer=new Peer('alpinepro-u-'+who().toLowerCase());mpeer.on('error',()=>{});
  mpeer.on('connection',c=>c.on('data',m=>{if(m&&m.t=='msg'&&typeof m.x=='string'&&typeof m.f=='string')recv({f:m.f.slice(0,12),t:m.x.slice(0,200),ts:now(),r:0})}))}catch(e){}
const perr=t=>{const e=$('perr');if(e)e.textContent=t};
const A={
  async login(){const n=$('pn').value.trim(),a=jget(ak(n),null);if(!a||await hash(a.s,$('pp').value)!=a.h)return perr('Wrong username or password.');enterAcct(a.n,localStorage.getItem(pk(n)))},
  async reg(){const n=$('pn').value.trim(),p=$('pp').value;if(!/^[A-Za-z0-9_]{3,12}$/.test(n))return perr('Username: 3-12 letters, numbers or _.');
    if(p.length<4)return perr('Password needs at least 4 characters.');if(jget(ak(n),null))return perr('That username is taken.');
    const s=Math.random().toString(36).slice(2);localStorage.setItem(ak(n),JSON.stringify({n,s,h:await hash(s,p)}));
    let snap=null;if(!localStorage.getItem('ap-claimed')){snap=localStorage.getItem('alpine-state');localStorage.setItem('ap-claimed','1')}   /* first account keeps guest progress */
    localStorage.setItem(pk(n),snap||'');enterAcct(n,snap)},
  out(){localStorage.setItem('ap-session','');localStorage.removeItem('alpine-state');location.reload()},
  reply(b){$('mto').value=b.dataset.f;$('mtx').focus()},
  send(){const to=$('mto').value.trim(),x=$('mtx').value.trim().slice(0,200);if(!to||!x)return toast('Enter a recipient and a message.','warn');
    if(to.toLowerCase()==who().toLowerCase())return toast('You cannot message yourself.','warn');
    const done=()=>{st.msgs=(st.msgs||0)+1;$('mtx').value='';save();check()};
    if(jget(ak(to),null)){putIn(to,{f:who(),t:x,ts:now(),r:0});toast('Message delivered to '+to,'good');return done()}
    if(!mpeer)return toast('Messaging to other devices needs an internet connection.','warn');
    const c=mpeer.connect('alpinepro-u-'+to.toLowerCase());let ok=0;
    c.on('open',()=>{ok=1;c.send({t:'msg',f:who(),x});toast('Message delivered to '+to,'good');done();setTimeout(()=>c.close(),600)});
    setTimeout(()=>{if(!ok)toast(to+' is not online right now.','warn')},5000)}};
const XM=mk('<div class="modal" id="xm" role="dialog" aria-modal="true"><div class="panel"><div class="mh"><h2 id="xm-t"></h2><button data-x aria-label="Close">✕</button></div><div id="xm-b"></div></div></div>');document.body.appendChild(XM);
let XK='';const xm=k=>{XK=k;xr();XM.classList.add('open')};
XM.onclick=e=>{if(e.target==XM||e.target.closest('[data-x]'))return XM.classList.remove('open');const b=e.target.closest('[data-a]');if(b)A[b.dataset.a](b)};
document.addEventListener('keydown',e=>{if(e.key=='Escape')XM.classList.remove('open')});
function xr(){const t=$('xm-t'),b=$('xm-b'),u=who(),form=`<div class="row"><input id="pn" placeholder="Username" maxlength="12" autocomplete="username"><input id="pp" type="password" placeholder="Password" autocomplete="current-password"></div><div class="row"><button class="gold" data-a="login">Log in</button><button data-a="reg">Create account</button></div><p class="cap" id="perr"></p>`;
  if(XK=='tro'){const n=TR.filter(x=>G.tr[x[0]]).length;t.textContent=`Trophies ${n} / ${TR.length}`;
    b.innerHTML='<div class="items">'+TR.map(([id,nm,d,r])=>{const ok=G.tr[id];return `<div class="item tro${ok?' got':''}"><span class="ie">${ok?'🏆':'🔒'}</span><h4>${nm}</h4><p>${d}</p><p>${ok?'Unlocked':'Reward: '+fmt(r)+' chips'}</p></div>`}).join('')+'</div>'}
  else if(XK=='msg'){t.textContent='Messages';if(!u){b.innerHTML='<p>Sign in to send and receive messages.</p>'+form;return}
    const L=jget(ik(u),[]);b.innerHTML=`<div class="row"><input id="mto" placeholder="To (username)" maxlength="12"><input id="mtx" placeholder="Message" maxlength="200" style="flex:1;min-width:150px"><button class="gold" data-a="send">Send</button></div>
<p class="cap">Delivered instantly to accounts on this device, or to a friend who is online right now. Offline friends on other devices cannot receive it.</p>
<ul class="msgs">${L.map(m=>`<li class="${m.r?'':'new'}"><b>${esc(m.f)}</b> <small>${new Date(m.ts).toLocaleString()}</small><p>${esc(m.t)}</p><button data-a="reply" data-f="${esc(m.f)}">Reply</button></li>`).join('')||'<li class="empty">No messages yet.</li>'}</ul>`;
    if(L.some(m=>!m.r)){L.forEach(m=>m.r=1);localStorage.setItem(ik(u),JSON.stringify(L))}}
  else{t.textContent='Profile';
    if(u)b.innerHTML=`<div class="stats">${[['Player',esc(u)],['Level',G.lvl],['Chips',fmt(bal)],['Rounds',rounds],['Trophies',Object.keys(G.tr).length+' / '+TR.length],['Passive income',fmt(rate())+' / min']].map(([a,c])=>`<div class="stat"><span>${a}</span><b>${c}</b></div>`).join('')}</div><div class="row"><button data-a="out">Log out</button></div><p class="cap">Your progress is saved to this profile in this browser.</p>`;
    else b.innerHTML=`<p>You are playing as a guest. Create an account to keep a named profile and receive messages. Accounts live in this browser only (no server), so they are for fun, not real security.</p>${form}<p class="cap">Your first new account keeps your current guest progress.</p>`}}

/* ---------- lobby: Arcade & Club strip ---------- */
const V=[['mines','Mines','💣💎','Find gems, dodge mines'],['crash','Crash','🚀','Cash out before it crashes'],['hilo','Higher or Lower','🃏','Chain your guesses'],['luckywheel','Lucky Wheel','🎡','Free spin every 10 minutes','wbadge'],
['tro','Trophies','🏆','Achievements with rewards'],['msg','Messages','✉️','Chat with other players','mbadge'],['prof','Profile','👤','Log in or create an account']];
$('lobby').appendChild(mk(`<div class="arcade"><div class="arch"><b>Arcade &amp; Club</b><span id="xinc"></span></div><div class="avs">${V.map(([k,n,e,d,bd])=>`<div class="venue xv" data-v="${k}" tabindex="0" role="button"><b class="sign">${n}</b>${bd?`<span class="badge" id="${bd}"></span>`:''}<div class="art">${e}</div><small>${d}</small></div>`).join('')}</div></div>`));
const X={tro:()=>xm('tro'),msg:()=>xm('msg'),prof:()=>xm('prof')},lob=e=>{const v=e.target.closest('[data-v]'),k=v&&v.dataset.v;X[k]?X[k]():go(e)};
$('lobby').onclick=lob;$('lobby').onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();lob(e)}};
const wb=mk('<button id="whoami"></button>');document.querySelector('.wallet').appendChild(wb);wb.onclick=()=>xm('prof');
const bd=(id,on,txt)=>{const e=$(id);e.textContent=txt;e.style.display=on?'block':'none'};
function loop(){pay();const w=wleft(),r=rate(),u=unread();
  if(!wsp){$('wcd').textContent=w?`Next free spin in ${Math.floor(w/6e4)}:${String(Math.floor(w/1e3)%60).padStart(2,'0')}`:'Your free spin is ready!';$('wspin').disabled=!!w}
  bd('wbadge',!w&&!wsp,'FREE');bd('mbadge',u>0,u);wb.textContent='👤 '+(who()||'Sign in');
  $('xinc').textContent=r?`💸 Passive income: +${fmt(r)} chips / min`:'💸 Buy income items at the Boutique';check()}
setInterval(loop,1000);loop();
})();
