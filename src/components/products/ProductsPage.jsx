import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Tag,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import ProductModal from './ProductModal';
import Modal from '../common/Modal';

export const ProductsPage = () => {
  const {
    products,
    deleteProduct,
    productSearchQuery,
    setProductSearchQuery,
    productCategoryFilter,
    setProductCategoryFilter,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (productSearchQuery && productSearchQuery.trim()) {
        const q = productSearchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesHsn = (item.hsnSac || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDesc && !matchesHsn) return false;
      }
      if (productCategoryFilter && item.category !== productCategoryFilter) return false;
      return true;
    });
  }, [products, productSearchQuery, productCategoryFilter]);

  const clearFilters = () => {
    setProductSearchQuery('');
    setProductCategoryFilter('');
  };

  // Listen to Topbar Add Product action
  useEffect(() => {
    const handleAddProduct = () => {
      setProductToEdit(null);
      setIsModalOpen(true);
    };
    window.addEventListener('app:add-product', handleAddProduct);
    return () => window.removeEventListener('app:add-product', handleAddProduct);
  }, []);

  return (
    <div className="space-y-6">
      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          {filteredProducts.length === 0 ? (
            <EmptyState
              title="No products or services found"
              description={
                productSearchQuery || productCategoryFilter
                  ? "Try adjusting your category filter or search terms."
                  : "Start by adding your first product or service."
              }
              actionLabel={productSearchQuery || productCategoryFilter ? "Clear Filters" : "Add New Item"}
              onAction={() => {
                if (productSearchQuery || productCategoryFilter) {
                  clearFilters();
                } else {
                  setProductToEdit(null);
                  setIsModalOpen(true);
                }
              }}
            />
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-28">Item ID</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-3 w-36">Category</th>
                  <th className="py-3 px-3 w-28">HSN / SAC</th>
                  <th className="py-3 px-3 w-20 text-center">GST %</th>
                  <th className="py-3 px-3 text-right w-28">Unit Price</th>
                  <th className="py-3 px-3 text-center w-24">Status</th>
                  <th className="py-3 px-4 w-10 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setViewProduct(p)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    title="Click anywhere to view item specifications"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{p.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block text-xs">{p.name}</span>
                      <span className="text-[11px] text-slate-400">Unit: {p.unit || 'Unit'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {p.hsnSac || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-semibold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {p.gstRate ?? 18}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatINR(p.unitPrice)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={p.status} size="xs" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      {/* View Item Details Modal */}
      {viewProduct && (
        <Modal
          isOpen={Boolean(viewProduct)}
          onClose={() => setViewProduct(null)}
          title={`Product Details: ${viewProduct.name}`}
          subtitle={`${viewProduct.id} • ${viewProduct.category}`}
          maxWidth="max-w-lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${viewProduct.name}?`)) {
                    deleteProduct(viewProduct.id);
                    setViewProduct(null);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const prod = viewProduct;
                    setViewProduct(null);
                    setProductToEdit(prod);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Product</span>
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium block">Item Name:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{viewProduct.name}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Category:</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{viewProduct.category}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">HSN / SAC Code:</span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{viewProduct.hsnSac || '—'}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">GST Tax Rate:</span>
                <p className="font-bold text-blue-700 text-sm mt-0.5">{viewProduct.gstRate ?? 18}% GST</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Unit Price:</span>
                <p className="font-bold text-blue-600 text-base mt-0.5">{formatINR(viewProduct.unitPrice)}</p>
                <span className="text-[11px] text-slate-400">per {viewProduct.unit || 'Unit'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Status:</span>
                <div className="mt-1">
                  <StatusBadge status={viewProduct.status} />
                </div>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-medium block mb-1">Description & Specifications:</span>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {viewProduct.description || 'No extended specifications provided.'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProductsPage;

