import React, { useEffect, useRef } from 'react';
import { initFluidCursor } from './fluid-cursor.js';

/* Gold smoke that follows the cursor, confined to the slide it is rendered in. */
export default function FluidCanvas(){
 const canvas=useRef(null);
 useEffect(()=>{
  const el=canvas.current, surface=el?.parentElement;
  if(!el||!surface) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  return initFluidCursor(el,surface);
 },[]);
 return <canvas ref={canvas} className="fluid-canvas" aria-hidden="true"/>;
}
