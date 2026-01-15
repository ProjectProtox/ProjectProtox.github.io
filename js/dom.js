import { state } from './state.js';
import { save } from './network.js';
import { updateDOMPos } from './render.js';

export function uid() { return Math.random().toString(36).substr(2, 9); }

export function createDOM(type, id, wx, wy, bg, skipSave = false) {
    const isNew = !id;
    id = id || uid();
    
    const div = document.createElement('div');
    div.className = type; 
    div.dataset.id = id;
    div.dataset.wx = wx; div.dataset.wy = wy;
    if(bg) div.style.background = bg;
    
    // Save on resize end
    div.onmouseup = (e) => save();
    
    const h = document.createElement('div'); h.className = type==='sn'?'sh':'th';
    const b = document.createElement('button'); b.className='close'; b.innerHTML='×';
    b.onclick = () => { div.remove(); save(); };
    
    // Move Logic
    h.onmousedown = e => {
        e.stopPropagation(); if(e.target===b) return; e.preventDefault();
        let lx=e.clientX, ly=e.clientY;
        const move = em => {
            div.dataset.wx = parseFloat(div.dataset.wx) + (em.clientX - lx) / state.z;
            div.dataset.wy = parseFloat(div.dataset.wy) + (em.clientY - ly) / state.z;
            lx=em.clientX; ly=em.clientY;
            updateDOMPos();
        };
        const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); save(); };
        document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    };
    
    div.appendChild(h);
    const inp = type==='sn' ? document.createElement('textarea') : document.createElement('input');
    inp.onmousedown = e => e.stopPropagation();
    inp.oninput = save;
    div.appendChild(inp);
    h.appendChild(b);
    document.body.appendChild(div);
    updateDOMPos();
    
    if(!state.remote && isNew && !skipSave) { 
        state.myHistory.push({ type: type, id: id }); 
        save(); setTimeout(()=>inp.focus(),10); 
    }
    return div;
}