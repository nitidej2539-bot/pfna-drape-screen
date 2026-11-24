import { useMemo } from 'react';
import * as THREE from 'three';

// โทนห้องผ่าตัดจริง: ผนังขาว ประตู/ขอบเขียวอ่อน พื้นไวนิลเทาลายจุด สแตนเลส
const MINT = '#9fd6bf';
export const MINT_DARK = '#2f8f74';
export const M = {
  steel: { color: '#dfe5ea', metalness: 0.8, roughness: 0.22 },
  chrome: { color: '#e4e5e4', metalness: 1, roughness: 0.16 }, // สแตนเลสขัดเงา
  darkSteel: { color: '#8c979f', metalness: 0.7, roughness: 0.35 },
  wall: { color: '#f3f5f4', metalness: 0.02, roughness: 0.85 },
  ceiling: { color: '#f7f8f8', metalness: 0, roughness: 0.9 },
  floor: { color: '#ffffff', metalness: 0.08, roughness: 0.5 },
  mint: { color: MINT, metalness: 0.15, roughness: 0.55 },
  white: { color: '#eef1f2', metalness: 0.15, roughness: 0.45 },
  pad: { color: '#252c38', metalness: 0.15, roughness: 0.6 },
  black: { color: '#1d232b', metalness: 0.4, roughness: 0.6 },
  skirt: { color: '#c3cacd', metalness: 0.1, roughness: 0.6 }, // บัวเชิงผนังเทาอ่อน (ในห้อง ตามคลิป)
  panelGrey: { color: '#b9bfc2', metalness: 0.55, roughness: 0.35 }, // ตู้/แผงสแตนเลสด้าน
  tableBlue: { color: '#26408f', metalness: 0.25, roughness: 0.45 },
};

export function Mat({ m, map }) {
  return <meshStandardMaterial {...m} map={map ?? null} />;
}

export function Glow({ color = '#3fc4a0', intensity = 2.2 }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />;
}

// แท่งทรงกระบอกจากจุด a ไปจุด b
export function Bar({ a, b, r = 0.035, m = M.steel }) {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { pos: va.add(vb).multiplyScalar(0.5), quat, len };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat} castShadow>
      <cylinderGeometry args={[r, r, len, 16]} />
      <Mat m={m} />
    </mesh>
  );
}

export function Box({ size, position, m, map, rotation, glow, castShadow = true, receiveShadow = false }) {
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={size} />
      {glow ? <Glow color={glow} /> : <Mat m={m} map={map} />}
    </mesh>
  );
}
