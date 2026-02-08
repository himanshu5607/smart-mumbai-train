import { useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, QrCode, Route, ArrowRight, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  className?: string;
  onGetAppClick: () => void;
}

const HeroSection = ({ className = '', onGetAppClick }: HeroSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  // Auto-play entrance animation on load
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // Background entrance
      tl.fromTo(
        bgRef.current,
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 1.1 }
      );

      // Headline words entrance
      const words = headlineRef.current?.querySelectorAll('.word');
      if (words) {
        tl.fromTo(
          words,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.06 },
          '-=0.7'
        );
      }

      // Subheadline + CTAs
      tl.fromTo(
        subheadRef.current,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      );

      tl.fromTo(
        ctaRef.current,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      );

      // Hero card
      tl.fromTo(
        cardRef.current,
        { x: '10vw', opacity: 0, scale: 0.98 },
        { x: 0, opacity: 1, scale: 1, duration: 0.9 },
        '-=0.7'
      );

      // Bottom chips
      const chips = chipsRef.current?.querySelectorAll('.chip');
      if (chips) {
        tl.fromTo(
          chips,
          { y: '6vh', opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
          '-=0.5'
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Scroll-driven exit animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            // Reset all elements to visible when scrolling back
            gsap.set([headlineRef.current, subheadRef.current, ctaRef.current], {
              x: 0,
              opacity: 1,
            });
            gsap.set(cardRef.current, { x: 0, opacity: 1 });
            const chips = chipsRef.current?.querySelectorAll('.chip');
            if (chips && chips.length > 0) {
              gsap.set(chips, { y: 0, opacity: 1 });
            }
            gsap.set(bgRef.current, { scale: 1, y: 0 });
          },
        },
      });

      // EXIT (70%-100%)
      scrollTl.fromTo(
        [headlineRef.current, subheadRef.current, ctaRef.current],
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        cardRef.current,
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
        { scale: 1.08, y: '-6vh' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className={`section-pinned ${className}`}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/hero_train_night.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(7,10,18,0.35) 0%, rgba(7,10,18,0.75) 65%, rgba(7,10,18,0.92) 100%)',
          }}
        />
      </div>

      {/* Accent Glow Behind Card */}
      <div
        className="absolute pointer-events-none hidden lg:block"
        style={{
          right: '6vw',
          top: '16vh',
          width: '34vw',
          height: '62vh',
          background: 'radial-gradient(circle at 70% 30%, rgba(0,240,255,0.18), transparent 55%)',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col lg:block">
        {/* Left Headline Block */}
        <div
          className="lg:absolute px-6 pt-24 lg:pt-0 lg:px-0 lg:left-[7vw] lg:top-[18vh] lg:w-[46vw]"
        >
          <div ref={headlineRef}>
            <h1 className="headline-xl text-[#F4F6FF]">
              <span className="word inline-block">Ride</span>{' '}
              <span className="word inline-block">the</span>{' '}
              <span className="word inline-block">City.</span>{' '}
              <span className="word inline-block text-[#00F0FF]">Smarter.</span>
            </h1>
          </div>

          <div
            ref={subheadRef}
            className="mt-4 lg:mt-6 lg:w-[38vw]"
          >
            <p className="body-text text-[#A7B0C8]">
              Real-time crowds. QR tickets. Smart routes across Mumbai's suburban
              and metro network.
            </p>
          </div>

          <div ref={ctaRef} className="mt-6 lg:mt-8 flex flex-wrap items-center gap-3 lg:gap-4">
            <button 
              onClick={onGetAppClick}
              className="btn-primary flex items-center gap-2 text-sm lg:text-base"
            >
              Get the App
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="btn-outline flex items-center gap-2 text-sm lg:text-base">
              View Dashboard
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-4 text-xs text-[#A7B0C8]/70">
            Available on Android & iOS. Mumbai Suburban + Metro.
          </p>
        </div>

        {/* Right Hero Card */}
        <div
          ref={cardRef}
          className="lg:absolute mx-4 lg:mx-0 mt-6 lg:mt-0 card-glass p-4 lg:p-6"
          style={{
            right: '6vw',
            top: '16vh',
            width: 'calc(100% - 2rem)',
            maxWidth: '400px',
            height: 'auto',
            minHeight: '400px',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="micro-label text-[#A7B0C8]">Now</span>
            <span className="flex items-center gap-2 text-sm text-[#F4F6FF]">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
              Western Line
            </span>
          </div>

          <div className="mt-6 lg:mt-8">
            <p className="text-sm text-[#A7B0C8] mb-2">Current Crowd Level</p>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 lg:w-8 lg:h-8 text-[#EF4444]" />
              <span className="text-3xl lg:text-4xl font-bold text-[#EF4444]">High</span>
            </div>
          </div>

          <div className="mt-6 lg:mt-8 p-3 lg:p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#A7B0C8]">Next Fast Train</span>
              <span className="text-lg font-semibold text-[#00F0FF]">4 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#A7B0C8]">Coaches</span>
              <span className="text-lg font-semibold text-[#F4F6FF]">12</span>
            </div>
          </div>

          <div className="mt-6 lg:mt-8">
            <p className="text-sm text-[#A7B0C8] mb-3">Coach Occupancy</p>
            <div className="grid grid-cols-6 gap-1.5 lg:gap-2">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`h-7 lg:h-8 rounded-md flex items-center justify-center text-xs font-medium ${
                    i < 3
                      ? 'bg-[#10B981]/20 text-[#10B981]'
                      : i < 6
                      ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                      : i < 9
                      ? 'bg-[#EF4444]/20 text-[#EF4444]'
                      : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 lg:mt-6 p-3 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/20">
            <p className="text-xs text-[#00F0FF] text-center">
              Suggestion: Board Coach 1-3 for less crowd
            </p>
          </div>
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
            <Users className="w-3 h-3 lg:w-4 lg:h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Live occupancy</span>
          </div>
          <div className="chip flex items-center gap-2 text-xs lg:text-sm">
            <QrCode className="w-3 h-3 lg:w-4 lg:h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">QR entry</span>
          </div>
          <div className="chip flex items-center gap-2 text-xs lg:text-sm">
            <Route className="w-3 h-3 lg:w-4 lg:h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Smart reroute</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
