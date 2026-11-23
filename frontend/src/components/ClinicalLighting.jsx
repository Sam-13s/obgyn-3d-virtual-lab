import { useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';

function addTissueShading(material) {
 if (!material || (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) || material.userData.clinicalShadePass) return;
 const originalCompile = material.onBeforeCompile;
 const originalCacheKey = material.customProgramCacheKey;
 material.onBeforeCompile = (shader, renderer) => {
  originalCompile?.(shader, renderer);
  shader.vertexShader = shader.vertexShader
   .replace('#include <common>', '#include <common>\nvarying float vClinicalTissueShade;')
   .replace('#include <begin_vertex>', '#include <begin_vertex>\nvClinicalTissueShade = clamp(position.y * 0.5 + 0.5, 0.0, 1.0);');
  shader.fragmentShader = shader.fragmentShader
   .replace('#include <common>', '#include <common>\nvarying float vClinicalTissueShade;')
   .replace('#include <color_fragment>', '#include <color_fragment>\nfloat clinicalTissueTone = mix(0.88, 1.12, smoothstep(0.0, 1.0, vClinicalTissueShade));\ndiffuseColor.rgb *= clinicalTissueTone;');
 };
 material.customProgramCacheKey = () => `${originalCacheKey?.call(material) || ''}|clinical-tissue-shade-v1`;
 material.userData.clinicalShadePass = true;
 material.needsUpdate = true;
}

/** Soft studio lighting, tissue reflections, and contact grounding shared by the anatomy labs. */
export default function ClinicalLighting({ floor = -1.9, tint = '#e9a9bb' }) {
 const scene = useThree((state) => state.scene);
 const nextMaterialScan = useRef(0);
 const applySceneQuality = () => scene.traverse((object) => {
  if (!object.isMesh) return;
  object.castShadow = true;
  for (const material of Array.isArray(object.material) ? object.material : [object.material]) addTissueShading(material);
 });
 useLayoutEffect(() => {
  applySceneQuality();
 }, [scene]);
 useFrame(({ clock }) => {
  if (clock.elapsedTime < nextMaterialScan.current) return;
  nextMaterialScan.current = clock.elapsedTime + 0.75;
  applySceneQuality();
 });

 return <>
  <hemisphereLight skyColor="#dcecff" groundColor="#392630" intensity={0.7} />
  <ambientLight intensity={0.38} />
  <directionalLight position={[3.8, 5, 5]} intensity={2.25} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={14} shadow-camera-left={-3.5} shadow-camera-right={3.5} shadow-camera-top={3.5} shadow-camera-bottom={-3.5} shadow-bias={-0.00012} />
  <directionalLight position={[-3.5, 1.5, -3]} intensity={0.78} color="#b7d8ed" />
  <pointLight position={[-3, -1.5, 3]} intensity={0.52} color={tint} />
  <Environment preset="studio" />
  <ContactShadows position={[0, floor, 0]} opacity={0.23} scale={4.6} blur={2.4} far={3.2} />
 </>;
}
