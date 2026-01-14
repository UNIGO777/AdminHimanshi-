import { useEffect, useMemo, useRef, useState } from 'react';
import { BadgeCheck, Home, LogOut, Mail, MessageSquare, Star, Users } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import { fetchWebsiteStats } from '../services/stats';
import { clearAdminToken } from '../services/token';
import {
  Chart as ChartJS,
  BarController,
  LineElement,
  LineController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function Dashboard({ onLogout }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  useEffect(() => {
    let mounted = true;
    fetchWebsiteStats({ days })
      .then((data) => {
        if (!mounted) return;
        setStats(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      });
    return () => {
      mounted = false;
    };
  }, [days]);

  const chartsKey = useMemo(() => `days:${days}`, [days]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <Sidebar
          onLogout={() => {
            clearAdminToken();
            onLogout?.();
          }}
        />
        <main className="flex-1 px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">Website stats and activity</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
              </select>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                type="button"
                onClick={() => {
                  clearAdminToken();
                  onLogout?.();
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-6">
            {stats ? (
              <>
                <StatCard title="Users" value={stats.totals.users} Icon={Users} />
                <StatCard title="Verified Users" value={stats.totals.verifiedUsers} Icon={BadgeCheck} />
                <StatCard title="Properties" value={stats.totals.properties} Icon={Home} />
                <StatCard title="Verified Properties" value={stats.totals.verifiedProperties} Icon={BadgeCheck} />
                <StatCard title="Featured" value={stats.totals.featuredProperties} Icon={Star} />
                <StatCard title="Emails Sent" value={stats.totals.emails} Icon={Mail} />
              </>
            ) : (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">Queries per day</h2>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <MessageSquare className="h-4 w-4" />
                  <span>{stats ? `${days} days` : ''}</span>
                </div>
              </div>
              <div className="mt-4 h-[280px]">
                {stats ? (
                  <ChartCanvas
                    key={`${chartsKey}:queriesTimeline`}
                    type="line"
                    data={{
                      labels: stats.queries.timeline.map((x) => x.date),
                      datasets: [
                        {
                          label: 'Queries',
                          data: stats.queries.timeline.map((x) => x.count),
                          borderColor: '#0f172a',
                          backgroundColor: 'rgba(15,23,42,0.1)',
                        },
                      ],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                ) : (
                  <div className="h-full" />
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-slate-700">Most enquiries by property type</h2>
              <div className="mt-4 h-[280px]">
                {stats ? (
                  <ChartCanvas
                    key={`${chartsKey}:queriesByPropertyType`}
                    type="bar"
                    data={{
                      labels: stats.queries.byPropertyType.map((x) => x.label),
                      datasets: [
                        {
                          label: 'Enquiries',
                          data: stats.queries.byPropertyType.map((x) => x.value),
                          backgroundColor: '#0f172a',
                        },
                      ],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                ) : (
                  <div className="h-full" />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-slate-700">{title}</div>
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
      </div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-7 w-16 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

function ChartCanvas({ type, data, options }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const existing = ChartJS.getChart(canvas);
    if (existing) existing.destroy();
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new ChartJS(canvas, { type, data, options });

    return () => {
      const chart = chartRef.current || ChartJS.getChart(canvas);
      if (chart) chart.destroy();
      chartRef.current = null;
    };
  }, [type, data, options]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
