import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Pencil, X, ChevronDown } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import { clearAdminToken } from '../services/token';
import { deleteProperty, listProperties, searchProperties } from '../services/properties';

const formatPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return new Intl.NumberFormat('en-IN').format(n);
};

export default function Properties({ onLogout }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [listingType, setListingType] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const query = useMemo(
    () => ({
      q,
      status: status || undefined,
      listingType: listingType || undefined,
      propertyType: propertyType || undefined,
      limit: 50,
      page: 1,
    }),
    [q, status, listingType, propertyType]
  );

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const hasFilters =
        Boolean(q.trim()) || Boolean(status) || Boolean(listingType) || Boolean(propertyType);

      const data = hasFilters ? await searchProperties(query) : await listProperties();
      const nextItems = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      setItems(nextItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              <h1 className="text-2xl font-semibold">Properties</h1>
              <p className="mt-2 text-sm text-slate-600">Search, add, update and delete properties.</p>
            </div>
            <Link
              to="/properties/new"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              <span>Add Property</span>
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <form
              className="flex flex-col gap-3 md:flex-row md:flex-nowrap md:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                load();
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
                    placeholder="title, city, owner, etc."
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
                <label className="block text-xs font-semibold text-slate-600 md:sr-only">Property Type</label>
                <select
                  className="mt-2 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm md:mt-0"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  aria-label="Property type"
                >
                  <option value="">All</option>
                  <option>Apartment</option>
                  <option>House</option>
                  <option>Villa</option>
                  <option>Plot</option>
                  <option>Land</option>
                  <option>Office</option>
                  <option>Shop</option>
                  <option>Showroom</option>
                  <option>Warehouse</option>
                  <option>Farmhouse</option>
                  <option>PG</option>
                  <option>Hostel</option>
                  <option>Commercial</option>
                  <option>Industrial</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
              </div>

              <div className="relative w-full md:w-40">
                <label className="block text-xs font-semibold text-slate-600 md:sr-only">Listing Type</label>
                <select
                  className="mt-2 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm md:mt-0"
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  aria-label="Listing type"
                >
                  <option value="">All</option>
                  <option>Sale</option>
                  <option>Rent</option>
                  <option>Lease</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
              </div>

              <div className="relative w-full md:w-52">
                <label className="block text-xs font-semibold text-slate-600 md:sr-only">Status</label>
                <select
                  className="mt-2 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm md:mt-0"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  aria-label="Status"
                >
                  <option value="">All</option>
                  <option>Available</option>
                  <option>Booked</option>
                  <option>Sold</option>
                  <option>Under Construction</option>
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
                    setQ('');
                    setStatus('');
                    setListingType('');
                    setPropertyType('');
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
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Listing</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.length ? (
                    items.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          {Array.isArray(p.images) && p.images[0] ? (
                            <img
                              src={p.images[0]}
                              alt=""
                              className="h-10 w-14 rounded-md border border-slate-200 object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-10 w-14 rounded-md border border-slate-200 bg-slate-100" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{p.title || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{p.propertyType || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{p.listingType || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{p.status || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{p.city || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">₹ {formatPrice(p.price)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/properties/${p._id}/edit`}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Pencil className="h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                              onClick={async () => {
                                const ok = window.confirm('Delete this property?');
                                if (!ok) return;
                                try {
                                  await deleteProperty(p._id);
                                  setItems((prev) => prev.filter((x) => x._id !== p._id));
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : 'Delete failed');
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-600" colSpan={8}>
                        {isLoading ? 'Loading…' : 'No properties found'}
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
