import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  ShieldCheck, 
  LogOut, 
  RotateCcw,
  Settings,
  CalendarCheck2,
  BarChart3,
  ArrowRight,
  Sparkles,
  Calendar,
  Database
} from 'lucide-react';

import { getSchoolGenderLabels } from '../utils/genderLabels';
import { MinistryLogo } from './MinistryLogo';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    currentSchool, 
    activeTab, 
    setActiveTab, 
    logout, 
    loginAsAdmin,
    resetAllDataToDefault,
    supabaseStatus
  } = useApp();

  const isSchoolView = currentUser?.role === 'school';
  const labels = getSchoolGenderLabels(currentSchool);

  // Determine current day and formatted date in Arabic
  const { dayName, formattedDate, hijriFormatted } = useMemo(() => {
    const today = new Date();
    
    // Day name in Arabic (e.g. السبت, الأحد, ...)
    const day = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(today);
    
    // Gregorian date in Arabic (e.g. 24 أكتوبر 2026)
    const greg = new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(today);

    // Hijri date in Arabic
    let hijri = '';
    try {
      hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }).format(today);
    } catch {
      hijri = '';
    }

    return { dayName: day, formattedDate: greg, hijriFormatted: hijri };
  }, []);

  const schoolDisplayName = currentSchool?.name || (currentUser?.role === 'admin' ? 'الإدارة العامة للتعليم' : 'المدرسة');

  return (
    <header className="no-print relative bg-gradient-to-r from-[#0a3328] via-[#124d3e] via-[#17624f] to-[#0f3f33] text-white shadow-xl overflow-hidden border-b border-emerald-500/20">
      {/* Decorative ambient gradient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-14 -right-14 w-72 h-72 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-14 -left-14 w-72 h-72 rounded-full bg-teal-300/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-black/25 pointer-events-none" />
      </div>

      {/* Top Utility Bar (School/Admin indicator, quick actions) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-1 flex items-center justify-between text-xs border-b border-white/10">
        <div className="flex items-center gap-2">
          {currentUser?.role === 'admin' ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-emerald-200 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>المدير العام (admin100)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-emerald-100 font-medium">
              <Building2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>{currentSchool?.name || 'المدرسة'}</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-bold">{labels.categoryLabel}</span>
              <span className="text-white/40">•</span>
              <span className="text-emerald-300 text-[11px]">{labels.principalLabel}: {currentSchool?.principalName || labels.principalLabel}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Cloud Sync Status Indicator */}
          {isSchoolView && (
            <span
              title="المزامنة السحابية التلقائية لقاعدة البيانات نشطة"
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shadow-xs ${
                supabaseStatus === 'connected'
                  ? 'bg-emerald-950/70 border-emerald-400/40 text-emerald-200'
                  : supabaseStatus === 'needs_tables'
                  ? 'bg-amber-950/70 border-amber-400/40 text-amber-200'
                  : supabaseStatus === 'error'
                  ? 'bg-red-950/70 border-red-400/40 text-red-200'
                  : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <Database className="w-3 h-3 text-emerald-300" />
              <span>
                {supabaseStatus === 'connected'
                  ? 'مزامنة سحابية 🟢'
                  : supabaseStatus === 'needs_tables'
                  ? 'سحابي (بانتظار الجداول) 🟡'
                  : supabaseStatus === 'connecting'
                  ? 'جاري الاتصال... 🔵'
                  : supabaseStatus === 'error'
                  ? 'غير متصل 🔴'
                  : 'مزامنة سحابية'}
              </span>
            </span>
          )}

          {currentUser?.role === 'admin' && isSchoolView && (
            <button
              onClick={() => loginAsAdmin('admin100', '123456@')}
              className="text-[11px] text-amber-300 hover:text-white flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/30 font-bold transition cursor-pointer"
            >
              <span>العودة للوحة الإدارة</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => {
              if (confirm('هل ترغب بتصفير السجل وإعادة تعيين البيانات للوضع الافتراضي العام؟')) {
                resetAllDataToDefault();
              }
            }}
            title="تصفير السجل للوضع الافتراضي"
            className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={logout}
            title="تسجيل الخروج"
            className="flex items-center gap-1 text-[11px] text-red-200 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 px-2 py-0.5 rounded-md transition font-medium cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Main Brand Header:
          - Right (start in RTL): Official Saudi Ministry of Education Logo
          - Center: System Title & Subtitle
          - Left (end in RTL): School Name, Day, and Date
      */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2">
        {/* Mobile Layout (< md): 2 Rows (Row 1: Logo & School/Date; Row 2: Title & Subtitle) */}
        {/* Desktop Layout (>= md): 1 Row with 3 Columns (Right: Logo, Center: Title, Left: School/Date) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          
          {/* Top row on mobile / Right column on desktop (Ministry Logo & School Info on mobile) */}
          <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-3">
            {/* Ministry Logo (Right in RTL) - Enlarged to fill header height prominently */}
            <div 
              className="bg-white hover:bg-white/95 backdrop-blur-xs p-1.5 sm:p-2 md:p-2.5 rounded-2xl shadow-lg border-2 border-white/80 flex items-center justify-center transition-all duration-300 hover:shadow-2xl h-18 sm:h-22 md:h-28 lg:h-32 min-w-[95px] sm:min-w-[125px] md:min-w-[160px] lg:min-w-[185px] shrink-0"
              title="وزارة التعليم - المملكة العربية السعودية"
            >
              <MinistryLogo className="h-full w-full" />
            </div>

            {/* On mobile screens only, display School & Date Card here on the left side of Row 1 */}
            <div className="flex md:hidden items-center shrink-0">
              <div 
                className="bg-white/12 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/25 flex flex-col justify-center text-right shadow-xs"
                title="بيانات المدرسة والتاريخ"
              >
                <div className="flex items-center gap-1.5 text-white font-bold text-[11px]">
                  <Building2 className="w-3 h-3 text-emerald-300 shrink-0" />
                  <span className="truncate max-w-[130px]">
                    {schoolDisplayName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="bg-emerald-950/70 border border-emerald-400/40 text-amber-300 px-1.5 py-0.2 rounded text-[10px] font-black">
                    {dayName}
                  </span>
                  <span className="text-emerald-50 text-[10px] font-semibold">
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: System Title & Subtitle */}
          <div className="flex-1 text-center py-1 md:py-0">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-normal font-['Cairo'] drop-shadow-md">
              سجل متابعة منصة مدرستي
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm text-emerald-100/90 font-medium mt-1">
              نظام متابعة التحضير الإلكتروني والخطط الأسبوعية
            </p>
          </div>

          {/* Desktop only (>= md): Left Side (end in RTL) School Name, Day, and Date Display */}
          <div className="hidden md:flex items-center shrink-0">
            <div 
              className="bg-white/12 hover:bg-white/18 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-md border border-white/25 flex flex-col justify-center text-right transition-all duration-300 hover:border-white/40 hover:shadow-lg"
              title="بيانات المدرسة والتاريخ"
            >
              {/* School Name */}
              <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                <Building2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="truncate max-w-[200px] lg:max-w-[250px]">
                  {schoolDisplayName}
                </span>
              </div>

              {/* Day and Date Badge */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="bg-emerald-950/70 border border-emerald-400/40 text-amber-300 px-2 py-0.5 rounded-lg text-xs font-black shadow-xs">
                  {dayName}
                </span>
                <span className="text-emerald-50 text-xs font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-300 shrink-0" />
                  <span>{formattedDate}</span>
                  {hijriFormatted && (
                    <span className="text-emerald-200/80 text-[11px] mr-1">
                      ({hijriFormatted} هـ)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dedicated Navigation Tabs Bar (No negative margins, no clipping, no overlap) */}
      {isSchoolView && (
        <div className="relative z-20 max-w-xl mx-auto px-4 pt-1 pb-3 sm:pb-4">
          <nav 
            aria-label="أقسام سجل المتابعة"
            className="bg-[#05261d]/85 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-400/25 shadow-lg flex items-center justify-center gap-1.5 sm:gap-2.5"
          >
            {/* 1. الإعدادات (Rightmost in RTL) */}
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`top-tab-motion group flex-1 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-200 select-none ${
                activeTab === 'settings'
                  ? 'bg-white text-[#0a3328] shadow-md font-black ring-1 ring-white/60'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <Settings className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                activeTab === 'settings' ? 'text-[#0a3328] rotate-45 scale-110' : 'text-emerald-300 group-hover:rotate-45'
              }`} />
              <span className="whitespace-nowrap tracking-wide">الإعدادات</span>
            </button>

            {/* 2. المتابعة (Center in RTL) */}
            <button
              type="button"
              onClick={() => setActiveTab('followup')}
              className={`top-tab-motion group flex-1 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-200 select-none ${
                activeTab === 'followup'
                  ? 'bg-white text-[#0a3328] shadow-md font-black ring-1 ring-white/60'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <CalendarCheck2 className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                activeTab === 'followup' ? 'text-[#0a3328] scale-110' : 'text-emerald-300 group-hover:-rotate-6'
              }`} />
              <span className="whitespace-nowrap tracking-wide">المتابعة</span>
            </button>

            {/* 3. التقارير (Leftmost in RTL) */}
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`top-tab-motion group flex-1 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-200 select-none ${
                activeTab === 'reports'
                  ? 'bg-white text-[#0a3328] shadow-md font-black ring-1 ring-white/60'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
              }`}
            >
              <BarChart3 className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                activeTab === 'reports' ? 'text-[#0a3328] scale-110' : 'text-emerald-300 group-hover:-translate-y-0.5'
              }`} />
              <span className="whitespace-nowrap tracking-wide">التقارير</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
