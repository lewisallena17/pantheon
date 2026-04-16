'use client'

import { useEffect, useRef } from 'react'
import type { Todo, TodoStatus } from '@/types/todos'

interface Props { todos: Todo[] }
type RGB = [number,number,number]
type Side = 'right'|'left'|'bottom'|'top'

// ── 5 Sci-Fi Chamber Themes ─────────────────────────────────
const CHAMBERS = [
  { name:'CORE',  color:[255,30, 60 ] as RGB, bg:'#0a0005', floor:'#0d0008', trim:'#ff1e3c' },
  { name:'FORGE', color:[255,140,0  ] as RGB, bg:'#0a0500', floor:'#0e0700', trim:'#ff8c00' },
  { name:'NOVA',  color:[180,0, 255 ] as RGB, bg:'#060010', floor:'#080014', trim:'#b400ff' },
  { name:'LORE',  color:[0,  200,80 ] as RGB, bg:'#000a04', floor:'#000d06', trim:'#00c850' },
  { name:'SCOUT', color:[0,  220,255] as RGB, bg:'#00080a', floor:'#000b0e', trim:'#00dcff' },
] as const

const CLASSES = ['OPS','TECH','RECON','MEDIC','HEAVY'] as const
type AgentClass = typeof CLASSES[number]

const CLASS_COLOR: Record<AgentClass,RGB> = {
  OPS:[255,60,80], TECH:[255,140,0], RECON:[0,220,255], MEDIC:[0,210,120], HEAVY:[180,80,255],
}
const STATUS_RGB: Record<string,RGB> = {
  pending:[60,70,90], in_progress:[0,200,255], completed:[0,210,115], failed:[220,50,80], blocked:[200,100,0],
}
const STATUS_GLYPH: Record<string,string> = {
  pending:'?', in_progress:'◈', completed:'★', failed:'✕', blocked:'⊘',
}

interface Room {
  idx:number; x:number; y:number; doors:{side:Side;neighborIdx:number;corrIdx:number}[]
  tasks:Todo[]; agents:string[]
}
interface Corridor { fromIdx:number;toIdx:number;x:number;y:number;w:number;h:number;dir:'h'|'v'; particles:{t:number;spd:number;col:RGB}[] }
interface NPC {
  name:string; cls:AgentClass; color:RGB
  x:number; y:number; vx:number; vy:number; facing:1|-1
  homeRoom:number; curRoom:number
  inCorridor:boolean; corrIdx:number; corrDir:1|-1; corrT:number
  wanderT:number; animT:number; tasks:Todo[]
  hp:number; level:number
}
interface Spark { x:number;y:number;vx:number;vy:number;life:number;col:RGB }
interface FloatText { x:number;y:number;vy:number;text:string;col:RGB;life:number }

// ── Layout ─────────────────────────────────────────────────
const RW=175; const RH=135; const CL=46; const CW=24; const PAD=18; const WALL=9

function rgba([r,g,b]:RGB,a=1){ return `rgba(${r},${g},${b},${a})` }
function lerp(a:number,b:number,t:number){ return a+(b-a)*t }
function hashStr(s:string){ let h=5381; for(let i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))&0xffffff; return Math.abs(h) }

// Cross layout:  [1]
//             [0][2][3]
//                [4]
function buildLayout(){
  const sx=RW+CL   // horizontal step
  const sy=RH+CL   // vertical step  (rooms are shorter than wide)
  const pos=[
    {x:PAD,      y:PAD+sy},      // 0 left
    {x:PAD+sx,   y:PAD},         // 1 top
    {x:PAD+sx,   y:PAD+sy},      // 2 center hub
    {x:PAD+sx*2, y:PAD+sy},      // 3 right
    {x:PAD+sx,   y:PAD+sy*2},    // 4 bottom
  ]
  const canvasW=PAD+3*RW+2*CL+PAD
  const canvasH=PAD+3*RH+2*CL+PAD
  const rooms:Room[]=pos.map(({x,y},i)=>({idx:i,x,y,doors:[],tasks:[],agents:[]}))
  const corridors:Corridor[]=[]
  const conn=(a:number,b:number,dir:'h'|'v')=>{
    const ra=rooms[a],rb=rooms[b],ci=corridors.length
    if(dir==='h'){
      corridors.push({fromIdx:a,toIdx:b,x:ra.x+RW,y:ra.y+RH/2-CW/2,w:CL,h:CW,dir:'h',particles:[]})
      ra.doors.push({side:'right',neighborIdx:b,corrIdx:ci})
      rb.doors.push({side:'left', neighborIdx:a,corrIdx:ci})
    } else {
      corridors.push({fromIdx:a,toIdx:b,x:ra.x+RW/2-CW/2,y:ra.y+RH,w:CW,h:CL,dir:'v',particles:[]})
      ra.doors.push({side:'bottom',neighborIdx:b,corrIdx:ci})
      rb.doors.push({side:'top',  neighborIdx:a,corrIdx:ci})
    }
  }
  conn(0,2,'h'); conn(1,2,'v'); conn(2,3,'h'); conn(2,4,'v')
  return {rooms,corridors,canvasW,canvasH}
}

// ── Stars ───────────────────────────────────────────────────
let stars:{ x:number;y:number;r:number;a:number;spd:number }[]=[]
function initStars(w:number,h:number){
  stars=Array.from({length:120},()=>({
    x:Math.random()*w, y:Math.random()*h,
    r:0.4+Math.random()*1.2, a:0.3+Math.random()*0.7, spd:0.002+Math.random()*0.006,
  }))
}
function drawStars(ctx:CanvasRenderingContext2D,frame:number,w:number,h:number){
  for(const s of stars){
    const a=s.a*(0.6+0.4*Math.sin(frame*s.spd+s.x))
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2)
    ctx.fillStyle=`rgba(200,220,255,${a})`;ctx.fill()
  }
}

// ── Floor grid ──────────────────────────────────────────────
function drawFloor(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:RGB,dark=false){
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip()
  ctx.fillStyle=dark?'#050508':'#06060c';ctx.fillRect(x,y,w,h)
  // subtle color tint
  ctx.fillStyle=rgba(col,dark?0.03:0.05);ctx.fillRect(x,y,w,h)
  // grid lines
  const G=16
  ctx.strokeStyle=rgba(col,0.08);ctx.lineWidth=0.5
  for(let gx=Math.floor(x/G)*G;gx<=x+w;gx+=G){ ctx.beginPath();ctx.moveTo(gx,y);ctx.lineTo(gx,y+h);ctx.stroke() }
  for(let gy=Math.floor(y/G)*G;gy<=y+h;gy+=G){ ctx.beginPath();ctx.moveTo(x,gy);ctx.lineTo(x+w,gy);ctx.stroke() }
  ctx.restore()
}

// ── Room walls (metal panels + neon trim) ───────────────────
function drawRoom(ctx:CanvasRenderingContext2D,room:Room,frame:number){
  const {x,y,idx}=room
  const ch=CHAMBERS[idx]
  const col=ch.color

  // floor
  drawFloor(ctx,x+WALL,y+WALL,RW-WALL*2,RH-WALL*2,col)

  // outer metal shell
  ctx.fillStyle='#0a0a12'
  ctx.fillRect(x,y,RW,WALL)           // top wall
  ctx.fillRect(x,y+RH-WALL,RW,WALL)  // bottom wall
  ctx.fillRect(x,y,WALL,RH)           // left wall
  ctx.fillRect(x+RW-WALL,y,WALL,RH)  // right wall

  // wall panel lines
  ctx.strokeStyle='#141428';ctx.lineWidth=0.7
  // top/bottom panels
  for(let px=x+WALL;px<x+RW-WALL;px+=28){
    ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(px,y+WALL);ctx.stroke()
    ctx.beginPath();ctx.moveTo(px,y+RH-WALL);ctx.lineTo(px,y+RH);ctx.stroke()
  }
  // left/right panels
  for(let py=y+WALL;py<y+RH-WALL;py+=22){
    ctx.beginPath();ctx.moveTo(x,py);ctx.lineTo(x+WALL,py);ctx.stroke()
    ctx.beginPath();ctx.moveTo(x+RW-WALL,py);ctx.lineTo(x+RW,py);ctx.stroke()
  }

  // door cutouts in walls
  for(const door of room.doors){
    const mid = door.side==='right'||door.side==='left' ? y+RH/2 : x+RW/2
    const half = CW/2+1
    ctx.fillStyle='#050508'
    if(door.side==='right')  ctx.fillRect(x+RW-WALL,mid-half,WALL,half*2)
    if(door.side==='left')   ctx.fillRect(x,mid-half,WALL,half*2)
    if(door.side==='bottom') ctx.fillRect(mid-half,y+RH-WALL,half*2,WALL)
    if(door.side==='top')    ctx.fillRect(mid-half,y,half*2,WALL)
    // door frame glow
    ctx.strokeStyle=rgba(col,0.4);ctx.lineWidth=1
    if(door.side==='right'||door.side==='left'){
      const dx=door.side==='right'?x+RW-WALL:x+WALL
      ctx.beginPath();ctx.moveTo(dx,mid-half);ctx.lineTo(dx,mid+half);ctx.stroke()
    } else {
      const dy=door.side==='bottom'?y+RH-WALL:y+WALL
      ctx.beginPath();ctx.moveTo(mid-half,dy);ctx.lineTo(mid+half,dy);ctx.stroke()
    }
  }

  // neon border trim (inner edge of walls)
  const pulse=Math.sin(frame*0.04)*0.2+0.8
  ctx.strokeStyle=rgba(col,0.55*pulse);ctx.lineWidth=1.5
  ctx.strokeRect(x+WALL-0.5,y+WALL-0.5,RW-WALL*2+1,RH-WALL*2+1)
  // outer glow
  ctx.shadowColor=rgba(col,1);ctx.shadowBlur=8
  ctx.strokeStyle=rgba(col,0.25*pulse);ctx.lineWidth=3
  ctx.strokeRect(x+1,y+1,RW-2,RH-2)
  ctx.shadowBlur=0

  // corner bolts
  const bolts=[[x+WALL+3,y+WALL+3],[x+RW-WALL-3,y+WALL+3],[x+WALL+3,y+RH-WALL-3],[x+RW-WALL-3,y+RH-WALL-3]]
  for(const [bx,by] of bolts){
    ctx.fillStyle=rgba(col,0.35);ctx.beginPath();ctx.arc(bx,by,2,0,Math.PI*2);ctx.fill()
  }

  // chamber label (top bar style)
  const lbH=13, lbW=RW-WALL*2-4
  ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(x+WALL+2,y+WALL+2,lbW,lbH)
  ctx.strokeStyle=rgba(col,0.4);ctx.lineWidth=0.8
  ctx.strokeRect(x+WALL+2,y+WALL+2,lbW,lbH)
  ctx.font='bold 8px "Share Tech Mono",monospace'
  ctx.fillStyle=rgba(col,0.85);ctx.textAlign='left'
  ctx.fillText(`◈ ${ch.name}`,x+WALL+6,y+WALL+11)
  // agent count
  ctx.textAlign='right'
  ctx.fillStyle=rgba(col,0.5)
  ctx.fillText(`${room.agents.length} OPS`,x+RW-WALL-4,y+WALL+11)
  ctx.textAlign='center'

  // draw chamber-specific equipment
  drawChamberEquip(ctx,room,frame,col)
}

// ── Chamber equipment per theme ─────────────────────────────
function drawChamberEquip(ctx:CanvasRenderingContext2D,room:Room,frame:number,col:RGB){
  const {x,y,idx}=room
  const cx=x+RW/2, cy=y+RH/2+10
  const f=frame*0.016
  const p=Math.sin(f*2)*0.5+0.5

  if(idx===0){ // CORE — pulsing energy core + server racks
    // server racks on sides
    for(let i=0;i<3;i++){
      ctx.fillStyle=rgba(col,0.12);ctx.fillRect(x+WALL+2,y+WALL+18+i*20,12,16)
      ctx.strokeStyle=rgba(col,0.3);ctx.lineWidth=0.5;ctx.strokeRect(x+WALL+2,y+WALL+18+i*20,12,16)
      // blinking lights
      ctx.fillStyle=rgba(col,Math.random()>0.97?0.9:0.3)
      ctx.fillRect(x+WALL+3,y+WALL+20+i*20,3,2)
    }
    // energy core
    const cr=18+p*4
    const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,cr*2)
    cg.addColorStop(0,rgba(col,0.6+p*0.2));cg.addColorStop(0.4,rgba(col,0.2));cg.addColorStop(1,rgba(col,0))
    ctx.beginPath();ctx.arc(cx,cy,cr*2,0,Math.PI*2);ctx.fillStyle=cg;ctx.fill()
    ctx.beginPath();ctx.arc(cx,cy,cr,0,Math.PI*2)
    ctx.strokeStyle=rgba(col,0.8);ctx.lineWidth=1.5;ctx.stroke()
    // rotating ring
    ctx.save();ctx.translate(cx,cy);ctx.rotate(f*0.8)
    ctx.strokeStyle=rgba(col,0.4);ctx.lineWidth=1;ctx.setLineDash([4,6])
    ctx.beginPath();ctx.arc(0,0,cr+8,0,Math.PI*2);ctx.stroke()
    ctx.setLineDash([]);ctx.restore()
    // core center dot
    ctx.fillStyle=rgba(col,0.9);ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.fill()
  }

  if(idx===1){ // FORGE — furnace + tool racks
    // furnace
    const fg=ctx.createRadialGradient(cx,cy+5,0,cx,cy+5,22+p*5)
    fg.addColorStop(0,rgba([255,200,50],0.7+p*0.2));fg.addColorStop(0.5,rgba(col,0.3));fg.addColorStop(1,rgba(col,0))
    ctx.beginPath();ctx.arc(cx,cy+5,22+p*5,0,Math.PI*2);ctx.fillStyle=fg;ctx.fill()
    // furnace body
    ctx.fillStyle=rgba([60,30,0],0.8);ctx.fillRect(cx-14,cy-8,28,24)
    ctx.strokeStyle=rgba(col,0.6);ctx.lineWidth=1;ctx.strokeRect(cx-14,cy-8,28,24)
    ctx.fillStyle=rgba([255,160,0],0.6+p*0.3);ctx.fillRect(cx-10,cy-4,20,16)
    // flames flicker
    for(let i=0;i<3;i++){
      const fx=cx-8+i*8,fh=8+Math.sin(f*4+i)*4
      ctx.fillStyle=rgba([255,100+i*50,0],0.7)
      ctx.beginPath();ctx.moveTo(fx-3,cy-4);ctx.lineTo(fx+3,cy-4);ctx.lineTo(fx,cy-4-fh);ctx.closePath();ctx.fill()
    }
    // tool racks
    ctx.strokeStyle=rgba(col,0.3);ctx.lineWidth=1.5
    for(let i=0;i<4;i++){
      ctx.beginPath();ctx.moveTo(x+WALL+4+i*9,y+WALL+18);ctx.lineTo(x+WALL+4+i*9,y+WALL+45);ctx.stroke()
      ctx.beginPath();ctx.moveTo(x+WALL+1+i*9,y+WALL+26);ctx.lineTo(x+WALL+7+i*9,y+WALL+26);ctx.stroke()
    }
  }

  if(idx===2){ // NOVA — holographic orb + terminals
    // terminals
    for(let i=0;i<3;i++){
      const tx2=x+WALL+4+i*(RW-WALL*2-8)/2.5,ty=y+RH-WALL-30
      ctx.fillStyle=rgba(col,0.1);ctx.fillRect(tx2-8,ty,16,22)
      ctx.strokeStyle=rgba(col,0.35);ctx.lineWidth=0.8;ctx.strokeRect(tx2-8,ty,16,22)
      ctx.fillStyle=rgba(col,0.4+Math.sin(f+i)*0.2);ctx.fillRect(tx2-6,ty+2,12,14)
    }
    // holographic orb
    const or=20+p*3
    const og=ctx.createRadialGradient(cx,cy-5,0,cx,cy-5,or*1.8)
    og.addColorStop(0,rgba(col,0.5));og.addColorStop(0.6,rgba(col,0.15));og.addColorStop(1,rgba(col,0))
    ctx.beginPath();ctx.arc(cx,cy-5,or*1.8,0,Math.PI*2);ctx.fillStyle=og;ctx.fill()
    ctx.save();ctx.translate(cx,cy-5)
    for(let r=0;r<3;r++){
      ctx.rotate(f*(0.3+r*0.2))
      ctx.strokeStyle=rgba(col,0.3-r*0.08);ctx.lineWidth=0.8
      ctx.beginPath();ctx.ellipse(0,0,or-r*4,or/2-r*2,0,0,Math.PI*2);ctx.stroke()
    }
    ctx.restore()
    ctx.fillStyle=rgba(col,0.9);ctx.beginPath();ctx.arc(cx,cy-5,4,0,Math.PI*2);ctx.fill()
  }

  if(idx===3){ // LORE — data archive terminals + central node
    // shelving units
    for(let row=0;row<3;row++){
      const sy=y+WALL+18+row*22
      ctx.fillStyle=rgba([20,20,20],0.8);ctx.fillRect(x+WALL+2,sy,18,18)
      ctx.strokeStyle=rgba(col,0.25);ctx.lineWidth=0.7;ctx.strokeRect(x+WALL+2,sy,18,18)
      for(let b=0;b<4;b++){
        ctx.fillStyle=rgba(col,0.3+b*0.08);ctx.fillRect(x+WALL+3+b*4,sy+2,3,14)
      }
    }
    // data node
    const dg=ctx.createRadialGradient(cx+20,cy,0,cx+20,cy,24)
    dg.addColorStop(0,rgba(col,0.4));dg.addColorStop(1,rgba(col,0))
    ctx.beginPath();ctx.arc(cx+20,cy,24,0,Math.PI*2);ctx.fillStyle=dg;ctx.fill()
    ctx.strokeStyle=rgba(col,0.6);ctx.lineWidth=1
    ctx.beginPath();ctx.arc(cx+20,cy,12,0,Math.PI*2);ctx.stroke()
    ctx.save();ctx.translate(cx+20,cy);ctx.rotate(f*-0.5)
    ctx.strokeStyle=rgba(col,0.25);ctx.setLineDash([3,5])
    ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.stroke()
    ctx.setLineDash([]);ctx.restore()
    ctx.fillStyle=rgba(col,0.9);ctx.beginPath();ctx.arc(cx+20,cy,4,0,Math.PI*2);ctx.fill()
    // scrolling text lines
    ctx.font='5px monospace';ctx.fillStyle=rgba(col,0.3)
    for(let i=0;i<4;i++) ctx.fillText('█ █ █ █ █',cx-5,y+WALL+25+i*14)
  }

  if(idx===4){ // SCOUT — circular radar + display terminals
    // radar
    const rr=28
    ctx.strokeStyle=rgba(col,0.15);ctx.lineWidth=0.8
    for(let r=8;r<=rr;r+=8){ ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke() }
    ctx.beginPath();ctx.moveTo(cx-rr,cy);ctx.lineTo(cx+rr,cy);ctx.stroke()
    ctx.beginPath();ctx.moveTo(cx,cy-rr);ctx.lineTo(cx,cy+rr);ctx.stroke()
    // sweep
    ctx.save();ctx.translate(cx,cy);ctx.rotate(f*1.2)
    const sweep=ctx.createConicalGradient?.(0,0,0)??null
    if(!sweep){
      // fallback: rotating line
      ctx.strokeStyle=rgba(col,0.6);ctx.lineWidth=1.5
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(rr,0);ctx.stroke()
      // sweep fade arc
      const arcG=ctx.createLinearGradient(0,0,rr,0)
      arcG.addColorStop(0,rgba(col,0.3));arcG.addColorStop(1,rgba(col,0))
      ctx.fillStyle=arcG
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,rr,-0.6,0);ctx.closePath();ctx.fill()
    }
    ctx.restore()
    // radar blips
    for(let i=0;i<3;i++){
      const a=f*0.5+i*2.1, d=8+i*9
      const bx=cx+Math.cos(a)*d, by=cy+Math.sin(a)*d
      ctx.fillStyle=rgba(col,0.7+Math.sin(f*3+i)*0.3)
      ctx.beginPath();ctx.arc(bx,by,1.5,0,Math.PI*2);ctx.fill()
    }
    // outer ring
    ctx.strokeStyle=rgba(col,0.4+p*0.2);ctx.lineWidth=1.5
    ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);ctx.stroke()
    // terminals right side
    for(let i=0;i<2;i++){
      const tx2=x+RW-WALL-20,ty=y+WALL+22+i*38
      ctx.fillStyle=rgba(col,0.08);ctx.fillRect(tx2,ty,16,28)
      ctx.strokeStyle=rgba(col,0.3);ctx.lineWidth=0.7;ctx.strokeRect(tx2,ty,16,28)
      for(let r=0;r<4;r++){
        ctx.fillStyle=rgba(col,0.25+Math.sin(f+i+r)*0.15);ctx.fillRect(tx2+2,ty+4+r*6,12,4)
      }
    }
  }
}

// ── Sci-Fi corridor ─────────────────────────────────────────
function drawCorridor(ctx:CanvasRenderingContext2D,c:Corridor,fromIdx:number){
  const col=CHAMBERS[fromIdx%5].color
  drawFloor(ctx,c.x,c.y,c.w,c.h,col,true)
  // metal walls
  ctx.fillStyle='#080810'
  if(c.dir==='h'){
    ctx.fillRect(c.x,c.y-WALL,c.w,WALL); ctx.fillRect(c.x,c.y+c.h,c.w,WALL)
    // caution stripes
    ctx.strokeStyle='rgba(255,200,0,0.12)';ctx.lineWidth=1.5;ctx.setLineDash([8,8])
    ctx.beginPath();ctx.moveTo(c.x,c.y-WALL/2);ctx.lineTo(c.x+c.w,c.y-WALL/2);ctx.stroke()
    ctx.beginPath();ctx.moveTo(c.x,c.y+c.h+WALL/2);ctx.lineTo(c.x+c.w,c.y+c.h+WALL/2);ctx.stroke()
    ctx.setLineDash([])
    // neon strip
    ctx.strokeStyle=rgba(col,0.3);ctx.lineWidth=1
    ctx.beginPath();ctx.moveTo(c.x,c.y+c.h/2);ctx.lineTo(c.x+c.w,c.y+c.h/2);ctx.stroke()
  } else {
    ctx.fillRect(c.x-WALL,c.y,WALL,c.h); ctx.fillRect(c.x+c.w,c.y,WALL,c.h)
    ctx.strokeStyle='rgba(255,200,0,0.12)';ctx.lineWidth=1.5;ctx.setLineDash([8,8])
    ctx.beginPath();ctx.moveTo(c.x-WALL/2,c.y);ctx.lineTo(c.x-WALL/2,c.y+c.h);ctx.stroke()
    ctx.beginPath();ctx.moveTo(c.x+c.w+WALL/2,c.y);ctx.lineTo(c.x+c.w+WALL/2,c.y+c.h);ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle=rgba(col,0.3);ctx.lineWidth=1
    ctx.beginPath();ctx.moveTo(c.x+c.w/2,c.y);ctx.lineTo(c.x+c.w/2,c.y+c.h);ctx.stroke()
  }
}

// ── Pixel art NPC ───────────────────────────────────────────
function drawNPC(ctx:CanvasRenderingContext2D,npc:NPC,frame:number){
  const {x,y,color,cls,facing,tasks,hp,level}=npc
  const moving=Math.abs(npc.vx)>0.2||Math.abs(npc.vy)>0.2||npc.inCorridor
  const working=tasks.some(t=>t.status==='in_progress')
  const walk=Math.sin(npc.animT*0.4)

  ctx.save(); ctx.translate(x,y)
  ctx.scale(facing,1)

  // shadow
  ctx.beginPath();ctx.ellipse(0,13,6,2,0,0,Math.PI*2)
  ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fill()

  // legs (pixel blocks)
  const [r,g,b]=color
  const darkC=`rgb(${Math.floor(r*0.3)},${Math.floor(g*0.3)},${Math.floor(b*0.3)})`
  const midC=`rgb(${Math.floor(r*0.5)},${Math.floor(g*0.5)},${Math.floor(b*0.5)})`
  ctx.fillStyle=darkC
  if(moving){
    ctx.save();ctx.translate(-2,6);ctx.rotate(walk*0.5);ctx.fillRect(-2,0,4,6);ctx.restore()
    ctx.save();ctx.translate(2,6);ctx.rotate(-walk*0.5);ctx.fillRect(-2,0,4,6);ctx.restore()
  } else {
    ctx.fillRect(-4,6,4,6);ctx.fillRect(1,6,4,6)
  }

  // body (armor plate)
  ctx.fillStyle=midC;ctx.fillRect(-5,-2,10,9)
  // armor detail
  ctx.fillStyle=rgba(color,0.35);ctx.fillRect(-3,0,6,4)
  // chest stripe
  ctx.fillStyle=rgba(color,0.6);ctx.fillRect(-1,-2,2,9)

  // arms
  ctx.fillStyle=midC
  if(moving){
    ctx.save();ctx.translate(-5,1);ctx.rotate(-walk*0.4);ctx.fillRect(-2,-1,3,5);ctx.restore()
    ctx.save();ctx.translate(5,1);ctx.rotate(walk*0.4);ctx.fillRect(-1,-1,3,5);ctx.restore()
  } else {
    ctx.fillRect(-7,0,3,5);ctx.fillRect(5,0,3,5)
    // weapon in right hand
    drawSciFiWeapon(ctx,cls,color)
  }

  // helmet/head
  const headCol=`rgb(${Math.floor(r*0.6+40)},${Math.floor(g*0.6+30)},${Math.floor(b*0.6+40)})`
  ctx.fillStyle=headCol;ctx.fillRect(-4,-11,8,8)
  // visor
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(-3,-9,6,4)
  ctx.fillStyle=rgba(color,working?0.9:0.5);ctx.fillRect(-3,-9,6,2)
  // helmet trim
  ctx.strokeStyle=rgba(color,0.6);ctx.lineWidth=0.8;ctx.strokeRect(-4,-11,8,8)
  // antenna (class specific)
  if(cls==='TECH'||cls==='RECON'){
    ctx.strokeStyle=rgba(color,0.7);ctx.lineWidth=0.8
    ctx.beginPath();ctx.moveTo(3,-11);ctx.lineTo(3,-15);ctx.stroke()
    ctx.fillStyle=rgba(color,0.9);ctx.beginPath();ctx.arc(3,-15,1.2,0,Math.PI*2);ctx.fill()
  }

  ctx.restore()

  // hp bar (drawn unscaled at real position)
  const bw=16
  ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(x-bw/2,y+15,bw,3)
  ctx.fillStyle=rgba(hp>0.6?[0,210,115]:hp>0.3?[240,170,0]:[215,50,85],0.85)
  ctx.fillRect(x-bw/2,y+15,bw*hp,3)

  // level tag
  ctx.font='bold 6px monospace';ctx.fillStyle=rgba(color,0.6);ctx.textAlign='center'
  ctx.fillText(`L${level}`,x,y+24)
}

function drawSciFiWeapon(ctx:CanvasRenderingContext2D,cls:AgentClass,col:RGB){
  ctx.strokeStyle=rgba(col,0.85);ctx.lineWidth=1.2
  if(cls==='OPS'){     ctx.fillRect(5,0,2,5);ctx.fillRect(7,1,4,2);ctx.fillStyle=rgba(col,0.8) }
  else if(cls==='TECH'){ ctx.strokeStyle=rgba(col,0.7);ctx.beginPath();ctx.arc(8,3,3,0,Math.PI*2);ctx.stroke() }
  else if(cls==='RECON'){ ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(5,6);ctx.stroke();ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(9,0);ctx.stroke() }
  else if(cls==='MEDIC'){ ctx.beginPath();ctx.moveTo(7,1);ctx.lineTo(7,5);ctx.stroke();ctx.beginPath();ctx.moveTo(5,3);ctx.lineTo(9,3);ctx.stroke() }
  else if(cls==='HEAVY'){ ctx.fillStyle=rgba(col,0.4);ctx.fillRect(4,-1,5,7);ctx.strokeRect(4,-1,5,7) }
}

// ── Task orb ────────────────────────────────────────────────
function drawTaskOrb(ctx:CanvasRenderingContext2D,task:Todo,tx:number,ty:number,sec:number){
  const col=STATUS_RGB[task.status]??[60,70,90]
  const p=Math.sin(sec*2+tx)*0.5+0.5,r=7+p*1.5
  const g=ctx.createRadialGradient(tx,ty,0,tx,ty,r*2.2)
  g.addColorStop(0,rgba(col,0.2+p*0.15));g.addColorStop(1,rgba(col,0))
  ctx.beginPath();ctx.arc(tx,ty,r*2.2,0,Math.PI*2);ctx.fillStyle=g;ctx.fill()
  ctx.beginPath();ctx.arc(tx,ty,r,0,Math.PI*2)
  ctx.fillStyle=rgba(col,0.08);ctx.strokeStyle=rgba(col,0.6+p*0.3);ctx.lineWidth=1.5;ctx.fill();ctx.stroke()
  ctx.font=`${task.status==='in_progress'?9:8}px monospace`
  ctx.fillStyle=rgba(col,0.9);ctx.textAlign='center';ctx.textBaseline='middle'
  ctx.fillText(STATUS_GLYPH[task.status]??'?',tx,ty);ctx.textBaseline='alphabetic'
  ctx.font='5px monospace';ctx.fillStyle=rgba(col,0.4)
  ctx.fillText(task.title.length>13?task.title.slice(0,12)+'…':task.title,tx,ty+r+7)
}

function taskOffsets(n:number):{dx:number;dy:number}[]{
  if(n===0) return []
  if(n===1) return [{dx:0,dy:0}]
  if(n===2) return [{dx:-28,dy:0},{dx:28,dy:0}]
  if(n===3) return [{dx:0,dy:-18},{dx:-28,dy:16},{dx:28,dy:16}]
  if(n===4) return [{dx:-28,dy:-16},{dx:28,dy:-16},{dx:-28,dy:16},{dx:28,dy:16}]
  return [{dx:0,dy:-22},{dx:-32,dy:-4},{dx:32,dy:-4},{dx:-22,dy:20},{dx:22,dy:20}]
}

function corrPos(c:Corridor,t:number,dir:1|-1){
  const tt=dir===1?t:1-t
  return c.dir==='h'?{x:c.x+tt*c.w,y:c.y+c.h/2}:{x:c.x+c.w/2,y:c.y+tt*c.h}
}

// ── Component ───────────────────────────────────────────────
export default function EcosystemView({todos}:Props){
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const stateRef=useRef<{
    npcs:NPC[]; rooms:Room[]; corridors:Corridor[]
    sparks:Spark[]; floatTexts:FloatText[]
    frame:number; raf:number; canvasW:number; canvasH:number
    prevStatus:Map<string,string>; starsInit:boolean
  }>({npcs:[],rooms:[],corridors:[],sparks:[],floatTexts:[],
    frame:0,raf:0,canvasW:640,canvasH:460,prevStatus:new Map(),starsInit:false})

  function spawnSparks(x:number,y:number,col:RGB,n=6){
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2,s=1+Math.random()*2
      stateRef.current.sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:1,col})
    }
  }

  function syncWorld(todos:Todo[]){
    const st=stateRef.current

    // detect status changes
    for(const t of todos){
      const prev=st.prevStatus.get(t.id)
      if(prev&&prev!==t.status){
        const room=st.rooms.find(r=>r.agents.includes(t.assigned_agent??'__unassigned__'))
        if(room){
          const offs=taskOffsets(room.tasks.length)
          const idx=room.tasks.findIndex(tt=>tt.id===t.id)
          if(idx>=0&&idx<offs.length){
            const cx=room.x+RW/2+offs[idx].dx,cy=room.y+RH/2+10+offs[idx].dy
            spawnSparks(cx,cy,STATUS_RGB[t.status]??[60,70,90],t.status==='completed'?14:6)
            if(t.status==='completed') st.floatTexts.push({x:cx,y:cy-12,vy:-0.9,text:'COMPLETE',col:STATUS_RGB.completed,life:1})
            if(t.status==='failed')    st.floatTexts.push({x:cx,y:cy-12,vy:-0.9,text:'FAILED',  col:STATUS_RGB.failed,   life:1})
          }
        }
      }
      st.prevStatus.set(t.id,t.status)
    }

    // group agents → 5 rooms (only agents actively working)
    const agentMap=new Map<string,Todo[]>()
    for(const t of todos.filter(t=>t.status==='in_progress'&&t.assigned_agent)){
      const k=t.assigned_agent!
      if(!agentMap.has(k)) agentMap.set(k,[])
      agentMap.get(k)!.push(t)
    }
    const allAgents=[...agentMap.entries()].map(([name,tasks])=>({name,tasks}))

    const {rooms,corridors,canvasW,canvasH}=buildLayout()
    st.rooms=rooms; st.corridors=corridors; st.canvasW=canvasW; st.canvasH=canvasH

    // assign each agent to a room & populate room data
    const agentRoom=new Map<string,number>()
    for(const {name,tasks} of allAgents){
      const ri=hashStr(name)%5
      agentRoom.set(name,ri)
      rooms[ri].agents.push(name)
      rooms[ri].tasks.push(...tasks)
    }

    // seed corridor particles
    for(const c of st.corridors){
      while(c.particles.length<3){
        const col=CHAMBERS[Math.floor(Math.random()*5)].color
        c.particles.push({t:Math.random(),spd:0.004+Math.random()*0.005,col})
      }
    }

    // sync NPC states
    const prevMap=new Map(st.npcs.map(n=>[n.name,n]))
    st.npcs=allAgents.map(({name,tasks})=>{
      const prev=prevMap.get(name)
      const h=hashStr(name)
      const cls=CLASSES[h%CLASSES.length]
      const col=CLASS_COLOR[cls]
      const ri=agentRoom.get(name)??0
      const room=rooms[ri]
      const cx=room.x+RW/2,cy=room.y+RH/2
      const done=tasks.filter(t=>t.status==='completed').length
      return {
        name,cls,color:col,tasks,
        x:prev?.x??cx,y:prev?.y??cy,
        vx:prev?.vx??0,vy:prev?.vy??0,facing:prev?.facing??1,
        homeRoom:ri,curRoom:prev?.curRoom??ri,
        inCorridor:prev?.inCorridor??false,
        corrIdx:prev?.corrIdx??0,corrDir:prev?.corrDir??1,corrT:prev?.corrT??0,
        wanderT:prev?.wanderT??Math.random()*80,animT:prev?.animT??0,
        hp:Math.max(0.15,1-tasks.filter(t=>t.status==='failed').length/Math.max(tasks.length,1)),
        level:1+Math.floor(done/2),
      }
    })
  }

  function tick(ctx:CanvasRenderingContext2D,dpr:number){
    const st=stateRef.current
    const sec=st.frame*0.016; st.frame++
    const W=st.canvasW,H=st.canvasH

    if(!st.starsInit){ initStars(W,H); st.starsInit=true }

    ctx.save();ctx.scale(dpr,dpr)

    // space background
    ctx.fillStyle='#030308';ctx.fillRect(0,0,W,H)
    // nebula glow
    const ng=ctx.createRadialGradient(W*0.5,H*0.5,0,W*0.5,H*0.5,W*0.7)
    ng.addColorStop(0,'rgba(10,5,30,0.6)');ng.addColorStop(1,'rgba(2,2,8,0)')
    ctx.fillStyle=ng;ctx.fillRect(0,0,W,H)
    drawStars(ctx,st.frame,W,H)

    // corridors
    for(const c of st.corridors){
      drawCorridor(ctx,c,c.fromIdx)
      for(const p of c.particles){
        p.t=(p.t+p.spd)%1
        const px=c.dir==='h'?c.x+p.t*c.w:c.x+c.w/2
        const py=c.dir==='v'?c.y+p.t*c.h:c.y+c.h/2
        const g=ctx.createRadialGradient(px,py,0,px,py,3.5)
        g.addColorStop(0,rgba(p.col,0.7));g.addColorStop(1,rgba(p.col,0))
        ctx.beginPath();ctx.arc(px,py,3.5,0,Math.PI*2);ctx.fillStyle=g;ctx.fill()
        ctx.beginPath();ctx.arc(px,py,1,0,Math.PI*2);ctx.fillStyle=rgba(p.col,1);ctx.fill()
      }
    }

    // rooms + task orbs
    for(const room of st.rooms){
      drawRoom(ctx,room,st.frame)
      const offs=taskOffsets(room.tasks.length)
      const cx=room.x+RW/2,cy=room.y+RH/2+10
      room.tasks.forEach((task,i)=>{ if(i<offs.length) drawTaskOrb(ctx,task,cx+offs[i].dx,cy+offs[i].dy,sec) })
    }

    // NPCs
    for(const npc of st.npcs){
      const spd=2.0

      if(npc.inCorridor){
        npc.corrT+=spd*0.012
        const c=st.corridors[npc.corrIdx]
        if(!c){npc.inCorridor=false;continue}
        const pos=corrPos(c,npc.corrT,npc.corrDir)
        const prevX=npc.x; npc.x=pos.x; npc.y=pos.y
        npc.vx=npc.x-prevX; npc.vy=0
        if(npc.vx>0.05) npc.facing=1
        if(npc.vx<-0.05) npc.facing=-1
        if(npc.corrT>=1){
          npc.inCorridor=false; npc.corrT=0
          npc.curRoom=npc.corrDir===1?c.toIdx:c.fromIdx
          npc.wanderT=50+Math.random()*80
        }
        npc.animT++
      } else {
        const room=st.rooms[npc.curRoom]; if(!room) continue
        const iX=room.x+WALL+8,iY=room.y+WALL+18
        const iW=RW-WALL*2-16,iH=RH-WALL*2-34

        npc.wanderT--
        if(npc.wanderT<=0){
          if(Math.random()<0.4&&room.doors.length>0){
            const door=room.doors[Math.floor(Math.random()*room.doors.length)]
            npc.inCorridor=true; npc.corrIdx=door.corrIdx; npc.corrT=0
            npc.corrDir=st.corridors[door.corrIdx]?.fromIdx===npc.curRoom?1:-1
          } else {
            const cx=room.x+RW/2,cy=room.y+RH/2
            // bias toward room center
            const tx=cx+((Math.random()-0.5)*(iW*0.7))
            const ty=cy+((Math.random()-0.5)*(iH*0.7))
            npc.vx=(tx-npc.x)*0.05
            npc.vy=(ty-npc.y)*0.05
            npc.wanderT=60+Math.random()*80
          }
        }

        // move toward active task in home room
        const active=npc.tasks.find(t=>t.status==='in_progress')
        if(active&&npc.curRoom===npc.homeRoom){
          const offs=taskOffsets(room.tasks.length)
          const idx=room.tasks.findIndex(t=>t.id===active.id)
          if(idx>=0&&idx<offs.length){
            const tx=room.x+RW/2+offs[idx].dx,ty=room.y+RH/2+10+offs[idx].dy
            npc.vx=lerp(npc.vx,(tx-npc.x)*0.06,0.1)
            npc.vy=lerp(npc.vy,(ty-npc.y)*0.06,0.1)
          }
        }

        npc.vx*=0.88; npc.vy*=0.88
        const prevX=npc.x
        npc.x=Math.max(iX,Math.min(iX+iW,npc.x+npc.vx))
        npc.y=Math.max(iY,Math.min(iY+iH,npc.y+npc.vy))
        if(npc.x>prevX+0.1) npc.facing=1
        if(npc.x<prevX-0.1) npc.facing=-1
        const isMoving=Math.abs(npc.vx)>0.15||Math.abs(npc.vy)>0.15
        if(isMoving) npc.animT++
      }

      drawNPC(ctx,npc,st.frame)
    }

    // sparks
    for(let i=st.sparks.length-1;i>=0;i--){
      const s=st.sparks[i]
      s.x+=s.vx;s.y+=s.vy;s.vy+=0.08;s.life-=0.03
      if(s.life<=0){st.sparks.splice(i,1);continue}
      ctx.beginPath();ctx.arc(s.x,s.y,2*s.life,0,Math.PI*2)
      ctx.fillStyle=rgba(s.col,s.life);ctx.fill()
    }
    for(let i=st.floatTexts.length-1;i>=0;i--){
      const f=st.floatTexts[i]
      f.y+=f.vy;f.life-=0.018
      if(f.life<=0){st.floatTexts.splice(i,1);continue}
      ctx.font='bold 8px monospace';ctx.fillStyle=rgba(f.col,f.life);ctx.textAlign='center'
      ctx.fillText(f.text,f.x,f.y)
    }

    ctx.restore()
  }

  useEffect(()=>{ syncWorld(todos) },[todos])

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return
    const dpr=window.devicePixelRatio||1
    const st=stateRef.current
    // Initialize layout so canvas gets correct pixel buffer size immediately
    const {rooms,corridors,canvasW,canvasH}=buildLayout()
    st.rooms=rooms; st.corridors=corridors; st.canvasW=canvasW; st.canvasH=canvasH
    canvas.width=canvasW*dpr; canvas.height=canvasH*dpr
    const ctx=canvas.getContext('2d')!
    const loop=()=>{ tick(ctx,dpr); st.raf=requestAnimationFrame(loop) }
    st.raf=requestAnimationFrame(loop)
    return ()=>cancelAnimationFrame(st.raf)
  },[])

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800/40 shadow-2xl mx-auto" style={{width:'466px',maxWidth:'100%'}}>
      <div className="px-3 py-1.5 bg-[#06060f] border-b border-slate-800/40 flex items-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"/>
        <span className="text-xs text-slate-500 tracking-[0.2em] font-mono">DUNGEON.NET — 5 CHAMBERS ONLINE</span>
        <div className="ml-auto flex gap-3">
          {CHAMBERS.map((ch,i)=>(
            <span key={i} className="text-xs font-mono" style={{color:`rgba(${ch.color[0]},${ch.color[1]},${ch.color[2]},0.65)`}}>
              {ch.name}
            </span>
          ))}
        </div>
      </div>
      <canvas ref={canvasRef} style={{display:'block',height:'380px',width:'466px',maxWidth:'100%',margin:'0 auto'}}/>
    </div>
  )
}
