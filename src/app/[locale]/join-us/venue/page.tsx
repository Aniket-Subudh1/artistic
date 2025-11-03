'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import { VenueApplicationService } from '@/services/venue-application.service';
import { useLocale } from 'next-intl';
import { CheckCircle, Sparkles, Building2, MapPin, Phone, Mail, FileText, Upload, Image as ImageIcon, AlertCircle, Calendar } from 'lucide-react';

export default function JoinVenueProviderPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [form, setForm] = useState({
    name: '',
    email: '',
    venue: '',
    ownerDescription: '',
    companyName: '',
    phoneNumber: '',
  });
  const [license, setLicense] = useState<File | null>(null);
  const [venueImage, setVenueImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!form.name || !form.email || !form.venue || !form.companyName || !form.phoneNumber) {
        throw new Error('Please fill all required fields');
      }
      if (!license) throw new Error('Please upload your license');
      if (!venueImage) throw new Error('Please upload a venue image');

      await VenueApplicationService.submitApplication(
        { ...form },
        { license, venueImage }
      );
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };
  // Success screen (mirror artist page style)
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="fixed inset-0 z-0">
          <Image src="/design.png" alt="Background" fill className="object-cover opacity-20" priority />
        </div>
        <Navbar />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl mx-auto w-full">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#391C71] to-purple-600 px-8 py-12 text-center text-white">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-4">
                  {locale === 'ar' ? 'تم إرسال الطلب!' : 'Application Submitted!'}
                </h1>
                <p className="text-purple-100 text-lg">
                  {locale === 'ar' ? 'سنراجع طلبك ونتواصل عبر البريد الإلكتروني' : 'We will review your application and reach out via email.'}
                </p>
              </div>
              <div className="p-8">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-slate-50 rounded-2xl">
                    <div className="w-12 h-12 bg-[#391C71] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{locale === 'ar' ? 'عملية المراجعة' : 'Review Process'}</h3>
                    <p className="text-gray-600 text-sm">{locale === 'ar' ? 'يستغرق الأمر عادةً 3-5 أيام عمل' : 'Typically takes 3-5 business days'}</p>
                  </div>
                  <div className="text-center p-6 bg-slate-50 rounded-2xl">
                    <div className="w-12 h-12 bg-[#391C71] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{locale === 'ar' ? 'إشعار بالبريد الإلكتروني' : 'Email Notification'}</h3>
                    <p className="text-gray-600 text-sm">{locale === 'ar' ? 'سنرسل لك تحديث الحالة عبر البريد' : 'We’ll send you status updates via email'}</p>
                  </div>
                  <div className="text-center p-6 bg-slate-50 rounded-2xl">
                    <div className="w-12 h-12 bg-[#391C71] rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{locale === 'ar' ? 'ابدأ مع المكان' : 'Get Started with Venue'}</h3>
                    <p className="text-gray-600 text-sm">{locale === 'ar' ? 'أكمل ملف المكان بعد الموافقة' : 'Complete your venue profile after approval'}</p>
                  </div>
                </div>
                <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setForm({ name: '', email: '', venue: '', ownerDescription: '', companyName: '', phoneNumber: '' });
                      setLicense(null);
                      setVenueImage(null);
                      const l = document.getElementById('license') as HTMLInputElement; if (l) l.value = '';
                      const v = document.getElementById('venueImage') as HTMLInputElement; if (v) v.value = '';
                    }}
                    className="px-8 py-3 bg-white border-2 border-[#391C71] text-[#391C71] rounded-xl font-semibold hover:bg-[#391C71] hover:text-white transition-all duration-300"
                  >
                    {locale === 'ar' ? 'إرسال طلب آخر' : 'Submit Another Application'}
                  </button>
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
        <Image src="/design.png" alt="Background" fill className="object-cover opacity-20" priority />
      </div>

      <Navbar />

      <div className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-[#391C71]/10 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-[#391C71]" />
              <span className="text-[#391C71] font-semibold">Venue Provider Onboarding</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              List Your <span className="text-[#391C71]">Venue</span> on Artistic
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Share your space with the community. Get discovered by organizers and enable bookings.
            </p>
          </div>

          {/* Benefits Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-[#391C71] to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Showcase Your Venue</h3>
              <p className="text-gray-600">Add photos and details so event organizers can find and book your venue.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-[#391C71] to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reach More Events</h3>
              <p className="text-gray-600">Be visible to a wide audience and get more booking opportunities.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-[#391C71] to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Management</h3>
              <p className="text-gray-600">We’ll notify you and help manage communication throughout the process.</p>
            </div>
          </div>

          {/* Application Form - mirrored style */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#391C71] to-purple-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Venue Provider Application</h2>
              <p className="text-purple-100">Tell us about you and your venue</p>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left: Contact and Venue */}
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-lg font-semibold text-gray-900 mb-4 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Building2 className={`w-5 h-5 text-[#391C71] ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        Contact & Venue
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                          <input name="name" value={form.name} onChange={onChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]" placeholder="Enter your full name" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                          <input name="email" type="email" value={form.email} onChange={onChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]" placeholder="email@example.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                          <input name="phoneNumber" value={form.phoneNumber} onChange={onChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]" placeholder="+971..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name *</label>
                          <input name="venue" value={form.venue} onChange={onChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]" placeholder="Your venue name" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company/Corporate Name *</label>
                          <input name="companyName" value={form.companyName} onChange={onChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]" placeholder="Registered company name" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-lg font-semibold text-gray-900 mb-4 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <FileText className={`w-5 h-5 text-[#391C71] ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        About the Venue Owner
                      </h3>
                      <textarea name="ownerDescription" value={form.ownerDescription} onChange={onChange} rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391C71] focus:border-[#391C71]" placeholder="Tell us about your venue and experience" />
                    </div>
                  </div>

                  {/* Right: Uploads */}
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-lg font-semibold text-gray-900 mb-4 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Upload className={`w-5 h-5 text-[#391C71] ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        Documents & Images
                      </h3>
                      <div className="space-y-6">
                        {/* License Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Upload License *</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#391C71] transition-colors bg-gray-50">
                            <input id="license" type="file" accept="application/pdf,image/*" onChange={(e) => setLicense(e.target.files?.[0] || null)} className="hidden" />
                            <label htmlFor="license" className="cursor-pointer">
                              {license ? (
                                <div className="text-[#391C71]">
                                  <FileText className="w-12 h-12 mx-auto mb-3" />
                                  <p className="font-semibold text-lg">{license.name}</p>
                                  <p className="text-sm text-gray-500 mt-1">Click to change file</p>
                                </div>
                              ) : (
                                <div>
                                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                  <p className="text-lg font-semibold text-gray-700">Drop your license here</p>
                                  <p className="text-gray-500 mt-1">or click to browse</p>
                                  <p className="text-xs text-gray-400 mt-2">PDF or Image up to 10MB</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                        {/* Venue Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Venue Image *</label>
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#391C71] transition-colors bg-gray-50">
                            <input id="venueImage" type="file" accept="image/*" onChange={(e) => setVenueImage(e.target.files?.[0] || null)} className="hidden" />
                            <label htmlFor="venueImage" className="cursor-pointer">
                              {venueImage ? (
                                <div className="text-[#391C71]">
                                  <ImageIcon className="w-12 h-12 mx-auto mb-3" />
                                  <p className="font-semibold text-lg">{venueImage.name}</p>
                                  <p className="text-sm text-gray-500 mt-1">Click to change image</p>
                                </div>
                              ) : (
                                <div>
                                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                  <p className="text-lg font-semibold text-gray-700">Upload a sample venue image</p>
                                  <p className="text-gray-500 mt-1">or click to browse</p>
                                  <p className="text-xs text-gray-400 mt-2">JPEG, PNG, WebP up to 10MB</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Section */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 justify-end items-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-4 bg-gradient-to-r from-[#391C71] to-purple-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-[#391C71] focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Submitting Application...' : 'Submit Application'}
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
