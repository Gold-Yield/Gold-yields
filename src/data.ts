/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvestmentPlan } from './types';

import imgDetectorKit from './assets/images/detector_kit_1785752868739.jpg';
import imgHydraulicCrusher from './assets/images/hydraulic_crusher_1785752893683.jpg';
import imgCrucibleChiller from './assets/images/crucible_chiller_1785752905374.jpg';
import imgGoldIngotFilter from './assets/images/gold_ingot_filter_1785752917779.jpg';

export const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: 'vip1_machine',
    name: "Pack Machine VIP 1",
    price: 1800,
    dailyProfit: 1000,
    durationDays: 30,
    totalProfit: 100000,
    iconName: 'Sparkles',
    imageUrl: imgDetectorKit,
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
    imageUrl: imgHydraulicCrusher,
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
    imageUrl: imgCrucibleChiller,
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
    totalProfit: 500000,
    iconName: 'Crown',
    imageUrl: imgGoldIngotFilter,
    colorScheme: {
      from: 'from-yellow-600/60',
      to: 'to-amber-700/50',
      text: 'text-yellow-200',
      glow: 'shadow-amber-500/35'
    }
  }
];
