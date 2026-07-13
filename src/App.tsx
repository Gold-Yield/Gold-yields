/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { OrderScreen } from './components/OrderScreen';
import { RechargeScreen } from './components/RechargeScreen';
import { WithdrawScreen } from './components/WithdrawScreen';
import { BonusModal } from './components/BonusModal';
import { TopBar } from './components/TopBar';
import { Footer } from './components/Footer';
import { LiveNotification } from './components/LiveNotification';
import { InvestmentPlan, ActiveInvestment, Transaction } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, AlertCircle, Sparkles, X } from 'lucide-react';

const calculateAccruedEarnings = (activePlans: any[], lastTime: number, now: number): number => {
  if (!activePlans || activePlans.length === 0 || lastTime >= now) return 0;
  
  let totalAccrued = 0;
  for (const item of activePlans) {
    const t_start = new Date(item.dateActivated).getTime();
    const durationDays = item.durationDays || 30;
    const t_end = t_start + durationDays * 24 * 60 * 60 * 1000;
    
    // Intersection of [lastTime, now] and [t_start, t_end]
    const overlap_start = Math.max(lastTime, t_start);
    const overlap_end = Math.min(now, t_end);
    
    if (overlap_end > overlap_start) {
      const elapsedSeconds = (overlap_end - overlap_start) / 1000;
      const profitPerSec = (item.dailyProfit || 0) / 86400;
      totalAccrued += elapsedSeconds * profitPerSec;
    }
  }
  return totalAccrued;
};

export default function App() {
  // Screen routing states: 'auth' | 'dashboard' | 'order' | 'recharge' | 'withdraw'
  const [screen, setScreen] = useState<'auth' | 'dashboard' | 'order' | 'recharge' | 'withdraw'>('auth');
  
  // User Authentication & wallet states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Investisseur Gold');
  const [userPhone, setUserPhone] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [inviteCode, setInviteCode] = useState<string>('GOLDYIELD');
  const [schemaCacheStale, setSchemaCacheStale] = useState<boolean>(false);
  
  // Lists
  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Real-time ticking profit
  const [claimableSum, setClaimableSum] = useState<number>(0);
  const [lastTickTime, setLastTickTime] = useState<number>(Date.now());

  // Elegant Custom Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
  };

  // Auto-close Toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Refs to prevent interval resets on state updates
  const activeInvestmentsRef = useRef<ActiveInvestment[]>(activeInvestments);
  const lastTickTimeRef = useRef<number>(lastTickTime);
  const claimableSumRef = useRef<number>(claimableSum);

  // Synchronize refs with state updates
  useEffect(() => {
    activeInvestmentsRef.current = activeInvestments;
  }, [activeInvestments]);

  useEffect(() => {
    lastTickTimeRef.current = lastTickTime;
  }, [lastTickTime]);

  useEffect(() => {
    claimableSumRef.current = claimableSum;
  }, [claimableSum]);

  // UI helpers
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [isBonusOpen, setIsBonusOpen] = useState<boolean>(false);

  // 1. Initial hydration from database (with local storage as fallback)
  useEffect(() => {
    const savedLogged = localStorage.getItem('gy_logged');
    if (savedLogged === 'true') {
      const phone = localStorage.getItem('gy_current_phone');
      if (phone) {
        fetch(`/api/auth/profile?phone=${encodeURIComponent(phone)}`)
          .then((res) => {
            if (!res.ok) throw new Error('DB fetch failed');
            return res.json();
          })
          .then((data) => {
            if (data.success) {
              setIsLoggedIn(true);
              setUserPhone(data.user.phone);
              setUserName(data.user.name);
              setBalance(data.user.balance);
              setInviteCode(data.user.inviteCode);
              setSchemaCacheStale(data.schemaCacheStale || false);
              
              // Prevent counter reset on reload: merge DB values with the most up-to-date localStorage values
              const localClaimableStr = localStorage.getItem(`gy_${data.user.phone}_claimable`);
              const localTickStr = localStorage.getItem(`gy_${data.user.phone}_last_tick`);
              const localClaimable = localClaimableStr ? parseFloat(localClaimableStr) : 0;
              const localTick = localTickStr ? parseInt(localTickStr) : 0;

              const dbClaimable = data.user.claimableSum || 0;
              const dbTick = data.user.lastTickTime || 0;

              let finalClaimable = Math.max(dbClaimable, localClaimable);
              let finalTick = Math.max(dbTick, localTick);
              if (finalTick === 0) finalTick = Date.now();

              // Calculate retroactive offline earnings immediately in the loader
              const activePlans = data.activeInvestments || [];
              const now = Date.now();
              const elapsedMs = now - finalTick;
              if (elapsedMs > 2000 && activePlans.length > 0) {
                const accruedOffline = calculateAccruedEarnings(activePlans, finalTick, now);
                finalClaimable += accruedOffline;
                finalTick = now;
              }

              setClaimableSum(finalClaimable);
              setLastTickTime(finalTick);
              setActiveInvestments(activePlans);
              setTransactions(data.transactions || []);
              setScreen('dashboard');
            }
          })
          .catch((err) => {
            console.warn('[DB Hydration Warning - Using fallback local storage]:', err);
            // Fallback
            setIsLoggedIn(true);
            setUserPhone(phone);
            setUserName(localStorage.getItem(`gy_${phone}_name`) || 'Investisseur Gold');
            setBalance(parseInt(localStorage.getItem(`gy_${phone}_balance`) || '1000'));
            setInviteCode(localStorage.getItem(`gy_${phone}_invite`) || 'GOLDYIELD');
            
            const savedPlans = localStorage.getItem(`gy_${phone}_active_plans`);
            const activePlans = savedPlans ? JSON.parse(savedPlans) : [];
            setActiveInvestments(activePlans);
            
            const savedTx = localStorage.getItem(`gy_${phone}_transactions`);
            if (savedTx) setTransactions(JSON.parse(savedTx));

            const savedClaimable = localStorage.getItem(`gy_${phone}_claimable`);
            let finalClaimable = savedClaimable ? parseFloat(savedClaimable) : 0;

            const savedTick = localStorage.getItem(`gy_${phone}_last_tick`);
            let finalTick = savedTick ? parseInt(savedTick) : Date.now();

            const now = Date.now();
            const elapsedMs = now - finalTick;
            if (elapsedMs > 2000 && activePlans.length > 0) {
              const accruedOffline = calculateAccruedEarnings(activePlans, finalTick, now);
              finalClaimable += accruedOffline;
              finalTick = now;
            }

            setClaimableSum(finalClaimable);
            setLastTickTime(finalTick);
            setScreen('dashboard');
          });
      }
    }
  }, []);

  // 2. State persistence local backup effect
  useEffect(() => {
    if (isLoggedIn && userPhone) {
      localStorage.setItem('gy_logged', 'true');
      localStorage.setItem('gy_current_phone', userPhone);
      localStorage.setItem(`gy_${userPhone}_name`, userName);
      localStorage.setItem(`gy_${userPhone}_balance`, balance.toString());
      localStorage.setItem(`gy_${userPhone}_invite`, inviteCode);
      localStorage.setItem(`gy_${userPhone}_active_plans`, JSON.stringify(activeInvestments));
      localStorage.setItem(`gy_${userPhone}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`gy_${userPhone}_claimable`, claimableSum.toString());
      localStorage.setItem(`gy_${userPhone}_last_tick`, lastTickTime.toString());
    }
  }, [isLoggedIn, userName, userPhone, balance, inviteCode, activeInvestments, transactions, claimableSum, lastTickTime]);

  // 2.5 Periodic Yield Database Sync (Every 15s)
  useEffect(() => {
    if (!isLoggedIn || !userPhone) return;

    const syncInterval = setInterval(() => {
      fetch('/api/user/sync-tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userPhone,
          claimableSum: claimableSumRef.current,
          lastTickTime: lastTickTimeRef.current
        }),
      }).catch((err) => console.warn('[Database background sync yield status deferred]:', err));
    }, 15000);

    return () => clearInterval(syncInterval);
  }, [isLoggedIn, userPhone]);

  // 3. Real-time Yield accumulation ticker
  useEffect(() => {
    if (!isLoggedIn) return;

    // Ticking interval: every second
    const interval = setInterval(() => {
      const activeList = activeInvestmentsRef.current;
      if (activeList.length === 0) return;

      const now = Date.now();
      const lastTime = lastTickTimeRef.current;
      const elapsedMs = now - lastTime;

      if (elapsedMs > 0) {
        const accrued = calculateAccruedEarnings(activeList, lastTime, now);
        setClaimableSum((prev) => prev + accrued);
      }
      
      lastTickTimeRef.current = now;
      setLastTickTime(now);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Auth Success action handler (from database)
  const handleLoginSuccess = (user: any, investmentsList: any[], transactionsList: any[], isStale?: boolean) => {
    setUserName(user.name);
    setUserPhone(user.phone);
    setInviteCode(user.inviteCode);
    setBalance(user.balance);
    setSchemaCacheStale(isStale || false);

    // Merge with local storage values to prevent counter reset on reload
    const localClaimableStr = localStorage.getItem(`gy_${user.phone}_claimable`);
    const localTickStr = localStorage.getItem(`gy_${user.phone}_last_tick`);
    const localClaimable = localClaimableStr ? parseFloat(localClaimableStr) : 0;
    const localTick = localTickStr ? parseInt(localTickStr) : 0;

    const dbClaimable = user.claimableSum || 0;
    const dbTick = user.lastTickTime || 0;

    let finalClaimable = Math.max(dbClaimable, localClaimable);
    let finalTick = Math.max(dbTick, localTick);
    if (finalTick === 0) finalTick = Date.now();

    // Calculate retroactive offline earnings immediately in the login loader
    const activePlans = investmentsList || [];
    const now = Date.now();
    const elapsedMs = now - finalTick;
    if (elapsedMs > 2000 && activePlans.length > 0) {
      const elapsedSeconds = elapsedMs / 1000;
      const totalDailyRevenue = activePlans.reduce((sum: number, item: any) => sum + item.dailyProfit, 0);
      const profitPerSec = totalDailyRevenue / 86400;
      const accruedOffline = elapsedSeconds * profitPerSec;
      finalClaimable += accruedOffline;
      finalTick = now;
    }

    setClaimableSum(finalClaimable);
    setLastTickTime(finalTick);
    setActiveInvestments(activePlans);
    setTransactions(transactionsList || []);

    // Check if new user for welcome modal trigger
    const welcomeSeen = localStorage.getItem(`gy_${user.phone}_welcome_seen`);
    if (!welcomeSeen) {
      localStorage.setItem(`gy_${user.phone}_welcome_seen`, 'true');
      setIsBonusOpen(true);
    } else {
      setIsBonusOpen(false);
    }

    setIsLoggedIn(true);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setScreen('auth');
    localStorage.removeItem('gy_logged');
    localStorage.removeItem('gy_current_phone');
    setUserName('Investisseur Gold');
    setUserPhone('');
    setBalance(0);
    setActiveInvestments([]);
    setTransactions([]);
    setClaimableSum(0);
  };

  // Buy active investment handler (using Supabase backend API)
  const handlePurchaseSuccess = async (price: number, plan: InvestmentPlan) => {
    try {
      const res = await fetch('/api/user/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userPhone,
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          dailyProfit: plan.dailyProfit,
          durationDays: plan.durationDays,
          totalProfit: plan.totalProfit
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'achat.');

      // Update local states from DB response
      setBalance(data.balance);

      const newActive: ActiveInvestment = {
        id: data.investment.id,
        planId: data.investment.planId,
        planName: data.investment.planName,
        price: data.investment.price,
        dailyProfit: data.investment.dailyProfit,
        dateActivated: data.investment.dateActivated,
        lastCollectedDate: data.investment.lastCollectedDate,
        totalCollected: data.investment.totalCollected,
        totalProfit: data.investment.totalProfit,
        durationDays: data.investment.durationDays,
      };

      // Reset ticker's reference time to the moment of this purchase
      const now = Date.now();
      lastTickTimeRef.current = now;
      setLastTickTime(now);

      setActiveInvestments((prev) => [newActive, ...prev]);

      const tx: Transaction = {
        id: data.transaction.id,
        type: data.transaction.type,
        amount: data.transaction.amount,
        date: data.transaction.date,
        status: data.transaction.status,
        details: data.transaction.details,
      };
      setTransactions((prev) => [tx, ...prev]);
    } catch (err: any) {
      console.error('[Purchase Error]:', err);
      showToast('Une erreur s\'est produite lors de l\'activation du plan : ' + err.message, 'error');
    }
  };

  // Claim Live Yields to Main Balance (using Supabase backend API)
  const handleCollectGains = async () => {
    if (claimableSum <= 0) {
      showToast("Vous n'avez aucun gain en cours à collecter.", "info");
      return;
    }

    const collectedInt = Math.floor(claimableSum);
    if (collectedInt <= 0) {
      showToast("Le montant minimum à collecter est de 1 FCFA. Attendez que vos gains dépassent 1 FCFA.", "info");
      return;
    }

    const tempClaimableRemaining = claimableSum - collectedInt;
    const ratio = collectedInt / claimableSum;
    const updatedInvestments = activeInvestments.map((act) => ({
      ...act,
      totalCollected: act.totalCollected + Math.round(act.dailyProfit * ratio),
      lastCollectedDate: new Date().toISOString(),
    }));

    try {
      const res = await fetch('/api/user/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userPhone,
          collectedAmount: collectedInt,
          claimableRemaining: tempClaimableRemaining,
          updatedInvestments: updatedInvestments
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la collecte.');

      // Sync React state from DB values
      setBalance(data.balance);
      setClaimableSum(data.claimableSum);
      
      const now = Date.now();
      lastTickTimeRef.current = now;
      setLastTickTime(now);

      setActiveInvestments(updatedInvestments);

      const tx: Transaction = {
        id: data.transaction.id,
        type: data.transaction.type,
        amount: data.transaction.amount,
        date: data.transaction.date,
        status: data.transaction.status,
        details: data.transaction.details,
      };
      setTransactions((prev) => [tx, ...prev]);
      showToast(`Succès ! Vous avez collecté ${collectedInt.toLocaleString('fr-FR')} FCFA avec succès.`, 'success');
    } catch (err: any) {
      console.error('[Collect Gains Error]:', err);
      showToast("Erreur lors de la collecte : " + err.message, 'error');
    }
  };

  // Recharge transactions handler (using Supabase backend API)
  const handleRechargeTx = async (amount: number) => {
    try {
      const res = await fetch('/api/user/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userPhone,
          amount
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du dépôt.');

      const tx: Transaction = {
        id: data.transaction.id,
        type: data.transaction.type,
        amount: data.transaction.amount,
        date: data.transaction.date,
        status: data.transaction.status,
        details: data.transaction.details,
      };
      setTransactions((prev) => [tx, ...prev]);
    } catch (err: any) {
      console.error('[Recharge Error]:', err);
    }
  };

  // Withdrawal success transactions handler (using Supabase backend API)
  const handleWithdrawSuccess = async (amount: number) => {
    try {
      const res = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userPhone,
          amount
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du retrait.');

      setBalance(data.balance);

      const tx: Transaction = {
        id: data.transaction.id,
        type: data.transaction.type,
        amount: data.transaction.amount,
        date: data.transaction.date,
        status: data.transaction.status,
        details: data.transaction.details,
      };
      setTransactions((prev) => [tx, ...prev]);
    } catch (err: any) {
      console.error('[Withdrawal Error]:', err);
      showToast('Erreur lors du retrait : ' + err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Conditionally render header top bar when user is logged in */}
      {isLoggedIn && screen !== 'auth' && (
        <TopBar userName={userName} userPhone={userPhone} onLogout={handleLogout} />
      )}

      {/* Primary Screen router */}
      <main className="flex-1">
        {screen === 'auth' && (
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        )}

        {screen === 'dashboard' && isLoggedIn && (
          <DashboardScreen
            balance={balance}
            activeInvestments={activeInvestments}
            transactions={transactions}
            onSelectPlan={(plan) => {
              if (plan.id === 'plan_poussiere' && activeInvestments.some((inv) => inv.planId === 'plan_poussiere')) {
                showToast("L'investissement dans le Plan Poussière d'Or est limité à une seule fois.", "error");
                return;
              }
              setSelectedPlan(plan);
              setScreen('order');
            }}
            onOpenRecharge={() => setScreen('recharge')}
            onOpenWithdraw={() => setScreen('withdraw')}
            onCollectGains={handleCollectGains}
            claimableSum={claimableSum}
            schemaCacheStale={schemaCacheStale}
            userPhone={userPhone}
          />
        )}

        {screen === 'order' && selectedPlan && isLoggedIn && (
          <OrderScreen
            plan={selectedPlan}
            userBalance={balance}
            onBack={() => setScreen('dashboard')}
            onPurchaseSuccess={handlePurchaseSuccess}
          />
        )}

        {screen === 'recharge' && isLoggedIn && (
          <RechargeScreen
            currentBalance={balance}
            onBack={() => setScreen('dashboard')}
            onAddTransaction={handleRechargeTx}
          />
        )}

        {screen === 'withdraw' && isLoggedIn && (
          <WithdrawScreen
            currentBalance={balance}
            onBack={() => setScreen('dashboard')}
            onWithdrawSuccess={handleWithdrawSuccess}
            showToast={showToast}
          />
        )}
      </main>

      {/* Page Footer */}
      <Footer />

      {/* Live active transaction alerts */}
      <LiveNotification />

      {/* Interactive Registration Welcome Bonus popup */}
      <BonusModal isOpen={isBonusOpen} onClose={() => setIsBonusOpen(false)} />

      {/* Custom Premium Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 pointer-events-none"
          >
            <div className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-[0_10px_35px_rgba(0,0,0,0.5)] ${
              toast.type === 'success' 
                ? 'bg-slate-900/95 border-green-500/30 text-green-400 shadow-green-500/10' 
                : toast.type === 'error' 
                ? 'bg-slate-900/95 border-red-500/30 text-red-400 shadow-red-500/10' 
                : 'bg-slate-900/95 border-gold-500/30 text-gold-400 shadow-gold-500/10'
            }`}>
              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                {toast.type === 'info' && <Sparkles className="w-5 h-5 text-gold-400" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold leading-relaxed text-white">
                  {toast.message}
                </p>
              </div>
              <button 
                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                className="text-slate-500 hover:text-white transition-colors p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
