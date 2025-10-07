"use client";

import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sky, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import Everest from "./Everest";
import Marker3D from "./Marker3D";
import type { Marker } from "./markers";

/* ☁️ Volumetric-looking clouds using transparent planes + drifting motion */
function RealisticClouds() {
  const groupRef = useRef<THREE.Group>(null);

  // Create a soft radial alpha gradient for cloud texture
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = 256;
    canvas.height = 256;

    const gradient = ctx.createRadialGradient(128, 128, 30, 128, 128, 128);
    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.4)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  // Randomized drifting cloud layers
  const clouds = useMemo(
    () =>
      new Array(30).fill(0).map(() => ({
        pos: [
          Math.random() * 300 - 150,
          Math.random() * 50 + 30,
          Math.random() * 300 - 150,
        ] as [number, number, number],
        scale: Math.random() * 60 + 80,
        opacity: Math.random() * 0.4 + 0.25,
        speed: Math.random() * 0.02 + 0.005,
        rotationSpeed: (Math.random() - 0.5) * 0.001,
      })),
    []
  );

  // Animate the drift
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      child.position.x += clouds[i].speed;
      child.rotation.z += clouds[i].rotationSpeed;
      if (child.position.x > 160) child.position.x = -160;
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={[0, 0, Math.random() * Math.PI]}>
          <planeGeometry args={[c.scale, c.scale * 0.6]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={c.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* 🌍 SceneContent (day only, realistic clouds + accurate projection) */
function SceneContent({
  markers,
  onMarkerHover,
  isAutoRotate,
  controlsRef,
  defaultTarget,
}: {
  markers: Marker[];
  onMarkerHover: (
    desc: string,
    screenPos: { x: number; y: number },
    isHovered: boolean
  ) => void;
  isAutoRotate: boolean;
  controlsRef: React.MutableRefObject<any>;
  defaultTarget: THREE.Vector3;
}) {
  const { camera, size } = useThree();

  // ✅ Fixed projection (uses canvas size, not window)
  function projectToScreen(pos: [number, number, number]) {
    const vector = new THREE.Vector3(...pos).project(camera);
    return {
      x: (vector.x * 0.5 + 0.5) * size.width,
      y: (-vector.y * 0.5 + 0.5) * size.height,
    };
  }

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.copy(defaultTarget);
      controlsRef.current.update();
    }
  }, [controlsRef, defaultTarget]);

  return (
    <>
      {/* ☀️ Sky */}
      <Sky
        distance={450000}
        sunPosition={[100, 40, 100]}
        inclination={0.48}
        azimuth={0.25}
      />

      {/* ☁️ Realistic drifting clouds */}
      <RealisticClouds />

      {/* 🌫️ Atmospheric fog */}
      <fog attach="fog" args={["#c9d9e8", 25, 140]} />

      {/* 💡 Natural sunlight */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[20, 50, 10]}
        intensity={2.4}
        color="#ffffff"
        castShadow
      />
      <pointLight position={[-10, 20, -20]} intensity={0.3} />

      {/* 🏔️ Model + Markers */}
      <Suspense fallback={null}>
        <Everest />
        {markers.map((m, i) => (
          <Marker3D
            key={m.label}
            index={i}
            label={m.label}
            position={m.position}
            onHoverChange={(isHovered) => {
              const screenPos = projectToScreen(m.position);
              onMarkerHover(m.description, screenPos, isHovered);
            }}
          />
        ))}
      </Suspense>

      {/* 🎮 Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        minDistance={10}
        maxDistance={21}
        maxPolarAngle={Math.PI / 2.5}
        enableDamping
        autoRotate={isAutoRotate}
        autoRotateSpeed={0.6}
      />
    </>
  );
}

/* 🎯 Google Earth–style zoom */
function EarthLikeZoom({
  controlsRef,
  defaultTarget,
}: {
  controlsRef: any;
  defaultTarget: THREE.Vector3;
}) {
  const { camera, gl, scene } = useThree();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const lastTargetRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    function onWheel(event: WheelEvent) {
      if (!controlsRef.current) return;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0 && !lastTargetRef.current) {
        lastTargetRef.current = intersects[0].point.clone();
      }

      const point = lastTargetRef.current || defaultTarget;
      const controls = controlsRef.current;
      const dir = new THREE.Vector3()
        .subVectors(point, camera.position)
        .normalize();

      if (event.deltaY < 0) {
        camera.position.addScaledVector(dir, 2);
        controls.target.lerp(point, 0.25);
      } else {
        camera.position.addScaledVector(dir, -2);

        if (camera.position.length() > 21) {
          camera.position.setLength(21);
          controls.target.copy(defaultTarget);
          lastTargetRef.current = null;
        }
      }

      controls.update();
    }

    gl.domElement.addEventListener("wheel", onWheel, { passive: false });
    return () => gl.domElement.removeEventListener("wheel", onWheel);
  }, [camera, gl, scene, controlsRef, defaultTarget]);

  return null;
}

/* 🧭 Debug — click to log coordinates (COMMENTED OUT for demo) */
// function DebugClickLogger() {
//   const { camera, gl, scene, size } = useThree();
//   const raycaster = new THREE.Raycaster();
//   const mouse = new THREE.Vector2();
//   const sphereRef = useRef<THREE.Mesh>(null);

//   useEffect(() => {
//     function onClick(event: MouseEvent) {
//       const rect = gl.domElement.getBoundingClientRect();
//       mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//       mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

//       raycaster.setFromCamera(mouse, camera);
//       const intersects = raycaster.intersectObjects(scene.children, true);

//       if (intersects.length > 0) {
//         const point = intersects[0].point;
//         console.log(
//           `📍 Marker position: [${point.x.toFixed(2)}, ${point.y.toFixed(
//             2
//           )}, ${point.z.toFixed(2)}]`
//         );

//         if (sphereRef.current) {
//           sphereRef.current.position.copy(point);
//           sphereRef.current.visible = true;
//         }
//       }
//     }

//     gl.domElement.addEventListener("click", onClick);
//     return () => gl.domElement.removeEventListener("click", onClick);
//   }, [camera, gl, scene]);

//   return (
//     <mesh ref={sphereRef} visible={false}>
//       <sphereGeometry args={[0.1, 16, 16]} />
//       <meshStandardMaterial color="lime" emissive="lime" emissiveIntensity={2} />
//     </mesh>
//   );
// }

/* 🚀 Main SceneCanvas (daytime + realistic clouds + zoom + fixed projection) */
export default function SceneCanvas({
  markers,
  onMarkerHover,
}: {
  markers: Marker[];
  onMarkerHover: (
    desc: string,
    screenPos: { x: number; y: number },
    isHovered: boolean
  ) => void;
}) {
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const controlsRef = useRef<any>(null);
  const defaultTarget = new THREE.Vector3(0, 0, 0);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        alpha: true,
      }}
      style={{ background: "transparent" }}
      onClick={() => setIsAutoRotate(false)}
    >
      <PerspectiveCamera makeDefault fov={50} position={[0, 10, 24]} />

      <SceneContent
        markers={markers}
        onMarkerHover={onMarkerHover}
        isAutoRotate={isAutoRotate}
        controlsRef={controlsRef}
        defaultTarget={defaultTarget}
      />

      <EarthLikeZoom controlsRef={controlsRef} defaultTarget={defaultTarget} />

      {/* 🧭 Debug logger (disabled for demo) */}
      {/* <DebugClickLogger /> */}
    </Canvas>
  );
}
