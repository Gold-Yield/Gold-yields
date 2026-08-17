import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  HelpCircle
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
  actionLabel?: string;
  targetTab?: 'home' | 'plans' | 'tasks' | 'assets' | 'profile';
}

const TUTORIAL_STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur votre interface Gold Yield',
    badge: 'Guide Interactif',
    description: 'Découvrez en quelques étapes comment naviguer dans l\'application, suivre vos équipements miniers et gérer vos opérations en toute simplicité.',
    icon: Sparkles,
    color: 'from-amber-500 to-yellow-400',
    tips: [
      'Interface intuitive adaptée sur mobile et ordinateur',
      'Accès rapide à votre solde, statistiques et historique',
      'Assistance en ligne disponible à tout moment'
    ],
    actionLabel: 'Commencer la visite'
  },
  {
    id: 'plans',
    title: 'Fonctionnement des Investissements & Équipements',
    badge: 'Étape 1 • Plans',
    description: 'Dans l\'onglet « Plans », découvrez les packs d\'équipements de raffinage minier. Chaque machine possède une durée d\'exploitation et génère une production quotidienne.',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-400',
    tips: [
      'Consultez le coût, la durée de cycle et la production estimée',
      'Possibilité de cumuler plusieurs équipements simultanément',
      'Détails transparents pour chaque pack disponible'
    ],
    actionLabel: 'Voir les récompenses & gains',
    targetTab: 'plans'
  },
  {
    id: 'collection',
    title: 'Collecte des Gains & Production en Temps Réel',
    badge: 'Étape 2 • Collecte',
    description: 'Vos machines actives produisent des gains calculés à chaque seconde. Depuis l\'accueil ou l\'onglet Actifs, vous pouvez récolter vos gains en un clic pour les créditer sur votre solde.',
    icon: Coins,
    color: 'from-amber-400 to-orange-500',
    tips: [
      'Compteur de gains en direct actualisé en continu',
      'Bouton « Récolter » pour transférer la production vers votre solde',
      'Suivi complet de vos machines en exploitation'
    ],
    actionLabel: 'Découvrir le statut VIP',
    targetTab: 'home'
  },
  {
    id: 'vip',
    title: 'Importance des Niveaux VIP',
    badge: 'Étape 3 • Statut VIP',
    description: 'Le statut VIP structure vos paliers de mission et vos plafonds de retrait. Chaque grade (VIP 1, VIP 2, VIP 3) débloque des opportunités progressives et des quotas spécifiques.',
    icon: Crown,
    color: 'from-purple-500 to-indigo-400',
    tips: [
      'VIP 1 : Permet un premier retrait de test de 1 000 FCFA',
      'VIP 2 : Débloque 2 retraits autorisés de 3 000 FCFA chacun',
      'VIP 3 : Niveau officiel pour les missions avancées'
    ],
    actionLabel: 'Gérer vos finances',
    targetTab: 'tasks'
  },
  {
    id: 'finance',
    title: 'Recharges, Retraits & Sécurité',
    badge: 'Étape 4 • Portefeuille',
    description: 'Gérez vos flux financiers via Mobile Money (Orange Money, MTN MoMo, Wave, Moov). Vos opérations sont enregistrées avec traçabilité et reçus détaillés.',
    icon: Layers,
    color: 'from-blue-500 to-cyan-400',
    tips: [
      'Retraits directs vers votre numéro Mobile Money',
      'Reçus téléchargeables et historique des transactions',
      'Respect strict des règles et quotas de votre niveau VIP'
    ],
    actionLabel: 'Terminer le guide'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
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
        transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
        className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 overflow-hidden text-slate-100"
      >
        {/* Background decorative glows */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentStep.badge}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fermer le tutoriel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Icon & Title */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentStep.color} flex items-center justify-center text-slate-950 shadow-lg shrink-0`}>
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white font-display leading-snug">
                {currentStep.title}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Étape {currentStepIndex + 1} sur {TUTORIAL_STEPS.length}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl">
            {currentStep.description}
          </p>
        </div>

        {/* Tips list */}
        <div className="space-y-2.5 mb-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            Points clés à retenir
          </h4>
          <div className="space-y-2">
            {currentStep.tips.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-normal">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress indicator dots */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            {TUTORIAL_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-amber-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Aller à l'étape ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Précédent</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
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
