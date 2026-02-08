import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, Mail, ArrowRight, Train } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CTASectionProps {
  className?: string;
  onGetAppClick: () => void;
}

const CTASection = ({ className = '', onGetAppClick }: CTASectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      const badges = badgesRef.current?.querySelectorAll('.store-badge');
      if (badges) {
        gsap.fromTo(
          badges,
          { y: 12, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            scrollTrigger: {
              trigger: badgesRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className={`relative ${className}`}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/train_motion.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(7,10,18,0.7) 0%, rgba(7,10,18,0.9) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 py-16 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
          <div ref={contentRef} className="text-center">
            <h2 className="headline-lg text-[#F4F6FF] mb-4 lg:mb-6">
              Download Smart Rail Mumbai
            </h2>
            <p className="body-text text-[#A7B0C8] mb-6 lg:mb-8 max-w-2xl mx-auto">
              Real-time crowds. QR tickets. Smarter routes. Ready when you are.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 lg:gap-4 mb-8 lg:mb-10">
              <button 
                onClick={onGetAppClick}
                className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 text-sm lg:text-base px-6 lg:px-8 py-3 lg:py-4"
              >
                <Download className="w-5 h-5" />
                Get the App
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full sm:w-auto btn-outline flex items-center justify-center gap-2 text-sm lg:text-base px-6 lg:px-8 py-3 lg:py-4">
                <Mail className="w-5 h-5" />
                Contact for Enterprise
              </button>
            </div>

            {/* Store Badges */}
            <div
              ref={badgesRef}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 lg:gap-4"
            >
              <div className="store-badge flex items-center gap-3 px-5 lg:px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer w-full sm:w-auto justify-center">
                <svg
                  className="w-7 h-7 lg:w-8 lg:h-8 text-[#F4F6FF]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <p className="text-xs text-[#A7B0C8]">GET IT ON</p>
                  <p className="text-sm font-semibold text-[#F4F6FF]">
                    Google Play
                  </p>
                </div>
              </div>

              <div className="store-badge flex items-center gap-3 px-5 lg:px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer w-full sm:w-auto justify-center">
                <svg
                  className="w-7 h-7 lg:w-8 lg:h-8 text-[#F4F6FF]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.37 12.36,4.26 13,3.5Z" />
                </svg>
                <div className="text-left">
                  <p className="text-xs text-[#A7B0C8]">Download on the</p>
                  <p className="text-sm font-semibold text-[#F4F6FF]">
                    App Store
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 lg:mt-20 pt-8 lg:pt-10 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <Train className="w-5 h-5 lg:w-6 lg:h-6 text-[#00F0FF]" />
                <span className="font-semibold text-[#F4F6FF] text-sm lg:text-base">
                  Smart Rail Mumbai
                </span>
              </div>

              {/* Links */}
              <div className="flex items-center gap-4 lg:gap-6 flex-wrap justify-center">
                <a
                  href="#"
                  className="text-sm text-[#A7B0C8] hover:text-[#00F0FF] transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-sm text-[#A7B0C8] hover:text-[#00F0FF] transition-colors"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="text-sm text-[#A7B0C8] hover:text-[#00F0FF] transition-colors"
                >
                  Help
                </a>
                <a
                  href="#"
                  className="text-sm text-[#A7B0C8] hover:text-[#00F0FF] transition-colors"
                >
                  Contact
                </a>
              </div>

              {/* Copyright */}
              <p className="text-xs text-[#A7B0C8]">
                © 2026 Smart Rail Mumbai. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default CTASection;
