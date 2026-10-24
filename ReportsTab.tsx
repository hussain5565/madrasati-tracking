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
  BookOpen,
  Sparkles,
  ShieldCheck,
  CheckCheck
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

  // Date and day of the report
  const reportDateHijri = targetWeekObj.days[4].hijriDate + 'هـ';
  const reportDayName = 'الخميس'; // End of academic week reporting day in Saudi Arabia

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

  // Direct PDF Download with html2pdf
  const handleDownloadPDF = async () => {
    if (!reportPrintRef.current || isGeneratingPDF) return;

    try {
      setIsGeneratingPDF(true);

      const element = reportPrintRef.current;
      const opt = {
        margin: [6, 6, 8, 6] as [number, number, number, number],
        filename: `${reportFileName}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
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

  const circumference = 2 * Math.PI * 40;
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
        return <FileCheck className="w-4 h-4 text-emerald-700" />;
      case 'plan':
        return <CalendarRange className="w-4 h-4 text-teal-700" />;
      case 'homework':
        return <BookOpen className="w-4 h-4 text-sky-700" />;
      case 'exam':
        return <Award className="w-4 h-4 text-amber-700" />;
      default:
        return <FileCheck className="w-4 h-4 text-emerald-700" />;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-14 font-['Cairo']">
      {/* Toast Notification on PDF Success */}
      {pdfSuccess && (
        <div className="fixed bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:w-96 z-50 bg-[#165a49] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">تم تحميل تقرير PDF بنجاح!</span>
        </div>
      )}

      {/* 1. Interactive Filter Controls (Hidden on print) */}
      <div className="no-print bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xs hover-card-motion space-y-4">
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
                className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
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
                className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
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
                className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
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
                className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
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
              <span>طباعة التقرير</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-[#165a49] to-[#1f7862] hover:from-[#124d3e] hover:to-[#165a49] disabled:bg-slate-400 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-800/20 active:scale-95 transition cursor-pointer border-b-2 border-emerald-900"
              title="تحميل ملف التقرير بصيغة PDF مع الترويسة والشعار"
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
      {/* Complete with Official 3-Part Header, Logo, All Cards    */}
      {/* ======================================================== */}
      <div 
        ref={reportPrintRef} 
        id="report-printable-area"
        className="space-y-6 bg-white p-3 sm:p-5 rounded-3xl print:p-0 print:border-none shadow-sm"
      >
        {/* ====================================================================== */}
        {/* Official Saudi Ministry of Education Header (ترويسة التقرير الرسمية)   */}
        {/* Right: Kingdom & School | Center: Ministry Logo | Left: Date & Day     */}
        {/* ====================================================================== */}
        <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden">
          {/* Top Decorative National Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#165a49] via-emerald-600 to-[#165a49]" />

          <div className="grid grid-cols-3 items-center gap-2 pt-2 pb-3 border-b-2 border-emerald-800/40">
            {/* 1. Right Side: Kingdom, Ministry, School, Category */}
            <div className="text-right text-xs space-y-0.5">
              <p className="font-extrabold text-slate-800 text-[11px] sm:text-xs">
                المملكة العربية السعودية
              </p>
              <p className="font-bold text-[#165a49] text-[11px]">
                وزارة التعليم
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {currentSchool.educationOffice || 'الإدارة العامة للتعليم'}
              </p>
              <div className="pt-1 flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
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
              <MinistryLogo size={70} />
              <h2 className="text-xs sm:text-sm font-black text-[#165a49] tracking-tight mt-1">
                سجل متابعة منصة مدرستي
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold">
                {reportPeriod === 'weekly' ? 'التقرير الأسبوعي' : 'التقرير الشهري'}
              </span>
            </div>

            {/* 3. Left Side: Date, Day, Week, Official Status */}
            <div className="text-left text-xs space-y-1 font-mono text-[11px]">
              <div className="inline-block bg-slate-50 border border-slate-200/90 rounded-xl p-2 text-right">
                <p className="text-slate-700">
                  <span className="font-sans text-slate-400 text-[10px]">اليوم: </span>
                  <strong className="text-slate-800 font-sans">{reportDayName}</strong>
                </p>
                <p className="text-slate-700">
                  <span className="font-sans text-slate-400 text-[10px]">التاريخ: </span>
                  <strong className="text-[#165a49]">{reportDateHijri}</strong>
                </p>
                <p className="text-slate-700">
                  <span className="font-sans text-slate-400 text-[10px]">الفترة: </span>
                  <strong className="text-slate-800 font-sans">{periodTitle}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Subtitle / Scope Banner */}
          <div className="mt-3 flex flex-wrap items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">موضوع التقرير:</span>
              <strong className="text-slate-900 font-bold bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                {labels.reportSubTitle(reportScope === 'single', currentTeacher?.name, currentSchool.name)}
              </strong>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>{labels.principalLabel}: <strong>{currentSchool.principalName}</strong></span>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 2. Redesigned 4 KPI Cards (بطاقات الإحصائيات الأربعة بتصميم بارز وجميل) */}
        {/* ====================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Card 1: نسبة الإنجاز */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover-card-motion relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-600" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">نسبة الإنجاز</span>
              {/* Prominent Embossed Icon Badge */}
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-b from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 border-b-2 border-emerald-800">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
                {stats.completionRate}%
              </div>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${rating.color}`}>
                {rating.label}
              </span>
            </div>
          </div>

          {/* Card 2: تم */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover-card-motion relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#22b573] to-[#1ca164]" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">عناصر مكتملة (تم)</span>
              {/* Prominent Embossed Icon Badge */}
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-b from-[#22b573] to-[#1ca164] text-white flex items-center justify-center shadow-xs shadow-[#1ca164]/20 border-b-2 border-[#167d4e]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#1ca164] mb-1">
                {stats.doneCount}
              </div>
              <span className="text-[10px] font-bold text-[#167d4e] bg-[#22b573]/10 px-2 py-0.5 rounded-md border border-[#22b573]/30">
                منجز بنجاح
              </span>
            </div>
          </div>

          {/* Card 3: لم يتم */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover-card-motion relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#f26374] to-[#df4b5e]" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">لم يتم</span>
              {/* Prominent Embossed Icon Badge */}
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-b from-[#f26374] to-[#df4b5e] text-white flex items-center justify-center shadow-xs shadow-[#df4b5e]/20 border-b-2 border-[#c03445]">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#df4b5e] mb-1">
                {stats.notDoneCount}
              </div>
              <span className="text-[10px] font-bold text-[#c03445] bg-[#f26374]/10 px-2 py-0.5 rounded-md border border-[#f26374]/30">
                غير مرصود
              </span>
            </div>
          </div>

          {/* Card 4: غير مكتمل */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover-card-motion relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800">غير مكتمل</span>
              {/* Prominent Embossed Icon Badge */}
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-600/20 border-b-2 border-amber-600">
                <Clock3 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mb-1">
                {stats.incompleteCount}
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                بحاجة لاستكمال
              </span>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 3 & 4. Analytics Grid (Side-by-side in landscape, stacked in portrait) */}
        {/* ====================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* 3. Donut Chart Card: "توزيع الحالات" (تصميم متوازن وممتلئ بدون مساحات فارغة) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover-card-motion flex flex-col justify-between">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-xs border-b border-emerald-700">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                      توزيع حالات المتابعة
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      تحليل الحالة العامة لمؤشرات الرصد
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    الإجمالي: {stats.totalItems}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md border ${rating.color}`}>
                    {rating.label}
                  </span>
                </div>
              </div>

              {/* Main Donut + Status Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1 pb-3">
                {/* Circular SVG Donut (5 cols on sm+) */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform filter drop-shadow-xs">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="13"
                      />

                      {strokeNotDone > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#f26374"
                          strokeWidth="13"
                          strokeDasharray={`${strokeNotDone} ${circumference}`}
                          strokeDashoffset="0"
                          className="transition-all duration-500"
                        />
                      )}

                      {strokeIncomplete > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="13"
                          strokeDasharray={`${strokeIncomplete} ${circumference}`}
                          strokeDashoffset={-strokeNotDone}
                          className="transition-all duration-500"
                        />
                      )}

                      {strokeDone > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#22b573"
                          strokeWidth="13"
                          strokeDasharray={`${strokeDone} ${circumference}`}
                          strokeDashoffset={-(strokeNotDone + strokeIncomplete)}
                          className="transition-all duration-500"
                        />
                      )}
                    </svg>

                    {/* Inner Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">
                        {stats.completionRate}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                        نسبة الإنجاز
                      </span>
                    </div>
                  </div>

                  <div className="text-center mt-1">
                    <span className="text-[11px] font-bold text-slate-500">
                      {stats.doneCount} منجز من أصل {stats.totalItems}
                    </span>
                  </div>
                </div>

                {/* 3 Status Cards with Mini-Bars (7 cols on sm+) */}
                <div className="sm:col-span-7 space-y-2 text-xs">
                  {/* تم (منجز) */}
                  <div className="p-2.5 rounded-2xl bg-[#22b573]/10 border border-[#22b573]/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#22b573] shadow-xs flex items-center justify-center text-white shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <span className="font-bold text-slate-800 text-xs">تم (منجز بالكامل)</span>
                      </div>
                      <div className="text-left font-mono">
                        <strong className="text-[#1ca164] text-xs font-black">{stats.doneCount}</strong>
                        <span className="text-[#167d4e] text-[10px] mr-1 font-bold">({pctDone}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/80 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#22b573] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pctDone}%` }}
                      />
                    </div>
                  </div>

                  {/* غير مكتمل */}
                  <div className="p-2.5 rounded-2xl bg-amber-50/90 border border-amber-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-amber-500 shadow-xs flex items-center justify-center text-white shrink-0">
                          <Clock3 className="w-3 h-3" />
                        </div>
                        <span className="font-bold text-amber-950 text-xs">غير مكتمل</span>
                      </div>
                      <div className="text-left font-mono">
                        <strong className="text-amber-700 text-xs font-black">{stats.incompleteCount}</strong>
                        <span className="text-amber-600 text-[10px] mr-1 font-bold">({pctIncomplete}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-amber-200/70 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pctIncomplete}%` }}
                      />
                    </div>
                  </div>

                  {/* لم يتم */}
                  <div className="p-2.5 rounded-2xl bg-[#f26374]/10 border border-[#f26374]/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#f26374] shadow-xs flex items-center justify-center text-white shrink-0">
                          <XCircle className="w-3 h-3" />
                        </div>
                        <span className="font-bold text-slate-800 text-xs">لم يتم (غير مرصود)</span>
                      </div>
                      <div className="text-left font-mono">
                        <strong className="text-[#df4b5e] text-xs font-black">{stats.notDoneCount}</strong>
                        <span className="text-[#c03445] text-[10px] mr-1 font-bold">({pctNotDone}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/80 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#f26374] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pctNotDone}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Cumulative Bar, 3 KPI Mini-Cards & Diagnostic Note */}
            <div className="mt-2 pt-3 border-t border-slate-100 space-y-3">
              {/* Stacked Cumulative Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    شريط التوزيع التراكمي للحالات
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">100%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 shadow-inner">
                  {pctDone > 0 && (
                    <div
                      style={{ width: `${pctDone}%` }}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full transition-all duration-500"
                      title={`تم: ${pctDone}%`}
                    />
                  )}
                  {pctIncomplete > 0 && (
                    <div
                      style={{ width: `${pctIncomplete}%` }}
                      className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-500"
                      title={`غير مكتمل: ${pctIncomplete}%`}
                    />
                  )}
                  {pctNotDone > 0 && (
                    <div
                      style={{ width: `${pctNotDone}%` }}
                      className="bg-gradient-to-r from-rose-500 to-red-500 h-full transition-all duration-500"
                      title={`لم يتم: ${pctNotDone}%`}
                    />
                  )}
                </div>
              </div>

              {/* 3 Metric Mini Cards */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2 shadow-2xs">
                  <span className="text-[10px] text-emerald-800 font-bold block">المنجز</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-[#167d4e]">{stats.doneCount}</span>
                  <span className="text-[9px] text-emerald-600 block font-semibold">{pctDone}%</span>
                </div>
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2 shadow-2xs">
                  <span className="text-[10px] text-amber-900 font-bold block">غير مكتمل</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-amber-700">{stats.incompleteCount}</span>
                  <span className="text-[9px] text-amber-600 block font-semibold">{pctIncomplete}%</span>
                </div>
                <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-2 shadow-2xs">
                  <span className="text-[10px] text-rose-900 font-bold block">لم يتم</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-rose-600">{stats.notDoneCount}</span>
                  <span className="text-[9px] text-rose-500 block font-semibold">{pctNotDone}%</span>
                </div>
              </div>

              {/* Diagnostic Insight Note */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 flex items-start gap-2">
                <div className="w-5 h-5 rounded-lg bg-emerald-100 text-[#165a49] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Sparkles className="w-3 h-3" />
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  {stats.totalItems === 0
                    ? 'لا توجد بيانات متابعة مسجلة لهذه الفترة حتى الآن.'
                    : (stats.incompleteCount + stats.notDoneCount === 0)
                      ? 'مؤشر الإنجاز مكتمل بنسبة 100%، تم إنجاز جميع متطلبات الرصد بنجاح.'
                      : `تم إنجاز ${stats.doneCount} من ${stats.totalItems} عنصر متابعة، ويتبقى ${stats.incompleteCount + stats.notDoneCount} عنصر بحاجة للاستكمال أو الرصد.`}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Field Statistics Card: "إحصائيات حسب المجال" */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover-card-motion flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-teal-500 to-[#165a49] text-white flex items-center justify-center shadow-xs border-b border-emerald-800">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                      إحصائيات المتابعة حسب المجال
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      تفصيل نسب الإنجاز في (التحضير - الخطة الأسبوعية - الواجبات - الاختبارات)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {FOLLOW_UP_ITEMS.map((item) => {
                  const data = stats.itemStats[item.key];
                  const itemTotal = data.total || 1;
                  const donePct = Math.round((data.done / itemTotal) * 100);
                  const notDonePct = Math.round((data.notDone / itemTotal) * 100);
                  const incompletePct = Math.round((data.incomplete / itemTotal) * 100);

                  return (
                    <div key={item.key} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                            {getItemIcon(item.key)}
                          </div>
                          <span>{item.label}</span>
                        </div>
                        <span className="text-[#165a49] font-mono bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200 text-xs font-black">
                          {donePct}% منجز
                        </span>
                      </div>

                      {/* Multi-segmented Progress Bar */}
                      <div className="h-4 bg-white rounded-full overflow-hidden flex border border-slate-200 shadow-inner">
                        {donePct > 0 && (
                          <div
                            style={{ width: `${donePct}%` }}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full"
                            title={`تم: ${data.done}`}
                          />
                        )}
                        {incompletePct > 0 && (
                          <div
                            style={{ width: `${incompletePct}%` }}
                            className="bg-gradient-to-r from-amber-400 to-amber-500 h-full"
                            title={`غير مكتمل: ${data.incomplete}`}
                          />
                        )}
                        {notDonePct > 0 && (
                          <div
                            style={{ width: `${notDonePct}%` }}
                            className="bg-gradient-to-r from-rose-500 to-red-500 h-full"
                            title={`لم يتم: ${data.notDone}`}
                          />
                        )}
                      </div>

                      {/* Exact Numbers row */}
                      <div className="flex items-center justify-between text-[11px] font-mono px-1 pt-0.5">
                        <span className="text-emerald-700 font-bold">تم: {data.done}</span>
                        <span className="text-amber-700 font-bold">غير مكتمل: {data.incomplete}</span>
                        <span className="text-red-600 font-bold">لم يتم: {data.notDone}</span>
                        <span className="text-slate-400">الإجمالي: {data.total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 5. Teachers Breakdown Table: "تفصيل أداء المعلمين" (مشمولة بالـ PDF والطباعة) */}
        {/* ====================================================================== */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover-card-motion">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs border-b border-amber-700">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                {labels.teachersPerformanceTitle} ({stats.teacherBreakdown.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              جدول التقييم الفردي
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50">
                  <th className="py-3 px-3 rounded-r-xl">{labels.teachersHeaderColumn}</th>
                  <th className="py-3 px-2">التخصص</th>
                  <th className="py-3 px-2 text-center text-emerald-700">تم</th>
                  <th className="py-3 px-2 text-center text-red-600">لم يتم</th>
                  <th className="py-3 px-2 text-center text-amber-600">غير مكتمل</th>
                  <th className="py-3 px-3 text-center rounded-l-xl">نسبة الإنجاز</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.teacherBreakdown.map((row, idx) => (
                  <tr key={row.teacher.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900">{row.teacher.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-500 font-medium">
                      {row.teacher.subject || 'عام'}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-700 font-mono">
                      {row.done}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-red-600 font-mono">
                      {row.notDone}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-amber-600 font-mono">
                      {row.incomplete}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-black font-mono text-[11px] border ${
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
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-sky-500 to-sky-600 text-white flex items-center justify-center shadow-xs border-b border-sky-700">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  الملاحظات اليومية المرصودة ({stats.collectedNotes.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              {stats.collectedNotes.map((n, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-bold mb-1">
                    <span className="text-[#165a49] font-black">{n.teacherName}</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {n.weekTitle} • يوم {n.dayName}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{n.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* 7. Official Signatures Footer for Official PDF & Print                  */}
        {/* ====================================================================== */}
        <div className="pt-6 border-t-2 border-slate-300 mt-6 bg-slate-50/50 p-4 rounded-2xl">
          <div className="grid grid-cols-2 text-center text-xs text-slate-800">
            <div>
              <p className="font-extrabold text-slate-900">{labels.supervisorSignatureLabel}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">مكتب التعليم / الإشراف التربوي</p>
              <div className="mt-8 border-b border-dashed border-slate-400 w-36 mx-auto" />
              <p className="text-[10px] text-slate-400 mt-1">التوقيع والاعتماد</p>
            </div>
            <div>
              <p className="font-extrabold text-slate-900">{labels.principalSignatureLabel}</p>
              <p className="mt-0.5 font-bold text-[#165a49]">{currentSchool.principalName}</p>
              <div className="mt-8 border-b border-dashed border-slate-400 w-36 mx-auto" />
              <p className="text-[10px] text-slate-400 mt-1">الختم والتوقيع الرسمي</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
