/**
 * Production-Grade Authentication Service
 * 
 * Complete authentication system with Firebase Auth integration,
 * user profile management, and session handling.
 */

import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  updateEmail,
  Unsubscribe
} from 'firebase/auth';

import { auth } from '../firebase/firebase';
import { firestoreService } from '../firebase/firestore-service';
import { UserProfile, COLLECTIONS } from '../firebase/schema';

// Auth State Types
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  profile?: UserProfile;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  acceptTerms: boolean;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  displayName?: string;
  photoURL?: string;
  preferences?: UserProfile['preferences'];
  household?: UserProfile['household'];
}

// Auth Error Types
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Authentication Service
export class AuthService {
  private currentUser: AuthUser | null = null;
  private authStateListeners: Set<(user: AuthUser | null) => void> = new Set();
  private unsubscribeAuth: Unsubscribe | null = null;

  constructor() {
    this.initializeAuthListener();
  }

  /**
   * Initialize authentication state listener
   */
  private initializeAuthListener(): void {
    this.unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await this.loadUserProfile(firebaseUser.uid);
          this.currentUser = this.mapFirebaseUser(firebaseUser, profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
          this.currentUser = this.mapFirebaseUser(firebaseUser);
        }
      } else {
        this.currentUser = null;
      }

      // Notify all listeners
      this.notifyAuthStateListeners();
    });
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Sign up with email and password
   */
  async signUp(data: SignUpData): Promise<AuthUser> {
    try {
      if (!data.acceptTerms) {
        throw new AuthError('Terms and conditions must be accepted', 'terms-not-accepted');
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: data.displayName
      });

      // Create user profile in Firestore
      const profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: data.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        role: 'user',
        status: 'active',
        onboardingCompleted: false,
        preferences: {
          theme: 'system',
          notifications: {
            email: true,
            push: true,
            questReminders: true,
            energyAlerts: true,
            weeklyReports: true
          },
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          currency: 'USD',
          units: {
            energy: 'kWh',
            temperature: 'celsius',
            currency: 'USD'
          }
        },
        household: {
          size: 1,
          type: 'apartment',
          yearBuilt: null,
          squareFootage: null,
          residents: []
        },
        gamification: {
          level: 1,
          points: 0,
          totalPoints: 0,
          badges: [],
          achievements: [],
          streak: {
            current: 0,
            longest: 0,
            lastActivity: null
          }
        },
        subscription: {
          plan: 'free',
          status: 'active',
          startDate: null,
          endDate: null,
          features: ['basic-dashboard', 'energy-tracking', 'basic-quests']
        },
        metadata: {
          lastLoginAt: null,
          loginCount: 0,
          deviceInfo: this.getDeviceInfo(),
          referralCode: this.generateReferralCode(),
          source: 'direct'
        }
      };

      const profile = await firestoreService.createUserProfile(profileData);

      // Send email verification
      await sendEmailVerification(firebaseUser);

      const authUser = this.mapFirebaseUser(firebaseUser, profile);
      this.currentUser = authUser;

      return authUser;

    } catch (error: any) {
      throw this.handleAuthError(error, 'signUp');
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(data: SignInData): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;
      
      // Update login metadata
      await this.updateLoginMetadata(firebaseUser.uid);

      const profile = await this.loadUserProfile(firebaseUser.uid);
      const authUser = this.mapFirebaseUser(firebaseUser, profile);
      
      this.currentUser = authUser;
      return authUser;

    } catch (error: any) {
      throw this.handleAuthError(error, 'signIn');
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthUser> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if this is a new user
      const existingProfile = await this.loadUserProfile(firebaseUser.uid);
      
      if (!existingProfile) {
        // Create new user profile
        const profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || 'Google User',
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          role: 'user',
          status: 'active',
          onboardingCompleted: false,
          preferences: {
            theme: 'system',
            notifications: {
              email: true,
              push: true,
              questReminders: true,
              energyAlerts: true,
              weeklyReports: true
            },
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            currency: 'USD',
            units: {
              energy: 'kWh',
              temperature: 'celsius',
              currency: 'USD'
            }
          },
          household: {
            size: 1,
            type: 'apartment',
            yearBuilt: null,
            squareFootage: null,
            residents: []
          },
          gamification: {
            level: 1,
            points: 0,
            totalPoints: 0,
            badges: [],
            achievements: [],
            streak: {
              current: 0,
              longest: 0,
              lastActivity: null
            }
          },
          subscription: {
            plan: 'free',
            status: 'active',
            startDate: null,
            endDate: null,
            features: ['basic-dashboard', 'energy-tracking', 'basic-quests']
          },
          metadata: {
            lastLoginAt: null,
            loginCount: 0,
            deviceInfo: this.getDeviceInfo(),
            referralCode: this.generateReferralCode(),
            source: 'google'
          }
        };

        await firestoreService.createUserProfile(profileData);
      }

      // Update login metadata
      await this.updateLoginMetadata(firebaseUser.uid);

      const profile = await this.loadUserProfile(firebaseUser.uid);
      const authUser = this.mapFirebaseUser(firebaseUser, profile);
      
      this.currentUser = authUser;
      return authUser;

    } catch (error: any) {
      throw this.handleAuthError(error, 'signInWithGoogle');
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error: any) {
      throw this.handleAuthError(error, 'signOut');
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error, 'resetPassword');
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: ProfileUpdateData): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new AuthError('No authenticated user', 'no-user');
      }

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new AuthError('No Firebase user', 'no-firebase-user');
      }

      // Update Firebase Auth profile
      if (updates.displayName || updates.photoURL) {
        await updateProfile(firebaseUser, {
          displayName: updates.displayName || firebaseUser.displayName,
          photoURL: updates.photoURL || firebaseUser.photoURL
        });
      }

      // Update Firestore profile
      const firestoreUpdates: Partial<UserProfile> = {};
      
      if (updates.displayName) firestoreUpdates.displayName = updates.displayName;
      if (updates.photoURL) firestoreUpdates.photoURL = updates.photoURL;
      if (updates.preferences) firestoreUpdates.preferences = updates.preferences;
      if (updates.household) firestoreUpdates.household = updates.household;

      await firestoreService.updateUserProfile(this.currentUser.uid, firestoreUpdates);

      // Reload user profile
      const updatedProfile = await this.loadUserProfile(this.currentUser.uid);
      if (updatedProfile) {
        this.currentUser = this.mapFirebaseUser(firebaseUser, updatedProfile);
        this.notifyAuthStateListeners();
      }

    } catch (error: any) {
      throw this.handleAuthError(error, 'updateUserProfile');
    }
  }

  /**
   * Update email
   */
  async updateEmail(newEmail: string, currentPassword: string): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new AuthError('No authenticated user', 'no-user');
      }

      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) {
        throw new AuthError('No Firebase user email', 'no-firebase-user-email');
      }

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // Update email
      await updateEmail(firebaseUser, newEmail);

      // Update Firestore profile
      await firestoreService.updateUserProfile(this.currentUser.uid, {
        email: newEmail,
        emailVerified: false
      });

      // Send email verification
      await sendEmailVerification(firebaseUser);

    } catch (error: any) {
      throw this.handleAuthError(error, 'updateEmail');
    }
  }

  /**
   * Update password
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new AuthError('No authenticated user', 'no-user');
      }

      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) {
        throw new AuthError('No Firebase user email', 'no-firebase-user-email');
      }

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password
      await updatePassword(firebaseUser, newPassword);

    } catch (error: any) {
      throw this.handleAuthError(error, 'updatePassword');
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new AuthError('No authenticated user', 'no-user');
      }

      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) {
        throw new AuthError('No Firebase user email', 'no-firebase-user-email');
      }

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(firebaseUser.email, password);
      await reauthenticateWithCredential(firebaseUser, credential);

      // Delete user data from Firestore
      // This should be done via a cloud function in production for data consistency
      await firestoreService.delete(COLLECTIONS.USERS, this.currentUser.uid);

      // Delete Firebase user
      await deleteUser(firebaseUser);

      this.currentUser = null;

    } catch (error: any) {
      throw this.handleAuthError(error, 'deleteAccount');
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new AuthError('No authenticated user', 'no-user');
      }

      await sendEmailVerification(firebaseUser);

    } catch (error: any) {
      throw this.handleAuthError(error, 'resendEmailVerification');
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(onboardingData: {
    household: UserProfile['household'];
    preferences: Partial<UserProfile['preferences']>;
  }): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new AuthError('No authenticated user', 'no-user');
      }

      await firestoreService.updateUserProfile(this.currentUser.uid, {
        onboardingCompleted: true,
        household: onboardingData.household,
        preferences: {
          ...this.currentUser.profile?.preferences,
          ...onboardingData.preferences
        }
      });

      // Reload user profile
      const updatedProfile = await this.loadUserProfile(this.currentUser.uid);
      if (updatedProfile) {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          this.currentUser = this.mapFirebaseUser(firebaseUser, updatedProfile);
          this.notifyAuthStateListeners();
        }
      }

    } catch (error: any) {
      throw this.handleAuthError(error, 'completeOnboarding');
    }
  }

  /**
   * Add authentication state listener
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.add(callback);
    
    // Call immediately with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      this.authStateListeners.delete(callback);
    };
  }

  // Private Methods

  private async loadUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      return await firestoreService.getUserProfile(uid);
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  private mapFirebaseUser(firebaseUser: FirebaseUser, profile?: UserProfile | null): AuthUser {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      isAnonymous: firebaseUser.isAnonymous,
      profile: profile || undefined
    };
  }

  private async updateLoginMetadata(uid: string): Promise<void> {
    try {
      const now = new Date();
      await firestoreService.updateUserProfile(uid, {
        'metadata.lastLoginAt': now,
        'metadata.loginCount': firestoreService.transaction(async (transaction) => {
          const userDoc = await transaction.get(
            firestoreService.get(COLLECTIONS.USERS, uid) as any
          );
          const currentCount = userDoc.data()?.metadata?.loginCount || 0;
          return currentCount + 1;
        })
      } as any);
    } catch (error) {
      console.error('Error updating login metadata:', error);
    }
  }

  private notifyAuthStateListeners(): void {
    for (const callback of this.authStateListeners) {
      try {
        callback(this.currentUser);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    }
  }

  private getDeviceInfo(): UserProfile['metadata']['deviceInfo'] {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  private handleAuthError(error: any, operation: string): AuthError {
    console.error(`Auth ${operation} error:`, error);

    // Map Firebase Auth error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/cancelled-popup-request': 'Only one popup request is allowed at once.',
      'auth/popup-blocked': 'Sign-in popup was blocked by the browser.',
      'auth/requires-recent-login': 'Please sign in again to complete this action.'
    };

    const message = errorMessages[error.code] || error.message || 'An unexpected error occurred.';

    return new AuthError(message, error.code || 'unknown', { operation, originalError: error });
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
    this.authStateListeners.clear();
  }
}

// Export singleton instance
export const authService = new AuthService();

export default AuthService;