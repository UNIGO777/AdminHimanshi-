import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronDown, Search, X } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import { clearAdminToken } from '../services/token';
import { searchQueries } from '../services/properties';

const formatDateTime = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const statusBadgeClass = (status) => {
  if (status === 'Closed') return 'bg-slate-900 text-white';
  if (status === 'Contacted') return 'bg-amber-100 text-amber-800';
  return 'bg-emerald-100 text-emerald-800';
};

export default function Queries({ onLogout }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [applied, setApplied] = useState({ q: '', status: '', from: '', to: '' });
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const params = useMemo(
    () => ({
      q: applied.q || undefined,
      status: applied.status || undefined,
      from: applied.from || undefined,
      to: applied.to || undefined,
      page,
      limit: 50,
    }),
    [applied, page]
  );

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await searchQueries(params);
      setItems(Array.isArray(data?.items) ? data.items : []);
      setMeta(data?.meta || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queries');
      setItems([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const canPrev = (meta?.page || 1) > 1;
  const canNext = (meta?.pages || 1) > (meta?.page || 1);

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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Queries</h1>
              <p className="mt-2 text-sm text-slate-600">View and filter property enquiries.</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <form
              className="flex flex-col gap-3 md:flex-row md:flex-nowrap md:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                setApplied({ q: q.trim(), status, from, to });
                setPage(1);
              }}
            >
              <div className="w-full md:flex-1">
                <label className="block text-xs font-semibold text-slate-600 md:sr-only">Search</label>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 transition focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-200 md:mt-0">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    type="search"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setQ('');
                    }}
                    placeholder="name, email, phone, message..."
                    autoComplete="off"
                  />
                  {q ? (
                    <button
                      type="button"
                      onClick={() => setQ('')}
                      className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="relative w-full md:w-44">
                <label className="block text-xs font-semibold text-slate-600 md:sr-only">Status</label>
                <select
                  className="mt-2 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm md:mt-0"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  aria-label="Status"
                >
                  <option value="">All Status</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Closed">Closed</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              </div>

              <div className="w-full md:w-44">
                <label className="block text-xs font-semibold text-slate-600 md:sr-only">From</label>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 md:mt-0">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  <input
                    type="date"
                    className="w-full bg-transparent text-sm outline-none"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    aria-label="From date"
                  />
                </div>
              </div>

              <div className="w-full md:w-44">
                <label className="block text-xs font-semibold text-slate-600 md:sr-only">To</label>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 md:mt-0">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  <input
                    type="date"
                    className="w-full bg-transparent text-sm outline-none"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    aria-label="To date"
                  />
                </div>
              </div>

              <div className="flex w-full items-end justify-end gap-2 md:ml-auto md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setQ('');
                    setStatus('');
                    setFrom('');
                    setTo('');
                    setApplied({ q: '', status: '', from: '', to: '' });
                    setPage(1);
                  }}
                  disabled={isLoading}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isLoading ? 'Loading…' : 'Search'}
                </button>
              </div>
            </form>
          </div>

          {error ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="text-sm text-slate-600">
                {meta?.total !== undefined ? (
                  <span>
                    Total: <span className="font-semibold text-slate-900">{meta.total}</span>
                  </span>
                ) : (
                  <span />
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={isLoading || !canPrev}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Prev
                </button>
                <div className="text-sm text-slate-600">
                  Page <span className="font-semibold text-slate-900">{meta?.page || 1}</span> / {meta?.pages || 1}
                </div>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isLoading || !canNext}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Property</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.length ? (
                    items.map((x) => (
                      <tr key={x._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">{formatDateTime(x.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(x.status)}`}>
                            {x.status || 'New'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{x.name || x.user?.name || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{x.email || x.user?.email || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{x.phone || x.user?.phone || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {x.property?._id ? (
                            <Link to={`/properties/${x.property._id}/edit`} className="font-semibold text-slate-900 hover:underline">
                              {x.property.title || 'View property'}
                            </Link>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{x.property?.city || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">
                          <div className="max-w-[420px] truncate">{x.message || '-'}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-600" colSpan={8}>
                        {isLoading ? 'Loading…' : 'No queries found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

