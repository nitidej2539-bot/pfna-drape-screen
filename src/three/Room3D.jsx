import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, N8AO, Bloom, ToneMapping, SMAA, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { useQuality } from '../hooks/useQuality.js';
import CameraRig from './CameraRig.jsx';
import FeatureHotspots from './FeatureHotspots.jsx';
import ORScene from './ORScene.jsx';

// ห้องผ่าตัด 3D ทั้งฉาก — ไฟล์นี้ (และ three.js) โหลดแยกภายหลัง หน้าแรกจึงขึ้นเร็ว
export default function Room3D({ progress, running, showHotspots, onOpenFeature, onOpenManual }) {
  const { dpr, hq, incline, decline } = useQuality();

  return (
    <Canvas
      frameloop={running ? 'always' : 'never'}
      shadows="soft"
      dpr={dpr}
      camera={{ fov: 50, near: 0.1, far: 60, position: [0, 1.6, 7.5] }}
      gl={{ antialias: !hq, toneMapping: THREE.AgXToneMapping, powerPreference: 'high-performance' }}
    >
      {/* วัด FPS: ถ้าเครื่องช้า ลดความละเอียด + ปิดเอฟเฟกต์ เพื่อให้ลื่น */}
      <PerformanceMonitor
        flipflops={3}
        onIncline={incline}
        onDecline={decline}
        onFallback={decline}
      />
      {/* แสงห้องผ่าตัดจริง: สว่าง ขาวนวล จากแผงไฟเพดาน */}
      <color attach="background" args={['#e9eeed']} />
      <fog attach="fog" args={['#e9eeed', 14, 34]} />
      <ambientLight intensity={0.5} color="#ffffff" />
      <hemisphereLight args={['#ffffff', '#c9d2d2', 0.95]} />
      <directionalLight position={[2, 6, 2]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2.9, 4]} intensity={7} distance={10} color="#ffffff" />
      <pointLight position={[-2.6, 2.9, -2.2]} intensity={6} distance={8} color="#ffffff" />
      <pointLight position={[2.6, 2.9, -2.2]} intensity={6} distance={8} color="#ffffff" />
      <pointLight position={[0, 2.9, -8.2]} intensity={7} distance={9} color="#ffffff" />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={5} position={[0, 5, -5]} rotation-x={Math.PI / 2} scale={[10, 6, 1]} color="#ffffff" />
        <Lightformer intensity={2} position={[-6, 2, -5]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} color="#f2f6f5" />
        <Lightformer intensity={2} position={[6, 2, -5]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} color="#f2f6f5" />
        <Lightformer intensity={1.5} position={[0, 2, 6]} scale={[8, 3, 1]} color="#dff3ea" />
      </Environment>
      <Suspense fallback={null}>
        <ORScene progress={progress} onOpenManual={onOpenManual} quality={hq ? 'high' : 'low'} />
      </Suspense>
      <FeatureHotspots visible={showHotspots} onOpen={onOpenFeature} />
      <CameraRig progress={progress} />

      {/* เอฟเฟกต์ให้สมจริง: เงาตามมุม/รอยต่อ (AO), แสงฟุ้งจากไฟ, โทนสีธรรมชาติ, ขอบจอนวลลง */}
      {hq && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <N8AO halfRes quality="medium" aoRadius={0.6} distanceFalloff={0.8} intensity={1.4} color="#2a3a40" />
          <Bloom mipmapBlur intensity={0.3} luminanceThreshold={0.92} luminanceSmoothing={0.25} />
          <ToneMapping mode={ToneMappingMode.AGX} />
          <SMAA />
          <Vignette offset={0.38} darkness={0.22} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
