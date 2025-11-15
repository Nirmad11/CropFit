import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Objective4() {
  const API_BASE = "http://127.0.0.1:8080/api";
  const navigate = useNavigate();

  // Dropdown data
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [crops, setCrops] = useState([]);

  // Form
  const [form, setForm] = useState({
    state: "",
    district: "",
    crop: "",
    season: "",
    area_ha: 1,           // default 1 ha (editable)
    price_override: "",   // optional
    cost_override: "",    // optional
  });

  // Auto preview from backend (yield/ha, price, cost)
  const [auto, setAuto] = useState({
    yph: "",
    price: "",
    cost: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchingAuto, setFetchingAuto] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // -------- Load States on mount --------
  useEffect(() => {
    fetch(`${API_BASE}/regions/states`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setStates(d.states);
      })
      .catch(() => {});
  }, []);

  // -------- Load Districts when state changes --------
  useEffect(() => {
    if (!form.state) {
      setDistricts([]);
      setCrops([]);
      setForm((f) => ({ ...f, district: "", crop: "" }));
      return;
    }
    fetch(`${API_BASE}/regions/districts?state=${encodeURIComponent(form.state)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setDistricts(d.districts);
          setCrops([]);
          setForm((f) => ({ ...f, district: "", crop: "" }));
        }
      })
      .catch(() => {});
  }, [form.state]);

  // -------- Load Crops when district changes --------
  useEffect(() => {
    if (!form.state || !form.district) {
      setCrops([]);
      setForm((f) => ({ ...f, crop: "" }));
      return;
    }
    fetch(
      `${API_BASE}/regions/crops?state=${encodeURIComponent(
        form.state
      )}&district=${encodeURIComponent(form.district)}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setCrops(d.crops);
          setForm((f) => ({ ...f, crop: "" }));
        }
      })
      .catch(() => {});
  }, [form.state, form.district]);

  // -------- Auto fetch preview (yield/ha + price + cost) on crop/season change --------
  useEffect(() => {
    async function fetchAuto() {
      if (!form.state || !form.district || !form.crop) {
        setAuto({ yph: "", price: "", cost: "" });
        return;
      }
      setFetchingAuto(true);
      setError("");
      try {
        const body = {
          state: form.state,
          district: form.district,
          crop: form.crop,
          season: form.season || undefined,
          area_ha: 1, // preview only
        };
        const res = await fetch(`${API_BASE}/profit-estimate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load defaults");

        const price = data.economics?.price_rs_per_quintal_used ?? "";
        const cost = data.economics?.cost_rs_per_hectare_used ?? "";
        const yph = data.yield?.yield_q_per_ha ?? "";

        setAuto({
          yph: yph === "" ? "" : String(yph),
          price: price === "" ? "" : String(price),
          cost: cost === "" ? "" : String(cost),
        });

        // prefill overrides only if user hasn't typed anything yet
        setForm((f) => ({
          ...f,
          price_override: f.price_override || (price ? String(price) : ""),
          cost_override: f.cost_override || (cost ? String(cost) : ""),
        }));
      } catch (err) {
        setAuto({ yph: "", price: "", cost: "" });
        setError(err.message || "Could not load defaults for this crop.");
      } finally {
        setFetchingAuto(false);
      }
    }
    fetchAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.state, form.district, form.crop, form.season]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body = {
        state: form.state,
        district: form.district,
        crop: form.crop,
        season: form.season || undefined,
        area_ha: Number(form.area_ha || 1),
      };
      if (form.price_override) body.price_override = Number(form.price_override);
      if (form.cost_override) body.cost_override = Number(form.cost_override);

      const res = await fetch(`${API_BASE}/profit-estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Calculation failed");
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Small bar viz width calc
  const bars = useMemo(() => {
    if (!result) return null;
    const rev = result.economics.revenue_rs || 0;
    const cost = result.economics.total_cost_rs || 0;
    const max = Math.max(rev, cost, 1);
    return {
      revW: Math.round((rev / max) * 100),
      costW: Math.round((cost / max) * 100),
    };
  }, [result]);

  return (
    <div className="min-h-screen bg-green-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-soft p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-green-700">
             Profit Estimation
          </h1>
          <button
            onClick={() => navigate("/objectives")}
            className="text-sm border border-gray-300 px-4 py-2 rounded-2xl hover:bg-gray-50"
          >
            Back 
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Select location and crop. We auto-fill yield, price (₹/q) and cost (₹/ha). You can edit price/cost or area before calculating.
        </p>

        {/* FORM */}
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* State */}
          <div className="p-4 rounded-2xl border bg-emerald-50/40">
            <label className="block text-sm text-gray-700 mb-1">State</label>
            <select
              name="state"
              value={form.state}
              onChange={onChange}
              className="border border-gray-300 rounded-2xl w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">-- Select --</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="p-4 rounded-2xl border bg-emerald-50/40">
            <label className="block text-sm text-gray-700 mb-1">District</label>
            <select
              name="district"
              value={form.district}
              onChange={onChange}
              className="border border-gray-300 rounded-2xl w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
              disabled={!form.state}
            >
              <option value="">{form.state ? "-- Select --" : "Select state first"}</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Crop */}
          <div className="p-4 rounded-2xl border bg-emerald-50/40">
            <label className="block text-sm text-gray-700 mb-1">Crop</label>
            <select
              name="crop"
              value={form.crop}
              onChange={onChange}
              className="border border-gray-300 rounded-2xl w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
              disabled={!form.district}
            >
              <option value="">-- Select --</option>
              {crops.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Season (optional) */}
          <div className="p-4 rounded-2xl border bg-emerald-50/40">
            <label className="block text-sm text-gray-700 mb-1">Season (optional)</label>
            <input
              name="season"
              value={form.season}
              onChange={onChange}
              className="border border-gray-300 rounded-2xl w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., Kharif / Rabi / Zaid (or leave empty)"
            />
          </div>

          {/* Area (ha) */}
          <div className="p-4 rounded-2xl border bg-emerald-50/40">
            <label className="block text-sm text-gray-700 mb-1">Area (hectares)</label>
            <input
              name="area_ha"
              type="number"
              min="0.1"
              step="0.1"
              value={form.area_ha}
              onChange={onChange}
              className="border border-gray-300 rounded-2xl w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Default 1 ha. Change if needed.</p>
          </div>

          {/* Auto preview */}
          <div className="p-4 rounded-2xl border bg-white">
            <p className="text-sm text-gray-600 mb-1">Auto preview from dataset</p>
            <p className="text-sm">
              Yield/ha:{" "}
              <span className="font-medium">
                {fetchingAuto ? "…" : auto.yph || "—"} q/ha
              </span>
            </p>
            <p className="text-sm">
              Price:{" "}
              <span className="font-medium">
                ₹{fetchingAuto ? "…" : auto.price || "—"}/q
              </span>
            </p>
            <p className="text-sm">
              Cost:{" "}
              <span className="font-medium">
                ₹{fetchingAuto ? "…" : auto.cost || "—"}/ha
              </span>
            </p>
          </div>

          {/* Price override */}
          <div className="p-4 rounded-2xl border bg-white">
            <label className="block text-sm text-gray-700 mb-1">Price (₹/q)</label>
            <input
              name="price_override"
              type="number"
              min="0"
              step="1"
              value={form.price_override}
              onChange={onChange}
              className="border border-gray-300 rounded-2xl w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-filled; edit if mandi price differs.</p>
          </div>

          {/* Cost override */}
          <div className="p-4 rounded-2xl border bg-white">
            <label className="block text-sm text-gray-700 mb-1">Cost (₹/ha)</label>
            <input
              name="cost_override"
              type="number"
              min="0"
              step="1"
              value={form.cost_override}
              onChange={onChange}
              className="border border-gray-300 rounded-2xl w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-filled; edit if local costs differ.</p>
          </div>

          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              disabled={loading || !form.state || !form.district || !form.crop}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-2xl transition"
            >
              {loading ? "Calculating..." : "Calculate Profit"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-red-50 text-red-700 border border-red-200">
            ❌ {error}
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-emerald-800">
                {result.inputs.crop_dataset.toUpperCase()} — {result.inputs.district}, {result.inputs.state}
              </h2>
              <span
                className={
                  result.economics.profit_rs >= 0
                    ? "text-emerald-700 font-semibold"
                    : "text-red-700 font-semibold"
                }
              >
                {result.economics.decision} • ₹{result.economics.profit_rs}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-2xl bg-emerald-50/40">
                <p className="text-sm text-gray-600">Yield</p>
                <p className="text-lg">
                  {result.yield.yield_q_per_ha} q/ha • Total {result.yield.total_yield_quintal} q
                </p>
              </div>

              <div className="p-4 border rounded-2xl bg-emerald-50/40">
                <p className="text-sm text-gray-600">Economics (used)</p>
                <p>Price: ₹{result.economics.price_rs_per_quintal_used}/q</p>
                <p>Cost: ₹{result.economics.cost_rs_per_hectare_used}/ha</p>
              </div>

              <div className="p-4 border rounded-2xl bg-white">
                <p className="text-sm text-gray-600 mb-2">Revenue vs Cost</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-600">Revenue</div>
                    <div className="flex-1 bg-gray-100 h-3 rounded-2xl">
                      <div
                        className="h-3 rounded-2xl bg-emerald-500"
                        style={{ width: `${bars?.revW || 0}%` }}
                        title={`₹${result.economics.revenue_rs}`}
                      />
                    </div>
                    <div className="w-28 text-right text-sm">₹{result.economics.revenue_rs}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-600">Cost</div>
                    <div className="flex-1 bg-gray-100 h-3 rounded-2xl">
                      <div
                        className="h-3 rounded-2xl bg-red-500"
                        style={{ width: `${bars?.costW || 0}%` }}
                        title={`₹${result.economics.total_cost_rs}`}
                      />
                    </div>
                    <div className="w-28 text-right text-sm">₹{result.economics.total_cost_rs}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-2xl bg-white">
                <p className="text-sm text-gray-600">Notes</p>
                {result.economics.price_note && (
                  <p className="text-xs text-gray-600">Price source: {result.economics.price_note}</p>
                )}
                {result.economics.cost_note && (
                  <p className="text-xs text-gray-600">Cost source: {result.economics.cost_note}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
