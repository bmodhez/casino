import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SEOContent } from '@/components/SEOContent';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Floating User Profile - Top Right */}
          <div className="absolute top-4 right-6 z-50">
            <Header />
          </div>
          
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-6 min-h-[calc(100vh-50px)]">
              {children}
            </div>
            {/* SEO Content above footer */}
            <SEOContent />
            {/* Footer inside scrollable area */}
            <Footer />
          </main>
        </div>
        <MobileNav />
      </div>
    </div>
  );
}
