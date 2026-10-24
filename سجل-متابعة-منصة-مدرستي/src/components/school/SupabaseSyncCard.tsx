import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  UploadCloud, 
  DownloadCloud, 
  Key, 
  Globe, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info
} from 'lucide-react';
import { SUPABASE_SETUP_SQL } from '../../utils/supabaseClient';

export const SupabaseSyncCard: React.FC = () => {
  const {
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
  } = useApp();

  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(supabaseStatus === 'needs_tables');
  const [showConfigEdit, setShowConfigEdit] = useState(false);
  const [inputUrl, setInputUrl] = useState(supabaseConfig.url);
  const [inputKey, setInputKey] = useState(supabaseConfig.anonKey);
  const [showKey, setShowKey] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const copySqlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
      setCopiedSql(true);
      notify('تم نسخ كود SQL لإنشاء الجداول إلى الحافظة بنجاح', 'success');
      setTimeout(() => setCopiedSql(false), 3000);
    } catch {
      notify('تعذر النسخ التلقائي، يرجى التحديد والنسخ يدوياً', 'error');
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig({
      url: inputUrl,
      anonKey: inputKey,
      enabled: true,
    });
    setShowConfigEdit(false);
    notify('تم تحديث بيانات الاتصال بـ Supabase بنجاح', 'success');
  };

  const handleManualPush = async () => {
    notify('جاري رفع ومزامنة البيانات مع Supabase...', 'info');
    const res = await pushToSupabase();
    if (res.success) {
      notify('تم رفع البيانات بنجاح إلى قاعدة بيانات Supabase!', 'success');
    } else {
      notify(res.message, 'error');
    }
  };

  const handleManualPull = async () => {
    if (!confirm('هل أنت متأكد من استرجاع البيانات السحابية؟ سيتم تحديث السجل والمدارس بالبيانات المخزنة في Supabase.')) {
      return;
    }
    notify('جاري استرجاع البيانات من Supabase...', 'info');
    const res = await pullFromSupabase();
    if (res.success) {
      notify('تم استرجاع وتحديث البيانات من Supabase بنجاح!', 'success');
    } else {
      notify(res.message, 'error');
    }
  };

  // Status visual configurations
  const getStatusBadge = () => {
    switch (supabaseStatus) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>متصل سحابياً (جاهز للمزامنة)</span>
          </span>
        );
      case 'needs_tables':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>متصل بنجاح (بانتظار تنفيذ كود SQL للجداول)</span>
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>جاري الاتصال...</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>تعذر الاتصال بقاعدة البيانات</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>تخزين محلي فقط (معطل)</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-500/30 shadow-sm relative overflow-hidden font-['Cairo']">
      {/* Decorative background glow */}
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

      {/* Floating Action Alert */}
      {actionMsg && (
        <div className={`mb-4 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition ${
          actionMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : actionMsg.type === 'error'
            ? 'bg-red-50 text-red-800 border-red-300'
            : 'bg-blue-50 text-blue-800 border-blue-300'
        }`}>
          {actionMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {actionMsg.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
          {actionMsg.type === 'info' && <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#165a49] to-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                قاعدة بيانات Supabase السحابية
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                PostgreSQL Cloud
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              مزامنة فورية ودائمة لسجلات المدارس والمعلمين والمتابعة عبر السحابة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge()}
          <button
            type="button"
            onClick={() => checkSupabase()}
            disabled={isSyncing}
            title="إعادة فحص الاتصال"
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status banner message */}
      <div className={`p-3.5 rounded-2xl border text-xs sm:text-sm mb-5 flex items-start gap-3 ${
        supabaseStatus === 'connected'
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          : supabaseStatus === 'needs_tables'
          ? 'bg-amber-50/80 border-amber-300 text-amber-950'
          : supabaseStatus === 'error'
          ? 'bg-red-50 border-red-200 text-red-900'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        <Info className={`w-4 h-4 shrink-0 mt-0.5 ${
          supabaseStatus === 'connected' ? 'text-emerald-600' : supabaseStatus === 'needs_tables' ? 'text-amber-600' : 'text-slate-500'
        }`} />
        <div className="flex-1">
          <p className="font-medium leading-relaxed">{supabaseMessage}</p>
          {lastSyncTime && (
            <p className="text-[11px] text-slate-500 mt-1">
              آخر مزامنة ناجحة: <strong className="font-bold text-slate-700">{lastSyncTime}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Sync Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <button
          type="button"
          onClick={handleManualPush}
          disabled={isSyncing || supabaseStatus === 'error'}
          className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#165a49] to-[#124d3e] hover:from-[#124d3e] hover:to-[#0f3f33] disabled:from-slate-300 disabled:to-slate-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>مزامنة وحفظ السجل سحابياً (رفع الآن)</span>
        </button>

        <button
          type="button"
          onClick={handleManualPull}
          disabled={isSyncing || supabaseStatus === 'error'}
          className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 disabled:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition active:scale-98 cursor-pointer"
        >
          <DownloadCloud className="w-4 h-4 text-[#165a49]" />
          <span>استرجاع البيانات من Supabase (تحديث السجل)</span>
        </button>
      </div>

      {/* Collapsible Section 1: Tables Setup Guide (Especially helpful when tables are missing) */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden mb-4 bg-slate-50/50">
        <button
          type="button"
          onClick={() => setShowSqlGuide(!showSqlGuide)}
          className="w-full p-3.5 flex items-center justify-between text-right text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-100/70 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>كود إنشاء جداول قاعدة البيانات في Supabase (SQL Script)</span>
            {supabaseStatus === 'needs_tables' && (
              <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                مطلوب لمرة واحدة
              </span>
            )}
          </div>
          {showSqlGuide ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showSqlGuide && (
          <div className="p-4 border-t border-slate-200 bg-white space-y-3">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
              <strong>خطوات التفعيل في دقيقة واحدة:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1 font-medium">
                <li>اضغط على زر <strong>&quot;نسخ كود SQL&quot;</strong> أدناه.</li>
                <li>افتح لوحة تحكم مشروعك في 
                  <a 
                    href="https://supabase.com/dashboard/project/rfokwhbwvjpbwmbigupi/sql/new" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mx-1 text-emerald-700 underline font-bold"
                  >
                    <span>Supabase SQL Editor</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>الصق الكود ثم اضغط على زر <strong>Run</strong> لتنشأ الجداول فوراً وبشكل مؤمن.</li>
              </ol>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between bg-slate-800 text-slate-300 px-3 py-1.5 rounded-t-xl text-xs font-mono">
                <span>supabase_schema.sql</span>
                <button
                  type="button"
                  onClick={copySqlToClipboard}
                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-md font-sans text-xs font-bold transition cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'تم النسخ!' : 'نسخ كود SQL'}</span>
                </button>
              </div>
              <pre 
                dir="ltr"
                className="max-h-48 overflow-y-auto bg-slate-900 text-emerald-400 p-3 rounded-b-xl text-[11px] font-mono leading-relaxed select-all"
              >
                {SUPABASE_SETUP_SQL}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Section 2: Edit Supabase Credentials */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
        <button
          type="button"
          onClick={() => setShowConfigEdit(!showConfigEdit)}
          className="w-full p-3.5 flex items-center justify-between text-right text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-100/70 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600" />
            <span>عرض أو تعديل مفاتيح الربط (API URL & Anon Key)</span>
          </div>
          {showConfigEdit ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showConfigEdit && (
          <form onSubmit={handleSaveConfig} className="p-4 border-t border-slate-200 bg-white space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>رابط المشروع (Supabase Project URL)</span>
              </label>
              <input
                type="url"
                required
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                dir="ltr"
                placeholder="https://xyz.supabase.co"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:border-[#165a49] outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  <span>المفتاح العام (Anon Public Key)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[11px] text-[#165a49] font-bold hover:underline"
                >
                  {showKey ? 'إخفاء' : 'إظهار المفتاح'}
                </button>
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                required
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                dir="ltr"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:border-[#165a49] outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-[#165a49] hover:bg-[#124d3e] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                حفظ وإعادة الاتصال
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
};
