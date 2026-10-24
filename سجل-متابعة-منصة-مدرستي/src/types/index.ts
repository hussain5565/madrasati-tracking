export type UserRole = 'admin' | 'school';

export interface School {
  id: string;
  name: string;
  code: string; // e.g. school101
  password: string;
  principalName: string;
  educationOffice?: string;
  stage?: string; // ابتدائي, متوسط, ثانوي
  genderCategory?: 'boys' | 'girls'; // بنين / بنات
  city?: string;
  createdAt: string;
}

export interface Teacher {
  id: string;
  schoolId: string;
  name: string;
  subject?: string;
  civilId?: string;
  phone?: string;
  createdAt: string;
}

export type FollowUpItemKey = 'prep' | 'plan' | 'homework' | 'exam';

export interface FollowUpItemDef {
  key: FollowUpItemKey;
  label: string;
  iconName: string;
}

export type StatusValue = 'done' | 'not_done' | 'incomplete';

export interface FollowUpRecord {
  schoolId: string;
  teacherId: string;
  weekNumber: number;
  dayIndex: number; // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu
  itemKey: FollowUpItemKey;
  status: StatusValue;
  note?: string;
  updatedAt: string;
}

export interface CalendarDay {
  dayName: string; // الأحد, الإثنين, الثلاثاء, الأربعاء, الخميس
  hijriDate: string; // e.g. 1448/3/10
  isHoliday?: boolean;
  holidayTitle?: string;
}

export interface CalendarWeek {
  weekNumber: number; // 1 to 19, or 0 for autumn vacation
  title: string;
  displayNumber: string; // "01", "02", etc.
  monthId: number; // 1, 2, 3, 4
  monthName: string; // الشهر الأول, etc.
  days: CalendarDay[];
  isAutumnBreak?: boolean;
  isExamWeek?: boolean;
}
