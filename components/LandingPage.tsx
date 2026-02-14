import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';

interface LandingPageProps {
  onStart: (tab: string) => void;
  onLogin: () => void;
  isLoggedIn: boolean;
}
export const LandingPage = ({ onStart, onLogin, isLoggedIn }: LandingPageProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
     <div className="space-y-40 animate-in fade-in duration-700 ease-in">
      
      {/* Hero Section */}
      <section className="text-center py-20 relative max-w-5xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700 ease-in">
        <div className="flex justify-center mb-6 animate-in fade-in zoom-in-95 duration-500 ease-in delay-100 group cursor-pointer">
          <div className="relative">
             <img src="/icons/icon.png" alt="Logo" className="w-16 h-16 object-contain opacity-50 group-hover:opacity-80 transition-opacity ease-in duration-300" />
          </div>
        </div>

  <h1 className="flex flex-col items-center tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-2 duration-600 ease-in delay-200">
          <span className="serif-italic font-normal text-4xl md:text-5xl text-[#121317] leading-[1.1] italic">
            Invisible proof of authorship
          </span>
          <span className="open-sauce-bold text-5xl md:text-6xl text-[#121317] leading-[1] tracking-[-0.04em] mt-2">
            protect what you've created
          </span>
        </h1>
        
        <p className="cinetype-light md:text-[17px] text-[#6B6F76] max-w-3xl mx-auto leading-relaxed mt-1 mb-8 tracking-[0.01em] opacity-90 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in delay-300">
          In a world of copies, prove the original
          
          <br />
          AI powered forensics that authenticate your work
        </p>
        
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in delay-400">
          <div className="btn-wrapper relative">
            <div className="btn-bracket-container">
              <button 
                onClick={isLoggedIn ? () => onStart('protect') : onLogin}
                className="btn-bracket px-10 py-4 text-base w-[180px]"
              >
                {isLoggedIn ? 'Imprint' : 'Get started'}
              </button>
              <div className="corner-bottom-left"></div>
              <div className="corner-bottom-right"></div>
            </div>
          </div>
          
          <button 
            onClick={() => onStart('verify')}
            className="px-10 py-4 bg-white/40 hover:bg-white/80 text-[#121317] rounded-sm text-base border border-black/10 transition-all ease-in shadow-sm backdrop-blur-sm w-[180px]"
          >
            Verify 
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto px-8 py-16 border border-black/10 rounded-lg animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in delay-500"
      >
        {[
          {
            title: "Immutable Authorship",
            desc: "Embed a cryptographically secure, unforgeable identity signature directly into your media",
            icon: <Icons.CheckCircle />
          },
          {
            title: "Tamper Detection",
            desc: "Detect byte-level deviations and unauthorized re-encodings with forensic precision",
            icon: <Icons.AlertTriangle />
          },
          {
            title: "Transparency",
            desc: "AI-powered analysis translates complex hash data into clear, intuitive forensic reports",
            icon: <Icons.Layout />
          }
        ].map((f, i) => (
          <div 
            key={i} 
            className={`flex flex-col items-center text-center space-y-3 group transition-all duration-500 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{ transitionDelay: isVisible ? `${i * 150}ms` : '0ms' }}
          >
            {/* Icon */}
            <div 
              className={`w-12 h-12 bg-[#F6EAEA] border border-[rgba(0,0,0,0.06)] rounded-xl flex items-center justify-center text-[#121317] hover:bg-white hover:border-[#E5BABA] transition-all ease-in duration-300 shadow-sm ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ transitionDelay: isVisible ? `${100 + i * 150}ms` : '0ms' }}
            >
              {f.icon}
            </div>

            {/* Title */}
            <h3 
              className={`text-xl font-bold text-[#121317] tracking-wide italic serif-italic transition-all duration-500 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: isVisible ? `${200 + i * 150}ms` : '0ms' }}
            >
              {f.title}
            </h3>

            {/* Description */}
            <p 
              className={`text-sm text-[#6B6F76] leading-relaxed transition-all duration-500 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ fontFamily: "'Open Sauce One', sans-serif", fontWeight: 300, transitionDelay: isVisible ? `${300 + i * 150}ms` : '0ms' }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </section>

    </div>
  );
};
