// ============================================================
// AutoPro Parts - TypeScript Types
// ============================================================

export type UserRole = 'customer' | 'admin'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed'
export type PaymentMethod = 'promptpay' | 'card' | 'cod' | 'bank_transfer'
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type PointsType = 'earn' | 'redeem' | 'expire' | 'bonus' | 'refund'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  address_line: string
  district: string | null
  province: string
  postal_code: string
  is_default: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  name_en: string | null
  icon: string | null
  description: string | null
  slug: string
  sort_order: number
  is_active: boolean
  product_count?: number
}

export interface Product {
  id: string
  name: string
  name_en: string | null
  slug: string
  sku: string
  category_id: string
  category?: Category
  brand: string
  description: string | null
  price: number
  compare_price: number | null
  cost_price: number | null
  stock_qty: number
  low_stock_threshold: number
  images: string[]
  specifications: Record<string, string>
  compatible_cars: string[]
  is_active: boolean
  is_featured: boolean
  sold_count: number
  rating_avg: number
  rating_count: number
  created_at: string
  updated_at: string
}

export interface ProductReview {
  id: string
  product_id: string
  user_id: string | null
  reviewer_name: string
  rating: number
  title: string | null
  body: string | null
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  product?: Product
  quantity: number
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  profile?: Profile
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod | null
  payment_ref: string | null
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_province: string
  shipping_postal_code: string
  shipping_fee: number
  tracking_number: string | null
  subtotal: number
  discount_amount: number
  total: number
  points_earned: number
  points_used: number
  coupon_code: string | null
  notes: string | null
  items?: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product?: Product
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface LoyaltyPoints {
  id: string
  user_id: string
  total_points: number
  available_points: number
  lifetime_points: number
  tier: LoyaltyTier
  updated_at: string
}

export interface PointsTransaction {
  id: string
  user_id: string
  order_id: string | null
  type: PointsType
  points: number
  description: string | null
  expires_at: string | null
  created_at: string
}

export interface Reward {
  id: string
  name: string
  description: string | null
  icon: string | null
  points_required: number
  reward_type: string
  reward_value: Record<string, unknown>
  stock_qty: number
  is_active: boolean
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  type: 'percent' | 'fixed' | 'free_shipping'
  value: number
  min_order_amount: number
  max_discount: number | null
  usage_limit: number | null
  used_count: number
  is_active: boolean
  expires_at: string | null
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Dashboard stats
export interface DashboardStats {
  today_revenue: number
  today_orders: number
  low_stock_count: number
  new_customers_month: number
  revenue_change: number
  orders_change: number
  monthly_revenue: MonthlyRevenue[]
  top_products: TopProduct[]
  recent_orders: Order[]
  category_sales: CategorySales[]
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  orders: number
}

export interface TopProduct {
  product: Product
  sold_count: number
  revenue: number
}

export interface CategorySales {
  category: string
  percentage: number
  revenue: number
}

// Cart / Checkout
export interface CheckoutData {
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_province: string
  shipping_postal_code: string
  payment_method: PaymentMethod
  coupon_code?: string
  points_to_use?: number
  notes?: string
}
