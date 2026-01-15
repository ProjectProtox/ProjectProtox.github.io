// PURPOSE:
// Registers event listeners. Implements Logic for Tools, Undo, Images, PDF Export, and ERASER.
// PUBLIC API CONTRACT:
// - initEvents(): Attaches all listeners.

import { state, elements } from './state.js';
import { draw } from './render.js';
import { save } from './network.js';
import { createDOM, uid } from './dom.js';
import { exportToPDF } from './export.js';

export function setTool(mode, btn) {
    state.t = mode;
    document.querySelectorAll('.btn').forEach(b => b.classList.remove('on'));
    if(btn) btn.classList.add('on');
    
    // Set Cursor for Eraser
    elements.c.style.cursor = mode === 'e' ? 'cell' : (mode === 's' ? 'grab' : 'crosshair');
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

function handleImageFile(file) {
    const { c } = elements;
    if(!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_W = 1000;
            let w = img.width, h = img.height;
            if(w > MAX_W) { h = h * (MAX_W/w); w = MAX_W; }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            
            const cx = (c.width/2 - state.ox)/state.z - (w/2 * 0.5);
            const cy = (c.height/2 - state.oy)/state.z - (h/2 * 0.5);
            
            createDOM('ib', null, cx, cy, null, base64);
            setTool('s', document.getElementById('btn-hand'));
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
}

// --- ERASER LOGIC ---
function tryErase(mx, my) {
    let changed = false;
    // Iterate reverse to delete top elements first
    for (let i = state.el.length - 1; i >= 0; i--) {
        const e = state.el[i];
        let hit = false;
        
        if (e.t === 'r') {
            hit = mx >= e.x && mx <= e.x + e.w && my >= e.y && my <= e.y + e.h;
        } else if (e.t === 'c') {
            const cx = e.x + e.w/2, cy = e.y + e.h/2;
            hit = Math.sqrt((mx-cx)**2 + (my-cy)**2) <= e.w/2;
        } else if (e.t === 'p') {
            // Check near any point in path
            hit = e.pts.some(p => Math.abs(p.x - mx) < 10 && Math.abs(p.y - my) < 10);
        }

        if (hit) {
            state.el.splice(i, 1);
            changed = true;
            // Break after one deletion per click/move frame for precision
            break; 
        }
    }
    if (changed) {
        draw();
        save();
    }
}

export function initEvents() {
    const { c } = elements;

    // Buttons
    document.querySelectorAll('[data-tool]').forEach(btn => {
        btn.onclick = () => setTool(btn.dataset.tool, btn);
    });
    document.getElementById('btn-undo').onclick = undo;
    document.getElementById('btn-wipe').onclick = () => { 
        if(confirm('Alles löschen?')) { state.el=[]; document.querySelectorAll('.sn,.tx,.ib').forEach(e=>e.remove()); draw(); save(); } 
    };
    document.getElementById('btn-zoom-in').onclick = () => zoom(1);
    document.getElementById('btn-zoom-out').onclick = () => zoom(-1);
    
    document.getElementById('btn-export').onclick = exportToPDF;

    document.getElementById('btn-img').onclick = () => {
        document.getElementById('inp-img').value = '';
        document.getElementById('inp-img').click();
    };
    document.getElementById('inp-img').onchange = (e) => {
        handleImageFile(e.target.files[0]);
    };

    window.addEventListener('paste', (e) => {
        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;
        const items = clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) { e.preventDefault(); handleImageFile(blob); return; }
            }
        }
    });

    window.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            if (document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault(); undo();
            }
            return;
        }
        if (e.code === 'Space' && !state.spacePressed && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
            state.spacePressed = true; c.style.cursor = 'grab';
        }
    });

    window.addEventListener('keyup', e => {
        if (e.code === 'Space') { 
            state.spacePressed = false; 
            c.style.cursor = state.t==='s'?'grab':'default'; 
        }
    });

    // Mouse Interaction
    c.onmousedown = e => {
        state.sx=e.clientX; state.sy=e.clientY;
        
        // Panning check
        if (e.button === 1 || state.spacePressed || state.t === 's') {
            state.panning = true; c.style.cursor = 'grabbing'; e.preventDefault(); return;
        }

        const wx=(e.clientX-state.ox)/state.z, wy=(e.clientY-state.oy)/state.z;
        
        if (state.t === 'e') {
            // ERASER MODE: Click
            state.dragging = true; // Use dragging flag to allow drag-erasing
            tryErase(wx, wy);
            return;
        }

        if(state.t==='n') { createDOM('sn', null, wx, wy); setTool('s', document.getElementById('btn-hand')); }
        else if(state.t==='t') { createDOM('tx', null, wx, wy); setTool('s', document.getElementById('btn-hand')); }
        else { state.dragging=true; state.dp=[{x:wx,y:wy}]; }
    };

    c.onmousemove = e => {
        const wx=(e.clientX-state.ox)/state.z, wy=(e.clientY-state.oy)/state.z;

        if(state.panning) { 
            state.ox+=e.clientX-state.sx; state.oy+=e.clientY-state.sy; state.sx=e.clientX; state.sy=e.clientY; draw(); 
        } 
        else if(state.dragging) {
            if (state.t === 'e') {
                // ERASER MODE: Drag
                tryErase(wx, wy);
            } else {
                // DRAWING MODE
                state.dp.push({x:wx,y:wy}); draw();
            }
        }
    };

    c.onmouseup = e => {
        if(state.panning) { state.panning=false; c.style.cursor = (state.spacePressed || state.t==='s') ? 'grab' : 'default'; }
        else if(state.dragging) {
            state.dragging=false;
            
            if (state.t === 'e') return; // Stop eraser

            const wx=(e.clientX-state.ox)/state.z, wy=(e.clientY-state.oy)/state.z;
            const start=state.dp[0];
            const lw = parseInt(elements.sz.value);
            const id = Math.random().toString(36).substr(2, 9);
            let newEl = null;

            if(state.t==='d' && state.dp.length>1) newEl = {t:'p', pts:state.dp, col:elements.col.value, lw, id, owner:state.MY_ID};
            else if((state.t==='r'||state.t==='c') && start) {
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