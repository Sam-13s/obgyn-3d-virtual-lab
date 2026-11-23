import React, { useState } from 'react';
import FetalDevelopment3D from '../components/FetalDevelopment3D';
import {
  FETAL_MILESTONES,
  FETAL_SKULL_LANDMARKS,
  LEOPOLD_MANEUVERS,
  classifyAFI
} from '../data/fetalDevelopmentData';

export default function PregnancyPage() {
  const [selectedWeek, setSelectedWeek] = useState(28);
  const [afi, setAfi] = useState(14);
  const [wireframe, setWireframe] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('biometry');

  // Match closest milestone for biometry & clinical notes
  const milestone = FETAL_MILESTONES.reduce((prev, curr) =>
    Math.abs(curr.week - selectedWeek) < Math.abs(prev.week - selectedWeek) ? curr : prev
  );
  const afiStatus = classifyAFI(afi);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 bg-[#040914] text-slate-100 min-h-screen">
      {/* Left Column: 3D Fetal & Amniotic Fluid Simulator */}
      <div className="lg:col-span-6 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">Module 2 & 3 • 3D Simulation</span>
            <h2 className="text-lg font-bold">Fetal Growth & Amniotic Fluid Lab</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
            >
              {isPlaying ? 'Pause Orbit' : 'Auto Orbit'}
            </button>
            <button
              onClick={() => setWireframe(!wireframe)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
            >
              {wireframe ? 'Solid Mesh' : 'Wireframe'}
            </button>
          </div>
        </div>

        {/* WebGL Canvas */}
        <div className="relative flex-1 min-h-[380px] rounded-xl border border-slate-800 overflow-hidden">
          <FetalDevelopment3D week={selectedWeek} afi={afi} wireframe={wireframe} isPlaying={isPlaying} />
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Gestation:</span>{' '}
            <strong className="text-cyan-400">Week {selectedWeek}</strong> •{' '}
            <span className="text-slate-400">FHR:</span>{' '}
            <strong className="text-rose-400">{milestone.fhr} bpm</strong>
          </div>
        </div>

        {/* Gestational Timeline Scrubber */}
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Gestational Age Scrubber (Weeks 4–40)</span>
              <span className="text-cyan-400 font-semibold">Week {selectedWeek} ({milestone.trimester})</span>
            </div>
            <input
              type="range"
              min="4"
              max="40"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Quick Milestone Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {FETAL_MILESTONES.map((m) => (
              <button
                key={m.week}
                onClick={() => setSelectedWeek(m.week)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                  selectedWeek === m.week
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Wk {m.week}
              </button>
            ))}
          </div>

          {/* Amniotic Fluid Index (AFI) Slider */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Amniotic Fluid Index (AFI): <strong className="text-white">{afi} cm</strong></span>
              <span className={`px-2 py-0.5 rounded border text-[11px] font-medium ${afiStatus.badge}`}>
                {afiStatus.label}
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="28"
              value={afi}
              onChange={(e) => setAfi(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-xs text-slate-400 mt-1">{afiStatus.risk}</p>
          </div>
        </div>
      </div>

      {/* Right Column: Clinical Biometry, Fetal Skull & Leopold's Maneuvers */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        {/* Biometry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <p className="text-xs text-slate-400">CRL</p>
            <p className="text-lg font-bold text-cyan-400">{milestone.crl}</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <p className="text-xs text-slate-400">BPD</p>
            <p className="text-lg font-bold text-cyan-400">{milestone.bpd}</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <p className="text-xs text-slate-400">Femur (FL)</p>
            <p className="text-lg font-bold text-cyan-400">{milestone.fl}</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <p className="text-xs text-slate-400">Est. Weight</p>
            <p className="text-lg font-bold text-emerald-400">{milestone.weight}</p>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'biometry', label: 'Organogenesis & ANC' },
            { id: 'skull', label: 'Fetal Skull & Sutures' },
            { id: 'leopold', label: "Leopold's Maneuvers" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === tab.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'biometry' && (
          <div className="space-y-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-cyan-400 mb-1">Developmental Milestones (Week {milestone.week})</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{milestone.organogenesis}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">GNM Nursing Responsibilities</h4>
              <p className="text-sm text-slate-200">{milestone.nursingNote}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p><strong className="text-cyan-400">Placental Structure:</strong> 15–20 maternal cotyledons; weight ~500 g at term (1:6 ratio to fetal weight).</p>
              <p><strong className="text-cyan-400">Umbilical Cord (AVA):</strong> 2 umbilical arteries (deoxygenated) + 1 umbilical vein (oxygenated) protected by Wharton&apos;s jelly.</p>
            </div>
          </div>
        )}

        {activeTab === 'skull' && (
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl overflow-x-auto">
            <h3 className="text-sm font-bold text-cyan-400 mb-3">Fetal Skull Fontanelles, Sutures & Diameters</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-2">Landmark</th>
                  <th className="py-2 pr-2">Dimension / Closure</th>
                  <th className="py-2">Obstetric Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {FETAL_SKULL_LANDMARKS.map((item) => (
                  <tr key={item.name}>
                    <td className="py-2.5 pr-2 font-semibold text-white">{item.name}</td>
                    <td className="py-2.5 pr-2 text-cyan-300">{item.shape} ({item.closure})</td>
                    <td className="py-2.5">{item.clinical}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'leopold' && (
          <div className="space-y-2.5 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <h3 className="text-sm font-bold text-cyan-400 mb-2">Abdominal Palpation — Leopold&apos;s 4 Maneuvers</h3>
            {LEOPOLD_MANEUVERS.map((m) => (
              <div key={m.grip} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <p className="text-xs font-bold text-cyan-300">{m.grip}</p>
                <p className="text-xs text-slate-400 mt-0.5">{m.action}</p>
                <p className="text-xs text-slate-200 mt-1"><strong>Finding:</strong> {m.finding}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}