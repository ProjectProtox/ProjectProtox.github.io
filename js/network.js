// PURPOSE:
// Handles Supabase interactions. Adds image support to save/apply.
// PUBLIC API CONTRACT:
// - initNetwork(): initializes client and subscriptions.
// - save(): Scrapes Canvas, Notes, Texts, AND Images to save.
// - apply(): Reconstructs DOM from remote data.

import { CONFIG } from './config.js';
import { state, elements } from './state.js';
import { draw } from './render.js';
import { createDOM } from './dom.js';

let sb = null;

export async function initNetwork() {
    if (typeof supabase === 'undefined') {
        alert("Supabase Fehler: Bitte Seite neu laden.");
        return;
    }

    const { createClient } = supabase;
    sb = createClient(CONFIG.SB_URL, CONFIG.SB_KEY);

    elements.sd.className='dot load'; elements.st.innerText='Lade ' + state.ROOM;
    
    try {
        let { data, error } = await sb.from('board').select('content').eq('id', state.ROOM).single();
        if (error && error.code === 'PGRST116') {
            await sb.from('board').insert({ id: state.ROOM, content: {} });
            data = { content: {} };
        } 
        
        if (data && data.content) apply(data.content, true);
        state.loaded = true;
        elements.sd.className='dot ok'; elements.st.innerText='Online: ' + state.ROOM;

        sb.channel('wb').on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'board', filter: `id=eq.${state.ROOM}` }, 
            (p) => { if(p.new.content) { state.remote=true; apply(p.new.content, false); state.remote=false; } }
        ).subscribe();
    } catch (e) {
        elements.sd.className='dot err'; elements.st.innerText='Verbindungsfehler';
        console.error(e);
    }
}

export function save() {
    if(state.remote || !state.loaded || !sb) return;
    elements.sd.className='dot load';
    clearTimeout(state.saveTimer);
    
    state.saveTimer = setTimeout(async () => {
        // Collect Notes
        const notes = Array.from(document.querySelectorAll('.sn')).map(n => ({
            id: n.dataset.id, x: parseFloat(n.dataset.wx), y: parseFloat(n.dataset.wy), 
            w: n.style.width, h: n.style.height,
            bg: n.style.background, txt: n.querySelector('textarea').value
        }));
        // Collect Texts
        const texts = Array.from(document.querySelectorAll('.tx')).map(t => ({
            id: t.dataset.id, x: parseFloat(t.dataset.wx), y: parseFloat(t.dataset.wy), 
            w: t.style.width, h: t.style.height,
            txt: t.querySelector('input').value
        }));
        // Collect Images
        const images = Array.from(document.querySelectorAll('.ib')).map(n => ({
            id: n.dataset.id, x: parseFloat(n.dataset.wx), y: parseFloat(n.dataset.wy),
            w: n.style.width, h: n.style.height,
            src: n.querySelector('img').src
        }));
        
        const elWithOwners = state.el.map(e => ({...e, owner: e.owner || 'anon'}));
        
        await sb.from('board').update({ content: {el: elWithOwners, notes, texts, images} }).eq('id', state.ROOM);
        elements.sd.className='dot ok';
    }, 500);
}

export function apply(d, force) {
    state.el = d.el || [];
    const active = document.activeElement;
    const keep = new Set();
    
    const syncDOM = (list, type) => {
        (list||[]).forEach(n => {
            keep.add(n.id);
            let div = document.querySelector(`.${type}[data-id="${n.id}"]`);
            // Pass n.src or n.txt as content. For notes/text it's null here (handled via input val)
            const content = type === 'ib' ? n.src : null;
            
            if(!div) div = createDOM(type, n.id, n.x, n.y, n.bg, content, true);
            
            div.dataset.wx = n.x; div.dataset.wy = n.y;
            if(n.w) div.style.width = n.w;
            if(n.h) div.style.height = n.h;
            
            if(type==='sn') {
                div.style.background = n.bg;
                const input = div.querySelector('textarea');
                if(force || active!==input) input.value = n.txt;
            } else if(type==='tx') {
                const input = div.querySelector('input');
                if(force || active!==input) input.value = n.txt;
            }
        });
    };

    syncDOM(d.notes, 'sn');
    syncDOM(d.texts, 'tx');
    syncDOM(d.images, 'ib');
    
    document.querySelectorAll('.sn,.tx,.ib').forEach(e => { if(!keep.has(e.dataset.id)) e.remove(); });
    draw();
}
// END OF FILE