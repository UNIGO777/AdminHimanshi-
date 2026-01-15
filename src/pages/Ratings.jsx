import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Star, X } from 'lucide-react';
import AdminLayout from '../components/AdminLayout.jsx';
import { searchRatings } from '../services/properties';

const formatDateTime = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const renderStars = (stars) => {
  const n = Number(stars);
  if (!Number.isFinite(n) || n < 1) return '-';
  const full = '★'.repeat(Math.min(5, Math.max(0, n)));
  const empty = '☆'.repeat(Math.min(5, Math.max(0, 5 - n)));
  return `${full}${empty}`;
};

export default function Ratings({ onLogout }) {
  const [stars, setStars] = useState('');
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const params = useMemo(
    () => ({
      stars: stars || undefined,
      page,
      limit: 50,
    }),
    [stars, page]
  );

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await searchRatings(params);
      const nextItems = Array.isArray(data?.items) ? data.items : [];
      setItems(nextItems);
      setMeta(data?.meta || null);
      setSelected((prev) => (prev && nextItems.find((x) => x._id === prev._id) ? prev : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ratings');
      setItems([]);
      setMeta(null);
      setSelected(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

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
          <h1 className="text-2xl font-semibold">Ratings</h1>
          <p className="text-sm text-slate-600">View all property ratings.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:flex-nowrap md:items-end">
            <div className="relative w-full md:w-44">
              <label className="block text-xs font-semibold text-slate-600 md:sr-only">Stars</label>
              <select
                className="mt-2 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm md:mt-0"
                value={stars}
                onChange={(e) => {
                  setStars(e.target.value);
                  setPage(1);
                }}
                aria-label="Stars"
              >
                <option value="">All Stars</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
            </div>

            <div className="flex w-full items-end justify-end gap-2 md:ml-auto md:w-auto">
              <button
                type="button"
                onClick={() => {
                  setStars('');
                  setPage(1);
                }}
                disabled={isLoading}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reset
              </button>
            </div>
          </div>
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
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Stars</th>
                  <th className="px-4 py-3">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.length ? (
                  items.map((x) => {
                    const isSelected = selected?._id === x._id;
                    return (
                      <tr
                        key={x._id}
                        className={(isSelected ? 'bg-slate-50' : 'hover:bg-slate-50') + ' cursor-pointer'}
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
                        <td className="px-4 py-3 font-medium text-slate-900">{x.property?.title || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{x.user?.name || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{renderStars(x.stars)}</td>
                        <td className="px-4 py-3 text-slate-700">
                          <div className="max-w-[420px] truncate">{x.comment || '-'}</div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-600" colSpan={5}>
                      {isLoading ? 'Loading…' : 'No ratings found'}
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
            aria-labelledby="rating-details-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setIsDetailsOpen(false);
            }}
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-slate-500" />
                  <h2 id="rating-details-title" className="text-sm font-semibold text-slate-800">
                    Rating Details
                  </h2>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                  aria-label="Close"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[75vh] overflow-auto p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Stars</div>
                    <div className="mt-1 font-semibold text-slate-900">{renderStars(selected.stars)}</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500">Created</div>
                    <div className="mt-1 text-slate-700">{formatDateTime(selected.createdAt)}</div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs font-semibold text-slate-500">Comment</div>
                    <div className="mt-1 whitespace-pre-wrap text-slate-800">{selected.comment || '-'}</div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="h-px bg-slate-200" />
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs font-semibold text-slate-500">Property</div>
                    <div className="mt-1 font-semibold text-slate-900">{selected.property?.title || '-'}</div>
                    <div className="mt-1 text-slate-700">
                      {(selected.property?.propertyType || '-') +
                        ' • ' +
                        (selected.property?.listingType || '-') +
                        ' • ' +
                        (selected.property?.city || '-')}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-xs font-semibold text-slate-500">User</div>
                    <div className="mt-1 font-semibold text-slate-900">{selected.user?.name || '-'}</div>
                    <div className="mt-1 text-slate-700">{selected.user?.email || '-'}</div>
                    <div className="mt-1 text-slate-700">{selected.user?.phone || '-'}</div>
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
