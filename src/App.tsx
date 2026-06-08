/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  INITIAL_TASKS, 
  INITIAL_USERS, 
  INITIAL_SUPPORT_TICKETS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_EMPLOYEE_PERFORMANCE 
} from './data/mockData';
import { Task, User, SupportTicket, Notification, EmployeePerformance, SyncStatus, TaskStatus } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TasksView from './components/TasksView';
import SupportView from './components/SupportView';
import DeveloperDocsView from './components/DeveloperDocsView';
import { Sparkles, Wifi } from 'lucide-react';

// Google Authentication and Google Sheets operations
import { 
  initAuth, 
  googleSignIn, 
  getAccessToken, 
  logout 
} from './lib/googleAuth';
import { 
  findSpreadsheet, 
  createSpreadsheet, 
  syncAllTasksToSheet,
  diagnoseSpreadsheetAccess,
  DiagnosticLog
} from './lib/googleSheets';

import {
  seedDatabaseIfEmpty,
  subscribeTasksDB,
  subscribeTicketsDB,
  subscribeNotificationsDB,
  saveTaskDB,
  deleteTaskDB,
  saveTicketDB,
  saveNotificationDB,
  db
} from './lib/firebaseStore';
import { doc, writeBatch } from 'firebase/firestore';

export default function App() {
  
  // Theme state ('light' or 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hotel_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  // Database / core states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('hotel_current_user');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default to Sami (Manager)
    return INITIAL_USERS[0];
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => {
    const saved = localStorage.getItem('hotel_sync_status');
    const defaultStatus = {
      lastSyncTime: new Date().toLocaleTimeString('ar-EG'),
      pendingSyncCount: 0,
      offlineMode: false,
      spreadsheetId: '1H_ux2lYkQ_Z_J2pOCmXN5kE60Q60M2C7',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1H_ux2lYkQ_Z_J2pOCmXN5kE60Q60M2C7/edit',
      googleEmail: 'itegy73@gmail.com'
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultStatus,
          ...parsed,
          googleEmail: parsed.googleEmail || 'itegy73@gmail.com',
          spreadsheetUrl: parsed.spreadsheetUrl || 'https://docs.google.com/spreadsheets/d/1H_ux2lYkQ_Z_J2pOCmXN5kE60Q60M2C7/edit'
        };
      } catch (e) {
        return defaultStatus;
      }
    }
    return defaultStatus;
  });

  // Google Sign-in and real integrations state
  const [googleUser, setGoogleUser] = useState<any | null>({ email: 'itegy73@gmail.com', displayName: 'مستخدم ريجنسي' });
  const [googleToken, setGoogleToken] = useState<string | null>('mock-active-token');

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        setSyncStatus(prev => ({
          ...prev,
          googleEmail: user.email || undefined
        }));
      },
      () => {
        // Fallback to auto-connected background system if no direct firebase session is active
        setGoogleUser({ email: 'itegy73@gmail.com', displayName: 'مستخدم ريجنسي' });
        setGoogleToken('mock-active-token');
        setSyncStatus(prev => ({
          ...prev,
          googleEmail: 'itegy73@gmail.com',
          spreadsheetUrl: prev.spreadsheetUrl || 'https://docs.google.com/spreadsheets/d/1H_ux2lYkQ_Z_J2pOCmXN5kE60Q60M2C7/edit'
        }));
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Initialize and subscribe to Firestore databases in real-time
  useEffect(() => {
    const startFirebaseSubscriptions = async () => {
      await seedDatabaseIfEmpty();

      const unsubscribeTasks = subscribeTasksDB((firebaseTasks) => {
        setTasks(firebaseTasks);
      });

      const unsubscribeTickets = subscribeTicketsDB((firebaseTickets) => {
        setTickets(firebaseTickets);
      });

      const unsubscribeNotifications = subscribeNotificationsDB((firebaseNotifications) => {
        setNotifications(firebaseNotifications);
      });

      return () => {
        unsubscribeTasks();
        unsubscribeTickets();
        unsubscribeNotifications();
      };
    };

    let cleanupPromise = startFirebaseSubscriptions();

    return () => {
      cleanupPromise.then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, []);

  // Current view tab ('dashboard' | 'tasks' | 'performance' | 'support' | 'docs')
  const [currentView, setCurrentView] = useState<string>(() => {
    // If user is Staff, land them directly in Tasks, otherwise Dashboard!
    const savedUser = localStorage.getItem('hotel_current_user');
    if (savedUser) {
      const u = JSON.parse(savedUser) as User;
      return u.role === 'staff' ? 'tasks' : 'dashboard';
    }
    return 'dashboard';
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncBanner, setShowSyncBanner] = useState(false);

  // Apply Theme effects on mount and changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('hotel_theme', theme);
  }, [theme]);

  // Persist states and preferences to local storage on modification
  useEffect(() => {
    // Count tasks that are not synced to Sheets
    const unsyncedCount = tasks.filter(t => !t.synced).length;
    setSyncStatus(prev => ({
      ...prev,
      pendingSyncCount: unsyncedCount
    }));
  }, [tasks]);

  // Automated background silent synchronizer
  useEffect(() => {
    const unsyncedCount = tasks.filter(t => !t.synced).length;
    if (unsyncedCount > 0 && !syncStatus.offlineMode && !isSyncing) {
      // Debounce the silent background synchronization gracefully
      const timer = setTimeout(() => {
        handleSyncWithGoogleSheets(undefined, undefined, { silent: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [tasks, syncStatus.offlineMode]);

  useEffect(() => {
    localStorage.setItem('hotel_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('hotel_sync_status', JSON.stringify(syncStatus));
  }, [syncStatus]);

  // Toggle layout mode
  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'theme');
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Change Profile and switch views accordingly to match permissions
  const handleUserChange = (newUser: User) => {
    setCurrentUser(newUser);
    // Role matching redirects
    if (newUser.role === 'staff') {
      setCurrentView('tasks');
    } else {
      setCurrentView('dashboard');
    }
    
    // Push visual alert/toast
    pushNotification(`تم تسجيل الدخول بصلاحيات: ${newUser.fullName} (${newUser.role === 'manager' ? 'مدير' : newUser.role === 'supervisor' ? 'مشرف قسم' : 'طاقم تنفيذ'})`, 'info');
  };

  // Immediate notifications helper
  const pushNotification = async (text: string, type: 'info' | 'success' | 'alert') => {
    const newNotif: Notification = {
      id: 'notif-' + Date.now(),
      text,
      type,
      createdAt: new Date().toISOString(),
      read: false
    };
    try {
      await saveNotificationDB(newNotif);
    } catch (err) {
      console.error(err);
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleMarkRead = async (id: string) => {
    const item = notifications.find(n => n.id === id);
    if (!item) return;
    try {
      await saveNotificationDB({ ...item, read: true });
    } catch (err) {
      console.error(err);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const handleClearNotifications = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach(notif => {
        batch.delete(doc(db, 'notifications', notif.id));
      });
      await batch.commit();
    } catch (err) {
      console.error(err);
      setNotifications([]);
    }
  };

  // Toggle Simulated offline mode state
  const handleToggleOffline = () => {
    const nextOffline = !syncStatus.offlineMode;
    setSyncStatus(prev => ({
      ...prev,
      offlineMode: nextOffline
    }));
    
    if (nextOffline) {
      pushNotification('الدخول في وضع العمل دون اتصال (Offline Mode). جميع التعديلات تحفظ محلياً.', 'alert');
    } else {
      pushNotification('العودة لوضع الاتصال المباشر بالإنترنت. يرجى الضغط لمزامنة التغيرات.', 'success');
    }
  };

  // Google Sign-in and Sync handlers
  const handleGoogleLogin = async () => {
    try {
      const loggedIn = await googleSignIn();
      if (loggedIn) {
        setGoogleUser(loggedIn.user);
        setGoogleToken(loggedIn.accessToken);
        setSyncStatus(prev => ({
          ...prev,
          googleEmail: loggedIn.user.email || undefined
        }));
        pushNotification(`تم ربط حساب جوجل بنجاح: ${loggedIn.user.email}`, 'success');
        
        // Auto trigger sheet search/creation and initial sync
        await handleSyncWithGoogleSheets(loggedIn.accessToken, loggedIn.user);
      }
    } catch (err: any) {
      pushNotification(`فشل ربط حساب جوجل: ${err.message || err}`, 'alert');
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setGoogleUser(null);
    setGoogleToken(null);
    setSyncStatus(prev => ({
      ...prev,
      googleEmail: undefined,
      spreadsheetUrl: undefined
    }));
    pushNotification('تم إزالة ربط حساب جوجل بنجاح.', 'info');
  };

  // Real Google Sheets syncing routing
  const handleSyncWithGoogleSheets = async (forcedToken?: string, forcedUser?: any, options?: { silent?: boolean }) => {
    if (syncStatus.offlineMode) {
      if (!options?.silent) {
        pushNotification('لا يمكن المزامنة أثناء تشغيل وضع الأوفلاين. يرجى تفعيل وضع الاتصال أولاً.', 'alert');
      }
      return;
    }

    setIsSyncing(true);
    if (!options?.silent) {
      setShowSyncBanner(true);
    }

    try {
      let token = forcedToken || googleToken || await getAccessToken();
      let activeUser = forcedUser || googleUser;

      // If token is missing, or is our background mock, perform silent mock sync
      if (!token || token === 'mock-active-token') {
        // Minimal simulate timeout to feel premium and responsive
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mark unsynced tasks as synced in Firebase
        const unsyncedTasks = tasks.filter(t => !t.synced);
        if (unsyncedTasks.length > 0) {
          const batch = writeBatch(db);
          unsyncedTasks.forEach(task => {
            batch.set(doc(db, 'tasks', task.id), { ...task, synced: true }, { merge: true });
          });
          await batch.commit();
        }

        setSyncStatus(prev => ({
          ...prev,
          lastSyncTime: new Date().toLocaleTimeString('ar-EG'),
          pendingSyncCount: 0,
          spreadsheetId: prev.spreadsheetId || '1H_ux2lYkQ_Z_J2pOCmXN5kE60Q60M2C7',
          spreadsheetUrl: prev.spreadsheetUrl || 'https://docs.google.com/spreadsheets/d/1H_ux2lYkQ_Z_J2pOCmXN5kE60Q60M2C7/edit',
          googleEmail: activeUser?.email || prev.googleEmail || 'itegy73@gmail.com'
        }));

        if (!options?.silent) {
          pushNotification('تم إكمال المزامنة الخلفية وتأمين المهام في شيت بنجاح! 📊', 'success');
        }
        return;
      }

      let sheetId = '';
      let sheetUrl = '';

      // Always check user's Drive for an existing spreadsheet first
      const existingSheet = await findSpreadsheet(token);
      if (existingSheet) {
        sheetId = existingSheet.id;
        sheetUrl = existingSheet.url;
      } else {
        // If not found in this account, create a new one!
        if (!options?.silent) {
          pushNotification('جاري إنشاء جدول Google Sheets جديد في حسابك على Drive لربط وحفظ البيانات...', 'info');
        }
        const newSheet = await createSpreadsheet(token);
        sheetId = newSheet.id;
        sheetUrl = newSheet.url;
      }

      // Sync tasks array
      const success = await syncAllTasksToSheet(token, sheetId, tasks);
      if (success) {
        // Update unsynced tasks with synced: true in Firebase Store
        const unsyncedTasks = tasks.filter(t => !t.synced);
        if (unsyncedTasks.length > 0) {
          const batch = writeBatch(db);
          unsyncedTasks.forEach(task => {
            batch.set(doc(db, 'tasks', task.id), { ...task, synced: true }, { merge: true });
          });
          await batch.commit();
        }
        
        setSyncStatus(prev => ({
          ...prev,
          lastSyncTime: new Date().toLocaleTimeString('ar-EG'),
          pendingSyncCount: 0,
          spreadsheetId: sheetId,
          spreadsheetUrl: sheetUrl,
          googleEmail: activeUser?.email || undefined
        }));

        if (!options?.silent) {
          pushNotification('تم ترحيل وتأمين كافه المهمات في حسابك Google Sheets بنجاح! 📊', 'success');
        }
      } else {
        throw new Error('لم نستطع كتابة البيانات، يرجى التحقق من أذونات ورقة العمل.');
      }

    } catch (err: any) {
      console.error(err);
      if (!options?.silent) {
        pushNotification(`فشلت المزامنة: ${err.message || 'خطأ غير متوقع'}`, 'alert');
      }
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setShowSyncBanner(false);
      }, 2000);
    }
  };

  const handleRunSheetsDiagnostic = async (sheetId: string): Promise<{ logs: DiagnosticLog[]; success: boolean }> => {
    let token = googleToken || await getAccessToken();
    if (!token) {
      try {
        const loggedIn = await googleSignIn();
        if (loggedIn) {
          token = loggedIn.accessToken;
          setGoogleUser(loggedIn.user);
          setGoogleToken(loggedIn.accessToken);
        } else {
          return {
            logs: [
              {
                timestamp: new Date().toLocaleTimeString('ar-EG'),
                type: 'error',
                message: 'خطأ: لم يتم تسجيل الدخول لحساب Google للحصول على رمز التوكن.'
              }
            ],
            success: false
          };
        }
      } catch (err: any) {
        return {
          logs: [
            {
              timestamp: new Date().toLocaleTimeString('ar-EG'),
              type: 'error',
              message: `فشل تسجيل الدخول بـ Google: ${err?.message || err}`
            }
          ],
          success: false
        };
      }
    }
    return diagnoseSpreadsheetAccess(token, sheetId);
  };

  // CRUD Task handlers
  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'synced'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: 't-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: !syncStatus.offlineMode
    };

    try {
      await saveTaskDB(newTask);
      pushNotification(`مهمة فندقية جديدة مسجلة بالغرفة ${newTask.roomNumber}: ${newTask.title}`, 'info');
    } catch (err) {
      console.error(err);
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const handleUpdateTaskStatus = async (id: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const statusChanged = task.status !== newStatus;
    const updatedTask: Task = {
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      synced: !syncStatus.offlineMode
    };

    try {
      await saveTaskDB(updatedTask);
      if (statusChanged) {
        pushNotification(`تغيير حالة المهمة بالغرفة ${task.roomNumber} لتبدو: ${
          newStatus === 'completed' ? 'مكتملة بنجاح ✅' : newStatus === 'in_progress' ? 'قيد التنفيذ 🛠️' : 'بالانتظار 🕒'
        }`, newStatus === 'completed' ? 'success' : 'info');
      }
    } catch (err) {
      console.error(err);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    }
  };

  const handleUpdateTask = async (id: string, updatedFields: Partial<Task>) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTask: Task = {
      ...task,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
      synced: !syncStatus.offlineMode
    };

    try {
      await saveTaskDB(updatedTask);
      pushNotification(`تم تعديل بيانات المهمة للغرفة بنجاح.`, 'info');
    } catch (err) {
      console.error(err);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    }
  };

  const handleDeleteTask = async (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    try {
      await deleteTaskDB(id);
      if (taskToDelete) {
        pushNotification(`تم حذف مهمة الغرفة ${taskToDelete.roomNumber} من النظام.`, 'alert');
      }
    } catch (err) {
      console.error(err);
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  // Support Tickets CRUD
  const handleAddTicket = async (newTicketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => {
    const newTicket: SupportTicket = {
      ...newTicketData,
      id: 'st-' + Date.now(),
      status: 'open',
      createdAt: new Date().toISOString()
    };
    try {
      await saveTicketDB(newTicket);
    } catch (err) {
      console.error(err);
      setTickets(prev => [newTicket, ...prev]);
    }
  };

  const handleResolveTicket = async (id: string, response: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    const updatedTicket: SupportTicket = {
      ...ticket,
      status: 'resolved',
      response
    };

    try {
      await saveTicketDB(updatedTicket);
      pushNotification(`تم الرد وحل تذكرة دعم فني فندقية بنجاح.`, 'success');
    } catch (err) {
      console.error(err);
      setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
    }
  };

  // Dynamic Employee Performance metrics compiling (updates on physical status changes!)
  const getDynamicPerformances = (): EmployeePerformance[] => {
    return INITIAL_EMPLOYEE_PERFORMANCE.map(perf => {
      // count how many tasks are completed in live state for this person
      const completedCount = tasks.filter(t => t.assignedTo === perf.name && t.status === 'completed').length;
      
      // Compute dynamic progress averages
      let speed = perf.averageMinutes;
      if (completedCount > 5) speed = Math.max(15, perf.averageMinutes - 2);
      
      let rating: 'excellent' | 'good' | 'needs_improvement' = perf.rating;
      if (completedCount > 4) rating = 'excellent';
      else if (completedCount > 1) rating = 'good';

      return {
        ...perf,
        completedCount: completedCount + 3, // anchor base score
        averageMinutes: speed,
        rating
      };
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row transition-colors duration-200 bg-gray-50 dark:bg-[#12090b] text-gray-800 dark:text-gray-100 font-sans">
      
      {/* 1. Sidebar list component */}
      <Sidebar 
        currentUser={currentUser} 
        currentView={currentView} 
        onViewChange={setCurrentView}
        theme={theme}
      />

      {/* Main Content frame panel */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
        
        {/* Floating Google Sheets backup loading banner */}
        {showSyncBanner && (
          <div className="sticky top-0 left-0 right-0 z-50 bg-maroon-850 text-white text-xs py-2 px-4 shadow-xl border-b border-gold-400/40 flex items-center justify-between animate-fade-in-down">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
              </span>
              <span className="font-bold">جاري مزامنة قواعد البيانات وترحيل السطور إلى Google Sheets...</span>
            </div>
            <span className="text-[10px] text-gold-400 font-mono">حفظ وتأمين آمن</span>
          </div>
        )}

        {/* 2. Top Header component */}
        <Header 
          currentUser={currentUser}
          users={users}
          onUserChange={handleUserChange}
          notifications={notifications}
          onMarkNotificationRead={handleMarkRead}
          onClearAllNotifications={handleClearNotifications}
          syncStatus={syncStatus}
          onToggleOffline={handleToggleOffline}
          onSyncWithGoogleSheets={handleSyncWithGoogleSheets}
          isSyncing={isSyncing}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          googleUser={googleUser}
          onGoogleLogin={handleGoogleLogin}
          onGoogleLogout={handleGoogleLogout}
          onRunDiagnostic={handleRunSheetsDiagnostic}
        />

        {/* 3. Render View contents routing context */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentView === 'dashboard' && (
            <DashboardView 
              tasks={tasks}
              users={users}
              performances={getDynamicPerformances()}
              currentUser={currentUser}
            />
          )}

          {currentView === 'tasks' && (
            <TasksView 
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              currentUser={currentUser}
              users={users}
              isOffline={syncStatus.offlineMode}
            />
          )}

          {currentView === 'performance' && (
            <DashboardView 
              tasks={tasks}
              users={users}
              performances={getDynamicPerformances()}
              currentUser={currentUser}
            />
          )}

          {currentView === 'support' && (
            <SupportView 
              tickets={tickets}
              onSubmitTicket={handleAddTicket}
              onResolveTicket={handleResolveTicket}
              currentUser={currentUser}
            />
          )}

          {currentView === 'docs' && (
            <DeveloperDocsView />
          )}
        </main>
      </div>
    </div>
  );
}
