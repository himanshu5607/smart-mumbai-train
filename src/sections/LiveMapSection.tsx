import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Navigation, Clock, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface LiveMapSectionProps {
  className?: string;
}

const LiveMapSection = ({ className = '' }: LiveMapSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const leftBlockRef = useRef<HTMLDivElement>(null);
  const mapCardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
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
        mapCardRef.current,
        { x: '55vw', opacity: 0, scale: 0.97 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      // SVG path draw animation
      const paths = svgRef.current?.querySelectorAll('.route-path');
      if (paths) {
        paths.forEach((path) => {
          const length = (path as SVGPathElement).getTotalLength?.() || 1000;
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        });
        scrollTl.to(
          paths,
          { strokeDashoffset: 0, stagger: 0.05, ease: 'none' },
          0.05
        );
      }

      // Train dots
      const trainDots = svgRef.current?.querySelectorAll('.train-dot');
      if (trainDots) {
        scrollTl.fromTo(
          trainDots,
          { opacity: 0 },
          { opacity: 1, stagger: 0.03, ease: 'none' },
          0.2
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

      // SETTLE (30%-70%): Hold position

      // EXIT (70%-100%)
      scrollTl.fromTo(
        leftBlockRef.current,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        mapCardRef.current,
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const legendItems = [
    { name: 'Western', color: '#00F0FF' },
    { name: 'Central', color: '#F59E0B' },
    { name: 'Harbour', color: '#10B981' },
    { name: 'Metro', color: '#8B5CF6' },
  ];

  return (
    <section
      ref={sectionRef}
      className={`section-pinned ${className}`}
      style={{ background: '#070A12' }}
    >
      {/* Background Grid Texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {/* Left Info Panel */}
        <div
          ref={leftBlockRef}
          className="absolute"
          style={{ left: '7vw', top: '18vh', width: '40vw' }}
        >
          <h2 className="headline-lg text-[#F4F6FF]">
            See the city <span className="text-[#00F0FF]">move.</span>
          </h2>
          <p className="body-text text-[#A7B0C8] mt-6">
            A live map of trains and metro positions across the network—so you
            know exactly what's arriving, where, and when.
          </p>
        </div>

        {/* Right Map Card */}
        <div
          ref={mapCardRef}
          className="absolute card-solid p-6"
          style={{
            right: '7vw',
            top: '12vh',
            width: '46vw',
            height: '72vh',
          }}
        >
          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-[#A7B0C8]">{item.name}</span>
              </div>
            ))}
          </div>

          {/* Map SVG */}
          <div className="relative flex-1 h-[calc(100%-100px)] rounded-xl bg-[#0B0F1C] overflow-hidden">
            <svg
              ref={svgRef}
              viewBox="0 0 400 300"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Western Line */}
              <path
                className="route-path"
                d="M 50 150 Q 100 150 150 140 Q 200 130 250 120 Q 300 110 350 100"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Central Line */}
              <path
                className="route-path"
                d="M 50 180 Q 100 180 150 175 Q 200 170 250 165 Q 300 160 350 155"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Harbour Line */}
              <path
                className="route-path"
                d="M 100 220 Q 150 200 200 180 Q 250 160 300 140"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Metro Line 1 */}
              <path
                className="route-path"
                d="M 80 80 Q 120 100 160 120 Q 200 140 240 160"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Metro Line 3 */}
              <path
                className="route-path"
                d="M 200 50 Q 220 90 240 130 Q 260 170 280 210"
                fill="none"
                stroke="#EC4899"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Station dots */}
              <circle cx="100" cy="150" r="4" fill="#F4F6FF" />
              <circle cx="200" cy="135" r="4" fill="#F4F6FF" />
              <circle cx="300" cy="115" r="4" fill="#F4F6FF" />
              <circle cx="100" cy="180" r="4" fill="#F4F6FF" />
              <circle cx="200" cy="172" r="4" fill="#F4F6FF" />
              <circle cx="300" cy="162" r="4" fill="#F4F6FF" />
              <circle cx="150" cy="200" r="4" fill="#F4F6FF" />
              <circle cx="250" cy="160" r="4" fill="#F4F6FF" />
              <circle cx="120" cy="100" r="4" fill="#F4F6FF" />
              <circle cx="200" cy="140" r="4" fill="#F4F6FF" />
              <circle cx="220" cy="90" r="4" fill="#F4F6FF" />
              <circle cx="260" cy="170" r="4" fill="#F4F6FF" />

              {/* Moving train dots */}
              <circle
                className="train-dot drift"
                cx="150"
                cy="145"
                r="6"
                fill="#00F0FF"
              />
              <circle
                className="train-dot drift"
                style={{ animationDelay: '2s' }}
                cx="250"
                cy="125"
                r="6"
                fill="#00F0FF"
              />
              <circle
                className="train-dot drift"
                style={{ animationDelay: '4s' }}
                cx="180"
                cy="178"
                r="6"
                fill="#F59E0B"
              />
              <circle
                className="train-dot drift"
                style={{ animationDelay: '1s' }}
                cx="280"
                cy="162"
                r="6"
                fill="#F59E0B"
              />
              <circle
                className="train-dot drift"
                style={{ animationDelay: '3s' }}
                cx="180"
                cy="190"
                r="6"
                fill="#10B981"
              />
              <circle
                className="train-dot drift"
                style={{ animationDelay: '5s' }}
                cx="140"
                cy="110"
                r="6"
                fill="#8B5CF6"
              />
            </svg>

            {/* Map Overlay Info */}
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#070A12]/80 backdrop-blur-sm">
              <p className="text-xs text-[#A7B0C8] text-center">
                <MapPin className="w-3 h-3 inline mr-1" />
                Tap a train for ETA and crowd info
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center justify-around">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#00F0FF]" />
              <span className="text-xs text-[#A7B0C8]">Live positions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00F0FF]" />
              <span className="text-xs text-[#A7B0C8]">ETA at platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00F0FF]" />
              <span className="text-xs text-[#A7B0C8]">Crowd overlay</span>
            </div>
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
            <Navigation className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Live positions</span>
          </div>
          <div className="chip flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">ETA at platform</span>
          </div>
          <div className="chip flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-[#F4F6FF]">Crowd overlay</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveMapSection;
