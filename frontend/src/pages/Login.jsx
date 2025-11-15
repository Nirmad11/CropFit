import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8080/api";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [login, setLogin] = useState({ email: "", password: "" });
  const [reg, setReg] = useState({ name: "", email: "", password: "" });

  // helper to persist logged-in user and notify header
  function onLoginSuccess(userObj, token = "") {
    try {
      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("token", token);
    } catch {}
    // notify header / other tabs
    window.dispatchEvent(new Event("auth-change"));
    navigate("/objectives");
  }

  async function doLogin(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "Login failed");
      // backend returns user object in d.user
      onLoginSuccess(d.user || { email: login.email }, d.token || "");
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function doRegister(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reg),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "Registration failed");
      // after register, prefill login and switch to login tab
      setLogin({ email: reg.email, password: "" });
      setMode("login");
    } catch (e) {
      setErr(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 grid">
      <div className="max-w-6xl w-full mx-auto p-6 md:p-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 grid place-items-center bg-emerald-600 text-white rounded-xl font-bold">CF</div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">CropFit</div>
              <div className="text-xs text-gray-500">Smart Agriculture</div>
            </div>
          </div>
          <h1 className="mt-6 text-3xl md:text-4xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600">Sign in or create an account to continue</p>
        </div>

        <div className="mx-auto max-w-xl">
          <div className="bg-white rounded-2xl shadow p-6 md:p-8">
            <div className="flex p-1 rounded-xl bg-gray-100 text-sm font-medium">
              <button
                className={`flex-1 py-2 rounded-lg ${mode==="login" ? "bg-white shadow" : ""}`}
                onClick={() => setMode("login")}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 rounded-lg ${mode==="register" ? "bg-white shadow" : ""}`}
                onClick={() => setMode("register")}
              >
                Create Account
              </button>
            </div>

            {err && <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{err}</div>}

            {mode === "login" ? (
              <form onSubmit={doLogin} className="mt-6 grid gap-4">
                <input
                  type="email"
                  className="border rounded-xl p-3"
                  placeholder="Email"
                  value={login.email}
                  onChange={(e) => setLogin(s => ({ ...s, email: e.target.value }))}
                  required
                />
                <input
                  type="password"
                  className="border rounded-xl p-3"
                  placeholder="Password"
                  value={login.password}
                  onChange={(e) => setLogin(s => ({ ...s, password: e.target.value }))}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={doRegister} className="mt-6 grid gap-4">
                <input
                  className="border rounded-xl p-3"
                  placeholder="Full Name"
                  value={reg.name}
                  onChange={(e) => setReg(s => ({ ...s, name: e.target.value }))}
                  required
                />
                <input
                  type="email"
                  className="border rounded-xl p-3"
                  placeholder="Email"
                  value={reg.email}
                  onChange={(e) => setReg(s => ({ ...s, email: e.target.value }))}
                  required
                />
                <input
                  type="password"
                  className="border rounded-xl p-3"
                  placeholder="Password"
                  value={reg.password}
                  onChange={(e) => setReg(s => ({ ...s, password: e.target.value }))}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}