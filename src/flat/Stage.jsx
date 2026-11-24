// กรอบ 16:9 ที่ขยายแบบ "cover" เต็มจอเสมอ
// ทุกอย่างข้างในใช้ตำแหน่ง % ของภาพได้ตรงทุกขนาดหน้าจอ
export default function Stage({ src, alt, children }) {
  return (
    <div className="stage">
      <div className="stage-inner">
        <img className="stage-img" src={src} alt={alt} draggable="false" />
        {children}
      </div>
    </div>
  );
}
