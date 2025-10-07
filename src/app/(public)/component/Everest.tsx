"use client";

import React, { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface EverestProps {
  onLoaded?: () => void;
  debugAxes?: boolean;
}

const modelUrl = "/models/mountainrange_model.glb";
const SKETCHUP_ZUP =
  String(process.env.NEXT_PUBLIC_SKETCHUP_ZUP || "").toLowerCase() === "true";

export default function Everest({ onLoaded, debugAxes = false }: EverestProps) {
  const { scene } = useGLTF(modelUrl);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    try {
      group.clear();

      const root = scene.clone(true);

      // 🧹 Remove suspicious flat/black ground meshes
      root.traverse((child: any) => {
        if (child.isMesh) {
          const geom = child.geometry;
          geom.computeBoundingBox();
          const box = geom.boundingBox!;
          const height = box.max.y - box.min.y;

          // detect very flat meshes (like ground)
          if (height < 0.05 && child.material?.color?.getHexString() === "000000") {
            console.log("🗑️ Removing black plane mesh:", child.name);
            child.parent?.remove(child);
            return;
          }

          // enable shadows
          child.castShadow = child.receiveShadow = true;
          // make sure no zero-opacity black
          if (child.material?.color?.getHex() === 0x000000) {
            child.material.color.set("#aaaaaa");
          }
        }
      });

      const normalizedScene = new THREE.Group();
      root.children.forEach((child) => normalizedScene.add(child));
      normalizedScene.name = "EverestMesh";
      group.add(normalizedScene);

      if (SKETCHUP_ZUP) normalizedScene.rotation.set(-Math.PI / 2, 0, 0);

      const box = new THREE.Box3().setFromObject(normalizedScene);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      if (size.y === 0) return;
      const desiredHeight = 10;
      const scale = desiredHeight / size.y;
      normalizedScene.scale.setScalar(scale);
      normalizedScene.position.sub(center.multiplyScalar(scale));

      if (debugAxes) {
        const axes = new THREE.AxesHelper(10);
        group.add(axes);
      }

      requestAnimationFrame(() => onLoaded?.());
    } catch (err) {
      console.error("❌ Everest setup error:", err);
    }
  }, [scene, onLoaded, debugAxes]);

  return <group ref={groupRef} name="EverestGroup" />;
}

useGLTF.preload(modelUrl);
