
import React, { Component, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, Float } from "@react-three/drei";
import * as THREE from "three";
import ModelLabel from "./components/ModelLabel.jsx";
import ClinicalLighting from "./components/ClinicalLighting.jsx";
import ReproductiveGLB from "./components/ReproductiveGLB.jsx";
import api, { refreshCsrf } from "./api.js";
import { reproductiveModelSource, reproductiveModelUrl } from "./data/anatomyModelCatalog.js";
import {
    ArrowLeft,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Play,
    Pause,
    CheckCircle2,
    BookOpen,
    Activity,
    GraduationCap,
    ChevronRight,
    Info,
    X,
} from "lucide-react";
import "./AnatomyLab.css";

const organs = [
    {
        id: "uterus",
        name: "Uterus",
        category: "Main reproductive organ",
        function:
            "The uterus is a hollow, muscular organ where implantation and fetal development normally occur.",
        clinical:
            "The uterine wall has three layers: perimetrium, myometrium and endometrium.",
        location: "Central pelvic cavity",
        sizeReference: "About 7-9 cm long and 6-6.5 cm wide in a mature, non-pregnant adult; size varies with parity and life stage.",
        colorReference: "Muted rose outer wall; the cutaway distinguishes the muscular myometrium from the inner lining.",
        sizeSource: { label: "MSD Manual", url: "https://www.msdmanuals.com/professional/gynecology-and-obstetrics/approach-to-the-gynecologic-patient/pelvic-examination" },
    },
    {
        id: "fundus",
        name: "Fundus",
        category: "Upper uterus",
        function:
            "The fundus is the rounded upper portion of the uterus, above the openings of the fallopian tubes.",
        clinical:
            "Fundal height measurement is an important part of antenatal assessment.",
        location: "Uppermost part of uterus",
        sizeReference: "Part of the uterus; there is no separate standard measurement for the fundus.",
        colorReference: "Same muscular wall as the uterine body; the dome is shaded lighter to show its contour.",
        sizeSource: { label: "MSD Manual", url: "https://www.msdmanuals.com/professional/gynecology-and-obstetrics/approach-to-the-gynecologic-patient/pelvic-examination" },
    },
    {
        id: "cervix",
        name: "Cervix",
        category: "Lower uterus",
        function:
            "The cervix connects the uterus with the vagina and produces cervical mucus.",
        clinical:
            "Cervical effacement and dilatation are assessed during labour.",
        location: "Lower end of uterus",
        sizeReference: "Approximately 2.5-3.5 cm long in an adult; varies with age, parity and pregnancy.",
        colorReference: "Muted rose, continuous with the uterine wall.",
        sizeSource: { label: "MedlinePlus", url: "https://medlineplus.gov/ency/article/002317.htm" },
    },
    {
        id: "vagina",
        name: "Vagina",
        category: "Muscular canal",
        function:
            "The vagina is an elastic muscular canal connecting the cervix to the external genital region.",
        clinical:
            "It functions as the passage for menstrual flow and vaginal birth.",
        location: "Below the cervix",
        sizeReference: "About 7–9 cm long at rest; length and distensibility vary between individuals.",
        colorReference: "Dusky rose mucosal tissue; the tube is schematic and does not show rugae.",
        sizeSource: { label: "Anatomical review", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3312145/" },
    },
    {
        id: "tube",
        name: "Fallopian Tubes",
        category: "Paired reproductive structures",
        function:
            "The fallopian tubes transport the ovum toward the uterus. Fertilisation commonly occurs in the ampulla.",
        clinical:
            "Tubal blockage and ectopic pregnancy are important clinical considerations.",
        location: "Extending laterally from uterus",
        sizeReference: "Each tube is roughly 7-12 cm long; the lumen is much narrower than shown here.",
        colorReference: "Soft rose. Fimbriae are shown at the ovarian end.",
        sizeSource: { label: "WHO ultrasound manual", url: "https://iris.who.int/bitstream/handle/10665/85386/9789241548540_eng.pdf" },
    },
    {
        id: "ovary",
        name: "Ovaries",
        category: "Paired reproductive glands",
        function:
            "The ovaries produce ova and hormones such as oestrogen and progesterone.",
        clinical:
            "Ovarian follicles develop during the ovarian cycle, and ovulation releases an oocyte.",
        location: "On either side of uterus",
        sizeReference: "A premenopausal ovary is commonly under about 3.5 x 2 x 1.5 cm; follicles and age change its appearance.",
        colorReference: "Warm muted coral; small follicles are shown in the cutaway view.",
        sizeSource: { label: "University of Pennsylvania POCUS guide", url: "https://www.med.upenn.edu/POCUS/ed-fellowship-pocus-guide.pdf" },
    },
    {
        id: "endometrium",
        name: "Endometrium",
        category: "Inner uterine lining",
        function:
            "The endometrium changes during the menstrual cycle and provides the site for implantation.",
        clinical:
            "The functional layer is shed during menstruation when pregnancy does not occur.",
        location: "Inner lining of uterus",
        sizeReference: "Thickness changes through the menstrual cycle; there is no single fixed thickness for all cycle days.",
        colorReference: "Light rose lining around a darker potential uterine cavity.",
        sizeSource: { label: "NCBI Bookshelf: Uterine Imaging", url: "https://www.ncbi.nlm.nih.gov/books/NBK551551/" },
    },
    {
        id: "bladder",
        name: "Urinary bladder",
        category: "Anterior pelvic organ",
        function: "The bladder stores urine and lies anterior to the uterus in the pelvis.",
        clinical: "Its position is an important landmark in pelvic imaging and lower abdominal assessment.",
        location: "Anterior to the uterus",
        sizeReference: "Position and shape change with filling; this model is not a measurement tool.",
        colorReference: "A soft amber shade distinguishes it from the reproductive tissues.",
    },
    {
        id: "ligaments",
        name: "Pelvic ligaments",
        category: "Connective support structures",
        function: "The broad and supporting ligaments are folds or bands of connective tissue associated with the uterus, tubes and ovaries.",
        clinical: "Their relationships help orient pelvic anatomy; the model groups several named structures for selection.",
        location: "Around the uterus and adnexa",
        sizeReference: "These structures vary in shape and are shown as anatomical regions, not measured bands.",
        colorReference: "Several pink and rose shades distinguish supporting tissues from muscle and vessels.",
    },
    {
        id: "vessels",
        name: "Uterine vessels",
        category: "Pelvic blood supply",
        function: "The uterine arteries supply the uterus; uterine veins drain blood from the pelvic region.",
        clinical: "Their course is an important anatomical relationship in gynecological surgery and pelvic imaging.",
        location: "Along the lateral uterus and broad ligament",
        sizeReference: "The model is not a vessel diameter or flow measurement.",
        colorReference: "Arteries use red shades and veins use blue shades to distinguish their pathways.",
    },
];

const diagramColors = {
    uterus: "#a95f72", fundus: "#bd7180", cervix: "#a85f70", vagina: "#9e6473",
    tube: "#c98283", ovary: "#c98270", endometrium: "#dc8c94", bladder: "#c5a05b", ligaments: "#b66c80", vessels: "#bd3f3f",
};

class ModelErrorBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    componentDidCatch(error) { this.props.onError?.(error); }
    render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const questions = [
    {
        question: "Where does implantation normally occur?",
        options: ["Ovary", "Endometrium", "Vagina", "Cervix"],
        answer: 1,
        explanation:
            "Implantation normally occurs in the endometrium, the inner lining of the uterus.",
    },
    {
        question: "Where does fertilisation commonly occur?",
        options: ["Ampulla of fallopian tube", "Cervix", "Vagina", "Uterine fundus"],
        answer: 0,
        explanation:
            "Fertilisation commonly occurs in the ampulla of the fallopian tube.",
    },
    {
        question: "Which organ produces ova and reproductive hormones?",
        options: ["Uterus", "Cervix", "Ovary", "Vagina"],
        answer: 2,
        explanation:
            "The ovaries produce oocytes and hormones including oestrogen and progesterone.",
    },
];

function Organ({ id, position, scale, active, onSelect, color }) {
    return (
        <mesh
            position={position}
            scale={scale}
            onClick={(event) => {
                event.stopPropagation();
                onSelect(id);
            }}
            castShadow
        >
            <sphereGeometry args={[1, 48, 48]} />
            <meshStandardMaterial
                color={active ? "#f6c6ac" : color}
                roughness={0.62}
                metalness={0.01}
                emissive={active ? "#713c42" : "#000000"}
                emissiveIntensity={active ? 0.3 : 0}
                clearcoat={0.22}
            />
        </mesh>
    );
}

function Tube({ points, active, onSelect, part = "tube", color = "#c98283", radius = 0.055 }) {
    const geometry = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3(
            points.map((point) => new THREE.Vector3(...point))
        );
        return new THREE.TubeGeometry(curve, 64, radius, 14, false);
    }, [points, radius]);

    return (
        <mesh
            geometry={geometry}
            onClick={(event) => {
                event.stopPropagation();
                onSelect(part);
            }}
        >
            <meshStandardMaterial
                color={active ? "#fff0cf" : color}
                roughness={0.5}
                emissive={active ? "#a54f57" : "#000000"}
                emissiveIntensity={active ? 0.3 : 0}
            />
        </mesh>
    );
}

const uterineBodyProfile = [
    new THREE.Vector2(0.18, -0.52),
    new THREE.Vector2(0.28, -0.32),
    new THREE.Vector2(0.43, -0.08),
    new THREE.Vector2(0.62, 0.2),
    new THREE.Vector2(0.74, 0.5),
    new THREE.Vector2(0.76, 0.75),
    new THREE.Vector2(0.64, 0.97),
    new THREE.Vector2(0.4, 1.13),
    new THREE.Vector2(0.18, 1.19),
    new THREE.Vector2(0, 1.2),
];

function UterusBody({ selected, onSelect }) {
    const geometry = useMemo(() => {
        const mesh = new THREE.LatheGeometry(uterineBodyProfile, 64);
        const baseBody = new THREE.Color("#a95f72");
        const baseFundus = new THREE.Color("#bd7180");
        const highlight = new THREE.Color("#f6c6ac");
        const positions = mesh.attributes.position;
        const colors = [];
        for (let index = 0; index < positions.count; index += 1) {
            const y = positions.getY(index);
            const isFundus = y >= 0.74;
            const color = (isFundus ? baseFundus : baseBody).clone();
            if ((selected === "fundus" && isFundus) || (selected === "uterus" && !isFundus)) {
                color.lerp(highlight, 0.72);
            }
            colors.push(color.r, color.g, color.b);
        }
        mesh.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        mesh.computeVertexNormals();
        return mesh;
    }, [selected]);

    return <mesh geometry={geometry} scale={[1, 1, 0.62]} castShadow onClick={(event) => {
        event.stopPropagation();
        onSelect(event.point.y >= 0.74 ? "fundus" : "uterus");
    }}>
        <meshPhysicalMaterial vertexColors roughness={0.58} metalness={0.01} clearcoat={0.2} />
    </mesh>;
}

const endometriumShape = new THREE.Shape();
endometriumShape.moveTo(-0.36, 0.64);
endometriumShape.bezierCurveTo(-0.26, 0.46, -0.14, 0.36, -0.12, 0.12);
endometriumShape.bezierCurveTo(-0.1, -0.06, -0.08, -0.31, 0, -0.48);
endometriumShape.bezierCurveTo(0.08, -0.31, 0.1, -0.06, 0.12, 0.12);
endometriumShape.bezierCurveTo(0.14, 0.36, 0.26, 0.46, 0.36, 0.64);
endometriumShape.quadraticCurveTo(0, 0.49, -0.36, 0.64);

const cavityShape = new THREE.Shape();
cavityShape.moveTo(-0.27, 0.57);
cavityShape.quadraticCurveTo(0, 0.46, 0.27, 0.57);
cavityShape.bezierCurveTo(0.16, 0.37, 0.08, 0.19, 0.065, 0.04);
cavityShape.quadraticCurveTo(0.04, -0.27, 0, -0.43);
cavityShape.quadraticCurveTo(-0.04, -0.27, -0.065, 0.04);
cavityShape.bezierCurveTo(-0.08, 0.19, -0.16, 0.37, -0.27, 0.57);

function Endometrium({ active, onSelect }) {
    return (
        <group position={[0, 0.39, 0.47]} onClick={(event) => { event.stopPropagation(); onSelect("endometrium"); }}>
            <mesh><shapeGeometry args={[endometriumShape]} /><meshStandardMaterial color={active ? "#ffc2bd" : "#dc8c94"} emissive={active ? "#9b3d54" : "#000000"} emissiveIntensity={active ? 0.35 : 0} side={THREE.DoubleSide} roughness={0.72} /></mesh>
            <mesh position={[0, 0, 0.006]}><shapeGeometry args={[cavityShape]} /><meshStandardMaterial color="#593648" side={THREE.DoubleSide} roughness={0.9} /></mesh>
        </group>
    );
}

function OvaryFollicles({ side, active, onSelect }) {
    const follicles = [[-0.08, 0.11, 0.19, 0.075], [0.06, -0.02, 0.2, 0.06], [-0.04, -0.16, 0.19, 0.045]];
    return <group position={[side * 1.5, 0.65, 0]}>{follicles.map(([x, y, z, radius], index) => (
        <mesh key={index} position={[x, y, z]} scale={[radius, radius, radius * 0.55]} onClick={(event) => { event.stopPropagation(); onSelect("ovary"); }}>
            <sphereGeometry args={[1, 20, 16]} /><meshStandardMaterial color={active ? "#ffe4cf" : "#e4b49b"} emissive={active ? "#8c424f" : "#000000"} emissiveIntensity={active ? 0.2 : 0} roughness={0.7} />
        </mesh>
    ))}</group>;
}

const cutawayAnnotations = [
    { part: "uterus", label: "Uterus", position: [-2.08, 0.24, 0.22], target: [0, 0.35, 0.38] },
    { part: "fundus", label: "Fundus", position: [-2.08, 1.35, 0.22], target: [0, 1.02, 0.16] },
    { part: "tube", label: "Fallopian tube", position: [-2.08, 0.83, 0.22], target: [-1.05, 1.0, 0.04] },
    { part: "ovary", label: "Ovary", position: [-2.08, -0.55, 0.22], target: [-1.5, 0.65, 0.12] },
    { part: "endometrium", label: "Endometrium", position: [2.08, 1.35, 0.22], target: [0, 0.39, 0.46] },
    { part: "cervix", label: "Cervix", position: [2.08, 0.28, 0.22], target: [0, -0.63, 0.3] },
    { part: "vagina", label: "Vagina", position: [2.08, -1.2, 0.22], target: [0, -1.28, 0.18] },
    { part: "bladder", label: "Bladder", position: [-2.08, -1.2, 0.22], target: [0.03, -0.94, 0.46] },
    { part: "ligaments", label: "Pelvic ligaments", position: [2.08, -0.55, 0.22], target: [0.05, 0.2, -0.12] },
    { part: "vessels", label: "Uterine vessels", position: [2.08, 0.9, 0.22], target: [0.45, 0.08, 0.2] },
];

function AnatomyModel({ selected, onSelect }) {
    const annotation = cutawayAnnotations.find((item) => item.part === selected) || cutawayAnnotations[0];
    return (
        <>
            <ClinicalLighting floor={-2.15} tint="#d88998" />

            <Float speed={1} rotationIntensity={0.025} floatIntensity={0.08}>
                {/* One continuous pear-shaped uterine wall with a separately selectable fundus. */}
                <UterusBody selected={selected} onSelect={onSelect} />

                {/* Endometrial inner surface - illustrative front cutaway */}
                <Endometrium active={selected === "endometrium"} onSelect={onSelect} />

                {/* Cervix */}
                <mesh
                    position={[0, -0.63, 0]}
                    rotation={[0, 0, 0]}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect("cervix");
                    }}
                >
                    <cylinderGeometry args={[0.23, 0.19, 0.62, 40]} />
                    <meshStandardMaterial
                        color={selected === "cervix" ? "#f2b4a8" : "#a85f70"}
                        roughness={0.48}
                    />
                </mesh>

                {/* Vagina */}
                <mesh
                    position={[0, -1.28, 0]}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect("vagina");
                    }}
                >
                    <cylinderGeometry args={[0.16, 0.2, 0.7, 36]} />
                    <meshStandardMaterial
                        color={selected === "vagina" ? "#f2b4a8" : "#9e6473"}
                        roughness={0.5}
                    />
                </mesh>

                {/* Left and right fallopian tubes */}
                <Tube
                    active={selected === "tube"}
                    onSelect={onSelect}
                    points={[
                        [-0.55, 0.82, 0],
                        [-0.9, 1.05, 0],
                        [-1.25, 1.0, 0],
                        [-1.45, 0.77, 0],
                    ]}
                />

                <Tube part="vessels" color="#bd3f3f" radius={0.022} active={selected === "vessels"} onSelect={onSelect} points={[[-0.78, -0.06, 0.16], [-0.55, 0.04, 0.2], [-0.42, 0.22, 0.2], [-0.12, 0.35, 0.18]]} />
                <Tube part="vessels" color="#284d9b" radius={0.026} active={selected === "vessels"} onSelect={onSelect} points={[[0.84, -0.12, 0.16], [0.58, -0.02, 0.2], [0.44, 0.18, 0.2], [0.13, 0.32, 0.18]]} />
                <Tube part="ligaments" color="#b66c80" radius={0.034} active={selected === "ligaments"} onSelect={onSelect} points={[[-0.36, 0.38, -0.12], [-0.72, 0.2, -0.1], [-1.05, -0.05, -0.06]]} />
                <Tube part="ligaments" color="#d48b91" radius={0.034} active={selected === "ligaments"} onSelect={onSelect} points={[[0.36, 0.38, -0.12], [0.72, 0.2, -0.1], [1.05, -0.05, -0.06]]} />
                <Tube
                    active={selected === "tube"}
                    onSelect={onSelect}
                    points={[
                        [0.55, 0.82, 0],
                        [0.9, 1.05, 0],
                        [1.25, 1.0, 0],
                        [1.45, 0.77, 0],
                    ]}
                />

                {/* Ovaries */}
                <Organ
                    id="ovary"
                    position={[-1.5, 0.65, 0]}
                    scale={[0.25, 0.36, 0.2]}
                    active={selected === "ovary"}
                    onSelect={onSelect}
                    color="#c98270"
                />
                <Organ
                    id="ovary"
                    position={[1.5, 0.65, 0]}
                    scale={[0.25, 0.36, 0.2]}
                    active={selected === "ovary"}
                    onSelect={onSelect}
                    color="#c98270"
                />
                <Organ
                    id="bladder"
                    position={[0.03, -0.94, 0.29]}
                    scale={[0.29, 0.32, 0.17]}
                    active={selected === "bladder"}
                    onSelect={onSelect}
                    color="#c5a05b"
                />
                <OvaryFollicles side={-1} active={selected === "ovary"} onSelect={onSelect} />
                <OvaryFollicles side={1} active={selected === "ovary"} onSelect={onSelect} />

                {/* Fimbriae: small fringes at the ovarian ends of the tubes. */}
                {[-1, 1].map((side) => [-1, 0, 1].map((offset) => <Tube key={`fimbria-${side}-${offset}`} radius={0.018} active={selected === "tube"} onSelect={onSelect} points={[[side * 1.38, 0.8 + offset * 0.06, 0.02], [side * 1.47, 0.76, 0.02], [side * 1.5, 0.69 + offset * 0.12, 0.02]]} />))}

            </Float>

            <ModelLabel className="anatomy-floating-label" part={annotation.part} selected={selected} onSelect={onSelect} position={annotation.position} target={annotation.target}>{annotation.label}</ModelLabel>

            <mesh position={[0, -1.8, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2.3, 64]} />
                <meshStandardMaterial color="#17283c" transparent opacity={0.35} />
            </mesh>
        </>
    );
}

export default function AnatomyLab({ onBack = () => { }, onQuizSaved }) {
    const controlsRef = useRef();
    const [selected, setSelected] = useState("uterus");
    const [modelMode, setModelMode] = useState("reference");
    const [modelStatus, setModelStatus] = useState("loading");
    const [animationPlaying, setAnimationPlaying] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const [tab, setTab] = useState("anatomy");
    const [questionIndex, setQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [showInfo, setShowInfo] = useState(true);
    const [savingQuiz, setSavingQuiz] = useState(false);
    const [quizError, setQuizError] = useState("");
    const [savedQuizResult, setSavedQuizResult] = useState(null);

    const organ = organs.find((item) => item.id === selected) || organs[0];
    const question = questions[questionIndex];
    const handleModelLoaded = useCallback(() => setModelStatus("ready"), []);
    const handleModelError = useCallback(() => setModelStatus("fallback"), []);

    const score = savedQuizResult?.score ?? 0;

    const submitQuiz = async () => {
        setSavingQuiz(true);
        setQuizError("");
        try {
            await refreshCsrf();
            const selectedAnswers = questions.map((_, index) => answers[index]);
            const { data } = await api.post("/quiz/submit/anatomy/", { answers: selectedAnswers });
            setSavedQuizResult(data);
            setShowResult(true);
            onQuizSaved?.();
        } catch (error) {
            setQuizError(error.response?.data?.detail || error.response?.data?.answers || "The result could not be saved. Check your connection and try again.");
        } finally {
            setSavingQuiz(false);
        }
    };

    const selectAnswer = (optionIndex) => {
        if (showResult) return;
        setAnswers((previous) => ({
            ...previous,
            [questionIndex]: optionIndex,
        }));
    };

    const nextQuestion = () => {
        if (questionIndex < questions.length - 1) {
            setQuestionIndex((value) => value + 1);
        } else {
            submitQuiz();
        }
    };

    const resetQuiz = () => {
        setAnswers({});
        setQuestionIndex(0);
        setShowResult(false);
        setSavedQuizResult(null);
        setQuizError("");
    };

    return (
        <div className="anatomy-page">
            <header className="anatomy-header">
                <div className="anatomy-heading">
                    <button className="back-button" onClick={onBack}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="eyebrow">OBSTETRICS & GYNAECOLOGY</div>
                        <h1>Female Reproductive Anatomy</h1>
                        <p>Interactive 3D learning laboratory</p>
                    </div>
                </div>
                <div className="lab-status">
                    <span className="live-dot" /> 3D LAB ACTIVE
                </div>
            </header>

            <div className="anatomy-tabs">
                <button
                    className={tab === "anatomy" ? "active" : ""}
                    onClick={() => setTab("anatomy")}
                >
                    <Activity size={16} /> 3D Anatomy
                </button>
                <button
                    className={tab === "learn" ? "active" : ""}
                    onClick={() => setTab("learn")}
                >
                    <BookOpen size={16} /> Learning Guide
                </button>
                <button
                    className={tab === "quiz" ? "active" : ""}
                    onClick={() => setTab("quiz")}
                >
                    <GraduationCap size={16} /> Knowledge Check
                </button>
            </div>

            {tab === "anatomy" && (
                <div className="anatomy-workspace">
                    <section className="viewer-panel">
                        <div className="viewer-top">
                            <div>
                                <span className="panel-kicker">3D MODEL VIEWER</span>
                                <h2>Reproductive system</h2>
                            </div>
                            <div className="model-camera-controls" role="group" aria-label="3D camera controls">
                                <button className="icon-button" type="button" title="Reset camera" aria-label="Reset 3D camera" onClick={() => { controlsRef.current?.reset(); setSelected("uterus"); }}><RotateCcw size={17} /></button>
                                <button className="icon-button" type="button" title="Zoom in" aria-label="Zoom in" onClick={() => { controlsRef.current?.dollyIn(1.25); controlsRef.current?.update(); }}><ZoomIn size={17} /></button>
                                <button className="icon-button" type="button" title="Zoom out" aria-label="Zoom out" onClick={() => { controlsRef.current?.dollyOut(1.25); controlsRef.current?.update(); }}><ZoomOut size={17} /></button>
                            </div>
                        </div>

                        <div className="model-mode-toggle" role="group" aria-label="Anatomy model style">
                            <button type="button" aria-pressed={modelMode === "reference"} className={modelMode === "reference" ? "active" : ""} onClick={() => { setModelStatus("loading"); setModelMode("reference"); }}>Reference GLB</button>
                            <button type="button" aria-pressed={modelMode === "cutaway"} className={modelMode === "cutaway" ? "active" : ""} onClick={() => { setAnimationPlaying(false); setModelMode("cutaway"); }}>Cutaway view</button>
                        </div>

                        <div className="three-viewer">
                            <Canvas
                                camera={{ position: [0, 0.2, 6.6], fov: 42 }}
                                dpr={[1, 2]}
                                shadows
                                gl={{ antialias: true, alpha: false }}
                            >
                                <color attach="background" args={["#0b1726"]} />
                                {modelMode === "reference" && <>
                                    <ambientLight intensity={0.82} color="#e8efff" />
                                    <directionalLight position={[3.5, 4.5, 5]} intensity={1.65} castShadow />
                                    <pointLight position={[-3, 1.4, 2.5]} intensity={0.58} color="#f2a0ba" />
                                    <pointLight position={[2.5, -1.5, -2]} intensity={0.42} color="#83bdde" />
                                </>}
                                {modelMode === "cutaway" ? <AnatomyModel selected={selected} onSelect={setSelected} /> : (
                                    <ModelErrorBoundary
                                        key={reproductiveModelUrl}
                                        onError={handleModelError}
                                        fallback={<AnatomyModel selected={selected} onSelect={setSelected} />}
                                    >
                                        <Suspense fallback={<Html center><span className="model-loading">Loading licensed model…</span></Html>}>
                                            <ReproductiveGLB
                                                url={reproductiveModelUrl}
                                                selected={selected}
                                                onSelect={setSelected}
                                                onLoaded={handleModelLoaded}
                                                animationPlaying={animationPlaying}
                                                animationSpeed={animationSpeed}
                                            />
                                        </Suspense>
                                    </ModelErrorBoundary>
                                )}
                                <OrbitControls
                                    ref={controlsRef}
                                    enablePan={false}
                                    minDistance={3.5}
                                    maxDistance={9}
                                    minPolarAngle={0.45}
                                    maxPolarAngle={2.5}
                                />
                            </Canvas>
                            <div className="viewer-hint">
                                Drag to rotate · Scroll to zoom · Select an organ
                            </div>
                        </div>

                        {modelMode === "reference" && modelStatus !== "fallback" && <div className="model-animation-controls" aria-label="Model animation controls">
                            <button type="button" className={animationPlaying ? "active" : ""} disabled={modelStatus !== "ready"} onClick={() => setAnimationPlaying((playing) => !playing)} aria-label={animationPlaying ? "Pause uterine contraction animation" : "Play uterine contraction animation"} aria-pressed={animationPlaying}>
                                {animationPlaying ? <Pause size={15} /> : <Play size={15} />}
                                {animationPlaying ? "Pause clip" : "Play contraction clip"}
                            </button>
                            <label htmlFor="contraction-speed">Clip speed <b>{animationSpeed.toFixed(1)}×</b></label>
                            <input id="contraction-speed" type="range" min="0.5" max="1.5" step="0.1" value={animationSpeed} onChange={(event) => setAnimationSpeed(Number(event.target.value))} aria-label="Animation speed" />
                            <span className="clip-rig-badge">4-joint educational rig</span>
                        </div>}

                        <p className="model-attribution">
                            {modelMode === "reference" ? <>
                                {modelStatus === "fallback" ? "The GLB could not be loaded; the interactive cutaway is shown. " : ""}
                                Model: {reproductiveModelSource.title} by {reproductiveModelSource.authors}; adapted by {reproductiveModelSource.adaptation}. {reproductiveModelSource.license}. <a href={reproductiveModelSource.url} target="_blank" rel="noreferrer">Attribution and model details</a>.
                            </> : "The cutaway view exposes the endometrium and uterine cavity, which are not separate meshes in the reference GLB."}
                        </p>

                        <div className="anatomy-color-key" aria-label="Model color key">
                            {modelMode === "reference" ? <>
                                <span><i style={{ background: "linear-gradient(135deg,#8d3039,#cf6e58)" }} />Uterine muscle and cervix</span>
                                <span><i style={{ background: "linear-gradient(135deg,#a04766,#d98b9a)" }} />Ligaments and soft tissues</span>
                                <span><i style={{ background: "#bd3f3f" }} />Uterine arteries</span>
                                <span><i style={{ background: "#284d9b" }} />Uterine veins</span>
                                <span><i style={{ background: "#c5a05b" }} />Bladder</span>
                            </> : <>
                                <span><i style={{ background: "#a95f72" }} />Myometrium / outer wall</span>
                                <span><i style={{ background: "#dc8c94" }} />Endometrium</span>
                                <span><i style={{ background: "#593648" }} />Uterine cavity</span>
                                <span><i style={{ background: "#c98270" }} />Ovary</span>
                            </>}
                            <small>Color identifies model regions, not diagnostic tissue properties.</small>
                        </div>

                        <div className="organ-selector">
                            {organs.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setSelected(item.id);
                                        if (item.id === "endometrium") setModelMode("cutaway");
                                    }}
                                    className={selected === item.id ? "selected" : ""}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </section>

                    <aside className="organ-panel">
                        <div className="panel-kicker">SELECTED STRUCTURE</div>
                        <div className="organ-icon">
                            <Activity size={24} />
                        </div>
                        <h2>{organ.name}</h2>
                        <span className="organ-category">{organ.category}</span>

                        <div className="organ-detail">
                            <h3><Info size={15} /> Function</h3>
                            <p>{organ.function}</p>
                        </div>
                        <div className="organ-detail">
                            <h3><BookOpen size={15} /> Clinical importance</h3>
                            <p>{organ.clinical}</p>
                        </div>
                        <div className="organ-location">
                            <span>ANATOMICAL LOCATION</span>
                            <strong>{organ.location}</strong>
                        </div>
                        <section className="organ-specs" aria-label="Anatomical model specifications">
                            <div className="organ-spec-title"><span>REFERENCE DIMENSIONS</span><b>Typical adult anatomy</b></div>
                            <p>{organ.sizeReference}</p>
                            {organ.sizeSource && <a href={organ.sizeSource.url} target="_blank" rel="noreferrer">Source: {organ.sizeSource.label}</a>}
                            <div className="organ-color-spec"><i style={{ background: diagramColors[organ.id] }} /><span><b>Model appearance</b><small>{organ.colorReference}</small></span></div>
                            <small className="organ-scale-note">The 3D proportions are schematic and are not calibrated to centimetres. Dimensions vary between people and with age, parity, cycle phase and pregnancy.</small>
                        </section>
                        <button
                            className="primary-lab-button"
                            onClick={() => setTab("learn")}
                        >
                            Explore learning guide <ChevronRight size={17} />
                        </button>
                    </aside>
                </div>
            )}

            {tab === "learn" && (
                <section className="learning-panel">
                    <div className="learning-title">
                        <div className="panel-kicker">STUDY MATERIAL</div>
                        <h2>Female reproductive anatomy guide</h2>
                        <p>
                            Review the major reproductive structures and their functions.
                            Select any structure to see its explanation.
                        </p>
                    </div>
                    <div className="learning-grid">
                        {organs.map((item, index) => (
                            <button
                                className="learning-card"
                                key={item.id}
                                onClick={() => {
                                    setSelected(item.id);
                                    if (item.id === "endometrium") setModelMode("cutaway");
                                    setTab("anatomy");
                                }}
                            >
                                <span className="learning-number">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <h3>{item.name}</h3>
                                <p>{item.function}</p>
                                <span className="learn-more">
                                    View in 3D <ChevronRight size={15} />
                                </span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {tab === "quiz" && (
                <section className="quiz-panel">
                    <div className="quiz-heading">
                        <div className="panel-kicker">STUDENT ASSESSMENT</div>
                        <h2>Knowledge check</h2>
                        <p>Test your understanding of female reproductive anatomy.</p>
                    </div>

                    {!showResult ? (
                        <div className="quiz-card">
                            <div className="quiz-progress">
                                <span>QUESTION {questionIndex + 1} OF {questions.length}</span>
                                <span>{Math.round(((questionIndex + 1) / questions.length) * 100)}%</span>
                            </div>
                            <div className="progress-track">
                                <div
                                    style={{
                                        width: `${((questionIndex + 1) / questions.length) * 100}%`,
                                    }}
                                />
                            </div>
                            <h3>{question.question}</h3>
                            <div className="answer-list">
                                {question.options.map((option, index) => (
                                    <button
                                        key={option}
                                        className={answers[questionIndex] === index ? "chosen" : ""}
                                        onClick={() => selectAnswer(index)}
                                    >
                                        <span>{String.fromCharCode(65 + index)}</span>
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="primary-lab-button next-question"
                                disabled={answers[questionIndex] === undefined || savingQuiz}
                                onClick={nextQuestion}
                            >
                                {savingQuiz
                                    ? "Saving result…"
                                    : questionIndex === questions.length - 1
                                    ? "Finish and save assessment"
                                    : "Next question"}
                                <ChevronRight size={17} />
                            </button>
                            {quizError && <p className="assessment-feedback" role="alert">{quizError}</p>}
                        </div>
                    ) : (
                        <div className="quiz-result">
                            <CheckCircle2 size={48} />
                            <h2>Assessment completed</h2>
                            <div className="quiz-score">
                                {score} / {questions.length}
                            </div>
                            <p>
                                {score === questions.length
                                    ? "Excellent work! You answered every question correctly."
                                    : "Review the learning guide and try again to improve your score."}
                            </p>
                            <p className="quiz-save-confirmation">Result saved to your study record: {savedQuizResult?.score}/{savedQuizResult?.total} ({savedQuizResult?.percentage}%).</p>
                            <button className="primary-lab-button" onClick={resetQuiz}>
                                <RotateCcw size={16} /> Retake assessment
                            </button>
                            <button className="secondary-lab-button" onClick={() => setTab("learn")}>
                                Review study material
                            </button>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
