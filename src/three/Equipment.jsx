import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { CENTER_Z, PFNA } from './layout.js';

// เตียง Fracture Table และเครื่อง C-Arm ถอดสัดส่วนจากภาพจริง (ภาพติดตั้งเสร็จในโฟลเดอร์ PI 2 2568)
// พิกัดก่อนกลับด้าน: หัวเตียงอยู่ฝั่ง x ลบ, เสา Traction อยู่ฝั่ง x บวก (บนจอ: Traction ซ้าย หัวเตียงขวา)
const STEEL = { color: '#dcdfe0', metalness: 1, roughness: 0.22 };
const BRUSHED = { color: '#bfc4c6', metalness: 0.95, roughness: 0.38 };
const LEATHER = { color: '#17191d', metalness: 0.05, roughness: 0.48 };
const RUBBER = { color: '#0f1113', metalness: 0.05, roughness: 0.75 };
const NAVY = { color: '#1b2b6b', metalness: 0.2, roughness: 0.38 };
const SHELL = { color: '#e9e9e4', metalness: 0.04, roughness: 0.36 }; // พลาสติกขาวครีมของ C-Arm
const LILAC = { color: '#9b99b6', metalness: 0.05, roughness: 0.42 }; // ขอบยาง/มือจับม่วงเทา
const HOSE = { color: '#b9bcc4', metalness: 0.05, roughness: 0.5 };
const CLOTH = { color: '#0f7a68', metalness: 0, roughness: 0.9 };
const LINEN = { color: '#f2f4f3', metalness: 0, roughness: 0.92 };

const Mat = ({ m }) => <meshStandardMaterial {...m} />;

function RBox({ size, position, rotation, m, r = 0.02 }) {
  return (
    <RoundedBox args={size} radius={Math.min(r, Math.min(...size) / 2 - 0.0005)} smoothness={4} position={position} rotation={rotation} castShadow receiveShadow>
      <Mat m={m} />
    </RoundedBox>
  );
}

function Cyl({ r, r2 = r, h, position, rotation, m, seg = 32 }) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <cylinderGeometry args={[r, r2, h, seg]} />
      <Mat m={m} />
    </mesh>
  );
}

function Hose({ points, r = 0.02, m = HOSE, seg = 60 }) {
  const geo = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), seg, r, 10),
    [points, r, seg]
  );
  return (
    <mesh geometry={geo} castShadow>
      <Mat m={m} />
    </mesh>
  );
}

// สายขดของรีโมตเตียง
function Coil({ from, to, turns = 26, r = 0.016 }) {
  const geo = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const pts = Array.from({ length: turns * 10 + 1 }, (_, i) => {
      const k = i / (turns * 10);
      const ang = k * turns * Math.PI * 2;
      const p = a.clone().lerp(b, k);
      p.y -= Math.sin(k * Math.PI) * 0.05;
      return p.add(new THREE.Vector3(Math.cos(ang) * r, 0, Math.sin(ang) * r));
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), turns * 14, 0.004, 6);
  }, [from, to, turns, r]);
  return (
    <mesh geometry={geo}>
      <Mat m={RUBBER} />
    </mesh>
  );
}

// มือหมุนแฉก (ตัวยึดใต้ราว Traction)
function StarKnob({ position }) {
  return (
    <group position={position}>
      <Cyl r={0.045} h={0.07} m={STEEL} position={[0, 0.03, 0]} />
      <Cyl r={0.012} h={0.06} m={BRUSHED} position={[0, -0.03, 0]} />
      <Cyl r={0.028} h={0.026} m={RUBBER} position={[0, -0.07, 0]} />
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 0.038, -0.07, Math.sin((i * Math.PI) / 2) * 0.038]}>
          <sphereGeometry args={[0.018, 12, 10]} />
          <Mat m={RUBBER} />
        </mesh>
      ))}
    </group>
  );
}

const COIL_FROM = [-0.62, 0.72, 0.36];
const COIL_TO = [-0.5, 0.1, 0.3];

export function FractureTable() {
  const base = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0.34, -0.3);
    s.bezierCurveTo(0.1, -0.36, -0.1, -0.27, -0.3, -0.29);
    s.bezierCurveTo(-0.5, -0.31, -0.68, -0.42, -0.86, -0.36);
    s.bezierCurveTo(-0.92, -0.15, -0.92, 0.15, -0.86, 0.36);
    s.bezierCurveTo(-0.68, 0.42, -0.5, 0.31, -0.3, 0.29);
    s.bezierCurveTo(-0.1, 0.27, 0.1, 0.36, 0.34, 0.3);
    s.bezierCurveTo(0.39, 0.12, 0.39, -0.12, 0.34, -0.3);
    return new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.015, bevelSegments: 4, curveSegments: 24 });
  }, []);
  const col = -0.26;
  return (
    <group position={[0, 0, CENTER_Z]}>
      {/* แผ่นฐานสแตนเลสโค้ง */}
      <mesh geometry={base} rotation-x={-Math.PI / 2} position={[0, 0.012, 0]} castShadow receiveShadow>
        <Mat m={BRUSHED} />
      </mesh>
      {/* เสาเตียง: กล่องสแตนเลส + แผงปุ่ม + bellows ดำ + หัวน้ำเงิน */}
      <RBox size={[0.36, 0.34, 0.34]} position={[col, 0.22, 0]} m={BRUSHED} r={0.014} />
      <RBox size={[0.38, 0.04, 0.36]} position={[col, 0.4, 0]} m={STEEL} r={0.01} />
      <RBox size={[0.1, 0.18, 0.014]} position={[col - 0.1, 0.25, 0.176]} m={{ color: '#eceeee', metalness: 0.1, roughness: 0.4 }} r={0.006} />
      {['#d9a441', '#c0504d', '#5b8db8', '#5b8db8'].map((c, i) => (
        <RBox key={i} size={[0.04, 0.018, 0.006]} position={[col - 0.1, 0.31 - i * 0.036, 0.185]} m={{ color: c, metalness: 0, roughness: 0.5 }} r={0.003} />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <RBox key={i} size={[i % 2 ? 0.3 : 0.34, 0.026, i % 2 ? 0.27 : 0.31]} position={[col, 0.43 + i * 0.019, 0]} m={RUBBER} r={0.01} />
      ))}
      <RBox size={[0.37, 0.13, 0.34]} position={[col + 0.01, 0.7, 0]} m={NAVY} r={0.02} />
      <RBox size={[0.25, 0.09, 0.03]} position={[col, 0.67, 0.18]} m={BRUSHED} r={0.012} />
      <Cyl r={0.022} h={0.03} rotation={[Math.PI / 2, 0, 0]} position={[col + 0.03, 0.665, 0.2]} m={{ color: '#b08d3c', metalness: 0.9, roughness: 0.35 }} />
      <RBox size={[0.26, 0.15, 0.36]} position={[0.08, 0.83, 0]} m={NAVY} r={0.016} />
      {/* โครงใต้เบาะ + ราวข้างสแตนเลส */}
      <RBox size={[1.3, 0.05, 0.5]} position={[-0.5, 0.87, 0]} m={BRUSHED} r={0.012} />
      {[0.31, -0.31].map((z) => (
        <group key={z}>
          <RBox size={[1.34, 0.034, 0.014]} position={[-0.54, 0.86, z]} m={STEEL} r={0.005} />
          {[-1.05, -0.75, -0.4, -0.05].map((x) => (
            <Cyl key={x} r={0.012} h={0.05} rotation={[Math.PI / 2, 0, 0]} position={[x, 0.86, z - Math.sign(z) * 0.03]} m={BRUSHED} seg={16} />
          ))}
        </group>
      ))}
      <Cyl r={0.05} h={0.06} rotation={[Math.PI / 2, 0, 0]} position={[0.0, 0.9, 0.33]} m={STEEL} />
      <Cyl r={0.018} h={0.07} rotation={[Math.PI / 2, 0, 0]} position={[0.0, 0.9, 0.34]} m={BRUSHED} />
      <RBox size={[0.3, 0.08, 0.02]} position={[-0.22, 0.87, 0.34]} rotation={[0, 0, 0.06]} m={BRUSHED} r={0.008} />
      {/* เบาะหนังดำ 3 ตอน ขอบมน + ตะเข็บ */}
      {[
        [-0.12, 0.5],
        [-0.66, 0.54],
        [-1.04, 0.2],
      ].map(([x, w]) => (
        <group key={x}>
          <RBox size={[w, 0.085, 0.56]} position={[x, 0.945, 0]} m={LEATHER} r={0.032} />
          <RBox size={[w - 0.02, 0.006, 0.566]} position={[x, 0.935, 0]} m={RUBBER} r={0.002} />
        </group>
      ))}
      {/* ผ้ารองเขียว + หมอน */}
      <RBox size={[0.62, 0.018, 0.5]} position={[-0.6, 0.995, 0]} m={CLOTH} r={0.008} />
      <RBox size={[0.34, 0.085, 0.42]} position={[-0.88, 1.035, 0]} m={LINEN} r={0.04} />
      {/* เสาพยุงสะโพก (Perineal post) */}
      <Cyl r={0.03} h={0.26} position={[0.14, 1.08, 0]} m={LEATHER} />
      <mesh position={[0.14, 1.21, 0]}>
        <sphereGeometry args={[0.03, 20, 14]} />
        <Mat m={LEATHER} />
      </mesh>
      {/* ราว Traction เดี่ยวยาว + ตัวล็อค */}
      <RBox size={[1.16, 0.045, 0.045]} position={[0.72, 0.82, 0.06]} m={STEEL} r={0.006} />
      <RBox size={[0.4, 0.06, 0.07]} position={[0.2, 0.82, 0.06]} m={BRUSHED} r={0.008} />
      <StarKnob position={[0.12, 0.79, 0.12]} />
      <StarKnob position={[0.32, 0.79, 0.12]} />
      {/* เสา Traction + ชุดดึงขา มือหมุน ที่ยึดเท้า */}
      <RBox size={[0.055, 0.6, 0.055]} position={[1.285, 0.95, 0.06]} m={STEEL} r={0.006} />
      <RBox size={[0.09, 0.1, 0.09]} position={[1.285, 0.82, 0.06]} m={BRUSHED} r={0.01} />
      <RBox size={[0.13, 0.05, 0.08]} position={[1.3, 1.26, 0.06]} m={BRUSHED} r={0.01} />
      <RBox size={[0.46, 0.03, 0.05]} position={[1.24, 1.31, 0.06]} m={STEEL} r={0.006} />
      <Cyl r={0.013} h={0.46} rotation={[0, 0, Math.PI / 2]} position={[1.24, 1.345, 0.06]} m={BRUSHED} />
      <Cyl r={0.008} h={0.1} rotation={[0, 0, Math.PI / 2]} position={[1.5, 1.345, 0.06]} m={STEEL} />
      <RBox size={[0.016, 0.17, 0.016]} position={[1.55, 1.27, 0.06]} m={STEEL} r={0.005} />
      <Cyl r={0.014} h={0.08} rotation={[Math.PI / 2, 0, 0]} position={[1.55, 1.19, 0.1]} m={RUBBER} />
      <Cyl r={0.018} h={0.2} rotation={[0, 0, Math.PI / 2]} position={[0.94, 1.31, 0.06]} m={STEEL} />
      {[0.88, 0.95].map((x) => (
        <Cyl key={x} r={0.008} h={0.11} position={[x, 1.26, 0.06]} m={BRUSHED} seg={14} />
      ))}
      <RBox size={[0.07, 0.3, 0.14]} position={[0.8, 1.37, 0.06]} rotation={[0, 0, -0.14]} m={LEATHER} r={0.03} />
      {/* แขนเชื่อมไปเสาฉากหมายเลข 2 */}
      <RBox size={[0.46, 0.034, 0.034]} position={[1.52, PFNA.tracBase, 0]} m={STEEL} r={0.005} />
      <RBox size={[0.06, 0.13, 0.06]} position={[1.34, PFNA.tracBase - 0.03, 0.02]} m={BRUSHED} r={0.01} />
      <RBox size={[0.17, 0.014, 0.024]} position={[1.4, PFNA.tracBase + 0.05, 0.02]} rotation={[0, 0, 0.12]} m={STEEL} r={0.005} />
      {/* รีโมตเตียง + สายขด */}
      <RBox size={[0.05, 0.13, 0.03]} position={[-0.62, 0.77, 0.36]} m={RUBBER} r={0.01} />
      <Coil from={COIL_FROM} to={COIL_TO} />
    </group>
  );
}

/* ---------------- เครื่อง C-Arm (อยู่ฝั่งขา ซ้ายของเตียงบนจอ) ---------------- */
const R = 0.72;
const CX = 0.2; // แกนลำแสงตรงกับสะโพก/ปลายเตียง
const CY = 1.2;
const TURN = 0.62; // หมุนวง C ให้ส่วนโค้งอ้อมไปด้านหลังราว Traction

function Caster({ position, r = 0.085 }) {
  return (
    <group position={position}>
      <RBox size={[r * 1.5, r * 1.5, 0.09]} position={[0, r * 0.75, 0]} m={SHELL} r={0.03} />
      <Cyl r={r} h={0.045} rotation={[Math.PI / 2, 0, 0]} m={RUBBER} />
      <Cyl r={r * 0.55} h={0.05} rotation={[Math.PI / 2, 0, 0]} m={{ color: '#c9cacb', metalness: 0.1, roughness: 0.5 }} />
    </group>
  );
}

// มือจับโค้งตามวง C
function ArcGrip({ from, to, rad }) {
  const pts = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = THREE.MathUtils.lerp(from, to, i / 11);
        const k = i === 0 || i === 11 ? rad - 0.05 : rad;
        return [Math.cos(a) * k, Math.sin(a) * k, 0.075];
      }),
    [from, to, rad]
  );
  return <Hose points={pts} r={0.02} m={LILAC} />;
}

const CABLE_1 = [[0.72, 1.12, 0.12], [0.95, 1.2, 0.16], [1.05, 0.95, 0.14], [0.98, 0.68, 0.12], [0.78, 0.5, 0.14], [0.56, 0.36, 0.12]];
const CABLE_2 = [[0.75, 1.0, -0.1], [1.0, 1.02, -0.06], [1.02, 0.66, -0.04], [0.8, 0.4, -0.05], [0.5, 0.3, -0.06]];

export function CArm() {
  const arc = useMemo(() => {
    const s = new THREE.Shape();
    const a0 = -Math.PI / 2 - 0.1;
    const a1 = Math.PI / 2 + 0.1;
    s.absarc(0, 0, R + 0.075, a0, a1, false);
    s.absarc(0, 0, R - 0.075, a1, a0, true);
    return new THREE.ExtrudeGeometry(s, { depth: 0.09, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.018, bevelSegments: 5, curveSegments: 72 });
  }, []);
  return (
    <group position={[CX, CY, CENTER_Z]} rotation-y={TURN}>
      {/* วง C */}
      <mesh geometry={arc} position={[0, 0, -0.045]} castShadow receiveShadow>
        <Mat m={SHELL} />
      </mesh>
      <ArcGrip from={0.62} to={1.1} rad={R + 0.11} />
      <ArcGrip from={-1.15} to={-0.55} rad={R + 0.11} />

      {/* ตัวรับภาพด้านบน */}
      <group position={[0, R, 0]}>
        <RBox size={[0.34, 0.32, 0.34]} position={[0, 0.02, 0]} m={SHELL} r={0.08} />
        <Cyl r={0.17} h={0.2} position={[0, -0.13, 0]} m={SHELL} seg={48} />
        <mesh position={[0, -0.15, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.175, 0.022, 14, 56]} />
          <Mat m={LILAC} />
        </mesh>
        <Cyl r={0.15} r2={0.165} h={0.16} position={[0, -0.28, 0]} m={SHELL} seg={48} />
        <Cyl r={0.18} h={0.025} position={[0, -0.36, 0]} m={{ color: '#d3d4d2', metalness: 0.1, roughness: 0.4 }} seg={48} />
        <Cyl r={0.15} h={0.02} position={[0, -0.378, 0]} m={{ color: '#3a3f45', metalness: 0.2, roughness: 0.4 }} seg={48} />
        <RBox size={[0.09, 0.05, 0.006]} position={[0.07, 0.06, 0.172]} m={{ color: '#b9b9b6', metalness: 0.2, roughness: 0.4 }} r={0.003} />
        <RBox size={[0.345, 0.004, 0.345]} position={[0, -0.04, 0]} m={{ color: '#c2c2bd', metalness: 0, roughness: 0.6 }} r={0.001} />
      </group>

      {/* หลอด X-ray ด้านล่าง */}
      <group position={[0, -R, 0]}>
        <RBox size={[0.5, 0.24, 0.3]} position={[0.02, -0.02, 0]} m={SHELL} r={0.09} />
        <RBox size={[0.26, 0.16, 0.24]} position={[-0.24, -0.04, 0]} rotation={[0, 0, 0.28]} m={SHELL} r={0.07} />
        <Cyl r={0.11} r2={0.14} h={0.08} position={[0, 0.12, 0]} m={SHELL} seg={40} />
        <Cyl r={0.085} h={0.02} position={[0, 0.165, 0]} m={{ color: '#3a3f45', metalness: 0.2, roughness: 0.4 }} seg={40} />
        <RBox size={[0.6, 0.035, 0.33]} position={[-0.04, -0.04, 0]} m={LILAC} r={0.016} />
        <Cyl r={0.026} h={0.02} rotation={[Math.PI / 2, 0, 0]} position={[0.18, -0.07, 0.155]} m={RUBBER} />
      </group>

      {/* แขนยึดวง C กับตัวเครื่อง */}
      <RBox size={[0.24, 0.3, 0.2]} position={[R + 0.08, -0.12, 0]} m={SHELL} r={0.06} />
      <Cyl r={0.07} h={0.4} rotation={[0, 0, Math.PI / 2]} position={[R + 0.32, -0.12, 0]} m={BRUSHED} />
      {/* ตัวเครื่อง */}
      <group position={[R + 0.56, -CY, 0]}>
        <RBox size={[0.5, 0.74, 0.5]} position={[0.02, 0.6, 0]} m={SHELL} r={0.07} />
        <RBox size={[0.36, 0.3, 0.4]} position={[-0.04, 1.06, 0]} rotation={[0, 0, 0.1]} m={SHELL} r={0.06} />
        <RBox size={[0.52, 0.06, 0.52]} position={[0.02, 0.26, 0]} m={LILAC} r={0.02} />
        <RBox size={[0.2, 0.12, 0.54]} position={[0.2, 0.34, 0]} m={LILAC} r={0.03} />
        {/* ขาหน้าแคบยื่นใต้เตียง */}
        <RBox size={[0.86, 0.13, 0.2]} position={[-0.5, 0.2, 0]} m={SHELL} r={0.05} />
        <RBox size={[0.2, 0.06, 0.26]} position={[-0.86, 0.23, 0]} m={LILAC} r={0.02} />
        <Caster position={[0.14, 0.11, 0.26]} r={0.11} />
        <Caster position={[0.14, 0.11, -0.26]} r={0.11} />
        <Caster position={[-0.84, 0.065, 0.12]} r={0.06} />
        <Caster position={[-0.84, 0.065, -0.12]} r={0.06} />
        {/* จอควบคุม + มือจับ */}
        <RBox size={[0.28, 0.19, 0.03]} position={[-0.02, 1.3, 0.1]} rotation={[-0.45, 0, 0]} m={SHELL} r={0.012} />
        <mesh position={[-0.02, 1.308, 0.118]} rotation={[-0.45, 0, 0]}>
          <planeGeometry args={[0.23, 0.14]} />
          <meshStandardMaterial color="#0d2a33" emissive="#2c8f8a" emissiveIntensity={0.55} roughness={0.25} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <RBox key={i} size={[0.02, 0.012, 0.004]} position={[-0.1 + i * 0.032, 1.265, 0.142]} rotation={[-0.45, 0, 0]} m={{ color: ['#c9b458', '#5b8db8', '#68a070'][i % 3], metalness: 0, roughness: 0.5 }} r={0.001} />
        ))}
        <Cyl r={0.02} h={0.5} rotation={[Math.PI / 2, 0, 0]} position={[0.3, 1.02, 0]} m={LILAC} />
        {[0.2, -0.2].map((z) => (
          <RBox key={z} size={[0.16, 0.03, 0.03]} position={[0.22, 1.02, z]} m={LILAC} r={0.012} />
        ))}
        <RBox size={[0.06, 0.06, 0.01]} position={[0.06, 0.78, 0.252]} m={{ color: '#8d9094', metalness: 0.4, roughness: 0.4 }} r={0.01} />
        <Cyl r={0.018} h={0.012} rotation={[Math.PI / 2, 0, 0]} position={[0.06, 0.78, 0.26]} m={RUBBER} />
        {[0, 1, 2, 3].map((i) => (
          <RBox key={i} size={[0.16, 0.008, 0.004]} position={[0.1, 0.48 + i * 0.022, 0.251]} m={{ color: '#b7b8b5', metalness: 0, roughness: 0.7 }} r={0.001} />
        ))}
      </group>
      {/* สายไฟแรงสูงห้อยตามวง */}
      <group position={[0, -CY, 0]}>
        <Hose points={CABLE_1} r={0.026} />
        <Hose points={CABLE_2} r={0.022} />
      </group>
    </group>
  );
}
