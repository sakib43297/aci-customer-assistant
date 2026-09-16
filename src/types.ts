export type Division = 
  | 'PHARMACEUTICALS & HEALTHCARE' 
  | 'AGRIBUSINESS' 
  | 'CONSUMER BRANDS & FOODS' 
  | 'RETAIL & LOGISTICS' 
  | 'CROP CARES' 
  | 'TECHNOLOGY, COMMUNICATION & SERVICES';

export type AvailabilityStatus = 
  | 'In Stock' 
  | 'Low Stock' 
  | 'Out of Stock' 
  | 'Pre-order' 
  | 'Discontinued';

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  division?: Division;
  description?: string;
  subcategories: Subcategory[];
}

export interface Product {
  id: string;
  name: string;
  division: Division;
  category: string;
  subcategory?: string;
  description: string;
  price: number; // in BDT (Bangladeshi Taka)
  discountPrice?: number; // if applicable
  stockQuantity?: number;
  sku?: string;
  availabilityStatus?: AvailabilityStatus;
  unit: string;
  useCase?: string;
  image?: string;
  additionalImages?: string[];
  business?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  productIds?: string[];
}

export type OrderStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Processing' 
  | 'Shipped' 
  | 'Delivered' 
  | 'Cancelled' 
  | 'In Transit';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  itemsCount: number;
  division: string;
  status: OrderStatus;
  totalPrice: number;
  subtotalPrice?: number;
  date: string;
  createdAt?: Date | string;
  items: CartItem[];
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  retailerName?: string;
  businessName?: string;
  businessType?: string;
  shippingAddress?: string;
  deliveryLocation?: string;
  deliveryCharge?: number;
  paymentMethod?: 'bKash' | 'COD' | 'Bank' | 'Card' | string;
  paymentStatus?: 'Paid' | 'Pending' | 'Cash on Delivery' | string;
  statusHistory?: OrderStatusHistoryItem[];
  adminNotes?: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  type: 'pharmacy' | 'farm' | 'grocery' | 'general';
  location: string;
  retailerName?: string;
  phone?: string;
  shippingAddress?: string;
  savedBaskets?: { id: string; name: string; items: CartItem[]; date: string }[];
  purchaseHistory?: Order[];
}

export interface ReorderRecommendation {
  product: Product;
  reason: string;
  suggestedQty: number;
}

export type UserRole = 'admin' | 'user';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  businessName?: string;
  businessType?: 'pharmacy' | 'farm' | 'grocery' | 'general' | 'corporate';
  location?: string;
  photoURL?: string;
  createdAt?: string;
}

