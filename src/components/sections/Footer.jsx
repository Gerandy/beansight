import { Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-coffee-700 to-coffee-600 py-5">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
        <div className="flex-shrink-0">
          <img src="src/assets/solacew3.png" alt="logo" className="h-15 w-35" />
        </div>

        <div className="flex gap-12 text-sm">
          <div className="flex flex-col gap-2">
            <Link to="/about" className="text-white font-bold hover:underline">About</Link>
            <Link to="/terms" className="text-white font-bold hover:underline">Terms & Conditions</Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/faq" className="text-white font-bold hover:underline">FAQ</Link>
            <Link to="/privacy" className="text-white font-bold hover:underline">Privacy Policy</Link>
          </div>
        </div>

        <div className="text-center md:text-left flex flex-col items-center gap-2">
          <p className="text-white font-bold">For news and updates, follow us</p>
          <div className="flex items-center gap-2">
            <Instagram className="h-8 w-8 text-white hover:text-coffee-200 cursor-pointer transition-colors" />
            <Facebook className="h-8 w-8 text-white hover:text-coffee-200 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

