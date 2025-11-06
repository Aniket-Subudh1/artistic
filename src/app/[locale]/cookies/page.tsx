import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import { Cookie, Settings, Eye } from 'lucide-react';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'cookies' });
  
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default function CookiePolicy({ params }: { params: { locale: string } }) {
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
                  <Cookie className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                {isArabic ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                {isArabic 
                  ? 'توضح هذه السياسة كيفية استخدام Artistic لملفات تعريف الارتباط والتقنيات المشابهة على منصتنا لتحسين تجربتك وتقديم خدمات أفضل.'
                  : 'This policy explains how Artistic uses cookies and similar technologies on our platform to enhance your experience and provide better services.'
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
                  <Settings className="w-6 h-6 text-[#391C71]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {isArabic ? 'التحكم في ملفات تعريف الارتباط' : 'Control Your Cookies'}
                  </h3>
                  <p className="text-gray-600">
                    {isArabic 
                      ? 'يمكنك إدارة تفضيلات ملفات تعريف الارتباط من خلال إعدادات متصفحك في أي وقت. لمزيد من المعلومات، راجع قسم المتصفح أدناه.'
                      : 'You can manage your cookie preferences through your browser settings at any time. For more information, see the browser section below.'
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
          <h2 className="text-2xl font-bold text-gray-900">ما هي ملفات تعريف الارتباط؟</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          ملفات تعريف الارتباط (Cookies) هي ملفات نصية صغيرة يتم وضعها على جهازك (الكمبيوتر أو الهاتف الذكي أو الجهاز اللوحي) عند زيارتك لموقع إلكتروني. تُستخدم ملفات تعريف الارتباط على نطاق واسع لجعل المواقع الإلكترونية تعمل بشكل أكثر كفاءة، وكذلك لتوفير معلومات لأصحاب الموقع.
        </p>
        <p className="text-gray-700 leading-relaxed">
          تساعدنا ملفات تعريف الارتباط على تذكر تفضيلاتك، فهم كيفية استخدامك لمنصتنا، وتحسين تجربتك بشكل عام.
        </p>
      </section>

      {/* Section 2 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">2</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">أنواع ملفات تعريف الارتباط التي نستخدمها</h2>
        </div>
        
        <div className="space-y-4">
          {/* Essential Cookies */}
          <div className="p-5 bg-purple-50 rounded-xl border-r-4 border-[#391C71]">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg mt-1">
                <Cookie className="w-5 h-5 text-[#391C71]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">ملفات تعريف الارتباط الضرورية</h3>
                <p className="text-gray-700 mb-3">
                  هذه الملفات ضرورية لتشغيل منصتنا وتمكينك من استخدام ميزاتها. بدونها، لن تعمل الخدمات التي طلبتها بشكل صحيح.
                </p>
                <p className="text-sm text-gray-600 font-medium">أمثلة:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mr-4 mt-2">
                  <li>إدارة جلسة تسجيل الدخول</li>
                  <li>تذكر عناصر سلة التسوق</li>
                  <li>التأكد من أمان الموقع</li>
                  <li>تمكين وظائف الدفع</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Performance Cookies */}
          <div className="p-5 bg-blue-50 rounded-xl border-r-4 border-blue-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg mt-1">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">ملفات تعريف الارتباط الأداء والتحليلات</h3>
                <p className="text-gray-700 mb-3">
                  تساعدنا هذه الملفات على فهم كيفية تفاعل الزوار مع منصتنا من خلال جمع معلومات مجهولة المصدر والإبلاغ عنها. هذا يساعدنا على تحسين أداء الموقع.
                </p>
                <p className="text-sm text-gray-600 font-medium">أمثلة:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mr-4 mt-2">
                  <li>Google Analytics - لفهم حركة المرور على الموقع</li>
                  <li>مقاييس الأداء والسرعة</li>
                  <li>تتبع رسائل الخطأ</li>
                  <li>أنماط سلوك المستخدم</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Functional Cookies */}
          <div className="p-5 bg-green-50 rounded-xl border-r-4 border-green-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg mt-1">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">ملفات تعريف الارتباط الوظيفية</h3>
                <p className="text-gray-700 mb-3">
                  تتيح هذه الملفات للموقع تذكر الاختيارات التي تقوم بها (مثل اللغة أو المنطقة) وتوفير ميزات محسّنة وأكثر تخصيصًا.
                </p>
                <p className="text-sm text-gray-600 font-medium">أمثلة:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mr-4 mt-2">
                  <li>تفضيلات اللغة</li>
                  <li>إعدادات المنطقة الزمنية</li>
                  <li>تفضيلات العرض</li>
                  <li>المحتوى المخصص</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Targeting Cookies */}
          <div className="p-5 bg-orange-50 rounded-xl border-r-4 border-orange-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg mt-1">
                <Cookie className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">ملفات تعريف الارتباط الإعلانية والاستهداف</h3>
                <p className="text-gray-700 mb-3">
                  تُستخدم هذه الملفات لتقديم إعلانات أكثر صلة بك واهتماماتك. كما تُستخدم للحد من عدد المرات التي ترى فيها إعلانًا وقياس فعالية الحملات الإعلانية.
                </p>
                <p className="text-sm text-gray-600 font-medium">أمثلة:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mr-4 mt-2">
                  <li>إعلانات Google</li>
                  <li>إعلانات وسائل التواصل الاجتماعي</li>
                  <li>إعادة الاستهداف والتجديد بالنشاط التسويقي</li>
                  <li>تتبع التحويلات</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">3</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">ملفات تعريف الارتباط الخاصة بالطرف الأول والثالث</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ملفات تعريف الارتباط الخاصة بالطرف الأول</h3>
            <p className="text-gray-700">
              يتم تعيين هذه الملفات مباشرة من قبل Artistic وتُستخدم فقط من قبلنا. تساعدنا على تقديم خدماتنا وتحسين تجربتك على منصتنا.
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ملفات تعريف الارتباط الخاصة بالطرف الثالث</h3>
            <p className="text-gray-700 mb-3">
              يتم تعيين هذه الملفات من قبل مجالات أخرى غير Artistic. نستخدم خدمات الطرف الثالث التالية التي قد تضع ملفات تعريف الارتباط:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mr-4">
              <li><strong>Google Analytics:</strong> للتحليلات والإحصاءات</li>
              <li><strong>معالجات الدفع:</strong> لمعاملات آمنة</li>
              <li><strong>منصات وسائل التواصل الاجتماعي:</strong> لميزات المشاركة</li>
              <li><strong>شبكات توصيل المحتوى (CDN):</strong> للأداء</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">4</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">مدة ملفات تعريف الارتباط</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-xl">
            <h3 className="text-lg font-semibold text-[#391C71] mb-2">ملفات تعريف الارتباط للجلسة</h3>
            <p className="text-gray-700">
              هذه ملفات مؤقتة تنتهي صلاحيتها عند إغلاق متصفح الويب الخاص بك. تُستخدم للحفاظ على حالة الجلسة أثناء زيارتك.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl">
            <h3 className="text-lg font-semibold text-[#391C71] mb-2">ملفات تعريف الارتباط الدائمة</h3>
            <p className="text-gray-700">
              تبقى هذه الملفات على جهازك لفترة محددة أو حتى تقوم بحذفها يدويًا. تُستخدم لتذكر تفضيلاتك وتحسين تجربتك عبر الزيارات.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">5</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">كيفية إدارة ملفات تعريف الارتباط</h2>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          لديك الحق في قبول أو رفض ملفات تعريف الارتباط. يمكنك ممارسة تفضيلاتك المتعلقة بملفات تعريف الارتباط من خلال:
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">إعدادات المتصفح</h3>
            <p className="text-gray-700 mb-3">
              تسمح لك معظم متصفحات الويب بالتحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح. فيما يلي روابط لإرشادات إدارة ملفات تعريف الارتباط في المتصفحات الشائعة:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mr-4">
              <li><strong>Google Chrome:</strong> الإعدادات &gt; الخصوصية والأمان &gt; ملفات تعريف الارتباط</li>
              <li><strong>Mozilla Firefox:</strong> الخيارات &gt; الخصوصية والأمان</li>
              <li><strong>Safari:</strong> التفضيلات &gt; الخصوصية</li>
              <li><strong>Microsoft Edge:</strong> الإعدادات &gt; ملفات تعريف الارتباط والأذونات</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">أدوات إلغاء الاشتراك</h3>
            <p className="text-gray-700">
              يمكنك أيضًا إدارة ملفات تعريف الارتباط الإعلانية من خلال أدوات إلغاء الاشتراك مثل:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mr-4 mt-2">
              <li>Network Advertising Initiative (NAI)</li>
              <li>Digital Advertising Alliance (DAA)</li>
              <li>Your Online Choices (لأوروبا)</li>
            </ul>
          </div>
        </div>

        <div className="p-5 bg-yellow-50 border-r-4 border-yellow-500 rounded-xl">
          <p className="text-gray-800">
            <strong>ملاحظة:</strong> إذا قمت بتعطيل ملفات تعريف الارتباط أو رفضها، فقد لا تتمكن من استخدام بعض أجزاء منصتنا، وقد تتأثر تجربتك بشكل سلبي.
          </p>
        </div>
      </section>

      {/* Section 6 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">6</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">التقنيات المشابهة</h2>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          بالإضافة إلى ملفات تعريف الارتباط، قد نستخدم تقنيات مشابهة أخرى مثل:
        </p>

        <div className="space-y-3">
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">بكسلات التتبع (Web Beacons):</strong>
            <p className="text-gray-700 mt-1">صور صغيرة مضمنة في صفحات الويب أو رسائل البريد الإلكتروني تساعدنا على تتبع سلوك المستخدم.</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">التخزين المحلي:</strong>
            <p className="text-gray-700 mt-1">تقنيات مثل HTML5 localStorage التي تسمح للمواقع بتخزين البيانات محليًا في متصفحك.</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">بصمة المتصفح:</strong>
            <p className="text-gray-700 mt-1">جمع معلومات حول متصفحك وجهازك لإنشاء معرف فريد.</p>
          </div>
        </div>
      </section>

      {/* Section 7 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">7</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">التحديثات على سياسة ملفات تعريف الارتباط</h2>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          قد نقوم بتحديث سياسة ملفات تعريف الارتباط هذه من وقت لآخر لتعكس التغييرات في ممارساتنا أو لأسباب تشغيلية أو قانونية أو تنظيمية أخرى.
        </p>
        <p className="text-gray-700 leading-relaxed">
          يُرجى مراجعة هذه الصفحة بشكل دوري للبقاء على اطلاع على استخدامنا لملفات تعريف الارتباط. سيتم الإشارة إلى تاريخ آخر تحديث في أعلى هذه الصفحة.
        </p>
      </section>

      {/* Section 8 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">8</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">اتصل بنا</h2>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          إذا كان لديك أي أسئلة حول استخدامنا لملفات تعريف الارتباط أو التقنيات المشابهة الأخرى، يرجى الاتصال بنا:
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
          <h2 className="text-2xl font-bold text-gray-900">What Are Cookies?</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. Cookies are widely used to make websites work more efficiently, as well as to provide information to website owners.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Cookies help us remember your preferences, understand how you use our platform, and improve your overall experience.
        </p>
      </section>

      {/* Section 2 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">2</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Types of Cookies We Use</h2>
        </div>
        
        <div className="space-y-4">
          {/* Essential Cookies */}
          <div className="p-5 bg-purple-50 rounded-xl border-l-4 border-[#391C71]">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg mt-1">
                <Cookie className="w-5 h-5 text-[#391C71]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies are necessary for our platform to function and enable you to use its features. Without them, services you have requested cannot be properly provided.
                </p>
                <p className="text-sm text-gray-600 font-medium">Examples:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4 mt-2">
                  <li>Managing login session</li>
                  <li>Remembering shopping cart items</li>
                  <li>Ensuring site security</li>
                  <li>Enabling payment functionality</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Performance Cookies */}
          <div className="p-5 bg-blue-50 rounded-xl border-l-4 border-blue-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg mt-1">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance & Analytics Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously. This helps us improve site performance.
                </p>
                <p className="text-sm text-gray-600 font-medium">Examples:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4 mt-2">
                  <li>Google Analytics - to understand website traffic</li>
                  <li>Performance and speed metrics</li>
                  <li>Error message tracking</li>
                  <li>User behavior patterns</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Functional Cookies */}
          <div className="p-5 bg-green-50 rounded-xl border-l-4 border-green-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg mt-1">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies allow the website to remember choices you make (such as language or region) and provide enhanced, more personalized features.
                </p>
                <p className="text-sm text-gray-600 font-medium">Examples:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4 mt-2">
                  <li>Language preferences</li>
                  <li>Time zone settings</li>
                  <li>Display preferences</li>
                  <li>Personalized content</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Targeting Cookies */}
          <div className="p-5 bg-orange-50 rounded-xl border-l-4 border-orange-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg mt-1">
                <Cookie className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Advertising & Targeting Cookies</h3>
                <p className="text-gray-700 mb-3">
                  These cookies are used to deliver advertisements more relevant to you and your interests. They're also used to limit the number of times you see an ad and measure the effectiveness of advertising campaigns.
                </p>
                <p className="text-sm text-gray-600 font-medium">Examples:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4 mt-2">
                  <li>Google Ads</li>
                  <li>Social media advertising</li>
                  <li>Retargeting and remarketing</li>
                  <li>Conversion tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">3</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">First-Party and Third-Party Cookies</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">First-Party Cookies</h3>
            <p className="text-gray-700">
              These cookies are set directly by Artistic and are used only by us. They help us provide our services and improve your experience on our platform.
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Third-Party Cookies</h3>
            <p className="text-gray-700 mb-3">
              These cookies are set by domains other than Artistic. We use the following third-party services that may place cookies:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li><strong>Google Analytics:</strong> For analytics and statistics</li>
              <li><strong>Payment Processors:</strong> For secure transactions</li>
              <li><strong>Social Media Platforms:</strong> For sharing features</li>
              <li><strong>Content Delivery Networks (CDN):</strong> For performance</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">4</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Cookie Duration</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-xl">
            <h3 className="text-lg font-semibold text-[#391C71] mb-2">Session Cookies</h3>
            <p className="text-gray-700">
              These are temporary cookies that expire when you close your web browser. They're used to maintain session state during your visit.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl">
            <h3 className="text-lg font-semibold text-[#391C71] mb-2">Persistent Cookies</h3>
            <p className="text-gray-700">
              These cookies remain on your device for a set period or until you manually delete them. They're used to remember your preferences and improve your experience across visits.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">5</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">How to Manage Cookies</h2>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          You have the right to accept or decline cookies. You can exercise your cookie preferences by:
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Browser Settings</h3>
            <p className="text-gray-700 mb-3">
              Most web browsers allow you to control cookies through their settings. Here are links to cookie management instructions for popular browsers:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li><strong>Google Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies</li>
              <li><strong>Mozilla Firefox:</strong> Options &gt; Privacy & Security</li>
              <li><strong>Safari:</strong> Preferences &gt; Privacy</li>
              <li><strong>Microsoft Edge:</strong> Settings &gt; Cookies and Site Permissions</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Opt-Out Tools</h3>
            <p className="text-gray-700">
              You can also manage advertising cookies through opt-out tools such as:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
              <li>Network Advertising Initiative (NAI)</li>
              <li>Digital Advertising Alliance (DAA)</li>
              <li>Your Online Choices (for Europe)</li>
            </ul>
          </div>
        </div>

        <div className="p-5 bg-yellow-50 border-l-4 border-yellow-500 rounded-xl">
          <p className="text-gray-800">
            <strong>Note:</strong> If you disable or decline cookies, some parts of our platform may not function properly, and your experience may be negatively affected.
          </p>
        </div>
      </section>

      {/* Section 6 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">6</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Similar Technologies</h2>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          In addition to cookies, we may use other similar technologies such as:
        </p>

        <div className="space-y-3">
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">Web Beacons (Tracking Pixels):</strong>
            <p className="text-gray-700 mt-1">Small images embedded in web pages or emails that help us track user behavior.</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">Local Storage:</strong>
            <p className="text-gray-700 mt-1">Technologies like HTML5 localStorage that allow websites to store data locally in your browser.</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl">
            <strong className="text-[#391C71]">Browser Fingerprinting:</strong>
            <p className="text-gray-700 mt-1">Collecting information about your browser and device to create a unique identifier.</p>
          </div>
        </div>
      </section>

      {/* Section 7 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">7</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Updates to Cookie Policy</h2>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Please revisit this page periodically to stay informed about our use of cookies. The date of the last update will be indicated at the top of this page.
        </p>
      </section>

      {/* Section 8 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">8</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-4">
          If you have any questions about our use of cookies or other similar technologies, please contact us:
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
