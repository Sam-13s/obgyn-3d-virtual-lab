import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { Activity, CalendarCheck, HeartPulse, Pause, Play, RotateCcw, Ruler, ShieldCheck } from "lucide-react";
import * as THREE from "three";
import ModelLabel from "./components/ModelLabel.jsx";
import ClinicalLighting from "./components/ClinicalLighting.jsx";
import "./AntenatalCareLab.css";

const contacts = [
  { week: 12, title: "First contact", stage: "Booking and baseline", focus: "Confirm gestational age and understand the person's health, pregnancy history, concerns and preferences. Agree on a care plan together.", checks: ["Medical, obstetric and medication history; mental health and social needs", "Blood pressure, weight and BMI; physical examination as indicated", "Routine blood tests and infection screening according to local policy", "Offer early ultrasound for dating; WHO recommends one scan before 24 weeks", "Discuss folic acid and iron, nutrition, medicines, vaccinations and how to access urgent help"] },
  { week: 20, title: "Second contact", stage: "Review and screening", focus: "Review wellbeing and initial results, check blood pressure, and discuss fetal development and screening choices.", checks: ["Review test results and respond to any findings", "Measure blood pressure and assess symptoms", "Offer an ultrasound before 24 weeks where available, including assessment of gestational age and fetal anatomy", "Discuss healthy eating, activity, supplements and questions"] },
  { week: 26, title: "Third contact", stage: "Maternal and fetal review", focus: "Continue maternal assessment and begin monitoring fetal growth and movement as appropriate to gestation and local pathways.", checks: ["Blood pressure; assess for pre-eclampsia symptoms and follow local screening protocol", "From 24 weeks, assess fetal growth, including fundal height where appropriate", "Ask about fetal movement and explain when to seek advice", "Review nutrition, medicines and immunization plan"] },
  { week: 30, title: "Fourth contact", stage: "Growth and wellbeing", focus: "Review maternal wellbeing, fetal growth and test results. Gestational diabetes screening is commonly offered around 24–28 weeks according to local guidance.", checks: ["Blood pressure and symptom review; urine testing if indicated by local protocol", "Assess fetal growth and movement", "Review gestational diabetes screening if due or not yet completed", "Discuss birth preferences and where to seek care"] },
  { week: 34, title: "Fifth contact", stage: "Birth preparation", focus: "Review maternal and fetal wellbeing and develop a practical birth and emergency plan with the pregnant person.", checks: ["Blood pressure, symptoms, fetal growth and movement", "Confirm place of birth, transport, support person and emergency contact plan", "Discuss signs of labour and when to contact the maternity service", "Offer feeding and postpartum planning information"] },
  { week: 36, title: "Sixth contact", stage: "Late pregnancy review", focus: "Assess wellbeing and fetal presentation. If the fetus is not head-down, discuss appropriate options and local referral pathways.", checks: ["Blood pressure and review of warning symptoms", "Assess fetal growth, movements and presentation", "Review birth preparedness, transport and support", "Discuss local newborn, feeding and postpartum care options"] },
  { week: 38, title: "Seventh contact", stage: "Term planning", focus: "Revisit the birth plan and address any new concerns. Explain the plan if pregnancy continues beyond the estimated due date.", checks: ["Maternal symptoms, blood pressure and fetal movements", "Review birth plan and access to maternity services", "Discuss local guidance for pregnancy continuing beyond term", "Answer questions and reinforce urgent contact routes"] },
  { week: 40, title: "Eighth contact", stage: "Due-date review", focus: "The estimated due date is not an exact prediction. Review maternal and fetal wellbeing and agree on next steps using local post-term guidance.", checks: ["Assess maternal wellbeing and fetal movements", "Review the individualized plan and timing of further assessment", "Explain how to contact the maternity team at any time if concerns arise", "Continue care according to local post-term guidance"] }
];

const focused = {
  growth: { label: "Fundal height", icon: Ruler, note: "From 24 weeks, fetal growth may be assessed by measuring symphysis–fundal height. Interpret the trend with gestational age and local guidance; this is a screening measure, not a diagnosis." },
  lie: { label: "Fetal lie", icon: Activity, note: "Abdominal palpation can help assess fetal lie and presentation later in pregnancy. If the presentation is uncertain or breech is suspected, follow local assessment and ultrasound pathways." },
  heart: { label: "Fetal heart", icon: HeartPulse, note: "A handheld Doppler may be used by trained staff when clinically appropriate. The display here is an animation only and cannot assess fetal wellbeing." },
  placenta: { label: "Placenta", icon: ShieldCheck, note: "Ultrasound can identify placental location. Follow-up depends on the scan finding and local clinical guidance." }
};

const trimesterFor = (week) => week < 14 ? "First trimester" : week < 28 ? "Second trimester" : "Third trimester";
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function Limb({ from, to, radius = 0.08, color = "#d99d88" }) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const direction = new THREE.Vector3().subVectors(end, start);
  return <mesh position={start.clone().add(end).multiplyScalar(0.5).toArray()} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize())}>
    <capsuleGeometry args={[radius, direction.length(), 6, 12]} /><meshStandardMaterial color={color} roughness={0.72} />
  </mesh>;
}

function MaternalFetalModel({ week, focus, playing, onSelect }) {
  const womb = useRef();
  const heart = useRef();
  const fetusRoot = useRef();
  const growth = THREE.MathUtils.lerp(0.23, 0.78, Math.pow((week - 8) / 32, 0.82));
  const uterusY = THREE.MathUtils.lerp(0.95, 1.5, (week - 8) / 32);
  const cord = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.1, -0.12, 0.58), new THREE.Vector3(0.34, 0.04, 0.62),
    new THREE.Vector3(0.26, 0.35, 0.25), new THREE.Vector3(-0.3, 0.55, -0.25),
    new THREE.Vector3(-0.61, 0.48, -0.3)
  ]), []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (womb.current) womb.current.scale.y = uterusY + (playing ? Math.sin(time * 0.55) * 0.012 : 0);
    if (fetusRoot.current) {
      fetusRoot.current.position.y = -0.05 + (playing ? Math.sin(time * 1.05) * 0.025 : 0);
      fetusRoot.current.rotation.z = (week >= 32 ? Math.PI : -0.18) + (playing ? Math.sin(time * 0.42) * 0.025 : 0);
    }
    if (heart.current) {
      const pulse = playing ? Math.pow(Math.max(0, Math.sin(time * 4.8)), 10) : 0;
      heart.current.scale.setScalar(1 + pulse * 0.3);
      heart.current.material.emissiveIntensity = focus === "heart" ? 1.4 + pulse * 1.2 : 0.28 + pulse;
    }
  });

  const wallHighlight = focus === "growth" ? "#d7839b" : "#a94e70";
  return <group>
    {/* Posterior uterine wall is cut away to expose the cavity in this teaching view. */}
    <mesh ref={womb} scale={[1.08, uterusY, 0.64]}><sphereGeometry args={[1, 64, 48, Math.PI, Math.PI]} /><meshStandardMaterial color={wallHighlight} emissive={focus === "growth" ? "#652843" : "#000000"} emissiveIntensity={focus === "growth" ? 0.36 : 0} roughness={0.72} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0, -0.01]} scale={[0.9, uterusY * 0.88, 0.54]}><sphereGeometry args={[1, 56, 40, Math.PI, Math.PI]} /><meshStandardMaterial color="#f2a6c5" transparent opacity={0.58} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, -0.04, 0.2]} scale={[0.79, uterusY * 0.8, 0.46]}>
      <sphereGeometry args={[1, 48, 36]} /><meshStandardMaterial color="#75cfe0" transparent opacity={0.15} roughness={0.18} />
    </mesh>
    {/* Placenta attached to the posterior uterine wall. */}
    <mesh position={[-0.62, 0.46, -0.29]} rotation={[0.05, -0.2, -0.24]} scale={[0.44, 0.6, 0.13]}>
      <sphereGeometry args={[1, 40, 28]} /><meshStandardMaterial color={focus === "placenta" ? "#ed7796" : "#8d3f59"} emissive={focus === "placenta" ? "#a82a55" : "#000000"} emissiveIntensity={focus === "placenta" ? 0.7 : 0} roughness={0.82} />
    </mesh>
    {/* Fetus shown curled in the uterine cavity; proportions are illustrative. */}
    <group ref={fetusRoot} position={[0.08, -0.05, 0.42]} scale={growth} rotation={[0, 0, -0.18]}>
      <pointLight position={[0, 0, 0.55]} color="#f2748c" intensity={focus === "heart" ? 1.7 : 0.28} distance={1.5} />
      <mesh position={[0.02, -0.1, 0]} rotation={[0, 0, -0.52]} scale={[0.82, 1, 0.8]}>
        <sphereGeometry args={[0.46, 40, 32]} /><meshStandardMaterial color="#d99d88" roughness={0.7} />
      </mesh>
      <mesh position={[0.28, 0.32, 0.02]} scale={[1, 1.04, 0.92]}>
        <sphereGeometry args={[0.29, 40, 32]} /><meshStandardMaterial color="#d99d88" roughness={0.7} />
      </mesh>
      <mesh position={[0.52, 0.29, 0.04]}><sphereGeometry args={[0.05, 20, 16]} /><meshStandardMaterial color="#bd7868" /></mesh>
      <Limb from={[0.13, 0.03, 0.22]} to={[0.31, -0.12, 0.27]} radius={0.07} />
      <Limb from={[0.31, -0.12, 0.27]} to={[0.18, -0.25, 0.3]} radius={0.055} />
      <Limb from={[-0.1, -0.36, 0.16]} to={[0.08, -0.52, 0.2]} radius={0.11} />
      <Limb from={[0.08, -0.52, 0.2]} to={[-0.08, -0.65, 0.24]} radius={0.075} />
      <mesh ref={heart} position={[0.12, 0.01, 0.32]}>
        <sphereGeometry args={[0.052, 24, 20]} /><meshStandardMaterial color="#ff718d" emissive="#ee2c5a" emissiveIntensity={0.28} />
      </mesh>
    </group>
    <mesh><tubeGeometry args={[cord, 42, 0.026, 10, false]} /><meshStandardMaterial color="#e5b45e" roughness={0.42} /></mesh>
    <mesh position={[0, -1.42, 0.03]} scale={[0.3, 0.43, 0.28]}><cylinderGeometry args={[0.55, 0.42, 1, 32]} /><meshStandardMaterial color="#a34f6d" /></mesh>
    {focus === "growth" && week >= 24 && <group position={[0.92, -0.77, 0.56]}>
      <mesh><cylinderGeometry args={[0.018, 0.018, 1.48, 12]} /><meshStandardMaterial color="#f4d17b" emissive="#cf972f" emissiveIntensity={0.4} /></mesh>
      {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[0.08, -0.7 + i * 0.28, 0]}><boxGeometry args={[0.16, 0.018, 0.018]} /><meshStandardMaterial color="#f4d17b" /></mesh>)}
    </group>}
    {focus === "lie" && <mesh position={[0.08, 0.05, 0.88]} scale={[0.62, 0.92, 0.08]}>
      <sphereGeometry args={[1, 32, 24]} /><meshBasicMaterial color="#91e8ee" wireframe transparent opacity={0.4} />
    </mesh>}
    {focus === "heart" && <Sparkles count={24} scale={[0.7, 0.7, 0.6]} position={[0.15, 0.1, 0.75]} size={3} speed={playing ? 0.5 : 0} color="#ff7890" />}
    <ModelLabel className="anc-marker" part="placenta" selected={focus} onSelect={onSelect} position={[-1.92, 1.45, 0.2]} target={[-0.62, 0.46, -0.29]}>Placenta</ModelLabel>
    {week >= 24 && <ModelLabel className="anc-marker" part="growth" selected={focus} onSelect={onSelect} position={[1.92, 1.42, 0.18]} target={[0, 1.35, 0.25]}>Uterine fundus</ModelLabel>}
    {focus === "growth" && week >= 24 && <ModelLabel className="anc-marker" part="growth" selected={focus} onSelect={onSelect} position={[1.92, 0.63, 0.2]} target={[1.1, 0.03, 0.56]}>Fundal height</ModelLabel>}
    <ModelLabel className="anc-marker" part="lie" selected={focus} onSelect={onSelect} position={[1.92, -0.05, 0.2]} target={[0.08, 0.05, 0.88]}>Fetal lie</ModelLabel>
    <ModelLabel className="anc-marker" part="heart" selected={focus} onSelect={onSelect} position={[1.92, -1.0, 0.2]} target={[0.12, 0.01, 0.74]}>Fetal heart</ModelLabel>
  </group>;
}

export default function AntenatalCareLab() {
  const [selectedContact, setSelectedContact] = useState(0);
  const [week, setWeek] = useState(12);
  const [focus, setFocus] = useState("growth");
  const [playing, setPlaying] = useState(true);
  const controls = useRef();
  const visit = contacts[selectedContact];

  const chooseContact = (index) => {
    setSelectedContact(index);
    setWeek(contacts[index].week);
  };
  const chooseWeek = (nextWeek) => {
    const safeWeek = clamp(nextWeek, 8, 40);
    setWeek(safeWeek);
    setSelectedContact(contacts.reduce((nearest, item, index) => Math.abs(item.week - safeWeek) < Math.abs(contacts[nearest].week - safeWeek) ? index : nearest, 0));
  };

  return <main className="anc-lab">
    <header className="anc-header"><div><p className="anc-eyebrow">OBSTETRICS · INTERACTIVE CLINICAL LEARNING</p><h1>Antenatal Care</h1><p className="anc-subtitle">Explore routine pregnancy contacts, maternal assessment and fetal growth through an interactive clinical model.</p></div>
      <div className="anc-visit-chip"><CalendarCheck size={16} /><span>CONTACT {selectedContact + 1} OF 8</span><b>{week} weeks</b></div>
    </header>
    <section className="anc-main-grid">
      <article className="anc-model-card">
        <div className="anc-card-head"><div><p className="anc-eyebrow">MATERNAL + FETAL ASSESSMENT</p><h2>{focused[focus].label}</h2></div><span className="anc-live-tag"><i /> 3D SIMULATION</span></div>
        <div className="anc-canvas-wrap"><Canvas camera={{ position: [0, 0.05, 6.3], fov: 42 }} dpr={[1, 1.5]} shadows>
          <color attach="background" args={["#091725"]} /><fog attach="fog" args={["#091725", 7, 13]} />
          <ClinicalLighting floor={-1.9} tint="#f2a3c3" />
          <MaternalFetalModel week={week} focus={focus} playing={playing} onSelect={setFocus} />
          <OrbitControls ref={controls} enablePan={false} minDistance={3.5} maxDistance={8} autoRotate={playing} autoRotateSpeed={0.32} minPolarAngle={0.55} maxPolarAngle={2.55} />
        </Canvas>
          <div className="anc-model-actions"><button onClick={() => setPlaying((current) => !current)}>{playing ? <Pause size={14} /> : <Play size={14} />}{playing ? "Pause animation" : "Play animation"}</button><button onClick={() => controls.current?.reset()}><RotateCcw size={14} /> Reset view</button></div>
          <span className="anc-model-note">Educational schematic · not to scale</span>
        </div>
        <div className="clinical-color-key" aria-label="Antenatal model color key"><span><i style={{ background: "#a34f6d" }} /> Uterus</span><span><i style={{ background: "#d99d88" }} /> Fetus</span><span><i style={{ background: "#8d3f59" }} /> Placenta</span><span><i style={{ background: "#e5b45e" }} /> Umbilical cord</span><span><i style={{ background: "#ff718d" }} /> Fetal heart</span></div>
        <div className="anc-focus-controls" aria-label="3D clinical focus">
          {Object.entries(focused).map(([id, item]) => { const Icon = item.icon; return <button key={id} className={focus === id ? "active" : ""} onClick={() => setFocus(id)}><Icon size={14} />{item.label}</button>; })}
        </div>
        <p className="anc-focus-note">{focus === "growth" && week < 24 ? "Fundal-height growth assessment is generally introduced from 24 weeks. Earlier in pregnancy, care focuses on history, symptoms, blood pressure and ultrasound-based dating when indicated." : focused[focus].note}</p>
      </article>
      <aside className="anc-contact-card">
        <div className="anc-contact-title"><span>WHO 8-CONTACT MODEL</span><b>{visit.week} weeks</b></div>
        <p className="anc-eyebrow">CONTACT {selectedContact + 1} · {trimesterFor(week).toUpperCase()}</p>
        <h2>{visit.title}</h2><h3>{visit.stage}</h3><p className="anc-contact-summary">{visit.focus}</p>
        <div className="anc-checklist"><b>Learning checklist</b>{visit.checks.map((item) => <div key={item}><i /><span>{item}</span></div>)}</div>
      </aside>
    </section>
    <section className="anc-schedule-card">
      <div className="anc-section-heading"><div><p className="anc-eyebrow">PERSON-CENTRED FOLLOW-UP</p><h2>Explore the eight routine contacts</h2></div><span>WHO model · timing can be individualized</span></div>
      <div className="anc-week-slider"><span>8 weeks</span><input aria-label="Select gestational week" type="range" min="8" max="40" value={week} onChange={(event) => chooseWeek(Number(event.target.value))} style={{ "--anc-progress": `${(week - 8) / 32 * 100}%` }} /><span>40 weeks</span></div>
      <div className="anc-contact-timeline">{contacts.map((item, index) => <button key={item.week} className={selectedContact === index ? "selected" : week > item.week ? "passed" : ""} onClick={() => chooseContact(index)}><i /><b>C{index + 1}</b><span>{item.week} wk</span><small>{item.stage}</small></button>)}</div>
    </section>
    <section className="anc-routine-grid">
      <article><div><Activity size={17} /></div><b>At every contact</b><p>Listen to concerns, explain assessments, obtain consent, measure blood pressure and weight/BMI as appropriate, review wellbeing and update the care plan.</p></article>
      <article><div><ShieldCheck size={17} /></div><b>Prevention and screening</b><p>Offer recommended supplements, immunization and screening based on clinical history, local prevalence, previous results and national guidance.</p></article>
      <article><div><Ruler size={17} /></div><b>Maternal and fetal assessment</b><p>Assess maternal symptoms throughout pregnancy. From 24 weeks, WHO advises fetal growth assessment including fundal-height measurement where appropriate.</p></article>
      <article><div><HeartPulse size={17} /></div><b>Shared decisions</b><p>Provide respectful, private and culturally appropriate counselling. Discuss choices, support needs, birth preparedness and how to access care.</p></article>
    </section>
    <section className="anc-warning-card"><div><span>URGENT ASSESSMENT</span><h2>Know when to seek help</h2><p>Seek prompt maternity advice for vaginal bleeding, fluid leaking, severe or persistent abdominal pain, severe headache or visual changes, difficulty breathing, seizures, fever with feeling very unwell, or a clear reduction in the baby's usual movements later in pregnancy.</p></div><b>Do not wait for the next routine contact if you are worried.</b></section>
    <footer className="anc-footer-note">This learning module summarizes general WHO antenatal-care guidance. The schedule and screening pathways may differ by country and individual clinical needs; follow current local protocols and a qualified maternity professional. <a href="https://www.who.int/publications/i/item/9789241549912" target="_blank" rel="noreferrer">WHO antenatal care guideline</a> · <a href="https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/handbooks/programme-manager-s-handbook-mncah/recommendations-on-interventions-along-life-course/maternal" target="_blank" rel="noreferrer">WHO intervention timing table</a></footer>
  </main>;
}
