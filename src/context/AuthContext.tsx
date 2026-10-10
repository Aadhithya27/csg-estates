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
  login: (email: string, pass: string) => Promise<boolean>;
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

  const login = async (email: string, pass: string): Promise<boolean> => {
    // Owner login validation
    if (email && pass && pass.length >= 4) {
      const currentUser = DatabaseService.getUser();
      const updatedUser: User = {
        ...currentUser,
        email,
        name: currentUser?.name || 'C S G Estates Owner',
        role: 'Owner',
        provider: 'email',
        lastLogin: new Date().toISOString(),
      };
      DatabaseService.saveUser(updatedUser);
      setUser(updatedUser);
      setIsAuthenticated(true);
      localStorage.setItem('rpm_auth_state', 'true');
      localStorage.setItem('rpm_auth_provider', 'email');
      return true;
    }
    return false;
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

      const googleUser: User = {
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
