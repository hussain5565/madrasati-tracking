import { School } from '../types';

export interface SchoolGenderLabels {
  isGirls: boolean;
  categoryLabel: string; // 'بنات' | 'بنين'
  principalLabel: string; // 'مديرة المدرسة' | 'مدير المدرسة'
  principalSignatureLabel: string; // 'مديرة المدرسة' | 'مدير المدرسة'
  supervisorSignatureLabel: string; // 'المشرفة المتابعة لمنصة مدرستي' | 'المشرف المتابع لمنصة مدرستي'
  teacherLabel: string; // 'المعلمة' | 'المعلم'
  teachersLabel: string; // 'المعلمات' | 'المعلمون'
  teacherSelectLabel: string; // 'المعلمة:' | 'المعلم/ة:'
  teacherWithPrefix: (name: string) => string;
  addTeacherLabel: string; // 'إضافة المعلمة' | 'إضافة المعلم'
  addTeachersLabel: string; // 'إضافة المعلمات' | 'إضافة المعلمين'
  importTeachersLabel: (count: number) => string;
  bulkPasteTitle: string; // 'الصق أسماء المعلمات هنا' | 'الصق أسماء المعلمين هنا'
  teachersListTitle: string; // 'قائمة المعلمات' | 'قائمة المعلمين'
  searchTeachersPlaceholder: string; // 'بحث في أسماء المعلمات...' | 'بحث في أسماء المعلمين...'
  noTeachersFound: string; // 'لا توجد معلمات مسجلات' | 'لا يوجد معلمين مسجلين'
  allTeachersScopeLabel: string; // 'شامل لكل معلمات المدرسة' | 'شامل لكل معلمي المدرسة'
  singleTeacherScopeLabel: string; // 'معلمة محددة' | 'معلم محدد'
  selectTeacherDropdownLabel: string; // 'اختر المعلمة:' | 'اختر المعلم:'
  teachersPerformanceTitle: string; // 'تفصيل أداء المعلمات' | 'تفصيل أداء المعلمين'
  teachersHeaderColumn: string; // 'المعلمة' | 'المعلم'
  notePlaceholder: (dayName: string) => string;
  reportSubTitle: (isSingle: boolean, teacherName?: string, schoolName?: string) => string;
}

export function getSchoolGenderLabels(school: School | null | undefined): SchoolGenderLabels {
  const isGirls = school?.genderCategory === 'girls';

  return {
    isGirls,
    categoryLabel: isGirls ? 'بنات' : 'بنين',
    principalLabel: isGirls ? 'مديرة المدرسة' : 'مدير المدرسة',
    principalSignatureLabel: isGirls ? 'مديرة المدرسة' : 'مدير المدرسة',
    supervisorSignatureLabel: isGirls ? 'المشرفة المتابعة لمنصة مدرستي' : 'المشرف المتابع لمنصة مدرستي',
    teacherLabel: isGirls ? 'المعلمة' : 'المعلم',
    teachersLabel: isGirls ? 'المعلمات' : 'المعلمون',
    teacherSelectLabel: isGirls ? 'المعلمة:' : 'المعلم:',
    teacherWithPrefix: (name: string) => name,
    addTeacherLabel: isGirls ? 'إضافة المعلمة' : 'إضافة المعلم',
    addTeachersLabel: isGirls ? 'إضافة المعلمات' : 'إضافة المعلمين',
    importTeachersLabel: (count: number) => isGirls ? `استيراد (${count}) معلمة` : `استيراد (${count}) معلماً`,
    bulkPasteTitle: isGirls ? 'الصق أسماء المعلمات هنا' : 'الصق أسماء المعلمين هنا',
    teachersListTitle: isGirls ? 'قائمة المعلمات' : 'قائمة المعلمين',
    searchTeachersPlaceholder: isGirls ? 'بحث في أسماء المعلمات...' : 'بحث في أسماء المعلمين...',
    noTeachersFound: isGirls ? 'لا توجد معلمات مسجلات في المدرسة' : 'لا يوجد معلمين مسجلين في المدرسة',
    allTeachersScopeLabel: isGirls ? 'شامل لكل معلمات المدرسة' : 'شامل لكل معلمي المدرسة',
    singleTeacherScopeLabel: isGirls ? 'معلمة محددة' : 'معلم محدد',
    selectTeacherDropdownLabel: isGirls ? 'اختر المعلمة:' : 'اختر المعلم:',
    teachersPerformanceTitle: isGirls ? 'تفصيل أداء المعلمات' : 'تفصيل أداء المعلمين',
    teachersHeaderColumn: isGirls ? 'المعلمة' : 'المعلم',
    notePlaceholder: (dayName: string) => 
      isGirls 
        ? `اكتب ملاحظتك على أداء المعلمة ليوم ${dayName}...` 
        : `اكتب ملاحظتك على أداء المعلم ليوم ${dayName}...`,
    reportSubTitle: (isSingle: boolean, teacherName?: string, schoolName?: string) => {
      if (isSingle) {
        return teacherName || (isGirls ? 'معلمة 1' : 'معلم 1');
      }
      return isGirls 
        ? `تقرير شامل لكل معلمات ${schoolName || 'المدرسة'}` 
        : `تقرير شامل لكل معلمي ${schoolName || 'المدرسة'}`;
    },
  };
}
