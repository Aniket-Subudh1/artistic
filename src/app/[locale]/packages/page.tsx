'use client';

import PublicPackages from '@/components/main/PublicPackages';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Equipment Packages
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete equipment solutions for your events. Professional packages at discounted rates with everything you need.
            </p>
          </div>
          <PublicPackages showHeader={false} />
        </div>
      </main>
      <Footer />
    </div>
  );
}