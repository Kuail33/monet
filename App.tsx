
import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Storage } from './components/Storage';
import { Icons, MOCK_USER } from './constants';
import { embedWatermark, verifyFile } from './services/watermarkService';
import { generateVerificationReport } from './services/geminiService';
import { AssetRecord, VerificationResult, Verdict, VerificationHistoryItem } from './types';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [activeDashboardView, setActiveDashboardView] = useState<'signed' | 'forensics'>('signed');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [verificationHistory, setVerificationHistory] = useState<VerificationHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProtected, setLastProtected] = useState<AssetRecord | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab('landing');
      setError(null);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Push state when tab changes
  useEffect(() => {
    if (activeTab !== 'landing') {
      window.history.pushState({ tab: activeTab }, '', window.location.pathname);
    }
  }, [activeTab]);

  // Logout when user exits/closes the page
  useEffect(() => {
    const handlePageHide = async (e: PageTransitionEvent) => {
      if (e.persisted) {
        await auth.signOut();
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  const handleLoginTrigger = () => {
    if (isLoggedIn) {
      setActiveTab('protect');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setActiveTab('landing');
      setLastProtected(null);
      setVerificationResult(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const completeLogin = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
    setActiveTab('protect');
  };

  const handleProtectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    setLastProtected(null);

    try {
      // Small delay for UI feedback
      await new Promise(r => setTimeout(r, 800));
      
      const { watermarkedBlob, payload } = await embedWatermark(file, MOCK_USER.uid);
      const url = URL.createObjectURL(watermarkedBlob);
      
      const newAsset: AssetRecord = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.includes('video') ? 'video' : file.type.includes('audio') ? 'audio' : 'image',
        createdAt: Date.now(),
        watermarkId: payload.wid,
        url: url,
        originalSha: payload.sha
      };

      setAssets(prev => [newAsset, ...prev]);
      setLastProtected(newAsset);
    } catch (err) {
      console.error(err);
      setError("Failed to protect asset. The file may be corrupt or an unsupported format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    setVerificationResult(null);

    try {
      // Small delay for UI feedback
      await new Promise(r => setTimeout(r, 1200));

      const res = await verifyFile(file);
      const aiReport = await generateVerificationReport(res);
      const finalResult = { ...res, explanation: aiReport };
      
      setVerificationResult(finalResult);

      // Add to history if user is logged in
      if (isLoggedIn) {
        const historyItem: VerificationHistoryItem = {
          ...finalResult,
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          timestamp: Date.now()
        };
        setVerificationHistory(prev => [historyItem, ...prev]);
      }
    } catch (err) {
      console.error(err);
      setError("Verification failed. We couldn't read the file binary correctly.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderError = () => {
    if (!error) return null;
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-3">
          <Icons.AlertTriangle />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors ease-in">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    );
  };

  const parseInsight = (text: string) => {
    const analysisMatch = text.match(/Analysis:\s*([^\.]+)/i);
    const signatureMatch = text.match(/Signature\s*([^\.]+)/i);
    const integrityMatch = text.match(/Integrity\s*([^\.]+)/i);

    return {
      analysis: analysisMatch?.[1]?.trim() ?? text.trim(),
      signature: signatureMatch?.[1]?.trim() ?? '',
      integrity: integrityMatch?.[1]?.trim() ?? ''
    };
  };

  const formatInsightValue = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return trimmed;
    if (/^(verified|unverified)$/i.test(trimmed)) {
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    }
    const lower = trimmed.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const formatPercent = (value: number) => {
    const fixed = value.toFixed(2);
    return fixed.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  };

  const extractPercent = (value: string) => {
    const match = value.match(/\d+(?:\.\d+)?%/);
    return match ? match[0] : value;
  };

  const getInsightSummary = (verdict: Verdict, signatureScore: number, integrityScore: number) => {
    const sigLow = signatureScore < 50;
    const intLow = integrityScore < 50;

    if (verdict === Verdict.VERIFIED) {
      return 'This appears to be an original work with a strong signature and intact integrity.';
    }

    if (verdict === Verdict.ALTERED) {
      return 'This appears to be a modified work with partial signature validity and reduced integrity.';
    }

    if (sigLow && intLow) {
      return 'This does not appear to be an original work and likely lacks a valid signature and integrity match.';
    }

    if (sigLow) {
      return 'This work likely lacks a valid signature, suggesting it is not the original source.';
    }

    if (intLow) {
      return 'This work shows integrity mismatches, suggesting it may not be the original file.';
    }

    return 'This work shows mixed signals and may not match the original records.';
  };

  const renderBackButton = () => {
    if (activeTab === 'landing') return null;
    return (
      <button 
        onClick={() => {
          setActiveTab('landing');
          setError(null);
        }}
        className="flex items-center gap-2 text-[10px] font-bold text-[#6B6F76] uppercase tracking-[0.2em] hover:text-[#121317] transition-colors ease-in mb-8 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform ease-in">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Home
      </button>
    );
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isLoggedIn={isLoggedIn}
      currentUser={currentUser}
      onLogin={handleLoginTrigger}
      onLogout={handleLogout}
      onSelectDashboardView={setActiveDashboardView}
    >
      {renderBackButton()}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={completeLogin} 
      />

      {activeTab === 'landing' && (
        <LandingPage 
          onStart={setActiveTab} 
          onLogin={handleLoginTrigger}
          isLoggedIn={isLoggedIn}
        />
      )}

      {activeTab === 'protect' && isLoggedIn && (
        <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-top-4 duration-700 ease-in">
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in delay-100">
            <h2 className="text-4xl font-bold tracking-tight text-[#121317]"> Seal your work </h2>
            <p className="text-[#6B6F76] text-lg font-medium">Embed a cryptographic identity marker into your binary data.</p>
          </div>

          {renderError()}

            <div className={`hex-card p-1 border-dashed border-2 transition-all ease-in relative cursor-pointer group animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in delay-200 ${isProcessing ? 'opacity-50 pointer-events-none' : 'border-black/5 hover:border-black/20'}`}>
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleProtectUpload}
              disabled={isProcessing}
            />
            <div className="p-24 text-center space-y-8">
              <div className="w-16 h-16 bg-[#F7F6F4] border border-black/5 rounded-2xl flex items-center justify-center mx-auto text-[#121317] group-hover:scale-105 transition-transform ease-in">
                <Icons.Upload />
              </div>
              <div className="space-y-2">
                <p className="text-[#121317] font-bold text-xl">Drop media asset</p>
                <p className="text-[#6B6F76] text-sm font-medium">Video, audio, or high-res imagery</p>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="flex flex-col items-center gap-6 py-10">
              <div className="w-56 h-1 bg-black/5 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-[#121317] w-1/3 animate-[shimmer_1.5s_infinite]"></div>
              </div>
              <span className="text-[10px] font-bold text-[#6B6F76] uppercase tracking-[0.3em] animate-pulse">Encoding cryptographic proof...</span>
            </div>
          )}

          {lastProtected && !isProcessing && (
            <div className="hex-card p-10 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-700 ease-in">
              <div className="flex flex-col sm:flex-row gap-8 items-center animate-in fade-in duration-500 ease-in delay-100">
                <div className="w-16 h-16 bg-green-50 text-green-700 rounded-full flex items-center justify-center flex-shrink-0 animate-in zoom-in-95 duration-400 ease-in delay-200">
                  <Icons.CheckCircle />
                </div>
                <div className="space-y-8 flex-1 text-center sm:text-left animate-in fade-in slide-in-from-right-2 duration-500 ease-in delay-300">
                  <div className="animate-in fade-in duration-400 ease-in delay-400">
                    <h3 className="text-2xl font-bold text-[#121317]">Asset Secured</h3>
                    <p className="text-sm text-[#6B6F76] mt-1 font-medium">Forensic ID: <span className="mono font-semibold text-[#121317]">{lastProtected.watermarkId}</span></p>
                  </div>
                  
                    <div className="flex flex-wrap gap-4 justify-center sm:justify-start animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in delay-500">
                    <div className="btn-wrapper relative">
                      <div className="btn-bracket-container">
                        <a 
                          href={lastProtected.url} 
                          download={`protected_${lastProtected.name}`}
                          className="btn-bracket"
                        >
                          Export Protected File
                        </a>
                        <div className="corner-bottom-left"></div>
                        <div className="corner-bottom-right"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'verify' && (
        <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-top-4 duration-700 ease-in">
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in delay-100">
            <h2 className="text-4xl font-bold tracking-tight text-[#121317]">Verify Forensic</h2>
            <p className="text-[#6B6F76] text-lg font-medium">Extract markers and audit content for modifications.</p>
          </div>

          {renderError()}

            <div className={`hex-card p-1 border-dashed border-2 transition-all ease-in relative cursor-pointer group animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in delay-200 ${isProcessing ? 'opacity-50 pointer-events-none' : 'border-black/5 hover:border-black/20'}`}>
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleVerifyUpload}
              disabled={isProcessing}
            />
            <div className="p-24 text-center space-y-8">
              <div className="w-16 h-16 bg-[#F7F6F4] border border-black/5 rounded-2xl flex items-center justify-center mx-auto text-[#121317] group-hover:scale-105 transition-transform ease-in">
                <Icons.Lock />
              </div>
              <div className="space-y-2">
                <p className="text-[#121317] font-bold text-xl">Analyze work</p>
                <p className="text-[#6B6F76] text-sm font-medium">Check signature and bitwise integrity</p>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="flex flex-col items-center gap-6 py-10">
              <div className="w-56 h-1 bg-black/5 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-[#121317] w-1/3 animate-[shimmer_1.5s_infinite]"></div>
              </div>
              <span className="text-[10px] font-bold text-[#6B6F76] uppercase tracking-[0.3em]">Analyzing provenance records...</span>
            </div>
          )}

          {verificationResult && !isProcessing && (
            <>
            <div className={`hex-card p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in ${
              verificationResult.verdict === Verdict.VERIFIED ? 'border-green-100' : 
              verificationResult.verdict === Verdict.ALTERED ? 'border-amber-100' : 'border-red-100'
            }`}>
                <div className="space-y-12 animate-in fade-in duration-500 ease-in delay-100">
                  <div className="flex justify-between items-start animate-in fade-in slide-in-from-left-2 duration-500 ease-in delay-200">
                    <div className="space-y-2 animate-in fade-in duration-400 ease-in delay-300">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase ${
                      verificationResult.verdict === Verdict.VERIFIED ? 'bg-green-100 text-green-800' : 
                      verificationResult.verdict === Verdict.ALTERED ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {verificationResult.verdict}
                    </span>
                    <h3 className="text-3xl font-bold text-[#121317]">Forensic Result</h3>
                  </div>
                    <div className="text-right animate-in fade-in duration-400 ease-in delay-400">
                    <p className="text-[10px] font-bold text-[#6B6F76] uppercase tracking-[0.2em]">Confidence</p>
                    <p className="text-5xl font-black text-[#121317]">{(verificationResult.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in delay-500">
                    <div className="space-y-5 animate-in fade-in duration-400 ease-in delay-600">
                    <div className="flex justify-between items-center text-[12px] font-bold text-[#6B6F76] uppercase tracking-[0.3em]">
                      <span>Signature Check</span>
                      <span className={verificationResult.signatureScore > 90 ? 'text-green-700' : 'text-red-700'}>
                        {verificationResult.signatureScore}%
                      </span>
                    </div>
                    <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ease-in duration-1000 ${verificationResult.signatureScore > 90 ? 'bg-green-600' : 'bg-red-600'}`}
                        style={{ width: `${verificationResult.signatureScore}%` }}
                      ></div>
                    </div>
                  </div>
                    <div className="space-y-5 animate-in fade-in duration-400 ease-in delay-700">
                    <div className="flex justify-between items-center text-[12px] font-bold text-[#6B6F76] uppercase tracking-[0.3em]">
                      <span>Content Integrity</span>
                      <span className={verificationResult.integrityScore > 90 ? 'text-green-700' : 'text-amber-700'}>
                        {verificationResult.integrityScore}%
                      </span>
                    </div>
                    <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ease-in duration-1000 ${verificationResult.integrityScore > 90 ? 'bg-green-600' : 'bg-amber-600'}`}
                        style={{ width: `${verificationResult.integrityScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                  <div className="pt-10 border-t border-black/5 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in delay-800">
                  <h4 className="text-[12px] font-bold text-[#6B6F76] uppercase tracking-[0.3em] mb-6"> Gemini Forensic Insight</h4>
                  {(() => {
                    const insight = parseInsight(verificationResult.explanation);
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-lg serif-italic">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-[12px] font-bold tracking-[0.2em] text-[#6B6F76]">Analysis:</span>
                            <span className="text-[#2B2D33] font-medium">{formatInsightValue(insight.analysis)}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-[12px] font-bold tracking-[0.2em] text-[#6B6F76]">Validity:</span>
                            <span className="text-[#2B2D33] font-medium">
                              {formatInsightValue(extractPercent(insight.signature || `${formatPercent(verificationResult.signatureScore)}%`))}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-[12px] font-bold tracking-[0.2em] text-[#6B6F76]"> Matching: </span>
                            <span className="text-[#2B2D33] font-medium">
                              {formatInsightValue(extractPercent(insight.integrity || `${formatPercent(verificationResult.integrityScore)}%`))}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-[12px] font-bold  tracking-[0.2em] text-[#6B6F76]">Confidence:</span>
                            <span className="text-[#2B2D33] font-medium">
                              {extractPercent(`${formatPercent(verificationResult.confidence * 100)}%`)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {verificationResult.watermarkId && (
                    <div className="mt-8 flex items-center gap-3">
                      <span className="text-[10px] font-bold text-[#6B6F76] uppercase tracking-widest">Digital Asset UUID:</span>
                      <span className="mono text-[10px] font-bold text-[#121317] bg-[#F7F6F4] px-2 py-1 rounded">
                        {verificationResult.watermarkId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={`hex-card p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in ${
              verificationResult.verdict === Verdict.VERIFIED ? 'border-green-100' : 
              verificationResult.verdict === Verdict.ALTERED ? 'border-amber-100' : 'border-red-100'
            }`}>
              <div className="space-y-3">
                <h4 className="text-[12px] font-bold text-[#6B6F76] uppercase tracking-[0.3em]"> Summary</h4>
                <p className="text-lg serif-italic text-[#2B2D33] font-medium">
                  {getInsightSummary(
                    verificationResult.verdict,
                    verificationResult.signatureScore,
                    verificationResult.integrityScore
                  )}
                </p>
              </div>
            </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'dashboard' && isLoggedIn && (
        <Storage 
          assets={assets} 
          verifications={verificationHistory} 
          onNewSign={() => setActiveTab('protect')}
          activeView={activeDashboardView}
          setActiveView={setActiveDashboardView}
        />
      )}
    </Layout>
  );
};

