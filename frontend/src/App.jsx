import React, { Component, Suspense, useCallback, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import {
    Activity, BookOpen, LayoutDashboard, HeartPulse,
    ClipboardList, GraduationCap, Settings, Search, Bell,
    Menu, X, ChevronRight, Play, Clock, CheckCircle2, UsersRound, LogOut,
    Stethoscope, RotateCcw, Sparkles
} from "lucide-react";
import AnatomyLab from "./AnatomyLab.jsx";
import PregnancyLab from "./PregnancyLab.jsx";
import MenstrualCycleLab from "./MenstrualCycleLab.jsx";
import AntenatalCareLab from "./AntenatalCareLab.jsx";
import StagesOfLabourLab from "./StagesOfLabourLab.jsx";
import NormalAssistedDeliveryLab from "./NormalAssistedDeliveryLab.jsx";
import GynecologicalConditionsLab from "./GynecologicalConditionsLab.jsx";
import FamilyPlanningLab from "./FamilyPlanningLab.jsx";
import ModelLabel from "./components/ModelLabel.jsx";
import ReproductiveGLB from "./components/ReproductiveGLB.jsx";
import { reproductiveModelUrl } from "./data/anatomyModelCatalog.js";
import AdminUsers from "./AdminUsers.jsx";
import AssessmentPage from "./AssessmentPage.jsx";
import api from "./api.js";

/* Eight OB-GYN learning modules */
const modules = [
    { id: 1, title: "Female Reproductive Anatomy", category: "Anatomy", icon: "🧬" },
    { id: 2, title: "Menstrual Cycle", category: "Physiology", icon: "🌸" },
    { id: 3, title: "Pregnancy & Fetal Development", category: "Obstetrics", icon: "🤰" },
    { id: 4, title: "Antenatal Care", category: "Obstetrics", icon: "🩺" },
    { id: 5, title: "Stages of Labour", category: "Labour", icon: "👶" },
    { id: 6, title: "Normal & Assisted Delivery", category: "Delivery", icon: "🏥" },
    { id: 7, title: "Gynecological Conditions", category: "Gynecology", icon: "💗" },
    { id: 8, title: "Family Planning & Reproductive Health", category: "Reproductive Health", icon: "🌿" }
];

const navigation = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "3D Anatomy Lab", icon: Activity },
    { label: "Learning Modules", icon: BookOpen },
    { label: "Clinical Procedures", icon: Stethoscope },
    { label: "Assessments", icon: ClipboardList },
    { label: "My Progress", icon: GraduationCap }
];

const moduleKeyByTitle = {
    "Female Reproductive Anatomy": "female-reproductive-anatomy",
    "3D Anatomy Lab": "female-reproductive-anatomy",
    "Menstrual Cycle": "menstrual-cycle",
    "Pregnancy & Fetal Development": "pregnancy-development",
    "Antenatal Care": "antenatal-care",
    "Stages of Labour": "stages-of-labour",
    "Normal & Assisted Delivery": "normal-assisted-delivery",
    "Gynecological Conditions": "gynecological-conditions",
    "Family Planning & Reproductive Health": "family-planning",
};

const emptyStudySnapshot = {
    modules: [],
    totals: { seconds_studied: 0, modules_started: 0, quiz_attempts: 0 },
    quiz: { attempt_count: 0, best_percentage: null, latest: null },
};

const formatStudyTime = (seconds = 0) => {
    const minutes = Math.floor(seconds / 60);
    if (!minutes) return seconds ? "Under 1 min" : "0 min";
    const hours = Math.floor(minutes / 60);
    return hours ? `${hours} hr ${minutes % 60} min` : `${minutes} min`;
};

const mergeStudyActivity = (snapshot, activity) => {
    const existing = snapshot.modules.find((item) => item.module_key === activity.module_key);
    const updatedModules = existing
        ? snapshot.modules.map((item) => item.module_key === activity.module_key ? activity : item)
        : [...snapshot.modules, activity];
    return {
        ...snapshot,
        modules: updatedModules.sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity)),
        totals: {
            ...snapshot.totals,
            modules_started: updatedModules.length,
            seconds_studied: updatedModules.reduce((total, item) => total + item.seconds_studied, 0),
        },
    };
};

/* 3D educational model: simplified reproductive anatomy.
   This is an illustrative learning model, not a clinical model. */
function Tube({ points, radius = 0.055, color = "#e9a0a9", active = false }) {
    const curve = new THREE.CatmullRomCurve3(
        points.map(([x, y, z]) => new THREE.Vector3(x, y, z))
    );

    return (
        <mesh>
            <tubeGeometry args={[curve, 40, radius, 12, false]} />
            <meshStandardMaterial color={active ? "#ffe19a" : color} emissive={active ? "#d79236" : "#000000"} emissiveIntensity={active ? 0.55 : 0} roughness={0.42} metalness={0.05} />
        </mesh>
    );
}

function AnatomyModel({ selected, onSelect }) {
    return (
        <group position={[0, -0.15, 0]}>
            {/* Uterine body */}
            <mesh position={[0, 0.15, 0]} scale={[0.66, 0.83, 0.39]}>
                <sphereGeometry args={[1, 48, 48]} />
                <meshStandardMaterial color={selected === "uterus" ? "#f4abc2" : "#c96f85"} emissive={selected === "uterus" ? "#7b2c55" : "#000000"} emissiveIntensity={selected === "uterus" ? 0.4 : 0} roughness={0.38} />
            </mesh>

            {/* Fundus */}
            <mesh position={[0, 0.79, 0]} scale={[0.59, 0.35, 0.37]}>
                <sphereGeometry args={[1, 40, 40]} />
                <meshStandardMaterial color={selected === "uterus" ? "#ffd0d2" : "#df8d9b"} emissive={selected === "uterus" ? "#7b2c55" : "#000000"} emissiveIntensity={selected === "uterus" ? 0.3 : 0} roughness={0.4} />
            </mesh>

            {/* Cervix */}
            <mesh position={[0, -0.78, 0]} scale={[0.25, 0.56, 0.25]}>
                <cylinderGeometry args={[0.25, 0.17, 1, 32]} />
                <meshStandardMaterial color={selected === "cervix" ? "#f4abc2" : "#b75d75"} emissive={selected === "cervix" ? "#7b2c55" : "#000000"} emissiveIntensity={selected === "cervix" ? 0.4 : 0} roughness={0.45} />
            </mesh>

            {/* Left and right fallopian tubes */}
            <Tube points={[[-0.35, 0.72, 0], [-0.78, 1.03, 0], [-1.18, 1.05, 0.02], [-1.43, 0.75, 0.04]]} active={selected === "tube"} />
            <Tube points={[[0.35, 0.72, 0], [0.78, 1.03, 0], [1.18, 1.05, 0.02], [1.43, 0.75, 0.04]]} active={selected === "tube"} />

            {/* Ovaries */}
            <mesh position={[-1.48, 0.66, 0.02]} scale={[0.27, 0.34, 0.23]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color={selected === "ovary" ? "#ffe1bd" : "#e8a5ac"} emissive={selected === "ovary" ? "#784332" : "#000000"} emissiveIntensity={selected === "ovary" ? 0.4 : 0} roughness={0.5} />
            </mesh>
            <mesh position={[1.48, 0.66, 0.02]} scale={[0.27, 0.34, 0.23]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color={selected === "ovary" ? "#ffe1bd" : "#e8a5ac"} emissive={selected === "ovary" ? "#784332" : "#000000"} emissiveIntensity={selected === "ovary" ? 0.4 : 0} roughness={0.5} />
            </mesh>

            {selected === "uterus" && <ModelLabel className="anatomy-floating-label" part="uterus" selected={selected} onSelect={onSelect} position={[-1.7, 1.45, 0.18]} target={[0, 0.2, 0.22]}>Uterus</ModelLabel>}
            {selected === "tube" && <ModelLabel className="anatomy-floating-label" part="tube" selected={selected} onSelect={onSelect} position={[1.75, 1.35, 0.18]} target={[0.92, 0.98, 0.02]}>Fallopian tube</ModelLabel>}
            {selected === "ovary" && <ModelLabel className="anatomy-floating-label" part="ovary" selected={selected} onSelect={onSelect} position={[1.75, 0.45, 0.18]} target={[1.48, 0.66, 0.12]}>Ovary</ModelLabel>}
            {selected === "cervix" && <ModelLabel className="anatomy-floating-label" part="cervix" selected={selected} onSelect={onSelect} position={[-1.75, -0.45, 0.18]} target={[0, -0.78, 0.16]}>Cervix</ModelLabel>}
        </group>
    );
}

class OverviewModelBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function AnatomyViewer() {
    const [autoRotate, setAutoRotate] = useState(true);
    const [selected, setSelected] = useState("uterus");

    return (
        <div className="anatomy-viewer">
            <div className="viewer-toolbar">
                <div>
                    <span className="live-dot" /> INTERACTIVE 3D MODEL
                </div>
                <button
                    className="viewer-icon"
                    onClick={() => setAutoRotate(!autoRotate)}
                    title="Toggle rotation"
                    aria-label={autoRotate ? "Pause model rotation" : "Resume model rotation"}
                    aria-pressed={autoRotate}
                >
                    <RotateCcw size={17} />
                </button>
            </div>

            <Canvas camera={{ position: [0, 0.2, 5.5], fov: 42 }}>
                <ambientLight intensity={1.7} />
                <directionalLight position={[4, 5, 5]} intensity={2.5} />
                <pointLight position={[-4, 2, 3]} intensity={1.5} color="#6b9cff" />
                <OverviewModelBoundary fallback={<Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.12}><AnatomyModel selected={selected} onSelect={setSelected} /></Float>}>
                    <Suspense fallback={<Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.12}><AnatomyModel selected={selected} onSelect={setSelected} /></Float>}>
                        <ReproductiveGLB selected={selected} onSelect={setSelected} url={reproductiveModelUrl} />
                    </Suspense>
                </OverviewModelBoundary>
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

function App({ currentUser, onLogout, onRequestAuth }) {
    const [activePage, setActivePage] = useState("Overview");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [settings, setSettings] = useState({ animations: true });
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [studySnapshot, setStudySnapshot] = useState(emptyStudySnapshot);
    const [studyTrackingError, setStudyTrackingError] = useState(false);

    const refreshStudySummary = useCallback(async () => {
        if (!currentUser) return;
        try {
            const { data } = await api.get("/study/progress/");
            setStudySnapshot(data);
            setStudyTrackingError(false);
        } catch {
            setStudyTrackingError(true);
        }
    }, [currentUser?.id]);

    useEffect(() => { refreshStudySummary(); }, [refreshStudySummary]);
    useEffect(() => { if (activePage === "My Progress") refreshStudySummary(); }, [activePage, refreshStudySummary]);

    const trackedModuleKey = currentUser ? moduleKeyByTitle[activePage] : null;
    useEffect(() => {
        if (!trackedModuleKey) return undefined;

        let pendingRequests = Promise.resolve();
        let lastTick = performance.now();
        let wasActive = document.visibilityState === "visible" && document.hasFocus();
        let elapsedRemainder = 0;
        const sendActivity = (payload) => {
            pendingRequests = pendingRequests
                .then(() => api.post("/study/activity/", payload))
                .then(({ data }) => {
                    setStudySnapshot((current) => mergeStudyActivity(current, data));
                    setStudyTrackingError(false);
                })
                .catch(() => setStudyTrackingError(true));
        };

        sendActivity({ module_key: trackedModuleKey, action: "open" });
        const collectVisibleTime = () => {
            const now = performance.now();
            const elapsed = (now - lastTick) / 1000;
            lastTick = now;
            if (wasActive) elapsedRemainder += elapsed;
            wasActive = document.visibilityState === "visible" && document.hasFocus();
            while (elapsedRemainder >= 1) {
                const wholeSeconds = Math.min(60, Math.floor(elapsedRemainder));
                elapsedRemainder -= wholeSeconds;
                sendActivity({ module_key: trackedModuleKey, action: "time", seconds: wholeSeconds });
            }
        };
        const interval = window.setInterval(collectVisibleTime, 5000);
        document.addEventListener("visibilitychange", collectVisibleTime);
        window.addEventListener("focus", collectVisibleTime);
        window.addEventListener("blur", collectVisibleTime);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener("visibilitychange", collectVisibleTime);
            window.removeEventListener("focus", collectVisibleTime);
            window.removeEventListener("blur", collectVisibleTime);
            collectVisibleTime();
            const finalSeconds = Math.floor(elapsedRemainder);
            if (finalSeconds > 0) sendActivity({ module_key: trackedModuleKey, action: "time", seconds: finalSeconds });
        };
    }, [currentUser?.id, trackedModuleKey]);

    const filteredModules = modules.filter((module) =>
        module.title.toLowerCase().includes(search.toLowerCase())
    );
    const studyByKey = new Map(studySnapshot.modules.map((item) => [item.module_key, item]));
    const latestStudyModule = studySnapshot.modules[0];
    const continueModule = modules.find((module) => module.id === 1 && !latestStudyModule)
        || modules.find((module) => moduleKeyByTitle[module.title] === latestStudyModule?.module_key)
        || modules[0];
    const continueRecord = studyByKey.get(moduleKeyByTitle[continueModule.title]);

    const openPage = (page) => {
        if (!currentUser && page !== "Overview") {
            onRequestAuth?.("login");
            return;
        }
        setActivePage(page);
        setMobileOpen(false);
        setNotificationsOpen(false);
    };

    return (
        <div className={`app-shell ${settings.animations ? "" : "reduced-motion"}`}>
            {mobileOpen && (
                <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
            )}

            <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
                <div className="brand">
                    <div className="brand-icon"><HeartPulse size={25} /></div>
                    <div>
                        <h2>OB<span>·</span>GYN LAB</h2>
                        <p>VIRTUAL LEARNING</p>
                    </div>
                    <button className="mobile-close" onClick={() => setMobileOpen(false)}>
                        <X />
                    </button>
                </div>

                <div className="sidebar-section">WORKSPACE</div>
                <nav className="nav-list">
                    {navigation.map(({ label, icon: Icon }) => (
                        <button
                            key={label}
                            onClick={() => openPage(label)}
                            className={`nav-item ${
                                activePage === label ||
                                (label === "3D Anatomy Lab" && activePage === "Female Reproductive Anatomy") ||
                                (label === "Learning Modules" && modules.some((module) => module.title === activePage))
                                    ? "active"
                                    : ""
                            }`}
                        >
                            <Icon size={19} />
                            <span>{label}</span>
                            {label === "3D Anatomy Lab" && <span className="nav-new">3D</span>}
                        </button>
                    ))}
                    {currentUser?.is_staff && <button onClick={() => openPage("User Management")} className={`nav-item ${activePage === "User Management" ? "active" : ""}`}><UsersRound size={19} /><span>User Management</span><span className="nav-new">ADMIN</span></button>}
                </nav>

                <div className="sidebar-section module-section">STUDY MODULES</div>
                <div className="sidebar-modules">
                    {modules.map((module) => (
                        <button
                            key={module.id}
                            className={`side-module ${activePage === module.title ? "active" : ""}`}
                            onClick={() => openPage(module.title)}
                        >
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
                        <div className="avatar">{(currentUser?.first_name?.[0] || currentUser?.username?.[0] || "G").toUpperCase()}</div>
                        <div>
                            <strong>{currentUser?.first_name || currentUser?.username || "Guest"}</strong>
                            <small>{currentUser?.is_staff ? "Administrator" : currentUser ? "Learner account" : "Sign in to unlock features"}</small>
                        </div>
                        {currentUser && <button className="logout-button" onClick={onLogout} title="Log out" aria-label="Log out"><LogOut size={16} /></button>}
                    </div>
                </div>
            </aside>

            <main className="main-area">
                <header className="topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu" onClick={() => setMobileOpen(true)}>
                            <Menu />
                        </button>
                        <div className="breadcrumb">
                            Workspace <ChevronRight size={14} /> <strong>{activePage}</strong>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <div className="search-box">
                            <Search size={17} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && filteredModules[0]) openPage(filteredModules[0].title);
                                }}
                                placeholder="Search learning modules..."
                                aria-label="Search learning modules; press Enter to open the first result"
                            />
                            <kbd>⌘ K</kbd>
                        </div>
                        <button className="notification-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}>
                            <Bell size={19} /><i />
                        </button>
                        {notificationsOpen && <div className="notification-popover"><b>Learning reminders</b><p>Your OB-GYN learning modules are ready to explore.</p><button onClick={() => setNotificationsOpen(false)}>Got it</button></div>}
                        {currentUser ? <div className="top-avatar" title={currentUser.username}>{(currentUser.first_name?.[0] || currentUser.username?.[0] || "U").toUpperCase()}</div> : <div className="guest-auth-actions"><button className="guest-signup" onClick={() => onRequestAuth?.("signup")}>Create account</button><button className="guest-login" onClick={() => onRequestAuth?.("login")}>Log in</button></div>}
                    </div>
                </header>

                <div className="page-content">
                    {activePage === "User Management" ? (
                        currentUser?.is_staff ? <AdminUsers currentUser={currentUser} /> : <section className="utility-page"><h1>Administrator access required</h1></section>
                    ) : activePage === "3D Anatomy Lab" ||
                    activePage === "Female Reproductive Anatomy" ? (
                        <AnatomyLab onBack={() => openPage("Overview")} onQuizSaved={refreshStudySummary} />
                    ) : activePage === "Menstrual Cycle" ? (
                        <MenstrualCycleLab />
                    ) : activePage === "Antenatal Care" ? (
                        <AntenatalCareLab />
                    ) : activePage === "Stages of Labour" ? (
                        <StagesOfLabourLab />
                    ) : activePage === "Normal & Assisted Delivery" ? (
                        <NormalAssistedDeliveryLab />
                    ) : activePage === "Gynecological Conditions" ? (
                        <GynecologicalConditionsLab />
                    ) : activePage === "Pregnancy & Fetal Development" ? (
                        <PregnancyLab onBack={() => openPage("Overview")} />
                    ) : activePage === "Family Planning & Reproductive Health" ? (
                        <FamilyPlanningLab />
                    ) : activePage === "Clinical Procedures" ? (
                        <section className="utility-page">
                            <div className="utility-heading"><span className="section-kicker">PRACTICAL LEARNING</span><h1>Clinical Procedures</h1><p>Explore supervised, evidence-informed learning modules for antenatal care, labour, delivery and gynecological assessment.</p></div>
                            <div className="utility-card-grid">{["Antenatal Care", "Stages of Labour", "Normal & Assisted Delivery", "Gynecological Conditions"].map((title) => <button className="utility-card" key={title} onClick={() => openPage(title)}><span className="utility-card-icon"><Stethoscope size={19} /></span><b>{title}</b><span>Open interactive lesson <ChevronRight size={15} /></span></button>)}</div>
                        </section>
                    ) : activePage === "Assessments" ? (
                        <AssessmentPage onAttemptSaved={refreshStudySummary} />
                    ) : activePage === "My Progress" ? (
                        <section className="utility-page">
                            <div className="utility-heading"><span className="section-kicker">YOUR SAVED ACTIVITY</span><h1>My Progress</h1><p>Only visible, focused time inside a learning module and submitted quiz results are recorded.</p></div>
                            <div className="progress-overview"><strong>{studySnapshot.totals.modules_started}/{modules.length}</strong><span>Modules opened at least once</span><small>{formatStudyTime(studySnapshot.totals.seconds_studied)} recorded · {studySnapshot.quiz.attempt_count} saved quiz attempts</small></div>
                            {studyTrackingError && <p className="study-tracking-error" role="status">Activity sync is unavailable right now. Recent unsynced time may not appear until the connection returns.</p>}
                            <div className="progress-list">{modules.map((module) => {
                                const record = studyByKey.get(moduleKeyByTitle[module.title]);
                                const lastActive = record ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(record.last_activity)) : null;
                                return <button key={module.id} onClick={() => openPage(module.title)}><span>{module.icon} {module.title}</span><span>{record ? `${formatStudyTime(record.seconds_studied)} · ${record.visit_count} visit${record.visit_count === 1 ? "" : "s"}` : "Not started"} <ChevronRight size={14} /></span><small>{lastActive ? `Last studied ${lastActive}` : "No study activity recorded yet"}</small></button>;
                            })}</div>
                            <p className="study-tracking-footnote">Module visits and active study time are estimates from this browser session. A module is never marked complete just because it was opened.</p>
                        </section>                    ) : activePage === "Settings" ? (
                        <section className="utility-page"><div className="utility-heading"><span className="section-kicker">PERSONALIZE YOUR LAB</span><h1>Settings</h1><p>Adjust learning display preferences for this session.</p></div><div className="settings-card"><label><span><b>Motion effects</b><small>Reduce interface animations and pause automatic model rotation</small></span><input type="checkbox" checked={settings.animations} onChange={(event) => setSettings((current) => ({ ...current, animations: event.target.checked }))} /></label></div></section>
                    ) : (
                        <>
                            <section className="welcome-row">
                                <div>
                                    <div className="eyebrow">
                                        <Sparkles size={14} /> {currentUser ? "YOUR VIRTUAL CLINICAL CLASSROOM" : "WELCOME TO THE VIRTUAL CLINICAL CLASSROOM"}
                                    </div>
                                    <h1>{currentUser ? "Welcome to your" : "Explore the"} <span>OB-GYN Lab.</span></h1>
                                    <p>
                                        {currentUser ? "Explore anatomy, understand clinical concepts and learn through interactive simulations." : "Preview your learning dashboard. Sign in or create an account to open anatomy labs, lessons, assessments and progress."}
                                    </p>
                                </div>
                                {currentUser ? <div className="date-chip"><Activity size={16} /> GNM · THIRD YEAR</div> : <button className="guest-hero-login" onClick={() => onRequestAuth?.("login")}>Log in to start learning <ChevronRight size={15} /></button>}
                            </section>

                            <section className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon purple"><BookOpen /></div>
                                    <div>
                                        <span>Available modules</span>
                                        <strong>08</strong>
                                        <small>Learning pathways</small>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon blue"><CheckCircle2 /></div>
                                    <div>
                                        <span>Modules opened</span>
                                        <strong>{studySnapshot.totals.modules_started}/{modules.length}</strong>
                                        <small>Unique modules visited</small>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon pink"><Clock /></div>
                                    <div>
                                        <span>Study time recorded</span>
                                        <strong>{formatStudyTime(studySnapshot.totals.seconds_studied)}</strong>
                                        <small>Visible time in a module</small>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon green"><GraduationCap /></div>
                                    <div>
                                        <span>Quiz attempts</span>
                                        <strong>{studySnapshot.quiz.attempt_count}</strong>
                                        <small>{studySnapshot.quiz.latest ? `Latest: ${studySnapshot.quiz.latest.score}/${studySnapshot.quiz.latest.total}` : "No submitted quiz yet"}</small>
                                    </div>
                                </div>
                            </section>

                            {activePage === "Overview" && (
                                <section className="feature-grid">
                                    <div className="panel anatomy-panel">
                                        <div className="panel-heading">
                                            <div>
                                                <span className="section-kicker">EXPLORE IN 3D</span>
                                                <h2>Female Reproductive Anatomy</h2>
                                            </div>
                                            <span className="model-tag">3D MODEL</span>
                                        </div>
                                        <AnatomyViewer />
                                        <div className="anatomy-footer">
                                            <div>
                                                <strong>Reproductive system</strong>
                                                <span>Interactive anatomical overview</span>
                                            </div>
                                            <button onClick={() => openPage("Female Reproductive Anatomy")}>
                                                Explore lesson <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="panel continue-panel">
                                        <div className="panel-heading">
                                            <div>
                                                <span className="section-kicker">PICK UP WHERE YOU LEFT OFF</span>
                                                <h2>Continue learning</h2>
                                            </div>
                                        </div>
                                        <div className="continue-illustration">
                                            <span>{continueModule.icon}</span>
                                            <div className="illustration-orbit orbit-one" />
                                            <div className="illustration-orbit orbit-two" />
                                        </div>
                                                                                <span className="lesson-category">{continueModule.category.toUpperCase()} · {continueRecord ? "RECENTLY OPENED" : "RECOMMENDED START"}</span>
                                        <h3>{continueModule.title}</h3>
                                        <p>{continueRecord ? `${formatStudyTime(continueRecord.seconds_studied)} recorded over ${continueRecord.visit_count} visit${continueRecord.visit_count === 1 ? "" : "s"}.` : "No study activity has been recorded for this module yet."}</p>
                                        <div className="continue-activity-meta">{continueRecord ? `Last studied ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(continueRecord.last_activity))}` : "Your time will be recorded while the module is open and visible."}</div><button
                                            className="primary-button"
                                            onClick={() => openPage(continueModule.title)}
                                        >
                                            <Play size={16} fill="currentColor" /> {continueRecord ? "Continue learning" : "Start learning"}
                                        </button>
                                    </div>
                                </section>
                            )}

                            <section className="modules-section">
                                <div className="section-heading">
                                    <div>
                                        <span className="section-kicker">YOUR LEARNING PATH</span>
                                        <h2>
                                            {activePage === "Overview"
                                                ? "Explore learning modules"
                                                : activePage}
                                        </h2>
                                    </div>
                                    <span className="module-count">08 MODULES</span>
                                </div>

                                <div className="module-grid">
                                    {filteredModules.map((module) => {
                                        const record = studyByKey.get(moduleKeyByTitle[module.title]);
                                        return <article className="module-card" key={module.id}>
                                            <div className="module-card-top">
                                                <div className="module-emoji">{module.icon}</div>
                                                <span className="module-number">MODULE 0{module.id}</span>
                                            </div>
                                            <span className="module-category">{module.category}</span>
                                            <h3>{module.title}</h3>
                                            <div className="module-progress module-tracking-summary">
                                                <span>{record ? `${formatStudyTime(record.seconds_studied)} studied` : "Not started"}</span>
                                                <small>{record ? `${record.visit_count} visit${record.visit_count === 1 ? "" : "s"}` : "No saved activity yet"}</small>
                                            </div>
                                            <button
                                                className="module-link"
                                                onClick={() => openPage(module.title)}
                                            >
                                                {record ? "Continue learning" : "Start learning"}{" "}
                                                <ChevronRight size={16} />
                                            </button>
                                        </article>
                                    })}
                                </div>
                                {filteredModules.length === 0 && (
                                    <div className="empty-state">No modules match your search.</div>
                                )}
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
