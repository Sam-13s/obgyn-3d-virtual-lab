import React, { useState } from "react";
import AnatomyLab from "./AnatomyLab.jsx";
import {
    Canvas,
} from "@react-three/fiber";


import { OrbitControls, Html, Float } from "@react-three/drei";
import {
    Activity, BookOpen, LayoutDashboard, HeartPulse, Baby,
    ClipboardList, GraduationCap, Settings, Search, Bell,
    Menu, X, ChevronRight, Play, Clock, CheckCircle2,
    Users, Stethoscope, RotateCcw, Maximize2, Sparkles
} from "lucide-react";

/* Eight OB-GYN learning modules */
const modules = [
    { id: 1, title: "Female Reproductive Anatomy", category: "Anatomy", icon: "🧬", progress: 75, lessons: 8 },
    { id: 2, title: "Menstrual Cycle", category: "Physiology", icon: "🌸", progress: 45, lessons: 6 },
    { id: 3, title: "Pregnancy & Fetal Development", category: "Obstetrics", icon: "🤰", progress: 60, lessons: 10 },
    { id: 4, title: "Antenatal Care", category: "Obstetrics", icon: "🩺", progress: 20, lessons: 7 },
    { id: 5, title: "Stages of Labour", category: "Labour", icon: "👶", progress: 0, lessons: 9 },
    { id: 6, title: "Normal & Assisted Delivery", category: "Delivery", icon: "🏥", progress: 0, lessons: 8 },
    { id: 7, title: "Gynecological Conditions", category: "Gynecology", icon: "💗", progress: 0, lessons: 10 },
    { id: 8, title: "Family Planning & Reproductive Health", category: "Reproductive Health", icon: "🌿", progress: 0, lessons: 6 }
];

const navigation = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "3D Anatomy Lab", icon: Activity },
    { label: "Learning Modules", icon: BookOpen },
    { label: "Clinical Procedures", icon: Stethoscope },
    { label: "Assessments", icon: ClipboardList },
    { label: "My Progress", icon: GraduationCap }
];

/* 3D educational model: simplified reproductive anatomy.
   This is an illustrative learning model, not a clinical model. */
function Tube({ points, radius = 0.055, color = "#e9a0a9" }) {
    const curve = new THREE.CatmullRomCurve3(
        points.map(([x, y, z]) => new THREE.Vector3(x, y, z))
    );

    return (
        <mesh>
            <tubeGeometry args={[curve, 40, radius, 12, false]} />
            <meshStandardMaterial color={color} roughness={0.42} metalness={0.05} />
        </mesh>
    );
}

function AnatomyModel() {
    return (
        <group position={[0, -0.15, 0]}>
            {/* Uterine body */}
            <mesh position={[0, 0.15, 0]} scale={[0.66, 0.83, 0.39]}>
                <sphereGeometry args={[1, 48, 48]} />
                <meshStandardMaterial color="#c96f85" roughness={0.38} />
            </mesh>

            {/* Fundus */}
            <mesh position={[0, 0.79, 0]} scale={[0.59, 0.35, 0.37]}>
                <sphereGeometry args={[1, 40, 40]} />
                <meshStandardMaterial color="#df8d9b" roughness={0.4} />
            </mesh>

            {/* Cervix */}
            <mesh position={[0, -0.78, 0]} scale={[0.25, 0.56, 0.25]}>
                <cylinderGeometry args={[0.25, 0.17, 1, 32]} />
                <meshStandardMaterial color="#b75d75" roughness={0.45} />
            </mesh>

            {/* Left and right fallopian tubes */}
            <Tube points={[[-0.35, 0.72, 0], [-0.78, 1.03, 0], [-1.18, 1.05, 0.02], [-1.43, 0.75, 0.04]]} />
            <Tube points={[[0.35, 0.72, 0], [0.78, 1.03, 0], [1.18, 1.05, 0.02], [1.43, 0.75, 0.04]]} />

            {/* Ovaries */}
            <mesh position={[-1.48, 0.66, 0.02]} scale={[0.27, 0.34, 0.23]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color="#e8a5ac" roughness={0.5} />
            </mesh>
            <mesh position={[1.48, 0.66, 0.02]} scale={[0.27, 0.34, 0.23]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color="#e8a5ac" roughness={0.5} />
            </mesh>

            {/* Anatomical labels */}
            <Html position={[0.05, 1.25, 0]} center distanceFactor={7}>
                <span className="anatomy-label">Uterine fundus</span>
            </Html>
            <Html position={[1.8, 0.7, 0]} center distanceFactor={7}>
                <span className="anatomy-label">Ovary</span>
            </Html>
            <Html position={[0.35, -1.2, 0]} center distanceFactor={7}>
                <span className="anatomy-label">Cervix</span>
            </Html>
        </group>
    );
}

import * as THREE from "three";

function AnatomyViewer() {
    const [autoRotate, setAutoRotate] = useState(true);

    return (
        <div className="anatomy-viewer">
            <div className="viewer-toolbar">
                <div>
                    <span className="live-dot" /> INTERACTIVE 3D MODEL
                </div>
                <button className="viewer-icon" onClick={() => setAutoRotate(!autoRotate)} title="Toggle rotation">
                    <RotateCcw size={17} />
                </button>
            </div>

            <Canvas camera={{ position: [0, 0.2, 5.5], fov: 42 }}>
                <ambientLight intensity={1.7} />
                <directionalLight position={[4, 5, 5]} intensity={2.5} />
                <pointLight position={[-4, 2, 3]} intensity={1.5} color="#6b9cff" />
                <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.12}>
                    <AnatomyModel />
                </Float>
                <OrbitControls
                    enablePan
                    enableZoom
                    minDistance={3}
                    maxDistance={8}
                    autoRotate={autoRotate}
                    autoRotateSpeed={1.2}
                />
            </Canvas>

            <div className="viewer-hint">Drag to rotate · Scroll to zoom</div>
        </div>
    );
}

function App() {
    const [activePage, setActivePage] = useState("Overview");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredModules = modules.filter((module) =>
        module.title.toLowerCase().includes(search.toLowerCase())
    );

    const openPage = (page) => {
        setActivePage(page);
        setMobileOpen(false);
    };

    return (
        <div className="app-shell">
            {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

            <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
                <div className="brand">
                    <div className="brand-icon"><HeartPulse size={25} /></div>
                    <div>
                        <h2>OB<span>·</span>GYN LAB</h2>
                        <p>VIRTUAL LEARNING</p>
                    </div>
                    <button className="mobile-close" onClick={() => setMobileOpen(false)}><X /></button>
                </div>

                <div className="sidebar-section">WORKSPACE</div>
                <nav className="nav-list">
                    {navigation.map(({ label, icon: Icon }) => (
                        <button
                            key={label}
                            onClick={() => openPage(label)}
                            className={`nav-item ${activePage === label ||
                                (label === "3D Anatomy Lab" &&
                                    activePage === "Female Reproductive Anatomy")
                                ? "active"
                                : ""
                                }`}
                        >
                            <Icon size={19} />
                            <span>{label}</span>
                            {label === "3D Anatomy Lab" && <span className="nav-new">3D</span>}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-section module-section">STUDY MODULES</div>
                <div className="sidebar-modules">
                    {modules.map((module) => (
                        <button key={module.id} className="side-module" onClick={() => openPage(module.title)}>
                            <span>{module.icon}</span>
                            <span>{module.title}</span>
                        </button>
                    ))}
                </div>

                <div className="sidebar-bottom">
                    <button className="nav-item" onClick={() => openPage("Settings")}>
                        <Settings size={19} /><span>Settings</span>
                    </button>
                    <div className="student-card">
                        <div className="avatar">GN</div>
                        <div><strong>GNM Student</strong><small>3rd Year · Learner</small></div>
                    </div>
                </div>
            </aside>

            <main className="main-area">
                <header className="topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu /></button>
                        <div className="breadcrumb">Workspace <ChevronRight size={14} /> <strong>{activePage}</strong></div>
                    </div>
                    <div className="topbar-right">
                        <div className="search-box">
                            <Search size={17} />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search learning modules..." />
                            <kbd>⌘ K</kbd>
                        </div>
                        <button className="notification-button"><Bell size={19} /><i /></button>
                        <div className="top-avatar">GN</div>
                    </div>
                </header>

                <div className="page-content">
                    {activePage === "3D Anatomy Lab" ||
                        activePage === "Female Reproductive Anatomy" ? (
                        <AnatomyLab onBack={() => openPage("Overview")} />
                    ) : (
                        <>

                            <section className="welcome-row">
                                <div>
                                    <div className="eyebrow"><Sparkles size={14} /> YOUR VIRTUAL CLINICAL CLASSROOM</div>
                                    <h1>Welcome to your <span>OB-GYN Lab.</span></h1>
                                    <p>Explore anatomy, understand clinical concepts and learn through interactive simulations.</p>
                                </div>
                                <div className="date-chip"><Activity size={16} /> GNM · THIRD YEAR</div>
                            </section>

                            <section className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon purple"><BookOpen /></div>
                                    <div><span>Available modules</span><strong>08</strong><small>Learning pathways</small></div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon blue"><CheckCircle2 /></div>
                                    <div><span>Completed lessons</span><strong>12</strong><small>Across all modules</small></div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon pink"><Clock /></div>
                                    <div><span>Learning hours</span><strong>24.5</strong><small>Total study time</small></div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon green"><GraduationCap /></div>
                                    <div><span>Overall progress</span><strong>38%</strong><small>Keep learning!</small></div>
                                </div>
                            </section>

                            {(activePage === "Overview" || activePage === "3D Anatomy Lab") && (
                                <section className="feature-grid">
                                    <div className="panel anatomy-panel">
                                        <div className="panel-heading">
                                            <div><span className="section-kicker">EXPLORE IN 3D</span><h2>Female Reproductive Anatomy</h2></div>
                                            <span className="model-tag">3D MODEL</span>
                                        </div>
                                        <AnatomyViewer />
                                        <div className="anatomy-footer">
                                            <div><strong>Reproductive system</strong><span>Interactive anatomical overview</span></div>
                                            <button onClick={() => openPage("Female Reproductive Anatomy")}>Explore lesson <ChevronRight size={16} /></button>
                                        </div>
                                    </div>

                                    <div className="panel continue-panel">
                                        <div className="panel-heading"><div><span className="section-kicker">PICK UP WHERE YOU LEFT OFF</span><h2>Continue learning</h2></div></div>
                                        <div className="continue-illustration"><span>🤰</span><div className="illustration-orbit orbit-one" /><div className="illustration-orbit orbit-two" /></div>
                                        <span className="lesson-category">OBSTETRICS · MODULE 03</span>
                                        <h3>Pregnancy & Fetal Development</h3>
                                        <p>Understand fetal growth and the stages of pregnancy.</p>
                                        <div className="progress-line"><span style={{ width: "60%" }} /></div>
                                        <div className="progress-meta"><span>60% completed</span><span>6 of 10 lessons</span></div>
                                        <button className="primary-button" onClick={() => openPage("Pregnancy & Fetal Development")}> <Play size={16} fill="currentColor" /> Continue lesson</button>
                                    </div>
                                </section>
                            )}

                            <section className="modules-section">
                                <div className="section-heading">
                                    <div><span className="section-kicker">YOUR LEARNING PATH</span><h2>{activePage === "Overview" ? "Explore learning modules" : activePage}</h2></div>
                                    <span className="module-count">08 MODULES</span>
                                </div>

                                <div className="module-grid">
                                    {filteredModules.map((module) => (
                                        <article className="module-card" key={module.id}>
                                            <div className="module-card-top">
                                                <div className="module-emoji">{module.icon}</div>
                                                <span className="module-number">MODULE 0{module.id}</span>
                                            </div>
                                            <span className="module-category">{module.category}</span>
                                            <h3>{module.title}</h3>
                                            <div className="module-progress">
                                                <div className="progress-line"><span style={{ width: `${module.progress}%` }} /></div>
                                                <div className="progress-meta"><span>{module.progress}% complete</span><span>{module.lessons} lessons</span></div>
                                            </div>
                                            <button className="module-link" onClick={() => openPage(module.title)}>
                                                {module.progress ? "Continue learning" : "Start learning"} <ChevronRight size={16} />
                                            </button>
                                        </article>
                                    ))}
                                </div>
                                {filteredModules.length === 0 && <div className="empty-state">No modules match your search.</div>}
                            </section>

                            <footer className="footer">
                                <span>OB-GYN 3D VIRTUAL LAB</span>
                                <span>Educational simulation · GNM Third Year</span>
                            </footer>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
