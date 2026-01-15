// PURPOSE:
// Handles the PDF export logic. Calculates bounding box of all content, 
// temporarily resets zoom/pan, snapshots the board, and generates a PDF.
// PUBLIC API CONTRACT:
// - exportToPDF(): The main async function triggered by the UI.

import { state, elements } from './state.js';
import { draw, updateDOMPos } from './render.js';

export async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const { c } = elements;

    // 1. Check if there is content
    const notes = document.querySelectorAll('.sn, .tx, .ib');
    if (state.el.length === 0 && notes.length === 0) {
        alert("Board is empty!");
        return;
    }

    // 2. Notify User
    const originalText = elements.st.innerText;
    elements.st.innerText = "Generating PDF...";
    elements.sd.className = 'dot load';

    // 3. Save current View State
    const savedState = {
        ox: state.ox,
        oy: state.oy,
        z: state.z,
        width: c.width,
        height: c.height
    };

    // 4. Calculate Bounding Box of ALL content (World Coordinates)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // Check Canvas Elements
    state.el.forEach(e => {
        if (e.t === 'p') {
            e.pts.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.x > maxX) maxX = p.x;
                if (p.y > maxY) maxY = p.y;
            });
        } else { // rect or circle
            if (e.x < minX) minX = e.x;
            if (e.y < minY) minY = e.y;
            if (e.x + e.w > maxX) maxX = e.x + e.w;
            if (e.y + e.h > maxY) maxY = e.y + e.h;
        }
    });

    // Check DOM Elements
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

    // Add Padding (50px)
    const padding = 50;
    minX -= padding; minY -= padding;
    maxX += padding; maxY += padding;

    const totalW = maxX - minX;
    const totalH = maxY - minY;

    // 5. Force View to fit everything 1:1
    state.z = 1;
    state.ox = -minX;
    state.oy = -minY;
    
    // Resize canvas to fit content exactly
    c.width = totalW;
    c.height = totalH;

    // Hide UI elements for screenshot
    document.querySelector('.tb').style.display = 'none';
    document.querySelector('.zc').style.display = 'none';
    document.querySelector('#status').style.display = 'none';

    // Redraw everything in new position
    draw();
    updateDOMPos();

    // 6. Capture via html2canvas
    try {
        // We capture document.body but cropped to our content size
        // Note: Since we hid UI and resized canvas/DOM pos, body effectively shows the board.
        const canvas = await html2canvas(document.body, {
            x: 0,
            y: 0,
            width: totalW,
            height: totalH,
            scale: 2, // Higher resolution
            useCORS: true,
            logging: false,
            windowWidth: totalW,
            windowHeight: totalH
        });

        // 7. Generate PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        
        // Orientation based on aspect ratio
        const orientation = totalW > totalH ? 'l' : 'p';
        const pdf = new jsPDF(orientation, 'px', [totalW, totalH]);

        pdf.addImage(imgData, 'JPEG', 0, 0, totalW, totalH);
        pdf.save(`Whiteboard_${state.ROOM}.pdf`);

    } catch (err) {
        console.error("PDF Export failed:", err);
        alert("Export failed. See console.");
    } finally {
        // 8. Restore State
        state.ox = savedState.ox;
        state.oy = savedState.oy;
        state.z = savedState.z;
        c.width = savedState.width;
        c.height = savedState.height;

        // Show UI
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