import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Coins,
  Crown,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Layers,
  HelpCircle,
  ShieldCheck,
  Zap,
  Wallet,
  Users
} from 'lucide-react';

export interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: 'home' | 'plans' | 'tasks' | 'assets' | 'profile') => void;
}

interface Step {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tips: string[];
  vipHighlight?: {
    vip1: string;
    vip2: string;
    vip3: string;
  };
  actionLabel?: string;
  targetTab?: 'home' | 'plans' | 'tasks' | 'assets' | 'profile';
}

const TUTORIAL_STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Guide Officiel Gold Yield',
    badge: 'Guide & Tutoriel Certifié',
    description: 'Bienvenue sur la plateforme certifiée d\'investissement et de gestion de patrimoine aurifère. Découvrez le fonctionnement de vos comptes, de vos équipements miniers et des niveaux d\'adhésion VIP.',
    icon: Sparkles,
    color: 'from-amber-400 via-yellow-500 to-amber-600',
    tips: [
      'Bonus de bienvenue offert de 500 FCFA crédité dès votre inscription',
      'Portefeuille sécurisé avec ID certifié et suivi des rendements en direct',
      'Compatibilité totale avec Mobile Money (Orange, MTN, Wave, Moov)'
    ],
    actionLabel: 'Découvrir les Niveaux VIP'
  },
  {
    id: 'vip',
    title: 'Paliers VIP & Gains Garantis',
    badge: 'Étape 1 • Adhésion VIP',
    description: 'Chaque niveau d\'adhésion VIP débloque des missions exclusives avec des primes garanties et des conditions de retrait définies :',
    icon: Crown,
    color: 'from-amber-500 to-amber-600',
    tips: [
      'VIP 1 (dès 3 500 F de solde) : Validez 2 articles pour 100 000 FCFA de gain total et 1 retrait test de 1 000 FCFA',
      'VIP 2 (dès 10 000 F de solde) : Validez 3 équipements pour 500 000 FCFA de gain total et 2 retraits de 3 000 FCFA',
      'VIP 3 (Statut Société) : Devenez membre officiel avec salaire journalier garanti de 35 000 à 65 000 FCFA/jour'
    ],
    vipHighlight: {
      vip1: 'Gain Total : 100 000 FCFA',
      vip2: 'Gain Total : 500 000 FCFA',
      vip3: 'Salaire : 35k - 65k F/j'
    },
    actionLabel: 'Voir les Équipements de Mine',
    targetTab: 'tasks'
  },
  {
    id: 'plans',
    title: 'Équipements & Production en Direct',
    badge: 'Étape 2 • Extraction Minière',
    description: 'Dans l\'onglet « Plans », activez vos équipements de raffinage aurifère. Chaque unité opère 24h/24 et génère une production minière continue créditée en direct.',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-400',
    tips: [
      'Compteur de bénéfices en temps réel actualisé à la seconde',
      'Bouton « Récolter » pour transférer instantanément vos bénéfices vers le solde',
      'Possibilité de cumuler plusieurs équipements simultanément'
    ],
    actionLabel: 'Comprendre les Dépôts & Retraits',
    targetTab: 'plans'
  },
  {
    id: 'finance',
    title: 'Dépôts, Retraits & Mobile Money',
    badge: 'Étape 3 • Flux Financiers',
    description: 'Effectuez vos transactions en toute sécurité par Mobile Money avec confirmation rapide et génération automatique de reçus officiels.',
    icon: Wallet,
    color: 'from-blue-500 to-cyan-400',
    tips: [
      'Recharges à partir de 3 000 FCFA pour alimenter votre solde et activer vos VIP',
      'Retraits directs vers votre portefeuille Wave, Orange, MTN ou Moov Money',
      'Reçus officiels de validation avec référence de transaction traçable'
    ],
    actionLabel: 'Parrainage & Support'
  },
  {
    id: 'referral_support',
    title: 'Programme de Parrainage & Assistance 24/7',
    badge: 'Étape 4 • Communauté & Aide',
    description: 'Partagez votre lien de recommandation officiel pour faire grandir votre équipe d\'investisseurs et contactez notre service client en cas de besoin.',
    icon: Users,
    color: 'from-amber-400 to-yellow-500',
    tips: [
      'Commission instantanée de +10% sur chaque recharge réalisée par vos filleuls',
      'Vos invités reçoivent automatiquement leur bonus d\'accueil de 500 FCFA',
      'Canal d\'assistance Telegram officiel @goldyieldservice disponible en continu'
    ],
    actionLabel: 'Commencer maintenant'
  }
];

export function TutorialOverlay({ isOpen, onClose, onNavigateTab }: TutorialOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Reset to first step whenever opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TUTORIAL_STEPS.length - 1;
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (currentStep.targetTab && onNavigateTab) {
      onNavigateTab(currentStep.targetTab);
    }

    if (isLast) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
        className="relative z-10 w-full max-w-lg bg-slate-900/95 border border-white/[0.09] rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/90 overflow-hidden text-slate-100"
      >
        {/* Background decorative glows */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-amber-500/25 text-xs font-bold text-amber-300 font-mono shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentStep.badge}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-white/[0.08] transition-all cursor-pointer"
            title="Fermer le guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Icon & Title */}
        <div className="space-y-3.5 mb-5">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentStep.color} p-[1px] shadow-lg shadow-amber-500/15 shrink-0 flex items-center justify-center`}>
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <StepIcon className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white font-display leading-tight tracking-tight">
                {currentStep.title}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Section {currentStepIndex + 1} sur {TUTORIAL_STEPS.length}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 border border-white/[0.06] p-3.5 sm:p-4 rounded-2xl">
            {currentStep.description}
          </p>

          {/* VIP Level Highlighting Box if in VIP step */}
          {currentStep.vipHighlight && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-2.5 text-center">
                <span className="text-[10px] uppercase font-black text-amber-400 block font-mono">VIP 1</span>
                <span className="text-[10px] font-bold text-emerald-400 block font-mono mt-0.5">100 000 F</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">Dès 3 500 F</span>
              </div>
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-2.5 text-center">
                <span className="text-[10px] uppercase font-black text-amber-400 block font-mono">VIP 2</span>
                <span className="text-[10px] font-bold text-emerald-400 block font-mono mt-0.5">500 000 F</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">Dès 10 000 F</span>
              </div>
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-2.5 text-center">
                <span className="text-[10px] uppercase font-black text-amber-400 block font-mono">VIP 3</span>
                <span className="text-[10px] font-bold text-emerald-400 block font-mono mt-0.5">35k - 65k/j</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">Société</span>
              </div>
            </div>
          )}
        </div>

        {/* Tips list */}
        <div className="space-y-2 mb-6">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            Points Essentiels
          </h4>
          <div className="space-y-2">
            {currentStep.tips.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-white/[0.05]"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress indicator dots & Controls */}
        <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            {TUTORIAL_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-gradient-to-r from-amber-400 to-yellow-400'
                    : 'w-2 bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Aller à la section ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/[0.08] text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Précédent</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>{currentStep.actionLabel || (isLast ? 'Terminer' : 'Suivant')}</span>
              {isLast ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

