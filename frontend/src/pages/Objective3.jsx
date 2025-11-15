import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const API_BASE = "http://127.0.0.1:8080/api";

const GREEN = "#10b981";
const GREEN_DARK = "#059669";
const GRID = "#e5e7eb";

export default function Objective3() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [form, setForm] = useState({ state: "", district: "", season: "" });
  const [loading, setLoading] = useState(false);
  const [resu, setResu] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/regions/states`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) setStates(d.states || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.state) {
      setDistricts([]);
      setForm(f => ({ ...f, district: "" }));
      return;
    }
    fetch(`${API_BASE}/regions/districts?state=${encodeURIComponent(form.state)}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) setDistricts(d.districts || []);
      })
      .catch(() => {});
  }, [form.state]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setResu(null);
    try {
      const r = await fetch(`${API_BASE}/district-reco`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: form.state,
          district: form.district,
          season: form.season || undefined,
          top_n: 5,
        }),
      });
      const t = await r.text();
      let data;
      try { data = JSON.parse(t); } catch { throw new Error("Invalid JSON from server"); }
      if (!r.ok || !data.ok) throw new Error(data.error || `HTTP ${r.status}`);
      setResu(data);
    } catch (e2) {
      setErr(e2.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();
  const fmt = (x) => (x === undefined || x === null || x === "" ? "—" : x);
  const today = new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-emerald-50 p-6 print:bg-white">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 print:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-emerald-700">
               District-wise Crop Recommendations
            </h1>
            <p className="text-gray-600">
              Choose State → District (and optional season) to see best crops by historical yield.
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
              disabled={!resu}
              className="px-4 py-2 rounded-xl text-white"
              style={{ background: resu ? GREEN : "#9ca3af" }}
            >
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:hidden">
          <div className="p-4 rounded-2xl border bg-yellow-50/60">
            <label className="text-sm text-gray-700 mb-1 block">State</label>
            <select
              name="state"
              value={form.state}
              onChange={onChange}
              className="border rounded-xl p-2 w-full"
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-2xl border bg-yellow-50/60">
            <label className="text-sm text-gray-700 mb-1 block">District</label>
            <select
              name="district"
              value={form.district}
              onChange={onChange}
              className="border rounded-xl p-2 w-full"
              disabled={!form.state}
            >
              <option value="">{form.state ? "Select District" : "Select State first"}</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-2xl border bg-yellow-50/60">
            <label className="text-sm text-gray-700 mb-1 block">Season (optional)</label>
            <select
              name="season"
              value={form.season}
              onChange={onChange}
              className="border rounded-xl p-2 w-full"
            >
              <option value="">All</option>
              <option value="Kharif">Kharif</option>
              <option value="Rabi">Rabi</option>
              <option value="Zaid">Zaid</option>
              <option value="Summer">Summer</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !form.state || !form.district}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-medium w-full"
            >
              {loading ? "Analyzing..." : "Get Recommendations"}
            </button>
          </div>
        </form>

        {err && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 print:hidden">
            ❌ {err}
          </div>
        )}

        {/* Results */}
        {resu && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border bg-emerald-50">
                <div className="text-sm text-gray-600">📍 District</div>
                <div className="text-xl font-semibold text-emerald-800">{fmt(resu.district)}</div>
              </div>
              <div className="p-5 rounded-2xl border bg-emerald-50">
                <div className="text-sm text-gray-600">🗺️ State</div>
                <div className="text-xl font-semibold text-emerald-800">{fmt(resu.state)}</div>
              </div>
              <div className="p-5 rounded-2xl border bg-emerald-50">
                <div className="text-sm text-gray-600">🗓️ Season</div>
                <div className="text-lg font-medium text-emerald-700">{fmt(resu.season) || "All"}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="p-5 rounded-2xl border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">📊 Avg Yield by Crop (quintal/ha)</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resu.chart}>
                    <defs>
                      <linearGradient id="yieldGrad3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GREEN} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={GREEN_DARK} stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="yield" name="Avg Yield" fill="url(#yieldGrad3)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top crops list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(resu.top || []).map((c, i) => (
                <div key={i} className="p-5 rounded-2xl border bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Crop</div>
                      <div className="text-xl font-semibold text-emerald-800">{(c.crop || "").toUpperCase()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Avg Yield</div>
                      <div className="text-xl font-semibold">{c.avg_yield} q/ha</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <div>🗓️ <b>Season window:</b> {c.season_window}</div>
                    <div className="mt-2">
                      <b>Quick tips:</b>
                      <ul className="list-disc list-inside space-y-1">
                        {(c.tips || []).map((t, ti) => <li key={ti}>{t}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sources + Print footer */}
            <div className="p-5 rounded-2xl border">
              <div className="font-semibold mb-2">Sources</div>
              <div className="text-sm text-gray-700">
                {Array.isArray(resu.sources) ? resu.sources.join(", ") : "—"}
              </div>
            </div>
            <div className="hidden print:block text-xs text-gray-500 text-right mt-6">
              Generated on {today} • CropFit — Objective 3
            </div>
          </div>
        )}
      </div>

      {/* Print CSS */}
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
