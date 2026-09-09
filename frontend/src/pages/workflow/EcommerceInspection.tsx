import React, { useState, useRef } from 'react';
import { 
  ShoppingBag, 
  Globe, 
  Upload, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  ShieldCheck,
  Search,
  Check,
  X,
  FileSearch,
  Eye,
  Store
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { PackageImage } from '../../types';

export const EcommerceInspection: React.FC = () => {
  const { currentInspection, updateInspectionMetadata, addImage, runAiPipeline, setFlowStep } = useInspection();

  const [productUrl, setProductUrl] = useState(
    currentInspection.ecommerceUrl || 'https://www.blinkit.com/prn/surf-excel-matic-2kg/prid/39824'
  );
  const [activeTab, setActiveTab] = useState<'url' | 'screenshot'>('url');
  const [platform, setPlatform] = useState('Blinkit Quick Commerce');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [uploadedScreenshotUrl, setUploadedScreenshotUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sampleListingPresets = [
    {
      name: 'Surf Excel Matic Front Load 2kg (Blinkit)',
      url: 'https://www.blinkit.com/prn/surf-excel-matic-2kg/prid/39824',
      platform: 'Blinkit Quick Commerce',
      mrp: '₹ 450.00',
      sellingPrice: '₹ 399.00',
      usp: '₹ 0.20 / g',
      netQty: '2 kg',
      origin: 'Not Declared on PDP (Violation)',
      issue: 'Missing Country of Origin on Digital Listing',
      status: 'Potential Non-Compliance'
    },
    {
      name: 'Tata Salt Vacuum Evaporated 1kg (Amazon.in)',
      url: 'https://www.amazon.in/dp/B00TS8O87Y/tata-salt-1kg',
      platform: 'Amazon.in',
      mrp: '₹ 28.00',
      sellingPrice: '₹ 28.00',
      usp: '₹ 28.00 / kg',
      netQty: '1 kg',
      origin: 'India',
      issue: 'Full Statutory Compliance Under Rule 6(10)',
      status: 'Compliant'
    },
    {
      name: 'Fortune Sunlite Sunflower Oil 1L (Zepto)',
      url: 'https://www.zepto.com/p/fortune-sunlite-sunflower-oil-1l',
      platform: 'Zepto 10-Min Delivery',
      mrp: '₹ 165.00',
      sellingPrice: '₹ 145.00',
      usp: '₹ 0.145 / ml',
      netQty: '1 L',
      origin: 'India',
      issue: 'USP Decimal Precision Review',
      status: 'Review Required'
    }
  ];

  const activePreset = sampleListingPresets.find((p) => p.url === productUrl) || sampleListingPresets[0];

  const handleFetchUrl = () => {
    setIsFetchingUrl(true);
    setTimeout(() => {
      setIsFetchingUrl(false);
      updateInspectionMetadata({
        ecommerceUrl: productUrl,
        retailerName: `${platform} Digital Marketplace`,
      });
    }, 400);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedScreenshotUrl(dataUrl);

      const newImage: PackageImage = {
        id: `img-ecom-screen-${Date.now()}`,
        side: 'screenshot',
        label: 'Digital Product Listing Screenshot',
        url: dataUrl,
        capturedAt: new Date().toISOString(),
        qualityScore: 98,
        blurScore: 'Low',
        glareScore: 'None',
        lightingScore: 'Optimal',
        textVisibilityScore: 'Crisp',
        boundingBoxes: []
      };
      addImage(newImage);
    };
    reader.readAsDataURL(file);
  };

  const handleProceed = () => {
    runAiPipeline();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8 text-xs">
      
      {/* Header */}
      <div className="bg-white p-4 border border-slate-200 rounded">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider">Step 2 of 7</span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] text-slate-500 font-medium">Digital Marketplace Listing Audit</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 font-serif">E-Commerce Mandatory Declarations Inspection</h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Audit digital product display pages under <strong>Rule 6(10) & Rule 6(11) of Legal Metrology (Packaged Commodities) Rules, 2011</strong> for mandatory pre-purchase statutory disclosures.
        </p>
      </div>

      {/* Input Options Card */}
      <div className="bg-white p-4 border border-slate-200 rounded space-y-3">
        
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <button
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-[#78350F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Marketplace Product URL</span>
          </button>
          
          <button
            onClick={() => setActiveTab('screenshot')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'screenshot'
                ? 'bg-[#78350F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Listing Screenshot</span>
          </button>
        </div>

        {/* URL Input Form */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                E-Commerce Product Listing URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://www.amazon.in/dp/... or https://blinkit.com/prn/..."
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#78350F] font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFetchUrl}
                  disabled={isFetchingUrl}
                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded transition-colors flex items-center gap-1 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isFetchingUrl ? 'Auditing...' : 'Audit URL'}</span>
                </button>
              </div>
            </div>

            {/* Quick Demo URLs */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider block">
                Select Demonstration Listing:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {sampleListingPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => { setProductUrl(preset.url); setPlatform(preset.platform); }}
                    className={`p-2.5 rounded border text-left text-xs transition-colors ${
                      productUrl === preset.url
                        ? 'border-[#78350F] bg-amber-50/60 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-slate-900 truncate max-w-[150px]">{preset.name.split(' ')[0]} {preset.name.split(' ')[1]}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        preset.status === 'Compliant' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {preset.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#78350F] block">{preset.platform}</span>
                    <span className="text-[9.5px] text-slate-500 block truncate mt-0.5">{preset.issue}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Extracted Listing Preview Box */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700">
                  Pre-Purchase Digital PDP Extraction (Rule 6(10))
                </span>
                <span className="text-[10px] font-mono text-slate-700 bg-white px-2 py-0.2 rounded border border-slate-300">
                  {activePreset.platform}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9.5px] text-slate-400 font-bold block">Declared MRP</span>
                  <span className="font-bold text-red-700 font-mono">{activePreset.mrp}</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9.5px] text-slate-400 font-bold block">Selling Price</span>
                  <span className="font-bold text-slate-900 font-mono">{activePreset.sellingPrice}</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9.5px] text-slate-400 font-bold block">Unit Sale Price</span>
                  <span className="font-bold text-[#78350F] font-mono">{activePreset.usp}</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-[9.5px] text-slate-400 font-bold block">Country of Origin</span>
                  <span className={`font-bold ${activePreset.origin.includes('Violation') ? 'text-red-700' : 'text-emerald-800'}`}>
                    {activePreset.origin}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screenshot Upload Form */}
        {activeTab === 'screenshot' && (
          <div className="space-y-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#78350F] rounded p-6 text-center space-y-2 bg-slate-50 hover:bg-amber-50/20 transition-colors cursor-pointer"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleScreenshotUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mx-auto">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Upload Full-Page Marketplace Listing Screenshot</h4>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  PNG, JPG or WebP. OCR will extract all mandatory specification tables and statutory disclaimers.
                </p>
              </div>
            </div>

            {uploadedScreenshotUrl && (
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center gap-3">
                <img src={uploadedScreenshotUrl} alt="Uploaded Screenshot" className="w-12 h-12 object-cover rounded border border-slate-300" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Screenshot Loaded for Optical Parsing</span>
                  <span className="text-emerald-800 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for OCR Extraction & Rule Analysis
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Mandatory E-Commerce Legal Metrology Checklist */}
      <div className="bg-white p-4 border border-slate-200 rounded space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Rule 6(10) Mandatory Pre-Purchase Declarations Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block">1. Maximum Retail Price (MRP)</span>
            <span className="text-[10.5px] text-slate-500">Inclusive of all taxes in Rupees</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block">2. Unit Sale Price (USP)</span>
            <span className="text-[10.5px] text-slate-500">Declared in ₹ per g/ml/piece</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block">3. Net Quantity</span>
            <span className="text-[10.5px] text-slate-500">In standard metric units (kg, g, l, ml)</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block">4. Country of Origin</span>
            <span className="text-[10.5px] text-slate-500">Mandatory on digital product page</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block">5. Manufacturer / Importer</span>
            <span className="text-[10.5px] text-slate-500">Complete registered legal entity</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="font-bold text-slate-900 block">6. Expiry / Best Before</span>
            <span className="text-[10.5px] text-slate-500">Unambiguous shelf-life disclosure</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setFlowStep('create')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Back to Setup
          </button>

          <button
            onClick={handleProceed}
            className="bg-[#78350F] hover:bg-[#582509] text-white font-semibold text-xs py-2 px-6 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Run E-Commerce Compliance Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
