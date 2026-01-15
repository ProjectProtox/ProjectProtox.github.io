// PURPOSE:
// Manages the global mutable state of the application.
// PUBLIC API CONTRACT:
// - exports 'state' object containing canvas, tools, identity, and history data.
// - exports 'elements' object to reference DOM UI nodes (buttons, canvas, inputs).

export const state = {
    t: 's',          // Current tool
    dragging: false, // Is drawing/dragging
    panning: false,  // Is panning
    spacePressed: false,
    
    // Viewport
    sx: 0, sy: 0, 
    ox: 0, oy: 0, 
    z: 1,

    // Data
    el: [],          // Canvas elements
    dp: [],          // Drawing points
    myHistory: [],   // Local undo stack
    
    // Identity
    MY_ID: Math.random().toString(36).substr(2, 9),
    ROOM: null,
    
    // Sync
    remote: false,
    loaded: false,
    saveTimer: null
};

export const elements = {
    c: document.getElementById('c'),
    ctx: document.getElementById('c').getContext('2d', {alpha:false}),
    col: document.getElementById('col'),
    sz: document.getElementById('sz'),
    sd: document.getElementById('sd'),
    st: document.getElementById('st'),
    zl: document.getElementById('zl')
};
// END OF FILE