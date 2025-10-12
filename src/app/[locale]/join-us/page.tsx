'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Upload, User, Mail, Calendar, CheckCircle, AlertCircle, FileText, Video, Palette, Users, Sparkles, ArrowRight, Star, Camera, Music, Award } from 'lucide-react';
import Image from 'next/image';
import { Footer } from '@/components/main/Footer';
import { Navbar } from '@/components/main/Navbar';
import { ApplicationService, CreateApplicationRequest } from '@/services/application.service';

export default function JoinUsPage() {
  const t = useTranslations();
  const tNav = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    gender: '',
    applicationType: 'SOLO' as 'SOLO' | 'GROUP',
    videoLink: ''
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validation
      if (!formData.fullName || !formData.email || !formData.age || !formData.gender) {
        throw new Error('Please fill in all required fields');
      }

      if (!uploadedFile) {
        throw new Error('Please upload your CV/Resume');
      }

      // Validate age
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 16 || age > 100) {
        throw new Error('Please enter a valid age between 16 and 100');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const applicationData: CreateApplicationRequest = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        age: formData.age,
        gender: formData.gender,
        applicationType: formData.applicationType,
        videoLink: formData.videoLink.trim() || undefined
      };

      const response = await ApplicationService.submitApplication(applicationData, uploadedFile);
      
      setSuccess(true);
      
    } catch (error) {
      console.error('Application submission error:', error);
      
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        const errorObj = error as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.error) {
          errorMessage = errorObj.error;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setUploadedFile(file);
      setError('');
    }
  };

  const handleApplicationTypeChange = (type: 'SOLO' | 'GROUP') => {
    setFormData(prev => ({
      ...prev,
      applicationType: type
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      age: '',
      gender: '',
      applicationType: 'SOLO',
      videoLink: ''
    });
    setUploadedFile(null);
    setSuccess(false);
    setError('');
    setCurrentStep(1);
    
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Success Page Component
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="fixed inset-0 z-0">
          <Image
            src="/design.png"
            alt="Background"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>

        <Navbar />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl mx-auto w-full">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              
              {/* Success Header */}
              <div className="bg-gradient-to-r from-[#391C71] to-purple-600 px-8 py-12 text-center text-white">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-4">
                  {locale === 'ar' ? 'تم إرسال الطلب!' : 'Application Submitted!'}
                </h1>
                <p className="text-purple-100 text-lg">
                  {locale === 'ar' ? 'مرحباً بك في مجتمع Artistic' : 'Welcome to the Artistic community'}
                </p>
              </div>

              {/* Success Content */}
              <div className="p-8">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-slate-50 rounded-2xl">
                    <div className="w-12 h-12 bg-[#391C71] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {locale === 'ar' ? 'عملية المراجعة' : 'Review Process'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {locale === 'ar' 
                        ? 'سيراجع فريقنا طلبك خلال 3-5 أيام عمل'
                        : 'Our team will review your application within 3-5 business days'
                      }
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-slate-50 rounded-2xl">
                    <div className="w-12 h-12 bg-[#391C71] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {locale === 'ar' ? 'إشعار بالبريد الإلكتروني' : 'Email Notification'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {locale === 'ar' 
                        ? 'ستتلقى تحديثات الحالة عبر إشعارات البريد الإلكتروني'
                        : 'You\'ll receive status updates via email notification'
                      }
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-slate-50 rounded-2xl">
                    <div className="w-12 h-12 bg-[#391C71] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {locale === 'ar' ? 'انضم للمجتمع' : 'Join Community'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {locale === 'ar' 
                        ? 'أكمل ملفك الشخصي وابدأ التواصل مع الفنانين'
                        : 'Complete your profile and start connecting with artists'
                      }
                    </p>
                  </div>
                </div>
                
                <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                  <button
                    onClick={resetForm}
                    className="px-8 py-3 bg-white border-2 border-[#391C71] text-[#391C71] rounded-xl font-semibold hover:bg-[#391C71] hover:text-white transition-all duration-300"
                  >
                    {locale === 'ar' ? 'إرسال طلب آخر' : 'Submit Another Application'}
                  </button>
                  <Link
                    href="/"
                    className="px-8 py-3 bg-[#391C71] text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 text-center"
                  >
                    {locale === 'ar' ? 'العودة للرئيسية' : 'Return to Home'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="fixed inset-0 z-0">
        <Image
          src="/design.png"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>

      <Navbar />
      
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-[#391C71]/10 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-[#391C71]" />
              <span className="text-[#391C71] font-semibold">Artist Onboarding</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Showcase Your <span className="text-[#391C71]">Creative Talent</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our community of talented artists and connect with audiences worldwide. Your creativity deserves a platform.
            </p>
          </div>

          {/* Benefits Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-[#391C71] to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {locale === 'ar' ? 'عرض الأعمال' : 'Showcase Portfolio'}
              </h3>
              <p className="text-gray-600">
                {locale === 'ar' 
                  ? 'اعرض أفضل أعمالك وتواصل مع العملاء المحتملين عالمياً'
                  : 'Display your best work and reach potential clients globally'
                }
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-[#391C71] to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {locale === 'ar' ? 'احصل على الحجوزات' : 'Get Booked'}
              </h3>
              <p className="text-gray-600">
                {locale === 'ar' 
                  ? 'تواصل مع منظمي الفعاليات الذين يبحثون عن فنانين موهوبين'
                  : 'Connect with event organizers looking for talented artists'
                }
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-[#391C71] to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {locale === 'ar' ? 'بناء السمعة' : 'Build Reputation'}
              </h3>
              <p className="text-gray-600">
                {locale === 'ar' 
                  ? 'احصل على التقييمات وابني سمعتك المهنية'
                  : 'Earn reviews and build your professional reputation'
                }
              </p>
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#391C71] to-purple-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">
                {locale === 'ar' ? 'نموذج طلب الفنان' : 'Artist Application Form'}
              </h2>
              <p className="text-purple-100">
                {locale === 'ar' 
                  ? 'أخبرنا عن نفسك وعن رحلتك الفنية'
                  : 'Tell us about yourself and your artistic journey'
                }
              </p>
            </div>

            {/* Form Content */}
            <div className="p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information Section */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column - Personal Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-lg font-semibold text-gray-900 mb-4 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <User className={`w-5 h-5 text-[#391C71] ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {locale === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] transition-colors"
                            placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {tAuth('signUp.emailLabel')} *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] transition-colors"
                            placeholder={tAuth('signUp.emailPlaceholder')}
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {locale === 'ar' ? 'العمر' : 'Age'} *
                            </label>
                            <input
                              type="number"
                              name="age"
                              value={formData.age}
                              onChange={handleChange}
                              min="16"
                              max="100"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] transition-colors"
                              placeholder={locale === 'ar' ? 'العمر' : 'Age'}
                              required
                              disabled={isLoading}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {locale === 'ar' ? 'الجنس' : 'Gender'} *
                            </label>
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] transition-colors"
                              required
                              disabled={isLoading}
                            >
                              <option value="">{locale === 'ar' ? 'اختر' : 'Select'}</option>
                              <option value="Male">{locale === 'ar' ? 'ذكر' : 'Male'}</option>
                              <option value="Female">{locale === 'ar' ? 'أنثى' : 'Female'}</option>
                              <option value="Other">{locale === 'ar' ? 'آخر' : 'Other'}</option>
                              <option value="Prefer not to say">{locale === 'ar' ? 'أفضل عدم الذكر' : 'Prefer not to say'}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Application Type */}
                    <div>
                      <h3 className={`text-lg font-semibold text-gray-900 mb-4 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Users className={`w-5 h-5 text-[#391C71] ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {locale === 'ar' ? 'نوع الطلب' : 'Application Type'}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => handleApplicationTypeChange('SOLO')}
                          className={`p-4 border-2 rounded-xl transition-all duration-300 text-left ${
                            formData.applicationType === 'SOLO'
                              ? 'border-[#391C71] bg-[#391C71]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${isRTL ? 'text-right' : 'text-left'}`}
                          disabled={isLoading}
                        >
                          <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="font-semibold text-gray-900">
                              {locale === 'ar' ? 'فنان منفرد' : 'Solo Artist'}
                            </span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.applicationType === 'SOLO' ? 'border-[#391C71]' : 'border-gray-300'
                            }`}>
                              {formData.applicationType === 'SOLO' && (
                                <div className="w-2.5 h-2.5 bg-[#391C71] rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {locale === 'ar' ? 'طلب فنان فردي' : 'Individual artist application'}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplicationTypeChange('GROUP')}
                          className={`p-4 border-2 rounded-xl transition-all duration-300 text-left ${
                            formData.applicationType === 'GROUP'
                              ? 'border-[#391C71] bg-[#391C71]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${isRTL ? 'text-right' : 'text-left'}`}
                          disabled={isLoading}
                        >
                          <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="font-semibold text-gray-900">
                              {locale === 'ar' ? 'مجموعة/فرقة' : 'Group/Band'}
                            </span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.applicationType === 'GROUP' ? 'border-[#391C71]' : 'border-gray-300'
                            }`}>
                              {formData.applicationType === 'GROUP' && (
                                <div className="w-2.5 h-2.5 bg-[#391C71] rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {locale === 'ar' ? 'طلب فريق أو مجموعة' : 'Team or group application'}
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Portfolio */}
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-lg font-semibold text-gray-900 mb-4 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Palette className={`w-5 h-5 text-[#391C71] ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {locale === 'ar' ? 'الأعمال والوسائط' : 'Portfolio & Media'}
                      </h3>
                      
                      <div className="space-y-6">
                        {/* File Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {locale === 'ar' ? 'رفع الأعمال/السيرة الذاتية' : 'Upload Portfolio/CV'} *
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#391C71] transition-colors bg-gray-50">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="file-upload"
                              disabled={isLoading}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                              {uploadedFile ? (
                                <div className="text-[#391C71]">
                                  <FileText className="w-12 h-12 mx-auto mb-3" />
                                  <p className="font-semibold text-lg">{uploadedFile.name}</p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {locale === 'ar' ? 'انقر لتغيير الملف' : 'Click to change file'}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                  <p className="text-lg font-semibold text-gray-700">
                                    {locale === 'ar' ? 'اسحب ملفك هنا' : 'Drop your portfolio here'}
                                  </p>
                                  <p className="text-gray-500 mt-1">
                                    {locale === 'ar' ? 'أو انقر للتصفح' : 'or click to browse'}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {locale === 'ar' ? 'PDF, DOC, DOCX حتى 10 ميجابايت' : 'PDF, DOC, DOCX up to 10MB'}
                                  </p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                        {/* Video Link */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {locale === 'ar' ? 'رابط فيديو الأعمال (اختياري)' : 'Portfolio Video Link (Optional)'}
                          </label>
                          <div className="relative">
                            <Video className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#391C71]`} />
                            <input
                              type="url"
                              name="videoLink"
                              value={formData.videoLink}
                              onChange={handleChange}
                              className={`w-full ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71] transition-colors`}
                              placeholder={locale === 'ar' ? 'https://your-portfolio-video.com' : 'https://your-portfolio-video.com'}
                              disabled={isLoading}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {locale === 'ar' 
                              ? 'شارك رابطاً لشريط العرض أو فيديو الأداء أو عرض الأعمال'
                              : 'Share a link to your showreel, performance video, or portfolio demo'
                            }
                          </p>
                        </div>

                        {/* Info Card */}
                        <div className="bg-[#391C71]/5 border border-[#391C71]/20 rounded-lg p-4">
                          <h4 className="font-semibold text-[#391C71] mb-2">
                            {locale === 'ar' ? 'نصائح للطلب' : 'Application Tips'}
                          </h4>
                          <ul className={`text-sm text-gray-700 space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <li>
                              {locale === 'ar' 
                                ? '• قم بتضمين أفضل أعمالك وأحدثها'
                                : '• Include your best and most recent work'
                              }
                            </li>
                            <li>
                              {locale === 'ar' 
                                ? '• تأكد من أن أعمالك تُظهر أسلوبك الفريد'
                                : '• Make sure your portfolio showcases your unique style'
                              }
                            </li>
                            <li>
                              {locale === 'ar' 
                                ? '• قم بتضمين أي خبرة أو تدريب ذي صلة'
                                : '• Include any relevant experience or training'
                              }
                            </li>
                            <li>
                              {locale === 'ar' 
                                ? '• المحتوى المرئي يساعد في عرض مهارات الأداء'
                                : '• Video content helps showcase your performance skills'
                              }
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Section */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <Link
                      href="/"
                      className="text-gray-600 hover:text-[#391C71] transition-colors font-medium"
                    >
                      ← {tAuth('signUp.backToHome')}
                    </Link>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-4 bg-gradient-to-r from-[#391C71] to-purple-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-[#391C71] focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Application</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}