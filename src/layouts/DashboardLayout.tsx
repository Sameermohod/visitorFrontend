import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setTenantSlug, clearCredentials } from '../store';
import { 
  Building2, Users, ClipboardList, CreditCard, Shield, 
  LayoutDashboard, LogOut, Bell, Menu, X, UserCheck, Settings
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const dispatch = useDispatch();
  const { user, tenantSlug } = useSelector((state: RootState) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const role = user?.role || 'Society Admin';

  // Dynamic Sidebar Navigation Configs based on RBAC
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['Super Admin', 'Society Admin', 'Resident', 'Security Guard'] },
    { id: 'residents', name: 'Residents Directory', icon: Users, allowedRoles: ['Super Admin', 'Society Admin', 'Committee Member'] },
    { id: 'staff', name: 'Staff & Guards', icon: UserCheck, allowedRoles: ['Super Admin', 'Society Admin', 'Committee Member'] },
    { id: 'visitors', name: 'Visitor Registry', icon: Shield, allowedRoles: ['Super Admin', 'Society Admin', 'Security Guard', 'Resident'] },
    { id: 'complaints', name: 'Complaints Hub', icon: ClipboardList, allowedRoles: ['Super Admin', 'Society Admin', 'Resident', 'Committee Member', 'Maintenance Staff'] },
    { id: 'billing', name: 'Invoicing & Bills', icon: CreditCard, allowedRoles: ['Super Admin', 'Society Admin', 'Resident', 'Accountant'] },
    { id: 'notices', name: 'Notice Board', icon: Bell, allowedRoles: ['Super Admin', 'Society Admin', 'Resident', 'Committee Member'] },
    { id: 'settings', name: 'Society Settings', icon: Settings, allowedRoles: ['Super Admin', 'Society Admin'] },
  ];

  const filteredNavItems = navigationItems.filter(item => item.allowedRoles.includes(role));

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setTenantSlug(e.target.value));
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
  };

  const getBrandingTheme = () => {
    const tenantName = user?.tenant?.name || 'Lotus Heights';
    switch (tenantSlug) {
      case 'green-valley':
        return { name: 'Green Valley Society', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20' };
      case 'skyline-towers':
        return { name: 'Skyline Towers', color: 'text-pink-400 border-pink-500/30 bg-pink-950/20' };
      case 'lotus-heights':
        return { name: 'Lotus Heights', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20' };
      default:
        return { name: tenantName, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20' };
    }
  };

  const branding = getBrandingTheme();

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      {/* 1. Mobile Menu Header */}
      <header className="md:hidden w-full px-4 py-3 bg-slate-900/90 border-b border-white/5 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-emerald-400" />
          <span className="font-bold text-lg tracking-tight">SaaS Society</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6 text-slate-300" /> : <Menu className="w-6 h-6 text-slate-300" />}
        </button>
      </header>

      {/* 2. Navigation Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-white/5 p-4 flex flex-col justify-between transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col gap-6">
          {/* Logo & Platform Name */}
          <div className="hidden md:flex items-center gap-3 px-2 py-4 border-b border-white/5">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg shadow-neon-green">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">SaaS Society</h1>
              <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-widest">Multi-Tenant v1.0</span>
            </div>
          </div>

          {/* Active Tenant Custom branding Badge */}
          {role !== 'Super Admin' && (
            <div className={`p-3 rounded-lg border flex flex-col gap-1 ${branding.color} transition-all duration-300`}>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Current Workspace</span>
              <span className="font-bold text-sm truncate">{branding.name}</span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 mt-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group
                    ${isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-neon-green' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-100 border border-transparent'}
                  `}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Identity Drawer */}
        <div className="mt-auto border-t border-white/5 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md uppercase">
              {user?.firstName.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-slate-200">{user?.firstName} {user?.lastName}</p>
              <span className="inline-block text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-white/10 text-slate-300 mt-1 border border-white/5">
                {role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 border border-transparent font-semibold text-sm transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Dashboard Window */}
      <main className="flex-1 flex flex-col min-w-0 p-4 md:p-8 overflow-y-auto">
        {/* Dynamic Top Header with Tenant Selector Sandbox */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/5 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight capitalize">
              {activeTab === 'dashboard' ? `Welcome back, ${user?.firstName}!` : `${activeTab.replace('-', ' ')}`}
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">Multi-tenant dashboard system secured with dynamic RBAC parameters.</p>
          </div>

          {/* Dynamic Sandbox Tenant switcher */}
          {role !== 'Super Admin' && (
            <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tenant Sandbox:</span>
              <select
                value={tenantSlug || 'lotus-heights'}
                onChange={handleTenantChange}
                className="bg-dark-bg text-slate-200 text-xs font-bold py-1.5 px-3 rounded-lg border border-white/10 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="lotus-heights">Lotus Heights</option>
                <option value="green-valley">Green Valley Society</option>
                <option value="skyline-towers">Skyline Towers</option>
                {user?.tenant?.slug && user.tenant.slug !== 'lotus-heights' && user.tenant.slug !== 'green-valley' && user.tenant.slug !== 'skyline-towers' && (
                  <option value={user.tenant.slug}>{user.tenant.name}</option>
                )}
              </select>
            </div>
          )}
        </div>

        {/* View Frame */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
export default DashboardLayout;
