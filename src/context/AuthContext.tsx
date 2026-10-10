import React, { createContext, useContext, useState } from 'react';
import { DatabaseService } from '../services/database';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  passkey: string;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  loginWithPasskey: (passkey: string, memberName?: string) => { success: boolean; message: string };
  updatePasskey: (newKey: string) => void;
  logout: () => void;
  updateUserProfile: (name: string, email: string, avatarUrl?: string) => void;

  // Compatibility stubs
  login: (emailOrPasskey: string, pass?: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (data: any) => Promise<boolean>;
  googleClientId: string;
  isGoogleConfigured: boolean;
  setGoogleClientId: (id: string) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    DatabaseService.initDatabase();
    return DatabaseService.getUser();
  });
  const [passkey, setPasskeyState] = useState<string>(() => DatabaseService.getPasskey());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('rpm_auth_state');
    return savedAuth === 'true';
  });

  const loginWithPasskey = (inputPasskey: string, memberName?: string): { success: boolean; message: string } => {
    if (!inputPasskey || !inputPasskey.trim()) {
      return { success: false, message: 'Please enter the family passkey.' };
    }

    const isValid = DatabaseService.verifyPasskey(inputPasskey);
    if (!isValid) {
      return {
        success: false,
        message: 'Incorrect passkey. Please enter the family passkey (9444423448).',
      };
    }

    const resolvedUser: User = {
      id: 'usr-family',
      name: memberName?.trim() || user?.name || 'C S G Family Owner',
      email: user?.email || 'family@csgestates.com',
      role: 'Owner',
      provider: 'passkey',
      lastLogin: new Date().toISOString(),
    };

    DatabaseService.saveUser(resolvedUser);
    setUser(resolvedUser);
    setIsAuthenticated(true);
    localStorage.setItem('rpm_auth_state', 'true');
    localStorage.setItem('rpm_auth_provider', 'passkey');
    return { success: true, message: 'Welcome to C S G Estates!' };
  };

  const updatePasskey = (newKey: string) => {
    if (newKey && newKey.trim()) {
      DatabaseService.savePasskey(newKey.trim());
      setPasskeyState(newKey.trim());
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('rpm_auth_state');
    localStorage.removeItem('rpm_auth_provider');
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

  // Compatibility helpers
  const login = async (emailOrPasskey: string, pass?: string) => {
    if (DatabaseService.verifyPasskey(emailOrPasskey) || (pass && DatabaseService.verifyPasskey(pass))) {
      return loginWithPasskey(DatabaseService.MASTER_PASSKEY);
    }
    return loginWithPasskey(emailOrPasskey);
  };

  const signup = async (name: string, email: string, pass: string) => {
    return loginWithPasskey(pass, name);
  };

  const loginWithGoogle = async () => false;
  const resetPassword = async () => ({ success: true, message: 'Passkey is 9444423448' });
  const setGoogleClientId = () => {};

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        passkey,
        isSettingsOpen,
        setIsSettingsOpen,
        loginWithPasskey,
        updatePasskey,
        logout,
        updateUserProfile,
        login,
        signup,
        loginWithGoogle,
        googleClientId: '',
        isGoogleConfigured: false,
        setGoogleClientId,
        resetPassword,
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
