/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  BookOpen, 
  FolderTree, 
  Terminal, 
  FileCode, 
  Database, 
  Settings, 
  Key, 
  Check,
  CheckCircle2,
  Copy
} from 'lucide-react';

export default function DeveloperDocsView() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const triggerCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const projectStructureCode = `├── index.html                  # مدخل صفحة الويب الرئيسي
├── metadata.json               # إعدادات وصلاحيات التطبيق الفندقي
├── package.json                # حزم التبعيات والنصوص البرمجية للمُطور
├── vite.config.ts              # إعدادات واجهة الفركت وكمبيلر Vite
├── tsconfig.json               # إعدادات وتكوين لغة TypeScript مسبقة الصلاحية
└── src
    ├── App.tsx                 # منسق التطبيق، والمتحكم بالنمط والمزامنة المحلية
    ├── types.ts                # تعريف الموديلات ونماذج البيانات (Task, User, Sync)
    ├── index.css               # تكوين الخطوط، الألوان النبيتي، ونبضات الفندق الفاخر
    ├── main.tsx                # الملف الرئيسي لتشغيل وتصيير شجرة React
    ├── data
    │   └── mockData.ts         # التهيئة الأولية للموظفين، وتذاكر الدعم والأسئلة الشائعة
    └── components
        ├── Header.tsx          # البار العلوي، تغيير الصلاحيات، مؤشر الأوفلاين، وبوصلة الشيت
        ├── Sidebar.tsx         # القائمة الجانبية الفاخرة المنسقة للأجهزة اللوحية والمحمولة
        ├── DashboardView.tsx   # لوحة تحكم مديري الفندق، ترحيل تقارير الأداء ومؤشرات السرعة
        ├── TasksView.tsx       # إدارة مهمات الغرف (CRUD) مع صلاحيات الخصوصية
        ├── SupportView.tsx     # تذاكر الدعم الفني والمساعد الذكي لحل المشكلات
        └── DeveloperDocsView.tsx # دليل المطور الشامل وهندسة البيانات الحالية`;

  const modelCode = `export interface Task {
  id: string;
  title: string;
  roomNumber: string;
  department: 'housekeeping' | 'maintenance' | 'food_service';
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string; // الموظف الفني المسؤول
  createdAt: string;
  updatedAt: string;
  synced: boolean;     // علم المزامنة مع جوجل شيت
  createdBy: string;   // الشخص الذي قام بتسجيلها
}`;

  const sampleCrudCode = `// 1. إضافة مهمة جديدة وحفظها بالكاش
export const addTask = (tasks, newTask) => {
  const task = {
    ...newTask,
    id: 't-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    synced: false // لم تترحل للشيت بعد
  };
  return [task, ...tasks];
};

// 2. تحديث حالة المهمة
export const updateStatus = (tasks, taskId, newStatus) => {
  return tasks.map(task => 
    task.id === taskId 
      ? { ...task, status: newStatus, updatedAt: new Date().toISOString(), synced: false }
      : task
  );
};

// 3. التصفية حسب تخصص القسم
export const filterByDeptAndRole = (tasks, user) => {
  return tasks.filter(task => {
    if (user.role === 'staff') {
      return task.assignedTo === user.fullName; // خصوصية الطاقم العملي
    }
    if (user.role === 'supervisor') {
      return task.department === user.department; // خصوصية المشرف تبعا لقسمه
    }
    return true; // المدير يشاهد كل الأقسام
  });
};`;

  const stepsCode = `1. تأكد من توفر Node.js (الإصدار 18 فما فوق).
2. افتح محاكي الطرفية Terminal في مجلد المشروع الرئيسي.
3. قم بتشغيل الأمر التالي لتثبيت التبعيات (في حال عدم تثبيتها):
   npm install
4. لبدء الخادم المحلي والتجربة التفاعلية فائقة الأداء مباشرة:
   npm run dev
5. لإنشاء كود الإنتاج النهائي وضمان خلوه من أي أخطاء نوعية:
   npm run build`;

  return (
    <div className="space-y-6 pb-20 md:pb-10 text-right">
      
      {/* Title block */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            دليل المطور الشامل وهندسة الأنظمة
            <BookOpen className="h-5 w-5 text-gold-400" />
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            مواصفات الـ MVP الفندقية، خطوات التشغيل المحلي، مخططات المجلدات وتخطيط نماذج المزامنة مع Google Sheets بالتفصيل.
          </p>
        </div>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Folder structure mapping */}
        <div className="p-5 rounded-2xl bg-[#140b0d] dark:bg-[#110507] text-gray-300 border border-maroon-950/40 font-mono text-xs shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
            <span className="flex items-center gap-2 text-gold-400 font-bold">
              <FolderTree className="h-4 w-4" />
              مخطط بنية وتوزيع مجلدات المشروع فائق الأداء
            </span>
            <button 
              onClick={() => triggerCopy(projectStructureCode, 'struct')}
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white cursor-pointer"
            >
              {copiedKey === 'struct' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <pre className="overflow-x-auto text-[11px] leading-relaxed text-right ltr-pre text-emerald-300/90 whitespace-pre scrollbar-hide">
            {projectStructureCode}
          </pre>
        </div>

        {/* 2. Step by step running instructions */}
        <div className="space-y-6">
          
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-maroon-900/15 pb-2">
              <Terminal className="h-4.5 w-4.5 text-maroon-850" />
              خطوات التشغيل المحلي والتثبيت خطوة بخطوة
            </h3>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-3 leading-relaxed">
              {stepsCode.split('\n').map((line, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <span className="h-5 w-5 rounded-full bg-maroon-50 dark:bg-maroon-950 text-maroon-850 dark:text-maroon-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="flex-1 pt-0.5">{line.substring(3)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-maroon-900/15 pb-2">
              <Database className="h-4.5 w-4.5 text-maroon-850" />
              أمان وموثوقية الاتصال بجوجل شيت (نأمن الكاش أولاً)
            </h3>
            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
              <strong>آلية المزامنة والمصادقة المحلية:</strong> يقوم التطبيق بتثبيت كاش ممتد <code className="bg-gray-100 dark:bg-maroon-950 text-maroon-800 dark:text-maroon-300 px-1.5 py-0.5 rounded text-[10px]">LocalStorage</code> لتسهيل العمل دون اتصال بالكامل (أثناء الوجود بالمصاعد أو السراديب الفندقية). 
              بمجرد الاتصال بالإنترنت، تقوم روتين المزامنة بتحويل التحديثات كسطور (Rows) في جدول بيانات جوجل شيت المحدد من قبل الإدارة. مما يحمي البيانات من التلف ويمنع الحاجة لاستضافة خارجية معقدة وتكاليف إضافية.
            </p>
          </div>

        </div>

      </div>

      {/* Code snippets and interfaces reference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Data model snippet */}
        <div className="p-4 rounded-xl bg-[#140b0d] dark:bg-[#110507] text-gray-200 border border-maroon-950/40 font-mono text-xs shadow-lg">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
            <span className="text-gold-400 font-bold flex items-center gap-1.5 text-[11px]">
              <FileCode className="h-4 w-4" />
              أولاً: نموذج الكائن الفندقي (Task Data Model Interface)
            </span>
            <button 
              onClick={() => triggerCopy(modelCode, 'model')}
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white cursor-pointer"
            >
              {copiedKey === 'model' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <pre className="overflow-x-auto text-[10px] leading-relaxed text-left ltr-pre text-sky-300/90 whitespace-pre scrollbar-hide">
            {modelCode}
          </pre>
        </div>

        {/* CRUD algorithms snippet */}
        <div className="p-4 rounded-xl bg-[#140b0d] dark:bg-[#110507] text-gray-200 border border-maroon-950/40 font-mono text-xs shadow-lg">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
            <span className="text-gold-400 font-bold flex items-center gap-1.5 text-[11px]">
              <Settings className="h-4 w-4" />
              ثانياً: خوارزميات إدارة الحالة والفلترة (CRUD & Rules Logic)
            </span>
            <button 
              onClick={() => triggerCopy(sampleCrudCode, 'crud')}
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white cursor-pointer"
            >
              {copiedKey === 'crud' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <pre className="overflow-x-auto text-[10px] leading-relaxed text-left ltr-pre text-amber-300/80 whitespace-pre scrollbar-hide">
            {sampleCrudCode}
          </pre>
        </div>

      </div>

    </div>
  );
}
