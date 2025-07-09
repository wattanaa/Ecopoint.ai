import type React from 'react';
import { VALID_REWARD_ICONS } from './constants';

export type Screen = 'dashboard' | 'scan' | 'rewards' | 'profile' | 'leaderboard';
export type AdminScreen = 'overview' | 'users' | 'rewards' | 'settings';

export type TierName = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
export type RewardIconName = typeof VALID_REWARD_ICONS[number];

export interface Activity {
  id: number;
  description: string;
  points: number;
  timestamp: string;
  type: 'earn' | 'redeem';
}

export interface Tier {
  name: TierName;
  min: number;
  max: number;
  bonus: number;
  badge: string;
  class: string;
}

export interface User {
  id: string; // Changed to string for UUID
  name: string;
  phone: string;
  points: number;
  totalBottles: number;
  totalCups: number; // Changed from totalCans
  totalGlass: number;
  tier: TierName;
  history: Activity[];
  joinDate: string;
}

export interface Reward {
  id: string; // Changed to string for UUID
  name: string;
  description: string;
  cost: number;
  iconName: RewardIconName; // Use a safe, predefined list of icons
  gradient: string;
  borderColor: string;
  iconBg: string;
}

export interface DetectedItem {
  name: 'bottle' | 'cup' | 'glassware'; // Renamed for clarity
  count: number;
}

export interface DetectedObject {
    bbox: [number, number, number, number];
    class: string;
    score: number;
}

export interface ScanResult {
    bottles: number;
    cups: number; // Changed from cans
    glass: number;
}

export interface LeaderboardUser {
    id: string;
    name: string;
    points: number;
    tier: TierName;
}

export interface AppSettings {
  points: {
    bottle: number;
    cup: number; // Changed from can
    glass: number;
  };
  tiers: Record<TierName, { min: number, max: number }>;
}