import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Ticket {
  id: string;
  user_id: string;
  type: 'single' | 'return' | 'daily' | 'monthly';
  line: string;
  from_station: string;
  to_station: string;
  qr_code: string;
  valid_until: string;
  status: 'active' | 'used' | 'expired';
  created_at: string;
  used_at?: string;
}

export interface CrowdData {
  id: string;
  line: string;
  train_number: string;
  direction: string;
  coach_number: number;
  occupancy_level: 'low' | 'moderate' | 'high';
  passenger_count: number;
  capacity: number;
  platform: string;
  next_arrival: string;
  updated_at: string;
}

export interface Route {
  id: string;
  from_station: string;
  to_station: string;
  line: string;
  distance_km: number;
  base_fare: number;
  duration_minutes: number;
}

export interface Alert {
  id: string;
  type: 'crowd' | 'delay' | 'disruption' | 'safety';
  message: string;
  line?: string;
  station?: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
  expires_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}
