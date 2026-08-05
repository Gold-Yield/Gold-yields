/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  CreditCard,
  Sparkles,
  ChevronRight,
  Plus,
  AlertCircle,
  MessageSquare,
  Clock,
  HelpCircle,
  FileText,
  Copy,
  CheckCircle,
  Activity,
  ArrowRightLeft,
  User,
  ShieldCheck,
  LogOut,
  Smartphone,
  ExternalLink,
  Award,
  Layers,
  CheckSquare,
  Truck,
  Crown,
  Shield,
  Lock,
  Unlock,
  Play,
  Zap,
  ShoppingCart,
  Loader2,
  X,
  Download,
  Share
} from 'lucide-react';
import { InvestmentPlan, ActiveInvestment, Transaction, DailyTask } from '../types';
import { DEFAULT_PLANS } from '../data';
import { PlanIcon } from './PlanIcon';
import { ReceiptModal } from './ReceiptModal';

import imgRefinery from '../assets/images/gold_refinery_1783873491748.jpg';
import imgMinePit from '../assets/images/gold_mine_pit_1783873507482.jpg';
import imgEngineers from '../assets/images/mining_engineers_1783873521791.jpg';

import imgDetectorKit from '../assets/images/detector_kit_1785752868739.jpg';
import imgSpectrometerProbe from '../assets/images/spectrometer_probe_1785752880502.jpg';
import imgHydraulicCrusher from '../assets/images/hydraulic_crusher_1785752893683.jpg';
import imgCrucibleChiller from '../assets/images/crucible_chiller_1785752905374.jpg';
import imgGoldIngotFilter from '../assets/images/gold_ingot_filter_1785752917779.jpg';

export type DashboardTab = 'home' | 'plans' | 'tasks' | 'assets' | 'profile';

interface DashboardScreenProps {
  balance: number;
  activeInvestments: ActiveInvestment[];
  transactions: Transaction[];
  onSelectPlan: (plan: InvestmentPlan) => void;
  onOpenRecharge: () => void;
  onOpenWithdraw: () => void;
  onCollectGains: () => void;
  onCompleteTask?: (taskTitle: string, reward: number) => void;
  claimableSum: number;
  schemaCacheStale?: boolean;
  userPhone?: string;
  userName?: string;
  onLogout?: () => void;
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const DAILY_TASKS: DailyTask[] = [
  {
    id: 'task_refinery_1',
    title: "Inspection du Raffinage Quotidien (VIP 1)",
    description: "Contrôlez et validez la pesée du lot d'or brut. Requis : Solde de 500 FCFA pour débloquer le VIP 1.",
    reward: 150,
    minPriceRequired: 500,
    category: 'beginner',
    iconName: 'CheckCircle',
  },
  {
    id: 'task_audit_2',
    title: "Audit du Registre des Lingots (VIP 1)",
    description: "Vérifiez la numérotation des scellés de sécurité. Requis : Solde de 500 FCFA pour débloquer le VIP 1.",
    reward: 250,
    minPriceRequired: 500,
    category: 'beginner',
    iconName: 'ShieldCheck',
  },
  {
    id: 'task_convoi_3',
    title: "Supervision du Convoi Aurifère (VIP 2)",
    description: "Escortez le chargement sécurisé des pépites. Nécessite d'avoir accompli et débloqué le VIP 1.",
    reward: 600,
    minPriceRequired: 3000,
    category: 'intermediate',
    iconName: 'Truck',
  },
  {
    id: 'task_vip_4',
    title: "Certification Qualité Lingots 24K (VIP 2)",
    description: "Validation spectrométrique de la pureté des lingots. Nécessite d'avoir accompli et débloqué le VIP 1.",
    reward: 2500,
    minPriceRequired: 10000,
    category: 'vip',
    iconName: 'Sparkles',
  },
  {
    id: 'task_elite_5',
    title: "Signature Contrat Société (VIP 3)",
    description: "Membre officiel de notre société. Salaire de 35 000 FCFA à 65 000 FCFA/jour. Nécessite VIP 1 et VIP 2.",
    reward: 10000,
    minPriceRequired: 50000,
    category: 'elite',
    iconName: 'Crown',
  },
];

export function DashboardScreen({
  balance,
  activeInvestments,
  transactions,
  onSelectPlan,
  onOpenRecharge,
  onOpenWithdraw,
  onCollectGains,
  onCompleteTask,
  claimableSum,
  schemaCacheStale,
  userPhone = '',
  userName = 'Investisseur Gold',
  onLogout,
  activeTab = 'home',
  onTabChange,
  showToast
}: DashboardScreenProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Daily Tasks local completion state
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined' && userPhone) {
      const todayStr = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`gy_${userPhone}_tasks_${todayStr}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [executingTask, setExecutingTask] = useState<DailyTask | null>(null);
  const [executingProgress, setExecutingProgress] = useState<number>(0);
  const [lockedTaskModal, setLockedTaskModal] = useState<DailyTask | null>(null);
  const [taskRewardSuccessModal, setTaskRewardSuccessModal] = useState<{ title: string; reward: number } | null>(null);

  // VIP Level Modal state
  const [vipLevelModal, setVipLevelModal] = useState<{
    level: string;
    price: string;
    title: string;
    subtitle?: string;
    isVip1?: boolean;
    isVip2?: boolean;
    isVip3?: boolean;
  } | null>(null);

  // VIP 1 Completion state
  const [isVip1Finished, setIsVip1Finished] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && userPhone) {
      return localStorage.getItem(`gy_${userPhone}_vip1_finished`) === 'true';
    }
    return false;
  });

  // VIP 2 Completion state
  const [isVip2Finished, setIsVip2Finished] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && userPhone) {
      return localStorage.getItem(`gy_${userPhone}_vip2_finished`) === 'true';
    }
    return false;
  });

  // Keep VIP completion state in sync with localStorage and user phone
  React.useEffect(() => {
    if (userPhone) {
      const saved1 = localStorage.getItem(`gy_${userPhone}_vip1_finished`);
      if (saved1 === 'true') setIsVip1Finished(true);

      const saved2 = localStorage.getItem(`gy_${userPhone}_vip2_finished`);
      if (saved2 === 'true') setIsVip2Finished(true);
    }
  }, [userPhone]);

  // Saved VIP 1 Step ('article1' | 'article2')
  const [vip1SavedStep, setVip1SavedStep] = useState<'article1' | 'article2'>(() => {
    if (typeof window !== 'undefined' && userPhone) {
      const saved = localStorage.getItem(`gy_${userPhone}_vip1_step`);
      if (saved === 'article2') return 'article2';
    }
    return 'article1';
  });

  // Saved VIP 2 Step ('article1' | 'article2' | 'article3')
  const [vip2SavedStep, setVip2SavedStep] = useState<'article1' | 'article2' | 'article3'>(() => {
    if (typeof window !== 'undefined' && userPhone) {
      const saved = localStorage.getItem(`gy_${userPhone}_vip2_step`);
      if (saved === 'article2' || saved === 'article3') return saved;
    }
    return 'article1';
  });

  // Reset VIP completion & step handler
  const handleResetVipStatus = () => {
    setIsVip1Finished(false);
    setIsVip2Finished(false);
    setVip1SavedStep('article1');
    setVip2SavedStep('article1');
    if (typeof window !== 'undefined' && userPhone) {
      localStorage.removeItem(`gy_${userPhone}_vip1_finished`);
      localStorage.removeItem(`gy_${userPhone}_vip2_finished`);
      localStorage.removeItem(`gy_${userPhone}_vip1_step`);
      localStorage.removeItem(`gy_${userPhone}_vip2_step`);
    }
  };

  // Insufficient Balance Modal state
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  const [insufficientBalanceModal, setInsufficientBalanceModal] = useState<{
    requiredPrice: number;
    missingAmount: number;
    articleName: string;
  } | null>(null);

  // VIP 1 Commander Flow state: 'none' | 'loading' | 'article1' | 'article2' | 'success'
  const [vip1CommanderStep, setVip1CommanderStep] = useState<'none' | 'loading' | 'article1' | 'article2' | 'success'>('none');
  const [vip1LoadingProgress, setVip1LoadingProgress] = useState<number>(0);

  // VIP 2 Commander Flow state: 'none' | 'loading' | 'article1' | 'article2' | 'article3' | 'success'
  const [vip2CommanderStep, setVip2CommanderStep] = useState<'none' | 'loading' | 'article1' | 'article2' | 'article3' | 'success'>('none');
  const [vip2LoadingProgress, setVip2LoadingProgress] = useState<number>(0);

  // Fast loading progress effect for Commander workflow (VIP 1)
  React.useEffect(() => {
    if (vip1CommanderStep === 'loading') {
      setVip1LoadingProgress(0);
      const interval = setInterval(() => {
        setVip1LoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setVip1CommanderStep('article1'), 150);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [vip1CommanderStep]);

  // Fast loading progress effect for Commander workflow (VIP 2)
  React.useEffect(() => {
    if (vip2CommanderStep === 'loading') {
      setVip2LoadingProgress(0);
      const interval = setInterval(() => {
        setVip2LoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setVip2CommanderStep('article1'), 150);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [vip2CommanderStep]);

  const handleStartVip1Commander = () => {
    if (isVip1Finished) {
      if (showToast) showToast("Le niveau VIP 1 est déjà terminé, validé et bloqué !", "info");
      return;
    }
    setVipLevelModal(null);
    if (vip1SavedStep === 'article2') {
      setVip1CommanderStep('article2');
    } else {
      setVip1CommanderStep('loading');
    }
  };

  const handleStartVip2Commander = () => {
    if (isVip2Finished) {
      if (showToast) showToast("Le niveau VIP 2 est déjà terminé, validé et bloqué !", "info");
      return;
    }
    setVipLevelModal(null);
    if (vip2SavedStep === 'article3') {
      setVip2CommanderStep('article3');
    } else if (vip2SavedStep === 'article2') {
      setVip2CommanderStep('article2');
    } else {
      setVip2CommanderStep('loading');
    }
  };

  const handlePayArticle1 = () => {
    if (balance < 700) {
      setInsufficientBalanceModal({
        requiredPrice: 700,
        missingAmount: 700 - balance,
        articleName: "Pelle & Détecteur Aurifère (VIP 1)"
      });
      return;
    }
    if (onCompleteTask) {
      onCompleteTask("Achat Article de Mine VIP 1 - Lot #1 (Détecteur 700F)", -700);
    }
    setVip1SavedStep('article2');
    if (userPhone) {
      localStorage.setItem(`gy_${userPhone}_vip1_step`, 'article2');
    }
    setVip1CommanderStep('article2');
  };

  const handlePayArticle2 = () => {
    if (balance < 800) {
      setInsufficientBalanceModal({
        requiredPrice: 800,
        missingAmount: 800 - balance,
        articleName: "Sonde Aurifère Haute Précision (VIP 1)"
      });
      return;
    }
    if (onCompleteTask) {
      onCompleteTask("Achat Article de Mine VIP 1 - Lot #2 (Sonde 800F)", -800);
    }
    setTimeout(() => {
      if (onCompleteTask) {
        onCompleteTask("Récompense Validation VIP 1", 17000);
      }
      setIsVip1Finished(true);
      setVip1SavedStep('article1');
      if (userPhone) {
        localStorage.setItem(`gy_${userPhone}_vip1_finished`, 'true');
        localStorage.removeItem(`gy_${userPhone}_vip1_step`);
        fetch('/api/user/sync-tick', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: userPhone,
            isVip1Finished: true
          }),
        }).catch(() => {});
      }
      setVip1CommanderStep('success');
    }, 250);
  };

  // VIP 2 Payments
  const handlePayVip2Article1 = () => {
    if (balance < 25000) {
      setInsufficientBalanceModal({
        requiredPrice: 25000,
        missingAmount: 25000 - balance,
        articleName: "Concasseur Aurifère Lourd (VIP 2)"
      });
      return;
    }
    if (onCompleteTask) {
      onCompleteTask("Achat Article de Mine VIP 2 - Lot #1 (Concasseur 25 000F)", -25000);
    }
    setVip2SavedStep('article2');
    if (userPhone) {
      localStorage.setItem(`gy_${userPhone}_vip2_step`, 'article2');
    }
    setVip2CommanderStep('article2');
  };

  const handlePayVip2Article2 = () => {
    if (balance < 50000) {
      setInsufficientBalanceModal({
        requiredPrice: 50000,
        missingAmount: 50000 - balance,
        articleName: "Refroidisseur Industriel (VIP 2)"
      });
      return;
    }
    if (onCompleteTask) {
      onCompleteTask("Achat Article de Mine VIP 2 - Lot #2 (Refroidisseur 50 000F)", -50000);
    }
    setVip2SavedStep('article3');
    if (userPhone) {
      localStorage.setItem(`gy_${userPhone}_vip2_step`, 'article3');
    }
    setVip2CommanderStep('article3');
  };

  const handlePayVip2Article3 = () => {
    if (balance < 75000) {
      setInsufficientBalanceModal({
        requiredPrice: 75000,
        missingAmount: 75000 - balance,
        articleName: "Filtre de Lingots d'Or Massif (VIP 2)"
      });
      return;
    }
    if (onCompleteTask) {
      onCompleteTask("Achat Article de Mine VIP 2 - Lot #3 (Filtre Lingots 75 000F)", -75000);
    }
    setTimeout(() => {
      if (onCompleteTask) {
        onCompleteTask("Récompense Validation VIP 2", 200000);
      }
      setIsVip2Finished(true);
      setVip2SavedStep('article1');
      if (userPhone) {
        localStorage.setItem(`gy_${userPhone}_vip2_finished`, 'true');
        localStorage.removeItem(`gy_${userPhone}_vip2_step`);
        fetch('/api/user/sync-tick', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: userPhone,
            isVip2Finished: true
          }),
        }).catch(() => {});
      }
      setVip2CommanderStep('success');
    }, 250);
  };

  // Calculate total user investment capital & balance status
  const totalInvestedSum = activeInvestments.reduce((sum, item) => sum + item.price, 0);
  const totalDailyRevenue = activeInvestments.reduce((sum, item) => sum + item.dailyProfit, 0);

  // VIP 1 is granted when user balance or capital is >= 2300 FCFA
  const isVip1Unlocked = balance >= 2300 || totalInvestedSum >= 2300;

  // VIP 2 is unlocked when user sum/balance >= 10,000 FCFA or VIP 1 is finished
  const isVip2Unlocked = isVip1Finished || balance >= 10000 || totalInvestedSum >= 10000;

  // Helper to check if a task is locked based on VIP rules
  const isTaskLocked = (task: DailyTask) => {
    if (task.category === 'beginner') {
      return !isVip1Unlocked;
    }
    if (task.category === 'intermediate' || task.category === 'vip') {
      return !isVip1Unlocked;
    }
    if (task.category === 'elite') {
      return !isVip1Unlocked;
    }
    return false;
  };

  const saveCompletedTask = (taskId: string) => {
    const updated = [...completedTaskIds, taskId];
    setCompletedTaskIds(updated);
    if (userPhone) {
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem(`gy_${userPhone}_tasks_${todayStr}`, JSON.stringify(updated));
    }
  };

  const handleExecuteTask = (task: DailyTask) => {
    // Check if task is already completed today
    if (completedTaskIds.includes(task.id)) {
      return;
    }

    // Check requirement
    if (isTaskLocked(task)) {
      setLockedTaskModal(task);
      return;
    }

    // Unlocked -> Execute with animated simulation
    setExecutingTask(task);
    setExecutingProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setExecutingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setExecutingTask(null);
          saveCompletedTask(task.id);
          if (onCompleteTask) {
            onCompleteTask(task.title, task.reward);
          }
          setTaskRewardSuccessModal({ title: task.title, reward: task.reward });
        }, 400);
      }
    }, 350);
  };

  // Dynamically obtain current domain
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return "https://goldyields.org";
  };

  const inviteLink = userPhone 
    ? `${getBaseUrl()}/?ref=${userPhone}` 
    : `${getBaseUrl()}/?ref=GOLDYIELD`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText("ALTER TABLE users ADD COLUMN IF NOT EXISTS claimable_sum NUMERIC DEFAULT 0;\nALTER TABLE users ADD COLUMN IF NOT EXISTS last_tick_time BIGINT DEFAULT 0;\nNOTIFY pgrst, 'reload schema';");
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 3000);
  };

  const handleCopyLink = () => {
    const textToCopy = `🌟 *Rejoignez Gold Yield et commencez à générer des revenus !* 🌟\n\n` +
                       `Investissez dans le raffinage d'or certifié et gagnez des gains passifs quotidiens en toute sécurité ! 📈💰\n\n` +
                       `🎁 *CADEAU DE BIENVENUE :* Recevez immédiatement un bonus de *500 FCFA* à l'inscription en passant par mon lien !\n\n` +
                       `👉 Inscrivez-vous gratuitement dès maintenant : \n` +
                       `${inviteLink}\n\n` +
                       `🚀 Retraits rapides, rendements certifiés et support 24h/24. Rejoignez notre communauté d'investisseurs ! 👑`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const renderVipLevelTickets = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-extrabold font-display text-white flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Liste des niveaux de membre VIP</span>
        </h3>
        <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold font-mono">
          Niveaux d'Adhésion
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* VIP 1 TICKET - ACCESSIBLE DÈS 2 300 FCFA */}
        <div
          onClick={() => setVipLevelModal({
            level: 'VIP1',
            price: '2 300.00 FCFA',
            title: isVip1Finished
              ? 'Niveau Membre VIP 1 — Terminé & Validé !'
              : isVip1Unlocked ? 'Niveau Membre VIP 1 — Accès Débloqué !' : 'Niveau Membre VIP 1',
            subtitle: isVip1Finished
              ? 'Félicitations ! Vous avez complété les articles du VIP 1 et empoché 17 000 FCFA !'
              : isVip1Unlocked
              ? `Votre solde est de ${balance.toLocaleString('fr-FR')} FCFA. Cliquez sur Commander pour acheter les articles de mine !`
              : 'Un solde d\'au moins 2 300 FCFA sur votre compte débloque l\'accès au VIP 1.',
            isVip1: true,
            isVip2: false,
            isVip3: false
          })}
          className="relative bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 rounded-2xl p-4 shadow-lg overflow-hidden flex justify-between items-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border border-amber-300/60 group"
        >
          <div className="absolute right-14 -top-2.5 w-5 h-5 rounded-full bg-slate-950" />
          <div className="absolute right-14 -bottom-2.5 w-5 h-5 rounded-full bg-slate-950" />
          <div className="absolute right-14 top-2 bottom-2 border-r-2 border-dashed border-slate-950/25" />

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <h4 className="text-2xl font-black font-display tracking-tight text-slate-950 leading-none">VIP1</h4>
              {isVip1Finished ? (
                <CheckCircle className="w-5 h-5 text-emerald-950 fill-emerald-400 animate-pulse" />
              ) : isVip1Unlocked ? (
                <CheckCircle className="w-4 h-4 text-emerald-950 fill-emerald-400" />
              ) : null}
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-black font-mono text-slate-950">2 300.00F</span>
              <span className="text-[10px] font-black bg-slate-950 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30 font-mono shadow-sm">
                Gain Total : 17 000 FCFA
              </span>
            </div>
            
            {isVip1Finished ? (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-md inline-block bg-emerald-950 text-emerald-300 border border-emerald-400/40">
                ✓ VIP 1 Terminé (+17 000F)
              </span>
            ) : (
              <div className="flex flex-col gap-1 items-start pt-0.5">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md inline-block ${
                  isVip1Unlocked ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-950 text-amber-400'
                }`}>
                  {isVip1Unlocked ? 'Accès Débloqué (≥ 2 300F)' : 'Solde Requis : 2 300F'}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartVip1Commander();
                  }}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-[10px] rounded-lg shadow-md flex items-center gap-1 border border-amber-400/40 cursor-pointer active:scale-95 transition-transform"
                >
                  <ShoppingCart className="w-3 h-3 text-amber-400" />
                  <span>{vip1SavedStep === 'article2' ? 'Reprendre (2/2)' : 'Commander'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="pr-1 flex flex-col items-end opacity-90 select-none">
            <div className="flex gap-0.5 h-10 items-center">
              <div className="w-1 h-8 bg-slate-950"></div>
              <div className="w-0.5 h-8 bg-slate-950"></div>
              <div className="w-1.5 h-8 bg-slate-950"></div>
              <div className="w-0.5 h-8 bg-slate-950"></div>
              <div className="w-1 h-8 bg-slate-950"></div>
              <div className="w-2 h-8 bg-slate-950"></div>
              <div className="w-0.5 h-8 bg-slate-950"></div>
            </div>
            <span className="text-[7px] font-mono font-bold text-slate-950 tracking-tighter">ISBN 80-247-1514-7</span>
          </div>
        </div>

        {/* VIP 2 TICKET - ACCESSIBLE SI SOLDE/SOMME >= 10 000 FCFA OU VIP 1 FINI */}
        <div
          onClick={() => setVipLevelModal({
            level: 'VIP2',
            price: '5000.00 FCFA',
            title: isVip2Finished
              ? 'Niveau Membre VIP 2 — Terminé & Validé !'
              : isVip2Unlocked ? 'Niveau Membre VIP 2 — Accès Débloqué !' : 'Niveau Membre VIP 2',
            subtitle: isVip2Finished
              ? 'Félicitations ! Vous avez accompli le VIP 2 (25 000F, 50 000F, 75 000F) et empoché 200 000 FCFA !'
              : isVip2Unlocked
              ? 'Félicitations ! VIP 2 Débloqué (Somme ≥ 10 000 FCFA ou VIP 1 validé). Cliquez sur Commander pour passer vos 3 commandes VIP 2 !'
              : 'Pour accéder au VIP 2, votre solde ou investissement doit être supérieur à 10 000 FCFA (ou terminer le VIP 1) !',
            isVip1: false,
            isVip2: true,
            isVip3: false
          })}
          className="relative bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 rounded-2xl p-4 shadow-lg overflow-hidden flex justify-between items-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border border-amber-300/60 group"
        >
          <div className="absolute right-14 -top-2.5 w-5 h-5 rounded-full bg-slate-950" />
          <div className="absolute right-14 -bottom-2.5 w-5 h-5 rounded-full bg-slate-950" />
          <div className="absolute right-14 top-2 bottom-2 border-r-2 border-dashed border-slate-950/25" />

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <h4 className="text-2xl font-black font-display tracking-tight text-slate-950 leading-none">VIP2</h4>
              {isVip2Finished ? (
                <CheckCircle className="w-5 h-5 text-emerald-950 fill-emerald-400 animate-pulse" />
              ) : isVip2Unlocked ? (
                <CheckCircle className="w-4 h-4 text-emerald-950 fill-emerald-400" />
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-black font-mono text-slate-950">5000.00F</span>
              <span className="text-[10px] font-black bg-slate-950 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30 font-mono shadow-sm">
                Gain Total : 200 000 FCFA
              </span>
            </div>
            
            {isVip2Finished ? (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-md inline-block bg-emerald-950 text-emerald-300 border border-emerald-400/40">
                ✓ VIP 2 Terminé (+200 000F)
              </span>
            ) : isVip2Unlocked ? (
              <div className="flex flex-col gap-1 items-start pt-0.5">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md inline-block bg-emerald-950 text-emerald-300">
                  Éligible VIP 2
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartVip2Commander();
                  }}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-[10px] rounded-lg shadow-md flex items-center gap-1 border border-amber-400/40 cursor-pointer active:scale-95 transition-transform"
                >
                  <ShoppingCart className="w-3 h-3 text-amber-400" />
                  <span>
                    {vip2SavedStep === 'article3'
                      ? 'Reprendre (3/3)'
                      : vip2SavedStep === 'article2'
                      ? 'Reprendre (2/3)'
                      : 'Commander'}
                  </span>
                </button>
              </div>
            ) : (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md inline-block bg-slate-950 text-amber-400">
                Requis : Somme ≥ 10 000F
              </span>
            )}
          </div>

          <div className="pr-1 flex flex-col items-end opacity-90 select-none">
            <div className="flex gap-0.5 h-10 items-center">
              <div className="w-1.5 h-8 bg-slate-950"></div>
              <div className="w-0.5 h-8 bg-slate-950"></div>
              <div className="w-1 h-8 bg-slate-950"></div>
              <div className="w-2 h-8 bg-slate-950"></div>
              <div className="w-0.5 h-8 bg-slate-950"></div>
              <div className="w-1 h-8 bg-slate-950"></div>
            </div>
            <span className="text-[7px] font-mono font-bold text-slate-950 tracking-tighter">ISBN 80-247-1514-7</span>
          </div>
        </div>

        {/* VIP 3 TICKET - WITH USER REQUESTED TEXT */}
        <div
          onClick={() => setVipLevelModal({
            level: 'VIP3',
            price: '',
            title: 'Société VIP 3',
            subtitle: 'Vous êtes devenus membre de notre société pour percevoir un salaire de 35 000 FCFA à 65 000 FCFA par jour',
            isVip1: false,
            isVip2: false,
            isVip3: true
          })}
          className="relative bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 rounded-2xl p-4 shadow-xl overflow-hidden flex justify-between items-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border-2 border-amber-200 group"
        >
          <div className="absolute right-14 -top-2.5 w-5 h-5 rounded-full bg-slate-950" />
          <div className="absolute right-14 -bottom-2.5 w-5 h-5 rounded-full bg-slate-950" />
          <div className="absolute right-14 top-2 bottom-2 border-r-2 border-dashed border-slate-950/25" />

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <h4 className="text-2xl font-black font-display tracking-tight text-slate-950 leading-none">VIP3</h4>
              <Crown className="w-4 h-4 text-slate-950 animate-bounce" />
            </div>
            <div className="mt-1 bg-slate-950 text-amber-400 text-[10px] font-extrabold px-2 py-1 rounded-md inline-flex flex-col gap-0.5 shadow-sm max-w-[190px]">
              <span className="leading-tight">Vous êtes devenus membre de notre société</span>
              <span className="text-[9px] text-green-400 font-mono font-bold leading-tight">Salaire : 35 000 - 65 000 FCFA/jour</span>
            </div>
          </div>

          <div className="pr-1 flex flex-col items-end opacity-90 select-none">
            <div className="flex gap-0.5 h-10 items-center">
              <div className="w-1 h-8 bg-slate-950"></div>
              <div className="w-2 h-8 bg-slate-950"></div>
              <div className="w-0.5 h-8 bg-slate-950"></div>
              <div className="w-1.5 h-8 bg-slate-950"></div>
              <div className="w-1 h-8 bg-slate-950"></div>
            </div>
            <span className="text-[7px] font-mono font-bold text-slate-950 tracking-tighter">ISBN 80-247-1514-7</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 space-y-8 pb-28 font-sans">
      
      {/* DB Schema Cache Alert / Action notice */}
      {schemaCacheStale && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-3xl p-6 space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-400">
                Action Recommandée : Cache de schéma Supabase obsolète détecté !
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Votre base de données Supabase ne reconnaît pas encore les colonnes de mining (<code className="text-amber-300 font-mono">claimable_sum</code>, <code className="text-amber-300 font-mono">last_tick_time</code>). 
                L'application utilise un système de secours local sécurisé, mais pour activer la sauvegarde de votre progression dans le cloud, veuillez exécuter ces commandes de mise à jour.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex-1 font-mono text-[11px] text-slate-400 select-all overflow-x-auto whitespace-pre leading-normal w-full max-w-full">
              {`ALTER TABLE users ADD COLUMN IF NOT EXISTS claimable_sum NUMERIC DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_tick_time BIGINT DEFAULT 0;
NOTIFY pgrst, 'reload schema';`}
            </div>
            <button
              onClick={handleCopyCmd}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/10 shrink-0 cursor-pointer"
            >
              {copiedCmd ? 'Copié !' : 'Copier le script SQL'}
            </button>
          </div>
        </motion.div>
      )}

      {/* ==================== VIP LEVEL TICKETS COMPONENT ==================== */}
      {(() => null)()}

      {/* ==================== TAB 1: ACCUEIL (HOME) ==================== */}
      {(activeTab === 'home') && (
        <div className="space-y-5">
          {/* HERO BLOCK & CORE METRICS CARD */}
          <div>
            {/* Glowing Gold Card (Main Balance) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.05)] flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-amber-400" />
                    Portefeuille Principal Gold Yield
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight leading-none">
                    <span>
                      {balance.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-amber-400 text-xl md:text-2xl font-bold ml-1.5">FCFA</span>
                  </h2>
                </div>
                
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
              </div>

              {/* Quick Stats inside the main wallet */}
              <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-slate-800/60 relative z-10">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Capital Investi</p>
                  <p className="text-sm font-bold font-mono text-white">
                    {totalInvestedSum.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Rendement Journalier</p>
                  <p className="text-sm font-bold font-mono text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{totalDailyRevenue.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* INSTANT ACTION SHORTCUTS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={onOpenRecharge}
              className="p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/30 rounded-xl transition-all text-left flex flex-col gap-2.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Recharger</span>
                <span className="text-[9px] text-slate-400">Dépôt min: 3 000 FCFA</span>
              </div>
            </button>

            <button
              onClick={onOpenWithdraw}
              className="p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/30 rounded-xl transition-all text-left flex flex-col gap-2.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Retirer</span>
                <span className="text-[9px] text-slate-400">Retrait min: 1 000 FCFA</span>
              </div>
            </button>

            <button
              onClick={() => onTabChange && onTabChange('tasks')}
              className="p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/30 rounded-xl transition-all text-left flex flex-col gap-2.5 group cursor-pointer relative overflow-hidden"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-colors">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block flex items-center gap-1">
                  Tâches VIP
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                </span>
                <span className="text-[9px] text-slate-400">Jusqu'à +13 500 F/j</span>
              </div>
            </button>

            <a
              href="https://t.me/goldyieldservice"
              target="_blank"
              rel="noreferrer"
              className="p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/30 rounded-xl transition-all text-left flex flex-col gap-2.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 group-hover:text-sky-300 transition-colors">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Support t.me</span>
                <span className="text-[9px] text-slate-400">Canal officiel goldyield</span>
              </div>
            </a>
          </div>

          {/* VIP MEMBER LEVELS TICKET GALLERY */}
          {renderVipLevelTickets()}

          {/* REFERRAL CARD */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center justify-center md:justify-start gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Programme Parrainage Gold
              </span>
              <h4 className="text-lg font-bold text-white">Partagez l'opportunité et gagnez +10%</h4>
              <p className="text-xs text-slate-400 max-w-lg">
                Gagnez une commission instantanée de 10% sur chaque recharge effectuée par vos filleuls. Vos amis reçoivent 500 FCFA de bienvenue.
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto items-end shrink-0">
              <div className="flex items-center gap-3 w-full">
                <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl font-mono text-xs text-slate-300 select-all flex-1 md:flex-none text-center truncate max-w-[200px] md:max-w-xs">
                  {inviteLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10 active:scale-95 shrink-0"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copié !' : 'Partager'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: INVESTIR (PLANS) ==================== */}
      {(activeTab === 'plans') && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-white">Catalogue des Plans aurifères</h2>
            <p className="text-xs text-slate-400 mt-1">
              Choisissez la formule adaptée à votre capital et percevez des gains quotidiens garantis pendant 30 jours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEFAULT_PLANS.map((plan) => {
              const isPlanPoussiereAlreadyPurchased = plan.id === 'plan_poussiere' && activeInvestments.some((inv) => inv.planId === 'plan_poussiere');

              return (
                <div
                  key={plan.id}
                  className={`bg-slate-900/90 border rounded-3xl p-5 shadow-lg flex flex-col justify-between group transition-all ${
                    isPlanPoussiereAlreadyPurchased ? 'border-red-500/20 opacity-80' : 'border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className={`p-3 bg-gradient-to-br ${plan.colorScheme.from} ${plan.colorScheme.to} rounded-2xl border border-white/5`}>
                        <PlanIcon name={plan.iconName} className={`w-5 h-5 ${plan.colorScheme.text}`} />
                      </div>
                      <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 py-1 px-2.5 rounded-lg font-mono">
                        Rendement 30 jours
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold font-display text-white leading-tight">{plan.name}</h4>
                      <span className="text-2xl font-black font-mono text-amber-400 block mt-1">
                        {plan.price.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>

                    <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-900 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Gains/Jour</span>
                        <span className="font-bold font-mono text-green-400">+{plan.dailyProfit.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Retour Total</span>
                        <span className="font-bold font-mono text-white">{plan.totalProfit.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </div>
                  </div>

                  {isPlanPoussiereAlreadyPurchased ? (
                    <button disabled className="w-full mt-4 py-2.5 px-4 bg-slate-950/40 text-red-400 font-bold text-xs rounded-xl border border-red-500/20 cursor-not-allowed">
                      Achat unique (Déjà investi)
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectPlan(plan)}
                      className="w-full mt-4 py-2.5 px-4 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-bold text-xs rounded-xl border border-amber-500/20 hover:border-transparent transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Souscrire ce plan</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* INFRASTRUCTURE SHOWCASE */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Nos Infrastructures Réelles & Chantiers Partenaires</span>
              </h3>
              <p className="text-xs text-slate-400">
                Chaque contrat souscrit est directement financé par des opérations réelles de raffinage et d'extraction aurifère.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="h-44 overflow-hidden relative">
                  <img src={imgMinePit} alt="Extraction" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[10px] bg-amber-500 text-slate-950 font-extrabold px-2.5 py-1 rounded-lg font-mono">
                    CONCESSION ACTIVE
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="text-xs font-bold text-amber-400 uppercase">Mine de Kibali</h4>
                  <p className="text-[11px] text-slate-400">Extraction industrielle garantissant un approvisionnement continu.</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="h-44 overflow-hidden relative">
                  <img src={imgRefinery} alt="Raffinage" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[10px] bg-amber-500 text-slate-950 font-extrabold px-2.5 py-1 rounded-lg font-mono">
                    RAFFINAGE CERTIFIÉ 99.9%
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="text-xs font-bold text-amber-400 uppercase">Purification Lingotage</h4>
                  <p className="text-[11px] text-slate-400">Transformation sécurisée en lingots d'or certifiés 99.9%.</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="h-44 overflow-hidden relative">
                  <img src={imgEngineers} alt="Ingénieurs" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[10px] bg-amber-500 text-slate-950 font-extrabold px-2.5 py-1 rounded-lg font-mono">
                    CONTRÔLE QUALITÉ
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="text-xs font-bold text-amber-400 uppercase">Équipe d'Experts</h4>
                  <p className="text-[11px] text-slate-400">Géologues et ingénieurs assurant le rendement optimal des chantiers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: MES ACTIFS & TRANSACTIONS ==================== */}
      {(activeTab === 'assets') && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-white">Mes Actifs & Transactions</h2>
            <p className="text-xs text-slate-400 mt-1">
              Consultez l'état de vos contrats en cours et l'historique complet de vos opérations.
            </p>
          </div>

          {/* Active VIP Mission Card (Replacing old Contrats Actifs) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Niveau VIP En Cours (Non Terminé)</span>
            </h3>

            {!isVip1Finished ? (
              /* VIP 1 ACTIVE / UNFINISHED CARD */
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-6 relative overflow-hidden space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-white">Niveau VIP 1 — Articles de Mine</h4>
                      <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 uppercase tracking-wider">
                        En cours
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {vip1SavedStep === 'article2' 
                        ? "Étape 2 / 2 : Il vous reste 1 dernier article à régler pour encaisser vos 17 000 FCFA."
                        : "Étape 1 / 2 : Dépensez 700 F pour entamer votre session VIP 1 et gagner 17 000 FCFA."}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Prime de validation</span>
                    <span className="text-base font-black font-mono text-green-400">+17 000 FCFA</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Avancement</span>
                    <span className="font-extrabold text-white font-mono">
                      {vip1SavedStep === 'article2' ? '50% (1/2 Articles)' : '0% (0/2 Articles)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Prochaine étape</span>
                    <span className="font-extrabold text-amber-400 font-mono">
                      {vip1SavedStep === 'article2' ? '800 FCFA' : '700 FCFA'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Statut Accès</span>
                    <span className={`font-bold ${isVip1Unlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isVip1Unlocked ? 'Débloqué (Solde ≥ 2 300F)' : 'Requis : Dépôt 2 300F'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>Progression VIP 1</span>
                    <span>{vip1SavedStep === 'article2' ? 'Étape 2 sur 2' : 'Étape 1 sur 2'}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full" 
                      style={{ width: vip1SavedStep === 'article2' ? '50%' : '5%' }} 
                    />
                  </div>
                </div>

                <button
                  onClick={handleStartVip1Commander}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>
                    {vip1SavedStep === 'article2'
                      ? 'Poursuivre la commande VIP 1 (Étape 2/2 • 800 FCFA)'
                      : 'Démarrer la commande VIP 1 (700 FCFA)'}
                  </span>
                </button>
              </div>
            ) : !isVip2Finished ? (
              /* VIP 2 ACTIVE / UNFINISHED CARD */
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-6 relative overflow-hidden space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-white">Niveau VIP 2 — Équipements de Mine</h4>
                      <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 uppercase tracking-wider">
                        En cours
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {vip2SavedStep === 'article3'
                        ? 'Étape 3 / 3 : Plus qu’un dernier article à 75 000 F pour débloquer les 200 000 FCFA !'
                        : vip2SavedStep === 'article2'
                        ? 'Étape 2 / 3 : Réglez le 2e article à 50 000 F pour progresser vers la prime finale.'
                        : 'Étape 1 / 3 : Lancez votre première commande VIP 2 à 25 000 F.'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Prime géante</span>
                    <span className="text-base font-black font-mono text-green-400">+200 000 FCFA</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Avancement</span>
                    <span className="font-extrabold text-white font-mono">
                      {vip2SavedStep === 'article3' ? '66% (2/3 Articles)' : vip2SavedStep === 'article2' ? '33% (1/3 Articles)' : '0% (0/3 Articles)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Prochaine étape</span>
                    <span className="font-extrabold text-amber-400 font-mono">
                      {vip2SavedStep === 'article3' ? '75 000 FCFA' : vip2SavedStep === 'article2' ? '50 000 FCFA' : '25 000 FCFA'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Statut Accès</span>
                    <span className="font-bold text-emerald-400">
                      Débloqué (VIP 1 Validé ✓)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>Progression VIP 2</span>
                    <span>
                      {vip2SavedStep === 'article3' ? 'Étape 3 sur 3' : vip2SavedStep === 'article2' ? 'Étape 2 sur 3' : 'Étape 1 sur 3'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full" 
                      style={{ width: vip2SavedStep === 'article3' ? '66%' : vip2SavedStep === 'article2' ? '33%' : '5%' }} 
                    />
                  </div>
                </div>

                <button
                  onClick={handleStartVip2Commander}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>
                    {vip2SavedStep === 'article3'
                      ? 'Finaliser le VIP 2 (Étape 3/3 • 75 000 FCFA)'
                      : vip2SavedStep === 'article2'
                      ? 'Poursuivre la commande VIP 2 (Étape 2/3 • 50 000 FCFA)'
                      : 'Démarrer la commande VIP 2 (25 000 FCFA)'}
                  </span>
                </button>
              </div>
            ) : (
              /* ALL VIP COMPLETED - VIP 3 MEMBER CARD */
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/40 rounded-3xl p-6 relative overflow-hidden space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-white">VIP 3 — Membre Officiel Société</h4>
                      <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 uppercase tracking-wider">
                        Validé ✓
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Toutes les missions VIP 1 & VIP 2 ont été achevées avec succès.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Salaire journalier</span>
                    <span className="text-base font-black font-mono text-emerald-400">35 000 F – 65 000 F</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://t.me/goldyieldservice"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Rejoindre le canal Telegram VIP 3</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Transactions History */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              <span>Historique des Transactions</span>
            </h3>

            {transactions.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
                Aucune transaction enregistrée.
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                {transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    onClick={() => setSelectedReceiptTx(tx)}
                    className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        tx.type === 'deposit' ? 'bg-green-500/10 text-green-400' :
                        tx.type === 'withdrawal' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {tx.type === 'deposit' ? <Plus className="w-4 h-4" /> :
                         tx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4" /> :
                         <Sparkles className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                          <span>
                            {tx.type === 'deposit' ? 'Recharge approuvée' :
                             tx.type === 'withdrawal' ? 'Retrait d\'argent' :
                             tx.type === 'investment' ? 'Achat plan minier' : 'Gain collecté'}
                          </span>
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono group-hover:bg-amber-500/20 group-hover:text-amber-300">
                            Reçu 📄
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {new Date(tx.date).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xs font-black font-mono ${tx.type === 'deposit' || tx.type === 'collect' ? 'text-green-400' : 'text-white'}`}>
                        {tx.type === 'deposit' || tx.type === 'collect' ? '+' : '-'}
                        {tx.amount.toLocaleString('fr-FR')} FCFA
                      </p>
                      <span className={`text-[9px] uppercase font-bold ${tx.status === 'completed' ? 'text-green-400' : 'text-amber-400'}`}>
                        {tx.status === 'completed' ? 'Réussi' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB: TÂCHES & MISSIONS VIP ==================== */}
      {(activeTab === 'tasks') && (
        <div className="space-y-5">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Centre des Commandes VIP
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white font-display">
                  Niveaux & Offres VIP
                </h2>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Accédez directement à vos niveaux VIP pour passer vos commandes et générer vos revenus.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-3 text-right shrink-0">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Statut VIP</span>
                <div className="text-sm font-black font-mono text-amber-400 mt-0.5">
                  Actif
                </div>
              </div>
            </div>
          </div>

          {/* VIP MEMBER LEVELS TICKET GALLERY */}
          {renderVipLevelTickets()}
        </div>
      )}

      {/* ==================== TAB 4: PROFIL / MON COMPTE ==================== */}
      {(activeTab === 'profile') && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* User Profile Header Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden shadow-xl text-center md:text-left flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 border-2 border-amber-300">
              {userName.substring(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="text-xl font-bold text-white truncate">{userName}</h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3" /> VIP VÉRIFIÉ
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{userPhone || 'Compte Gold Yield'}</p>
              <p className="text-[11px] text-slate-500">ID Membre : <span className="font-mono text-amber-400">GY-{userPhone.slice(-4) || '2026'}</span></p>
            </div>
          </div>

          {/* Quick Balance Summary & Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Solde Disponible</span>
                <p className="text-2xl font-black text-amber-400 font-mono">{balance.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onOpenRecharge}
                  className="px-3.5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-all cursor-pointer"
                >
                  Dépôt
                </button>
                <button
                  onClick={onOpenWithdraw}
                  className="px-3.5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition-all border border-slate-700 cursor-pointer"
                >
                  Retrait
                </button>
              </div>
            </div>
          </div>

          {/* Parrainage details */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Mon Lien de Parrainage (+10% commission)</span>
            </h3>
            <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="bg-transparent font-mono text-xs text-slate-300 flex-1 outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 shrink-0"
              >
                {copied ? 'Copié' : 'Copier'}
              </button>
            </div>
          </div>

          {/* App & Security Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Assurance & Sécurité des Fonds</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Toutes les transactions et les dépôts effectués sur la plateforme Gold Yield sont encadrés par des contrats sécurisés et adossés à des réserves physiques vérifiées.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href="https://t.me/goldyieldservice"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-slate-950 rounded-xl text-xs text-slate-300 hover:text-white border border-slate-850"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Support Telegram Officiel</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Logout button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-2xl border border-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Se Déconnecter de l'Application</span>
            </button>
          )}
        </div>
      )}

      {/* ==================== INTERACTIVE TASK EXECUTING OVERLAY ==================== */}
      <AnimatePresence>
        {executingTask && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Activity className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">{executingTask.title}</h4>
                <p className="text-xs text-slate-400">Validation et contrôle de conformité du rapport en cours...</p>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${executingProgress}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">{executingProgress}% effectué</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== LOCKED VIP TASK UNLOCK MODAL ==================== */}
      <AnimatePresence>
        {lockedTaskModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => setLockedTaskModal(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950 text-slate-400 hover:text-white rounded-full border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400">
                    {lockedTaskModal.category === 'beginner' ? 'Accès VIP 1 Requis' :
                     lockedTaskModal.category === 'elite' ? 'VIP 3 — Membre Société' : 'Accès VIP 2 Requis'}
                  </span>
                  <h4 className="text-lg font-bold text-white">{lockedTaskModal.title}</h4>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                {lockedTaskModal.category === 'beginner' ? (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Pour débloquer et exécuter les tâches du <strong>VIP 1</strong> (+{lockedTaskModal.reward.toLocaleString('fr-FR')} FCFA), le système exige un solde d'au moins <strong>500 FCFA</strong> sur votre compte. Votre solde actuel est de <strong className="text-amber-400 font-mono">{balance.toLocaleString('fr-FR')} FCFA</strong>.
                  </p>
                ) : lockedTaskModal.category === 'elite' ? (
                  <div className="space-y-2">
                    <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-2.5 rounded-xl border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>Vous êtes devenus membre de notre société</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Pour devenir membre officiel de notre société (VIP 3) et percevoir un salaire de <strong>35 000 FCFA à 65 000 FCFA par jour</strong>, vous devez d'abord accomplir et débloquer les niveaux VIP 1 et VIP 2 !
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Pour accéder au <strong>VIP 2</strong> et exécuter cette commande (+{lockedTaskModal.reward.toLocaleString('fr-FR')} FCFA), votre somme totale (solde ou investissement) doit être d'au moins <strong>10 000 FCFA</strong> (ou avoir accompli le VIP 1) !
                  </p>
                )}

                <p className="text-[11px] text-slate-400">
                  Rechargez votre solde dès maintenant pour débloquer automatiquement l'accès !
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    setLockedTaskModal(null);
                    onOpenRecharge();
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer text-center"
                >
                  Effectuer un Dépôt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== REWARD SUCCESS CELEBRATION MODAL ==================== */}
      <AnimatePresence>
        {taskRewardSuccessModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-8 h-8 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">Tâche Réussie !</h4>
                <p className="text-xs text-slate-300">{taskRewardSuccessModal.title}</p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-2xl border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Gain crédité dans votre solde</span>
                <span className="text-2xl font-black font-mono text-green-400 mt-0.5 block">
                  +{taskRewardSuccessModal.reward.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <button
                onClick={() => setTaskRewardSuccessModal(null)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Continuer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== VIP LEVEL INFO & VIP 3 MEMBERSHIP MODAL ==================== */}
      <AnimatePresence>
        {vipLevelModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setVipLevelModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 text-amber-400 border border-amber-500/30 rounded-2xl">
                  <Crown className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider block">
                    {vipLevelModal.price ? `${vipLevelModal.level} • ${vipLevelModal.price}` : vipLevelModal.level}
                  </span>
                  <h3 className="text-lg font-black text-white font-display">
                    {vipLevelModal.title}
                  </h3>
                </div>
              </div>

              {vipLevelModal.isVip3 ? (
                <div className="bg-gradient-to-br from-amber-500/15 via-amber-950/30 to-slate-950 border border-amber-500/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Vous êtes devenus membre de notre société</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Avantage Salaire Quotidien</span>
                    <span className="text-sm font-black font-mono text-green-400">35 000 FCFA à 65 000 FCFA / jour</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-950/70 p-3 rounded-xl border border-amber-500/20">
                    Pour devenir membre officiel de notre société (VIP 3) et percevoir un salaire de <strong>35 000 FCFA à 65 000 FCFA par jour</strong>, vous devez d'abord accomplir et débloquer les niveaux VIP 1 et VIP 2 !
                  </p>
                </div>
              ) : vipLevelModal.isVip2 ? (
                <div className="bg-gradient-to-br from-amber-500/10 to-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Condition de Déblocage VIP 2</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-950/80 p-3 rounded-xl border border-amber-500/20">
                    Pour accéder au <strong>VIP 2</strong>, votre somme totale (solde ou investissements) doit être supérieure ou égale à <strong>10 000 FCFA</strong> (ou avoir accompli le VIP 1) !
                  </p>
                </div>
              ) : (
                <div className={`border rounded-2xl p-4 space-y-2 ${isVip1Finished ? 'bg-emerald-950/80 border-emerald-500/50' : 'bg-slate-950/80 border-slate-800'}`}>
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{isVip1Finished ? 'VIP 1 Clôturé & Bloqué (Terminé)' : 'Accès Automatique dès 2 300 FCFA'}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isVip1Finished ? (
                      <span>
                        Félicitations ! Vous avez accompli l'ensemble des commandes d'articles du <strong>VIP 1</strong> et empoché la récompense globale de <strong>17 000 FCFA</strong>. Ce niveau est désormais sauvegardé et définitivement bloqué.
                      </span>
                    ) : isVip1Unlocked ? (
                      <span>
                        Félicitations ! Avec votre solde actuel de <strong className="text-emerald-400 font-mono">{balance.toLocaleString('fr-FR')} FCFA</strong> (≥ 2 300 FCFA), le système vous donne accès au <strong>VIP 1</strong> ! Vous pouvez exécuter vos quêtes quotidiennes dès maintenant.
                      </span>
                    ) : (
                      <span>
                        Lorsque vous avez un solde d'au moins <strong>2 300 FCFA</strong> sur votre compte, le système vous donne directement accès au <strong>VIP 1</strong> ! Votre solde actuel est de <strong className="text-amber-400 font-mono">{balance.toLocaleString('fr-FR')} FCFA</strong>. Effectuez un dépôt pour débloquer l'accès.
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {vipLevelModal.isVip1 && !isVip1Finished && (
                  <button
                    onClick={handleStartVip1Commander}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-amber-400 to-yellow-400 hover:from-emerald-300 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4 text-slate-950" />
                    <span>
                      {vip1SavedStep === 'article2'
                        ? 'Reprendre la commande VIP 1 (Étape 2/2 • 800 FCFA)'
                        : 'Commander (Articles de mine VIP 1)'}
                    </span>
                  </button>
                )}

                {vipLevelModal.isVip1 && isVip1Finished && (
                  <div className="w-full py-3.5 bg-slate-900 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 opacity-90 select-none cursor-not-allowed">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Niveau VIP 1 Validé & Bloqué (Déjà Terminé)</span>
                  </div>
                )}

                {vipLevelModal.isVip2 && isVip2Unlocked && !isVip2Finished && (
                  <button
                    onClick={handleStartVip2Commander}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-amber-400 to-yellow-400 hover:from-emerald-300 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4 text-slate-950" />
                    <span>
                      {vip2SavedStep === 'article3'
                        ? 'Reprendre la commande VIP 2 (Étape 3/3 • 75 000 FCFA)'
                        : vip2SavedStep === 'article2'
                        ? 'Reprendre la commande VIP 2 (Étape 2/3 • 50 000 FCFA)'
                        : 'Commander (Articles de mine VIP 2)'}
                    </span>
                  </button>
                )}

                {vipLevelModal.isVip2 && isVip2Finished && (
                  <div className="w-full py-3.5 bg-slate-900 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 opacity-90 select-none cursor-not-allowed">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Niveau VIP 2 Validé & Bloqué (Déjà Terminé)</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setVipLevelModal(null);
                    onOpenRecharge();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>
                    {vipLevelModal.isVip3
                      ? "Faire un Dépôt (Débloquer VIP 1 & 2)"
                      : vipLevelModal.isVip2
                      ? (isVip2Unlocked ? "Recharger mon compte" : "Débloquer VIP 2 (Somme ≥ 10 000F)")
                      : isVip1Unlocked
                      ? "Recharger mon compte"
                      : "Débloquer VIP 1 (Dépôt min 2 300F)"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>


                <button
                  onClick={() => setVipLevelModal(null)}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white font-bold text-xs rounded-xl border border-slate-800 transition-all cursor-pointer"
                >
                  Compris
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== VIP 1 COMMANDER & MINING ARTICLES WORKFLOW ==================== */}
      <AnimatePresence>
        {vip1CommanderStep !== 'none' && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-5 text-center overflow-hidden"
            >
              {vip1CommanderStep !== 'loading' && (
                <button
                  onClick={() => setVip1CommanderStep('none')}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/80 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* 1. FAST LOADING POPUP (0% to 100% Progress) */}
              {vip1CommanderStep === 'loading' && (
                <div className="py-6 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-slate-900 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl relative">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
                    <Sparkles className="w-5 h-5 text-yellow-300 absolute top-2 right-2 animate-bounce" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white font-display">
                      Recherche d'articles de mine...
                    </h3>
                    <p className="text-xs text-slate-400">
                      Analyse des équipements aurifères VIP 1 à tarif préférentiel
                    </p>
                  </div>

                  {/* 0-100% Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-xs font-mono font-bold">
                      <span className="text-amber-400">Progression</span>
                      <span className="text-amber-300 font-black">{vip1LoadingProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-3.5 rounded-full border border-amber-500/30 overflow-hidden p-0.5">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full shadow-md"
                        style={{ width: `${vip1LoadingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ARTICLE 1: 700 FCFA */}
              {vip1CommanderStep === 'article1' && (
                <div className="space-y-4 text-left">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full inline-block">
                      Article de Mine VIP 1 • Étape 1/2
                    </span>
                    <h3 className="text-xl font-black text-white font-display">
                      Pelle & Détecteur Aurifère
                    </h3>
                  </div>

                  <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-2xl border-2 border-amber-500/40 overflow-hidden shrink-0 shadow-xl relative bg-slate-900">
                        <img src={imgDetectorKit} alt="Kit Détecteur de Pépites 24K" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-mono block">Équipement d'Excavation</span>
                        <h4 className="text-sm font-extrabold text-white">Kit Détecteur de Pépites 24K</h4>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs text-slate-500 line-through font-mono">2 500 F</span>
                          <span className="text-lg font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            700 FCFA
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      Achetez ce premier article de mine au prix réduit de <strong>700 FCFA</strong> pour lancer l'exploitation de votre filon aurifère VIP 1.
                    </p>
                  </div>

                  <button
                    onClick={handlePayArticle1}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle className="w-5 h-5 text-slate-950" />
                    <span>Payer 700 FCFA</span>
                  </button>
                </div>
              )}

              {/* 3. ARTICLE 2: 800 FCFA */}
              {vip1CommanderStep === 'article2' && (
                <div className="space-y-4 text-left">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full inline-block">
                      Article de Mine VIP 1 • Étape 2/2
                    </span>
                    <h3 className="text-xl font-black text-white font-display">
                      Sonde Aurifère Haute Précision
                    </h3>
                  </div>

                  <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-2xl border-2 border-amber-500/40 overflow-hidden shrink-0 shadow-xl relative bg-slate-900">
                        <img src={imgSpectrometerProbe} alt="Sonde Spectrométrique Lazer" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-mono block">Dernier Équipement Requis</span>
                        <h4 className="text-sm font-extrabold text-white">Sonde Spectrométrique Lazer</h4>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs text-slate-500 line-through font-mono">3 800 F</span>
                          <span className="text-lg font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            800 FCFA
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      Réglez ce second article à <strong>800 FCFA</strong> pour clôturer les commandes VIP 1 et recevoir immédiatement votre récompense exceptionnelle de <strong>17 000 FCFA</strong> !
                    </p>
                  </div>

                  <button
                    onClick={handlePayArticle2}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Crown className="w-5 h-5 text-slate-950" />
                    <span>Payer 800 FCFA & Recevoir 17 000 FCFA</span>
                  </button>
                </div>
              )}

              {/* 4. SUCCESS CELEBRATION MODAL */}
              {vip1CommanderStep === 'success' && (
                <div className="py-2 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/40 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-slate-950 fill-emerald-300" />
                  </div>

                  <div className="space-y-1 text-center">
                    <span className="text-[10px] uppercase font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full inline-block">
                      ✓ VIP 1 Terminé avec Succès
                    </span>
                    <h3 className="text-2xl font-black text-white font-display">
                      Récompense de 17 000 FCFA !
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed px-2">
                      Félicitations ! Vous avez acquis vos 2 articles de mine (700 F + 800 F) et validé votre VIP 1. Une prime de <strong>17 000 FCFA</strong> a été ajoutée à votre solde !
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nouveau Solde Disponible</span>
                    <span className="text-3xl font-black font-mono text-emerald-400 block">
                      {balance.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <button
                    onClick={() => setVip1CommanderStep('none')}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
                  >
                    Super ! Continuer
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== VIP 2 COMMANDER & MINING ARTICLES WORKFLOW ==================== */}
      <AnimatePresence>
        {vip2CommanderStep !== 'none' && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-5 text-center overflow-hidden"
            >
              {vip2CommanderStep !== 'loading' && (
                <button
                  onClick={() => setVip2CommanderStep('none')}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/80 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* 1. FAST LOADING POPUP (0% to 100% Progress) */}
              {vip2CommanderStep === 'loading' && (
                <div className="py-6 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-slate-900 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl relative">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
                    <Sparkles className="w-5 h-5 text-yellow-300 absolute top-2 right-2 animate-bounce" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white font-display">
                      Recherche d'articles de mine VIP 2...
                    </h3>
                    <p className="text-xs text-slate-400">
                      Analyse des équipements aurifères lourds VIP 2 à tarif préférentiel
                    </p>
                  </div>

                  {/* 0-100% Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-xs font-mono font-bold">
                      <span className="text-amber-400">Progression</span>
                      <span className="text-amber-300 font-black">{vip2LoadingProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-3.5 rounded-full border border-amber-500/30 overflow-hidden p-0.5">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full shadow-md"
                        style={{ width: `${vip2LoadingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ARTICLE 1: 25 000 FCFA */}
              {vip2CommanderStep === 'article1' && (
                <div className="space-y-4 text-left">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full inline-block">
                      Article de Mine VIP 2 • Étape 1/3
                    </span>
                    <h3 className="text-xl font-black text-white font-display">
                      Concasseur Aurifère Lourd VIP 2
                    </h3>
                  </div>

                  <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-2xl border-2 border-amber-500/40 overflow-hidden shrink-0 shadow-xl relative bg-slate-900">
                        <img src={imgHydraulicCrusher} alt="Broyeur Hydraulique Quartz 24K" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-mono block">Équipement de Broyage</span>
                        <h4 className="text-sm font-extrabold text-white">Broyeur Hydraulique Quartz 24K</h4>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs text-slate-500 line-through font-mono">45 000 F</span>
                          <span className="text-lg font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            25 000 FCFA
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      Achetez ce premier article de mine VIP 2 à <strong>25 000 FCFA</strong> pour entamer le traitement des filons d'or haut rendement.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handlePayVip2Article1}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <CheckCircle className="w-5 h-5 text-slate-950" />
                      <span>Payer 25 000 FCFA sur Solde</span>
                    </button>

                    <a
                      href="https://geniuspay.ci/product/vip-2-13-aEUmFo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>🔗 Payer via GeniusPay (Article VIP 2 • 1/3)</span>
                    </a>
                  </div>
                </div>
              )}

              {/* 3. ARTICLE 2: 50 000 FCFA */}
              {vip2CommanderStep === 'article2' && (
                <div className="space-y-4 text-left">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full inline-block">
                      Article de Mine VIP 2 • Étape 2/3
                    </span>
                    <h3 className="text-xl font-black text-white font-display">
                      Refroidisseur Industriel VIP 2
                    </h3>
                  </div>

                  <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-2xl border-2 border-amber-500/40 overflow-hidden shrink-0 shadow-xl relative bg-slate-900">
                        <img src={imgCrucibleChiller} alt="Refroidisseur de Creusets d'Or" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-mono block">Système de Thermorégulation</span>
                        <h4 className="text-sm font-extrabold text-white">Refroidisseur de Creusets d'Or</h4>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs text-slate-500 line-through font-mono">90 000 F</span>
                          <span className="text-lg font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            50 000 FCFA
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      Procurez-vous le second article à <strong>50 000 FCFA</strong> pour stabiliser la fusion des lingots aurifères.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handlePayVip2Article2}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <CheckCircle className="w-5 h-5 text-slate-950" />
                      <span>Payer 50 000 FCFA sur Solde</span>
                    </button>

                    <a
                      href="https://geniuspay.ci/product/refroidisseur-de-creusets-dor-SU8bSn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>🔗 Payer via GeniusPay (Article VIP 2 • 2/3)</span>
                    </a>
                  </div>
                </div>
              )}

              {/* 4. ARTICLE 3: 75 000 FCFA */}
              {vip2CommanderStep === 'article3' && (
                <div className="space-y-4 text-left">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full inline-block">
                      Article de Mine VIP 2 • Étape 3/3
                    </span>
                    <h3 className="text-xl font-black text-white font-display">
                      Filtre de Lingots d'Or Massif
                    </h3>
                  </div>

                  <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-2xl border-2 border-amber-500/40 overflow-hidden shrink-0 shadow-xl relative bg-slate-900">
                        <img src={imgGoldIngotFilter} alt="Moule & Filtre Spectrométrique" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-mono block">Purification Finale VIP 2</span>
                        <h4 className="text-sm font-extrabold text-white">Moule & Filtre Spectrométrique</h4>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs text-slate-500 line-through font-mono">130 000 F</span>
                          <span className="text-lg font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            75 000 FCFA
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      Réglez le 3e et dernier article à <strong>75 000 FCFA</strong> pour valider définitivement le VIP 2 et percevoir immédiatement votre prime spéciale de <strong>200 000 FCFA</strong> !
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handlePayVip2Article3}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 hover:from-emerald-400 hover:to-green-300 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Crown className="w-5 h-5 text-slate-950" />
                      <span>Payer 75 000 FCFA sur Solde &amp; Recevoir 200 000 FCFA</span>
                    </button>

                    <a
                      href="https://geniuspay.ci/product/moule-filtre-spectrometrique-PSbX7U"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>🔗 Payer via GeniusPay (Article VIP 2 • 3/3)</span>
                    </a>
                  </div>
                </div>
              )}

              {/* 5. SUCCESS CELEBRATION MODAL (VIP 2) */}
              {vip2CommanderStep === 'success' && (
                <div className="py-2 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/40 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-slate-950 fill-emerald-300" />
                  </div>

                  <div className="space-y-1 text-center">
                    <span className="text-[10px] uppercase font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full inline-block">
                      ✓ VIP 2 Terminé avec Succès
                    </span>
                    <h3 className="text-2xl font-black text-white font-display">
                      Récompense de 200 000 FCFA !
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed px-2">
                      Félicitations ! Vous avez acquis vos 3 articles de mine VIP 2 (25 000 F + 50 000 F + 75 000 F) et validé votre VIP 2. Une prime de <strong>200 000 FCFA</strong> a été créditée sur votre solde !
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nouveau Solde Disponible</span>
                    <span className="text-3xl font-black font-mono text-emerald-400 block">
                      {balance.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <button
                    onClick={() => setVip2CommanderStep('none')}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
                  >
                    Super ! Continuer
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== INSUFFICIENT BALANCE POPUP ==================== */}
      <AnimatePresence>
        {insufficientBalanceModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-slate-900 border-2 border-red-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4 text-center overflow-hidden"
            >
              <button
                onClick={() => setInsufficientBalanceModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg flex items-center justify-center">
                <AlertCircle className="w-9 h-9 text-red-400" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-black text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full inline-block">
                  Solde Insuffisant
                </span>
                <h3 className="text-xl font-black text-white font-display">
                  Recharge requise pour commander
                </h3>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-left">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-mono block">Article à commander</span>
                  <p className="text-sm font-extrabold text-amber-400">{insufficientBalanceModal.articleName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Prix de l'article</span>
                    <span className="text-sm font-black font-mono text-white">
                      {insufficientBalanceModal.requiredPrice.toLocaleString('fr-FR')} F
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Votre solde actuel</span>
                    <span className="text-sm font-black font-mono text-slate-300">
                      {balance.toLocaleString('fr-FR')} F
                    </span>
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-red-400 block">Montant à ajouter sur votre solde</span>
                  <span className="text-2xl font-black font-mono text-red-400 block">
                    +{insufficientBalanceModal.missingAmount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 text-center leading-relaxed">
                  Vous devez recharger au moins <strong>{insufficientBalanceModal.missingAmount.toLocaleString('fr-FR')} FCFA</strong> sur votre compte pour débloquer et passer cette commande.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {insufficientBalanceModal.articleName.includes('3/3') || insufficientBalanceModal.articleName.includes('Moule') || insufficientBalanceModal.price === 75000 ? (
                  <a
                    href="https://geniuspay.ci/product/moule-filtre-spectrometrique-PSbX7U"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>🔗 Payer directement sur GeniusPay (VIP 2 Article 3/3 • 75 000 FCFA)</span>
                  </a>
                ) : insufficientBalanceModal.articleName.includes('2/3') || insufficientBalanceModal.articleName.includes('Refroidisseur') || insufficientBalanceModal.price === 50000 ? (
                  <a
                    href="https://geniuspay.ci/product/refroidisseur-de-creusets-dor-SU8bSn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>🔗 Payer directement sur GeniusPay (VIP 2 Article 2/3 • 50 000 FCFA)</span>
                  </a>
                ) : insufficientBalanceModal.articleName.includes('VIP 2') || insufficientBalanceModal.price === 25000 ? (
                  <a
                    href="https://geniuspay.ci/product/vip-2-13-aEUmFo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>🔗 Payer directement sur GeniusPay (VIP 2 Article 1/3 • 25 000 FCFA)</span>
                  </a>
                ) : (
                  <a
                    href="https://geniuspay.ci/product/article-vip1-HTWkud"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>🔗 Payer directement sur GeniusPay (VIP 1)</span>
                  </a>
                )}

                <button
                  onClick={() => {
                    setInsufficientBalanceModal(null);
                    if (onOpenRecharge) onOpenRecharge();
                  }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-amber-300 font-extrabold text-xs rounded-xl border border-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <span>Recharger le solde de mon compte (+{insufficientBalanceModal.missingAmount.toLocaleString('fr-FR')} FCFA)</span>
                </button>

                <button
                  onClick={() => setInsufficientBalanceModal(null)}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 font-extrabold text-xs rounded-xl border border-slate-800 transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Transaction Receipt Modal */}
      <ReceiptModal
        transaction={selectedReceiptTx}
        isOpen={!!selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
        showToast={showToast}
      />

    </div>
  );
}
