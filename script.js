const $=id=>document.getElementById(id),rnd=n=>Math.floor(Math.random()*n),wait=ms=>new Promise(r=>setTimeout(r,ms));
let bal=1000,sel=10,loans=[],rounds=0,repaid=0,ledger=[];
const OFFERS=[{n:'Pocket Loan',a:250,r:4},{n:'Standard Loan',a:1000,r:8},{n:'High Roller Credit',a:3000,r:12},{n:'Whale Facility',a:7500,r:18}],INT_EVERY=5,fmt=n=>Math.round(n).toLocaleString('en-US');
const G={xp:0,lvl:1,owned:[],av:'🙂',buff:{r:0,l:0,x:1},q:null};
try{const s=JSON.parse((localStorage.getItem('alpine-state')||localStorage.getItem('vltava-state')));if(s){bal=s.bal;loans=s.loans||[];rounds=s.rounds||0;repaid=s.repaid||0;ledger=s.ledger||[];Object.assign(G,s.g||{})}}catch(e){}
let shown=bal,nudged=false;
const debt=()=>loans.reduce((a,l)=>a+l.owed,0),limit=()=>5000+repaid*500+(has('card')?2000:0),avail=()=>Math.max(0,limit()-debt());
const save=()=>{try{localStorage.setItem('alpine-state',JSON.stringify({bal,loans,rounds,repaid,ledger,g:G}))}catch(e){}};
const log=(t,v)=>{ledger.unshift({t,v});ledger.length=Math.min(ledger.length,12)};
function toast(m,k){const d=document.createElement('div');d.className='toast '+(k||'');d.textContent=m;$('toasts').appendChild(d);setTimeout(()=>d.remove(),4300)}
function coins(n){const r=$('bal').getBoundingClientRect();for(let i=0;i<n;i++){const c=document.createElement('i');c.className='coin';c.style.cssText=`left:${r.left+r.width/2}px;top:${r.top+10}px;--dx:${rnd(160)-80}px;--dy:${80+rnd(140)}px;animation-delay:${i*40}ms`;document.body.appendChild(c);setTimeout(()=>c.remove(),1700)}}
function count(el,from,to){const t0=performance.now();(function f(t){const p=Math.min((t-t0)/600,1);el.textContent=fmt(from+(to-from)*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(t0)}
function render(){hud();const box=$('bal').closest('.bank');
  if(bal!==shown){box.classList.remove('up','down');void box.offsetWidth;box.classList.add(bal>shown?'up':'down')}
  count($('bal'),shown,bal);shown=bal;$('debt').textContent=fmt(debt());$('debtbox').classList.toggle('owing',debt()>0);
  if($('bank').classList.contains('open'))renderBank()}
function setBal(d){if(d>0)d=Math.round(d*(1+luck()));bal+=d;if(d>=100)coins(Math.min(14,d/50|0));render();save()}
function renderBank(){const d=debt(),pct=Math.min(100,d/limit()*100),next=INT_EVERY-rounds%INT_EVERY;
  const rt=!d?['Excellent','#5fd38d']:pct<35?['Good','#9ad35f']:pct<70?['Fair','#e3bf6a']:['Poor','#e5604d'];
  $('bk-sum').innerHTML=[['Chips',fmt(bal)],['Total debt',fmt(d)],['Net worth',fmt(bal-d)],['Credit available',fmt(avail())+' / '+fmt(limit())]].map(([a,b])=>`<div class="stat"><span>${a}</span><b>${b}</b></div>`).join('')+`<div class="stat"><span>Credit rating</span><b style="color:${rt[1]}">${rt[0]}</b></div>`;
  $('bk-bar').style.width=pct+'%';$('bk-bar').style.background=rt[1];
  $('bk-offers').innerHTML=OFFERS.map((o,i)=>`<div class="offer"><h4>${o.n}</h4><b>${fmt(o.a)}</b><p>${o.r}% interest every ${INT_EVERY} rounds</p><button class="gold" data-b="${i}" ${o.a>avail()?'disabled':''}>Borrow</button></div>`).join('');
  $('bk-loans').innerHTML=loans.length?loans.map((l,i)=>`<tr><td>${l.n}</td><td>${fmt(l.owed)}</td><td>${l.r}%</td><td><button data-p="${i}:100" ${bal<1?'disabled':''}>Pay 100</button> <button class="gold" data-p="${i}:all" ${bal<l.owed?'disabled':''}>Pay in full</button></td></tr>`).join(''):'<tr><td colspan="4" class="empty">No active loans. You are debt-free.</td></tr>';
  $('bk-next').textContent=loans.length?`Next interest charge in ${next} round${next>1?'s':''}.`:'No interest due.';
  $('bk-led').innerHTML=ledger.map(e=>`<li><span>${e.t}</span><b class="${e.v>=0?'pos':'neg'}">${e.v>=0?'+':''}${fmt(e.v)}</b></li>`).join('')||'<li class="empty">No transactions yet.</li>'}
const openBank=()=>{renderBank();$('bank').classList.add('open');$('bank').querySelector('[data-x]').focus()},closeBank=()=>$('bank').classList.remove('open');
$('openbank').onclick=openBank;document.addEventListener('keydown',e=>{if(e.key=='Escape'){closeBank();$('sheet').classList.remove('open')}});
$('bank').onclick=e=>{if(e.target.id=='bank'||e.target.closest('[data-x]'))return closeBank();
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.b!==undefined){const o=OFFERS[+b.dataset.b];if(o.a>avail())return;loans.push({n:o.n,owed:o.a,r:o.r});bal+=o.a;log('Borrowed: '+o.n,o.a);toast(`Loan approved: ${fmt(o.a)} chips`,'good');coins(14);nudged=false;render();save();checkBroke()}
  if(b.dataset.p){const [i,m]=b.dataset.p.split(':'),l=loans[+i],amt=Math.min(m=='all'?l.owed:+m,bal,l.owed);if(amt<=0)return;
    bal-=amt;l.owed-=amt;log('Repaid: '+l.n,-amt);
    if(l.owed<=0){loans.splice(+i,1);repaid++;ev('repaid');toast('Loan fully repaid. Credit limit +500.','good')}else toast(`Repaid ${fmt(amt)} chips`);render();save()}};
function checkBroke(){const btn=$('openbank');
  if(bal>=10){nudged=false;btn.classList.remove('alert');return}
  btn.classList.add('alert');
  if(avail()<OFFERS[0].a){$('bust-d').textContent=fmt(debt());$('bust').classList.add('open')}
  else if(!nudged){nudged=true;toast('You are out of chips. The bank is open.','warn');openBank()}}
function tick(){rounds++;ev('round');addXp(10);if(G.buff.r>0&&!--G.buff.r)toast('Your drink wore off.');
  if(rounds%INT_EVERY==0&&loans.length){let t=0;loans.forEach(l=>{const i=Math.max(1,Math.round(l.owed*l.r/100));l.owed+=i;t+=i});log('Interest charged',-t);toast(`The bank charged ${fmt(t)} chips in interest`,'warn')}
  render();save();checkBroke()}
const QT=[['rwin','Spin Doctor','Win {n} roulette spin(s)',3,300],['bjwin','Card Shark','Win {n} blackjack hand(s)',2,300],['swin','Lucky Streak','Hit {n} winning slot spin(s)',2,250],['hwin','Day at the Races','Back {n} winning horse(s)',1,400],['round','Regular','Play {n} rounds anywhere',10,350],['repaid','Clean Slate','Fully repay {n} loan(s)',1,500],['buy','Window Shopper','Buy {n} item(s) at the boutique or bar',1,150]];
const SHOP=[{id:'foot',n:"Rabbit's Foot",e:'🐇',p:350,d:'+5% on every payout',luck:.05},{id:'clover',n:'Four-Leaf Clover',e:'🍀',p:900,d:'+10% on every payout',luck:.1},{id:'dice',n:'Golden Dice',e:'🎲',p:2200,d:'+15% on every payout',luck:.15},{id:'card',n:'Platinum Card',e:'💳',p:1200,d:'+2,000 bank credit limit'},{id:'tux',n:'Tuxedo',e:'🤵',p:500,d:'Look the part',av:1},{id:'gown',n:'Evening Gown',e:'💃',p:500,d:'Look the part',av:1},{id:'crown',n:'Crown',e:'👑',p:3000,d:'High-roller status',av:1}];
const BAR=[{id:'esp',n:'Espresso',e:'☕',p:30,d:'2× XP for 5 rounds',buff:{r:5,l:0,x:2}},{id:'mart',n:'Lucky Martini',e:'🍸',p:80,d:'+20% payouts for 5 rounds',buff:{r:5,l:.2,x:1}},{id:'champ',n:'Champagne',e:'🍾',p:250,d:'+30% payouts and 2× XP for 3 rounds',buff:{r:3,l:.3,x:2}}];
const has=id=>G.owned.includes(id),qd=q=>QT.find(x=>x[0]==q.k),need=q=>qd(q)[3]*q.m,luck=()=>SHOP.reduce((a,i)=>a+(has(i.id)&&i.luck||0),0)+(G.buff.r>0?G.buff.l:0);
if(!G.q)G.q=QT.map(d=>({k:d[0],p:0,m:1}));
function hud(){$('dbar').style.width=Math.min(100,debt()/limit()*100)+'%';$('lvl').textContent='Level '+G.lvl;$('xpf').style.width=G.xp/(G.lvl*100)*100+'%';$('avatar').textContent=G.av;
  const l=Math.round(luck()*100);$('luck').textContent=l?`✨ +${l}% payouts`:'';
  const n=G.q.filter(q=>q.p>=need(q)).length,b=$('qbadge');b.textContent=n;b.style.display=n?'block':'none'}
function ev(k){G.q.forEach(q=>{if(q.k!=k||q.p>=need(q))return;q.p++;if(q.p>=need(q))toast('Quest complete: '+qd(q)[1]+'. Claim it at the Quest Board.','good')});hud();save()}
function addXp(n){G.xp+=n*(G.buff.r>0?G.buff.x:1);while(G.xp>=G.lvl*100){G.xp-=G.lvl*100;G.lvl++;bal+=G.lvl*100;toast(`Level up! You are level ${G.lvl}. Bonus: ${fmt(G.lvl*100)} chips`,'good');coins(14)}}
let S='';
function sheet(k){S=k;const m={shop:['Alpine Boutique','Charms, credit and couture. Perks last forever.'],bar:['The Gilded Pour','A drink gives a short boost. Cheers.'],quest:['Quest Board','Finish tasks for chips and XP. Every claim makes the next one harder and richer.']}[k];
  $('sheet-t').textContent=m[0];$('sheet-s').textContent=m[1];renderSheet();$('sheet').classList.add('open')}
function renderSheet(){const el=$('sheet-b');
  if(S=='quest'){el.innerHTML=G.q.map((q,i)=>{const d=qd(q),n=need(q),ok=q.p>=n;return `<div class="quest${ok?' done':''}"><div><h4>${d[1]}</h4><p>${d[2].replace('{n}',n)}. Reward: ${fmt(d[4]*q.m)} chips</p></div><button class="gold" data-claim="${i}" ${ok?'':'disabled'}>${ok?'Claim':q.p+' / '+n}</button><div class="qb"><i style="width:${q.p/n*100}%"></i></div></div>`}).join('');return}
  el.innerHTML='<div class="items">'+(S=='shop'?SHOP:BAR).map(it=>{const own=has(it.id);
    const btn=own?(it.av?`<button data-eq="${it.id}" ${G.av==it.e?'disabled':''}>${G.av==it.e?'Equipped':'Equip'}</button>`:'<button disabled>Owned</button>'):`<button class="gold" data-buy="${it.id}" ${bal<it.p?'disabled':''}>${fmt(it.p)} chips</button>`;
    return `<div class="item"><span class="ie">${it.e}</span><h4>${it.n}</h4><p>${it.d}</p>${btn}</div>`}).join('')+'</div>'}
$('sheet').onclick=e=>{if(e.target.id=='sheet'||e.target.closest('[data-x]'))return $('sheet').classList.remove('open');
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.buy){const it=[...SHOP,...BAR].find(x=>x.id==d.buy);if(bal<it.p)return toast('Not enough chips. Try the bank.','warn');
    bal-=it.p;if(it.buff){G.buff={...it.buff};toast(`${it.n}: ${it.d}`,'good')}else{G.owned.push(it.id);if(it.av)G.av=it.e;toast('Purchased '+it.n,'good')}ev('buy')}
  if(d.eq)G.av=SHOP.find(x=>x.id==d.eq).e;
  if(d.claim!==undefined){const q=G.q[+d.claim],rw=qd(q)[4]*q.m;if(q.p<need(q))return;bal+=rw;q.p=0;q.m=Math.min(q.m*2,8);addXp(rw/5);toast(`Reward: ${fmt(rw)} chips`,'good');coins(14)}
  render();save();renderSheet()};
render();checkBroke();
/* lobby navigation */
const ROOM={roulette:1,blackjack:1,slots:1,horses:1},MAIN=document.querySelector('main');
document.querySelectorAll('main section').forEach(s=>{const b=document.createElement('button');b.className='back';b.textContent='← Back to the casino floor';b.onclick=()=>MAIN.classList.remove('open');s.prepend(b)});
function enter(id){document.querySelectorAll('main section').forEach(s=>s.classList.toggle('on',s.id==id));MAIN.style.top=document.querySelector('header').offsetHeight+'px';MAIN.classList.add('open');MAIN.scrollTop=0}
const go=e=>{const v=e.target.closest('[data-v]');if(!v)return;const k=v.dataset.v;if(ROOM[k])enter(k);else if(k=='bank')openBank();else sheet(k)};
$('lobby').onclick=go;$('lobby').onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();go(e)}};
const NM=['Anna','Tom','Elena','Marco','Jana','Viktor','Sofia','Hugo'],GM=['Roulette','Blackjack','the Slots','the Races'];
const wins=Array.from({length:12},()=>`🏆 ${NM[rnd(8)]} won ${fmt(200+rnd(9000))} on ${GM[rnd(4)]}`).join('  ✦  ');
$('tk').innerHTML=`<span>${wins}</span><span>${wins}</span>`;
let jp=1284903;setInterval(()=>{jp+=rnd(40)+5;$('jp').textContent=fmt(jp)},900);
/* chips (shared selection) */
['rchips','bchips','schips','hchips','mchips'].forEach(id=>{
  [10,50,100,500].forEach(v=>{const c=document.createElement('button');c.className='chip'+(v==10?' sel':'');c.dataset.v=v;c.textContent=v;
    c.onclick=()=>{sel=v;document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('sel',+x.dataset.v==v))};$(id).appendChild(c)})});
/* ===== RULETA ===== */
const ORD=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const col=n=>n==0?'g':RED.has(n)?'r':'b',hex={r:'#a3202f',b:'#151515',g:'#0a7a3c'};
(function(){const c=$('wheel').getContext('2d'),W=640,m=W/2,st=2*Math.PI/37;
  c.translate(m,m);c.fillStyle='#3b2410';c.beginPath();c.arc(0,0,m,0,7);c.fill();
  ORD.forEach((n,i)=>{const a=-Math.PI/2+i*st-st/2;c.fillStyle=hex[col(n)];c.beginPath();c.moveTo(0,0);c.arc(0,0,m-18,a,a+st);c.fill();c.strokeStyle='#c9a24b';c.lineWidth=2;c.stroke();
    c.save();c.rotate(a+st/2+Math.PI/2);c.fillStyle='#fff';c.font='bold 24px Outfit, sans-serif';c.textAlign='center';c.fillText(n,0,-(m-52));c.restore()});
  c.fillStyle='#2a1a0c';c.beginPath();c.arc(0,0,m*.5,0,7);c.fill();c.strokeStyle='#c9a24b';c.lineWidth=4;c.stroke();
  c.lineWidth=2;c.beginPath();c.arc(0,0,m-3,0,7);c.stroke();c.beginPath();c.arc(0,0,m-18,0,7);c.stroke();
  for(let k=0;k<8;k++){c.save();c.rotate(k*Math.PI/4+Math.PI/8);c.translate(0,-(m-10));c.rotate(Math.PI/4);c.fillStyle='#e3bf6a';c.fillRect(-5,-5,10,10);c.restore()}
  const tg=c.createRadialGradient(-30,-30,5,0,0,m*.3);tg.addColorStop(0,'#f3e2a0');tg.addColorStop(1,'#6a4a14');
  c.fillStyle=tg;c.beginPath();c.arc(0,0,m*.3,0,7);c.fill();c.strokeStyle='#4a2c14';c.lineWidth=7;
  for(let k=0;k<4;k++){c.save();c.rotate(k*Math.PI/2+Math.PI/4);c.beginPath();c.moveTo(0,-m*.3);c.lineTo(0,m*.3);c.stroke();c.restore()}})();
const bc=$('ball').getContext('2d');
function drawBall(a,r){bc.clearRect(0,0,640,640);const x=320+Math.cos(a)*r,y=320+Math.sin(a)*r;
  bc.fillStyle='#0007';bc.beginPath();bc.arc(x+3,y+4,8,0,7);bc.fill();
  const g=bc.createRadialGradient(x-3,y-3,1,x,y,9);g.addColorStop(0,'#fff');g.addColorStop(.6,'#dfe6e8');g.addColorStop(1,'#8a9498');
  bc.fillStyle=g;bc.beginPath();bc.arc(x,y,9,0,7);bc.fill()}
drawBall(-Math.PI/2+.4,311);
let rot=0,bets={},spinning=false;
const hist=[];
function bt(label,key,cls,parent,style){const b=document.createElement('button');b.textContent=label;b.className=cls||'';if(style)b.style.cssText=style;b.dataset.k=key;
  b.onclick=()=>{if(spinning)return;if(bal<tot()+sel)return $('rmsg').textContent='Not enough chips. Visit the bank.';bets[key]=(bets[key]||0)+sel;draw()};parent.appendChild(b)}
bt('0','n0','n-g zero',$('board'));
for(let r=0;r<3;r++)for(let k=0;k<12;k++){const n=k*3+(3-r);bt(n,'n'+n,'n-'+col(n),$('board'))}
[['1st dozen','d1'],['2nd dozen','d2'],['3rd dozen','d3'],['Red','red'],['Black','black'],['Even','even'],['Odd','odd'],['1–18','low'],['19–36','high']].forEach(([l,k])=>bt(l,k,'',$('out')));
const tot=()=>Object.values(bets).reduce((a,b)=>a+b,0);
function draw(){document.querySelectorAll('[data-k]').forEach(b=>{b.querySelector('.stake')?.remove();const v=bets[b.dataset.k];if(v){const s=document.createElement('span');s.className='stake';s.textContent=v;b.appendChild(s)}});$('tot').textContent=tot()?'Total bet: '+tot():''}
$('clr').onclick=()=>{if(!spinning){bets={};draw()}};
function win(k,n){if(k[0]=='n')return n==+k.slice(1)?36:0;if(!n)return 0;
  return({d1:n<=12?3:0,d2:n>12&&n<=24?3:0,d3:n>24?3:0,red:RED.has(n)?2:0,black:!RED.has(n)?2:0,even:n%2==0?2:0,odd:n%2?2:0,low:n<=18?2:0,high:n>18?2:0})[k]}
$('spin').onclick=async()=>{
  if(spinning||!tot())return $('rmsg').textContent='Place a bet first.';
  spinning=true;const stake=tot();setBal(-stake);$('rmsg').textContent='The wheel is spinning…';$('hub').textContent='…';
  const i=rnd(37),n=ORD[i],rel=-Math.PI/2+i*2*Math.PI/37,w0=rot*Math.PI/180,Wt=2*Math.PI*(4+Math.random()),K=2*Math.PI*9;
  const T=window.matchMedia('(prefers-reduced-motion:reduce)').matches?1200:7500,t0=performance.now();
  await new Promise(done=>{(function f(now){
    const p=Math.min((now-t0)/T,1),w=w0+Wt*(1-Math.pow(1-p,3)),q=Math.max(0,(p-.6)/.4);
    /* the ball runs against the wheel on the outer track, then drops into a pocket and bounces */
    const r=p<.6?311:311-18*(1-Math.pow(1-q,2))+Math.sin(q*20)*(1-q)*7;
    $('wheel').style.transform=`rotate(${w}rad)`;drawBall(w+rel+Math.pow(1-p,2)*K,r);
    p<1?requestAnimationFrame(f):done()})(t0)});
  rot=(w0+Wt)*180/Math.PI;
  let ret=0;for(const k in bets)ret+=bets[k]*win(k,n);
  $('hub').textContent=n;hist.unshift(n);hist.length=Math.min(hist.length,14);
  $('hist').innerHTML=hist.map(x=>`<span style="background:${hex[col(x)]}">${x}</span>`).join('');
  setBal(ret);if(ret>stake)ev('rwin');$('rmsg').textContent=ret?`${n} ${col(n)=='g'?'green':col(n)=='r'?'red':'black'}. ${ret>stake?'You win +'+(ret-stake):'Returned '+ret}.`:`${n}. Bets lost.`;
  bets={};draw();spinning=false;tick()};
/* ===== BLACKJACK ===== */
let deck,P,D,bj=0,play=false;
const newDeck=()=>{deck=[];for(const s of '♠♥♦♣')for(const r of 'A23456789TJQK')deck.push({r,s});for(let i=deck.length-1;i>0;i--){const j=rnd(i+1);[deck[i],deck[j]]=[deck[j],deck[i]]}};
const val=h=>{let t=0,a=0;h.forEach(c=>{if(c.r=='A'){a++;t+=11}else t+='TJQK'.includes(c.r)?10:+c.r});while(t>21&&a--)t-=10;return t};
const cardEl=(c,hide)=>{if(hide)return '<div class="card back"></div>';const r=c.r=='T'?'10':c.r,k=`<span class="cn">${r}<small>${c.s}</small></span>`;return `<div class="card ${'♥♦'.includes(c.s)?'red':''}">${k}<span class="s">${c.s}</span>${k.replace('cn','cn r2')}</div>`};
function show(hide){$('ph').innerHTML=P.map(c=>cardEl(c)).join('');$('dh').innerHTML=D.map((c,i)=>cardEl(c,hide&&i==1)).join('');
  $('ps').textContent='Total: '+val(P);$('ds').textContent=hide?'Showing: '+val([D[0]]):'Total: '+val(D);$('bbet').textContent=bj?'Bet: '+bj:''}
function end(msg,mult){play=false;['hit','stand','dbl'].forEach(i=>$(i).disabled=true);$('deal').disabled=false;show(false);
  if(mult)setBal(Math.round(bj*mult));if(mult>1)ev('bjwin');$('bmsg').textContent=msg;tick()}
$('deal').onclick=()=>{if(bal<sel)return $('bmsg').textContent='Not enough chips. Visit the bank.';
  if(!deck||deck.length<15)newDeck();bj=sel;setBal(-bj);P=[deck.pop(),deck.pop()];D=[deck.pop(),deck.pop()];play=true;$('deal').disabled=true;$('bmsg').textContent='Your move.';show(true);
  if(val(P)==21)return end(val(D)==21?'Both have blackjack – push.':'Blackjack! Pays 3:2.',val(D)==21?1:2.5);
  $('hit').disabled=$('stand').disabled=false;$('dbl').disabled=bal<bj};
$('hit').onclick=()=>{P.push(deck.pop());$('dbl').disabled=true;show(true);if(val(P)>21)end('Bust. You lose.',0);else if(val(P)==21)$('stand').click()};
async function dealer(){show(false);while(val(D)<17){await wait(600);D.push(deck.pop());show(false)}
  const p=val(P),d=val(D);if(d>21)end('Dealer busts. You win!',2);else if(p>d)end('You win '+p+' to '+d+'.',2);else if(p<d)end('Dealer wins '+d+' to '+p+'.',0);else end('Push – bet returned.',1)}
$('stand').onclick=()=>{['hit','stand','dbl'].forEach(i=>$(i).disabled=true);dealer()};
$('dbl').onclick=()=>{setBal(-bj);bj*=2;P.push(deck.pop());show(true);if(val(P)>21)end('Bust. You lose the doubled bet.',0);else $('stand').click()};
/* ===== SLOTY ===== */
const SYM=[['🍒',5],['🍋',8],['🔔',15],['⭐',25],['7️⃣',50],['💎',100]];
$('pay').innerHTML=SYM.map(([s,m])=>`<tr><td>${s} ${s} ${s}</td><td>${m}× bet</td></tr>`).join('')+'<tr><td>🍒 🍒 any</td><td>2× bet</td></tr>';
let busy=false;
$('pull').onclick=async()=>{if(busy)return;if(bal<sel)return $('smsg').textContent='Not enough chips. Visit the bank.';
  busy=true;const bet=sel;setBal(-bet);$('lever').classList.remove('pull');void $('lever').offsetWidth;$('lever').classList.add('pull');document.querySelectorAll('.reel').forEach(e=>e.classList.remove('win'));$('smsg').textContent='Reels are spinning…';
  const res=[0,1,2].map(()=>{const r=Math.random();return r<.3?0:r<.55?1:r<.75?2:r<.88?3:r<.96?4:5}),els=[0,1,2].map(i=>$('r'+i));
  els.forEach(e=>e.classList.add('spin'));
  const iv=setInterval(()=>els.forEach(e=>{if(e.classList.contains('spin'))e.textContent=SYM[rnd(6)][0]}),70);
  for(let i=0;i<3;i++){await wait(800+i*500);els[i].classList.remove('spin');els[i].textContent=SYM[res[i]][0]}
  clearInterval(iv);let m=0;
  if(res[0]==res[1]&&res[1]==res[2])m=SYM[res[0]][1];else if(res.filter(x=>x==0).length>=2)m=2;
  if(m){setBal(bet*m);ev('swin');document.querySelectorAll('.reel').forEach(e=>e.classList.add('win'));$('smsg').textContent=`You win ${bet*m} chips (${m}×)!`}else $('smsg').textContent='No win this time. Try again.';busy=false;tick()};
/* ===== DOSTIHY ===== */
const COL=['#d93636','#2f6fe0','#f2c230','#2fb36b','#9b4de0','#f08a24'];const HS=[['Silver Bolt',2.5,1.0],['River Gale',3,.96],['Golden Horseshoe',4,.92],['Black Orchid',5,.88],['Old Earl',8,.8],['Little Longshot',12,.72]];
let pick=-1,racing=false;
function buildTrack(){$('track').innerHTML=HS.map((h,i)=>`<div class="lane" style="--c:${COL[i]}"><span class="bib">${i+1}</span><span class="nm">${h[0]}</span><span class="h">🐎</span></div>`).join('')+'';$('track').lastChild&&($('track').style.position='relative');
  if(!$('track').querySelector('.finish')){const f=document.createElement('div');f.className='finish';$('track').appendChild(f)}}
buildTrack();
$('stand').innerHTML=Array.from({length:22},(_,i)=>`<span style="animation-delay:${(i%7)*.12}s">${['🙌','👒','🎩','🧢','🙋'][i%5]}</span>`).join('');
$('odds').innerHTML=HS.map((h,i)=>`<button data-i="${i}"><span>${i+1}. ${h[0]}</span><span>${h[1]}:1</span></button>`).join('');
$('odds').onclick=e=>{const b=e.target.closest('button');if(!b||racing)return;pick=+b.dataset.i;[...$('odds').children].forEach(x=>x.classList.toggle('sel',x==b));$('go').disabled=false;$('hmsg').textContent='Betting on: '+HS[pick][0]};
$('go').onclick=()=>{if(racing||pick<0)return;if(bal<sel)return $('hmsg').textContent='Not enough chips. Visit the bank.';
  racing=true;$('track').classList.add('racing');const bet=sel;setBal(-bet);$('go').disabled=true;$('hmsg').textContent='And they\'re off!';
  const hs=[...document.querySelectorAll('.h')],w=$('track').clientWidth-70,pos=HS.map(()=>0);let done=false;
  (function f(){HS.forEach((h,i)=>pos[i]+=(Math.random()*1.1+.2)*h[2]*.9);
    hs.forEach((e,i)=>e.style.left=Math.min(pos[i]/100,1)*w+'px');
    const lead=pos.findIndex(p=>p>=100);
    if(lead<0)return requestAnimationFrame(f);
    const win=pos.indexOf(Math.max(...pos));
    if(win==pick){ev('hwin');setBal(Math.round(bet*HS[pick][1]));$('hmsg').textContent=`Winner: ${HS[win][0]}. You win ${Math.round(bet*HS[pick][1])} chips!`}
    else $('hmsg').textContent=`Winner: ${HS[win][0]}. Your horse did not place. Bet lost.`;
    racing=false;$('track').classList.remove('racing');$('go').disabled=false;tick()})()};

/* ===== MULTIPLAYER BLACKJACK (PeerJS, host-authoritative, joined by a 4-letter code) ===== */
const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
let peer=null,conns=[],hostConn=null,isHost=false,MS=null,myId='host',settled=-1,hostDeck=null;
const mine=()=>MS&&MS.players.find(p=>p.id==myId),stt=m=>$('mp-st').textContent=m;
function freshDeck(){const d=[];for(const s of '♠♥♦♣')for(const r of 'A23456789TJQK')d.push({r,s});for(let i=d.length-1;i>0;i--){const j=rnd(i+1);[d[i],d[j]]=[d[j],d[i]]}return d}
const hdraw=()=>{if(hostDeck.length<8)hostDeck=freshDeck();return hostDeck.pop()};
function mpLeave(){try{peer&&peer.destroy()}catch(e){}peer=null;conns=[];hostConn=null;MS=null;isHost=false;$('mp-join').hidden=false;$('mp-table').hidden=true}
function push(){conns.forEach(c=>c.open&&c.send({t:'state',s:MS}));mpRender()}
const act=m=>isHost?hostMsg('host',m):hostConn.send(m);
function next(){const P=MS.players;let i=MS.turn+1;while(i<P.length&&P[i].st!='play')i++;MS.turn=i;if(i>=P.length)dealerPlay()}
function dealerPlay(){MS.hide=false;const alive=MS.players.some(p=>p.st=='stand'||p.st=='bj');while(alive&&val(MS.dealer)<17)MS.dealer.push(hdraw());const d=val(MS.dealer);
  MS.players.forEach(p=>{if(p.st=='out')return;const v=val(p.hand);p.res=p.st=='bust'?0:p.st=='bj'?(d==21&&MS.dealer.length==2?1:2.5):d>21||v>d?2:v==d?1:0});MS.ph='done'}
function hostDeal(){if(MS.ph!='bet'||!MS.players.some(p=>p.bet))return;MS.rid++;MS.dealer=[hdraw(),hdraw()];MS.hide=true;
  MS.players.forEach(p=>{p.res=null;p.hand=p.bet?[hdraw(),hdraw()]:[];p.st=p.bet?(val(p.hand)==21?'bj':'play'):'out'});MS.ph='play';MS.turn=-1;next();push()}
function hostMsg(id,m,c){if(!m||typeof m!='object')return;const P=MS.players,me=P.find(p=>p.id==id);
  if(m.t=='join'&&!me){if(P.length>=4||MS.ph!='bet'){c.send({t:'state',s:{...MS,players:[]}});setTimeout(()=>c.close(),300);return}P.push({id,name:String(m.name||'Player').slice(0,12),bet:0,hand:[],st:'wait'})}
  else if(m.t=='bet'&&me&&MS.ph=='bet'&&!me.bet&&[10,50,100,500].includes(m.v))me.bet=m.v;
  else if(m.t=='hit'&&me&&MS.ph=='play'&&P[MS.turn]==me){me.hand.push(hdraw());const v=val(me.hand);if(v>21){me.st='bust';next()}else if(v==21){me.st='stand';next()}}
  else if(m.t=='stand'&&me&&MS.ph=='play'&&P[MS.turn]==me){me.st='stand';next()}
  push()}
function drop(id){if(!MS)return;const P=MS.players,p=P.find(x=>x.id==id);conns=conns.filter(c=>c.peer!=id);if(!p)return;p.left=true;
  if(MS.ph=='bet')P.splice(P.indexOf(p),1);else if(MS.ph=='play'&&p.st=='play'){const was=P[MS.turn]==p;p.st='stand';if(was)next()}push()}
function mpRender(){if(!MS)return;const me=mine();
  if(!me){toast('The table is full or a round is in progress.','warn');return mpLeave()}
  const P=MS.players,turn=MS.ph=='play'&&P[MS.turn]==me;
  $('mp-d').innerHTML=MS.dealer.map((c,i)=>cardEl(c,MS.hide&&i==1)).join('');
  $('mp-seats').innerHTML=P.map((p,i)=>`<div class="seat${p.id==myId?' me':''}${MS.ph=='play'&&MS.turn==i?' turn':''}"><h4>${esc(p.name)}${p.id=='host'?' ♛':''}</h4><div class="hand">${p.hand.map(c=>cardEl(c)).join('')}</div><div class="st">${p.bet?'Bet '+p.bet:'No bet'}${p.hand.length?' · '+val(p.hand):''}${p.st=='bust'?' · Bust':p.st=='bj'?' · Blackjack':''}${p.res!=null?(p.res>1?' · Win':p.res==1?' · Push':' · Lose'):''}</div></div>`).join('');
  $('mp-n').textContent=P.length+' / 4 players';
  $('mp-bet').disabled=!(MS.ph=='bet'&&!me.bet);$('mp-hit').disabled=$('mp-stand').disabled=!turn;
  $('mp-deal').hidden=!(isHost&&MS.ph=='bet');$('mp-deal').disabled=!P.some(p=>p.bet);$('mp-next').hidden=!(isHost&&MS.ph=='done');
  $('mp-msg').textContent=MS.ph=='bet'?(me.bet?(isHost?'Deal when everyone is ready.':'Waiting for the host to deal…'):'Choose a chip and place your bet.'):MS.ph=='play'?(turn?'Your move.':'Waiting for '+(P[MS.turn]?P[MS.turn].name:'the dealer')+'…'):'Round over.';
  if(MS.ph=='done'&&me.bet&&settled!=MS.rid){settled=MS.rid;const rw=Math.round(me.bet*me.res);if(rw)setBal(rw);if(me.res>1)ev('bjwin');tick()}}
$('mp-host').onclick=()=>{if(!window.Peer)return stt('Multiplayer needs an internet connection (PeerJS did not load).');
  const code=Array.from({length:4},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ'[rnd(24)]).join(''),name=$('mp-name').value.trim()||'Host';stt('Opening your table…');
  peer=new Peer('alpinepro-bj-'+code);peer.on('error',e=>stt('Could not open the table ('+e.type+'). Try again.'));
  peer.on('open',()=>{isHost=true;myId='host';hostDeck=freshDeck();MS={ph:'bet',turn:-1,dealer:[],hide:true,players:[{id:'host',name:name.slice(0,12),bet:0,hand:[],st:'wait'}],rid:0};$('mp-c').textContent=code;$('mp-join').hidden=true;$('mp-table').hidden=false;push()});
  peer.on('connection',c=>{conns.push(c);c.on('data',m=>hostMsg(c.peer,m,c));c.on('close',()=>drop(c.peer))})};
$('mp-go').onclick=()=>{if(!window.Peer)return stt('Multiplayer needs an internet connection (PeerJS did not load).');
  const code=$('mp-code').value.trim().toUpperCase(),name=$('mp-name').value.trim()||'Guest';if(code.length!=4)return stt('Enter the 4-letter table code.');stt('Connecting…');
  peer=new Peer();peer.on('error',e=>stt('Could not join ('+e.type+'). Check the code.'));
  peer.on('open',id=>{myId=id;hostConn=peer.connect('alpinepro-bj-'+code,{reliable:true});
    hostConn.on('open',()=>{hostConn.send({t:'join',name});$('mp-c').textContent=code;$('mp-join').hidden=true;$('mp-table').hidden=false});
    hostConn.on('data',m=>{if(m&&m.t=='state'){MS=m.s;mpRender()}});
    hostConn.on('close',()=>{if(MS){toast('The table was closed.','warn');mpLeave()}})})};
$('mp-deal').onclick=hostDeal;
$('mp-next').onclick=()=>{MS.players=MS.players.filter(p=>!p.left);MS.players.forEach(p=>{p.bet=0;p.hand=[];p.st='wait';p.res=null});MS.dealer=[];MS.hide=true;MS.ph='bet';MS.turn=-1;push()};
$('mp-bet').onclick=()=>{const me=mine();if(!me||me.bet||MS.ph!='bet')return;if(bal<sel)return toast('Not enough chips. Visit the bank.','warn');setBal(-sel);act({t:'bet',v:sel})};
$('mp-hit').onclick=()=>act({t:'hit'});$('mp-stand').onclick=()=>act({t:'stand'});$('mp-leave').onclick=mpLeave;
const MODES=document.querySelectorAll('[data-mode]');MODES.forEach(b=>b.onclick=()=>{$('solo').hidden=b.dataset.mode!='solo';$('mpbox').hidden=b.dataset.mode!='mp';MODES.forEach(x=>x.classList.toggle('gold',x==b))});
