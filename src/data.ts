/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvestmentPlan } from './types';

export const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: 'vip1_machine',
    name: "Pack Machine VIP 1",
    price: 1800,
    dailyProfit: 1000,
    durationDays: 30,
    totalProfit: 30000,
    iconName: 'Sparkles',
    colorScheme: {
      from: 'from-amber-950/40',
      to: 'to-amber-900/30',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/10'
    }
  },
  {
    id: 'vip2_article1',
    name: "Broyeur Hydraulique Quartz 24K (VIP 2 • 1/3)",
    price: 25000,
    dailyProfit: 0,
    durationDays: 30,
    totalProfit: 0,
    iconName: 'Coins',
    colorScheme: {
      from: 'from-emerald-950/40',
      to: 'to-emerald-900/30',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/10'
    }
  },
  {
    id: 'vip2_article2',
    name: "Refroidisseur de Creusets d'Or (VIP 2 • 2/3)",
    price: 50000,
    dailyProfit: 0,
    durationDays: 30,
    totalProfit: 0,
    iconName: 'Vault',
    colorScheme: {
      from: 'from-yellow-900/45',
      to: 'to-amber-800/30',
      text: 'text-amber-300',
      glow: 'shadow-amber-400/15'
    }
  },
  {
    id: 'vip2_article3',
    name: "Moule & Filtre Spectrométrique (VIP 2 • 3/3)",
    price: 75000,
    dailyProfit: 3000,
    durationDays: 30,
    totalProfit: 200000,
    iconName: 'Crown',
    colorScheme: {
      from: 'from-yellow-600/60',
      to: 'to-amber-700/50',
      text: 'text-yellow-200',
      glow: 'shadow-amber-500/35'
    }
  }
];
