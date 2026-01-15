// PURPOSE:
// Main entry point. Contains robust logic to prevent crashes if DOM isn't ready.
// PUBLIC API CONTRACT:
// - Waits for DOMContentLoaded.
// - Initializes DOM elements references.
// - Checks URL and Routing.
// - Hides/Shows UI accordingly.

import { state, elements, refreshElements } from './state.js';
import { initNetwork } from './network.js';
import { initEvents } from './events.js';

// Wait for browser to be ready
window.addEventListener('DOMContentLoaded', () => {
    
    // 1. Grab DOM elements safely
    refreshElements();

    // 2. Check Routing
    const urlParams = new URLSearchParams(location.search);
    state.ROOM = urlParams.get('raum');

    // 3. Routing Logic
    if (!state.ROOM) {
        // --- HOMESCREEN MODE ---
        // Ensure Home is visible, Whiteboard hidden
        const home = document.getElementById('home-screen');
        if(home) home.style.display = 'flex';
        
        // Define Join Action
        const join = () => {
            const input = document.getElementById('roomInput');
            const val = input.value.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '_');
            
            if(val.length > 0) {
                window.location.search = '?raum=' + val;
            } else {
                alert("Bitte einen Raumnamen eingeben.");
            }
        };
        
        // Attach Listeners
        const btn = document.getElementById('btnJoin');
        const inp = document.getElementById('roomInput');
        
        if(btn) btn.onclick = join;
        if(inp) inp.onkeydown = (e) => { if(e.key==='Enter') join(); };

    } else {
        // --- WHITEBOARD MODE ---
        
        // Hide Home
        const home = document.getElementById('home-screen');
        if(home) home.style.display = 'none';
        
        // Show Whiteboard UI
        document.querySelectorAll('.wb-ui').forEach(el => el.style.display = 'flex');
        
        // Setup Canvas
        if (elements.c) {
            elements.c.style.display = 'block'; 
            elements.c.width = innerWidth; 
            elements.c.height = innerHeight;
        }

        document.title = "Board: " + state.ROOM;
        
        // Initialize Systems
        initEvents();
        initNetwork();
    }
});
// END OF FILE