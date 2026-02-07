import React, { useState } from 'react';
import { Icons, APP_NAME } from '../constants';
import { auth } from '../services/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-[#F7F6F4]/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-md hex-card p-12 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#6B6F76] hover:text-[#121317] transition-colors ease-in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-[#121317] flex items-center justify-center text-white font-black tracking-tighter text-2xl rounded-sm">A</div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#121317]">Secure your identity</h2>
            <p className="text-sm text-[#6B6F76] font-medium">Sign {isSignUp ? 'up' : 'in'} to AuthMark to protect your creative work.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEmailAuth()}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#121317]/20 disabled:opacity-50"
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEmailAuth()}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#121317]/20 disabled:opacity-50"
            />
            
            <button 
              onClick={handleEmailAuth}
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full px-6 py-4 bg-[#121317] border border-[#121317] rounded-lg text-sm font-semibold text-white hover:bg-black transition-all ease-in disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
            
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-black/10 rounded-lg text-sm font-semibold text-[#121317] hover:bg-[#F7F6F4] transition-all ease-in disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-[#6B6F76] hover:text-[#121317] transition-colors ease-in"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>

          <p className="text-[10px] text-[#6B6F76] font-bold uppercase tracking-[0.2em] pt-4">
            By continuing, you agree to our terms of provenance.
          </p>
        </div>
      </div>
    </div>
  );
};
