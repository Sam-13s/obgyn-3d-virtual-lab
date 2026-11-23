import { Fragment, Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import ModelLabel from './ModelLabel.jsx';
import './AnatomyScene.css';

function Tube({ points, radius = 0.035, color = '#c4778a', active = false, onClick }) {
 const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))), [points]);
 return <mesh onClick={onClick} castShadow><tubeGeometry args={[curve, 36, active ? radius * 1.45 : radius, 10, false]} /><meshPhysicalMaterial color={active ? '#ffe4ae' : color} roughness={0.58} clearcoat={0.24} emissive={active ? '#9a452e' : '#000000'} emissiveIntensity={active ? 0.3 : 0} /></mesh>;
}

function Face({ position = [0, 0, 0], scale = 1 }) {
 return <group position={position} scale={scale}>
  <mesh position={[-0.105, 0.015, 0.274]} scale={[0.027, 0.035, 0.018]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#49333b" roughness={0.3} /></mesh>
  <mesh position={[0.105, 0.015, 0.274]} scale={[0.027, 0.035, 0.018]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#49333b" roughness={0.3} /></mesh>
  <mesh position={[0, -0.055, 0.285]} rotation={[0.25, 0, 0]} scale={[0.025, 0.065, 0.025]}><sphereGeometry args={[1, 14, 12]} /><meshStandardMaterial color="#c18473" roughness={0.66} /></mesh>
 </group>;
}

function CurledFetus({ active, onSelect, scale = 1 }) {
 const group = useRef();
 useFrame(({ clock }) => { if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.025; });
 const select = (event) => { event.stopPropagation(); onSelect('Fetus'); };
 return <group ref={group} position={[0.04, 0.02, 0.55]} scale={scale} onClick={select}>
  <mesh position={[-0.02, -0.12, 0]} rotation={[0, 0, -0.58]} scale={[0.27, 0.47, 0.22]} castShadow><capsuleGeometry args={[0.48, 0.48, 8, 20]} /><meshPhysicalMaterial color={active ? '#ffdcb9' : '#d99c82'} roughness={0.68} clearcoat={0.12} /></mesh>
  <mesh position={[0.24, 0.29, 0.04]} scale={[0.25, 0.27, 0.23]} castShadow><sphereGeometry args={[1, 36, 28]} /><meshPhysicalMaterial color={active ? '#ffe4c4' : '#e6b397'} roughness={0.62} clearcoat={0.15} /></mesh>
  <Face position={[0.24, 0.29, 0.04]} scale={0.9} />
  <mesh position={[-0.18, 0.08, 0.08]} rotation={[0, 0, -0.75]}><capsuleGeometry args={[0.075, 0.28, 6, 12]} /><meshPhysicalMaterial color="#dc9e84" roughness={0.7} /></mesh>
  <mesh position={[0.15, 0.03, 0.14]} rotation={[0, 0, 0.9]}><capsuleGeometry args={[0.07, 0.24, 6, 12]} /><meshPhysicalMaterial color="#dc9e84" roughness={0.7} /></mesh>
  <mesh position={[-0.02, -0.48, 0.06]} rotation={[0, 0, -1.05]}><capsuleGeometry args={[0.09, 0.3, 6, 12]} /><meshPhysicalMaterial color="#d18e7a" roughness={0.68} /></mesh>
  <mesh position={[0.21, -0.43, 0.05]} rotation={[0, 0, 0.95]}><capsuleGeometry args={[0.09, 0.3, 6, 12]} /><meshPhysicalMaterial color="#d18e7a" roughness={0.68} /></mesh>
 </group>;
}

function UterusCutaway({ active, activeEndometrium, activeCervix, onSelect, kind }) {
 const wall = useMemo(() => {
  const geometry = new THREE.LatheGeometry([
   new THREE.Vector2(0.17, -0.53), new THREE.Vector2(0.27, -0.32), new THREE.Vector2(0.43, -0.08),
   new THREE.Vector2(0.62, 0.2), new THREE.Vector2(0.73, 0.5), new THREE.Vector2(0.75, 0.74),
   new THREE.Vector2(0.62, 0.98), new THREE.Vector2(0.38, 1.13), new THREE.Vector2(0.16, 1.18), new THREE.Vector2(0, 1.19)
  ], 64);
  const low = new THREE.Color('#713a57');
  const body = new THREE.Color('#a85b73');
  const fundus = new THREE.Color('#d07c8d');
  const positions = geometry.attributes.position;
  const colors = [];
  for (let index = 0; index < positions.count; index += 1) {
   const y = THREE.MathUtils.clamp((positions.getY(index) + 0.53) / 1.72, 0, 1);
   const front = THREE.MathUtils.clamp((positions.getZ(index) + 0.75) / 1.5, 0, 1);
   const color = low.clone().lerp(body, Math.min(1, y * 1.5));
   color.lerp(fundus, Math.max(0, (y - 0.62) * 1.55));
   color.lerp(new THREE.Color('#efb08f'), front * 0.16);
   colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
 }, []);
 const lining = useMemo(() => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.32, 0.62); shape.bezierCurveTo(-0.19, 0.42, -0.15, 0.23, -0.11, 0.02); shape.bezierCurveTo(-0.08, -0.2, -0.06, -0.4, 0, -0.5);
  shape.bezierCurveTo(0.06, -0.4, 0.08, -0.2, 0.11, 0.02); shape.bezierCurveTo(0.15, 0.23, 0.19, 0.42, 0.32, 0.62); shape.quadraticCurveTo(0, 0.51, -0.32, 0.62);
  const cavity = new THREE.Path();
  cavity.moveTo(-0.22, 0.49); cavity.quadraticCurveTo(0, 0.43, 0.22, 0.49); cavity.bezierCurveTo(0.13, 0.27, 0.075, 0.12, 0.06, -0.05); cavity.quadraticCurveTo(0.035, -0.31, 0, -0.42); cavity.quadraticCurveTo(-0.035, -0.31, -0.06, -0.05); cavity.bezierCurveTo(-0.075, 0.12, -0.13, 0.27, -0.22, 0.49);
  shape.holes.push(cavity);
  return { wall: shape, cavity: new THREE.Shape(cavity.getPoints(40)) };
 }, []);
 const select = (event) => { event.stopPropagation(); onSelect('Uterus'); };
 const endometriumGeometry = useMemo(() => {
  const geometry = new THREE.ShapeGeometry(lining.wall, 32);
  const positions = geometry.attributes.position;
  const lower = new THREE.Color('#b85d7c');
  const upper = new THREE.Color('#f0a3ad');
  const colors = [];
  for (let index = 0; index < positions.count; index += 1) {
   const height = THREE.MathUtils.clamp((positions.getY(index) + 0.5) / 1.12, 0, 1);
   const color = lower.clone().lerp(upper, height * 0.82);
   colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
 }, [lining]);
 const cavityGeometry = useMemo(() => new THREE.ShapeGeometry(lining.cavity, 32), [lining]);
 return <group position={[0, 0.12, 0]}>
  <mesh geometry={wall} scale={[1, 1, 0.62]} castShadow onClick={select}>
   <meshPhysicalMaterial vertexColors color={active ? '#fff0d3' : '#ffffff'} emissive={active ? '#4c2910' : '#000000'} emissiveIntensity={active ? 0.3 : 0} roughness={0.68} clearcoat={0.16} side={THREE.DoubleSide} />
  </mesh>
  <mesh position={[0, 0, 0.47]} onClick={(event) => { event.stopPropagation(); onSelect('Endometrium'); }}>
   <primitive object={endometriumGeometry} attach="geometry" /><meshPhysicalMaterial vertexColors color={activeEndometrium ? '#fff4c8' : '#ffffff'} emissive={activeEndometrium ? '#6b311c' : '#000000'} emissiveIntensity={activeEndometrium ? 0.35 : 0} roughness={0.64} side={THREE.DoubleSide} clearcoat={0.2} />
  </mesh>
  <mesh position={[0, 0.01, 0.478]} onClick={(event) => { event.stopPropagation(); onSelect('Endometrium'); }}>
   <primitive object={cavityGeometry} attach="geometry" /><meshBasicMaterial color="#39243e" side={THREE.DoubleSide} transparent opacity={0.94} />
  </mesh>
  <mesh position={[0, -0.84, 0.06]} scale={[0.25, 0.42, 0.23]} castShadow onClick={(event) => { event.stopPropagation(); onSelect('Cervix'); }}>
   <cylinderGeometry args={[0.52, 0.38, 1, 40]} /><meshPhysicalMaterial color={activeCervix ? '#ffd17d' : '#84546f'} roughness={0.66} clearcoat={0.14} />
  </mesh>
 </group>;
}

function Ovary({ position, active, onSelect, variant = 'normal' }) {
 const follicles = [[-0.12, 0.09, 0.17, 0.09], [0.09, 0.13, 0.18, 0.065], [0.02, -0.1, 0.19, 0.05], [-0.1, -0.16, 0.18, 0.04]];
 const follicleShades = ['#f2d49a', '#fff0c8', '#e7bd7e', '#f8e2af'];
 return <group position={position} onClick={(event) => { event.stopPropagation(); onSelect('Ovary'); }}>
  <mesh scale={[0.28, 0.34, 0.22]} castShadow><sphereGeometry args={[1, 36, 28]} /><meshPhysicalMaterial color={active ? '#ffe0a2' : '#d88f61'} roughness={0.62} clearcoat={0.18} /></mesh>
  {follicles.map(([x, y, z, radius], index) => <mesh key={index} position={[x, y, z]} scale={[radius, radius, radius * 0.58]}>
   <sphereGeometry args={[1, 18, 14]} /><meshPhysicalMaterial color={index === 0 && variant === 'complications' ? '#62caba' : follicleShades[index]} roughness={0.36} clearcoat={0.5} />
  </mesh>)}
  {variant === 'gynecology' && <mesh position={[0.07, -0.03, 0.22]} scale={[0.16, 0.18, 0.12]}><sphereGeometry args={[1, 32, 24]} /><meshPhysicalMaterial color="#8d638f" roughness={0.3} clearcoat={0.6} transparent opacity={0.88} /></mesh>}
 </group>;
}

function Placenta({ active, onSelect }) {
 const vesselPaths = [
  [[-0.2, 0.7, 0.28], [-0.14, 0.55, 0.3], [0.03, 0.48, 0.3], [0.23, 0.58, 0.28]],
  [[-0.13, 0.55, 0.3], [-0.3, 0.45, 0.28], [-0.35, 0.27, 0.24]],
  [[0.03, 0.48, 0.3], [0.14, 0.34, 0.28], [0.32, 0.3, 0.23]],
 ];
 return <group onClick={(event) => { event.stopPropagation(); onSelect('Placenta'); }}>
  <mesh position={[-0.42, 0.65, -0.16]} rotation={[0.12, -0.16, -0.18]} scale={[0.48, 0.65, 0.14]} castShadow>
   <sphereGeometry args={[1, 48, 36]} /><meshPhysicalMaterial color={active ? '#ffcf82' : '#87445b'} roughness={0.76} clearcoat={0.12} />
  </mesh>
  {Array.from({ length: 11 }, (_, index) => <mesh key={index} position={[-0.73 + (index % 4) * 0.2, 0.33 + Math.floor(index / 4) * 0.2, 0.0]} scale={[0.12, 0.16, 0.06]} rotation={[0, 0, (index % 3 - 1) * 0.24]}>
   <sphereGeometry args={[1, 20, 16]} /><meshStandardMaterial color={['#75384f', '#91465e', '#aa5b70', '#bc6b7a'][index % 4]} roughness={0.86} />
  </mesh>)}
  {vesselPaths.map((points, index) => <Tube key={index} points={points} radius={0.018} color={index === 1 ? '#5d83b8' : '#c95c6f'} />)}
 </group>;
}

function ProceduralAnatomy({ kind, onSelect }) {
 const group = useRef();
 const [active, setActive] = useState('');
 const pick = (part) => { setActive(part); onSelect?.(part); };
 useFrame(({ clock }, delta) => { if (group.current) group.current.rotation.y += delta * 0.045; });
 const pregnancy = ['fetus', 'labour', 'presentation', 'placenta'].includes(kind);
 const reproductive = ['reproductive', 'gynecology', 'complications'].includes(kind);
 const fetusScale = kind === 'fetus' ? 0.83 : 0.75;
 const labels = kind === 'newborn'
  ? [['Newborn head', [-1.76, 0.98, 0.22], [0, 0.68, 0.2]], ['Newborn body', [1.76, -0.2, 0.22], [0, -0.15, 0.15]]]
  : reproductive || kind === 'placenta'
  ? [['Uterus', [-1.76, 1.34, 0.26], [0, 0.42, 0.5]], ['Fallopian tube', [1.76, 1.22, 0.22], [0.95, 0.98, 0.06]], ['Ovary', [1.76, 0.34, 0.22], [1.32, 0.5, 0.12]], ['Endometrium', [-1.76, 0.3, 0.22], [0, 0.25, 0.59]], ['Cervix', [-1.76, -0.56, 0.22], [0, -0.7, 0.2]]]
  : [['Uterus', [-1.76, 1.34, 0.26], [0, 0.42, 0.5]], ['Placenta', [1.76, 1.17, 0.22], [-0.42, 0.65, 0.08]], ['Fetus', [1.76, 0.12, 0.22], [0.1, 0.05, 0.6]], ['Endometrium', [-1.76, 0.24, 0.22], [0, 0.25, 0.59]], ['Cervix', [-1.76, -0.78, 0.22], [0, -0.7, 0.2]]];
 return <group ref={group}>
  {kind !== 'newborn' && <UterusCutaway active={active === 'Uterus'} activeEndometrium={active === 'Endometrium'} activeCervix={active === 'Cervix'} onSelect={pick} kind={kind} />}
  {reproductive && <>
   <Tube points={[[-0.48, 0.78, 0.05], [-0.76, 1.04, 0.07], [-1.08, 1.03, 0.08], [-1.36, 0.73, 0.1]]} active={active === 'Fallopian tube'} onClick={() => pick('Fallopian tube')} />
   <Tube points={[[0.48, 0.78, 0.05], [0.76, 1.04, 0.07], [1.08, 1.03, 0.08], [1.36, 0.73, 0.1]]} active={active === 'Fallopian tube'} onClick={() => pick('Fallopian tube')} />
   {[-1, 1].map((side) => <Fragment key={side}>
    <Ovary position={[side * 1.38, 0.5, 0.08]} active={active === 'Ovary'} onSelect={pick} variant={kind} />
    {Array.from({ length: 4 }, (_, index) => <mesh key={index} position={[side * 1.37 + Math.cos(index * 1.5) * 0.28, 0.72 + Math.sin(index * 1.5) * 0.16, 0.17]} rotation={[0, 0, side * 0.35]}>
     <coneGeometry args={[0.075, 0.18, 8]} /><meshPhysicalMaterial color="#cb8291" roughness={0.72} />
    </mesh>)}
   </Fragment>)}
  </>}
  {kind === 'placenta' && <>
    <mesh position={[0, 0.35, 0.17]} scale={[0.9, 1.1, 0.58]} onClick={() => pick('Amniotic sac')}>
    <sphereGeometry args={[1, 48, 40]} /><meshPhysicalMaterial color={active === 'Amniotic sac' ? '#bdfff2' : '#72c0d1'} transparent opacity={0.2} roughness={0.18} transmission={0.16} thickness={0.24} side={THREE.DoubleSide} />
   </mesh>
   <Placenta active={active === 'Placenta'} onSelect={pick} />
   <CurledFetus active={active === 'Fetus'} onSelect={pick} scale={0.73} />
   <Tube points={[[-0.2, 0.35, 0.52], [-0.18, 0.2, 0.58], [-0.1, 0.02, 0.61], [0.02, -0.04, 0.6]]} radius={0.026} color="#d6a45e" active={active === 'Umbilical cord'} onClick={() => pick('Umbilical cord')} />
  </>}
  {['fetus', 'labour', 'presentation'].includes(kind) && <>
   <mesh position={[0, 0.3, 0.08]} scale={[0.82, 1.14, 0.53]} onClick={() => pick('Amniotic sac')}>
   <sphereGeometry args={[1, 48, 36]} /><meshPhysicalMaterial color={active === 'Amniotic sac' ? '#bdfff2' : '#73c0d3'} transparent opacity={0.15} roughness={0.2} side={THREE.DoubleSide} />
   </mesh>
   <CurledFetus active={active === 'Fetus'} onSelect={pick} scale={fetusScale} />
   <Placenta active={active === 'Placenta'} onSelect={pick} />
   <Tube points={[[0.28, 0.18, 0.66], [0.14, 0.0, 0.68], [-0.02, -0.05, 0.65], [-0.15, 0.02, 0.61]]} radius={0.024} color="#d6a45e" active={active === 'Umbilical cord'} onClick={() => pick('Umbilical cord')} />
  </>}
  {kind === 'newborn' && <group position={[0, -0.08, 0.15]}>
   <mesh position={[0, -0.05, 0]} rotation={[0, 0, -0.06]} scale={[0.36, 0.72, 0.29]} onClick={() => pick('Newborn body')} castShadow><capsuleGeometry args={[0.42, 0.42, 8, 20]} /><meshPhysicalMaterial color="#d99e84" roughness={0.7} clearcoat={0.1} /></mesh>
   <mesh position={[0, 0.76, 0.02]} scale={[0.36, 0.38, 0.31]} onClick={() => pick('Newborn head')} castShadow><sphereGeometry args={[1, 40, 32]} /><meshPhysicalMaterial color="#e4ae91" roughness={0.62} clearcoat={0.16} /></mesh>
   <Face position={[0, 0.76, 0.02]} scale={1.1} />
   {[-1, 1].map((side) => <Fragment key={side}>
    <mesh position={[side * 0.35, 0.05, 0.04]} rotation={[0, 0, side * 0.85]}><capsuleGeometry args={[0.085, 0.44, 6, 12]} /><meshPhysicalMaterial color="#d99e84" roughness={0.7} /></mesh>
    <mesh position={[side * 0.17, -0.6, 0.04]} rotation={[0, 0, side * 0.08]}><capsuleGeometry args={[0.1, 0.52, 6, 12]} /><meshPhysicalMaterial color="#d18f7b" roughness={0.68} /></mesh>
   </Fragment>)}
  </group>}
  {kind === 'complications' && <>
   <Placenta active={active === 'Placenta'} onSelect={pick} />
   {[[-0.3, 0.3, 0.32], [0.32, 0.57, 0.25], [0.18, -0.04, 0.3]].map((position, index) => <mesh key={index} position={position} scale={index === 0 ? [0.18, 0.2, 0.12] : [0.13, 0.16, 0.1]} onClick={() => pick('Fibroid')}>
    <sphereGeometry args={[1, 32, 24]} /><meshPhysicalMaterial color={active === 'Fibroid' ? '#ffcf96' : '#a56e7f'} roughness={0.74} clearcoat={0.12} />
   </mesh>)}
  </>}
  {kind === 'gynecology' && <>
   {[[-0.35, 0.3, 0.35], [0.29, 0.54, 0.24], [0.14, -0.02, 0.31]].map((position, index) => <mesh key={index} position={position} scale={index === 0 ? [0.18, 0.2, 0.12] : [0.13, 0.16, 0.1]} onClick={() => pick('Fibroid')}>
    <sphereGeometry args={[1, 32, 24]} /><meshPhysicalMaterial color={active === 'Fibroid' ? '#ffcf96' : '#ab7080'} roughness={0.74} clearcoat={0.12} />
   </mesh>)}
   <Ovary position={[1.38, 0.5, 0.08]} active={active === 'Ovary'} onSelect={pick} variant="gynecology" />
  </>}
  {labels.map(([part, position, target]) => <ModelLabel key={part} part={part} selected={active} onSelect={pick} position={position} target={target}>{part}</ModelLabel>)}
 </group>;
}

function LoadedModel({ url }) { const gltf = useGLTF(url); return <primitive object={gltf.scene} scale={1.5} position={[0, -1, 0]} />; }

export default function AnatomyScene({ kind = 'reproductive', modelUrl, onSelect }) {
 const colorItems = kind === 'newborn'
  ? [['Newborn skin', 'linear-gradient(135deg,#c98275,#e4ae91,#f0c3a0)'], ['Facial features', '#49333b']]
  : ['fetus', 'labour', 'presentation', 'placenta'].includes(kind)
  ? [['Uterine wall', 'linear-gradient(135deg,#713a57,#a85b73,#d07c8d)'], ['Endometrium', 'linear-gradient(135deg,#b85d7c,#d77e94,#f0a3ad)'], ['Amniotic fluid', 'linear-gradient(135deg,#4d9eb7,#73c0d3,#b4edf0)'], ['Fetal tissue', 'linear-gradient(135deg,#b97468,#d99c82,#f0c0a0)'], ['Placenta', 'linear-gradient(135deg,#71364d,#87445b,#bc6b7a)'], ['Umbilical cord', 'linear-gradient(135deg,#b47738,#d6a45e,#f4d18a)']]
  : [['Uterine wall', 'linear-gradient(135deg,#713a57,#a85b73,#d07c8d)'], ['Endometrium', 'linear-gradient(135deg,#b85d7c,#d77e94,#f0a3ad)'], ['Cervix', 'linear-gradient(135deg,#58405f,#84546f,#b97888)'], ['Fallopian tubes', 'linear-gradient(135deg,#98536e,#c4778a,#e7a7ae)'], ['Ovaries', 'linear-gradient(135deg,#a9564f,#d88f61,#f0b47a)'], ['Follicles', 'linear-gradient(135deg,#e7bd7e,#f2d49a,#fff0c8)']];
 if (kind === 'gynecology') colorItems.push(['Fibroids', '#ab7080'], ['Ovarian cyst', '#8d638f']);
 if (kind === 'complications') colorItems.push(['Placenta / lesion focus', '#87445b']);
 return <div className="scene-wrap"><Canvas camera={{ position: [0, 0, 4.65], fov: 42 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: true }} shadows>
  <color attach="background" args={['#091522']} /><fog attach="fog" args={['#091522', 7, 13]} />
  <hemisphereLight skyColor="#d6eaff" groundColor="#35232b" intensity={0.78} />
  <ambientLight intensity={0.52} />
  <directionalLight position={[3.5, 4.5, 5]} intensity={2.35} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={12} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
  <pointLight position={[-3.5, 1.2, 3]} intensity={0.9} color="#f2a0ba" />
  <pointLight position={[2.5, -1.4, -2]} intensity={0.65} color="#83bdde" />
  <Suspense fallback={null}><group position={[0, -0.05, 0]}>{modelUrl ? <LoadedModel url={modelUrl} /> : <ProceduralAnatomy kind={kind} onSelect={onSelect} />}</group><Environment preset="studio" /><ContactShadows position={[0, -1.55, 0]} opacity={0.28} scale={4.6} blur={2.2} far={2.4} /></Suspense>
  <OrbitControls enablePan={false} minDistance={2.7} maxDistance={6.8} autoRotate={false} makeDefault />
 </Canvas><div className="scene-hint">DRAG TO ROTATE · SCROLL TO ZOOM · SELECT A STRUCTURE TO EXPLORE</div><div className="scene-color-key" aria-label="3D model color key">{colorItems.map(([label, color]) => <span key={label}><i style={{ background: color }} />{label}</span>)}</div></div>;
}
