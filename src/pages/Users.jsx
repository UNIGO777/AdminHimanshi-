import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Search, Users, X } from 'lucide-react';
import AdminLayout from '../components/AdminLayout.jsx';
import { searchUsers, setUserBlocked } from '../services/properties';

const formatDateTime = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const verifiedBadgeClass = (isVerified) => (isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700');
const blockedBadgeClass = (isBlocked) => (isBlocked ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700');

export default function UsersPage({ onLogout }) {
  const [q, setQ] = useState('');
  const [verified, setVerified] = useState('');
  const [applied, setApplied] = useState({ q: '', verified: '' });
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  const params = useMemo(
    () => ({
      q: applied.q || undefined,
      verified: applied.verified || undefined,
      page,
      limit: 50,
    }),
    [applied, page]
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await searchUsers(params);
      const nextItems = Array.isArray(data?.items) ? data.items : [];
      setItems(nextItems);
      setMeta(data?.meta || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      setItems([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isDetailsOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsDetailsOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isDetailsOpen]);

  const canPrev = (meta?.page || 1) > 1;
  const canNext = (meta?.pages || 1) > (meta?.page || 1);

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-slate-600">View all registered users.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <form
              className="flex flex-col gap-3 md:flex-row md:flex-nowrap md:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                setApplied({ q: q.trim(), verified });
                setPage(1);
              }}
            >
              <div className="w-full md:flex-1">
                <label className="block text-xs font-semibold text-slate-600 md:sr-only">Search</label>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 md:mt-0">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="Search name, email, phone"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative w-full md:w-44">
                <label className="block text-xs font-semibold text-slate-600 md:sr-only">Verified</label>
                <select
                  className="mt-2 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm md:mt-0"
                  value={verified}
                  onChange={(e) => setVerified(e.target.value)}
                  aria-label="Verified"
                >
                  <option value="">All</option>
                  <option value="true">Verified</option>
                  <option value="false">Not Verified</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              </div>

              <div className="flex w-full items-end justify-end gap-2 md:ml-auto md:w-auto">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQ('');
                    setVerified('');
                    setApplied({ q: '', verified: '' });
                    setPage(1);
                  }}
                  disabled={isLoading}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
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
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Verified</th>
                    <th className="px-4 py-3">Blocked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.length ? (
                    items.map((x) => (
                      <tr
                        key={x._id}
                        className="cursor-pointer hover:bg-slate-50"
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelected(x);
                          setIsDetailsOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelected(x);
                            setIsDetailsOpen(true);
                          }
                        }}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">{formatDateTime(x.createdAt)}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{x.name || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{x.email || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{x.phone || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">
                          <span className={'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ' + verifiedBadgeClass(x.isVerified)}>
                            {x.isVerified ? 'Verified' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <span className={'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ' + blockedBadgeClass(x.isBlocked)}>
                            {x.isBlocked ? 'Blocked' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-600" colSpan={6}>
                        {isLoading ? 'Loading…' : 'No users found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        {isDetailsOpen && selected ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-details-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setIsDetailsOpen(false);
            }}
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <h2 id="user-details-title" className="text-sm font-semibold text-slate-800">
                    User Details
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={
                      'rounded-lg px-3 py-1.5 text-sm font-semibold ' +
                      (selected.isBlocked ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-red-600 text-white hover:bg-red-700') +
                      (isBlocking ? ' opacity-60' : '')
                    }
                    disabled={isBlocking}
                    onClick={async () => {
                      setIsBlocking(true);
                      setError('');
                      try {
                        const updated = await setUserBlocked(selected._id, !selected.isBlocked);
                        setSelected(updated);
                        setItems((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to update user');
                      } finally {
                        setIsBlocking(false);
                      }
                    }}
                  >
                    {selected.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    aria-label="Close"
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[75vh] overflow-auto p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Name</div>
                    <div className="mt-1 font-semibold text-slate-900">{selected.name || '-'}</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500">Verified</div>
                    <div className="mt-1">
                      <span className={'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ' + verifiedBadgeClass(selected.isVerified)}>
                        {selected.isVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500">Blocked</div>
                    <div className="mt-1">
                      <span className={'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ' + blockedBadgeClass(selected.isBlocked)}>
                        {selected.isBlocked ? 'Blocked' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs font-semibold text-slate-500">Email</div>
                    <div className="mt-1 text-slate-800">{selected.email || '-'}</div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs font-semibold text-slate-500">Phone</div>
                    <div className="mt-1 text-slate-800">{selected.phone || '-'}</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500">Created</div>
                    <div className="mt-1 text-slate-700">{formatDateTime(selected.createdAt)}</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500">Updated</div>
                    <div className="mt-1 text-slate-700">{formatDateTime(selected.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
