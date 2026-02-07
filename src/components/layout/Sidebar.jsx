import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, TrendingUp, CalendarDays, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

const icons = { LayoutDashboard, Users, TrendingUp, CalendarDays, Activity };

const navItems = [
  { path: '/', label: 'Overview', icon: 'LayoutDashboard' },
  { path: '/agents', label: 'Agents', icon: 'Users' },
  { path: '/sales', label: 'Sales', icon: 'TrendingUp' },
  { path: '/attendance', label: 'Attendance', icon: 'CalendarDays' },
  { path: '/productivity', label: 'Productivity', icon: 'Activity' },
];

export default function Sidebar({ collapsed, onToggle }) {

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-50 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex items-center gap-2 px-4 h-14 border-b border-slate-800">
        {!collapsed && (
          <h1 className="text-sm font-semibold text-slate-100 whitespace-nowrap">
            Performance Golf
          </h1>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-2 flex flex-col gap-0.5 px-2">
        {navItems.map((item) => {
          const Icon = icons[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-slate-800">
        {!collapsed && (
          <p className="text-xs text-slate-500">v1.0</p>
        )}
      </div>
    </aside>
  );
}
