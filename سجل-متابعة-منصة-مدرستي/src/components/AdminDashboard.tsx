import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Plus, 
  Users, 
  LogIn, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Search, 
  School as SchoolIcon, 
  X,
  Sparkles
} from 'lucide-react';
import { getSchoolGenderLabels } from '../utils/genderLabels';
import { DepartmentPerformanceChart } from './admin/DepartmentPerformanceChart';

export const AdminDashboard: React.FC = () => {
  const { 
    schools, 
    teachers, 
    addSchool, 
    updateSchool, 
    deleteSchool, 
    switchSchoolAsAdmin,
    records 
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [genderCategory, setGenderCategory] = useState<'boys' | 'girls'>('boys');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('123');
  const [stage, setStage] = useState('عام');
  const [educationOffice, setEducationOffice] = useState('مكتب التعليم');
  const [city, setCity] = useState('');

  const openAddModal = () => {
    setEditingSchoolId(null);
    setName(`مدرسة ${schools.length + 1}`);
    setGenderCategory('boys');
    setPrincipalName('مدير المدرسة');
    setCode(`school${schools.length + 101}`);
    setPassword('123');
    setStage('عام');
    setEducationOffice('مكتب التعليم');
    setCity('');
    setShowAddModal(true);
  };

  const openEditModal = (schoolId: string) => {
    const school = schools.find((s) => s.id === schoolId);
    if (!school) return;
    setEditingSchoolId(school.id);
    setName(school.name);
    setGenderCategory(school.genderCategory || 'boys');
    setPrincipalName(school.principalName);
    setCode(school.code);
    setPassword(school.password);
    setStage(school.stage || 'عام');
    setEducationOffice(school.educationOffice || '');
    setCity(school.city || '');
    setShowAddModal(true);
  };

  const handleGenderChange = (category: 'boys' | 'girls') => {
    setGenderCategory(category);
    if (!editingSchoolId) {
      if (category === 'girls' && (principalName === 'مدير المدرسة' || !principalName)) {
        setPrincipalName('مديرة المدرسة');
      } else if (category === 'boys' && (principalName === 'مديرة المدرسة' || !principalName)) {
        setPrincipalName('مدير المدرسة');
      }
    }
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !principalName.trim() || !code.trim()) return;

    if (editingSchoolId) {
      updateSchool(editingSchoolId, {
        name: name.trim(),
        principalName: principalName.trim(),
        genderCategory,
        code: code.trim(),
        password: password.trim(),
        stage,
        educationOffice,
        city,
      });
    } else {
      addSchool({
        name: name.trim(),
        principalName: principalName.trim(),
        genderCategory,
        code: code.trim(),
        password: password.trim(),
        stage,
        educationOffice,
        city,
      });
    }
    setShowAddModal(false);
  };

  const filteredSchools = schools.filter(
    (s) =>
      s.name.includes(searchTerm) ||
      s.principalName.includes(searchTerm) ||
      s.code.includes(searchTerm)
  );

  const totalTeachers = teachers.length;
  const totalFollowUpLogs = Object.keys(records).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-['Cairo']">
      {/* Top Welcome & KPI Header matching exact color theme */}
      <div className="bg-gradient-to-b from-[#134e3f] via-[#165a49] to-[#1c6a56] rounded-3xl p-6 sm:p-7 text-white shadow-lg mb-8 relative overflow-hidden hover-card-motion">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 mb-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>لوحة تحكم المدير العام • admin100</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                إدارة المدارس المستقلة (بنين / بنات)
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl">
                إضافة المدارس المستقلة وتحديد فئتها (بنين أو بنات) لموائمة الصيغة والمسميات في سجل المتابعة والتقارير بدقة تامة.
              </p>
            </div>
            
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 bg-white text-[#165a49] hover:bg-emerald-50 active:scale-95 font-bold px-4 py-3 rounded-2xl shadow-md text-sm transition self-start sm:self-auto shrink-0 cursor-pointer"
            >
              <Plus className="w-5 h-5 text-[#165a49]" />
              <span>إضافة مدرسة جديدة</span>
            </button>
          </div>

          {/* Quick Metrics with hover motion */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-5 border-t border-white/20">
            <div className="bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/15 rounded-2xl p-3 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
              <span className="block text-2xl font-black text-white">{schools.length}</span>
              <span className="text-[11px] text-emerald-200 font-semibold">المدارس</span>
            </div>
            <div className="bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/15 rounded-2xl p-3 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
              <span className="block text-2xl font-black text-emerald-200">{totalTeachers}</span>
              <span className="text-[11px] text-emerald-200 font-semibold">المعلمون والمعلمات</span>
            </div>
            <div className="bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/15 rounded-2xl p-3 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
              <span className="block text-2xl font-black text-amber-300">{totalFollowUpLogs}</span>
              <span className="text-[11px] text-emerald-200 font-semibold">عمليات الرصد</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Department Performance Comparison Chart for Current Month */}
      <DepartmentPerformanceChart />

      {/* Schools Section Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#165a49]" />
            <span>قائمة المدارس ({filteredSchools.length})</span>
          </h3>
          <p className="text-xs text-slate-500">
            اضغط على "الدخول للمدرسة" للانتقال لتبويبات (الإعدادات - المتابعة - التقارير) الخاصة بها
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث في المدارس..."
            className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-[#165a49] focus:ring-1 focus:ring-emerald-300 outline-hidden bg-white shadow-2xs"
          />
        </div>
      </div>

      {/* Schools Grid Cards: 3-columns on landscape desktop, 1-column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchools.map((school) => {
          const schoolTeachers = teachers.filter((t) => t.schoolId === school.id);
          const labels = getSchoolGenderLabels(school);

          return (
            <div
              key={school.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover-card-motion transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-lg shrink-0 ${
                      labels.isGirls 
                        ? 'bg-rose-50 border-rose-200 text-rose-700' 
                        : 'bg-emerald-50 border-emerald-200 text-[#165a49]'
                    }`}>
                      <SchoolIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base leading-snug">
                          {school.name}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          labels.isGirls
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-emerald-50 border-emerald-200 text-[#165a49]'
                        }`}>
                          {labels.categoryLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {labels.principalLabel}: {school.principalName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(school.id)}
                      title="تعديل بيانات المدرسة"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#165a49] hover:bg-emerald-50 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف ${school.name}؟`)) {
                          deleteSchool(school.id);
                        }
                      }}
                      title="حذف المدرسة"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <Users className="w-3.5 h-3.5 text-[#165a49] shrink-0" />
                    <span>{labels.teachersLabel}: <strong>{schoolTeachers.length}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate font-mono" dir="ltr">
                    <span className="font-sans text-[11px] text-slate-500">رمز الدخول:</span>
                    <strong className="text-slate-800">{school.code}</strong>
                  </div>
                </div>
              </div>

              {/* Action Button: Jump into school view */}
              <div className="pt-2 border-t border-slate-100 mt-2">
                <button
                  onClick={() => switchSchoolAsAdmin(school.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#165a49] hover:bg-[#124d3e] active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>الدخول لتبويبات المدرسة (الإعدادات - المتابعة - التقارير)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="bg-[#165a49] text-white p-4 flex items-center justify-between">
              <h4 className="font-bold text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-300" />
                <span>{editingSchoolId ? 'تعديل بيانات المدرسة' : 'إضافة مدرسة جديدة'}</span>
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchool} className="p-5 space-y-4">
              {/* Category Selector: بنين أو بنات */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  فئة المدرسة (بنين أو بنات) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('boys')}
                    className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                      genderCategory === 'boys'
                        ? 'bg-white text-[#165a49] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🏫 مدرسة بنين</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('girls')}
                    className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                      genderCategory === 'girls'
                        ? 'bg-rose-50 text-rose-700 shadow-xs border border-rose-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🌸 مدرسة بنات</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {genderCategory === 'girls'
                    ? 'سيتم اعتماد الصيغة المؤنثة (مديرة المدرسة، المعلمات، المشرفة...) في كافة صفحات المدرسة وتقاريرها.'
                    : 'سيتم اعتماد الصيغة (مدير المدرسة، المعلمون، المشرف...).'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المدرسة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={genderCategory === 'girls' ? 'مدرسة البنات' : 'مدرسة البنين'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-1 focus:ring-emerald-300 text-sm outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {genderCategory === 'girls' ? 'اسم مديرة المدرسة' : 'اسم مدير المدرسة'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  placeholder={genderCategory === 'girls' ? 'مديرة المدرسة' : 'مدير المدرسة'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-1 focus:ring-emerald-300 text-sm outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رمز الدخول (المستخدم) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="school102"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-1 focus:ring-emerald-300 text-sm outline-hidden font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    كلمة المرور للمدرسة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="123"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-1 focus:ring-emerald-300 text-sm outline-hidden font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#165a49] hover:bg-[#124d3e] text-white text-xs font-bold shadow-md transition"
                >
                  {editingSchoolId ? 'حفظ التعديلات' : 'إضافة المدرسة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
