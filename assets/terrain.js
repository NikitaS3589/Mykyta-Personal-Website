// A small orthographic height-field renderer. All geometry is generated locally.
(() => {
  const canvas = document.querySelector('.scene canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const button = document.querySelector('.scene-play');
  const points = [], faces = [];
  const divisions = 32;
  const hash = (x, z) => {
    const n = Math.sin(127.1 * x + 311.7 * z) * 43758.5453;
    return n - Math.floor(n);
  };
  function noise(x, z) {
    const i = Math.floor(x), j = Math.floor(z);
    const smooth = t => t*t*(3-2*t);
    const u = smooth(x-i), v = smooth(z-j);
    return (1-v)*((1-u)*hash(i,j)+u*hash(i+1,j)) + v*((1-u)*hash(i,j+1)+u*hash(i+1,j+1));
  }
  function elevation(x, z) {
    const peaks = [[-.42,-.15,.72,.96],[.05,-.12,1.07,1.25],[.47,-.27,.68,1.1],[-.05,.36,.59,1.12],[.56,.36,.48,1.28]];
    const rough = .15*(noise(x*5,z*5)-.5)+.09*(noise(x*12,z*12)-.5);
    const ridges = peaks.map(([a,b,h,s]) => h-s*Math.hypot(x-a,(z-b)*1.19));
    const edge = Math.min(1, (1-Math.max(Math.abs(x),Math.abs(z)))*5);
    return Math.max(0, Math.max(...ridges)+rough+.06*Math.sin(x*12+z*8))*Math.max(0,edge);
  }
  for (let j=0;j<=divisions;j++) {
    for (let i=0;i<=divisions;i++) {
      const x=(i+(i>0 && i<divisions ? (hash(i,j)-.5)*.61 : 0))*2/divisions-1;
      const z=(j+(j>0 && j<divisions ? (hash(j,i+20)-.5)*.61 : 0))*2/divisions-1;
      points.push({x,z,y:elevation(x,z)});
    }
  }
  for (let j=0;j<divisions;j++) {
    for (let i=0;i<divisions;i++) {
      const a=j*(divisions+1)+i, b=a+1, c=a+divisions+1, d=c+1;
      faces.push(...(hash(i,j)>.5 ? [[a,c,b],[b,c,d]] : [[a,d,b],[a,c,d]]));
    }
  }
  let angle=.47, running=false, visible=true, previous=0, frame=0;
  function draw() {
    const width=canvas.clientWidth, height=canvas.clientHeight;
    if (!width || !height) return;
    const dpr=Math.min(window.devicePixelRatio || 1,2);
    const pixels=Math.round(width*dpr), rows=Math.round(height*dpr);
    if(canvas.width!==pixels || canvas.height!==rows) {canvas.width=pixels;canvas.height=rows}
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,width,height);
    const dark=document.documentElement.dataset.theme==='dark';

    const scale=Math.min(width*.324,height*.54), cx=width*.5, cy=height*.635;
    const ca=Math.cos(angle), sa=Math.sin(angle);
    function project(x,z,y=0) {
      const depth=x*sa+z*ca;
      return [cx+(x*ca-z*sa)*scale,cy+depth*scale*.29-y*scale*.92,depth];
    }
    function line(a,b,color,weight=1) {
      ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineWidth=weight;ctx.strokeStyle=color;ctx.stroke();
    }
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,width*.62);
    glow.addColorStop(0,dark?'#13312f':'#322c1e');glow.addColorStop(1,'#101314');
    ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    ctx.save();ctx.beginPath();ctx.rect(0,39,width,height-90);ctx.clip();
    for(let i=-12;i<=12;i++) {
      const p=i*.22;
      line(project(p,-2.8,-.035),project(p,2.8,-.035),'#74786c24',.7);
      line(project(-2.8,p,-.035),project(2.8,p,-.035),'#74786c24',.7);
    }
    const coords=points.map(p=>project(p.x,p.z,p.y));
    const sorted=faces.map(face=>({face,depth:face.reduce((sum,id)=>sum+coords[id][2],0)})).sort((a,b)=>a.depth-b.depth);
    for(const {face:[a,b,c]} of sorted) {
      const pa=points[a], pb=points[b], pc=points[c];
      const y=(pa.y+pb.y+pc.y)/3;
      const ux=pb.x-pa.x, uz=pb.z-pa.z, uy=pb.y-pa.y;
      const vx=pc.x-pa.x, vz=pc.z-pa.z, vy=pc.y-pa.y;
      const nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
      const light=Math.max(0,(.58*nx+.48*ny-.52*nz)/Math.hypot(nx,ny,nz));
      const lit=Math.min(1,y*1.26);
      const hue=dark ? 218-47*lit : 40;
      ctx.beginPath();ctx.moveTo(coords[a][0],coords[a][1]);ctx.lineTo(coords[b][0],coords[b][1]);ctx.lineTo(coords[c][0],coords[c][1]);ctx.closePath();
      ctx.fillStyle='hsl('+hue+' '+(15+lit*35)+'% '+(8+lit*(8+light*22))+'%)';
      ctx.fill();ctx.lineWidth=width<450?.59:.8;
      ctx.strokeStyle='hsla('+hue+' '+(60+light*27)+'% '+(39+lit*24+light*8)+'% / '+(.34+lit*.55)+')';ctx.stroke();
    }
    ctx.restore();
    // A fixed orientation triad uses the scene's current camera angle.
    const ox=27,oy=height-64;
    const axis=(x,y,label,color) => {line([ox,oy],[ox+x,oy+y],color);ctx.fillStyle=color;ctx.font='8px monospace';ctx.fillText(label,ox+x-2,oy+y-3)};
    axis(0,-17,'Y','#bbbdad');axis(ca*17,sa*7,'X','#c7a55d');axis(-sa*17,ca*7,'Z','#8b9d9a');
  }
  function tick(t) {
    if (!running || !visible || document.hidden) {frame=0;previous=0;return}
    if (!previous || t-previous>=40) {
      if(previous) angle+=Math.min(t-previous,75)*.00015;
      previous=t;draw();
    }
    frame=requestAnimationFrame(tick);
  }
  function resume() {if(running && visible && !document.hidden && !frame) frame=requestAnimationFrame(tick)}
  button.addEventListener('click',() => {
    running=!running;
    button.setAttribute('aria-label',running?'Pause terrain rotation':'Rotate terrain');
    button.title=button.getAttribute('aria-label');
    button.querySelector('path').setAttribute('d',running?'M8 5v14 M16 5v14':'m8 5 10 7-10 7z');
    resume();
  });
  new ResizeObserver(draw).observe(canvas);
  new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume()}).observe(canvas);
  document.addEventListener('visibilitychange',resume);
  draw();
})();
