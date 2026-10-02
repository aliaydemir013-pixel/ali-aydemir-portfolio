const P=window.getProjects();
const cursor=document.querySelector('#cursor');
const hero=document.querySelector('#hero');
const heroVideo=hero.querySelector('.hero-video');
const header=document.querySelector('#siteHeader');
const pageProgress=document.querySelector('#pageProgress');
const workGrid=document.querySelector('#workGrid');
const motionGrid=document.querySelector('#motionGrid');
let lastY=0;

function forcePlay(video){
  if(!video||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  video.muted=true; video.defaultMuted=true; video.playsInline=true;
  const promise=video.play(); if(promise&&promise.catch)promise.catch(()=>{});
}
window.addEventListener('load',()=>{
  setTimeout(()=>document.querySelector('#loader').classList.add('done'),650);
  forcePlay(heroVideo);
  setTimeout(()=>forcePlay(heroVideo),900);
});
heroVideo.addEventListener('playing',()=>hero.classList.add('video-live'),{once:true});
heroVideo.addEventListener('canplay',()=>forcePlay(heroVideo),{once:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)forcePlay(heroVideo)});

if(matchMedia('(pointer:fine)').matches){
  document.addEventListener('mousemove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'});
}

const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

function projectTag(p){return p.context||''}
function renderWork(filter='all'){
  workGrid.innerHTML='';
  const visible=P.filter(p=>filter==='all'||p.cat.split(/\s+/).includes(filter));
  visible.forEach((p)=>{
    const originalIndex=P.indexOf(p);
    const card=document.createElement('article');
    card.className='work-card reveal';
    card.dataset.project=originalIndex;
    card.innerHTML=`
      <div class="work-card-media">
        <img src="${p.img}" loading="lazy" decoding="async" alt="${p.title}">
        <span class="work-card-open">OPEN ↗</span>
      </div>
      <div class="work-card-meta">
        <span class="num">${String(originalIndex+1).padStart(2,'0')}</span>
        <span class="type">${p.type}</span>
        <span class="tag">${projectTag(p)}</span>
      </div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>`;
    card.addEventListener('click',()=>openProject(p));
    card.addEventListener('mouseenter',()=>cursor.classList.add('show'));
    card.addEventListener('mouseleave',()=>cursor.classList.remove('show'));
    workGrid.appendChild(card); revealObserver.observe(card);
  });
}
renderWork();
document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{
  document.querySelector('.filters .active')?.classList.remove('active'); b.classList.add('active'); renderWork(b.dataset.filter);
});

const MOTION=[
  {title:'Residential Animation',type:'RESIDENTIAL / MOTION',context:'MY MİMARLIK',poster:'assets/residential-animation/residential-animation-cover.webp',preview:'assets/video/previews/residential-preview.mp4',src:'assets/video/residential-animation-full-web.mp4'},
  {title:'Istanbul Nursing Home',type:'ARCHITECTURE / MOTION',context:'CONCEPT DESIGN',poster:'assets/nursing/nursing-01.webp',preview:'assets/video/previews/nursing-preview.mp4',src:'assets/video/nursing-home-full-web.mp4'},
  {title:'Shopping Mall',type:'ARCHITECTURE / MOTION',context:'CONCEPT DESIGN',poster:'assets/mall/mall-01-waterfront-hero.webp',preview:'assets/video/previews/mall-preview.mp4',src:'assets/mall/animation-mall-full-web.mp4'},
  {title:'Steel Facility',type:'INDUSTRIAL / MOTION',context:'SITE + PROJECT FILM',poster:'assets/steel-facility/steel-facility-cover.webp',preview:'assets/video/previews/steel-preview.mp4',src:'assets/video/steel-facility-full-web.mp4'}
];

const filmModal=document.querySelector('#filmModal');
const filmPlayer=document.querySelector('#filmPlayer');
const filmTitle=document.querySelector('#filmTitle');
const filmKicker=document.querySelector('#filmKicker');
const filmClose=document.querySelector('#filmClose');
const filmFullscreen=document.querySelector('#filmFullscreen');
let activeFilm=null;

function openFilm(m){
  activeFilm=m;
  motionVideos.forEach(v=>v.pause());
  filmTitle.textContent=m.title;
  filmKicker.textContent=`${m.type} · ${m.context}`;
  filmPlayer.poster=m.poster;
  filmPlayer.src=m.src;
  filmPlayer.muted=false;
  filmPlayer.defaultMuted=false;
  filmModal.classList.add('open');
  filmModal.setAttribute('aria-hidden','false');
  document.body.classList.add('no-scroll');
  header.classList.add('hide');
  const play=filmPlayer.play();
  if(play&&play.catch)play.catch(()=>{});
}
function closeFilm(){
  if(!filmModal.classList.contains('open'))return;
  filmPlayer.pause();
  filmPlayer.removeAttribute('src');
  filmPlayer.load();
  filmModal.classList.remove('open');
  filmModal.setAttribute('aria-hidden','true');
  document.body.classList.remove('no-scroll');
  header.classList.remove('hide');
  activeFilm=null;
  motionVideos.forEach(v=>{if(v.getBoundingClientRect().top<innerHeight+180&&v.getBoundingClientRect().bottom>-180)forcePlay(v)});
  onScroll();
}

MOTION.forEach((m,i)=>{
  const card=document.createElement('article'); card.className='motion-card reveal';
  card.innerHTML=`<div class="motion-media"><video class="motion-video" autoplay muted loop playsinline preload="metadata" poster="${m.poster}"><source src="${m.preview}" type="video/mp4"></video><button class="motion-open" type="button"><span>WATCH FULL FILM</span><b>SOUND ON ↗</b></button></div><div class="motion-meta"><b>${String(i+1).padStart(2,'0')} / ${m.type}</b><span>${m.context}</span></div><h3>${m.title}</h3>`;
  card.querySelector('.motion-open').addEventListener('click',()=>openFilm(m));
  card.querySelector('.motion-media').addEventListener('dblclick',()=>openFilm(m));
  motionGrid.appendChild(card); revealObserver.observe(card);
});
const motionVideos=[...document.querySelectorAll('.motion-video')];
const motionObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
  const v=e.target;
  if(e.isIntersecting&&!filmModal.classList.contains('open')){forcePlay(v)}else{v.pause()}
}),{rootMargin:'180px 0px',threshold:.05});
motionVideos.forEach(v=>{v.addEventListener('canplay',()=>{if(v.getBoundingClientRect().top<innerHeight+180&&!filmModal.classList.contains('open'))forcePlay(v)},{once:true});motionObserver.observe(v)});
filmClose.addEventListener('click',closeFilm);
filmModal.addEventListener('click',e=>{if(e.target===filmModal)closeFilm()});
filmFullscreen.addEventListener('click',()=>{
  if(filmPlayer.requestFullscreen)filmPlayer.requestFullscreen();
  else if(filmPlayer.webkitEnterFullscreen)filmPlayer.webkitEnterFullscreen();
});

function onScroll(){
  const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
  pageProgress.style.width=(h?y/h*100:0)+'%';
  const heroH=hero.offsetHeight;
  if(y<heroH){const p=Math.min(1,y/heroH);hero.querySelector('.hero-title').style.transform=`translateY(${p*65}px)`;hero.querySelector('.hero-title').style.opacity=1-p*.7}
  header.classList.toggle('light',y>heroH-90 && !document.body.classList.contains('no-scroll'));
  if(y>lastY+12 && y>heroH*.55)header.classList.add('hide'); else if(y<lastY-12)header.classList.remove('hide');
  lastY=y;
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

const contactModal=document.querySelector('#contactModal');
const contactClose=document.querySelector('#contactClose');
const copyEmail=document.querySelector('#copyEmail');
function openContact(e){
  if(e)e.preventDefault();
  contactModal.classList.add('open');
  contactModal.setAttribute('aria-hidden','false');
  document.body.classList.add('no-scroll');
  header.classList.add('hide');
}
function closeContact(){
  contactModal.classList.remove('open');
  contactModal.setAttribute('aria-hidden','true');
  document.body.classList.remove('no-scroll');
  header.classList.remove('hide');
  onScroll();
}
document.querySelectorAll('[data-contact]').forEach(el=>el.addEventListener('click',openContact));
contactClose.addEventListener('click',closeContact);
contactModal.addEventListener('click',e=>{if(e.target===contactModal)closeContact()});
copyEmail.addEventListener('click',async()=>{
  const email='aliaydemir013@gmail.com';
  try{await navigator.clipboard.writeText(email);copyEmail.textContent='COPIED ✓';}
  catch{copyEmail.textContent=email;}
  setTimeout(()=>copyEmail.textContent='COPY EMAIL',1800);
});

const modal=document.querySelector('#modal'),inner=document.querySelector('#modalInner');
function renderGalleryItem(item){if(Array.isArray(item))return `<figure class="gallery-row">${item.map(src=>`<img src="${src}" loading="lazy" decoding="async" alt="">`).join('')}</figure>`;return `<figure><img src="${item}" loading="lazy" alt=""></figure>`}
function openProject(p){
  const idx=P.indexOf(p),prev=P[(idx-1+P.length)%P.length],next=P[(idx+1)%P.length];
  inner.innerHTML=`<section class="project-hero"><div class="project-kicker"><span>${p.type}</span><span>${String(idx+1).padStart(2,'0')} / ${String(P.length).padStart(2,'0')}</span></div><h1 class="project-title">${p.title}</h1><div class="project-info"><p>${p.desc}</p><p class="credit">${p.role}</p></div></section><div class="project-gallery">${(p.gallery||[]).map(renderGalleryItem).join('')}</div><div class="project-pagination"><button class="previous-project" type="button"><small>PREVIOUS PROJECT</small><b>← ${prev.title}</b></button><button class="next-project" type="button"><small>NEXT PROJECT</small><b>${next.title} →</b></button></div>`;
  inner.querySelector('.previous-project').onclick=()=>openProject(prev);
  inner.querySelector('.next-project').onclick=()=>openProject(next);
  modal.classList.add('open');document.body.classList.add('no-scroll');header.classList.add('hide');modal.scrollTop=0;cursor.classList.remove('show');
}
function closeProject(){modal.classList.remove('open');document.body.classList.remove('no-scroll');header.classList.remove('hide');onScroll()}
document.querySelector('.close').onclick=closeProject;document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(filmModal.classList.contains('open'))closeFilm();else if(contactModal.classList.contains('open'))closeContact();else if(modal.classList.contains('open'))closeProject()}});
modal.addEventListener('scroll',()=>{const h=modal.scrollHeight-modal.clientHeight;modal.querySelector('.project-progress i').style.width=(h?modal.scrollTop/h*100:0)+'%'},{passive:true});
