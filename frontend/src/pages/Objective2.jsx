import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

const API_BASE = "http://127.0.0.1:8080/api";

const STATES = [
  "Punjab","Haryana","Uttar Pradesh","Bihar","West Bengal","Odisha","Madhya Pradesh",
  "Rajasthan","Gujarat","Maharashtra","Karnataka","Telangana","Andhra Pradesh",
  "Tamil Nadu","Kerala","Chhattisgarh","Jharkhand","Assam","Delhi"
];

const CROPS = [
  "rice","wheat","maize","millets","pulses","legumes","vegetables","cotton","sugarcane",
  "groundnut","sorghum","mustard","potato","chickpea","mungbean"
];

const SOILS = ["loam","clay loam","sandy loam","alluvial","black","red","lateritic"];

// Palette (green + pastel yellow accents)
const GREEN = "#10b981";
const GREEN_DARK = "#059669";
const AMBER = "#fbbf24";
const SKY = "#60a5fa";
const GRID = "#e5e7eb";

export default function Objective2() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    current_crop: "rice",
    soil_type: "loam",
    region: "Tamil Nadu",
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const res = await fetch(`${API_BASE}/cycle-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const txt = await res.text();
      let data;
      try { data = JSON.parse(txt); } catch { throw new Error("Invalid JSON from server"); }
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setPlan(data);
    } catch (err) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  // Chart data
  const yieldData = plan ? [
    { name: (plan.current_crop || "").toUpperCase(), value: plan.yield_compare?.current || 0 },
    { name: (plan.next_crop || "").toUpperCase(), value: plan.yield_compare?.next || 0 },
  ] : [];

  const npk = plan?.npk_balance || { N: 0, P: 0, K: 0 };
  const npkData = [
    { name: "Nitrogen (N)", value: npk.N || 0, fill: GREEN },
    { name: "Phosphorus (P)", value: npk.P || 0, fill: SKY },
    { name: "Potassium (K)", value: npk.K || 0, fill: AMBER },
  ];

  const today = new Date().toLocaleDateString();
  const fmt = (x) => (x === undefined || x === null || x === "" ? "—" : x);

  return (
    <div className="min-h-screen bg-emerald-50 p-6 print:bg-white">
      {/* Print header */}
      <div className="max-w-6xl mx-auto print:block hidden text-center mb-4">
        <h1 className="text-2xl font-bold">Crop Cycle Plan — Print View</h1>
        <div className="text-sm text-gray-600">Generated on {today}</div>
        <div className="h-px bg-gray-300 my-3" />
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 print:shadow-none">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-emerald-700"> Crop Cycle Planning</h1>
            <p className="text-gray-600">
              State-aware rotation, yield & NPK insights, seasons, tips, and a 12-week plan. Print-ready.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/objectives")}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handlePrint}
              disabled={!plan}
              className="px-4 py-2 rounded-xl text-white"
              style={{ background: plan ? GREEN : "#9ca3af" }}
              title={plan ? "Print / Save as PDF" : "Generate a plan first"}
            >
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:hidden">
          <div className="p-4 rounded-2xl border bg-yellow-50/60">
            <label className="text-sm text-gray-700 mb-1 block">Current Crop</label>
            <select
              name="current_crop"
              value={form.current_crop}
              onChange={onChange}
              className="border rounded-xl p-2 w-full"
            >
              {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="p-4 rounded-2xl border bg-yellow-50/60">
            <label className="text-sm text-gray-700 mb-1 block">Soil Type</label>
            <select
              name="soil_type"
              value={form.soil_type}
              onChange={onChange}
              className="border rounded-xl p-2 w-full"
            >
              {SOILS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="p-4 rounded-2xl border bg-yellow-50/60">
            <label className="text-sm text-gray-700 mb-1 block">State / Region</label>
            <select
              name="region"
              value={form.region}
              onChange={onChange}
              className="border rounded-xl p-2 w-full"
            >
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              onClick={onSubmit}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-medium"
            >
              {loading ? "Generating..." : "Generate Plan"}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 print:hidden">
            ❌ {error}
          </div>
        )}

        {/* Content */}
        {plan && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border bg-emerald-50">
                <div className="text-sm text-gray-600">🌾 Current Crop</div>
                <div className="text-xl font-semibold text-emerald-800">
                  {fmt(plan.current_crop)?.toUpperCase()}
                </div>
              </div>
              <div className="p-5 rounded-2xl border bg-emerald-50">
                <div className="text-sm text-gray-600">🌱 Next Crop (Recommended)</div>
                <div className="text-xl font-semibold text-emerald-800">
                  {fmt(plan.next_crop)?.toUpperCase()}
                </div>
              </div>
              <div className="p-5 rounded-2xl border bg-emerald-50">
                <div className="text-sm text-gray-600">🗓️ Season Window</div>
                <div className="text-lg font-medium text-emerald-700">
                  {fmt(plan.season?.window_text)}
                </div>
              </div>
            </div>

            {/* Charts (modern) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">
                    📊 Yield Comparison ({fmt(plan.yield_compare?.unit)})
                  </h3>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yieldData}>
                      <defs>
                        <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={GREEN} stopOpacity={0.95} />
                          <stop offset="100%" stopColor={GREEN_DARK} stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Yield" fill="url(#yieldGrad)" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-5 rounded-2xl border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">🧪 Soil Nutrient Balance (NPK)</h3>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={npkData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        label
                      >
                        {npkData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-sm text-gray-600 mt-2 print:block">
                  N: <b>{fmt(npk.N)}</b> · P: <b>{fmt(npk.P)}</b> · K: <b>{fmt(npk.K)}</b>
                </div>
              </div>
            </div>

            {/* Guide / Alternatives / Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border">
                <div className="font-semibold mb-2">📌 Guide (for next crop)</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>🌱 Soil: <span className="font-medium">{fmt(plan.guide?.soil)}</span></li>
                  <li>🧯 Fertilizer: <span className="font-medium">{fmt(plan.guide?.fertilizer)}</span></li>
                  <li>💧 Water: <span className="font-medium">{fmt(plan.guide?.water)}</span></li>
                </ul>
              </div>
              <div className="p-5 rounded-2xl border">
                <div className="font-semibold mb-2">🔀 Alternatives</div>
                <div className="text-sm text-gray-700">
                  {plan.alternatives?.length ? plan.alternatives.join(", ") : "—"}
                </div>
              </div>
              <div className="p-5 rounded-2xl border">
                <div className="font-semibold mb-2">✅ Quick Tips</div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {(plan.tips || []).map((t, i) => (<li key={i}>{t}</li>))}
                </ul>
              </div>
            </div>

            {/* 12-week plan */}
            <div className="p-5 rounded-2xl border">
              <div className="font-semibold mb-2">
                📅 12-Week Action Plan — {fmt(plan.next_crop)?.toUpperCase()}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-2 pr-4">Week</th>
                      <th className="py-2">Task</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(plan.plan12w || []).map((row, i) => (
                      <tr key={i} className={i % 2 ? "bg-gray-50 border-b" : "border-b"}>
                        <td className="py-2 pr-4 font-medium">{row.week}</td>
                        <td className="py-2">{row.task}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {plan.rationale && (
                <div className="text-gray-800 text-sm mt-3">
                  <span className="font-semibold">Why this rotation?</span> {plan.rationale}
                </div>
              )}
            </div>

            {/* Print footer */}
            <div className="hidden print:block text-xs text-gray-500 text-right mt-6">
              Generated on {today} • CropFit — Objective 2
            </div>
          </div>
        )}
      </div>

      {/* Print CSS tweaks */}
      <style>{`
        @media print {
          @page { margin: 16mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .shadow-xl, .shadow, .print\\:shadow-none { box-shadow: none !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  );
}
