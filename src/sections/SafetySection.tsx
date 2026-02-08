import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AlertTriangle, Bell, MapPin, Phone, CheckCircle, Flag } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface SafetySectionProps {
  className?: string;
}

const SafetySection = ({ className = '' }: SafetySectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const leftBlockRef = useRef<HTMLDivElement>(null);
  const alertCardRef = useRef<HTMLDivElement>(null);
  const pingRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return;
    }

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
        alertCardRef.current,
        { x: '55vw', opacity: 0, scale: 0.97 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
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

      // SETTLE (30%-70%): Hold position

      // EXIT (70%-100%)
      scrollTl.fromTo(
        leftBlockRef.current,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        alertCardRef.current,
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

  return (
    <section
      ref={sectionRef}
      id="safety"
      className={`section-pinned ${className}`}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/station_signage.jpg)',
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
      <div className="relative z-10 w-full h-full lg:block flex flex-col gap-10 px-6 pt-24 pb-20 lg:px-0 lg:pt-0 lg:pb-0">
        {/* Left Info Panel */}
        <div
          ref={leftBlockRef}
          className="relative lg:absolute lg:left-[7vw] lg:top-[18vh] lg:w-[40vw] w-full max-w-2xl"
        >
          <h2 className="headline-lg text-[#F4F6FF]">
            Stay safe. <span className="text-[#00F0FF]">Stay informed.</span>
          </h2>
          <p className="body-text text-[#A7B0C8] mt-6">
            Get alerts for delays, crowd spikes, and service changes. One-tap SOS
            and clear exit guides when it matters most.
          </p>
        </div>

        {/* Right Alert Card */}
        <div
          ref={alertCardRef}
          className="relative lg:absolute lg:right-[7vw] lg:top-[18vh] w-full max-w-lg lg:w-[34vw] card-glass p-6 lg:h-[52vh] lg:overflow-y-auto"
        >
          {/* Alert Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
              </div>
              {/* Ping Ring */}
              <div
                ref={pingRef}
                className="absolute inset-0 rounded-xl border-2 border-[#F59E0B] ping-ring"
              />
            </div>
            <div>
              <p className="text-lg font-semibold text-[#F4F6FF]">
                Crowd building at Dadar
              </p>
              <p className="text-sm text-[#A7B0C8]">2 minutes ago</p>
            </div>
          </div>

          {/* Alert Body */}
          <div className="p-4 rounded-xl bg-white/5 mb-6">
            <p className="text-sm text-[#A7B0C8]">
              Consider alternate route via{' '}
              <span className="text-[#00F0FF]">Metro Line 3</span> to avoid delays.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30 transition-colors">
              <MapPin className="w-4 h-4 text-[#00F0FF]" />
              <span className="text-sm text-[#00F0FF]">View Route</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/30 transition-colors">
              <CheckCircle className="w-4 h-4 text-[#10B981]" />
              <span className="text-sm text-[#10B981]">I'm Safe</span>
            </button>
          </div>

          {/* SOS Button */}
          <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 mb-4">
            <button className="w-full flex items-center justify-center gap-2">
              <Phone className="w-5 h-5 text-[#EF4444]" />
              <span className="text-sm font-semibold text-[#EF4444]">
                Emergency SOS
              </span>
            </button>
          </div>

          {/* Report Issue */}
          <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <Flag className="w-4 h-4 text-[#A7B0C8]" />
            <span className="text-sm text-[#A7B0C8]">Report an issue</span>
          </button>
        </div>

        {/* Bottom Chips */}
        <div
          ref={chipsRef}
          className="hidden lg:flex absolute gap-4"
          style={{
            left: '7vw',
            right: '7vw',
            bottom: '7vh',
          }}
        >
          <div className="chip flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Instant alerts</span>
          </div>
          <div className="chip flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">SOS ready</span>
          </div>
          <div className="chip flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Exit guides</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetySection;
