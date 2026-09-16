import React, { useState, useMemo } from 'react';
import { Product, Category, Division, AvailabilityStatus } from '../../types';
import { DIVISION_LIST } from '../../data/initialCategories';
import { DIVISION_BUSINESSES } from '../../data/products';
import { 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  resetProductsToDefault 
} from '../../utils/store';
import { 
  Plus, 
  Package, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Sparkles, 
  Image as ImageIcon, 
  DollarSign, 
  Layers, 
  Hash, 
  RotateCcw,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Eye,
  Filter
} from 'lucide-react';

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
  onPreviewProductInStore?: (productId: string) => void;
}

// Sample Curated Image Presets for convenient testing
const SAMPLE_IMAGE_PRESETS = [
  { label: 'Pharma / Tablets', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400' },
  { label: 'Capsules / Health', url: 'https://images.unsplash.com/photo-1607619056574-7b8d304f2c38?auto=format&fit=crop&q=80&w=400' },
  { label: 'Savlon Antiseptic', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400' },
  { label: 'Pure Atta / Flour', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400' },
  { label: 'Salt / Spices', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400' },
  { label: 'Seeds / Agriculture', url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=400' },
  { label: 'Tractor / Machinery', url: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&q=80&w=400' },
  { label: 'Fresh Produce', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400' },
];

export const AdminProducts: React.FC<AdminProductsProps> = ({ 
  products, 
  categories, 
  onRefresh,
  onPreviewProductInStore 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<Division | 'ALL'>('ALL');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [division, setDivision] = useState<Division>('PHARMACEUTICALS & HEALTHCARE');
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [image, setImage] = useState('');
  const [stockQuantity, setStockQuantity] = useState<string>('50');
  const [sku, setSku] = useState<string>('');
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('In Stock');
  const [unit, setUnit] = useState<string>('1 Unit');
  const [useCase, setUseCase] = useState<string>('');
  const [business, setBusiness] = useState<string>('');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamically available categories based on selected division in form
  const availableCategoriesForDivision = useMemo(() => {
    return categories.filter(c => !c.division || c.division === division);
  }, [categories, division]);

  // Dynamically available subcategories based on selected category in form
  const availableSubcategories = useMemo(() => {
    const activeCat = categories.find(c => c.name.toLowerCase() === category.toLowerCase());
    return activeCat ? activeCat.subcategories : [];
  }, [categories, category]);

  // Available businesses for division
  const availableBusinesses = useMemo(() => {
    return DIVISION_BUSINESSES[division] || [];
  }, [division]);

  // Open Add Product Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('250');
    setDiscountPrice('');
    setDivision('PHARMACEUTICALS & HEALTHCARE');
    
    // Pick first category for division
    const firstCat = categories.find(c => c.division === 'PHARMACEUTICALS & HEALTHCARE') || categories[0];
    setCategory(firstCat ? firstCat.name : 'Anti-Diabetics');
    setSubcategory(firstCat?.subcategories[0]?.name || '');
    
    setImage(SAMPLE_IMAGE_PRESETS[0].url);
    setStockQuantity('100');
    setSku(`ACI-PRD-${Math.floor(1000 + Math.random() * 9000)}`);
    setAvailabilityStatus('In Stock');
    setUnit('1 Box / Pack');
    setUseCase('General medicinal use or commercial retail distribution.');
    setBusiness(DIVISION_BUSINESSES['PHARMACEUTICALS & HEALTHCARE']?.[0] || 'ACI Limited');
    setIsModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price.toString());
    setDiscountPrice(p.discountPrice ? p.discountPrice.toString() : '');
    setDivision(p.division);
    setCategory(p.category);
    setSubcategory(p.subcategory || '');
    setImage(p.image || '');
    setStockQuantity(p.stockQuantity.toString());
    setSku(p.sku || `ACI-${p.id.toUpperCase()}`);
    setAvailabilityStatus(p.availabilityStatus);
    setUnit(p.unit);
    setUseCase(p.useCase || '');
    setBusiness(p.business || '');
    setIsModalOpen(true);
  };

  // Auto-generate SKU helper
  const handleGenerateSku = () => {
    const prefix = division.substring(0, 3).toUpperCase();
    const catCode = (category || 'GEN').substring(0, 3).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setSku(`ACI-${prefix}-${catCode}-${rand}`);
  };

  // Save Product Submit
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert('Please fill in required fields: Product Name and Price');
      return;
    }

    const numPrice = parseFloat(price) || 0;
    const numDiscount = discountPrice ? parseFloat(discountPrice) : undefined;
    const numStock = parseInt(stockQuantity, 10) || 0;

    let computedAvailability = availabilityStatus;
    if (numStock === 0) computedAvailability = 'Out of Stock';

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        discountPrice: numDiscount,
        division,
        category,
        subcategory: subcategory || undefined,
        image: image.trim() || undefined,
        stockQuantity: numStock,
        sku: sku.trim(),
        availabilityStatus: computedAvailability,
        unit: unit.trim() || 'Unit',
        useCase: useCase.trim(),
        business: business.trim() || undefined
      });
      showToast(`Product "${name}" updated successfully! Visible across store.`);
    } else {
      addProduct({
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        discountPrice: numDiscount,
        division,
        category,
        subcategory: subcategory || undefined,
        image: image.trim() || SAMPLE_IMAGE_PRESETS[0].url,
        stockQuantity: numStock,
        sku: sku.trim() || `ACI-PRD-${Math.floor(1000 + Math.random() * 9000)}`,
        availabilityStatus: computedAvailability,
        unit: unit.trim() || 'Unit',
        useCase: useCase.trim() || 'Official ACI product standard specification.',
        business: business.trim() || DIVISION_BUSINESSES[division]?.[0] || 'ACI Limited'
      });
      showToast(`New product "${name}" added to catalog and store!`);
    }

    setIsModalOpen(false);
    onRefresh();
  };

  // Delete Product
  const handleDeleteProduct = (p: Product) => {
    if (window.confirm(`Are you sure you want to delete "${p.name}" (SKU: ${p.sku})? It will be removed from customer storefront.`)) {
      deleteProduct(p.id);
      showToast(`Product "${p.name}" removed from catalog.`);
      onRefresh();
    }
  };

  // Inline Quick Stock Adjust
  const handleStockAdjust = (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stockQuantity + delta);
    updateProduct(p.id, { stockQuantity: newStock });
    onRefresh();
  };

  // Reset to default ACI products
  const handleResetProducts = () => {
    if (window.confirm('Reset products to default ACI catalog? Custom additions will be replaced.')) {
      resetProductsToDefault();
      showToast('Products catalog reset to standard ACI lineup.');
      onRefresh();
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
        (p.business && p.business.toLowerCase().includes(q));

      const matchesDivision = selectedDivision === 'ALL' || p.division === selectedDivision;
      const matchesCategory = selectedCategoryName === 'ALL' || p.category === selectedCategoryName;
      
      let matchesAvailability = true;
      if (availabilityFilter === 'In Stock') matchesAvailability = p.availabilityStatus === 'In Stock';
      else if (availabilityFilter === 'Low Stock') matchesAvailability = p.availabilityStatus === 'Low Stock' || (p.stockQuantity > 0 && p.stockQuantity <= 25);
      else if (availabilityFilter === 'Out of Stock') matchesAvailability = p.availabilityStatus === 'Out of Stock' || p.stockQuantity === 0;
      else if (availabilityFilter === 'Discounted') matchesAvailability = !!p.discountPrice && p.discountPrice < p.price;

      return matchesSearch && matchesDivision && matchesCategory && matchesAvailability;
    });
  }, [products, searchQuery, selectedDivision, selectedCategoryName, availabilityFilter]);

  const getStatusBadge = (status: AvailabilityStatus, stock: number) => {
    if (stock === 0 || status === 'Out of Stock') {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">Out of Stock</span>;
    }
    if (status === 'Low Stock' || stock < 30) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Low Stock ({stock})</span>;
    }
    if (status === 'Pre-order') {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">Pre-Order</span>;
    }
    return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">In Stock ({stock})</span>;
  };

  return (
    <div className="space-y-6" id="admin-products-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-red-500/30 fixed bottom-6 right-6 z-50 animate-bounce">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Control Header & Actions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-red-50 text-red-600 rounded-lg">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Product Inventory Management</h2>
          </div>
          <p className="text-xs text-slate-500">
            Add, update, or remove products across all ACI divisions. Real-time sync with customer shopfront and AI assistant.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetProducts}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset to original 42+ ACI items"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Catalog</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or brand..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Division Filter */}
          <div>
            <select
              value={selectedDivision}
              onChange={e => {
                setSelectedDivision(e.target.value as Division | 'ALL');
                setSelectedCategoryName('ALL');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="ALL">All Business Divisions</option>
              {DIVISION_LIST.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategoryName}
              onChange={e => setSelectedCategoryName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="ALL">All Categories</option>
              {categories
                .filter(c => selectedDivision === 'ALL' || c.division === selectedDivision)
                .map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
            </select>
          </div>

          {/* Availability / Stock Status Filter */}
          <div>
            <select
              value={availabilityFilter}
              onChange={e => setAvailabilityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="In Stock">In Stock Only</option>
              <option value="Low Stock">Low Stock Alert (&lt; 30)</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Discounted">Discounted Items</option>
            </select>
          </div>
        </div>

        {/* Quick counter */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of {products.length} products
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> In Stock: {products.filter(p => p.stockQuantity > 25).length}
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Low: {products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 25).length}
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Out: {products.filter(p => p.stockQuantity === 0).length}
            </span>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Product Info</th>
                <th className="py-3.5 px-4">Category & Subcategory</th>
                <th className="py-3.5 px-4">SKU / Code</th>
                <th className="py-3.5 px-4">Price & Discount</th>
                <th className="py-3.5 px-4">Inventory & Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">No products match your filter criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing filters or click "Add New Product" above.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const hasDiscount = p.discountPrice && p.discountPrice < p.price;
                  const discountPercent = hasDiscount 
                    ? Math.round(((p.price - p.discountPrice!) / p.price) * 100) 
                    : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Product Thumbnail & Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || SAMPLE_IMAGE_PRESETS[0].url}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-extrabold text-slate-800 hover:text-red-600 transition-colors line-clamp-1">
                              {p.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">{p.id}</span>
                              {p.business && (
                                <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded truncate max-w-[140px]">
                                  {p.business}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-xs">
                              {p.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {p.category}
                          </span>
                          {p.subcategory && (
                            <div className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                              <span className="text-slate-300">↳</span>
                              <span className="truncate max-w-[150px]">{p.subcategory}</span>
                            </div>
                          )}
                          <div className="text-[9px] text-slate-400 uppercase font-semibold">
                            {p.division.split('&')[0].trim()}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/60">
                          {p.sku || p.id}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4">
                        <div>
                          {hasDiscount ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-900 text-sm">
                                  ৳{p.discountPrice?.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-slate-400 line-through">
                                  ৳{p.price.toLocaleString()}
                                </span>
                              </div>
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-0.5">
                                <TrendingDown className="w-2.5 h-2.5" />
                                {discountPercent}% OFF
                              </span>
                            </div>
                          ) : (
                            <span className="font-extrabold text-slate-900 text-sm">
                              ৳{p.price.toLocaleString()}
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                            per {p.unit || 'unit'}
                          </div>
                        </div>
                      </td>

                      {/* Inventory & Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div>{getStatusBadge(p.availabilityStatus, p.stockQuantity)}</div>
                          {/* Stock Quick Stepper */}
                          <div className="flex items-center gap-1 text-[11px]">
                            <button
                              onClick={() => handleStockAdjust(p, -5)}
                              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                              title="-5 Stock"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-slate-800 px-1 min-w-[28px] text-center">
                              {p.stockQuantity}
                            </span>
                            <button
                              onClick={() => handleStockAdjust(p, 5)}
                              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                              title="+5 Stock"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-red-500" />
                <h3 className="font-extrabold text-sm tracking-tight">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product to Catalog'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin">
              {/* Product Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fast-ACI Plus 500mg, Savlon Hand Sanitizer 250ml"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-red-500 focus:bg-white"
                />
              </div>

              {/* Division, Category, Subcategory Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Division */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={division}
                    onChange={e => {
                      const newDiv = e.target.value as Division;
                      setDivision(newDiv);
                      // Update default category for new division
                      const catForDiv = categories.find(c => c.division === newDiv) || categories[0];
                      if (catForDiv) {
                        setCategory(catForDiv.name);
                        setSubcategory(catForDiv.subcategories[0]?.name || '');
                      }
                      setBusiness(DIVISION_BUSINESSES[newDiv]?.[0] || '');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-red-500"
                  >
                    {DIVISION_LIST.map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={e => {
                      const newCat = e.target.value;
                      setCategory(newCat);
                      const targetObj = categories.find(c => c.name.toLowerCase() === newCat.toLowerCase());
                      if (targetObj && targetObj.subcategories.length > 0) {
                        setSubcategory(targetObj.subcategories[0].name);
                      } else {
                        setSubcategory('');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-red-500"
                  >
                    {availableCategoriesForDivision.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Subcategory
                  </label>
                  <select
                    value={subcategory}
                    onChange={e => setSubcategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">-- None / Standard --</option>
                    {availableSubcategories.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SKU & Business Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      SKU / Product Code
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-Gen SKU
                    </button>
                  </div>
                  <input
                    type="text"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    placeholder="e.g. ACI-MED-1049"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Producing Business Entity
                  </label>
                  <select
                    value={business}
                    onChange={e => setBusiness(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-red-500"
                  >
                    {availableBusinesses.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, Discount Price, Packaging Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Regular Price (BDT) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="320"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Discount Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 280 (leaves blank if none)"
                      value={discountPrice}
                      onChange={e => setDiscountPrice(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Packaging Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100 Tablets, 500ml Bottle, 2kg Bag"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Stock Quantity & Availability Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Stock Quantity in Depot
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={e => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Availability Status
                  </label>
                  <select
                    value={availabilityStatus}
                    onChange={e => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Pre-order">Pre-Order</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>
              </div>

              {/* Product Image URL with Preset Pickers */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Product Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-red-500"
                  />
                  {image && (
                    <img
                      src={image}
                      alt="Preview"
                      className="w-9 h-9 rounded-lg object-cover border border-slate-300 shrink-0 bg-slate-100"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                {/* Quick Presets Picker */}
                <div className="mt-2">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                    Quick Sample Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setImage(preset.url)}
                        className={`text-[10px] px-2 py-1 rounded-md border transition-all cursor-pointer ${
                          image === preset.url
                            ? 'bg-red-600 text-white border-red-600 font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed product composition, dosage, or culinary specifications..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Recommended Application / Use Case */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Recommended Application / Use Case
                </label>
                <input
                  type="text"
                  placeholder="e.g. Treatment of Type 2 diabetes under medical supervision."
                  value={useCase}
                  onChange={e => setUseCase(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingProduct ? 'Save Product Changes' : 'Publish Product to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
