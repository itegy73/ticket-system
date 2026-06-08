/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Circle, 
  RotateCw, 
  Trash2, 
  Edit3, 
  UserPlus, 
  Bookmark, 
  Sparkles,
  WifiOff, 
  Check,
  AlertOctagon,
  Eye,
  Briefcase
} from 'lucide-react';
import { Task, User, Department, TaskStatus, TaskPriority } from '../types';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'synced'>) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onUpdateTask: (id: string, updated: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  currentUser: User;
  users: User[];
  isOffline: boolean;
}

export default function TasksView({
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onUpdateTask,
  onDeleteTask,
  currentUser,
  users,
  isOffline
}: TasksViewProps) {
  
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<'all' | Department>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form Fields for Add
  const [newTitle, setNewTitle] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newDept, setNewDept] = useState<Department>('housekeeping');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newAssignee, setNewAssignee] = useState('');

  // Form Fields for Edit/Update
  const [editTitle, setEditTitle] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editDept, setEditDept] = useState<Department>('housekeeping');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editAssignee, setEditAssignee] = useState('');

  // Determine current user permissions
  const isManager = currentUser.role === 'manager';
  const isSupervisor = currentUser.role === 'supervisor';
  const isStaff = currentUser.role === 'staff';

  // Apply customized privacy and section permissions
  // 1. Staff can only see tasks assigned to them, or unassigned tasks in their specific department
  // 2. Supervisor can see and manage all tasks of their OWN department. For other departments, they are restricted
  // 3. Manager has unrestricted access to view and edit everything.
  const getVisibleTasks = () => {
    return tasks.filter(task => {
      // 1. Staff permission restriction
      if (isStaff) {
        if (currentUser.department !== 'all' && task.department !== currentUser.department) {
          return false;
        }
        // Staff should only see tasks assigned to them or unassigned in their department
        return task.assignedTo === currentUser.fullName || !task.assignedTo;
      }
      
      // 2. Supervisor permission restriction
      if (isSupervisor) {
        // If supervisor has a specific department, restrict search & view to that department for privacy
        if (currentUser.department !== 'all' && task.department !== currentUser.department) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredTasks = getVisibleTasks().filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = deptFilter === 'all' || task.department === deptFilter;
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesDept && matchesStatus && matchesPriority;
  });

  // Filter possible assignees based on task department
  const getStaffForDept = (dept: Department) => {
    return users.filter(u => u.role === 'staff' && (u.department === dept || u.department === 'all'));
  };

  const handleOpenAddModal = () => {
    // If supervisor, auto-select their own department and restrict changes if needed
    if (isSupervisor && currentUser.department !== 'all') {
      setNewDept(currentUser.department as Department);
    } else {
      setNewDept('housekeeping');
    }
    setNewTitle('');
    setNewRoom('');
    setNewDesc('');
    setNewPriority('medium');
    setNewAssignee('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditRoom(task.roomNumber);
    setEditDept(task.department);
    setEditDesc(task.description);
    setEditPriority(task.priority);
    setEditAssignee(task.assignedTo || '');
    setShowEditModal(true);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newRoom) {
      alert('يرجى كتابة عنوان المهمة ورقم الغرفة أولاً');
      return;
    }
    
    onAddTask({
      title: newTitle,
      roomNumber: newRoom,
      department: newDept,
      description: newDesc,
      status: 'pending',
      priority: newPriority,
      assignedTo: newAssignee || undefined,
      createdBy: currentUser.fullName
    });
    
    setShowAddModal(false);
  };

  const handleUpdateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    if (!editTitle || !editRoom) {
      alert('يرجى تدوين عنوان وتفاصيل الغرفة');
      return;
    }

    onUpdateTask(selectedTask.id, {
      title: editTitle,
      roomNumber: editRoom,
      department: editDept,
      description: editDesc,
      priority: editPriority,
      assignedTo: editAssignee || undefined
    });

    setShowEditModal(false);
    setSelectedTask(null);
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'high':
        return 'bg-red-50 text-red-700 dark:bg-rose-950/40 dark:text-rose-300 border-red-200 dark:border-rose-900/30';
      case 'medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/30';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 border-gray-200 dark:border-zinc-700/50';
    }
  };

  const getPriorityLabelAr = (p: TaskPriority) => {
    switch (p) {
      case 'high': return 'عاجلة جداً';
      case 'medium': return 'متوسطة الأهمية';
      default: return 'عادية';
    }
  };

  const getDeptLabelAr = (d: Department) => {
    switch (d) {
      case 'housekeeping': return 'النظافة وتجهيز الغرف';
      case 'maintenance': return 'الصيانة الهندسية';
      default: return 'خدمة الأغذية والمشروبات';
    }
  };

  const getStatusLabelAr = (s: TaskStatus) => {
    switch(s) {
      case 'pending': return 'بالانتظار';
      case 'in_progress': return 'قيد التنفيذ';
      default: return 'مكتملة';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10 text-right">

      {/* View Title Control Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs">
        <div>
          <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100">
            {isStaff ? 'المهام والخدمات المكلف بها' : 'غرفة التنسيق ومتابعة المهمات الفندقية'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isStaff 
              ? 'يرجى مراجعة الجدول وتنفيذ المهام وتحديث حالتها فوراً لرفع نسبة تقييمك.' 
              : 'شاشة متكاملة للمتابعة والتغيير الفوري للمهام لرفع كفاءة النظافة والصيانة بالفندق.'}
          </p>
        </div>

        {/* Create button (Manager & Supervisors only) */}
        {!isStaff && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 justify-center px-4 py-2 bg-maroon-850 hover:bg-maroon-900 text-gold-100 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>تسجيل مهمة جديدة للغرف</span>
          </button>
        )}
      </div>

      {/* Filter and search control board */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs space-y-3">
        
        {/* Row 1: Search Bar & Department filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              placeholder="ابحث برقم الغرفة، عنوان المهمة، أو التفاصيل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pr-10 pl-3 py-2 rounded-xl border border-gray-200 dark:border-maroon-900/40 bg-gray-50 dark:bg-maroon-950/20 text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-1 focus:ring-maroon-850"
            />
            <Search className="absolute right-3.5 top-2.5 h-4.5 w-4.5 text-gray-400" />
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value as 'all' | Department)}
              disabled={isSupervisor && currentUser.department !== 'all'}
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-maroon-900/40 bg-gray-50 dark:bg-maroon-950/20 text-gray-800 dark:text-gray-200 focus:outline-hidden"
            >
              <option value="all">كل الأقسام</option>
              <option value="housekeeping">قسم النظافة والخدمة</option>
              <option value="maintenance">قسم الصيانة الهندسية</option>
              <option value="food_service">قسم الأغذية والمشروبات</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | TaskStatus)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-maroon-900/40 bg-gray-50 dark:bg-maroon-950/20 text-gray-800 dark:text-gray-200 focus:outline-hidden"
            >
              <option value="all">كافة الحالات</option>
              <option value="pending">بالانتظار</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="completed">مكتملة</option>
            </select>
          </div>

        </div>

        {/* Secondary parameters Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-gray-100 dark:border-maroon-950/20 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 font-medium">تصفية الأولوية:</span>
            <div className="flex gap-1.5">
              {(['all', 'high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                    priorityFilter === p 
                      ? 'bg-maroon-850 text-white shadow-xs' 
                      : 'bg-gray-100 dark:bg-maroon-950/30 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {p === 'all' ? 'الكل' : getPriorityLabelAr(p)}
                </button>
              ))}
            </div>
          </div>

          <span className="text-[11px] text-gray-400">
            العثور على <strong className="font-semibold text-maroon-850 dark:text-maroon-300">{filteredTasks.length} مهمة</strong> متطابقة
          </span>
        </div>

      </div>

      {/* Empty State Banner */}
      {filteredTasks.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1a1315] border border-dashed border-gray-200 dark:border-maroon-900/30">
          <Briefcase className="h-10 w-10 text-gray-300 dark:text-maroon-900 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">لا توجد مهمات مسجلة مطابقة للبحث</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">
            قم بتغيير خيارات التصفية أو الفرز لعرض قائمة المهام، أو اضغط على زر التسجيل لإضافة مهمة جديدة غرفتك الحالية.
          </p>
        </div>
      )}

      {/* Task card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => {
          
          return (
            <div 
              key={task.id} 
              className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
              id={`task-card-${task.id}`}
            >
              {/* Sync status identifier tag */}
              <div className="absolute top-2 left-2 flex items-center gap-1">
                {task.synced ? (
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/10 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                    <Check className="h-2 w-2" />
                    مُزامن بالكامل
                  </span>
                ) : (
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/10 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5" title="المهمة في قائمة الانتظار للمزامنة مع الشيت">
                    <RotateCw className="h-2.5 w-2.5 animate-spin-reverse" />
                    انتظار الحفظ
                  </span>
                )}
              </div>

              {/* Card Header Info */}
              <div className="space-y-2 text-right">
                <div className="flex justify-between items-start gap-3">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPriorityBadge(task.priority)}`}>
                    الأولوية: {getPriorityLabelAr(task.priority)}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-maroon-850 dark:text-maroon-300 bg-linear-to-l from-maroon-50 to-transparent dark:from-maroon-950/30 px-2 py-1 rounded-lg">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>غرفة {task.roomNumber}</span>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-maroon-850 dark:group-hover:text-maroon-300 transition-colors">
                  {task.title}
                </h3>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {task.description || 'لا توجد تفاصيل إضافية مضافة.'}
                </p>
              </div>

              {/* Assignee and Action Row */}
              <div className="mt-4 pt-3 border-t border-gray-50 dark:border-maroon-950/20 text-xs">
                
                {/* Department tag */}
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-2.5">
                  <span className="font-semibold">{getDeptLabelAr(task.department)}</span>
                  <span>المسجل: {task.createdBy}</span>
                </div>

                {/* Assigned technical engineer */}
                <div className="flex items-center justify-between gap-1.5 bg-gray-50 dark:bg-maroon-950/10 p-2 rounded-xl mb-3">
                  <span className="text-[10px] text-gray-400">الفني المسؤول:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-maroon-600"></span>
                    {task.assignedTo || 'لم تسند بعد'}
                  </span>
                </div>

                {/* Operations & actions panel based on current user roles */}
                <div className="flex items-center justify-between pt-1">
                  
                  {/* Status Toggle control for Staff */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400 ml-1">الحالة:</span>
                    <select
                      value={task.status}
                      onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md border text-right focus:outline-hidden ${
                        task.status === 'completed' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300' 
                          : task.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/20 dark:text-amber-300 animate-pulse'
                          : 'bg-blue-50 text-blue-800 border-blue-100 dark:bg-blue-950/20 dark:text-blue-300'
                      }`}
                    >
                      <option value="pending">معلّقة</option>
                      <option value="in_progress">قيد العمل</option>
                      <option value="completed">مكتملة</option>
                    </select>
                  </div>

                  {/* Manager/Supervisor CRUD Actions */}
                  {!isStaff && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(task)}
                        className="p-1.5 text-gray-400 hover:text-maroon-850 dark:hover:text-maroon-300 hover:bg-gray-100 dark:hover:bg-maroon-950/40 rounded-lg cursor-pointer transition-colors"
                        title="تعديل تفاصيل المهمة"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذه المهمة نهائياً من النظام؟ قد لا تستطيع استعادتها.')) {
                            onDeleteTask(task.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                        title="حذف المهمة"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: ADD TASK */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1a1315] rounded-2xl border border-gray-100 dark:border-maroon-900/40 p-5 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base border-b border-gray-100 dark:border-maroon-900/20 pb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold-400" />
              قيد تسجيل مهمة فندقية جديدة
            </h3>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">رقم الغرفة/الموقع</label>
                  <input
                    type="text"
                    required
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="مثال: غ 204 أو اللوبي"
                    className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-maroon-900/30 rounded-lg bg-gray-50 dark:bg-maroon-950/30 text-gray-800 dark:text-gray-200"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">القسم المسؤول</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as Department)}
                    disabled={isSupervisor && currentUser.department !== 'all'}
                    className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-maroon-900/30 rounded-lg bg-gray-50 dark:bg-maroon-950/30 text-gray-800 dark:text-gray-200 font-medium"
                  >
                    <option value="housekeeping">النظافة وتجهيز الغرف</option>
                    <option value="maintenance">الصيانة الهندسية</option>
                    <option value="food_service">الأغذية والمشروبات</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">عنوان موجز للمهمة</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: تلميع رخام الغرفة أو تغيير أغطية السرير"
                  className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-maroon-900/30 rounded-lg bg-gray-50 dark:bg-maroon-950/30 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">الوصف التفصيلي للمشكلة والطلب</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="أكتب أي تفاصيل إضافية لتسهيل عمل الموظف..."
                  rows={3}
                  className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-maroon-900/30 rounded-lg bg-gray-50 dark:bg-maroon-950/30 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">الأولوية السرعة</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-maroon-900/30 rounded-lg bg-gray-50 dark:bg-maroon-950/30 text-gray-800 dark:text-gray-200 font-semibold"
                  >
                    <option value="low">منخفضة (استجابة عادية)</option>
                    <option value="medium">متوسطة الأهمية</option>
                    <option value="high">عاجلة جداً (فوري)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">إسناد إلى موظف في القسم</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-maroon-900/30 rounded-lg bg-gray-50 dark:bg-maroon-950/30 text-gray-800 dark:text-gray-200"
                  >
                    <option value="">-- اضغط للاختيار --</option>
                    {getStaffForDept(newDept).map(st => (
                      <option key={st.id} value={st.fullName}>{st.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 text-xs">
                <button
                  type="submit"
                  className="px-4 py-2 bg-maroon-850 hover:bg-maroon-900 text-white rounded-lg font-bold cursor-pointer"
                >
                  حفظ وتسجيل المهمة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-maroon-950/55 rounded-lg text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  إلغاء الأمر
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TASK */}
      {showEditModal && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1a1315] rounded-2xl border border-gray-100 dark:border-maroon-900/40 p-5 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base border-b border-gray-100 dark:border-maroon-900/20 pb-3">
              تعديل بيانات المهمة وتكليف الفنيين
            </h3>

            <form onSubmit={handleUpdateTaskSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">رقم الغرفة/الموقع</label>
                  <input
                    type="text"
                    required
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-maroon-900/30 rounded-lg bg-gray-50 dark:bg-maroon-950/30 text-gray-800 dark:text-gray-200"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">القسم المسؤول</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value as Department)}
                    disabled={isSupervisor && currentUser.department !== 'all'}
                    className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-maroon-900/30 rounded-lg bg-gray-50 dark:bg-maroon-950/30 text-gray-800 dark:text-gray-200"
                  >
                    <option value="housekeeping">النظافة وتجهيز الغرف</option>
                    <option value="maintenance">الصيانة الهندسية</option>
                    <option value="food_service">الأغذية والمشروبات</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">عنوان المهمة</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-maroon-900/30 rounded-lg bg-gray-50 dark:bg-maroon-950/30 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">الوصف التفصيلي وملخص الملاحظات</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-maroon-900/30 rounded-lg bg-gray-50 dark:bg-maroon-950/30 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">الأولوية السرعة</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-maroon-900/30 rounded-lg bg-gray-50 dark:bg-maroon-950/30 text-gray-800 dark:text-gray-200 font-semibold"
                  >
                    <option value="low">عادية (استجابة طبيعية)</option>
                    <option value="medium">متوسطة الأهمية</option>
                    <option value="high">عاجلة جداً (فوري)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">فرد الموظف المكلف</label>
                  <select
                    value={editAssignee}
                    onChange={(e) => setEditAssignee(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-maroon-900/30 rounded-lg bg-gray-50 dark:bg-maroon-950/30 text-gray-800 dark:text-gray-200"
                  >
                    <option value="">-- لم تسند بعد --</option>
                    {getStaffForDept(editDept).map(st => (
                      <option key={st.id} value={st.fullName}>{st.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 text-xs">
                <button
                  type="submit"
                  className="px-4 py-2 bg-maroon-850 hover:bg-maroon-900 text-white rounded-lg font-bold cursor-pointer"
                >
                  حفظ ومزامنة التحديثات
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-maroon-950/55 rounded-lg text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  الرجوع
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
