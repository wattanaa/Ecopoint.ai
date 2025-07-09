import React from 'react';
import { type Tier, type TierName } from './types';

export const TIERS: Record<TierName, Tier> = {
  Bronze: { name: 'Bronze', min: 0, max: 499, bonus: 1.0, badge: 'B', class: 'bg-gradient-to-br from-amber-500 to-yellow-700' },
  Silver: { name: 'Silver', min: 500, max: 1999, bonus: 1.1, badge: 'S', class: 'bg-gradient-to-br from-slate-400 to-gray-500' },
  Gold: { name: 'Gold', min: 2000, max: 4999, bonus: 1.2, badge: 'G', class: 'bg-gradient-to-br from-yellow-400 to-amber-500' },
  Platinum: { name: 'Platinum', min: 5000, max: 9999, bonus: 1.3, badge: 'P', class: 'bg-gradient-to-br from-cyan-200 to-teal-400' },
  Diamond: { name: 'Diamond', min: 10000, max: Infinity, bonus: 1.5, badge: 'D', class: 'bg-gradient-to-br from-sky-300 to-blue-500' }
};

export const TIERS_ARRAY = Object.values(TIERS);

// A list of valid icon names for rewards, to be used for type safety and in forms.
export const VALID_REWARD_ICONS = [
    'ShoppingBag', 
    'Coffee', 
    'Box', 
    'Shirt', 
    'Gift', 
    'Sprout'
] as const;
