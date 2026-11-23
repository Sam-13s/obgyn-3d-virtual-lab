
import React, { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Float } from "@react-three/drei";
import * as THREE from "three";
import {
    ArrowLeft,
    RotateCcw,
    ZoomIn,
    ZoomOut,
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
    },
];

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
                color={active ? "#f7a7ca" : color}
                roughness={0.48}
                metalness={0.04}
                emissive={active ? "#702b53" : "#000000"}
                emissiveIntensity={active ? 0.25 : 0}
            />
        </mesh>
    );
}

function Tube({ points, active, onSelect }) {
    const geometry = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3(
            points.map((point) => new THREE.Vector3(...point))
        );
        return new THREE.TubeGeometry(curve, 48, 0.055, 12, false);
    }, [points]);

    return (
        <mesh
            geometry={geometry}
            onClick={(event) => {
                event.stopPropagation();
                onSelect("tube");
            }}
        >
            <meshStandardMaterial
                color={active ? "#ffc2d8" : "#e99aab"}
                roughness={0.5}
            />
        </mesh>
    );
}

function AnatomyModel({ selected, onSelect }) {
    return (
        <>
            <ambientLight intensity={1.1} />
            <directionalLight
                position={[4, 5, 6]}
                intensity={2}
                castShadow
            />
            <pointLight position={[-4, 1, 3]} intensity={1.2} color="#b8d5ff" />

            <Float speed={1} rotationIntensity={0.025} floatIntensity={0.08}>
                {/* Uterine body */}
                <Organ
                    id="uterus"
                    position={[0, 0.35, 0]}
                    scale={[0.83, 0.92, 0.43]}
                    active={selected === "uterus"}
                    onSelect={onSelect}
                    color="#d878a1"
                />

                {/* Fundus */}
                <Organ
                    id="fundus"
                    position={[0, 0.98, 0]}
                    scale={[0.78, 0.39, 0.43]}
                    active={selected === "fundus"}
                    onSelect={onSelect}
                    color="#d878a1"
                />

                {/* Endometrial inner surface - illustrative front cutaway */}
                <Organ
                    id="endometrium"
                    position={[0, 0.39, 0.405]}
                    scale={[0.43, 0.57, 0.055]}
                    active={selected === "endometrium"}
                    onSelect={onSelect}
                    color="#f1a2bc"
                />

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
                        color={selected === "cervix" ? "#f7a7ca" : "#c76d91"}
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
                        color={selected === "vagina" ? "#f7a7ca" : "#bd7890"}
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
                    color="#e6a16e"
                />
                <Organ
                    id="ovary"
                    position={[1.5, 0.65, 0]}
                    scale={[0.25, 0.36, 0.2]}
                    active={selected === "ovary"}
                    onSelect={onSelect}
                    color="#e6a16e"
                />
            </Float>

            <Html position={[0, 1.8, 0]} center>
                <div className="model-label">FEMALE REPRODUCTIVE SYSTEM</div>
            </Html>

            <mesh position={[0, -1.8, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2.3, 64]} />
                <meshStandardMaterial color="#17283c" transparent opacity={0.35} />
            </mesh>
        </>
    );
}

export default function AnatomyLab({ onBack = () => { } }) {
    const [selected, setSelected] = useState("uterus");
    const [tab, setTab] = useState("anatomy");
    const [questionIndex, setQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [showInfo, setShowInfo] = useState(true);

    const organ = organs.find((item) => item.id === selected) || organs[0];
    const question = questions[questionIndex];

    const score = questions.reduce(
        (total, item, index) =>
            total + (answers[index] === item.answer ? 1 : 0),
        0
    );

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
            setShowResult(true);
        }
    };

    const resetQuiz = () => {
        setAnswers({});
        setQuestionIndex(0);
        setShowResult(false);
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
                            <button
                                className="icon-button"
                                title="Select uterus"
                                onClick={() => setSelected("uterus")}
                            >
                                <RotateCcw size={17} />
                            </button>
                        </div>

                        <div className="three-viewer">
                            <Canvas
                                camera={{ position: [0, 0.2, 6], fov: 42 }}
                                dpr={[1, 1.5]}
                                shadows
                            >
                                <color attach="background" args={["#0b1726"]} />
                                <AnatomyModel selected={selected} onSelect={setSelected} />
                                <OrbitControls
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

                        <div className="organ-selector">
                            {organs.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelected(item.id)}
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
                                disabled={answers[questionIndex] === undefined}
                                onClick={nextQuestion}
                            >
                                {questionIndex === questions.length - 1
                                    ? "Finish assessment"
                                    : "Next question"}
                                <ChevronRight size={17} />
                            </button>
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
