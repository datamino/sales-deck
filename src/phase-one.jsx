import React from 'react';
import { ArrowRightIcon, CheckIcon, PersonIcon, GearIcon } from '@radix-ui/react-icons';

/* Pattern artwork is inline SVG so it stays sharp at any projector size. */
export function DotField({id='dots'}){
 return <svg className="pattern-field" aria-hidden="true"><defs><pattern id={id} width="15" height="15" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="#c7c6b6"/></pattern></defs><rect width="100%" height="100%" fill={`url(#${id})`}/></svg>;
}

const routines = ['Pull numbers','Check pipelines','Research competitors','Prepare quotes','Review meetings','Track relationships'];

function Opportunity(){
 return <div className="p1 p1-opportunity">
  <span className="p1-side" aria-hidden="true"><DotField id="dots-side"/></span>
  <div className="p1-copy">
   <h2>The work is valuable.<br/>The <em>repetition</em> isn't.</h2>
   <p className="lead">Across the business, teams repeat the same six routines every week. At scale, necessary work becomes a significant operational cost.</p>
   <p className="p1-question">What if repetitive business work could run itself — reliably, and on real data?</p>
  </div>
  <div className="p1-routines">
   <span className="mono p1-routines-label">THE WEEKLY LOOP</span>
   <ul>{routines.map((r,i)=><li key={r}><span className="mono">{String(i+1).padStart(2,'0')}</span>{r}</li>)}</ul>
  </div>
 </div>;
}

const traits = [
 ['High-value sales','Every missed opportunity matters.'],
 ['Long sales cycles','Deals can quietly stall.'],
 ['Relationship-driven growth','Architects and designers influence future demand.'],
 ['Multiple regions & workflows','Different teams. Different signals. One business.'],
];

function WhyOrnare(){
 return <div className="p1 p1-why">
  <div className="p1-why-head">
   <h2>Complexity creates<br/><em>opportunity</em> for automation.</h2>
  </div>
  <div className="p1-traits">{traits.map(([t,d],i)=><div className="p1-trait" key={t}><span className="mono">0{i+1}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
  <p className="p1-close"><span className="small-square"/><strong>The opportunity:</strong> build around how Ornare actually operates — not a generic AI use case.</p>
 </div>;
}

const split = [
 {icon:<GearIcon/>, label:'AI HANDLES', title:'The repetition', items:['Collecting the data','Running the same calculation','Drafting the first version']},
 {icon:<PersonIcon/>, label:'PEOPLE HANDLE', title:'The decisions', items:['Anything touching money','Anything a client will read','Every final approval']},
];

function BigIdea(){
 return <div className="p1 p1-idea">
  <div className="p1-idea-head">
   <h2>Automate the repetition.<br/>Never automate the <em>judgment</em>.</h2>
   <p className="lead">Ornare turns ideas into spaces. We looked at that same idea from an operational angle.</p>
  </div>
  <div className="p1-split">{split.map(c=><div className={`p1-card ${c.label==='AI HANDLES'?'is-machine':'is-human'}`} key={c.label}>
    <i className="p1-card-badge">{c.icon}</i>
    <span className="mono p1-card-label">{c.label}</span>
    <h3>{c.title}</h3>
    <ul>{c.items.map(t=><li key={t}><span className="p1-check"><CheckIcon/></span>{t}</li>)}</ul>
  </div>)}</div>
  <p className="p1-close"><span className="small-square"/>Not replacing people. Not automating judgment. <strong>Removing the repetition around it.</strong></p>
 </div>;
}

const slides=[Opportunity,WhyOrnare,BigIdea];
export default function PhaseOne({chapter}){
 const Slide=slides[chapter]||slides[0];
 return <Slide/>;
}
