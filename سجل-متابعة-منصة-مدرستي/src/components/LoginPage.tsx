import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  ShieldCheck, 
  KeyRound, 
  User, 
  ArrowLeft, 
  CalendarCheck,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { MinistryLogo } from './MinistryLogo';

export const LoginPage: React.FC = () => {
  const { loginAsAdmin, loginAsSchool, schools } = useApp();
  
  const [loginType, setLoginType] = useState<'admin' | 'school'>('admin');
  
  // Admin form
  const [adminUsername, setAdminUsername] = useState('admin100');
  const [adminPassword, setAdminPassword] = useState('123456@');
  
  // School form
  const [schoolCode, setSchoolCode] = useState(schools[0]?.code || 'school101');
  const [schoolPassword, setSchoolPassword] = useState('123');

  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginAsAdmin(adminUsername, adminPassword);
    if (!success) {
      setErrorMsg('اسم المستخدم أو كلمة المرور للمدير العام غير صحيحة. يرجى استخدام admin100 و 123456@');
    }
  };

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginAsSchool(schoolCode, schoolPassword);
    if (!success) {
      setErrorMsg('رمز المدرسة أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between p-4 sm:p-6 font-['Cairo']">
      {/* Top Banner with exact colors from IMG_7589 */}
      <div className="max-w-2xl mx-auto w-full pt-2 pb-1 text-center">
        {/* Official Ministry Logo */}
        <div className="flex justify-center mb-3">
          <div className="bg-white/95 backdrop-blur-xs py-2 px-5 rounded-2xl shadow-sm border border-slate-200/80">
            <MinistryLogo size={62} />
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#134e3f] via-[#165a49] to-[#1c6a56] rounded-3xl p-5 text-white shadow-md mb-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-normal">
            سجل متابعة منصة مدرستي
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1">
            نظام متابعة التحضير الإلكتروني والخطط الأسبوعية
          </p>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-2 bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Toggle between Admin and School */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setLoginType('admin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              loginType === 'admin'
                ? 'bg-[#165a49] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>حساب المدير العام</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType('school');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              loginType === 'school'
                ? 'bg-[#165a49] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>حسابات المدارس</span>
          </button>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
              <span className="shrink-0 font-bold">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Admin Login Form */}
          {loginType === 'admin' ? (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-[#165a49] leading-relaxed">
                <span className="font-bold block mb-0.5">صلاحيات المدير العام:</span>
                إضافة المدارس المستقلة، تعيين مديري المدارس، واستعراض ومتابعة سجلات جميع المدارس.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم مستخدم المدير العام
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin100"
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-2 focus:ring-[#165a49]/20 outline-hidden text-sm bg-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="123456@"
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-2 focus:ring-[#165a49]/20 outline-hidden text-sm bg-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#165a49] hover:bg-[#124d3e] active:scale-[0.99] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <span>تسجيل الدخول كمدير عام</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Quick credential filler */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>بيانات الدخول:</span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminUsername('admin100');
                    setAdminPassword('123456@');
                  }}
                  className="text-[#165a49] hover:underline font-bold"
                >
                  تعبئة admin100 / 123456@
                </button>
              </div>
            </form>
          ) : (
            /* School Login Form */
            <form onSubmit={handleSchoolSubmit} className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-[#165a49] leading-relaxed">
                <span className="font-bold block mb-0.5">حساب المدرسة:</span>
                يتضمن 3 تبويبات مخصصة: <strong>الإعدادات</strong> (إدارة المعلمين)، <strong>المتابعة</strong> اليومية، و<strong>التقارير</strong>.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رمز / مستخدم المدرسة
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                    placeholder="school101"
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-2 focus:ring-[#165a49]/20 outline-hidden text-sm bg-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={schoolPassword}
                    onChange={(e) => setSchoolPassword(e.target.value)}
                    placeholder="كلمة المرور"
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-2 focus:ring-[#165a49]/20 outline-hidden text-sm bg-white font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#165a49] hover:bg-[#124d3e] active:scale-[0.99] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <span>تسجيل الدخول للمدرسة</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Quick School selector */}
              {schools.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold mb-2">
                    دخول سريع للمدارس المسجلة:
                  </p>
                  <div className="space-y-1.5">
                    {schools.slice(0, 3).map((sch) => (
                      <button
                        key={sch.id}
                        type="button"
                        onClick={() => {
                          setSchoolCode(sch.code);
                          setSchoolPassword(sch.password);
                          loginAsSchool(sch.code, sch.password);
                        }}
                        className="w-full text-right p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs text-slate-700 flex items-center justify-between transition"
                      >
                        <span className="font-bold text-slate-800 truncate">{sch.name}</span>
                        <span className="text-[10px] text-[#165a49] bg-emerald-100/80 px-1.5 py-0.5 rounded font-mono">
                          {sch.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Feature Pills */}
      <div className="max-w-xl mx-auto w-full py-2">
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs">
            <CalendarCheck className="w-5 h-5 text-[#165a49] mx-auto mb-1" />
            <p className="text-xs font-bold text-slate-800">التقويم 1448هـ</p>
            <p className="text-[10px] text-slate-500">19 أسبوع مع التواريخ</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-[#165a49] mx-auto mb-1" />
            <p className="text-xs font-bold text-slate-800">عناصر المتابعة</p>
            <p className="text-[10px] text-slate-500">تم • لم يتم • غير مكتمل</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs">
            <BarChart3 className="w-5 h-5 text-[#165a49] mx-auto mb-1" />
            <p className="text-xs font-bold text-slate-800">تقارير شاملة</p>
            <p className="text-[10px] text-slate-500">أسبوعية وشهرية ورسوم</p>
          </div>
        </div>
      </div>
    </div>
  );
};
