import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { Activity, AlertTriangle, BookOpen, CircleHelp, HeartPulse, Pause, Play, RotateCcw, ScanLine, ShieldCheck } from "lucide-react";
import * as THREE from "three";
import ModelLabel from "./components/ModelLabel.jsx";
import ClinicalLighting from "./components/ClinicalLighting.jsx";
import "./GynecologicalConditionsLab.css";

const conditions = {
  fibroids: {
    name: "Uterine fibroids", short: "Fibroids", category: "Benign uterine growths", color: "#e8ad77",
    summary: "Fibroids (leiomyomas) are non-cancerous growths of uterine smooth muscle. They may be located within the wall, project into the uterine cavity, or grow on the outer surface. Many cause no symptoms.",
    symptoms: ["Heavy or prolonged menstrual bleeding; sometimes anaemia", "Pelvic pressure, fullness or pain", "Urinary frequency or bowel pressure when larger", "Fertility or pregnancy effects depend on number, size and location"],
    assessment: ["Ask about bleeding pattern, pain, pressure symptoms, pregnancy goals and effect on daily life", "Pelvic examination may suggest an enlarged or irregular uterus", "Ultrasound is commonly used to confirm and map fibroids", "Hysteroscopy or MRI may be useful in selected situations"],
    care: ["No treatment may be needed when fibroids are asymptomatic", "Options depend on symptoms, location, size, anaemia and reproductive goals", "Medical options can manage bleeding or pain; procedures include myomectomy and uterine artery embolization", "Hysterectomy is a definitive option for some people who do not want future pregnancy"],
    focus: "The model highlights benign nodules arising from the myometrium. Their location in relation to the endometrial cavity is clinically important.",
    sources: [{ label: "ACOG: Uterine fibroids", href: "https://www.acog.org/womens-health/faqs/uterine-fibroids" }]
  },
  endometriosis: {
    name: "Endometriosis", short: "Endometriosis", category: "Endometrium-like tissue outside uterus", color: "#c898f1",
    summary: "Endometriosis is a condition in which tissue similar to the uterine lining grows outside the uterus, causing inflammation and sometimes scar tissue. The appearance and symptoms vary widely.",
    symptoms: ["Painful periods or chronic pelvic pain", "Pain during or after sex", "Pain with bowel movements or urination, often around menstruation", "Difficulty conceiving; some people have few or no symptoms"],
    assessment: ["Take a menstrual and pain history, including bowel, bladder and sexual symptoms", "Examination may be offered with consent and may be normal", "Ultrasound or MRI can identify some forms, including endometriomas and deep disease", "A clinical diagnosis may support treatment; surgery is not always required before treatment"],
    care: ["Plan around pain, quality of life, side effects and whether pregnancy is desired", "Pain medicines and hormonal treatments may help control symptoms", "Laparoscopic surgery may be considered for selected cases; symptoms can recur", "Fertility support and multidisciplinary pain care may be helpful"],
    focus: "The purple marks are illustrative examples of lesions and adhesions on pelvic surfaces and an ovarian endometrioma; real disease can occur in many locations.",
    sources: [{ label: "WHO: Endometriosis", href: "https://www.who.int/news-room/fact-sheets/detail/endometriosis" }]
  },
  pmos: {
    name: "PMOS (formerly PCOS)", short: "PMOS", category: "Endocrine and metabolic condition", color: "#74cddb",
    summary: "Polyendocrine metabolic ovarian syndrome (PMOS), previously called polycystic ovary syndrome (PCOS), is a multisystem endocrine and metabolic condition. The ovarian appearance reflects many small follicles, not pathological ovarian cysts.",
    symptoms: ["Irregular or infrequent periods related to ovulatory dysfunction", "Clinical or biochemical androgen excess, such as hirsutism or acne", "Fertility concerns related to irregular ovulation", "Metabolic and psychological health also deserve assessment"],
    assessment: ["In adults, diagnosis generally uses two of three features: ovulatory dysfunction, androgen excess, and polycystic ovarian morphology or AMH, after excluding other causes", "Ultrasound is not required when irregular cycles and androgen excess are both present", "Assess blood pressure, glycaemic status, lipids and mental wellbeing as appropriate", "Adolescent diagnosis needs age-specific criteria; ovarian ultrasound morphology is not used to diagnose adolescents"],
    care: ["Build a lifelong, individualized plan across reproductive, endocrine and metabolic health", "Lifestyle support should be respectful and tailored; avoid weight stigma", "Treatments depend on the main concern and may include cycle regulation, androgen-related symptoms or metabolic risks", "Fertility treatment is available when pregnancy is desired; specialist advice can guide options"],
    focus: "The ovary shows multiple small antral follicles. These are follicles, not ovarian cysts, and this appearance alone does not diagnose PMOS.",
    sources: [{ label: "2026 International PMOS guideline update", href: "https://www.monash.edu/__data/assets/pdf_file/0009/4360095/Updated-PMOS-Guideline-12-June26.pdf" }, { label: "ASRM: PMOS name update", href: "https://www.asrm.org/news-and-events/asrm-news/latest-news/may-27-2026-pcos-is-now-pmos-understanding-the-name-change/" }]
  },
  cyst: {
    name: "Ovarian cyst", short: "Ovarian cysts", category: "Fluid-filled ovarian structure", color: "#78d6c0",
    summary: "An ovarian cyst is a fluid-filled sac or pocket in or on an ovary. Functional cysts are common before menopause and many resolve without treatment; other types need assessment based on their appearance and context.",
    symptoms: ["Often no symptoms", "Pelvic pain, pressure, fullness or bloating", "Pain may occur with sex or activity", "Sudden severe pelvic pain with nausea or vomiting can signal an emergency such as torsion or rupture"],
    assessment: ["Consider age, pregnancy status, symptoms, menstrual history and menopausal status", "Ultrasound evaluates size, structure and blood flow when indicated", "Follow-up imaging or blood tests may be appropriate for some cysts", "Urgent assessment is needed for sudden severe pain, faintness, fever or vomiting"],
    care: ["Observation and repeat imaging are common for simple, likely functional cysts", "Treatment depends on symptoms, persistence, size, ultrasound appearance and cancer risk", "Surgery may be considered for persistent, large, painful or suspicious cysts", "The goal is to treat the cause while preserving ovarian function when appropriate"],
    focus: "The blue sphere represents one example of a simple fluid-filled cyst. Cyst type cannot be determined from a schematic image.",
    sources: [{ label: "ACOG: Ovarian cysts", href: "https://www.acog.org/womens-health/faqs/ovarian-cysts" }]
  },
  pid: {
    name: "Pelvic inflammatory disease", short: "PID", category: "Upper genital tract infection", color: "#ef8e91",
    summary: "Pelvic inflammatory disease is infection and inflammation of the upper genital tract, including the uterus, fallopian tubes and nearby structures. It may be subtle or asymptomatic; delayed recognition can cause reproductive complications.",
    symptoms: ["Lower abdominal or pelvic pain", "Unusual vaginal discharge or bleeding between periods or after sex", "Pain during sex or fever; symptoms can be mild or absent", "Severe pain, vomiting, faintness or possible pregnancy needs urgent assessment"],
    assessment: ["Diagnosis uses symptoms, sexual and medical history, examination and test results", "No single finding reliably confirms or excludes PID", "Testing for sexually transmitted infections and pregnancy may be part of assessment", "Clinicians consider other urgent causes of pelvic pain, including ectopic pregnancy and ovarian torsion"],
    care: ["Prompt clinician-directed antibiotic treatment is important when PID is suspected", "Treatment choice follows current local guidance and individual factors", "Testing, partner services and follow-up depend on the cause and local protocols", "Seek reassessment if symptoms worsen or do not improve as expected"],
    focus: "The red highlights indicate illustrative inflammation around the tubes and adjacent tissue. PID is diagnosed clinically; appearance alone is not diagnostic.",
    sources: [{ label: "CDC: Pelvic inflammatory disease", href: "https://www.cdc.gov/std/treatment-guidelines/pid.htm" }]
  }
};

const sections = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "symptoms", label: "Symptoms", icon: Activity },
  { id: "assessment", label: "Assessment", icon: ScanLine },
  { id: "care", label: "Care options", icon: ShieldCheck }
];

function CurveTube({ points, color, radius = 0.035, active = false }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))), [points]);
  return <mesh><tubeGeometry args={[curve, 36, radius, 10, false]} /><meshStandardMaterial color={active ? "#fff0b8" : color} emissive={active ? color : "#000000"} emissiveIntensity={active ? 0.75 : 0.08} roughness={0.43} /></mesh>;
}

function ConditionModel({ condition, selected, playing, onSelect }) {
  const uterus = useRef();
  const lesion = useRef();
  const ovary = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pulse = playing ? 1 + Math.sin(t * 1.7) * 0.025 : 1;
    if (uterus.current) uterus.current.scale.set(0.76 * pulse, 1.08 * pulse, 0.5 * pulse);
    if (lesion.current && condition === "fibroids") lesion.current.scale.setScalar(1 + (playing ? Math.sin(t * 2) * 0.035 : 0));
    if (ovary.current && condition === "pmos") ovary.current.scale.set(1, 1, 1 + (playing ? Math.sin(t * 1.8) * 0.04 : 0));
  });
  const fibroid = condition === "fibroids";
  const endo = condition === "endometriosis";
  const pmos = condition === "pmos";
  const cyst = condition === "cyst";
  const pid = condition === "pid";
  const uterineColor = selected === "uterus" ? "#ffc2cf" : pid ? "#cf677d" : "#a94f70";
  const ovaryColor = selected === "ovary" ? "#ffe0a2" : pid ? "#e57e8c" : "#d88f61";
  const tubeColor = selected === "tubes" ? "#fff0b8" : pid ? "#ef777a" : "#db94a5";

  return <group>
    {/* Uterus, tubes, ovaries and cervix are shown in an anterior cutaway teaching view. */}
    <mesh ref={uterus} position={[0, 0.13, 0]} scale={[0.76, 1.08, 0.5]}><sphereGeometry args={[1, 56, 44, Math.PI, Math.PI]} /><meshStandardMaterial color={uterineColor} emissive={selected === "uterus" ? "#a93762" : pid ? "#8d2739" : "#000000"} emissiveIntensity={selected === "uterus" || pid ? 0.35 : 0} roughness={0.68} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0.13, 0.01]} scale={[0.61, 0.9, 0.39]}>
      <sphereGeometry args={[1, 48, 36, Math.PI, Math.PI]} /><meshStandardMaterial color={selected === "endometrium" ? "#ffdfba" : "#ef9fba"} emissive={selected === "endometrium" ? "#b66c41" : "#000000"} emissiveIntensity={selected === "endometrium" ? 0.5 : 0} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
    <CurveTube points={[[-0.48, 0.75, 0], [-0.76, 1.03, 0], [-1.06, 1.12, 0.01], [-1.36, 0.96, 0.02]]} color={tubeColor} active={selected === "tubes"} />
    <CurveTube points={[[0.48, 0.75, 0], [0.76, 1.03, 0], [1.06, 1.12, 0.01], [1.36, 0.96, 0.02]]} color={tubeColor} active={selected === "tubes"} />
    {[-1, 1].map((side) => <group key={side} position={[side * 1.48, 0.65, 0.04]}>
      <mesh ref={side === 1 ? ovary : undefined} scale={[0.28, 0.36, 0.23]}>
        <sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color={ovaryColor} emissive={selected === "ovary" ? "#a64368" : pid ? "#a93746" : "#000000"} emissiveIntensity={selected === "ovary" || pid ? 0.38 : 0} roughness={0.55} />
      </mesh>
      {Array.from({ length: pmos ? 11 : 4 }, (_, index) => {
        const angle = index * 2.4;
        const radius = pmos ? 0.18 : 0.13;
        return <mesh key={index} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0.18]} scale={pmos ? 0.045 : 0.035}>
          <sphereGeometry args={[1, 18, 14]} /><meshStandardMaterial color={selected === "ovary" ? "#fff0b8" : pmos ? "#8cdbd8" : "#efc6d0"} emissive={selected === "ovary" || pmos ? "#398f97" : "#000000"} emissiveIntensity={selected === "ovary" ? 0.7 : pmos ? 0.25 : 0} />
        </mesh>;
      })}
      {cyst && side === 1 && <mesh position={[0.05, 0.04, 0.23]} scale={[0.18, 0.2, 0.14]}>
        <sphereGeometry args={[1, 36, 28]} /><meshStandardMaterial color={selected === "ovary" ? "#cffdf0" : "#81d9c5"} emissive="#36aa98" emissiveIntensity={0.55} transparent opacity={0.76} roughness={0.24} />
      </mesh>}
      {endo && side === 1 && <mesh position={[0.02, 0.02, 0.23]} scale={[0.17, 0.18, 0.14]}>
        <sphereGeometry args={[1, 36, 28]} /><meshStandardMaterial color="#876091" emissive="#6b2f78" emissiveIntensity={0.55} transparent opacity={0.88} roughness={0.42} />
      </mesh>}
    </group>)}
    <mesh position={[0, -1.03, 0.05]} scale={[0.21, 0.39, 0.2]}>
      <cylinderGeometry args={[0.58, 0.44, 1, 32]} /><meshStandardMaterial color={selected === "cervix" ? "#ffd0dd" : "#aa5d79"} emissive={selected === "cervix" ? "#a93762" : "#000000"} emissiveIntensity={selected === "cervix" ? 0.4 : 0} />
    </mesh>
    {/* Fibroids are shown at different uterine-wall locations. */}
    {fibroid && <group ref={lesion}>
      <mesh position={[-0.44, 0.25, 0.25]} scale={[0.22, 0.24, 0.17]}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color={selected === "uterus" ? "#fff0b8" : "#e7a766"} emissive="#99532c" emissiveIntensity={selected === "uterus" ? 0.8 : 0.38} roughness={0.58} /></mesh>
      <mesh position={[0.25, -0.05, 0.31]} scale={[0.14, 0.16, 0.13]}><sphereGeometry args={[1, 28, 22]} /><meshStandardMaterial color="#e7a766" emissive="#99532c" emissiveIntensity={0.35} roughness={0.58} /></mesh>
      <mesh position={[0.35, 0.47, -0.22]} scale={[0.19, 0.22, 0.13]}><sphereGeometry args={[1, 28, 22]} /><meshStandardMaterial color="#d89560" roughness={0.58} /></mesh>
    </group>}
    {/* Endometriosis lesions and adhesions are simplified and illustrative. */}
    {endo && <group>
      {[[-0.82, -0.48, 0.2], [0.7, -0.6, 0.22], [-0.35, 0.82, 0.18], [0.5, -0.28, 0.27]].map((pos, index) => <mesh key={index} position={pos} scale={index === 0 ? 0.075 : 0.05}>
        <sphereGeometry args={[1, 20, 16]} /><meshStandardMaterial color="#d08be2" emissive="#77328c" emissiveIntensity={0.6} />
      </mesh>)}
      <CurveTube points={[[-0.5, -0.5, 0.16], [-0.2, -0.2, 0.21], [0.05, -0.52, 0.23]]} color="#9e64ae" radius={0.025} />
    </group>}
    {/* PID inflammation is highlighted along both tubes and adnexal regions. */}
    {pid && <group><Sparkles count={playing ? 30 : 12} scale={[3.0, 2.3, 1.0]} size={2.1} speed={playing ? 0.5 : 0.08} opacity={0.6} color="#f08c80" /><pointLight position={[0, 0.65, 0.7]} color="#f05d66" intensity={0.8} distance={3} /></group>}
    <ModelLabel className="gyn-label" part="uterus" selected={selected} onSelect={onSelect} position={[-1.9, 1.52, 0.2]} target={[0, 0.18, 0.27]}>Uterus</ModelLabel>
    <ModelLabel className="gyn-label" part="endometrium" selected={selected} onSelect={onSelect} position={[1.92, 0.82, 0.2]} target={[0.38, 0.18, 0.45]}>Endometrium</ModelLabel>
    <ModelLabel className="gyn-label" part="tubes" selected={selected} onSelect={onSelect} position={[1.92, 1.5, 0.16]} target={[0.92, 0.92, 0.08]}>Fallopian tubes</ModelLabel>
    <ModelLabel className="gyn-label" part="ovary" selected={selected} onSelect={onSelect} position={[-1.92, 0.45, 0.2]} target={[-1.42, 0.6, 0.08]}>Ovary</ModelLabel>
    <ModelLabel className="gyn-label" part="cervix" selected={selected} onSelect={onSelect} position={[1.85, -1.15, 0.2]} target={[0, -0.88, 0.22]}>Cervix</ModelLabel>
    <pointLight position={[0, 0, 2]} color={conditions[condition].color} intensity={0.55} distance={5} />
  </group>;
}

export default function GynecologicalConditionsLab() {
  const [condition, setCondition] = useState("fibroids");
  const [section, setSection] = useState("overview");
  const [selected, setSelected] = useState("uterus");
  const [playing, setPlaying] = useState(true);
  const controls = useRef();
  const current = conditions[condition];
  const sectionData = section === "symptoms" ? current.symptoms : section === "assessment" ? current.assessment : section === "care" ? current.care : null;

  const chooseCondition = (next) => {
    setCondition(next);
    setSelected(next === "pmos" || next === "cyst" ? "ovary" : next === "pid" ? "tubes" : "uterus");
  };

  return <main className="gyn-lab">
    <header className="gyn-header"><div><p className="gyn-eyebrow">GYNECOLOGY · INTERACTIVE CLINICAL LEARNING</p><h1>Gynecological Conditions</h1><p className="gyn-subtitle">Explore common pelvic conditions through an interactive anatomical model and clinical learning guide.</p></div>
      <div className="gyn-education-chip"><HeartPulse size={16} /><span>CONDITION EXPLORER</span></div>
    </header>
    <nav className="gyn-condition-tabs" aria-label="Select a condition">{Object.entries(conditions).map(([id, item]) => <button key={id} className={condition === id ? "active" : ""} style={{ "--condition-color": item.color }} onClick={() => chooseCondition(id)}><span>{item.category}</span><b>{item.short}</b></button>)}</nav>
    <section className="gyn-main-grid">
      <article className="gyn-model-card">
        <div className="gyn-card-head"><div><p className="gyn-eyebrow">REPRODUCTIVE ANATOMY · CONDITION FOCUS</p><h2>{current.name}</h2></div><span className="gyn-live-tag"><i /> 4D MOTION</span></div>
        <div className="gyn-canvas-wrap"><Canvas camera={{ position: [0, 0.05, 6.4], fov: 42 }} dpr={[1, 1.5]} shadows>
          <color attach="background" args={["#091725"]} /><fog attach="fog" args={["#091725", 7, 13]} />
          <ClinicalLighting floor={-1.9} tint="#f2a3c3" />
          <ConditionModel condition={condition} selected={selected} playing={playing} onSelect={setSelected} />
          <OrbitControls ref={controls} enablePan={false} minDistance={3.6} maxDistance={8} autoRotate={playing} autoRotateSpeed={0.28} minPolarAngle={0.52} maxPolarAngle={2.58} />
        </Canvas>
          <div className="gyn-model-actions"><button onClick={() => setPlaying((value) => !value)}>{playing ? <Pause size={14} /> : <Play size={14} />}{playing ? "Pause motion" : "Play motion"}</button><button onClick={() => controls.current?.reset()}><RotateCcw size={14} /> Reset view</button></div>
          <span className="gyn-model-note">Illustrative anatomy · not to scale</span>
        </div>
        <div className="gyn-model-legend"><span><i className="legend-uterus" /> Uterus</span><span><i style={{ background: "#ef9fba" }} /> Endometrium</span><span><i className="legend-tubes" /> Tubes</span><span><i className="legend-ovary" /> Ovaries</span><span><i style={{ background: "#aa5d79" }} /> Cervix</span><span><i style={{ background: current.color }} /> {current.short} focus</span></div>
        <p className="gyn-focus-note">{current.focus}</p>
      </article>
      <aside className="gyn-info-card" style={{ "--condition-color": current.color }}>
        <p className="gyn-eyebrow">{current.category.toUpperCase()}</p><h2>{current.name}</h2>
        <div className="gyn-info-tabs" role="tablist" aria-label="Condition information">{sections.map((item) => { const Icon = item.icon; return <button key={item.id} role="tab" aria-selected={section === item.id} className={section === item.id ? "active" : ""} onClick={() => setSection(item.id)}><Icon size={13} />{item.label}</button>; })}</div>
        {sectionData ? <div className="gyn-info-list" key={`${condition}-${section}`}>{sectionData.map((item) => <div key={item}><i /><span>{item}</span></div>)}</div> : <p className="gyn-condition-summary">{current.summary}</p>}
        <div className="gyn-clinical-callout"><b>Clinical note</b><p>{condition === "pmos" ? "The former name can be misleading: small follicles are not ovarian cysts, and ultrasound appearance alone is not enough to diagnose PMOS." : condition === "pid" ? "PID can be subtle. Prompt clinical assessment matters because delayed treatment can increase the risk of upper genital tract complications." : condition === "cyst" ? "Sudden severe pelvic pain with nausea, vomiting or faintness needs urgent medical assessment." : "Symptoms and imaging findings do not establish a diagnosis on their own. Assessment and care should be individualized."}</p></div>
      </aside>
    </section>
    <section className="gyn-lower-grid">
      <article className="gyn-anatomy-key"><div><p className="gyn-eyebrow">INTERACTIVE STRUCTURES</p><h2>Tap a label to highlight anatomy</h2></div><div>{[["uterus", "Uterus"], ["endometrium", "Endometrium"], ["tubes", "Fallopian tubes"], ["ovary", "Ovary"], ["cervix", "Cervix"]].map(([id, label]) => <button key={id} className={selected === id ? "active" : ""} onClick={() => setSelected(id)}>{label}</button>)}</div></article>
      <article className="gyn-urgent-card"><AlertTriangle size={18} /><div><b>Seek urgent assessment</b><p>Sudden severe pelvic pain, fainting, heavy bleeding, fever with significant pain, or severe symptoms during possible pregnancy need prompt medical evaluation.</p></div></article>
    </section>
    <section className="gyn-care-principles"><div><p className="gyn-eyebrow">CARE PRINCIPLES</p><h2>Care is personal</h2></div><p>Management depends on symptoms, examination and test findings, age, other health needs, fertility preferences, risks and local guidelines. This model is designed to support learning, not to diagnose a condition or recommend a treatment for an individual.</p><CircleHelp size={20} /></section>
    <footer className="gyn-footer">Information and model are educational summaries, not a substitute for clinical assessment. <a href="https://www.acog.org/womens-health/faqs/uterine-fibroids" target="_blank" rel="noreferrer">Fibroids</a> · <a href="https://www.who.int/news-room/fact-sheets/detail/endometriosis" target="_blank" rel="noreferrer">Endometriosis</a> · <a href="https://www.monash.edu/__data/assets/pdf_file/0009/4360095/Updated-PMOS-Guideline-12-June26.pdf" target="_blank" rel="noreferrer">PMOS guideline</a> · <a href="https://www.acog.org/womens-health/faqs/ovarian-cysts" target="_blank" rel="noreferrer">Ovarian cysts</a> · <a href="https://www.cdc.gov/std/treatment-guidelines/pid.htm" target="_blank" rel="noreferrer">PID</a></footer>
  </main>;
}
