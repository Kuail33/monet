
import React from 'react';
import { Icons } from '../constants';
import { PixelatedSpark } from './PixelatedSpark';

interface LandingPageProps {
  onStart: (tab: string) => void;
  onLogin: () => void;
}
export const LandingPage = ({ onStart, onLogin }: LandingPageProps) => {
  return (
    <div className="space-y-40">
      {/* Hero Section */}
      <section className="text-center py-20 relative max-w-5xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="relative">
             <div className="w-12 h-12 opacity-80">
               <PixelatedSpark />
             </div>
          </div>
        </div>

        <h1 className="flex flex-col items-center tracking-tight mb-10">
          <span className="serif-italic font-normal text-4xl md:text-5xl text-[#121317] leading-[1.1] italic">
            Authenticated - Embedded
          </span>
          <span className="extended-bold text-5xl md:text-6xl text-[#121317] leading-[1] tracking-[-0.04em] mt-2">
            protect what you've made
          </span>
        </h1>
        
        <p className="cinetype-light text-lg md:text-xl text-[#6B6F76] max-w-2xl mx-auto leading-relaxed mt-4 mb-16 tracking-[0.01em] opacity-90">
          Invisible proof of authorship, embedded at creation and verifiable at any time
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-4">
          <div className="btn-wrapper relative">
            <div className="btn-bracket-container">
              <button 
                onClick={onLogin}
                className="btn-bracket px-14 py-6 text-base font-bold"
              >
                Get started
              </button>
              <div className="corner-bottom-left"></div>
              <div className="corner-bottom-right"></div>
            </div>
          </div>
          
          <button 
            onClick={() => onStart('verify')}
            className="px-14 py-6 bg-white/40 hover:bg-white/80 text-[#121317] rounded-sm font-bold text-sm border border-black/10 transition-all w-full sm:w-auto shadow-sm backdrop-blur-sm"
          >
            Verify
          </button>
        </div>
      </section>

      {/* Feature Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto px-4 pb-20">
        {[
          {
            title: "Authorship Proof",
            desc: "Embed an unforgeable identity signature directly into media binaries. Cryptographically secure.",
            icon: <Icons.CheckCircle />
          },
          {
            title: "Tamper Detection",
            desc: "Our engine detects byte-level deviations. Detect unauthorized re-encodings with extreme precision.",
            icon: <Icons.AlertTriangle />
          },
          {
            title: "Human Explanation",
            desc: "Gemini-driven reasoning translates hash data into intuitive forensic reports for everyone.",
            icon: <Icons.Layout />
          }
        ].map((f, i) => (
          <div key={i} className="space-y-6 group">
            <div className="w-12 h-12 bg-white border border-black/5 rounded-xl flex items-center justify-center text-[#121317] group-hover:bg-[#121317] group-hover:text-white transition-all duration-300 shadow-sm">
              {f.icon}
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-[#121317] uppercase tracking-wide">{f.title}</h3>
              <p className="text-sm text-[#6B6F76] font-medium leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="text-center py-20">
        <p className="text-[10px] font-bold text-[#6B6F76] uppercase tracking-[0.4em] opacity-60">Conversational self-serve platform</p>
      </section>
    </div>
  );
};
