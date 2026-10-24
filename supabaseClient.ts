import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { School, Teacher, StatusValue, FollowUpItemKey } from '../types';

// Default credentials provided by the user
export const DEFAULT_SUPABASE_URL = 'https://rfokwhbwvjpbwmbigupi.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmb2t3aGJ3dmpwYndtYmlndXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTk1MzYsImV4cCI6MjA5Mjc5NTUzNn0.XcZSqDRL4hDx3R7Vtlj1Bqmdcp6RyeXnKyChdrLpqHE';

const CONFIG_STORAGE_KEY = 'madrasati_supabase_cfg_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  enabled: boolean;
}

export function cleanSupabaseUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  // Strip trailing /rest/v1 or /rest/v1/
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  // Strip trailing slash
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: cleanSupabaseUrl(parsed.url || DEFAULT_SUPABASE_URL),
        anonKey: parsed.anonKey || DEFAULT_SUPABASE_ANON_KEY,
        enabled: parsed.enabled !== false,
      };
    }
  } catch {
    // ignore
  }
  return {
    url: cleanSupabaseUrl(DEFAULT_SUPABASE_URL),
    anonKey: DEFAULT_SUPABASE_ANON_KEY,
    enabled: true,
  };
}

export function saveSupabaseConfig(cfg: SupabaseConfig): void {
  const normalized: SupabaseConfig = {
    ...cfg,
    url: cleanSupabaseUrl(cfg.url),
  };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(normalized));
  currentClient = null; // reset cached instance
}

let currentClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const cfg = getSavedSupabaseConfig();
  if (!cfg.enabled || !cfg.url || !cfg.anonKey) {
    return null;
  }
  if (!currentClient) {
    try {
      currentClient = createClient(cfg.url, cfg.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.error('Failed to init Supabase client:', e);
      return null;
    }
  }
  return currentClient;
}

export interface ConnectionStatusResult {
  connected: boolean;
  message: string;
  tablesFound: {
    schools: boolean;
    teachers: boolean;
    records: boolean;
    notes: boolean;
    store: boolean;
  };
}

/**
 * Tests connection to Supabase and verifies which tables are present
 */
export async function testSupabaseConnection(): Promise<ConnectionStatusResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'لم يتم إعداد بيانات الاتصال بـ Supabase',
      tablesFound: { schools: false, teachers: false, records: false, notes: false, store: false },
    };
  }

  const result: ConnectionStatusResult = {
    connected: false,
    message: '',
    tablesFound: {
      schools: false,
      teachers: false,
      records: false,
      notes: false,
      store: false,
    },
  };

  try {
    // Check schools table
    const { error: schoolsErr } = await client.from('madrasati_schools').select('id').limit(1);
    result.tablesFound.schools = !schoolsErr;

    // Check store table (generic backup)
    const { error: storeErr } = await client.from('madrasati_store').select('key').limit(1);
    result.tablesFound.store = !storeErr;

    // Check records table
    const { error: recordsErr } = await client.from('madrasati_records').select('record_key').limit(1);
    result.tablesFound.records = !recordsErr;

    // Check teachers table
    const { error: teachersErr } = await client.from('madrasati_teachers').select('id').limit(1);
    result.tablesFound.teachers = !teachersErr;

    // Check notes table
    const { error: notesErr } = await client.from('madrasati_notes').select('note_key').limit(1);
    result.tablesFound.notes = !notesErr;

    // Connection is alive if we can reach the server, regardless of table presence
    result.connected = true;

    const anyTableFound =
      result.tablesFound.schools ||
      result.tablesFound.store ||
      result.tablesFound.records;

    if (anyTableFound) {
      result.message = 'تم الاتصال بقاعدة بيانات Supabase بنجاح، والجداول متوفرة!';
    } else {
      result.message = 'تم الاتصال بـ Supabase بنجاح! يلزم إنشاء الجداول عبر SQL Editor لتفعيل المزامنة.';
    }
  } catch (err: unknown) {
    result.connected = false;
    result.message = `تعذر الاتصال بقاعدة البيانات: ${err instanceof Error ? err.message : String(err)}`;
  }

  return result;
}

/**
 * SQL Script to create tables in Supabase SQL Editor
 */
export const SUPABASE_SETUP_SQL = `-- ==========================================
-- جداول سجل متابعة منصة مدرستي في Supabase
-- قم بنسخ هذا الكود ولصقه في Supabase SQL Editor ثم اضغط Run
-- ==========================================

-- 1. جدول المدارس
CREATE TABLE IF NOT EXISTS public.madrasati_schools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    password TEXT NOT NULL,
    principal_name TEXT,
    education_office TEXT,
    stage TEXT,
    gender_category TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول المعلمين / المعلمات
CREATE TABLE IF NOT EXISTS public.madrasati_teachers (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL,
    name TEXT NOT NULL,
    subject TEXT DEFAULT 'عام',
    civil_id TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. جدول حالات المتابعة الأسبوعية
CREATE TABLE IF NOT EXISTS public.madrasati_records (
    record_key TEXT PRIMARY KEY,
    school_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    week_number INT NOT NULL,
    day_index INT NOT NULL,
    item_key TEXT NOT NULL,
    status TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. جدول الملاحظات اليومية
CREATE TABLE IF NOT EXISTS public.madrasati_notes (
    note_key TEXT PRIMARY KEY,
    school_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    week_number INT NOT NULL,
    day_index INT NOT NULL,
    note TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. جدول الحفظ والمزامنة السريعة الشاملة (Backup Store)
CREATE TABLE IF NOT EXISTS public.madrasati_store (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- تفعيل سياسات الأمان Row Level Security (RLS)
ALTER TABLE public.madrasati_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.madrasati_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.madrasati_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.madrasati_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.madrasati_store ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول الشاملة للمفتاح العام anon
DROP POLICY IF EXISTS "Anon public access madrasati_schools" ON public.madrasati_schools;
CREATE POLICY "Anon public access madrasati_schools" ON public.madrasati_schools FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access madrasati_teachers" ON public.madrasati_teachers;
CREATE POLICY "Anon public access madrasati_teachers" ON public.madrasati_teachers FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access madrasati_records" ON public.madrasati_records;
CREATE POLICY "Anon public access madrasati_records" ON public.madrasati_records FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access madrasati_notes" ON public.madrasati_notes;
CREATE POLICY "Anon public access madrasati_notes" ON public.madrasati_notes FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon public access madrasati_store" ON public.madrasati_store;
CREATE POLICY "Anon public access madrasati_store" ON public.madrasati_store FOR ALL TO anon USING (true) WITH CHECK (true);
`;

/**
 * Sync Engine: pushes all local state to Supabase
 */
export async function pushAllToSupabase(payload: {
  schools: School[];
  teachers: Teacher[];
  records: Record<string, StatusValue>;
  notes: Record<string, string>;
}): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase غير مهيأ' };
  }

  try {
    let syncedViaRelational = false;
    let syncedViaStore = false;

    // 1. Try relational tables first
    try {
      if (payload.schools.length > 0) {
        const rows = payload.schools.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          password: s.password,
          principal_name: s.principalName,
          education_office: s.educationOffice || '',
          stage: s.stage || '',
          gender_category: s.genderCategory || 'boys',
          city: s.city || '',
          created_at: s.createdAt,
        }));
        const { error } = await client.from('madrasati_schools').upsert(rows);
        if (!error) syncedViaRelational = true;
      }

      if (payload.teachers.length > 0) {
        const tRows = payload.teachers.map((t) => ({
          id: t.id,
          school_id: t.schoolId,
          name: t.name,
          subject: t.subject || 'عام',
          civil_id: t.civilId || '',
          phone: t.phone || '',
          created_at: t.createdAt,
        }));
        await client.from('madrasati_teachers').upsert(tRows);
      }

      // Records
      const recordEntries = Object.entries(payload.records);
      if (recordEntries.length > 0) {
        const rRows = recordEntries.map(([key, status]) => {
          const parts = key.split('_');
          return {
            record_key: key,
            school_id: parts[0] || '',
            teacher_id: parts[1] || '',
            week_number: parseInt(parts[2] || '1', 10),
            day_index: parseInt(parts[3] || '0', 10),
            item_key: parts[4] || '',
            status: status,
            updated_at: new Date().toISOString(),
          };
        });
        // Upsert in batches of 100
        for (let i = 0; i < rRows.length; i += 100) {
          const chunk = rRows.slice(i, i + 100);
          await client.from('madrasati_records').upsert(chunk);
        }
      }

      // Notes
      const noteEntries = Object.entries(payload.notes);
      if (noteEntries.length > 0) {
        const nRows = noteEntries.map(([key, note]) => {
          const parts = key.split('_');
          return {
            note_key: key,
            school_id: parts[0] || '',
            teacher_id: parts[1] || '',
            week_number: parseInt(parts[2] || '1', 10),
            day_index: parseInt(parts[3] || '0', 10),
            note: note,
            updated_at: new Date().toISOString(),
          };
        });
        for (let i = 0; i < nRows.length; i += 100) {
          const chunk = nRows.slice(i, i + 100);
          await client.from('madrasati_notes').upsert(chunk);
        }
      }
    } catch (relErr) {
      console.warn('Relational sync attempt warning:', relErr);
    }

    // 2. Try the store table (fast, complete snapshot backup)
    try {
      const storePayload = [
        { key: 'schools', value: payload.schools, updated_at: new Date().toISOString() },
        { key: 'teachers', value: payload.teachers, updated_at: new Date().toISOString() },
        { key: 'records', value: payload.records, updated_at: new Date().toISOString() },
        { key: 'notes', value: payload.notes, updated_at: new Date().toISOString() },
      ];
      const { error: storeErr } = await client.from('madrasati_store').upsert(storePayload);
      if (!storeErr) syncedViaStore = true;
    } catch (storeErr) {
      console.warn('Store sync attempt warning:', storeErr);
    }

    if (syncedViaRelational || syncedViaStore) {
      return { success: true, message: 'تم حفظ ومزامنة البيانات مع Supabase بنجاح' };
    }

    return {
      success: false,
      message: 'لم يتم العثور على الجداول في Supabase. يرجى تشغيل كود SQL لإنشاء الجداول أولاً.',
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: `خطأ في المزامنة: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Pull all data from Supabase if available
 */
export async function pullAllFromSupabase(): Promise<{
  success: boolean;
  data?: {
    schools?: School[];
    teachers?: Teacher[];
    records?: Record<string, StatusValue>;
    notes?: Record<string, string>;
  };
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase غير مهيأ' };
  }

  try {
    // 1. Try store table first
    const { data: storeRows, error: storeErr } = await client
      .from('madrasati_store')
      .select('key, value');

    if (!storeErr && storeRows && storeRows.length > 0) {
      const result: {
        schools?: School[];
        teachers?: Teacher[];
        records?: Record<string, StatusValue>;
        notes?: Record<string, string>;
      } = {};

      storeRows.forEach((row) => {
        if (row.key === 'schools') result.schools = row.value as School[];
        if (row.key === 'teachers') result.teachers = row.value as Teacher[];
        if (row.key === 'records') result.records = row.value as Record<string, StatusValue>;
        if (row.key === 'notes') result.notes = row.value as Record<string, string>;
      });

      return {
        success: true,
        data: result,
        message: 'تم استرجاع البيانات من قاعدة بيانات Supabase (عبر المتجر السحابي)',
      };
    }

    // 2. Try relational tables
    const { data: sRows, error: sErr } = await client.from('madrasati_schools').select('*');
    if (!sErr && sRows && sRows.length > 0) {
      const schools: School[] = sRows.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        password: s.password,
        principalName: s.principal_name,
        educationOffice: s.education_office,
        stage: s.stage,
        genderCategory: s.gender_category,
        city: s.city,
        createdAt: s.created_at,
      }));

      const { data: tRows } = await client.from('madrasati_teachers').select('*');
      const teachers: Teacher[] = (tRows || []).map((t) => ({
        id: t.id,
        schoolId: t.school_id,
        name: t.name,
        subject: t.subject,
        civilId: t.civil_id,
        phone: t.phone,
        createdAt: t.created_at,
      }));

      const { data: rRows } = await client.from('madrasati_records').select('*');
      const records: Record<string, StatusValue> = {};
      (rRows || []).forEach((r) => {
        if (r.record_key) records[r.record_key] = r.status as StatusValue;
      });

      const { data: nRows } = await client.from('madrasati_notes').select('*');
      const notes: Record<string, string> = {};
      (nRows || []).forEach((n) => {
        if (n.note_key) notes[n.note_key] = n.note;
      });

      return {
        success: true,
        data: { schools, teachers, records, notes },
        message: 'تم استرجاع البيانات من جداول Supabase العلائقية بنجاح',
      };
    }

    return {
      success: false,
      message: 'لم يتم العثور على بيانات محفوظة مسبقاً في الجداول السحابية.',
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: `خطأ أثناء جلب البيانات: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
