import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  UserCheck, 
  UserPlus, 
  ClipboardPaste, 
  Trash2, 
  Edit3, 
  Search, 
  Users, 
  CheckCircle2, 
  Save, 
  X, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { getSchoolGenderLabels } from '../../utils/genderLabels';

export const SettingsTab: React.FC = () => {
  const { 
    currentSchool, 
    currentSchoolTeachers, 
    addTeacher, 
    bulkAddTeachers, 
    updateTeacher, 
    deleteTeacher,
    setSelectedTeacherId,
    setActiveTab,
    clearSchoolRecords 
  } = useApp();

  const labels = getSchoolGenderLabels(currentSchool);

  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single');
  
  // Single teacher form
  const [singleName, setSingleName] = useState('');
  const [singleSubject, setSingleSubject] = useState('عام');
  const [singleCivilId, setSingleCivilId] = useState('');
  const [singlePhone, setSinglePhone] = useState('');

  // Bulk paste form
  const [bulkText, setBulkText] = useState('');
  const [bulkSubject, setBulkSubject] = useState('عام');

  // Search & Edit
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim()) return;
    addTeacher(singleName, singleSubject, singleCivilId, singlePhone);
    setSingleName('');
    setSingleCivilId('');
    setSinglePhone('');
    showToast(labels.isGirls ? 'تمت إضافة المعلمة بنجاح' : 'تمت إضافة المعلم بنجاح');
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkText
      .split(/[\n,،]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    const count = bulkAddTeachers(lines, bulkSubject);
    setBulkText('');
    showToast(
      labels.isGirls 
        ? `تم استيراد ${count} معلمة بنجاح وإضافتهن للمدرسة` 
        : `تم استيراد ${count} معلماً بنجاح وإضافتهم للمدرسة`
    );
  };

  const startEdit = (id: string, name: string, subject?: string) => {
    setEditingTeacherId(id);
    setEditName(name);
    setEditSubject(subject || 'عام');
  };

  const saveEdit = () => {
    if (editingTeacherId && editName.trim()) {
      updateTeacher(editingTeacherId, {
        name: editName.trim(),
        subject: editSubject.trim() || 'عام',
      });
      setEditingTeacherId(null);
      showToast(labels.isGirls ? 'تم تحديث بيانات المعلمة' : 'تم تحديث بيانات المعلم');
    }
  };

  const filteredTeachers = currentSchoolTeachers.filter(
    (t) =>
      t.name.includes(searchTerm) ||
      (t.subject && t.subject.includes(searchTerm)) ||
      (t.civilId && t.civilId.includes(searchTerm))
  );

  const parsedBulkCount = bulkText
    .split(/[\n,،]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0).length;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-14 font-['Cairo']">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:w-96 z-50 bg-[#165a49] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-600 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* School Information Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover-card-motion relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-2xs shrink-0 ${
              labels.isGirls
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-[#165a49]'
            }`}>
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-[#165a49] bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block border border-emerald-200/60">
                  بيانات المدرسة
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  labels.isGirls
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-[#165a49]'
                }`}>
                  {labels.categoryLabel}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {currentSchool?.name || 'المدرسة'}
              </h2>
              <p className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <UserCheck className="w-3.5 h-3.5 text-[#165a49]" />
                  {labels.principalLabel}: {currentSchool?.principalName || labels.principalLabel}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs flex sm:flex-col items-center sm:items-end justify-between gap-1 text-slate-600">
            <span>رمز المدرسة: <strong className="font-mono text-slate-900">{currentSchool?.code}</strong></span>
            <span>إجمالي {labels.teachersLabel}: <strong className="text-[#165a49] font-bold">{currentSchoolTeachers.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Grid: Add Teacher Form + Teachers List (Side-by-side on wide screens, stacked on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Add Teachers Section: Tabs for Single vs Bulk Paste */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover-card-motion">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              labels.isGirls ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-[#165a49]'
            }`}>
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {labels.addTeachersLabel}
              </h3>
              <p className="text-xs text-slate-500">
                إدخال فردي يدوي أو لصق قائمة الأسماء دفعة واحدة
              </p>
            </div>
          </div>

          {/* Toggle buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setAddMode('single')}
              className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition ${
                addMode === 'single'
                  ? 'bg-white text-[#165a49] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>إضافة يدوي</span>
            </button>
            <button
              type="button"
              onClick={() => setAddMode('bulk')}
              className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition ${
                addMode === 'bulk'
                  ? 'bg-white text-[#165a49] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>إضافة باللصق</span>
            </button>
          </div>
        </div>

        {/* Single Teacher Form */}
        {addMode === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم {labels.teacherLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  placeholder={`اسم ${labels.teacherLabel}`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-1 focus:ring-emerald-300 text-xs sm:text-sm outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  التخصص / المادة
                </label>
                <select
                  value={singleSubject}
                  onChange={(e) => setSingleSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-1 focus:ring-emerald-300 text-xs sm:text-sm outline-hidden bg-white"
                >
                  <option value="عام">عام</option>
                  <option value="لغة عربية">لغة عربية</option>
                  <option value="رياضيات">رياضيات</option>
                  <option value="علوم">علوم</option>
                  <option value="تربية إسلامية">تربية إسلامية</option>
                  <option value="لغة إنجليزية">لغة إنجليزية</option>
                  <option value="دراسات اجتماعية">دراسات اجتماعية</option>
                  <option value="مهارات رقمية">مهارات رقمية</option>
                  <option value="تربية بدنية">تربية بدنية</option>
                  <option value="تربية فنية">تربية فنية</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهوية / السجل (اختياري)
                </label>
                <input
                  type="text"
                  value={singleCivilId}
                  onChange={(e) => setSingleCivilId(e.target.value)}
                  placeholder="السجل المدني"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-1 focus:ring-emerald-300 text-xs sm:text-sm outline-hidden font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الجوال (اختياري)
                </label>
                <input
                  type="text"
                  value={singlePhone}
                  onChange={(e) => setSinglePhone(e.target.value)}
                  placeholder="رقم الجوال"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-1 focus:ring-emerald-300 text-xs sm:text-sm outline-hidden font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-[#165a49] hover:bg-[#124d3e] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>{labels.addTeacherLabel}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Bulk Paste Form */
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
              💡 الصق قائمة أسماء {labels.teachersLabel} (كل اسم في سطر مستقل أو مفصولاً بفواصل).
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {labels.bulkPasteTitle}
                </label>
                {parsedBulkCount > 0 && (
                  <span className="text-xs text-[#165a49] font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    تم اكتشاف ({parsedBulkCount}) اسم
                  </span>
                )}
              </div>
              <textarea
                rows={5}
                required
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={labels.isGirls ? "معلمة 1\nمعلمة 2\nمعلمة 3" : "معلم 1\nمعلم 2\nمعلم 3"}
                className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-1 focus:ring-emerald-300 text-xs sm:text-sm outline-hidden leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 shrink-0">
                  التخصص:
                </label>
                <select
                  value={bulkSubject}
                  onChange={(e) => setBulkSubject(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:border-[#165a49] outline-hidden"
                >
                  <option value="عام">عام</option>
                  <option value="لغة عربية">لغة عربية</option>
                  <option value="رياضيات">رياضيات</option>
                  <option value="علوم">علوم</option>
                  <option value="تربية إسلامية">تربية إسلامية</option>
                  <option value="لغة إنجليزية">لغة إنجليزية</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={parsedBulkCount === 0}
                className="py-2.5 px-6 rounded-xl bg-[#165a49] hover:bg-[#124d3e] disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>{labels.importTeachersLabel(parsedBulkCount)}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Teachers List Section: 7 cols on desktop */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover-card-motion">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-[#165a49]" />
              <span>{labels.teachersListTitle} ({filteredTeachers.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              إدارة الأسماء والانتقال لجدول المتابعة
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={labels.searchTeachersPlaceholder}
              className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 text-xs focus:border-[#165a49] outline-hidden bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Teachers Cards */}
        <div className="divide-y divide-slate-100">
          {filteredTeachers.map((teacher, index) => {
            const isEditing = editingTeacherId === teacher.id;
            return (
              <div
                key={teacher.id}
                className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition"
              >
                {isEditing ? (
                  <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-500 text-xs font-bold outline-hidden flex-1"
                    />
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      placeholder="التخصص"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs outline-hidden w-32"
                    />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={saveEdit}
                        className="p-1.5 rounded-lg bg-[#165a49] text-white hover:bg-[#124d3e] transition"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingTeacherId(null)}
                        className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {teacher.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="bg-emerald-50 text-[#165a49] px-2 py-0.5 rounded-md font-medium">
                          {teacher.subject || 'عام'}
                        </span>
                        {teacher.civilId && (
                          <span className="font-mono text-slate-400">
                            هوية: {teacher.civilId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedTeacherId(teacher.id);
                      setActiveTab('followup');
                    }}
                    className="py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#165a49] font-bold text-xs flex items-center gap-1 border border-emerald-200 transition"
                  >
                    <span>فتح المتابعة</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>

                  <button
                    onClick={() => startEdit(teacher.id, teacher.name, teacher.subject)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#165a49] hover:bg-slate-100 transition"
                    title="تعديل"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف ${teacher.name}؟`)) {
                        deleteTeacher(teacher.id);
                        showToast(`تم حذف ${labels.teacherLabel}`);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTeachers.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              {labels.noTeachersFound}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};
