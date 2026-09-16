import { Product, Category, Subcategory, Order, OrderStatus, AvailabilityStatus } from '../types';
import { ACI_PRODUCTS } from '../data/products';
import { INITIAL_CATEGORIES, generateDefaultSubcategoriesForCategory } from '../data/initialCategories';

const CATEGORIES_KEY = 'aci_categories_v2';
const PRODUCTS_KEY = 'aci_products_v2';
const ORDERS_KEY = 'aci_all_orders_v2';

// Custom event names for real-time reactivity
export const STORE_EVENTS = {
  CATEGORIES_UPDATED: 'aci:categories_updated',
  PRODUCTS_UPDATED: 'aci:products_updated',
  ORDERS_UPDATED: 'aci:orders_updated',
};

// Initial enhanced products
export const getInitialProducts = (): Product[] => {
  return ACI_PRODUCTS.map((prod, index) => {
    // Determine a smart subcategory based on product category & name
    let subcategory = 'Standard Line';
    if (prod.category === 'Anti-Diabetics') subcategory = 'Sulfonylureas (Gliclazide/Glimepiride)';
    else if (prod.category === 'Cardiovascular Care') subcategory = 'Statins & Lipid Regulators';
    else if (prod.category === 'Antibiotics') subcategory = 'Broad-Spectrum Penicillins';
    else if (prod.category === 'Biosimilars') subcategory = 'Erythropoietin (EPO)';
    else if (prod.category === 'OTC Medicines') {
      if (prod.name.includes('Antacid')) subcategory = 'Antacid & Gas Relief Suspensions';
      else subcategory = 'Paracetamol & Antipyretics';
    }
    else if (prod.category === 'Gastrointestinal & Acid Relief') subcategory = 'Antispasmodics & Acid Suppressants (PPI)';
    else if (prod.category === 'Intravenous Fluids') subcategory = 'Normal Saline (0.9% NaCl)';
    else if (prod.category === 'Respiratory Care') subcategory = 'Salbutamol / Bronchodilator Inhalers';
    else if (prod.category === 'Home & Personal Care') {
      if (prod.name.includes('Aerosol')) subcategory = 'Insect & Mosquito Repellents';
      else if (prod.name.includes('Soap') || prod.name.includes('Handwash')) subcategory = 'Soaps & Hand Hygiene';
      else if (prod.name.includes('Colgate')) subcategory = 'Oral Care & Hygiene';
      else subcategory = 'Antiseptics & Wound Care';
    } else if (prod.category === 'Foods & Commodities') {
      if (prod.name.includes('Salt')) subcategory = 'Iodized Salt & Seasonings';
      else if (prod.name.includes('Oil')) subcategory = 'Edible Oils';
      else if (prod.name.includes('Chanachur') || prod.name.includes('Sunquick')) subcategory = 'Snacks & Beverages';
      else subcategory = 'Pure Flours & Grains';
    } else if (prod.category === 'Agricultural Machinery') {
      if (prod.name.includes('Harvester')) subcategory = 'Combine Harvesters & Transplanters';
      else subcategory = 'Sonalika & Yanmar Tractors';
    } else if (prod.category === 'Crop Protection') {
      if (prod.name.includes('Fungicide') || prod.name.includes('Carbendazim')) subcategory = 'Fungicides & Disease Control';
      else subcategory = 'Insecticides & Pest Control';
    } else if (prod.category === 'Hybrid Seeds') {
      if (prod.name.includes('Maize')) subcategory = 'Hybrid Maize Seeds';
      else subcategory = 'Hybrid Paddy & Rice Seeds';
    } else if (prod.category === 'Fresh Produce') {
      subcategory = 'Direct Farm Vegetables';
    }

    // Give a few sample discount prices for demonstration
    const hasDiscount = index % 4 === 0 && prod.price > 50;
    const discountPrice = hasDiscount ? Math.round(prod.price * 0.88) : undefined;

    // Standard stock numbers
    const stockQuantity = 25 + ((index * 13) % 180);
    const availabilityStatus: AvailabilityStatus = 
      stockQuantity === 0 ? 'Out of Stock' :
      stockQuantity < 30 ? 'Low Stock' : 'In Stock';

    const sku = `ACI-${prod.id.toUpperCase().replace('-', '')}-${(100 + index)}`;

    return {
      ...prod,
      subcategory,
      stockQuantity,
      sku,
      availabilityStatus,
      discountPrice,
      additionalImages: prod.image ? [prod.image] : []
    };
  });
};

// Initial sample orders for default profiles
export const getInitialOrders = (): Order[] => {
  const products = getInitialProducts();
  return [
    {
      id: 'ORD-99021',
      itemsCount: 4,
      division: 'PHARMACEUTICALS & HEALTHCARE',
      status: 'Delivered',
      totalPrice: 1140,
      subtotalPrice: 1040,
      date: 'Today, 09:15 AM',
      createdAt: new Date().toISOString(),
      customerName: 'Hasan Rahman',
      customerPhone: '01711223344',
      customerEmail: 'hasan.southpoint@gmail.com',
      retailerName: 'Hasan Rahman',
      businessName: 'South Point Pharmacy',
      businessType: 'pharmacy',
      shippingAddress: 'Dhanmondi Road 12A, Dhanmondi, Dhaka, Bangladesh',
      deliveryLocation: 'inside',
      deliveryCharge: 100,
      paymentMethod: 'bKash',
      paymentStatus: 'Paid',
      adminNotes: 'Delivered via Tejgaon Central Depot route. Signed and verified by store manager.',
      statusHistory: [
        { status: 'Pending', timestamp: 'Today, 08:30 AM', note: 'Order placed by pharmacy' },
        { status: 'Confirmed', timestamp: 'Today, 08:35 AM', note: 'Stock verified at Tejgaon depot' },
        { status: 'Processing', timestamp: 'Today, 08:45 AM', note: 'Cold-chain parcel packed' },
        { status: 'Shipped', timestamp: 'Today, 09:00 AM', note: 'Dispatched with rider #09' },
        { status: 'Delivered', timestamp: 'Today, 09:15 AM', note: 'Customer received package' }
      ],
      items: [
        { product: products.find(p => p.id === 'ph-003') || products[2], quantity: 2 },
        { product: products.find(p => p.id === 'ph-001') || products[0], quantity: 1 },
        { product: products.find(p => p.id === 'ph-005') || products[4], quantity: 1 }
      ]
    },
    {
      id: 'ORD-98845',
      itemsCount: 51,
      division: 'CROP CARES',
      status: 'In Transit',
      totalPrice: 24910,
      subtotalPrice: 24710,
      date: 'Yesterday, 04:30 PM',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      customerName: 'Md. Rafiqul Islam',
      customerPhone: '01811556677',
      customerEmail: 'padma.agro@gmail.com',
      retailerName: 'Md. Rafiqul Islam',
      businessName: 'Padma Agro-Seeds & Feed',
      businessType: 'farm',
      shippingAddress: 'Sardar Para, Rajshahi, Bangladesh',
      deliveryLocation: 'outside',
      deliveryCharge: 200,
      paymentMethod: 'Bank',
      paymentStatus: 'Paid',
      adminNotes: 'Inter-district transport via Rajshahi Highway hub.',
      statusHistory: [
        { status: 'Pending', timestamp: 'Yesterday, 03:00 PM', note: 'Bulk seasonal seed order received' },
        { status: 'Confirmed', timestamp: 'Yesterday, 03:20 PM', note: 'Approved by Regional Agribusiness manager' },
        { status: 'Processing', timestamp: 'Yesterday, 03:50 PM', note: 'Bags loaded at Gazipur Depot' },
        { status: 'Shipped', timestamp: 'Yesterday, 04:30 PM', note: 'Long haul cargo container in transit' }
      ],
      items: [
        { product: products.find(p => p.id === 'ag-001') || products[10], quantity: 50 },
        { product: products.find(p => p.id === 'ag-004') || products[13], quantity: 1 }
      ]
    },
    {
      id: 'ORD-97612',
      itemsCount: 15,
      division: 'CONSUMER BRANDS & FOODS',
      status: 'Pending',
      totalPrice: 4850,
      subtotalPrice: 4750,
      date: '10 mins ago',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      customerName: 'Mohammad Yusuf',
      customerPhone: '01911889900',
      customerEmail: 'bismillah.store@gmail.com',
      retailerName: 'Mohammad Yusuf',
      businessName: 'Bismillah General Store',
      businessType: 'grocery',
      shippingAddress: 'GEC Circle, Chittagong, Bangladesh',
      deliveryLocation: 'outside',
      deliveryCharge: 100,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      adminNotes: 'Awaiting admin phone confirmation before dispatch.',
      statusHistory: [
        { status: 'Pending', timestamp: '10 mins ago', note: 'Order placed by grocery store' }
      ],
      items: [
        { product: products.find(p => p.id === 'cb-001') || products[8], quantity: 5 },
        { product: products.find(p => p.id === 'cb-104') || products[11], quantity: 10 }
      ]
    }
  ];
};

/* ==========================================================================
   CATEGORIES STORE
========================================================================== */

export const getStoredCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading stored categories:', e);
  }
  // Initialize default
  saveStoredCategories(INITIAL_CATEGORIES);
  return INITIAL_CATEGORIES;
};

export const saveStoredCategories = (categories: Category[]): void => {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent(STORE_EVENTS.CATEGORIES_UPDATED, { detail: categories }));
  } catch (e) {
    console.error('Error saving categories:', e);
  }
};

export const addCategory = (category: Omit<Category, 'id' | 'subcategories'> & { id?: string; subcategories?: Subcategory[] }): Category => {
  const current = getStoredCategories();
  const id = category.id || `cat-${Date.now()}`;
  
  // If subcategories not passed, auto generate 3 default subcategories
  const subcategories = category.subcategories && category.subcategories.length > 0
    ? category.subcategories
    : generateDefaultSubcategoriesForCategory(category.name, id);

  const newCat: Category = {
    id,
    name: category.name.trim(),
    division: category.division,
    description: category.description?.trim(),
    subcategories
  };

  const updated = [newCat, ...current];
  saveStoredCategories(updated);
  return newCat;
};

export const updateCategory = (id: string, updates: Partial<Category>): Category | null => {
  const current = getStoredCategories();
  let updatedCategory: Category | null = null;
  const next = current.map(cat => {
    if (cat.id === id) {
      updatedCategory = { ...cat, ...updates };
      return updatedCategory;
    }
    return cat;
  });
  if (updatedCategory) {
    saveStoredCategories(next);
  }
  return updatedCategory;
};

export const deleteCategory = (id: string): boolean => {
  const current = getStoredCategories();
  const next = current.filter(cat => cat.id !== id);
  if (next.length !== current.length) {
    saveStoredCategories(next);
    return true;
  }
  return false;
};

export const addSubcategoryToCategory = (categoryId: string, name: string, description?: string): Subcategory | null => {
  const current = getStoredCategories();
  let createdSub: Subcategory | null = null;

  const next = current.map(cat => {
    if (cat.id === categoryId) {
      const subId = `${cat.id}-sub-${Date.now()}`;
      createdSub = {
        id: subId,
        name: name.trim(),
        categoryId,
        description: description?.trim()
      };
      return {
        ...cat,
        subcategories: [...cat.subcategories, createdSub]
      };
    }
    return cat;
  });

  if (createdSub) {
    saveStoredCategories(next);
  }
  return createdSub;
};

export const updateSubcategory = (categoryId: string, subcategoryId: string, updates: Partial<Subcategory>): boolean => {
  const current = getStoredCategories();
  let changed = false;

  const next = current.map(cat => {
    if (cat.id === categoryId) {
      const nextSubs = cat.subcategories.map(sub => {
        if (sub.id === subcategoryId) {
          changed = true;
          return { ...sub, ...updates };
        }
        return sub;
      });
      return { ...cat, subcategories: nextSubs };
    }
    return cat;
  });

  if (changed) {
    saveStoredCategories(next);
    return true;
  }
  return false;
};

export const deleteSubcategory = (categoryId: string, subcategoryId: string): boolean => {
  const current = getStoredCategories();
  let changed = false;

  const next = current.map(cat => {
    if (cat.id === categoryId) {
      const filtered = cat.subcategories.filter(s => s.id !== subcategoryId);
      if (filtered.length !== cat.subcategories.length) {
        changed = true;
        return { ...cat, subcategories: filtered };
      }
    }
    return cat;
  });

  if (changed) {
    saveStoredCategories(next);
    return true;
  }
  return false;
};

export const autoGenerateSubcategoriesForCat = (categoryId: string): Subcategory[] => {
  const current = getStoredCategories();
  const target = current.find(c => c.id === categoryId);
  if (!target) return [];

  const generated = generateDefaultSubcategoriesForCategory(target.name, target.id);
  const next = current.map(c => c.id === categoryId ? { ...c, subcategories: [...c.subcategories, ...generated] } : c);
  saveStoredCategories(next);
  return generated;
};

export const resetCategoriesToDefault = (): Category[] => {
  saveStoredCategories(INITIAL_CATEGORIES);
  return INITIAL_CATEGORIES;
};

/* ==========================================================================
   PRODUCTS STORE
========================================================================== */

export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const initial = getInitialProducts();
        const existingIds = new Set(parsed.map((p: any) => p.id));
        const missing = initial.filter(p => !existingIds.has(p.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          saveStoredProducts(merged);
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading stored products:', e);
  }
  const initial = getInitialProducts();
  saveStoredProducts(initial);
  return initial;
};

export const saveStoredProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent(STORE_EVENTS.PRODUCTS_UPDATED, { detail: products }));
  } catch (e) {
    console.error('Error saving products:', e);
  }
};

export const addProduct = (productData: Omit<Product, 'id'> & { id?: string }): Product => {
  const current = getStoredProducts();
  const id = productData.id || `prod-${Date.now()}`;
  const sku = productData.sku || `ACI-${Math.floor(1000 + Math.random() * 9000)}`;

  const newProd: Product = {
    ...productData,
    id,
    sku,
    stockQuantity: Number(productData.stockQuantity) || 0,
    price: Number(productData.price) || 0,
    discountPrice: productData.discountPrice ? Number(productData.discountPrice) : undefined,
    availabilityStatus: productData.availabilityStatus || (Number(productData.stockQuantity) > 0 ? 'In Stock' : 'Out of Stock')
  };

  const updated = [newProd, ...current];
  saveStoredProducts(updated);
  return newProd;
};

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const current = getStoredProducts();
  let updatedProd: Product | null = null;

  const next = current.map(p => {
    if (p.id === id) {
      const nextStock = updates.stockQuantity !== undefined ? Number(updates.stockQuantity) : p.stockQuantity;
      let nextAvailability = updates.availabilityStatus || p.availabilityStatus;
      if (updates.stockQuantity !== undefined && !updates.availabilityStatus) {
        if (nextStock === 0) nextAvailability = 'Out of Stock';
        else if (nextStock < 15) nextAvailability = 'Low Stock';
        else nextAvailability = 'In Stock';
      }

      updatedProd = {
        ...p,
        ...updates,
        stockQuantity: nextStock,
        price: updates.price !== undefined ? Number(updates.price) : p.price,
        discountPrice: updates.discountPrice !== undefined 
          ? (updates.discountPrice ? Number(updates.discountPrice) : undefined) 
          : p.discountPrice,
        availabilityStatus: nextAvailability
      };
      return updatedProd;
    }
    return p;
  });

  if (updatedProd) {
    saveStoredProducts(next);
  }
  return updatedProd;
};

export const deleteProduct = (id: string): boolean => {
  const current = getStoredProducts();
  const next = current.filter(p => p.id !== id);
  if (next.length !== current.length) {
    saveStoredProducts(next);
    return true;
  }
  return false;
};

export const resetProductsToDefault = (): Product[] => {
  const initial = getInitialProducts();
  saveStoredProducts(initial);
  return initial;
};

/* ==========================================================================
   ORDERS STORE
========================================================================== */

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading stored orders:', e);
  }
  const initial = getInitialOrders();
  saveStoredOrders(initial);
  return initial;
};

export const saveStoredOrders = (orders: Order[]): void => {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent(STORE_EVENTS.ORDERS_UPDATED, { detail: orders }));
  } catch (e) {
    console.error('Error saving orders:', e);
  }
};

export const addCustomerOrder = (newOrder: Order): Order => {
  const current = getStoredOrders();
  // Ensure default initial status history
  const orderWithHistory: Order = {
    ...newOrder,
    statusHistory: newOrder.statusHistory || [
      {
        status: newOrder.status || 'Pending',
        timestamp: 'Just now',
        note: `Order placed by ${newOrder.customerName || 'Customer'}`
      }
    ]
  };

  const updated = [orderWithHistory, ...current];
  saveStoredOrders(updated);
  return orderWithHistory;
};

export const updateOrderStatusInStore = (orderId: string, newStatus: OrderStatus, note?: string): Order | null => {
  const current = getStoredOrders();
  let updatedOrder: Order | null = null;

  const next = current.map(ord => {
    if (ord.id === orderId) {
      const history = ord.statusHistory || [];
      const newHistoryItem = {
        status: newStatus,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: note || `Order status updated to ${newStatus} by Admin`
      };

      updatedOrder = {
        ...ord,
        status: newStatus,
        statusHistory: [...history, newHistoryItem]
      };
      return updatedOrder;
    }
    return ord;
  });

  if (updatedOrder) {
    saveStoredOrders(next);
  }

  return updatedOrder;
};
