import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Edit3, 
  Save, 
  X, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Eye,
  Layers,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { ExtractedDeclaration, PackageImage, PackageSide } from '../../types';

export const DeclarationVerification: React.FC = () => {
  const { currentInspection, updateDeclaration, setFlowStep, updateInspectionMetadata } = useInspection();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [editingDeclId, setEditingDeclId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'detected' | 'review' | 'not_detected'>('detected');
  const [highlightedFieldKey, setHighlightedFieldKey] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Add Custom Declaration Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [newFieldRuleRef, setNewFieldRuleRef] = useState('Rule 6(1)');
  const [newFieldSide, setNewFieldSide] = useState<PackageSide>('back');

  const activeImage = currentInspection.images[selectedImageIndex] || currentInspection.images[0];

  const handleStartEdit = (decl: ExtractedDeclaration) => {
    setEditingDeclId(decl.id);
    setEditValue(decl.detectedValue);
    setEditStatus(decl.status);
  };

  const handleSaveEdit = (declId: string) => {
    updateDeclaration(declId, editValue, editStatus);
    setEditingDeclId(null);
  };

  const handleAddCustomDeclaration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName || !newFieldValue) return;

    const newDecl: ExtractedDeclaration = {
      id: `decl-custom-${Date.now()}`,
      fieldKey: newFieldName.toLowerCase().replace(/\s+/g, '_'),
      fieldName: newFieldName,
      detectedValue: newFieldValue,
      confidence: 95,
      status: 'detected',
      isMandatory: true,
      sideFound: newFieldSide,
      ruleRef: newFieldRuleRef,
      isEdited: true,
    };

    updateInspectionMetadata({
      declarations: [...currentInspection.declarations, newDecl],
    });

    setIsAddModalOpen(false);
    setNewFieldName('');
    setNewFieldValue('');
  };

  const handleDeleteDeclaration = (id: string) => {
    updateInspectionMetadata({
      declarations: currentInspection.declarations.filter((d) => d.id !== id),
    });
  };

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header */}
      <div className="bg-white p-4 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider">
              Step 4 of 7
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">Declaration Verification</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-serif">
            Statutory Declarations Verification (PCR Rule 6)
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Verify OCR detected declarations against the actual package image. Non-detected declarations are flagged as "Not Detected".
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white border border-slate-300 text-slate-700 font-semibold text-xs py-2 px-3 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Declaration</span>
          </button>

          <button
            onClick={() => setFlowStep('compliance')}
            className="bg-[#78350F] hover:bg-[#582509] text-white font-semibold text-xs py-2 px-4 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Proceed to Step 5 (Compliance)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Split Interface: Left Actual Image + Right Declarations Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 5 Cols: Actual Uploaded Image with Bounding Boxes */}
        <div className="lg:col-span-5 space-y-2">
          <div className="bg-white p-3 border border-slate-200 rounded space-y-2">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-xs">
              <span className="font-bold text-slate-800 truncate">
                Actual Package Photo ({currentInspection.productName})
              </span>

              {/* Side switcher */}
              {currentInspection.images.length > 1 && (
                <div className="flex gap-1">
                  {currentInspection.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`px-2 py-0.5 text-[10.5px] font-bold rounded ${
                        selectedImageIndex === idx
                          ? 'bg-[#78350F] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {img.side.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Canvas Viewport */}
            <div className="relative bg-slate-900 rounded p-2 flex items-center justify-center min-h-[340px] max-h-[420px] overflow-hidden select-none">
              {activeImage && (
                <div className="relative flex items-center justify-center" style={{ transform: `scale(${zoomLevel})` }}>
                  <img 
                    src={activeImage.url} 
                    alt="Package Display with OCR" 
                    className="max-h-[380px] max-w-full object-contain rounded"
                  />

                  {/* Bounding Boxes on Actual Image */}
                  {activeImage.boundingBoxes?.map((box) => {
                    const isSelected = highlightedFieldKey === box.fieldKey;

                    return (
                      <div
                        key={box.id}
                        className={`absolute rounded transition-all pointer-events-none ${
                          isSelected
                            ? 'border-2 border-amber-400 bg-amber-400/25 ring-2 ring-amber-400 z-20'
                            : box.status === 'violation'
                            ? 'border-2 border-red-500 bg-red-500/15'
                            : box.status === 'review'
                            ? 'border-2 border-amber-500 bg-amber-500/15'
                            : 'border border-emerald-500 bg-emerald-500/15'
                        }`}
                        style={{
                          left: `${box.x}%`,
                          top: `${box.y}%`,
                          width: `${box.width}%`,
                          height: `${box.height}%`,
                        }}
                      >
                        <span className="absolute -top-4 left-0 text-[8px] font-bold px-1 rounded text-white bg-black/85 whitespace-nowrap">
                          {box.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Zoom Controls */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1.5">
                <button onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.1))} title="Zoom Out">-</button>
                <span className="font-mono">{(zoomLevel * 100).toFixed(0)}%</span>
                <button onClick={() => setZoomLevel(Math.min(2.0, zoomLevel + 0.1))} title="Zoom In">+</button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center">
              Hover over or click a declaration on the right to locate its OCR bounding box.
            </p>
          </div>
        </div>

        {/* Right 7 Cols: Formal Declarations Table */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Extracted Mandatory Declarations (PCR Rule 6)
                </h3>
                <p className="text-[11px] text-slate-500">
                  {currentInspection.declarations.length} statutory parameters verified from actual image
                </p>
              </div>
              
              <div className="flex items-center gap-1 text-[10.5px]">
                <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Detected
                </span>
                <span className="text-red-800 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  ✕ Not Detected
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200 uppercase">
                    <th className="py-2.5 px-3">Statutory Field</th>
                    <th className="py-2.5 px-3">Detected Information</th>
                    <th className="py-2.5 px-3">Rule Ref</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentInspection.declarations.map((decl) => {
                    const isEditing = editingDeclId === decl.id;
                    const isHighlighted = highlightedFieldKey === decl.fieldKey;
                    const isNotDetected = decl.status === 'not_detected';

                    return (
                      <tr 
                        key={decl.id}
                        onMouseEnter={() => setHighlightedFieldKey(decl.fieldKey)}
                        onMouseLeave={() => setHighlightedFieldKey(null)}
                        className={`transition-colors ${isHighlighted ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                      >
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {decl.fieldName}
                          {decl.isEdited && (
                            <span className="text-[9px] text-blue-700 bg-blue-50 px-1 rounded block">
                              Edited by Officer
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-300 rounded w-full"
                              />
                              <button
                                onClick={() => handleSaveEdit(decl.id)}
                                className="bg-emerald-700 text-white p-1 rounded hover:bg-emerald-800"
                                title="Save"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setEditingDeclId(null)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className={`font-mono text-[11px] block ${isNotDetected ? 'text-red-700 font-bold' : 'text-slate-900 font-medium'}`}>
                              {decl.detectedValue}
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-3 font-mono text-[10.5px] text-[#78350F]">
                          {decl.ruleRef}
                        </td>

                        <td className="py-2 px-3">
                          <span className={`inline-block text-[9.5px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            decl.status === 'detected'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : decl.status === 'review'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}>
                            {decl.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(decl)}
                              className="text-slate-500 hover:text-[#78350F] p-1 rounded"
                              title="Edit Field"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDeclaration(decl.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded"
                              title="Delete Field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                All declarations verified under Legal Metrology Act, 2009.
              </span>

              <button
                onClick={() => setFlowStep('compliance')}
                className="bg-[#78350F] hover:bg-[#582509] text-white font-semibold text-xs py-2 px-4 rounded transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Proceed to Step 5 (Compliance Assessment)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Add Custom Declaration Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded border border-slate-300 shadow-xl overflow-hidden text-xs">
            <div className="bg-[#1E293B] text-white p-3 flex items-center justify-between">
              <h3 className="font-bold text-xs">Add Statutory Declaration Field</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomDeclaration} className="p-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Field Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FSSAI License Number"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detected Value</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lic. No. 10014022003189"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rule Reference</label>
                  <input
                    type="text"
                    value={newFieldRuleRef}
                    onChange={(e) => setNewFieldRuleRef(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Side</label>
                  <select
                    value={newFieldSide}
                    onChange={(e) => setNewFieldSide(e.target.value as PackageSide)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  >
                    <option value="front">Front (PDP)</option>
                    <option value="back">Back Panel</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#78350F] text-white px-4 py-1.5 rounded font-semibold hover:bg-[#582509]"
                >
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
