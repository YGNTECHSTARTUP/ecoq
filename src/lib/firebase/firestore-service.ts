/**
 * Production-Grade Firebase Firestore Service
 * 
 * Comprehensive service layer for Firebase Firestore operations with
 * real-time listeners, batch operations, caching, and error handling.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  onSnapshot,
  writeBatch,
  runTransaction,
  serverTimestamp,
  Timestamp,
  DocumentReference,
  Query,
  QuerySnapshot,
  DocumentSnapshot,
  Unsubscribe,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';

import { db } from './firebase';
import {
  COLLECTIONS,
  BaseDocument,
  UserProfile,
  SmartMeter,
  Device,
  EnergyReading,
  Quest,
  UserQuest,
  AnalyticsData,
  Notification,
  BillingInfo,
  CollectionQuery,
  DocumentReference as CustomDocumentReference
} from './schema';

// Service Configuration
interface ServiceConfig {
  enableOffline: boolean;
  cacheTTL: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
  batchSize: number;
}

const DEFAULT_CONFIG: ServiceConfig = {
  enableOffline: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  maxRetries: 3,
  retryDelay: 1000,
  batchSize: 500
};

// Cache Implementation
class DocumentCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set<T>(key: string, data: T, ttl: number = DEFAULT_CONFIG.cacheTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: RegExp): void {
    for (const [key] of this.cache) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Error Types
export class FirestoreServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'FirestoreServiceError';
  }
}

// Service Implementation
export class FirestoreService {
  private config: ServiceConfig;
  private cache: DocumentCache;
  private listeners: Map<string, Unsubscribe> = new Map();

  constructor(config: Partial<ServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new DocumentCache();
    
    if (this.config.enableOffline) {
      this.setupOfflineSupport();
    }
  }

  // Generic CRUD Operations

  /**
   * Create a new document
   */
  async create<T extends BaseDocument>(
    collectionName: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
    customId?: string
  ): Promise<T> {
    try {
      const collectionRef = collection(db, collectionName);
      const now = serverTimestamp();
      
      const docData = {
        ...data,
        createdAt: now,
        updatedAt: now
      } as Omit<T, 'id'>;

      let docRef: DocumentReference;
      
      if (customId) {
        docRef = doc(collectionRef, customId);
        await setDoc(docRef, docData);
      } else {
        docRef = await addDoc(collectionRef, docData);
      }

      const createdDoc = {
        ...docData,
        id: docRef.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      } as T;

      // Cache the created document
      this.cache.set(this.getCacheKey(collectionName, docRef.id), createdDoc);

      return createdDoc;
    } catch (error) {
      throw this.handleError(error, 'create', { collectionName, customId });
    }
  }

  /**
   * Get a document by ID
   */
  async get<T extends BaseDocument>(
    collectionName: string,
    id: string,
    useCache: boolean = true
  ): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(collectionName, id);
      
      // Check cache first
      if (useCache) {
        const cached = this.cache.get<T>(cacheKey);
        if (cached) return cached;
      }

      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = {
        id: docSnap.id,
        ...docSnap.data()
      } as T;

      // Cache the result
      this.cache.set(cacheKey, data);

      return data;
    } catch (error) {
      throw this.handleError(error, 'get', { collectionName, id });
    }
  }

  /**
   * Update a document
   */
  async update<T extends BaseDocument>(
    collectionName: string,
    id: string,
    updates: Partial<Omit<T, 'id' | 'createdAt'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);

      // Invalidate cache
      this.cache.invalidate(this.getCacheKey(collectionName, id));

    } catch (error) {
      throw this.handleError(error, 'update', { collectionName, id, updates });
    }
  }

  /**
   * Delete a document
   */
  async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);

      // Invalidate cache
      this.cache.invalidate(this.getCacheKey(collectionName, id));
      
    } catch (error) {
      throw this.handleError(error, 'delete', { collectionName, id });
    }
  }

  /**
   * Query documents with filters and pagination
   */
  async query<T extends BaseDocument>(
    collectionName: string,
    options: CollectionQuery<T> = {}
  ): Promise<T[]> {
    try {
      let q = collection(db, collectionName) as Query;

      // Apply where clauses
      if (options.where) {
        for (const [field, operator, value] of options.where) {
          q = query(q, where(field, operator, value));
        }
      }

      // Apply ordering
      if (options.orderBy) {
        for (const [field, direction] of options.orderBy) {
          q = query(q, orderBy(field, direction));
        }
      }

      // Apply pagination
      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }
      
      if (options.endBefore) {
        q = query(q, endBefore(options.endBefore));
      }
      
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

    } catch (error) {
      throw this.handleError(error, 'query', { collectionName, options });
    }
  }

  /**
   * Real-time listener for a document
   */
  onDocument<T extends BaseDocument>(
    collectionName: string,
    id: string,
    callback: (data: T | null) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const docRef = doc(db, collectionName, id);
    const listenerKey = `${collectionName}:${id}`;

    // Remove existing listener if any
    const existingListener = this.listeners.get(listenerKey);
    if (existingListener) {
      existingListener();
    }

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = {
            id: docSnap.id,
            ...docSnap.data()
          } as T;
          
          // Update cache
          this.cache.set(this.getCacheKey(collectionName, id), data);
          callback(data);
        } else {
          callback(null);
        }
      },
      (error) => {
        const serviceError = this.handleError(error, 'onDocument', { collectionName, id });
        if (onError) {
          onError(serviceError);
        } else {
          console.error('Document listener error:', serviceError);
        }
      }
    );

    this.listeners.set(listenerKey, unsubscribe);
    return unsubscribe;
  }

  /**
   * Real-time listener for a collection query
   */
  onQuery<T extends BaseDocument>(
    collectionName: string,
    options: CollectionQuery<T> = {},
    callback: (data: T[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      let q = collection(db, collectionName) as Query;

      // Apply query options (same as query method)
      if (options.where) {
        for (const [field, operator, value] of options.where) {
          q = query(q, where(field, operator, value));
        }
      }

      if (options.orderBy) {
        for (const [field, direction] of options.orderBy) {
          q = query(q, orderBy(field, direction));
        }
      }

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      return onSnapshot(
        q,
        (querySnapshot) => {
          const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as T[];
          callback(data);
        },
        (error) => {
          const serviceError = this.handleError(error, 'onQuery', { collectionName, options });
          if (onError) {
            onError(serviceError);
          } else {
            console.error('Query listener error:', serviceError);
          }
        }
      );

    } catch (error) {
      throw this.handleError(error, 'onQuery', { collectionName, options });
    }
  }

  /**
   * Batch write operations
   */
  async batch(operations: BatchOperation[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      for (const op of operations) {
        const docRef = doc(db, op.collection, op.id);
        
        switch (op.type) {
          case 'set':
            batch.set(docRef, {
              ...op.data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...op.data,
              updatedAt: serverTimestamp()
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      }

      await batch.commit();

      // Invalidate relevant cache entries
      for (const op of operations) {
        this.cache.invalidate(this.getCacheKey(op.collection, op.id));
      }

    } catch (error) {
      throw this.handleError(error, 'batch', { operations });
    }
  }

  /**
   * Transaction operations
   */
  async transaction<T>(
    updateFunction: (transaction: any) => Promise<T>
  ): Promise<T> {
    try {
      return await runTransaction(db, updateFunction);
    } catch (error) {
      throw this.handleError(error, 'transaction', {});
    }
  }

  // Specialized Methods for EcoQuest

  /**
   * User Profile Management
   */
  async createUserProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    return this.create<UserProfile>(COLLECTIONS.USERS, profile, profile.uid);
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    return this.get<UserProfile>(COLLECTIONS.USERS, uid);
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    return this.update<UserProfile>(COLLECTIONS.USERS, uid, updates);
  }

  /**
   * Smart Meter Management
   */
  async createSmartMeter(meter: Omit<SmartMeter, 'id' | 'createdAt' | 'updatedAt'>): Promise<SmartMeter> {
    return this.create<SmartMeter>(COLLECTIONS.SMART_METERS, meter);
  }

  async getSmartMetersByUser(userId: string): Promise<SmartMeter[]> {
    return this.query<SmartMeter>(COLLECTIONS.SMART_METERS, {
      where: [['userId', '==', userId]],
      orderBy: [['createdAt', 'desc']]
    });
  }

  async getSmartMeter(meterId: string): Promise<SmartMeter | null> {
    return this.get<SmartMeter>(COLLECTIONS.SMART_METERS, meterId);
  }

  async updateSmartMeter(meterId: string, updates: Partial<SmartMeter>): Promise<void> {
    return this.update<SmartMeter>(COLLECTIONS.SMART_METERS, meterId, updates);
  }

  /**
   * Device Management
   */
  async createDevice(device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Promise<Device> {
    return this.create<Device>(COLLECTIONS.DEVICES, device);
  }

  async getDevicesByUser(userId: string): Promise<Device[]> {
    return this.query<Device>(COLLECTIONS.DEVICES, {
      where: [['userId', '==', userId]],
      orderBy: [['createdAt', 'desc']]
    });
  }

  async getDevicesBySmartMeter(smartMeterId: string): Promise<Device[]> {
    return this.query<Device>(COLLECTIONS.DEVICES, {
      where: [['smartMeterId', '==', smartMeterId]],
      orderBy: [['info.name', 'asc']]
    });
  }

  async updateDevice(deviceId: string, updates: Partial<Device>): Promise<void> {
    return this.update<Device>(COLLECTIONS.DEVICES, deviceId, updates);
  }

  async deleteDevice(deviceId: string): Promise<void> {
    return this.delete(COLLECTIONS.DEVICES, deviceId);
  }

  /**
   * Energy Readings
   */
  async saveEnergyReading(reading: Omit<EnergyReading, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnergyReading> {
    return this.create<EnergyReading>(COLLECTIONS.READINGS, reading);
  }

  async getRecentReadings(userId: string, limit: number = 100): Promise<EnergyReading[]> {
    return this.query<EnergyReading>(COLLECTIONS.READINGS, {
      where: [['userId', '==', userId]],
      orderBy: [['reading.timestamp', 'desc']],
      limit
    });
  }

  async getReadingsByDateRange(
    userId: string,
    startDate: Timestamp,
    endDate: Timestamp
  ): Promise<EnergyReading[]> {
    return this.query<EnergyReading>(COLLECTIONS.READINGS, {
      where: [
        ['userId', '==', userId],
        ['reading.timestamp', '>=', startDate],
        ['reading.timestamp', '<=', endDate]
      ],
      orderBy: [['reading.timestamp', 'asc']]
    });
  }

  /**
   * Quest System
   */
  async createQuest(quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quest> {
    return this.create<Quest>(COLLECTIONS.QUESTS, quest);
  }

  async getActiveQuests(): Promise<Quest[]> {
    const now = Timestamp.now();
    return this.query<Quest>(COLLECTIONS.QUESTS, {
      where: [
        ['metadata.isActive', '==', true],
        ['availability.startDate', '<=', now],
        ['availability.endDate', '>=', now]
      ],
      orderBy: [['definition.difficulty', 'asc'], ['rewards.points', 'desc']]
    });
  }

  async createUserQuest(userQuest: Omit<UserQuest, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserQuest> {
    return this.create<UserQuest>(COLLECTIONS.USER_QUESTS, userQuest);
  }

  async getUserQuests(userId: string, status?: string): Promise<UserQuest[]> {
    const where: [string, any, any][] = [['userId', '==', userId]];
    
    if (status) {
      where.push(['progress.status', '==', status]);
    }

    return this.query<UserQuest>(COLLECTIONS.USER_QUESTS, {
      where,
      orderBy: [['progress.startedAt', 'desc']]
    });
  }

  async updateUserQuestProgress(
    userQuestId: string,
    progress: Partial<UserQuest['progress']>
  ): Promise<void> {
    return this.update<UserQuest>(COLLECTIONS.USER_QUESTS, userQuestId, {
      progress: progress as any
    });
  }

  /**
   * Analytics
   */
  async saveAnalytics(analytics: Omit<AnalyticsData, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnalyticsData> {
    return this.create<AnalyticsData>(COLLECTIONS.ANALYTICS, analytics);
  }

  async getAnalyticsByPeriod(
    userId: string,
    periodType: AnalyticsData['period']['type'],
    startDate: Timestamp,
    endDate: Timestamp
  ): Promise<AnalyticsData[]> {
    return this.query<AnalyticsData>(COLLECTIONS.ANALYTICS, {
      where: [
        ['userId', '==', userId],
        ['period.type', '==', periodType],
        ['period.startDate', '>=', startDate],
        ['period.endDate', '<=', endDate]
      ],
      orderBy: [['period.startDate', 'asc']]
    });
  }

  /**
   * Notifications
   */
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
    return this.create<Notification>(COLLECTIONS.NOTIFICATIONS, notification);
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return this.query<Notification>(COLLECTIONS.NOTIFICATIONS, {
      where: [['userId', '==', userId]],
      orderBy: [['createdAt', 'desc']],
      limit
    });
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.update<Notification>(COLLECTIONS.NOTIFICATIONS, notificationId, {
      'status.isRead': true,
      'status.readAt': serverTimestamp()
    } as any);
  }

  // Utility Methods

  private getCacheKey(collection: string, id: string): string {
    return `${collection}:${id}`;
  }

  private handleError(error: any, operation: string, context: any): FirestoreServiceError {
    console.error(`Firestore ${operation} error:`, error, context);
    
    return new FirestoreServiceError(
      `Failed to ${operation}: ${error.message}`,
      error.code || 'unknown',
      { operation, context, originalError: error }
    );
  }

  private async setupOfflineSupport(): Promise<void> {
    try {
      // Enable offline persistence
      await enableNetwork(db);
    } catch (error) {
      console.warn('Failed to enable offline support:', error);
    }
  }

  /**
   * Clean up all listeners
   */
  cleanup(): void {
    for (const [key, unsubscribe] of this.listeners) {
      unsubscribe();
    }
    this.listeners.clear();
    this.cache.clear();
  }

  /**
   * Enable/Disable network
   */
  async enableNetwork(): Promise<void> {
    await enableNetwork(db);
  }

  async disableNetwork(): Promise<void> {
    await disableNetwork(db);
  }
}

// Batch Operation Type
export interface BatchOperation {
  type: 'set' | 'update' | 'delete';
  collection: string;
  id: string;
  data?: any;
}

// Export singleton instance
export const firestoreService = new FirestoreService();

export default FirestoreService;