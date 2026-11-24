# เว็บนวัตกรรมเสาฉากกั้น PFNA

React + Three.js + GSAP, build ด้วย Vite

## คำสั่ง

| คำสั่ง | ใช้ทำอะไร |
| --- | --- |
| `npm run dev` | เปิดเว็บขณะพัฒนา (เติม `?demo` = โหมดสาธิตสำหรับอัดวิดีโอ) |
| `npm run check` | lint + test + build — รันก่อนเผยแพร่ทุกครั้ง |
| `npm run preview` | เปิดดูเว็บที่ build แล้วใน `dist/` |

ตัวเลือกใน URL: `?lang=en`, `?quality=high`, `?quality=low`

## อยากแก้อะไร แก้ที่ไหน

| สิ่งที่แก้ | ไฟล์ |
| --- | --- |
| ข้อความ ตัวเลข รุ่น ขั้นตอนติดตั้ง | `src/data/product.js` |
| ทีม หน่วยงาน ช่องทางติดต่อ | `src/data/team.js` |
| คำแปลอังกฤษ (ข้อความไทยต้องตรงทุกตัว) | `src/data/en.js` |
| จังหวะบท ขั้นตอน เมนู | `src/config/timeline.js` |
| เส้นทางกล้อง | `src/three/CameraRig.jsx` |
| ตำแหน่งวัตถุในห้อง 3D | `src/three/layout.js` |
| หน้าตา | `src/styles/` (ลำดับใน `index.css` สำคัญ) |

## โครงสร้าง `src/`

- `App.jsx` ประกอบหน้าเว็บ
- `sections/` แต่ละส่วนของหน้าและแผงข้อมูลในห้อง 3D
- `components/` ชิ้นส่วนที่ใช้ร่วมกัน
- `hooks/` พฤติกรรม: การเลื่อน ป๊อปอัป ภาพทีละเฟรม คุณภาพภาพ
- `three/` ห้อง 3D (โหลดแยกจากหน้าแรก)
- `flat/` เวอร์ชันสำรอง 2.5D (`2d.html`)
- `demo.js` + `tools/demoCode.js` โหมดสาธิต

## CI/CD

`.github/workflows/ci-cd.yml` ตรวจ lint + test + build + audit ทุกครั้งที่ push เข้า `main` หรือเปิด pull request

เปิดการเผยแพร่ขึ้น GitHub Pages (repo ต้องเป็น public หรือใช้แพ็กเกจแบบเสียเงิน):

1. Settings → Pages → Source = **GitHub Actions**
2. Settings → Secrets and variables → Actions → Variables → เพิ่ม `DEPLOY_PAGES` = `true`
3. Actions → CI/CD → Run workflow
