// PURPOSE:
// Registers all event listeners (Mouse, Keyboard, Buttons) and handles tool switching.
// PUBLIC API CONTRACT:
// - initEvents(): Attaches all listeners to the window and canvas.
// - setTool(mode, btn): Switches the active tool.

import { state, elements } from './state.js';
import { draw } from './render.js';
import { save } from './network.js';
import { createDOM, uid } from './dom.js';

export function setTool(mode, btn) {
    state.t = mode;
    document.querySelectorAll('.btn').forEach(b => b.classList.remove('on'));
    if(btn) btn.classList.add('on');
}

function undo() {
    if (state.myHistory.length === 0) return;
    const lastItem = state.myHistory.pop();
    const domEl = document.querySelector(`[data-id="${lastItem.id}"]`);
    if (domEl) { domEl.remove(); save(); return; }
    const idx = state.el.findIndex(e => e.id === lastItem.id);
    if (idx !== -1) { state.el.splice(idx, 1); draw(); save(); }
}

function zoom(dir) {
    const { c } = elements;
    const oldZ = state.z;
    if(dir>0) state.z = Math.min(state.z*1.2, 5);
    else state.z = Math.max(state.z/1.2, 0.1);
    
    const cx = c.width/2, cy = c.height/2;
    state.ox = cx - (cx - state.ox) * (state.z/oldZ);
    state.oy = cy - (cy - state.oy) * (state.z/oldZ);
    elements.zl.innerText = Math.round(state.z*100)+'%';
    draw();
}

export function initEvents() {
    const { c } = elements;

    // Buttons
    document.querySelectorAll('[data-tool]').forEach(btn => {
        btn.onclick = () => setTool(btn.dataset.tool, btn);
    });
    document.getElementById('btn-undo').onclick = undo;
    document.getElementById('btn-wipe').onclick = () => { 
        if(confirm('Delete All?')) { state.el=[]; document.querySelectorAll('.sn,.tx').forEach(e=>e.remove()); draw(); save(); } 
    };
    document.getElementById('btn-zoom-in').onclick = () => zoom(1);
    document.getElementById('btn-zoom-out').onclick = () => zoom(-1);

    // Keyboard
    window.onkeydown = e => {
        if(e.code === 'Space' && !state.spacePressed && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
            state.spacePressed = true; c.style.cursor = 'grab';
        }
    };
    window.onkeyup = e => {
        if(e.code === 'Space') { state.spacePressed = false; c.style.cursor = state.t==='s'?'grab':'default'; }
    };

    // Canvas Mouse
    c.onmousedown = e => {
        state.sx=e.clientX; state.sy=e.clientY;
        if (e.button === 1 || state.spacePressed || state.t === 's') {
            state.panning = true; c.style.cursor = 'grabbing'; e.preventDefault(); return;
        }

        const wx=(e.clientX-state.ox)/state.z, wy=(e.clientY-state.oy)/state.z;
        if(state.t==='n') { createDOM('sn', null, wx, wy); setTool('s', document.getElementById('btn-hand')); }
        else if(state.t==='t') { createDOM('tx', null, wx, wy); setTool('s', document.getElementById('btn-hand')); }
        else { state.dragging=true; state.dp=[{x:wx,y:wy}]; }
    };

    c.onmousemove = e => {
        if(state.panning) { 
            state.ox+=e.clientX-state.sx; state.oy+=e.clientY-state.sy; state.sx=e.clientX; state.sy=e.clientY; draw(); 
        } else if(state.dragging) {
            const wx=(e.clientX-state.ox)/state.z, wy=(e.clientY-state.oy)/state.z;
            state.dp.push({x:wx,y:wy}); draw();
        }
    };

    c.onmouseup = e => {
        if(state.panning) { state.panning=false; c.style.cursor = (state.spacePressed || state.t==='s') ? 'grab' : 'default'; }
        else if(state.dragging) {
            state.dragging=false;
            const wx=(e.clientX-state.ox)/state.z, wy=(e.clientY-state.oy)/state.z;
            const start=state.dp[0];
            const lw = parseInt(elements.sz.value);
            const id = uid();
            let newEl = null;

            if(state.t==='d' && state.dp.length>1) newEl = {t:'p', pts:state.dp, col:elements.col.value, lw, id, owner:state.MY_ID};
            else if(state.t==='r'||state.t==='c') {
                const w=Math.abs(wx-start.x), h=Math.abs(wy-start.y);
                if(w>2) newEl = {t:state.t, x:Math.min(wx,start.x), y:Math.min(wy,start.y), w, h, col:elements.col.value, lw, id, owner:state.MY_ID};
            }
            if (newEl) { state.el.push(newEl); state.myHistory.push({ type: 'el', id }); save(); }
            state.dp=[]; draw();
        }
    };
    
    c.onwheel = e => { e.preventDefault(); zoom(e.deltaY<0 ? 1 : -1); };
    window.onresize = () => { c.width=innerWidth; c.height=innerHeight; draw(); };
}
// END OF FILE
