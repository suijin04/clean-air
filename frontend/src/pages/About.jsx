import React from 'react';
import {
  ShieldCheck,
  Database,
  Cpu,
  AlertTriangle,
  Lock,
  Wind,
  Info,
  CheckCircle2
} from 'lucide-react';
import { getPollutantDetails } from '../utils/formatters';

const POLLUTANTS = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3'];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
          <Wind className="w-4 h-4 text-emerald-600" />
          <span>Ethics & Architecture</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          About CleanAir AI & Responsible AI Principles
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          CleanAir AI is an open-access environmental intelligence platform dedicated to democratizing real-time air quality data, empowering individuals with verified atmospheric metrics, and utilizing artificial intelligence responsibly.
        </p>
      </div>

      {/* Why Air Quality Matters */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Why Air Quality Matters
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          According to the World Health Organization (WHO), ambient air pollution accounts for millions of premature deaths globally each year. Fine particulates penetrate deep into the lungs and cardiovascular system, leading to strokes, heart disease, lung cancer, and acute respiratory infections. Transparent, accessible, and scientifically grounded telemetry allows communities and decision-makers to take proactive protective actions.
        </p>
      </section>

      {/* Understanding Criteria Pollutants */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Understanding Criteria Pollutants
            </h2>
            <p className="text-xs text-slate-500">
              The 6 core parameters evaluated under the United States EPA Clean Air Act
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {POLLUTANTS.map((key) => {
            const p = getPollutantDetails(key);
            return (
              <div key={key} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{p.label}</span>
                  <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                    {p.standardThreshold}
                  </span>
                </div>
                <div className="text-xs font-semibold text-emerald-700">{p.name}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Data & AI Transparency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Database className="w-4 h-4" />
            <span>Data Transparency</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Provenance:</strong> Telemetry is retrieved from OpenAQ, the global open air quality data platform.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Timestamps:</strong> Measurements retain their original source collection timestamps.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>No Fabrication:</strong> Missing or offline measurements are marked "No current measurement" — never filled with fake numbers.</span>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
            <Cpu className="w-4 h-4" />
            <span>AI Transparency & Grounding</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Grounded Reasoning:</strong> Natural language responses are synthesized via high-speed Groq inference using live OpenAQ data as explicit context.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>No Hallucinated Readings:</strong> The model is strictly instructed never to fabricate stations, values, or timestamps.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Clear Demarcation:</strong> The UI indicates whether responses are backed by live API feeds or offline demo modes.</span>
            </li>
          </ul>
        </section>
      </div>

      {/* Limitations & Privacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Limitations</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li>• <strong>Spatial Coverage:</strong> Monitoring station density varies substantially between metropolitan regions and rural sectors.</li>
            <li>• <strong>Latency:</strong> Public government sensor stations may experience upload latencies of 15 to 60 minutes.</li>
            <li>• <strong>AQI Formula:</strong> CleanAir AI standardizes on the US EPA Air Quality Index. Other nations (e.g. India NAQI, UK DAQI) use different breakpoints.</li>
            <li>• <strong>Informational Notice:</strong> Air quality data and AI recommendations are for general situational awareness and do NOT constitute licensed medical advice.</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Lock className="w-4 h-4 text-slate-700" />
            <span>Security & Privacy</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li>• <strong>Zero Credential Exposure:</strong> API credentials (OPENAQ_API_KEY, GROQ_API_KEY) are exclusively managed server-side and never exposed to the client bundle.</li>
            <li>• <strong>No Unnecessary Tracking:</strong> No tracking cookies, biometric data, or sensitive personal profiles are collected.</li>
            <li>• <strong>Client Safety:</strong> Frontend communications route through sanitized reverse proxy endpoints.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
