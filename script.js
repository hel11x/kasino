const $=id=>document.getElementById(id),rnd=n=>Math.floor(Math.random()*n),wait=ms=>new Promise(r=>setTimeout(r,ms));
let bal=1000,sel=10;
try{const s=localStorage.getItem('kasino-bal');if(s)bal=Math.max(0,+s||1000)}catch(e){}
function setBal(d){bal+=d;$('bal').textContent=bal;try{localStorage.setItem('kasino-bal',bal)}catch(e){}if(bal<=0)alert('Došly žetony. Klikněte na Nová hra.')}
$('reset').onclick=()=>{bal=1000;setBal(0)};setBal(0);
/* tabs */
[['roulette','Ruleta'],['blackjack','Blackjack'],['slots','Sloty'],['horses','Dostihy']].forEach(([id,t],i)=>{
  const b=document.createElement('button');b.textContent=t;b.onclick=()=>{document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.id==id));[...$('tabs').children].forEach(c=>c.classList.toggle('on',c==b))};
  $('tabs').appendChild(b);if(!i)b.click()});
/* chips (shared selection) */
['rchips','bchips','schips','hchips'].forEach(id=>{
  [10,50,100,500].forEach(v=>{const c=document.createElement('button');c.className='chip'+(v==10?' sel':'');c.dataset.v=v;c.textContent=v;
    c.onclick=()=>{sel=v;document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('sel',+x.dataset.v==v))};$(id).appendChild(c)})});
/* ===== RULETA ===== */
const ORD=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const col=n=>n==0?'g':RED.has(n)?'r':'b',hex={r:'#a3202f',b:'#151515',g:'#0a7a3c'};
(function(){const c=$('wheel').getContext('2d'),W=640,m=W/2,st=2*Math.PI/37;
  c.translate(m,m);c.fillStyle='#3b2410';c.beginPath();c.arc(0,0,m,0,7);c.fill();
  ORD.forEach((n,i)=>{const a=-Math.PI/2+i*st-st/2;c.fillStyle=hex[col(n)];c.beginPath();c.moveTo(0,0);c.arc(0,0,m-18,a,a+st);c.fill();c.strokeStyle='#c9a24b';c.lineWidth=2;c.stroke();
    c.save();c.rotate(a+st/2+Math.PI/2);c.fillStyle='#fff';c.font='bold 24px DM Sans, sans-serif';c.textAlign='center';c.fillText(n,0,-(m-52));c.restore()});
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
  b.onclick=()=>{if(spinning)return;if(bal<tot()+sel)return $('rmsg').textContent='Nedostatek žetonů.';bets[key]=(bets[key]||0)+sel;draw()};parent.appendChild(b)}
bt('0','n0','n-g zero',$('board'));
for(let r=0;r<3;r++)for(let k=0;k<12;k++){const n=k*3+(3-r);bt(n,'n'+n,'n-'+col(n),$('board'))}
[['1. tucet','d1'],['2. tucet','d2'],['3. tucet','d3'],['Červená','red'],['Černá','black'],['Sudé','even'],['Liché','odd'],['1–18','low'],['19–36','high']].forEach(([l,k])=>bt(l.replace('tucet','tucet').replace('tucet','tucet'),k,'',$('out')));
[...$('out').children].slice(0,3).forEach((b,i)=>b.textContent=(i+1)+'. dvanáctka');
const tot=()=>Object.values(bets).reduce((a,b)=>a+b,0);
function draw(){document.querySelectorAll('[data-k]').forEach(b=>{b.querySelector('.stake')?.remove();const v=bets[b.dataset.k];if(v){const s=document.createElement('span');s.className='stake';s.textContent=v;b.appendChild(s)}});$('tot').textContent=tot()?'Vsazeno: '+tot():''}
$('clr').onclick=()=>{if(!spinning){bets={};draw()}};
function win(k,n){if(k[0]=='n')return n==+k.slice(1)?36:0;if(!n)return 0;
  return({d1:n<=12?3:0,d2:n>12&&n<=24?3:0,d3:n>24?3:0,red:RED.has(n)?2:0,black:!RED.has(n)?2:0,even:n%2==0?2:0,odd:n%2?2:0,low:n<=18?2:0,high:n>18?2:0})[k]}
$('spin').onclick=async()=>{
  if(spinning||!tot())return $('rmsg').textContent='Nejdřív položte sázku.';
  spinning=true;const stake=tot();setBal(-stake);$('rmsg').textContent='Kolo se točí…';$('hub').textContent='…';
  const i=rnd(37),n=ORD[i],rel=-Math.PI/2+i*2*Math.PI/37,w0=rot*Math.PI/180,Wt=2*Math.PI*(4+Math.random()),K=2*Math.PI*9;
  const T=window.matchMedia('(prefers-reduced-motion:reduce)').matches?1200:7500,t0=performance.now();
  await new Promise(done=>{(function f(now){
    const p=Math.min((now-t0)/T,1),w=w0+Wt*(1-Math.pow(1-p,3)),q=Math.max(0,(p-.6)/.4);
    /* kulička běží proti směru kola po vnější dráze, pak padá do přihrádky a poskakuje */
    const r=p<.6?311:311-18*(1-Math.pow(1-q,2))+Math.sin(q*20)*(1-q)*7;
    $('wheel').style.transform=`rotate(${w}rad)`;drawBall(w+rel+Math.pow(1-p,2)*K,r);
    p<1?requestAnimationFrame(f):done()})(t0)});
  rot=(w0+Wt)*180/Math.PI;
  let ret=0;for(const k in bets)ret+=bets[k]*win(k,n);
  $('hub').textContent=n;hist.unshift(n);hist.length=Math.min(hist.length,14);
  $('hist').innerHTML=hist.map(x=>`<span style="background:${hex[col(x)]}">${x}</span>`).join('');
  setBal(ret);$('rmsg').textContent=ret?`Padlo ${n}. Vyhráváte ${ret-stake>0?'+'+(ret-stake):'zpět '+ret}.`:`Padlo ${n}. Sázky propadly.`;
  bets={};draw();spinning=false};
/* ===== BLACKJACK ===== */
let deck,P,D,bj=0,play=false;
const newDeck=()=>{deck=[];for(const s of '♠♥♦♣')for(const r of 'A23456789TJQK')deck.push({r,s});for(let i=deck.length-1;i>0;i--){const j=rnd(i+1);[deck[i],deck[j]]=[deck[j],deck[i]]}};
const val=h=>{let t=0,a=0;h.forEach(c=>{if(c.r=='A'){a++;t+=11}else t+='TJQK'.includes(c.r)?10:+c.r});while(t>21&&a--)t-=10;return t};
const cardEl=(c,hide)=>hide?'<div class="card back"></div>':`<div class="card ${'♥♦'.includes(c.s)?'red':''}"><span>${c.r=='T'?'10':c.r}</span><span class="s">${c.s}</span><span class="r2">${c.r=='T'?'10':c.r}</span></div>`;
function show(hide){$('ph').innerHTML=P.map(c=>cardEl(c)).join('');$('dh').innerHTML=D.map((c,i)=>cardEl(c,hide&&i==1)).join('');
  $('ps').textContent='Součet: '+val(P);$('ds').textContent=hide?'Viditelná karta: '+val([D[0]]):'Součet: '+val(D);$('bbet').textContent=bj?'Sázka: '+bj:''}
function end(msg,mult){play=false;['hit','stand','dbl'].forEach(i=>$(i).disabled=true);$('deal').disabled=false;show(false);
  if(mult)setBal(Math.round(bj*mult));$('bmsg').textContent=msg}
$('deal').onclick=()=>{if(bal<sel)return $('bmsg').textContent='Nedostatek žetonů.';
  if(!deck||deck.length<15)newDeck();bj=sel;setBal(-bj);P=[deck.pop(),deck.pop()];D=[deck.pop(),deck.pop()];play=true;$('deal').disabled=true;$('bmsg').textContent='Hrajete.';show(true);
  if(val(P)==21)return end(val(D)==21?'Oba blackjack – remíza.':'Blackjack! Výplata 3:2.',val(D)==21?1:2.5);
  $('hit').disabled=$('stand').disabled=false;$('dbl').disabled=bal<bj};
$('hit').onclick=()=>{P.push(deck.pop());$('dbl').disabled=true;show(true);if(val(P)>21)end('Přes 21. Prohráváte.',0);else if(val(P)==21)$('stand').click()};
async function dealer(){show(false);while(val(D)<17){await wait(600);D.push(deck.pop());show(false)}
  const p=val(P),d=val(D);if(d>21)end('Krupiér má přes 21. Vyhráváte!',2);else if(p>d)end('Vyhráváte '+p+' proti '+d+'.',2);else if(p<d)end('Krupiér vyhrává '+d+' proti '+p+'.',0);else end('Remíza – sázka vrácena.',1)}
$('stand').onclick=()=>{['hit','stand','dbl'].forEach(i=>$(i).disabled=true);dealer()};
$('dbl').onclick=()=>{setBal(-bj);bj*=2;P.push(deck.pop());show(true);if(val(P)>21)end('Přes 21. Prohráváte dvojnásobek.',0);else $('stand').click()};
/* ===== SLOTY ===== */
const SYM=[['🍒',5],['🍋',8],['🔔',15],['⭐',25],['7️⃣',50],['💎',100]];
$('pay').innerHTML=SYM.map(([s,m])=>`<tr><td>${s} ${s} ${s}</td><td>${m}× sázka</td></tr>`).join('')+'<tr><td>🍒 🍒 jakékoli</td><td>2× sázka</td></tr>';
let busy=false;
$('pull').onclick=async()=>{if(busy)return;if(bal<sel)return $('smsg').textContent='Nedostatek žetonů.';
  busy=true;const bet=sel;setBal(-bet);$('smsg').textContent='Válce se točí…';
  const res=[0,1,2].map(()=>{const r=Math.random();return r<.3?0:r<.55?1:r<.75?2:r<.88?3:r<.96?4:5}),els=[0,1,2].map(i=>$('r'+i));
  els.forEach(e=>e.classList.add('spin'));
  const iv=setInterval(()=>els.forEach(e=>{if(e.classList.contains('spin'))e.textContent=SYM[rnd(6)][0]}),70);
  for(let i=0;i<3;i++){await wait(800+i*500);els[i].classList.remove('spin');els[i].textContent=SYM[res[i]][0]}
  clearInterval(iv);let m=0;
  if(res[0]==res[1]&&res[1]==res[2])m=SYM[res[0]][1];else if(res.filter(x=>x==0).length>=2)m=2;
  if(m){setBal(bet*m);$('smsg').textContent=`Výhra ${bet*m} žetonů (${m}×)!`}else $('smsg').textContent='Tentokrát nic. Zkuste to znovu.';busy=false};
/* ===== DOSTIHY ===== */
const HS=[['Šedý Blesk',2.5,1.0],['Vltavský Vítr',3,.96],['Zlatá Podkova',4,.92],['Černá Orchidej',5,.88],['Starý Hrabě',8,.8],['Malý Outsider',12,.72]];
let pick=-1,racing=false;
function buildTrack(){$('track').innerHTML=HS.map(h=>`<div class="lane"><span class="nm">${h[0]}</span><span class="h">🐎</span></div>`).join('')+'';$('track').lastChild&&($('track').style.position='relative');
  if(!$('track').querySelector('.finish')){const f=document.createElement('div');f.className='finish';$('track').appendChild(f)}}
buildTrack();
$('odds').innerHTML=HS.map((h,i)=>`<button data-i="${i}"><span>${i+1}. ${h[0]}</span><span>${h[1]}:1</span></button>`).join('');
$('odds').onclick=e=>{const b=e.target.closest('button');if(!b||racing)return;pick=+b.dataset.i;[...$('odds').children].forEach(x=>x.classList.toggle('sel',x==b));$('go').disabled=false;$('hmsg').textContent='Vsadíte na: '+HS[pick][0]};
$('go').onclick=()=>{if(racing||pick<0)return;if(bal<sel)return $('hmsg').textContent='Nedostatek žetonů.';
  racing=true;const bet=sel;setBal(-bet);$('go').disabled=true;$('hmsg').textContent='Jsou za startem!';
  const hs=[...document.querySelectorAll('.h')],w=$('track').clientWidth-70,pos=HS.map(()=>0);let done=false;
  (function f(){HS.forEach((h,i)=>pos[i]+=(Math.random()*1.1+.2)*h[2]*.9);
    hs.forEach((e,i)=>e.style.left=Math.min(pos[i]/100,1)*w+'px');
    const lead=pos.findIndex(p=>p>=100);
    if(lead<0)return requestAnimationFrame(f);
    const win=pos.indexOf(Math.max(...pos));
    if(win==pick){setBal(Math.round(bet*HS[pick][1]));$('hmsg').textContent=`Vítěz: ${HS[win][0]}. Vyhráváte ${Math.round(bet*HS[pick][1])}!`}
    else $('hmsg').textContent=`Vítěz: ${HS[win][0]}. Váš kůň dojel hůř, sázka propadla.`;
    racing=false;$('go').disabled=false})()};
