import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

export default function AdminLayout({ onLogout, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const prevOverflowRef = useRef('');

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    prevOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflowRef.current;
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <Sidebar onLogout={() => onLogout?.()} className="h-screen" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="text-sm font-semibold tracking-tight text-slate-900">Himashi Admin</div>
              <div className="h-9 w-9" />
            </div>
          </header>

          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">{children}</main>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="text-sm font-semibold tracking-tight text-slate-900">Menu</div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <Sidebar
              onLogout={() => onLogout?.()}
              onNavigate={() => setIsMenuOpen(false)}
              showHeader={false}
              className="h-full w-full border-r-0"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

