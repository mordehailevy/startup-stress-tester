import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import * as THREE from "three";
import { BEATS, DIMENSIONS, PANELISTS, scoreColor } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

/** The idea: a faceted crystal that appears, gets scanned under pressure, then collapses. */
function IdeaCrystal() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({ frame: frame - BEATS.ideaIn[0], fps, config: { damping: 14, mass: 0.8 } });
  const collapse = interpolate(frame, BEATS.collapse, [0, 1], { ...clamp, easing: ease });
  // Pressure: a small, quickening wobble while the panel scans.
  const scanT = interpolate(frame, BEATS.scan, [0, 1], clamp);
  const wobble = Math.sin(frame * (0.35 + scanT * 0.5)) * 0.04 * scanT * (1 - collapse);

  const scale = appear * (1 - collapse * 0.92) + wobble;
  const activeIdx = Math.floor(interpolate(frame, BEATS.scan, [0, PANELISTS.length], clamp));
  const scanning = frame >= BEATS.scan[0] && frame < BEATS.scan[1];
  const glow = scanning ? PANELISTS[Math.min(activeIdx, PANELISTS.length - 1)].color : "#8fa8ff";

  return (
    <group rotation={[frame * 0.006, frame * 0.012, 0]} position={[0, collapse * -0.6, 0]} scale={Math.max(scale, 0.0001)}>
      <mesh>
        <icosahedronGeometry args={[1.25, 0]} />
        <meshPhysicalMaterial
          color="#a5b8ff"
          emissive={glow}
          emissiveIntensity={0.25 + (scanning ? 0.35 + Math.sin(frame * 0.5) * 0.15 : 0)}
          roughness={0.15}
          metalness={0.1}
          transmission={0.35}
          thickness={1.2}
          flatShading
        />
      </mesh>
      <mesh scale={1.006}>
        <icosahedronGeometry args={[1.25, 0]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

/** One panelist: a tilted ring that flies in, orbits, and brightens when it is its turn. */
function PanelRing({ index }: { index: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = PANELISTS[index];

  const enter = spring({ frame: frame - BEATS.panelIn[0] - index * 7, fps, config: { damping: 16 } });
  const leave = interpolate(frame, BEATS.collapse, [0, 1], { ...clamp, easing: ease });
  const slot = (BEATS.scan[1] - BEATS.scan[0]) / PANELISTS.length;
  const start = BEATS.scan[0] + index * slot;
  const active = interpolate(frame, [start, start + 6, start + slot - 6, start + slot], [0, 1, 1, 0], clamp);

  const radius = 1.85 + index * 0.14 + (1 - enter) * 4;
  const tilt = [0.9, -0.6, 0.35, -1.1][index];
  const spin = frame * (0.018 + index * 0.004) + index * 1.6;

  return (
    <group rotation={[tilt, spin, index * 0.4]} scale={1 - leave * 0.85}>
      <mesh>
        <torusGeometry args={[radius, 0.022 + active * 0.03, 16, 160]} />
        <meshBasicMaterial color={p.color} transparent opacity={(0.35 + active * 0.65) * enter * (1 - leave)} />
      </mesh>
      {/* the panelist's "eye" travelling on its ring */}
      <mesh position={[radius, 0, 0]} scale={0.09 + active * 0.08}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={p.color} transparent opacity={enter * (1 - leave)} />
      </mesh>
    </group>
  );
}

/** The result: five bars growing out of the floor to each dimension's score. */
function ScoreBars() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spacing = 0.78;

  return (
    <group position={[0.15, -1.75, 0]} rotation={[0.16, 0, 0]}>
      {DIMENSIONS.map((d, i) => {
        const grow = spring({ frame: frame - BEATS.bars[0] - i * 5, fps, config: { damping: 15, mass: 0.9 } });
        const h = Math.max(0.001, (d.score / 100) * 2.3 * grow);
        return (
          <mesh key={d.label} position={[(i - 2) * spacing, h / 2, 0]}>
            <boxGeometry args={[0.46, h, 0.46]} />
            <meshStandardMaterial color={scoreColor(d.score)} emissive={scoreColor(d.score)} emissiveIntensity={0.25} roughness={0.35} />
          </mesh>
        );
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[2.4, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.04 * interpolate(frame, BEATS.bars, [0, 1], clamp)} />
      </mesh>
    </group>
  );
}

/** Slow drifting particles for depth. */
function Dust() {
  const frame = useCurrentFrame();
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 260;
    const pos = new Float32Array(n * 3);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (rnd() - 0.5) * 16;
      pos[i * 3 + 1] = (rnd() - 0.5) * 9;
      pos[i * 3 + 2] = (rnd() - 0.5) * 8 - 2;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo} rotation={[0, frame * 0.0012, 0]}>
      <pointsMaterial size={0.035} color="#9fb3ff" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

export default function Scene3D() {
  const frame = useCurrentFrame();
  // A gentle camera push-in over the whole loop.
  const z = interpolate(frame, [0, BEATS.collapse[0], BEATS.verdict[1]], [8.6, 7.4, 8.2], { ...clamp, easing: ease });
  const showBars = frame >= BEATS.bars[0] - 2;

  return (
    <>
      <PerspectiveCamera z={z} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <pointLight position={[-5, -2, 3]} intensity={18} color="#6d7cff" />
      <Dust />
      <group position={[1.9, -0.05, 0]}>
        <IdeaCrystal />
        {PANELISTS.map((_, i) => (
          <PanelRing key={i} index={i} />
        ))}
        {showBars && <ScoreBars />}
      </group>
    </>
  );
}

/** Drives the default R3F camera from the current frame, so every frame is deterministic. */
function PerspectiveCamera({ z }: { z: number }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.fov = 40;
    camera.position.set(0, 0.2, z);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, z]);
  return null;
}
