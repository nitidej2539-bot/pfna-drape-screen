// ทีมผู้พัฒนา — ภาพอยู่ใน public/images/pi2/ (ต้นฉบับจากโฟลเดอร์ WEB PI2)
// full: true = ภาพเต็มตัวยืนบนแท่น (แสดงทั้งตัว ไม่ครอป)

const IMG = 'images/pi2/';

// ลำดับ: ผู้ตรวจการ → หัวหน้าหอ → วิทยากร PI-2 (พว.สศิธร) → วิทยากร PI-2 ประจำกลุ่มงาน (พว.ศิภาพันธ์) → วิทยากรประจำหน่วยงาน (พว.จันทิรา)
export const ADVISORS = [
  { name: 'พว.นันทิยา มโนเสงี่ยม', role: 'ผู้ตรวจการพยาบาล', photo: `${IMG}advisor-nantiya.jpg` },
  { name: 'พว.อรอนงค์ ปานมาศ', role: 'หัวหน้าหอผู้ป่วย', photo: `${IMG}advisor-ornanong.jpg` },
  { name: 'พว.สศิธร ธงเพ็ง', role: 'วิทยากรที่ปรึกษาโครงการ PI-2', photo: `${IMG}advisor-sasithorn.jpg` },
  {
    name: 'พว.ศิภาพันธ์ ลวสุต',
    role: 'วิทยากรที่ปรึกษาโครงการ PI-2 ประจำกลุ่มงานเฉพาะทางการพยาบาลผ่าตัด',
    photo: `${IMG}advisor-sipaphan.jpg`,
  },
  { name: 'พว.จันทิรา ธนาบูรณ์', role: 'วิทยากรประจำหน่วยงาน', photo: `${IMG}advisor-jantira.jpg` },
];

export const MEMBERS = [
  { name: 'นายนิธิเดชน์ มงคลทิพย์', role: 'ผู้ช่วยพยาบาล 2', note: 'ผู้เสนอโครงการ', photo: `${IMG}member-nitidej.jpg` },
  { name: 'นายกฤษณ์ เศรษมาก', role: 'ผู้ช่วยพยาบาล 3', note: 'ประธานกลุ่ม', photo: `${IMG}member-krit.jpg` },
  { name: 'นายนันทวัน ศิริคุณ', role: 'ผู้ช่วยพยาบาล 2', note: 'เลขานุการ', photo: `${IMG}member-nantawan.jpg` },
];

// ช่องทางติดต่อหน่วยงาน (ข้อมูลสาธารณะของหน่วยงาน ไม่ใส่เบอร์/อีเมลส่วนตัว)
export const CONTACT = {
  unit: 'หอผ่าตัดศัลยกรรมกระดูก (ภูมิสิริฯ 6A)',
  buildingName: 'อาคารภูมิสิริมังคลานุสรณ์',
  floor: 'ชั้น 6A',
  hospital: 'โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย',
  address: '1873 ถนนพระรามที่ 4 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330',
  phone: '02-256-4000 ต่อ 80616', // จากป้ายคู่มือการใช้งาน
  tel: '+6622564000,80616',
  internal: '80616-8',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('อาคารภูมิสิริมังคลานุสรณ์ โรงพยาบาลจุฬาลงกรณ์'),
};

// หน้าหน่วยงาน
export const UNIT = {
  building: `${IMG}unit-building.webp`,
  logos: `${IMG}logos.png`,
  sign: `${IMG}unit-sign.webp`,
  team: `${IMG}unit-team.webp`,
  banner: `${IMG}unit-banner.jpg`,
  bannerAlt: 'นวัตกรรมการพยาบาล เพื่อสุขภาพที่ดีกว่า...ของทุกชีวิต — ฝ่ายการพยาบาล โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย',
  gallery: [
    {
      src: `${IMG}unit-tree.webp`,
      title: 'เติบโตไปด้วยกัน',
      text: 'ทีมห้องผ่าตัดออร์โธปิดิกส์ ร่วมพัฒนางานประจำสู่นวัตกรรม',
      fit: 'contain',
    },
    {
      src: `${IMG}unit-surgery.webp`,
      title: 'ใช้งานจริงในห้องผ่าตัด',
      text: 'นวัตกรรมเสาฉากกั้นระหว่างผ่าตัด PFNA ร่วมกับเครื่อง C-Arm',
      fit: 'cover',
    },
  ],
};
