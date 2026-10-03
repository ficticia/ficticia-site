const screen = document.getElementById('screen');
const BASE="assets/audio/Ya%20esta%20pasando!/";
const tracks = [
 {t:"TECNO OLI GARCAS",d:160,dl:"2:40",side:"A1",src:BASE+"1-tecno_oli_garcas.mp3"},
 {t:"SILLAS VACÍAS",d:132,dl:"2:12",side:"A2",src:BASE+"2-sillas_vacias.mp3"},
 {t:"AMOR INHUMANO",d:168,dl:"2:48",side:"A3",src:BASE+"3-amor_inhumano.mp3"},
 {t:"INSATISFACCIÓN PRODUCTIVA",d:155,dl:"2:35",side:"A4",src:BASE+"4-insatisfaccion_productiva.mp3"},
 {t:"MANUAL DE SUPERVIVENCIA",d:181,dl:"3:01",side:"A5",src:BASE+"5-manual_de_supervivencia.mp3"},
 {t:"EL PROMPT",d:90,dl:"1:30",side:"B1",src:BASE+"6-el_prompt.mp3"},
 {t:"CAJA NEGRA",d:153,dl:"2:33",side:"B2",src:BASE+"7-caja_negra.mp3"},
 {t:"ÚLTIMOS HOMBRES",d:170,dl:"2:50",side:"B3",src:BASE+"8-ultimos_hombres.mp3"},
 {t:"UNA NUEVA ESPERANZA",d:182,dl:"3:02",side:"B4",src:BASE+"9-una_nueva_esperanza.mp3"},
 {t:"TODAVÍA ESTAMOS ACÁ",d:152,dl:"2:32",side:"B5",src:BASE+"10-todavia_estamos_aca.mp3"},
];
const pans = [
 {t:"EL SISTEMA TE QUIERE DÓCIL",f:"15/03/2025",b:"Nos quieren callados, consumiendo, mirando pantallas mientras el mundo arde. Pero el punk no pide permiso.",
  full:["Nos quieren callados, consumiendo, mirando pantallas mientras el mundo arde. Pero el punk no pide permiso.","Te venden calma en cuotas: pastilla, serie, delivery. Mientras tanto te suben el alquiler, te precarizan el laburo y te piden que sonrías para la foto.","Este panfleto es un recordatorio pegado con engrudo: apagá el scroll media hora, juntate con tu gente, hacé ruido. Un ensayo en un galpón vale más que mil discursos.","Si llegaste hasta acá, ya sos parte. Traé tu rabia el sábado. Entrada libre, salida con ideas."]},
 {t:"BARRICADAS DE SONIDO",f:"02/02/2025",b:"La policía tiene porras, nosotros tenemos distorsión. Cada canción es un cóctel molotov.",
  full:["La policía tiene porras, nosotros tenemos distorsión. Cada canción es un cóctel molotov.","Nos corrieron de la plaza, del centro, del streaming. Nos quedamos con lo único que no nos pueden expropiar: el volumen.","Barricada de sonido significa: batería rota pero fuerte, bajo prestado pero al frente, grito colectivo aunque desafine. El error también es mensaje.","Manual rápido: 1) vení temprano, 2) cuidá a quien poguea al lado, 3) si cae uno, lo levantamos. Eso es todo lo que el sistema no entiende."]},
 {t:"NO HAY PAN SIN LIBERTAD",f:"10/01/2025",b:"Nos roban el pan, pero no el ruido. Traé tu rabia, que acá sobra amplificador.",
  full:["Nos roban el pan, pero no el ruido. Traé tu rabia, que acá sobra amplificador.","Ajuste, tarifazo, changa que no alcanza. Nos hablan de esfuerzo mientras fugan guita. Nosotros hablamos de olla popular y amplificador compartido.","No hay pan sin libertad y no hay libertad sin organización. Por eso cada fecha nuestra junta alimentos, imprime panfletos, pasa el alias para la furgoneta.","Caé con algo para compartir —comida, zapatillas, un cable— y te llevás el doble en canciones. Así funciona ficticia."]},
];
let idx=0, sec=0, playing=false, timer=null;
const $=id=>document.getElementById(id);
const au=$('au');
au.controls=false; au.volume=0.8;
function fmt(s){return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0')}
function curDur(){return (au.duration&&isFinite(au.duration))?Math.round(au.duration):tracks[idx].d}
function curDl(){return (au.duration&&isFinite(au.duration))?fmt(au.duration):tracks[idx].dl}
function print(h){screen.insertAdjacentHTML('beforeend',h);screen.scrollTop=screen.scrollHeight}
function renderPlayer(){
  $('lcd-t').textContent = String(idx+1).padStart(2,'0')+'. '+tracks[idx].t+' *** FICTICIA — YA ESTÁ PASANDO! *** '+tracks[idx].side+' · '+tracks[idx].dl;
  $('lcd-c').textContent = fmt(sec); $('lcd-d').textContent = curDl();
  $('fill').style.width = (sec/curDur()*100)+'%';
  $('hud-track').textContent = String(idx+1).padStart(2,'0')+'/10';
  const pl=$('wa-pl-t'); if(pl) pl.textContent=String(idx+1).padStart(2,'0')+'/10 · '+tracks[idx].side+' — '+tracks[idx].t;
  const bp=$('b-play'); if(bp) bp.style.boxShadow=playing?'inset 1px 1px 3px #000':'';
  const bpa=$('b-pause'); if(bpa) bpa.style.boxShadow=(!playing&&sec>0)?'inset 1px 1px 3px #000':'';
  document.querySelectorAll('.track-row').forEach((el,i)=>{
    el.classList.toggle('active',i===idx);
    el.classList.toggle('playing',i===idx&&playing);
    const b=el.querySelector('.st'); if(b) b.textContent=(i===idx&&playing)?'⏸':'▶';
  });
}
/* --- winamp fake spectrum + scope (sin WebAudio, no rompe file://) --- */
const spec=$('wa-spec'), osc=$('wa-osc');
const sctx=spec?spec.getContext('2d'):null, octx=osc?osc.getContext('2d'):null;
let phase=0;
setInterval(()=>{
  if(sctx){
    const W=spec.width,H=spec.height; sctx.clearRect(0,0,W,H);
    const n=19, bw=W/n;
    for(let i=0;i<n;i++){
      const v=playing?(0.15+0.85*Math.abs(Math.sin(phase*0.35+i*0.9)*Math.random())):0.06;
      const h=Math.max(2,v*H);
      sctx.fillStyle=i<13?'#00ff41':'#ff2b2b';
      sctx.fillRect(i*bw+1,H-h,bw-2,h);
    }
  }
  if(octx){
    const W=osc.width,H=osc.height; octx.clearRect(0,0,W,H);
    octx.strokeStyle='#00ff41'; octx.lineWidth=1; octx.beginPath();
    for(let x=0;x<W;x++){
      const y=H/2+Math.sin(x*0.3+phase)*(playing?H*0.32*(0.4+0.6*Math.abs(Math.sin(phase*0.2))):1.5);
      x===0?octx.moveTo(x,y):octx.lineTo(x,y);
    }
    octx.stroke();
  }
  phase+=playing?1:0.05;
  const eq=$('wa-eq');
  if(eq){[...eq.children].forEach((b,i)=>{b.style.height=(playing?(6+Math.random()*20):4)+'px'})}
},90);
function load(i,autoplay){
  idx=(i+tracks.length)%tracks.length;sec=0;
  if(au.src!==new URL(tracks[idx].src,document.baseURI).href) au.src=tracks[idx].src;
  renderPlayer();
  if(autoplay){au.play().catch(()=>{});}
}
function play(){playing=true;au.play().catch(()=>{playing=true;clearInterval(timer);timer=setInterval(tick,1000);renderPlayer()});renderPlayer()}
function pause(){playing=false;au.pause();clearInterval(timer);renderPlayer()}
function tick(){sec++; if(sec>=curDur()){load(idx+1,true);return} renderPlayer()}
function go(i){load(i,true);print(`<div class="dim">▶ ahora: <span class="grn">${tracks[idx].t}</span> <span class="dim">[${curDl()}]</span></div>`)}
function listTracks(){
  let h=`<div class="amb">== ./temas — 10 tracks, lado A/B — “Ya está pasando!” ==</div>`;
  tracks.forEach((t,i)=>{h+=`<div class="track-row ${i===idx?'active':''} ${i===idx&&playing?'playing':''}" data-i="${i}"><span class="n">${String(i+1).padStart(2,'0')}</span><span class="t">${t.t}<span class="eqmini"><i></i><i></i><i></i></span><br><span class="d">${t.side} · ${t.dl} · ${t.src.split('/').pop()}</span></span><span class="st">${i===idx&&playing?'⏸':'▶'}</span> <a href="${t.src}" download style="font-size:.7rem" onclick="event.stopPropagation()">↓mp3</a></div>`});
  h+=`<div class="dim">tip: click en un track para reproducir ▶ · audio real en <span class="grn">assets/audio/Ya esta pasando!/</span></div>`;
  print(h);
  screen.querySelectorAll('.track-row').forEach(el=>el.onclick=()=>{load(+el.dataset.i,true);print(`<div class="ok">▶ ${tracks[idx].t}</div>`)});
  renderPlayer();
}
function listPans(){
  let h=`<div class="dim">$ cat ./panfletos/*.txt</div><div class="amb">== ./panfletos — 3 archivos abajo en el blog ==</div>`;
  h+=`<div class="dim">los panfletos ahora viven en <a href="#panfletos" style="color:var(--grn)">#panfletos ↓</a> para leer cómodo en móvil.</div>`;
  print(h);
}
// boot — todo escrito directo, sin input
print(`<div class="ascii"> _____ ___ ____ _____ ___ ____ ___    _    \n|  ___|_ _/ ___|_   _|_ _/ ___|_ _|  / \\   \n| |_   | || |     | |  | || |    | | / _ \\  \n|  _|  | || |___  | |  | || |___ | |/ ___ \\ \n|_|   |___\\____| |_| |___\\____|___/_/   \\_\\\n</div><div class="ascii-fallback">FICTICIA<span>_OS</span></div><div class="dim">punk · ruido · verdad — “Ya está pasando!” 2025</div>`);
print(`<div class="dim">FICTICIA_OS v2.5 — kernel ruido cargado… <span class="ok">OK</span><br>mount /dev/cassette… <span class="ok">OK</span><br>audio: 10 pistas en assets/audio/Ya esta pasando!/ … <span class="ok">OK</span></div>`);
print(`<div class="dim">$ ls ./temas/ ./assets/audio/"Ya esta pasando!"/</div>`);
listTracks();
listPans();
print(`<div class="dim">$ próxima fecha: <span class="grn">SÁB — el galpón, 23h — entrada libre</span> · VIE — sótano 77 con LAS RUINAS</div>`);
// audio real <-> UI
au.addEventListener('timeupdate',()=>{sec=Math.floor(au.currentTime||0);renderPlayer()});
au.addEventListener('loadedmetadata',()=>{renderPlayer()});
au.addEventListener('play',()=>{playing=true;clearInterval(timer);renderPlayer()});
au.addEventListener('pause',()=>{playing=false;renderPlayer()});
au.addEventListener('ended',()=>go(idx+1));
// winamp buttons + sliders
$('b-play').onclick=()=>{load(idx,sec>0&&au.src?false:true);play();};
const bpause=$('b-pause'); if(bpause) bpause.onclick=()=>pause();
$('b-next').onclick=()=>go(idx+1); $('b-prev').onclick=()=>go(idx-1);
$('b-stop').onclick=()=>{pause();try{au.currentTime=0}catch(e){}sec=0;renderPlayer()};
const bej=$('b-eject'); if(bej) bej.onclick=()=>{document.getElementById('screen').scrollIntoView({behavior:'smooth'});print(`<div class="dim">⏏ eject… playlist = terminal ./temas (10 mp3)</div>`)};
$('prog').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();const ns=Math.floor(((e.clientX-r.left)/r.width)*curDur());sec=ns;try{au.currentTime=ns}catch(e){}renderPlayer()};
const vv=$('wa-vol'); if(vv) vv.oninput=()=>{au.volume=vv.value/100};
const vb=$('wa-bal'); if(vb) vb.oninput=()=>{try{au.stereoPanner?au.stereoPanner=null:null}catch(e){} const p=(vb.value-50)/50; if(au.setSinkId===undefined){} try{ const ctx=au._ctx||(au._ctx=new (window.AudioContext||window.webkitAudioContext)()); }catch(e){} const st=$('led-st'),mo=$('led-mo'); if(st&&mo){ const mono=Math.abs(p)<0.05; st.classList.toggle('off',mono); mo.classList.toggle('off',!mono);} };
load(0,false); renderPlayer();
// blog nav ← → (scroll horizontal en móvil)
// modal panfleto completo
let panIdx=0;
function openPan(i){
  panIdx=(i+pans.length)%pans.length;
  const p=pans[panIdx];
  $('pan-file').textContent='── panfleto_0'+(panIdx+1)+'.txt ──';
  $('pan-title').textContent='▓ '+p.t;
  $('pan-date').textContent='['+p.f+']';
  $('pan-body').innerHTML=p.full.map(x=>'<p>$ '+x+'</p>').join('');
  $('pan-modal').hidden=false;
  document.body.style.overflow='hidden';
}
function closePan(){const m=$('pan-modal'); if(m)m.hidden=true;document.body.style.overflow='';}
document.querySelectorAll('.read-more').forEach(b=>b.onclick=()=>openPan(+b.dataset.pan));
const _pc=$('pan-close'); if(_pc)_pc.onclick=closePan;
const _pp=$('pan-prev'); if(_pp)_pp.onclick=()=>openPan(panIdx-1);
const _pn=$('pan-next'); if(_pn)_pn.onclick=()=>openPan(panIdx+1);
const _ov=$('pan-modal');
if(_ov)_ov.addEventListener('click',e=>{if(e.target===_ov)closePan()});
document.addEventListener('keydown',e=>{const m=$('pan-modal'); if(e.key==='Escape'&&m&&!m.hidden)closePan()});
const _grid=document.getElementById('blog-grid');
const _bp=document.getElementById('blog-prev'), _bn=document.getElementById('blog-next');
if(_grid){
  const step=()=>{const c=_grid.querySelector('.post');return c?c.offsetWidth+16:300};
  if(_bp)_bp.onclick=()=>_grid.scrollBy({left:-step(),behavior:'smooth'});
  if(_bn)_bn.onclick=()=>_grid.scrollBy({left:step(),behavior:'smooth'});
}
