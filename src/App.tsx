import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem, BusinessProfile, Division, Order, AppUser } from './types';
import { ACI_PRODUCTS, DIVISION_BUSINESSES } from './data/products';
import { getRepresentativeForBusiness, BusinessRepresentative } from './data/representatives';
import { ChatAssistant } from './components/ChatAssistant';
import { ProductCatalog } from './components/ProductCatalog';
import { OrderRepresentativesPanel } from './components/OrderRepresentativesPanel';
import { OrderDeliveryTracker } from './components/OrderDeliveryTracker';
import { generateInvoicePDF } from './utils/pdfGenerator';
import { ActivityMapChart } from './components/ActivityMapChart';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { addCustomerOrder, updateOrderStatusInStore, STORE_EVENTS } from './utils/store';
import { 
  Bot, 
  ShoppingCart, 
  HelpCircle, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Minus, 
  Info, 
  Sparkles, 
  User, 
  Package,
  TrendingUp, 
  Clock, 
  PhoneCall, 
  Check, 
  FileText,
  Send,
  Mail,
  Phone,
  ExternalLink,
  MessageSquare,
  Truck,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Building2,
  UserCheck,
  X,
  Copy,
  Menu,
  Shield,
  KeyRound,
  LogOut
} from 'lucide-react';
import { apiRequest, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { ApiKeyGuideModal } from './components/ApiKeyGuideModal';

const DEFAULT_BUSINESS_PROFILES: BusinessProfile[] = [
  {
    id: "ACI-PRF-99021",
    name: "South Point Pharmacy",
    type: "pharmacy",
    location: "Dhaka (Dhanmondi)",
    retailerName: "Hasan Rahman",
    phone: "01711223344",
    shippingAddress: "Dhanmondi Road 12A, Dhanmondi, Dhaka, Bangladesh",
    savedBaskets: [],
    purchaseHistory: [
      {
        id: 'ORD-99021',
        itemsCount: 4,
        division: 'PHARMACEUTICALS & HEALTHCARE',
        status: 'Delivered',
        totalPrice: 1140,
        date: 'Today, 09:15 AM',
        createdAt: new Date(),
        items: [
          { product: ACI_PRODUCTS.find(p => p.id === 'ph-003') || ACI_PRODUCTS[2], quantity: 2 },
          { product: ACI_PRODUCTS.find(p => p.id === 'ph-001') || ACI_PRODUCTS[0], quantity: 1 },
          { product: ACI_PRODUCTS.find(p => p.id === 'ph-005') || ACI_PRODUCTS[4], quantity: 1 }
        ],
        shippingAddress: 'Dhanmondi Road 12A, Dhanmondi, Dhaka, Bangladesh',
        deliveryLocation: 'inside',
        deliveryCharge: 100,
        paymentMethod: 'bKash'
      }
    ]
  },
  {
    id: "ACI-PRF-98845",
    name: "Padma Agro-Seeds & Feed",
    type: "farm",
    location: "Rajshahi (Sardar)",
    retailerName: "Md. Rafiqul Islam",
    phone: "01811556677",
    shippingAddress: "Sardar Para, Rajshahi, Bangladesh",
    savedBaskets: [],
    purchaseHistory: [
      {
        id: 'ORD-98845',
        itemsCount: 51,
        division: 'CROP CARES',
        status: 'In Transit',
        totalPrice: 24710,
        date: 'Yesterday, 04:30 PM',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        items: [
          { product: ACI_PRODUCTS.find(p => p.id === 'ag-001') || ACI_PRODUCTS[10], quantity: 50 },
          { product: ACI_PRODUCTS.find(p => p.id === 'ag-004') || ACI_PRODUCTS[13], quantity: 1 }
        ],
        shippingAddress: 'Sardar Para, Rajshahi, Bangladesh',
        deliveryLocation: 'outside',
        deliveryCharge: 200,
        paymentMethod: 'Bank'
      }
    ]
  },
  {
    id: "ACI-PRF-77312",
    name: "Bismillah General Store",
    type: "grocery",
    location: "Chittagong (GEC)",
    retailerName: "Mohammad Yusuf",
    phone: "01911889900",
    shippingAddress: "GEC Circle, Chittagong, Bangladesh",
    savedBaskets: [],
    purchaseHistory: []
  },
  {
    id: "ACI-PRF-66421",
    name: "Rahman Family Retailers",
    type: "general",
    location: "Sylhet (Zindabazar)",
    retailerName: "Anisur Rahman",
    phone: "01511223344",
    shippingAddress: "Zindabazar, Sylhet, Bangladesh",
    savedBaskets: [],
    purchaseHistory: []
  }
];

const getStorageScope = (user: AppUser | null, guestMode: boolean): string => {
  if (user) return `user-${encodeURIComponent(user.uid || user.email)}`;
  return guestMode ? 'guest' : 'signed-out';
};

const getScopedStorageKey = (baseKey: string, scope: string): string => `${baseKey}:${scope}`;

const getDefaultProfilesForSession = (user: AppUser | null, guestMode: boolean): BusinessProfile[] => {
  if (!user && guestMode) return DEFAULT_BUSINESS_PROFILES;
  if (!user) return DEFAULT_BUSINESS_PROFILES;

  const profileType: BusinessProfile['type'] = ['pharmacy', 'farm', 'grocery'].includes(user.businessType || '')
    ? user.businessType as BusinessProfile['type']
    : 'general';
  const location = user.location || 'Dhaka, Bangladesh';

  return [{
    id: `ACI-USER-${user.uid}`,
    name: user.businessName || user.displayName,
    type: profileType,
    location,
    retailerName: user.displayName,
    phone: user.phone || '',
    shippingAddress: location,
    savedBaskets: [],
    purchaseHistory: []
  }];
};

export const getDeliveryCharge = (location: string): number => {
  if (['aci-centre', 'nobo-tower', 'santa-forum', 'police-plaza'].includes(location)) {
    return 0;
  }
  return location === 'inside' ? 100 : 200;
};

export const getDeliveryLocationLabel = (location?: string): string => {
  if (!location) return 'N/A';
  switch (location) {
    case 'inside': return 'Inside Dhaka';
    case 'outside': return 'Outside Dhaka';
    case 'aci-centre': return 'ACI Centre (Corporate Point)';
    case 'nobo-tower': return 'Nobo Tower (Corporate Point)';
    case 'santa-forum': return 'Santa Forum (Corporate Point)';
    case 'police-plaza': return 'Police Plaza (Corporate Point)';
    default: return location;
  }
};

export default function App() {
  const { currentUser, isAdmin, logout, initialLoading } = useAuth();
  const [guestMode, setGuestMode] = useState(false);
  const [isApiKeyGuideOpen, setIsApiKeyGuideOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'catalog' | 'admin'>('catalog');
  const [catalogDivision, setCatalogDivision] = useState<Division | 'ALL'>('ALL');
  const [catalogBusiness, setCatalogBusiness] = useState<string | null>(null);
  const storageScope = getStorageScope(currentUser, guestMode);
  const cartStorageKey = getScopedStorageKey('aci_order_hub_cart', storageScope);
  const profileStorageKey = getScopedStorageKey('aci_user_profiles_v2', storageScope);

  // Synchronize initial and updated view based on user role
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setCurrentView('admin');
    } else if (currentView === 'admin') {
      setCurrentView('catalog');
    }
  }, [currentUser?.role]);
  const [expandedDivisions, setExpandedDivisions] = useState<Record<Division, boolean>>({
    'PHARMACEUTICALS & HEALTHCARE': false,
    'AGRIBUSINESS': false,
    'CONSUMER BRANDS & FOODS': false,
    'RETAIL & LOGISTICS': false,
    'CROP CARES': false,
    'TECHNOLOGY, COMMUNICATION & SERVICES': false
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [profiles, setProfiles] = useState<BusinessProfile[]>(DEFAULT_BUSINESS_PROFILES);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);

  useLayoutEffect(() => {
    const saved = localStorage.getItem(profileStorageKey);
    if (!saved) {
      setProfiles(getDefaultProfilesForSession(currentUser, guestMode));
      setSelectedProfileIndex(0);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid profile data');
      setProfiles(parsed.map((p: any) => ({
        ...p,
        purchaseHistory: (p.purchaseHistory || []).map((o: any) => ({
          ...o,
          createdAt: o.createdAt ? new Date(o.createdAt) : undefined
        }))
      })));
      setSelectedProfileIndex(0);
    } catch (e) {
      console.error("Error parsing user profiles", e);
      setProfiles(getDefaultProfilesForSession(currentUser, guestMode));
      setSelectedProfileIndex(0);
    }
  }, [profileStorageKey, currentUser, guestMode]);

  const saveProfiles = (newProfiles: BusinessProfile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem(profileStorageKey, JSON.stringify(newProfiles));
  };

  const currentProfile = profiles[selectedProfileIndex] || profiles[0];

  const [activeProfileTab, setActiveProfileTab] = useState<'info' | 'map'>('info');

  // Profile modal and creation state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileEditingIndex, setProfileEditingIndex] = useState<number | null>(null); // null means creating new
  const [modalProfileName, setModalProfileName] = useState('');
  const [modalProfileType, setModalProfileType] = useState<'pharmacy' | 'farm' | 'grocery' | 'general'>('pharmacy');
  const [modalProfileLocation, setModalProfileLocation] = useState('');
  const [modalProfileRetailerName, setModalProfileRetailerName] = useState('');
  const [modalProfilePhone, setModalProfilePhone] = useState('');
  const [modalProfileShippingAddress, setModalProfileShippingAddress] = useState('');

  // Saved Basket state
  const [basketName, setBasketName] = useState('');
  const [isSavingBasket, setIsSavingBasket] = useState(false);

  const handleOpenCreateProfile = () => {
    setProfileEditingIndex(null);
    setModalProfileName('');
    setModalProfileType('pharmacy');
    setModalProfileLocation('');
    setModalProfileRetailerName('');
    setModalProfilePhone('');
    setModalProfileShippingAddress('');
    setIsProfileModalOpen(true);
  };

  const handleOpenEditProfile = () => {
    if (!currentProfile) return;
    setProfileEditingIndex(selectedProfileIndex);
    setModalProfileName(currentProfile.name);
    setModalProfileType(currentProfile.type);
    setModalProfileLocation(currentProfile.location);
    setModalProfileRetailerName(currentProfile.retailerName || '');
    setModalProfilePhone(currentProfile.phone || '');
    setModalProfileShippingAddress(currentProfile.shippingAddress || '');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalProfileName || !modalProfileLocation) {
      setToastMessage("Please fill in Business Name and Location Area.");
      return;
    }

    if (profileEditingIndex !== null) {
      // Edit existing profile
      const updatedProfiles = profiles.map((p, idx) => {
        if (idx === profileEditingIndex) {
          return {
            ...p,
            name: modalProfileName,
            type: modalProfileType,
            location: modalProfileLocation,
            retailerName: modalProfileRetailerName,
            phone: modalProfilePhone,
            shippingAddress: modalProfileShippingAddress
          };
        }
        return p;
      });
      saveProfiles(updatedProfiles);
      setToastMessage("Profile information updated successfully!");
    } else {
      // Create new profile
      const newProfileId = `ACI-PRF-${Math.floor(10000 + Math.random() * 90000)}`;
      const newProfile: BusinessProfile = {
        id: newProfileId,
        name: modalProfileName,
        type: modalProfileType,
        location: modalProfileLocation,
        retailerName: modalProfileRetailerName,
        phone: modalProfilePhone,
        shippingAddress: modalProfileShippingAddress || `${modalProfileLocation}, Bangladesh`,
        savedBaskets: [],
        purchaseHistory: []
      };
      const updatedProfiles = [...profiles, newProfile];
      saveProfiles(updatedProfiles);
      setSelectedProfileIndex(updatedProfiles.length - 1); // switch to the newly created profile
      setToastMessage(`New Profile Created! ID: ${newProfileId}`);
    }

    setIsProfileModalOpen(false);
  };

  // Saved Basket Templates logic
  const handleSaveCurrentBasket = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setToastMessage("Cannot save an empty basket.");
      return;
    }
    if (!basketName.trim()) {
      setToastMessage("Please specify a template name.");
      return;
    }

    const newBasket = {
      id: `BSK-${Math.floor(10000 + Math.random() * 90000)}`,
      name: basketName.trim(),
      items: [...cart],
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updatedProfiles = profiles.map((p, idx) => {
      if (idx === selectedProfileIndex) {
        const existingBaskets = p.savedBaskets || [];
        return {
          ...p,
          savedBaskets: [newBasket, ...existingBaskets]
        };
      }
      return p;
    });

    saveProfiles(updatedProfiles);
    setBasketName('');
    setIsSavingBasket(false);
    setToastMessage(`Basket saved as "${newBasket.name}" for future restocks!`);
  };

  const handleLoadSavedBasket = (savedBasketItems: CartItem[]) => {
    // Replace current cart with items from the template
    saveCart([...savedBasketItems]);
    setToastMessage("Basket template loaded into active cart!");
  };

  const handleDeleteSavedBasket = (basketId: string) => {
    const updatedProfiles = profiles.map((p, idx) => {
      if (idx === selectedProfileIndex) {
        const filtered = (p.savedBaskets || []).filter(b => b.id !== basketId);
        return {
          ...p,
          savedBaskets: filtered
        };
      }
      return p;
    });
    saveProfiles(updatedProfiles);
    setToastMessage("Basket template removed.");
  };

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [lastOrderSummary, setLastOrderSummary] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);

  const handleUpdateOrderStatus = (orderId: string, newStatus: any) => {
    // Sync with central store for admin dashboard
    updateOrderStatusInStore(orderId, newStatus);

    const updatedOrders = orders.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    });
    setOrders(updatedOrders);
    
    const updatedProfiles = profiles.map((p, idx) => {
      if (idx === selectedProfileIndex) {
        return { ...p, purchaseHistory: updatedOrders };
      }
      return p;
    });
    saveProfiles(updatedProfiles);

    setTrackedOrder(prev => {
      if (prev && prev.id === orderId) {
        return { ...prev, status: newStatus };
      }
      return prev;
    });
  };

  // Synchronize orders whenever admin updates an order status in Admin site
  useEffect(() => {
    const handleOrdersSync = (e: any) => {
      const allOrders: Order[] = e.detail || [];
      if (!allOrders.length) return;

      setOrders(prev => {
        return prev.map(o => {
          const matched = allOrders.find(item => item.id === o.id);
          return matched ? { ...o, status: matched.status, statusHistory: matched.statusHistory } : o;
        });
      });

      setTrackedOrder(prev => {
        if (!prev) return null;
        const matched = allOrders.find(item => item.id === prev.id);
        return matched ? { ...prev, status: matched.status, statusHistory: matched.statusHistory } : prev;
      });
    };

    window.addEventListener(STORE_EVENTS.ORDERS_UPDATED, handleOrdersSync);
    return () => {
      window.removeEventListener(STORE_EVENTS.ORDERS_UPDATED, handleOrdersSync);
    };
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('inside');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'COD' | 'Bank' | 'Card'>('bKash');

  useEffect(() => {
    if (currentProfile) {
      setShippingAddress(currentProfile.shippingAddress || `${currentProfile.location}, Bangladesh`);
      setOrders(currentProfile.purchaseHistory || []);
    }
  }, [selectedProfileIndex, currentProfile]);

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateRangePreset, setDateRangePreset] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Status Filter
      if (statusFilter !== 'All') {
        const expectedStatus = statusFilter === 'Only Delivered' ? 'Delivered' : statusFilter;
        if (order.status !== expectedStatus) {
          return false;
        }
      }

      // 2. Date Filter
      const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
      const orderTime = orderDate.getTime();

      if (dateRangePreset === 'Today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return orderTime >= today.getTime();
      } else if (dateRangePreset === '7Days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return orderTime >= sevenDaysAgo.getTime();
      } else if (dateRangePreset === 'Custom') {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (orderTime < start.getTime()) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (orderTime > end.getTime()) return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, dateRangePreset, startDate, endDate]);



  // Helper to group order items by representative/business
  const getOrderGroupedByRepresentative = (order: Order) => {
    const groups: Record<string, { representative: BusinessRepresentative; items: CartItem[] }> = {};
    order.items.forEach(item => {
      const bizName = item.product.business || 'ACI General Delivery Hub';
      if (!groups[bizName]) {
        groups[bizName] = {
          representative: getRepresentativeForBusiness(bizName),
          items: []
        };
      }
      groups[bizName].items.push(item);
    });
    return Object.values(groups);
  };

  // Remove legacy global storage keys so data created before account scoping
  // cannot be shown to the first account that signs in after this update.
  useEffect(() => {
    localStorage.removeItem('aci_order_hub_cart');
    localStorage.removeItem('aci_user_profiles_v2');
    localStorage.removeItem('aci_order_hub_chat_history');
  }, []);

  // Load only the cart belonging to the active account or guest session.
  useLayoutEffect(() => {
    const savedCart = localStorage.getItem(cartStorageKey);
    if (!savedCart) {
      setCart([]);
      setIsCartOpen(false);
      return;
    }

    try {
      const parsed = JSON.parse(savedCart);
      setCart(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error("Error parsing account cart", e);
      setCart([]);
    }
    setIsCartOpen(false);
  }, [cartStorageKey]);

  // Save cart only under the active account or guest session.
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem(cartStorageKey, JSON.stringify(newCart));
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    const newCart = [...cart];
    const existingIndex = newCart.findIndex(item => item.product.id === product.id);
    
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({ product, quantity });
    }
    
    saveCart(newCart);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];
    
    saveCart(newCart);
  };

  const handleRemoveFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    saveCart(newCart);
  };

  const cartItemsCount = useMemo(() => {
    const counts: Record<string, number> = {};
    cart.forEach(item => {
      counts[item.product.id] = item.quantity;
    });
    return counts;
  }, [cart]);

  const totalCartItems = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const totalCartPrice = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  // Navigate directly to catalog with a filtered division
  const handleDivisionClick = (div: Division) => {
    setCatalogDivision(div);
    setCatalogBusiness(null);
    setExpandedDivisions(prev => ({
      ...prev,
      [div]: !prev[div]
    }));
    setCurrentView('catalog');
  };

  const handleBusinessClick = (div: Division, biz: string) => {
    setCatalogDivision(div);
    setCatalogBusiness(biz);
    setCurrentView('catalog');
  };

  // Profile Stock Alert suggestions based on Profile Type
  const profileStockAlert = useMemo(() => {
    switch (currentProfile.type) {
      case 'pharmacy':
        return {
          title: "Critical Stock Alert",
          message: "Your shop is low on Savlon Liquid (500ml) & Fast-ACI Paracetamol based on 30-day average sales.",
          items: [
            { id: 'cb-001', qty: 5 }, // Savlon Liquid
            { id: 'ph-005', qty: 10 } // Fast-ACI
          ]
        };
      case 'farm':
        return {
          title: "Sowing Season Alert",
          message: "Upcoming high-yield Boro sowing period. Stock alert: Alonkar Hybrid Rice Seeds & Carbendazim Fungicide.",
          items: [
            { id: 'ag-001', qty: 15 }, // Alonkar Rice
            { id: 'ag-004', qty: 8 }  // Carbendazim
          ]
        };
      case 'grocery':
        return {
          title: "Commodity Stock Warning",
          message: "High demand expected this weekend. Reorder warning: ACI Pure Iodized Salt & ACI Pure Atta (2kg).",
          items: [
            { id: 'cb-104', qty: 50 }, // Salt
            { id: 'cb-101', qty: 20 }  // Atta
          ]
        };
      case 'general':
        return {
          title: "Household Stock Check",
          message: "Fulfill daily personal hygiene runs. Suggested top-ups: Savlon Active Soap & Colgate Strong Teeth.",
          items: [
            { id: 'cb-003', qty: 24 }, // Soap
            { id: 'cb-008', qty: 12 }  // Colgate
          ]
        };
    }
  }, [currentProfile]);

  const handleOrderAlertItems = () => {
    profileStockAlert.items.forEach(alertItem => {
      const product = ACI_PRODUCTS.find(p => p.id === alertItem.id);
      if (product) {
        handleAddToCart(product, alertItem.qty);
      }
    });
    setIsCartOpen(true);
  };

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleFinalCheckoutSubmit = () => {
    if (cart.length === 0) return;

    const deliveryCharge = getDeliveryCharge(deliveryLocation);
    const finalPrice = totalCartPrice + deliveryCharge;

    const newOrder: Order = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      itemsCount: cart.reduce((acc, item) => acc + item.quantity, 0),
      division: cart[0]?.product.division || 'CONSUMER BRANDS & FOODS',
      status: 'Pending',
      totalPrice: finalPrice,
      subtotalPrice: totalCartPrice,
      date: 'Just now',
      createdAt: new Date().toISOString(),
      customerName: currentUser?.displayName || currentProfile.retailerName || currentProfile.name,
      customerPhone: currentUser?.phone || currentProfile.phone || '01711223344',
      customerEmail: currentUser?.email || `${currentProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@retailer-aci.com`,
      retailerName: currentUser?.displayName || currentProfile.retailerName || currentProfile.name,
      businessName: currentUser?.businessName || currentProfile.name,
      businessType: currentUser?.businessType || currentProfile.type,
      shippingAddress: shippingAddress,
      deliveryLocation: deliveryLocation,
      deliveryCharge: deliveryCharge,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `New purchase request submitted by ${currentUser?.displayName || currentProfile.name}`
        }
      ],
      items: [...cart]
    };

    // Push into Admin Orders store so Admin gets it automatically
    addCustomerOrder(newOrder);

    // Sync to Express backend API
    apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(newOrder)
    }).catch(err => console.warn("Backend order sync notice:", err));

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);

    const updatedProfiles = profiles.map((p, idx) => {
      if (idx === selectedProfileIndex) {
        return {
          ...p,
          purchaseHistory: updatedOrders
        };
      }
      return p;
    });
    saveProfiles(updatedProfiles);

    setLastOrderSummary(newOrder);
    setIsCheckoutOpen(false);
    setIsCheckoutSuccess(true);
    saveCart([]); // Clear cart
  };

  // Auth Protection: If application is initializing the local SQLite session, show a brief splash
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans gap-3">
        <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center font-black text-xl shadow-xl shadow-red-900/40 border border-red-500/30 animate-pulse">
          ACI
        </div>
        <p className="text-xs text-slate-400 font-medium tracking-wide">Preparing your ACI workspace...</p>
      </div>
    );
  }

  if (!currentUser && !guestMode) {
    return (
      <>
        <LoginPage 
          onOpenApiKeyGuide={() => setIsApiKeyGuideOpen(true)}
          onContinueAsGuest={() => setGuestMode(true)}
        />
        <ApiKeyGuideModal 
          isOpen={isApiKeyGuideOpen}
          onClose={() => setIsApiKeyGuideOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden" id="app-root-container">
      {/* LEFT SIDEBAR: Business Divisions */}
      <aside className={`w-72 bg-[#0F172A] flex flex-col border-r border-slate-800 shrink-0 fixed inset-y-0 left-0 z-45 transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto scrollbar-thin">
          <div>
            {/* Header / Brand */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-extrabold text-white text-xl tracking-tighter shadow-md">
                  ACI
                </div>
                <div className="leading-tight">
                  <h1 className="text-white font-extrabold text-lg tracking-tight">Customer Assistant</h1>
                  <p className="text-cyan-300 text-[10px] uppercase font-semibold tracking-widest">ACI Bangladesh PLC</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden hover:bg-slate-800 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Navigation Menu */}
            <nav className="space-y-6">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold px-3 mb-2.5 tracking-wider">Navigation</p>
                <div className="space-y-1">
                  <button 
                    onClick={() => { setCurrentView('chat'); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'chat' 
                        ? 'bg-red-600/10 text-red-400 border-l-4 border-red-600' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bot className="w-4 h-4" />
                      <span>AI Chat Assistant</span>
                    </div>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  </button>

                  <button 
                    onClick={() => { setCurrentView('catalog'); setCatalogDivision('ALL'); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'catalog' && catalogDivision === 'ALL'
                        ? 'bg-red-600/10 text-red-400 border-l-4 border-red-600' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Browse All Products</span>
                  </button>

                  {isAdmin && (
                    <button 
                      onClick={() => { setCurrentView('admin'); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        currentView === 'admin'
                          ? 'bg-red-600/20 text-white border-l-4 border-red-500 font-bold' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-red-400" />
                        <span>Admin Site</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded font-mono bg-red-600 text-white">
                        HQ
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold px-3 mb-2.5 tracking-wider">Business</p>
                <div className="space-y-1">
                  {/* PHARMACEUTICALS & HEALTHCARE */}
                  <div>
                    <button 
                      onClick={() => handleDivisionClick('PHARMACEUTICALS & HEALTHCARE')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                        currentView === 'catalog' && catalogDivision === 'PHARMACEUTICALS & HEALTHCARE'
                          ? 'bg-slate-800 text-white border-l-4 border-blue-500' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                        <span className="truncate">Pharma & Healthcare</span>
                      </div>
                      <ChevronRight className={`w-3 h-3 text-slate-500 shrink-0 transition-transform duration-200 ${expandedDivisions['PHARMACEUTICALS & HEALTHCARE'] ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedDivisions['PHARMACEUTICALS & HEALTHCARE'] && (
                      <div className="pl-6 pr-2 py-1 space-y-1 bg-slate-900/30 rounded-lg ml-3 border-l border-slate-800/80 mt-1">
                        {DIVISION_BUSINESSES['PHARMACEUTICALS & HEALTHCARE'].map((biz) => (
                          <button
                            key={biz}
                            onClick={() => handleBusinessClick('PHARMACEUTICALS & HEALTHCARE', biz)}
                            className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md text-[10px] font-medium transition-all text-left ${
                              catalogBusiness === biz
                                ? 'text-blue-400 bg-slate-800/80 font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="truncate">{biz}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AGRIBUSINESS */}
                  <div>
                    <button 
                      onClick={() => handleDivisionClick('AGRIBUSINESS')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                        currentView === 'catalog' && catalogDivision === 'AGRIBUSINESS'
                          ? 'bg-slate-800 text-white border-l-4 border-emerald-500' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                        <span className="truncate">Agribusiness</span>
                      </div>
                      <ChevronRight className={`w-3 h-3 text-slate-500 shrink-0 transition-transform duration-200 ${expandedDivisions['AGRIBUSINESS'] ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedDivisions['AGRIBUSINESS'] && (
                      <div className="pl-6 pr-2 py-1 space-y-1 bg-slate-900/30 rounded-lg ml-3 border-l border-slate-800/80 mt-1">
                        {DIVISION_BUSINESSES['AGRIBUSINESS'].map((biz) => (
                          <button
                            key={biz}
                            onClick={() => handleBusinessClick('AGRIBUSINESS', biz)}
                            className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md text-[10px] font-medium transition-all text-left ${
                              catalogBusiness === biz
                                ? 'text-emerald-400 bg-slate-800/80 font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="truncate">{biz}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CONSUMER BRANDS & FOODS */}
                  <div>
                    <button 
                      onClick={() => handleDivisionClick('CONSUMER BRANDS & FOODS')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                        currentView === 'catalog' && catalogDivision === 'CONSUMER BRANDS & FOODS'
                          ? 'bg-slate-800 text-white border-l-4 border-amber-500' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                        <span className="truncate">Consumer Brands & Foods</span>
                      </div>
                      <ChevronRight className={`w-3 h-3 text-slate-500 shrink-0 transition-transform duration-200 ${expandedDivisions['CONSUMER BRANDS & FOODS'] ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedDivisions['CONSUMER BRANDS & FOODS'] && (
                      <div className="pl-6 pr-2 py-1 space-y-1 bg-slate-900/30 rounded-lg ml-3 border-l border-slate-800/80 mt-1">
                        {DIVISION_BUSINESSES['CONSUMER BRANDS & FOODS'].map((biz) => (
                          <button
                            key={biz}
                            onClick={() => handleBusinessClick('CONSUMER BRANDS & FOODS', biz)}
                            className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md text-[10px] font-medium transition-all text-left ${
                              catalogBusiness === biz
                                ? 'text-amber-400 bg-slate-800/80 font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="truncate">{biz}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* RETAIL & LOGISTICS */}
                  <div>
                    <button 
                      onClick={() => handleDivisionClick('RETAIL & LOGISTICS')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                        currentView === 'catalog' && catalogDivision === 'RETAIL & LOGISTICS'
                          ? 'bg-slate-800 text-white border-l-4 border-rose-500' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div>
                        <span className="truncate">Retail & Logistics</span>
                      </div>
                      <ChevronRight className={`w-3 h-3 text-slate-500 shrink-0 transition-transform duration-200 ${expandedDivisions['RETAIL & LOGISTICS'] ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedDivisions['RETAIL & LOGISTICS'] && (
                      <div className="pl-6 pr-2 py-1 space-y-1 bg-slate-900/30 rounded-lg ml-3 border-l border-slate-800/80 mt-1">
                        {DIVISION_BUSINESSES['RETAIL & LOGISTICS'].map((biz) => (
                          <button
                            key={biz}
                            onClick={() => handleBusinessClick('RETAIL & LOGISTICS', biz)}
                            className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md text-[10px] font-medium transition-all text-left ${
                              catalogBusiness === biz
                                ? 'text-rose-400 bg-slate-800/80 font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="truncate">{biz}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CROP CARES */}
                  <div>
                    <button 
                      onClick={() => handleDivisionClick('CROP CARES')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                        currentView === 'catalog' && catalogDivision === 'CROP CARES'
                          ? 'bg-slate-800 text-white border-l-4 border-teal-500' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></div>
                        <span className="truncate">Crop Cares</span>
                      </div>
                      <ChevronRight className={`w-3 h-3 text-slate-500 shrink-0 transition-transform duration-200 ${expandedDivisions['CROP CARES'] ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedDivisions['CROP CARES'] && (
                      <div className="pl-6 pr-2 py-1 space-y-1 bg-slate-900/30 rounded-lg ml-3 border-l border-slate-800/80 mt-1">
                        {DIVISION_BUSINESSES['CROP CARES'].map((biz) => (
                          <button
                            key={biz}
                            onClick={() => handleBusinessClick('CROP CARES', biz)}
                            className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md text-[10px] font-medium transition-all text-left ${
                              catalogBusiness === biz
                                ? 'text-teal-400 bg-slate-800/80 font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="truncate">{biz}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TECHNOLOGY, COMMUNICATION & SERVICES */}
                  <div>
                    <button 
                      onClick={() => handleDivisionClick('TECHNOLOGY, COMMUNICATION & SERVICES')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                        currentView === 'catalog' && catalogDivision === 'TECHNOLOGY, COMMUNICATION & SERVICES'
                          ? 'bg-slate-800 text-white border-l-4 border-violet-500' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0"></div>
                        <span className="truncate">Tech, Comm & Services</span>
                      </div>
                      <ChevronRight className={`w-3 h-3 text-slate-500 shrink-0 transition-transform duration-200 ${expandedDivisions['TECHNOLOGY, COMMUNICATION & SERVICES'] ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedDivisions['TECHNOLOGY, COMMUNICATION & SERVICES'] && (
                      <div className="pl-6 pr-2 py-1 space-y-1 bg-slate-900/30 rounded-lg ml-3 border-l border-slate-800/80 mt-1">
                        {DIVISION_BUSINESSES['TECHNOLOGY, COMMUNICATION & SERVICES'].map((biz) => (
                          <button
                            key={biz}
                            onClick={() => handleBusinessClick('TECHNOLOGY, COMMUNICATION & SERVICES', biz)}
                            className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md text-[10px] font-medium transition-all text-left ${
                              catalogBusiness === biz
                                ? 'text-violet-400 bg-slate-800/80 font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="truncate">{biz}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Active User Account & System Navigation inside Sidebar bottom */}
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
            <div className="bg-slate-800/80 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Active Account</p>
                  <p className="text-white text-xs font-bold truncate mt-0.5">
                    {currentUser?.displayName || currentProfile.name}
                  </p>
                  <p className="text-slate-400 text-[10px] truncate font-mono">
                    {currentUser?.email || `${currentProfile.name.toLowerCase()}@aci-partner.com`}
                  </p>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded font-mono shrink-0 ${
                  (currentUser?.role === 'admin' || isAdmin)
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {(currentUser?.role === 'admin' || isAdmin) ? 'ADMIN HQ' : 'RETAILER'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => setIsApiKeyGuideOpen(true)}
                  className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
                  title="View Gemini API Key Guide"
                >
                  <KeyRound className="w-3 h-3 text-red-400" />
                  <span>API Guide</span>
                </button>

                {currentUser ? (
                  <button
                    onClick={() => logout()}
                    className="py-1.5 px-2 bg-slate-900 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 text-[10px] font-bold rounded-lg border border-slate-700 hover:border-rose-500/30 flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Sign Out of Session"
                  >
                    <LogOut className="w-3 h-3 text-rose-400" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setGuestMode(false)}
                    className="py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Sign In"
                  >
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* LEFT SIDEBAR BACKDROP OVERLAY FOR MOBILE */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-35 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* MAIN CONTENT: Active Interactive Screen */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#F8FAFC]">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-8 shadow-xs z-10 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0"></span>
            <h2 className="font-bold text-slate-800 tracking-tight text-[11px] xs:text-xs sm:text-sm md:text-base truncate max-w-[90px] xs:max-w-[150px] sm:max-w-none">
              {currentView === 'chat' 
                ? 'AI Customer Assistant' 
                : currentView === 'admin' 
                ? 'Admin Site — Operations HQ' 
                : `Catalog — ${catalogDivision}`}
            </h2>
          </div>

          {/* Quick Tab Switches & Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="bg-slate-100 p-0.5 sm:p-1 rounded-xl flex items-center gap-0.5 sm:gap-1 border border-slate-200 shrink-0">
              <button
                onClick={() => setCurrentView('chat')}
                className={`px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                  currentView === 'chat' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                AI Chat
              </button>
              <button
                onClick={() => { setCurrentView('catalog'); setCatalogDivision('ALL'); }}
                className={`px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                  currentView === 'catalog'
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Catalog
              </button>
              {isAdmin && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 ${
                    currentView === 'admin'
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-red-700 hover:text-red-800 hover:bg-red-50'
                  }`}
                  title="ACI Corporate HQ Admin Site"
                >
                  <Shield className="w-3.5 h-3.5 text-red-500" />
                  <span>Admin Site</span>
                </button>
              )}
            </div>

            <button 
              onClick={() => setIsApiKeyGuideOpen(true)}
              className="text-xs text-slate-600 hover:text-slate-900 border border-slate-200 p-1.5 sm:px-3 sm:py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-50 transition-all shrink-0 cursor-pointer shadow-2xs font-semibold"
              title="Gemini API Key Guide"
            >
              <KeyRound className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden md:inline">API Guide</span>
            </button>

            <button 
              onClick={() => setIsHelpOpen(true)}
              className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 p-1.5 sm:px-3 sm:py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-50 transition-all shrink-0 cursor-pointer"
              title="Help Center"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Help Center</span>
            </button>

            <button 
              onClick={() => setIsOrdersModalOpen(true)}
              className="text-xs text-slate-600 hover:text-slate-900 border border-slate-200 p-1.5 sm:px-3 sm:py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-50 transition-all shrink-0 cursor-pointer shadow-2xs font-semibold"
              title="View your orders and track live shipments"
            >
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">My Orders</span>
              {orders.length > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {orders.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-xs bg-red-600 hover:bg-red-700 text-white p-2 sm:px-4 sm:py-2 rounded-lg font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-xs relative shrink-0 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 sm:static bg-white text-red-600 text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-black animate-bounce shadow-xs sm:ml-1">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* User Session Quick Profile Badge */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden xl:block leading-tight">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[110px]">
                    {currentUser.displayName}
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-wider ${isAdmin ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isAdmin ? 'Corporate HQ' : 'Retailer'}
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all cursor-pointer"
                  title={`Signed in as ${currentUser.email}. Click to Logout.`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Inner Component Area */}
        <section className="flex-1 p-3 sm:p-6 overflow-y-auto relative bg-[#F8FAFC]">
          {/* Ambient decorative background grid */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <AnimatePresence mode="wait">
            {currentView === 'admin' ? (
              !isAdmin ? (
                <motion.div
                  key="unauthorized-admin-view"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="max-w-xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 text-center space-y-6 relative z-10"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
                    <ShieldAlert className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                      RBAC Access Barrier
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Admin Access Required
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                      You are currently signed in as <strong>{currentUser?.displayName || 'Customer'}</strong> ({currentUser?.email || 'Customer Account'}) with role <span className="font-mono text-emerald-700 font-bold uppercase">{currentUser?.role || 'user'}</span>.
                    </p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      The ACI Corporate HQ Admin Site includes category/subcategory creation, product pricing controls, and customer order status dispatching. These functions are restricted to authorized administrators.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5 text-left">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>How to access Admin Site:</span>
                    </div>
                    <p>
                      Log in using an Administrator account, such as <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold text-slate-800">admin@aci.com</code> or any registered admin email.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setCurrentView('catalog');
                        setCatalogDivision('ALL');
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Return to Customer Store
                    </button>
                    <button
                      onClick={() => logout()}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-500" />
                      <span>Sign In as Admin</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="max-w-7xl mx-auto h-full flex flex-col relative z-10"
                >
                  <AdminDashboard 
                    onSwitchToCustomerStore={() => {
                      setCurrentView('catalog');
                      setCatalogDivision('ALL');
                    }}
                    onOpenCustomerTracker={(order) => {
                      setTrackedOrder(order);
                    }}
                    onOpenApiKeyGuide={() => setIsApiKeyGuideOpen(true)}
                  />
                </motion.div>
              )
            ) : currentView === 'chat' ? (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="max-w-4xl mx-auto h-full flex flex-col justify-between relative z-10"
              >
                <div className="mb-4">
                  <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
                    {/* Animated colorful radial background glows */}
                    <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-red-600/10 blur-3xl pointer-events-none animate-pulse" />
                    <div className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
                    
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="p-2.5 bg-red-600 rounded-xl relative shadow-md shadow-red-900/30 shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-extrabold tracking-tight text-white flex items-center gap-2">
                          AI Customer Assistant
                          <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 font-mono text-[9px] uppercase tracking-widest border border-green-500/10 animate-pulse">
                            Active
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-0.5">
                          Discover medicines, agricultural supplies, and retail goods with instant smart ERP recommendations.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 relative z-10 shrink-0 self-end sm:self-auto">
                      {/* Interactive sound wave graphics to convey audio/ai process */}
                      <div className="flex items-end gap-0.5 h-4 px-2">
                        <span className="w-0.5 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.7s' }}></span>
                        <span className="w-0.5 h-3.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '0.9s' }}></span>
                        <span className="w-0.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '0.5s' }}></span>
                        <span className="w-0.5 h-3 bg-red-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '0.8s' }}></span>
                        <span className="w-0.5 h-2.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '0.6s' }}></span>
                      </div>
                      <div className="text-[10px] text-slate-300 bg-slate-800/80 border border-slate-700/50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono shadow-sm">
                        Model: Gemini 3.5 Flash Lite
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <ChatAssistant 
                    key={storageScope}
                    onAddToCart={handleAddToCart} 
                    cartItemsCount={cartItemsCount}
                    storageScope={storageScope}
                    onNavigateToCatalog={(product) => {
                      setCatalogDivision(product.division);
                      setCurrentView('catalog');
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="catalog"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="max-w-6xl mx-auto space-y-4 relative z-10"
              >
                {/* If filtered by division or business, show a friendly banner */}
                {(catalogDivision !== 'ALL' || catalogBusiness) && (
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white border border-red-500 rounded-2xl p-4 flex justify-between items-center shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                    <div>
                      <h3 className="font-extrabold text-sm text-white tracking-tight">
                        {catalogBusiness 
                          ? `Showing Business: ${catalogBusiness}`
                          : `Showing Division: ${catalogDivision}`}
                      </h3>
                      <p className="text-xs text-red-100 leading-relaxed mt-0.5">
                        {catalogBusiness
                          ? `You are browsing items produced by ${catalogBusiness} under ${catalogDivision.toLowerCase()} division.`
                          : `You are browsing standard, verified items under ${catalogDivision.toLowerCase()} division.`}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setCatalogDivision('ALL');
                        setCatalogBusiness(null);
                      }}
                      className="text-xs bg-white/20 hover:bg-white text-white hover:text-red-700 px-3.5 py-1.5 rounded-xl font-bold transition-all border border-white/10 shrink-0"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
                <ProductCatalog 
                  onAddToCart={handleAddToCart} 
                  cartItemsCount={cartItemsCount}
                  selectedDivision={catalogDivision}
                  onSelectDivision={setCatalogDivision}
                  selectedBusiness={catalogBusiness}
                  onSelectBusiness={setCatalogBusiness}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* MY ORDERS & SHIPMENT TRACKING MODAL */}
      {isOrdersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col animate-scale">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-50 rounded-xl text-red-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">My Orders & Shipments</h2>
                  <p className="text-xs text-slate-500">Track real-time dispatch, view receipts, and download invoices</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOrdersModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter pills */}
            <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
                {['All', 'Processing', 'In Transit', 'Only Delivered'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      statusFilter === status
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status === 'Only Delivered' ? 'Delivered' : status}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
              </span>
            </div>

            {/* Order items list */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">No orders found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {orders.length === 0 
                      ? 'You have not placed any orders yet. Browse our catalog or ask the AI assistant to add products to your cart!'
                      : 'No orders match your selected status filter.'}
                  </p>
                </div>
              ) : (
                filteredOrders.map((ord) => (
                  <div 
                    key={ord.id}
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-800">{ord.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ord.status === 'Delivered'
                            ? 'bg-green-100 text-green-700'
                            : ord.status === 'In Transit'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700 animate-pulse'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{ord.date}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <div>
                        <span>{ord.itemsCount} items</span>
                        <span className="mx-1.5 text-slate-300">•</span>
                        <span className="font-medium text-slate-700">{ord.division}</span>
                      </div>
                      <div className="text-sm font-extrabold text-red-600 font-mono">
                        ৳{ord.totalPrice.toLocaleString()} BDT
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          generateInvoicePDF(ord, currentProfile.name);
                        }}
                        className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-red-600" />
                        Invoice PDF
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setIsOrdersModalOpen(false);
                        }}
                        className="text-xs text-slate-700 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-white transition-all cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          setTrackedOrder(ord);
                          setIsOrdersModalOpen(false);
                        }}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Track Live
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsOrdersModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)}></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-300">
                <div className="flex h-full flex-col bg-white shadow-2xl border-l border-slate-200">
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2" id="slide-over-title">
                        <ShoppingCart className="w-5 h-5 text-red-600" />
                        Selected Order Cart
                      </h2>
                      <button 
                        onClick={() => setIsCartOpen(false)}
                        className="rounded-md text-slate-400 hover:text-slate-600 focus:outline-hidden"
                      >
                        <span className="sr-only">Close panel</span>
                        <Minus className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="mt-8">
                      {cart.length === 0 ? (
                        <div className="text-center py-16 space-y-4">
                          <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-300">
                            <ShoppingCart className="w-12 h-12" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-700">Your cart is empty</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                              Add products from the catalog or describe what you need to our AI Assistant to place items in your cart.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flow-root">
                          <ul role="list" className="-my-6 divide-y divide-slate-100">
                            {cart.map((item) => (
                              <li key={item.product.id} className="flex py-5">
                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-sm font-bold text-slate-800">
                                      <h3 className="line-clamp-1">{item.product.name}</h3>
                                      <p className="ml-4 font-mono">৳{(item.product.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                    <p className="mt-1 text-[11px] text-slate-400 uppercase font-bold">{item.product.division} • {item.product.unit}</p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-xs">
                                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 border border-slate-200">
                                      <button 
                                        onClick={() => handleUpdateQuantity(item.product.id, -1)}
                                        className="p-1 hover:bg-white rounded-md text-slate-500 hover:text-slate-800 transition-all"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="font-bold text-slate-700 px-1">{item.quantity}</span>
                                      <button 
                                        onClick={() => handleUpdateQuantity(item.product.id, 1)}
                                        className="p-1 hover:bg-white rounded-md text-slate-500 hover:text-slate-800 transition-all"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>

                                    <button 
                                      onClick={() => handleRemoveFromCart(item.product.id)}
                                      className="font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-red-50/50 transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {cart.length > 0 && (
                    <div className="border-t border-slate-200 px-4 py-6 sm:px-6 bg-slate-50">
                      <div className="flex justify-between text-base font-bold text-slate-800">
                        <p>Total Estimated Bill</p>
                        <p className="font-mono text-lg text-red-600">৳{totalCartPrice.toLocaleString()} BDT</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">Standard trade terms & prices calculated for {currentProfile.name}.</p>
                      
                      <div className="mt-6">
                        <button
                          onClick={handleOpenCheckout}
                          className="flex w-full items-center justify-center rounded-xl border border-transparent bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-red-700 transition-all focus:outline-hidden"
                        >
                          Place Order (Submit to ACI ERP)
                        </button>
                      </div>
                      <div className="mt-4 flex justify-center text-center text-xs text-slate-400">
                        <p>
                          or{' '}
                          <button
                            type="button"
                            className="font-bold text-red-600 hover:text-red-700"
                            onClick={() => setIsCartOpen(false)}
                          >
                            Continue Browsing
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HELP CENTER MODAL */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">ACI Customer Assistant Help Center</h2>
              </div>
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                Close
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-800">About ACI Customer Assistant</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ACI Customer Assistant is a professional product ordering and support platform for retail outlets, pharmacies, distributors, and agribusiness partners. It combines product discovery, order tracking, sales intelligence, and an AI customer assistant in one workspace.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800">AI Assistant Roles (How to Ask)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">1. Product Discovery</span>
                    <p className="text-xs text-slate-700 font-medium">"I need something to kill cockroaches"</p>
                    <p className="text-[11px] text-slate-400">Finds best matching verified products.</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">2. Smart Reorder Assistant</span>
                    <p className="text-xs text-slate-700 font-medium">"My shop is running low, what should I get?"</p>
                    <p className="text-[11px] text-slate-400">Tailors list to Pharmacy, Farm or Grocery.</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">3. Order Support Chatbot</span>
                    <p className="text-xs text-slate-700 font-medium">"What works best for maize fertilizer?"</p>
                    <p className="text-[11px] text-slate-400">Answers specs, ingredients, and store outlets.</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-rose-600 uppercase">4. Quantity Advisor</span>
                    <p className="text-xs text-slate-700 font-medium">"How much salt should I order for 30 days?"</p>
                    <p className="text-[11px] text-slate-400">Asks follow-ups and provides accurate volume forecasts.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-2">
                <h4 className="font-bold text-xs text-slate-700">Corporate Divisions Summary:</h4>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                  <li><strong>Pharmaceuticals:</strong> Generics, cardiovasculars, diabetes management, biosimilars (Epo-ACI).</li>
                  <li><strong>Consumer Brands:</strong> Savlon range, ACI Aerosol, Pure flour, Miniket rice, iodized salt, spices, LED lights.</li>
                  <li><strong>Agribusiness:</strong> Hybrid seeds, crop protection chemicals, Sonalika/Yanmar machines, livestock feed.</li>
                  <li><strong>Shwapno Retail:</strong> Direct fresh produce, premium organic groceries, clothing.</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="bg-slate-800 text-white rounded-lg px-4 py-2 text-xs font-bold transition-all"
              >
                Acknowledge & Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT DELIVERY & PAYMENT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-red-600 p-6 text-white space-y-1 shrink-0">
              <h2 className="text-xl font-extrabold tracking-tight text-white">ACI Checkout & Delivery</h2>
              <p className="text-xs text-red-100">Specify your shipping destination, address, and preferred payment method below.</p>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* 1. Address Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Shipping Address
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-red-500 focus:bg-white transition-all leading-relaxed"
                  placeholder="Enter full shipping address..."
                />
              </div>

              {/* 2. Delivery Location Select */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Delivery Region / Corporate Point
                </label>
                
                {/* Standard Shipping */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Standard Shipping</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryLocation('inside')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        deliveryLocation === 'inside'
                          ? 'border-red-600 bg-red-50/40 text-red-900 ring-1 ring-red-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold">Inside Dhaka</span>
                      <span className="text-[10px] text-slate-500 mt-1 font-mono font-bold">Charge: ৳100 BDT</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setDeliveryLocation('outside')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        deliveryLocation === 'outside'
                          ? 'border-red-600 bg-red-50/40 text-red-900 ring-1 ring-red-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold">Outside Dhaka</span>
                      <span className="text-[10px] text-slate-500 mt-1 font-mono font-bold">Charge: ৳200 BDT</span>
                    </button>
                  </div>
                </div>

                {/* Free Corporate Delivery Points */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Corporate Free Delivery</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.2 rounded border border-emerald-200">100% FREE</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'aci-centre', name: 'ACI Centre', address: 'ACI Centre, 245 Tejgaon Industrial Area, Dhaka' },
                      { id: 'nobo-tower', name: 'Nobo Tower', address: 'Nobo Tower, 206/A Tejgaon Industrial Area, Dhaka' },
                      { id: 'santa-forum', name: 'Santa Forum', address: 'Santa Forum, Tejgaon, Dhaka' },
                      { id: 'police-plaza', name: 'Police Plaza', address: 'Police Plaza Concord, Gulshan 1, Dhaka' }
                    ].map((cp) => (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => {
                          setDeliveryLocation(cp.id);
                          setShippingAddress(cp.address);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          deliveryLocation === cp.id
                            ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold truncate">{cp.name}</span>
                        <span className="text-[9px] text-emerald-600 font-bold mt-1 uppercase">৳0 BDT (Free)</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Method of Payment
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'bKash', name: 'bKash', desc: 'Mobile Wallet', color: 'bg-rose-500' },
                    { id: 'COD', name: 'Cash on Delivery', desc: 'Pay on Arrival', color: 'bg-amber-600' },
                    { id: 'Bank', name: 'Bank Transfer', desc: 'Electronic EFT', color: 'bg-blue-600' },
                    { id: 'Card', name: 'Card Payment', desc: 'Visa / Mastercard', color: 'bg-emerald-600' }
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        paymentMethod === pm.id
                          ? 'border-red-600 bg-red-50/40 text-red-950 ring-1 ring-red-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${pm.color} shrink-0`} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">{pm.name}</span>
                        <span className="text-[9px] text-slate-400">{pm.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Pricing Math */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Product Subtotal</span>
                  <span className="font-mono font-medium text-slate-700">৳{totalCartPrice.toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Delivery Fee ({getDeliveryLocationLabel(deliveryLocation)})</span>
                  <span className="font-mono font-medium text-slate-700">
                    {getDeliveryCharge(deliveryLocation) === 0 ? 'FREE' : `৳${getDeliveryCharge(deliveryLocation).toLocaleString()} BDT`}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Total Bill Cost</span>
                  <span className="text-sm font-extrabold text-red-600 font-mono">
                    ৳{(totalCartPrice + getDeliveryCharge(deliveryLocation)).toLocaleString()} BDT
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsCartOpen(true);
                }}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all text-center"
              >
                Back to Cart
              </button>
              <button
                type="button"
                onClick={handleFinalCheckoutSubmit}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-bold transition-all text-center shadow-xs"
              >
                Confirm & Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT SUCCESS MODAL */}
      {isCheckoutSuccess && lastOrderSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale my-8 flex flex-col md:flex-row">
            {/* LEFT COLUMN: Receipt summary */}
            <div className="w-full md:w-1/2 flex flex-col border-r border-slate-100">
              <div className="bg-red-600 p-6 text-center text-white space-y-2 shrink-0">
                <div className="inline-flex p-3 rounded-full bg-white/20 text-white mb-1">
                  <Check className="w-7 h-7 font-black text-white" />
                </div>
                <h2 className="text-lg font-extrabold tracking-tight text-white">Order Placed Successfully!</h2>
                <p className="text-[11px] text-red-100">Your order has been routed and submitted to ACI PLC ERP.</p>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Order Reference</span>
                    <span className="font-mono font-bold text-slate-700">{lastOrderSummary.id}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Client Store</span>
                    <span className="font-bold text-slate-700">{currentProfile.name}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Authorized Division</span>
                    <span className="font-bold text-slate-700">{lastOrderSummary.division}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Delivery Region</span>
                    <span className="font-bold text-slate-700">
                      {getDeliveryLocationLabel(lastOrderSummary.deliveryLocation)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Shipping Address</span>
                    <span className="font-bold text-slate-700 max-w-[180px] truncate text-right" title={lastOrderSummary.shippingAddress}>
                      {lastOrderSummary.shippingAddress}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Method of Payment</span>
                    <span className="font-bold text-slate-700 uppercase">
                      {lastOrderSummary.paymentMethod === 'Bank' 
                        ? 'Bank Transfer' 
                        : lastOrderSummary.paymentMethod === 'COD' 
                        ? 'Cash on Delivery' 
                        : lastOrderSummary.paymentMethod === 'Card' 
                        ? 'Card Payment' 
                        : lastOrderSummary.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Delivery Charge</span>
                    <span className="font-bold text-slate-700 font-mono">৳{(lastOrderSummary.deliveryCharge || 0).toLocaleString()} BDT</span>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Total Charged Bill</span>
                    <span className="text-sm font-extrabold text-red-600 font-mono">৳{lastOrderSummary.totalPrice.toLocaleString()} BDT</span>
                  </div>
                </div>

                {/* Items in this order */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Order Items ({lastOrderSummary.items.length})</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {lastOrderSummary.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs bg-slate-50 border border-slate-100 p-2 rounded-lg">
                        <span className="text-slate-700 font-medium">{item.product.name}</span>
                        <span className="font-bold text-slate-500 text-[10px]">৳{item.product.price} × {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2 shrink-0">
                <button 
                  onClick={() => {
                    setTrackedOrder(lastOrderSummary);
                    setIsCheckoutSuccess(false);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Truck className="w-4 h-4" />
                  Track Order Live
                </button>
                <button 
                  type="button"
                  onClick={() => generateInvoicePDF(lastOrderSummary, currentProfile.name)}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Download order summary as formatted ACI PDF invoice"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  Invoice PDF
                </button>
                <button 
                  onClick={() => {
                    setIsCheckoutSuccess(false);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Notified Representatives & Dispatch log */}
            <div className="w-full md:w-1/2 p-6 flex flex-col bg-slate-50/30 overflow-y-auto max-h-[600px] md:max-h-[650px]">
              <OrderRepresentativesPanel
                orderId={lastOrderSummary.id}
                items={lastOrderSummary.items}
                storeName={currentProfile.name}
                shippingAddress={lastOrderSummary.shippingAddress || ''}
                onShowToast={(msg) => setToastMessage(msg)}
              />
            </div>
          </div>
        </div>
      )}

      {/* PAST ORDER DETAILS MODAL WITH DISPATCH CONTROLS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale my-8 flex flex-col md:flex-row">
            {/* LEFT COLUMN: Receipt summary */}
            <div className="w-full md:w-1/2 flex flex-col border-r border-slate-100">
              <div className="bg-slate-800 p-6 text-center text-white space-y-2 shrink-0 relative">
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="absolute right-4 top-4 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="inline-flex p-3 rounded-full bg-white/10 text-white mb-1">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-lg font-extrabold tracking-tight text-white">Order Details & History</h2>
                <p className="text-[11px] text-slate-300">Viewing archived transaction reference: {selectedOrder.id}</p>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Order Reference</span>
                    <span className="font-mono font-bold text-slate-700">{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Client Store</span>
                    <span className="font-bold text-slate-700">{currentProfile.name}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Order Division</span>
                    <span className="font-bold text-slate-700">{selectedOrder.division}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Delivery Location</span>
                    <span className="font-bold text-slate-700">
                      {getDeliveryLocationLabel(selectedOrder.deliveryLocation)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Shipping Address</span>
                    <span className="font-bold text-slate-700 max-w-[180px] truncate text-right" title={selectedOrder.shippingAddress}>
                      {selectedOrder.shippingAddress || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Method of Payment</span>
                    <span className="font-bold text-slate-700 uppercase">
                      {selectedOrder.paymentMethod === 'Bank' 
                        ? 'Bank Transfer' 
                        : selectedOrder.paymentMethod === 'COD' 
                        ? 'Cash on Delivery' 
                        : selectedOrder.paymentMethod === 'Card' 
                        ? 'Card Payment' 
                        : selectedOrder.paymentMethod || 'bKash'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Delivery Charge</span>
                    <span className="font-bold text-slate-700 font-mono">৳{(selectedOrder.deliveryCharge || 0).toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Order Date</span>
                    <span className="font-bold text-slate-700">{selectedOrder.date}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>System Status</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      selectedOrder.status === 'Delivered' 
                        ? 'bg-green-100 text-green-700' 
                        : selectedOrder.status === 'In Transit' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Total Charged Bill</span>
                    <span className="text-base font-extrabold text-red-600 font-mono">৳{selectedOrder.totalPrice.toLocaleString()} BDT</span>
                  </div>
                </div>

                {/* Items in this order */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Order Items ({selectedOrder.items.length})</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs bg-slate-50 border border-slate-100 p-2 rounded-lg">
                        <span className="text-slate-700 font-medium">{item.product.name}</span>
                        <span className="font-bold text-slate-500 text-[10px]">৳{item.product.price} × {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2 shrink-0">
                <button 
                  onClick={() => {
                    setTrackedOrder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Truck className="w-4 h-4" />
                  Track Live Delivery
                </button>
                <button 
                  type="button"
                  onClick={() => generateInvoicePDF(selectedOrder, currentProfile.name)}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Download order summary as formatted ACI PDF invoice"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  Invoice PDF
                </button>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Notified Representatives & Dispatch log */}
            <div className="w-full md:w-1/2 p-6 flex flex-col bg-slate-50/30 overflow-y-auto max-h-[600px] md:max-h-[650px]">
              <OrderRepresentativesPanel
                orderId={selectedOrder.id}
                items={selectedOrder.items}
                storeName={currentProfile.name}
                shippingAddress={selectedOrder.shippingAddress || 'Store Registration Address'}
                onShowToast={(msg) => setToastMessage(msg)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Live Order GPS Map and Timeline Tracker Overlay */}
      <AnimatePresence>
        {trackedOrder && (
          <OrderDeliveryTracker
            order={trackedOrder}
            onClose={() => setTrackedOrder(null)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}
      </AnimatePresence>

      {/* USER PROFILE CREATION & EDIT MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="bg-[#0F172A] p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold tracking-tight">
                  {profileEditingIndex !== null ? "Edit User Profile Info" : "Create New User ID"}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {profileEditingIndex !== null ? `Profile: ${currentProfile?.id}` : "Configure a new business profile context"}
                </p>
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileSubmit} className="p-5 space-y-4">
              {/* Business Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Store / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhaka Medical Hall"
                  value={modalProfileName}
                  onChange={(e) => setModalProfileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-red-500 font-medium"
                />
              </div>

              {/* Business Profile Type & Area */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Profile Type
                  </label>
                  <select
                    value={modalProfileType}
                    onChange={(e) => setModalProfileType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-bold"
                  >
                    <option value="pharmacy">Pharmacy</option>
                    <option value="farm">Agro / Farm</option>
                    <option value="grocery">Grocery Store</option>
                    <option value="general">General Retailer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Location Area *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka (Mirpur)"
                    value={modalProfileLocation}
                    onChange={(e) => setModalProfileLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-red-500 font-medium"
                  />
                </div>
              </div>

              {/* Retailer Representative Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Retailer Owner Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mohammad Ali"
                  value={modalProfileRetailerName}
                  onChange={(e) => setModalProfileRetailerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-red-500 font-medium"
                />
              </div>

              {/* Owner Contact Phone */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 017XXXXXXXX"
                  value={modalProfilePhone}
                  onChange={(e) => setModalProfilePhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-red-500 font-medium"
                />
              </div>

              {/* Detailed Shipping Address */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Detailed Shipping Address
                </label>
                <textarea
                  placeholder="Detailed road, sector, holding number..."
                  value={modalProfileShippingAddress}
                  onChange={(e) => setModalProfileShippingAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-red-500 font-medium"
                />
              </div>

              {/* Form buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                >
                  {profileEditingIndex !== null ? "Save Changes" : "Create Profile"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Dynamic Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-slide-up max-w-sm">
          <div className="p-1.5 bg-green-500 rounded-lg text-white">
            <Check className="w-4 h-4 font-black" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider leading-none">Simulation Action</p>
            <p className="text-xs text-slate-100 mt-1">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Global API Key & Security Architecture Modal */}
      <ApiKeyGuideModal 
        isOpen={isApiKeyGuideOpen}
        onClose={() => setIsApiKeyGuideOpen(false)}
      />
    </div>
  );
}
