import React from "react";
import { useNavigate } from "react-router-dom";

/** Container */
export function Container({ children, className = "" }) {
  return <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

/** Page title (eyebrow + title + right action) */
export function PageTitle({ eyebrow, title, desc, right }) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow && <div className="uppercase tracking-wider text-xs text-gray-500 mb-1">{eyebrow}</div>}
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{title}</h1>
          {desc && <p className="text-gray-600 mt-2">{desc}</p>}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}

/** Card */
export function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl shadow-soft p-5 md:p-6 ${className}`}>{children}</div>;
}

/** Buttons */
const baseBtn =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none";
export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`${baseBtn} bg-brand-600 hover:bg-brand-700 text-white shadow-soft focus:ring-2 focus:ring-brand-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`${baseBtn} bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 focus:ring-2 focus:ring-brand-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Back button */
export function BackTo({ to = "/objectives", children = "Back" }) {
  const navigate = useNavigate();
  return <SecondaryButton onClick={() => navigate(to)}>{children}</SecondaryButton>;
}

/** Field (label + input) */
export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

/** Shared input class */
export const inputClass =
  "border border-gray-200 rounded-lg w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-300";
