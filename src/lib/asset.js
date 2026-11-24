// ที่อยู่ไฟล์ใน public/ (รองรับการวางเว็บในโฟลเดอร์ย่อย)
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

// ภาพเฟรมที่ i ของชุดภาพ เช่น walkin/f0012.webp
export const frameUrl = (dir, i) => asset(`${dir}/f${String(i).padStart(4, '0')}.webp`);
