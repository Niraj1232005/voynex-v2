// ============================================================
// VOYNEX - Type Definitions
// ============================================================

export type Role = 'user' | 'agency' | 'admin' | 'platform_admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  organization_id?: string;
  preferences?: UserPreferences;
  createdAt: string;
}

export interface UserPreferences {
  favoriteDestinations: string[];
  travelStyle: 'budget' | 'mid-range' | 'luxury';
  interests: string[];
}

export interface Trip {
  _id: string;
  title: string;
  destination: string;
  description: string;
  price: number;
  duration: number; // in days
  images: string[];
  activityType: string[];
  highlights: string[];
  itinerary: ItineraryDay[];
  agency: { _id: string; name: string };
  organization_id: string;
  rating: number;
  reviewCount: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  included: string[];
  excluded: string[];
  startDates: string[];
  createdAt: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface Booking {
  _id: string;
  trip: Trip;
  user: string;
  startDate: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentId?: string;
  groupComposition?: GroupComposition;
  createdAt: string;
}

export interface GroupComposition {
  adults: number;
  children: number;
  seniors: number;
}

export interface Review {
  _id: string;
  trip: string;
  user: { _id: string; name: string; avatar?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'jackets' | 'accessories' | 'gear' | 'electronics' | 'bags';
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Rental {
  _id: string;
  name: string;
  type: 'bike' | 'scooty' | 'car' | 'gopro';
  pricePerDay: number;
  location: string;
  images: string[];
  available: boolean;
  description: string;
  features: string[];
}

export interface PackingItem {
  id: string;
  item: string;
  category: string;
  checked: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  trips?: any[];
  timestamp: Date;
}

export interface AITripPlan {
  destination: string;
  duration: number;
  budget: number;
  groupComposition: GroupComposition;
  interests: string[];
  itinerary: ItineraryDay[];
  estimatedCost: number;
  tips: string[];
  accommodationSuggestions: string[];
}

export interface AgencyStats {
  totalTrips: number;
  totalBookings: number;
  revenue: number;
  averageRating: number;
  activeTrips: number;
  inactiveTrips: number;
  monthlyBookings: { month: string; count: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  topTrips: { name: string; bookings: number; revenue: number }[];
}

export interface AdminStats {
  totalUsers: number;
  totalAgencies: number;
  totalTrips: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: Booking[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  avatar?: string;
  joinedAt: string;
  status: 'active' | 'invited';
}

export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  maxTrips: number;
  analyticsAccess: boolean;
  teamMembers: number;
  rentalsAccess: boolean;
  prioritySupport: boolean;
  features: string[];
}

export interface AgencyRental {
  _id: string;
  name: string;
  type: 'bike' | 'scooty' | 'car' | 'gopro';
  pricePerDay: number;
  location: string;
  images: string[];
  available: boolean;
  description: string;
  features: string[];
  linkedTripIds: string[];
  organization_id: string;
}

export interface AgencyBooking extends Booking {
  userName: string;
  userEmail: string;
  userPhone?: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  notes?: string;
}
