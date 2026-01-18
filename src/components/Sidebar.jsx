import { NavLink } from 'react-router-dom';
import { BadgeCheck, Home, LayoutDashboard, LogOut, MessageSquare, Star, Users } from 'lucide-react';

export default function Sidebar({ onLogout, onNavigate, showHeader = true, className = '' }) {
  const linkClass = ({ isActive }) =>
    [
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
      isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100',
    ].join(' ');

  return (
    <aside className={['flex w-64 flex-col border-r border-slate-200 bg-white', className].filter(Boolean).join(' ')}>
      {showHeader ? (
        <div className="px-5 py-5">
          <div className="text-sm font-semibold tracking-tight text-slate-900">Himashi Admin</div>
          <div className="mt-1 text-xs text-slate-500">Admin Panel</div>
        </div>
      ) : null}

      <nav className="flex-1 px-3">
        <NavLink to="/dashboard" className={linkClass} onClick={() => onNavigate?.()}>
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/properties" className={linkClass} onClick={() => onNavigate?.()}>
          <Home className="h-4 w-4" />
          <span>Properties</span>
        </NavLink>
        <NavLink to="/queries" className={linkClass} onClick={() => onNavigate?.()}>
          <MessageSquare className="h-4 w-4" />
          <span>Queries</span>
        </NavLink>
        <NavLink to="/ratings" className={linkClass} onClick={() => onNavigate?.()}>
          <Star className="h-4 w-4" />
          <span>Ratings</span>
        </NavLink>
        <NavLink to="/featured" className={linkClass} onClick={() => onNavigate?.()}>
          <BadgeCheck className="h-4 w-4" />
          <span>Featured</span>
        </NavLink>
        <NavLink to="/users" className={linkClass} onClick={() => onNavigate?.()}>
          <Users className="h-4 w-4" />
          <span>Users</span>
        </NavLink>
      </nav>

      <div className="px-3 py-4">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          type="button"
          onClick={() => onLogout?.()}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
