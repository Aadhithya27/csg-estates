import { User } from '../types';

export interface GoogleJwtPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
}

const STORAGE_KEY_CLIENT_ID = 'rpm_google_client_id';

// Default Demo/Fallback Client ID or Environment Variable
export const getActiveGoogleClientId = (): string => {
  const custom = localStorage.getItem(STORAGE_KEY_CLIENT_ID);
  if (custom && custom.trim().length > 0) {
    return custom.trim();
  }
  // Vite env variable
  const envId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
  if (envId && envId.trim().length > 0) {
    return envId.trim();
  }
  return '';
};

export const setStoredGoogleClientId = (clientId: string): void => {
  if (clientId && clientId.trim().length > 0) {
    localStorage.setItem(STORAGE_KEY_CLIENT_ID, clientId.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_CLIENT_ID);
  }
};

/**
 * Decode JWT token returned by Google Identity Services
 */
export const decodeGoogleCredential = (credential: string): GoogleJwtPayload | null => {
  try {
    const parts = credential.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as GoogleJwtPayload;
  } catch (err) {
    console.error('Failed to parse Google JWT credential:', err);
    return null;
  }
};

/**
 * Format Google payload into application User object
 */
export const googlePayloadToUser = (payload: GoogleJwtPayload): User => {
  return {
    id: `usr-google-${payload.sub.slice(0, 8)}`,
    name: payload.name || payload.email.split('@')[0],
    email: payload.email,
    role: 'Owner',
    avatarUrl: payload.picture,
    provider: 'google',
    googleId: payload.sub,
    lastLogin: new Date().toISOString(),
  };
};

/**
 * Initialize Google Identity Services
 */
export const initializeGoogleIdentity = (
  clientId: string,
  onCredentialSuccess: (payload: GoogleJwtPayload, credential: string) => void,
  onError?: (err: any) => void
): boolean => {
  if (typeof window === 'undefined') return false;

  const google = (window as any).google;
  if (!google?.accounts?.id) {
    return false;
  }

  if (!clientId || clientId.trim().length === 0) {
    return false;
  }

  try {
    google.accounts.id.initialize({
      client_id: clientId.trim(),
      callback: (response: { credential?: string; select_by?: string }) => {
        if (response.credential) {
          const payload = decodeGoogleCredential(response.credential);
          if (payload) {
            onCredentialSuccess(payload, response.credential);
          } else if (onError) {
            onError('Could not parse Google ID token credential');
          }
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });
    return true;
  } catch (err) {
    console.warn('Google Identity initialize warning:', err);
    if (onError) onError(err);
    return false;
  }
};

/**
 * Render official Google Sign-In button into a DOM container
 */
export const renderGoogleSignInButton = (
  container: HTMLElement,
  options?: {
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    width?: number | string;
    logo_alignment?: 'left' | 'center';
  }
): boolean => {
  const google = (window as any).google;
  if (!google?.accounts?.id) return false;

  try {
    google.accounts.id.renderButton(container, {
      theme: options?.theme || 'outline',
      size: options?.size || 'large',
      text: options?.text || 'continue_with',
      shape: options?.shape || 'rectangular',
      width: options?.width || 320,
      logo_alignment: options?.logo_alignment || 'left',
    });
    return true;
  } catch (err) {
    console.warn('Failed to render Google button:', err);
    return false;
  }
};

/**
 * Disable auto-select on logout so Google One Tap doesn't immediately re-login
 */
export const disableGoogleAutoSelect = (): void => {
  const google = (window as any).google;
  if (google?.accounts?.id?.disableAutoSelect) {
    try {
      google.accounts.id.disableAutoSelect();
    } catch (e) {
      // Ignore
    }
  }
};
