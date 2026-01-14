import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import { clearAdminToken } from '../services/token';
import { createProperty, getProperty, updateProperty, uploadImages, uploadVideo } from '../services/properties';

const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Villa',
  'Plot',
  'Land',
  'Office',
  'Shop',
  'Showroom',
  'Warehouse',
  'Farmhouse',
  'PG',
  'Hostel',
  'Commercial',
  'Industrial',
];

const LISTING_TYPES = ['Sale', 'Rent', 'Lease'];
const STATUSES = ['Available', 'Booked', 'Sold', 'Under Construction'];

export default function PropertyForm({ onLogout }) {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [listingType, setListingType] = useState('Sale');
  const [status, setStatus] = useState('Available');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [images, setImages] = useState([]);
  const [verified, setVerified] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setIsLoading(true);
    setError('');
    getProperty(id)
      .then((p) => {
        setTitle(p?.title || '');
        setDescription(p?.description || '');
        setPropertyType(p?.propertyType || 'Apartment');
        setListingType(p?.listingType || 'Sale');
        setStatus(p?.status || 'Available');
        setPrice(p?.price !== undefined && p?.price !== null ? String(p.price) : '');
        setCity(p?.city || '');
        setState(p?.state || '');
        setAddress(p?.address || '');
        setPincode(p?.pincode || '');
        setArea(p?.area !== undefined && p?.area !== null ? String(p.area) : '');
        setBedrooms(p?.bedrooms !== undefined && p?.bedrooms !== null ? String(p.bedrooms) : '');
        setBathrooms(p?.bathrooms !== undefined && p?.bathrooms !== null ? String(p.bathrooms) : '');
        setOwnerName(p?.ownerName || '');
        setOwnerContact(p?.ownerContact || '');
        setVideoUrl(p?.videoUrl || '');
        setImages(Array.isArray(p?.images) ? p.images : []);
        setVerified(Boolean(p?.verified));
        setIsFeatured(Boolean(p?.isFeatured));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load property'))
      .finally(() => setIsLoading(false));
  }, [id, isEdit]);

  const payload = useMemo(() => {
    const out = {
      title: title.trim(),
      description: description.trim() || undefined,
      propertyType,
      listingType,
      status,
      price: Number(price),
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      address: address.trim() || undefined,
      pincode: pincode.trim() || undefined,
      area: area.trim() ? Number(area) : undefined,
      bedrooms: bedrooms.trim() ? Number(bedrooms) : undefined,
      bathrooms: bathrooms.trim() ? Number(bathrooms) : undefined,
      ownerName: ownerName.trim() || undefined,
      ownerContact: ownerContact.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      images: Array.isArray(images) ? images : [],
      verified: Boolean(verified),
      isFeatured: Boolean(isFeatured),
    };
    return out;
  }, [
    title,
    description,
    propertyType,
    listingType,
    status,
    price,
    city,
    state,
    address,
    pincode,
    area,
    bedrooms,
    bathrooms,
    ownerName,
    ownerContact,
    videoUrl,
    images,
    verified,
    isFeatured,
  ]);

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
              <div className="flex items-center gap-3">
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Link>
                <h1 className="text-2xl font-semibold">{isEdit ? 'Update Property' : 'Add Property'}</h1>
              </div>
              <p className="mt-2 text-sm text-slate-600">Fill property details and save.</p>
            </div>

            <button
              type="button"
              disabled={isLoading || isUploadingImages || isUploadingVideo}
              onClick={async () => {
                setIsLoading(true);
                setError('');
                try {
                  if (!payload.title) throw new Error('Title is required');
                  if (!Number.isFinite(payload.price)) throw new Error('Price is required');
                  if (isEdit) await updateProperty(id, payload);
                  else await createProperty(payload);
                  navigate('/properties', { replace: true });
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Save failed');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Saving…' : 'Save'}</span>
            </button>
          </div>

          {error ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Title">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Property title"
                  />
                </Field>

                <Field label="Price">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 2500000"
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Property Type">
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Listing Type">
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                  >
                    {LISTING_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Status">
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {STATUSES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="flex items-center gap-6 pt-7">
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={verified}
                      onChange={(e) => setVerified(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span>Verified</span>
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span>Featured</span>
                  </label>
                </div>

                <Field label="City">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </Field>

                <Field label="State">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </Field>

                <Field label="Pincode">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </Field>

                <Field label="Area (sqft)">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Bedrooms">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Bathrooms">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Owner Name">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </Field>

                <Field label="Owner Contact">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    value={ownerContact}
                    onChange={(e) => setOwnerContact(e.target.value)}
                  />
                </Field>

                <Field label="Video">
                  <div className="flex items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={isUploadingVideo || isLoading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (!file) return;
                          setIsUploadingVideo(true);
                          setError('');
                          try {
                            const url = await uploadVideo(file);
                            if (!url) throw new Error('Upload failed');
                            setVideoUrl(url);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Video upload failed');
                          } finally {
                            setIsUploadingVideo(false);
                          }
                        }}
                      />
                      <span>{isUploadingVideo ? 'Uploading…' : videoUrl ? 'Change Video' : 'Upload Video'}</span>
                    </label>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                      disabled={!videoUrl || isUploadingVideo || isLoading}
                      onClick={() => setVideoUrl('')}
                    >
                      Remove
                    </button>
                  </div>
                  {videoUrl ? (
                    <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <video className="h-56 w-full object-cover" controls src={videoUrl} />
                    </div>
                  ) : null}
                </Field>

                <Field label="Address" className="md:col-span-2">
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Field>

                <Field label="Description" className="md:col-span-2">
                  <textarea
                    className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-700">Images</div>
              <div className="mt-3 flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={isUploadingImages || isLoading}
                    onChange={async (e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      e.target.value = '';
                      if (!files.length) return;
                      setIsUploadingImages(true);
                      setError('');
                      try {
                        const urls = await uploadImages(files);
                        if (!urls.length) throw new Error('Upload failed');
                        setImages((prev) => {
                          const current = Array.isArray(prev) ? prev : [];
                          const merged = [...current, ...urls].filter(Boolean);
                          return Array.from(new Set(merged));
                        });
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Image upload failed');
                      } finally {
                        setIsUploadingImages(false);
                      }
                    }}
                  />
                  <span>{isUploadingImages ? 'Uploading…' : 'Upload Images'}</span>
                </label>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                  disabled={!images.length || isUploadingImages || isLoading}
                  onClick={() => setImages([])}
                >
                  Clear
                </button>
              </div>
              {images.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {images.map((url) => (
                    <div key={url} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <img src={url} alt="" className="h-28 w-full object-cover" />
                      <button
                        type="button"
                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 hover:bg-white"
                        onClick={() => setImages((prev) => (Array.isArray(prev) ? prev.filter((x) => x !== url) : []))}
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
                  No images uploaded
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, className, children }) {
  return (
    <div className={className || ''}>
      <label className="block text-xs font-semibold text-slate-600">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
