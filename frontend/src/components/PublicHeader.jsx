import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function PublicHeader() {
  const { pathname } = useLocation();
  const isActive = (p) =>
    pathname === p ? "text-emerald-700 font-semibold" : "text-gray-600";

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 grid place-items-center text-white font-bold shadow">
            CF
          </div>
          <span className="text-lg font-semibold text-gray-900">CropFit</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={isActive("/")}>Home</Link>
          <Link to="/about" className={isActive("/about")}>About</Link>
          <Link to="/contact" className={isActive("/contact")}>Contact</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Log in
          </Link>
          <Link
            to="/login?tab=register"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
