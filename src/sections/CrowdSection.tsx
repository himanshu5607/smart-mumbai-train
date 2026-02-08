import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, Clock, MapPin, Activity } from 'lucide-react';
import { crowdService } from '@/services/crowdService';
import type { CrowdData } from '@/lib/supabase';

gsap.registerPlugin(ScrollTrigger);

interface CrowdSectionProps {
  className?: string;
}

const CrowdSection = ({ className = '' }: CrowdSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const leftBlockRef = useRef<HTMLDivElement>(null);
  const cardARef = useRef<HTMLDivElement>(null);
  const cardBRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const [crowdData, setCrowdData] = useState<CrowdData[]>([]);

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
        cardARef.current,
        { x: '55vw', opacity: 0, scale: 0.96 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        cardBRef.current,
        { x: '55vw', y: '10vh', opacity: 0 },
        { x: 0, y: 0, opacity: 1, ease: 'none' },
        0.08
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
        [cardARef.current, cardBRef.current],
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

  // Load crowd data
  useEffect(() => {
    loadCrowdData();
    
    // Subscribe to real-time updates
    const subscription = crowdService.subscribeToCrowdUpdates((data) => {
      setCrowdData(prev => {
        const filtered = prev.filter(c => c.id !== data.id);
        return [...filtered, data].slice(0, 4);
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadCrowdData = async () => {
    try {
      const data = await crowdService.getCrowdData('Western Line');
      setCrowdData(data.slice(0, 4));
    } catch (err) {
      console.error('Failed to load crowd data:', err);
    }
  };

  const coachData = crowdData.length > 0 
    ? crowdData.map(c => ({
        range: `C${c.coach_number}`,
        level: c.occupancy_level.charAt(0).toUpperCase() + c.occupancy_level.slice(1),
        color: c.occupancy_level === 'low' ? '#10B981' : c.occupancy_level === 'moderate' ? '#F59E0B' : '#EF4444',
      }))
    : [
      { range: 'C1–C3', level: 'Low', color: '#10B981' },
      { range: 'C4–C6', level: 'Moderate', color: '#F59E0B' },
      { range: 'C7–C9', level: 'High', color: '#EF4444' },
      { range: 'C10–C12', level: 'Moderate', color: '#F59E0B' },
    ];

  const currentCrowd = crowdData[0];

  return (
    <section
      ref={sectionRef}
      id="crowd"
      className={`section-pinned ${className}`}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/crowd_interior.jpg)',
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
            See occupancy <span className="text-[#00F0FF]">before</span> you board.
          </h2>
          <p className="body-text text-[#A7B0C8] mt-4 lg:mt-6">
            We combine QR validations, train load sensors, and schedule data to show
            live crowd levels—so you can choose the next coach or the next train.
          </p>
        </div>

        {/* Right Cards */}
        <div className="lg:absolute lg:right-[7vw] lg:top-[16vh] w-full max-w-[400px] mx-4 lg:mx-0 mt-4 lg:mt-0 flex flex-col gap-4">
          {/* Right Card A - Current Status */}
          <div
            ref={cardARef}
            className="card-glass p-4 lg:p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#F4F6FF] font-medium truncate">
                {currentCrowd ? `${currentCrowd.line} · ${currentCrowd.direction}` : 'Western Line · Virar → Churchgate'}
              </span>
              <Activity className="w-5 h-5 text-[#00F0FF] flex-shrink-0" />
            </div>

            <div className="flex items-center gap-4 mt-4 lg:mt-6">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 lg:w-8 lg:h-8 text-[#F59E0B]" />
              </div>
              <div className="min-w-0">
                <p className="text-xl lg:text-2xl font-bold text-[#F59E0B] pulse-slow truncate">
                  {currentCrowd ? `Coach ${currentCrowd.coach_number}: ${currentCrowd.occupancy_level.charAt(0).toUpperCase() + currentCrowd.occupancy_level.slice(1)}` : 'Coach 5: Moderate'}
                </p>
                <p className="text-sm text-[#A7B0C8] mt-1">Recommended for boarding</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 lg:mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#A7B0C8]" />
                <span className="text-sm text-[#A7B0C8]">Platform {currentCrowd?.platform || '3'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-sm text-[#00F0FF]">Arriving in {currentCrowd?.next_arrival || '2 min'}</span>
              </div>
            </div>
          </div>

          {/* Right Card B - Crowd by Coach */}
          <div
            ref={cardBRef}
            className="card-solid p-4 lg:p-5 max-h-[35vh] overflow-y-auto"
          >
            <h3 className="text-base lg:text-lg font-semibold text-[#F4F6FF] mb-4">
              Crowd by Coach
            </h3>

            <div className="space-y-2 lg:space-y-3">
              {coachData.map((coach, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 lg:p-3 rounded-xl bg-white/5"
                >
                  <span className="text-sm text-[#A7B0C8] font-mono">
                    {coach.range}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: coach.color }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: coach.color }}
                    >
                      {coach.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 lg:mt-4 p-2 lg:p-3 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/20">
              <p className="text-xs text-[#00F0FF] text-center">
                Tap any coach to see detailed occupancy
              </p>
            </div>
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
            <Clock className="w-3 h-3 lg:w-4 lg:h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Updated every 30s</span>
          </div>
          <div className="chip flex items-center gap-2 text-xs lg:text-sm">
            <Activity className="w-3 h-3 lg:w-4 lg:h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Platform sensors</span>
          </div>
          <div className="chip flex items-center gap-2 text-xs lg:text-sm">
            <Users className="w-3 h-3 lg:w-4 lg:h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Coach-level detail</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CrowdSection;
