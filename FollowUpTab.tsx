import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CALENDAR_WEEKS, FOLLOW_UP_ITEMS } from '../../data/calendarData';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  CheckCheck, 
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  CalendarDays,
  X,
  RotateCcw,
  MessageSquare,
  FileCheck,
  CalendarRange,
  BookOpen,
  Award
} from 'lucide-react';

import { getSchoolGenderLabels } from '../../utils/genderLabels';

export const FollowUpTab: React.FC = () => {
  const { 
    currentSchool, 
    currentSchoolTeachers, 
    selectedTeacherId, 
    setSelectedTeacherId, 
    currentWeek, 
    setCurrentWeek,
    getStatus,
    setStatus,
    setDayAllStatus,
    setWeekAllStatus,
    getDayNote,
    setDayNote
  } = useApp();

  const labels = getSchoolGenderLabels(currentSchool);

  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [viewLayout, setViewLayout] = useState<'landscape' | 'portrait'>('landscape');

  // Active teacher
  const selectedTeacher = currentSchoolTeachers.find((t) => t.id === selectedTeacherId) || currentSchoolTeachers[0];

  // Active week data from calendar
  const weekData = CALENDAR_WEEKS.find((w) => w.weekNumber === currentWeek) || CALENDAR_WEEKS[0];

  const handlePrevWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeek < CALENDAR_WEEKS.length) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const getItemIcon = (key: string) => {
    switch (key) {
      case 'prep':
        return <FileCheck className="w-4 h-4 text-[#165a49]" />;
      case 'plan':
        return <CalendarRange className="w-4 h-4 text-[#165a49]" />;
      case 'homework':
        return <BookOpen className="w-4 h-4 text-[#165a49]" />;
      case 'exam':
        return <Award className="w-4 h-4 text-[#165a49]" />;
      default:
        return <FileCheck className="w-4 h-4 text-[#165a49]" />;
    }
  };

  if (!currentSchool) return null;

  if (currentSchoolTeachers.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xs max-w-lg mx-auto hover-card-motion">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-base mb-1">
          {labels.noTeachersFound}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          يرجى الانتقال إلى تبويب "الإعدادات" لإضافة {labels.teachersLabel} يدوياً أو باللصق لبدء رصد المتابعة.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pb-14 font-['Cairo'] space-y-5">
      {/* 1 & 2. Top Bar: Teacher Selector + Week Navigator (Side-by-side in landscape desktop, stacked on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* 1. Teacher Selector Header */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover-card-motion flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">{labels.teacherSelectLabel}</span>
              <span className="text-[11px] font-bold text-[#165a49] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                {currentSchoolTeachers.length} {labels.teachersLabel}
              </span>
            </div>
            <div className="relative">
              <select
                value={selectedTeacherId || selectedTeacher?.id}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-slate-800 outline-hidden focus:ring-2 focus:ring-[#165a49]/20 focus:border-[#165a49] transition cursor-pointer"
              >
                {currentSchoolTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.subject && t.subject !== 'عام' ? `(${t.subject})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedTeacher && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>التخصص: <strong className="text-slate-800">{selectedTeacher.subject || 'عام'}</strong></span>
              {selectedTeacher.civilId && (
                <span className="font-mono text-[11px]">هوية: {selectedTeacher.civilId}</span>
              )}
            </div>
          )}
        </div>

        {/* 2. Week Navigator & Quick Batch Actions & Layout Mode Toggle */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover-card-motion flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            {/* Quick jump button (+) and previous week (<) in RTL */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowWeekPicker(true)}
                title="عرض كل أسابيع الفصل الدراسي"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#165a49] hover:bg-[#124d3e] text-white flex items-center justify-center font-bold text-lg shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                +
              </button>

              <button
                onClick={handlePrevWeek}
                disabled={currentWeek <= 1}
                title="الأسبوع السابق"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 text-slate-700 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Week Label & Hijri Date range */}
            <div 
              onClick={() => setShowWeekPicker(true)}
              className="text-center cursor-pointer px-3 py-1 rounded-2xl hover:bg-slate-50 transition"
            >
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {weekData.title}
                </h2>
                {weekData.isExamWeek && (
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">
                    اختبارات
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-[#165a49] font-semibold mt-0.5">
                من {weekData.days[0].hijriDate} إلى {weekData.days[4].hijriDate}هـ ({weekData.monthName})
              </p>
            </div>

            {/* Next week: arrow pointing left in RTL */}
            <button
              onClick={handleNextWeek}
              disabled={currentWeek >= CALENDAR_WEEKS.length}
              title="الأسبوع التالي"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 text-slate-700 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Batch Actions and Responsive Layout Indicator */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">إجراءات سريعة:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (selectedTeacher) {
                      setWeekAllStatus(currentSchool.id, selectedTeacher.id, currentWeek, 'done');
                    }
                  }}
                  className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#165a49] font-bold text-[11px] border border-emerald-200 transition hover:scale-102 active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>تحديد الأسبوع كـ تم</span>
                </button>
                <button
                  onClick={() => {
                    if (selectedTeacher) {
                      setWeekAllStatus(currentSchool.id, selectedTeacher.id, currentWeek, 'not_done');
                    }
                  }}
                  className="px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] transition hover:scale-102 active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة ضبط</span>
                </button>
              </div>
            </div>

            {/* Landscape vs Portrait Toggle for Screens */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setViewLayout('landscape')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  viewLayout === 'landscape' ? 'bg-white text-[#165a49] shadow-2xs font-extrabold' : 'hover:text-slate-900'
                }`}
                title="تنسيق عرضي: عرض أيام الأسبوع أفقياً بجانب بعضها على الشاشات الكبيرة"
              >
                <span>تنسيق عرضي</span>
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('portrait')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  viewLayout === 'portrait' ? 'bg-white text-[#165a49] shadow-2xs font-extrabold' : 'hover:text-slate-900'
                }`}
                title="تنسيق طولي: عرض أيام الأسبوع رأسياً كقائمة"
              >
                <span>تنسيق طولي</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Daily Cards (5 days) */}
      {/* Responsive: In landscape mode on desktop (xl:grid-cols-5 md:grid-cols-2 lg:grid-cols-3), all 5 days sit horizontally side-by-side! */}
      {/* On smartphones / mobile: collapses to grid-cols-1 (طولي) vertically automatically */}
      <div 
        className={
          viewLayout === 'landscape'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch'
            : 'grid grid-cols-1 max-w-3xl mx-auto space-y-4'
        }
      >
        {weekData.days.map((day, dayIndex) => {
          const currentDayNote = selectedTeacher
            ? getDayNote(currentSchool.id, selectedTeacher.id, currentWeek, dayIndex)
            : '';

          return (
            <div
              key={dayIndex}
              className={`bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover-card-motion relative transition flex flex-col justify-between ${
                day.isHoliday ? 'bg-amber-50/30 border-amber-200' : ''
              }`}
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {day.dayName}
                    </h3>
                    {day.isHoliday && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 font-bold px-1.5 py-0.5 rounded-full">
                        {day.holidayTitle || 'إجازة'}
                      </span>
                    )}
                  </div>

                  {/* Hijri Date badge */}
                  <div className="bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-lg shadow-2xs">
                    {day.hijriDate}
                  </div>
                </div>

                {/* Day Follow-up Elements */}
                <div className="space-y-3.5">
                  {FOLLOW_UP_ITEMS.map((item) => {
                    const currentStatus = selectedTeacher
                      ? getStatus(currentSchool.id, selectedTeacher.id, currentWeek, dayIndex, item.key)
                      : 'not_done';

                    return (
                      <div key={item.key} className="space-y-1.5">
                        {/* Item Title with icon */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            {getItemIcon(item.key)}
                            <span className="truncate">{item.label}</span>
                          </div>
                        </div>

                        {/* 3 Prominent Status Buttons with hover motion */}
                        <div className="grid grid-cols-3 gap-1 sm:gap-1.5" dir="rtl">
                          {/* 1. اليمين: تم */}
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedTeacher) {
                                setStatus(currentSchool.id, selectedTeacher.id, currentWeek, dayIndex, item.key, 'done');
                              }
                            }}
                            className={`status-btn-motion group py-2 px-1 sm:px-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer ${
                              currentStatus === 'done'
                                ? 'bg-gradient-to-b from-[#22b573] to-[#1ca164] text-white shadow-sm shadow-[#1ca164]/25 border-b-[3px] border-[#167d4e] -translate-y-[1px]'
                                : 'bg-white hover:bg-[#22b573]/10 border border-slate-200 border-b-[2px] border-b-slate-300 text-slate-600 hover:text-[#1ca164] shadow-2xs'
                            }`}
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-125 ${
                              currentStatus === 'done' ? 'text-white' : 'text-[#22b573]/70'
                            }`} />
                            <span>تم</span>
                          </button>

                          {/* 2. الوسط: لم يتم */}
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedTeacher) {
                                setStatus(currentSchool.id, selectedTeacher.id, currentWeek, dayIndex, item.key, 'not_done');
                              }
                            }}
                            className={`status-btn-motion group py-2 px-1 sm:px-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer ${
                              currentStatus === 'not_done'
                                ? 'bg-gradient-to-b from-[#f26374] to-[#df4b5e] text-white shadow-sm shadow-[#df4b5e]/25 border-b-[3px] border-[#c03445] -translate-y-[1px]'
                                : 'bg-white hover:bg-[#f26374]/10 border border-slate-200 border-b-[2px] border-b-slate-300 text-slate-600 hover:text-[#df4b5e] shadow-2xs'
                            }`}
                          >
                            <XCircle className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-125 ${
                              currentStatus === 'not_done' ? 'text-white' : 'text-[#f26374]/70'
                            }`} />
                            <span className="whitespace-nowrap">لم يتم</span>
                          </button>

                          {/* 3. اليسار: غير مكتمل */}
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedTeacher) {
                                setStatus(currentSchool.id, selectedTeacher.id, currentWeek, dayIndex, item.key, 'incomplete');
                              }
                            }}
                            className={`status-btn-motion group py-2 px-1 sm:px-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer ${
                              currentStatus === 'incomplete'
                                ? 'bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-white shadow-sm shadow-[#d97706]/25 border-b-[3px] border-[#b45309] -translate-y-[1px]'
                                : 'bg-white hover:bg-amber-50/50 border border-slate-200 border-b-[2px] border-b-slate-300 text-slate-600 hover:text-[#d97706] shadow-2xs'
                            }`}
                          >
                            <Clock3 className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-125 ${
                              currentStatus === 'incomplete' ? 'text-white' : 'text-amber-500/70'
                            }`} />
                            <span className="whitespace-nowrap">غير مكتمل</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day Note Section */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                    <MessageSquare className="w-3.5 h-3.5 text-[#165a49]" />
                    <span>ملاحظة اليوم:</span>
                    {currentDayNote.trim() && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="توجد ملاحظة مسجلة"></span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTeacher) {
                        setDayAllStatus(currentSchool.id, selectedTeacher.id, currentWeek, dayIndex, 'done');
                      }
                    }}
                    className="text-[10px] text-[#165a49] hover:text-[#124d3e] font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>الكل تم</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={currentDayNote}
                    onChange={(e) => {
                      if (selectedTeacher) {
                        setDayNote(currentSchool.id, selectedTeacher.id, currentWeek, dayIndex, e.target.value);
                      }
                    }}
                    placeholder={labels.notePlaceholder(day.dayName)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 focus:border-[#165a49] focus:ring-1 focus:ring-emerald-300 text-xs text-slate-800 outline-hidden bg-slate-50/60 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Picker Modal */}
      {showWeekPicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="p-4 bg-[#165a49] text-white rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">اختر أسبوع الرصد (التقويم 1448هـ)</h3>
              </div>
              <button
                onClick={() => setShowWeekPicker(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {CALENDAR_WEEKS.map((w) => {
                const isSelected = w.weekNumber === currentWeek;
                return (
                  <button
                    key={w.weekNumber}
                    onClick={() => {
                      setCurrentWeek(w.weekNumber);
                      setShowWeekPicker(false);
                    }}
                    className={`w-full text-right p-3 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-100 text-[#165a49] font-bold text-xs flex items-center justify-center">
                          {w.displayNumber}
                        </span>
                        <span className="font-bold text-sm">{w.title}</span>
                        {w.isExamWeek && (
                          <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                            اختبارات
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 mr-9">
                        {w.days[0].hijriDate} ⟵ {w.days[4].hijriDate}هـ ({w.monthName})
                      </p>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#165a49] text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
