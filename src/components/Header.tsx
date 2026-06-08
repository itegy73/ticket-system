/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  Database, 
  Cloud,
  Moon, 
  Sun, 
  RefreshCw, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Check,
  User
} from 'lucide-react';
import { User as UserType, Notification, SyncStatus } from '../types';

interface HeaderProps {
  currentUser: UserType;
  users: UserType[];
  onUserChange: (user: UserType) => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
  syncStatus: SyncStatus;
  onToggleOffline: () => void;
  onSyncWithGoogleSheets: () => void;
  isSyncing: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  googleUser: any;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  onRunDiagnostic: (spreadsheetId: string) => Promise<{ logs: { timestamp: string; type: 'info' | 'success' | 'error'; message: string }[]; success: boolean }>;
}

export default function Header({
  currentUser,
  users,
  onUserChange,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  syncStatus,
  onToggleOffline,
  onSyncWithGoogleSheets,
  isSyncing,
  theme,
  onToggleTheme,
  googleUser,
  onGoogleLogin,
  onGoogleLogout,
  onRunDiagnostic
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSheetsConfig, setShowSheetsConfig] = useState(false);
  const [sheetIdInput, setSheetIdInput] = useState(syncStatus.spreadsheetId || '1H_ux2lYkQ_Z_J2pOCmXN5kE60Q60M2C7');
  const [diagnosticLogs, setDiagnosticLogs] = useState<{ timestamp: string; type: 'info' | 'success' | 'error'; message: string }[]>([]);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const handleRunDiagnostics = async () => {
    setIsDiagnosing(true);
    setDiagnosticLogs([{ timestamp: new Date().toLocaleTimeString('ar-EG'), type: 'info', message: 'جاري تهيئة فحص الاتصال التلقائي...' }]);
    try {
      const result = await onRunDiagnostic(sheetIdInput);
      setDiagnosticLogs(result.logs);
    } catch (err: any) {
      setDiagnosticLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString('ar-EG'),
          type: 'error',
          message: `خطأ غير متوقع أثناء الفحص: ${err?.message || err}`
        }
      ]);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSheetIdSave = (e: React.FormEvent) => {
    e.preventDefault();
    syncStatus.spreadsheetId = sheetIdInput;
    setShowSheetsConfig(false);
    onSyncWithGoogleSheets();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 md:px-6 transition-colors duration-200 bg-white dark:bg-[#1a1315] border-gray-100 dark:border-maroon-950/40 shadow-xs">
      {/* Search / Context App Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center p-2 rounded-lg bg-maroon-50 dark:bg-maroon-950/60 ring-1 ring-maroon-100 dark:ring-maroon-900/40">
          <span className="font-bold text-maroon-850 dark:text-maroon-200 text-sm md:text-base">
            فندق ريجنسي الفاخر
          </span>
        </div>
        
        {/* Connection Status Flag */}
        <button 
          onClick={onToggleOffline}
          className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold select-none cursor-pointer transition-all ${
            syncStatus.offlineMode 
              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-900/30' 
              : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-900/30'
          }`}
          title="انقر لتبديل الاتصال بالإنترنت محاكاة للأوفلاين"
          id="btn-connection-toggle"
        >
          {syncStatus.offlineMode ? (
            <>
              <WifiOff className="h-3.5 w-3.5" />
              <span>وضع الأوفلاين (مُحاكى)</span>
            </>
          ) : (
            <>
              <Wifi className="h-3.5 w-3.5" />
              <span>تحت الاتصال (مباشر)</span>
            </>
          )}
        </button>
      </div>

      {/* Access Tools Control Row */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Google Sheets Sync Button */}
        <div className="relative">
          <button
            onClick={() => setShowSheetsConfig(!showSheetsConfig)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer shadow-xs text-[11px] md:text-xs font-bold leading-none ${
              syncStatus.googleEmail 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 hover:scale-[1.02]'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-950/50 hover:scale-[1.02]'
            }`}
            title="إعدادات ومزامنة جوجل شيت"
            id="btn-sheets-config"
          >
            <Cloud className={`h-4.5 w-4.5 shrink-0 ${isSyncing ? 'animate-bounce text-emerald-500' : 'text-amber-500 dark:text-amber-300'}`} />
            <span>{syncStatus.googleEmail ? 'جوجل شيت متصل ☁️' : 'ربط جوجل شيت ☁️'}</span>
            
            {syncStatus.pendingSyncCount > 0 && (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                {syncStatus.pendingSyncCount}
              </span>
            )}
          </button>

          {/* Google Sheets Sync Quick Info Dropdown */}
          {showSheetsConfig && (
            <div className="absolute left-0 mt-2 w-80 origin-top-left rounded-xl bg-white dark:bg-[#1f1618] border border-gray-100 dark:border-maroon-900/40 p-4 shadow-xl z-50">
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1 flex items-center justify-between">
                <span>الربط المباشر بجوجل شيت</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${syncStatus.googleEmail ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400'}`}>
                  {syncStatus.googleEmail ? 'مربوط' : 'غير متصل'}
                </span>
              </h3>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                {syncStatus.googleEmail 
                  ? 'يتصل التطبيق بحسابك الشخصي على Google Drive لمزامنة وحفظ التعديلات في جدول بيانات فندقي خاص بك.'
                  : 'اربط حساب Google الخاص بك ليقوم النظام تلقائياً بإنشاء ورقة بيانات Sheets خاصة بك في Drive ومزامنة المهام.'}
              </p>

              {/* Connected Google Account Details */}
              {syncStatus.googleEmail ? (
                <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-maroon-950/30 border border-gray-100 dark:border-maroon-900/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">الحساب المرتبط:</span>
                    <strong className="text-maroon-850 dark:text-maroon-200 select-all">{syncStatus.googleEmail}</strong>
                  </div>
                  
                  {syncStatus.spreadsheetUrl && (
                    <div className="pt-2 border-t border-gray-100 dark:border-maroon-900/10 flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400">رابط ورقة البيانات المزامنة:</span>
                      <a 
                        href={syncStatus.spreadsheetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        referrerPolicy="no-referrer"
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold truncate"
                      >
                        📊 فتح ورقة العمل في Google Drive ↗
                      </a>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => {
                        onGoogleLogout();
                      }}
                      className="text-[10px] text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                    >
                      تسجيل الخروج وقطع الاتصال
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowSheetsConfig(false);
                      onGoogleLogin();
                    }}
                    className="w-full h-10 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 dark:border-maroon-900/40 rounded-lg hover:bg-gray-50 dark:hover:bg-maroon-950/20 text-xs font-bold transition-all bg-white dark:bg-black text-gray-700 dark:text-gray-200 cursor-pointer shadow-xs"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53y" fill="#EA4335"/>
                    </svg>
                    <span>ربط وتزامن مع حساب Google</span>
                  </button>
                </div>
              )}

              {/* Standard sheet ID config input */}
              <form onSubmit={handleSheetIdSave} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">معرّف جدول البيانات اليدوي (Spreadsheet ID)</label>
                  <input
                    type="text"
                    value={sheetIdInput}
                    onChange={(e) => setSheetIdInput(e.target.value)}
                    placeholder="سيتم إنشاؤه وتعبئته تلقائياً"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-maroon-900/50 bg-gray-50 dark:bg-maroon-950/40 text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-1 focus:ring-maroon-850"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-maroon-900/20 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    بانتظار النقل: <strong className="font-semibold text-maroon-800 dark:text-maroon-300">{syncStatus.pendingSyncCount} مهام</strong>
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSheetsConfig(false);
                        onSyncWithGoogleSheets();
                      }}
                      className="px-2.5 py-1 bg-maroon-850 hover:bg-maroon-900 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="h-3 w-3" />
                      مزامنة الآن
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-gray-100 dark:bg-maroon-900 text-gray-700 dark:text-gray-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                    >
                      حفظ المعرّف
                    </button>
                  </div>
                </div>
              </form>

              {/* Diagnostic Section */}
              <div className="mt-4 pt-3 border-t border-gray-150 dark:border-maroon-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">أداة فحص واكتشاف الأخطاء للربط 🛠️</span>
                  <button
                    type="button"
                    onClick={handleRunDiagnostics}
                    disabled={isDiagnosing}
                    className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:dark:bg-maroon-950/20 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    {isDiagnosing ? 'جاري الفحص...' : 'فحص الاتصال والملف'}
                  </button>
                </div>

                {/* Diagnostic Logs Panel */}
                {diagnosticLogs.length > 0 && (
                  <div className="rounded-lg bg-gray-900 text-gray-200 p-2.5 font-mono text-[9px] max-h-48 overflow-y-auto space-y-1.5 text-left select-text" style={{ direction: 'ltr' }}>
                    {diagnosticLogs.map((log, index) => (
                      <div
                        key={index}
                        className={`${
                          log.type === 'error'
                            ? 'text-red-400 font-semibold'
                            : log.type === 'success'
                            ? 'text-emerald-400'
                            : 'text-sky-300'
                        }`}
                      >
                        <span className="opacity-50 text-[8px] mr-1">[{log.timestamp}]</span>
                        {log.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:text-maroon-850 dark:text-gray-400 dark:hover:text-maroon-200 hover:bg-gray-100 dark:hover:bg-maroon-950/40 cursor-pointer transition-all"
          title={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}
          id="btn-theme-toggle"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-500" />}
        </button>

        {/* Live Notifications dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-gray-500 hover:text-maroon-850 dark:text-gray-400 dark:hover:text-maroon-200 hover:bg-gray-100 dark:hover:bg-maroon-950/40 cursor-pointer transition-all relative"
            title="التنبيهات الفورية"
            id="btn-notifications-toggle"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 origin-top-left rounded-xl bg-white dark:bg-[#1f1618] border border-gray-100 dark:border-maroon-900/40 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-maroon-900/20 px-4 py-3">
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-maroon-850 dark:text-maroon-300" />
                  التنبيهات الفورية
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">({unreadCount} غير مقروءة)</span>
              </div>

              <div className="max-h-64 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
                    لا توجد تنبيهات حالية.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`flex gap-2.5 border-b border-gray-50 dark:border-maroon-950/20 px-4 py-2.5 text-right transition-colors hover:bg-gray-50 dark:hover:bg-maroon-950/30 ${
                        !notif.read ? 'bg-rose-50/40 dark:bg-maroon-950/15' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'alert' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : notif.type === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className={`text-xs leading-relaxed ${!notif.read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                          {notif.text}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-400 dark:text-gray-500">
                            {new Date(notif.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!notif.read && (
                            <button
                              onClick={() => onMarkNotificationRead(notif.id)}
                              className="text-[9px] text-maroon-850 dark:text-maroon-400 hover:underline cursor-pointer flex items-center gap-0.5"
                            >
                              <Check className="h-2 w-2" />
                              تحديد كمقروء
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="border-t border-gray-100 dark:border-maroon-900/20 p-2 text-center">
                  <button 
                    onClick={onClearAllNotifications}
                    className="w-full text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-maroon-850 dark:hover:text-maroon-300 cursor-pointer"
                  >
                    مسح كافة التنبيهات
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Identity switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-gray-100 dark:border-maroon-900/30 hover:bg-gray-50 dark:hover:bg-maroon-950/30 cursor-pointer transition-all"
            id="btn-user-profile"
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-white font-bold text-xs ring-1 ring-white/10 ${currentUser.avatarColor}`}>
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="hidden md:flex flex-col items-start text-right">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">{currentUser.fullName}</span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 leading-none">
                {currentUser.role === 'manager' ? 'مدير عام الفندق' : currentUser.role === 'supervisor' ? `مشرف قسم` : 'موظف تنفيذى'}
              </span>
            </div>
            <ChevronDown className="hidden md:block h-3 w-3 text-gray-400 dark:text-gray-500" />
          </button>

          {showUserDropdown && (
            <div className="absolute left-0 mt-2 w-56 origin-top-left rounded-xl bg-white dark:bg-[#1f1618] border border-gray-100 dark:border-maroon-900/40 p-1.5 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-maroon-900/20 mb-1">
                <span className="block text-[10px] text-gray-400 dark:text-gray-500">تغيير المستخدم لاختبار الصلاحيات:</span>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onUserChange(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between text-right px-3 py-2 rounded-lg text-xs cursor-pointer hover:bg-maroon-50 dark:hover:bg-maroon-950/30 transition-colors ${
                      u.id === currentUser.id ? 'bg-maroon-50 dark:bg-maroon-950/50 text-maroon-900 dark:text-maroon-200 font-semibold' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-5 w-5 rounded-md text-white font-bold text-[9px] flex items-center justify-center ${u.avatarColor}`}>
                        {u.fullName.charAt(0)}
                      </div>
                      <span className="truncate max-w-[130px]">{u.fullName}</span>
                    </div>
                    <span className="text-[9px] bg-gray-100 dark:bg-maroon-950/40 px-1.5 py-0.5 rounded text-gray-400 dark:text-gray-500">
                      {u.role === 'manager' ? 'مدير' : u.role === 'supervisor' ? 'مشرف' : 'طاقم'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
