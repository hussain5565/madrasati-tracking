import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine, 
  Cell 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { MONTHS_LIST, FOLLOW_UP_ITEMS } from '../../data/calendarData';
import { 
  BarChart3, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter
} from 'lucide-react';

// Common school academic departments
const CORE_SUBJECTS = [
  'الرياضيات',
  'العلوم',
  'اللغة العربية',
  'التربية الإسلامية',
  'اللغة الإنجليزية',
  'الحاسب والتقنية',
  'الدراسات الاجتماعية',
  'التربية البدنية والدفاع عن النفس',
  'التربية الفنية',
];

export const DepartmentPerformanceChart: React.FC = () => {
  const { 
    schools, 
    teachers, 
    records, 
    getStatus, 
    setStatus, 
    addTeacherToSchool 
  } = useApp();

  // Active Month (defaults to Month 1: الشهر الأول)
  const [selectedMonthId, setSelectedMonthId] = useState<number>(1);
  // School filter (all or specific school id)
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');
  // Chart view mode: completion rate % vs item counts breakdown
  const [chartMode, setChartMode] = useState<'rate' | 'breakdown'>('rate');

  const activeMonth = MONTHS_LIST.find((m) => m.id === selectedMonthId) || MONTHS_LIST[0];

  // Filter teachers by school
  const filteredTeachers = useMemo(() => {
    if (selectedSchoolId === 'all') return teachers;
    return teachers.filter((t) => t.schoolId === selectedSchoolId);
  }, [teachers, selectedSchoolId]);

  // Aggregate stats per department (subject)
  const departmentStats = useMemo(() => {
    // Collect all departments present
    const deptMap: Record<string, {
      name: string;
      teacherCount: number;
      done: number;
      notDone: number;
      incomplete: number;
      total: number;
      completionRate: number;
    }> = {};

    // Group teachers by subject
    filteredTeachers.forEach((teacher) => {
      const subject = teacher.subject && teacher.subject.trim() ? teacher.subject.trim() : 'عام';
      if (!deptMap[subject]) {
        deptMap[subject] = {
          name: subject,
          teacherCount: 0,
          done: 0,
          notDone: 0,
          incomplete: 0,
          total: 0,
          completionRate: 0,
        };
      }
      deptMap[subject].teacherCount++;

      // Compute records for weeks in the selected month
      activeMonth.weeks.forEach((weekNum) => {
        for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
          FOLLOW_UP_ITEMS.forEach((item) => {
            const status = getStatus(teacher.schoolId, teacher.id, weekNum, dayIndex, item.key);
            deptMap[subject].total++;
            if (status === 'done') {
              deptMap[subject].done++;
            } else if (status === 'incomplete') {
              deptMap[subject].incomplete++;
            } else {
              deptMap[subject].notDone++;
            }
          });
        }
      });
    });

    // Calculate rates
    const list = Object.values(deptMap).map((d) => {
      const rate = d.total > 0 ? Math.round((d.done / d.total) * 100) : 0;
      return {
        ...d,
        completionRate: rate,
      };
    });

    // Sort descending by completionRate, then by total
    return list.sort((a, b) => b.completionRate - a.completionRate || b.total - a.total);
  }, [filteredTeachers, activeMonth, getStatus]);

  // Overall aggregate
  const totalStats = useMemo(() => {
    let totalDone = 0;
    let totalNotDone = 0;
    let totalIncomplete = 0;
    let totalItems = 0;

    departmentStats.forEach((d) => {
      totalDone += d.done;
      totalNotDone += d.notDone;
      totalIncomplete += d.incomplete;
      totalItems += d.total;
    });

    const overallRate = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;
    return {
      totalDone,
      totalNotDone,
      totalIncomplete,
      totalItems,
      overallRate,
      topDept: departmentStats[0] || null,
      lowestDept: departmentStats.length > 1 ? departmentStats[departmentStats.length - 1] : null,
    };
  }, [departmentStats]);

  // Helper to get color by completion rate
  const getBarColor = (rate: number) => {
    if (rate >= 85) return '#22b573'; // soft emerald
    if (rate >= 70) return '#14b8a6'; // teal
    if (rate >= 50) return '#f59e0b'; // amber
    return '#f26374'; // soft rose
  };

  // Quick Seed Sample Department Data (if manager wants rich demo data for departments)
  const handleSeedDepartmentData = () => {
    if (schools.length === 0) return;
    const targetSchool = schools[0];

    const sampleDepts = [
      { name: 'الرياضيات', teacherName: 'أ. فهد الرياضيات', rate: 92 },
      { name: 'العلوم', teacherName: 'أ. خالد العلوم', rate: 88 },
      { name: 'اللغة العربية', teacherName: 'أ. محمد العربي', rate: 85 },
      { name: 'التربية الإسلامية', teacherName: 'أ. عبدالله الدين', rate: 82 },
      { name: 'اللغة الإنجليزية', teacherName: 'أ. ياسر الإنجليزي', rate: 76 },
      { name: 'الحاسب والتقنية', teacherName: 'أ. سلطان الحاسب', rate: 70 },
      { name: 'الدراسات الاجتماعية', teacherName: 'أ. ناصر الاجتماعيات', rate: 64 },
    ];

    const newTeachers = sampleDepts.map((d) => 
      addTeacherToSchool(targetSchool.id, d.teacherName, d.name)
    );

    // Seed realistic records for the current active month weeks
    newTeachers.forEach((teacher, idx) => {
      const targetRate = sampleDepts[idx].rate;
      activeMonth.weeks.forEach((weekNum) => {
        for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
          FOLLOW_UP_ITEMS.forEach((item, itemIdx) => {
            const seedRandom = (weekNum * 17 + dayIndex * 13 + itemIdx * 7 + idx * 23) % 100;
            let status: 'done' | 'not_done' | 'incomplete' = 'done';
            if (seedRandom < targetRate) {
              status = 'done';
            } else if (seedRandom < targetRate + 12) {
              status = 'incomplete';
            } else {
              status = 'not_done';
            }
            setStatus(targetSchool.id, teacher.id, weekNum, dayIndex, item.key, status);
          });
        }
      });
    });
  };

  // Custom Recharts Tooltip in clean RTL Arabic
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 text-right font-['Cairo'] text-xs space-y-1.5 min-w-[200px]" dir="rtl">
          <div className="font-extrabold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
            <span className="text-sm text-[#165a49]">{data.name}</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
              {data.teacherCount} معلماً/معلمة
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500 font-medium">نسبة الإنجاز الكلية:</span>
            <span className="font-black text-sm" style={{ color: getBarColor(data.completionRate) }}>
              {data.completionRate}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100 text-[11px] text-center font-mono">
            <div className="bg-[#22b573]/10 text-[#167d4e] rounded-lg p-1">
              <span className="block text-[9px] font-sans">تم</span>
              <strong>{data.done}</strong>
            </div>
            <div className="bg-[#f59e0b]/10 text-[#b45309] rounded-lg p-1">
              <span className="block text-[9px] font-sans">غير مكتمل</span>
              <strong>{data.incomplete}</strong>
            </div>
            <div className="bg-[#f26374]/10 text-[#c03445] rounded-lg p-1">
              <span className="block text-[9px] font-sans">لم يتم</span>
              <strong>{data.notDone}</strong>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 text-center pt-1 font-mono">
            إجمالي العناصر المرصودة: {data.total}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover-card-motion mb-8">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#134e3f] to-[#1c6a56] text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-4 h-4 text-emerald-200" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              مقارنة أداء الأقسام الدراسية (الشهر الحالي)
            </h3>
            <span className="text-[10px] bg-emerald-50 text-[#165a49] border border-emerald-200 font-extrabold px-2 py-0.5 rounded-full">
              Recharts
            </span>
          </div>
          <p className="text-xs text-slate-500">
            مؤشر بياني تفاعلي يقارن نسب إنجاز التحضير والخطط والواجبات والاختبارات بين التخصصات والأقسام الدراسية.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* School Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-hidden cursor-pointer"
            >
              <option value="all">جميع المدارس</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {MONTHS_LIST.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMonthId(m.id)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedMonthId === m.id
                    ? 'bg-white text-[#165a49] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.name.split(' ')[0]} {m.name.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setChartMode('rate')}
              className={`px-2.5 py-1 rounded-lg transition ${
                chartMode === 'rate'
                  ? 'bg-[#165a49] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              نسبة الإنجاز %
            </button>
            <button
              onClick={() => setChartMode('breakdown')}
              className={`px-2.5 py-1 rounded-lg transition ${
                chartMode === 'breakdown'
                  ? 'bg-[#165a49] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تفصيل العناصر
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Metric 1: Overall Average */}
        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>متوسط إنجاز الأقسام</span>
            <TrendingUp className="w-4 h-4 text-[#165a49]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono">
            {totalStats.overallRate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {activeMonth.name}
          </div>
        </div>

        {/* Metric 2: Top Department */}
        <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-200/80">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
            <span>القسم المتصدر 🏆</span>
            <Award className="w-4 h-4 text-[#165a49]" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
            {totalStats.topDept ? totalStats.topDept.name : 'لا توجد بيانات'}
          </div>
          <div className="text-[11px] font-mono text-[#167d4e] font-bold mt-0.5">
            {totalStats.topDept ? `${totalStats.topDept.completionRate}% إنجاز` : '-'}
          </div>
        </div>

        {/* Metric 3: Active Departments */}
        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>الأقسام المشمولة</span>
            <Layers className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono">
            {departmentStats.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {filteredTeachers.length} معلماً/معلمة
          </div>
        </div>

        {/* Metric 4: Follow-up Needed */}
        <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-200/80">
          <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
            <span>يحتاج متابعة ⚠️</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
            {totalStats.lowestDept ? totalStats.lowestDept.name : 'الجميع منجز'}
          </div>
          <div className="text-[11px] font-mono text-amber-700 font-bold mt-0.5">
            {totalStats.lowestDept ? `${totalStats.lowestDept.completionRate}% إنجاز` : '-'}
          </div>
        </div>
      </div>

      {/* 3. Recharts Main Chart Container */}
      <div className="bg-slate-50/50 rounded-2xl p-3 sm:p-4 border border-slate-200/70">
        <div className="flex items-center justify-between mb-3 px-1 text-xs text-slate-500">
          <span className="font-bold">
            {chartMode === 'rate' 
              ? 'مقارنة نسبة إنجاز كل قسم دراسي مع خط المستهدف الوزاري (85%)' 
              : 'توزيع العمليات المنجزة (تم / غير مكتمل / لم يتم) لكل قسم دراسي'}
          </span>
          <span className="font-mono text-[11px]">
            {activeMonth.weeks.length} أسابيع متابعة
          </span>
        </div>

        {departmentStats.length > 0 ? (
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'rate' ? (
                <BarChart
                  data={departmentStats}
                  margin={{ top: 20, right: 10, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#334155', fontSize: 11, fontFamily: 'Cairo' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    unit="%" 
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine 
                    y={85} 
                    stroke="#d97706" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{ 
                      value: 'المستهدف 85%', 
                      fill: '#d97706', 
                      fontSize: 10, 
                      fontFamily: 'Cairo', 
                      position: 'insideTopLeft' 
                    }} 
                  />
                  <Bar 
                    dataKey="completionRate" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={600}
                  >
                    {departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.completionRate)} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart
                  data={departmentStats}
                  margin={{ top: 20, right: 10, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#334155', fontSize: 11, fontFamily: 'Cairo' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontFamily: 'Cairo' }}
                    formatter={(value) => {
                      if (value === 'done') return 'تم (منجز)';
                      if (value === 'incomplete') return 'غير مكتمل';
                      if (value === 'notDone') return 'لم يتم';
                      return value;
                    }}
                  />
                  <Bar dataKey="done" name="done" fill="#22b573" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="incomplete" name="incomplete" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="notDone" name="notDone" fill="#f26374" stackId="a" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs">لا يوجد معلمين أو أقسام مسجلة في المدرسة المحددة.</p>
          </div>
        )}

        {/* Legend / Color meaning for Rate Mode */}
        {chartMode === 'rate' && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 mt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#22b573]" />
              <span>متميز (85% فأعلى)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#14b8a6]" />
              <span>جيد جداً (70% - 84%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#f59e0b]" />
              <span>متوسط (50% - 69%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#f26374]" />
              <span>يحتاج متابعة (أقل من 50%)</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Department Ranking Table & Seed Assist */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-700">
          جدول تصنيف الأقسام حسب الإنجاز في {activeMonth.name}
        </span>

        {/* Seed button for rich interactive demonstration */}
        <button
          onClick={handleSeedDepartmentData}
          className="inline-flex items-center justify-center gap-1.5 text-xs font-extrabold text-[#165a49] bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
          title="إضافة معلمين بأقسام دراسية متنوعة وتوليد رصد تجريبي لعرض مقارنة غنية"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>توليد بيانات أقسام دراسية تجريبية</span>
        </button>
      </div>

      {/* Mini department breakdown row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
        {departmentStats.map((dept, idx) => (
          <div 
            key={dept.name}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-500 font-mono font-bold flex items-center justify-center text-[10px]">
                {idx + 1}
              </span>
              <div>
                <span className="font-bold text-slate-800 block">{dept.name}</span>
                <span className="text-[10px] text-slate-400">{dept.teacherCount} معلماً/معلمة</span>
              </div>
            </div>
            <div className="text-left">
              <span 
                className="font-black font-mono text-sm block"
                style={{ color: getBarColor(dept.completionRate) }}
              >
                {dept.completionRate}%
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                {dept.done}/{dept.total}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
