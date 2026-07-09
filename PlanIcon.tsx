/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, Coins, Layers, Vault, Gem, Crown } from 'lucide-react';

interface PlanIconProps {
  name: string;
  className?: string;
}

export function PlanIcon({ name, className = "w-6 h-6" }: PlanIconProps) {
  switch (name) {
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Coins':
      return <Coins className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Vault':
      return <Vault className={className} />;
    case 'Gem':
      return <Gem className={className} />;
    case 'Crown':
      return <Crown className={className} />;
    default:
      return <Coins className={className} />;
  }
}
