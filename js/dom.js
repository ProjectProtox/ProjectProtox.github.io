// PURPOSE:
// Creates HTML DOM elements (Notes, Texts, Images).
// PUBLIC API CONTRACT:
// - createDOM(type, id, wx, wy, bg, content, skipSave): 'type' can be 'sn', 'tx', or 'ib'.

import { state } from './state.js';
import { save } from './network.js';
import { updateDOMPos } from './render.js';

export function uid() { return Math.random().toString(36).substr(2, 9); }

export function createDOM(type, id, wx, wy, bg, content = null, skipSave = false) {
    const isNew = !id;
    id = id || uid();
    
    const div = document.createElement('div');
    div.className = type; 
    div.dataset.id = id;
    div.dataset.wx = wx; div.dataset.wy = wy;
    if(bg && type==='sn') div.style.background = bg;
    
    // Save on resize end (mouseup on container)
    div.onmouseup = (e) => save();
    
    // Header Handle
    const h = document.createElement('div'); 
    h.className = type==='sn' ? 'sh' : (type==='tx' ? 'th' : 'ih');
    
    const b = document.createElement('button'); b.className='close'; b.innerHTML='×';
    b.onclick = () => { div.remove(); save(); };
    
    // Drag Logic
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
    
    if (type === 'ib') {
        // IMAGE LOGIC
        const img = document.createElement('img');
        img.src = content || ''; 
        div.appendChild(img);
        // Header on top of image
        div.appendChild(h);
        h.appendChild(b);
    } else {
        // TEXT/NOTE LOGIC
        div.appendChild(h);
        const inp = type==='sn' ? document.createElement('textarea') : document.createElement('input');
        inp.onmousedown = e => e.stopPropagation();
        inp.oninput = save;
        div.appendChild(inp);
        h.appendChild(b);
    }

    document.body.appendChild(div);
    updateDOMPos();
    
    // Focus if new and text-based
    if(!state.remote && isNew && !skipSave) { 
        state.myHistory.push({ type: type, id: id }); 
        save(); 
        if(type !== 'ib') {
            const input = div.querySelector(type==='sn'?'textarea':'input');
            if(input) setTimeout(()=>input.focus(),10); 
        }
    }
    return div;
}
// END OF FILE