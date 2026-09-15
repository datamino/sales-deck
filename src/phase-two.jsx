import React from 'react';
import { ArrowRightIcon, CheckIcon, Cross2Icon, PersonIcon, GearIcon, LockClosedIcon } from '@radix-ui/react-icons';

/* ---- Shared diagram pieces, all inline SVG so they stay sharp when projected ---- */

/* One icon per agent, drawn on a 20x20 grid. */
const ICONS = {
 PULSE:'M0 11h4l3-8 4 15 3-7h6',
 SCOUT:'M8.5 2a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M13.4 13.4 19 19',
 RAPID:'M3 1h9l5 5v13H3zM12 1v5h5M6 11h8M6 15h5',
 FORGE:'M1 3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7l-5 5v-5H3a2 2 0 0 1-2-2z',
 SENTRY:'M10 1l8 3v6c0 5-8 9-8 9s-8-4-8-9V4zM6 10l3 3 5-6',
 MASTER:'M10 1l9 5-9 5-9-5zM1 11l9 5 9-5M1 15l9 5 9-5',
 SHEET:'M1 1h18v18H1zM1 7h18M7 7v12M13 7v12',
 CODE:'M6 4 1 10l5 6M14 4l5 6-5 6',
 SPARK:'M10 1l2.2 5.8L18 9l-5.8 2.2L10 17l-2.2-5.8L2 9l5.8-2.2z',
 SEND:'M19 1 1 8l7 3 3 7zM8 11 19 1',
 EYE:'M1 10s3.6-6 9-6 9 6 9 6-3.6 6-9 6-9-6-9-6zM10 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5',
 NOTE:'M6 2h8v3H6zM6 3H4v16h12V3h-2M7 10h6M7 14h4',
 PRICE:'M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18M10 5v10M7.5 7.5h5M7.5 12.5h5',
 CHECK:'M3 10l5 5 9-10',
 PERSON:'M10 2a3.4 3.4 0 1 1 0 6.8A3.4 3.4 0 0 1 10 2M2.5 19c0-4.2 3.4-7.5 7.5-7.5s7.5 3.3 7.5 7.5',
 BELL:'M10 1a6 6 0 0 0-6 6v4l-2 3h16l-2-3V7a6 6 0 0 0-6-6M8 17a2 2 0 0 0 4 0',
 CHART:'M1 19V1M1 19h18M4.5 15l4-6 4 3 5-8',
 CROSS:'M4.5 4.5l11 11M15.5 4.5l-11 11',
 LINK:'M8 12a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M12 8a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1',
};
const AGENTS = [
 ['PULSE','Sales Agent'], ['SCOUT','Market Agent'], ['RAPID','Quote Agent'],
 ['FORGE','Meeting Agent'], ['SENTRY','Partner Agent'],
];

function TreeDiagram({head, nodes, gap=30, W=930, boxW=152}){
 const boxH=98, rowY=228, stagger=46;
 const dropOf=i=>i%2===1?stagger:0;
 const total=nodes.length*boxW+(nodes.length-1)*gap;
 const startX=(W-total)/2, centre=W/2, headW=364, headY=6;
 const Icon=({name,x,y})=><g transform={`translate(${x} ${y})`} fill="none" stroke="#23251f"
   strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"><path d={ICONS[name]}/></g>;
 return <svg className="p2-diagram" viewBox={`0 0 ${W} ${rowY+stagger+boxH+4}`} role="img" aria-label={head.aria}>
  <defs><marker id="p2arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
   <path d="M0 0 7 3.5 0 7" fill="#23251f"/></marker></defs>

  <g className="p2-node is-head">
   <rect x={centre-headW/2} y={headY} width={headW} height={boxH} rx="9" fill="#f2d666" stroke="#23251f" strokeWidth="1.6"/>
   <Icon name={head.icon} x={centre-10} y={headY+16}/>
   <text x={centre} y={headY+64} textAnchor="middle" fontSize="18" fontWeight="700">{head.name}</text>
   <text x={centre} y={headY+82} textAnchor="middle" fontSize="12" fill="#6c6a50">{head.role}</text>
  </g>

  <g className="p2-edges" fill="none" stroke="#23251f" strokeWidth="1.5">
   <path d={`M${centre} ${headY+boxH+4} V${rowY-34}`}/>
   <path d={`M${startX+boxW/2} ${rowY-34} H${startX+total-boxW/2}`}/>
   {nodes.map((n,i)=><path key={n.name} d={`M${startX+i*(boxW+gap)+boxW/2} ${rowY-34} V${rowY+dropOf(i)-4}`} markerEnd="url(#p2arrow)"/>)}
  </g>

  {nodes.map((n,i)=>{
   const x=startX+i*(boxW+gap), y=rowY+dropOf(i);
   return <g key={n.name} className="p2-node">
    <rect x={x} y={y} width={boxW} height={boxH} rx="9" fill={n.tone==='ai'?'#f7ecc4':n.tone==='human'?'#f2d666':'#f3f1e7'} stroke="#23251f" strokeWidth="1.6"/>
    <Icon name={n.icon} x={x+boxW/2-10} y={y+16}/>
    <text x={x+boxW/2} y={y+64} textAnchor="middle" fontSize="16" fontWeight="700">{n.name}</text>
    <text x={x+boxW/2} y={y+82} textAnchor="middle" fontSize="12" fontWeight={n.strong?700:400} fill={n.strong?"#4a5040":"#7c8170"}>{n.role}</text>
   </g>;
  })}
 </svg>;
}

export function SystemDiagram(){
 return <TreeDiagram
  head={{name:'Ornare Master', role:'Orchestration layer', icon:'MASTER', aria:'Ornare Master orchestrating five specialist agents'}}
  nodes={AGENTS.map(([name,role])=>({name,role,icon:name}))}/>;
}

const PULSE_STAGES=[
 {name:'READ', role:'Deal’s full history', icon:'SHEET'},
 {name:'COMPUTE', role:'KPIs, metrics', icon:'CODE'},
 {name:'AGENT', role:'Report summary', icon:'SPARK'},
 {name:'SEND', role:'Email and WhatsApp', icon:'SEND'},
];
export function PulseDiagram(){
 return <TreeDiagram gap={54}
  head={{name:'Ornare Showroom Data', role:'Brazil · USA · UAE · Europe', icon:'SHEET', aria:'Pulse pipeline from showroom data to delivered brief'}}
  nodes={PULSE_STAGES}/>;
}

export function DottedSquare(){
 return <svg className="p2-dotted" viewBox="0 0 96 96" aria-hidden="true">
  <defs><pattern id="p2dots" width="12" height="12" patternUnits="userSpaceOnUse">
   <circle cx="2" cy="2" r="1.5" fill="#c7c6b6"/></pattern></defs>
  <rect width="96" height="96" fill="url(#p2dots)"/></svg>;
}

/* A stage chain: code stages sit flat, the AI stage is outlined, the human stage is gold. */
export function Flow({stages}){
 return <div className="p2-flow">{stages.map((s,i)=><React.Fragment key={s.label}>
  <span className={`p2-stage is-${s.kind||'code'}`}><b>{s.label}</b>{s.note&&<i>{s.note}</i>}</span>
  {i<stages.length-1&&<ArrowRightIcon className="p2-flow-arrow"/>}
 </React.Fragment>)}</div>;
}

function Impact({from,to}){
 return <div className="p2-impact">
  <div><span className="mono">FROM</span><p>{from}</p></div>
  <ArrowRightIcon/>
  <div className="is-after"><span className="mono">TO</span><p>{to}</p></div>
 </div>;
}

function AgentHead({name,line}){
 return <div className="p2-head"><span className="p2-agent-name mono">{name}</span><h2>{line}</h2></div>;
}

/* ---- 01 The system ---- */
const PRINCIPLE=[
 ['DETERMINISTIC','Where precision matters'],
 ['AI','Where reasoning matters'],
 ['HUMAN','Where judgment matters'],
];
function TheSystem(){
 return <div className="p2 p2-system">
  <div className="p2-head">
   <h2 className="p2-system-title">Five agents. One <em>intelligence layer</em>.</h2>
  </div>
  <div className="p2-system-body">
   <SystemDiagram/>
   <DottedSquare/>
  </div>
  <ul className="p2-principle-list">
   {PRINCIPLE.map(([term,rest])=><li key={term}>
    <b className="mono">{term}</b><span>{rest}</span>
   </li>)}
  </ul>
 </div>;
}

/* ---- 02 Pulse ---- */
const PULSE_FACTS=[
 ['EVERY MORNING','Sends 11:00 UTC, unasked'],
 ['CORE FUNCTION','Stalled-deal detection'],
 ['INTEGRATION','Email + WhatsApp'],
];
function Pulse(){
 return <div className="p2 p2-system">
  <div className="p2-head">
   <h2 className="p2-system-title">Turn pipeline data into <em>early signals</em>.</h2>
   <a className="p2-link" href="https://attached-reggae-tries-smooth.trycloudflare.com/" target="_blank" rel="noreferrer">
    Open the live Pulse dashboard <ArrowRightIcon/></a>
  </div>
  <div className="p2-system-body">
   <PulseDiagram/>
   <DottedSquare/>
  </div>
  <ul className="p2-principle-list">
   {PULSE_FACTS.map(([term,rest])=><li key={term}>
    <b className="mono">{term}</b><span>{rest}</span>
   </li>)}
  </ul>
 </div>;
}

/* ---- A shared shell so every agent slide reads the same ---- */
function AgentSlide({title, link, head, nodes, facts, gap, W, boxW}){
 return <div className="p2 p2-system">
  <div className="p2-head">
   <h2 className="p2-system-title">{title}</h2>
   {link&&<a className="p2-link" href={link.href} target="_blank" rel="noreferrer">{link.label} <ArrowRightIcon/></a>}
  </div>
  <div className="p2-system-body">
   <TreeDiagram head={head} nodes={nodes} gap={gap} W={W} boxW={boxW}/>
   <DottedSquare/>
  </div>
  <ul className="p2-principle-list">
   {facts.map(([term,rest])=><li key={term}><b className="mono">{term}</b><span>{rest}</span></li>)}
  </ul>
 </div>;
}

/* ---- 03 Scout ---- */
function Scout(){
 return <AgentSlide W={1060} boxW={196} gap={20}
  title={<>Turn market noise into <em>competitive intelligence</em>.</>}
  head={{name:'Find Competitors', role:'Poliform · Valcucine · Florense', icon:'EYE', aria:'Scout checking a named watchlist and judging what is genuinely new'}}
  nodes={[
   {name:'SEARCH ONLINE', role:'News, collections, trends', icon:'SCOUT'},
   {name:'EVIDENCE', role:'Only what changed', icon:'NOTE'},
   {name:'AI AGENT', role:'Judge real signals', icon:'SPARK', tone:'ai'},
   {name:'WEEKLY BRIEF', role:'Email and WhatsApp', icon:'SEND'},
  ]}
  facts={[
   ['EVERY MONDAY','One brief, on a schedule'],
   ['NAMED SET','A fixed list, not the web'],
   ['SIGNAL VS NOISE','Reads the article, not titles'],
  ]}/>;
}

/* ---- 04 Rapid ---- */
function Rapid(){
 return <AgentSlide W={1060} boxW={196} gap={16}
  title={<>Turn a request into a <em>ready-to-review</em> quote.</>}
  head={{name:'Reads Client Request', role:'On email, or a Read.ai transcript', icon:'RAPID', aria:'Rapid from a client request through pricing to a human approval gate'}}
  nodes={[
   {name:'MATCH CATALOG', role:'25 real SKUs', icon:'NOTE'},
   {name:'CALCULATE PRICE', role:'Pure math, no AI', icon:'PRICE'},
   {name:'AUDIT LOG', role:'Written before sending', icon:'SHEET'},
   {name:'AI AGENT', role:'Quote + internal note', icon:'SPARK', tone:'ai'},
   {name:'APPROVAL', role:'Accept · Reject · Edit', icon:'PERSON', tone:'human'},
  ]}
  facts={[
   ['CODE','Calculates every price'],
   ['AI','Reasons, matches and drafts'],
   ['HUMAN','Accepts, edits or rejects'],
  ]}/>;
}

/* ---- 05 Forge ---- */
function Forge(){
 return <AgentSlide W={1060} boxW={196} gap={16}
  title={<>Turn conversations into <em>structured intelligence</em>.</>}
  head={{name:'Read.ai Webhook', role:'Fires the moment a meeting ends', icon:'LINK', aria:'Forge verifying a transcript, classifying it and routing the result'}}
  nodes={[
   {name:'VERIFY', role:'Signature checked', icon:'SENTRY'},
   {name:'AI AGENT', role:'Summary + action items', icon:'SPARK', tone:'ai'},
   {name:'CLIENT REQUEST', role:'→ Rapid’s own format', icon:'RAPID'},
   {name:'PARTNER SIGNAL', role:'→ Sentry’s own format', icon:'PERSON'},
   {name:'MEETINGS LOG', role:'Permanent record', icon:'SHEET'},
  ]}
  facts={[
   ['EVENT-DRIVEN','Fires when the meeting ends'],
   ['DEFAULTS TO NO','Unclear means no handoff'],
   ['NO ROSTER','It writes files, not emails'],
  ]}/>;
}

/* ---- 06 Sentry ---- */
function Sentry(){
 return <AgentSlide W={1060} boxW={196} gap={16}
  title={<>Detect when valuable relationships <em>go quiet</em>.</>}
  head={{name:'Pulse’s Own Snapshot', role:'Reused, never duplicated', icon:'SHEET', aria:'Sentry measuring each referring firm against its own referral rhythm'}}
  nodes={[
   {name:'FIRM RHYTHM', role:'Each firm’s own pace', icon:'CHART'},
   {name:'FLAG SILENCE', role:'Past its own normal', icon:'PULSE'},
   {name:'EXTERNAL CHECK', role:'Public project work', icon:'EYE'},
   {name:'AI AGENT', role:'Prioritise what’s urgent', icon:'SPARK', tone:'ai'},
   {name:'WEEKLY DIGEST', role:'Email and WhatsApp', icon:'BELL'},
  ]}
  facts={[
   ['EVERY MONDAY','Weekly firm-health check'],
   ['OWN BASELINE','Not a fixed threshold'],
   ['CONTINUITY','Carries across weeks'],
  ]}/>;
}

/* ---- 08 The impact ---- */
const SHIFTS=[
 ['Find the numbers','Understand the signal'],
 ['Search for information','Receive the intelligence'],
 ['Build quotes manually','Review and approve'],
 ['Process transcripts','Act on the insight'],
 ['Notice relationship changes late','See them early'],
];
function TheImpact(){
 return <div className="p2 p2-system p2-shift-view">
  <div className="p2-head">
   <h2 className="p2-system-title">It changes <em>where the team’s time goes</em>.</h2>
  </div>
  <span className="p3-mark" aria-hidden="true"><DottedSquare/></span>
  <div className="p2-shift-panels">
   <div className="p2-panel is-before">
    <span className="mono">BEFORE</span>
    <ul>{SHIFTS.map(([b])=><li key={b}>{b}</li>)}</ul>
   </div>
   <span className="p3-arrow"><ArrowRightIcon/></span>
   <div className="p2-panel is-after">
    <span className="mono">AFTER</span>
    <ul>{SHIFTS.map(([,a])=><li key={a}>{a}</li>)}</ul>
   </div>
  </div>
  <ul className="p2-principle-list">
   {[['LESS CHASING','Fewer handoffs to track'],
     ['LESS REPETITION','The same work stops'],
     ['MORE ATTENTION','Where judgment matters']].map(([term,rest])=>
    <li key={term}><b className="mono">{term}</b><span>{rest}</span></li>)}
  </ul>
 </div>;
}

const slides=[TheSystem,Pulse,Scout,Rapid,Forge,Sentry,TheImpact];
export default function PhaseTwo({chapter}){
 const Slide=slides[chapter]||slides[0];
 return <Slide/>;
}
