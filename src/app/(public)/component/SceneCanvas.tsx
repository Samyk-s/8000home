"use client";

import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sky, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import Everest from "./Everest";
import Marker3D from "./Marker3D";
import type { Marker } from "./markers";

/* ☁️ Volumetric-looking drifting clouds */
function RealisticClouds() {
  const groupRef = useRef<THREE.Group>(null);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = canvas.height = 256;
    const g = ctx.createRadialGradient(128, 128, 30, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(0.5, "rgba(255,255,255,0.4)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  const clouds = useMemo(
    () =>
      Array.from({ length: 30 }).map(() => ({
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

/* 🌍 SceneContent */
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
  const { camera, size, gl, scene } = useThree();
  const [ready, setReady] = useState(false);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // sync projection
  useEffect(() => {
    requestAnimationFrame(() => {
      camera.updateProjectionMatrix();
      controlsRef.current?.update();
      setReady(true);
    });

    // 🧭 click to log coordinates
    const handleClick = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const mountain = scene.getObjectByName("EverestMesh");
      if (!mountain) return;

      const hits = raycaster.intersectObject(mountain, true);
      if (hits.length > 0) {
        const { x, y, z } = hits[0].point;
        // ✅ log in array format
        console.log(`[${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}]`);
      }
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [camera, gl, scene, controlsRef]);

  function projectToScreen(pos: [number, number, number]) {
    const v = new THREE.Vector3(...pos).project(camera);
    return { x: (v.x * 0.5 + 0.5) * size.width, y: (-v.y * 0.5 + 0.5) * size.height };
  }

  return (
    <>
      <Sky distance={450000} sunPosition={[100, 40, 100]} inclination={0.48} azimuth={0.25} />
      <RealisticClouds />
      <fog attach="fog" args={["#e6eef5", 40, 180]} />

      {/* 💡 Soft shadow-free lighting */}
      <ambientLight intensity={0.9} color="#ffffff" />
      <directionalLight position={[20, 50, 10]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-10, 20, -20]} intensity={0.3} />

      <Suspense fallback={null}>
        <Everest onLoaded={() => controlsRef.current?.update()} />
        {ready &&
          markers.map((m, i) => (
            <Marker3D
              key={m.label}
              index={i}
              label={m.label}
              position={m.position}
              onHoverChange={(isHovered) => {
                const s = projectToScreen(m.position);
                onMarkerHover(m.description, s, isHovered);
              }}
            />
          ))}
      </Suspense>

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

/* 🎯 Earth-like zoom */
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
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const inter = raycaster.intersectObjects(scene.children, true);
      if (inter.length > 0) lastTargetRef.current = inter[0].point.clone();

      const p = lastTargetRef.current || defaultTarget;
      const ctrl = controlsRef.current;
      const dir = new THREE.Vector3().subVectors(p, camera.position).normalize();
      const dist = camera.position.distanceTo(p);
      const step = Math.min(Math.max(dist * 0.1, 0.5), 4);

      if (e.deltaY < 0) camera.position.addScaledVector(dir, step);
      else {
        camera.position.addScaledVector(dir, -step);
        if (camera.position.length() > 21) camera.position.setLength(21);
      }
      ctrl.target.copy(p);
      ctrl.update();
    }
    gl.domElement.addEventListener("wheel", onWheel, { passive: false });
    return () => gl.domElement.removeEventListener("wheel", onWheel);
  }, [camera, gl, scene, controlsRef, defaultTarget]);

  return null;
}

/* 🚀 Main SceneCanvas */
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
      shadows={false}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        precision: "highp",
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        alpha: true,
      }}
      style={{ background: "transparent", cursor: "crosshair" }}
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
    </Canvas>
  );
}
