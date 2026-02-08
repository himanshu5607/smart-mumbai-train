import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Train, Check, ArrowRight, Ticket, Bell, Activity } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface NetworkSectionProps {
  className?: string;
}

const NetworkSection = ({ className = '' }: NetworkSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const leftBlockRef = useRef<HTMLDivElement>(null);
  const coverageCardRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
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
        coverageCardRef.current,
        { x: '55vw', opacity: 0, scale: 0.97 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      const listItems = listRef.current?.querySelectorAll('.line-item');
      if (listItems) {
        scrollTl.fromTo(
          listItems,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.02, ease: 'none' },
          0.05
        );
      }

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
        coverageCardRef.current,
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

  const lines = [
    { name: 'Western Line', type: 'suburban', supported: true },
    { name: 'Central Line', type: 'suburban', supported: true },
    { name: 'Harbour Line', type: 'suburban', supported: true },
    { name: 'Metro Line 1', type: 'metro', supported: true },
    { name: 'Metro Line 3', type: 'metro', supported: true },
  ];

  return (
    <section
      ref={sectionRef}
      className={`section-pinned ${className}`}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/station_exterior.jpg)',
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
            Suburban + Metro. <span className="text-[#00F0FF]">One app.</span>
          </h2>
          <p className="body-text text-[#A7B0C8] mt-6">
            Smart Rail Mumbai covers the lines you use daily—integrated timetables,
            unified tickets, and consistent crowd info.
          </p>
        </div>

        {/* Right Coverage Card */}
        <div
          ref={coverageCardRef}
          className="relative lg:absolute lg:right-[7vw] lg:top-[18vh] w-full max-w-lg lg:w-[34vw] card-glass p-6 lg:h-[52vh] lg:overflow-y-auto"
        >
          <h3 className="text-lg font-semibold text-[#F4F6FF] mb-6">
            Network Coverage
          </h3>

          <div ref={listRef} className="space-y-3">
            {lines.map((line, index) => (
              <div
                key={index}
                className="line-item flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      line.type === 'metro'
                        ? 'bg-[#00F0FF]/20'
                        : 'bg-[#F59E0B]/20'
                    }`}
                  >
                    <Train
                      className={`w-4 h-4 ${
                        line.type === 'metro'
                          ? 'text-[#00F0FF]'
                          : 'text-[#F59E0B]'
                      }`}
                    />
                  </div>
                  <span className="text-sm text-[#F4F6FF]">{line.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      line.supported
                        ? 'bg-[#10B981]/20 text-[#10B981]'
                        : 'bg-[#A7B0C8]/20 text-[#A7B0C8]'
                    }`}
                  >
                    {line.supported ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Supported
                      </span>
                    ) : (
                      'Coming Soon'
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30 transition-colors">
            <span className="text-sm text-[#00F0FF]">See all routes</span>
            <ArrowRight className="w-4 h-4 text-[#00F0FF]" />
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
            <Ticket className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Unified fares</span>
          </div>
          <div className="chip flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Interchange alerts</span>
          </div>
          <div className="chip flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Line status</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NetworkSection;
