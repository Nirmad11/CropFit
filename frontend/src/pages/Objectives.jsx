import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Brain, Calendar, MapPin, TrendingUp } from "lucide-react";

const cards = [
  {
    title: "Crop Recommendation",
    desc: "AI + weather-based system that suggests the most suitable crop for your soil and climate.",
    link: "/objective/1",
    pill: "Soil & Weather Aware",
    icon: <Brain className="w-6 h-6 text-emerald-600" />
  },
  {
    title: "Crop Cycle Planning",
    desc: "Plan the next crop rotation with season windows, 12-week schedules, and NPK balance suggestions.",
    link: "/objective/2",
    pill: "Rotation & Schedule",
    icon: <Calendar className="w-6 h-6 text-emerald-600" />
  },
  {
    title: "District Suitability",
    desc: "View top-performing crops in your district based on historical yield data (q/ha).",
    link: "/objective/3",
    pill: "District-Wise Yields",
    icon: <MapPin className="w-6 h-6 text-emerald-600" />
  },
  {
    title: "Profit Estimation",
    desc: "Estimate revenue, cost, and profit per hectare with editable price and cost inputs.",
    link: "/objective/4",
    pill: "Economics",
    icon: <TrendingUp className="w-6 h-6 text-emerald-600" />
  }
];

export default function Objectives() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <Header />

      {/* Tagline bar */}
      <div className="bg-emerald-50 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 py-2 text-sm text-emerald-800 flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">Live</span>
            <span>Empowering smarter farm decisions — fast, local, actionable.</span>
          </div>
          <div className="text-gray-500">
            Need help?{" "}
            <Link to="/contact" className="text-emerald-600 hover:underline">
              Contact us
            </Link>
          </div>
        </div>
      </div>

      <main className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Soft background pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 10%, rgba(0,0,0,0.02) 1px, transparent 1px), radial-gradient(circle at 80% 40%, rgba(0,0,0,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
          aria-hidden="true"
        />

        {/* Page heading */}
        <div className="relative text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 drop-shadow-sm">
            Explore CropFit Tools
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Intelligent tools to help you pick crops, plan cycles, view district yields and estimate profitability.
          </p>
        </div>

        {/* 2x2 layout */}
        <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {cards.map((c, idx) => (
            <article
              key={c.title}
              className="group relative p-6 rounded-2xl bg-white/80 backdrop-blur border border-gray-100 shadow-sm transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              style={{
                animation: `float 6s ease-in-out ${idx * 0.12}s infinite`
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                    {c.icon}
                  </div>
                  <div className="text-sm px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                    {c.pill}
                  </div>
                </div>
                <div className="text-xs text-gray-400">Tool #{idx + 1}</div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">{c.desc}</p>

              <div className="mt-6">
                <Link
                  to={c.link}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                >
                  Open Tool
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="relative text-center mt-16">
          <p className="text-gray-500 text-sm">
            Each tool opens a dedicated workflow. You can use any tool independently — no forced flow.
          </p>
        </div>
      </main>

      <Footer />

      {/* Floating animation */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @media (max-width: 640px) {
          article[style] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
