/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, TrendingUp, Sparkles, UserCheck } from 'lucide-react';

interface NotificationItem {
  id: string;
  phone: string;
  amount: number;
  type: 'deposit' | 'investment' | 'withdrawal';
  timeAgo: string;
  planName?: string;
}

const PHONE_PREFIXES = ['+225', '+221', '+229', '+228', '+223', '+242', '+237'];
const FIRST_NAMES = ['Jean', 'Koffi', 'Moussa', 'Amadou', 'Oumar', 'Mariam', 'Awa', 'Fatou', 'Aminata', 'Bakary', 'Yao', 'Kouassi', 'Sékou'];
const AMOUNTS = [1000, 3000, 5000, 10000, 25000, 50000, 100000, 250000];
const PLANS = ["Poussière d'Or", "Pépite d'Or", "Lingot d'Or", "Barre d'Or", "Coffre-Fort d'Or", "Filon d'Or"];

function generateRandomNotification(): NotificationItem {
  const prefix = PHONE_PREFIXES[Math.floor(Math.random() * PHONE_PREFIXES.length)];
  const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  
  // Masked number pattern: +225 •••• XX XX
  const part1 = Math.floor(10 + Math.random() * 90);
  const part2 = Math.floor(10 + Math.random() * 90);
  const maskedPhone = `${prefix} •••• ${part1} ${part2}`;

  const typeRand = Math.random();
  let type: 'deposit' | 'investment' | 'withdrawal' = 'deposit';
  let amount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
  let planName = undefined;

  if (typeRand < 0.4) {
    type = 'deposit';
    // Ensure deposit amounts start from 3000 FCFA
    const depositAmounts = AMOUNTS.filter(a => a >= 3000);
    amount = depositAmounts[Math.floor(Math.random() * depositAmounts.length)];
  } else if (typeRand < 0.8) {
    type = 'investment';
    planName = PLANS[Math.floor(Math.random() * PLANS.length)];
    // Set appropriate price for the selected plan
    if (planName.includes("Poussière")) amount = 1000;
    else if (planName.includes("Pépite")) amount = 3000;
    else if (planName.includes("Lingot")) amount = 10000;
    else if (planName.includes("Barre")) amount = 25000;
    else if (planName.includes("Coffre")) amount = 50000;
    else if (planName.includes("Filon")) amount = 100000;
  } else {
    type = 'withdrawal';
    // Withdrawal amounts are usually random fractions
    amount = Math.floor(5 + Math.random() * 45) * 1000;
  }

  return {
    id: `live_notif_${Date.now()}_${Math.random()}`,
    phone: `${name} (${maskedPhone})`,
    amount,
    type,
    timeAgo: "À l'instant",
    planName
  };
}

export function LiveNotification() {
  const [currentNotif, setCurrentNotif] = useState<NotificationItem | null>(null);

  useEffect(() => {
    // Show the first notification shortly after mounting (5 seconds)
    const firstTimeout = setTimeout(() => {
      setCurrentNotif(generateRandomNotification());
    }, 5000);

    // Setup recurring interval of 40 seconds for receipt popups
    const interval = setInterval(() => {
      setCurrentNotif(null); // Clear previous
      
      // Delay slightly to trigger enter transition smoothly
      setTimeout(() => {
        setCurrentNotif(generateRandomNotification());
      }, 500);
    }, 40000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []);

  // Auto-hide notification after 7 seconds
  useEffect(() => {
    if (currentNotif) {
      const autoHide = setTimeout(() => {
        setCurrentNotif(null);
      }, 7000);
      return () => clearTimeout(autoHide);
    }
  }, [currentNotif]);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-xs md:max-w-sm pointer-events-none px-4 md:px-0">
      <AnimatePresence>
        {currentNotif && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="pointer-events-auto w-full bg-slate-900/95 backdrop-blur-md border border-gold-500/25 rounded-2xl p-4 shadow-[0_10px_35px_rgba(212,175,55,0.12)] flex items-start gap-3"
          >
            {/* Left status badge with icon */}
            <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
              currentNotif.type === 'deposit' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
              currentNotif.type === 'withdrawal' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-gold-500/10 border-gold-500/20 text-gold-400'
            }`}>
              {currentNotif.type === 'deposit' ? <CheckCircle2 className="w-4 h-4" /> :
               currentNotif.type === 'withdrawal' ? <TrendingUp className="w-4 h-4" /> :
               <Sparkles className="w-4 h-4" />}
            </div>

            {/* Content information */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {currentNotif.type === 'deposit' ? 'Recharge Réussie' :
                   currentNotif.type === 'withdrawal' ? 'Retrait Validé' :
                   'Contrat Activé'}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">{currentNotif.timeAgo}</span>
              </div>

              <p className="text-xs font-semibold text-white">
                {currentNotif.phone}
              </p>

              <p className="text-xs text-slate-300">
                {currentNotif.type === 'deposit' && (
                  <>
                    A effectué un dépôt de <strong className="text-green-400 font-mono">{currentNotif.amount.toLocaleString('fr-FR')} FCFA</strong>
                  </>
                )}
                {currentNotif.type === 'withdrawal' && (
                  <>
                    A retiré avec succès <strong className="text-amber-400 font-mono">{currentNotif.amount.toLocaleString('fr-FR')} FCFA</strong>
                  </>
                )}
                {currentNotif.type === 'investment' && (
                  <>
                    A activé le <strong className="text-gold-400">{currentNotif.planName}</strong> pour <strong className="text-white font-mono">{currentNotif.amount.toLocaleString('fr-FR')} FCFA</strong>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
