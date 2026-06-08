/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  HelpCircle, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  ChevronDown, 
  Sparkles, 
  LifeBuoy,
  Clock,
  ArrowRight
} from 'lucide-react';
import { SupportTicket, User } from '../types';
import { FAQS } from '../data/mockData';

interface SupportViewProps {
  tickets: SupportTicket[];
  onSubmitTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>) => void;
  onResolveTicket: (id: string, response: string) => void;
  currentUser: User;
}

export default function SupportView({
  tickets,
  onSubmitTicket,
  onResolveTicket,
  currentUser
}: SupportViewProps) {
  
  // Accordion faq tracker
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Form states
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketIssue, setTicketIssue] = useState('');
  
  // Chatbot Assistant states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'مرحباً بك في المساعد الفني لخدمة غرف الفندق الذكي. كيف يمكنني مساعدتك اليوم في شؤون الاتصال، الأوفلاين، أو المزامنة مع جوجل شيت؟',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Resolve dialog states
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolveResponse, setResolveResponse] = useState('');

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketIssue) return;
    
    onSubmitTicket({
      title: ticketTitle,
      user: currentUser.fullName,
      department: currentUser.department === 'all' ? 'الإدارة العامة' : currentUser.department,
      issue: ticketIssue
    });

    setTicketTitle('');
    setTicketIssue('');
    alert('تم إرسال تذكرة الدعم بنجاح! سيقوم مهندس النظم بمراجعتها وحلها فوراً.');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicketId || !resolveResponse) return;
    onResolveTicket(resolvingTicketId, resolveResponse);
    setResolvingTicketId(null);
    setResolveResponse('');
    alert('تم حل التذكرة وإرسال الإجابة للموظف.');
  };

  // Smart responsive local query matcher
  const getSmartResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('شيت') || q.includes('جوجل') || q.includes('spread') || q.includes('sheet') || q.includes('جوجل شيت')) {
      return 'لمزامنة الشيت بنجاح: تأكد من أن جدول البيانات الخاص بك يحتوي على أعمدة مطابقة لنوع البيانات (المهمة، الغرفة، القسم، الحالة، الأولوية)، وقم بنسخ معرّف الجدول الفريد المكون من أحرف وأرقام من الرابط، ثم قم بإدخاله بضغط أيقونة قاعدة البيانات بالعلّى وضغط "حفظ ومزامنة" وسيقوم النظام بتنزيل ورفع كافة التفاصيل.';
    }
    if (q.includes('أوفلاين') || q.includes('انترنت') || q.includes('شبكة') || q.includes('offline') || q.includes('انقطاع')) {
      return 'تم تصميم النظام ليعمل بالكامل دون شبكة إنترنت (Offline Mode). جميع العمليات التي تجريها من تعديل حالة المهمات أو إنشاء مهمة جديدة يتم حفظها وتخزينها في الكاش الداخلي للمتصفح. بمجرد استعادة الشبكة، أو قيامك بالضغط على "مزامنة الآن"، يتم دمج كافة التحديثات بسلاسة مع قاعدة البيانات الرئيسية دون فقدان أي بيانات.';
    }
    if (q.includes('صلاحية') || q.includes('دخول') || q.includes('تغيير') || q.includes('مدير') || q.includes('مشرف')) {
      return 'تستطيع تجربة كافة مستويات الصلاحيات المخصصة للنظافة أو الصيانة عن طريق الضغط على الملف الشخصي في الزاوية العلوية اليسرى واختيار دور مستخدم آخر (مثل أحمد ممدوح مشرف النظافة الفنية أو الإدارة)؛ للتأكد من حماية خصوصية البيانات التابعة لكل قسم فندقي.';
    }
    if (q.includes('تعديل') || q.includes('حذف') || q.includes('كيف أقوم') || q.includes('مهمة')) {
      return 'لتعديل مهمة أو تكليف فني بها: اضغط على أيقونة التعديل (القلم) الموجودة أسفل كارت المهمة (متاح للمدير والمشرفين فقط). بينما الموظف التنفيذي يستطيع تبديل حالة المهمة مباشرة من القائمة المنسدلة (بالانتظار، قيد التنفيذ، مكتملة) لتأكيد الإنجاز.';
    }
    return 'سؤالك مسجل في قاعدة نظام دعم فندق ريجنسي. لحلول أسرع، نوصي بمراجعة قسم الأسئلة الشائعة Accordion المرفق بالجانب، أو الضغط بالعلّى لتسجيل تذكرة دعم فني فوري وسيتواصل معك مهندس شبكات الفندق خلال دقائق.';
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, {
      sender: 'user',
      text: userMsg,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
    setIsBotTyping(true);

    // Simulate real-time bot typing lag for high level of polish
    setTimeout(() => {
      const response = getSmartResponse(userMsg);
      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: response,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsBotTyping(false);
    }, 850);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10 text-right">

      {/* Hero Welcome banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            مكتب الدعم المدمج بالفندق
            <LifeBuoy className="h-5 w-5 text-gold-500 animate-pulse" />
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            مكتب متكامل لاستفسارات الفنيين والصيانة، يشمل المساعد الفني الفوري الذكي وقائمة الأسئلة الشائعة لتسهيل سير العمل.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Interactive AI / Local help desk chat */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs flex flex-col h-[480px]">
          <div className="border-b border-gray-100 dark:border-maroon-900/20 pb-2.5 mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-gold-500" />
              المساعد التقني الفوري والذكي للأجهزة المحمولة
            </span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">نشط بالكامل</span>
          </div>

          {/* Messages feed area */}
          <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-gray-50 dark:bg-maroon-950/15 rounded-xl scrollbar-hide">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'mr-auto items-start' : 'ml-auto items-end'}`}
              >
                <div 
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-maroon-850 text-white rounded-tl-none' 
                      : 'bg-white dark:bg-[#251b1d] text-gray-800 dark:text-gray-100 shadow-xs border border-gray-100 dark:border-maroon-900/10 rounded-tr-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            
            {isBotTyping && (
              <div className="flex items-center gap-1 ml-auto p-3 bg-white dark:bg-[#251b1d] rounded-2xl rounded-tr-none shadow-xs text-xs text-gray-400 max-w-[100px]">
                <span className="h-2 w-2 rounded-full bg-maroon-400 animate-bounce"></span>
                <span className="h-2 w-2 rounded-full bg-maroon-400 animate-bounce delay-100"></span>
                <span className="h-2 w-2 rounded-full bg-maroon-400 animate-bounce delay-200"></span>
              </div>
            )}
          </div>

          {/* Chat input box */}
          <form onSubmit={handleChatSend} className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="اكتب استفسارك هنا (مثال: الأوفلاين، جوجل شيت)..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-maroon-900/40 bg-gray-50 dark:bg-maroon-950/20 text-gray-800 dark:text-gray-200 focus:outline-hidden"
            />
            <button
              type="submit"
              className="p-2.5 bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl shadow-xs cursor-pointer flex items-center justify-center"
            >
              <Send className="h-4 w-4 transform rotate-180" />
            </button>
          </form>
        </div>

        {/* 2. FAQ accordions panel & Submit ticket button */}
        <div className="space-y-4">
          
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 border-b border-gray-50 dark:border-maroon-900/10 pb-2">
              <HelpCircle className="h-4 w-4 text-maroon-850" />
              الأسئلة الشائعة عن إدارة الفندق والمزامنة
            </h3>

            {/* FAQs Accordions list */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {FAQS.map((faq, idx) => {
                const open = openFaq === idx;
                return (
                  <div key={idx} className="border border-gray-100 dark:border-maroon-950/40 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(open ? null : idx)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-maroon-950/20 text-right text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-maroon-850 cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && (
                      <div className="p-3 bg-white dark:bg-[#1c1416] text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 border-t border-gray-50 dark:border-maroon-900/10">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit/Log Ticket Request form */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mb-2.5">
              <MessageSquare className="h-4 w-4 text-maroon-850" />
              إرسال تذكرة فنية مخصصة لقسم تكنولوجيا المعلومات
            </h3>
            
            <form onSubmit={handleTicketSubmit} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 font-semibold mb-1">اسم الموظف المرسل</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.fullName}
                    className="w-full text-xs px-2.5 py-2 border border-gray-100 dark:border-maroon-900/20 bg-gray-100 dark:bg-maroon-950/20 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-semibold mb-1">القسم</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.department === 'all' ? 'جميع الأقسام' : currentUser.department === 'housekeeping' ? 'النظافة' : currentUser.department === 'maintenance' ? 'الصيانة' : 'مقدمي الطعام'}
                    className="w-full text-xs px-2.5 py-2 border border-gray-100 dark:border-maroon-900/20 bg-gray-100 dark:bg-maroon-950/20 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="عنوان المشكلة باختصار..."
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 border border-gray-200 dark:border-maroon-900/40 bg-gray-50 dark:bg-maroon-950/20 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <textarea
                  required
                  placeholder="اكتب المشكلة أو الطلب التفصيلي هنا لمهندس النظم والمبرمجين..."
                  value={ticketIssue}
                  onChange={(e) => setTicketIssue(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-2.5 py-2 border border-gray-200 dark:border-maroon-900/40 bg-gray-50 dark:bg-maroon-950/20 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-maroon-850 hover:bg-maroon-900 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                إرسال التذكرة للتوجيه الفوري
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Tickets Logs (Especially for managerial resolution) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1315] border border-gray-100 dark:border-maroon-950/40 shadow-xs">
        <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 pb-3 border-b border-gray-50 dark:border-maroon-900/15 mb-3">
          أرشيف وحالات تذاكر الخدمة الفنية بالفندق ({tickets.length})
        </h3>

        <div className="space-y-3">
          {tickets.map((st) => (
            <div 
              key={st.id} 
              className="p-3 bg-gray-50 dark:bg-maroon-950/20 rounded-xl border border-gray-100 dark:border-maroon-900/10 flex flex-col md:flex-row md:items-start justify-between gap-3 text-right"
              id={`ticket-log-${st.id}`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{st.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    st.status === 'resolved' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {st.status === 'resolved' ? 'تم الحل بنجاح' : 'تحت المراجعة والحل'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  مقدم التذكرة: <strong className="font-semibold text-gray-700 dark:text-gray-300">{st.user} ({st.department})</strong>
                </p>
                <blockquote className="text-[11px] italic bg-white dark:bg-[#1e1517] p-2 rounded-lg text-gray-600 dark:text-gray-400 border-r-2 border-maroon-800">
                  "{st.issue}"
                </blockquote>
                
                {st.response && (
                  <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-2 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/15 p-2 rounded-lg">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span><strong>حل مهندس النظم:</strong> {st.response}</span>
                  </div>
                )}
              </div>

              {/* Managers can resolve tickets on the spot! */}
              {currentUser.role === 'manager' && st.status === 'open' && (
                <div className="shrink-0 flex flex-col gap-2 min-w-[200px]">
                  {resolvingTicketId === st.id ? (
                    <form onSubmit={handleResolveSubmit} className="space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="اكتب التوجيه الفني والحل هنا..."
                        value={resolveResponse}
                        onChange={(e) => setResolveResponse(e.target.value)}
                        className="w-full text-[10px] px-2 py-1.5 border border-gray-200 dark:border-maroon-900/40 bg-white dark:bg-maroon-950/30 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-hidden"
                      />
                      <div className="flex gap-1">
                        <button
                          type="submit"
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold cursor-pointer"
                        >
                          تأكيد ومسح
                        </button>
                        <button
                          type="button"
                          onClick={() => setResolvingTicketId(null)}
                          className="px-2 py-1 bg-gray-200 dark:bg-maroon-900 text-gray-700 dark:text-gray-200 rounded text-[9px] cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setResolvingTicketId(st.id)}
                      className="px-3 py-1.5 bg-maroon-850 hover:bg-maroon-900 text-white rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 justify-center transition-colors"
                    >
                      إضافة واستعراض حل التذكرة
                    </button>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
