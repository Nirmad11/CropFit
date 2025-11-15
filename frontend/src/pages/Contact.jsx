// src/pages/Contact.jsx
import React, { useState } from "react";
import Header from "../components/Header"; // ✅ add shared header

function InfoCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="text-sm font-semibold text-emerald-700">{title}</div>
      <div className="mt-2 text-gray-700">{children}</div>
    </div>
  );
}

function FAQ({ q, a }) {
  return (
    <details className="group rounded-xl border border-gray-200 bg-white p-4 open:shadow-sm">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{q}</h4>
          <span className="text-emerald-600 group-open:rotate-45 transition">＋</span>
        </div>
      </summary>
      <p className="mt-3 text-gray-600">{a}</p>
    </details>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSending(true);
    setToast("");

    // Demo-only submit (no backend email). You can wire this to your API later.
    setTimeout(() => {
      setSending(false);
      setToast("✅ Thanks! We’ve received your message and will get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 900);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Shared Header */}
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-500" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl text-white">
            <p className="uppercase tracking-widest text-white/80 text-xs mb-3">
              Contact CropFit
            </p>
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
              We’re here to help you plan, grow, and profit.
            </h1>
            <p className="mt-4 md:mt-6 text-white/90 text-lg">
              Have questions about crop recommendations, cycle plans, district yield, or profit
              estimation? Reach out — we’ll respond quickly.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Left: quick info */}
          <div className="space-y-4">
            <InfoCard title="Email">
              <a
                className="text-emerald-700 hover:underline"
                href="mailto:support@cropfit.ag"
              >
                support@cropfit.ag
              </a>
              <p className="text-sm text-gray-600 mt-1">
                We typically reply within 24 hours.
              </p>
            </InfoCard>

            <InfoCard title="Phone / WhatsApp">
              <p>+91 90000 00000</p>
              <p className="text-sm text-gray-600 mt-1">Mon–Sat, 9:00–18:00 IST</p>
            </InfoCard>

            <InfoCard title="Location">
              <p>CropFit Labs, Bengaluru, India</p>
              <p className="text-sm text-gray-600 mt-1">
                For onsite demos, schedule an appointment.
              </p>
            </InfoCard>

            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              {/* Map placeholder (replace src with an embedded map if you like) */}
              <div className="h-44 bg-[url('https://maps.gstatic.com/tactile/omnibox/geo_card_place_holder.png')] bg-cover bg-center" />
              <div className="p-4">
                <div className="text-sm font-semibold text-gray-900">Find us</div>
                <p className="text-sm text-gray-600 mt-1">
                  Bengaluru • 560001 • Karnataka
                </p>
              </div>
            </div>
          </div>

          {/* Right: form (spans 2 columns) */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Send a message</h2>
              <p className="text-gray-600 mt-1">
                Tell us a bit about what you need. We’ll get back ASAP.
              </p>

              <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm text-gray-700 mb-1">Your name</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className="border border-gray-200 rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="Full name"
                    required
                  />
                </label>

                <label className="block">
                  <span className="block text-sm text-gray-700 mb-1">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    className="border border-gray-200 rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="name@email.com"
                    required
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="block text-sm text-gray-700 mb-1">Subject</span>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={onChange}
                    className="border border-gray-200 rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="How can we help?"
                    required
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="block text-sm text-gray-700 mb-1">Message</span>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    rows={6}
                    className="border border-gray-200 rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="Give us details. The more context, the better."
                    required
                  />
                </label>

                <div className="md:col-span-2 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    This is a demo form — no emails are sent. Connect your backend to enable email.
                  </p>
                  <button
                    type="submit"
                    disabled={sending}
                    className={`inline-flex items-center rounded-lg px-5 py-2.5 font-medium text-white ${
                      sending ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {sending ? "Sending…" : "Send message"}
                  </button>
                </div>
              </form>

              {toast && (
                <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-800 p-3 border border-emerald-200">
                  {toast}
                </div>
              )}
            </div>

            {/* FAQs */}
            <div className="mt-8 grid gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Frequently asked</h3>
              <FAQ
                q="Can I try the tools without logging in?"
                a="Core tools require sign-in to protect your data. You can browse the homepage freely and sign in to use all features."
              />
              <FAQ
                q="Are prices and costs real?"
                a="We provide reference values and let you override with local mandi prices and costs for realism during demos."
              />
              <FAQ
                q="Can CropFit work offline?"
                a="Parts of the app rely on live weather and server APIs. You can still explore static content offline."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-gray-500">
          © {new Date().getFullYear()} CropFit • Built for academic demonstration.
        </div>
      </footer>
    </div>
  );
}
