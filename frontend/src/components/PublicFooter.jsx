import React from "react";
import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} CropFit. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/about" className="text-gray-600 hover:text-emerald-700">About</Link>
          <Link to="/contact" className="text-gray-600 hover:text-emerald-700">Contact</Link>
          <Link to="/objectives" className="text-gray-600 hover:text-emerald-700">Objectives</Link>
        </div>
      </div>
    </footer>
  );
}
