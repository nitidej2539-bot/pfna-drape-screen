import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PFNA, PART_START, INSTALL_RANGE, MIRROR, assembly } from './layout.js';

// ชิ้นส่วนเสาฉาก ถอดแบบจากภาพถ่ายจริง (โฟลเดอร์ PI 2 2568)
const CHROME = { color: '#e4e5e4', metalness: 1, roughness: 0.16 }; // สแตนเลสขัดเงา
const DARK = { color: '#8c979f', metalness: 0.8, roughness: 0.3 };
const CAP = { color: '#f1f1ee', metalness: 0, roughness: 0.55 }; // ปลอกพลาสติกปลายราว
const BLUE = { color: '#1d2f8a', metalness: 0.1, roughness: 0.4 };
const Mat = ({ m }) => <meshStandardMaterial {...m} />;

const Plate = ({ size, position }) => (
  <mesh position={position} castShadow>
    <boxGeometry args={size} />
    <Mat m={CHROME} />
  </mesh>
);

// หัวเสา: ห่วงเชื่อมตัว T (รูห่วงตามแกน x) + สกรูมือหมุนด้านบน — จุด 0 คือกึ่งกลางห่วง
export function THead({ ringR = 0.038, screwRef }) {
  const pts = useMemo(
    () =>
      Array.from({ length: 13 }, (_, i) => {
        const k = (i / 12) * 2 - 1;
        return new THREE.Vector2(ringR * (0.88 + 0.12 * k * k), k * 0.065);
      }),
    [ringR]
  );
  return (
    <group>
      <mesh rotation-z={Math.PI / 2} castShadow>
        <latheGeometry args={[pts, 32]} />
        <meshStandardMaterial {...CHROME} side={THREE.DoubleSide} />
      </mesh>
      {/* รอยเชื่อมกับเสา */}
      <mesh position={[0, -ringR * 0.92, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.02, 0.006, 8, 24]} />
        <Mat m={DARK} />
      </mesh>
      {/* สกรู + มือหมุนตัว T (หมุนตอนล็อคเกลียว) */}
      <group ref={screwRef} position={[0, ringR + 0.04, 0]}>
        <mesh>
          <cylinderGeometry args={[0.008, 0.008, 0.1, 12]} />
          <Mat m={DARK} />
        </mesh>
        {[-0.03, -0.018, -0.006, 0.006, 0.018].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.008, 0.002, 6, 16]} />
            <Mat m={DARK} />
          </mesh>
        ))}
        <mesh position={[0, 0.045, 0]} castShadow>
          <sphereGeometry args={[0.017, 16, 12]} />
          <Mat m={CHROME} />
        </mesh>
        <mesh position={[0, 0.058, 0]} rotation-z={Math.PI / 2} castShadow>
          <capsuleGeometry args={[0.016, 0.11, 6, 16]} />
          <Mat m={CHROME} />
        </mesh>
      </group>
    </group>
  );
}

// ป้ายหมายเลขบนท่อ (หันหน้าไป +z) — อยู่ในกลุ่มที่กลับด้านแกน x จึงต้องกลับตัวอักษรคืน
function NumberTag({ n, r }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[r + 0.001, r + 0.001, 0.07, 24]} />
        <meshStandardMaterial color="#fbfbf8" roughness={0.8} />
      </mesh>
      <Text position={[0, 0, r + 0.004]} scale={[MIRROR, 1, 1]} fontSize={0.042} color="#16181a">
        {String(n)}
      </Text>
    </group>
  );
}

// ตัวเกาะ: ปลอกรัดเสา + ปุ่มหมุนสีน้ำเงิน
export function PoleClamp() {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.038, 0.038, 0.085, 24]} />
        <Mat m={CHROME} />
      </mesh>
      <mesh position={[0, 0, 0.06]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.011, 0.011, 0.06, 12]} />
        <Mat m={DARK} />
      </mesh>
      <mesh position={[0, 0, 0.1]} rotation-x={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.03, 0.034, 0.036, 24]} />
        <Mat m={BLUE} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 0.03, Math.sin((i * Math.PI) / 2) * 0.03, 0.1]}>
          <sphereGeometry args={[0.018, 12, 10]} />
          <Mat m={BLUE} />
        </mesh>
      ))}
    </group>
  );
}

const POLE_R = 0.02;
const OUTER = 0.024;
const INNER = 0.018;
const BELOW = 0.2; // เสาเลยตัวเกาะลงไป
const RING = [0.04, 0.034]; // เสา 1 รับท่อนอก, เสา 2 รับท่อใน
const OVER = 0.1; // ปลายราวเลยห่วงออกไป

function Pole({ base, ringR, n, screwRef }) {
  const bottom = base - BELOW;
  const h = PFNA.top - ringR * 0.9 - bottom;
  return (
    <>
      <mesh position={[0, bottom + h / 2, 0]} castShadow>
        <cylinderGeometry args={[POLE_R, POLE_R, h, 24]} />
        <Mat m={CHROME} />
      </mesh>
      {/* เครื่องหมายระดับความสูง */}
      <mesh position={[0, base + 0.09, 0]}>
        <cylinderGeometry args={[POLE_R + 0.001, POLE_R + 0.001, 0.025, 24]} />
        <meshStandardMaterial color="#1f9d84" roughness={0.7} />
      </mesh>
      <group position={[0, PFNA.top - 0.17, 0]}>
        <NumberTag n={n} r={POLE_R} />
      </group>
      <group position={[0, PFNA.top, 0]}>
        <THead ringR={ringR} screwRef={screwRef} />
      </group>
    </>
  );
}

const Tube = ({ x, len, r }) => (
  <mesh position={[x, 0, 0]} rotation-z={Math.PI / 2} castShadow>
    <cylinderGeometry args={[r, r, len, 24]} />
    <Mat m={CHROME} />
  </mesh>
);
const EndCap = ({ x, r }) => (
  <mesh position={[x, 0, 0]} rotation-z={Math.PI / 2} castShadow>
    <cylinderGeometry args={[r + 0.004, r + 0.004, 0.07, 24]} />
    <Mat m={CAP} />
  </mesh>
);

/* นวัตกรรมเสาฉาก — ประกอบทีละชิ้นตามช่วง scroll ของบท "วิธีติดตั้ง" */
export function PfnaScreen({ progress }) {
  const { z, headX, tracX, top, headBase, tracBase } = PFNA;
  const clamps = useRef();
  const pole1 = useRef();
  const pole2 = useRef();
  const bar = useRef();
  const inner = useRef();
  const screw1 = useRef();
  const screw2 = useRef();
  const drape = useRef();
  const tiny = 0.0001;
  const outerLen = (tracX - headX) * 0.55;
  const innerLen = (tracX - headX) * 0.6;
  const innerEnd = tracX + OVER; // ปลายท่อในเมื่อยืดสุด
  const retract = (tracX - headX) * 0.5; // ระยะที่ท่อในหดเข้าท่อนอก

  useFrame(() => {
    const p = progress.current;
    const s = (k) => assembly(p, PART_START[k]);
    const ease = THREE.MathUtils.smoothstep;
    const c = s('clamps');
    clamps.current.scale.setScalar(Math.max(tiny, c));
    clamps.current.visible = c > 0.01;

    // เสา: เสียบลงมาในตัวเกาะ แล้วเลื่อนลงถึงระดับที่ทำเครื่องหมายไว้
    const drop = (ref, v) => {
      ref.current.visible = v > 0.01;
      ref.current.position.y = (1 - v) * 0.75;
    };
    drop(pole1, s('pole1'));
    drop(pole2, s('pole2'));

    // ราว: สอดท่อนอกเข้าห่วงเสา 1 ก่อน แล้วดึงท่อในยืดไปสวมห่วงเสา 2
    const b = s('bar');
    bar.current.visible = b > 0.01;
    bar.current.position.x = (1 - ease(b, 0, 0.4)) * 0.6;
    inner.current.position.x = -(1 - ease(b, 0.4, 1)) * retract;

    // ล็อคเกลียว: หมุนสกรูตัว T ตามเข็ม 2 รอบทั้งสองด้าน พร้อมกดลง
    // กลุ่มถูกกลับด้านแกน x จึงใช้มุมบวกเพื่อให้เห็นเป็นตามเข็มนาฬิกาเมื่อมองจากด้านบน
    const l = s('lock');
    const turn = (ref, v, ring) => {
      ref.current.rotation.y = v * Math.PI * 4;
      ref.current.position.y = ring + 0.04 - v * 0.018;
    };
    turn(screw1, l, RING[0]);
    turn(screw2, l, RING[1]);

    // ผ้าฉากกั้นโผล่หลังล็อคเสร็จ (ฉากอื่นโล่งเหมือนภาพจริง)
    const from = PART_START.lock + 0.03;
    const on = p >= from && p < INSTALL_RANGE.end + 0.005;
    drape.current.visible = on;
    drape.current.scale.y = on ? Math.max(tiny, ease(p, from, from + 0.02)) : tiny;
  });

  return (
    <group>
      {/* ตัวเสริมยึดเกาะ: หัวเตียง + เสา Traction */}
      <group ref={clamps} position={[0, headBase, z]}>
        <Plate size={[0.5, 0.045, 0.016]} position={[headX + 0.22, 0, 0.09]} />
        <Plate size={[0.07, 0.08, 0.05]} position={[headX + 0.32, 0, 0.1]} />
        <Plate size={[0.045, 0.045, 0.1]} position={[headX, 0, 0.05]} />
        <group position={[headX, 0, 0]}>
          <PoleClamp />
        </group>
        <group position={[tracX, tracBase - headBase, 0]}>
          <Plate size={[0.05, 0.035, 0.46]} position={[0, 0, 0.23]} />
          <PoleClamp />
        </group>
      </group>

      <group ref={pole1}>
        <group position={[headX, 0, z]}>
          <Pole base={headBase} ringR={RING[0]} n={1} screwRef={screw1} />
        </group>
      </group>
      <group ref={pole2}>
        <group position={[tracX, 0, z]}>
          <Pole base={tracBase} ringR={RING[1]} n={2} screwRef={screw2} />
        </group>
      </group>

      {/* ราวหมายเลข 3: ท่อนอก + ท่อในยืดหด + ปลอกขาว */}
      <group ref={bar}>
        <group position={[0, top, z]}>
          <Tube x={headX - OVER + outerLen / 2} len={outerLen} r={OUTER} />
          <EndCap x={headX - OVER} r={OUTER} />
          <EndCap x={headX - OVER + outerLen} r={OUTER} />
          <group ref={inner}>
            <Tube x={innerEnd - innerLen / 2} len={innerLen} r={INNER} />
            <EndCap x={innerEnd} r={INNER} />
            <group position={[innerEnd - 0.3, 0, 0]} rotation-z={Math.PI / 2}>
              <NumberTag n={3} r={INNER} />
            </group>
          </group>
        </group>
      </group>

      {/* ผ้าฉากกั้น (กึ่งโปร่ง) ห้อยจากราว */}
      <group ref={drape} position={[(headX + tracX) / 2, top - 0.02, z]}>
        <mesh position={[0, -0.55, 0]}>
          <planeGeometry args={[tracX - headX - 0.12, 1.1]} />
          <meshStandardMaterial color="#3f9c84" roughness={0.9} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
