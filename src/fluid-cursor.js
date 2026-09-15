/* Fluid cursor simulation, scoped to one element instead of the whole page.
   Adapted from the WebGL fluid-dynamics demo; dye colour is fixed to the deck's gold. */

const config = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1024,
  DENSITY_DISSIPATION: 2.4,
  VELOCITY_DISSIPATION: 2,
  PRESSURE: 0.1,
  PRESSURE_ITERATIONS: 20,
  CURL: 3,
  SPLAT_RADIUS: 0.2,
  SPLAT_FORCE: 6000,
  SHADING: false,
};

/* Soft warm sand rather than a saturated yellow, so it reads as haze over the cream. */
const DYE_INTENSITY = 0.16;
function goldDye(){
  const drift = (Math.random() - 0.5) * 0.03;
  return { r:(0.84 + drift) * DYE_INTENSITY, g:(0.79 + drift) * DYE_INTENSITY, b:0.62 * DYE_INTENSITY };
}

export function initFluidCursor(canvas, surface){
  const params = { alpha:true, depth:false, stencil:false, antialias:false, preserveDrawingBuffer:false };
  const gl = canvas.getContext('webgl2', params) || canvas.getContext('webgl', params);
  if(!gl) return () => {};

  const isWebGL2 = 'drawBuffers' in gl;
  let supportLinearFiltering = false, halfFloat = null;
  if(isWebGL2){
    gl.getExtension('EXT_color_buffer_float');
    supportLinearFiltering = !!gl.getExtension('OES_texture_float_linear');
  }else{
    halfFloat = gl.getExtension('OES_texture_half_float');
    supportLinearFiltering = !!gl.getExtension('OES_texture_half_float_linear');
  }
  gl.clearColor(0,0,0,0);
  const texType = isWebGL2 ? gl.HALF_FLOAT : (halfFloat && halfFloat.HALF_FLOAT_OES) || 0;

  function supportsFormat(internalFormat, format, type){
    const texture = gl.createTexture();
    if(!texture) return false;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    if(!fbo) return false;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  }
  function getSupportedFormat(internalFormat, format, type){
    if(supportsFormat(internalFormat, format, type)) return { internalFormat, format };
    if(!isWebGL2) return null;
    if(internalFormat === gl.R16F) return getSupportedFormat(gl.RG16F, gl.RG, type);
    if(internalFormat === gl.RG16F) return getSupportedFormat(gl.RGBA16F, gl.RGBA, type);
    return null;
  }
  const formatRGBA = isWebGL2 ? getSupportedFormat(gl.RGBA16F, gl.RGBA, texType) : getSupportedFormat(gl.RGBA, gl.RGBA, texType);
  const formatRG   = isWebGL2 ? getSupportedFormat(gl.RG16F, gl.RG, texType)     : getSupportedFormat(gl.RGBA, gl.RGBA, texType);
  const formatR    = isWebGL2 ? getSupportedFormat(gl.R16F, gl.RED, texType)     : getSupportedFormat(gl.RGBA, gl.RGBA, texType);
  if(!formatRGBA || !formatRG || !formatR) return () => {};
  if(!supportLinearFiltering){ config.DYE_RESOLUTION = 256; config.SHADING = false; }

  function compile(type, source, keywords){
    const withKeywords = (keywords || []).map(k => `#define ${k}\n`).join('') + source;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, withKeywords);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader));
    return shader;
  }
  function link(vs, fs){
    const program = gl.createProgram();
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(program));
    return program;
  }
  function uniformsOf(program){
    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for(let i=0;i<count;i++){ const info = gl.getActiveUniform(program, i); uniforms[info.name] = gl.getUniformLocation(program, info.name); }
    return uniforms;
  }
  const makeProgram = (vs, fs) => { const program = link(vs, fs); return { program, uniforms:uniformsOf(program), bind(){ gl.useProgram(program) } }; };

  const baseVertex = compile(gl.VERTEX_SHADER, `
    precision highp float; attribute vec2 aPosition;
    varying vec2 vUv, vL, vR, vT, vB; uniform vec2 texelSize;
    void main(){ vUv = aPosition*0.5+0.5;
      vL = vUv - vec2(texelSize.x,0.0); vR = vUv + vec2(texelSize.x,0.0);
      vT = vUv + vec2(0.0,texelSize.y); vB = vUv - vec2(0.0,texelSize.y);
      gl_Position = vec4(aPosition,0.0,1.0); }`);

  const clearShader = compile(gl.FRAGMENT_SHADER, `
    precision mediump float; precision mediump sampler2D; varying highp vec2 vUv;
    uniform sampler2D uTexture; uniform float value;
    void main(){ gl_FragColor = value * texture2D(uTexture, vUv); }`);

  const displaySource = `
    precision highp float; precision highp sampler2D;
    varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uTexture; uniform vec2 texelSize;
    void main(){ vec3 c = texture2D(uTexture, vUv).rgb;
      #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb, rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb, bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc), dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        c *= clamp(dot(n, vec3(0.0,0.0,1.0)) + 0.7, 0.7, 1.0);
      #endif
      gl_FragColor = vec4(c, max(c.r, max(c.g, c.b))); }`;

  const splatShader = compile(gl.FRAGMENT_SHADER, `
    precision highp float; precision highp sampler2D; varying vec2 vUv;
    uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
    void main(){ vec2 p = vUv - point.xy; p.x *= aspectRatio;
      gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + exp(-dot(p,p)/radius)*color, 1.0); }`);

  const advectionShader = compile(gl.FRAGMENT_SHADER, `
    precision highp float; precision highp sampler2D; varying vec2 vUv;
    uniform sampler2D uVelocity, uSource; uniform vec2 texelSize, dyeTexelSize; uniform float dt, dissipation;
    vec4 bilerp(sampler2D sam, vec2 uv, vec2 tsize){
      vec2 st = uv/tsize - 0.5; vec2 iuv = floor(st); vec2 fuv = fract(st);
      vec4 a = texture2D(sam,(iuv+vec2(0.5,0.5))*tsize), b = texture2D(sam,(iuv+vec2(1.5,0.5))*tsize);
      vec4 c = texture2D(sam,(iuv+vec2(0.5,1.5))*tsize), d = texture2D(sam,(iuv+vec2(1.5,1.5))*tsize);
      return mix(mix(a,b,fuv.x), mix(c,d,fuv.x), fuv.y); }
    void main(){
      #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
      #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
      #endif
      gl_FragColor = result / (1.0 + dissipation * dt); }`,
    supportLinearFiltering ? null : ['MANUAL_FILTERING']);

  const divergenceShader = compile(gl.FRAGMENT_SHADER, `
    precision mediump float; precision mediump sampler2D;
    varying highp vec2 vUv, vL, vR, vT, vB; uniform sampler2D uVelocity;
    void main(){ float L = texture2D(uVelocity,vL).x, R = texture2D(uVelocity,vR).x;
      float T = texture2D(uVelocity,vT).y, B = texture2D(uVelocity,vB).y;
      vec2 C = texture2D(uVelocity,vUv).xy;
      if(vL.x<0.0) L=-C.x; if(vR.x>1.0) R=-C.x; if(vT.y>1.0) T=-C.y; if(vB.y<0.0) B=-C.y;
      gl_FragColor = vec4(0.5*(R-L+T-B), 0.0, 0.0, 1.0); }`);

  const curlShader = compile(gl.FRAGMENT_SHADER, `
    precision mediump float; precision mediump sampler2D;
    varying highp vec2 vUv, vL, vR, vT, vB; uniform sampler2D uVelocity;
    void main(){ float L = texture2D(uVelocity,vL).y, R = texture2D(uVelocity,vR).y;
      float T = texture2D(uVelocity,vT).x, B = texture2D(uVelocity,vB).x;
      gl_FragColor = vec4(0.5*(R-L-T+B), 0.0, 0.0, 1.0); }`);

  const vorticityShader = compile(gl.FRAGMENT_SHADER, `
    precision highp float; precision highp sampler2D; varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uVelocity, uCurl; uniform float curl, dt;
    void main(){ float L = texture2D(uCurl,vL).x, R = texture2D(uCurl,vR).x;
      float T = texture2D(uCurl,vT).x, B = texture2D(uCurl,vB).x, C = texture2D(uCurl,vUv).x;
      vec2 force = 0.5 * vec2(abs(T)-abs(B), abs(R)-abs(L));
      force /= length(force) + 0.0001; force *= curl * C; force.y *= -1.0;
      vec2 velocity = texture2D(uVelocity,vUv).xy + force * dt;
      gl_FragColor = vec4(min(max(velocity,-1000.0),1000.0), 0.0, 1.0); }`);

  const pressureShader = compile(gl.FRAGMENT_SHADER, `
    precision mediump float; precision mediump sampler2D; varying highp vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uPressure, uDivergence;
    void main(){ float L = texture2D(uPressure,vL).x, R = texture2D(uPressure,vR).x;
      float T = texture2D(uPressure,vT).x, B = texture2D(uPressure,vB).x;
      gl_FragColor = vec4((L+R+B+T - texture2D(uDivergence,vUv).x)*0.25, 0.0, 0.0, 1.0); }`);

  const gradientShader = compile(gl.FRAGMENT_SHADER, `
    precision mediump float; precision mediump sampler2D; varying highp vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uPressure, uVelocity;
    void main(){ float L = texture2D(uPressure,vL).x, R = texture2D(uPressure,vR).x;
      float T = texture2D(uPressure,vT).x, B = texture2D(uPressure,vB).x;
      vec2 velocity = texture2D(uVelocity,vUv).xy - vec2(R-L, T-B);
      gl_FragColor = vec4(velocity, 0.0, 1.0); }`);

  const clearProgram = makeProgram(baseVertex, clearShader);
  const splatProgram = makeProgram(baseVertex, splatShader);
  const advectionProgram = makeProgram(baseVertex, advectionShader);
  const divergenceProgram = makeProgram(baseVertex, divergenceShader);
  const curlProgram = makeProgram(baseVertex, curlShader);
  const vorticityProgram = makeProgram(baseVertex, vorticityShader);
  const pressureProgram = makeProgram(baseVertex, pressureShader);
  const gradientProgram = makeProgram(baseVertex, gradientShader);
  const displayProgram = makeProgram(baseVertex, compile(gl.FRAGMENT_SHADER, displaySource, config.SHADING ? ['SHADING'] : null));

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
  const indices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  function blit(target){
    if(!target){ gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER,null); }
    else { gl.viewport(0,0,target.width,target.height); gl.bindFramebuffer(gl.FRAMEBUFFER,target.fbo); }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  function createFBO(w,h,internalFormat,format,type,param){
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0,0,w,h); gl.clear(gl.COLOR_BUFFER_BIT);
    return { texture, fbo, width:w, height:h, texelSizeX:1/w, texelSizeY:1/h,
      attach(id){ gl.activeTexture(gl.TEXTURE0+id); gl.bindTexture(gl.TEXTURE_2D, texture); return id } };
  }
  function createDoubleFBO(w,h,internalFormat,format,type,param){
    let read = createFBO(w,h,internalFormat,format,type,param);
    let write = createFBO(w,h,internalFormat,format,type,param);
    return { width:w, height:h, texelSizeX:read.texelSizeX, texelSizeY:read.texelSizeY,
      get read(){return read}, get write(){return write}, swap(){ const t=read; read=write; write=t } };
  }
  function resolutionFor(resolution){
    const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
    const ratio = w/h, aspect = ratio < 1 ? 1/ratio : ratio;
    const min = Math.round(resolution), max = Math.round(resolution*aspect);
    return w > h ? { width:max, height:min } : { width:min, height:max };
  }

  let dye, velocity, divergence, curlFBO, pressure;
  function initFramebuffers(){
    const simRes = resolutionFor(config.SIM_RESOLUTION), dyeRes = resolutionFor(config.DYE_RESOLUTION);
    const filtering = supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    gl.disable(gl.BLEND);
    dye = createDoubleFBO(dyeRes.width, dyeRes.height, formatRGBA.internalFormat, formatRGBA.format, texType, filtering);
    velocity = createDoubleFBO(simRes.width, simRes.height, formatRG.internalFormat, formatRG.format, texType, filtering);
    divergence = createFBO(simRes.width, simRes.height, formatR.internalFormat, formatR.format, texType, gl.NEAREST);
    curlFBO = createFBO(simRes.width, simRes.height, formatR.internalFormat, formatR.format, texType, gl.NEAREST);
    pressure = createDoubleFBO(simRes.width, simRes.height, formatR.internalFormat, formatR.format, texType, gl.NEAREST);
  }

  const pointer = { texcoordX:0, texcoordY:0, prevTexcoordX:0, prevTexcoordY:0, deltaX:0, deltaY:0, moved:false, color:goldDye() };
  const scaleByPixelRatio = v => Math.floor(v * (window.devicePixelRatio || 1));

  function correctRadius(radius){ const ratio = canvas.width/canvas.height; return ratio > 1 ? radius*ratio : radius }
  function splat(x, y, dx, dy, color){
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width/canvas.height);
    gl.uniform2f(splatProgram.uniforms.point, x, y);
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
    gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS/100));
    blit(velocity.write); velocity.swap();
    gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
    blit(dye.write); dye.swap();
  }

  function step(dt){
    gl.disable(gl.BLEND);
    curlProgram.bind();
    gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(curlFBO);

    vorticityProgram.bind();
    gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curlFBO.attach(1));
    gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write); velocity.swap();

    divergenceProgram.bind();
    gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    clearProgram.bind();
    gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
    blit(pressure.write); pressure.swap();

    pressureProgram.bind();
    gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
    for(let i=0;i<config.PRESSURE_ITERATIONS;i++){
      gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write); pressure.swap();
    }

    gradientProgram.bind();
    gl.uniform2f(gradientProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gradientProgram.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(gradientProgram.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write); velocity.swap();

    advectionProgram.bind();
    gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if(!supportLinearFiltering) gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    const velocityId = velocity.read.attach(0);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
    gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
    blit(velocity.write); velocity.swap();

    if(!supportLinearFiltering) gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(dye.write); dye.swap();
  }

  function render(){
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    displayProgram.bind();
    if(config.SHADING) gl.uniform2f(displayProgram.uniforms.texelSize, 1/gl.drawingBufferWidth, 1/gl.drawingBufferHeight);
    gl.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
    blit(null);
  }

  function resizeCanvas(){
    const width = scaleByPixelRatio(canvas.clientWidth), height = scaleByPixelRatio(canvas.clientHeight);
    if(canvas.width !== width || canvas.height !== height){ canvas.width = width; canvas.height = height; return true }
    return false;
  }

  let frame = 0, lastTime = Date.now();
  function loop(){
    const now = Date.now();
    const dt = Math.min((now - lastTime)/1000, 0.016666);
    lastTime = now;
    if(resizeCanvas()) initFramebuffers();
    if(pointer.moved){
      pointer.moved = false;
      splat(pointer.texcoordX, pointer.texcoordY, pointer.deltaX*config.SPLAT_FORCE, pointer.deltaY*config.SPLAT_FORCE, pointer.color);
    }
    step(dt); render();
    frame = requestAnimationFrame(loop);
  }

  const correctDeltaX = d => { const r = canvas.width/canvas.height; return r < 1 ? d*r : d };
  const correctDeltaY = d => { const r = canvas.width/canvas.height; return r > 1 ? d/r : d };

  function onMove(e){
    const rect = canvas.getBoundingClientRect();
    const posX = scaleByPixelRatio(e.clientX - rect.left);
    const posY = scaleByPixelRatio(e.clientY - rect.top);
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1 - posY / canvas.height;
    pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    pointer.color = goldDye();
  }
  function onEnter(e){
    const rect = canvas.getBoundingClientRect();
    pointer.texcoordX = scaleByPixelRatio(e.clientX - rect.left) / canvas.width;
    pointer.texcoordY = 1 - scaleByPixelRatio(e.clientY - rect.top) / canvas.height;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0; pointer.deltaY = 0; pointer.moved = false;
  }

  initFramebuffers();
  surface.addEventListener('mousemove', onMove);
  surface.addEventListener('mouseenter', onEnter);
  loop();

  return () => {
    cancelAnimationFrame(frame);
    surface.removeEventListener('mousemove', onMove);
    surface.removeEventListener('mouseenter', onEnter);
    const lose = gl.getExtension('WEBGL_lose_context');
    if(lose) lose.loseContext();
  };
}
