import React from 'react';
import { Icons } from '../constants';
import { PixelatedSpark } from './PixelatedSpark';

interface LandingPageProps {
  onStart: (tab: string) => void;
  onLogin: () => void;
  isLoggedIn: boolean;
}
export const LandingPage = ({ onStart, onLogin, isLoggedIn }: LandingPageProps) => {
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
          Invisible AI forensics that authenticate your work
          <br />
          In a world of copies, prove the original
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

      <section className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto px-8 py-16 border border-black/10 rounded-lg animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in delay-500">
        
        {/* Features Section */}
        {[
          {
            title: <span className="serif-italic"> {`Authorship Proof`} </span>,
            desc: "Embed an unforgeable identity signature directly into media binaries. Cryptographically secure",
            icon: <Icons.CheckCircle />
          },
          {
            title: <span className="serif-italic"> {`Tamper Detection`} </span>,
            desc: "Our engine detects byte-level deviations. Detect unauthorized re-encodings with extreme precision",
            icon: <Icons.AlertTriangle />
          },
          {
            title: <span className="serif-italic"> {`Human Explanation`} </span>,
            desc: "Gemini-driven reasoning translates hash data into intuitive forensic reports for everyone",
            icon: <Icons.Layout />
          }
        ].map((f, i) => (
      <div key={i} className="space-y-6 group animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in" 
      style={{ animationDelay: `${600 + i * 100}ms` }}>

        <div className="w-12 h-12 bg-[#F6EAEA] border border-[rgba(0,0,0,0.06)] rounded-xl flex items-center justify-center 
        text-[#121317] hover:bg-white hover:border-[#E5BABA] transition-all ease-in duration-300 shadow-sm 
        animate-in zoom-in-95 duration-400 ease-in" 
        style={{ animationDelay: `${700 + i * 100}ms` }}>
          {f.icon}
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold text-[#121317] tracking-wide italic">{f.title}</h3>
          <p className="text-sm text-[#6B6F76] leading-relaxed" style={{ fontFamily: "'Open Sauce One', sans-serif", fontWeight: 300 }}>{f.desc}</p>
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
