import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { Pause, Play, RotateCcw } from "lucide-react";
import * as THREE from "three";
import ModelLabel from "./components/ModelLabel.jsx";
import ClinicalLighting from "./components/ClinicalLighting.jsx";
import "./MenstrualCycleLab.css";

const phaseInfo = {
  menstrual: { title: "Menstrual phase", ovarian: "Early follicular phase", endometrial: "Menstrual phase", color: "#e98b9e", text: "Falling progesterone and oestradiol after corpus luteum regression trigger shedding of the functional endometrium. FSH begins recruiting a new group of ovarian follicles." },
  follicular: { title: "Follicular phase", ovarian: "Follicular phase", endometrial: "Proliferative phase", color: "#75c9db", text: "FSH supports follicle development. The developing dominant follicle produces increasing oestradiol, which rebuilds the endometrium. The length of this phase varies between cycles." },
  ovulation: { title: "Ovulation", ovarian: "Ovulation", endometrial: "Late proliferative phase", color: "#f3c779", text: "Sustained high oestradiol changes feedback and produces the LH surge. Ovulation usually follows about 36 hours after the surge; timing varies, and the cycle day is an estimate." },
  luteal: { title: "Luteal phase", ovarian: "Luteal phase", endometrial: "Secretory phase", color: "#b79af5", text: "The emptied follicle becomes the corpus luteum and produces progesterone. The endometrium becomes secretory. If pregnancy does not occur, the corpus luteum regresses and ovarian hormones fall." }
};

const phaseFor = (day, ovulationDay) => day <= 5 ? "menstrual" : day < ovulationDay ? "follicular" : day === ovulationDay ? "ovulation" : "luteal";
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

function Tube({ points, radius = 0.045, color = "#db8d9f", selected = false }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))), [points]);
  return <mesh><tubeGeometry args={[curve, 36, selected ? radius * 1.45 : radius, 10, false]} /><meshStandardMaterial color={selected ? "#8beaf0" : color} emissive={selected ? "#32bdcf" : "#000000"} emissiveIntensity={selected ? 0.65 : 0} roughness={0.48} /></mesh>;
}

function Follicles({ day, ovulationDay, playing, selectedPart, onSelect }) {
  const lead = useRef();
  const preOvulation = day < ovulationDay;
  const growth = THREE.MathUtils.lerp(0.18, 0.43, clamp((day - 1) / Math.max(1, ovulationDay - 1), 0, 1));
  useFrame(({ clock }) => {
    if (lead.current) lead.current.scale.setScalar(growth * (playing ? 1 + Math.sin(clock.elapsedTime * 2) * 0.025 : 1));
  });
  return <group position={[1.58, -0.05, 0.04]}>
    <mesh scale={[0.32, 0.42, 0.28]}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color={selectedPart === "ovary" ? "#ffe0a2" : "#d88f61"} emissive={selectedPart === "ovary" ? "#b8792f" : "#000000"} emissiveIntensity={selectedPart === "ovary" ? 0.45 : 0} roughness={0.68} /></mesh>
    {[[0.02, 0.11, 0.25, 0.1], [-0.13, -0.11, 0.22, 0.075], [0.13, -0.2, 0.2, 0.085], [-0.04, -0.28, 0.18, 0.06]].map(([x, y, z, size], index) => (
      <mesh key={index} position={[x, y, z]} scale={size}><sphereGeometry args={[1, 20, 16]} /><meshStandardMaterial color="#e6b8c9" roughness={0.42} emissive="#7e3e65" emissiveIntensity={0.12} /></mesh>
    ))}
    {preOvulation ? <mesh ref={lead} position={[-0.04, 0.02, 0.3]} scale={growth}>
      <sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color={selectedPart === "follicle" ? "#fff0a8" : "#f4c2a4"} roughness={0.34} emissive={selectedPart === "follicle" ? "#f6a82c" : "#d98267"} emissiveIntensity={selectedPart === "follicle" ? 1.1 : 0.2} />
    </mesh> : <group position={[-0.04, 0.02, 0.3]}>
      <mesh scale={[0.34, 0.3, 0.2]}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color={selectedPart === "follicle" ? "#fff0a8" : "#dca65f"} emissive={selectedPart === "follicle" ? "#f6a82c" : "#000000"} emissiveIntensity={selectedPart === "follicle" ? 0.9 : 0} roughness={0.7} /></mesh>
      {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 0.22, Math.sin(i * Math.PI / 3) * 0.17, 0.14]} scale={[0.09, 0.11, 0.045]}>
        <sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#f0c976" roughness={0.76} />
      </mesh>)}
    </group>}
  </group>;
}

function Oocyte({ day, ovulationDay, playing, selectedPart }) {
  const egg = useRef();
  const progress = clamp((day - ovulationDay + 0.5) / 2.5, 0, 1);
  useFrame(({ clock }) => {
    if (!egg.current) return;
    const t = playing ? clock.elapsedTime : 0;
    egg.current.position.x = THREE.MathUtils.lerp(1.48, 0.42, progress) + (playing ? Math.sin(t * 1.4) * 0.015 : 0);
    egg.current.position.y = THREE.MathUtils.lerp(-0.02, 0.02, progress) + (playing ? Math.sin(t * 1.8) * 0.02 : 0);
    egg.current.visible = Math.abs(day - ovulationDay) <= 2;
  });
  return <mesh ref={egg} position={[1.48, -0.02, 0.44]}>
    <sphereGeometry args={[selectedPart === "oocyte" ? 0.075 : 0.055, 24, 20]} /><meshStandardMaterial color="#fff2bd" emissive={selectedPart === "oocyte" ? "#ffffff" : "#f9ca76"} emissiveIntensity={selectedPart === "oocyte" ? 2 : 0.8} />
  </mesh>;
}

function CycleModel({ day, cycleLength, ovulationDay, playing, selectedPart, onSelect }) {
  const phase = phaseFor(day, ovulationDay);
  const thickness = THREE.MathUtils.lerp(0.12, 0.39, clamp((day - 1) / Math.max(1, cycleLength - 1), 0, 1));
  const wallRef = useRef();
  const fimbriaPositions = useMemo(() => [[1.34, 1.08, 0.02], [-1.34, 1.08, 0.02]], []);
  useFrame(({ clock }) => {
    if (wallRef.current && playing) wallRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.24) * 0.008;
  });

  const tubeL = [[-0.5, 0.85, 0], [-0.75, 1.12, 0], [-1.08, 1.2, 0], [-1.35, 1.08, 0.02]];
  const tubeR = tubeL.map(([x, y, z]) => [-x, y, z]);
  return <group>
    {/* Posterior wall cutaway exposes the endometrial cavity and functional lining. */}
    <mesh ref={wallRef} scale={[0.74, 1.05, 0.49]}><sphereGeometry args={[1, 56, 40, Math.PI, Math.PI]} /><meshStandardMaterial color={selectedPart === "wall" ? "#d783a5" : "#994b69"} emissive={selectedPart === "wall" ? "#a52763" : "#000000"} emissiveIntensity={selectedPart === "wall" ? 0.55 : 0} roughness={0.64} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, -0.02, 0.02]} scale={[0.62, 0.92, 0.4]}><sphereGeometry args={[1, 48, 32, Math.PI, Math.PI]} /><meshStandardMaterial color={phase === "menstrual" ? "#d98799" : "#df879e"} roughness={0.48} side={THREE.DoubleSide} /></mesh>
    {/* Functional endometrium thickens through the proliferative and secretory phases. */}
    <mesh position={[0, 0.03, 0.12]} scale={[0.52, 0.72 + thickness * 0.34, 0.28]}>
      <sphereGeometry args={[1, 48, 32, Math.PI, Math.PI]} /><meshStandardMaterial color={selectedPart === "endometrium" ? "#ffd1d8" : phase === "menstrual" ? "#9b4969" : phase === "luteal" ? "#db7691" : "#ed9bb0"} emissive={selectedPart === "endometrium" ? "#ff5185" : "#000000"} emissiveIntensity={selectedPart === "endometrium" ? 0.6 : 0} transparent opacity={selectedPart === "endometrium" ? 0.95 : 0.65} side={THREE.DoubleSide} />
    </mesh>
    {/* Cervix and vaginal canal */}
    <mesh position={[0, -0.94, 0]} scale={[0.19, 0.38, 0.2]}><cylinderGeometry args={[0.72, 0.55, 1, 32]} /><meshStandardMaterial color={selectedPart === "cervix" ? "#f09ab1" : "#a65370"} emissive={selectedPart === "cervix" ? "#a82f62" : "#000000"} emissiveIntensity={selectedPart === "cervix" ? 0.5 : 0} roughness={0.6} /></mesh>
    <mesh position={[0, -1.34, 0]} scale={[0.14, 0.5, 0.15]}><cylinderGeometry args={[0.55, 0.5, 1, 32]} /><meshStandardMaterial color={selectedPart === "cervix" ? "#e98aa6" : "#b86e85"} emissive={selectedPart === "cervix" ? "#a82f62" : "#000000"} emissiveIntensity={selectedPart === "cervix" ? 0.5 : 0} roughness={0.58} /></mesh>
    <Tube points={tubeL} selected={selectedPart === "tube"} /><Tube points={tubeR} selected={selectedPart === "tube"} />
    {/* Fimbriae at each tubal end */}
    {fimbriaPositions.map(([x, y, z], side) => <group key={side} position={[x, y, z]}>
      {Array.from({ length: 5 }, (_, index) => {
        const angle = (index / 4 - 0.5) * 1.5;
        const endX = x < 0 ? -0.23 - Math.cos(angle) * 0.16 : 0.23 + Math.cos(angle) * 0.16;
        return <Tube key={index} points={[[0, 0, 0], [endX * 0.5, Math.sin(angle) * 0.1, 0.015], [endX, Math.sin(angle) * 0.23, 0.025]]} radius={0.018} color="#e2a5b1" selected={selectedPart === "tube"} />;
      })}
    </group>)}
    <Follicles day={day} ovulationDay={ovulationDay} playing={playing} selectedPart={selectedPart} onSelect={onSelect} />
    <ModelLabel className="cycle-model-label" part="follicle" selected={selectedPart} onSelect={onSelect} position={[1.94, -0.55, 0.22]} target={[1.54, -0.03, 0.34]}>{day < ovulationDay ? "Growing follicle" : "Corpus luteum"}</ModelLabel>
    <group position={[-1.58, -0.05, 0.04]}>
      <mesh scale={[0.32, 0.42, 0.28]}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color={selectedPart === "ovary" ? "#ffe0a2" : "#d88f61"} emissive={selectedPart === "ovary" ? "#b8792f" : "#000000"} emissiveIntensity={selectedPart === "ovary" ? 0.45 : 0} roughness={0.68} /></mesh>
      {[[0, 0.1, 0.25, 0.1], [-0.13, -0.11, 0.22, 0.075], [0.13, -0.2, 0.2, 0.085], [-0.04, -0.28, 0.18, 0.06]].map(([x, y, z, size], index) => <mesh key={index} position={[x, y, z]} scale={size}><sphereGeometry args={[1, 20, 16]} /><meshStandardMaterial color="#e6b8c9" roughness={0.42} /></mesh>)}
    </group>
    <Oocyte day={day} ovulationDay={ovulationDay} playing={playing} selectedPart={selectedPart} />
    <Sparkles count={playing ? 22 : 8} scale={[3.4, 2.8, 1.5]} size={1.8} speed={playing ? 0.25 : 0.04} opacity={0.32} color="#86cdd7" />
    <ModelLabel className="cycle-model-label" part="wall" selected={selectedPart} onSelect={onSelect} position={[-1.92, 1.67, 0.25]} target={[-0.48, 0.66, 0.15]}>Uterine wall</ModelLabel>
    <ModelLabel className="cycle-model-label" part="endometrium" selected={selectedPart} onSelect={onSelect} position={[1.92, 0.84, 0.3]} target={[0.35, 0.18, 0.32]}>Endometrium</ModelLabel>
    <ModelLabel className="cycle-model-label" part="cervix" selected={selectedPart} onSelect={onSelect} position={[1.78, -1.22, 0.3]} target={[0, -0.96, 0.15]}>Cervix</ModelLabel>
    <ModelLabel className="cycle-model-label" part="ovary" selected={selectedPart} onSelect={onSelect} position={[-1.9, -0.58, 0.3]} target={[1.58, -0.05, 0.3]}>Ovary</ModelLabel>
    <ModelLabel className="cycle-model-label" part="tube" selected={selectedPart} onSelect={onSelect} position={[1.86, 1.55, 0.16]} target={[1.02, 1.12, 0.04]}>Fallopian tube</ModelLabel>
    <ModelLabel className="cycle-model-label" part="oocyte" selected={selectedPart} onSelect={onSelect} position={[0, -1.88, 0.32]} target={[0.7, 0.02, 0.45]}>Oocyte</ModelLabel>
    <pointLight position={[0, 0, 2]} color={phaseInfo[phase].color} intensity={0.8} distance={5} />
  </group>;
}

function hormoneValues(day, cycleLength) {
  const ovulation = cycleLength - 14;
  const x = day / cycleLength;
  const gauss = (center, width) => Math.exp(-Math.pow((day - center) / width, 2));
  return {
    "Oestradiol": 0.12 + 0.66 * gauss(ovulation - 1.6, cycleLength * 0.12) + 0.26 * gauss(ovulation + 7, cycleLength * 0.13),
    "Progesterone": 0.08 + (day > ovulation ? 0.78 * gauss(ovulation + 7, cycleLength * 0.16) : 0),
    "LH": 0.1 + 0.88 * gauss(ovulation, 1.15),
    "FSH": 0.28 + 0.17 * gauss(2, 3) + 0.42 * gauss(ovulation, 1.7)
  };
}

const hormoneColors = { "Oestradiol": "#6fd7e4", "Progesterone": "#bc9cff", "LH": "#f4c576", "FSH": "#ed8da7" };

function HormoneChart({ day, cycleLength }) {
  const width = 620;
  const height = 170;
  const chart = { left: 34, right: 608, top: 14, bottom: 140 };
  const xFor = (n) => chart.left + (n - 1) / (cycleLength - 1) * (chart.right - chart.left);
  const yFor = (value) => chart.bottom - clamp(value, 0, 1) * (chart.bottom - chart.top);
  const series = Object.keys(hormoneColors).map((name) => {
    const points = Array.from({ length: 96 }, (_, index) => {
      const x = 1 + index / 95 * (cycleLength - 1);
      return [xFor(x), yFor(hormoneValues(x, cycleLength)[name])];
    });
    return { name, path: points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") };
  });
  const cursorX = xFor(day);
  return <div className="cycle-chart-wrap">
    <svg className="cycle-hormone-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Illustrative relative ovarian hormone levels across a cycle">
      {[0, 0.5, 1].map((value) => <g key={value}><line x1={chart.left} x2={chart.right} y1={yFor(value)} y2={yFor(value)} className="cycle-gridline" /><text x="4" y={yFor(value) + 4} className="cycle-axis-label">{Math.round(value * 100)}</text></g>)}
      {[1, Math.round(cycleLength * 0.25), Math.round(cycleLength * 0.5), Math.round(cycleLength * 0.75), cycleLength].map((n) => <text key={n} x={xFor(n)} y="160" textAnchor="middle" className="cycle-axis-label">{n}</text>)}
      <line x1={xFor(cycleLength - 14)} x2={xFor(cycleLength - 14)} y1={chart.top} y2={chart.bottom} className="cycle-ovulation-line" />
      {series.map(({ name, path }) => <path key={name} d={path} className="cycle-hormone-line" style={{ "--hormone-color": hormoneColors[name] }} />)}
      <line x1={cursorX} x2={cursorX} y1={chart.top} y2={chart.bottom} className="cycle-day-line" />
      <circle cx={cursorX} cy={chart.bottom} r="4" className="cycle-day-dot" />
    </svg>
    <div className="cycle-chart-legend">{Object.entries(hormoneColors).map(([name, color]) => <span key={name}><i style={{ background: color }} />{name}</span>)}</div>
  </div>;
}

export default function MenstrualCycleLab() {
  const [cycleLength, setCycleLength] = useState(28);
  const [day, setDay] = useState(14);
  const [playing, setPlaying] = useState(true);
  const [selectedPart, setSelectedPart] = useState(null);
  const controls = useRef();
  const ovulationDay = Math.max(6, cycleLength - 14);
  const phase = phaseFor(day, ovulationDay);
  const info = phaseInfo[phase];
  const hormone = hormoneValues(day, cycleLength);

  React.useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => setDay((current) => current >= cycleLength ? 1 : current + 1), 1250);
    return () => window.clearInterval(timer);
  }, [playing, cycleLength]);

  return <main className="cycle-lab">
    <header className="cycle-header">
      <div><p className="cycle-eyebrow">REPRODUCTIVE PHYSIOLOGY · INTERACTIVE LAB</p><h1>The Menstrual Cycle</h1><p className="cycle-subtitle">Follow ovarian events, endometrial changes and hormone patterns through a cycle.</p></div>
      <div className="cycle-day-chip"><span>DAY</span><b>{day}</b><small>of {cycleLength}</small></div>
    </header>
    <section className="cycle-top-grid">
      <article className="cycle-model-card">
        <div className="cycle-card-head"><div><p className="cycle-eyebrow">OVARY + UTERUS · CYCLE DAY {day}</p><h2>{info.title}</h2></div><span className="cycle-live-tag"><i /> 4D CYCLE MODEL</span></div>
        <div className="cycle-canvas"><Canvas camera={{ position: [0, 0.1, 6.4], fov: 42 }} dpr={[1, 1.5]} shadows>
          <color attach="background" args={["#091725"]} /><fog attach="fog" args={["#091725", 7, 13]} />
          <ClinicalLighting floor={-1.9} tint="#d98da9" />
          <CycleModel day={day} cycleLength={cycleLength} ovulationDay={ovulationDay} playing={playing} selectedPart={selectedPart} onSelect={setSelectedPart} />
          <OrbitControls ref={controls} enablePan={false} minDistance={3.6} maxDistance={8} autoRotate={playing} autoRotateSpeed={0.32} minPolarAngle={0.55} maxPolarAngle={2.55} />
        </Canvas>
          <div className="cycle-model-actions"><button onClick={() => setPlaying((state) => !state)}>{playing ? <Pause size={14} /> : <Play size={14} />}{playing ? "Pause cycle" : "Play cycle"}</button><button onClick={() => controls.current?.reset()}><RotateCcw size={14} /> Reset view</button></div>
          <span className="cycle-schematic-note">Schematic anatomy · not to scale</span>
        </div>
        <div className="cycle-model-footer"><span><i className="key-wall" /> Uterine wall</span><span><i style={{ background: "#ed879f" }} /> Endometrium</span><span><i style={{ background: "#d88f61" }} /> Ovary</span><span><i className="key-follicle" /> Follicle</span><span><i className="key-egg" /> Oocyte</span></div>
      </article>
      <aside className="cycle-phase-card" style={{ "--phase-color": info.color }}>
        <p className="cycle-eyebrow">CYCLE DAY {day} · {info.title.toUpperCase()}</p>
        <h2>{info.title}</h2><p className="cycle-phase-copy">{info.text}</p>
        <div className="cycle-phase-pair"><div><span>OVARIAN PHASE</span><b>{info.ovarian}</b></div><div><span>ENDOMETRIAL PHASE</span><b>{info.endometrial}</b></div></div>
        <div className="cycle-hormone-readout"><span>Relative hormone activity</span>{Object.entries(hormone).map(([name, value]) => <div key={name}><i style={{ background: hormoneColors[name] }} /><span>{name}</span><b>{Math.round(clamp(value, 0, 1) * 100)}%</b><div className="cycle-mini-track"><i style={{ width: `${clamp(value, 0, 1) * 100}%`, background: hormoneColors[name] }} /></div></div>)}</div>
      </aside>
    </section>
    <section className="cycle-timeline-card">
      <div className="cycle-timeline-head"><div><p className="cycle-eyebrow">CYCLE EXPLORER</p><h2>Move through the cycle</h2></div><label>Example cycle length <select value={cycleLength} onChange={(event) => { const next = Number(event.target.value); setCycleLength(next); setDay(Math.min(day, next)); }}><option value="21">21 days</option><option value="24">24 days</option><option value="28">28 days</option><option value="30">30 days</option><option value="35">35 days</option></select></label></div>
      <div className="cycle-range-row"><span>Day {day}</span><input aria-label="Select menstrual cycle day" type="range" min="1" max={cycleLength} value={day} onChange={(event) => { setPlaying(false); setDay(Number(event.target.value)); }} style={{ "--cycle-progress": `${(day - 1) / (cycleLength - 1) * 100}%` }} /><span>Day {cycleLength}</span></div>
      <div className="cycle-phase-band"><span style={{ flex: 5, "--band-color": phaseInfo.menstrual.color }}>MENSTRUAL · 1–5</span><span style={{ flex: Math.max(1, ovulationDay - 6), "--band-color": phaseInfo.follicular.color }}>FOLLICULAR</span><span style={{ flex: 1, "--band-color": phaseInfo.ovulation.color }}>OVULATION</span><span style={{ flex: cycleLength - ovulationDay, "--band-color": phaseInfo.luteal.color }}>LUTEAL</span></div>
      <div className="cycle-timeline-foot"><span>Ovarian and uterine events are linked to the selected day.</span><b>Ovulation estimate · Day {ovulationDay}</b></div>
    </section>
    <section className="cycle-chart-card">
      <div className="cycle-chart-head"><div><p className="cycle-eyebrow">HORMONE PATTERNS</p><h2>Relative hormone levels</h2></div><span>Illustrative · not laboratory values</span></div>
      <HormoneChart day={day} cycleLength={cycleLength} />
    </section>
    <section className="cycle-phase-grid">
      {Object.entries(phaseInfo).map(([id, phaseData], index) => <button key={id} className={phase === id ? "selected" : ""} style={{ "--phase-color": phaseData.color }} onClick={() => { const dayForPhase = id === "menstrual" ? 3 : id === "follicular" ? Math.max(6, Math.floor(ovulationDay / 2)) : id === "ovulation" ? ovulationDay : Math.min(cycleLength, ovulationDay + 6); setDay(dayForPhase); setPlaying(false); }}><span>0{index + 1}</span><b>{phaseData.title}</b><small>{phaseData.ovarian} · {phaseData.endometrial}</small></button>)}
    </section>
    <aside className="cycle-accuracy-note"><b>Cycle timing varies.</b> Day 14 is an example for a 28-day cycle. Ovulation generally occurs about 14 days before the next period, so changing cycle length moves the estimate. Hormone curves and organ dimensions are schematic, not diagnostic or to scale. <a href="https://www.ncbi.nlm.nih.gov/books/NBK537132/" target="_blank" rel="noreferrer">Physiology reference</a> · <a href="https://www.acog.org/womens-health/faqs/fertility-awareness-based-methods-of-family-planning" target="_blank" rel="noreferrer">ACOG cycle timing</a></aside>
  </main>;
}
