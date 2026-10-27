import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  X,
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
  const { products, deleteProduct } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDesc) return false;
      }
      if (categoryFilter && item.category !== categoryFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      return true;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStatusFilter('');
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
        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Product Name, ID, or Category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Category: All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {(searchQuery || categoryFilter || statusFilter) && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredProducts.length === 0 ? (
            <EmptyState
              title="No products or services found"
              description="Try adjusting your category filter or search terms."
              actionLabel="Add New Item"
              onAction={() => {
                setProductToEdit(null);
                setIsModalOpen(true);
              }}
            />
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-28">Item ID</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-3 w-36">Category</th>
                  <th className="py-3 px-3">Description</th>
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
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={p.description}>
                      {p.description || '—'}
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
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium block">Item Name:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{viewProduct.name}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Category:</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{viewProduct.category}</p>
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

