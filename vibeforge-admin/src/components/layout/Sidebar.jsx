import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Briefcase,
  Tag,
  UserCheck,
  Bell,
  BarChart3,
  ShieldAlert,
  Settings,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Orders', path: '/orders', icon: ShoppingBag },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Services', path: '/services', icon: Briefcase },
  { name: 'Offers & Coupons', path: '/offers', icon: Tag },
  { name: 'Employees', path: '/employees', icon: UserCheck },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-64 glass-panel transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full px-4 py-6 justify-between">
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center space-x-3 px-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-tight">
                Vibe<span className="text-indigo-400">Forge</span>
              </h1>
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Enterprise Admin
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white shadow-md shadow-indigo-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Badge */}
        <div className="px-3 py-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Server Online</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">v2.4.0 • Enterprise Edition</p>
        </div>
      </div>
    </aside>
  );
}
