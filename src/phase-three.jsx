import React from 'react';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { DottedSquare } from './phase-two.jsx';

const DOMAINS = ['Sales','Operations','Research','Finance','Customer Service','Reporting','Internal Processes'];

/* ---- 01 Built around you ---- */
function BuiltAroundYou(){
 return <div className="p2 p3-built">
  <span className="p3-mark" aria-hidden="true"><DottedSquare/></span>
  <div className="p2-head">
   <h2 className="p2-system-title">Your workflow. <em>Your automation</em>.</h2>
   <p className="lead">There is no fixed list of what can be automated. If the work is repetitive, structured and valuable, we can design an intelligent workflow around it.</p>
  </div>
  <div className="p3-from-to">
   <div className="p3-from">
    <span className="mono p3-step-label">FROM</span>
    <ul className="p3-domains">{DOMAINS.map(d=><li key={d}>{d}</li>)}</ul>
   </div>
   <span className="p3-arrow"><ArrowRightIcon/></span>
   <div className="p3-to">
    <span className="mono p3-step-label">TO</span>
    <p>Automated workflows built around your <b>exact</b> needs.</p>
    <span className="p3-to-foot mono">REPETITIVE · STRUCTURED · VALUABLE</span>
   </div>
  </div>
 </div>;
}

/* ---- 02 Thank you ---- */
function ThankYou(){
 return <div className="p2 p3-thanks">
  <span className="p3-thanks-mark" aria-hidden="true"><DottedSquare/></span>
  <p className="mono p3-thanks-eyebrow">ORNARE · AUTOMATION SYSTEM</p>
  <h2>Thank you.</h2>
  <p className="p3-thanks-line">You define the problem.<br/><em>We design the intelligence around it.</em></p>
  <div className="p3-thanks-rule"/>
  <p className="p3-thanks-foot">Five agents, built and verified. The approach, not the limit.</p>
 </div>;
}

const slides=[BuiltAroundYou,ThankYou];
export default function PhaseThree({chapter}){
 const Slide=slides[chapter]||slides[0];
 return <Slide/>;
}
