import React, { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#earth-explorer', label: '3D Earth' },
    { href: '#dashboard', label: 'Dashboard' },
    { href: '#calculator', label: 'Carbon Calculator' },
    { href: '#simulator', label: 'Energy Simulator' },
    { href: '#renewables', label: 'Renewables' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#040d09]/90 backdrop-blur-md border-b border-emerald-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>EcoVision 3D</span>
          </a>

          {/* Zone 2: 4-5 single-line clean nav links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <a
              href="#ai-advisor"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Advisor</span>
            </a>
          </div>

          {/* Mobile menu hamburger toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-950 bg-[#040d09] px-4 pt-3 pb-5 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-300 hover:text-emerald-400 py-1"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <a
              href="#ai-advisor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Advisor</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
