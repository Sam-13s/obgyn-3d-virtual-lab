import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { Baby, CheckCircle2, Pause, Play, RotateCcw, ShieldCheck, Stethoscope } from "lucide-react";
import * as THREE from "three";
import ModelLabel from "./components/ModelLabel.jsx";
import ClinicalLighting from "./components/ClinicalLighting.jsx";
import "./NormalAssistedDeliveryLab.css";

const deliveryModes = {
  spontaneous: {
    title: "Spontaneous vaginal birth", tag: "NO INSTRUMENT", color: "#71d0d0",
    summary: "The baby is born vaginally through uterine contractions and the birthing person's pushing, without forceps or a vacuum device. Birth positions, comfort measures and pushing support should reflect individual preference and clinical circumstances.",
    points: ["Support the person's preferred position and urge to push when clinically appropriate.", "Continue assessment of maternal and fetal wellbeing and communicate changes clearly.", "Routine episiotomy is not recommended for spontaneous vaginal birth.", "After birth, support skin-to-skin contact and newborn care when parent and baby are stable."],
    comparison: "Spontaneous birth does not involve an instrument. If progress or wellbeing becomes concerning, the care team reassesses options with the birthing person."
  },
  vacuum: {
    title: "Vacuum-assisted birth", tag: "VENTOUSE / VACUUM CUP", color: "#e8c174",
    summary: "A trained clinician places a suction cup on the fetal scalp and coordinates gentle traction with contractions and maternal effort. It may be considered when birth needs assistance and the clinical prerequisites are met.",
    points: ["Possible reasons include concern about the baby's wellbeing, labour not progressing as expected, or a need to shorten pushing.", "Confirm fetal head position, station and suitability; obtain informed consent and discuss benefits, risks and alternatives.", "The cup may detach or the attempt may not succeed. The team plans for reassessment and timely alternative birth if needed.", "Temporary scalp swelling or bruising can occur; the newborn is assessed after birth."],
    comparison: "Vacuum can be associated with scalp bruising or cephalohaematoma. Choice depends on fetal position, gestational age, urgency, clinician skill and local guidance."
  },
  forceps: {
    title: "Forceps-assisted birth", tag: "OBSTETRIC FORCEPS", color: "#bf9af2",
    summary: "A trained clinician uses two curved blades that fit around the fetal head to assist birth. Forceps may be selected based on the baby's position, the clinical situation and the operator's expertise.",
    points: ["Possible reasons are similar to vacuum assistance: concerns about wellbeing, labour progress or the ability to continue pushing.", "Confirm position and suitability, explain the proposed procedure, obtain informed consent and discuss alternatives.", "Forceps can leave temporary facial marks and are associated with a higher chance of significant perineal injury than vacuum.", "A neonatal assessment and careful examination and repair of any maternal tear are part of follow-up."],
    comparison: "Forceps and vacuum have different maternal and newborn risk profiles. Instrument selection is individualized; forceps may be preferred in some earlier-preterm situations."
  }
};

const focusOptions = [
  { id: "baby", label: "Fetal head" }, { id: "pelvis", label: "Maternal pelvis" },
  { id: "canal", label: "Birth canal" }, { id: "instrument", label: "Instrument" }
];

function Bone({ points, active }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), [points]);
  return <mesh><tubeGeometry args={[curve, 36, 0.075, 12, false]} /><meshStandardMaterial color={active ? "#b4ebe1" : "#a9a99d"} emissive={active ? "#438e83" : "#000000"} emissiveIntensity={active ? 0.55 : 0} roughness={0.7} /></mesh>;
}

function BabyModel({ group, head, heart, mode, focus }) {
  const skin = focus === "baby" ? "#f0c0a2" : "#d89b83";
  return <group ref={group} position={[0, 0.1, 0.58]} rotation={[0, 0, Math.PI]}>
    <mesh position={[0, -0.08, 0]} rotation={[0, 0, -0.48]} scale={[0.82, 1, 0.74]}>
      <sphereGeometry args={[0.47, 40, 32]} /><meshStandardMaterial color={skin} emissive={focus === "baby" ? "#9b5148" : "#000000"} emissiveIntensity={focus === "baby" ? 0.45 : 0} roughness={0.74} />
    </mesh>
    <mesh ref={head} position={[0.08, 0.47, 0.02]} scale={[1, 1.03, 0.9]}>
      <sphereGeometry args={[0.29, 40, 32]} /><meshStandardMaterial color={skin} emissive={focus === "baby" ? "#9b5148" : "#000000"} emissiveIntensity={focus === "baby" ? 0.45 : 0} roughness={0.7} />
    </mesh>
    <mesh position={[0.32, 0.45, 0.04]}><sphereGeometry args={[0.045, 20, 16]} /><meshStandardMaterial color="#bd7868" /></mesh>
    <mesh position={[-0.1, -0.36, 0.15]} rotation={[0, 0, 0.7]}><capsuleGeometry args={[0.09, 0.34, 6, 12]} /><meshStandardMaterial color={skin} roughness={0.74} /></mesh>
    <mesh position={[0.17, -0.4, 0.15]} rotation={[0, 0, -0.8]}><capsuleGeometry args={[0.09, 0.34, 6, 12]} /><meshStandardMaterial color={skin} roughness={0.74} /></mesh>
    <mesh ref={heart} position={[0.1, -0.02, 0.31]}><sphereGeometry args={[0.05, 22, 18]} /><meshStandardMaterial color="#ff718d" emissive="#ed2853" emissiveIntensity={0.4} /></mesh>
    {mode === "vacuum" && <group position={[0.08, 0.47, 0.29]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.115, 0.17, 0.11, 32, 1, true]} /><meshStandardMaterial color={focus === "instrument" ? "#fff0b8" : "#79c9dc"} emissive={focus === "instrument" ? "#c39336" : "#327d8c"} emissiveIntensity={focus === "instrument" ? 0.75 : 0.3} metalness={0.22} roughness={0.28} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.16, 0.018, 8, 28]} /><meshStandardMaterial color="#d8f4f3" metalness={0.35} roughness={0.25} /></mesh>
    </group>}
    {mode === "forceps" && <group position={[0.08, 0.46, 0.24]}>
      {[1, -1].map((side) => {
        const points = [[side * 0.3, 0.24, 0], [side * 0.34, 0.05, 0.04], [side * 0.25, -0.12, 0.08], [side * 0.12, -0.16, 0.08]].map((p) => new THREE.Vector3(...p));
        const curve = new THREE.CatmullRomCurve3(points);
        return <mesh key={side}><tubeGeometry args={[curve, 24, 0.028, 10, false]} /><meshStandardMaterial color={focus === "instrument" ? "#fff0b8" : "#c4d2da"} emissive={focus === "instrument" ? "#b58b39" : "#000000"} emissiveIntensity={focus === "instrument" ? 0.75 : 0.18} metalness={0.72} roughness={0.24} /></mesh>;
      })}
    </group>}
  </group>;
}

function DeliveryModel({ mode, progress, playing, focus, onSelect }) {
  const baby = useRef();
  const head = useRef();
  const heart = useRef();
  const uterus = useRef();
  const canal = useRef();
  const descent = THREE.MathUtils.smoothstep(progress, 4, 100);
  const points = useMemo(() => [
    [[-1.06, 0.25, -0.05], [-1.3, -0.14, 0], [-1.17, -0.72, 0.06], [-0.72, -1.16, 0.1], [-0.28, -1.31, 0.12]],
    [[1.06, 0.25, -0.05], [1.3, -0.14, 0], [1.17, -0.72, 0.06], [0.72, -1.16, 0.1], [0.28, -1.31, 0.12]],
    [[-0.28, -1.31, 0.12], [0, -1.4, 0.12], [0.28, -1.31, 0.12]]
  ], []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const contraction = playing ? Math.max(0, Math.sin(t * 2.2)) ** 5 : 0;
    if (uterus.current) {
      uterus.current.scale.x = 0.88 + contraction * 0.025;
      uterus.current.scale.y = 1.34 - contraction * 0.035;
    }
    if (baby.current) {
      baby.current.position.y = THREE.MathUtils.lerp(0.1, -1.42, descent) + (playing ? Math.sin(t * 1.2) * 0.015 : 0);
      baby.current.position.x = progress > 64 ? THREE.MathUtils.lerp(0, 0.18, (progress - 64) / 36) : 0;
      baby.current.rotation.z = Math.PI + descent * 0.24;
    }
    if (canal.current) canal.current.scale.y = 0.56 + descent * 0.12;
    if (head.current && progress > 35) head.current.rotation.z = Math.sin(t * 0.5) * (playing ? 0.05 : 0) + descent * 0.12;
    if (heart.current) {
      const pulse = Math.max(0, Math.sin(t * 4.8)) ** 10;
      heart.current.scale.setScalar(1 + pulse * 0.2);
      heart.current.material.emissiveIntensity = focus === "baby" ? 1.25 + pulse : 0.4 + pulse * 0.7;
    }
  });

  return <group>
    <Bone active={focus === "pelvis"} points={points[0]} /><Bone active={focus === "pelvis"} points={points[1]} /><Bone active={focus === "pelvis"} points={points[2]} />
    {/* A cutaway uterus and cervix frame the birth canal; geometry is simplified for teaching. */}
    <mesh ref={uterus} position={[0, 0.48, -0.04]} scale={[0.88, 1.34, 0.56]}><sphereGeometry args={[1, 64, 48, Math.PI, Math.PI]} /><meshStandardMaterial color="#a94e70" emissive={focus === "canal" ? "#732b4a" : "#000000"} emissiveIntensity={focus === "canal" ? 0.35 : 0} roughness={0.7} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0.4, 0.01]} scale={[0.72, 1.14, 0.43]}><sphereGeometry args={[1, 56, 40, Math.PI, Math.PI]} /><meshStandardMaterial color="#ef9fbb" transparent opacity={0.45} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, -0.62, 0.14]} scale={[0.35, 0.42, 0.28]}><cylinderGeometry args={[0.43, 0.3, 1, 36]} /><meshStandardMaterial color="#c27791" roughness={0.6} /></mesh>
    <mesh ref={canal} position={[0, -1.22, 0.14]} scale={[0.24, 0.56, 0.22]}><cylinderGeometry args={[0.42, 0.34, 1, 32]} /><meshStandardMaterial color={focus === "canal" ? "#f3b4cc" : "#a85c78"} emissive={focus === "canal" ? "#9f395e" : "#000000"} emissiveIntensity={focus === "canal" ? 0.55 : 0} roughness={0.62} /></mesh>
    <BabyModel group={baby} head={head} heart={heart} mode={mode} focus={focus} />
    {mode !== "spontaneous" && progress > 12 && progress < 94 && <Sparkles count={playing ? 10 : 3} position={[0.08, 0.6, 0.92]} scale={[0.5, 0.5, 0.35]} size={2} speed={playing ? 0.28 : 0} opacity={0.5} color={deliveryModes[mode].color} />}
    <ModelLabel className="delivery-label" part="baby" selected={focus} onSelect={onSelect} position={[1.92, 0.55, 0.24]} target={[0.73, 0.12, 0.65]}>Baby’s head</ModelLabel>
    <ModelLabel className="delivery-label" part="pelvis" selected={focus} onSelect={onSelect} position={[-1.92, -0.68, 0.24]} target={[-1.28, -0.8, 0.24]}>Pelvis</ModelLabel>
    <ModelLabel className="delivery-label" part="canal" selected={focus} onSelect={onSelect} position={[1.92, -1.28, 0.24]} target={[0.65, -1.28, 0.52]}>Birth canal</ModelLabel>
    {mode !== "spontaneous" && progress > 12 && progress < 94 && <ModelLabel className="delivery-label" part="instrument" selected={focus} onSelect={onSelect} position={[1.92, 1.3, 0.24]} target={[0.68, 0.63, 0.78]}>{mode === "vacuum" ? "Vacuum cup" : "Forceps"}</ModelLabel>}
    <pointLight position={[0, 0, 2]} color={deliveryModes[mode].color} intensity={0.65} distance={6} />
  </group>;
}

export default function NormalAssistedDeliveryLab() {
  const [mode, setMode] = useState("spontaneous");
  const [progress, setProgress] = useState(8);
  const [playing, setPlaying] = useState(true);
  const [focus, setFocus] = useState("baby");
  const controls = useRef();
  const details = deliveryModes[mode];
  const mechanism = progress < 28 ? "Engagement and flexion" : progress < 61 ? "Descent and rotation" : progress < 88 ? "Extension and crowning" : "Birth";

  React.useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => setProgress((value) => Math.min(100, value + 1)), 340);
    return () => window.clearInterval(timer);
  }, [playing]);

  React.useEffect(() => {
    if (progress >= 100) setPlaying(false);
  }, [progress]);

  const selectMode = (nextMode) => {
    setMode(nextMode);
    setProgress(8);
    setPlaying(false);
    setFocus(nextMode === "spontaneous" ? "baby" : "instrument");
  };

  return <main className="delivery-lab">
    <header className="delivery-header"><div><p className="delivery-eyebrow">OBSTETRICS · INTERACTIVE CLINICAL LEARNING</p><h1>Normal & Assisted Delivery</h1><p className="delivery-subtitle">Compare spontaneous vaginal birth with vacuum and forceps assistance through an interactive birth-mechanics model.</p></div>
      <div className="delivery-mechanism-chip"><span>MECHANISM</span><b>{mechanism}</b></div>
    </header>
    <nav className="delivery-mode-tabs" aria-label="Choose a birth pathway">{Object.entries(deliveryModes).map(([id, item]) => <button key={id} className={mode === id ? "active" : ""} style={{ "--mode-color": item.color }} onClick={() => selectMode(id)}><span>{item.tag}</span><b>{item.title}</b></button>)}</nav>
    <section className="delivery-main-grid">
      <article className="delivery-model-card">
        <div className="delivery-card-head"><div><p className="delivery-eyebrow">SAGITTAL CUTAWAY · {details.tag}</p><h2>{mechanism}</h2></div><span className="delivery-live-tag"><i /> 4D BIRTH SIMULATION</span></div>
        <div className="delivery-canvas-wrap"><Canvas camera={{ position: [0, 0.05, 6.4], fov: 42 }} dpr={[1, 1.5]} shadows>
          <color attach="background" args={["#091725"]} /><fog attach="fog" args={["#091725", 7, 13]} />
          <ClinicalLighting floor={-2.0} tint="#f2a3c3" />
          <DeliveryModel mode={mode} progress={progress} playing={playing} focus={focus} onSelect={setFocus} />
          <OrbitControls ref={controls} enablePan={false} minDistance={3.7} maxDistance={8} autoRotate={playing} autoRotateSpeed={0.27} minPolarAngle={0.5} maxPolarAngle={2.6} />
        </Canvas>
          <div className="delivery-model-actions"><button onClick={() => setPlaying((value) => !value)}>{playing ? <Pause size={14} /> : <Play size={14} />}{playing ? "Pause" : "Play birth"}</button><button onClick={() => controls.current?.reset()}><RotateCcw size={14} /> Reset view</button></div>
          <span className="delivery-model-note">Schematic anatomy · not a procedure guide</span>
        </div>
        <div className="clinical-color-key" aria-label="Delivery model color key"><span><i style={{ background: "#a94e70" }} /> Uterus</span><span><i style={{ background: "#ef9fbb" }} /> Endometrium</span><span><i style={{ background: "#d99d88" }} /> Baby</span><span><i style={{ background: "#a9a99d" }} /> Pelvis</span><span><i style={{ background: mode === "vacuum" ? "#79c9dc" : mode === "forceps" ? "#c4d2da" : "#d78ca4" }} /> {mode === "vacuum" ? "Vacuum cup" : mode === "forceps" ? "Forceps" : "Birth pathway"}</span></div>
        <div className="delivery-progress"><div><span>SECOND-STAGE PROGRESSION</span><b>{Math.round(progress)}%</b></div><input aria-label="Birth progression" type="range" min="0" max="100" value={progress} onChange={(event) => { setProgress(Number(event.target.value)); setPlaying(false); }} style={{ "--delivery-progress": `${progress}%` }} /><div className="delivery-phase-scale"><span>Engagement</span><span>Rotation</span><span>Crowning</span><span>Birth</span></div></div>
      </article>
      <aside className="delivery-info-card" style={{ "--mode-color": details.color }}>
        <p className="delivery-eyebrow">{details.tag}</p><h2>{details.title}</h2><p className="delivery-summary">{details.summary}</p>
        <div className="delivery-points"><b>Clinical learning points</b>{details.points.map((point) => <div key={point}><i /><span>{point}</span></div>)}</div>
        <div className="delivery-comparison"><Stethoscope size={15} /><p>{details.comparison}</p></div>
      </aside>
    </section>
    <section className="delivery-safety-grid">
      <article><div><CheckCircle2 size={16} /></div><b>Before assisted birth</b><p>Confirm full dilatation, ruptured membranes, an engaged head with position and station identified, and no suspected obstruction. Explain options, obtain consent, provide suitable analgesia and plan for an unsuccessful attempt.</p></article>
      <article><div><ShieldCheck size={16} /></div><b>Skilled team and setting</b><p>Vacuum and forceps require a trained, competent clinician. The team considers urgency, available expertise, neonatal support and access to caesarean birth if needed.</p></article>
      <article><div><Baby size={16} /></div><b>After birth</b><p>Assess the newborn and parent, check for bleeding and birth-related injury, support skin-to-skin when clinically appropriate, and explain recovery and follow-up.</p></article>
    </section>
    <section className="delivery-risk-card"><div><span>SHARED DECISION-MAKING</span><h2>Benefits, risks and alternatives</h2><p>Assistance may help expedite birth when clinically indicated, but can increase the chance of perineal injury or newborn bruising. If an attempt is unsuitable or does not succeed, another instrument or caesarean may be considered. The clinician should explain the options and obtain consent whenever circumstances allow.</p></div><div className="delivery-risk-tags"><span>Perineal tears</span><span>Scalp bruising</span><span>Failed attempt</span><span>Alternative birth plan</span></div></section>
    <footer className="delivery-footer">Educational model only. It does not teach instrument application or replace supervised clinical training, informed consent or local protocols. Instrument choice depends on individual circumstances and a skilled operator. <a href="https://www.rcog.org.uk/guidance/browse-all-guidance/green-top-guidelines/assisted-vaginal-birth-green-top-guideline-no-26/" target="_blank" rel="noreferrer">RCOG assisted vaginal birth guideline</a> · <a href="https://www.rcog.org.uk/for-the-public/browse-our-patient-information/assisted-vaginal-birth-ventouse-or-forceps/" target="_blank" rel="noreferrer">RCOG patient information</a> · <a href="https://www.who.int/publications/i/item/9789241550215" target="_blank" rel="noreferrer">WHO intrapartum care</a></footer>
  </main>;
}
