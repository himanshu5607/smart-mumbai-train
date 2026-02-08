import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, ArrowRight, Train, Clock, Users, Navigation, Layers } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface RoutingSectionProps {
  className?: string;
}

const RoutingSection = ({ className = '' }: RoutingSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const leftBlockRef = useRef<HTMLDivElement>(null);
  const routeCardRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

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
        routeCardRef.current,
        { x: '55vw', opacity: 0, scale: 0.97 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      const steps = stepsRef.current?.querySelectorAll('.route-step');
      if (steps) {
        scrollTl.fromTo(
          steps,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.03, ease: 'none' },
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
        routeCardRef.current,
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

  const routeSteps = [
    {
      icon: Train,
      title: 'Board Western Line (Fast)',
      detail: 'Platform 3 · Andheri',
      time: '2 min',
    },
    {
      icon: ArrowRight,
      title: 'Change at Dadar',
      detail: 'Walk to Platform 5',
      time: '5 min',
    },
    {
      icon: Train,
      title: 'Central Line to CSMT',
      detail: 'Platform 5 · Slow Train',
      time: '31 min',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="routes"
      className={`section-pinned ${className}`}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/station_corridor.jpg)',
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
      <div className="relative z-10 w-full h-full">
        {/* Left Info Panel */}
        <div
          ref={leftBlockRef}
          className="absolute"
          style={{ left: '7vw', top: '18vh', width: '40vw' }}
        >
          <h2 className="headline-lg text-[#F4F6FF]">
            Routes that <span className="text-[#00F0FF]">avoid</span> the rush.
          </h2>
          <p className="body-text text-[#A7B0C8] mt-6">
            Get options ranked by time and comfort. We suggest less-crowded trains,
            platform changes, and metro connections—updated live.
          </p>
        </div>

        {/* Right Route Card */}
        <div
          ref={routeCardRef}
          className="absolute card-glass p-6"
          style={{
            right: '7vw',
            top: '16vh',
            width: '36vw',
            height: '62vh',
          }}
        >
          {/* Route Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#00F0FF]" />
              </div>
              <div>
                <p className="text-xs text-[#A7B0C8]">From</p>
                <p className="text-sm font-semibold text-[#F4F6FF]">Andheri</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#A7B0C8]" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/20 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-[#00F0FF]" />
              </div>
              <div>
                <p className="text-xs text-[#A7B0C8]">To</p>
                <p className="text-sm font-semibold text-[#F4F6FF]">CSMT</p>
              </div>
            </div>
          </div>

          {/* Save Time Badge */}
          <div className="flex justify-center mb-6">
            <div className="px-4 py-2 rounded-full bg-[#10B981]/20 border border-[#10B981]/30">
              <span className="text-sm font-semibold text-[#10B981]">
                Save 12 min
              </span>
            </div>
          </div>

          {/* Route Steps */}
          <div ref={stepsRef} className="space-y-4">
            {routeSteps.map((step, index) => (
              <div
                key={index}
                className="route-step flex items-start gap-4 p-4 rounded-xl bg-white/5"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00F0FF]/20 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-[#00F0FF]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#F4F6FF]">{step.title}</p>
                  <p className="text-xs text-[#A7B0C8] mt-1">{step.detail}</p>
                </div>
                <span className="text-xs text-[#00F0FF] font-mono">{step.time}</span>
              </div>
            ))}
          </div>

          {/* Route Summary */}
          <div className="mt-6 p-4 rounded-xl bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm text-[#A7B0C8]">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-sm text-[#00F0FF]">ETA 38 min</span>
              </div>
            </div>
            <button className="text-xs text-[#00F0FF] hover:underline">
              View alternatives
            </button>
          </div>
        </div>

        {/* Bottom Chips */}
        <div
          ref={chipsRef}
          className="absolute flex gap-4"
          style={{
            left: '7vw',
            right: '7vw',
            bottom: '7vh',
          }}
        >
          <div className="chip flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Multi-mode</span>
          </div>
          <div className="chip flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Live ETA</span>
          </div>
          <div className="chip flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Platform hints</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoutingSection;
