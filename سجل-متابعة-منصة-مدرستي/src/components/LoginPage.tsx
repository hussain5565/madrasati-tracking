import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  KeyRound, 
  User, 
  ArrowLeft, 
  CalendarCheck, 
  CheckCircle2, 
  BarChart3, 
  LogIn, 
  Eye, 
  EyeOff, 
  Lock,
  FileText,
  Cloud,
  ShieldCheck,
  Layers,
  Sparkles,
  Award,
  Check
} from 'lucide-react';
import { MinistryLogo } from './MinistryLogo';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  
  // Clean, empty inputs without pre-filled data
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('يرجى إدخال اسم المستخدم أو رمز المدرسة وكلمة المرور.');
      return;
    }

    setIsLoading(true);

    try {
      // Call unified login: redirects to AdminDashboard if Admin, or SchoolView if School
      const success = await login(username.trim(), password);

      if (!success) {
        setIsLoading(false);
        setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق من صحة البيانات.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة مجدداً.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/30 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-['Cairo']">
      
      {/* Top Navbar Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between pb-4 border-b border-slate-200/80 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/95 backdrop-blur-xs py-1.5 px-4 rounded-2xl shadow-xs border border-slate-200/90">
            <MinistryLogo size={52} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#165a49] bg-emerald-100/70 px-2 py-0.5 rounded-full inline-block mb-0.5">
              وزارة التعليم • المملكة العربية السعودية
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800">
              سجل متابعة منصة مدرستي
            </h2>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <CalendarCheck className="w-4 h-4 text-[#165a49]" />
          <span>التقويم الدراسي 1448هـ</span>
        </div>
      </header>

      {/* Main Horizontal (Landscape) Layout */}
      <main className="max-w-7xl mx-auto w-full flex-1 flex items-center justify-center my-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* RIGHT SIDE (in RTL): Introduction & Informational Cards about the Register (Col 7) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            
            {/* Hero Banner Card */}
            <div className="bg-gradient-to-br from-[#0e3b30] via-[#134e3f] to-[#185e4d] rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-teal-300/10 blur-2xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-200 mb-3 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>دليل ومنظومة العمل الرقمية المعتمدة</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-normal leading-tight mb-2">
                  سجل متابعة منصة مدرستي
                </h1>
                
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal max-w-2xl">
                  نظام رقمي متكامل ومخصص لمتابعة وتقييم إنجاز المعلمين والمعلمات على منصة مدرستي أسبوعياً، مع رصد حالات التحضير، الخطط الأسبوعية، الواجبات والاختبارات، واستخراج تقارير إحصائية دقيقة تخدم الإدارة المدرسية والإشراف التربوي.
                </p>
              </div>
            </div>

            {/* Informational Cards Grid (2x2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Card 1: Lesson Prep & Plans */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#165a49] flex items-center justify-center font-bold mb-3 border border-emerald-100">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  التحضير والخطط الأسبوعية
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  متابعة يومية وأسبوعية لاكتمال إعداد الدروس وتوزيع المنهج المدرسي واعتماد الخطط التدريسية عبر المنصة.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-[#165a49]">
                  <Check className="w-3 h-3" />
                  <span>رصد زمني دقيق لكل حصة دراسية</span>
                </div>
              </div>

              {/* Card 2: Assignments & Exams */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  الواجبات والأنشطة والاختبارات
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  توثيق دقيق لإسناد الواجبات المدرسية، المهام الأدائية، والاختبارات الإلكترونية بحالات (تم • لم يتم • غير مكتمل).
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-teal-700">
                  <Check className="w-3 h-3" />
                  <span>ملاحظات يومية توجيهية للمعلمين</span>
                </div>
              </div>

              {/* Card 3: Reports & Statistics */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-3 border border-blue-100">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  تقارير بيانية وإحصائيات فورية
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  رسوم بيانية توضح نسب الإنجاز، مؤشرات الأداء للأقسام والمعلمين، وتقارير أسبوعية وشهرية جاهزة للطباعة والتصدير.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
                  <Check className="w-3 h-3" />
                  <span>طباعة رسمية ببيانات المدرسة والوزارة</span>
                </div>
              </div>

              {/* Card 4: Cloud Sync & Security */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-3 border border-amber-100">
                  <Cloud className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  مزامنة سحابية وأمان مركزي
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  حفظ سحابي فوري ومشفر لبيانات المدرسة والمعلمين والسجلات لضمان استمرارية وتكامل العمل دون فقدان البيانات.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                  <Check className="w-3 h-3" />
                  <span>دعم كامل لمدارس البنين والبنات</span>
                </div>
              </div>

            </div>

            {/* Bottom Quick Highlights */}
            <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3 flex flex-wrap items-center justify-around gap-2 text-xs text-[#165a49]">
              <div className="flex items-center gap-1.5 font-bold">
                <CalendarCheck className="w-4 h-4" />
                <span>19 أسبوعاً دراسياً معتمداً</span>
              </div>
              <span className="text-emerald-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>4 محاور متابعة وتقييم</span>
              </div>
              <span className="text-emerald-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 font-bold">
                <Award className="w-4 h-4" />
                <span>نماذج إشرافية موثقة</span>
              </div>
            </div>

          </div>

          {/* LEFT SIDE (in RTL): The Login Card (Col 5) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden p-6 sm:p-8">
              
              {/* Card Header */}
              <div className="text-center pb-5 border-b border-slate-100">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200 text-[#165a49] flex items-center justify-center shadow-xs">
                  <Lock className="w-7 h-7" />
                </div>
                
                <h2 className="text-xl font-extrabold text-slate-900">
                  تسجيل الدخول للنظام
                </h2>
                
                <p className="text-xs text-slate-500 mt-1">
                  البوابة الموحدة لدخول مديري المدارس والمشرف العام
                </p>
              </div>

              {/* Form Content */}
              <div className="pt-6">
                {errorMsg && (
                  <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2 animate-in fade-in">
                    <span className="shrink-0 font-bold">⚠️</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4.5">
                  {/* Username / School Code Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      اسم المستخدم / رمز المدرسة
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="أدخل اسم المستخدم أو رمز المدرسة"
                        className="w-full pl-3 pr-10 py-3 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-2 focus:ring-[#165a49]/20 outline-hidden text-sm bg-slate-50/50 hover:bg-white focus:bg-white font-medium transition"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 focus:border-[#165a49] focus:ring-2 focus:ring-[#165a49]/20 outline-hidden text-sm bg-slate-50/50 hover:bg-white focus:bg-white font-mono transition"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#124d3e] to-[#185e4d] hover:from-[#0e3d31] hover:to-[#145041] active:scale-[0.99] text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-70"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Security Note */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>دخول آمن ومشفر متوافق مع معايير وزارة التعليم</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full pt-4 mt-4 border-t border-slate-200/80 text-center text-xs text-slate-500">
        <p className="font-medium">
          منظومة سجل متابعة منصة مدرستي • التقويم الدراسي 1448هـ
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          الإدارة العامة للتعليم بالمملكة العربية السعودية • جميع الحقوق محفوظة
        </p>
      </footer>

    </div>
  );
};
