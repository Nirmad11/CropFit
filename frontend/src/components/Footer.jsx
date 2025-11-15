import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid gap-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 grid place-items-center text-white font-bold">CF</div>
            <div className="font-semibold text-gray-900">CropFit</div>
          </div>
          <p className="text-gray-600 text-sm">
            AI-assisted crop planning, district suitability, and profit estimation.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-2">Navigate</div>
          <ul className="text-sm space-y-1">
            <li><Link to="/" className="text-gray-600 hover:text-emerald-700">Home</Link></li>
            <li><Link to="/about" className="text-gray-600 hover:text-emerald-700">About</Link></li>
            <li><Link to="/contact" className="text-gray-600 hover:text-emerald-700">Contact</Link></li>
            <li><Link to="/objectives" className="text-gray-600 hover:text-emerald-700">Objectives</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Contact</div>
          <p className="text-sm text-gray-600">support@cropfit.example</p>
          <p className="text-sm text-gray-600">Mon–Fri, 9am–6pm IST</p>
        </div>
      </div>
      <div className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-gray-500">
          © {new Date().getFullYear()} CropFit. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
