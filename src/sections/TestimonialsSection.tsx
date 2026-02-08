import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Quote, Users, Clock, Shield } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface TestimonialsSectionProps {
  className?: string;
}

const TestimonialsSection = ({ className = '' }: TestimonialsSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.fromTo(
        headingRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards reveal
      const cards = cardsRef.current?.querySelectorAll('.testimonial-card');
      if (cards) {
        cards.forEach((card, index) => {
          gsap.fromTo(
            card,
            { y: 40, opacity: 0, scale: 0.98 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.6,
              delay: index * 0.1,
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }

      // Stats reveal
      const statItems = statsRef.current?.querySelectorAll('.stat-item');
      if (statItems) {
        statItems.forEach((item, index) => {
          gsap.fromTo(
            item,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              delay: index * 0.08,
              scrollTrigger: {
                trigger: statsRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const testimonials = [
    {
      quote:
        "I actually get a seat now—just by checking the crowd before I leave. It's changed my daily commute completely.",
      author: 'Rahul M.',
      role: 'Daily Commuter, Andheri',
      rating: 5,
    },
    {
      quote:
        "QR tickets saved me during rush hour. No more fumbling for change or waiting in long queues.",
      author: 'Priya S.',
      role: 'Student, Dadar',
      rating: 5,
    },
    {
      quote:
        "The alternate route feature cut my travel time by 15 minutes. I can now spend more time with my family.",
      author: 'Amit K.',
      role: 'Professional, Thane',
      rating: 5,
    },
  ];

  const stats = [
    { value: '2.5M+', label: 'QR scans', icon: Users },
    { value: '4.8★', label: 'App rating', icon: Star },
    { value: '30s', label: 'Update interval', icon: Clock },
    { value: '24/7', label: 'Coverage', icon: Shield },
  ];

  return (
    <section
      ref={sectionRef}
      className={`relative py-24 lg:py-32 ${className}`}
      style={{ background: '#070A12' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16">
          <h2 className="headline-lg text-[#F4F6FF]">
            Built for Mumbai. <span className="text-[#00F0FF]">Loved by commuters.</span>
          </h2>
        </div>

        {/* Testimonial Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card card-solid p-6 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-[#00F0FF]/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]"
                  />
                ))}
              </div>

              <p className="text-[#F4F6FF] mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-[#00F0FF]">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F4F6FF]">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-[#A7B0C8]">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-item p-6 rounded-2xl bg-white/5 text-center"
            >
              <stat.icon className="w-6 h-6 text-[#00F0FF] mx-auto mb-3" />
              <p className="text-3xl font-bold text-[#F4F6FF] mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-[#A7B0C8]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
