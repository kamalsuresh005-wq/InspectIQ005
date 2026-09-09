import React, { useState } from 'react';
import { ArrowRight, Building, MapPin, FileText, AlertCircle, Shield, Briefcase } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { PremisesType, InspectionPurpose } from '../../types';

export const InspectionSetup: React.FC = () => {
  const { currentInspection, updatePremises, setFlowStep } = useInspection();

  const [premisesName, setPremisesName] = useState<string>(currentInspection.premisesName || '');
  const [premisesType, setPremisesType] = useState<PremisesType>(currentInspection.premisesType || 'Retail Store');
  const [purpose, setPurpose] = useState<InspectionPurpose>(currentInspection.inspectionPurpose || 'Routine Market Surveillance');
  const [address, setAddress] = useState<string>(currentInspection.premisesAddress || '');
  const [remarks, setRemarks] = useState<string>(currentInspection.officerRemarks || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = premisesName.trim();
    if (!trimmedName) {
      setErrorMessage('Premises or establishment name is required to begin an inspection.');
      return;
    }

    updatePremises(
      trimmedName,
      premisesType,
      address.trim(),
      remarks.trim(),
      purpose
    );

    setFlowStep('location');
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-115px)] max-w-md mx-auto p-4 select-none">
      
      {/* Form Content */}
      <form id="inspection-start-form" onSubmit={handleSubmit} className="space-y-4">
        
        {/* Header Block */}
        <div className="border-b border-[#D9E1E8] pb-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F766E] uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Inspection Record · {currentInspection.inspectionNumber}</span>
          </div>
          <h1 className="text-xl font-bold text-[#12304A]">Start New Inspection</h1>
          <p className="text-xs text-[#52616F] mt-1 leading-relaxed">
            Capture the inspection location and premises details before examining the packaged commodity.
          </p>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Card: Premises Details */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-4 shadow-card space-y-3.5">
          
          {/* Inspection Purpose */}
          <div>
            <label 
              htmlFor="inspection-purpose"
              className="block font-semibold text-[#17212B] uppercase tracking-wider text-[11px] mb-1.5"
            >
              Inspection Purpose <span className="text-[#B91C1C]">*</span>
            </label>
            <div className="relative">
              <select
                id="inspection-purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as InspectionPurpose)}
                className="w-full px-3 py-2.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-xs text-[#17212B] font-medium"
              >
                <option value="Routine Market Surveillance">Routine Market Surveillance</option>
                <option value="Consumer Complaint">Consumer Complaint</option>
                <option value="Re-Verification">Re-Verification</option>
                <option value="Special Enforcement Drive">Special Enforcement Drive</option>
                <option value="Random Spot Check">Random Spot Check</option>
              </select>
            </div>
          </div>

          {/* Premises Name (Required) */}
          <div>
            <label 
              htmlFor="premises-name"
              className="block font-semibold text-[#17212B] uppercase tracking-wider text-[11px] mb-1.5"
            >
              Premises / Establishment Name <span className="text-[#B91C1C]">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-[#52616F] absolute left-3 top-3 pointer-events-none" />
              <input
                id="premises-name"
                type="text"
                required
                value={premisesName}
                onChange={(e) => setPremisesName(e.target.value)}
                placeholder="e.g. Reliance Smart / Modern Mart"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-xs text-[#17212B] font-medium"
              />
            </div>
          </div>

          {/* Premises Type */}
          <div>
            <label 
              htmlFor="premises-type"
              className="block font-semibold text-[#17212B] uppercase tracking-wider text-[11px] mb-1.5"
            >
              Premises Type <span className="text-[#B91C1C]">*</span>
            </label>
            <select
              id="premises-type"
              value={premisesType}
              onChange={(e) => setPremisesType(e.target.value as PremisesType)}
              className="w-full px-3 py-2.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-xs text-[#17212B] font-medium"
            >
              <option value="Retail Store">Retail Store</option>
              <option value="Supermarket / Hypermarket">Supermarket / Hypermarket</option>
              <option value="Wholesale Dealer">Wholesale Dealer</option>
              <option value="Warehouse / Godown">Warehouse / Godown</option>
              <option value="E-Commerce Fulfillment Center">E-Commerce Fulfillment Center</option>
              <option value="Manufacturing Unit">Manufacturing Unit</option>
              <option value="Other">Other Premises</option>
            </select>
          </div>

          {/* Address / Location */}
          <div>
            <label 
              htmlFor="premises-address"
              className="block font-semibold text-[#17212B] uppercase tracking-wider text-[11px] mb-1.5"
            >
              Address / Locality
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#52616F] absolute left-3 top-3 pointer-events-none" />
              <input
                id="premises-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Shop 12, Commercial Complex, Sector 18"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-xs text-[#17212B] font-medium"
              />
            </div>
            <p className="text-[10px] text-[#52616F] mt-1">
              Physical address of the establishment being inspected.
            </p>
          </div>

          {/* Officer Remarks */}
          <div>
            <label 
              htmlFor="officer-remarks"
              className="block font-semibold text-[#17212B] uppercase tracking-wider text-[11px] mb-1.5"
            >
              Officer Remarks / Case Notes
            </label>
            <textarea
              id="officer-remarks"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Initial observations or reference notes (optional)..."
              className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-xs text-[#17212B] font-medium resize-none"
            />
          </div>

        </div>

      </form>

      {/* Action Footer */}
      <div className="pt-4 safe-bottom">
        <button
          form="inspection-start-form"
          type="submit"
          className="w-full bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.98] text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to Location</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
