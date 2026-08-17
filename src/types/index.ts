export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PostItem {
  id: string
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  isPinned: boolean
  isFeatured: boolean
  isClosed: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  tags?: string[]
  author: UserItem
  category: CategoryItem
  createdAt: string
  updatedAt: string
}

export interface UserItem {
  id: string
  username: string
  nickname?: string
  avatar?: string
  bio?: string
  role: string
  title?: string
  badge?: string
  points: number
  level: number
  postCount: number
  createdAt: string
}

export interface CategoryItem {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  postCount?: number
}

export interface CommentItem {
  id: string
  content: string
  likeCount: number
  author: UserItem
  replies?: CommentItem[]
  createdAt: string
}

export interface ProductItem {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  images?: string[]
  category?: string
  gameName?: string
  stock: number
  sales: number
  status: string
  seller: UserItem
  createdAt: string
}

export interface OrderItem {
  id: string
  orderNo: string
  quantity: number
  totalAmount: number
  status: string
  refundStatus: string
  product: ProductItem
  buyer: UserItem
  seller: UserItem
  createdAt: string
}

export interface NotificationItem {
  id: string
  type: string
  title: string
  content?: string
  isRead: boolean
  createdAt: string
}

export interface MessageItem {
  id: string
  content: string
  type: string
  isRead: boolean
  sender: UserItem
  receiver: UserItem
  createdAt: string
}

export interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  logo: string
  favicon: string
  primaryColor: string
  secondaryColor: string
  welcomeTitle: string
  welcomeMessage: string
  headerHtml: string
  footerHtml: string
  registrationEnabled: boolean
  inviteOnly: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
}
