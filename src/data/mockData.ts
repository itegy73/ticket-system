/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, User, SupportTicket, EmployeePerformance, Notification } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    username: 'manager_sami',
    fullName: 'أ. سامي المنصوري',
    role: 'manager',
    department: 'all',
    avatarColor: 'bg-red-800',
  },
  {
    id: 'u2',
    username: 'super_ahmed',
    fullName: 'أحمد ممدوح (النظافة)',
    role: 'supervisor',
    department: 'housekeeping',
    avatarColor: 'bg-emerald-700',
  },
  {
    id: 'u3',
    username: 'super_khalid',
    fullName: 'خالد عبد الله (الصيانة)',
    role: 'supervisor',
    department: 'maintenance',
    avatarColor: 'bg-indigo-700',
  },
  {
    id: 'u4',
    username: 'super_youssef',
    fullName: 'يوسف العلي (الأغذية)',
    role: 'supervisor',
    department: 'food_service',
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'u5',
    username: 'staff_ali',
    fullName: 'علي حسن',
    role: 'staff',
    department: 'housekeeping',
    avatarColor: 'bg-teal-600',
  },
  {
    id: 'u6',
    username: 'staff_mostafa',
    fullName: 'مصطفى محمود',
    role: 'staff',
    department: 'maintenance',
    avatarColor: 'bg-purple-600',
  },
  {
    id: 'u7',
    username: 'staff_tarek',
    fullName: 'طارق سليم',
    role: 'staff',
    department: 'food_service',
    avatarColor: 'bg-rose-600',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'تنظيف كامل وتسليم جناح النبلاء VIP',
    roomNumber: '302',
    department: 'housekeeping',
    description: 'تجهيز الغرفة بالكامل وتشمل المفروشات الجديدة، فحص الشرفات وتكييف الهواء، والترحيب بالنزيل بالورد الطبيعي قبل وصوله الساعة 3:00 عصراً.',
    status: 'pending',
    priority: 'high',
    assignedTo: 'علي حسن',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4h ago
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    synced: true,
    createdBy: 'أ. سامي المنصوري',
  },
  {
    id: 't2',
    title: 'إصلاح تسريب المياه في دورة مياه غ 108',
    roomNumber: '108',
    department: 'maintenance',
    description: 'النزيل يشتكي من تسرب بسيط من الصنبور الرئيسي لدورة المياه، يرجى التوجه الفوري وإصلاحه لمنع الهدر والمحافظة على سلامة الأثاث.',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'مصطفى محمود',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2h ago
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    synced: true,
    createdBy: 'خالد عبد الله (الصيانة)',
  },
  {
    id: 't3',
    title: 'تجهيز وتوصيل وجبة سحور / إفطار غ 215',
    roomNumber: '215',
    department: 'food_service',
    description: 'طلب النزيل دبل كلوب ساندوتش مع عصير برتقال طبيعي بارد، بالإضافة إلى زجاجة مياه معدنية. يرجى التوصيل خلال 20 دقيقة كحد أقصى.',
    status: 'pending',
    priority: 'medium',
    assignedTo: 'طارق سليم',
    createdAt: new Date(Date.now() - 600000).toISOString(), // 10m ago
    updatedAt: new Date(Date.now() - 600000).toISOString(),
    synced: true,
    createdBy: 'يوسف العلي (الأغذية)',
  },
  {
    id: 't4',
    title: 'تغيير المصابيح المحروقة في الممر الدور الرابع',
    roomNumber: 'الممر 4',
    department: 'maintenance',
    description: 'يوجد عدد 3 مصابيح إضاءة خافتة أو لا تعمل في الممر الأيمن المؤدي للمصاعد الكهربائية بالطابق الرابع.',
    status: 'completed',
    priority: 'low',
    assignedTo: 'مصطفى محمود',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(), // 8h ago
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    synced: true,
    createdBy: 'أ. سامي المنصوري',
  },
  {
    id: 't5',
    title: 'تلميع الأرضيات الرخامية بالبهو الرئيسي',
    roomNumber: 'البهو',
    department: 'housekeeping',
    description: 'تلميع فوري للرخام عند المدخل الرئيسي بسبب آثار الأتربة وبقايا المطر الخفيفة لضمان جاذبية الفندق ونظافته.',
    status: 'completed',
    priority: 'medium',
    assignedTo: 'علي حسن',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    synced: true,
    createdBy: 'أحمد ممدوح (النظافة)',
  },
  {
    id: 't6',
    title: 'توفير غطاء ووسائد إضافية لغرفة عائلية 310',
    roomNumber: '310',
    department: 'housekeeping',
    description: 'اتصال من نزلاء الغرفة يطلبون لحافاً سميكاً إضافياً وعدد 2 وسادة قطنية لخدمة الأطفال.',
    status: 'pending',
    priority: 'low',
    assignedTo: 'علي حسن',
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    synced: true,
    createdBy: 'أحمد ممدوح (النظافة)',
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'st-01',
    title: 'مشكلة في مزامنة السكايب مع جدول المهمات',
    user: 'أحمد ممدوح',
    department: 'قسم النظافة',
    issue: 'عند تفعيل نمط الأوفلاين يستمر التطبيق في التذكير بمهام تم إنجازها بالفعل في الواجهة، هل يمكن مسح الكاش؟',
    status: 'resolved',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    response: 'تم حلها تلقائياً بالتحقق من مفتاح المزامنة وتحسين الكاش المحلي للتخزين الاحتياطي.',
  },
  {
    id: 'st-02',
    title: 'طلب إضافة ترميز كود الغرف الذكية',
    user: 'خالد عبد الله',
    department: 'قسم الصيانة',
    issue: 'نرغب في إمكانية ربط أرقام الغرف بباركود أو تاتش ذكي لتأكيد الوجود المادي للفني أثناء الصيانة.',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    text: 'تم تعيين مهمة جديدة لك: تنظيف جناح النبلاء VIP 302.',
    type: 'info',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    read: false,
  },
  {
    id: 'n2',
    text: 'تأكيد إنجاز مهمة: تغيير المصابيح المحروقة في الممر الدور الرابع بنجاح.',
    type: 'success',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    read: true,
  },
  {
    id: 'n3',
    text: 'إنذار استجابة: تجاوز طلب وجبة السحور لغرفة 215 حاجز 10 دقائق دون بدء التنفيذ!',
    type: 'alert',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    read: false,
  }
];

export const INITIAL_EMPLOYEE_PERFORMANCE: EmployeePerformance[] = [
  {
    id: 'ep1',
    name: 'علي حسن',
    department: 'housekeeping',
    completedCount: 28,
    averageMinutes: 24,
    rating: 'excellent',
  },
  {
    id: 'ep2',
    name: 'مصطفى محمود',
    department: 'maintenance',
    completedCount: 22,
    averageMinutes: 38,
    rating: 'excellent',
  },
  {
    id: 'ep3',
    name: 'طارق سليم',
    department: 'food_service',
    completedCount: 15,
    averageMinutes: 18,
    rating: 'good',
  },
  {
    id: 'ep4',
    name: 'سحر أحمد',
    department: 'housekeeping',
    completedCount: 19,
    averageMinutes: 32,
    rating: 'good',
  },
  {
    id: 'ep5',
    name: 'خليل عمار',
    department: 'maintenance',
    completedCount: 11,
    averageMinutes: 52,
    rating: 'needs_improvement',
  }
];

export const FAQS = [
  {
    q: 'كيف يعمل التخزين مع جوجل شيت (Google Sheets)؟',
    a: 'يقوم النظام بحفظ البيانات محلياً في المتصفح تلقائياً. عند الاتصال بالشبكة، تقوم أداة المزامنة برفع المهام المضافة والمعدلة كصفوف جديدة في جدول بياناتك بجوجل شيت لضمان نسخ احتياطي فوري ومجاني.'
  },
  {
    q: 'لماذا يتحول النظام تلقائياً للعمل دون اتصال (Offline Mode)؟',
    a: 'برمجنا الفندق بطريقة ذكية؛ فالمصاعد والسراديب قد تقطع إرسال الواي فاي. يكتشف الكود انقطاع الشبكة فوراً فيحفظ كل التحديثات على جهازك، وتلقائياً يبدأ المزامنة أول عودة للتغطية دون أن يتوقف سير عملك لحظة.'
  },
  {
    q: 'كيف أعرف المهام الخاصة بقسمي فقط؟',
    a: 'يمتلك كل مستخدم صلاحية قسم محددة (مثل النظافة أو الصيانة). عند تسجيل الدخول بصلاحيتك، تتم فلترة جميع المهام والإشعارات تلقائياً لتظهر لك ما هو مخصص لك فقط احتراماً للخصوصية وتجنباً لتشتيت طاقم الفندق برمتّه.'
  },
  {
    q: 'كيف أقوم بطباعة التقارير الدورية للمدير كملف Excel أو PDF؟',
    a: 'في لوحة تحكم المدير، يوجد زر تحميل فوري للتقارير بصيغة CSV المتوافقة تماماً مع Excel وجداول Google، ويقوم بتصدير كافة نسب الأداء ومتوسطات أوقات استجابة الفنيين.'
  }
];
