import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { 
  X, 
  ShoppingCart, 
  Check, 
  ShieldCheck, 
  Building2, 
  Tag, 
  ExternalLink, 
  Package, 
  Clock, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  inCartCount?: number;
  onNavigateToCatalog?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  inCartCount = 0,
  onNavigateToCatalog
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const isPharma = product.division === 'PHARMACEUTICALS & HEALTHCARE';

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6"
        onClick={onClose}
        id="product-detail-modal-backdrop"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-w-3xl w-full text-slate-900 relative my-8"
          onClick={(e) => e.stopPropagation()}
          id="product-detail-modal-card"
        >
          {/* Header Bar */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                ACI Official Product Dossier & Page
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Top Grid: Image & Core Info */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Product Visual */}
              <div className="md:col-span-5 space-y-3">
                <div className="aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative group shadow-inner flex items-center justify-center">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider font-semibold border border-white/10 shadow-sm">
                    {product.id.toUpperCase()}
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-emerald-900 block">ACI Verified Genuine Formulation</span>
                    <span className="text-emerald-700">Central Distribution Depot, Tejgaon</span>
                  </div>
                </div>
              </div>

              {/* Product Overview */}
              <div className="md:col-span-7 space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold uppercase tracking-wide">
                    {product.division}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
                    {product.category}
                  </span>
                  {product.availabilityStatus && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">
                      ● {product.availabilityStatus}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {product.name}
                  </h2>
                  {product.business && (
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      Manufactured by: <strong className="text-slate-700">{product.business}</strong>
                    </p>
                  )}
                </div>

                {/* Price Display */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">
                      Commercial Price
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight">
                        ৳{product.price}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        BDT / {product.unit}
                      </span>
                    </div>
                  </div>
                  {product.sku && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">SKU Code</span>
                      <span className="text-xs font-mono font-bold text-slate-700">{product.sku}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    Overview & Indication
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-200/60">
                    {product.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Clinical / Technical Use Case Section */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-red-600" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight uppercase">
                  {isPharma ? 'Therapeutic & Clinical Use Case' : 'Application & Recommended Use Case'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {product.useCase}
              </p>

              {isPharma && (
                <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-600">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                    <strong className="text-slate-800 block mb-0.5">Administration Advice:</strong>
                    Take with water as directed on packaging or as prescribed by your registered doctor or pharmacist.
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                    <strong className="text-slate-800 block mb-0.5">Storage & Safeguard:</strong>
                    Store below 30°C in a dry place away from direct sunlight. Keep out of reach of children.
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons & Quantity */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-sm"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-black text-slate-900 min-w-[36px] text-center bg-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-sm"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  = ৳{(product.price * quantity).toLocaleString()} BDT
                </span>
              </div>

              {/* Order Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {onNavigateToCatalog && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToCatalog(product);
                      onClose();
                    }}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>View in Catalog</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAdd}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                    isAdded 
                      ? 'bg-emerald-600 text-white shadow-emerald-900/20' 
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart {inCartCount > 0 ? `(${inCartCount} in cart)` : ''}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
