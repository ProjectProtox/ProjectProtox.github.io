export const state = {
    t: 's',          
    dragging: false, 
    panning: false,  
    spacePressed: false,
    sx: 0, sy: 0, 
    ox: 0, oy: 0, 
    z: 1,
    el: [],          
    dp: [],          
    myHistory: [],   
    MY_ID: Math.random().toString(36).substr(2, 9),
    ROOM: null,
    remote: false,
    loaded: false,
    saveTimer: null
};

export const elements = {
    c: null, ctx: null, col: null, sz: null, sd: null, st: null, zl: null
};

export function refreshElements() {
    const c = document.getElementById('c');
    elements.c = c;
    elements.ctx = c ? c.getContext('2d', {alpha:false}) : null;
    elements.col = document.getElementById('col');
    elements.sz = document.getElementById('sz');
    elements.sd = document.getElementById('sd');
    elements.st = document.getElementById('st');
    elements.zl = document.getElementById('zl');
}