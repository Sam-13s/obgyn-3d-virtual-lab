import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { Activity, AlertCircle, CalendarDays, Check, HeartHandshake, Pause, Play, RotateCcw, ShieldCheck } from "lucide-react";
import * as THREE from "three";
import ModelLabel from "./components/ModelLabel.jsx";
import ClinicalLighting from "./components/ClinicalLighting.jsx";
import "./FamilyPlanningLab.css";

const methods = {
  copper: {
    name: "Copper IUD", group: "Long-acting reversible", tag: "NON-HORMONAL · IUD", color: "#e7bd75",
    mechanism: "A trained provider places a small copper-bearing device in the uterus. Copper affects sperm movement and function, making fertilization less likely. It does not contain hormones.",
    use: ["Long-acting and reversible; approved duration depends on the product and national guidance.", "A provider inserts and removes it. Fertility returns after removal.", "It can also be used as emergency contraception when inserted within 5 days after unprotected intercourse.", "Some people have heavier or longer bleeding and more cramps, especially initially."],
    notes: ["Does not protect against sexually transmitted infections (STIs). Condoms can reduce STI risk.", "Suitability depends on health history and current symptoms; a clinician can explain options.", "Seek care for severe pain, fever, very heavy bleeding or suspected expulsion."],
    source: [{ label: "WHO: Intrauterine devices", href: "https://www.who.int/news-room/fact-sheets/detail/intrauterine-devices" }, { label: "WHO: Emergency contraception", href: "https://www.who.int/news-room/fact-sheets/detail/emergency-contraception" }]
  },
  hormonalIud: {
    name: "Hormonal IUD", group: "Long-acting reversible", tag: "PROGESTIN · IUD", color: "#78d4cd",
    mechanism: "A small device placed in the uterus releases a progestin. It thickens cervical mucus so sperm have difficulty reaching an egg, and thins the uterine lining. Some users continue to ovulate.",
    use: ["Long-acting and reversible; approved duration varies by product and country.", "A trained provider inserts and removes it; fertility can return after removal.", "Bleeding often becomes lighter over time; spotting or irregular bleeding can occur, especially at first.", "Some hormonal IUDs are also used to manage heavy menstrual bleeding, depending on local approval."],
    notes: ["Does not protect against STIs; condoms can reduce STI risk.", "Discuss medical history, current symptoms and personal preferences with a qualified provider.", "Changes in bleeding are common; seek advice for severe pain, fever or concerning symptoms."],
    source: [{ label: "WHO: Intrauterine devices", href: "https://www.who.int/news-room/fact-sheets/detail/intrauterine-devices" }]
  },
  implant: {
    name: "Contraceptive implant", group: "Long-acting reversible", tag: "PROGESTIN · UPPER ARM", color: "#8ac9ef",
    mechanism: "A small flexible rod placed under the skin of the upper arm by a trained provider releases progestin. It mainly prevents ovulation and also thickens cervical mucus.",
    use: ["Highly effective, long-acting and reversible; duration depends on the product and current guidance.", "Insertion and removal require a trained provider; fertility can return soon after removal.", "Irregular or unpredictable bleeding is common and is a frequent reason people seek advice.", "If the implant is difficult to feel, painful or appears to have moved, contact a health professional."],
    notes: ["Does not protect against STIs; condoms can reduce STI risk.", "Some medicines can affect effectiveness. Review all medicines and supplements with a clinician.", "Method choice should reflect bleeding preferences, health history and reproductive goals."],
    source: [{ label: "WHO: Contraception methods", href: "https://www.who.int/health-topics/contraception/" }, { label: "WHO: Family Planning Handbook", href: "https://www.who.int/publications/i/item/9780999203705/" }]
  },
  pill: {
    name: "Contraceptive pills", group: "Short-acting hormonal", tag: "DAILY · HORMONAL", color: "#c1a1f1",
    mechanism: "Combined pills contain estrogen and progestin; progestin-only pills contain progestin. Depending on the formulation, they prevent ovulation and/or thicken cervical mucus. Correct, consistent use matters.",
    use: ["Pills are taken on a regular schedule; instructions differ by pill type and missed-pill timing.", "Bleeding patterns may change. Some people use pills for menstrual symptoms as well as contraception.", "A clinician or pharmacist can help choose a formulation and explain missed-pill steps.", "Combined pills are not suitable for everyone; health history and medicines matter."],
    notes: ["Neither combined nor progestin-only pills protect against STIs; condoms can reduce STI risk.", "Do not rely on the visual animation to choose a pill or manage a missed dose.", "Review new medicines, side effects or health changes with a qualified professional."],
    source: [{ label: "WHO: Oral contraceptives", href: "https://www.who.int/news-room/fact-sheets/detail/oral-contraceptives" }]
  },
  injection: {
    name: "Contraceptive injection", group: "Short-acting hormonal", tag: "PERIODIC · PROGESTIN", color: "#e9a781",
    mechanism: "A progestin injection prevents ovulation and thickens cervical mucus. It is given at intervals set by the specific product and local guidance.",
    use: ["A repeat schedule is needed; ask a provider about the timing for the selected product.", "Bleeding can become irregular or stop during use.", "Return to fertility after the final injection may be delayed for some people.", "Discuss bone health, other medical conditions and future pregnancy timing with a clinician."],
    notes: ["Does not protect against STIs; condoms can reduce STI risk.", "If a dose is late, ask a health worker about pregnancy testing and backup contraception.", "Available formulations and administration options vary by country."],
    source: [{ label: "WHO: Contraception methods", href: "https://www.who.int/health-topics/contraception/" }]
  },
  condom: {
    name: "Condoms", group: "Barrier · STI protection", tag: "BARRIER · EACH TIME", color: "#77d6a4",
    mechanism: "External and internal condoms form a barrier that helps stop sperm from reaching an egg. Correct and consistent use also helps reduce transmission of many STIs, including HIV.",
    use: ["Use a new condom for every act of sex and follow the package instructions.", "Check the expiry date and package; use compatible lubricant to reduce breakage risk.", "If a condom breaks or slips, emergency contraception and STI advice may be time-sensitive.", "Condoms can be combined with another contraceptive method for added pregnancy prevention."],
    notes: ["Condoms are the only contraceptive method that also reduces STI transmission risk, but protection is not complete for every STI or every exposure.", "Latex allergy? Non-latex options are available in many places.", "Condoms can be accessed without a procedure or prescription in many settings."],
    source: [{ label: "WHO: Condoms and STI prevention", href: "https://www.who.int/teams/global-hiv-hepatitis-and-stis-programmes/stis/prevention/condoms" }]
  },
  emergency: {
    name: "Emergency contraception", group: "After unprotected sex", tag: "TIME-SENSITIVE · EC", color: "#ed9a9c",
    mechanism: "Emergency contraceptive pills work mainly by preventing or delaying ovulation. A copper IUD can prevent fertilization and is the most effective emergency contraceptive option when clinically suitable.",
    use: ["Seek advice as soon as possible after unprotected sex or contraceptive failure; emergency options are time-sensitive.", "WHO recommends emergency contraception within 5 days; earlier use is generally more effective.", "A copper IUD inserted within 120 hours is more than 99% effective and can provide ongoing contraception.", "Emergency contraceptive pills do not end an established pregnancy."],
    notes: ["Emergency contraception does not protect against STIs or future sex later in the cycle.", "Availability, product options and eligibility vary locally; a pharmacist or clinician can advise promptly.", "If there was sexual assault, offer urgent medical care, support and STI prevention options."],
    source: [{ label: "WHO: Emergency contraception", href: "https://www.who.int/news-room/fact-sheets/detail/emergency-contraception" }]
  },
  fertility: {
    name: "Fertility awareness", group: "Behavioural method", tag: "CYCLE TRACKING", color: "#e4d27d",
    mechanism: "Fertility-awareness methods use cycle signs or calendar rules to estimate fertile days. Pregnancy prevention depends on avoiding unprotected sex or using a barrier method on fertile days.",
    use: ["Methods differ; learning signs and tracking consistently are important.", "Cycle variability, illness, postpartum changes and some medicines can make fertile-window estimates harder.", "Effectiveness varies by method and typical use; ask a trained educator about the specific method.", "Some people use cycle awareness to support conception rather than avoid pregnancy."],
    notes: ["This method does not protect against STIs.", "Calendar estimates alone cannot identify ovulation with certainty.", "Consider whether the daily tracking and abstinence/barrier requirements fit your circumstances."],
    source: [{ label: "WHO Family Planning Handbook", href: "https://www.who.int/publications/i/item/9780999203705/" }]
  },
  permanent: {
    name: "Permanent contraception", group: "Permanent method", tag: "PERMANENT · PROCEDURE", color: "#b5b9cb",
    mechanism: "Female sterilization blocks or closes the fallopian tubes; vasectomy blocks sperm from entering semen. Both are intended to be permanent methods.",
    use: ["Involves a procedure by a trained clinician; the process and timing depend on the method.", "Vasectomy is not effective immediately; another method is needed until follow-up confirms success.", "Reversal may not be possible or successful. Discuss permanence and alternatives before deciding.", "Voluntary informed consent is essential; decisions should be free of pressure."],
    notes: ["Neither method protects against STIs; condoms can reduce STI risk.", "A health professional can explain benefits, risks, alternatives and local consent requirements.", "Reproductive goals can change; consider reversible options if uncertain."],
    source: [{ label: "WHO Family Planning Handbook", href: "https://www.who.int/publications/i/item/9780999203705/" }]
  }
};

const tabs = [{ id: "mechanism", label: "How it works", icon: Activity }, { id: "use", label: "Use & effects", icon: Check }, { id: "notes", label: "Important notes", icon: ShieldCheck }];
const methodsByGroup = ["Long-acting reversible", "Short-acting hormonal", "Barrier · STI protection", "After unprotected sex", "Behavioural method", "Permanent method"];

function FamilyModel({ method, selected, playing, onSelect }) {
  const viewportWidth = useThree((state) => state.viewport.width);
  const responsiveScale = Math.max(0.64, Math.min(1, viewportWidth / 7.5));
  const labelX = Math.min(2.35, viewportWidth / 2 - 0.68);
  const uterus = useRef();
  const ovaries = useRef();
  const sperm = useRef();
  const pill = useRef();
  const implant = useRef();
  const methodData = methods[method];
  const uterusGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1, 56, 44, Math.PI, Math.PI);
    const positions = geometry.attributes.position;
    const lower = new THREE.Color("#713b59");
    const body = new THREE.Color("#a94f70");
    const fundus = new THREE.Color("#d98799");
    const colors = [];
    for (let index = 0; index < positions.count; index += 1) {
      const y = THREE.MathUtils.clamp((positions.getY(index) + 1) / 2, 0, 1);
      const front = THREE.MathUtils.clamp((positions.getZ(index) + 1) / 2, 0, 1);
      const color = lower.clone().lerp(body, y * 0.72 + 0.14);
      color.lerp(fundus, Math.max(0, (y - 0.55) * 0.65));
      color.lerp(new THREE.Color("#efb092"), front * 0.12);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, []);
  const liningGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1, 48, 36, Math.PI, Math.PI);
    const positions = geometry.attributes.position;
    const lower = new THREE.Color("#ad5274");
    const upper = new THREE.Color("#f1a8b5");
    const colors = [];
    for (let index = 0; index < positions.count; index += 1) {
      const y = THREE.MathUtils.clamp((positions.getY(index) + 1) / 2, 0, 1);
      const color = lower.clone().lerp(upper, y * 0.82);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, []);
  const tubes = useMemo(() => [
    [[-0.45, 0.7, 0], [-0.72, 1.0, 0], [-1.02, 1.05, 0.02], [-1.3, 0.86, 0.04]],
    [[0.45, 0.7, 0], [0.72, 1.0, 0], [1.02, 1.05, 0.02], [1.3, 0.86, 0.04]]
  ], []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (uterus.current && playing) uterus.current.rotation.z = Math.sin(t * 0.4) * 0.012;
    if (ovaries.current) ovaries.current.scale.setScalar(1 + (playing ? Math.sin(t * 1.3) * 0.018 : 0));
    if (sperm.current) {
      sperm.current.children.forEach((particle, index) => {
        const travel = playing ? (t * 0.32 + index * 0.15) % 1 : index * 0.08;
        particle.position.y = -1.55 + travel * 0.9;
        particle.position.x = Math.sin(t * 2 + index) * 0.06;
        particle.visible = method === "condom";
      });
    }
    if (pill.current) pill.current.rotation.y = playing ? Math.sin(t * 1.4) * 0.12 : 0;
    if (implant.current) implant.current.rotation.z = playing ? Math.sin(t * 1.2) * 0.04 : 0;
  });

  const selectedColor = (part, normal) => selected === part ? "#fff0b8" : normal;
  const isIud = method === "copper" || method === "hormonalIud";
  const isHormonal = ["pill", "implant", "injection", "hormonalIud"].includes(method);
  const barrier = method === "condom";
  const displayPill = method === "pill" || method === "emergency";

  return <group>
    <group scale={responsiveScale}>
    {/* Anterior cutaway shows uterus, ovaries, fallopian tubes and cervix. */}
    <mesh ref={uterus} position={[0, 0.05, 0]} scale={[0.72, 1.05, 0.48]} geometry={uterusGeometry}><meshPhysicalMaterial vertexColors color={selected === "uterus" ? "#fff0d0" : "#ffffff"} emissive={selected === "uterus" ? "#63331d" : "#000000"} emissiveIntensity={selected === "uterus" ? 0.28 : 0} roughness={0.68} clearcoat={0.18} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 0.04, 0.03]} scale={[0.58, 0.87, 0.37]} geometry={liningGeometry}><meshPhysicalMaterial vertexColors color={selected === "uterus" ? "#fff5d8" : "#ffffff"} transparent opacity={0.62} side={THREE.DoubleSide} roughness={0.56} clearcoat={0.22} /></mesh>
    {tubes.map((points, index) => <React.Fragment key={index}><Curve points={points} active={selected === "tubes"} color={index === 0 ? "#b45f7b" : "#dc98a5"} /><group position={[index === 0 ? -1.42 : 1.42, 0.59, 0.04]}>
      <mesh scale={[0.26, 0.34, 0.22]}><sphereGeometry args={[1, 28, 22]} /><meshPhysicalMaterial color={selected === "ovary" ? "#ffe0a2" : index === 0 ? "#bf795d" : "#df9d69"} emissive={selected === "ovary" || isHormonal ? "#683247" : "#000000"} emissiveIntensity={selected === "ovary" ? 0.35 : isHormonal ? 0.12 : 0} roughness={0.56} clearcoat={0.18} /></mesh>
      {Array.from({ length: method === "pill" || method === "implant" || method === "injection" ? 6 : 4 }, (_, follicle) => <mesh key={follicle} position={[Math.cos(follicle * 2.4) * 0.14, Math.sin(follicle * 2.4) * 0.16, 0.16]} scale={0.035}>
        <sphereGeometry args={[1, 16, 12]} /><meshPhysicalMaterial color={isHormonal ? follicle % 2 ? "#879bd0" : "#536eac" : ["#f4d59f", "#edbfc0", "#d98e9e"][follicle % 3]} emissive={isHormonal ? "#5977c1" : "#000000"} emissiveIntensity={isHormonal ? 0.16 : 0} roughness={0.38} clearcoat={0.25} />
      </mesh>)}
    </group></React.Fragment>)}
    <group ref={ovaries} />
    {/* Intrauterine device, correctly located in the uterine cavity. */}
    {isIud && <group position={[0, 0.35, 0.43]}>
      <mesh><cylinderGeometry args={[0.035, 0.035, 0.46, 16]} /><meshStandardMaterial color={method === "copper" ? "#d69a50" : "#d7e9ee"} metalness={0.35} roughness={0.28} emissive={selected === "uterus" ? "#f0c568" : "#000000"} emissiveIntensity={selected === "uterus" ? 0.4 : 0} /></mesh>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.19, 0.19, 0.045, 20]} /><meshStandardMaterial color={method === "copper" ? "#d69a50" : "#d7e9ee"} metalness={0.35} roughness={0.28} /></mesh>
      {method === "copper" && Array.from({ length: 5 }, (_, i) => <mesh key={i} position={[0, -0.16 + i * 0.075, 0.04]}><torusGeometry args={[0.06, 0.012, 6, 14]} /><meshStandardMaterial color="#c77c39" metalness={0.4} /></mesh>)}
      {method === "hormonalIud" && <mesh position={[0, -0.02, 0]}><sphereGeometry args={[0.065, 16, 12]} /><meshStandardMaterial color="#78d4cd" emissive="#35a49d" emissiveIntensity={0.55} /></mesh>}
      <Curve points={[[0, -0.04, 0.02], [0, -0.3, 0.02], [0.02, -0.55, 0.02]]} active={false} color="#d8b7c8" />
    </group>}
    {/* Cervix and vaginal canal */}
    <mesh position={[0, -0.88, 0.03]} scale={[0.2, 0.38, 0.2]}><cylinderGeometry args={[0.56, 0.45, 1, 32]} /><meshStandardMaterial color={selectedColor("cervix", "#ae607b")} emissive={selected === "cervix" ? "#9a315c" : "#000000"} emissiveIntensity={selected === "cervix" ? 0.4 : 0} /></mesh>
    <mesh position={[0, -1.36, 0.08]} scale={[0.17, 0.52, 0.17]}><cylinderGeometry args={[0.54, 0.45, 1, 32]} /><meshPhysicalMaterial color={selectedColor("cervix", "#79536f")} emissive={selected === "cervix" ? "#9a315c" : "#000000"} emissiveIntensity={selected === "cervix" ? 0.4 : 0} roughness={0.66} clearcoat={0.15} /></mesh>
    {/* The condom forms a barrier at the vaginal opening; sperm motion stops there. */}
    {barrier && <group position={[0, -1.78, 0.23]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh><cylinderGeometry args={[0.25, 0.2, 0.46, 32, 1, true]} /><meshStandardMaterial color={selected === "barrier" ? "#fff0b8" : "#7bdba7"} emissive={selected === "barrier" ? "#36a46f" : "#000000"} emissiveIntensity={selected === "barrier" ? 0.65 : 0} transparent opacity={0.48} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0.23, 0]}><torusGeometry args={[0.24, 0.025, 8, 28]} /><meshStandardMaterial color="#7bdba7" emissive="#2ba46b" emissiveIntensity={0.55} /></mesh>
    </group>}
    {barrier && <group ref={sperm} position={[0, 0, 0.48]}>{Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[(i % 3 - 1) * 0.09, -1.5, 0]}><sphereGeometry args={[0.022, 12, 10]} /><meshStandardMaterial color="#e8e1a4" emissive="#c8b856" emissiveIntensity={0.5} /></mesh>)}</group>}
    {/* Implant is shown in an upper-arm inset, not inside the reproductive tract. */}
    {method === "implant" && <group ref={implant} position={[-1.8, -0.78, 0.35]} rotation={[0, 0, -0.2]}>
      <mesh scale={[0.34, 0.58, 0.15]}><capsuleGeometry args={[0.5, 0.35, 8, 16]} /><meshStandardMaterial color="#bd8d84" roughness={0.76} /></mesh>
      <mesh position={[0.1, 0, 0.15]} rotation={[0, 0, 0.2]}><capsuleGeometry args={[0.025, 0.43, 6, 12]} /><meshStandardMaterial color={selected === "implant" ? "#fff0b8" : "#d9edf0"} emissive={selected === "implant" ? "#70d7e1" : "#6bb7c1"} emissiveIntensity={selected === "implant" ? 1.2 : 0.4} /></mesh>
    </group>}
    {/* Pill / emergency pill shown as a separate teaching cue. */}
    {displayPill && <group ref={pill} position={[1.75, -0.72, 0.25]} rotation={[0.35, 0.25, -0.35]}>
      <mesh><capsuleGeometry args={[0.12, 0.23, 8, 16]} /><meshStandardMaterial color={selected === "pill" ? "#fff0b8" : method === "emergency" ? "#ee9a9c" : "#c3a5f0"} emissive={selected === "pill" ? "#8c72c1" : "#000000"} emissiveIntensity={selected === "pill" ? 0.8 : 0} roughness={0.34} /></mesh>
    </group>}
    {method === "injection" && <group position={[1.72, -0.72, 0.2]} rotation={[0, 0, -0.5]}>
      <mesh><cylinderGeometry args={[0.06, 0.06, 0.55, 16]} /><meshStandardMaterial color={selected === "injection" ? "#fff0b8" : "#d9edf0"} emissive={selected === "injection" ? "#e9a781" : "#000000"} emissiveIntensity={selected === "injection" ? 0.8 : 0} metalness={0.28} roughness={0.3} /></mesh>
      <mesh position={[0, -0.31, 0]}><cylinderGeometry args={[0.11, 0.11, 0.12, 16]} /><meshStandardMaterial color="#e9a781" /></mesh>
    </group>}
    {method === "fertility" && <group position={[1.67, 0.15, 0.1]}>
      <mesh><torusGeometry args={[0.34, 0.045, 8, 36]} /><meshStandardMaterial color={selected === "cycle" ? "#fff0b8" : "#e4d27d"} emissive="#93802e" emissiveIntensity={selected === "cycle" ? 0.85 : 0.32} /></mesh>
      {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 0.34, Math.sin(i * Math.PI / 3) * 0.34, 0]}><sphereGeometry args={[0.045, 12, 10]} /><meshStandardMaterial color={i === 2 || i === 3 ? "#e8838b" : "#d4e8ec"} /></mesh>)}
    </group>}
    {method === "permanent" && <group><mesh position={[-1.1, 0.96, 0.16]}><torusGeometry args={[0.07, 0.025, 8, 20]} /><meshStandardMaterial color={selected === "permanent" ? "#fff0b8" : "#f0d28f"} emissive="#ba8f43" emissiveIntensity={selected === "permanent" ? 1 : 0.45} /></mesh><mesh position={[1.1, 0.96, 0.16]}><torusGeometry args={[0.07, 0.025, 8, 20]} /><meshStandardMaterial color={selected === "permanent" ? "#fff0b8" : "#f0d28f"} emissive="#ba8f43" emissiveIntensity={selected === "permanent" ? 1 : 0.45} /></mesh></group>}
    </group>
    {isIud && <ModelLabel className="family-label" part="uterus" selected={selected} onSelect={onSelect} position={[labelX, 0.78, 0.2]} target={[0, 0.55 * responsiveScale, 0.43 * responsiveScale]}>{method === "copper" ? "Copper IUD" : "Hormonal IUD"}</ModelLabel>}
    {method === "implant" && <ModelLabel className="family-label" part="implant" selected={selected} onSelect={onSelect} position={[-labelX, -1.5, 0.2]} target={[-1.7 * responsiveScale, -0.78 * responsiveScale, 0.5 * responsiveScale]}>Arm implant</ModelLabel>}
    {displayPill && <ModelLabel className="family-label" part="pill" selected={selected} onSelect={onSelect} position={[labelX, -1.02, 0.2]} target={[1.75 * responsiveScale, -0.72 * responsiveScale, 0.25 * responsiveScale]}>{method === "emergency" ? "Emergency pill" : "Daily pill"}</ModelLabel>}
    {method === "injection" && <ModelLabel className="family-label" part="injection" selected={selected} onSelect={onSelect} position={[labelX, -1.02, 0.2]} target={[1.72 * responsiveScale, -0.72 * responsiveScale, 0.2 * responsiveScale]}>Injection</ModelLabel>}
    {method === "fertility" && <ModelLabel className="family-label" part="cycle" selected={selected} onSelect={onSelect} position={[labelX, 0.28, 0.2]} target={[1.67 * responsiveScale, 0.15 * responsiveScale, 0.1 * responsiveScale]}>Cycle tracking</ModelLabel>}
    {barrier && <ModelLabel className="family-label" part="barrier" selected={selected} onSelect={onSelect} position={[-labelX, -1.5, 0.2]} target={[0, -1.78 * responsiveScale, 0.3 * responsiveScale]}>Condom barrier</ModelLabel>}
    {method === "permanent" && <ModelLabel className="family-label" part="permanent" selected={selected} onSelect={onSelect} position={[labelX, 0.78, 0.2]} target={[1.1 * responsiveScale, 0.96 * responsiveScale, 0.16 * responsiveScale]}>Tubal occlusion</ModelLabel>}
    <Sparkles count={playing ? 14 : 4} scale={[3.5, 2.8, 1.4]} size={1.8} speed={playing ? 0.2 : 0.02} opacity={0.3} color={methodData.color} />
    <ModelLabel className="family-label" part="uterus" selected={selected} onSelect={onSelect} position={[-labelX, 1.58, 0.18]} target={[0, 0.05 * responsiveScale, 0.3 * responsiveScale]}>Uterus</ModelLabel>
    <ModelLabel className="family-label" part="tubes" selected={selected} onSelect={onSelect} position={[labelX, 1.58, 0.18]} target={[0.95 * responsiveScale, 0.98 * responsiveScale, 0.05 * responsiveScale]}>Fallopian tube</ModelLabel>
    <ModelLabel className="family-label" part="ovary" selected={selected} onSelect={onSelect} position={[-labelX, 0.22, 0.18]} target={[-1.42 * responsiveScale, 0.59 * responsiveScale, 0.04 * responsiveScale]}>Ovary</ModelLabel>
    <ModelLabel className="family-label" part="cervix" selected={selected} onSelect={onSelect} position={[labelX, -0.38, 0.18]} target={[0, -0.88 * responsiveScale, 0.2 * responsiveScale]}>Cervix</ModelLabel>
    <ModelLabel className="family-label" part="cervix" selected={selected} onSelect={onSelect} position={[labelX, -1.72, 0.18]} target={[0, -1.48 * responsiveScale, 0.2 * responsiveScale]}>Vaginal canal</ModelLabel>
    <pointLight position={[0, 0, 2]} color={methodData.color} intensity={0.52} distance={5} />
  </group>;
}

function Curve({ points, active, color = "#d8b7c8" }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))), [points]);
  return <mesh><tubeGeometry args={[curve, 24, 0.012, 8, false]} /><meshStandardMaterial color={color} emissive={active ? "#d8b7c8" : "#000000"} emissiveIntensity={active ? 0.3 : 0} /></mesh>;
}

export default function FamilyPlanningLab() {
  const [method, setMethod] = useState("copper");
  const [tab, setTab] = useState("mechanism");
  const [selected, setSelected] = useState("uterus");
  const [playing, setPlaying] = useState(true);
  const controls = useRef();
  const current = methods[method];
  const methodVisualColor = { copper: "#d69a50", hormonalIud: "#d7e9ee", implant: "#d9edf0", pill: "#c3a5f0", injection: "#d9edf0", condom: "#7bdba7", emergency: "#ee9a9c", fertility: "#e4d27d", permanent: "#f0d28f" }[method];
  const info = tab === "use" ? current.use : tab === "notes" ? current.notes : null;

  const chooseMethod = (id) => {
    setMethod(id);
    setTab("mechanism");
    setSelected(["copper", "hormonalIud"].includes(id) ? "uterus" : id === "condom" ? "barrier" : id === "emergency" || id === "pill" ? "pill" : id === "implant" ? "implant" : id === "injection" ? "injection" : id === "fertility" ? "cycle" : id === "permanent" ? "permanent" : "ovary");
  };

  return <main className="family-lab">
    <header className="family-header"><div><p className="family-eyebrow">REPRODUCTIVE HEALTH · INTERACTIVE LEARNING</p><h1>Family Planning & Reproductive Health</h1><p className="family-subtitle">Explore contraceptive methods, how they work, STI protection, emergency options and informed choice.</p></div>
      <div className="family-choice-chip"><HeartHandshake size={16} /><span>YOUR CHOICE · YOUR GOALS</span></div>
    </header>
    <nav className="family-method-grid" aria-label="Explore a family planning method">{methodsByGroup.map((group) => <section key={group}><span>{group}</span><div>{Object.entries(methods).filter(([, item]) => item.group === group).map(([id, item]) => <button key={id} className={method === id ? "active" : ""} style={{ "--method-color": item.color }} onClick={() => chooseMethod(id)}>{item.name}</button>)}</div></section>)}</nav>
    <section className="family-main-grid">
      <article className="family-model-card">
        <div className="family-card-head"><div><p className="family-eyebrow">REPRODUCTIVE SYSTEM · METHOD VIEW</p><h2>{current.name}</h2></div><span className="family-live-tag"><i /> 4D MOTION</span></div>
        <div className="family-canvas-wrap"><Canvas camera={{ position: [0, 0.05, 6.5], fov: 42 }} dpr={[1, 1.5]} shadows>
          <color attach="background" args={["#091725"]} /><fog attach="fog" args={["#091725", 7, 13]} />
          <ClinicalLighting floor={-1.9} tint="#f2a3c3" />
          <FamilyModel method={method} selected={selected} playing={playing} onSelect={setSelected} />
          <OrbitControls ref={controls} enablePan={false} minDistance={3.8} maxDistance={8} autoRotate={playing} autoRotateSpeed={0.27} minPolarAngle={0.52} maxPolarAngle={2.58} />
        </Canvas>
          <div className="family-model-actions"><button onClick={() => setPlaying((value) => !value)}>{playing ? <Pause size={14} /> : <Play size={14} />}{playing ? "Pause motion" : "Play motion"}</button><button onClick={() => controls.current?.reset()}><RotateCcw size={14} /> Reset view</button></div>
          <span className="family-model-note">Teaching schematic · not to scale</span>
        </div>
        <div className="family-model-legend"><span><i style={{ background: "linear-gradient(135deg,#713b59,#a94f70,#d98799)" }} /> Uterus</span><span><i style={{ background: "linear-gradient(135deg,#ad5274,#d77e94,#f1a8b5)" }} /> Endometrium</span><span><i style={{ background: "linear-gradient(135deg,#bf795d,#df9d69)" }} /> Ovaries</span><span><i style={{ background: "linear-gradient(135deg,#b45f7b,#dc98a5)" }} /> Tubes</span><span><i style={{ background: "#79536f" }} /> Cervix</span><span><i style={{ background: methodVisualColor }} /> {current.name}</span></div>
      </article>
      <aside className="family-info-card" style={{ "--method-color": current.color }}>
        <p className="family-eyebrow">{current.tag}</p><h2>{current.name}</h2>
        <div className="family-info-tabs" role="tablist" aria-label="Method information">{tabs.map((item) => { const Icon = item.icon; return <button key={item.id} role="tab" aria-selected={tab === item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><Icon size={13} />{item.label}</button>; })}</div>
        {info ? <div className="family-info-list" key={`${method}-${tab}`}>{info.map((line) => <div key={line}><i /><span>{line}</span></div>)}</div> : <p className="family-mechanism-copy">{current.mechanism}</p>}
        <div className="family-callout"><b>Keep in mind</b><p>{method === "emergency" ? "Emergency contraception is time-sensitive. Contact a pharmacist or health professional promptly to discuss locally available options." : method === "condom" ? "Condoms are the only contraceptive method that also reduces the risk of many STIs, including HIV. Combining condoms with another method can offer dual protection." : "No single method is best for everyone. A trained health worker can help consider health history, preferences, privacy, access, bleeding patterns and future pregnancy goals."}</p></div>
        <div className="family-source-links">{current.source.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label}</a>)}</div>
      </aside>
    </section>
    <section className="family-health-grid">
      <article><div><ShieldCheck size={16} /></div><b>STI prevention</b><p>Most contraceptives do not protect against STIs. Use condoms if STI exposure is possible; testing and vaccination may also be relevant.</p></article>
      <article><div><CalendarDays size={16} /></div><b>Emergency contraception</b><p>After unprotected sex or method failure, seek advice as soon as possible. Some emergency options can be used up to 5 days later.</p></article>
      <article><div><HeartHandshake size={16} /></div><b>Informed, voluntary choice</b><p>Decisions should be private, non-judgmental and free from pressure. You can ask about side effects, alternatives, removal and switching methods.</p></article>
      <article><div><Activity size={16} /></div><b>Reproductive life planning</b><p>Family planning also includes menstrual health, fertility goals, preconception support and access to respectful reproductive health services.</p></article>
    </section>
    <section className="family-note"><AlertCircle size={17} /><p>Method safety depends on individual health circumstances, medicines, local availability and product instructions. The model is for learning only; it cannot determine personal eligibility or replace a clinician’s advice.</p></section>
    <footer className="family-footer">Content follows WHO family-planning guidance. Method availability, product duration and medical eligibility vary by country and product. <a href="https://www.who.int/health-topics/contraception/" target="_blank" rel="noreferrer">WHO contraception overview</a> · <a href="https://www.who.int/publications/b/81080" target="_blank" rel="noreferrer">WHO contraceptive practice guidance (2025)</a> · <a href="https://www.who.int/news-room/fact-sheets/detail/family-planning-contraception" target="_blank" rel="noreferrer">WHO family planning</a></footer>
  </main>;
}
