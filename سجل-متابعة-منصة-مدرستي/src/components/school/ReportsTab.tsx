import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { CALENDAR_WEEKS, MONTHS_LIST, FOLLOW_UP_ITEMS } from '../../data/calendarData';
import { FollowUpItemKey, Teacher } from '../../types';
import html2pdf from 'html2pdf.js';
import { 
  BarChart3, 
  Printer, 
  Download, 
  Calendar, 
  User, 
  Users, 
  Award, 
  FileDown, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Clock3,
  TrendingUp,
  MessageSquare,
  PieChart,
  FileCheck,
  CalendarRange,
  BookOpen
} from 'lucide-react';
import { getSchoolGenderLabels } from '../../utils/genderLabels';
import { MinistryLogo } from '../MinistryLogo';

export const ReportsTab: React.FC = () => {
  const { 
    currentSchool, 
    currentSchoolTeachers, 
    currentWeek, 
    getStatus,
    getDayNote 
  } = useApp();

  const reportPrintRef = useRef<HTMLDivElement>(null);
  const labels = getSchoolGenderLabels(currentSchool);

  // Filters
  const [reportScope, setReportScope] = useState<'all' | 'single'>('single');
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    currentSchoolTeachers[0]?.id || ''
  );
  const [targetWeek, setTargetWeek] = useState<number>(currentWeek);
  const [targetMonth, setTargetMonth] = useState<number>(1);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  if (!currentSchool) return null;

  const currentTeacher = currentSchoolTeachers.find((t) => t.id === selectedTeacherId) || currentSchoolTeachers[0];

  const activeWeeks: number[] = useMemo(() => {
    if (reportPeriod === 'weekly') {
      return [targetWeek];
    } else {
      const monthObj = MONTHS_LIST.find((m) => m.id === targetMonth);
      return monthObj ? monthObj.weeks : [1, 2, 3, 4];
    }
  }, [reportPeriod, targetWeek, targetMonth]);

  const targetTeachers: Teacher[] = useMemo(() => {
    if (reportScope === 'all') {
      return currentSchoolTeachers;
    } else {
      return currentTeacher ? [currentTeacher] : [];
    }
  }, [reportScope, currentSchoolTeachers, currentTeacher]);

  const stats = useMemo(() => {
    let totalItems = 0;
    let doneCount = 0;
    let notDoneCount = 0;
    let incompleteCount = 0;

    const itemStats: Record<FollowUpItemKey, { done: number; notDone: number; incomplete: number; total: number }> = {
      prep: { done: 0, notDone: 0, incomplete: 0, total: 0 },
      plan: { done: 0, notDone: 0, incomplete: 0, total: 0 },
      homework: { done: 0, notDone: 0, incomplete: 0, total: 0 },
      exam: { done: 0, notDone: 0, incomplete: 0, total: 0 },
    };

    const collectedNotes: Array<{ teacherName: string; weekTitle: string; dayName: string; note: string }> = [];

    const teacherBreakdown = targetTeachers.map((teacher) => {
      let tDone = 0;
      let tNotDone = 0;
      let tIncomplete = 0;
      let tTotal = 0;

      activeWeeks.forEach((w) => {
        const weekObj = CALENDAR_WEEKS.find((cw) => cw.weekNumber === w);
        for (let day = 0; day < 5; day++) {
          const dayName = weekObj?.days[day]?.dayName || `اليوم ${day + 1}`;
          const noteText = getDayNote(currentSchool.id, teacher.id, w, day);
          if (noteText && noteText.trim()) {
            collectedNotes.push({
              teacherName: teacher.name,
              weekTitle: weekObj?.title || `الأسبوع ${w}`,
              dayName,
              note: noteText.trim(),
            });
          }

          FOLLOW_UP_ITEMS.forEach((it) => {
            const st = getStatus(currentSchool.id, teacher.id, w, day, it.key);
            tTotal++;
            totalItems++;

            itemStats[it.key].total++;

            if (st === 'done') {
              tDone++;
              doneCount++;
              itemStats[it.key].done++;
            } else if (st === 'incomplete') {
              tIncomplete++;
              incompleteCount++;
              itemStats[it.key].incomplete++;
            } else {
              tNotDone++;
              notDoneCount++;
              itemStats[it.key].notDone++;
            }
          });
        }
      });

      const rate = tTotal > 0 ? Math.round((tDone / tTotal) * 100) : 0;
      return {
        teacher,
        done: tDone,
        notDone: tNotDone,
        incomplete: tIncomplete,
        total: tTotal,
        rate,
      };
    });

    const completionRate = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;

    return {
      totalItems,
      doneCount,
      notDoneCount,
      incompleteCount,
      completionRate,
      itemStats,
      teacherBreakdown,
      collectedNotes,
    };
  }, [currentSchool.id, targetTeachers, activeWeeks, getStatus, getDayNote]);

  const targetWeekObj = CALENDAR_WEEKS.find((w) => w.weekNumber === targetWeek) || CALENDAR_WEEKS[0];

  const periodTitle =
    reportPeriod === 'weekly'
      ? targetWeekObj.title
      : MONTHS_LIST.find((m) => m.id === targetMonth)?.name || `الشهر ${targetMonth}`;

  // Dynamic Day Name and Hijri/Gregorian Date (updates automatically each day)
  const { reportDayName, reportDateHijri, reportDateGregorian } = useMemo(() => {
    const today = new Date();

    // Actual Day Name in Arabic (السبت, الأحد, الإثنين, الثلاثاء, الأربعاء, الخميس, الجمعة)
    const day = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(today);

    // Dynamic Hijri Date
    let hijri = '';
    try {
      hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      }).format(today) + 'هـ';
    } catch {
      hijri = (targetWeekObj?.days[0]?.hijriDate || '1448/1/1') + 'هـ';
    }

    // Gregorian Date in Arabic
    const greg = new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(today) + 'م';

    return {
      reportDayName: day,
      reportDateHijri: hijri,
      reportDateGregorian: greg,
    };
  }, [targetWeekObj]);

  const reportFileName = labels.isGirls
    ? `تقرير_متابعة_معلمات_${currentSchool.name}_${reportPeriod === 'weekly' ? `أسبوع_${targetWeek}` : `شهر_${targetMonth}`}`
    : `تقرير_متابعة_${currentSchool.name}_${reportPeriod === 'weekly' ? `أسبوع_${targetWeek}` : `شهر_${targetMonth}`}`;

  // Export to CSV
  const handleExportCSV = () => {
    let csv = '\uFEFF';
    csv += 'المملكة العربية السعودية - وزارة التعليم - سجل متابعة منصة مدرستي\n';
    csv += `المدرسة: ${currentSchool.name} (${labels.categoryLabel})\n`;
    csv += `${labels.principalLabel}: ${currentSchool.principalName}\n`;
    csv += `تاريخ التقرير: ${reportDayName} ${reportDateHijri}\n`;
    csv += `فترة التقرير: ${periodTitle}\n`;
    csv += `نسبة الإنجاز الإجمالية: ${stats.completionRate}%\n\n`;

    csv += `${labels.teacherLabel},التخصص,تم,لم يتم,غير مكتمل,الإجمالي,نسبة الإنجاز\n`;
    stats.teacherBreakdown.forEach((t) => {
      csv += `"${t.teacher.name}","${t.teacher.subject || 'عام'}",${t.done},${t.notDone},${t.incomplete},${t.total},"${t.rate}%"\n`;
    });

    if (stats.collectedNotes.length > 0) {
      csv += '\nالملاحظات المدونة خلال الفترة:\n';
      csv += `${labels.teacherLabel},الأسبوع,اليوم,الملاحظة\n`;
      stats.collectedNotes.forEach((n) => {
        csv += `"${n.teacherName}","${n.weekTitle}","${n.dayName}","${n.note.replace(/"/g, '""')}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportFileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Direct Print
  const handlePrint = () => {
    window.print();
  };

  // Direct PDF Download with html2pdf (compact 1-page fit)
  const handleDownloadPDF = async () => {
    if (!reportPrintRef.current || isGeneratingPDF) return;

    try {
      setIsGeneratingPDF(true);

      const element = reportPrintRef.current;
      const opt = {
        margin: [4, 4, 4, 4] as [number, number, number, number],
        filename: `${reportFileName}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          windowWidth: 1024,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf().set(opt).from(element).save();

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Donut metrics
  const total = stats.totalItems || 1;
  const pctDone = stats.totalItems > 0 ? Math.round((stats.doneCount / total) * 100) : 0;
  const pctNotDone = stats.totalItems > 0 ? Math.round((stats.notDoneCount / total) * 100) : 0;
  const pctIncomplete = stats.totalItems > 0 ? Math.max(0, 100 - pctDone - pctNotDone) : 0;

  const circumference = 2 * Math.PI * 34;
  const strokeDone = (pctDone / 100) * circumference;
  const strokeIncomplete = (pctIncomplete / 100) * circumference;
  const strokeNotDone = (pctNotDone / 100) * circumference;

  const getRatingLabel = (rate: number) => {
    if (rate >= 90) return { label: 'ممتاز مرتفع', color: 'text-emerald-700 bg-emerald-100/80 border-emerald-300' };
    if (rate >= 75) return { label: 'جيد جداً', color: 'text-teal-700 bg-teal-100/80 border-teal-300' };
    if (rate >= 50) return { label: 'مستوى متوسط', color: 'text-amber-700 bg-amber-100/80 border-amber-300' };
    return { label: 'يحتاج متابعة', color: 'text-red-700 bg-red-100/80 border-red-300' };
  };

  const rating = getRatingLabel(stats.completionRate);

  const getItemIcon = (key: string) => {
    switch (key) {
      case 'prep':
        return <FileCheck className="w-3.5 h-3.5 text-emerald-700" />;
      case 'plan':
        return <CalendarRange className="w-3.5 h-3.5 text-teal-700" />;
      case 'homework':
        return <BookOpen className="w-3.5 h-3.5 text-sky-700" />;
      case 'exam':
        return <Award className="w-3.5 h-3.5 text-amber-700" />;
      default:
        return <FileCheck className="w-3.5 h-3.5 text-emerald-700" />;
    }
  };

  return (
    <div className="space-y-4 w-full max-w-7xl mx-auto pb-10 font-['Cairo']">
      {/* Toast Notification on PDF Success */}
      {pdfSuccess && (
        <div className="fixed bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:w-96 z-50 bg-[#165a49] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">تم تحميل تقرير PDF بنجاح!</span>
        </div>
      )}

      {/* 1. Interactive Filter Controls (Hidden on print) */}
      <div className="no-print bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover-card-motion space-y-3.5">
        {/* Scope and Period Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Scope: All vs Single Teacher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              نطاق التقرير:
            </label>
            <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setReportScope('single')}
                className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  reportScope === 'single'
                    ? 'bg-white text-[#165a49] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="w-5 h-5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <User className="w-3 h-3 text-[#165a49]" />
                </div>
                <span>{labels.singleTeacherScopeLabel}</span>
              </button>
              <button
                type="button"
                onClick={() => setReportScope('all')}
                className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  reportScope === 'all'
                    ? 'bg-white text-[#165a49] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="w-5 h-5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Users className="w-3 h-3 text-[#165a49]" />
                </div>
                <span>{labels.allTeachersScopeLabel}</span>
              </button>
            </div>
          </div>

          {/* Period: Weekly vs Monthly */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              نوع التقرير:
            </label>
            <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setReportPeriod('weekly')}
                className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  reportPeriod === 'weekly'
                    ? 'bg-white text-[#165a49] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="w-5 h-5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-[#165a49]" />
                </div>
                <span>أسبوعي</span>
              </button>
              <button
                type="button"
                onClick={() => setReportPeriod('monthly')}
                className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  reportPeriod === 'monthly'
                    ? 'bg-white text-[#165a49] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="w-5 h-5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <BarChart3 className="w-3 h-3 text-[#165a49]" />
                </div>
                <span>شهري</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          {reportScope === 'single' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {labels.selectTeacherDropdownLabel}
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold text-slate-800 outline-hidden focus:border-[#165a49]"
              >
                {currentSchoolTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center text-xs text-[#165a49] bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-200">
              <Users className="w-4 h-4 text-[#165a49] ml-1.5 shrink-0" />
              <span>مشمول جميع {labels.teachersLabel} ({currentSchoolTeachers.length})</span>
            </div>
          )}

          {reportPeriod === 'weekly' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اختر الأسبوع:
              </label>
              <select
                value={targetWeek}
                onChange={(e) => setTargetWeek(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold text-slate-800 outline-hidden focus:border-[#165a49]"
              >
                {CALENDAR_WEEKS.map((w) => (
                  <option key={w.weekNumber} value={w.weekNumber}>
                    {w.title} ({w.days[0].hijriDate} - {w.days[4].hijriDate}هـ)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اختر الشهر:
              </label>
              <select
                value={targetMonth}
                onChange={(e) => setTargetMonth(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold text-slate-800 outline-hidden focus:border-[#165a49]"
              >
                {MONTHS_LIST.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons: Download PDF, Print, CSV */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400">خيارات التقارير:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
              title="تصدير جدول البيانات Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-1.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              title="طباعة التقرير مباشرة"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-[#165a49] to-[#1f7862] hover:from-[#124d3e] hover:to-[#165a49] disabled:bg-slate-400 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-800/20 active:scale-95 transition cursor-pointer border-b-2 border-emerald-900"
              title="تحميل ملف التقرير بصيغة PDF صفحة واحدة مواءمة"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري إنشاء PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-emerald-200" />
                  <span>تحميل تقرير PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Printable / PDF Exportable Container                     */}
      {/* Compact single-page A4 optimized styling                 */}
      {/* ======================================================== */}
      <div 
        ref={reportPrintRef} 
        id="report-printable-area"
        className="space-y-3.5 bg-white p-3.5 sm:p-5 rounded-3xl print:p-0 print:border-none shadow-xs text-slate-800"
      >
        {/* ====================================================================== */}
        {/* Official Saudi Ministry of Education Header (ترويسة التقرير الرسمية)   */}
        {/* Right: Kingdom & School | Center: Logo | Left: Dynamic Day & Date      */}
        {/* ====================================================================== */}
        <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs relative overflow-hidden">
          {/* Top Decorative Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#165a49] via-emerald-600 to-[#165a49]" />

          <div className="grid grid-cols-3 items-center gap-2 pt-1 pb-2 border-b border-emerald-800/30">
            {/* 1. Right Side: Kingdom, Ministry, School, Category */}
            <div className="text-right text-[11px] leading-tight space-y-0.5">
              <p className="font-extrabold text-slate-800 text-[11px]">
                المملكة العربية السعودية
              </p>
              <p className="font-bold text-[#165a49] text-[10px]">
                وزارة التعليم
              </p>
              <div className="pt-0.5 flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-xs">
                  {currentSchool.name}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${
                  labels.isGirls ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-[#165a49]'
                }`}>
                  {labels.categoryLabel}
                </span>
              </div>
            </div>

            {/* 2. Center: Official Ministry Vector Logo & Title */}
            <div className="text-center flex flex-col items-center justify-center">
              <MinistryLogo size={52} />
              <h2 className="text-xs font-black text-[#165a49] tracking-tight mt-0.5">
                سجل متابعة منصة مدرستي
              </h2>
              <span className="text-[9px] text-slate-500 font-bold">
                {reportPeriod === 'weekly' ? 'التقرير الأسبوعي' : 'التقرير الشهري'}
              </span>
            </div>

            {/* 3. Left Side: Dynamic Date & Day (changes every day) */}
            <div className="text-left text-[10px] space-y-0.5 font-mono">
              <div className="inline-block bg-slate-50 border border-slate-200/90 rounded-xl p-1.5 text-right">
                <p className="text-slate-700">
                  <span className="font-sans text-slate-400 text-[9px]">اليوم: </span>
                  <strong className="text-slate-900 font-sans font-bold">{reportDayName}</strong>
                </p>
                <p className="text-slate-700">
                  <span className="font-sans text-slate-400 text-[9px]">التاريخ: </span>
                  <strong className="text-[#165a49]">{reportDateHijri}</strong>
                </p>
                <p className="text-slate-700">
                  <span className="font-sans text-slate-400 text-[9px]">الفترة: </span>
                  <strong className="text-slate-800 font-sans">{periodTitle}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Subtitle / Scope Banner */}
          <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">موضوع التقرير:</span>
              <strong className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                {labels.reportSubTitle(reportScope === 'single', currentTeacher?.name, currentSchool.name)}
              </strong>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span>{labels.principalLabel}: <strong className="text-slate-800">{currentSchool.principalName}</strong></span>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 2. Compact 4 KPI Cards (نسبة الإنجاز • تم • لم يتم • غير مكتمل)          */}
        {/* ====================================================================== */}
        <div className="grid grid-cols-4 gap-2.5">
          {/* Card 1: نسبة الإنجاز */}
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-600" />
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500">نسبة الإنجاز</span>
              <div className="w-6 h-6 rounded-xl bg-gradient-to-b from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-xs">
                <TrendingUp className="w-3 h-3" />
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-slate-900 mb-0.5">
                {stats.completionRate}%
              </div>
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border ${rating.color}`}>
                {rating.label}
              </span>
            </div>
          </div>

          {/* Card 2: تم */}
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#22b573] to-[#1ca164]" />
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-700">مكتمل (تم)</span>
              <div className="w-6 h-6 rounded-xl bg-gradient-to-b from-[#22b573] to-[#1ca164] text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-[#1ca164] mb-0.5">
                {stats.doneCount}
              </div>
              <span className="text-[9px] font-bold text-[#167d4e] bg-[#22b573]/10 px-1.5 py-0.2 rounded border border-[#22b573]/30">
                منجز
              </span>
            </div>
          </div>

          {/* Card 3: لم يتم */}
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#f26374] to-[#df4b5e]" />
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-700">لم يتم</span>
              <div className="w-6 h-6 rounded-xl bg-gradient-to-b from-[#f26374] to-[#df4b5e] text-white flex items-center justify-center shadow-xs">
                <XCircle className="w-3 h-3" />
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-[#df4b5e] mb-0.5">
                {stats.notDoneCount}
              </div>
              <span className="text-[9px] font-bold text-[#c03445] bg-[#f26374]/10 px-1.5 py-0.2 rounded border border-[#f26374]/30">
                غير مرصود
              </span>
            </div>
          </div>

          {/* Card 4: غير مكتمل */}
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-amber-800">غير مكتمل</span>
              <div className="w-6 h-6 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-xs">
                <Clock3 className="w-3 h-3" />
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-amber-600 mb-0.5">
                {stats.incompleteCount}
              </div>
              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                استكمال
              </span>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 3 & 4. Analytics Grid (Donut & Field Stats side-by-side)               */}
        {/* ====================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
          {/* Donut Chart: Cases Distribution */}
          <div className="md:col-span-5 bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#165a49] flex items-center justify-center">
                  <PieChart className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-800 text-xs">
                  توزيع حالات المتابعة
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.2 rounded">
                المجموع: {stats.totalItems}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 pb-1">
              {/* Circular SVG Donut */}
              <div className="relative w-24 h-24 shrink-0 mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="11"
                  />
                  {strokeNotDone > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="34"
                      fill="none"
                      stroke="#f26374"
                      strokeWidth="11"
                      strokeDasharray={`${strokeNotDone} ${circumference}`}
                      strokeDashoffset="0"
                    />
                  )}
                  {strokeIncomplete > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="34"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="11"
                      strokeDasharray={`${strokeIncomplete} ${circumference}`}
                      strokeDashoffset={-strokeNotDone}
                    />
                  )}
                  {strokeDone > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="34"
                      fill="none"
                      stroke="#22b573"
                      strokeWidth="11"
                      strokeDasharray={`${strokeDone} ${circumference}`}
                      strokeDashoffset={-(strokeNotDone + strokeIncomplete)}
                    />
                  )}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-base font-black text-slate-800 leading-none">
                    {stats.completionRate}%
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold mt-0.5">
                    إنجاز
                  </span>
                </div>
              </div>

              {/* Status List */}
              <div className="flex-1 space-y-1 text-[10px]">
                <div className="flex items-center justify-between bg-emerald-50/60 p-1 rounded-lg">
                  <span className="font-bold text-emerald-800">تم:</span>
                  <span className="font-mono font-bold text-emerald-700">{stats.doneCount} ({pctDone}%)</span>
                </div>
                <div className="flex items-center justify-between bg-amber-50/60 p-1 rounded-lg">
                  <span className="font-bold text-amber-800">غير مكتمل:</span>
                  <span className="font-mono font-bold text-amber-700">{stats.incompleteCount} ({pctIncomplete}%)</span>
                </div>
                <div className="flex items-center justify-between bg-rose-50/60 p-1 rounded-lg">
                  <span className="font-bold text-rose-800">لم يتم:</span>
                  <span className="font-mono font-bold text-rose-700">{stats.notDoneCount} ({pctNotDone}%)</span>
                </div>
              </div>
            </div>

            {/* Stacked Cumulative Progress Bar */}
            <div className="mt-1 pt-1.5 border-t border-slate-100">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                {pctDone > 0 && (
                  <div style={{ width: `${pctDone}%` }} className="bg-emerald-500 h-full" />
                )}
                {pctIncomplete > 0 && (
                  <div style={{ width: `${pctIncomplete}%` }} className="bg-amber-400 h-full" />
                )}
                {pctNotDone > 0 && (
                  <div style={{ width: `${pctNotDone}%` }} className="bg-rose-500 h-full" />
                )}
              </div>
            </div>
          </div>

          {/* Field Statistics Card: "إحصائيات حسب المجال" */}
          <div className="md:col-span-7 bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-teal-50 text-[#165a49] flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-800 text-xs">
                  إحصائيات المتابعة حسب المجال
                </h3>
              </div>
            </div>

            <div className="space-y-1.5">
              {FOLLOW_UP_ITEMS.map((item) => {
                const data = stats.itemStats[item.key];
                const itemTotal = data.total || 1;
                const donePct = Math.round((data.done / itemTotal) * 100);
                const notDonePct = Math.round((data.notDone / itemTotal) * 100);
                const incompletePct = Math.round((data.incomplete / itemTotal) * 100);

                return (
                  <div key={item.key} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        {getItemIcon(item.key)}
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-emerald-700">تم: {data.done}</span>
                        <span className="text-amber-700">نقص: {data.incomplete}</span>
                        <span className="text-red-600">لم يتم: {data.notDone}</span>
                        <span className="text-[#165a49] font-black bg-emerald-100/80 px-1.5 py-0.2 rounded font-sans text-[10px]">
                          {donePct}%
                        </span>
                      </div>
                    </div>

                    <div className="h-2 bg-white rounded-full overflow-hidden flex border border-slate-200">
                      {donePct > 0 && (
                        <div style={{ width: `${donePct}%` }} className="bg-emerald-500 h-full" />
                      )}
                      {incompletePct > 0 && (
                        <div style={{ width: `${incompletePct}%` }} className="bg-amber-400 h-full" />
                      )}
                      {notDonePct > 0 && (
                        <div style={{ width: `${notDonePct}%` }} className="bg-rose-500 h-full" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 5. Teachers Breakdown Table: "تفصيل أداء المعلمين"                       */}
        {/* ====================================================================== */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Award className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs">
                {labels.teachersPerformanceTitle} ({stats.teacherBreakdown.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              جدول التقييم الفردي
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50 text-[10px]">
                  <th className="py-1.5 px-2.5 rounded-r-lg">{labels.teachersHeaderColumn}</th>
                  <th className="py-1.5 px-2">التخصص</th>
                  <th className="py-1.5 px-2 text-center text-emerald-700">تم</th>
                  <th className="py-1.5 px-2 text-center text-red-600">لم يتم</th>
                  <th className="py-1.5 px-2 text-center text-amber-600">غير مكتمل</th>
                  <th className="py-1.5 px-2.5 text-center rounded-l-lg">نسبة الإنجاز</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.teacherBreakdown.map((row, idx) => (
                  <tr key={row.teacher.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-1.5 px-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900">{row.teacher.name}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-slate-500 font-medium text-[10px]">
                      {row.teacher.subject || 'عام'}
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-emerald-700 font-mono text-[11px]">
                      {row.done}
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-red-600 font-mono text-[11px]">
                      {row.notDone}
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-amber-600 font-mono text-[11px]">
                      {row.incomplete}
                    </td>
                    <td className="py-1.5 px-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.2 rounded-full font-black font-mono text-[10px] border ${
                          row.rate >= 80
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : row.rate >= 50
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {row.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 6. Collected Daily Notes Section (الملاحظات المدونة خلال الفترة)         */}
        {/* ====================================================================== */}
        {stats.collectedNotes.length > 0 && (
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-800 text-xs">
                  الملاحظات اليومية المرصودة ({stats.collectedNotes.length})
                </h3>
              </div>
            </div>

            <div className="space-y-1.5">
              {stats.collectedNotes.map((n, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                  <div className="flex items-center justify-between text-slate-500 font-bold mb-0.5">
                    <span className="text-[#165a49] font-black">{n.teacherName}</span>
                    <span className="text-[9px] bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      {n.weekTitle} • يوم {n.dayName}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium leading-snug">{n.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
