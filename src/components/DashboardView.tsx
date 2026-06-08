/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  ClipboardList, 
  Layers, 
  Wrench, 
  UtensilsCrossed, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  Eye,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Task, User, EmployeePerformance } from '../types';

interface DashboardViewProps {
  tasks: Task[];
  users: User[];
  performances: EmployeePerformance[];
  currentUser: User;
}

export default function DashboardView({
  tasks,
  users,
  performances,
  currentUser
}: DashboardViewProps) {
  
  // Calculate alive, real-time statistics based on the passed task array
  const totalCount = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Department specific stats
  const housekeepingCount = tasks.filter(t => t.department === 'housekeeping').length;
  const maintenanceCount = tasks.filter(t => t.department === 'maintenance').length;
  const foodCount = tasks.filter(t => t.department === 'food_service').length;

  // Real-time averages estimation
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;

  // Export report as CSV to satisfy "نظام تقارير دوري لمتابعة أداء الموظفين" 
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for excel arabic support
    csvContent += "الموظف,القسم,المهام المنجزة,متوسط زمن الاستجابة (دقيقة),التقييم العام\n";
    
    performances.forEach(p => {
      const deptAr = p.department === 'housekeeping' ? 'النظافة' : p.department === 'maintenance' ? 'الصيانة' : 'خدمة الطعام';
      const ratingAr = p.rating === 'excellent' ? 'امتياز' : p.rating === 'good' ? 'جيد' : 'بحاجة لتدريب';
      csvContent += `${p.name},${deptAr},${p.completedCount},${p.averageMinutes},${ratingAr}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_أداء_موظفي_الفندق_${new Date().toLocaleDateString('ar-EG')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      
      {/* Welcome & Time Info bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-sm">
        <div className="text-right">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            لوحة قيادة الفندق الشاملة
            <Sparkles className="h-5 w-5 text-gold-400" />
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            أهلاً بك يا <strong className="font-semibold text-maroon-850 dark:text-maroon-300">{currentUser.fullName}</strong>. تمنحك هذه اللوحة مراقبة مباشرة لخدمات الغرف، النظافة، والصيانة بفاعلية تامة.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold shadow-md shadow-maroon-950/10 cursor-pointer transition-colors"
          >
            <FileText className="h-4 w-4 text-gold-400" />
            <span>تصدير تقرير الأداء اليومي (Excel/CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards Block */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs text-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">جميع المهمات الموكلة</span>
            <div className="p-1.5 rounded-lg bg-maroon-50 dark:bg-maroon-950/30 text-maroon-800 dark:text-maroon-300">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-2">{totalCount}</p>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">تم تسجيلها في النظام لليوم</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs text-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">مهام قيد المعالجة</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{inProgressCount}</p>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">جاري العمل عليها حالياً</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs text-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">مهام بانتظار التوزيع</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">{pendingCount}</p>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">مدرجة حديثاً بانتظار الفنيين</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs text-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">المهام المنجزة بنجاح</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{completedCount}</p>
          <span className="text-[10px] text-emerald-500/80 font-semibold">{completionRate}% نسبة الإنجاز العالية</span>
        </div>

      </div>

      {/* Charts & Interactive Department Matrix widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Dynamic Circular Achievement Rate Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs text-center flex flex-col justify-between items-center min-h-[280px]">
          <div className="w-full text-right pb-3 border-b border-gray-50 dark:border-maroon-900/10">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300">مؤشر كفاءة إنجاز المهام</h3>
          </div>
          
          <div className="relative flex items-center justify-center my-4 h-36 w-36">
            {/* SVG circular progress representation */}
            <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-100 dark:text-maroon-950/30"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * completionRate) / 100}
                className="text-maroon-850 dark:text-maroon-500 transition-all duration-700 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-gray-900 dark:text-gray-100">{completionRate}%</span>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">معدل الدقة</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 font-light flex gap-2 items-center">
            {highPriorityCount > 0 ? (
              <span className="flex items-center gap-1 text-amber-500 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">
                <AlertTriangle className="h-3 w-3" />
                يوجد {highPriorityCount} مهام عاجلة قيد الانتظار
              </span>
            ) : (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/10 px-2 py-0.5 rounded-full">
                جميع المهمات العاجلة مُسندة ومنتظمة
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Department Load Histogram Chart */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs flex flex-col justify-between min-h-[280px]">
          <div className="flex items-center justify-between pb-3 border-b border-gray-50 dark:border-maroon-900/10">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300">نسبة توزيع العمل حسب الأقسام الفندقية</h3>
            <span className="text-[10px] text-gray-400">إجمالي الأقسام</span>
          </div>

          <div className="space-y-4 my-auto py-2">
            
            {/* Housekeeping Load */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded bg-maroon-850"></span>
                  النظافة وتجهيز الغرف (Housekeeping)
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{housekeepingCount} مهمة</span>
              </div>
              <div className="h-3 w-full bg-gray-100 dark:bg-maroon-950/30 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${totalCount > 0 ? (housekeepingCount / totalCount) * 100 : 0}%` }}
                  className="h-full bg-linear-to-l from-maroon-850 to-maroon-600 rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>

            {/* Maintenance Load */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded bg-indigo-600"></span>
                  الصيانة الهندسية (Maintenance)
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{maintenanceCount} مهمة</span>
              </div>
              <div className="h-3 w-full bg-gray-100 dark:bg-maroon-950/30 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${totalCount > 0 ? (maintenanceCount / totalCount) * 100 : 0}%` }}
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>

            {/* Food Services Load */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded bg-amber-600"></span>
                  خدمة الغرف والأغذية (Food Service)
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{foodCount} مهمة</span>
              </div>
              <div className="h-3 w-full bg-gray-100 dark:bg-maroon-950/30 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${totalCount > 0 ? (foodCount / totalCount) * 100 : 0}%` }}
                  className="h-full bg-amber-600 rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-50 dark:border-maroon-900/10 pt-2 font-light">
            <span>يمثل المخطط نسبة الضغط على كل قسم تمهيداً لإعادة توجيه الموظفين</span>
            <span className="text-maroon-850 dark:text-maroon-300 font-semibold">تحديث فوري لليوم</span>
          </div>
        </div>

      </div>

      {/* Staff Accountability & Performance log */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-maroon-900/20 gap-3 mb-4">
          <div className="text-right">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-maroon-850 dark:text-maroon-300" />
              مؤشرات أداء الموظفين (التقارير الدورية لمراقبة سرعة الاستجابة)
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">معدل حساب الكفاءة لآخر ٢٤ ساعة لمجموع المهام المنفذة لكل موظف.</p>
          </div>
        </div>

        {/* Responsive horizontal performance table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-maroon-900/20 text-gray-400 font-medium">
                <th className="py-2.5 px-3">اسم الموظف الفني</th>
                <th className="py-2.5 px-3">القسم المخصص</th>
                <th className="py-2.5 px-3">المهام المنجزة</th>
                <th className="py-2.5 px-3 text-center">متوسط زمن الاستجابة والحل</th>
                <th className="py-2.5 px-3 text-left">مستوى تقييم الكفاءة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-maroon-950/25">
              {performances.map((perf) => (
                <tr key={perf.id} className="hover:bg-gray-50/70 dark:hover:bg-maroon-950/20 text-gray-700 dark:text-gray-300">
                  <td className="py-3 px-3 font-semibold text-gray-900 dark:text-gray-100">{perf.name}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      perf.department === 'housekeeping' 
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' 
                        : perf.department === 'maintenance'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}>
                      {perf.department === 'housekeeping' ? 'النظافة' : perf.department === 'maintenance' ? 'الصيانة' : 'الأغذية'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-900 dark:text-gray-100">{perf.completedCount} مهمة ناجحة</td>
                  <td className="py-3 px-3 text-center font-mono font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {perf.averageMinutes} دقيقة
                    </span>
                  </td>
                  <td className="py-3 px-3 text-left">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block text-center ${
                      perf.rating === 'excellent' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                        : perf.rating === 'good'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 font-bold'
                    }`}>
                      {perf.rating === 'excellent' ? 'ممتاز ✦✦✦' : perf.rating === 'good' ? 'جيد جداً ✦✦' : 'يحتاج توجيه ✦'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
