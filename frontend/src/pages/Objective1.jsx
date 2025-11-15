import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Objective1() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    N: "",
    P: "",
    K: "",
    ph: "",
    rainfall: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // result will be an object now

  const apiBase = "http://127.0.0.1:8080/api";

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${apiBase}/predict-crop`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          N: Number(form.N),
          P: Number(form.P),
          K: Number(form.K),
          ph: Number(form.ph),
          rainfall: Number(form.rainfall),
          city: form.city.trim(),
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response");
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const inp = data.inputs || {};
      setResult({
        crop: data.recommendation,
        city: inp.city,
        temperature: inp.temperature,
        humidity: inp.humidity,
        source: data.source,
      });
    } catch (err) {
      setResult({ error: err.message || "Failed to fetch" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-8 bg-green-50">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-green-700 mb-4">
          Crop Recommendation
        </h1>
        <p className="text-gray-600 mb-6">
          Enter soil & climate inputs. We’ll recommend the most suitable crop for current conditions.
        </p>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "N", label: "Nitrogen (N)" },
            { name: "P", label: "Phosphorus (P)" },
            { name: "K", label: "Potassium (K)" },
            { name: "ph", label: "Soil pH" },
            { name: "rainfall", label: "Rainfall (mm)" },
            { name: "city", label: "City" },
          ].map((fld) => (
            <div key={fld.name} className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">{fld.label}</label>
              <input
                name={fld.name}
                value={form[fld.name]}
                onChange={onChange}
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={fld.label}
                required
              />
            </div>
          ))}

          <div className="md:col-span-2 flex gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium"
            >
              {loading ? "Predicting..." : "Predict Crop"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/objectives")}
              className="bg-white border border-gray-300 px-4 py-2 rounded-lg"
            >
              Back 
            </button>
          </div>
        </form>

        {/* Result Card */}
        {result && (
          <div className="mt-6 p-5 rounded-xl shadow bg-green-50 border border-green-200">
            {result.error ? (
              <div className="text-red-600 font-medium">❌ {result.error}</div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xl font-bold text-green-800 mb-2">
                  🌾 Recommended Crop:
                  <span className="text-green-600">{result.crop}</span>
                </div>

                {result.city && (
                  <div className="text-gray-700 mb-1">
                    📍 Location: <span className="font-medium">{result.city}</span>
                  </div>
                )}

                <div className="text-gray-700 mb-1">
                  🌡 Temperature:{" "}
                  <span className="font-medium">
                    {Number(result.temperature).toFixed(1)}°C
                  </span>
                </div>

                <div className="text-gray-700 mb-1">
                  💧 Humidity:{" "}
                  <span className="font-medium">
                    {Number(result.humidity).toFixed(0)}%
                  </span>
                </div>

                <div className="text-gray-500 text-sm mt-2">
                  Source: <span className="italic">{result.source === "ml" ? "ML Model" : "Rules/Fallback"}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
