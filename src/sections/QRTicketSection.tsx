import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { QrCode, Clock, CreditCard, History, RefreshCw, Loader2 } from 'lucide-react';
import { ticketService } from '@/services/ticketService';
import { useAuth } from '@/store/AuthContext';
import type { Ticket } from '@/lib/supabase';

gsap.registerPlugin(ScrollTrigger);

interface QRTicketSectionProps {
  className?: string;
  onTicketClick: () => void;
}

const QRTicketSection = ({ className = '', onTicketClick }: QRTicketSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const leftBlockRef = useRef<HTMLDivElement>(null);
  const qrCardRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0%-30%)
      scrollTl.fromTo(
        leftBlockRef.current,
        { x: '-55vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        qrCardRef.current,
        { x: '55vw', opacity: 0, rotateZ: 2, scale: 0.97 },
        { x: 0, opacity: 1, rotateZ: 0, scale: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        scanLineRef.current,
        { y: '-120%' },
        { y: '120%', ease: 'none' },
        0
      );

      const entranceChips = chipsRef.current?.querySelectorAll('.chip');
      if (entranceChips && entranceChips.length > 0) {
        scrollTl.fromTo(
          entranceChips,
          { y: '18vh', opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.02, ease: 'none' },
          0
        );
      }

      scrollTl.fromTo(
        bgRef.current,
        { scale: 1.1, y: '8vh' },
        { scale: 1, y: 0, ease: 'none' },
        0
      );

      // EXIT (70%-100%)
      scrollTl.fromTo(
        leftBlockRef.current,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        qrCardRef.current,
        { x: 0, opacity: 1 },
        { x: '18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      const exitChips = chipsRef.current?.querySelectorAll('.chip');
      if (exitChips && exitChips.length > 0) {
        scrollTl.fromTo(
          exitChips,
          { y: 0, opacity: 1 },
          { y: '10vh', opacity: 0, ease: 'power2.in' },
          0.7
        );
      }

      scrollTl.fromTo(
        bgRef.current,
        { scale: 1, y: 0 },
        { scale: 1.06, y: '-6vh' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Load tickets
  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadTickets = async () => {
    try {
      const activeTickets = await ticketService.getActiveTickets();
      setTickets(activeTickets.slice(0, 2));
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const savedPasses = tickets.length > 0 ? tickets.map(t => ({
    name: `${t.type === 'monthly' ? 'Monthly' : t.type === 'daily' ? 'Daily' : 'Single'} · ${t.line.split(' ')[0]}`,
    type: t.line.includes('Metro') ? 'metro' : 'train' as const,
  })) : [
    { name: 'Monthly · Metro Airport', type: 'metro' as const },
    { name: 'Return · Central', type: 'train' as const },
  ];

  return (
    <section
      ref={sectionRef}
      id="tickets"
      className={`section-pinned ${className}`}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/platform_gate.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(7,10,18,0.5) 0%, rgba(7,10,18,0.8) 60%, rgba(7,10,18,0.95) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col lg:block">
        {/* Left Info Panel */}
        <div
          ref={leftBlockRef}
          className="lg:absolute px-6 pt-20 lg:pt-0 lg:px-0 lg:left-[7vw] lg:top-[18vh] lg:w-[40vw]"
        >
          <h2 className="headline-lg text-[#F4F6FF]">
            Your ticket is <span className="text-[#00F0FF]">your phone.</span>
          </h2>
          <p className="body-text text-[#A7B0C8] mt-4 lg:mt-6">
            Buy suburban and metro tickets in seconds. Show the QR at the gate—no
            paper, no queues.
          </p>
          
          <button
            onClick={onTicketClick}
            className="mt-6 btn-primary flex items-center gap-2 lg:hidden"
          >
            <CreditCard className="w-4 h-4" />
            Buy Ticket Now
          </button>
        </div>

        {/* Right QR Card */}
        <div
          ref={qrCardRef}
          className="lg:absolute mx-4 lg:mx-0 mt-4 lg:mt-0 card-glass p-4 lg:p-6 overflow-hidden"
          style={{
            right: '7vw',
            top: '18vh',
            width: 'calc(100% - 2rem)',
            maxWidth: '380px',
            height: 'auto',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-base lg:text-lg font-semibold text-[#F4F6FF]">
              Daily Pass · Western
            </span>
            <CreditCard className="w-5 h-5 text-[#00F0FF]" />
          </div>

          {/* QR Code Area */}
          <div className="relative flex justify-center my-4 lg:my-6">
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-xl bg-white p-2 lg:p-3 relative overflow-hidden">
              <QrCode className="w-full h-full text-[#070A12]" />
              {/* Scan Line */}
              <div
                ref={scanLineRef}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-60"
                style={{ top: '0%' }}
              />
            </div>
          </div>

          <p className="text-center text-sm text-[#A7B0C8] mb-4 lg:mb-6">
            Tap gate scanner to enter
          </p>

          <div className="flex items-center justify-center gap-2 p-2 lg:p-3 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/20">
            <Clock className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-xs lg:text-sm text-[#00F0FF]">
              Valid until 11:59 PM today
            </span>
          </div>

          {/* Saved Passes */}
          <div className="mt-4 lg:mt-6">
            <p className="text-xs text-[#A7B0C8] mb-2 lg:mb-3 uppercase tracking-wider">
              Saved Passes
            </p>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-[#00F0FF] animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {savedPasses.map((pass, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 lg:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-[#F4F6FF]">{pass.name}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        pass.type === 'metro'
                          ? 'bg-[#00F0FF]/20 text-[#00F0FF]'
                          : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                      }`}
                    >
                      {pass.type === 'metro' ? 'Metro' : 'Train'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buy Ticket Button - Desktop */}
          <button
            onClick={onTicketClick}
            className="hidden lg:flex w-full mt-4 items-center justify-center gap-2 p-3 rounded-xl bg-[#00F0FF] text-[#070A12] font-semibold hover:bg-[#00F0FF]/90 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Buy New Ticket
          </button>
        </div>

        {/* Bottom Chips */}
        <div
          ref={chipsRef}
          className="lg:absolute mt-auto lg:mt-0 px-4 lg:px-0 pb-6 lg:pb-0 flex flex-wrap gap-2 lg:gap-4"
          style={{
            left: '7vw',
            right: '7vw',
            bottom: '7vh',
          }}
        >
          <div className="chip flex items-center gap-2 text-xs lg:text-sm">
            <CreditCard className="w-3 h-3 lg:w-4 lg:h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Instant purchase</span>
          </div>
          <div className="chip flex items-center gap-2 text-xs lg:text-sm">
            <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Auto-renew</span>
          </div>
          <div className="chip flex items-center gap-2 text-xs lg:text-sm">
            <History className="w-3 h-3 lg:w-4 lg:h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Trip history</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QRTicketSection;
