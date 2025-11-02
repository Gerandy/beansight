import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

export default function Login({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [view, setView] = useState("login"); // "login" | "forgot" | "sent"

  const navigate = useNavigate();
  const location = useLocation();
  const emailRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    setTimeout(() => emailRef.current?.focus(), 0);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open && localStorage.getItem("authToken")) {
      navigate("/Myaccount", { replace: true });
      onClose?.();
    }
  }, [open, navigate, onClose]);

  useEffect(() => {
    if (!open) {
      // Reset all state when modal closes
      setEmail("");
      setPwd("");
      setError("");
      setShowPwd(false);
      setLoading(false);
      setRemember(true);
      setView("login");
    }
  }, [open]);

  const onLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !pwd) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    localStorage.setItem("authToken", "demo");

    const from = location.state?.from?.pathname || "/Myaccount";
    navigate(from, { replace: true });
    onClose?.();
  };

  const onGuest = () => {
    const from = location.state?.from?.pathname || "/menu";
    navigate(from, { replace: true });
    onClose?.();
  };

  const onForgotSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending reset email
    setTimeout(() => {
      setLoading(false);
      setView("sent");
    }, 1000);
  };

  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md animate-slideUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal_title"
      >
        <div className="relative rounded-xl border border-gray-100 bg-white/95 shadow-xl backdrop-blur p-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* LOGIN VIEW */}
          {view === "login" && (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-coffee-600/10 flex items-center justify-center">
                  <span className="text-coffee-700 font-bold">B</span>
                </div>
                <h1 id="modal_title" className="mt-3 text-2xl font-bold text-gray-900">
                  Welcome back
                </h1>
                <p className="mt-1 text-sm text-gray-600">Please sign in to continue</p>
              </div>

              <form onSubmit={onLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M4 6l8 7 8-7" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </span>
                    <input
                      ref={emailRef}
                      id="email"
                      className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-coffee-500 focus:ring-2 focus:ring-coffee-200"
                      placeholder="you@example.com"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={!!error && (!email || !pwd)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      className="w-full rounded-lg border border-gray-300 bg-white px-10 pr-12 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-coffee-500 focus:ring-2 focus:ring-coffee-200"
                      placeholder="Your password"
                      type={showPwd ? "text" : "password"}
                      autoComplete="current-password"
                      value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={showPwd ? "Hide password" : "Show password"}
                    >
                      {showPwd ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M10.6 10.7A3 3 0 0 0 12 15a3 3 0 0 0 3-3c0-.4-.1-.9-.3-1.2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M9.9 5.1A10.8 10.8 0 0 1 12 5c5.2 0 9.7 3.2 11.3 7.7-.5 1.3-1.3 2.6-2.4 3.7M6.3 6.3C3.8 7.6 2 9.6.7 12 2.3 16.5 6.8 19.7 12 19.7c1.1 0 2.1-.1 3.1-.4" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M12 5c5.2 0 9.7 3.2 11.3 7.7C21.7 17.2 17.2 20.3 12 20.3S2.3 17.2.7 12.7C2.3 8.2 6.8 5 12 5Z" stroke="currentColor" strokeWidth="1.5"/>
                          <circle cx="12" cy="12.7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-coffee-600 focus:ring-coffee-500"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-sm font-medium text-coffee-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-coffee-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading && (
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"></path>
                    </svg>
                  )}
                  Log In
                </button>

                <button
                  type="button"
                  onClick={onGuest}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Continue as Guest
                </button>
              </form>

              <p className="text-sm mt-4 text-gray-700 text-center">
                Don't have an account?{" "}
                <Link
                  className="text-coffee-700 font-semibold hover:underline"
                  to="/signup"
                  onClick={() => onClose?.()}
                >
                  Sign Up
                </Link>
              </p>
            </>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === "forgot" && (
            <>
              <button
                type="button"
                onClick={() => setView("login")}
                className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to login
              </button>

              <div className="mb-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-coffee-600/10 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-coffee-700">
                    <path d="M12 11v5M12 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h1 id="modal_title" className="mt-3 text-2xl font-bold text-gray-900">
                  Forgot Password?
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Enter your email to receive a reset link
                </p>
              </div>

              <form onSubmit={onForgotSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot_email" className="sr-only">Email</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M4 6l8 7 8-7" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </span>
                    <input
                      ref={emailRef}
                      id="forgot_email"
                      className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-coffee-500 focus:ring-2 focus:ring-coffee-200"
                      placeholder="you@example.com"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-coffee-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading && (
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"></path>
                    </svg>
                  )}
                  Send Reset Link
                </button>
              </form>
            </>
          )}

          {/* SUCCESS VIEW */}
          {view === "sent" && (
            <>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h1 className="mt-3 text-2xl font-bold text-gray-900">Check your inbox</h1>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent password reset instructions to <span className="font-semibold">{email}</span>
                </p>

                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="mt-6 w-full rounded-lg bg-coffee-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-300"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}