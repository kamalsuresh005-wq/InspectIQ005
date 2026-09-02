import React, { useState } from 'react';
import { Phone, Globe, Eye, ShieldCheck } from 'lucide-react';

export const GovTopBar: React.FC = () => {
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xl'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const toggleContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.classList.toggle('high-contrast');
  };

  return (
    <div className="bg-[#1E293B] text-slate-200 text-xs border-b border-slate-700 select-none py-1 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2 z-50">
      {/* Left Gov Notice */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium text-amber-300">
          <span>GOVERNMENT OF INDIA</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-normal">Ministry of Consumer Affairs, Food & Public Distribution</span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-slate-300 text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          <span className="text-amber-400 font-semibold">SIH26034</span>
          <span>Prototype Portal</span>
        </div>
      </div>

      {/* Right Accessibility & Helpline */}
      <div className="flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1 text-amber-200">
          <Phone className="w-3 h-3 text-amber-400" />
          <span>NCH Helpline: <strong className="text-white">1915</strong></span>
        </div>

        <div className="h-3 w-px bg-slate-600 hidden sm:block"></div>

        {/* Accessibility controls */}
        <div className="hidden lg:flex items-center gap-1">
          <span className="text-slate-400">Font:</span>
          <button 
            onClick={() => setFontSizeLevel('normal')}
            className={`px-1.5 py-0.2 rounded font-mono ${fontSizeLevel === 'normal' ? 'bg-[#78350F] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            title="Normal font size"
          >
            A-
          </button>
          <button 
            onClick={() => setFontSizeLevel('large')}
            className={`px-1.5 py-0.2 rounded font-mono ${fontSizeLevel === 'large' ? 'bg-[#78350F] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            title="Default font size"
          >
            A
          </button>
          <button 
            onClick={() => setFontSizeLevel('xl')}
            className={`px-1.5 py-0.2 rounded font-mono font-bold ${fontSizeLevel === 'xl' ? 'bg-[#78350F] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            title="Large font size"
          >
            A+
          </button>
        </div>

        {/* Screen Reader & Contrast */}
        <button 
          onClick={toggleContrast}
          className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
          title="Toggle High Contrast Mode"
        >
          <Eye className="w-3 h-3 text-amber-300" />
          <span>Contrast</span>
        </button>

        {/* Language selector */}
        <button 
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 text-white font-medium transition-colors"
        >
          <Globe className="w-3 h-3 text-amber-400" />
          <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>
      </div>
    </div>
  );
};
