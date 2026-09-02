import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useInspection } from '../context/InspectionContext';

export const Login: React.FC = () => {
  const { login } = useInspection();
  const [officerId, setOfficerId] = useState('OFF-DEL-408');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(officerId, `${officerId.toLowerCase()}@inspectiq.legalmetrology.in`);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100 flex justify-center items-center text-slate-900 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-blue-900 text-white font-black text-xl rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            IQ
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-blue-950">
            InspectIQ
          </h1>
          <p className="text-xs text-slate-500">
            Legal Metrology (PCR 2011) Field Inspection Assistant
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px] mb-1">
              Officer Badge ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                placeholder="e.g. OFF-DEL-408"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 text-slate-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10.5px] mb-1">
              Security PIN / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Quick Credential Hint */}
          <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-center justify-between">
            <span>Demo Officer: <strong>R. Sharma</strong></span>
            <span className="font-mono text-[10px] text-blue-700">Central Zone</span>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In to InspectIQ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-1 border-t border-slate-100">
          <span className="text-[10px] text-slate-400 font-medium">
            Authorized Enforcement Personnel Only · PCR 2011
          </span>
        </div>

      </div>
    </div>
  );
};
