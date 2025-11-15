// src/pages/About.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header"; // ✅ relative import (no alias issues)

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-emerald-600">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      {children}
    </span>
  );
}

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Shared Header */}
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-500" />
        <div
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl text-white">
            <p className="uppercase tracking-widest text-white/80 text-xs mb-3">
              About CropFit
            </p>
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
              AI-powered crop planning for confident, profitable farming.
            </h1>
            <p className="mt-4 md:mt-6 text-white/90 text-lg">
              CropFit helps you decide <i>what to grow, when to grow, and whether it’s profitable</i> —
              using soil inputs, real-time weather, regional yield data, and market references.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              <Pill>Crop Recommendation</Pill>
              <Pill>Cycle & Rotation Planning</Pill>
              <Pill>District-wise Yield</Pill>
              <Pill>Profit Estimation</Pill>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center rounded-lg px-5 py-2.5 bg-white text-emerald-700 font-medium hover:bg-emerald-50 shadow"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center rounded-lg px-5 py-2.5 border border-white/60 text-white font-medium hover:bg-white/10"
              >
                Talk to us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why / Problem → Solution */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Why we built CropFit</h2>
            <p className="mt-3 text-gray-600">
              Farmers face uncertainty choosing the right crop, fluctuating weather, unknown yield
              in their district, and no clear profit outlook before cultivation.
            </p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>• Unclear crop suitability for soil & region</li>
              <li>• Climate variability & timing risk</li>
              <li>• No district-level yield visibility</li>
              <li>• Profit or loss is known only after harvest</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Our solution</h2>
            <p className="mt-3 text-gray-600">
              We combine ML recommendations, live weather, regional datasets, and cost/price
              references to provide an actionable, printable plan — before sowing.
            </p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>• AI crop recommendation using soil + weather</li>
              <li>• 12-week cycle plan with NPK balance</li>
              <li>• District-wise top crops by average yield</li>
              <li>• Profit/Loss estimation per hectare</li>
            </ul>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Stat value="50+" label="Crops covered" />
          <Stat value="95%" label="Model accuracy (demo)" />
          <Stat value="1000+" label="Farmers simulated" />
          <Stat value="24/7" label="Support ready" />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            How CropFit works
          </h2>
          <p className="mt-2 text-gray-600">
            A clear flow from inputs to decisions you can trust.
          </p>

          <div className="mt-8 grid md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Soil & Weather",
                desc:
                  "You enter N-P-K, pH, rainfall & city. We fetch temperature & humidity via weather API.",
              },
              {
                step: "02",
                title: "AI Recommendation",
                desc:
                  "Our model predicts the best-fit crop; we also show temp/humidity used for transparency.",
              },
              {
                step: "03",
                title: "Cycle & Rotation",
                desc:
                  "Get a 12-week action plan, season window by state, NPK balance, and alternatives.",
              },
              {
                step: "04",
                title: "Profit Estimation",
                desc:
                  "District yield × price − cost gives profit/loss before sowing. Edit price/cost/area anytime.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-sm transition"
              >
                <div className="text-emerald-600 font-semibold">{s.step}</div>
                <div className="mt-2 text-lg font-medium text-gray-900">{s.title}</div>
                <p className="mt-2 text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data & Tech */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Data & Sources</h3>
            <p className="mt-3 text-gray-600">
              We use a cleaned demo dataset for district yield, and integrate live weather via API.
              Price/cost use reference tables with user override for realism.
            </p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>• District crop yield CSV (demo; replaceable with official sources)</li>
              <li>• OpenWeather for temperature & humidity</li>
              <li>• Reference price & cultivation cost (editable)</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Tech Stack</h3>
            <div className="mt-3 text-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50">Frontend: React + Tailwind</div>
                <div className="p-3 rounded-lg bg-gray-50">Backend: Flask (Python)</div>
                <div className="p-3 rounded-lg bg-gray-50">ML: scikit-learn</div>
                <div className="p-3 rounded-lg bg-gray-50">DB: SQLite</div>
                <div className="p-3 rounded-lg bg-gray-50">Charts: Recharts</div>
                <div className="p-3 rounded-lg bg-gray-50">API: OpenWeather</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / CTA */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-8 md:p-10 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
            <h3 className="text-2xl md:text-3xl font-semibold">
              Our mission
            </h3>
            <p className="mt-2 text-white/90">
              Make precision agriculture decisions accessible to every farmer — simple, local, and
              actionable.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center rounded-lg px-5 py-2.5 bg-white text-emerald-700 font-medium hover:bg-emerald-50 shadow"
              >
                Create your plan
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center rounded-lg px-5 py-2.5 border border-white/70 text-white font-medium hover:bg-white/10"
              >
                Contact team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer note (light) */}
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-gray-500">
          © {new Date().getFullYear()} CropFit • Built for academic demonstration. Data sources are
          referenced within the app. Replace demo datasets with official datasets for production.
        </div>
      </footer>
    </div>
  );
}
