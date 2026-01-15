// PURPOSE:
// Handles PDF export functionality.
// PUBLIC API CONTRACT:
// - exportToPDF(): Snapshots the board and saves as PDF.

import { state, elements } from './state.js';
import { draw, updateDOMPos } from './render.js';

export async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const { c } = elements;

    // Check content
    const notes = document.querySelectorAll('.sn, .tx, .ib');
    if (state.el.length === 0 && notes.length === 0) {
        alert("Board ist leer!");
        return;
    }

    // Feedback
    const originalText = elements.st.innerText;
    elements.st.innerText = "Erstelle PDF...";
    elements.sd.className = 'dot load';

    // Save State
    const savedState = {
        ox: state.ox, oy: state.oy, z: state.z,
        width: c.width, height: c.height
    };

    // Calculate Bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    state.el.forEach(e => {
        if (e.t === 'p') {
            e.pts.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.x > maxX) maxX = p.x;
                if (p.y > maxY) maxY = p.y;
            });
        } else {
            if (e.x < minX) minX = e.x;
            if (e.y < minY) minY = e.y;
            if (e.x + e.w > maxX) maxX = e.x + e.w;
            if (e.y + e.h > maxY) maxY = e.y + e.h;
        }
    });

    notes.forEach(el => {
        const x = parseFloat(el.dataset.wx);
        const y = parseFloat(el.dataset.wy);
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x + w > maxX) maxX = x + w;
        if (y + h > maxY) maxY = y + h;
    });

    // Padding & Defaults
    if (minX === Infinity) { minX = 0; minY = 0; maxX = 800; maxY = 600; }
    const padding = 50;
    minX -= padding; minY -= padding;
    maxX += padding; maxY += padding;
    const totalW = maxX - minX;
    const totalH = maxY - minY;

    // View Reset
    state.z = 1;
    state.ox = -minX;
    state.oy = -minY;
    c.width = totalW;
    c.height = totalH;

    // Hide UI
    document.querySelector('.tb').style.display = 'none';
    document.querySelector('.zc').style.display = 'none';
    document.querySelector('#status').style.display = 'none';

    draw();
    updateDOMPos();

    try {
        const canvas = await html2canvas(document.body, {
            x: 0, y: 0, width: totalW, height: totalH,
            scale: 2, useCORS: true, logging: false,
            windowWidth: totalW, windowHeight: totalH
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const orientation = totalW > totalH ? 'l' : 'p';
        const pdf = new jsPDF(orientation, 'px', [totalW, totalH]);

        pdf.addImage(imgData, 'JPEG', 0, 0, totalW, totalH);
        pdf.save(`Protox_Whiteboard_${state.ROOM}.pdf`);

    } catch (err) {
        console.error("PDF Error:", err);
        alert("Export fehlgeschlagen.");
    } finally {
        // Restore
        state.ox = savedState.ox;
        state.oy = savedState.oy;
        state.z = savedState.z;
        c.width = savedState.width;
        c.height = savedState.height;

        document.querySelector('.tb').style.display = 'flex';
        document.querySelector('.zc').style.display = 'flex';
        document.querySelector('#status').style.display = 'flex';
        elements.st.innerText = originalText;
        elements.sd.className = 'dot ok';

        draw();
        updateDOMPos();
    }
}
// END OF FILE