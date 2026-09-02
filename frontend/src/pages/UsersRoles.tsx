import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  Search, 
  CheckCircle2, 
  Lock, 
  KeyRound, 
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import { Officer } from '../types';

export const UsersRoles: React.FC = () => {
  const [officersList, setOfficersList] = useState<Officer[]>([
    {
      id: 'OFF-DEL-408',
      name: 'R. Sharma',
      designation: 'Enforcement Officer',
      badgeNumber: 'LM-ENF-7821',
      zone: 'North Zone (HQ)',
      state: 'Delhi (NCT)',
      email: 'r.sharma@legalmetrology.gov.in',
      role: 'Enforcement Officer',
    },
    {
      id: 'OFF-DEL-412',
      name: 'A. Verma',
      designation: 'Senior Legal Metrology Inspector',
      badgeNumber: 'LM-INSP-3914',
      zone: 'North Zone',
      state: 'Delhi (NCT)',
      email: 'a.verma@legalmetrology.gov.in',
      role: 'Senior Legal Metrology Inspector',
    },
    {
      id: 'OFF-MUM-104',
      name: 'P. Kulkarni',
      designation: 'Zonal Controller',
      badgeNumber: 'LM-CTRL-0941',
      zone: 'West Zone',
      state: 'Maharashtra',
      email: 'p.kulkarni@legalmetrology.gov.in',
      role: 'Zonal Controller',
    },
    {
      id: 'OFF-BLR-209',
      name: 'S. Narayanan',
      designation: 'Enforcement Officer',
      badgeNumber: 'LM-ENF-5582',
      zone: 'South Zone',
      state: 'Karnataka',
      email: 's.narayanan@legalmetrology.gov.in',
      role: 'Enforcement Officer',
    }
  ]);

  return (
    <div className="space-y-4 pb-8 text-xs">
      
      {/* Header */}
      <div className="bg-white p-4 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider">Access Management</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">Department of Legal Metrology</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-serif">Enforcement Officers & Access Roles</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Authorized Legal Metrology inspectors, digital signature certificates (DSC) & zonal jurisdictions.
          </p>
        </div>

        <button className="bg-[#78350F] hover:bg-[#582509] text-white font-semibold py-1.5 px-3 rounded transition-colors flex items-center gap-1 shadow-xs shrink-0">
          <Plus className="w-3.5 h-3.5" />
          <span>+ Enroll Authorized Officer</span>
        </button>
      </div>

      {/* Officers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {officersList.map((officer) => (
          <div 
            key={officer.id}
            className="bg-white p-4 border border-slate-200 rounded space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded bg-[#78350F] text-white font-bold text-xs flex items-center justify-center">
                  {officer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">{officer.name}</h3>
                  <p className="text-[11px] font-semibold text-[#78350F]">{officer.designation}</p>
                  <span className="text-[9.5px] font-mono text-slate-400">ID: {officer.id}</span>
                </div>
              </div>

              <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                Active Duty
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Enforcement Zone</span>
                <span className="font-semibold text-slate-800 text-[10.5px] mt-0.5 block">{officer.zone}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Badge Number</span>
                <span className="font-mono font-bold text-slate-800 text-[10.5px] mt-0.5 block">{officer.badgeNumber}</span>
              </div>
            </div>

            <div className="text-slate-600 space-y-0.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{officer.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-800 font-medium">DSC Class 3 Digital Certificate Linked</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Role: <strong>{officer.role}</strong></span>
              <button className="font-semibold text-[#78350F] hover:underline">
                Edit Credentials →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Role Permissions Matrix Card */}
      <div className="bg-white p-4 border border-slate-200 rounded space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Role-Based Access Control (RBAC) Statutory Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-50 font-bold text-slate-700 text-[10.5px] border-b border-slate-200 uppercase">
                <th className="py-2 px-3">Statutory Action / Privilege</th>
                <th className="py-2 px-3 text-center">Enforcement Officer</th>
                <th className="py-2 px-3 text-center">Senior Inspector</th>
                <th className="py-2 px-3 text-center">Zonal Controller</th>
                <th className="py-2 px-3 text-center">System Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-center">
              <tr>
                <td className="py-2 px-3 text-left font-medium text-slate-800">Execute Package Scans & Uploads</td>
                <td className="text-emerald-800 font-bold">✓</td>
                <td className="text-emerald-800 font-bold">✓</td>
                <td className="text-emerald-800 font-bold">✓</td>
                <td className="text-slate-400">—</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-left font-medium text-slate-800">Override AI OCR Declarations</td>
                <td className="text-emerald-800 font-bold">✓</td>
                <td className="text-emerald-800 font-bold">✓</td>
                <td className="text-emerald-800 font-bold">✓</td>
                <td className="text-slate-400">—</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-left font-medium text-slate-800">Issue Section 36 Statutory Notices</td>
                <td className="text-emerald-800 font-bold">✓</td>
                <td className="text-emerald-800 font-bold">✓</td>
                <td className="text-emerald-800 font-bold">✓</td>
                <td className="text-slate-400">—</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-left font-medium text-slate-800">Order Section 48 Compounding</td>
                <td className="text-slate-400">—</td>
                <td className="text-emerald-800 font-bold">✓</td>
                <td className="text-emerald-800 font-bold">✓</td>
                <td className="text-slate-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
