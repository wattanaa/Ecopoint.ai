import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { User, Reward, AppSettings, Activity, ScanResult, TierName, LeaderboardUser } from '../types';
import * as db from '../data/db';
import { TIERS } from '../constants';

interface AppDataContextType {
  // State
  isLoading: boolean;
  currentUser: User | null;
  users: User[];
  rewards: Reward[];
  settings: AppSettings | null;
  leaderboardData: LeaderboardUser[];
  
  // Functions
  checkUserExists: (phone: string) => boolean;
  loginUser: (phone: string) => void;
  logout: () => void;
  addActivity: (userId: string, activityInfo: Omit<Activity, 'id' | 'timestamp'>, scanResult?: ScanResult) => void;
  updateUserName: (userId: string, name: string) => void;
  
  // Admin Functions
  updateUserAdmin: (user: User) => void;
  deleteUserAdmin: (userId: string) => void;
  saveRewardAdmin: (reward: Reward) => void;
  deleteRewardAdmin: (rewardId: string) => void;
  saveSettingsAdmin: (settings: AppSettings) => void;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const calculateTier = useCallback((points: number, tiersConfig: Record<TierName, {min: number, max: number}>): TierName => {
    // Iterate backwards to catch higher tiers first
    const tierNames = Object.keys(tiersConfig).reverse() as TierName[];
    for (const tierName of tierNames) {
        const tier = tiersConfig[tierName];
        if (points >= tier.min) {
            return tierName;
        }
    }
    return 'Bronze';
  }, []);

  const refreshData = useCallback(() => {
    setUsers(db.dbGetUsers());
    setRewards(db.dbGetRewards());
    setSettings(db.dbGetSettings());
  }, []);

  useEffect(() => {
    setIsLoading(true);
    refreshData();
    const savedUserId = localStorage.getItem('ecoPointUserId');
    if (savedUserId) {
      const user = db.dbGetUser(savedUserId);
      setCurrentUser(user || null);
    }
    setIsLoading(false);
  }, [refreshData]);

  const checkUserExists = useCallback((phone: string) => {
      return !!db.dbGetUserByPhone(phone);
  }, []);

  const loginUser = useCallback((phone: string) => {
    let user = db.dbGetUserByPhone(phone);
    if (!user) {
      user = db.dbCreateUser(phone);
      refreshData(); // Refresh user list after creation
    }
    localStorage.setItem('ecoPointUserId', user.id);
    setCurrentUser(user);
  }, [refreshData]);

  const logout = useCallback(() => {
    localStorage.removeItem('ecoPointUserId');
    setCurrentUser(null);
  }, []);

  const updateUserState = useCallback((updatedUser: User) => {
    // Update the full user list
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    // Update the current user if they are the one being changed
    if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  }, [currentUser?.id]);

  const addActivity = useCallback((userId: string, activityInfo: Omit<Activity, 'id' | 'timestamp'>, scanResult?: ScanResult) => {
    const user = db.dbGetUser(userId);
    if (!user || !settings) return;

    const newActivity: Activity = { ...activityInfo, id: Date.now(), timestamp: new Date().toISOString() };
    const updatedPoints = user.points + activityInfo.points;
    
    const updatedUser: User = {
      ...user,
      points: updatedPoints,
      totalBottles: user.totalBottles + (scanResult?.bottles || 0),
      totalCups: user.totalCups + (scanResult?.cups || 0), // Changed from totalCans
      totalGlass: user.totalGlass + (scanResult?.glass || 0),
      history: [newActivity, ...user.history.slice(0, 49)],
      tier: calculateTier(updatedPoints, settings.tiers),
    };
    db.dbUpdateUser(updatedUser);
    updateUserState(updatedUser);
  }, [settings, calculateTier, updateUserState]);

  const updateUserName = useCallback((userId: string, name: string) => {
    const user = db.dbGetUser(userId);
    if (!user) return;
    const updatedUser = { ...user, name };
    db.dbUpdateUser(updatedUser);
    updateUserState(updatedUser);
  }, [updateUserState]);
  
  // Admin functions
  const updateUserAdmin = useCallback((user: User) => {
    const updatedUser = db.dbUpdateUser(user);
    updateUserState(updatedUser);
  }, [updateUserState]);

  const deleteUserAdmin = useCallback((userId: string) => {
    db.dbDeleteUser(userId);
    refreshData();
    if(currentUser?.id === userId) {
        logout();
    }
  }, [refreshData, currentUser?.id, logout]);

  const saveRewardAdmin = useCallback((reward: Reward) => {
    const newId = reward.id || crypto.randomUUID();
    db.dbSaveReward({ ...reward, id: newId });
    refreshData();
  }, [refreshData]);

  const deleteRewardAdmin = useCallback((rewardId: string) => {
    db.dbDeleteReward(rewardId);
    refreshData();
  }, [refreshData]);

  const saveSettingsAdmin = useCallback((newSettings: AppSettings) => {
    db.dbSaveSettings(newSettings);
    // After saving settings, re-calculate tiers for all users
    const allUsers = db.dbGetUsers();
    allUsers.forEach(user => {
      const newTier = calculateTier(user.points, newSettings.tiers);
      if (user.tier !== newTier) {
        db.dbUpdateUser({ ...user, tier: newTier });
      }
    });
    refreshData();
  }, [refreshData, calculateTier]);

  const leaderboardData = useMemo(() => {
    return users
      .map(u => ({ id: u.id, name: u.name, points: u.points, tier: u.tier }))
      .sort((a, b) => b.points - a.points);
  }, [users]);
  
  const value = useMemo(() => ({
    isLoading,
    currentUser,
    users,
    rewards,
    settings,
    leaderboardData,
    checkUserExists,
    loginUser,
    logout,
    addActivity,
    updateUserName,
    updateUserAdmin,
    deleteUserAdmin,
    saveRewardAdmin,
    deleteRewardAdmin,
    saveSettingsAdmin,
  }), [
    isLoading, currentUser, users, rewards, settings, leaderboardData,
    checkUserExists, loginUser, logout, addActivity, updateUserName,
    updateUserAdmin, deleteUserAdmin, saveRewardAdmin, deleteRewardAdmin, saveSettingsAdmin
  ]);

  return React.createElement(AppDataContext.Provider, { value: value }, children);
};