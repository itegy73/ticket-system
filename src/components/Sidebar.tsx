/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Hotel, 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  HelpCircle, 
  BookOpen, 
  Eye, 
  ShieldAlert,
  User,
  Sliders,
  TableProperties
} from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  currentUser: UserType;
  currentView: string;
  onViewChange: (view: string) => void;
  theme: 'dark' | 'light';
}

export default function Sidebar({
  currentUser,
  currentView,
  onViewChange,
  theme
}: SidebarProps) {
  const isManager = currentUser.role === 'manager';
  const isSupervisor = currentUser.role === 'supervisor';

  // Role names in Arabic
  const roleNamesAr = {
    manager: 'المدير العام',
    supervisor: 'مشرف القسم',
    staff: 'فريق موظفي الفندق'
  };

  const getDeptAr = (dept: string) => {
    switch(dept) {
      case 'housekeeping': return 'قسم النظافة والخدمة';
      case 'maintenance': return 'قسم الصيانة الهندسية';
      case 'food_service': return 'قسم الأغذية والمشروبات';
      default: return 'جميع قطاعات الفندق';
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'الرئيسية والإحصاءات',
      icon: LayoutDashboard,
      allowed: isManager || isSupervisor,
      badge: isManager ? 'التحكم' : 'القسم'
    },
    {
      id: 'tasks',
      label: 'جدول المهمات اليومية',
      icon: ClipboardList,
      allowed: true,
      badge: 'العمل'
    },
    {
      id: 'performance',
      label: 'تقارير أداء الموظفين',
      icon: BarChart3,
      allowed: isManager,
      badge: 'إحصاءات'
    },
    {
      id: 'support',
      label: 'مكتب الدعم الفني',
      icon: HelpCircle,
      allowed: true,
    },
    {
      id: 'docs',
      label: 'أرشيف وجداول جوجل شيت',
      icon: TableProperties,
      allowed: true,
      badge: 'مباشر ☁️'
    }
  ];

  return (
    <>
      {/* Sidebar for Desktop / Tablet (Right-pinned) */}
      <aside className="hidden lg:flex w-72 flex-col shrink-0 border-l transition-colors duration-200 bg-linear-to-b from-maroon-950 to-maroon-900 dark:from-[#170a0c] dark:to-[#120507] text-white border-maroon-800/20 shadow-xl overflow-hidden relative">
        
        {/* Decorative Luxury Gold Ribbon */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-gold-400 via-gold-100 to-gold-600"></div>

        {/* Brand/Header Logo */}
        <div className="flex h-20 items-center gap-3 px-6 border-b border-white/5 pt-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-md">
            <Hotel className="h-5 w-5 text-maroon-950 font-bold" />
          </div>
          <div className="flex flex-col text-right">
            <h1 className="text-sm font-black tracking-wide bg-gradient-to-l from-white via-gold-100 to-amber-200 bg-clip-text text-transparent leading-none">
              نظام مهمات ريجنسي
            </h1>
            <span className="text-[10px] text-gold-400/80 font-medium">إدارة خدمات الغرف والنزلاء</span>
          </div>
        </div>

        {/* Current Active Persona Status Card */}
        <div className="mx-4 my-5 p-3.5 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden group">
          <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-gold-400/5 blur-xl transition-all group-hover:scale-150"></div>
          <div className="flex items-center gap-3 relative z-10 text-right">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white ring-2 ring-gold-500/20 group-hover:ring-gold-500/50 transition-all ${currentUser.avatarColor}`}>
              <User className="h-5 w-5" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold text-gray-100 truncate">{currentUser.fullName}</span>
              <span className="text-[10px] text-gold-400 font-medium leading-relaxed">
                {roleNamesAr[currentUser.role]}
              </span>
              <span className="text-[9px] text-white/50 truncate font-light leading-none">
                {getDeptAr(currentUser.department)}
              </span>
            </div>
          </div>
        </div>

        {/* Real Navigation list */}
        <nav className="flex-1 space-y-1.5 px-3 py-1 text-right">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            if (!item.allowed) return null;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                  active 
                    ? 'bg-gradient-to-l from-maroon-850 to-maroon-600 text-white shadow-lg ring-1 ring-gold-400/30' 
                    : 'text-white/85 hover:text-white hover:bg-white/5'
                }`}
                id={`btn-nav-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${active ? 'text-gold-400' : 'text-white/60'}`} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    active 
                      ? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-400/40' 
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Security & Access Level Reminder Footer */}
        <div className="p-4 border-t border-white/5 text-center text-[10px] text-white/40 space-y-1 bg-black/10">
          <div className="flex justify-center items-center gap-1.5 text-gold-400/80 font-bold">
            <Sliders className="h-3 w-3" />
            <span>ترميز التوزيع المحلي الفندقي</span>
          </div>
          <p className="font-light">مرخص للعمل على الأجهزة اللوحية والمحمولة</p>
        </div>
      </aside>

      {/* Navigation Sub-bar for Mobile Devices (Fixed Bottom Navigation Bar) */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-maroon-950 text-white border-t border-white/10 flex items-center justify-around px-2 pb-safe z-40 shadow-2xl"
        id="nav-mobile"
      >
        {navItems
          .filter(item => item.allowed)
          .map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer max-w-[70px] transition-all ${
                  active ? 'text-gold-400 scale-105' : 'text-white/60'
                }`}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] font-bold truncate tracking-tighter">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
      </nav>
    </>
  );
}
