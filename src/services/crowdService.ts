import { supabase } from '@/lib/supabase';
import type { CrowdData, Alert } from '@/lib/supabase';

export const crowdService = {
  // Get current crowd data for all lines
  async getCrowdData(line?: string): Promise<CrowdData[]> {
    let query = supabase
      .from('crowd_data')
      .select('*')
      .order('updated_at', { ascending: false });

    if (line) {
      query = query.eq('line', line);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get crowd data by train
  async getTrainCrowd(trainNumber: string): Promise<CrowdData[]> {
    const { data, error } = await supabase
      .from('crowd_data')
      .select('*')
      .eq('train_number', trainNumber)
      .order('coach_number', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Subscribe to real-time crowd updates
  subscribeToCrowdUpdates(callback: (data: CrowdData) => void) {
    return supabase
      .channel('crowd_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crowd_data' },
        (payload) => {
          callback(payload.new as CrowdData);
        }
      )
      .subscribe();
  },

  // Get active alerts
  async getActiveAlerts(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Subscribe to alerts
  subscribeToAlerts(callback: (alert: Alert) => void) {
    return supabase
      .channel('alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          callback(payload.new as Alert);
        }
      )
      .subscribe();
  },

  // Get network stats for admin dashboard
  async getNetworkStats() {
    const { data: activeTrains, error: trainsError } = await supabase
      .from('crowd_data')
      .select('train_number')
      .gte('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    if (trainsError) throw trainsError;

    const uniqueTrains = new Set(activeTrains?.map(t => t.train_number)).size;

    const { data: avgOccupancy, error: occError } = await supabase
      .rpc('get_average_occupancy');

    if (occError) throw occError;

    const { data: incidents, error: incError } = await supabase
      .from('alerts')
      .select('*')
      .eq('type', 'disruption')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (incError) throw incError;

    return {
      activeTrains: uniqueTrains,
      avgOccupancy: avgOccupancy || 0,
      incidents: incidents?.length || 0,
    };
  },
};
