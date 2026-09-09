import React, { useState } from 'react';
import { 
  Package, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Tag, 
  Layers, 
  FileText 
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { ProductDetails } from '../../types';

export const ProductDetailsScreen: React.FC = () => {
  const { currentInspection, updateProductDetails, setFlowStep } = useInspection();

  const details = currentInspection.productDetails;

  const [productName, setProductName] = useState<string>(
    details?.productName || (currentInspection.productName !== 'Pending Capture' ? currentInspection.productName : '')
  );
  const [brand, setBrand] = useState<string>(
    details?.brand || (currentInspection.brand !== 'Pending Capture' ? currentInspection.brand : '')
  );
  const [category, setCategory] = useState<string>(
    details?.category || currentInspection.category || 'Food / Grocery'
  );
  const [specifications, setSpecifications] = useState<string>(
    details?.specifications || ''
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = productName.trim();
    const trimmedBrand = brand.trim();
    const trimmedCategory = category.trim();

    if (!trimmedName) {
      setErrorMessage('Product name is required.');
      return;
    }

    if (!trimmedBrand) {
      setErrorMessage('Brand name is required.');
      return;
    }

    const updatedDetails: ProductDetails = {
      productName: trimmedName,
      brand: trimmedBrand,
      category: trimmedCategory,
      specifications: specifications.trim(),
    };

    updateProductDetails(updatedDetails);
    setFlowStep('ocr_extraction');
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-115px)] max-w-md mx-auto p-4 select-none">
      
      {/* Form Content */}
      <form id="product-details-form" onSubmit={handleSubmit} className="space-y-4">
        
        {/* Header Block */}
        <div className="border-b border-[#D9E1E8] pb-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">
              Step 4 · Product Information
            </span>
            <span className="text-[10.5px] font-mono text-[#52616F]">
              Basic Identification
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#12304A] mt-1">Product Details</h1>
          <p className="text-xs text-[#52616F] mt-0.5">
            Enter basic product information before extracting package declarations.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Informational Guidance */}
        <div className="p-3 bg-[#EBF8F7] border border-[#CCFBF1] rounded-xl flex items-start gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#0F766E] mt-1.5 shrink-0" />
          <p className="text-[11px] text-[#0F766E] leading-relaxed">
            <strong>Streamlined Workflow:</strong> Mandatory package declarations (MRP, Net Quantity, Batch No., Manufacturing Date, and Manufacturer details) will be extracted automatically from the package images in the next OCR step and verified by you.
          </p>
        </div>

        {/* Inputs Card */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-4 shadow-card space-y-3.5">
          
          {/* 1. Product Name (Required) */}
          <div>
            <label 
              htmlFor="product-name"
              className="block font-semibold text-[#17212B] uppercase tracking-wider text-[11px] mb-1.5"
            >
              Product Name <span className="text-[#B91C1C]">*</span>
            </label>
            <div className="relative">
              <Package className="w-4 h-4 text-[#52616F] absolute left-3 top-3 pointer-events-none" />
              <input
                id="product-name"
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Whole Wheat Atta"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-xs text-[#17212B] font-medium"
              />
            </div>
          </div>

          {/* 2. Brand (Required) */}
          <div>
            <label 
              htmlFor="brand-name"
              className="block font-semibold text-[#17212B] uppercase tracking-wider text-[11px] mb-1.5"
            >
              Brand <span className="text-[#B91C1C]">*</span>
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-[#52616F] absolute left-3 top-3 pointer-events-none" />
              <input
                id="brand-name"
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Example Brand"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-xs text-[#17212B] font-medium"
              />
            </div>
          </div>

          {/* 3. Category / Product Type (Required) */}
          <div>
            <label 
              htmlFor="product-category"
              className="block font-semibold text-[#17212B] uppercase tracking-wider text-[11px] mb-1.5"
            >
              Category / Product Type <span className="text-[#B91C1C]">*</span>
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-[#52616F] absolute left-3 top-3 pointer-events-none" />
              <select
                id="product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-xs text-[#17212B] font-medium appearance-none"
              >
                <option value="Food / Grocery">Food / Grocery</option>
                <option value="Cosmetics & Personal Care">Cosmetics & Personal Care</option>
                <option value="Beverages & Bottled Water">Beverages & Bottled Water</option>
                <option value="Electronics & Appliances">Electronics & Appliances</option>
                <option value="Paints & Chemicals">Paints & Chemicals</option>
                <option value="Textiles & Apparel">Textiles & Apparel</option>
                <option value="General Packaged Goods">General Packaged Goods</option>
              </select>
            </div>
          </div>

          {/* 4. Specifications / Remarks (Optional) */}
          <div>
            <label 
              htmlFor="specifications"
              className="block font-semibold text-[#17212B] uppercase tracking-wider text-[11px] mb-1.5"
            >
              Specifications / Remarks <span className="text-[#52616F] font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-[#52616F] absolute left-3 top-2.5 pointer-events-none" />
              <textarea
                id="specifications"
                rows={2}
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                placeholder="e.g. 500 g pouch, retail pack, variant or packaging notes..."
                className="w-full pl-9 pr-3 py-2 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-xs text-[#17212B] font-medium resize-none"
              />
            </div>
          </div>

        </div>

      </form>

      {/* Action Buttons */}
      <div className="pt-4 safe-bottom space-y-2">
        <button
          form="product-details-form"
          type="submit"
          className="w-full bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.98] text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to OCR Extraction →</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setFlowStep('image_quality')}
          className="w-full bg-white hover:bg-[#F4F7FA] text-[#52616F] border border-[#D9E1E8] font-semibold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Image Quality</span>
        </button>
      </div>

    </div>
  );
};
