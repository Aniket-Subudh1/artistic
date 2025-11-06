import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import { Shield, Lock, Eye } from 'lucide-react';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'privacy' });
  
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default function PrivacyPolicy({ params }: { params: { locale: string } }) {
  const isArabic = params.locale === 'ar';
  
  return (
    <>
      <Navbar />
      <div className={`min-h-screen relative ${isArabic ? 'rtl' : 'ltr'}`}>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, #391C71 0%, #5B2C87 25%, #7C3A9D 50%, #9D47B3 75%, #BE54C9 100%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-full">
                  <Shield className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                {isArabic 
                  ? 'نحن في Artistic نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك عند استخدام منصتنا.'
                  : 'At Artistic, we are committed to protecting your privacy and personal data. This policy explains how we collect, use, and protect your information when using our platform.'
                }
              </p>
              <p className="text-sm text-white/70 mt-4">
                {isArabic 
                  ? 'آخر تحديث: نوفمبر 2025'
                  : 'Last Updated: November 2025'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-purple-50" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              {isArabic ? <ArabicContent /> : <EnglishContent />}
            </div>

            {/* Footer Note */}
            <div className="mt-12 p-6 bg-white rounded-2xl shadow-xl border border-purple-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 rounded-full">
                  <Lock className="w-6 h-6 text-[#391C71]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {isArabic ? 'خصوصيتك مهمة بالنسبة لنا' : 'Your Privacy Matters'}
                  </h3>
                  <p className="text-gray-600">
                    {isArabic 
                      ? 'إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر البريد الإلكتروني أو قسم الدعم في المنصة.'
                      : 'If you have any questions about this Privacy Policy, please contact us via email or through the support section on the Platform.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

function ArabicContent() {
  return (
    <div className="space-y-10 text-right">
      {/* Section 1 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">1</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">المقدمة</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          تصف سياسة الخصوصية هذه كيفية قيام شركة Artistic ("نحن" أو "الشركة" أو "المنصة") بجمع واستخدام وحماية ومشاركة المعلومات الشخصية التي نحصل عليها من خلال موقعنا الإلكتروني وتطبيقنا المحمول وخدماتنا (يُشار إليها مجتمعة باسم "الخدمات").
        </p>
        <p className="text-gray-700 leading-relaxed">
          باستخدامك لخدماتنا، فإنك توافق على جمع واستخدام المعلومات وفقًا لهذه السياسة. إذا كنت لا توافق على هذه السياسة، يرجى عدم استخدام خدماتنا.
        </p>
      </section>

      {/* Section 2 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">2</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">المعلومات التي نجمعها</h2>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.1 المعلومات التي تقدمها لنا</h3>
        <div className="space-y-3 mr-4">
          <div className="p-4 bg-purple-50 rounded-xl border-r-4 border-[#391C71]">
            <strong className="text-[#391C71]">معلومات الحساب:</strong>
            <span className="text-gray-700"> الاسم، عنوان البريد الإلكتروني، رقم الهاتف، كلمة المرور، والصورة الشخصية.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-r-4 border-[#391C71]">
            <strong className="text-[#391C71]">معلومات الملف الشخصي:</strong>
            <span className="text-gray-700"> السيرة الذاتية، المهارات، الخبرات، معرض الأعمال، والمعلومات المهنية الأخرى.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-r-4 border-[#391C71]">
            <strong className="text-[#391C71]">معلومات الدفع:</strong>
            <span className="text-gray-700"> تفاصيل بطاقة الائتمان/الخصم ومعلومات الفواتير (يتم معالجتها بشكل آمن عبر مزودي خدمة الدفع).</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-r-4 border-[#391C71]">
            <strong className="text-[#391C71]">معلومات الحجز:</strong>
            <span className="text-gray-700"> تفاصيل الفعاليات، تواريخ الحجز، والتفضيلات الخاصة.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-r-4 border-[#391C71]">
            <strong className="text-[#391C71]">الاتصالات:</strong>
            <span className="text-gray-700"> الرسائل والمراسلات التي ترسلها إلينا أو من خلال منصتنا.</span>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 المعلومات التي نجمعها تلقائيًا</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
          <li>معلومات الجهاز (نوع الجهاز، نظام التشغيل، المتصفح)</li>
          <li>عنوان IP والموقع الجغرافي التقريبي</li>
          <li>ملفات تعريف الارتباط والتقنيات المشابهة</li>
          <li>سجلات الاستخدام (الصفحات المشاهدة، الوقت المستغرق، الروابط المنقور عليها)</li>
          <li>معلومات التحليلات والأداء</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">3</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">كيفية استخدام معلوماتك</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
          <li>تقديم وتشغيل وصيانة خدماتنا</li>
          <li>معالجة المعاملات والحجوزات</li>
          <li>إنشاء وإدارة حسابك</li>
          <li>التواصل معك بشأن خدماتنا، بما في ذلك التحديثات والإشعارات</li>
          <li>تخصيص تجربتك وتقديم محتوى مخصص</li>
          <li>تحليل استخدام المنصة وتحسين خدماتنا</li>
          <li>كشف ومنع الاحتيال والأنشطة غير المصرح بها</li>
          <li>الامتثال للالتزامات القانونية</li>
          <li>إرسال المواد التسويقية (بموافقتك)</li>
          <li>توفير دعم العملاء</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">4</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">مشاركة معلوماتك</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          قد نشارك معلوماتك الشخصية في الحالات التالية:
        </p>
        <div className="space-y-3 mr-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <strong className="text-gray-900">مع مقدمي الخدمات:</strong>
            <p className="text-gray-700 mt-2">الفنانين، مزودي المعدات، وأصحاب الأماكن المسجلين على منصتنا لتسهيل الحجوزات والخدمات.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <strong className="text-gray-900">مع مزودي الخدمات الخارجيين:</strong>
            <p className="text-gray-700 mt-2">معالجات الدفع، خدمات الاستضافة السحابية، مزودي التحليلات، وخدمات دعم العملاء.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <strong className="text-gray-900">للأغراض القانونية:</strong>
            <p className="text-gray-700 mt-2">عندما يُطلب منا ذلك بموجب القانون أو للامتثال للإجراءات القانونية أو لحماية حقوقنا.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <strong className="text-gray-900">نقل الأعمال:</strong>
            <p className="text-gray-700 mt-2">في حالة الاندماج أو الاستحواذ أو بيع الأصول.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <strong className="text-gray-900">بموافقتك:</strong>
            <p className="text-gray-700 mt-2">في أي حالات أخرى بموافقتك الصريحة.</p>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed mt-4">
          <strong>ملاحظة مهمة:</strong> لن نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة لأغراض تسويقية دون موافقتك الصريحة.
        </p>
      </section>

      {/* Section 5 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">5</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">أمن البيانات</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          نتخذ أمن بياناتك على محمل الجد ونطبق تدابير أمنية تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح أو التدمير، بما في ذلك:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
          <li>تشفير البيانات أثناء النقل والتخزين (SSL/TLS)</li>
          <li>ضوابط الوصول الآمنة والمصادقة</li>
          <li>عمليات تدقيق أمنية منتظمة</li>
          <li>تدريب الموظفين على حماية البيانات</li>
          <li>شبكات وأنظمة آمنة</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          ومع ذلك، لا يمكن أن تكون أي طريقة نقل عبر الإنترنت أو طريقة تخزين إلكترونية آمنة بنسبة 100٪. بينما نسعى جاهدين لاستخدام وسائل مقبولة تجاريًا لحماية بياناتك الشخصية، لا يمكننا ضمان أمانها المطلق.
        </p>
      </section>

      {/* Section 6 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">6</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">حقوقك</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          لديك الحقوق التالية فيما يتعلق بمعلوماتك الشخصية:
        </p>
        <div className="space-y-3 mr-4">
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">الحق في الوصول:</strong>
            <span className="text-gray-700"> يمكنك طلب نسخة من بياناتك الشخصية التي نحتفظ بها.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">الحق في التصحيح:</strong>
            <span className="text-gray-700"> يمكنك تحديث أو تصحيح بياناتك الشخصية غير الدقيقة.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">الحق في الحذف:</strong>
            <span className="text-gray-700"> يمكنك طلب حذف بياناتك الشخصية في ظروف معينة.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">الحق في تقييد المعالجة:</strong>
            <span className="text-gray-700"> يمكنك طلب تقييد معالجة بياناتك الشخصية.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">الحق في نقل البيانات:</strong>
            <span className="text-gray-700"> يمكنك طلب نقل بياناتك إلى منظمة أخرى.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">الحق في الاعتراض:</strong>
            <span className="text-gray-700"> يمكنك الاعتراض على معالجة بياناتك الشخصية في حالات معينة.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">الحق في سحب الموافقة:</strong>
            <span className="text-gray-700"> يمكنك سحب موافقتك في أي وقت حيث تعتمد المعالجة على موافقتك.</span>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed mt-4">
          لممارسة أي من هذه الحقوق، يرجى الاتصال بنا عبر قسم الدعم في المنصة.
        </p>
      </section>

      {/* Section 7 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">7</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">ملفات تعريف الارتباط والتقنيات المشابهة</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          نستخدم ملفات تعريف الارتباط وتقنيات التتبع المشابهة لتحسين تجربتك على منصتنا. ملفات تعريف الارتباط هي ملفات صغيرة يتم تخزينها على جهازك تساعدنا في:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
          <li>تذكر تفضيلاتك وإعداداتك</li>
          <li>فهم كيفية استخدامك لخدماتنا</li>
          <li>تحسين وظائف المنصة</li>
          <li>تقديم محتوى وإعلانات مخصصة</li>
          <li>تحليل حركة المرور والاتجاهات</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك. ومع ذلك، قد يؤدي تعطيل ملفات تعريف الارتباط إلى تقييد وظائف معينة على منصتنا.
        </p>
      </section>

      {/* Section 8 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">8</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">الاحتفاظ بالبيانات</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          نحتفظ بمعلوماتك الشخصية طالما كان ذلك ضروريًا للأغراض المبينة في سياسة الخصوصية هذه، إلا إذا كانت فترة احتفاظ أطول مطلوبة أو مسموح بها بموجب القانون.
        </p>
        <p className="text-gray-700 leading-relaxed">
          عند حذف حسابك، سنحذف أو نجعل بياناتك الشخصية مجهولة الهوية، باستثناء المعلومات التي نحتاج إلى الاحتفاظ بها للامتثال القانوني أو لحل النزاعات أو إنفاذ اتفاقياتنا.
        </p>
      </section>

      {/* Section 9 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">9</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">خصوصية الأطفال</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          خدماتنا غير موجهة للأطفال دون سن 18 عامًا. نحن لا نجمع عن قصد معلومات شخصية من الأطفال دون سن 18 عامًا.
        </p>
        <p className="text-gray-700 leading-relaxed">
          إذا علمنا أننا جمعنا بيانات شخصية من طفل دون سن 18 عامًا دون موافقة والديه، فسنتخذ خطوات لحذف تلك المعلومات في أقرب وقت ممكن.
        </p>
      </section>

      {/* Section 10 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">10</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">نقل البيانات الدولي</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          قد تتم معالجة معلوماتك ونقلها وتخزينها في خوادم موجودة خارج دولة الكويت. عند نقل بياناتك إلى دول أخرى، نضمن أن يتم ذلك وفقًا لهذه السياسة والقوانين المعمول بها.
        </p>
        <p className="text-gray-700 leading-relaxed">
          باستخدام خدماتنا، فإنك توافق على نقل معلوماتك إلى مواقع قد تكون خارج بلد إقامتك.
        </p>
      </section>

      {/* Section 11 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">11</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">روابط لمواقع الطرف الثالث</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          قد تحتوي منصتنا على روابط لمواقع ويب أو خدمات تابعة لطرف ثالث. لسنا مسؤولين عن ممارسات الخصوصية لهذه المواقع. نوصي بمراجعة سياسات الخصوصية الخاصة بكل موقع تزوره.
        </p>
      </section>

      {/* Section 12 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">12</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">التغييرات على سياسة الخصوصية</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإخطارك بأي تغييرات عن طريق نشر السياسة الجديدة على هذه الصفحة وتحديث تاريخ "آخر تحديث" في أعلى هذه السياسة.
        </p>
        <p className="text-gray-700 leading-relaxed">
          يُنصح بمراجعة سياسة الخصوصية هذه بشكل دوري للتعرف على أي تغييرات. تصبح التغييرات على سياسة الخصوصية سارية المفعول عند نشرها على هذه الصفحة.
        </p>
      </section>

      {/* Section 13 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">13</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">اتصل بنا</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه أو ممارساتنا المتعلقة بالبيانات، يرجى الاتصال بنا:
        </p>
        <div className="p-6 bg-purple-50 rounded-xl border-r-4 border-[#391C71]">
          <p className="text-gray-700 mb-2"><strong>شركة Artistic</strong></p>
          <p className="text-gray-700 mb-2">دولة الكويت</p>
          <p className="text-gray-700 mb-2">البريد الإلكتروني: privacy@artistic.global</p>
          <p className="text-gray-700">قسم الدعم: متاح عبر المنصة</p>
        </div>
      </section>
    </div>
  );
}

function EnglishContent() {
  return (
    <div className="space-y-10">
      {/* Section 1 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">1</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          This Privacy Policy describes how Artistic Company ("we," "us," "our," or "the Platform") collects, uses, protects, and shares personal information we obtain through our website, mobile application, and services (collectively referred to as "Services").
        </p>
        <p className="text-gray-700 leading-relaxed">
          By using our Services, you agree to the collection and use of information in accordance with this policy. If you do not agree with this policy, please do not use our Services.
        </p>
      </section>

      {/* Section 2 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">2</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.1 Information You Provide to Us</h3>
        <div className="space-y-3 ml-4">
          <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-[#391C71]">
            <strong className="text-[#391C71]">Account Information:</strong>
            <span className="text-gray-700"> Name, email address, phone number, password, and profile picture.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-[#391C71]">
            <strong className="text-[#391C71]">Profile Information:</strong>
            <span className="text-gray-700"> Biography, skills, experience, portfolio, and other professional information.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-[#391C71]">
            <strong className="text-[#391C71]">Payment Information:</strong>
            <span className="text-gray-700"> Credit/debit card details and billing information (processed securely through payment service providers).</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-[#391C71]">
            <strong className="text-[#391C71]">Booking Information:</strong>
            <span className="text-gray-700"> Event details, booking dates, and special preferences.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-[#391C71]">
            <strong className="text-[#391C71]">Communications:</strong>
            <span className="text-gray-700"> Messages and correspondence you send to us or through our platform.</span>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Information We Collect Automatically</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Device information (device type, operating system, browser)</li>
          <li>IP address and approximate geographic location</li>
          <li>Cookies and similar tracking technologies</li>
          <li>Usage logs (pages viewed, time spent, links clicked)</li>
          <li>Analytics and performance information</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">3</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect for the following purposes:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Provide, operate, and maintain our Services</li>
          <li>Process transactions and bookings</li>
          <li>Create and manage your account</li>
          <li>Communicate with you about our Services, including updates and notifications</li>
          <li>Personalize your experience and deliver customized content</li>
          <li>Analyze platform usage and improve our Services</li>
          <li>Detect and prevent fraud and unauthorized activities</li>
          <li>Comply with legal obligations</li>
          <li>Send marketing materials (with your consent)</li>
          <li>Provide customer support</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">4</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sharing Your Information</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          We may share your personal information in the following circumstances:
        </p>
        <div className="space-y-3 ml-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <strong className="text-gray-900">With Service Providers:</strong>
            <p className="text-gray-700 mt-2">Artists, equipment providers, and venue owners registered on our platform to facilitate bookings and services.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <strong className="text-gray-900">With Third-Party Service Providers:</strong>
            <p className="text-gray-700 mt-2">Payment processors, cloud hosting services, analytics providers, and customer support services.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <strong className="text-gray-900">For Legal Purposes:</strong>
            <p className="text-gray-700 mt-2">When required by law or to comply with legal processes or to protect our rights.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <strong className="text-gray-900">Business Transfers:</strong>
            <p className="text-gray-700 mt-2">In the event of a merger, acquisition, or sale of assets.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <strong className="text-gray-900">With Your Consent:</strong>
            <p className="text-gray-700 mt-2">In any other cases with your explicit consent.</p>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed mt-4">
          <strong>Important Note:</strong> We will not sell or rent your personal information to third parties for marketing purposes without your explicit consent.
        </p>
      </section>

      {/* Section 5 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">5</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          We take the security of your data seriously and implement appropriate technical and organizational security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction, including:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Encryption of data in transit and at rest (SSL/TLS)</li>
          <li>Secure access controls and authentication</li>
          <li>Regular security audits</li>
          <li>Employee training on data protection</li>
          <li>Secure networks and systems</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          However, no method of transmission over the Internet or electronic storage method is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
        </p>
      </section>

      {/* Section 6 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">6</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          You have the following rights regarding your personal information:
        </p>
        <div className="space-y-3 ml-4">
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">Right to Access:</strong>
            <span className="text-gray-700"> You can request a copy of your personal data we hold.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">Right to Rectification:</strong>
            <span className="text-gray-700"> You can update or correct inaccurate personal data.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">Right to Erasure:</strong>
            <span className="text-gray-700"> You can request deletion of your personal data in certain circumstances.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">Right to Restrict Processing:</strong>
            <span className="text-gray-700"> You can request restriction of processing your personal data.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">Right to Data Portability:</strong>
            <span className="text-gray-700"> You can request transfer of your data to another organization.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">Right to Object:</strong>
            <span className="text-gray-700"> You can object to processing of your personal data in certain cases.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">Right to Withdraw Consent:</strong>
            <span className="text-gray-700"> You can withdraw consent at any time where processing relies on consent.</span>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed mt-4">
          To exercise any of these rights, please contact us through the support section on the Platform.
        </p>
      </section>

      {/* Section 7 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">7</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Cookies and Similar Technologies</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies are small files stored on your device that help us:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Remember your preferences and settings</li>
          <li>Understand how you use our Services</li>
          <li>Improve platform functionality</li>
          <li>Deliver personalized content and advertisements</li>
          <li>Analyze traffic and trends</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          You can control cookies through your browser settings. However, disabling cookies may limit certain functionalities on our platform.
        </p>
      </section>

      {/* Section 8 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">8</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Data Retention</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          We retain your personal information for as long as necessary for the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
        </p>
        <p className="text-gray-700 leading-relaxed">
          When you delete your account, we will delete or anonymize your personal data, except for information we need to retain for legal compliance, dispute resolution, or enforcement of our agreements.
        </p>
      </section>

      {/* Section 9 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">9</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Children's Privacy</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          Our Services are not directed to children under the age of 18. We do not knowingly collect personal information from children under 18.
        </p>
        <p className="text-gray-700 leading-relaxed">
          If we learn that we have collected personal data from a child under 18 without parental consent, we will take steps to delete that information as soon as possible.
        </p>
      </section>

      {/* Section 10 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">10</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">International Data Transfers</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          Your information may be processed, transferred, and stored on servers located outside the State of Kuwait. When transferring your data to other countries, we ensure it is done in accordance with this policy and applicable laws.
        </p>
        <p className="text-gray-700 leading-relaxed">
          By using our Services, you consent to the transfer of your information to locations that may be outside your country of residence.
        </p>
      </section>

      {/* Section 11 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">11</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Links to Third-Party Sites</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these sites. We recommend reviewing the privacy policies of each site you visit.
        </p>
      </section>

      {/* Section 12 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">12</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Changes to Privacy Policy</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date at the top of this policy.
        </p>
        <p className="text-gray-700 leading-relaxed">
          You are advised to review this Privacy Policy periodically for any changes. Changes to the Privacy Policy become effective when posted on this page.
        </p>
      </section>

      {/* Section 13 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">13</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          If you have any questions about this Privacy Policy or our data practices, please contact us:
        </p>
        <div className="p-6 bg-purple-50 rounded-xl border-l-4 border-[#391C71]">
          <p className="text-gray-700 mb-2"><strong>Artistic Company</strong></p>
          <p className="text-gray-700 mb-2">State of Kuwait</p>
          <p className="text-gray-700 mb-2">Email: privacy@artistic.global</p>
          <p className="text-gray-700">Support: Available through the Platform</p>
        </div>
      </section>
    </div>
  );
}
