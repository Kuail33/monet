
import React, { useState, useRef, useEffect } from 'react';
import { APP_NAME, Icons } from '../constants';
import { User } from 'firebase/auth';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn: boolean;
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onSelectDashboardView: (view: 'signed' | 'forensics') => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  isLoggedIn,
  currentUser,
  onLogin, 
  onLogout,
  onSelectDashboardView 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDashboardLink = (view: 'signed' | 'forensics') => {
    onSelectDashboardView(view);
    setActiveTab('dashboard');
    setIsProfileOpen(false);
  };

  // Get user display name and email
  const getUserDisplayName = () => {
    if (!currentUser) return 'User';
    return currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
  };

  const getUserEmail = () => {
    if (!currentUser) return 'user@example.com';
    return currentUser.email || 'user@example.com';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#F7F6F4]/80 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex items-center justify-between border-b border-black/5">
        <div className="flex items-center gap-10">
          <div 
            className="cursor-pointer flex items-center gap-3" 
            onClick={() => setActiveTab('landing')}
          >
            <img src="/icons/icon.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-tighter  text-[#121317] serif-italic">{APP_NAME}</span>
          </div>
          
          {isLoggedIn && (
            <nav className="hidden lg:flex items-center gap-8">
              <button onClick={() => setActiveTab('protect')} className={`nav-link ${activeTab === 'protect' ? 'opacity-100 font-semibold' : ''}`}>
                
                Imprint

              </button>
              
              <button onClick={() => setActiveTab('verify')} className={`nav-link ${activeTab === 'verify' ? 'opacity-100 font-semibold' : ''}`}>
                
                Authenticate
          
              </button>
              <button onClick={() => { onSelectDashboardView('signed'); setActiveTab('dashboard'); }} className={`nav-link ${activeTab === 'dashboard' ? 'opacity-100 font-semibold' : ''}`}>Storage</button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-8">
          {!isLoggedIn ? (
            <>
              <button 
                onClick={onLogin}
                className="text-sm font-medium text-[#2B2D33] hover:text-[#121317] transition-colors ease-in"
              >
                Log in
              </button>
              <div className="btn-wrapper relative">
                <div className="btn-bracket-container">
                  <button 
                    onClick={onLogin}
                    className="btn-bracket"
                  >
                    Get started
                  </button>
                  <div className="corner-bottom-left"></div>
                  <div className="corner-bottom-right"></div>
                </div>
              </div>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-4 cursor-pointer group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-[#6B6F76] uppercase tracking-widest group-hover:text-[#121317] transition-colors ease-in">Creator Account</p>
                  <p className="text-xs font-bold text-[#121317]">{getUserDisplayName()}</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-black/10 bg-white flex items-center justify-center text-xs font-bold shadow-sm group-hover:border-black/30 transition-all ease-in overflow-hidden">
                  {getUserInitials()}
                </div>
              </div>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-white hex-card border border-black/10 shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                  <div className="px-4 py-3 border-b border-black/5 mb-1">
                    <p className="text-xs font-bold text-[#121317]">{getUserDisplayName()}</p>
                    <p className="text-[10px] text-[#6B6F76] font-medium">{getUserEmail()}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleDashboardLink('signed')}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-[#2B2D33] hover:bg-[#F7F6F4] hover:text-[#121317] transition-colors ease-in flex items-center gap-3"
                  >
                    <Icons.Shield />
                    Signed Assets
                  </button>
                  <button 
                    onClick={() => handleDashboardLink('forensics')}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-[#2B2D33] hover:bg-[#F7F6F4] hover:text-[#121317] transition-colors ease-in flex items-center gap-3"
                  >
                    <Icons.Lock />
                    Forensic Logs
                  </button>
                  
                  <div className="h-px bg-black/5 my-1"></div>
                  
                  <a 
                    href="mailto:support@authmark.ai"
                    className="w-full text-left px-4 py-2 text-xs font-bold text-[#2B2D33] hover:bg-[#F7F6F4] hover:text-[#121317] transition-colors ease-in flex items-center gap-3"
                  >
                    <Icons.Layout />
                    Contact Us
                  </a>
                  
                  <button 
                    onClick={() => { onLogout(); setIsProfileOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors ease-in flex items-center gap-3 mt-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-24">
        <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-700 ease-in">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-black/5 py-20 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6 max-w-sm">
            <span className="text-3xl font-bold tracking-tighter serif-italic text-[#121317]">{APP_NAME}</span>
            <p className="text-sm text-[#6B6F76] leading-relaxed">Protecting creator identity through cryptographic provenance. Built for an era where cloning is effortless.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6F76]">Platform</h4>
              <ul className="space-y-3 text-sm font-medium text-[#2B2D33]">
                <li className="hover:text-black cursor-pointer transition-colors ease-in" onClick={() => setActiveTab('protect')}>Signature Engine</li>
                <li className="hover:text-black cursor-pointer transition-colors ease-in" onClick={() => setActiveTab('verify')}>Forensic Scan</li>
                <li className="hover:text-black cursor-pointer transition-colors ease-in">API Access</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6F76]">Security</h4>
              <ul className="space-y-3 text-sm font-medium text-[#2B2D33]">
                <li className="hover:text-black cursor-pointer transition-colors ease-in">Privacy</li>
                <li className="hover:text-black cursor-pointer transition-colors ease-in">HMAC Protocol</li>
                <li className="hover:text-black cursor-pointer transition-colors ease-in">Auth</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6F76]">Legal</h4>
              <ul className="space-y-3 text-sm font-medium text-[#2B2D33]">
                <li className="hover:text-black cursor-pointer transition-colors ease-in">Privacy Policy</li>
                <li className="hover:text-black cursor-pointer transition-colors ease-in">Terms</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
