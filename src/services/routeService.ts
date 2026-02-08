import { supabase } from '@/lib/supabase';
import type { Route } from '@/lib/supabase';

export interface RouteOption {
  id: string;
  from: string;
  to: string;
  steps: RouteStep[];
  totalTime: number;
  crowdLevel: 'low' | 'moderate' | 'high';
  fare: number;
  timeSaved?: number;
}

export interface RouteStep {
  type: 'train' | 'metro' | 'walk';
  line?: string;
  from: string;
  to: string;
  platform?: string;
  duration: number;
  crowdLevel?: 'low' | 'moderate' | 'high';
}

export const routeService = {
  // Get all available routes
  async getRoutes(): Promise<Route[]> {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .order('from_station', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get route suggestions between stations
  async getRouteSuggestions(from: string, to: string): Promise<RouteOption[]> {
    // Get crowd data for current conditions
    const { data: crowdData } = await supabase
      .from('crowd_data')
      .select('*')
      .gte('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    // Build route options based on available routes
    const { data: routes } = await supabase
      .from('routes')
      .select('*')
      .or(`from_station.eq.${from},to_station.eq.${to}`);

    // Generate route options with crowd data
    const options: RouteOption[] = [];

    // Direct route option
    const directRoute = routes?.find(r => r.from_station === from && r.to_station === to);
    if (directRoute) {
      const lineCrowd = crowdData?.filter(c => c.line === directRoute.line);
      const avgCrowd = lineCrowd?.length 
        ? lineCrowd.reduce((acc, c) => acc + (c.passenger_count / c.capacity), 0) / lineCrowd.length
        : 0.5;

      options.push({
        id: `direct-${directRoute.id}`,
        from: directRoute.from_station,
        to: directRoute.to_station,
        steps: [{
          type: 'train',
          line: directRoute.line,
          from: directRoute.from_station,
          to: directRoute.to_station,
          duration: directRoute.duration_minutes,
          crowdLevel: avgCrowd > 0.7 ? 'high' : avgCrowd > 0.4 ? 'moderate' : 'low',
        }],
        totalTime: directRoute.duration_minutes,
        crowdLevel: avgCrowd > 0.7 ? 'high' : avgCrowd > 0.4 ? 'moderate' : 'low',
        fare: directRoute.base_fare,
      });
    }

    // Alternate route via metro (if available)
    const metroRoute = await this.getMetroAlternative(from, to);
    if (metroRoute) {
      options.push(metroRoute);
    }

    // Sort by time and crowd level
    return options.sort((a, b) => {
      const crowdWeight = { low: 0, moderate: 10, high: 20 };
      const scoreA = a.totalTime + crowdWeight[a.crowdLevel];
      const scoreB = b.totalTime + crowdWeight[b.crowdLevel];
      return scoreA - scoreB;
    });
  },

  // Get metro alternative route
  async getMetroAlternative(from: string, to: string): Promise<RouteOption | null> {
    // Check if metro connection exists
    const { data: metroConnections } = await supabase
      .from('metro_stations')
      .select('*')
      .or(`name.ilike.%${from}%,name.ilike.%${to}%`);

    if (!metroConnections || metroConnections.length < 2) return null;

    // Build metro route
    return {
      id: `metro-${from}-${to}`,
      from,
      to,
      steps: [
        { type: 'walk', from: `${from} Station`, to: 'Metro Station', duration: 5 },
        { type: 'metro', line: 'Metro Line 3', from: 'Metro Station', to: `${to} Metro`, duration: 25, crowdLevel: 'low' },
        { type: 'walk', from: `${to} Metro`, to: `${to} Station`, duration: 5 },
      ],
      totalTime: 35,
      crowdLevel: 'low',
      fare: 45,
      timeSaved: 10,
    };
  },

  // Get all stations
  async getStations(): Promise<string[]> {
    const { data, error } = await supabase
      .from('stations')
      .select('name')
      .order('name', { ascending: true });

    if (error) throw error;
    return data?.map(s => s.name) || [];
  },

  // Get supported lines
  async getLines(): Promise<{ name: string; type: string; color: string }[]> {
    return [
      { name: 'Western Line', type: 'suburban', color: '#00F0FF' },
      { name: 'Central Line', type: 'suburban', color: '#F59E0B' },
      { name: 'Harbour Line', type: 'suburban', color: '#10B981' },
      { name: 'Metro Line 1', type: 'metro', color: '#8B5CF6' },
      { name: 'Metro Line 3', type: 'metro', color: '#EC4899' },
    ];
  },
};
