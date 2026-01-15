// PURPOSE:
// Handles all Canvas drawing operations and updates DOM element positioning.
// PUBLIC API CONTRACT:
// - draw(): Clears canvas, transforms viewport, renders all shapes and current stroke.
// - updateDOMPos(): Recalculates screen positions for sticky notes based on zoom/pan.

import { state, elements } from './state.js';

export function draw() {
    const { ctx, c, col, sz } = elements;
    const { ox, oy, z, el, dragging, dp, t } = state;

    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle = '#f5f5f5'; ctx.fillRect(0,0,c.width,c.height);
    ctx.translate(ox, oy); ctx.scale(z, z);
    
    el.forEach(e => {
        ctx.lineWidth = e.lw || 2; ctx.strokeStyle = e.col; ctx.fillStyle = e.col;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        if(e.t==='p') {
            if(e.pts.length<2) { ctx.moveTo(e.pts[0].x, e.pts[0].y); ctx.lineTo(e.pts[0].x, e.pts[0].y); }
            else { ctx.moveTo(e.pts[0].x, e.pts[0].y); e.pts.forEach(p=>ctx.lineTo(p.x,p.y)); }
            ctx.stroke();
        } else if(e.t==='r') ctx.strokeRect(e.x,e.y,e.w,e.h);
        else if(e.t==='c') {
            const r = Math.sqrt(e.w**2+e.h**2)/2;
            ctx.arc(e.x+e.w/2,e.y+e.h/2,r,0,Math.PI*2);
            ctx.stroke();
        }
    });

    if(dragging && dp.length>1 && t!=='s') {
        ctx.lineWidth = parseInt(sz.value); ctx.strokeStyle = col.value;
        ctx.lineCap='round'; ctx.lineJoin='round';
        if(t==='d') {
            ctx.beginPath(); ctx.moveTo(dp[0].x, dp[0].y);
            dp.forEach(p=>ctx.lineTo(p.x,p.y));
            ctx.stroke();
        } else if(t==='r' || t==='c') {
            const start=dp[0];
            const curr=dp[dp.length-1];
            const w=Math.abs(curr.x-start.x), h=Math.abs(curr.y-start.y);
            const x=Math.min(curr.x,start.x), y=Math.min(curr.y,start.y);
            ctx.beginPath();
            if(t==='r') ctx.strokeRect(x,y,w,h);
            else { const r=Math.sqrt(w**2+h**2)/2; ctx.arc(x+w/2,y+h/2,r,0,Math.PI*2); ctx.stroke(); }
        }
    }
    updateDOMPos();
}

export function updateDOMPos() {
    document.querySelectorAll('.sn, .tx, .ib').forEach(div => {
        const wx = parseFloat(div.dataset.wx);
        const wy = parseFloat(div.dataset.wy);
        div.style.left = (wx * state.z + state.ox) + 'px';
        div.style.top = (wy * state.z + state.oy) + 'px';
    });
}
// END OF FILE