import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';

export const GovFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gov-cardborder text-slate-500 text-xs py-4 px-6 mt-auto">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        
        {/* Left Notice */}
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gov-600 shrink-0" />
          <span className="text-[11px] leading-tight">
            © 2026 Department of Legal Metrology, Ministry of Consumer Affairs, Food & Public Distribution, Government of India.
          </span>
        </div>

        {/* Center Prototype Disclaimer */}
        <div className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-md">
          <strong className="font-semibold">SIH26034 Prototype System:</strong> AI provides compliance intelligence; final enforcement authority rests with the Legal Metrology Officer.
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-4 text-[11px] text-slate-600 font-medium">
          <a href="#privacy" className="hover:text-gov-800 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#terms" className="hover:text-gov-800 transition-colors">Terms of Use</a>
          <span>•</span>
          <a href="#support" className="hover:text-gov-800 transition-colors">Enforcement Support</a>
          <span>•</span>
          <span className="text-gov-700 font-mono">v1.0.4 PROTOTYPE</span>
        </div>

      </div>
    </footer>
  );
};
