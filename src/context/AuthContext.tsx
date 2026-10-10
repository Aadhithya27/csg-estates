import React, { createContext, useContext, useEffect, useState } from 'react';
import { DatabaseService } from '../services/database';
import {
  decodeGoogleCredential,
  disableGoogleAutoSelect,
  getActiveGoogleClientId,
  setStoredGoogleClientId,
} from '../services/googleAuth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  googleClientId: string;
  isGoogleConfigured: boolean;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (credentialOrData: string | { name: string; email: string; avatarUrl?: string; sub?: string }) => Promise<boolean>;
  logout: () => void;
  setGoogleClientId: (clientId: string) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (name: string, email: string, avatarUrl?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    DatabaseService.initDatabase();
    return DatabaseService.getUser();
  });
  const [googleClientId, setGoogleClientIdState] = useState<string>(() => getActiveGoogleClientId());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('rpm_auth_state');
    return savedAuth === 'true';
  });

  const isGoogleConfigured = Boolean(googleClientId && googleClientId.trim().length > 10);

  const setGoogleClientId = (clientId: string) => {
    setStoredGoogleClientId(clientId);
    setGoogleClientIdState(clientId.trim());
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    if (!email || !pass) {
      return { success: false, message: 'Please enter both email and password.' };
    }
    if (pass.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const authRes = DatabaseService.authenticate(email, pass);
    if (authRes.success && authRes.user) {
      setUser(authRes.user);
      setIsAuthenticated(true);
      localStorage.setItem('rpm_auth_state', 'true');
      localStorage.setItem('rpm_auth_provider', authRes.user.provider || 'email');
      return { success: true, message: authRes.message };
    }

    return { success: false, message: authRes.message || 'Authentication failed' };
  };

  const signup = async (
    name: string,
    email: string,
    pass: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!name.trim()) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!pass || pass.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    const res = DatabaseService.registerAccount(name, email, pass, 'email');
    if (res.success && res.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      localStorage.setItem('rpm_auth_state', 'true');
      localStorage.setItem('rpm_auth_provider', 'email');
      return { success: true, message: res.message };
    }

    return { success: false, message: res.message };
  };

  const loginWithGoogle = async (
    credentialOrData: string | { name: string; email: string; avatarUrl?: string; sub?: string }
  ): Promise<boolean> => {
    try {
      let googleProfile: { name: string; email: string; avatarUrl?: string; sub?: string };

      if (typeof credentialOrData === 'string') {
        const decoded = decodeGoogleCredential(credentialOrData);
        if (!decoded) {
          throw new Error('Invalid Google credential token');
        }
        googleProfile = {
          name: decoded.name || decoded.email.split('@')[0],
          email: decoded.email,
          avatarUrl: decoded.picture,
          sub: decoded.sub,
        };
      } else {
        googleProfile = credentialOrData;
      }

      // Auto-register or authenticate account seamlessly
      const regRes = DatabaseService.registerAccount(
        googleProfile.name,
        googleProfile.email,
        '',
        'google',
        googleProfile.avatarUrl
      );

      const googleUser: User = regRes.user || {
        id: googleProfile.sub ? `usr-g-${googleProfile.sub.slice(0, 8)}` : `usr-g-${Date.now()}`,
        name: googleProfile.name || 'Google User',
        email: googleProfile.email,
        role: 'Owner',
        avatarUrl: googleProfile.avatarUrl,
        provider: 'google',
        googleId: googleProfile.sub,
        lastLogin: new Date().toISOString(),
      };

      DatabaseService.saveUser(googleUser);
      setUser(googleUser);
      setIsAuthenticated(true);
      localStorage.setItem('rpm_auth_state', 'true');
      localStorage.setItem('rpm_auth_provider', 'google');
      return true;
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      return false;
    }
  };

  const logout = () => {
    disableGoogleAutoSelect();
    setIsAuthenticated(false);
    localStorage.removeItem('rpm_auth_state');
    localStorage.removeItem('rpm_auth_provider');
  };

  const resetPassword = async (email: string) => {
    if (email) {
      return {
        success: true,
        message: `Password reset link sent to ${email}. Check your email inbox.`,
      };
    }
    return { success: false, message: 'Please enter a valid email address.' };
  };

  const updateUserProfile = (name: string, email: string, avatarUrl?: string) => {
    if (!user) return;
    const updated: User = {
      ...user,
      name,
      email,
      avatarUrl: avatarUrl || user.avatarUrl,
    };
    DatabaseService.saveUser(updated);

    // Also update in registered accounts list
    try {
      const accounts = DatabaseService.getAccounts();
      const updatedAccounts = accounts.map((acc) =>
        acc.id === user.id || acc.email.toLowerCase() === user.email.toLowerCase()
          ? { ...acc, name, email, avatarUrl: avatarUrl || acc.avatarUrl }
          : acc
      );
      DatabaseService.saveAccounts(updatedAccounts);
    } catch (e) {
      console.warn('Could not sync user profile to accounts:', e);
    }

    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        googleClientId,
        isGoogleConfigured,
        isSettingsOpen,
        setIsSettingsOpen,
        login,
        signup,
        loginWithGoogle,
        logout,
        setGoogleClientId,
        resetPassword,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
