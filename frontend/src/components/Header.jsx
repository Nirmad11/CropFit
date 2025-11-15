import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function NavLink({ to, children, pathname, setOpen }) {
  return (
    <Link
      to={to}
      onClick={() => setOpen && setOpen(false)}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        pathname === to ? "text-white bg-emerald-600" : "text-gray-700 hover:text-emerald-700"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Load user from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
      else setUser(null);
    } catch {
      setUser(null);
    }
    // listen for auth-change events from other tabs/components
    function onAuthChange() {
      try {
        const raw = localStorage.getItem("user");
        if (raw) setUser(JSON.parse(raw));
        else setUser(null);
      } catch {
        setUser(null);
      }
    }
    window.addEventListener("auth-change", onAuthChange);
    return () => window.removeEventListener("auth-change", onAuthChange);
  }, []);

  function doLogout() {
    // Clear auth storage and notify listeners
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change"));
    setUser(null);
    navigate("/"); // go home after logout
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo + Title */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
          title="CropFit"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 grid place-items-center text-white font-bold">
            CF
          </div>
          <div className="font-semibold text-gray-900 leading-tight">
            CropFit
            <div className="text-xs text-gray-500">Smart Agriculture</div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" pathname={pathname} setOpen={setOpen}>Home</NavLink>
          <NavLink to="/about" pathname={pathname} setOpen={setOpen}>About</NavLink>
          <NavLink to="/contact" pathname={pathname} setOpen={setOpen}>Contact</NavLink>
        </nav>

        {/* Desktop Buttons: show Sign In or Logout (and optionally user's name) */}
        <div className="hidden md:flex items-center gap-2">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
              >
                Sign In
              </Link>
            </>
          ) : (
            <>
              <div className="px-4 py-2 rounded-lg text-sm text-gray-700">
                Hi, <span className="font-semibold">{user.name || user.email}</span>
              </div>
              <button
                onClick={doLogout}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg border text-gray-700"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 flex flex-col gap-1">
            <NavLink to="/" pathname={pathname} setOpen={setOpen}>Home</NavLink>
            <NavLink to="/about" pathname={pathname} setOpen={setOpen}>About</NavLink>
            <NavLink to="/contact" pathname={pathname} setOpen={setOpen}>Contact</NavLink>

            <div className="flex gap-2 mt-2">
              {!user ? (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border text-center text-sm hover:bg-gray-50"
                >
                  Sign In
                </Link>
              ) : (
                <>
                  <div className="flex-1 px-4 py-2 rounded-lg text-center text-sm">{user.name || user.email}</div>
                  <button
                    onClick={() => { setOpen(false); localStorage.removeItem("user"); localStorage.removeItem("token"); window.dispatchEvent(new Event("auth-change")); navigate("/"); }}
                    className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white text-center text-sm hover:bg-emerald-700"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}