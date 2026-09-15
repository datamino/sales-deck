import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRightIcon, ArrowLeftIcon, ChevronRightIcon, CopyIcon, EnterFullScreenIcon, ExitFullScreenIcon, CheckIcon, EyeOpenIcon, Cross2Icon, HandIcon } from '@radix-ui/react-icons';
import PhaseOne from './phase-one.jsx';
import PhaseTwo from './phase-two.jsx';
import PhaseThree from './phase-three.jsx';
import './style.css';

const phases = [
 {name:'The Brief', summary:'What the client asked for, and what we refused to automate.',
  chapters:['The opportunity','Why Ornare','The big idea'], art:'/part-1.png', alt:'A showroom kitchen display with wood and stone material samples'},
 {name:'The Five Agents', summary:'How intelligence moves through the system, and what changes because of it.',
  chapters:['The system','Pulse','Scout','Rapid','Forge','Sentry','The impact'], art:'/part-2.png', alt:'A walnut closet system with five separate backlit compartments'},
 {name:'The Approach', summary:'The five agents are the proof of the approach, not the limit of it.',
  chapters:['Built around you','Thank you'], art:'/part-3.png', alt:'A close detail of walnut and stone meeting at a mitred corner'},
];
const chaptersOf = p => phases[p].chapters;
const pad = n => String(n).padStart(2,'0');
const chapterHref = (phase,chapter) => `#phase/${phase+1}/chapter/${chapter+1}`;
const steps=[{view:'cover',focus:0},...phases.flatMap((p,i)=>[{view:'phases',focus:i},...p.chapters.map((_,j)=>({view:'chapter',phase:i,chapter:j,focus:i}))])];
const stepHash=s=>s.view==='cover'?'#cover':s.view==='phases'?`#phases/${s.focus+1}`:chapterHref(s.phase,s.chapter);
const stepIndex=r=>steps.findIndex(s=>s.view===r.view&&(r.view==='chapter'?s.phase===r.phase&&s.chapter===r.chapter:r.view==='phases'?s.focus===r.focus:true));
function readRoute(){
 const match=location.hash.match(/^#phase\/([1-3])\/chapter\/([1-9])$/);
 if(match){const phase=Number(match[1])-1;return {view:'chapter',phase,chapter:Math.min(Number(match[2])-1,chaptersOf(phase).length-1),focus:phase}}
 const list=location.hash.match(/^#phases(?:\/([1-3]))?$/);
 if(list)return {view:'phases',phase:0,chapter:0,focus:list[1]?Number(list[1])-1:0,marked:!!list[1]};
 const old=['#introduction','#problem','#solution','#architecture'].indexOf(location.hash);
 if(old>=0)return {view:'chapter',phase:0,chapter:old,focus:0};
 return {view:'cover',phase:0,chapter:0,focus:0};
}
function ChapterNav({phase,chapter}){
 const list=useRef(null),timer=useRef(null);
 const [hint,setHint]=useState(false);
 const stop=()=>{clearTimeout(timer.current);setHint(false)};
 const start=()=>{clearTimeout(timer.current);timer.current=setTimeout(()=>setHint(true),2000)};
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{
   const nav=list.current,active=nav?.children[chapter];
   if(!active)return;
   const top=active.offsetTop;
   if(top<nav.scrollTop||top+active.offsetHeight>nav.scrollTop+nav.clientHeight)nav.scrollTop=nav.children[Math.floor(chapter/6)*6].offsetTop;
   stop();
 },[chapter,phase]);
 return <div className="chapter-navigation" onPointerEnter={start} onPointerLeave={stop} onPointerDown={start} onPointerUp={e=>{if(e.pointerType!=='mouse')stop()}} onPointerCancel={stop} onFocus={start} onBlur={stop}>
 <nav ref={list} aria-label="Presentation chapters" className="chapter-list" onScroll={()=>setHint(false)}>{chaptersOf(phase).map((label,i)=><a key={i} href={chapterHref(phase,i)} className={`nav-link ${chapter===i?'active':''}`} aria-current={chapter===i?'page':undefined}><span className="chapter-number">{pad(i+1)}</span><span>{label}</span><ChevronRightIcon/></a>)}</nav>
 <div className={`scroll-hint ${hint?'visible':''}`} role="status"><HandIcon/><span>Scroll to explore chapters</span><span aria-hidden="true">↓</span></div>
 </div>
}
function Art(){return <svg className="hero-art" viewBox="0 0 410 505" role="img" aria-label="Intersecting cream, yellow, and black architectural panels"><defs><linearGradient id="yellow" x2="1" y2="1"><stop stopColor="#ffe778"/><stop offset="1" stopColor="#ffdb45"/></linearGradient><linearGradient id="black" x2="1" y2="1"><stop stopColor="#30302a"/><stop offset="1" stopColor="#141411"/></linearGradient></defs><g stroke="#1b1b17" strokeWidth="2.2" strokeLinejoin="round"><path d="M51 148 166 80 166 324 51 391Z" fill="#f7f4e9"/><path d="m58 152 101-60" stroke="#dedbd1" strokeWidth="4"/><path d="m232 236 104-61 1 141-105 60Z" fill="#faf8ee"/><path d="m239 240 90-52" stroke="#dedbd1" strokeWidth="4"/><path d="m206 186 74 43 1 164-75-44Z" fill="url(#black)"/><path d="m158 48 109 63 1 263-110-64Z" fill="url(#yellow)"/><path d="m93 186 117 68 1 232-118-69Z" fill="url(#black)" transform="translate(0 -4)"/><path d="m97 189 109 64" stroke="#48483f"/></g></svg>}
function Diagram({selected,onSelect}){
 const nodes=[['Client','Web / Mobile',25,35,145],['DNS / CDN','Global delivery',195,35,145],['Users','Customers',365,35,145],['Load Balancer','Traffic distribution',174,150,190],['Auth Service','Authentication',390,150,145],['API Service','Business logic',25,266,145],['Worker Service','Background jobs',195,266,145],['Notifications','Email / SMS / Push',365,266,145],['Database','PostgreSQL',25,384,145],['Cache','Redis',195,384,145],['Storage','Object storage',365,384,145]];
 return <div className="diagram-frame"><div className="flex justify-between items-center gap-2 border-b border-dashed border-stone-400 pb-3"><span className="tag">SYSTEM ARCHITECTURE</span><span className="mono text-[9px]">HIGH LEVEL VIEW</span></div><svg viewBox="0 0 555 480" role="group" aria-label="Interactive system architecture"><defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 6 3 0 6" fill="#24241d"/></marker></defs><g fill="none" stroke="#24241d" strokeWidth="1.4" markerEnd="url(#arrow)"><path d="M267 114V148"/><path d="M365 186H387"/><path d="M267 225V247H97V263"/><path d="M267 225V263"/><path d="M267 247H437V263"/><path d="M97 342V381"/><path d="M267 342V381"/><path d="M437 342V381"/></g>{nodes.map(([name,sub,x,y,w],i)=><g key={name} role="button" tabIndex="0" aria-label={`Inspect ${name}`} aria-pressed={selected===name} onClick={()=>onSelect(name)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(name)}}} className="diagram-node"><rect x={x} y={y} width={w} height="78" rx="5" fill={i===3||selected===name?'#ffe166':'#f4f1e8'} stroke="#33332b" strokeWidth={selected===name?2.5:1.2}/><g transform={`translate(${x+w/2-10} ${y+11})`} stroke="#22221d" strokeWidth="1.8" fill="none">{i>7?<><ellipse cx="10" cy="4" rx="9" ry="4"/><path d="M1 4v14c0 5 18 5 18 0V4M1 11c0 5 18 5 18 0"/></>:i===0?<><rect width="20" height="14" rx="1"/><path d="M10 14v5M4 20h12"/></>:i===1?<><circle cx="10" cy="10" r="10"/><ellipse cx="10" cy="10" rx="4" ry="10"/><path d="M0 10h20"/></>:i===4?<path d="m10 0 10 4v8c0 6-10 10-10 10S0 18 0 12V4ZM5 10l4 4 7-8"/>:<><path d="m10 0 10 6v11l-10 6L0 17V6ZM0 6l10 6 10-6M10 12v11"/></>}</g><text x={x+w/2} y={y+49} textAnchor="middle" fontSize="12" fontWeight="700">{name}</text><text x={x+w/2} y={y+65} textAnchor="middle" fontSize="9.5">{sub}</text></g>)}</svg><p className="mono text-[9px] text-stone-500">SELECT A COMPONENT TO EXPLORE</p></div>}
const descriptions={'Client':'The web or mobile app where people interact with your product.','DNS / CDN':'Routes visitors to the application and serves static content close to them.','Users':'The customers and teams the system is designed to serve.','Load Balancer':'Distributes incoming requests across available application services.','Auth Service':'Verifies identity and controls access to protected resources.','API Service':'Handles requests and applies the product’s business rules.','Worker Service':'Runs longer tasks in the background without slowing down the interface.','Notifications':'Sends email, SMS, and push updates through delivery providers.','Database':'Stores the application’s persistent, structured records.','Cache':'Keeps frequently accessed data ready for fast retrieval.','Storage':'Holds uploaded files, images, and other binary assets.'};
function App(){
 const [route,setRoute]=useState(readRoute),[fs,setFs]=useState(false),[selected,setSelected]=useState(null);
 const {view,phase,chapter,focus,marked}=route,layout=chapter%4;
 const step=stepIndex(route),lastStep=steps.length-1;
 const goStep=d=>{const next=steps[step+d];if(next)location.hash=stepHash(next).slice(1)};
 const fsElement=()=>document.fullscreenElement||document.webkitFullscreenElement;
 const togglePresent=()=>{
  const doc=document,el=doc.documentElement;
  if(fsElement()){(doc.exitFullscreen||doc.webkitExitFullscreen)?.call(doc);return}
  const req=el.requestFullscreen||el.webkitRequestFullscreen;
  if(req)Promise.resolve(req.call(el)).catch(()=>{});
 };
 useEffect(()=>{const change=()=>{setRoute(readRoute());setSelected(null)};window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 useEffect(()=>{document.title=view==='cover'?'Ornare — Work that runs itself':view==='phases'?'Contents — Ornare':`${phases[phase].name} · ${chapter+1}. ${chaptersOf(phase)[chapter]} — Ornare`;},[view,phase,chapter,layout]);
 useEffect(()=>{const sync=()=>setFs(!!(document.fullscreenElement||document.webkitFullscreenElement));document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);return()=>{document.removeEventListener('fullscreenchange',sync);document.removeEventListener('webkitfullscreenchange',sync)}},[]);
 useEffect(()=>{const key=e=>{if(e.target.closest('input,textarea'))return;if(e.shiftKey&&(e.key==='P'||e.key==='p')){e.preventDefault();togglePresent();return}if(e.key==='Escape'){if(fsElement())(document.exitFullscreen||document.webkitExitFullscreen)?.call(document);setSelected(null);return}if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,[role="button"]'))return;if(e.key==='ArrowRight'){e.preventDefault();goStep(1)}if(e.key==='ArrowLeft'){e.preventDefault();goStep(-1)}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[view,phase,chapter]);
 return <div className={`site-shell ${view}-view`}>
 <a className="skip-link" href="#main" onClick={e=>{e.preventDefault();document.querySelector('#main')?.focus()}}>Skip to content</a>
 <header className="site-header"><a href="#cover" className="brand" aria-label="Ornare home"><img className="brand-logo" src="/logo.png" alt="Ornare"/><span>ORNARE</span></a><div className="header-actions">{view!=='cover'&&<a className="back-link" href={view==='chapter'?'#phases':'#cover'}><ArrowLeftIcon/>{view==='chapter'?'All phases':'Back to cover'}</a>}<button className="outline-button present-button" onClick={togglePresent} title="Full screen (Shift + P)">{fs?<ExitFullScreenIcon/>:<EnterFullScreenIcon/>}{fs?'Exit':'Present'}</button></div></header>
 {view==='cover'&&<main id="main" tabIndex="-1" className="cover-main"><div className="cover-copy"><p className="eyebrow">ORNARE · AUTOMATION SYSTEM</p><h1>Work that<br/><span>runs itself.</span></h1><p className="cover-description">Five specialist agents on real company data.<br/>Humans stay in charge of money and clients.</p><a className="primary-button cover-cta" href="#phases">Start the walkthrough <ArrowRightIcon/></a></div><div className="cover-art"><span className="art-arc" aria-hidden="true"/><span className="art-arc art-arc-2" aria-hidden="true"/><span className="art-arc art-arc-3" aria-hidden="true"/><div className="cover-art-disc"><img src="/cover-art.png" alt="An Ornare kitchen: walnut cabinetry and a stone island" onError={e=>{e.currentTarget.closest('.cover-art-disc').classList.add('is-empty')}}/></div></div></main>}
 {view==='phases'&&<main id="main" tabIndex="-1" className="contents-main"><div className="contents-heading"><p className="eyebrow">CONTENTS</p><h1>Five <em>agents</em>.<br/>One <em>operating system</em>.</h1><p>Eleven chapters, in three parts. Pick where to start.</p></div><div className="phase-list">{phases.map((p,i)=><a href={chapterHref(i,0)} className={`phase-link ${marked&&focus===i?'is-next':''}`} key={p.name}><div className="phase-art"><img src={p.art} alt={p.alt} loading="lazy"/></div><div className="phase-name"><span className="eyebrow">PART {pad(i+1)}</span><h2>{p.name}</h2><p>{p.summary}</p></div><span className="phase-count">{pad(p.chapters.length)} chapters</span><span className="phase-arrow"><ArrowRightIcon/></span></a>)}</div><div className="contents-footer"><p className="contents-note mono"><span className="small-square"/> EVERY NUMBER IN THIS DECK IS COMPUTED BY CODE, NOT WRITTEN BY AN LLM.</p><div className="slide-controls"><button className="page-arrow" aria-label="Previous" disabled={step<=0} onClick={()=>goStep(-1)}><ArrowLeftIcon/></button><span>{marked?phases[focus].name:'All parts'}</span><button className="page-arrow" aria-label="Next" disabled={step>=lastStep} onClick={()=>goStep(1)}><ArrowRightIcon/></button></div></div></main>}
 {view==='chapter'&&<div className="chapter-layout"><aside className="sidebar"><a href="#phases" className="phase-context"><span className="eyebrow">PART {pad(phase+1)}</span><strong>{phases[phase].name}</strong><span>Change phase <ChevronRightIcon/></span></a><ChapterNav phase={phase} chapter={chapter}/></aside>
 <main id="main" tabIndex="-1" className="chapter-main"><div className="page-heading"><h1>{phases[phase].name}.</h1><p>ORNARE · AUTOMATION SYSTEM</p></div>
 <section className={`slide slide-${layout}`} aria-label={`${phases[phase].name} — ${chapter+1}. ${chaptersOf(phase)[chapter]}`}>
 <div className="slide-toolbar"><span className="tag slide-tag">{pad(chapter+1)} — {chaptersOf(phase)[chapter].toUpperCase()}</span><span className="chapter-position">{pad(chapter+1)} <span>/ {pad(chaptersOf(phase).length)}</span></span></div>
 <div key={`${phase}-${chapter}`} className="slide-content">
 {phase===0?<PhaseOne chapter={chapter}/>:phase===1?<PhaseTwo chapter={chapter}/>:phase===2?<PhaseThree chapter={chapter}/>:<>
 {layout===0&&<div className="intro-grid grid items-center"><div className="intro-copy"><span className="eyebrow mono">FROM IDEAS TO IMPACT</span><h2>Ideas<br/>into Impact.</h2><p className="lead">A showcase of vision, process,<br className="hidden xl:block"/> and possibilities.</p><div className="hero-actions flex flex-wrap items-center gap-5"><button className="primary-button" onClick={()=>goStep(1)}><CopyIcon width="19" height="19"/>Start the presentation</button><a href={chapterHref(phase, chaptersOf(phase).length-1)} className="text-link">Explore the system <ArrowRightIcon width="22" height="22"/></a></div></div><div className="art-wrap relative"><Art/></div></div>}
 {layout===1&&<div className="problem-content"><span className="tag">01 — THE CHALLENGE</span><h2>Great ideas.<br/>Disconnected execution.</h2><div className="problem-bottom grid"><p className="lead">When tools, teams, and information live apart, even simple work becomes complicated.</p><div className="problem-list">{[['Fragmented workflows','Work moves between tools. Context gets left behind.'],['Poor visibility','Teams can’t see the same picture at the same time.'],['Manual handoffs','Repeated tasks take time away from meaningful work.']].map(([t,d],i)=><div className="problem-row" key={t}><span className="mono">0{i+1}</span><div><h3>{t}</h3><p>{d}</p></div><ArrowRightIcon width="22" height="22"/></div>)}</div></div><div className="statement mono"><span className="small-square"/> THE OPPORTUNITY: MAKE THE COMPLEX FEEL SIMPLE.</div></div>}
 {layout===2&&<div className="solution-grid grid"><div><span className="tag">02 — A BETTER WAY</span><h2>One system.<br/>Shared <br/>momentum.</h2><p className="lead">Connect people, process, and data.<br/>Give good ideas room to grow.</p><a href={chapterHref(phase, chaptersOf(phase).length-1)} className="primary-button w-fit mt-8">See how it connects <ArrowRightIcon width="21" height="21"/></a></div><div className="solution-visual"><div className="mono text-[10px] mb-7 flex justify-between"><span>THE PATH TO IMPACT</span><span>FIG. 02</span></div>{[['01','Connect','Bring your tools and information together.'],['02','Simplify','Turn complex handoffs into clear workflows.'],['03','Build','Create a product that can grow with you.']].map(([n,t,d])=><div className="flow-step" key={n}><span className="flow-number mono">{n}</span><div><h3>{t}</h3><p>{d}</p></div><ArrowRightIcon width="24" height="24"/></div>)}<div className="outcome"><CheckIcon width="22" height="22"/><div><strong>More focus. Meaningful progress.</strong><p>One connected experience, from idea to outcome.</p></div></div></div></div>}
 {layout===3&&<div className="architecture-grid grid items-center"><div><span className="tag">FROM IDEAS TO IMPACT</span><h2>Scalable <br/>Solutions for <br/>Real Problems.</h2><p className="lead">A modular architecture designed for performance, security, and scalability.</p><ul className="check-list">{['Modular & maintainable','Secure by design','Built for scale'].map(t=><li key={t}><span><CheckIcon/></span>{t}</li>)}</ul><button className="text-link mt-6" onClick={()=>setSelected('Load Balancer')}><EyeOpenIcon/>Explore the architecture <ArrowRightIcon/></button></div><div><Diagram selected={selected} onSelect={setSelected}/><div className="component-detail" aria-live="polite">{selected?<><strong>{selected}</strong><p>{descriptions[selected]}</p><button aria-label="Close component details" onClick={()=>setSelected(null)}><Cross2Icon/></button></>:<p>Illustrative architecture · Select a component for details.</p>}</div></div></div>}
 </>}
 </div>
 </section></main></div>}
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
