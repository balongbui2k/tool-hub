import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const logo = "/logo-PGL.png";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="border-b bg-white top-0 sticky z-50 select-none">
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity relative pointer-events-auto">
            <img src={logo} alt="Phúc Gia Logo" className="w-24 h-24 object-contain" />
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider absolute bottom-2 -right-12">Tool Hub</span>
          </Link>

          <nav className="flex items-center gap-6 pointer-events-auto">
            {!isSearchOpen && (
              <>
                <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-[#5FBA31] transition-colors">
                  PGL
                </Link>
                <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                  PGE
                </Link>
                <div className="w-px h-5 bg-slate-200"></div>
                <button className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                  Nội bộ
                </button>
              </>
            )}

            <div className="relative flex items-center">
              <AnimatePresence mode="wait">
                {isSearchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Tìm kiếm công cụ..."
                      className="w-full h-10 pl-4 pr-10 rounded-full border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#5FBA31] focus:ring-1 focus:ring-[#5FBA31]/20 text-sm transition-all cursor-text"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 transition-all rounded-full ${isSearchOpen
                  ? "absolute right-1 text-slate-400 hover:text-slate-600"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
              >
                {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
