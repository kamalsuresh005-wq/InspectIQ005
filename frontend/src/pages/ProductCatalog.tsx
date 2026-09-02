import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Package, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Calendar, 
  Eye, 
  Plus, 
  ArrowRight,
  X,
  FileCheck2,
  Image as ImageIcon
} from 'lucide-react';
import { useInspection } from '../context/InspectionContext';
import { ProductCatalogItem } from '../types';
import { SAMPLE_PRODUCTS } from '../data/mockProducts';

export const ProductCatalog: React.FC = () => {
  const { products, startNewInspection, viewExistingInspection } = useInspection();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductCatalogItem | null>(null);

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = 
      prod.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || prod.category.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 pb-8 text-xs">
      
      {/* Header */}
      <div className="bg-white p-4 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider">
              Commodity Master Repository
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">Department of Legal Metrology</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-serif">
            Registered Packaged Commodities Master Directory
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Commodity SKU profiles, repeat packaging non-compliances, and statutory inspection track records under <strong>PCR 2011</strong>.
          </p>
        </div>

        <button
          onClick={() => startNewInspection('physical')}
          className="bg-[#78350F] hover:bg-[#582509] text-white font-semibold py-1.5 px-3.5 rounded transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Inspect New Product</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 border border-slate-200 rounded flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search commodity name, brand, manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#78350F] text-xs"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs"
        >
          <option value="all">All Commodity Categories</option>
          <option value="nutrition">Health & Nutrition</option>
          <option value="food">Food & Instant Products</option>
          <option value="salt">Salt & Seasonings</option>
          <option value="detergent">Household Detergents</option>
          <option value="oil">Edible Oils</option>
          <option value="dairy">Dairy & Beverages</option>
        </select>
      </div>

      {/* Structured Product Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredProducts.map((prod) => {
          const isCompliant = prod.complianceStatus === 'Compliant';

          return (
            <div 
              key={prod.id}
              className="bg-white border border-slate-200 rounded overflow-hidden hover:border-[#78350F] transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Product Image Box */}
                <div className="aspect-[4/3] bg-slate-100 p-2 flex items-center justify-center border-b border-slate-200 overflow-hidden">
                  <img 
                    src={prod.imageUrl} 
                    alt={prod.productName} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Product Details */}
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{prod.brand}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      isCompliant ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {prod.complianceStatus}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs line-clamp-1 leading-tight">
                    {prod.productName}
                  </h3>

                  <p className="text-[10.5px] text-slate-500 truncate">
                    {prod.manufacturer}
                  </p>

                  <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-100 text-[10.5px]">
                    <div>
                      <span className="text-slate-400 block">Net Qty:</span>
                      <strong className="text-slate-800 font-mono">{prod.netQuantity}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">MRP:</span>
                      <strong className="text-red-700 font-mono">{prod.mrp}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {prod.inspectionCount} Inspections ({prod.violationsCount} Violations)
                </span>

                <button
                  onClick={() => setSelectedProduct(prod)}
                  className="text-xs font-semibold text-[#78350F] hover:underline"
                >
                  View Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive Product Profile Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded border border-slate-300 shadow-2xl overflow-hidden text-xs max-h-[90vh] flex flex-col">
            
            <div className="bg-[#1E293B] text-white p-3.5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-xs">{selectedProduct.productName}</h3>
                <span className="text-[10.5px] text-slate-300">{selectedProduct.brand} • {selectedProduct.category}</span>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              
              {/* Image & Main Particulars */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-5 bg-slate-100 p-2 rounded border border-slate-200 flex items-center justify-center">
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.productName} className="max-h-48 object-contain" />
                </div>

                <div className="sm:col-span-7 space-y-2">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Manufacturer / Packer</span>
                    <strong className="text-slate-900">{selectedProduct.manufacturer}</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Net Quantity</span>
                      <strong className="text-slate-900 font-mono">{selectedProduct.netQuantity}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">MRP</span>
                      <strong className="text-red-700 font-mono">{selectedProduct.mrp}</strong>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded border border-slate-200 space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last Inspection Date:</span>
                      <strong className="text-slate-800">{selectedProduct.lastInspectionDate}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Compliance Status:</span>
                      <strong className={selectedProduct.complianceStatus === 'Compliant' ? 'text-emerald-800' : 'text-red-800'}>
                        {selectedProduct.complianceStatus}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Enforcement History:</span>
                      <span>{selectedProduct.inspectionCount} Inspections, {selectedProduct.violationsCount} Repeat Infractions</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <button
                  onClick={() => {
                    const sample = SAMPLE_PRODUCTS.find(p => p.brand.toLowerCase() === selectedProduct.brand.toLowerCase() || p.name.includes(selectedProduct.brand));
                    setSelectedProduct(null);
                    startNewInspection('physical', sample?.id);
                  }}
                  className="bg-[#78350F] hover:bg-[#582509] text-white font-semibold px-4 py-2 rounded transition-colors"
                >
                  Start New Inspection on this SKU
                </button>

                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-3 py-1 text-slate-600 hover:text-slate-900"
                >
                  Close Profile
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
