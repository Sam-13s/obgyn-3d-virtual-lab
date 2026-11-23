import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { Activity, Baby, CircleHelp, HeartPulse, Pause, Play, RotateCcw, ShieldCheck } from "lucide-react";
import * as THREE from "three";
import ModelLabel from "./components/ModelLabel.jsx";
import ClinicalLighting from "./components/ClinicalLighting.jsx";
import "./StagesOfLabourLab.css";

const stageDetails = [
  {
    name: "First stage", short: "Cervical dilatation", interval: "Labour onset → 10 cm",
    summary: "Regular labour contractions lead to cervical effacement and dilatation. WHO describes the latent phase as progressing up to 5 cm and the active phase from 5 cm to full dilatation.",
    points: ["Latent phase: painful contractions with variable cervical change; duration varies widely.", "Active phase: regular painful contractions with more rapid cervical change from 5 cm to full dilatation.", "Offer respectful continuous support, comfort and pain-relief options; encourage mobility and oral fluids/food when appropriate.", "Monitor maternal and fetal wellbeing and labour progress with the WHO Labour Care Guide or local protocol.", "Avoid treating a single slow cervical-dilatation rate as an automatic indication for intervention; assess the whole clinical picture."],
    icon: Activity, color: "#72cbd8"
  },
  {
    name: "Second stage", short: "Birth of the baby", interval: "10 cm → birth",
    summary: "Full cervical dilatation to birth. The presenting part descends and rotates through the pelvis; the birthing person may feel an urge to push.",
    points: ["Continue assessment of maternal and fetal wellbeing and progress; explain findings and obtain consent.", "Support a comfortable birth position and the person's preferred pushing approach when clinically appropriate.", "Keep communication calm, clear and supportive; include the chosen support person where desired.", "If birth is not progressing or concerns arise, promptly reassess and follow escalation pathways.", "The model shows a simplified vertex birth mechanism; real fetal position and labour progress vary."],
    icon: Baby, color: "#e5bc78"
  },
  {
    name: "Third stage", short: "Placental birth", interval: "Baby’s birth → placenta",
    summary: "From birth of the baby until delivery of the placenta and membranes. Care includes preventing and promptly recognizing postpartum haemorrhage.",
    points: ["Use an effective uterotonic for postpartum-haemorrhage prevention according to current local guidance and available medicines.", "Observe maternal condition, uterine tone and bleeding; assess that the placenta and membranes are complete.", "Cord-clamping timing and any additional manoeuvres follow the clinical situation and local protocol.", "Support early skin-to-skin contact and newborn care when the condition of the parent and baby allows.", "Escalate excessive bleeding or maternal instability immediately using the local emergency pathway."],
    icon: ShieldCheck, color: "#c09af2"
  }
];

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const practiceCases = [
  {
    title: "Support during first stage",
    scene: "A person in early labour is stable, asks to walk, and would like their chosen companion nearby. What is the best supportive response?",
    options: ["Support their preferred mobility and companion, while continuing individualized assessment.", "Require them to remain in bed and alone for routine observation.", "Recommend an intervention solely to shorten labour."],
    answer: 0,
    rationale: "Respectful labour care includes supporting a companion of choice and mobility or position preferences when appropriate, alongside ongoing assessment and local guidance.",
    progress: 18
  },
  {
    title: "Reviewing labour progress",
    scene: "Cervical change appears slower than expected on one observation. What should guide the next step?",
    options: ["Start an intervention automatically based on that single rate.", "Reassess the full maternal and fetal picture, discuss findings, and use the Labour Care Guide and local escalation pathway.", "Stop monitoring because labour progress varies."],
    answer: 1,
    rationale: "A single cervical-dilatation rate should not automatically trigger intervention. Interpret progress with the whole clinical picture, continued monitoring, respectful communication and the local protocol.",
    progress: 33
  }
];

function PelvicBone({ points, selected }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), [points]);
  return <mesh><tubeGeometry args={[curve, 36, 0.085, 12, false]} /><meshStandardMaterial color={selected ? "#a9e6dc" : "#a6a89d"} emissive={selected ? "#388e85" : "#000000"} emissiveIntensity={selected ? 0.5 : 0} roughness={0.68} /></mesh>;
}

function FetalBody({ heart, head, selected, rotation }) {
  return <group rotation={rotation}>
    <mesh position={[0, -0.08, 0]} rotation={[0, 0, -0.44]} scale={[0.82, 1, 0.75]}>
      <sphereGeometry args={[0.48, 40, 32]} /><meshStandardMaterial color={selected ? "#f3bf9c" : "#d99d88"} emissive={selected ? "#a84847" : "#000000"} emissiveIntensity={selected ? 0.42 : 0} roughness={0.72} />
    </mesh>
    <mesh ref={head} position={[0.12, 0.48, 0.04]} scale={[0.3, 0.31, 0.28]}>
      <sphereGeometry args={[1, 40, 32]} /><meshStandardMaterial color={selected ? "#f7c7a8" : "#d99d88"} emissive={selected ? "#a84847" : "#000000"} emissiveIntensity={selected ? 0.42 : 0} roughness={0.72} />
    </mesh>
    <mesh position={[0.37, 0.45, 0.04]}><sphereGeometry args={[0.05, 20, 16]} /><meshStandardMaterial color="#bd7868" /></mesh>
    <mesh position={[-0.12, -0.38, 0.15]} rotation={[0, 0, 0.8]}><capsuleGeometry args={[0.095, 0.35, 6, 12]} /><meshStandardMaterial color="#d99d88" roughness={0.72} /></mesh>
    <mesh position={[0.19, -0.42, 0.15]} rotation={[0, 0, -0.85]}><capsuleGeometry args={[0.095, 0.35, 6, 12]} /><meshStandardMaterial color="#d99d88" roughness={0.72} /></mesh>
    <mesh ref={heart} position={[0.14, 0.02, 0.35]}>
      <sphereGeometry args={[0.055, 22, 18]} /><meshStandardMaterial color="#ff718d" emissive="#ed2853" emissiveIntensity={0.4} />
    </mesh>
  </group>;
}

function LabourModel({ progress, stage, playing, selectedPart, onSelect }) {
  const uterus = useRef();
  const cervix = useRef();
  const cervixTissue = useRef();
  const baby = useRef();
  const babyHead = useRef();
  const placenta = useRef();
  const heart = useRef();
  const birthPath = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.42, 0.48), new THREE.Vector3(0.03, -0.85, 0.62),
    new THREE.Vector3(0.02, -1.28, 0.66), new THREE.Vector3(0, -1.82, 0.65)
  ]), []);

  const first = clamp(progress / 38, 0, 1);
  const second = clamp((progress - 34) / 40, 0, 1);
  const third = clamp((progress - 68) / 32, 0, 1);
  const dilation = Math.round(clamp(progress / 38, 0, 1) * 10);
  const cervixRadius = 0.14 + dilation * 0.049;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const contraction = playing && stage === 0 ? Math.max(0, Math.sin(t * 2.3)) ** 4 : 0;
    if (uterus.current) {
      uterus.current.scale.x = 0.88 + contraction * 0.035;
      uterus.current.scale.y = 1.42 - contraction * 0.045;
    }
    if (cervix.current) {
      cervix.current.scale.set(cervixRadius / 0.22, cervixRadius / 0.22, 1);
    }
    if (cervixTissue.current) cervixTissue.current.scale.y = 0.42 * (1 - first * 0.68);
    if (baby.current) {
      baby.current.position.y = progress < 40 ? 0.25 + contraction * 0.045 : THREE.MathUtils.lerp(0.25, -2.0, second);
      baby.current.position.x = progress >= 78 ? -0.48 : progress < 40 ? 0 : Math.sin(second * Math.PI) * 0.11;
      baby.current.rotation.z = progress < 40 ? 0 : THREE.MathUtils.lerp(0.05, 0.3, second);
      baby.current.visible = true;
    }
    if (babyHead.current && progress >= 40 && progress < 78) {
      babyHead.current.rotation.z = THREE.MathUtils.lerp(0, 0.42, second);
    }
    if (placenta.current) {
      placenta.current.position.y = THREE.MathUtils.lerp(0.55, -2.22, third);
      placenta.current.position.x = THREE.MathUtils.lerp(-0.55, 0.62, third);
      placenta.current.visible = true;
    }
    if (heart.current) {
      const beat = Math.max(0, Math.sin(t * 4.6)) ** 10;
      heart.current.scale.setScalar(1 + beat * 0.2);
      heart.current.material.emissiveIntensity = selectedPart === "fetus" ? 1.4 + beat : 0.4 + beat * 0.6;
    }
  });

  const wallColor = selectedPart === "uterus" ? "#ec9cb1" : "#a84f70";
  return <group>
    {/* Simple bony pelvis landmarks frame the soft tissue birth passage. */}
    <PelvicBone selected={selectedPart === "pelvis"} points={[[-1.15, 0.12, -0.02], [-1.4, -0.28, 0.03], [-1.28, -0.78, 0.08], [-0.82, -1.18, 0.1], [-0.34, -1.34, 0.1]]} />
    <PelvicBone selected={selectedPart === "pelvis"} points={[[1.15, 0.12, -0.02], [1.4, -0.28, 0.03], [1.28, -0.78, 0.08], [0.82, -1.18, 0.1], [0.34, -1.34, 0.1]]} />
    <PelvicBone selected={selectedPart === "pelvis"} points={[[-0.34, -1.34, 0.1], [0, -1.44, 0.12], [0.34, -1.34, 0.1]]} />
    {/* Cutaway uterine wall and cavity */}
    <mesh ref={uterus} position={[0, 0.2, 0]} scale={[0.88, 1.42, 0.58]}><sphereGeometry args={[1, 64, 48, Math.PI, Math.PI]} /><meshStandardMaterial color={wallColor} emissive={selectedPart === "uterus" ? "#8b294c" : "#000000"} emissiveIntensity={selectedPart === "uterus" ? 0.5 : 0} roughness={0.72} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0.18, 0.03]} scale={[0.72, 1.23, 0.46]}><sphereGeometry args={[1, 56, 40, Math.PI, Math.PI]} /><meshStandardMaterial color="#f3a4bf" transparent opacity={0.45} side={THREE.DoubleSide} /></mesh>
    <mesh ref={cervixTissue} position={[0, -0.53, 0.12]} scale={[0.36, 0.42, 0.29]}>
      <cylinderGeometry args={[0.42, 0.28, 1, 40]} /><meshStandardMaterial color={selectedPart === "cervix" ? "#fac5d5" : "#bb708c"} emissive={selectedPart === "cervix" ? "#b83f6a" : "#000000"} emissiveIntensity={selectedPart === "cervix" ? 0.5 : 0} roughness={0.56} />
    </mesh>
    {/* Cervical opening enlarges progressively during the first stage. */}
    <mesh ref={cervix} position={[0, -0.73, 0.48]}>
      <torusGeometry args={[0.22, 0.075, 14, 48]} /><meshStandardMaterial color={selectedPart === "cervix" ? "#ffe0e8" : "#e99aac"} emissive={selectedPart === "cervix" ? "#e6517a" : "#000000"} emissiveIntensity={selectedPart === "cervix" ? 0.65 : 0} />
    </mesh>
    {/* Vaginal canal */}
    <mesh position={[0, -1.37, 0.18]} scale={[0.25, 0.67, 0.24]}><cylinderGeometry args={[0.42, 0.34, 1, 32]} /><meshStandardMaterial color="#a85e78" roughness={0.65} /></mesh>
    {/* Placenta separates and descends during the third stage. */}
    <mesh ref={placenta} position={[-0.55, 0.55, -0.26]} rotation={[0.1, -0.28, -0.18]} scale={[0.4, 0.52, 0.13]}>
      <sphereGeometry args={[1, 40, 28]} /><meshStandardMaterial color={selectedPart === "placenta" ? "#f092ad" : "#813f59"} emissive={selectedPart === "placenta" ? "#a52954" : "#000000"} emissiveIntensity={selectedPart === "placenta" ? 0.65 : 0} roughness={0.8} />
    </mesh>
    {/* Simplified head-first descent and expulsion; not a delivery technique demo. */}
    <group ref={baby} position={[0, 0.25, 0.52]}>
      <FetalBody heart={heart} head={babyHead} selected={selectedPart === "fetus"} rotation={[0, 0, Math.PI]} />
    </group>
    <mesh><tubeGeometry args={[birthPath, 36, selectedPart === "canal" ? 0.065 : 0.035, 10, false]} /><meshStandardMaterial color={selectedPart === "canal" ? "#e7abc1" : "#d78ca4"} emissive={selectedPart === "canal" ? "#9d3f68" : "#000000"} emissiveIntensity={selectedPart === "canal" ? 0.45 : 0} transparent opacity={0.85} /></mesh>
    {progress < 68 && <mesh position={[0, -0.05, 1.0]}>
      <sphereGeometry args={[0.16, 24, 18]} /><meshStandardMaterial color="#ff7990" emissive="#f33762" emissiveIntensity={1.5} />
    </mesh>}
    {stage === 0 && <Sparkles count={playing ? 18 : 5} scale={[1.5, 1.5, 0.8]} position={[0, 0.3, 0.7]} size={2} speed={playing ? 0.38 : 0} color="#ff8fa9" />}
    <ModelLabel className="labour-label" part="uterus" selected={selectedPart} onSelect={onSelect} position={[-1.92, 1.48, 0.22]} target={[0, 0.34, 0.34]}>Uterus</ModelLabel>
    <ModelLabel className="labour-label" part="placenta" selected={selectedPart} onSelect={onSelect} position={[-1.94, 0.55, 0.22]} target={progress >= 68 ? [0.66, -2.08, 0.5] : [-0.86, 0.84, 0.18]}>Placenta</ModelLabel>
    <ModelLabel className="labour-label" part="fetus" selected={selectedPart} onSelect={onSelect} position={[1.92, 0.38, 0.2]} target={progress >= 78 ? [0.74, -1.9, 0.78] : [0.76, 0.22, 0.52]}>Baby</ModelLabel>
    <ModelLabel className="labour-label" part="cervix" selected={selectedPart} onSelect={onSelect} position={[1.92, -0.55, 0.23]} target={[0.62, -0.76, 0.55]}>Cervix · {dilation} cm</ModelLabel>
    <ModelLabel className="labour-label" part="canal" selected={selectedPart} onSelect={onSelect} position={[1.86, -1.48, 0.22]} target={[0.56, -1.44, 0.46]}>Birth canal</ModelLabel>
    <ModelLabel className="labour-label" part="pelvis" selected={selectedPart} onSelect={onSelect} position={[-1.92, -0.72, 0.2]} target={[-1.25, -0.86, 0.18]}>Pelvis</ModelLabel>
    <pointLight position={[0, 0, 2]} color={stageDetails[stage].color} intensity={0.8} distance={6} />
  </group>;
}

export default function StagesOfLabourLab() {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(4);
  const [playing, setPlaying] = useState(true);
  const [selectedPart, setSelectedPart] = useState(null);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState(null);
  const controls = useRef();
  const current = stageDetails[stage];
  const practice = practiceCases[practiceIndex];
  const dilation = Math.round(clamp(progress / 38, 0, 1) * 10);

  React.useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => setProgress((value) => Math.min(100, value + 1)), 360);
    return () => window.clearInterval(timer);
  }, [playing]);

  React.useEffect(() => {
    setStage(progress < 40 ? 0 : progress < 69 ? 1 : 2);
    if (progress >= 100) setPlaying(false);
  }, [progress]);

  const chooseStage = (index) => {
    setPlaying(false);
    setStage(index);
    setProgress(index === 0 ? 8 : index === 1 ? 48 : 82);
  };

  return <main className="labour-lab">
    <header className="labour-header"><div><p className="labour-eyebrow">OBSTETRICS · INTERACTIVE CLINICAL LEARNING</p><h1>Stages of Labour</h1><p className="labour-subtitle">Explore cervical change, fetal descent and placental birth in a guided 3D simulation.</p></div>
      <div className="labour-stage-chip"><span>STAGE {stage + 1} OF 3</span><b>{current.name}</b></div>
    </header>
    <section className="labour-main-grid">
      <article className="labour-model-card">
        <div className="labour-card-head"><div><p className="labour-eyebrow">SAGITTAL CUTAWAY · SCHEMATIC</p><h2>{current.short}</h2></div><span className="labour-live-tag"><i /> 3D SIMULATION</span></div>
        <div className="labour-canvas-wrap"><Canvas camera={{ position: [0, 0.05, 6.5], fov: 42 }} dpr={[1, 1.5]} shadows>
          <color attach="background" args={["#091725"]} /><fog attach="fog" args={["#091725", 7, 13]} />
          <ClinicalLighting floor={-2.0} tint="#f2a3c3" />
          <LabourModel progress={progress} stage={stage} playing={playing} selectedPart={selectedPart} onSelect={setSelectedPart} />
          <OrbitControls ref={controls} enablePan={false} minDistance={3.7} maxDistance={8} autoRotate={playing} autoRotateSpeed={0.27} minPolarAngle={0.5} maxPolarAngle={2.6} />
        </Canvas>
          <div className="labour-model-actions"><button onClick={() => setPlaying((value) => !value)}>{playing ? <Pause size={14} /> : <Play size={14} />}{playing ? "Pause" : "Play progression"}</button><button onClick={() => controls.current?.reset()}><RotateCcw size={14} /> Reset view</button></div>
          <span className="labour-model-note">Educational illustration · not to scale</span>
        </div>
        <div className="clinical-color-key" aria-label="Labour model color key"><span><i style={{ background: "#a94e70" }} /> Uterus</span><span><i style={{ background: "#e99aac" }} /> Cervix</span><span><i style={{ background: "#a6a89d" }} /> Pelvis</span><span><i style={{ background: "#d99d88" }} /> Fetus</span><span><i style={{ background: "#813f59" }} /> Placenta</span></div>
        <div className="labour-dilation-meter"><div><span>CERVICAL DILATATION</span><b>{dilation} cm <small>/ 10 cm</small></b></div><div className="labour-dilation-track"><i style={{ width: `${dilation * 10}%` }} /></div><small>Full dilatation is 10 cm; timing and progress vary.</small></div>
      </article>
      <aside className="labour-detail-card" style={{ "--stage-color": current.color }}>
        <p className="labour-eyebrow">STAGE {stage + 1} · {current.interval.toUpperCase()}</p><h2>{current.name}</h2><p className="labour-detail-summary">{current.summary}</p>
        <div className="labour-points"><b>Care and learning points</b>{current.points.map((point) => <div key={point}><i /><span>{point}</span></div>)}</div>
        <div className="labour-respect-note"><HeartPulse size={15} /><p>Respectful care, informed consent, privacy, clear communication and the birthing person's choices apply throughout labour.</p></div>
      </aside>
    </section>
    <section className="labour-progress-card">
        <div className="labour-progress-head"><div><p className="labour-eyebrow">4D TIME SCRUBBER</p><h2>Explore the simulation timeline</h2></div><span>{Math.round(progress)}% · animated model state</span></div>
      <p className="labour-timeline-help">Drag the timeline to move between cervical change, descent and placental birth. Play advances the teaching scenario; it does not represent real clinical timing.</p>
      <input aria-label="4D labour simulation timeline" type="range" min="0" max="100" value={progress} onChange={(event) => { const value = Number(event.target.value); setProgress(value); setStage(value < 40 ? 0 : value < 69 ? 1 : 2); setPlaying(false); }} style={{ "--labour-progress": `${progress}%` }} />
      <div className="labour-stage-selectors">{stageDetails.map((item, index) => { const Icon = item.icon; return <button key={item.name} className={stage === index ? "active" : ""} style={{ "--stage-color": item.color }} onClick={() => chooseStage(index)}><span><Icon size={15} /> STAGE 0{index + 1}</span><b>{item.name}</b><small>{item.interval}</small></button>; })}</div>
    </section>
    <section className="labour-practice-card">
      <div className="labour-practice-heading"><div><p className="labour-eyebrow">SUPERVISED SKILLS PRACTICE</p><h2>Make a care decision</h2><p>Use the simulated handover to practise respectful assessment and clinical reasoning.</p></div><span>CASE {practiceIndex + 1} / {practiceCases.length}</span></div>
      <div className="labour-case-tabs">{practiceCases.map((item, index) => <button key={item.title} className={practiceIndex === index ? "active" : ""} onClick={() => { setPracticeIndex(index); setPracticeAnswer(null); }}>{item.title}</button>)}</div>
      <div className="labour-case-scene"><b>{practice.title}</b><p>{practice.scene}</p><button onClick={() => { setProgress(practice.progress); setStage(0); setPlaying(false); }}>Show this moment on the 4D model</button></div>
      <div className="labour-case-options">{practice.options.map((option, index) => <button key={option} className={practiceAnswer === index ? (index === practice.answer ? "correct" : "incorrect") : ""} onClick={() => setPracticeAnswer(index)} aria-pressed={practiceAnswer === index}>{option}{practiceAnswer === index && <span>{index === practice.answer ? "✓" : "×"}</span>}</button>)}</div>
      {practiceAnswer !== null && <p className={`labour-case-feedback ${practiceAnswer === practice.answer ? "correct" : ""}`} role="status">{practiceAnswer === practice.answer ? "Good clinical reasoning. " : "Review the care priorities. "}{practice.rationale}</p>}
      <p className="labour-practice-disclaimer">Training scenario only. Use faculty supervision, current local protocols and the birthing person's informed preferences in real care. <a href="https://www.who.int/publications/i/item/9789240017566" target="_blank" rel="noreferrer">WHO Labour Care Guide</a></p>
    </section>
    <section className="labour-quick-grid">
      <article><b>First stage</b><p>Latent first stage has variable cervical change up to 5 cm. Active first stage is from 5 cm to full dilatation. No single latent-phase duration applies to everyone.</p></article>
      <article><b>Second stage</b><p>Full dilatation to birth. The fetus descends and rotates through the pelvis; support and monitoring are individualized to the clinical situation.</p></article>
      <article><b>Third stage</b><p>Birth of the baby to delivery of the placenta and membranes. Preventing, observing for and promptly treating postpartum haemorrhage is essential.</p></article>
    </section>
    <section className="labour-escalation"><div><span>SAFETY AND ESCALATION</span><h2>Recognize concerns promptly</h2><p>Urgent assessment is needed for heavy bleeding, maternal collapse or seizure, cord prolapse, concerning fetal heart findings, or other sudden deterioration. Follow local emergency protocols and call the appropriate obstetric/neonatal team.</p></div><CircleHelp size={21} /></section>
    <footer className="labour-footer">This is a simplified teaching simulation, not a delivery guide or clinical decision tool. Labour duration, fetal position and care pathways vary. Use current local protocols and supervision. <a href="https://www.who.int/publications/i/item/9789241550215" target="_blank" rel="noreferrer">WHO intrapartum care recommendations</a> · <a href="https://iris.who.int/bitstream/handle/10665/337693/9789240017566-eng.pdf?sequence=1" target="_blank" rel="noreferrer">WHO Labour Care Guide</a> · <a href="https://www.who.int/publications/i/item/9789240115637" target="_blank" rel="noreferrer">WHO postpartum-haemorrhage guideline</a></footer>
  </main>;
}
