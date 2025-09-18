/**
 * Authentication React Hook
 * 
 * Provides authentication state management and actions
 * for React components with loading states and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  authService, 
  AuthUser, 
  SignUpData, 
  SignInData, 
  ProfileUpdateData,
  AuthError 
} from '../lib/auth/auth-service';
import { UserProfile } from '../lib/firebase/schema';

// Hook State Types
interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

interface AuthActions {
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: ProfileUpdateData) => Promise<void>;
  updateEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  completeOnboarding: (data: {
    household: UserProfile['household'];
    preferences: Partial<UserProfile['preferences']>;
  }) => Promise<void>;
  clearError: () => void;
}

type UseAuthReturn = AuthState & AuthActions;

/**
 * Main authentication hook
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false,
    error: null
  });

  // Initialize authentication state listener
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (isMounted) {
        setState(prev => ({
          ...prev,
          user,
          loading: false,
          initialized: true,
          error: null
        }));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Helper function to handle async actions
  const handleAsyncAction = useCallback(
    async (action: () => Promise<any>, loadingMessage?: string) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await action();
        setState(prev => ({ ...prev, loading: false }));
        return result;
      } catch (error) {
        const errorMessage = error instanceof AuthError 
          ? error.message 
          : 'An unexpected error occurred';
        
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
        throw error;
      }
    },
    []
  );

  // Authentication actions
  const signUp = useCallback(
    async (data: SignUpData) => {
      await handleAsyncAction(() => authService.signUp(data));
    },
    [handleAsyncAction]
  );

  const signIn = useCallback(
    async (data: SignInData) => {
      await handleAsyncAction(() => authService.signIn(data));
    },
    [handleAsyncAction]
  );

  const signInWithGoogle = useCallback(
    async () => {
      await handleAsyncAction(() => authService.signInWithGoogle());
    },
    [handleAsyncAction]
  );

  const signOut = useCallback(
    async () => {
      await handleAsyncAction(() => authService.signOut());
    },
    [handleAsyncAction]
  );

  const resetPassword = useCallback(
    async (email: string) => {
      await handleAsyncAction(() => authService.resetPassword(email));
    },
    [handleAsyncAction]
  );

  const updateProfile = useCallback(
    async (updates: ProfileUpdateData) => {
      await handleAsyncAction(() => authService.updateUserProfile(updates));
    },
    [handleAsyncAction]
  );

  const updateEmail = useCallback(
    async (newEmail: string, currentPassword: string) => {
      await handleAsyncAction(() => authService.updateEmail(newEmail, currentPassword));
    },
    [handleAsyncAction]
  );

  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await handleAsyncAction(() => authService.updatePassword(currentPassword, newPassword));
    },
    [handleAsyncAction]
  );

  const deleteAccount = useCallback(
    async (password: string) => {
      await handleAsyncAction(() => authService.deleteAccount(password));
    },
    [handleAsyncAction]
  );

  const resendEmailVerification = useCallback(
    async () => {
      await handleAsyncAction(() => authService.resendEmailVerification());
    },
    [handleAsyncAction]
  );

  const completeOnboarding = useCallback(
    async (data: {
      household: UserProfile['household'];
      preferences: Partial<UserProfile['preferences']>;
    }) => {
      await handleAsyncAction(() => authService.completeOnboarding(data));
    },
    [handleAsyncAction]
  );

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    user: state.user,
    loading: state.loading,
    initialized: state.initialized,
    error: state.error,

    // Actions
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
    resendEmailVerification,
    completeOnboarding,
    clearError
  };
}

/**
 * Hook for checking if user is authenticated
 */
export function useAuthState() {
  const { user, loading, initialized } = useAuth();
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    isInitialized: initialized
  };
}

/**
 * Hook for user profile data
 */
export function useUserProfile() {
  const { user } = useAuth();
  
  return {
    profile: user?.profile,
    isOnboardingComplete: user?.profile?.onboardingCompleted || false,
    displayName: user?.displayName || user?.profile?.displayName,
    email: user?.email || user?.profile?.email,
    photoURL: user?.photoURL || user?.profile?.photoURL,
    preferences: user?.profile?.preferences,
    household: user?.profile?.household,
    gamification: user?.profile?.gamification,
    subscription: user?.profile?.subscription
  };
}

/**
 * Hook for authentication guards
 */
export function useAuthGuard() {
  const { user, initialized, loading } = useAuth();
  
  const requireAuth = useCallback(() => {
    if (!initialized) return false;
    return !!user;
  }, [user, initialized]);

  const requireEmailVerification = useCallback(() => {
    if (!user) return false;
    return user.emailVerified;
  }, [user]);

  const requireOnboarding = useCallback(() => {
    if (!user?.profile) return false;
    return user.profile.onboardingCompleted;
  }, [user]);

  return {
    isAuthenticated: requireAuth(),
    isEmailVerified: requireEmailVerification(),
    isOnboardingComplete: requireOnboarding(),
    isLoading: loading,
    isInitialized: initialized
  };
}

/**
 * Hook for user permissions and roles
 */
export function useUserPermissions() {
  const { user } = useAuth();
  
  const hasRole = useCallback((role: string) => {
    return user?.profile?.role === role;
  }, [user]);

  const hasFeature = useCallback((feature: string) => {
    return user?.profile?.subscription?.features?.includes(feature) || false;
  }, [user]);

  const canAccess = useCallback((resource: string) => {
    // Implement role-based access control logic here
    if (!user) return false;
    
    switch (resource) {
      case 'admin-panel':
        return hasRole('admin');
      case 'premium-features':
        return user.profile?.subscription?.plan !== 'free';
      case 'analytics':
        return hasFeature('advanced-analytics');
      default:
        return true;
    }
  }, [user, hasRole, hasFeature]);

  return {
    role: user?.profile?.role,
    plan: user?.profile?.subscription?.plan,
    features: user?.profile?.subscription?.features || [],
    hasRole,
    hasFeature,
    canAccess
  };
}

export default useAuth;