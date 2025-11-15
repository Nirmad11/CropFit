import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend as RLegend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

export default function PrintObjective2() {
  const navigate = useNavigate();
  const location = useLocation();

  // Prefer data passed via navigation state; otherwise use localStorage fallback
  const payload = useMemo(() => {
    const fromState = location.state;
    if (fromState?.result) {
      return fromState;
    }
    try {
      const raw = localStorage.getItem("cyclePlanReport");
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }, [location.state]);

  useEffect(() => {
    // If nothing to print, go back to Objective 2
    if (!payload?.result) {
      navigate("/objective-2");
      return;
    }
    // Optional: auto-open print dialog after mount
    // setTimeout(() => window.print(), 300);
  }, [payload, navigate]);

  if (!payload?.result) {
    return null;
  }

  const { result, form } = payload;

  // Yield bar data
  const yieldData =
    result?.yield_compare?.current != null && result?.yield_compare?.next != null
      ? [
          { label: (result.current_crop || "").toUpperCase(), yield: result.yield_compare.current, key: "current" },
          { label: (result.next_crop || "").toUpperCase(), yield: result.yield_compare.next, key: "next" },
        ]
      : null;

  // NPK pie data
  const npk = result?.npk_balance;
  const npkPieData = npk
    ? [
        { name: "N", value: npk.N ?? 0, key: "N" },
        { name: "P", value: npk.P ?? 0, key: "P" },
        { name: "K", value: npk.K ?? 0, key: "K" },
      ]
    : null;

  return (
    <div className="min-h-screen bg-white p-8 print:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-300 px-4 py-2 rounded-lg"
          >
            ← Back
          </button>
          <button
            onClick={() => window.print()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
          >
            Print / Save as PDF
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-emerald-700">Crop Cycle Plan Report</h1>
          <p className="text-gray-600">Crop Planning, Recommendations, and Yield Estimation</p>
        </div>

        {/* Meta block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border rounded-lg p-3">
            <div className="text-xs text-gray-500">Current Crop</div>
            <div className="font-semibold">{result.current_crop?.toUpperCase()}</div>
          </div>
          <div className="border rounded-lg p-3">
            <div className="text-xs text-gray-500">Next Recommended Crop</div>
            <div className="font-semibold">{result.next_crop?.toUpperCase()}</div>
          </div>
          <div className="border rounded-lg p-3">
            <div className="text-xs text-gray-500">Region / State</div>
            <div className="font-semibold">{form?.region || "-"}</div>
          </div>
        </div>

        {/* Season window */}
        {result.season && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-1">Season & Sowing Window</h3>
            <div className="text-sm">
              Preferred seasons: <b>{Array.isArray(result.season.preferred) ? result.season.preferred.join(", ") : "—"}</b>
              {result.season.window_text ? <> — <span className="text-gray-700">{result.season.window_text}</span></> : null}
            </div>
          </div>
        )}

        {/* Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border rounded-lg p-3">
            <h3 className="font-semibold mb-1">Soil</h3>
            <p className="text-sm">{result.guide?.soil || "-"}</p>
          </div>
          <div className="border rounded-lg p-3">
            <h3 className="font-semibold mb-1">Fertilizer</h3>
            <p className="text-sm">{result.guide?.fertilizer || "-"}</p>
          </div>
          <div className="border rounded-lg p-3">
            <h3 className="font-semibold mb-1">Water</h3>
            <p className="text-sm">{result.guide?.water || "-"}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {yieldData && (
            <div className="border rounded-lg p-3">
              <h3 className="font-semibold mb-2">Yield Comparison (quintal/ha)</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldData} barCategoryGap={40}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <RTooltip />
                    <RLegend />
                    <Bar dataKey="yield" name="Yield (q/ha)" radius={[6, 6, 0, 0]}>
                      {yieldData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={entry.key === "current" ? "#2E7D5E" : "#F4A261"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {npkPieData && (
            <div className="border rounded-lg p-3">
              <h3 className="font-semibold mb-2">NPK Balance for Next Crop (%)</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={npkPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={(d) => `${d.name}: ${d.value}%`}
                    >
                      {npkPieData.map((slice, idx) => {
                        const fill = slice.key === "N" ? "#2C7A7B" : slice.key === "P" ? "#1565C0" : "#F4A261";
                        return <Cell key={`cell-${idx}`} fill={fill} stroke="none" />;
                      })}
                    </Pie>
                    <RTooltip />
                    <RLegend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Rationale */}
        {result.rationale && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Rationale</h3>
            <p className="text-sm leading-6">{result.rationale}</p>
          </div>
        )}

        {/* 12-week plan */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">12-Week Action Plan</h3>
          <ol className="list-decimal list-inside text-sm space-y-1">
            {result.plan12w?.map((step) => (
              <li key={step.week}><b>Week {step.week}:</b> {step.task}</li>
            ))}
          </ol>
        </div>

        {/* Tips */}
        {result.tips?.length > 0 && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Tips</h3>
            <ul className="list-disc list-inside text-sm">
              {result.tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}

        {/* Footer note */}
        <div className="text-xs text-gray-500 text-center print:mt-12">
          Generated by CropFit • {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
