const BACKGROUND = '#e9eeed';
const BACKGROUND_RGB = '233,238,237';

// วาดเฟรมแบบ cover เต็มพื้นที่ใต้ header (ครอปส่วนเกินออก ไม่บิดสัดส่วน)
// headerHeight = ความสูง header เป็น CSS px — เว้นไว้เพราะ header โปร่งแสง จะได้ไม่บังส่วนบนของภาพ เช่น ราวเสาฉาก
export function drawWalkFrame(canvas, img, headerHeight) {
  const g = canvas.getContext('2d');
  g.imageSmoothingQuality = 'high';
  const cw = canvas.width;
  const ch = canvas.height;
  const top = Math.round(headerHeight * (cw / canvas.clientWidth));
  const areaH = ch - top;
  g.fillStyle = BACKGROUND;
  g.fillRect(0, 0, cw, ch);

  if (cw / areaH < 1) {
    // จอแนวตั้ง (มือถือ): ถ้าเต็มจอจะเห็นแค่กลางภาพ เสาฉากหลุดขอบ
    // → แสดงเกือบเต็มความกว้าง วางช่วงบนของจอ แล้วไล่ขอบบน/ล่างให้กลืนกับพื้นหลัง
    const s = (cw * 1.18) / img.naturalWidth;
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    const y = top + Math.max(0, areaH * 0.38 - h / 2);
    g.drawImage(img, (cw - w) / 2, y, w, h);
    const fadeH = h * 0.07; // ไล่ขอบบางพอ ไม่ให้ราวด้านบนของเสาฉากจางหาย
    const gradient = (y0, y1) => {
      const gr = g.createLinearGradient(0, y0, 0, y1);
      gr.addColorStop(0, `rgba(${BACKGROUND_RGB},1)`);
      gr.addColorStop(1, `rgba(${BACKGROUND_RGB},0)`);
      return gr;
    };
    g.fillStyle = gradient(y, y + fadeH);
    g.fillRect(0, y, cw, fadeH);
    g.fillStyle = gradient(y + h, y + h - fadeH);
    g.fillRect(0, y + h - fadeH, cw, fadeH);
    return;
  }

  const s = Math.max(cw / img.naturalWidth, areaH / img.naturalHeight);
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  // ชิดขอบล่างของ header ส่วนที่เกินตัดทิ้งทางพื้น (ด้านล่าง) แทนเพดาน
  g.drawImage(img, (cw - w) / 2, top + Math.min(0, (areaH - h) * 0.15), w, h);
}
