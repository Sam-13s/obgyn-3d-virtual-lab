import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Html, OrbitControls, Stars, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function ProceduralAnatomy({kind, onSelect}) {
 const group=useRef(); const [active,setActive]=useState('');
 useFrame((state,delta)=>{ if(group.current) group.current.rotation.y += delta*0.12; });
 const parts=useMemo(()=>{
  const common=[{name:'Uterus',pos:[0,0.35,0],scale:[0.72,0.92,0.48],color:'#cf718b'},{name:'Cervix',pos:[0,-0.62,0],scale:[0.28,0.48,0.3],color:'#e9a0ae'},{name:'Left ovary',pos:[-1.08,0.28,0],scale:[0.25,0.2,0.23],color:'#e5a16c'},{name:'Right ovary',pos:[1.08,0.28,0],scale:[0.25,0.2,0.23],color:'#e5a16c'}];
  if(kind==='placenta') return [...common,{name:'Placenta',pos:[0.48,0.72,-0.25],scale:[0.52,0.3,0.16],color:'#9e526d'},{name:'Amniotic sac',pos:[0,-0.02,0.1],scale:[0.85,1.05,0.62],color:'#6cb9d5'}];
  if(kind==='fetus'||kind==='labour'||kind==='presentation') return [...common,{name:'Fetal head',pos:[0,0.55,0.2],scale:[0.34,0.38,0.32],color:'#e6b28d'},{name:'Fetal body',pos:[0,-0.05,0.18],scale:[0.28,0.55,0.25],color:'#d99b79'}];
  if(kind==='newborn') return [{name:'Head',pos:[0,0.65,0],scale:[0.48,0.48,0.42],color:'#e6b28d'},{name:'Body',pos:[0,-0.15,0],scale:[0.38,0.72,0.3],color:'#d99b79'}];
  return common;
 },[kind]);
 return <group ref={group}>
  {parts.map((p,i)=><mesh key={p.name} position={p.pos} scale={p.scale} onClick={(e)=>{e.stopPropagation();setActive(p.name);onSelect?.(p.name)}} onPointerOver={(e)=>{e.stopPropagation();document.body.style.cursor='pointer'}} onPointerOut={()=>document.body.style.cursor='auto'}>
   <sphereGeometry args={[1,48,48]}/><meshPhysicalMaterial color={p.color} roughness={0.34} metalness={0.02} clearcoat={0.6} transparent={p.name==='Amniotic sac'} opacity={p.name==='Amniotic sac'?0.28:1}/>
   {active===p.name&&<Html distanceFactor={8} position={[0,1.25,0]}><div className="scene-label">{p.name}</div></Html>}
  </mesh>)}
  {(kind==='reproductive'||kind==='placenta')&&[-1,1].map((s)=><mesh key={s} position={[s*0.72,0.85,0]} rotation={[0,0,s*0.45]}><torusGeometry args={[0.42,0.045,12,64,Math.PI*0.8]}/><meshStandardMaterial color="#e8a0ad"/></mesh>)}
 </group>
}
function LoadedModel({url}) { const gltf=useGLTF(url); return <primitive object={gltf.scene} scale={1.5} position={[0,-1,0]}/>; }
export default function AnatomyScene({kind='reproductive',modelUrl,onSelect}) {
 return <div className="scene-wrap"><Canvas camera={{position:[0,0,4.2],fov:42}} dpr={[1,1.7]} gl={{antialias:true,alpha:true}}>
  <color attach="background" args={['#091522']}/><ambientLight intensity={1.3}/><directionalLight position={[4,5,5]} intensity={2.2}/><pointLight position={[-4,-2,3]} intensity={1.2} color="#4fd1c5"/>
  <Suspense fallback={null}>{modelUrl?<LoadedModel url={modelUrl}/>:<ProceduralAnatomy kind={kind} onSelect={onSelect}/>}<Environment preset="city"/><ContactShadows position={[0,-1.5,0]} opacity={0.35} scale={5} blur={2}/></Suspense>
  <OrbitControls enablePan={false} minDistance={2.4} maxDistance={7} autoRotate={false} makeDefault/><Stars radius={40} depth={20} count={450} factor={2} fade speed={0.3}/>
 </Canvas><div className="scene-hint">DRAG TO ROTATE · SCROLL TO ZOOM · TAP AN ORGAN</div></div>
}
