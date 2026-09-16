// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number
  name: string
  email: string
  role: string
}

export interface AuthResponse {
  userId: number
  token: string
  name: string
  email: string
  role: string
  expiresAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone?: string
}

export interface OtpSendRequest {
  phone: string
}

export interface OtpVerifyRequest {
  phone: string
  otp: string
}

export interface FirebaseLoginRequest {
  idToken: string
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: number | null
  isActive: boolean
  showOnHomepage?: boolean
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface ProductListItem {
  id: number
  name: string
  price: number
  discountedPrice?: number
  defaultImageUrl?: string
  categoryName: string
  fabric: string
  color: string
  state?: string
  averageRating?: number
  reviewCount?: number
}

export interface Review {
  id: number
  productId: number
  userId: number
  userName: string
  rating: number
  title?: string
  body: string
  isApproved: boolean
  createdAt: string
}

export interface CreateReviewRequest {
  productId: number
  rating: number
  title?: string
  body: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  discountedPrice?: number
  stockQuantity: number
  fabric: string
  color: string
  hasBlousePiece: boolean
  careInstructions?: string
  deliveryDays: number
  categoryName: string
  imageUrls: string[]
  defaultImageUrl?: string
}

export interface ProductFilters {
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  color?: string
  fabric?: string
  state?: string
  sortBy?: string
  minRating?: number
  featured?: boolean
  page?: number
  pageSize?: number
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: number
  productId: number
  productName: string
  imageUrl?: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface Cart {
  id: number
  items: CartItem[]
  total: number
}

export interface AddToCartRequest {
  productId: number
  quantity: number
}

// ─── Wishlist ────────────────────────────────────────────────────────────────

export interface WishlistItem {
  productId: number
  productName: string
  imageUrl?: string
  price: number
}

// ─── Address ─────────────────────────────────────────────────────────────────

export interface Address {
  id: number
  userId: number
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
}

export interface AddressRequest {
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault?: boolean
}

// ─── Order ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: number
  productName: string
  imageUrl?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: number
  itemCount?: number
  totalAmount: number
  discountAmount: number
  shippingFee: number
  finalAmount: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  awbCode?: string
  deliveredAt?: string
  createdAt: string
  deliveryName?: string
  deliveryPhone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  pincode?: string
  items: OrderItem[]
}

export interface PlaceOrderRequest {
  addressId: number
  paymentMethod: string
  couponCode?: string
  shippingFee: number
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface RazorpayOrderResponse {
  razorpayOrderId: string
  amount: number
  currency: string
  keyId: string
}

export interface VerifyPaymentRequest {
  orderId: number
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

// ─── Returns ─────────────────────────────────────────────────────────────────

export interface ReturnRequest {
  id: number
  orderId: number
  userId: number
  userName: string
  reason: string
  description?: string
  status: 'Pending' | 'Approved' | 'Rejected'
  adminNote?: string
  createdAt: string
  updatedAt?: string
}

// ─── Shipping ────────────────────────────────────────────────────────────────

export interface ServiceabilityResponse {
  serviceable: boolean
}

export interface TrackingEvent {
  activity: string
  location: string
  date: string
}

export interface TrackingInfo {
  awbCode: string
  currentStatus: string
  events: TrackingEvent[]
}

// ─── Razorpay global (loaded from CDN in index.html) ─────────────────────────

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  order_id: string
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  handler: (response: RazorpayPaymentResponse) => void
  modal?: { ondismiss?: () => void }
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface RazorpayInstance {
  open(): void
}
