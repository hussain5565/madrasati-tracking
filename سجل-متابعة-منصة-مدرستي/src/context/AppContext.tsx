import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { School, Teacher, StatusValue, FollowUpItemKey, UserRole } from '../types';
import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  pushAllToSupabase,
  pullAllFromSupabase,
  SupabaseConfig,
} from '../utils/supabaseClient';

interface AuthUser {
  role: UserRole;
  schoolId?: string;
  schoolName?: string;
  principalName?: string;
  username: string;
  isAdminImpersonating?: boolean;
}

interface AppContextType {
  // Auth state
  currentUser: AuthUser | null;
  login: (userOrCode: string, pass: string) => boolean;
  loginAsAdmin: (user: string, pass: string) => boolean;
  loginAsSchool: (code: string, pass: string) => boolean;
  switchSchoolAsAdmin: (schoolId: string) => void;
  logout: () => void;

  // Navigation
  activeTab: 'followup' | 'settings' | 'reports';
  setActiveTab: (tab: 'followup' | 'settings' | 'reports') => void;

  // Schools management
  schools: School[];
  currentSchool: School | null;
  addSchool: (schoolData: Omit<School, 'id' | 'createdAt'>) => School;
  updateSchool: (id: string, updates: Partial<School>) => void;
  deleteSchool: (id: string) => void;

  // Teachers management
  teachers: Teacher[];
  currentSchoolTeachers: Teacher[];
  selectedTeacherId: string;
  setSelectedTeacherId: (id: string) => void;
  addTeacher: (name: string, subject?: string, civilId?: string, phone?: string) => void;
  addTeacherToSchool: (schoolId: string, name: string, subject?: string, civilId?: string, phone?: string) => Teacher;
  bulkAddTeachers: (names: string[], defaultSubject?: string) => number;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // Follow-up state
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  records: Record<string, StatusValue>; // key: `${schoolId}_${teacherId}_${week}_${dayIndex}_${itemKey}`
  getStatus: (schoolId: string, teacherId: string, week: number, dayIndex: number, itemKey: FollowUpItemKey) => StatusValue;
  setStatus: (schoolId: string, teacherId: string, week: number, dayIndex: number, itemKey: FollowUpItemKey, status: StatusValue) => void;
  setDayAllStatus: (schoolId: string, teacherId: string, week: number, dayIndex: number, status: StatusValue) => void;
  setWeekAllStatus: (schoolId: string, teacherId: string, week: number, status: StatusValue) => void;
  
  // Daily Notes state
  notes: Record<string, string>; // key: `${schoolId}_${teacherId}_${week}_${dayIndex}`
  getDayNote: (schoolId: string, teacherId: string, week: number, dayIndex: number) => string;
  setDayNote: (schoolId: string, teacherId: string, week: number, dayIndex: number, note: string) => void;

  resetSchoolFollowup: (schoolId: string, teacherId?: string) => void;
  resetAllDataToDefault: () => void;
  clearSchoolRecords: (schoolId: string) => void;

  // Supabase cloud database integration
  supabaseStatus: 'connected' | 'connecting' | 'disconnected' | 'needs_tables' | 'error';
  supabaseMessage: string;
  supabaseTablesFound: {
    schools: boolean;
    teachers: boolean;
    records: boolean;
    notes: boolean;
    store: boolean;
  };
  lastSyncTime: string | null;
  isSyncing: boolean;
  supabaseConfig: import('../utils/supabaseClient').SupabaseConfig;
  updateSupabaseConfig: (updates: Partial<import('../utils/supabaseClient').SupabaseConfig>) => void;
  checkSupabase: () => Promise<void>;
  pushToSupabase: () => Promise<{ success: boolean; message: string }>;
  pullFromSupabase: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generic default schools
const GENERIC_DEFAULT_SCHOOLS: School[] = [
  {
    id: 'school-1',
    name: 'المدرسة',
    code: 'school101',
    password: '123',
    principalName: 'مدير المدرسة',
    educationOffice: 'مكتب التعليم',
    stage: 'عام',
    city: 'المملكة العربية السعودية',
    createdAt: '2026-09-01T08:00:00Z',
  },
];

// Generic default teachers
const GENERIC_DEFAULT_TEACHERS: Teacher[] = [
  { id: 't-1', schoolId: 'school-1', name: 'معلم 1', subject: 'عام', createdAt: '2026-09-01T08:00:00Z' },
  { id: 't-2', schoolId: 'school-1', name: 'معلم 2', subject: 'عام', createdAt: '2026-09-01T08:00:00Z' },
  { id: 't-3', schoolId: 'school-1', name: 'معلم 3', subject: 'عام', createdAt: '2026-09-01T08:00:00Z' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const STORAGE_KEY_AUTH = 'madrasati_auth_session';
  const STORAGE_KEY_SCHOOLS = 'madrasati_schools_v2';
  const STORAGE_KEY_TEACHERS = 'madrasati_teachers_v2';
  const STORAGE_KEY_RECORDS = 'madrasati_records_v2';
  const STORAGE_KEY_NOTES = 'madrasati_notes_v2';

  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHOOLS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return GENERIC_DEFAULT_SCHOOLS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEACHERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return GENERIC_DEFAULT_TEACHERS;
  });

  const [records, setRecords] = useState<Record<string, StatusValue>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // User starts at null so the app opens into the Login Page
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      // Clear legacy localStorage auth keys so stale mock school is not loaded
      localStorage.removeItem('madrasati_auth_v2');
      localStorage.removeItem('madrasati_auth');
      
      const sessionSaved = sessionStorage.getItem('madrasati_auth_session');
      if (sessionSaved) return JSON.parse(sessionSaved);
    } catch {
      // ignore
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'followup' | 'settings' | 'reports'>('followup');
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('t-1');

  // Supabase Integration State
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>(() => getSavedSupabaseConfig());
  const [supabaseStatus, setSupabaseStatus] = useState<
    'connected' | 'connecting' | 'disconnected' | 'needs_tables' | 'error'
  >('connecting');
  const [supabaseMessage, setSupabaseMessage] = useState<string>('جاري فحص الاتصال بـ Supabase...');
  const [supabaseTablesFound, setSupabaseTablesFound] = useState({
    schools: false,
    teachers: false,
    records: false,
    notes: false,
    store: false,
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('madrasati_last_sync');
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check Supabase connection
  const checkSupabase = useCallback(async () => {
    if (!supabaseConfig.enabled) {
      setSupabaseStatus('disconnected');
      setSupabaseMessage('المزامنة السحابية معطلة حالياً');
      return;
    }

    setSupabaseStatus('connecting');
    setSupabaseMessage('جاري فحص الاتصال بقاعدة بيانات Supabase...');

    try {
      const res = await testSupabaseConnection();
      setSupabaseTablesFound(res.tablesFound);

      if (!res.connected) {
        setSupabaseStatus('error');
        setSupabaseMessage(res.message);
        return;
      }

      const anyTable =
        res.tablesFound.schools || res.tablesFound.store || res.tablesFound.records;

      if (anyTable) {
        setSupabaseStatus('connected');
        setSupabaseMessage('متصل بنجاح مع Supabase (الجداول السحابية جاهزة للمزامنة)');
      } else {
        setSupabaseStatus('needs_tables');
        setSupabaseMessage('تم الاتصال بنجاح! يلزم إنشاء الجداول عبر SQL Editor لتفعيل المزامنة.');
      }
    } catch (e: unknown) {
      setSupabaseStatus('error');
      setSupabaseMessage(`خطأ في فحص الاتصال: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [supabaseConfig.enabled]);

  // Initial check on mount
  useEffect(() => {
    checkSupabase();
  }, [checkSupabase]);

  // Update config
  const updateSupabaseConfig = (updates: Partial<SupabaseConfig>) => {
    const updated = { ...supabaseConfig, ...updates };
    setSupabaseConfigState(updated);
    saveSupabaseConfig(updated);
    setTimeout(() => {
      checkSupabase();
    }, 200);
  };

  // Push local data to Supabase
  const pushToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    try {
      const res = await pushAllToSupabase({
        schools,
        teachers,
        records,
        notes,
      });

      if (res.success) {
        const now = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(now);
        localStorage.setItem('madrasati_last_sync', now);
        setSupabaseStatus('connected');
        setSupabaseMessage('تمت مزامنة البيانات سحابياً بنجاح');
      } else {
        if (res.message.includes('الجداول')) {
          setSupabaseStatus('needs_tables');
        }
        setSupabaseMessage(res.message);
      }
      return res;
    } catch (err: unknown) {
      const msg = `تعذر الحفظ السحابي: ${err instanceof Error ? err.message : String(err)}`;
      setSupabaseMessage(msg);
      return { success: false, message: msg };
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull data from Supabase
  const pullFromSupabase = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    try {
      const res = await pullAllFromSupabase();
      if (res.success && res.data) {
        if (res.data.schools && res.data.schools.length > 0) {
          setSchools(res.data.schools);
        }
        if (res.data.teachers && res.data.teachers.length > 0) {
          setTeachers(res.data.teachers);
        }
        if (res.data.records) {
          setRecords(res.data.records);
        }
        if (res.data.notes) {
          setNotes(res.data.notes);
        }
        const now = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(now);
        localStorage.setItem('madrasati_last_sync', now);
        setSupabaseStatus('connected');
        setSupabaseMessage('تم جلب البيانات السحابية وتحديث السجل بنجاح');
        return { success: true, message: 'تم استرجاع البيانات السحابية بنجاح' };
      } else {
        setSupabaseMessage(res.message);
        return { success: false, message: res.message };
      }
    } catch (err: unknown) {
      const msg = `تعذر الاسترجاع: ${err instanceof Error ? err.message : String(err)}`;
      setSupabaseMessage(msg);
      return { success: false, message: msg };
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-background sync debounce when connected
  useEffect(() => {
    if (supabaseStatus !== 'connected' || !supabaseConfig.enabled) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      pushAllToSupabase({
        schools,
        teachers,
        records,
        notes,
      }).then((res) => {
        if (res.success) {
          const now = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
          setLastSyncTime(now);
          localStorage.setItem('madrasati_last_sync', now);
        }
      }).catch(() => {
        // quiet background catch
      });
    }, 3500);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [schools, teachers, records, notes, supabaseStatus, supabaseConfig.enabled]);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCHOOLS, JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  const currentSchool = schools.find((s) => s.id === currentUser?.schoolId) || null;
  const currentSchoolTeachers = teachers.filter((t) => t.schoolId === currentSchool?.id);

  // Sync selected teacher
  useEffect(() => {
    if (currentSchoolTeachers.length > 0) {
      const exists = currentSchoolTeachers.some((t) => t.id === selectedTeacherId);
      if (!exists) {
        setSelectedTeacherId(currentSchoolTeachers[0].id);
      }
    } else {
      setSelectedTeacherId('');
    }
  }, [currentSchool?.id, currentSchoolTeachers, selectedTeacherId]);

  // Auth actions
  const login = (userOrCode: string, pass: string): boolean => {
    const cleanUser = userOrCode.trim();
    // 1. Check Admin credentials
    if (loginAsAdmin(cleanUser, pass)) {
      return true;
    }
    // 2. Check School credentials
    if (loginAsSchool(cleanUser, pass)) {
      return true;
    }
    return false;
  };

  const loginAsAdmin = (user: string, pass: string): boolean => {
    if (user.trim() === 'admin100' && pass === '123456@') {
      setCurrentUser({
        role: 'admin',
        username: 'admin100',
      });
      return true;
    }
    return false;
  };

  const loginAsSchool = (code: string, pass: string): boolean => {
    const school = schools.find(
      (s) => s.code.toLowerCase().trim() === code.toLowerCase().trim() && s.password === pass
    );
    if (school) {
      setCurrentUser({
        role: 'school',
        schoolId: school.id,
        schoolName: school.name,
        principalName: school.principalName,
        username: school.code,
      });
      setActiveTab('followup');
      return true;
    }
    return false;
  };

  const switchSchoolAsAdmin = (schoolId: string) => {
    const school = schools.find((s) => s.id === schoolId);
    if (school) {
      setCurrentUser({
        role: 'school',
        schoolId: school.id,
        schoolName: school.name,
        principalName: school.principalName,
        username: school.code,
        isAdminImpersonating: true,
      });
      setActiveTab('followup');
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
      localStorage.removeItem('madrasati_auth_v2');
      localStorage.removeItem('madrasati_auth');
    } catch {
      // ignore
    }
    setCurrentUser(null);
  };

  // School actions
  const addSchool = (schoolData: Omit<School, 'id' | 'createdAt'>): School => {
    const newSchool: School = {
      ...schoolData,
      id: `school-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSchools((prev) => [newSchool, ...prev]);

    const isGirls = newSchool.genderCategory === 'girls';
    const defaultTeacher: Teacher = {
      id: `t-${Date.now()}`,
      schoolId: newSchool.id,
      name: isGirls ? 'معلمة 1' : 'معلم 1',
      subject: 'عام',
      createdAt: new Date().toISOString(),
    };
    setTeachers((prev) => [...prev, defaultTeacher]);

    return newSchool;
  };

  const updateSchool = (id: string, updates: Partial<School>) => {
    setSchools((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    if (currentUser?.schoolId === id) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              schoolName: updates.name || prev.schoolName,
              principalName: updates.principalName || prev.principalName,
            }
          : null
      );
    }
  };

  const deleteSchool = (id: string) => {
    setSchools((prev) => prev.filter((s) => s.id !== id));
    setTeachers((prev) => prev.filter((t) => t.schoolId !== id));
    setRecords((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        if (k.startsWith(`${id}_`)) {
          delete updated[k];
        }
      });
      return updated;
    });
    setNotes((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        if (k.startsWith(`${id}_`)) {
          delete updated[k];
        }
      });
      return updated;
    });
    if (currentUser?.schoolId === id) {
      setCurrentUser({
        role: 'admin',
        username: 'admin100',
      });
    }
  };

  // Teacher actions
  const addTeacher = (name: string, subject?: string, civilId?: string, phone?: string) => {
    if (!currentSchool) return;
    const newTeacher: Teacher = {
      id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      schoolId: currentSchool.id,
      name: name.trim(),
      subject: subject?.trim() || 'عام',
      civilId: civilId?.trim() || '',
      phone: phone?.trim() || '',
      createdAt: new Date().toISOString(),
    };
    setTeachers((prev) => [...prev, newTeacher]);
    setSelectedTeacherId(newTeacher.id);
  };

  const addTeacherToSchool = (
    schoolId: string,
    name: string,
    subject?: string,
    civilId?: string,
    phone?: string
  ): Teacher => {
    const newTeacher: Teacher = {
      id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      schoolId,
      name: name.trim(),
      subject: subject?.trim() || 'عام',
      civilId: civilId?.trim() || '',
      phone: phone?.trim() || '',
      createdAt: new Date().toISOString(),
    };
    setTeachers((prev) => [...prev, newTeacher]);
    return newTeacher;
  };

  const bulkAddTeachers = (names: string[], defaultSubject: string = 'عام'): number => {
    if (!currentSchool) return 0;
    const cleanNames = names
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (cleanNames.length === 0) return 0;

    const newTeachersList: Teacher[] = cleanNames.map((name, index) => ({
      id: `t-${Date.now()}-${index}`,
      schoolId: currentSchool.id,
      name,
      subject: defaultSubject,
      createdAt: new Date().toISOString(),
    }));

    setTeachers((prev) => [...prev, ...newTeachersList]);
    if (newTeachersList.length > 0) {
      setSelectedTeacherId(newTeachersList[0].id);
    }
    return newTeachersList.length;
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    setRecords((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        if (k.includes(`_${id}_`)) {
          delete updated[k];
        }
      });
      return updated;
    });
    setNotes((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        if (k.includes(`_${id}_`)) {
          delete updated[k];
        }
      });
      return updated;
    });
  };

  // Status tracking
  const getRecordKey = (schoolId: string, teacherId: string, week: number, dayIndex: number, itemKey: FollowUpItemKey) => {
    return `${schoolId}_${teacherId}_${week}_${dayIndex}_${itemKey}`;
  };

  const getStatus = (
    schoolId: string,
    teacherId: string,
    week: number,
    dayIndex: number,
    itemKey: FollowUpItemKey
  ): StatusValue => {
    const key = getRecordKey(schoolId, teacherId, week, dayIndex, itemKey);
    return records[key] || 'not_done';
  };

  const setStatus = (
    schoolId: string,
    teacherId: string,
    week: number,
    dayIndex: number,
    itemKey: FollowUpItemKey,
    status: StatusValue
  ) => {
    const key = getRecordKey(schoolId, teacherId, week, dayIndex, itemKey);
    setRecords((prev) => ({
      ...prev,
      [key]: status,
    }));
  };

  const setDayAllStatus = (
    schoolId: string,
    teacherId: string,
    week: number,
    dayIndex: number,
    status: StatusValue
  ) => {
    const items: FollowUpItemKey[] = ['prep', 'plan', 'homework', 'exam'];
    setRecords((prev) => {
      const updated = { ...prev };
      items.forEach((item) => {
        const key = getRecordKey(schoolId, teacherId, week, dayIndex, item);
        updated[key] = status;
      });
      return updated;
    });
  };

  const setWeekAllStatus = (
    schoolId: string,
    teacherId: string,
    week: number,
    status: StatusValue
  ) => {
    const items: FollowUpItemKey[] = ['prep', 'plan', 'homework', 'exam'];
    setRecords((prev) => {
      const updated = { ...prev };
      for (let day = 0; day < 5; day++) {
        items.forEach((item) => {
          const key = getRecordKey(schoolId, teacherId, week, day, item);
          updated[key] = status;
        });
      }
      return updated;
    });
  };

  // Daily Notes Management
  const getNoteKey = (schoolId: string, teacherId: string, week: number, dayIndex: number) => {
    return `${schoolId}_${teacherId}_${week}_${dayIndex}`;
  };

  const getDayNote = (schoolId: string, teacherId: string, week: number, dayIndex: number): string => {
    const key = getNoteKey(schoolId, teacherId, week, dayIndex);
    return notes[key] || '';
  };

  const setDayNote = (schoolId: string, teacherId: string, week: number, dayIndex: number, note: string) => {
    const key = getNoteKey(schoolId, teacherId, week, dayIndex);
    setNotes((prev) => ({
      ...prev,
      [key]: note,
    }));
  };

  const clearSchoolRecords = (schoolId: string) => {
    setRecords((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        if (k.startsWith(`${schoolId}_`)) {
          delete updated[k];
        }
      });
      return updated;
    });
    setNotes((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        if (k.startsWith(`${schoolId}_`)) {
          delete updated[k];
        }
      });
      return updated;
    });
  };

  const resetSchoolFollowup = (schoolId: string, teacherId?: string) => {
    setRecords((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        if (teacherId) {
          if (k.startsWith(`${schoolId}_${teacherId}_`)) {
            delete updated[k];
          }
        } else {
          if (k.startsWith(`${schoolId}_`)) {
            delete updated[k];
          }
        }
      });
      return updated;
    });
  };

  const resetAllDataToDefault = () => {
    localStorage.removeItem(STORAGE_KEY_SCHOOLS);
    localStorage.removeItem(STORAGE_KEY_TEACHERS);
    localStorage.removeItem(STORAGE_KEY_RECORDS);
    localStorage.removeItem(STORAGE_KEY_NOTES);
    setSchools(GENERIC_DEFAULT_SCHOOLS);
    setTeachers(GENERIC_DEFAULT_TEACHERS);
    setRecords({});
    setNotes({});
    setCurrentUser({
      role: 'school',
      schoolId: 'school-1',
      schoolName: 'المدرسة',
      principalName: 'مدير المدرسة',
      username: 'school101',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        loginAsAdmin,
        loginAsSchool,
        switchSchoolAsAdmin,
        logout,
        activeTab,
        setActiveTab,
        schools,
        currentSchool,
        addSchool,
        updateSchool,
        deleteSchool,
        teachers,
        currentSchoolTeachers,
        selectedTeacherId,
        setSelectedTeacherId,
        addTeacher,
        addTeacherToSchool,
        bulkAddTeachers,
        updateTeacher,
        deleteTeacher,
        currentWeek,
        setCurrentWeek,
        records,
        getStatus,
        setStatus,
        setDayAllStatus,
        setWeekAllStatus,
        notes,
        getDayNote,
        setDayNote,
        resetSchoolFollowup,
        resetAllDataToDefault,
        clearSchoolRecords,
        supabaseStatus,
        supabaseMessage,
        supabaseTablesFound,
        lastSyncTime,
        isSyncing,
        supabaseConfig,
        updateSupabaseConfig,
        checkSupabase,
        pushToSupabase,
        pullFromSupabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
