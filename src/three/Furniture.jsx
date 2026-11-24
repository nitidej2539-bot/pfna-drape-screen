import { THead } from './PfnaParts.jsx';
import { Bar, Box, M, Mat } from './primitives.jsx';

/* ---------------- รถเข็นเก็บเสาฉาก (ข้างตู้โชว์วัสดุ) ---------------- */
export function InstrumentCart({ position }) {
  const w = 0.42;
  const d = 0.3;
  return (
    <group position={position}>
      {[
        [-w, -d],
        [w, -d],
        [-w, d],
        [w, d],
      ].map(([x, z]) => (
        <group key={`${x}${z}`}>
          <Bar a={[x, 0.12, z]} b={[x, 0.95, z]} r={0.022} />
          <mesh position={[x, 0.07, z]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <Mat m={M.black} />
          </mesh>
        </group>
      ))}
      {/* ถาดล่าง + ราวยึดด้านบน */}
      <Box size={[w * 2 + 0.06, 0.05, d * 2 + 0.06]} position={[0, 0.2, 0]} m={M.steel} />
      <Box size={[w * 2 + 0.06, 0.04, 0.06]} position={[0, 0.95, 0]} m={M.steel} />
      {/* เสาฉาก 3 ต้นตั้งอยู่ในรถเข็น + ตัวล็อคสีน้ำเงิน */}
      {[-0.22, 0, 0.22].map((x, i) => (
        <group key={x}>
          <Bar a={[x, 0.24, 0]} b={[x, 1.75 + (i === 2 ? 0 : 0.1), 0]} r={0.016} />
          <Box size={[0.06, 0.06, 0.06]} position={[x, 0.95, 0.06]} m={{ color: '#2c5fd0', metalness: 0.2, roughness: 0.5 }} />
        </group>
      ))}
      {[-0.22, 0].map((x) => (
        <group key={x} position={[x, 1.88, 0]}>
          <THead ringR={0.034} />
        </group>
      ))}
      <mesh position={[0.22, 1.76, 0]}>
        <cylinderGeometry args={[0.021, 0.021, 0.07, 20]} />
        <Mat m={M.white} />
      </mesh>
    </group>
  );
}

/* ---------------- เฟอร์นิเจอร์ห้องผ่าตัด (ตามคลิปเดินเข้าห้อง) ---------------- */
function Wheels({ w, d }) {
  return [
    [-w, -d],
    [w, -d],
    [-w, d],
    [w, d],
  ].map(([x, z]) => (
    <mesh key={`${x}${z}`} position={[x, 0.05, z]} rotation-z={Math.PI / 2}>
      <cylinderGeometry args={[0.045, 0.045, 0.03, 14]} />
      <Mat m={M.black} />
    </mesh>
  ));
}

// รถเข็นสแตนเลส 2 ชั้น + ลิ้นชักบน (ซ้ายมือในคลิป)
function StainlessTrolley({ position, rotation = 0 }) {
  const w = 0.32;
  const d = 0.24;
  return (
    <group position={position} rotation-y={rotation}>
      {[
        [-w, -d],
        [w, -d],
        [-w, d],
        [w, d],
      ].map(([x, z]) => (
        <Bar key={`${x}${z}`} a={[x, 0.09, z]} b={[x, 0.92, z]} r={0.014} />
      ))}
      <Box size={[w * 2 + 0.04, 0.025, d * 2 + 0.04]} position={[0, 0.3, 0]} m={M.steel} />
      <Box size={[w * 2 + 0.04, 0.14, d * 2 + 0.04]} position={[0, 0.82, 0]} m={M.steel} />
      <Box size={[0.18, 0.015, 0.01]} position={[0, 0.82, d + 0.03]} m={M.darkSteel} />
      <Bar a={[-w, 0.97, -d]} b={[w, 0.97, -d]} r={0.012} />
      <Wheels w={w} d={d} />
    </group>
  );
}

// ตู้ลิ้นชักสแตนเลสมีล้อ (ขวามือในคลิป)
function DrawerCabinet({ position, rotation = 0, color = M.panelGrey, top = M.steel, drawers = 3 }) {
  const w = 0.3;
  const d = 0.25;
  const h = 0.86;
  return (
    <group position={position} rotation-y={rotation}>
      <Box size={[w * 2, h - 0.1, d * 2]} position={[0, 0.1 + (h - 0.1) / 2, 0]} m={color} />
      <Box size={[w * 2 + 0.04, 0.03, d * 2 + 0.04]} position={[0, h + 0.015, 0]} m={top} />
      {Array.from({ length: drawers }, (_, i) => {
        const y = 0.18 + ((h - 0.2) / drawers) * (i + 0.5);
        return (
          <group key={i}>
            <Box size={[w * 2 - 0.04, 0.006, 0.006]} position={[0, y + (h - 0.2) / drawers / 2 - 0.01, d + 0.004]} m={M.darkSteel} />
            <Box size={[0.14, 0.015, 0.015]} position={[0, y, d + 0.01]} m={M.steel} />
          </group>
        );
      })}
      <Bar a={[-w, h + 0.1, -d]} b={[w, h + 0.1, -d]} r={0.012} />
      <Wheels w={w - 0.04} d={d - 0.04} />
    </group>
  );
}

export function WallEquipment() {
  return (
    <group>
      {/* ผนังซ้าย: แผงติดผนังสเตนเลส 2 แผง (ตู้ควบคุม/จอดูฟิล์ม) */}
      <group position={[-4.87, 1.35, -7.3]} rotation-y={Math.PI / 2}>
        <Box size={[0.62, 0.78, 0.06]} position={[0, 0, 0]} m={M.panelGrey} castShadow={false} />
        <Box size={[0.5, 0.42, 0.01]} position={[0, 0.08, 0.035]} m={{ color: '#3b4650', metalness: 0.3, roughness: 0.25 }} />
      </group>
      <group position={[-4.87, 1.35, -8.1]} rotation-y={Math.PI / 2}>
        <Box size={[0.62, 0.78, 0.06]} position={[0, 0, 0]} m={M.panelGrey} castShadow={false} />
        <Box size={[0.012, 0.6, 0.01]} position={[0.22, 0, 0.035]} m={M.darkSteel} />
      </group>
      {/* ผนังซ้าย: รถเข็นสแตนเลส 2 ชั้น */}
      <StainlessTrolley position={[-4.25, 0, -6.4]} rotation={Math.PI / 2} />

      {/* ผนังขวา: แผงจ่ายแก๊สทางการแพทย์/ปลั๊กไฟ + จอบนแขนยึดผนัง */}
      <group position={[4.86, 1.38, -8.4]} rotation-y={-Math.PI / 2}>
        <Box size={[1.4, 0.2, 0.07]} position={[0, 0, 0]} m={M.white} castShadow={false} />
        {[
          [-0.45, '#f2c230'],
          [-0.3, '#f2c230'],
          [-0.1, '#3fae5a'],
          [0.05, '#e8eef0'],
          [0.2, '#e8eef0'],
          [0.4, '#3d7be0'],
        ].map(([x, c]) => (
          <Box key={x} size={[0.08, 0.08, 0.02]} position={[x, 0, 0.045]} m={{ color: c, metalness: 0.1, roughness: 0.5 }} castShadow={false} />
        ))}
      </group>
      <group position={[4.86, 1.62, -9.35]}>
        <Bar a={[0, 0, 0]} b={[-0.45, 0, 0.2]} r={0.022} />
        <group position={[-0.48, 0, 0.22]} rotation-y={-Math.PI / 2 + 0.5}>
          <Box size={[0.62, 0.4, 0.05]} position={[0, 0, 0]} m={M.black} />
          <Box size={[0.56, 0.34, 0.01]} position={[0, 0, 0.03]} glow="#5b8fd6" />
        </group>
      </group>
      {/* ผนังขวา: ตู้ลิ้นชักสแตนเลส 2 ใบ + รถเข็นลิ้นชักสีเทาท็อปขาว */}
      <DrawerCabinet position={[4.38, 0, -7.6]} rotation={-Math.PI / 2} />
      <DrawerCabinet position={[4.38, 0, -8.35]} rotation={-Math.PI / 2} />
      <DrawerCabinet
        position={[3.7, 0, -9.35]}
        color={{ color: '#7f8a92', metalness: 0.35, roughness: 0.45 }}
        top={M.white}
        drawers={5}
      />
      {/* ใกล้ประตูฝั่งขวา: รถเข็นสแตนเลส */}
      <StainlessTrolley position={[4.25, 0, -1.8]} rotation={-Math.PI / 2} />

      {/* เครื่องดมยา (มุมซ้ายด้านหลัง) */}
      <group position={[-3.7, 0, -9.2]}>
        <Box size={[0.8, 1.3, 0.6]} position={[0, 0.65, 0]} m={M.white} />
        <Box size={[0.5, 0.35, 0.03]} position={[0, 1.55, 0.2]} glow="#3a8bff" />
        <Bar a={[0, 1.3, 0]} b={[0, 1.55, 0.18]} r={0.02} />
      </group>
    </group>
  );
}
