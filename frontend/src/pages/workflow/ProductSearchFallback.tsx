import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, ArrowLeft, Check, AlertCircle, Package } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { searchCatalogue, PRODUCT_CATALOGUE, CatalogueProduct } from '../../data/productCatalogue';
import { IdentifiedProduct } from '../../types';

export const ProductSearchFallback: React.FC = () => {
  const { currentInspection, setConfirmedProduct, setFlowStep } = useInspection();

  const aiClue = currentInspection.identifiedProduct?.brand !== 'Not detected' 
    ? currentInspection.identifiedProduct?.brand || '' 
    : '';

  const [query, setQuery] = useState<string>(aiClue);
  const [results, setResults] = useState<CatalogueProduct[]>(() => searchCatalogue(aiClue));
  const [showCategories, setShowCategories] = useState<boolean>(false);

  const categories = [
    'Food & Beverages',
    'Personal Care',
    'Household Care',
    'Edible Oils',
    'Staples & Spices'
  ];

  const handleSearch = (text: string) => {
    setQuery(text);
    setResults(searchCatalogue(text));
  };

  const handleSelect = (item: CatalogueProduct) => {
    const identified: IdentifiedProduct = {
      name: item.name,
      brand: item.brand,
      category: item.category,
      subCategory: item.subCategory,
      productType: item.productType,
      variant: item.variant || 'Standard',
      flavour: item.flavour,
      colour: item.colour,
      packSize: `${item.packSize} ${item.unit}`,
      unit: item.unit,
      mrp: item.mrp,
      barcode: item.barcode,
      manufacturer: item.manufacturer,
      countryOfOrigin: item.countryOfOrigin,
      visibleText: item.commonVisibleText,
      source: 'Product Search',
      status: 'Confirmed'
    };

    setConfirmedProduct(identified);
    setFlowStep('product_confirmation');
  };

  const handleContinueAsUnknown = () => {
    const unknown: IdentifiedProduct = {
      name: query.trim() || 'Unregistered Packaged Commodity',
      brand: 'Unbranded / Trader Packed',
      category: 'General Packaged Goods',
      packSize: 'Standard Retail Pack',
      source: 'Manual Entry',
      status: 'Confirmed'
    };

    setConfirmedProduct(unknown);
    setFlowStep('product_confirmation');
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      {/* Top Header & Search Input */}
      <div className="space-y-3">
        <div>
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
            Step 6 of 12
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Product Search</h1>
          <p className="text-xs text-slate-500 mt-0.5">Catalogue lookup fallback for packaged commodities.</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, brand, barcode, variant..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 text-slate-900 shadow-xs font-medium"
          />
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleSearch(cat)}
              className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 border border-slate-200"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-0.5">
          {results.length > 0 ? (
            results.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between gap-2 hover:border-blue-800 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {item.brand} · {item.variant || item.productType} · {item.packSize} {item.unit}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-xs transition-colors shrink-0"
                >
                  Select
                </button>
              </div>
            ))
          ) : (
            /* No Matching Result State */
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center space-y-3 shadow-xs">
              <Package className="w-8 h-8 text-slate-400 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-800">No matching product found.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Try broadening your search term or continue as an unregistered commodity.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSearch('')}
                  className="w-full py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  Search Again (Clear Filters)
                </button>

                <button
                  type="button"
                  onClick={handleContinueAsUnknown}
                  className="w-full py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
                >
                  Continue as Unknown Product
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back to Product Identification */}
      <div className="pt-3 safe-bottom">
        <button
          type="button"
          onClick={() => setFlowStep('ai_identification')}
          className="w-full text-xs font-semibold text-slate-600 hover:text-slate-900 py-2 flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Product Identification</span>
        </button>
      </div>

    </div>
  );
};
