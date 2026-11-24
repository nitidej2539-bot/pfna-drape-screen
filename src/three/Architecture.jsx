import { useMemo } from 'react';
import { MeshReflectorMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Box, M, MINT_DARK, Mat } from './primitives.jsx';

// ประตูเปิดค้างไว้เสมอ (ฉากเปิดประตูอยู่ในวิดีโอเดินเข้าห้องแล้ว) — ระยะบานประตูจากกึ่งกลาง
const DOOR_X = 1.85;

// พื้นผิวสร้างจาก canvas (ไม่ต้องโหลดไฟล์ภาพ)
function useSurfaceTextures() {
  return useMemo(() => {
    const make = (w, h, draw, rx, ry) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      draw(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    };
    // พื้นไวนิลเทาอมเขียว มีเม็ดประสีเข้ม (แบบพื้นทางเดินหน้าห้องในวิดีโอเดินเข้าห้อง)
    const floor = make(
      1024,
      1024,
      (g, w, h) => {
        g.fillStyle = '#98a6a8';
        g.fillRect(0, 0, w, h);
        const soft = ['#8f9da0', '#a3b0b2', '#949ba5', '#9fada7'];
        for (let i = 0; i < 2600; i++) {
          g.fillStyle = soft[i % soft.length];
          const s = Math.random() * 3 + 1;
          g.fillRect(Math.random() * w, Math.random() * h, s, s);
        }
        const chips = ['#424c51', '#5c666a', '#6b757a', '#323b40'];
        for (let i = 0; i < 900; i++) {
          g.fillStyle = chips[i % chips.length];
          g.save();
          g.translate(Math.random() * w, Math.random() * h);
          g.rotate(Math.random() * Math.PI);
          g.fillRect(0, 0, Math.random() * 6 + 3, Math.random() * 2.5 + 2);
          g.restore();
        }
      },
      5,
      5
    );
    // ผนังแผ่นขาว มีรอยต่อแนวตั้ง
    const wall = make(
      512,
      256,
      (g, w, h) => {
        g.fillStyle = '#f3f5f4';
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#d9dfdd';
        for (let x = 0; x < w; x += 128) g.fillRect(x, 0, 2, h);
      },
      2.5,
      1
    );
    return { floor, wall };
  }, []);
}

/* ---------------- โครงสร้างห้อง + ทางเดิน + ประตู ---------------- */
export default function Architecture({ quality }) {
  const tex = useSurfaceTextures();
  const light = (key, size, pos) => <Box key={key} size={size} position={pos} glow="#ffffff" castShadow={false} />;

  return (
    <group>
      {/* พื้นห้อง (ไวนิลเงา สะท้อนแสงนุ่ม ๆ แบบพื้นห้องผ่าตัดจริง) + เพดาน + ผนังขาว */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -5]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        {quality === 'high' ? (
          <MeshReflectorMaterial
            map={tex.floor}
            color="#ffffff"
            resolution={512}
            blur={[500, 140]}
            mixBlur={1}
            mixStrength={0.4}
            mirror={0.22}
            depthScale={0.6}
            minDepthThreshold={0.5}
            maxDepthThreshold={1.3}
            roughness={0.55}
            metalness={0.05}
          />
        ) : (
          <Mat m={M.floor} map={tex.floor} />
        )}
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, 3.2, -5]}>
        <planeGeometry args={[10, 10]} />
        <Mat m={M.ceiling} />
      </mesh>
      <Box size={[10, 3.2, 0.2]} position={[0, 1.6, -10]} m={M.wall} map={tex.wall} castShadow={false} receiveShadow />
      <Box size={[0.2, 3.2, 10]} position={[-5, 1.6, -5]} m={M.wall} map={tex.wall} castShadow={false} receiveShadow />
      <Box size={[0.2, 3.2, 10]} position={[5, 1.6, -5]} m={M.wall} map={tex.wall} castShadow={false} receiveShadow />

      {/* บัวเชิงผนังเทาอ่อน (ห้องจริงในคลิป) */}
      <Box size={[10, 0.12, 0.03]} position={[0, 0.06, -9.89]} m={M.skirt} castShadow={false} />
      <Box size={[0.03, 0.12, 10]} position={[-4.89, 0.06, -5]} m={M.skirt} castShadow={false} />
      <Box size={[0.03, 0.12, 10]} position={[4.89, 0.06, -5]} m={M.skirt} castShadow={false} />

      {/* ผนังด้านหน้ามีช่องประตู กว้าง 2.4 สูง 2.6 */}
      <Box size={[3.8, 3.2, 0.3]} position={[-3.1, 1.6, 0]} m={M.wall} map={tex.wall} castShadow={false} />
      <Box size={[3.8, 3.2, 0.3]} position={[3.1, 1.6, 0]} m={M.wall} map={tex.wall} castShadow={false} />
      <Box size={[2.4, 0.6, 0.3]} position={[0, 2.9, 0]} m={M.wall} castShadow={false} />

      {/* วงกบประตูสีเขียวอ่อน (ทั้งสองฝั่ง) */}
      {[0.17, -0.17].map((z) => (
        <group key={z}>
          <Box size={[0.1, 2.65, 0.06]} position={[-1.25, 1.32, z]} m={M.mint} />
          <Box size={[0.1, 2.65, 0.06]} position={[1.25, 1.32, z]} m={M.mint} />
          <Box size={[2.6, 0.1, 0.06]} position={[0, 2.65, z]} m={M.mint} />
        </group>
      ))}

      {/* ป้าย OPERATING ROOM + ไฟ IN USE */}
      <Box size={[2.0, 0.34, 0.05]} position={[0, 2.95, 0.19]} m={M.white} />
      <Text position={[0, 2.95, 0.22]} fontSize={0.17} letterSpacing={0.08} color={MINT_DARK} anchorX="center" anchorY="middle">
        OPERATING ROOM
        <meshBasicMaterial color={MINT_DARK} />
      </Text>
      <Box size={[0.36, 0.1, 0.04]} position={[1.45, 2.95, 0.19]} glow="#ff5a52" />

      {/* บานประตูเลื่อนสีเขียวอ่อน + กระจก */}
      {[-DOOR_X, DOOR_X].map((x, i) => (
        <group key={x} position={[x, 0, 0.24]}>
          <Box size={[1.2, 2.58, 0.06]} position={[0, 1.29, 0]} m={M.mint} />
          <mesh position={[i ? -0.32 : 0.32, 1.6, 0.032]}>
            <boxGeometry args={[0.3, 0.75, 0.01]} />
            <meshStandardMaterial color="#cfe9f3" metalness={0.1} roughness={0.05} transparent opacity={0.65} />
          </mesh>
          <Box size={[0.05, 0.4, 0.05]} position={[i ? -0.52 : 0.52, 1.1, 0.05]} m={M.steel} />
        </group>
      ))}

      {/* ทางเดินด้านนอก (ผนังขาว พื้นเทา) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 4.5]} receiveShadow>
        <planeGeometry args={[7, 9]} />
        <Mat m={M.floor} map={tex.floor} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, 3.2, 4.5]}>
        <planeGeometry args={[7, 9]} />
        <Mat m={M.ceiling} />
      </mesh>
      <Box size={[0.2, 3.2, 9]} position={[-3.5, 1.6, 4.5]} m={M.wall} map={tex.wall} castShadow={false} />
      <Box size={[0.2, 3.2, 9]} position={[3.5, 1.6, 4.5]} m={M.wall} map={tex.wall} castShadow={false} />
      <Box size={[0.03, 0.14, 9]} position={[-3.39, 0.07, 4.5]} m={M.mint} castShadow={false} />
      <Box size={[0.03, 0.14, 9]} position={[3.39, 0.07, 4.5]} m={M.mint} castShadow={false} />
      {/* แถบเส้นเขียวนำทางบนพื้น */}
      <Box size={[0.08, 0.004, 8.5]} position={[-1.3, 0.003, 4.4]} m={M.mint} castShadow={false} />
      <Box size={[0.08, 0.004, 8.5]} position={[1.3, 0.003, 4.4]} m={M.mint} castShadow={false} />

      {/* ไฟเพดาน (แผงสว่างสีขาว) */}
      {[1.5, 4, 6.5].map((z) => light(`c${z}`, [1.8, 0.03, 0.4], [0, 3.18, z]))}
      {/* แผงไฟ LED สี่เหลี่ยมเรียงเป็นแถวบนเพดาน (แบบในคลิป) */}
      {[-2.4, -8.4].flatMap((z) =>
        [-3.3, -1.1, 1.1, 3.3].map((x) => (
          <group key={`r${x}${z}`}>
            <Box size={[1.7, 0.04, 0.62]} position={[x, 3.185, z]} m={M.white} castShadow={false} />
            {light(`l${x}${z}`, [1.6, 0.03, 0.52], [x, 3.175, z])}
          </group>
        ))
      )}
      {/* ลำโพงเพดาน + ตัวตรวจจับควัน */}
      <mesh position={[0.2, 3.19, -4.0]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.13, 0.13, 0.02, 32]} />
        <Mat m={{ color: '#e6eaeb', metalness: 0.1, roughness: 0.7 }} />
      </mesh>
      <mesh position={[-0.8, 3.19, -5.2]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 20]} />
        <Mat m={M.white} />
      </mesh>
    </group>
  );
}
