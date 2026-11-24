import { memo, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { asset } from '../lib/asset.js';
import { PRODUCT } from '../data/product.js';
import Architecture from './Architecture.jsx';
import { CArm, FractureTable } from './Equipment.jsx';
import { InstrumentCart, WallEquipment } from './Furniture.jsx';
import { PfnaScreen } from './PfnaParts.jsx';
import { CENTER_Z, DASH_SCREEN, MIRROR, SHOWCASE } from './layout.js';
import { Bar, Box, M, Mat } from './primitives.jsx';

// ค่าคงที่นอกคอมโพเนนต์ — ไม่สร้างวัตถุใหม่ทุกครั้งที่ re-render
const CART_AT = [SHOWCASE.origin[0] - 0.35, 0, SHOWCASE.origin[2] + 1.75];
const LIGHTS = [
  { position: [-0.7, 2.75, CENTER_Z + 0.2], target: [-0.3, 0.9, CENTER_Z] },
  { position: [0.9, 2.8, CENTER_Z - 0.3], target: [0.4, 0.9, CENTER_Z] },
];

function DashboardScreen() {
  const { x, y, z } = DASH_SCREEN;
  return (
    <group position={[x, y, z]} rotation-y={-Math.PI / 2}>
      <Box size={[3.4, 2.0, 0.06]} position={[0, 0, 0]} m={M.black} castShadow={false} />
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[3.3, 1.9]} />
        <meshStandardMaterial color="#061a3d" emissive="#0b2f6b" emissiveIntensity={0.6} />
      </mesh>
      <Box size={[3.4, 0.02, 0.02]} position={[0, 1.0, 0.05]} glow="#3ad7ff" castShadow={false} />
      <Box size={[3.4, 0.02, 0.02]} position={[0, -1.0, 0.05]} glow="#3ad7ff" castShadow={false} />
    </group>
  );
}

const MANUAL_URL = asset(PRODUCT.manual);

function ManualBoard({ onOpen }) {
  const tex = useTexture(MANUAL_URL);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const w = 0.85;
  const h = w * (1800 / 1272);
  const bottom = 0.78;
  const setCursor = (c) => (document.body.style.cursor = c);
  return (
    <group position={[2.75, 0, CENTER_Z + 0.1]} rotation-y={-0.45}>
      {/* กรอบ + ภาพคู่มือ */}
      <group
        position={[0, bottom + h / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onOpen?.();
        }}
        onPointerOver={() => setCursor('pointer')}
        onPointerOut={() => setCursor('')}
      >
        <Box size={[w + 0.08, h + 0.08, 0.04]} position={[0, 0, -0.025]} m={M.steel} />
        <mesh>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
      {/* ขาตั้งสแตนเลส + ฐาน */}
      <Bar a={[-0.28, 0.04, 0]} b={[-0.28, bottom, 0]} r={0.022} />
      <Bar a={[0.28, 0.04, 0]} b={[0.28, bottom, 0]} r={0.022} />
      <Box size={[0.85, 0.04, 0.42]} position={[0, 0.02, 0]} m={M.steel} />
    </group>
  );
}

/* ---------------- ไฟผ่าตัด ---------------- */
function SurgicalLight({ position, target }) {
  const tgt = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(...target);
    return o;
  }, [target]);
  return (
    <group>
      <Bar a={[position[0], 3.2, position[2]]} b={[position[0], position[1] + 0.1, position[2]]} r={0.03} />
      <mesh position={position}>
        <cylinderGeometry args={[0.38, 0.3, 0.12, 32]} />
        <Mat m={M.white} />
      </mesh>
      <mesh position={[position[0], position[1] - 0.065, position[2]]} rotation-x={Math.PI / 2}>
        <circleGeometry args={[0.28, 32]} />
        <meshBasicMaterial color="#e6f4ff" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <primitive object={tgt} />
      <spotLight
        position={position}
        target={tgt}
        angle={0.5}
        penumbra={0.6}
        intensity={18}
        distance={8}
        color="#dff0ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
    </group>
  );
}

function ORScene({ progress, onOpenManual, quality = 'high' }) {
  return (
    <group>
      <Architecture quality={quality} />
      <InstrumentCart position={CART_AT} />
      {/* เตียง + เสาฉาก + C-Arm กลับด้านซ้าย-ขวา ให้ตรงกับภาพจริงในคลิป
          (ปลายเท้า/แขน traction อยู่ซ้าย หัวเตียงอยู่ขวา เมื่อมองจากฝั่งประตู) */}
      <group scale={[MIRROR, 1, 1]}>
        <FractureTable />
        <PfnaScreen progress={progress} />
        <CArm />
        <SurgicalLight {...LIGHTS[0]} />
        <SurgicalLight {...LIGHTS[1]} />
      </group>
      <DashboardScreen />
      <ManualBoard onOpen={onOpenManual} />
      <WallEquipment />
    </group>
  );
}

// ฉากใหญ่ — re-render เฉพาะเมื่อ prop เปลี่ยนจริง ไม่ใช่ทุกครั้งที่เปลี่ยนบท
export default memo(ORScene);
