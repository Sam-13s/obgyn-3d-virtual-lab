import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { Activity, HeartPulse, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import * as THREE from "three";
import ModelLabel from "./components/ModelLabel.jsx";
import ClinicalLighting from "./components/ClinicalLighting.jsx";
import "./PregnancyLab.css";

const milestones = {
  4: ["Implantation and early embryo", "The embryo implants in the endometrium. Early placental tissues develop and the neural plate begins forming.", "A missed period may occur. Symptoms vary; some people notice very little."],
  8: ["Embryonic development", "The brain, spinal cord, heart, limb buds and early organ structures develop rapidly. This is a key period of organogenesis.", "Fatigue, nausea, breast tenderness and frequent urination may occur."],
  12: ["End of first trimester", "Fingers and toes are distinct. Major organ systems have formed in early form and continue to mature. The placenta increasingly supports exchange.", "Some early pregnancy symptoms may improve, but this varies."],
  16: ["Early second trimester", "The skeleton continues to ossify, facial features become clearer and coordinated fetal movements increase.", "The abdomen may become more noticeable; some people feel more energetic."],
  20: ["Mid-pregnancy", "Lanugo and vernix develop. Hearing structures mature and fetal movements may become more noticeable. A detailed fetal anatomy scan is commonly offered around this stage, depending on local care pathways.", "Quickening may be felt. Backache and stretching sensations can occur."],
  24: ["Lung and sensory development", "The lungs continue developing and early surfactant production begins. The brain and sensory systems develop rapidly; the lungs remain immature.", "Fetal movement patterns may become more familiar."],
  28: ["Third trimester", "The fetus gains fat, the eyes can open and the brain continues maturing. Lung and nervous-system development continue.", "Antenatal follow-up may become more frequent. Reduced fetal movement needs prompt assessment."],
  32: ["Rapid growth", "The fetus continues gaining weight. Bones are formed but remain relatively soft, and the lungs continue maturing. Many fetuses move toward a head-down position.", "Reflux, breathlessness, pelvic pressure and sleep difficulty may occur."],
  36: ["Late pregnancy", "Fat stores increase and organ systems continue preparing for life outside the uterus. Large movements may feel different, but movements should still be felt.", "Pelvic pressure and practice contractions may occur."],
  40: ["Estimated due date", "The fetus is generally well developed for birth. The due date is an estimate; birth may occur before or after it.", "Follow maternity-team guidance about labour signs, bleeding or rupture of membranes."]
};

const stages = Object.keys(milestones).map(Number);
const trimesterFor = (week) => week <= 13 ? "First trimester" : week <= 27 ? "Second trimester" : "Third trimester";
const milestoneFor = (week) => stages.filter((stage) => stage <= week).at(-1) ?? 4;

function Fetus({ week, animate, highlighted }) {
  const root = useRef();
  const heart = useRef();
  const growthStages = [[4, 0.09], [8, 0.15], [12, 0.25], [20, 0.44], [28, 0.64], [40, 0.9]];
  const upperStage = growthStages.findIndex(([stage]) => stage >= week);
  const lower = growthStages[Math.max(0, upperStage - 1)];
  const upper = growthStages[Math.max(0, upperStage)];
  const growth = THREE.MathUtils.lerp(lower[1], upper[1], (week - lower[0]) / Math.max(1, upper[0] - lower[0]));
  const skin = "#d89b83";

  useFrame(({ clock }) => {
    if (!root.current) return;
    const t = clock.elapsedTime;
    root.current.position.y = -0.04 + (animate ? Math.sin(t * 1.25) * 0.035 : 0);
    root.current.rotation.z = (week >= 32 ? Math.PI : -0.2) + (animate ? Math.sin(t * 0.55) * 0.045 : 0);
    root.current.rotation.y = 0;
    if (heart.current) {
      const beat = animate ? Math.pow(Math.max(0, Math.sin(t * 4.8)), 12) : 0;
      heart.current.scale.setScalar(1 + beat * 0.22);
      heart.current.material.emissiveIntensity = 0.25 + beat * 1.8;
    }
  });

  return <group ref={root} scale={growth} position={[0.08, -0.04, 0.43]} rotation={[0, 0.1, -0.2]}>
    <pointLight position={[0, 0, 0.65]} color="#72f1f5" intensity={highlighted ? 1.8 : 0} distance={1.6} />
    <mesh position={[0.02, -0.12, 0]} rotation={[0, 0, -0.58]} scale={[0.83, 1, 0.76]} castShadow>
      <sphereGeometry args={[0.48, 48, 36]} /><meshStandardMaterial color={skin} roughness={0.76} />
    </mesh>
    <mesh position={[0.28, 0.34, 0.02]} scale={week < 10 ? [1.22, 1.18, 1.05] : [1, 1.02, 0.91]} castShadow>
      <sphereGeometry args={[0.3, 48, 36]} /><meshStandardMaterial color={skin} roughness={0.76} />
    </mesh>
    <mesh position={[0.53, 0.31, 0.05]}><sphereGeometry args={[0.052, 24, 16]} /><meshStandardMaterial color="#bd7868" /></mesh>
    {week >= 9 && <mesh position={[0.36, 0.41, 0.275]}><sphereGeometry args={[0.027, 20, 16]} /><meshStandardMaterial color="#573b39" /></mesh>}
    <mesh position={[0.14, 0.35, -0.015]} rotation={[0, 0, -0.3]} scale={[0.1, 0.14, 0.09]}><sphereGeometry args={[1, 24, 20]} /><meshStandardMaterial color="#c98275" roughness={0.82} /></mesh>
    {/* Flexed upper and lower limbs; joints stay connected as the model grows. */}
    {[
      { a: [0.16, 0.02, 0.23], b: [0.33, -0.1, 0.28], r: 0.075 },
      { a: [0.33, -0.1, 0.28], b: [0.24, -0.25, 0.31], r: 0.06 },
      { a: [-0.12, 0.02, 0.2], b: [-0.3, -0.1, 0.24], r: 0.075 },
      { a: [-0.3, -0.1, 0.24], b: [-0.2, -0.24, 0.28], r: 0.06 },
      { a: [0.08, -0.4, 0.18], b: [0.24, -0.55, 0.22], r: 0.12 },
      { a: [0.24, -0.55, 0.22], b: [0.08, -0.67, 0.27], r: 0.085 },
      { a: [-0.18, -0.38, 0.16], b: [-0.36, -0.5, 0.2], r: 0.12 },
      { a: [-0.36, -0.5, 0.2], b: [-0.22, -0.64, 0.25], r: 0.085 }
    ].filter(() => week >= 10).map(({ a, b, r }, index) => {
      const start = new THREE.Vector3(...a);
      const end = new THREE.Vector3(...b);
      const direction = new THREE.Vector3().subVectors(end, start);
      return <mesh key={index} position={start.clone().add(end).multiplyScalar(0.5).toArray()} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize())} castShadow>
        <capsuleGeometry args={[r, direction.length(), 8, 14]} /><meshStandardMaterial color={skin} roughness={0.76} />
      </mesh>;
    })}
    <mesh ref={heart} position={[0.12, 0.01, 0.34]}>
      <sphereGeometry args={[0.052, 24, 20]} /><meshStandardMaterial color="#ff718d" emissive="#f52f65" emissiveIntensity={0.25} />
    </mesh>
  </group>;
}

function Model({ week, animate, selectedPart, onSelect }) {
  const wall = useRef();
  const cordCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.08, -0.1, 0.62), new THREE.Vector3(0.28, -0.02, 0.72),
    new THREE.Vector3(0.34, 0.2, 0.55), new THREE.Vector3(0.02, 0.43, 0.15),
    new THREE.Vector3(-0.42, 0.55, -0.18), new THREE.Vector3(-0.68, 0.58, -0.24)
  ]), []);
  useFrame(({ clock }) => {
    if (wall.current) wall.current.scale.y = 1.52 + (animate ? Math.sin(clock.elapsedTime * 0.55) * 0.012 : 0);
  });

  return <group>
    {/* Posterior uterine wall is shown as a cutaway so it cannot hide the fetus. */}
    <mesh ref={wall} scale={[1.16, 1.5, 0.72]} castShadow><sphereGeometry args={[1, 64, 48, Math.PI, Math.PI]} /><meshStandardMaterial color={selectedPart === "wall" ? "#da829e" : "#a94e70"} emissive={selectedPart === "wall" ? "#9f275d" : "#000000"} emissiveIntensity={selectedPart === "wall" ? 0.65 : 0} roughness={0.78} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, -0.02, -0.01]} scale={[0.98, 1.32, 0.62]}><sphereGeometry args={[1, 64, 48, Math.PI, Math.PI]} /><meshStandardMaterial color="#f2a6c5" transparent opacity={0.8} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, -0.04, 0.22]} scale={[0.88, 1.21, 0.53]}>
      <sphereGeometry args={[1, 40, 30]} /><meshStandardMaterial color={selectedPart === "fluid" ? "#c2fcff" : "#79cfe1"} emissive={selectedPart === "fluid" ? "#36cce5" : "#000000"} emissiveIntensity={selectedPart === "fluid" ? 0.75 : 0} transparent opacity={selectedPart === "fluid" ? 0.42 : 0.18} roughness={0.2} />
    </mesh>
    <mesh position={[-0.63, 0.52, -0.27]} rotation={[0.05, -0.22, -0.25]} scale={[0.47, 0.62, 0.12]} castShadow><sphereGeometry args={[1, 40, 28]} /><meshStandardMaterial color={selectedPart === "placenta" ? "#ee819e" : "#8d3f59"} emissive={selectedPart === "placenta" ? "#ba2858" : "#000000"} emissiveIntensity={selectedPart === "placenta" ? 0.7 : 0} roughness={0.9} /></mesh>
    <Fetus week={week} animate={animate} highlighted={selectedPart === "fetus"} />
    <mesh>
      <tubeGeometry args={[cordCurve, 48, 0.035, 10, false]} /><meshStandardMaterial color="#e5b45e" roughness={0.4} />
    </mesh>
    <mesh position={[0, -1.38, 0.02]} scale={[0.34, 0.48, 0.32]}>
      <cylinderGeometry args={[0.55, 0.42, 1, 32]} /><meshStandardMaterial color={selectedPart === "cervix" ? "#f091aa" : "#9b4968"} emissive={selectedPart === "cervix" ? "#a5285a" : "#000000"} emissiveIntensity={selectedPart === "cervix" ? 0.55 : 0} />
    </mesh>
    <mesh position={[0, -1.88, 0.02]} scale={[0.24, 0.54, 0.25]}>
      <cylinderGeometry args={[0.55, 0.48, 1, 32]} /><meshStandardMaterial color={selectedPart === "cervix" ? "#f091aa" : "#bd718d"} emissive={selectedPart === "cervix" ? "#a5285a" : "#000000"} emissiveIntensity={selectedPart === "cervix" ? 0.55 : 0} />
    </mesh>
    <Sparkles count={animate ? 34 : 12} scale={[1.8, 2.5, 1.25]} size={2.2} speed={animate ? 0.35 : 0.08} opacity={0.42} color="#9be6ed" />
    <ModelLabel className="preg-label" part="placenta" selected={selectedPart} onSelect={onSelect} position={[-1.92, 1.35, 0.35]} target={[-0.62, 0.46, 0.28]}>Placenta</ModelLabel>
    <ModelLabel className="preg-label" part="fluid" selected={selectedPart} onSelect={onSelect} position={[1.88, 0.9, 0.35]} target={[0.05, 0.12, 0.55]}>Amniotic fluid</ModelLabel>
    <ModelLabel className="preg-label" part="fetus" selected={selectedPart} onSelect={onSelect} position={[1.92, 0.02, 0.38]} target={[0.34, -0.08, 0.62]}>Fetus</ModelLabel>
    <ModelLabel className="preg-label" part="wall" selected={selectedPart} onSelect={onSelect} position={[1.86, -0.86, 0.28]} target={[0.76, -0.42, 0.12]}>Uterine wall</ModelLabel>
    <ModelLabel className="preg-label" part="cervix" selected={selectedPart} onSelect={onSelect} position={[1.45, -1.63, 0.25]} target={[0, -1.42, 0.18]}>Cervix</ModelLabel>
  </group>;
}

const learningTabs = [
  { id: "fetal", label: "Fetal development", heading: "Fetal development", copy: (milestone) => milestone[1], icon: Activity },
  { id: "maternal", label: "Maternal changes", heading: "Changes you may notice", copy: (milestone) => milestone[2], icon: HeartPulse },
  { id: "nursing", label: "Nursing points", heading: "Antenatal care focus", copy: () => "Check gestational age and the person's concerns. Review antenatal attendance, relevant screening and observations with the maternity team. Encourage questions and explain each examination before it happens.", icon: Volume2 }
];

export default function PregnancyLab() {
  const [week, setWeek] = useState(20);
  const [tab, setTab] = useState("fetal");
  const [animate, setAnimate] = useState(true);
  const [selectedPart, setSelectedPart] = useState(null);
  const controls = useRef();
  const key = milestoneFor(week);
  const info = milestones[key];
  const activeTab = learningTabs.find((item) => item.id === tab) ?? learningTabs[0];
  const changeWeek = (next) => setWeek(Math.min(40, Math.max(4, next)));

  return <main className="pregnancy-lab">
    <header className="preg-header">
      <div><p className="preg-eyebrow">OBSTETRICS · INTERACTIVE LEARNING</p><h1>Pregnancy & Fetal Development</h1>
        <p className="preg-subtitle">Explore the uterus, fetal environment and developmental milestones from early pregnancy to term.</p></div>
      <div className="preg-week-chip"><b>Week {week}</b><span>{trimesterFor(week)}</span></div>
    </header>
    <section className="preg-main-grid">
      <div className="preg-model-card">
        <div className="preg-card-heading"><div><h2>3D maternal–fetal model</h2><p>Drag to rotate · Scroll to zoom</p></div>
          <span className="preg-model-tag"><i /> 4D GESTATIONAL MODEL</span></div>
        <div className="preg-canvas-wrap"><Canvas camera={{ position: [0, 0.15, 6.4], fov: 42 }} dpr={[1, 1.5]} shadows>
          <color attach="background" args={["#091827"]} /><fog attach="fog" args={["#091827", 7, 13]} />
          <ClinicalLighting floor={-1.9} tint="#f2a3c3" />
          <Model week={week} animate={animate} selectedPart={selectedPart} onSelect={setSelectedPart} />
          <OrbitControls ref={controls} enablePan={false} minDistance={3.4} maxDistance={8} minPolarAngle={0.55} maxPolarAngle={2.55} autoRotate={animate} autoRotateSpeed={0.45} />
        </Canvas>
          <span className="preg-canvas-note">Illustrative anatomy · not to scale</span>
          <div className="preg-model-controls">
            <button onClick={() => setAnimate((current) => !current)} aria-label={animate ? "Pause animation" : "Play animation"} title={animate ? "Pause animation" : "Play animation"}>{animate ? <Pause size={15} /> : <Play size={15} />}{animate ? "Pause" : "Play"}</button>
            <button onClick={() => controls.current?.reset()} aria-label="Reset 3D view" title="Reset view"><RotateCcw size={15} /> Reset view</button>
          </div>
        </div>
        <div className="preg-legend"><span><i className="legend-wall" /> Uterine wall</span><span><i style={{ background: "#f2a6c5" }} /> Endometrium</span><span><i className="legend-fluid" /> Amniotic fluid</span><span><i style={{ background: "#d99d88" }} /> Fetus</span><span><i className="legend-placenta" /> Placenta</span><span><i className="legend-cord" /> Umbilical cord</span></div>
      </div>
      <aside className="preg-info-card">
        <div className="preg-tabs" role="tablist" aria-label="Pregnancy learning topics">
          {learningTabs.map(({ id, label }) => <button role="tab" aria-selected={tab === id} key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}
        </div>
        <p className="preg-eyebrow">WEEK {week} · {info[0].toUpperCase()}</p>
        <h2>{activeTab.heading}</h2>
        <p className="preg-info-copy" key={`${tab}-${key}`}>{activeTab.copy(info)}</p>
        <div className="preg-stage-meter"><span>Trimester progress</span><b>{week <= 13 ? `${Math.round(week / 13 * 100)}%` : week <= 27 ? `${Math.round((week - 13) / 14 * 100)}%` : `${Math.round((week - 27) / 13 * 100)}%`}</b>
          <div><i style={{ width: `${week <= 13 ? week / 13 * 100 : week <= 27 ? (week - 13) / 14 * 100 : (week - 27) / 13 * 100}%` }} /></div></div>
        <div className="preg-clinical-note"><b>When to seek advice</b><p>Prompt maternity assessment is important for vaginal bleeding, severe abdominal pain, fluid leakage, severe headache or visual symptoms, or reduced fetal movements once a movement pattern is established.</p></div>
      </aside>
    </section>
    <section className="preg-timeline-card">
      <div className="preg-timeline-head"><div><p className="preg-eyebrow">INTERACTIVE TIMELINE</p><h2>Explore pregnancy by week</h2></div>
        <div className="preg-week-stepper"><button onClick={() => changeWeek(week - 1)} disabled={week === 4} aria-label="Previous week">−</button><b>Week {week} / 40</b><button onClick={() => changeWeek(week + 1)} disabled={week === 40} aria-label="Next week">+</button></div></div>
      <input aria-label="Select pregnancy week" type="range" min="4" max="40" value={week} onChange={(event) => changeWeek(Number(event.target.value))} style={{ "--week-progress": `${(week - 4) / 36 * 100}%` }} />
      <div className="preg-range-labels"><span>Week 4</span><span>Week 13</span><span>Week 27</span><span>Week 40</span></div>
      <div className="preg-milestone-row" aria-label="Development milestones">{stages.map((stage) => <button key={stage} className={key === stage ? "current" : week > stage ? "passed" : ""} onClick={() => changeWeek(stage)} title={milestones[stage][0]}><i /><span>W{stage}</span></button>)}</div>
      <div className="preg-trimester-grid">
        <button className={week <= 13 ? "selected" : ""} onClick={() => changeWeek(12)}><b>01 · First trimester</b><small>Weeks 1–13 — implantation and organogenesis</small></button>
        <button className={week >= 14 && week <= 27 ? "selected" : ""} onClick={() => changeWeek(20)}><b>02 · Second trimester</b><small>Weeks 14–27 — growth and movement</small></button>
        <button className={week >= 28 ? "selected" : ""} onClick={() => changeWeek(32)}><b>03 · Third trimester</b><small>Weeks 28–40 — maturation and preparation for birth</small></button>
      </div>
    </section>
    <section className="preg-structure-grid">
      <article><b>01 · Placenta</b><p>Temporary fetomaternal organ supporting oxygen, nutrient and waste exchange. It also produces hormones that help maintain pregnancy.</p></article>
      <article><b>02 · Umbilical cord</b><p>Usually contains two umbilical arteries and one umbilical vein within Wharton's jelly. It connects fetus and placenta.</p></article>
      <article><b>03 · Amniotic sac and fluid</b><p>The membranes surround the pregnancy. Amniotic fluid cushions the fetus, allows movement and supports development.</p></article>
      <article><b>04 · Uterus and cervix</b><p>The uterus expands during pregnancy. The cervix usually remains closed until changes associated with labour.</p></article>
    </section>
    <p className="preg-disclaimer">Educational illustration only. The model is schematic and not to scale; developmental milestones are approximate and do not replace clinical guidelines or antenatal assessment.</p>
  </main>;
}
