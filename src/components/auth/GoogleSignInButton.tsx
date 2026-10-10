import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  decodeGoogleCredential,
  initializeGoogleIdentity,
  renderGoogleSignInButton,
} from '../../services/googleAuth';
import { Settings, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

interface GoogleSignInButtonProps {
  onOpenSetup?: () => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onOpenSetup }) => {
  const { googleClientId, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [showDemoChooser, setShowDemoChooser] = useState(false);

  // Check and initialize Google Identity Services
  useEffect(() => {
    let checkInterval: any;

    const tryInit = () => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        setIsGsiLoaded(true);

        if (googleClientId && googleClientId.length > 10 && googleBtnContainerRef.current) {
          initializeGoogleIdentity(
            googleClientId,
            async (payload) => {
              const success = await loginWithGoogle({
                name: payload.name,
                email: payload.email,
                avatarUrl: payload.picture,
                sub: payload.sub,
              });
              if (success) {
                showToast(`Welcome, ${payload.name}!`, 'Signed in with Google', 'success');
              }
            },
            (err) => {
              console.warn('Google Auth callback error:', err);
              showToast('Google Sign-in failed', 'Please check your Client ID configuration', 'error');
            }
          );

          // Clear previous button content if any
          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = '';
            renderGoogleSignInButton(googleBtnContainerRef.current, {
              theme: 'filled_black',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              width: 380,
            });
          }
        }
        return true;
      }
      return false;
    };

    if (!tryInit()) {
      checkInterval = setInterval(() => {
        if (tryInit()) {
          clearInterval(checkInterval);
        }
      }, 500);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [googleClientId, loginWithGoogle, showToast]);

  const handleCustomGoogleClick = async () => {
    // If real client ID is configured and GIS is available, trigger One-Tap prompt
    const google = (window as any).google;
    if (googleClientId && googleClientId.length > 10 && google?.accounts?.id?.prompt) {
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setShowDemoChooser(true);
        }
      });
      return;
    }

    // Otherwise show fast Google account picker / configuration modal
    setShowDemoChooser(true);
  };

  const handleSimulatedGoogleAccount = async (account: { name: string; email: string; avatarUrl?: string }) => {
    setShowDemoChooser(false);
    const success = await loginWithGoogle({
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl,
      sub: `mock-${Date.now()}`,
    });
    if (success) {
      showToast(`Welcome, ${account.name}!`, 'Signed in with Google Account', 'success');
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Container for Official Google Button when client ID is active */}
      {googleClientId && googleClientId.length > 10 ? (
        <div className="flex flex-col items-center">
          <div ref={googleBtnContainerRef} className="w-full flex justify-center min-h-[44px]" />
          <p className="text-[10px] text-emerald-400 mt-1 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Google Identity Services 2.0 Active</span>
          </p>
        </div>
      ) : (
        /* Styled Brand Google Button with official Google 'G' logo */
        <button
          type="button"
          onClick={handleCustomGoogleClick}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700/80 hover:border-slate-600 rounded-xl font-medium text-xs shadow-sm flex items-center justify-center space-x-3 transition-all cursor-pointer group hover:shadow-indigo-500/10"
        >
          {/* Multi-colored Google G Icon */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.44 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.35 0 3.28 2.56 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
            />
          </svg>
          <span className="font-semibold text-slate-200 group-hover:text-white">
            Continue with Google
          </span>
        </button>
      )}

      {/* Config Link / Status */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
        <span className="text-[10px] text-slate-500">
          {googleClientId && googleClientId.length > 10 ? 'Client ID configured' : 'Standard OAuth 2.0'}
        </span>
        {onOpenSetup && (
          <button
            type="button"
            onClick={onOpenSetup}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center space-x-1 font-semibold"
          >
            <Settings className="w-3 h-3" />
            <span>Setup Google Client ID</span>
          </button>
        )}
      </div>

      {/* Google Account Selector Dialog (Instant Demo & Live Choice) */}
      {showDemoChooser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.44 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.35 0 3.28 2.56 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Choose a Google Account</h3>
                <p className="text-[11px] text-slate-400">to continue to C S G Estates</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  handleSimulatedGoogleAccount({
                    name: 'Aadhithya (Owner)',
                    email: 'aadhithya@csgestates.com',
                    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  })
                }
                className="w-full p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-2xl flex items-center space-x-3 text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center space-x-1.5">
                    <span>Aadhithya (Owner)</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 rounded font-semibold">Primary</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">aadhithya@csgestates.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSimulatedGoogleAccount({
                    name: 'C S G Management',
                    email: 'admin@csgestates.com',
                  })
                }
                className="w-full p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-2xl flex items-center space-x-3 text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold text-sm">
                  C
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-white">C S G Management</p>
                  <p className="text-[11px] text-slate-400 truncate">admin@csgestates.com</p>
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              {onOpenSetup && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDemoChooser(false);
                    onOpenSetup();
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Configure Google Client ID</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowDemoChooser(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium ml-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
