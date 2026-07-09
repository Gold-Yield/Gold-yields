/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InvestmentPlan {
  id: string;
  name: string;
  price: number;
  dailyProfit: number;
  durationDays: number;
  totalProfit: number;
  iconName: string; // Name of the lucide-react icon to render
  colorScheme: {
    from: string;
    to: string;
    text: string;
    glow: string;
  };
}

export interface ActiveInvestment {
  id: string;
  planId: string;
  planName: string;
  price: number;
  dailyProfit: number;
  dateActivated: string;
  lastCollectedDate: string;
  totalCollected: number;
  totalProfit: number;
  durationDays: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'collect';
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  details?: string;
}

export interface UserState {
  isLoggedIn: boolean;
  name: string;
  phone: string;
  balance: number;
  inviteCode: string;
  activeInvestments: ActiveInvestment[];
  transactions: Transaction[];
  totalCollected: number;
}
