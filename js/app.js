import { state, elements, refreshElements } from './state.js';
import { initNetwork } from './network.js';
import { initEvents } from './events.js';

window.addEventListener('DOMContentLoaded', () => {
    refreshElements();

    const urlParams = new URLSearchParams(location.search);
    state.ROOM = urlParams.get('raum');

    if (!state.ROOM) {
        // --- HOMESCREEN ---
        document.getElementById('home-screen').style.display = 'flex';
        
        const join = () => {
            const input = document.getElementById('roomInput');
            const val = input.value.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '_');
            if(val.length > 0) window.location.search = '?raum=' + val;
            else alert("Bitte einen Raumnamen eingeben.");
        };
        
        document.getElementById('btnJoin').onclick = join;
        document.getElementById('roomInput').onkeydown = (e) => { if(e.key==='Enter') join(); };

    } else {
        // --- WHITEBOARD ---
        document.getElementById('home-screen').style.display = 'none';
        document.querySelectorAll('.wb-ui').forEach(el => el.style.display = 'flex');
        
        if (elements.c) {
            elements.c.style.display = 'block'; 
            elements.c.width = innerWidth; 
            elements.c.height = innerHeight;
        }

        document.title = "Board: " + state.ROOM;
        initEvents();
        initNetwork();
    }
});