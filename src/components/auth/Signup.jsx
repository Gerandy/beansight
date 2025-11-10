import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, ScrollText } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [error, setError] = useState("");

  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const [termsOpen, setTermsOpen] = useState(false);
  const [termsScrolledToEnd, setTermsScrolledToEnd] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("authToken")) navigate("/Myaccount", { replace: true });
  }, [navigate]);

  const strength = (() => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  })();

  const onScrollTerms = (e) => {
    const el = e.target;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (atBottom) setTermsScrolledToEnd(true);
  };

  const confirmRead = () => {
    setHasReadTerms(true);
    setTermsOpen(false);
  };

  const onSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !contactNumber || !pwd) {
      return setError("All fields are required.");
    }
    if (pwd !== pwd2) return setError("Passwords do not match.");
    if (!hasReadTerms || !agreed) return setError("Please read the Terms to the end and agree before signing up.");

    try {
      // 1️⃣ Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
      const userId = userCredential.user.uid;

      // 2️⃣ Store extra user info in Firestore
      await setDoc(doc(db, "users", userId), {
        firstName,
        lastName,
        email,
        contactNumber,
        role: "client", // default role
        createdAt: new Date(),
      });

      // 3️⃣ Save token & role in localStorage
      localStorage.setItem("authToken", userId);
      localStorage.setItem("role", "client");

      // 4️⃣ Redirect to Myaccount
      navigate("/Myaccount", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const canSubmit =
    firstName &&
    lastName &&
    email &&
    contactNumber &&
    pwd &&
    pwd2 &&
    pwd === pwd2 &&
    hasReadTerms &&
    agreed;

  return (
    <>
      <div className="max-w-md mx-auto mt-28 p-6 bg-white/95 rounded-xl shadow-lg ring-1 ring-black/5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-6 w-6 text-coffee-600" />
          <h1 className="text-2xl font-bold text-coffee-800">Create Account</h1>
        </div>
        <p className="text-sm text-gray-600 mb-4">Signup to get started with BeanSight</p>

        <form onSubmit={onSignup} className="space-y-4 text-gray-600">
          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Email & Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                placeholder="email@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact number</label>
              <input
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                placeholder="+1 234 567 8900"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                className="w-full border border-gray-300 p-2.5 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                placeholder="••••••••"
                type={showPwd ? "text" : "password"}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-coffee-700"
              >
                {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <div className="relative">
              <input
                className="w-full border border-gray-300 p-2.5 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                placeholder="••••••••"
                type={showPwd2 ? "text" : "password"}
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPwd2((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-coffee-700"
              >
                {showPwd2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Terms & Agreement */}
          <div className="rounded-lg border text-coffee-700 border-gray-200 p-3 bg-gray-50">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => {
                  setTermsOpen(true);
                  setTermsScrolledToEnd(false);
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-coffee-700 hover:text-coffee-800 hover:underline"
              >
                <ScrollText className="h-4 w-4" /> Read Terms of Service & Privacy Policy
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              You must read the Terms to the end before you can agree.
            </p>

            <div className="mt-3 flex items-start gap-2">
              <input
                id="agree"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-coffee-600 focus:ring-coffee-600"
                checked={agreed}
                disabled={!hasReadTerms}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="agree" className="text-sm text-gray-700">
                I agree to the Terms of Service and Privacy Policy.
                {!hasReadTerms && (
                  <span className="ml-1 text-xs text-red-600">(Please read them first)</span>
                )}
              </label>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            disabled={!canSubmit}
            className={`w-full py-2.5 rounded-lg text-white font-semibold transition
              ${canSubmit ? "bg-coffee-600 hover:bg-coffee-700" : "bg-coffee-300 cursor-not-allowed"}`}
          >
            Create Account
          </button>
        </form>

        <p className="text-sm mt-4 text-gray-700">
          Already have an account?{" "}
          <Link className="text-coffee-700 font-semibold hover:underline" to="/login">
            Log In
          </Link>
        </p>
      </div>

      {/* Terms Modal */}
     {termsOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="text-lg font-semibold text-coffee-800">Terms of Service & Privacy Policy</h2>
        <button
          onClick={() => setTermsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Scrollable content */}
      {/* Terms Modal */}
{termsOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="text-lg font-semibold text-coffee-800">Terms of Service & Privacy Policy</h2>
        <button
          onClick={() => setTermsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={onScrollTerms}
        className="px-5 py-4 overflow-y-auto max-h-[60vh]"
      >
        <div className="prose prose-sm prose-gray">
          <p>
            Welcome to BeanSight. Please read these Terms carefully. By creating an account, you
            agree to be bound by them.
          </p>

          <h3>1. Accounts</h3>
          <p>You are responsible for maintaining the confidentiality of your account and password.</p>

          <h3>2. Orders and Payments</h3>
          <p>All orders are subject to availability. Prices and fees may change without notice.</p>

          <h3>3. Privacy</h3>
          <p>We collect and process your data according to our Privacy Policy.</p>

          <h3>4. Security</h3>
          <p>Do not share your password. Enable additional security options when available.</p>

          <h3>5. Termination</h3>
          <p>We may suspend or terminate accounts that violate these Terms or applicable laws.</p>

          <p>By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
          <p>By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
          <p>By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
          <p>By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
          <p>By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
          <p>By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
          <p>By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
          <p>By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
          <p>By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
          <p>By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
          <p>By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
          <p>By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
          <p>By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>

          {/* Spacer to allow scrolling to bottom */}
          <div className="h-16" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-t">
        <span className={`text-sm ${termsScrolledToEnd ? "text-green-700" : "text-gray-600"}`}>
          {termsScrolledToEnd ? "You reached the end." : "Scroll to the end to enable confirmation."}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setTermsOpen(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={confirmRead}
            disabled={!termsScrolledToEnd}
            className={`px-4 py-2 rounded-lg text-white font-medium transition
              ${termsScrolledToEnd ? "bg-coffee-600 hover:bg-coffee-700" : "bg-coffee-300 cursor-not-allowed"}`}
          >
            I've read the Terms
          </button>
        </div>
      </div>
    </div>
  </div>
)}


      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-t">
        <span className={`text-sm ${termsScrolledToEnd ? "text-green-700" : "text-gray-600"}`}>
          {termsScrolledToEnd ? "You reached the end." : "Scroll to the end to enable confirmation."}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setTermsOpen(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={confirmRead}
            disabled={!termsScrolledToEnd}
            className={`px-4 py-2 rounded-lg text-white font-medium transition
              ${termsScrolledToEnd ? "bg-coffee-600 hover:bg-coffee-700" : "bg-coffee-300 cursor-not-allowed"}`}
          >
            I've read the Terms
          </button>
        </div>
      </div>
    </div>
  </div>
)}


    </>
  );
}
