import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useInspection } from '../context/InspectionContext';

export const Login: React.FC = () => {
  const { login } = useInspection();
  
  const [officerId, setOfficerId] = useState<string>('OFF-DEL-408');
  const [password, setPassword] = useState<string>('Officer@2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotNotice, setShowForgotNotice] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedId = officerId.trim();
    const trimmedPass = password.trim();

    if (!trimmedId) {
      setErrorMessage('Please enter your Officer ID or Official Email.');
      return;
    }

    if (!trimmedPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (trimmedPass.length < 4) {
      setErrorMessage('Password must be at least 4 characters in length.');
      return;
    }

    setIsLoading(true);

    // Realistic authentication verification latency
    setTimeout(() => {
      const email = trimmedId.includes('@') 
        ? trimmedId 
        : `${trimmedId.toLowerCase()}@inspectiq.legalmetrology.gov.in`;

      const success = login(trimmedId, email);

      if (!success) {
        setErrorMessage('Authentication failed. Please verify your officer credentials and try again.');
        setIsLoading(false);
      }
    }, 650);
  };

  return (
    <div className="min-h-[100dvh] bg-[#F4F7FA] flex justify-center items-center text-[#17212B] font-sans p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-card border border-[#D9E1E8] p-6 space-y-6">
        
        {/* Wordmark Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#12304A] flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-xs">
              IQ
            </div>
            <span className="text-xl font-bold tracking-tight text-[#12304A]">
              Inspect<span className="text-[#0F766E]">IQ</span>
            </span>
          </div>
          <p className="text-xs text-[#52616F] font-medium">
            Digital Packaged Commodity Inspection
          </p>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
          {/* Officer ID / Email */}
          <div>
            <label 
              htmlFor="officer-id"
              className="block font-semibold text-[#17212B] uppercase tracking-wider text-[11px] mb-1.5"
            >
              Officer ID / Official Email <span className="text-[#B91C1C]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#52616F] absolute left-3 top-3 pointer-events-none" />
              <input
                id="officer-id"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                required
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                placeholder="e.g. OFF-DEL-408 or officer@gov.in"
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-[#17212B] font-medium transition-colors"
              />
            </div>
          </div>

          {/* Password with Visibility Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label 
                htmlFor="officer-password"
                className="block font-semibold text-[#17212B] uppercase tracking-wider text-[11px]"
              >
                Password <span className="text-[#B91C1C]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotNotice(!showForgotNotice)}
                className="text-[10.5px] text-[#0F766E] hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#52616F] absolute left-3 top-3 pointer-events-none" />
              <input
                id="officer-password"
                type={showPassword ? 'text' : 'password'}
                autoCapitalize="none"
                autoCorrect="off"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={isLoading}
                className="w-full pl-9 pr-10 py-2.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-[#17212B] font-medium transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-2.5 text-[#52616F] hover:text-[#17212B] p-0.5 rounded"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Notice for Forgot Password */}
          {showForgotNotice && (
            <div className="p-2.5 bg-[#E6F4F1] border border-[#D9E1E8] rounded-lg text-[11px] text-[#0F766E] space-y-1">
              <p className="font-semibold">Password Recovery</p>
              <p className="text-[10.5px] text-[#17212B]">
                Please contact your Zonal Legal Metrology Controller or nodal administrator to reset your credentials.
              </p>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.99] text-white font-semibold text-xs py-3 px-4 rounded-lg shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Authenticating Officer...</span>
              </>
            ) : (
              <>
                <span>Sign In to InspectIQ</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#D9E1E8] text-center">
          <p className="text-[10px] text-[#52616F] font-medium">
            Authorized Legal Metrology Personnel Only · PCR 2011
          </p>
        </div>

      </div>
    </div>
  );
};
