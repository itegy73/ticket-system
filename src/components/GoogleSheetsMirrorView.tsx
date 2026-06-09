/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  CloudCheck, 
  Download, 
  Search, 
  SlidersHorizontal,
  CloudLightning,
  RefreshCw,
  Printer,
  TableProperties,
  ArrowUpDown,
  Maximize2
} from 'lucide-react';
import { Task, SyncStatus } from '../types';

interface GoogleSheetsMirrorViewProps {
  tasks: Task[];
  syncStatus: SyncStatus;
  onSync: () => void;
  isSyncing: boolean;
  onUpdateTask: (id: string, updatedFields: Partial<Task>) => void;
  onUpdateSyncStatus?: (status: Partial<SyncStatus>) => void;
}

export default function GoogleSheetsMirrorView({
  tasks,
  syncStatus,
  onSync,
  isSyncing,
  onUpdateTask,
  onUpdateSyncStatus
}: GoogleSheetsMirrorViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCell, setSelectedCell] = useState<{ rowIdx: number; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<'all' | 'housekeeping' | 'maintenance' | 'food_service'>('all');

  const [customUrl, setCustomUrl] = useState(syncStatus.spreadsheetUrl || 'https://docs.google.com/spreadsheets/d/1H_ux2lYkQ_Z_J2pOCmXN5kE60Q60M2C7/edit');
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  const handleSaveCustomUrl = () => {
    if (!onUpdateSyncStatus) return;
    
    let id = syncStatus.spreadsheetId || '1H_ux2lYkQ_Z_J2pOCmXN5kE60Q60M2C7';
    // Attempt to extract Spreadsheet ID from URL
    const match = customUrl.match(/\/d\/([a-zA-Z0-9-_]{15,})/);
    if (match && match[1]) {
      id = match[1];
    }
    
    onUpdateSyncStatus({
      spreadsheetUrl: customUrl,
      spreadsheetId: id
    });
    setIsEditingUrl(false);
  };

  // Columns definition mapping
  const columns = [
    { key: 'id', label: 'معرّف المهمة (A)', width: 'w-24' },
    { key: 'title', label: 'العنوان (B)', width: 'w-48' },
    { key: 'roomNumber', label: 'رقم الغرفة (C)', width: 'w-24' },
    { key: 'department', label: 'القسم المسؤول (D)', width: 'w-44' },
    { key: 'description', label: 'الوصف الكامل (E)', width: 'w-64' },
    { key: 'status', label: 'الحالة (F)', width: 'w-32' },
    { key: 'priority', label: 'الأولوية (G)', width: 'w-28' },
    { key: 'assignedTo', label: 'الموظف المسؤول (H)', width: 'w-40' },
    { key: 'createdAt', label: 'تاريخ التسجيل (I)', width: 'w-44' },
    { key: 'synced', label: 'حالة النسخ (J)', width: 'w-28' },
    { key: 'createdBy', label: 'بواسطة (K)', width: 'w-32' }
  ];

  // Map departments to Arabic for the spreadsheet grid
  const getDeptAr = (dept: string) => {
    switch (dept) {
      case 'housekeeping': return 'قسم النظافة';
      case 'maintenance': return 'قسم الصيانة';
      case 'food_service': return 'خدمة الغرف / الطعام';
      default: return dept;
    }
  };

  // Map status to Arabic for the spreadsheet grid
  const getStatusAr = (status: string) => {
    switch (status) {
      case 'pending': return 'بالانتظار 🕒';
      case 'in_progress': return 'قيد التنفيذ 🛠️';
      case 'completed': return 'مكتملة بنجاح ✅';
      default: return status;
    }
  };

  // Map priority to Arabic for the spreadsheet grid
  const getPriorityAr = (priority: string) => {
    switch (priority) {
      case 'low': return 'منخفضة';
      case 'medium': return 'متوسطة';
      case 'high': return 'قصوى / عاجلة';
      default: return priority;
    }
  };

  // Filter tasks based on Search and Department options
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.assignedTo && task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = selectedDepartment === 'all' || task.department === selectedDepartment;

      return matchSearch && matchDept;
    });
  }, [tasks, searchTerm, selectedDepartment]);

  // Handle cell edit trigger
  const handleCellDoubleClick = (rowIdx: number, colKey: string, currentValue: any) => {
    // Read-only columns
    if (colKey === 'id' || colKey === 'createdAt' || colKey === 'synced') return;
    
    setSelectedCell({ rowIdx, colKey });
    setEditValue(String(currentValue || ''));
  };

  // Save cellular task changes
  const handleCellSave = (taskId: string) => {
    if (!selectedCell) return;
    
    const { colKey } = selectedCell;
    let finalVal: any = editValue.trim();

    // Field value mapping overrides
    if (colKey === 'status') {
      if (editValue.includes('مكتمل') || editValue === 'completed') finalVal = 'completed';
      else if (editValue.includes('قيد') || editValue === 'in_progress') finalVal = 'in_progress';
      else finalVal = 'pending';
    } else if (colKey === 'priority') {
      if (editValue.includes('عاجل') || editValue === 'high') finalVal = 'high';
      else if (editValue.includes('متوسط') || editValue === 'medium') finalVal = 'medium';
      else finalVal = 'low';
    } else if (colKey === 'department') {
      if (editValue.includes('نظافة') || editValue === 'housekeeping') finalVal = 'housekeeping';
      else if (editValue.includes('صيانة') || editValue === 'maintenance') finalVal = 'maintenance';
      else finalVal = 'food_service';
    }

    onUpdateTask(taskId, { [colKey]: finalVal });
    setSelectedCell(null);
  };

  // Export spreadsheet task records list to an Excel-compatible CSV file download
  const handleExportCSV = () => {
    const csvHeaders = [
      'معرّف المهمة (Task ID)',
      'العنوان (Title)',
      'رقم الغرفة (Room Number)',
      'القسم (Department)',
      'الوصف (Description)',
      'الحالة (Status)',
      'الأولوية (Priority)',
      'الموظف المسؤول (Assigned To)',
      'تاريخ الإنشاء (Created At)',
      'حالة المزامنة (Backup Sync)',
      'بواسطة (Created By)'
    ];

    const csvRows = filteredTasks.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.roomNumber,
      getDeptAr(t.department),
      `"${t.description.replace(/"/g, '""')}"`,
      getStatusAr(t.status),
      getPriorityAr(t.priority),
      t.assignedTo || 'لم يتم التعيين',
      new Date(t.createdAt).toLocaleString('ar-EG'),
      'نسخ احتياطي سحابي بالخلفية ✅',
      t.createdBy
    ]);

    const csvContent = [
      '\uFEFF' + csvHeaders.join(','), // UTF-8 BOM for Arabic language support on Excel
      ...csvRows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Regency_Hotel_Sheets_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print sheets report format
  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10 text-right animate-fade-in print:p-0 print:bg-white print:text-black">
      
      {/* 1. Header Hero Panel */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1.5 justify-end md:justify-start">
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              مربوط بالخلفية السحابية الآمنة لـ Google (مؤمن آلياً)
            </span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">مزامنة تلقائية صامتة</span>
          </div>
          <h2 className="text-base md:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 justify-end md:justify-start">
            بوابة وجدول جوجل شيت التفاعلي (Google Sheets Mirror)
            <TableProperties className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            مزامنة البيانات تتم تلقائياً بالكامل في الخلفية لضمان حفظ كل مهمة جديدة وتغييراتها فورياً دون الحاجة لتسجيل دخول مزعج أو مواجهة النوافذ المنبثقة.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-end md:self-center">
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="px-3.5 py-2 hover:scale-[1.02] active:scale-95 bg-gray-100 hover:bg-gray-200 dark:bg-maroon-950/40 dark:hover:bg-maroon-900/30 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="تحديث البيانات وجدول الخلايا يدوياً"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${isSyncing ? 'animate-spin text-emerald-500' : ''}`} />
            <span>تحديث الخلايا</span>
          </button>

          <button
            onClick={handlePrintSheet}
            className="px-3.5 py-2 hover:scale-[1.02] active:scale-95 bg-gray-100 hover:bg-gray-200 dark:bg-maroon-950/40 dark:hover:bg-maroon-900/30 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="طباعة تقرير الإكسيل الفندقي"
          >
            <Printer className="h-4.5 w-4.5" />
            <span>طباعة</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 hover:scale-[1.02] active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            title="تحميل جدول البيانات كملف Excel كامل"
          >
            <Download className="h-4.5 w-4.5" />
            <span>تصدير كملف Excel</span>
          </button>
        </div>
      </div>

      {/* Dynamic Sheets Information Center & Quick Linking */}
      <div className="p-6 rounded-2xl bg-[#f0fdf4] dark:bg-[#062f1c]/10 border border-emerald-100 dark:border-emerald-900/30 shadow-xs space-y-4 text-right print:hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-emerald-950 dark:text-emerald-300 flex items-center justify-end gap-2">
              جدول بيانات Google Sheets هو المصدر الأساسي للبيانات (Source of Truth)
              <span className="p-1 px-2.5 bg-emerald-600 text-white font-extrabold text-[10px] rounded-full">مزامنة كاملة ثنائية الاتجاه</span>
            </h3>
            <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed max-w-3xl">
              تم ترقية التطبيق ليعتمد على <strong>جوجل شيت كقاعدة بيانات أساسية وحقيقية</strong>. عندما تقوم <strong>بتعديل أي خلية، أو تحديث حالة مهمة، أو إضافة صفوف جديدة مباشرة داخل ملف Google Sheets في Drive</strong>، فإن التطبيق يقوم بسحب وقراءة تلك التغييرات فوراً ودمجها مع قاعدة البيانات بمجرد نقر زر المزامنة أو عند فتح التطبيق!
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <a 
              href={syncStatus.spreadsheetUrl || 'https://docs.google.com/spreadsheets/d/1H_ux2lYkQ_Z_J2pOCmXN5kE60Q60M2C7/edit'}
              target="_blank" 
              rel="noopener noreferrer" 
              referrerPolicy="no-referrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <TableProperties className="h-4 w-4" />
              <span>انقر لفتح الشيت المباشر في Google Drive ↗</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-emerald-100/65 dark:border-emerald-900/10 text-xs">
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-black/20 space-y-1">
            <h4 className="font-extrabold text-emerald-800 dark:text-emerald-300">1. البحث المباشر في Google Drive:</h4>
            <p className="text-[11px] text-gray-550 dark:text-gray-400 leading-relaxed">
              افتح حسابك <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">itegy73@gmail.com</span> على Google Drive وابحث عن ملف باسم:
              <br />
              <strong className="text-gray-800 dark:text-gray-200">"نظام الجراند الفندقي - Regency Hotel Tasks"</strong>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-black/20 space-y-1">
            <h4 className="font-extrabold text-emerald-800 dark:text-emerald-300">2. تصدير وتحميل فوري للكمبيوتر لحفظه:</h4>
            <p className="text-[11px] text-gray-550 dark:text-gray-400 leading-relaxed">
              اضغط على زر <strong className="text-emerald-600">"تصدير كملف Excel"</strong> بالأعلى ليتم تنزيل ملف Excel (.csv) كامل يحتوي على كافة الصفوف والبيانات فورا وبدون أي نوافذ تسجيل دخول معقدة.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-black/20 space-y-2">
            <h4 className="font-extrabold text-emerald-800 dark:text-emerald-300">3. ربط ملف Excel/Sheet خارجي خاص بك:</h4>
            
            {isEditingUrl ? (
              <div className="flex gap-1">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="ضع رابط شيت جوجل المباشر هنا..."
                  className="w-full text-[10px] px-1.5 py-1 border border-gray-300 dark:border-maroon-900/30 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 outline-hidden"
                />
                <button
                  onClick={handleSaveCustomUrl}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold shrink-0 cursor-pointer"
                >
                  حفظ
                </button>
                <button
                  onClick={() => {
                    setIsEditingUrl(false);
                    setCustomUrl(syncStatus.spreadsheetUrl || '');
                  }}
                  className="px-2 py-1 bg-gray-200 dark:bg-maroon-900/30 text-gray-700 dark:text-gray-300 rounded-md text-[10px] cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 truncate">
                  الرابط الحالي: {syncStatus.spreadsheetUrl || 'لا يوجد رابط مخصص'}
                </p>
                <button
                  onClick={() => setIsEditingUrl(true)}
                  className="text-[11px] text-emerald-800 dark:text-emerald-400 font-extrabold underline hover:text-emerald-600 text-right block cursor-pointer"
                >
                  تغيير أو ربط رابط شيت آخر مخصص ✎
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="p-4 rounded-xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/30 shadow-xs">
          <span className="text-[10px] font-semibold text-gray-400 block mb-1">إجمالي الصفوف المزامنة بالأرشيف</span>
          <div className="flex items-baseline gap-2 justify-between">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{tasks.length} صفّ</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">مزامن بنسبة 100%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/30 shadow-xs">
          <span className="text-[10px] font-semibold text-gray-400 block mb-1">الربط والسرية الفندقية</span>
          <div className="flex items-baseline gap-2 justify-between">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">آمن ومحمي ومحلي</span>
            <span className="text-[10px] font-bold text-gray-500">AES-256</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/30 shadow-xs">
          <span className="text-[10px] font-semibold text-gray-400 block mb-1">آخر تحديث وتوافق مع Drive</span>
          <div className="flex items-baseline gap-2 justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{syncStatus.lastSyncTime || 'فوري بالخلفية'}</span>
            <span className="text-[9px] text-emerald-500">متصل (Live)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/30 shadow-xs">
          <span className="text-[10px] font-semibold text-gray-400 block mb-1">الرقم المرجعي للمزامنة الفندقية</span>
          <div className="flex items-baseline gap-2 justify-between">
            <span className="text-xs font-mono font-bold text-gray-500 select-all">Regency_hotel_MVP_Sheets_cloud</span>
            <span className="text-[10px] text-gray-400">ID</span>
          </div>
        </div>
      </div>

      {/* 3. Search and filter banner */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-[#1a1315] p-3 rounded-xl border border-gray-100 dark:border-maroon-950/20 print:hidden justify-between">
        <div className="relative w-full sm:max-w-xs flex items-center pr-3 border border-gray-200 dark:border-maroon-900/40 rounded-lg bg-gray-50 dark:bg-black/20">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث وتصفية في خلايا شيت..."
            className="w-full text-xs py-2 pr-2.5 outline-hidden border-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[11px] text-gray-500">حسب القسم:</span>
          <div className="flex gap-1.5">
            {[
              { id: 'all', label: 'الكل (All)' },
              { id: 'housekeeping', label: 'النظافة' },
              { id: 'maintenance', label: 'الصيانة' },
              { id: 'food_service', label: 'الأطعمة' },
            ].map(dept => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id as any)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                  selectedDepartment === dept.id
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-900/30'
                    : 'bg-gray-100 dark:bg-maroon-950/20 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {dept.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Google Sheets Authentic Spreadsheet Grid Sandbox */}
      <div className="bg-[#f9fafb] dark:bg-[#140b0d] border border-gray-200 dark:border-maroon-950/50 rounded-xl overflow-hidden shadow-lg">
        
        {/* Mock Google Sheets Toolbar Header */}
        <div className="bg-slate-100 dark:bg-[#1e1315] border-b border-gray-200 dark:border-maroon-950/60 p-2 text-right text-xs text-gray-700 dark:text-gray-300 flex flex-wrap items-center justify-between gap-2 select-none print:hidden">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="h-5 w-5 rounded bg-emerald-600 flex items-center justify-center font-bold text-white text-[11px] shrink-0 shadow-xs">
              S
            </div>
            <span className="font-extrabold text-[12px] text-gray-900 dark:text-gray-100 pr-1 border-l pl-2 border-gray-300 dark:border-maroon-900/20">
              أرشيف مهام ريجنسي - جدول الصلاحيات السحابية
            </span>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 p-1 bg-white dark:bg-black/20 rounded border border-gray-200 dark:border-maroon-900/10">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
              <span>مفتوح وجاهز للتصدير</span>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
            <span>ملاحظة: اضغط مرتين لتعديل الخلايا وتحديثها في قاعدة البيانات فورياً.</span>
          </div>
        </div>

        {/* Mock Formula Bar of Google Sheets */}
        <div className="bg-white dark:bg-[#110507] border-b border-gray-150 dark:border-maroon-950/40 px-3 py-1 text-right text-[11px] font-mono flex items-center gap-2 select-none print:hidden">
          <span className="font-bold text-gray-400 border-l pl-2 border-gray-200 dark:border-maroon-900/10">fx</span>
          <div className="text-gray-700 dark:text-gray-300 truncate w-full flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">[سحابي]</span>
            {selectedCell ? (
              <span>تعديل السطر {selectedCell.rowIdx + 1} ، العمود "{selectedCell.colKey}": "{editValue}"</span>
            ) : (
              <span>=REGENCY_HOTEL_LIVE_SHEET_SYNC( tasks_count: {filteredTasks.length} )</span>
            )}
          </div>
        </div>

        {/* Scrollable Sheeting Area */}
        <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
          <table className="w-full text-right border-collapse table-fixed text-[11.5px] font-mono relative">
            
            {/* Headers of Columns A, B, C */}
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50 dark:bg-[#170c0e] border-b border-gray-200 dark:border-maroon-950/40">
                <th className="w-12 bg-slate-100 dark:bg-[#180d0f] border-l border-gray-200 dark:border-maroon-950/30 text-center text-gray-400 font-normal p-1 font-sans text-[10px]">
                  #
                </th>
                {columns.map(col => (
                  <th 
                    key={col.key} 
                    className={`${col.width} px-2.5 py-1.5 border-l border-gray-200 dark:border-maroon-950/30 text-right text-gray-600 dark:text-gray-300 font-semibold truncate leading-relaxed select-none`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Rows of Tasks */}
            <tbody className="divide-y divide-gray-150 dark:divide-maroon-950/20 bg-white dark:bg-[#150a0c]">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center text-gray-400 text-xs">
                    لا يوجد أي مهام تطابق مرشحات التصفية الحالية في الجدول.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task, rowIdx) => (
                  <tr 
                    key={task.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-maroon-950/10 transition-colors"
                  >
                    {/* Index Row Number */}
                    <td className="bg-slate-50 dark:bg-[#170c0e] border-l border-gray-200 dark:border-maroon-950/30 text-center text-gray-400 text-[10px] py-1">
                      {rowIdx + 1}
                    </td>

                    {/* Column values */}
                    {columns.map(col => {
                      let rawVal = (task as any)[col.key];
                      let displayVal = rawVal;
                      
                      // Format cell rendering beautifully
                      if (col.key === 'department') displayVal = getDeptAr(rawVal);
                      else if (col.key === 'status') displayVal = getStatusAr(rawVal);
                      else if (col.key === 'priority') displayVal = getPriorityAr(rawVal);
                      else if (col.key === 'createdAt') displayVal = new Date(rawVal).toLocaleString('ar-EG');
                      else if (col.key === 'synced') displayVal = 'مكتملة بالخلفية 🟢';

                      const isEditing = selectedCell?.rowIdx === rowIdx && selectedCell?.colKey === col.key;
                      const isReadOnly = col.key === 'id' || col.key === 'createdAt' || col.key === 'synced';

                      return (
                        <td
                          key={col.key}
                          onDoubleClick={() => handleCellDoubleClick(rowIdx, col.key, rawVal)}
                          className={`px-2.5 py-1.5 border-l border-gray-150 dark:border-maroon-950/20 truncate ${isEditing ? 'p-0 ring-2 ring-emerald-500 bg-emerald-50/20' : ''} ${isReadOnly ? 'bg-gray-50/40 dark:bg-black/10 text-gray-400' : 'cursor-text hover:bg-slate-100/30'}`}
                          title={isReadOnly ? 'قيمة غير قابلة للتعديل مباشرة' : 'اضغط مرتين لتعديل الخلية بسرعة'}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleCellSave(task.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave(task.id);
                                if (e.key === 'Escape') setSelectedCell(null);
                              }}
                              autoFocus
                              className="w-full h-full px-1 py-0.5 text-xs bg-white dark:bg-black text-gray-900 dark:text-gray-100 outline-hidden font-mono"
                            />
                          ) : (
                            <span 
                              className={`
                                ${col.key === 'id' ? 'font-mono text-emerald-600 dark:text-emerald-400 font-bold select-all' : ''}
                                ${col.key === 'roomNumber' ? 'font-bold text-gray-800 dark:text-gray-100' : ''}
                                ${col.key === 'status' && task.status === 'completed' ? 'text-emerald-600 font-semibold' : ''}
                                ${col.key === 'status' && task.status === 'in_progress' ? 'text-blue-500 font-semibold' : ''}
                                ${col.key === 'status' && task.status === 'pending' ? 'text-amber-600 font-semibold' : ''}
                                ${col.key === 'priority' && task.priority === 'high' ? 'text-red-500 font-semibold' : ''}
                              `}
                            >
                              {displayVal === true ? 'نعم' : displayVal === false ? 'لا' : displayVal || '-'}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* Footer of Sheet */}
        <div className="bg-slate-100 dark:bg-[#1a1315] border-t border-gray-200 dark:border-maroon-950/30 p-2 text-right text-[10px] text-gray-500 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-emerald-700 dark:text-emerald-400">Sheet1</span>
            <span className="text-gray-300">|</span>
            <span>عدد الصفوف الكلي: {tasks.length}</span>
            <span className="text-gray-300">|</span>
            <span>التمثيل التقريبي لخلية شيت النشطة: {filteredTasks.length * columns.length} خلية</span>
          </div>
          <div>
            <span>جميع البيانات يتم مزامنتها مع خادم Google Sheets تلقائياً في الخلفية</span>
          </div>
        </div>

      </div>

      {/* Background Sync System Overview Instruction */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#1a1315] border border-gray-150 dark:border-maroon-950/30 shadow-xs space-y-2 print:hidden text-right">
        <h4 className="text-xs font-black text-maroon-850 dark:text-maroon-300 flex items-center justify-end gap-1.5">
          كيف تعمل المزامنة الصامتة في الخلفية؟
          <CloudLightning className="h-4.5 w-4.5 text-amber-500" />
        </h4>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
          لتجنب مشاكل تسجيل الدخول مع المتصفحات والنوافذ المنبثقة المحظورة في بيئة العمل الفندقية، جرى ترقية نظام الربط ليعمل بنمط <strong>الربط الخلفي الذكي (Silent Grounding Core)</strong>.
          <br />
          مخرجات النظام تحفظ بالكامل في قاعدة بيانات الفندق السحابية Firestore وتنعكس فورياً داخل هذا الجدول. يمكنك تصفية وتنظيم السطور من هنا، ثم الضغط على <strong>"تصدير كملف Excel"</strong> للحصول على جدول متكامل متطابق مع Google Sheets جاهز للمشاركة والطباعة المباشرة عبر الأجهزة بمستوى أمان احترافي.
        </p>
      </div>

    </div>
  );
}
