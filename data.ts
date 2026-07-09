/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvestmentPlan } from './types';

export const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: 'plan_poussiere',
    name: "Plan Poussière d'Or",
    price: 1000,
    dailyProfit: 80,
    durationDays: 30,
    totalProfit: 2400,
    iconName: 'Sparkles',
    colorScheme: {
      from: 'from-yellow-950/40',
      to: 'to-amber-900/30',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/10'
    }
  },
  {
    id: 'plan_pepite',
    name: "Plan Pépite d'Or",
    price: 3000,
    dailyProfit: 250,
    durationDays: 30,
    totalProfit: 7500,
    iconName: 'Sparkles',
    colorScheme: {
      from: 'from-amber-900/40',
      to: 'to-yellow-700/30',
      text: 'text-yellow-400',
      glow: 'shadow-yellow-500/10'
    }
  },
  {
    id: 'plan_lingot',
    name: "Plan Lingot d'Or",
    price: 10000,
    dailyProfit: 900,
    durationDays: 30,
    totalProfit: 27000,
    iconName: 'Coins',
    colorScheme: {
      from: 'from-amber-800/40',
      to: 'to-amber-600/30',
      text: 'text-amber-400',
      glow: 'shadow-amber-400/10'
    }
  },
  {
    id: 'plan_barre',
    name: "Plan Barre d'Or",
    price: 25000,
    dailyProfit: 2400,
    durationDays: 30,
    totalProfit: 72000,
    iconName: 'Layers',
    colorScheme: {
      from: 'from-yellow-900/45',
      to: 'to-yellow-600/30',
      text: 'text-yellow-300',
      glow: 'shadow-yellow-400/15'
    }
  },
  {
    id: 'plan_coffre',
    name: "Plan Coffre-Fort d'Or",
    price: 50000,
    dailyProfit: 5000,
    durationDays: 30,
    totalProfit: 150000,
    iconName: 'Vault',
    colorScheme: {
      from: 'from-yellow-800/50',
      to: 'to-amber-700/35',
      text: 'text-yellow-400',
      glow: 'shadow-yellow-500/20'
    }
  },
  {
    id: 'plan_filon',
    name: "Plan Filon d'Or",
    price: 100000,
    dailyProfit: 11000,
    durationDays: 30,
    totalProfit: 330000,
    iconName: 'Gem',
    colorScheme: {
      from: 'from-amber-700/50',
      to: 'to-yellow-600/45',
      text: 'text-amber-300',
      glow: 'shadow-amber-500/25'
    }
  },
  {
    id: 'plan_mine_royale',
    name: "Plan Mine Royale d'Or",
    price: 250000,
    dailyProfit: 30000,
    durationDays: 30,
    totalProfit: 900000,
    iconName: 'Crown',
    colorScheme: {
      from: 'from-yellow-600/60',
      to: 'to-amber-700/50',
      text: 'text-yellow-200',
      glow: 'shadow-amber-500/35'
    }
  }
];
