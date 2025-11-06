import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import { FileText, Shield, Scale } from 'lucide-react';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'terms' });
  
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default function TermsAndConditions({ params }: { params: { locale: string } }) {
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
                  <Scale className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                {isArabic ? 'شروط وأحكام استخدام منصة Artistic' : 'Terms and Conditions'}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                {isArabic 
                  ? 'باستخدامك لأي من خدمات المنصّة — سواء عبر الموقع الإلكتروني أو التطبيق الذكي — فإنك تُقرّ بقراءة هذه الشروط والأحكام وفهمها والموافقة عليها، وتلتزم بالأنظمة والقوانين المعمول بها في دولة الكويت.'
                  : 'By using any of the Platform services - whether through the website or mobile application - you acknowledge that you have read, understood, and agreed to these Terms and Conditions.'
                }
              </p>
              <p className="text-sm text-white/70 mt-4">
                {isArabic 
                  ? 'يُرجى قراءة هذه الشروط بعناية قبل استخدام المنصة أو إنشاء حساب عليها.'
                  : 'Please read these terms carefully before using the Platform or creating an account.'
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
                  <Shield className="w-6 h-6 text-[#391C71]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {isArabic ? 'هل لديك أسئلة؟' : 'Have Questions?'}
                  </h3>
                  <p className="text-gray-600">
                    {isArabic 
                      ? 'لأي استفسارات حول هذه الشروط والأحكام، يرجى التواصل معنا عبر البريد الإلكتروني أو قسم الدعم في المنصة.'
                      : 'For any inquiries regarding these Terms and Conditions, please contact us via email or through the support section on the Platform.'
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
          <h2 className="text-2xl font-bold text-gray-900">التعاريف</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          لأغراض هذه الشروط، يكون للكلمات والعبارات التالية المعاني الموضحة قرين كل منها ما لم يقتضِ السياق خلاف ذلك:
        </p>
        <div className="space-y-3 mr-4">
          <div className="p-4 bg-purple-50 rounded-xl border-r-4 border-[#391C71]">
            <strong className="text-[#391C71]">المنصّة:</strong>
            <span className="text-gray-700"> الموقع الإلكتروني والتطبيق المملوكان لشركة ارتستك لتنظيم وإدارة الاجتماعات والمؤتمرات.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-r-4 border-[#391C71]">
            <strong className="text-[#391C71]">العميل/المستخدم:</strong>
            <span className="text-gray-700"> كل شخص طبيعي أو اعتباري يستخدم المنصة لإنشاء حساب أو طلب أي من الخدمات المتاحة عبرها.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-r-4 border-[#391C71]">
            <strong className="text-[#391C71]">الحجز:</strong>
            <span className="text-gray-700"> أي عملية إلكترونية تتم عبر المنصة بغرض طلب خدمة معينة واعتمادها من قبل إدارة المنصّة أو أحد شركائها.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-r-4 border-[#391C71]">
            <strong className="text-[#391C71]">الطرف الثالث/المزوّد:</strong>
            <span className="text-gray-700"> أي جهة متعاقدة مع المنصة لتقديم خدمة أو منتج يظهر ضمن محتوى المنصة (مثل شركات المعدات أو منظمي المعارض).</span>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">2</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">القبول والنفاذ</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          إن دخولك على المنصة أو قيامك بعملية حجز/شراء يُعد إقرارًا منك بقراءة هذه الشروط والموافقة عليها، وهي مُكمّلة لأي سياسات أو تعليمات تظهر أثناء عملية الحجز.
        </p>
      </section>

      {/* Section 3 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">3</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">أهلية الاستخدام</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
          <li>يشترط إتمام العميل 18 سنة ميلادية على الأقل، والتمتع بالأهلية القانونية لإبرام التعاقدات.</li>
          <li>إذا كان العميل شخصًا اعتباريًا، فيقرّ ممثله بصلاحياته القانونية الملزمة.</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">4</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">نطاق استخدام المنصة</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
          <li>
            المنصّة هي وسيط إلكتروني يتيح التواصل بين المستخدمين ومقدّمي الخدمات الفنية والتجارية، ولا تُعد المنصة طرفًا مباشرًا في أي عقد أو التزام يتم بين المستخدم والطرف الثالث إلا في حدود ما نصت عليه هذه الشروط.
          </li>
          <li>يجوز للشركة إضافة أو تعديل الخدمات المعروضة في أي وقت دون إشعار مسبق.</li>
          <li>
            يُمنع استخدام المنصة لأي أغراض غير مشروعة أو مخالفة للنظام العام أو الآداب العامة أو تنتهك حقوق الملكية الفكرية للغير.
          </li>
        </ul>
      </section>

      {/* Section 5 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">5</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">إنشاء الحساب وأمن البيانات</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
          <li>يلتزم العميل بإدخال بيانات صحيحة ومحدثة، والمحافظة على سرية اسم المستخدم وكلمة المرور، ويُعد مسؤولاً عن أي استخدام يتم عبر حسابه.</li>
          <li>للشركة تعليق/إيقاف الحساب عند الاشتباه في إساءة الاستخدام أو مخالفة هذه الشروط.</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">6</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">مسؤولية المستخدم</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
          <li>يتحمّل المستخدم كامل المسؤولية عن محتوى بياناته وتعاملاته واختياراته داخل المنصة.</li>
          <li>
            يلتزم المستخدم بعدم إساءة استخدام المنصة أو تعطيلها أو محاولة الوصول غير المصرّح به إلى أنظمتها أو بياناتها.
          </li>
          <li>
            في حال تسبّب المستخدم في أي ضرر مادي أو تقني للمنصة أو شركائها، يكون ملزمًا بتعويض الشركة عن جميع الأضرار.
          </li>
        </ul>
      </section>

      {/* Section 7 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">7</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">الأسعار والمدفوعات</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
          <li>
            جميع الأسعار المعروضة عبر المنصة خاضعة للتحديث الدوري وتشمل فقط قيمة الخدمة المحددة دون أي التزامات إضافية ما لم يُنص صراحة على خلاف ذلك.
          </li>
          <li>
            تتم جميع المدفوعات إلكترونيًا عبر الوسائل المعتمدة على المنصة، ويُعد إتمام عملية الدفع قبولاً نهائيًا بالشروط والأحكام ذات الصلة.
          </li>
          <li>
            لا يحق للمستخدم استرداد أي مبالغ مدفوعة بعد تأكيد الحجز إلا في الحالات التي يقررها النظام أو تعلنها الشركة صراحة.
          </li>
        </ul>
      </section>

      {/* Section 8 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">8</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">حقوق الملكية الفكرية</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
          <li>
            جميع الحقوق المتعلقة بالتصاميم والمحتوى والنصوص والصور والشعارات والعلامات التجارية الخاصة بالمنصة مملوكة لشركة "ارتستك"، ويحظر استخدامها أو إعادة نشرها أو تعديلها دون إذن كتابي مسبق.
          </li>
          <li>
            لا يجوز للمستخدم نسخ، أو توزيع أو ترجمة أو تعديل أي جزء من محتوى المنصة دون موافقة خطية من الشركة.
          </li>
        </ul>
      </section>

      {/* Section 9 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">9</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">حماية البيانات</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          تُعالج بيانات العميل وفق سياسة الخصوصية المعتمدة على المنصة، وباستخدامك للخدمة فإنك توافق على جمع واستخدام ومعالجة بياناتك بالقدر اللازم لإتمام عملية الحجز والامتثال لأحكام القانون.
        </p>
      </section>

      {/* Section 10 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">10</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">حماية البيانات الشخصية</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          تلتزم المنصّة بالمحافظة التامة على سرية وخصوصية جميع البيانات والمعلومات الشخصية الخاصة بالعملاء والمستخدمين، وعدم استخدامها إلا في حدود ما يلزم لإتمام عمليات الحجز والتواصل بشأنها، أو للامتثال للالتزامات القانونية والتنظيمية النافذة في دولة الكويت.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          ويُحظر على المنصّة بيع أو مشاركة أو استغلال البيانات الشخصية للعملاء في أي أغراض تجارية أو تسويقية إلا بناءً على موافقة صريحة ومسبقة من العميل.
        </p>
        <p className="text-gray-700 leading-relaxed">
          وفي جميع الأحوال، تلتزم المنصّة باتخاذ التدابير الفنية والتنظيمية المعقولة لحماية بيانات العملاء من الوصول غير المصرح به، أو الفقد، أو التعديل، أو الإفصاح، مع بقاء العميل مسؤولاً عن المحافظة على سرية بيانات دخوله لحسابه وعدم مشاركتها مع الغير.
        </p>
      </section>

      {/* Section 11 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">11</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">التعويض</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          يتعهد المستخدم بتعويض الشركة ووكلائها وممثليها عن أي مطالبات أو أضرار أو خسائر أو تكاليف (بما في ذلك أتعاب المحاماة) تنشأ نتيجة استخدامه للمنصة أو مخالفته لهذه الشروط أو لأي حقوق للغير.
        </p>
      </section>

      {/* Section 12 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">12</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">إنهاء أو تعليق الخدمة</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          تحتفظ الشركة بحقها في تعليق أو إنهاء وصول أي مستخدم إلى المنصة في أي وقت دون إشعار مسبق في حال مخالفته لهذه الشروط أو في حال الاشتباه في إساءة الاستخدام، دون أن يترتب على ذلك أي التزام بالتعويض.
        </p>
      </section>

      {/* Section 13 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">13</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">التعديلات</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          يجوز للشركة تعديل هذه الشروط في أي وقت، وتُعد نافذة من تاريخ نشرها على المنصة. استمرار المستخدم في استعمال المنصة بعد نشر التعديلات يُعد قبولاً ضمنيًا بها.
        </p>
      </section>

      {/* Section 14 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">14</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">إخلاء المسؤولية</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          المنصة غير مسؤولة عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام الخدمات أو عدم القدرة على استخدامها، أو عن أي محتوى يقدمه طرف ثالث.
        </p>
      </section>

      {/* Section 15 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">15</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">الإخطارات</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          تُعد الإخطارات صحيحة إذا أُرسلت عبر البريد الإلكتروني المثبت في حساب العميل أو الإشعارات داخل التطبيق/المنصّة، وتُعد مُبلّغة من تاريخ الإرسال ما لم يُثبت خلاف ذلك.
        </p>
      </section>

      {/* Section 16 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">16</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">القانون والاختصاص</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          تخضع هذه الشروط لقوانين دولة الكويت، وتختص محاكم دولة الكويت وحدها بالفصل في أي نزاع ينشأ عنها أو بسببها.
        </p>
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
          <h2 className="text-2xl font-bold text-gray-900">Definitions</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          For the purposes of these Terms, the following words and phrases shall have the meanings set forth below, unless the context requires otherwise:
        </p>
        <div className="space-y-3 ml-4">
          <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-[#391C71]">
            <strong className="text-[#391C71]">Platform:</strong>
            <span className="text-gray-700"> The website and application owned by Artistic Company for organizing and managing meetings and conferences.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-[#391C71]">
            <strong className="text-[#391C71]">Client/User:</strong>
            <span className="text-gray-700"> Any natural or legal person who uses the Platform to create an account or request any of the services available through it.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-[#391C71]">
            <strong className="text-[#391C71]">Booking:</strong>
            <span className="text-gray-700"> Any electronic transaction made through the Platform for the purpose of requesting a specific service and its approval by the Platform management or one of its partners.</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-[#391C71]">
            <strong className="text-[#391C71]">Third Party/Provider:</strong>
            <span className="text-gray-700"> Any entity contracted with the Platform to provide a service or product that appears within the Platform's content (such as equipment companies or exhibition organizers).</span>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">2</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Acceptance and Effectiveness</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          Your access to the Platform or making a booking/purchase constitutes your acknowledgment that you have read and agreed to these Terms, which are complementary to any policies or instructions that appear during the booking process.
        </p>
      </section>

      {/* Section 3 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">3</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Eligibility to Use</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>The Client must be at least 18 years old and have legal capacity to enter into contracts.</li>
          <li>If the Client is a legal entity, its representative acknowledges their binding legal authority.</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">4</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Scope of Platform Use</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>
            The Platform is an electronic intermediary that facilitates communication between users and providers of technical and commercial services. The Platform is not a direct party to any contract or obligation between the User and the Third Party except to the extent specified in these Terms.
          </li>
          <li>The Company may add or modify the services offered at any time without prior notice.</li>
          <li>
            Using the Platform for any illegal purposes or purposes contrary to public order, public morals, or that violate the intellectual property rights of others is prohibited.
          </li>
        </ul>
      </section>

      {/* Section 5 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">5</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Account Creation and Data Security</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>
            The Client is obligated to enter accurate and updated information, maintain the confidentiality of the username and password, and is responsible for any use made through their account.
          </li>
          <li>The Company may suspend/deactivate the account if there is suspicion of misuse or violation of these Terms.</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">6</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">User Responsibility</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>The User bears full responsibility for the content of their data, transactions, and choices within the Platform.</li>
          <li>
            The User is obligated not to misuse the Platform, disable it, or attempt unauthorized access to its systems or data.
          </li>
          <li>
            If the User causes any material or technical damage to the Platform or its partners, they shall be obligated to compensate the Company for all damages.
          </li>
        </ul>
      </section>

      {/* Section 7 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">7</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Prices and Payments</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>
            All prices displayed on the Platform are subject to periodic updates and include only the value of the specified service without any additional obligations unless expressly stated otherwise.
          </li>
          <li>
            All payments are made electronically through the approved methods on the Platform, and completing the payment process constitutes final acceptance of the relevant Terms and Conditions.
          </li>
          <li>
            The User is not entitled to a refund of any amounts paid after booking confirmation except in cases determined by the regulations or expressly announced by the Company.
          </li>
        </ul>
      </section>

      {/* Section 8 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">8</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Intellectual Property Rights</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>
            All rights related to designs, content, texts, images, logos, and trademarks of the Platform are owned by "Artistic" Company, and their use, republishing, or modification without prior written permission is prohibited.
          </li>
          <li>
            The User may not copy, distribute, translate, or modify any part of the Platform's content without written consent from the Company.
          </li>
        </ul>
      </section>

      {/* Section 9 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">9</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Data Protection</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          Client data is processed in accordance with the privacy policy adopted on the Platform. By using the service, you agree to the collection, use, and processing of your data to the extent necessary to complete the booking process and comply with legal provisions.
        </p>
      </section>

      {/* Section 10 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">10</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Personal Data Protection</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          The Platform is committed to maintaining complete confidentiality and privacy of all personal data and information of clients and users, and not using it except to the extent necessary to complete booking operations and communicate about them, or to comply with legal and regulatory obligations in force in the State of Kuwait.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          The Platform is prohibited from selling, sharing, or exploiting the personal data of clients for any commercial or marketing purposes except based on explicit and prior consent from the client.
        </p>
        <p className="text-gray-700 leading-relaxed">
          In all cases, the Platform is committed to taking reasonable technical and organizational measures to protect client data from unauthorized access, loss, modification, or disclosure, while the client remains responsible for maintaining the confidentiality of their account login information and not sharing it with others.
        </p>
      </section>

      {/* Section 11 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">11</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Indemnification</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          The User undertakes to indemnify the Company, its agents, and representatives for any claims, damages, losses, or costs (including legal fees) arising from their use of the Platform or violation of these Terms or any rights of others.
        </p>
      </section>

      {/* Section 12 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">12</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Termination or Suspension of Service</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          The Company reserves the right to suspend or terminate any user's access to the Platform at any time without prior notice if they violate these Terms or if there is suspicion of misuse, without any obligation to compensate.
        </p>
      </section>

      {/* Section 13 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">13</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Amendments</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          The Company may amend these Terms at any time, and they shall be effective from the date of publication on the Platform. The User's continued use of the Platform after the publication of amendments constitutes implicit acceptance thereof.
        </p>
      </section>

      {/* Section 14 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">14</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Disclaimer</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          The Platform is not responsible for any direct or indirect damages resulting from the use of the services or the inability to use them, or for any content provided by a third party.
        </p>
      </section>

      {/* Section 15 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">15</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          Notifications are considered valid if sent via the email registered in the Client's account or notifications within the application/Platform, and are considered delivered from the date of sending unless proven otherwise.
        </p>
      </section>

      {/* Section 16 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
            <span className="text-lg font-bold text-[#391C71]">16</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Governing Law and Jurisdiction</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          These Terms are governed by the laws of the State of Kuwait, and the courts of the State of Kuwait have exclusive jurisdiction to settle any dispute arising from or in connection with them.
        </p>
      </section>
    </div>
  );
}
