import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

const DEFAULT_CATEGORIES = [
  'Cameras',
  'DVR / NVR',
  'Storage & Cables',
  'Power & Accessories',
  'Installation & Services',
];

export const ProductModal = ({ isOpen, onClose, productToEdit }) => {
  const { products, addProduct, updateProduct } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Cameras',
    hsnSac: '85258900',
    gstRate: 18,
    description: '',
    unitPrice: '',
    unit: 'Unit',
    status: 'Active',
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [errors, setErrors] = useState({});

  // Compute all available categories from defaults + existing products in catalog
  const availableCategories = useMemo(() => {
    const list = [...DEFAULT_CATEGORIES];
    if (products) {
      products.forEach((p) => {
        if (p.category && !list.includes(p.category)) {
          list.push(p.category);
        }
      });
    }
    if (productToEdit?.category && !list.includes(productToEdit.category)) {
      list.push(productToEdit.category);
    }
    return list;
  }, [products, productToEdit]);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        category: productToEdit.category || 'Cameras',
        hsnSac: productToEdit.hsnSac || (productToEdit.category === 'Installation & Services' ? '9987' : '8525'),
        gstRate: productToEdit.gstRate !== undefined ? Number(productToEdit.gstRate) : 18,
        description: productToEdit.description || '',
        unitPrice: productToEdit.unitPrice || '',
        unit: productToEdit.unit || 'Unit',
        status: productToEdit.status || 'Active',
      });
      setIsCustomCategory(false);
      setCustomCategoryInput('');
    } else {
      setFormData({
        name: '',
        category: 'Cameras',
        hsnSac: '85258900',
        gstRate: 18,
        description: '',
        unitPrice: '',
        unit: 'Unit',
        status: 'Active',
      });
      setIsCustomCategory(false);
      setCustomCategoryInput('');
    }
    setErrors({});
  }, [productToEdit, isOpen]);

  const handleCategoryChange = (cat) => {
    if (cat === '__custom__') {
      setIsCustomCategory(true);
      setFormData((prev) => ({
        ...prev,
        category: customCategoryInput.trim(),
        hsnSac: prev.hsnSac || '85258900',
      }));
      return;
    }

    setIsCustomCategory(false);
    let defaultHsn = formData.hsnSac;
    if (!productToEdit) {
      if (cat === 'Installation & Services') defaultHsn = '995469';
      else if (cat === 'Cameras') defaultHsn = '85258900';
      else if (cat === 'DVR / NVR') defaultHsn = '85219090';
      else if (cat === 'Storage & Cables') defaultHsn = '84717020';
      else if (cat === 'Power & Accessories') defaultHsn = '85044090';
      else defaultHsn = '85258900';
    }
    setFormData((prev) => ({
      ...prev,
      category: cat,
      hsnSac: defaultHsn,
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Item name is required';
    if (isCustomCategory) {
      if (!customCategoryInput.trim()) {
        errs.category = 'Please enter a name for the new category';
      }
    } else if (!formData.category) {
      errs.category = 'Category is required';
    }
    if (!formData.unitPrice || isNaN(formData.unitPrice) || Number(formData.unitPrice) <= 0) {
      errs.unitPrice = 'Valid unit price is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory = isCustomCategory ? customCategoryInput.trim() : formData.category.trim();

    const payload = {
      ...formData,
      category: finalCategory,
      hsnSac: formData.hsnSac?.trim() || (finalCategory === 'Installation & Services' ? '9987' : '8525'),
      gstRate: formData.gstRate !== '' && !isNaN(Number(formData.gstRate)) ? Number(formData.gstRate) : 18,
      unitPrice: parseFloat(formData.unitPrice),
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, payload);
    } else {
      addProduct(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[60]"
      title={productToEdit ? `Edit Item: ${productToEdit.id}` : 'Add Product or Service'}
      maxWidth="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {productToEdit ? 'Save Changes' : 'Add Item'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Product or Service Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Product or Service Name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            className={`w-full px-3 py-2 text-xs rounded-lg border ${
              errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
        </div>

        {/* Category & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={isCustomCategory ? '__custom__' : formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__custom__" className="text-blue-600 font-bold bg-blue-50/50">
                + Add New Category...
              </option>
            </select>

            {/* Custom Category Input if selected */}
            {isCustomCategory && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter new category name (e.g. Access Control)"
                    value={customCategoryInput}
                    onChange={(e) => {
                      setCustomCategoryInput(e.target.value);
                      setFormData((prev) => ({ ...prev, category: e.target.value }));
                      if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                    }}
                    autoFocus
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-blue-400 bg-blue-50/20 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(false);
                      setCustomCategoryInput('');
                      handleCategoryChange('Cameras');
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
                    title="Cancel new category"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-[11px] text-blue-600">
                  This new category will be saved and available across the system.
                </p>
              </div>
            )}
            {errors.category && <p className="mt-1 text-xs text-rose-500">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unit of Measurement
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Unit">Unit / Piece</option>
              <option value="Roll">Roll (305m)</option>
              <option value="Meter">Per Meter</option>
              <option value="Per Camera">Per Camera</option>
              <option value="Job">Job / Lump Sum</option>
              <option value="Year">Per Year</option>
            </select>
          </div>
        </div>

        {/* HSN/SAC Code & GST Rate (%) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              HSN / SAC Code
            </label>
            <input
              type="text"
              placeholder="Enter HSN / SAC Code"
              value={formData.hsnSac}
              onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono uppercase bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              GST Rate (%) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                placeholder="Enter GST Rate (%)"
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                className="w-full px-3 py-2 pr-8 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Price & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Standard Unit Price (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Enter Standard Unit Price"
              value={formData.unitPrice}
              onChange={(e) => {
                setFormData({ ...formData, unitPrice: e.target.value });
                if (errors.unitPrice) setErrors({ ...errors, unitPrice: undefined });
              }}
              className={`w-full px-3 py-2 text-xs rounded-lg border ${
                errors.unitPrice ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.unitPrice && <p className="mt-1 text-xs text-rose-500">{errors.unitPrice}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active (Available for Quotations)</option>
              <option value="Inactive">Inactive (Archived)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Technical Description / Specifications
          </label>
          <textarea
            rows="3"
            placeholder="Enter Technical Description / Specifications"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
