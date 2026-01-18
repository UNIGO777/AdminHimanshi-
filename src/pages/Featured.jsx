import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import AdminLayout from '../components/AdminLayout.jsx';
import { searchProperties, setPropertyFeatured } from '../services/properties';

const formatMoney = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return n.toLocaleString('en-IN');
};

export default function Featured({ onLogout }) {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredError, setFeaturedError] = useState('');

  const [q, setQ] = useState('');
  const [appliedQ, setAppliedQ] = useState('');
  const [searchItems, setSearchItems] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const featuredParams = useMemo(() => ({ isFeatured: true, page: 1, limit: 100 }), []);
  const searchParams = useMemo(() => ({ q: appliedQ || undefined, page: 1, limit: 50 }), [appliedQ]);

  const loadFeatured = async () => {
    setFeaturedLoading(true);
    setFeaturedError('');
    try {
      const data = await searchProperties(featuredParams);
      setFeaturedItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setFeaturedItems([]);
      setFeaturedError(err instanceof Error ? err.message : 'Failed to load featured properties');
    } finally {
      setFeaturedLoading(false);
    }
  };

  const loadSearch = async () => {
    setSearchLoading(true);
    setSearchError('');
    try {
      const data = await searchProperties(searchParams);
      setSearchItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setSearchItems([]);
      setSearchError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    loadFeatured();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const toggleFeatured = async (property, nextFeatured) => {
    const id = property?._id;
    if (!id) return;
    const prevFeatured = Boolean(property?.isFeatured);

    setFeaturedError('');
    setSearchError('');

    setFeaturedItems((prev) => prev.map((p) => (p?._id === id ? { ...p, isFeatured: nextFeatured } : p)));
    setSearchItems((prev) => prev.map((p) => (p?._id === id ? { ...p, isFeatured: nextFeatured } : p)));

    try {
      const updated = await setPropertyFeatured(id, nextFeatured);
      const updatedIsFeatured = updated?.isFeatured === true;
      setFeaturedItems((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const without = list.filter((p) => p?._id !== id);
        if (updatedIsFeatured) return [updated, ...without];
        return without;
      });
      setSearchItems((prev) => prev.map((p) => (p?._id === id ? { ...p, isFeatured: updatedIsFeatured } : p)));
    } catch (err) {
      setFeaturedItems((prev) => prev.map((p) => (p?._id === id ? { ...p, isFeatured: prevFeatured } : p)));
      setSearchItems((prev) => prev.map((p) => (p?._id === id ? { ...p, isFeatured: prevFeatured } : p)));
      const message = err instanceof Error ? err.message : 'Update failed';
      setFeaturedError(message);
      setSearchError(message);
    }
  };

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Featured Properties</h1>
          <p className="text-sm text-slate-600">Add or remove properties from featured.</p>
        </div>

        {featuredError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{featuredError}</div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div className="text-sm font-semibold text-slate-700">Currently Featured</div>
            <button
              type="button"
              onClick={() => loadFeatured()}
              disabled={featuredLoading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {featuredLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {featuredItems.length ? (
                  featuredItems.map((p) => (
                    <tr key={p._id} className="text-slate-700">
                      <td className="px-4 py-3 font-semibold text-slate-900">{p?.title || '-'}</td>
                      <td className="px-4 py-3">{p?.propertyType || '-'}</td>
                      <td className="px-4 py-3">{p?.city || '-'}</td>
                      <td className="px-4 py-3">{formatMoney(p?.price)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => toggleFeatured(p, false)}
                          disabled={featuredLoading}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-600" colSpan={5}>
                      {featuredLoading ? 'Loading…' : 'No featured properties'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <form
            className="flex flex-col gap-3 md:flex-row md:flex-nowrap md:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              setAppliedQ(q.trim());
            }}
          >
            <div className="w-full md:flex-1">
              <label className="block text-xs font-semibold text-slate-600 md:sr-only">Search</label>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 md:mt-0">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by title, city, address, etc."
                />
              </div>
            </div>

            <div className="flex w-full items-end justify-end gap-2 md:ml-auto md:w-auto">
              <button
                type="button"
                onClick={() => {
                  setQ('');
                  setAppliedQ('');
                }}
                disabled={searchLoading}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={searchLoading}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {searchLoading ? 'Searching…' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {searchError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{searchError}</div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="text-sm font-semibold text-slate-700">All Properties</div>
            <div className="mt-1 text-xs text-slate-500">Use search and toggle featured status.</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {searchItems.length ? (
                  searchItems.map((p) => {
                    const featured = Boolean(p?.isFeatured);
                    return (
                      <tr key={p._id} className="text-slate-700">
                        <td className="px-4 py-3 font-semibold text-slate-900">{p?.title || '-'}</td>
                        <td className="px-4 py-3">{p?.propertyType || '-'}</td>
                        <td className="px-4 py-3">{p?.city || '-'}</td>
                        <td className="px-4 py-3">{featured ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3 text-right">
                          {featured ? (
                            <button
                              type="button"
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              onClick={() => toggleFeatured(p, false)}
                              disabled={searchLoading}
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                              onClick={() => toggleFeatured(p, true)}
                              disabled={searchLoading}
                            >
                              Add
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-600" colSpan={5}>
                      {searchLoading ? 'Loading…' : 'No properties found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
