import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthProvider } from '@/store/AuthContext';
import Navigation from '@/sections/Navigation';
import HeroSection from '@/sections/HeroSection';
import CrowdSection from '@/sections/CrowdSection';
import QRTicketSection from '@/sections/QRTicketSection';
import RoutingSection from '@/sections/RoutingSection';
import SafetySection from '@/sections/SafetySection';
import AdminDashboardSection from '@/sections/AdminDashboardSection';
import NetworkSection from '@/sections/NetworkSection';
import LiveMapSection from '@/sections/LiveMapSection';
import TestimonialsSection from '@/sections/TestimonialsSection';
import CTASection from '@/sections/CTASection';
import { AuthModal } from '@/components/modals/AuthModal';
import { TicketPurchaseModal } from '@/components/modals/TicketPurchaseModal';
import { QRScanner } from '@/components/qr/QRScanner';
import { useAuth } from '@/store/AuthContext';
import type { Ticket } from '@/lib/supabase';

gsap.registerPlugin(ScrollTrigger);

function AppContent() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<{
    valid: boolean;
    ticket?: Ticket;
    message: string;
  } | null>(null);
  const { isAdmin } = useAuth();

  const scrollToSection = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetAppClick = () => scrollToSection('#cta');
  const handleDashboardScroll = () => scrollToSection('#dashboard');
  const handleScannerDone = () => {
    setShowQRScanner(false);
    setTimeout(() => {
      handleDashboardScroll();
    }, 120);
  };

  useEffect(() => {
    // Wait for all sections to mount before setting up global snap
    const timer = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(r => value >= r.start - 0.02 && value <= r.end + 0.02);
            if (!inPinned) return value;

            const target = pinnedRanges.reduce((closest, r) =>
              Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: "power2.out"
        }
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div ref={mainRef} className="relative bg-[#070A12] min-h-screen">
      {/* Grain Overlay */}
      <div className="grain-overlay" />
      
      {/* Navigation */}
      <Navigation 
        onAuthClick={() => setShowAuthModal(true)}
        onTicketClick={() => setShowTicketModal(true)}
        onScanClick={() => setShowQRScanner(true)}
      />
      
      {/* Sections */}
      <main className="relative">
        <HeroSection className="z-10" onGetAppClick={handleGetAppClick} />
        <CrowdSection className="z-20" />
        <QRTicketSection className="z-30" onTicketClick={() => setShowTicketModal(true)} />
        <RoutingSection className="z-40" />
        <SafetySection className="z-50" />
        <AdminDashboardSection
          className="z-60"
          onScanClick={() => setShowQRScanner(true)}
          lastScanResult={lastScanResult}
        />
        <NetworkSection className="z-70" />
        <LiveMapSection className="z-80" />
        <TestimonialsSection className="z-90" />
        <CTASection className="z-100" onGetAppClick={handleGetAppClick} />
      </main>

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <TicketPurchaseModal isOpen={showTicketModal} onClose={() => setShowTicketModal(false)} />
      
      {/* QR Scanner (Admin only) */}
      {showQRScanner && isAdmin && (
        <QRScanner
          onClose={() => setShowQRScanner(false)}
          onDone={handleScannerDone}
          onSuccess={(result) => setLastScanResult(result)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
