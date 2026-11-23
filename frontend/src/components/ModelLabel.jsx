import React from "react";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

/** Clickable annotation kept outside the anatomy, with a leader and arrow tip at its target. */
export default function ModelLabel({ children, part, selected, onSelect, position, target, className = "model-part-label", distanceFactor = 8 }) {
  const direction = new THREE.Vector3(...target).sub(new THREE.Vector3(...position)).normalize();
  const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  const color = selected === part ? "#ffe28a" : "#9edee8";

  return <>
    <Line points={[position, target]} color={color} lineWidth={selected === part ? 2 : 1.25} depthTest={false} renderOrder={10} />
    <mesh position={target} quaternion={rotation} renderOrder={11}>
      <coneGeometry args={[0.035, 0.1, 8]} />
      <meshBasicMaterial color={color} depthTest={false} toneMapped={false} />
    </mesh>
    <mesh position={target} renderOrder={11}>
      <sphereGeometry args={[selected === part ? 0.06 : 0.04, 12, 10]} />
      <meshBasicMaterial color={color} depthTest={false} toneMapped={false} />
    </mesh>
    <Html position={position} center distanceFactor={distanceFactor} zIndexRange={[40, 0]}>
      <button type="button" className={`${className} ${selected === part ? "selected" : ""}`} aria-pressed={selected === part} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onSelect(part); }}>{children}</button>
    </Html>
  </>;
}
