/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
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
  ArrowRightLeft
} from 'lucide-react';
import { InvestmentPlan, ActiveInvestment, Transaction } from '../types';
import { DEFAULT_PLANS } from '../data';
import { PlanIcon } from './PlanIcon';

import imgRefinery from '../assets/images/gold_refinery_1783873491748.jpg';
import imgMinePit from '../assets/images/gold_mine_pit_1783873507482.jpg';
import imgEngineers from '../assets/images/mining_engineers_1783873521791.jpg';

interface DashboardScreenProps {
  balance: number;
  activeInvestments: ActiveInvestment[];
  transactions: Transaction[];
  onSelectPlan: (plan: InvestmentPlan) => void;
  onOpenRecharge: () => void;
  onOpenWithdraw: () => void;
  onCollectGains: () => void;
  claimableSum: number;
  schemaCacheStale?: boolean;
  userPhone?: string;
}

export function DashboardScreen({
  balance,
  activeInvestments,
  transactions,
  onSelectPlan,
  onOpenRecharge,
  onOpenWithdraw,
  onCollectGains,
  claimableSum,
  schemaCacheStale,
  userPhone
}: DashboardScreenProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const inviteLink = userPhone ? `https://goldyields.org/join?ref=${userPhone}` : "https://goldyields.org/join?ref=GOLDYIELD";

  const handleCopyCmd = () => {
    navigator.clipboard.writeText("ALTER TABLE users ADD COLUMN IF NOT EXISTS claimable_sum NUMERIC DEFAULT 0;\nALTER TABLE users ADD COLUMN IF NOT EXISTS last_tick_time BIGINT DEFAULT 0;\nNOTIFY pgrst, 'reload schema';");
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate stats
  const totalInvestedSum = activeInvestments.reduce((sum, item) => sum + item.price, 0);
  const totalDailyRevenue = activeInvestments.reduce((sum, item) => sum + item.dailyProfit, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 space-y-8 pb-20 font-sans">
      
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

          <p className="text-[10px] text-slate-500 italic">
            💡 Astuce : Allez dans votre console Supabase, puis dans l'éditeur SQL, collez le script ci-dessus et cliquez sur "Run". Vos données de gains seront instantanément synchronisées de manière sécurisée !
          </p>
        </motion.div>
      )}

      {/* 1. HERO BLOCK & CORE METRICS CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Glowing Gold Card (Main Balance) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-gold-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.04)] flex flex-col justify-between min-h-[220px]"
        >
          {/* Subtle gold lines overlay */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-gold-400" />
                Portefeuille Gold Yield
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight leading-none">
                <span id="recharge-balance">
                  {balance.toLocaleString('fr-FR')}
                </span>
                <span className="text-gold-400 text-2xl md:text-3xl font-bold ml-1.5">FCFA</span>
              </h2>
            </div>
            
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <Sparkles className="w-6 h-6 text-gold-400 animate-pulse" />
            </div>
          </div>

          {/* Quick Stats inside the main wallet */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800/60 relative z-10">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Capital Investi</p>
              <p className="text-base font-bold font-mono text-white">
                {totalInvestedSum.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Rendement Journalier</p>
              <p className="text-base font-bold font-mono text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +{totalDailyRevenue.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </motion.div>

        {/* Claimable Profits Ticking Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-green-400 animate-pulse" />
                Gains à Collecter (Mining Live)
              </span>
              {claimableSum > 0 && (
                <span className="text-[9px] bg-green-500/15 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  ACTIF
                </span>
              )}
            </div>
            <div className="pt-2">
              <p className="text-3xl font-extrabold font-mono text-green-400">
                {claimableSum.toFixed(2)} <span className="text-sm font-bold">FCFA</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Vos plans actifs génèrent du rendement à chaque seconde.
              </p>
            </div>
          </div>

          <button
            onClick={onCollectGains}
            disabled={claimableSum <= 0}
            className={`w-full py-3 px-4 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg mt-6 ${
              claimableSum > 0
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 shadow-green-500/10 hover:shadow-green-500/20'
                : 'bg-slate-950 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Collecter les Gains</span>
          </button>
        </motion.div>
      </div>

      {/* 2. INSTANT ACTION SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Deposit Button */}
        <button
          onClick={onOpenRecharge}
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-gold-500/30 rounded-2xl transition-all text-left flex flex-col gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 group-hover:bg-gold-500/20 group-hover:text-gold-300 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Recharger</span>
            <span className="text-[9px] text-slate-400">Dépôt min: 3 000 FCFA</span>
          </div>
        </button>

        {/* Withdraw Button */}
        <button
          onClick={onOpenWithdraw}
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-gold-500/30 rounded-2xl transition-all text-left flex flex-col gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-colors">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Retirer</span>
            <span className="text-[9px] text-slate-400">Retrait min: 1 000 FCFA</span>
          </div>
        </button>

        {/* Telegram Official Support Channel */}
        <a
          href="https://t.me/Goldyields"
          target="_blank"
          rel="noreferrer"
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/30 rounded-2xl transition-all text-left flex flex-col gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 group-hover:text-sky-300 transition-colors">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Support t.me</span>
            <span className="text-[9px] text-slate-400">Canal Goldyields officiel</span>
          </div>
        </a>

        {/* Documentation / Info */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-left flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Traitement</span>
            <span className="text-[9px] text-slate-400">Automatisé & Sécurisé 24/7</span>
          </div>
        </div>
      </div>

      {/* 3. CORE PRODUCTS GRID (INVESTMENT PLANS) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold font-display text-white">Plans d'Investissement Disponibles</h3>
            <p className="text-xs text-slate-400">Générez des gains réguliers et sécurisés de 30 jours</p>
          </div>
          <span className="text-[10px] text-gold-400 bg-gold-500/5 border border-gold-500/15 py-1 px-3 rounded-full font-semibold font-mono">
            OR PHYSIQUE 99.9%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEFAULT_PLANS.map((plan) => {
            const isPlanPoussiereAlreadyPurchased = plan.id === 'plan_poussiere' && activeInvestments.some((inv) => inv.planId === 'plan_poussiere');

            return (
              <motion.div
                key={plan.id}
                whileHover={isPlanPoussiereAlreadyPurchased ? {} : { y: -4, borderColor: 'rgba(212, 175, 55, 0.35)' }}
                className={`bg-slate-900/80 border rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between group ${
                  isPlanPoussiereAlreadyPurchased ? 'border-red-500/20 opacity-80' : 'border-slate-850'
                }`}
              >
                {/* Card Header design */}
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-center">
                    <div className={`p-3 bg-gradient-to-br ${plan.colorScheme.from} ${plan.colorScheme.to} rounded-2xl border border-white/5`}>
                      <PlanIcon name={plan.iconName} className={`w-5 h-5 ${plan.colorScheme.text}`} />
                    </div>
                    <span className="text-[10px] bg-slate-950/80 border border-slate-800 text-slate-400 py-1 px-2.5 rounded-lg font-mono">
                      Rendement 30j
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold font-display text-white leading-tight">
                      {plan.name}
                    </h4>
                    <span className="text-2xl font-black font-mono text-gold-400 block mt-1">
                      {plan.price.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  {/* Return Details breakdown */}
                  <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-900 grid grid-cols-2 gap-2 text-xs">
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

                {/* Action purchase button */}
                {isPlanPoussiereAlreadyPurchased ? (
                  <button
                    disabled
                    className="w-full mt-4 py-2.5 px-4 bg-slate-950/40 text-red-400/90 font-bold text-xs rounded-xl border border-red-500/20 cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    <span>Achat unique (Déjà investi)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className="w-full mt-4 py-2.5 px-4 bg-slate-950 hover:bg-gradient-to-r hover:from-gold-500 hover:to-amber-600 hover:text-slate-950 text-gold-400 font-bold text-xs rounded-xl border border-gold-500/20 hover:border-transparent transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Investir maintenant</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SECTION FIABILITÉ & INFRASTRUCTURES RÉELLES */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-400" />
            <span>Nos Infrastructures Réelles & Chantiers Partenaires</span>
          </h3>
          <p className="text-xs text-slate-400">
            Gold Yield collabore activement avec des concessions minières de classe mondiale et des raffineries certifiées pour adosser chaque investissement numérique à de l'or physique réel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Site 1 */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl overflow-hidden group hover:border-gold-500/30 transition-all duration-300">
            <div className="h-48 overflow-hidden relative">
              <img
                src={imgMinePit}
                alt="Chantier d'extraction aurifère"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <span className="absolute bottom-3 left-3 text-[10px] bg-gold-500 text-slate-950 font-extrabold px-2.5 py-1 rounded-lg font-mono">
                CONCESSION ACTIVE
              </span>
            </div>
            <div className="p-4 space-y-1.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-gold-400">Mine de Kibali & Gisement du Sahel</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Extraction industrielle moderne à ciel ouvert et traitement haute technologie garantissant un approvisionnement continu de minerai d'or à haut rendement quotidien.
              </p>
            </div>
          </div>

          {/* Site 2 */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl overflow-hidden group hover:border-gold-500/30 transition-all duration-300">
            <div className="h-48 overflow-hidden relative">
              <img
                src={imgRefinery}
                alt="Unité de raffinage de l'or"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <span className="absolute bottom-3 left-3 text-[10px] bg-gold-500 text-slate-950 font-extrabold px-2.5 py-1 rounded-lg font-mono">
                RAFFINAGE CERTIFIÉ 99.9%
              </span>
            </div>
            <div className="p-4 space-y-1.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-gold-400">Unités de Purification & Lingotage</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Transformation sécurisée de l'or brut en lingots certifiés d'une pureté de 99.9% assurant la solidité, la liquidité et la couverture financière complète de notre fonds.
              </p>
            </div>
          </div>

          {/* Site 3 */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl overflow-hidden group hover:border-gold-500/30 transition-all duration-300">
            <div className="h-48 overflow-hidden relative">
              <img
                src={imgEngineers}
                alt="Ingénieurs miniers et géologues"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <span className="absolute bottom-3 left-3 text-[10px] bg-gold-500 text-slate-950 font-extrabold px-2.5 py-1 rounded-lg font-mono">
                CONTRÔLE QUALITÉ & AUDIT
              </span>
            </div>
            <div className="p-4 space-y-1.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-gold-400">Géologues & Experts de Terrain</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Une équipe pluridisciplinaire d'ingénieurs et de techniciens qualifiés gérant la prospection, l'évaluation et l'audit continu pour minimiser les risques.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE PLANS TRACKER */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-gold-400" />
          <span>Mes Plans Actifs ({activeInvestments.length})</span>
        </h3>

        {activeInvestments.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-300">Aucun contrat actif</h4>
            <p className="text-xs text-slate-500 mt-1">
              Sélectionnez l'un de nos plans aurifères ci-dessus pour commencer à miner et collecter des profits journaliers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInvestments.map((act) => {
              // Simulating progress based on actual elapsed time
              const activationDate = new Date(act.dateActivated);
              const totalDays = act.durationDays || 30;
              const msPassed = Date.now() - activationDate.getTime();
              const actualDaysPassed = Math.max(0, Math.floor(msPassed / (1000 * 60 * 60 * 24)));
              const daysPassed = Math.min(actualDaysPassed + 1, totalDays);
              const progressPct = (daysPassed / totalDays) * 100;

              return (
                <div
                  key={act.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{act.planName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Activé le : {new Date(act.dateActivated).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold font-mono text-gold-400 bg-gold-500/5 py-1 px-2.5 rounded-lg border border-gold-400/10">
                      +{act.dailyProfit} FCFA / jour
                    </span>
                  </div>

                  {/* Profit logs in this active item */}
                  <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-900 flex justify-between items-center mb-4 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Rendement de départ</span>
                      <span className="font-bold text-white font-mono">{act.price.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Cumulé Collecté</span>
                      <span className="font-bold text-green-400 font-mono">{(act.totalCollected || 0).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-bold text-gold-400">Total Maximal (30j)</span>
                      <span className="font-bold text-gold-400 font-mono">{act.totalProfit.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>

                  {/* Contract Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-semibold text-slate-500">
                      <span>Progrès du contrat</span>
                      <span>Jour {daysPassed} sur {totalDays}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold-500 to-amber-500 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. USER REFERRAL CARD */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gold-400 flex items-center justify-center md:justify-start gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Programme Parrainage Gold
          </span>
          <h4 className="text-lg font-bold text-white">Partagez l'opportunité et gagnez +10%</h4>
          <p className="text-xs text-slate-400 max-w-lg">
            Gagnez une commission instantanée de 10% sur chaque recharge effectuée par vos investisseurs parrainés. Vos amis reçoivent 1 000 FCFA à l'inscription.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl font-mono text-xs text-slate-300 select-all flex-1 md:flex-none text-center">
            {inviteLink}
          </div>
          <button
            onClick={handleCopyLink}
            className="p-3 bg-gold-500 hover:bg-gold-400 text-slate-950 rounded-xl transition-colors cursor-pointer"
            title="Copier le lien"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 6. TRANSACTION LOGS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-gold-400" />
          <span>Historique des Transactions</span>
        </h3>

        {transactions.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
            Aucun historique de transaction récent.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-850/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      tx.type === 'deposit' ? 'bg-green-500/10 text-green-400' :
                      tx.type === 'withdrawal' ? 'bg-red-500/10 text-red-400' :
                      tx.type === 'investment' ? 'bg-gold-500/10 text-gold-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {tx.type === 'deposit' ? <Plus className="w-4 h-4" /> :
                       tx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4" /> :
                       tx.type === 'investment' ? <Sparkles className="w-4 h-4" /> :
                       <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {tx.type === 'deposit' ? 'Recharge approuvée' :
                         tx.type === 'withdrawal' ? 'Retrait d\'argent' :
                         tx.type === 'investment' ? `Achat plan minier` :
                         'Gain collecté'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {new Date(tx.date).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-xs font-black font-mono ${
                      tx.type === 'deposit' || tx.type === 'collect' ? 'text-green-400' : 'text-white'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'collect' ? '+' : '-'}
                      {tx.amount.toLocaleString('fr-FR')} FCFA
                    </p>
                    <span className={`text-[9px] uppercase font-bold tracking-wider ${
                      tx.status === 'completed' ? 'text-green-400' :
                      tx.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {tx.status === 'completed' ? 'Réussi' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
