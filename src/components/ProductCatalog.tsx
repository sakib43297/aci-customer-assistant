import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Division, Category } from '../types';
import { DIVISION_BUSINESSES } from '../data/products';
import { 
  getStoredProducts, 
  getStoredCategories, 
  STORE_EVENTS 
} from '../utils/store';
import { Search, ShoppingCart, Info, Filter, Sparkles, Check, Mic, MicOff, Loader2, Volume2, X, Tag, TrendingDown, AlertCircle } from 'lucide-react';

interface ProductCatalogProps {
  onAddToCart: (product: Product, quantity: number) => void;
  cartItemsCount: Record<string, number>;
  selectedDivision?: Division | 'ALL';
  onSelectDivision?: (div: Division | 'ALL') => void;
  selectedBusiness?: string | null;
  onSelectBusiness?: (biz: string | null) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ 
  onAddToCart, 
  cartItemsCount,
  selectedDivision: propDivision,
  onSelectDivision,
  selectedBusiness: propBusiness,
  onSelectBusiness
}) => {
  const [localDivision, setLocalDivision] = useState<Division | 'ALL'>('ALL');
  const selectedDivision = propDivision !== undefined ? propDivision : localDivision;
  const setSelectedDivision = (div: Division | 'ALL') => {
    if (onSelectDivision) onSelectDivision(div);
    setLocalDivision(div);
    setSelectedCategory('ALL');
    setSelectedBusiness(null);
  };

  const [localBusiness, setLocalBusiness] = useState<string | null>(null);
  const selectedBusiness = propBusiness !== undefined ? propBusiness : localBusiness;
  const setSelectedBusiness = (biz: string | null) => {
    if (onSelectBusiness) onSelectBusiness(biz);
    setLocalBusiness(biz);
    setSelectedCategory('ALL');
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [addedAnimation, setAddedAnimation] = useState<Record<string, boolean>>({});

  // Dynamic Store Data
  const [storeProducts, setStoreProducts] = useState<Product[]>(getStoredProducts());
  const [storeCategories, setStoreCategories] = useState<Category[]>(getStoredCategories());

  useEffect(() => {
    const handleProductsUpdate = () => {
      setStoreProducts(getStoredProducts());
    };
    const handleCategoriesUpdate = () => {
      setStoreCategories(getStoredCategories());
    };

    window.addEventListener(STORE_EVENTS.PRODUCTS_UPDATED, handleProductsUpdate);
    window.addEventListener(STORE_EVENTS.CATEGORIES_UPDATED, handleCategoriesUpdate);

    return () => {
      window.removeEventListener(STORE_EVENTS.PRODUCTS_UPDATED, handleProductsUpdate);
      window.removeEventListener(STORE_EVENTS.CATEGORIES_UPDATED, handleCategoriesUpdate);
    };
  }, []);

  // Voice Search Modules State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceVolume, setVoiceVolume] = useState<number>(0);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);

  // Cleanup references on unmount
  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setVoiceError(null);
      setIsRecording(true);
      setVoiceVolume(0);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Audio Visualizer Analyzer
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setVoiceVolume(average);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Configure Media Recorder with browser supported audio formats
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        options = { mimeType: 'audio/ogg' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all track media streams to release hardware lock
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        analyserRef.current = null;
        setIsRecording(false);
        await processRecordedAudio();
      };

      recorder.start(100);
    } catch (err: any) {
      console.error("Error starting voice recorder:", err);
      setIsRecording(false);
      setVoiceError(err.message || "Microphone access denied or not supported on this device.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const processRecordedAudio = async () => {
    if (chunksRef.current.length === 0) {
      setVoiceError("No audio query was recorded.");
      return;
    }

    try {
      setIsProcessingVoice(true);
      const audioBlob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const response = await fetch('/api/voice-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audio: base64Data,
              mimeType: audioBlob.type,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Voice transcription failed: ${errorText}`);
          }

          const data = await response.json();
          const queryResult = data.text;

          if (!queryResult || queryResult === 'empty_audio') {
            setVoiceError("Could not recognize any product or category. Please speak clearly and try again.");
          } else {
            setSearchQuery(queryResult);
            setIsVoiceModalOpen(false);
          }
        } catch (apiErr: any) {
          console.error("API Error transcribing audio:", apiErr);
          setVoiceError(apiErr.message || "Failed to process audio with Gemini Search.");
        } finally {
          setIsProcessingVoice(false);
        }
      };
    } catch (err: any) {
      console.error("Audio processing conversion error:", err);
      setVoiceError("Could not parse audio query.");
      setIsProcessingVoice(false);
    }
  };

  const closeVoiceModal = () => {
    stopRecording();
    setIsVoiceModalOpen(false);
    setVoiceError(null);
    setVoiceVolume(0);
  };

  const divisions: (Division | 'ALL')[] = [
    'ALL', 
    'PHARMACEUTICALS & HEALTHCARE', 
    'AGRIBUSINESS', 
    'CONSUMER BRANDS & FOODS', 
    'RETAIL & LOGISTICS', 
    'CROP CARES', 
    'TECHNOLOGY, COMMUNICATION & SERVICES'
  ];

  const categories = useMemo(() => {
    if (selectedDivision === 'ALL') {
      const allCatNames = Array.from(new Set(storeCategories.map(c => c.name)));
      return ['ALL', ...allCatNames];
    }
    const divisionCats = storeCategories
      .filter(c => !c.division || c.division === selectedDivision)
      .map(c => c.name);
    return ['ALL', ...Array.from(new Set(divisionCats))];
  }, [selectedDivision, storeCategories]);

  const activeCategoryObj = useMemo(() => {
    if (selectedCategory === 'ALL') return null;
    return storeCategories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase()) || null;
  }, [selectedCategory, storeCategories]);

  const availableSubcategories = useMemo(() => {
    if (!activeCategoryObj || !activeCategoryObj.subcategories) return [];
    return activeCategoryObj.subcategories;
  }, [activeCategoryObj]);

  const filteredProducts = useMemo(() => {
    return storeProducts.filter(product => {
      const matchesDivision = selectedDivision === 'ALL' || product.division === selectedDivision;
      const matchesBusiness = !selectedBusiness || product.business === selectedBusiness;
      const matchesCategory = selectedCategory === 'ALL' || product.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSubcategory = selectedSubcategory === 'ALL' || (product.subcategory && product.subcategory.toLowerCase() === selectedSubcategory.toLowerCase());
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = q === '' || 
        product.name.toLowerCase().includes(q) ||
        (product.sku && product.sku.toLowerCase().includes(q)) ||
        product.description.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(q)) ||
        (product.useCase && product.useCase.toLowerCase().includes(q)) ||
        (product.business && product.business.toLowerCase().includes(q));
      
      return matchesDivision && matchesBusiness && matchesCategory && matchesSubcategory && matchesSearch;
    });
  }, [storeProducts, selectedDivision, selectedBusiness, selectedCategory, selectedSubcategory, searchQuery]);

  const handleAddClick = (product: Product) => {
    onAddToCart(product, 1);
    
    // Trigger small animation feedback
    setAddedAnimation(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedAnimation(prev => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  const getDivisionBadgeColor = (div: Division) => {
    switch (div) {
      case 'PHARMACEUTICALS & HEALTHCARE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONSUMER BRANDS & FOODS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'AGRIBUSINESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'RETAIL & LOGISTICS':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CROP CARES':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'TECHNOLOGY, COMMUNICATION & SERVICES':
        return 'bg-violet-50 text-violet-700 border-violet-200';
    }
  };

  return (
    <div className="space-y-6" id="product-catalog-section">
      {/* Search & Main Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Filter className="w-5 h-5 text-red-600" />
              ACI PLC Product Browser
            </h2>
            <p className="text-xs text-slate-500">Search and explore verified ACI products across all divisions</p>
          </div>
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search products, ingredients, use cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all"
            />
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="absolute right-3 top-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer flex items-center justify-center group"
              title="Search with Voice (Gemini)"
            >
              <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Division Selection Row */}
        <div className="border-t border-slate-100 pt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
            Business
          </label>
          <div className="flex flex-wrap gap-2">
            {divisions.map((div) => (
              <button
                key={div}
                onClick={() => {
                  setSelectedDivision(div);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${
                  selectedDivision === div
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {div}
              </button>
            ))}
          </div>
        </div>

        {/* Business Unit Selection Row */}
        {selectedDivision !== 'ALL' && DIVISION_BUSINESSES[selectedDivision] && (
          <div className="border-t border-slate-100 pt-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
              Specific Business Units
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedBusiness(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  !selectedBusiness
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                All Businesses
              </button>
              {DIVISION_BUSINESSES[selectedDivision].map((biz) => (
                <button
                  key={biz}
                  onClick={() => setSelectedBusiness(biz)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedBusiness === biz
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {biz}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories Selection Row */}
        {categories.length > 1 && (
          <div className="border-t border-slate-100 pt-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
              Categories ({selectedDivision})
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedSubcategory('ALL');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                All Categories
              </button>
              {categories.slice(1).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSubcategory('ALL');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedCategory === cat
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Subcategories Row (When a category with subcategories is selected) */}
        {selectedCategory !== 'ALL' && availableSubcategories.length > 0 && (
          <div className="border-t border-slate-100 pt-3 bg-red-50/30 -mx-6 px-6 py-3 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
              <Tag className="w-3.5 h-3.5" />
              <span>Subcategories for "{selectedCategory}":</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSubcategory('ALL')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                  selectedSubcategory === 'ALL'
                    ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All ({selectedCategory})
              </button>
              {availableSubcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.name)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                    selectedSubcategory.toLowerCase() === sub.name.toLowerCase()
                      ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => {
              const countInCart = cartItemsCount[product.id] || 0;
              const isAdded = addedAnimation[product.id];

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.2), ease: "easeOut" }}
                  whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.06), 0 8px 10px -6px rgb(0 0 0 / 0.06)" }}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className="group bg-white rounded-2xl border border-slate-150/80 transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                >
                  {/* Product Image */}
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden border-b border-slate-100 shrink-0">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 shadow-xs">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getDivisionBadgeColor(product.division)}`}>
                        {product.division}
                      </span>
                      {product.discountPrice && product.discountPrice < product.price && (
                        <span className="self-start px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-600 text-white flex items-center gap-0.5 shadow-xs">
                          <TrendingDown className="w-2.5 h-2.5" />
                          {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    
                    {/* Top Right Stock Badge */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      {product.stockQuantity === 0 || product.availabilityStatus === 'Out of Stock' ? (
                        <span className="bg-rose-600/90 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          Out of Stock
                        </span>
                      ) : product.availabilityStatus === 'Low Stock' || (product.stockQuantity > 0 && product.stockQuantity <= 25) ? (
                        <span className="bg-amber-500/95 backdrop-blur-xs text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                          Low Stock ({product.stockQuantity})
                        </span>
                      ) : (
                        <span className="bg-slate-900/60 backdrop-blur-xs text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded-md">
                          {product.sku || product.id}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Header */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1.5 gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold font-mono text-red-600 uppercase tracking-wide truncate">
                            {product.category}
                          </span>
                          {product.subcategory && (
                            <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 rounded truncate max-w-[130px]" title={product.subcategory}>
                              ↳ {product.subcategory}
                            </span>
                          )}
                        </div>
                        {product.business && (
                          <span className="text-[9px] font-extrabold text-slate-500 font-sans tracking-wide bg-slate-100 px-1.5 py-0.5 rounded truncate shrink-0 max-w-[140px]" title={product.business}>
                            {product.business}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-slate-800 text-base tracking-tight mb-1.5 group-hover:text-red-600 line-clamp-1 transition-colors">
                        {product.name}
                      </h3>
                      
                      <p className="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Use Case Box */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[11px] text-slate-600 space-y-1 mb-2">
                      <div className="font-semibold text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-red-500" />
                        Recommended Application:
                      </div>
                      <div className="line-clamp-2">{product.useCase}</div>
                    </div>
                  </div>

                  {/* Product Footer */}
                  <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Price ({product.unit})</div>
                      {product.discountPrice && product.discountPrice < product.price ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-extrabold text-red-600 text-base">
                            ৳{product.discountPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ৳{product.price.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <div className="font-extrabold text-slate-800 text-base">
                          ৳{product.price.toLocaleString()} BDT
                        </div>
                      )}
                    </div>

                    {product.stockQuantity === 0 || product.availabilityStatus === 'Out of Stock' ? (
                      <button
                        disabled
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-200 text-slate-400 cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddClick(product)}
                        className={`relative px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                          isAdded 
                            ? 'bg-emerald-600 text-white' 
                            : countInCart > 0 
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            Added!
                          </>
                        ) : countInCart > 0 ? (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            In Cart ({countInCart})
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-16 text-center space-y-4"
            >
              <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-700">No products found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  We couldn't find any ACI products matching "{searchQuery}" under {selectedDivision === 'ALL' ? 'all divisions' : selectedDivision}.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gemini Voice Search Modal Overlay */}
      <AnimatePresence>
        {isVoiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-slate-950 px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500 animate-pulse animate-duration-1000" />
                  <span className="font-extrabold text-xs sm:text-sm text-white uppercase tracking-wider font-mono">Gemini Voice Search</span>
                </div>
                <button
                  type="button"
                  onClick={closeVoiceModal}
                  className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 text-center space-y-6 flex flex-col items-center">
                {isProcessingVoice ? (
                  <div className="py-8 space-y-4 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-slate-200">Processing audio query...</p>
                      <p className="text-xs text-slate-400">Gemini AI is transcribing and extracting product names</p>
                    </div>
                  </div>
                ) : isRecording ? (
                  <div className="py-6 space-y-6 flex flex-col items-center w-full">
                    {/* Visualizer Waves */}
                    <div className="flex items-center justify-center gap-1.5 h-16 w-full">
                      {Array.from({ length: 8 }).map((_, i) => {
                        const baseMultiplier = [0.3, 0.6, 1.0, 0.7, 0.5, 0.9, 0.4, 0.2][i];
                        const volumeHeight = Math.max(4, Math.min(60, (voiceVolume / 255) * 60 * baseMultiplier));
                        return (
                          <motion.div
                            key={i}
                            animate={{ height: volumeHeight }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className="w-1.5 rounded-full bg-red-500"
                            style={{ height: 4 }}
                          />
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <p className="text-base font-bold text-white animate-pulse">Listening...</p>
                      <p className="text-xs text-slate-300 px-4 leading-relaxed">
                        Say an ACI product or category name.
                      </p>
                      <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                        <span className="text-[10px] bg-slate-950/60 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">"Savlon Handwash"</span>
                        <span className="text-[10px] bg-slate-950/60 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">"Paracetamol"</span>
                        <span className="text-[10px] bg-slate-950/60 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">"আলংকার ধান"</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <MicOff className="w-4 h-4" />
                      Stop & Search
                    </button>
                  </div>
                ) : (
                  <div className="py-6 space-y-6 flex flex-col items-center">
                    <div className="w-20 h-20 bg-red-950/30 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center shadow-lg relative group">
                      <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping group-hover:animate-none" />
                      <Mic className="w-8 h-8" />
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-bold text-sm sm:text-base text-slate-200">Ready to listen</h4>
                      <p className="text-xs text-slate-400 px-4">Click the button below to start your ACI product search using your voice.</p>
                    </div>

                    {voiceError && (
                      <div className="text-[11px] text-red-400 bg-red-950/20 border border-red-500/10 rounded-xl px-4 py-2.5 max-w-sm mx-auto text-center leading-relaxed">
                        {voiceError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" />
                      Start Speaking
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
