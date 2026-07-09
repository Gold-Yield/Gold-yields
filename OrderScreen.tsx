/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Coins, Calendar, TrendingUp, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { InvestmentPlan } from '../types';
import { PlanIcon } from './PlanIcon';

interface OrderScreenProps {
  plan: InvestmentPlan;
  userBalance: number;
  onBack: () => void;
  onPurchaseSuccess: (price: number, plan: InvestmentPlan) => void;
}

export function OrderScreen({ plan, userBalance, onBack, onPurchaseSuccess }: OrderScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isBalanceSufficient = userBalance >= plan.price;

  const handlePay = () => {
    if (isProcessing || feedback) return;

    if (!isBalanceSufficient) {
      setFeedback({
        type: 'error',
        message: '❌ Solde insuffisant ! Veuillez recharger votre portefeuille.',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate elegant secure blockchain-like processing
    setTimeout(() => {
      onPurchaseSuccess(plan.price, plan);
      setFeedback({
        type: 'success',
        message: `✅ Investissement réussi ! Votre plan ${plan.name} a été activé avec succès.`,
      });
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-gold-900/10 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md"
      >
        {/* Detail Image Header with customized visual styling */}
        <div className={`p-8 bg-gradient-to-br ${plan.colorScheme.from} ${plan.colorScheme.to} relative overflow-hidden flex flex-col justify-end min-h-[220px] border-b border-slate-800`}>
          <div className="absolute top-6 left-6">
            <button
              onClick={onBack}
              className="p-2.5 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white hover:text-gold-400 transition-all cursor-pointer border border-white/5 flex items-center justify-center"
              title="Retour à l'accueil"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 transform rotate-12 scale-150 pointer-events-none">
            <PlanIcon name={plan.iconName} className="w-40 h-40 text-gold-400" />
          </div>

          <div className="relative z-10 space-y-2 mt-12">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gold-400 bg-slate-950/40 px-3 py-1.5 rounded-full border border-gold-400/20 inline-block mb-1">
              Actif Minier Aurifère
            </span>
            <h1 id="detail-title" className="text-3xl font-black font-display tracking-tight text-white">
              {plan.name}
            </h1>
            <p className="text-sm text-slate-300">
              Contrat minier de 30 jours pour accumuler des rendements stables
            </p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Key Pricing metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Price */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Prix d'Investissement
              </span>
              <span id="detail-price" className="text-xl font-bold font-mono text-gold-400">
                {plan.price.toLocaleString('fr-FR')} FCFA
              </span>
            </div>

            {/* Daily Profit */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Gain Quotidien
              </span>
              <span id="detail-daily" className="text-xl font-bold font-mono text-green-400">
                +{plan.dailyProfit.toLocaleString('fr-FR')} FCFA
              </span>
            </div>

            {/* Total Profit */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Gain Total (30j)
              </span>
              <span id="detail-total" className="text-xl font-bold font-mono text-white">
                {plan.totalProfit.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Investment Breakdown Statistics */}
          <div className="bg-slate-950/40 rounded-2xl border border-slate-850 p-5 space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Détails Financiers du Contrat
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold-500" />
                  Durée de validité
                </span>
                <span className="font-semibold text-white">30 Jours d'exploitation</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Rendement de l'actif (ROI)
                </span>
                <span className="font-bold text-green-400">
                  +{Math.round((plan.totalProfit / plan.price) * 100)}% de profit net
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-gold-500" />
                  Mécanisme de distribution
                </span>
                <span className="font-semibold text-white">Versement journalier</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400">Votre solde actuel</span>
                <span className={`font-bold ${isBalanceSufficient ? 'text-white' : 'text-red-400'}`}>
                  {userBalance.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Notification feedback section */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl flex items-start gap-3 border ${
                feedback.type === 'success'
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <span className="text-xs font-semibold">{feedback.message}</span>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={onBack}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              onClick={handlePay}
              disabled={isProcessing || (feedback !== null && feedback.type === 'success')}
              className={`flex-1 py-3.5 px-6 font-bold text-sm rounded-xl text-slate-950 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
                isBalanceSufficient
                  ? 'bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 shadow-gold-500/10 hover:shadow-gold-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <span>Transaction en cours...</span>
              ) : feedback && feedback.type === 'success' ? (
                <span>Déjà activé !</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Confirmer & Activer le Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
