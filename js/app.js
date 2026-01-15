// PURPOSE:
// Main entry point. Handles routing, room joining, and initialization sequence.
// PUBLIC API CONTRACT:
// - Parses URL parameters for room name.
// - Toggles between Homescreen and Whiteboard UI.
// - Bootstraps network and event systems.

import { state, elements } from './state.js';
import { initNetwork } from './network.js';
import { initEvents } from './events.js';

// Routing
const urlParams = new URLSearchParams(location.search);
state.ROOM = urlParams.get('raum');

if (!state.ROOM) {
    // Show Home, Hide Whiteboard
    document.getElementById('home-screen').style.display = 'flex';
    
    const join = () => {
        const input = document.getElementById('roomInput');
        // Allow slightly more characters but keep it safe
        const val = input.value.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '_');
        if(val) window.location.search = '?raum=' + val;
        else alert("Please enter a room name");
    };
    
    document.getElementById('btnJoin').onclick = join;
    document.getElementById('roomInput').onkeydown = (e) => { if(e.key==='Enter') join(); };

} else {
    // Hide Home
    document.getElementById('home-screen').style.display = 'none';
    
    // Show Whiteboard UI
    document.querySelectorAll('.wb-ui').forEach(el => el.style.display = 'flex');
    
    // Canvas requires block display, not flex
    elements.c.style.display = 'block'; 
    
    document.title = "Board: " + state.ROOM;
    
    // Resize immediately to ensure canvas is visible
    elements.c.width = innerWidth; 
    elements.c.height = innerHeight;
    
    initEvents();
    initNetwork();
}
// END OF FILE