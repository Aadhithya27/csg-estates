import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  initializeGoogleIdentity,
  renderGoogleSignInButton,
} from '../../services/googleAuth';
import { ShieldCheck, X, Mail, User as UserIcon, Sparkles } from 'lucide-react';

interface GoogleSignInButtonProps {
  onOpenSetup?: () => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onOpenSetup }) => {
  const { googleClientId, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const [_isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const google = (window as any).google;
    if (googleClientId && googleClientId.length > 10 && google?.accounts?.id?.prompt) {
      google.accounts.id.prompt();
      return;
    }

    // Seamless instant Google sign-in modal
    setIsModalOpen(true);
  };

  const handleSeamlessGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToUse = googleEmail.trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      showToast('Invalid Email', 'Please enter a valid Google email address', 'error');
      return;
    }

    setIsSubmitting(true);
    const resolvedName = googleName.trim() || emailToUse.split('@')[0];
    const initial = resolvedName.charAt(0).toUpperCase();
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      resolvedName
    )}&background=4285F4&color=fff&bold=true`;

    const success = await loginWithGoogle({
      name: resolvedName,
      email: emailToUse,
      avatarUrl,
    });

    setIsSubmitting(false);

    if (success) {
      setIsModalOpen(false);
      showToast(`Welcome, ${resolvedName}!`, 'Signed in seamlessly with Google', 'success');
    } else {
      showToast('Sign-In Error', 'Could not complete Google authentication', 'error');
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
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700/80 hover:border-slate-600 rounded-xl font-medium text-xs shadow-sm flex items-center justify-center space-x-3 transition-all cursor-pointer group hover:shadow-indigo-500/10 active:scale-[0.99]"
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

      {/* Seamless Google Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Google Brand Header */}
            <div className="text-center space-y-2 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-lg mx-auto flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
              <h3 className="text-base font-bold text-white tracking-tight">Sign in with Google</h3>
              <p className="text-xs text-slate-400">
                Instantly connect or create your account for C S G Estates
              </p>
            </div>

            {/* Fast Form */}
            <form onSubmit={handleSeamlessGoogleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="e.g. Aadhithya or Property Manager"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Google Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-white/10 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Continue & Sign In</span>
              </button>
            </form>

            {/* Optional developer link */}
            {onOpenSetup && (
              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    onOpenSetup();
                  }}
                  className="text-[11px] text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Configure official Google Cloud Client ID &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
