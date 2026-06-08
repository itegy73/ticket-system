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

export default function App() {
  
  // Theme state ('light' or 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hotel_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  // Database / core states
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('hotel_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('hotel_current_user');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default to Sami (Manager)
    return INITIAL_USERS[0];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('hotel_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('hotel_tickets');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => {
    const saved = localStorage.getItem('hotel_sync_status');
    if (saved) return JSON.parse(saved);
    return {
      lastSyncTime: new Date().toLocaleTimeString(),
      pendingSyncCount: 0,
      offlineMode: false,
      spreadsheetId: '1H_ux2lYkQ_Z_J2pOCmXN5kE60Q60M2C7'
    };
  });

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

  // Persist states to local storage on modification
  useEffect(() => {
    localStorage.setItem('hotel_tasks', JSON.stringify(tasks));
    
    // Count tasks that are not synced to Sheets
    const unsyncedCount = tasks.filter(t => !t.synced).length;
    setSyncStatus(prev => ({
      ...prev,
      pendingSyncCount: unsyncedCount
    }));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('hotel_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('hotel_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('hotel_tickets', JSON.stringify(tickets));
  }, [tickets]);

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
  const pushNotification = (text: string, type: 'info' | 'success' | 'alert') => {
    const newNotif: Notification = {
      id: 'notif-' + Date.now(),
      text,
      type,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
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

  // Simulated & realistic Google Sheets syncing routing
  const handleSyncWithGoogleSheets = () => {
    setIsSyncing(true);
    setShowSyncBanner(true);
    
    // Simulate API connection latencies
    setTimeout(() => {
      setTasks(prev => prev.map(t => ({ ...t, synced: true })));
      
      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: new Date().toLocaleTimeString(),
        pendingSyncCount: 0
      }));

      setIsSyncing(false);
      pushNotification('تمت مزامنة كافة المهام والخدمات بنجاح في جدول بيانات Google Sheets الرئيسي!', 'success');
      
      setTimeout(() => {
        setShowSyncBanner(false);
      }, 3000);
    }, 1200);
  };

  // CRUD Task handlers
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'synced'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: 't-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: !syncStatus.offlineMode // if offline, synced parameter is false
    };

    setTasks(prev => [newTask, ...prev]);
    pushNotification(`مهمة فندقية جديدة مسجلة بالغرفة ${newTask.roomNumber}: ${newTask.title}`, 'info');
  };

  const handleUpdateTaskStatus = (id: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const statusChanged = task.status !== newStatus;
        if (statusChanged) {
          pushNotification(`تغيير حالة المهمة بالغرفة ${task.roomNumber} لتبدو: ${
            newStatus === 'completed' ? 'مكتملة بنجاح ✅' : newStatus === 'in_progress' ? 'قيد التنفيذ 🛠️' : 'بالانتظار 🕒'
          }`, newStatus === 'completed' ? 'success' : 'info');
        }
        return {
          ...task,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          synced: !syncStatus.offlineMode // resets sync if offline
        };
      }
      return task;
    }));
  };

  const handleUpdateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        return {
          ...task,
          ...updatedFields,
          updatedAt: new Date().toISOString(),
          synced: !syncStatus.offlineMode
        };
      }
      return task;
    }));
    pushNotification(`تم تعديل بيانات المهمة للغرفة بنجاح.`, 'info');
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (taskToDelete) {
      pushNotification(`تم حذف مهمة الغرفة ${taskToDelete.roomNumber} من النظام.`, 'alert');
    }
  };

  // Support Tickets CRUD
  const handleAddTicket = (newTicketData: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => {
    const newTicket: SupportTicket = {
      ...newTicketData,
      id: 'st-' + Date.now(),
      status: 'open',
      createdAt: new Date().toISOString()
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const handleResolveTicket = (id: string, response: string) => {
    setTickets(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: 'resolved', response } 
        : t
    ));
    pushNotification(`تم الرد وحل تذكرة دعم فني فندقية بنجاح.`, 'success');
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
