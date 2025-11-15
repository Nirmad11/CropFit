// src/pages/Home.jsx
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

/** Techy drone-over-farm hero image (direct Unsplash link, reliable) */
const HERO_IMG =
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2000&q=80";

function Hero() {
  return (
    <section className="relative min-h-[74vh] grid place-items-center overflow-hidden">
      {/* Real image as the background */}
      <img
        src={HERO_IMG}
        alt="Modern smart agriculture with drone over farmland"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        loading="eager"
        fetchpriority="high"
      />

      {/* Softer dark overlay so the image is clearly visible */}
      <div className="absolute inset-0 -z-0 bg-gradient-to-b from-emerald-950/60 via-emerald-900/40 to-emerald-950/60" />

      {/* Subtle dotted pattern (very light) */}
      <div
        className="absolute inset-0 -z-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #fff 2px, transparent 2px), radial-gradient(circle at 80% 40%, #fff 2px, transparent 2px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      {/* Text */}
      <div className="relative max-w-5xl mx-auto px-6 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
          Revolutionize Your Farming with
          <span className="block text-amber-300">Smart Agriculture Technology</span>
        </h1>
        <p className="mt-5 text-lg md:text-xl text-emerald-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
          AI-powered crop recommendations, yield insights, and region-specific planning to
          maximize harvests and profitability.
        </p>

        {/* feature tags (no CTAs) */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-[1px]">
            <span>🌱</span> Soil Analysis
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-[1px]">
            <span>📈</span> Yield Prediction
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-[1px]">
            <span>📍</span> Location-Based
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-[1px]">
            <span>🗓️</span> Cycle Planning
          </span>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, desc, bullets, icon }) {
  return (
    <div className="p-6 md:p-7 rounded-2xl border border-gray-200 bg-white/95 hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-2xl">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
      {bullets?.length ? (
        <ul className="mt-4 space-y-1.5 text-sm text-gray-700">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-600">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-emerald-50">
      <Header />
      <Hero />

      {/* Core features 2x2 */}
      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Comprehensive Farming Solutions
            </h2>
            <p className="mt-2 text-gray-600">
              Make informed decisions for every season—from what to grow to whether it’s profitable.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FeatureCard
              icon="🌱"
              title="Smart Crop Recommendations"
              desc="Get personalized crop suggestions using your soil N-P-K, pH, rainfall and local weather."
              bullets={["Soil & climate fit", "Transparent inputs used", "Actionable output"]}
            />
            <FeatureCard
              icon="🗓️"
              title="Crop Cycle Planning"
              desc="Plan the next crop with a 12-week schedule, NPK balance, season window, and tips."
              bullets={["Rotation suggestions", "State-wise season window", "Weekly task plan"]}
            />
            <FeatureCard
              icon="📍"
              title="District-wise Suitability"
              desc="Discover top crops for your district based on historical average yield (quintal/ha)."
              bullets={["Cleaned district dataset", "Season filter optional", "Printable view"]}
            />
            <FeatureCard
              icon="📊"
              title="Profit Estimation"
              desc="Estimate revenue, cost, and profit before sowing. Edit mandi price/cost and area any time."
              bullets={["Yield × price − cost", "Per hectare or custom area", "Clear Grow/Avoid decision"]}
            />
          </div>
        </div>
      </section>

      {/* More Powerful Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center">
            More Powerful Features
          </h3>
          <p className="text-center text-gray-600 mt-2">
            Lightweight, mobile-friendly, and ready for real farming workflows.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon="☁️"
              title="Weather Integration"
              desc="Optional live temperature & humidity fetching when you provide a city."
              bullets={["OpenWeather API", "Graceful fallbacks", "Reliable defaults"]}
            />
            <FeatureCard
              icon="📱"
              title="Mobile Accessible"
              desc="Fast, responsive UI that works smoothly on phones and tablets."
              bullets={["Responsive design", "Touch friendly", "Quick loads"]}
            />
            <FeatureCard
              icon="🤖"
              title="Guided Experience"
              desc="Clear inputs and clean outputs with helpful tips and printable views."
              bullets={["Consistent UX", "Print/Screenshot ready", "Easy to present"]}
            />
          </div>
        </div>
      </section>

      {/* About mini */}
      <section id="about" className="py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Built for real farms</h2>
          <p className="mt-3 text-gray-600">
            CropFit blends practical agronomy with modern ML, tuned to Indian crops, seasons,
            and markets—so your decisions are local, simple, and actionable.
          </p>
        </div>
      </section>

      {/* Contact info */}
      <section id="contact" className="pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="p-6 rounded-2xl border bg-white">
            <h3 className="text-xl font-semibold text-gray-900">Contact</h3>
            <p className="text-gray-600 mt-1 text-sm">
              Questions or collaborations—reach out any time.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-xl bg-emerald-50 border text-sm">
                <div className="font-semibold text-emerald-800">Email</div>
                <div className="text-gray-700">support@cropfit.example</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border text-sm">
                <div className="font-semibold text-emerald-800">Phone</div>
                <div className="text-gray-700">+91-99999-00000</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border text-sm">
                <div className="font-semibold text-emerald-800">Hours</div>
                <div className="text-gray-700">Mon–Fri, 9am–6pm IST</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
