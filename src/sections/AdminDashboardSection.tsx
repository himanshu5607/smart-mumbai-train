import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  QrCode,
  RefreshCcw,
  Ticket,
  Train,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/AuthContext';
import type { Ticket as TicketType } from '@/lib/supabase';

gsap.registerPlugin(ScrollTrigger);

interface AdminDashboardSectionProps {
  className?: string;
  onScanClick?: () => void;
  lastScanResult?: { valid: boolean; ticket?: TicketType; message: string } | null;
}

interface AdminMetrics {
  totalTickets: number;
  ticketsToday: number;
  activeTickets: number;
  avgOccupancy: number;
  incidents: number;
  activeTrains: number;
}

interface ChartPoint {
  hour: string;
  value: number;
}

interface LineStat {
  name: string;
  value: number;
  count?: number;
  color: string;
}

const LINE_COLORS = [
  '#00F0FF',
  '#F59E0B',
  '#10B981',
  '#8B5CF6',
  '#EC4899',
  '#EF4444',
  '#22D3EE',
  '#F97316',
];

const buildTimeBuckets = (tickets: { created_at?: string | null }[]) => {
  const bucketHours = 3;
  const bucketCount = 8;
  const bucketMs = bucketHours * 60 * 60 * 1000;
  const now = new Date();
  const start = new Date(now.getTime() - bucketCount * bucketMs);
  start.setMinutes(0, 0, 0);

  const buckets: Array<ChartPoint & { start: number }> = Array.from(
    { length: bucketCount },
    (_, index) => {
      const bucketStart = start.getTime() + index * bucketMs;
      const label = new Date(bucketStart).toLocaleTimeString([], {
        hour: 'numeric',
        hour12: true,
      });
      return { hour: label, value: 0, start: bucketStart };
    }
  );

  tickets.forEach((ticket) => {
    if (!ticket.created_at) return;
    const time = new Date(ticket.created_at).getTime();
    const index = Math.floor((time - start.getTime()) / bucketMs);
    if (index >= 0 && index < buckets.length) {
      buckets[index].value += 1;
    }
  });

  return buckets.map(({ hour, value }) => ({ hour, value }));
};

const AdminDashboardSection = ({
  className = '',
  onScanClick,
  lastScanResult,
}: AdminDashboardSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const leftBlockRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [hourlyTickets, setHourlyTickets] = useState<ChartPoint[]>(() =>
    buildTimeBuckets([])
  );
  const [crowdByLine, setCrowdByLine] = useState<LineStat[]>([]);
  const [topLines, setTopLines] = useState<LineStat[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('—');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return;
    }

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0%-30%)
      scrollTl.fromTo(
        leftBlockRef.current,
        { x: '-55vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        dashboardRef.current,
        { x: '55vw', opacity: 0, scale: 0.97 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      // Chart bars animation
      const bars = chartRef.current?.querySelectorAll('.chart-bar');
      if (bars) {
        scrollTl.fromTo(
          bars,
          { scaleY: 0 },
          { scaleY: 1, stagger: 0.01, ease: 'none', transformOrigin: 'bottom' },
          0.1
        );
      }

      // Stats count-up effect
      const statNumbers = statsRef.current?.querySelectorAll('.stat-number');
      if (statNumbers) {
        scrollTl.fromTo(
          statNumbers,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.02, ease: 'none' },
          0.15
        );
      }

      const entranceChips = chipsRef.current?.querySelectorAll('.chip');
      if (entranceChips && entranceChips.length > 0) {
        scrollTl.fromTo(
          entranceChips,
          { y: '18vh', opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.02, ease: 'none' },
          0
        );
      }

      // SETTLE (30%-70%): Hold position

      // EXIT (70%-100%)
      scrollTl.fromTo(
        leftBlockRef.current,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        dashboardRef.current,
        { x: 0, opacity: 1 },
        { x: '18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      const exitChips = chipsRef.current?.querySelectorAll('.chip');
      if (exitChips && exitChips.length > 0) {
        scrollTl.fromTo(
          exitChips,
          { y: 0, opacity: 1 },
          { y: '10vh', opacity: 0, ease: 'power2.in' },
          0.7
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const nowIso = now.toISOString();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [
        totalTicketsRes,
        ticketsTodayRes,
        activeTicketsRes,
        ticketsLast24Res,
        crowdRes,
        incidentsRes,
      ] = await Promise.all([
        supabase.from('tickets').select('id', { count: 'exact', head: true }),
        supabase
          .from('tickets')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString()),
        supabase
          .from('tickets')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .gt('valid_until', nowIso),
        supabase
          .from('tickets')
          .select('created_at, line')
          .gte('created_at', last24h.toISOString()),
        supabase
          .from('crowd_data')
          .select('line, passenger_count, capacity, updated_at, train_number'),
        supabase
          .from('alerts')
          .select('id', { count: 'exact', head: true })
          .gt('expires_at', nowIso),
      ]);

      if (totalTicketsRes.error) throw totalTicketsRes.error;
      if (ticketsTodayRes.error) throw ticketsTodayRes.error;
      if (activeTicketsRes.error) throw activeTicketsRes.error;
      if (ticketsLast24Res.error) throw ticketsLast24Res.error;
      if (crowdRes.error) throw crowdRes.error;
      if (incidentsRes.error) throw incidentsRes.error;

      const ticketsLast24 = ticketsLast24Res.data ?? [];
      const crowdRows = crowdRes.data ?? [];

      const hourly = buildTimeBuckets(ticketsLast24);
      setHourlyTickets(hourly);

      const lineTicketCounts = new Map<string, number>();
      ticketsLast24.forEach((ticket) => {
        const lineName = ticket.line || 'Unknown';
        lineTicketCounts.set(lineName, (lineTicketCounts.get(lineName) || 0) + 1);
      });

      const sortedLines = Array.from(lineTicketCounts.entries()).sort(
        (a, b) => b[1] - a[1]
      );
      const maxLineCount = sortedLines[0]?.[1] || 1;
      setTopLines(
        sortedLines.slice(0, 6).map(([name, count], index) => ({
          name,
          count,
          value: Math.round((count / maxLineCount) * 100),
          color: LINE_COLORS[index % LINE_COLORS.length],
        }))
      );

      const crowdMap = new Map<string, { total: number; count: number }>();
      crowdRows.forEach((row) => {
        const ratio = row.capacity ? row.passenger_count / row.capacity : 0;
        const lineName = row.line || 'Unknown';
        const prev = crowdMap.get(lineName) || { total: 0, count: 0 };
        crowdMap.set(lineName, {
          total: prev.total + ratio,
          count: prev.count + 1,
        });
      });

      const crowdStats = Array.from(crowdMap.entries())
        .map(([name, { total, count }], index) => ({
          name,
          value: count ? Math.round((total / count) * 100) : 0,
          color: LINE_COLORS[index % LINE_COLORS.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
      setCrowdByLine(crowdStats);

      const avgOccupancy =
        crowdRows.length > 0
          ? Math.round(
              (crowdRows.reduce((acc, row) => {
                const ratio = row.capacity
                  ? row.passenger_count / row.capacity
                  : 0;
                return acc + ratio;
              }, 0) /
                crowdRows.length) *
                100
            )
          : 0;

      const activeCutoff = now.getTime() - 5 * 60 * 1000;
      const activeTrains = new Set(
        crowdRows
          .filter((row) => {
            if (!row.updated_at) return false;
            return new Date(row.updated_at).getTime() >= activeCutoff;
          })
          .map((row) => row.train_number)
      ).size;

      setMetrics({
        totalTickets: totalTicketsRes.count || 0,
        ticketsToday: ticketsTodayRes.count || 0,
        activeTickets: activeTicketsRes.count || 0,
        avgOccupancy,
        incidents: incidentsRes.count || 0,
        activeTrains,
      });
      setLastUpdated(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    } catch (err) {
      setError('Failed to load admin metrics.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, [isAdmin, loadDashboard]);

  const stats = [
    {
      label: 'Tickets sold',
      value: metrics ? metrics.totalTickets.toLocaleString() : '—',
      icon: Ticket,
      color: '#00F0FF',
    },
    {
      label: 'Tickets today',
      value: metrics ? metrics.ticketsToday.toLocaleString() : '—',
      icon: TrendingUp,
      color: '#F59E0B',
    },
    {
      label: 'Active tickets',
      value: metrics ? metrics.activeTickets.toLocaleString() : '—',
      icon: Ticket,
      color: '#10B981',
    },
    {
      label: 'Active trains',
      value: metrics ? metrics.activeTrains.toLocaleString() : '—',
      icon: Train,
      color: '#22D3EE',
    },
    {
      label: 'Avg occupancy',
      value: metrics ? `${metrics.avgOccupancy}%` : '—',
      icon: Users,
      color: '#8B5CF6',
    },
    {
      label: 'Incidents',
      value: metrics ? metrics.incidents.toLocaleString() : '—',
      icon: AlertCircle,
      color: '#EC4899',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="dashboard"
      className={`section-pinned ${className}`}
      style={{ background: '#070A12' }}
    >
      {/* Background Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: '5vw',
          top: '10vh',
          width: '50vw',
          height: '80vh',
          background: 'radial-gradient(circle at 50% 50%, rgba(0,240,255,0.08), transparent 60%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full lg:block flex flex-col gap-10 px-6 pt-24 pb-20 lg:px-0 lg:pt-0 lg:pb-0">
        {/* Left Info Panel */}
        <div
          ref={leftBlockRef}
          className="relative lg:absolute lg:left-[7vw] lg:top-[18vh] lg:w-[40vw] w-full max-w-2xl"
        >
          <h2 className="headline-lg text-[#F4F6FF]">
            Admin operations. <span className="text-[#00F0FF]">Live control.</span>
          </h2>
          <p className="body-text text-[#A7B0C8] mt-6">
            Real-time dashboard for authorities: ticket volume, crowd pressure,
            and QR validations across suburban and metro lines.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="chip flex items-center gap-2">
              <span className="text-[#F4F6FF]">Last updated</span>
              <span className="text-[#00F0FF] font-mono">{lastUpdated}</span>
            </div>
            {loading && (
              <div className="chip flex items-center gap-2">
                <span className="text-[#A7B0C8]">Refreshing...</span>
              </div>
            )}
          </div>
          {!isAdmin && (
            <div className="mt-6 p-4 rounded-xl bg-[#0B0F1C] border border-white/10 text-[#A7B0C8]">
              Admin access required to view live metrics.
            </div>
          )}
        </div>

        {/* Right Dashboard Card */}
        <div
          ref={dashboardRef}
          className="relative lg:absolute lg:right-[7vw] lg:top-[12vh] w-full max-w-4xl lg:w-[48vw] card-solid p-6 lg:h-[74vh] lg:overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[#A7B0C8]">Admin Dashboard</p>
              <h3 className="text-lg font-semibold text-[#F4F6FF]">
                Operations Overview
              </h3>
            </div>
            <button
              onClick={loadDashboard}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-[#A7B0C8] hover:text-[#F4F6FF] transition-colors"
              type="button"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Chart A - Tickets over time */}
            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-sm text-[#F4F6FF]">Tickets (last 24h)</span>
              </div>
              <div ref={chartRef} className="flex items-end justify-between h-32 gap-1">
                {hourlyTickets.map((data, index) => (
                  <div
                    key={index}
                    className="chart-bar flex-1 rounded-t-md bg-gradient-to-t from-[#00F0FF]/40 to-[#00F0FF]/80"
                    style={{ height: `${Math.min(100, data.value * 8 + 8)}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-[#A7B0C8]">
                  {hourlyTickets[0]?.hour || ''}
                </span>
                <span className="text-xs text-[#A7B0C8]">
                  {hourlyTickets[hourlyTickets.length - 1]?.hour || ''}
                </span>
              </div>
            </div>

            {/* Chart B - Crowd level by line */}
            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-sm text-[#F4F6FF]">Crowd level by line</span>
              </div>
              {crowdByLine.length === 0 ? (
                <p className="text-xs text-[#A7B0C8]">No crowd data yet.</p>
              ) : (
                <div className="space-y-3">
                  {crowdByLine.map((route, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-xs text-[#A7B0C8] w-28 truncate">
                        {route.name}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${route.value}%`,
                            backgroundColor: route.color,
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-mono"
                        style={{ color: route.color }}
                      >
                        {route.value}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-white/5 flex items-center gap-4"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="stat-number text-2xl font-bold text-[#F4F6FF]">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[#A7B0C8]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Ticket demand by line */}
            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-sm text-[#F4F6FF]">Tickets by line</span>
              </div>
              {topLines.length === 0 ? (
                <p className="text-xs text-[#A7B0C8]">No ticket data yet.</p>
              ) : (
                <div className="space-y-3">
                  {topLines.map((route, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-xs text-[#A7B0C8] w-28 truncate">
                        {route.name}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${route.value}%`,
                            backgroundColor: route.color,
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-mono"
                        style={{ color: route.color }}
                      >
                        {route.count ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ticket scanner */}
            <div className="p-4 rounded-xl bg-white/5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-sm text-[#F4F6FF]">Ticket Scanner</span>
              </div>
              {lastScanResult ? (
                <div
                  className={`rounded-xl p-3 mb-3 ${
                    lastScanResult.valid
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {lastScanResult.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm text-[#F4F6FF]">
                      {lastScanResult.valid ? 'Confirmed' : 'Rejected'}
                    </span>
                  </div>
                  <p className="text-xs text-[#A7B0C8] mt-2">
                    {lastScanResult.message}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#A7B0C8] mb-3">
                  Scan a ticket QR to confirm entry.
                </p>
              )}
              <button
                onClick={onScanClick}
                disabled={!onScanClick || !isAdmin}
                className="mt-auto btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Open Scanner
              </button>
            </div>
          </div>

          {/* Live Indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-xs text-[#A7B0C8]">
              Live data · Last updated {lastUpdated}
            </span>
          </div>
        </div>

        {/* Bottom Chips */}
        <div
          ref={chipsRef}
          className="hidden lg:flex absolute gap-4"
          style={{
            left: '7vw',
            right: '7vw',
            bottom: '7vh',
          }}
        >
          <div className="chip flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Live data</span>
          </div>
          <div className="chip flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Ticket analytics</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardSection;
