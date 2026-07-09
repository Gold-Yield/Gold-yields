/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Wallet, Send, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RechargeScreenProps {
  currentBalance: number;
  onBack: () => void;
  onAddTransaction: (amount: number) => void;
}

const PRESETS = [3000, 5000, 10000, 25000, 50000, 100000, 250000];

export function RechargeScreen({ currentBalance, onBack, onAddTransaction }: RechargeScreenProps) {
  const [amount, setAmount] = useState<string>('3000');
  const [error, setError] = useState<string | null>(null);

  const handleSelectPreset = (value: number) => {
    setAmount(value.toString());
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setError(null);
  };

  const handleRecharge = () => {
    const parsedAmount = parseInt(amount);

    if (isNaN(parsedAmount) || parsedAmount < 3000) {
      setError('❌ Le montant minimum de dépôt est de 3 000 FCFA.');
      return;
    }

    // Add a pending transaction or track locally
    onAddTransaction(parsedAmount);

    const telegramUsername = 'Goldyields';
    const message = `Bonjour Gold Yield ! 👋\n\n` +
                    `Je souhaite recharger mon compte.\n` +
                    `💰 *Montant du dépôt :* ${parsedAmount.toLocaleString('fr-FR')} FCFA\n\n` +
                    `Merci de me donner les instructions pour effectuer le paiement. ✨`;

    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/${telegramUsername}?text=${encodedMessage}`;

    alert(`🔄 Redirection... Vous allez être dirigé vers notre service Telegram pour valider votre dépôt de ${parsedAmount.toLocaleString('fr-FR')} FCFA.`);
    
    // Open the window safe and clean
    window.open(telegramUrl, '_blank');
    onBack();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-amber-900/10 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md"
        id="recharge-container"
      >
        {/* Header Navigation */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-800"
            title="Retour à l'accueil"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-display text-white">Recharger mon Compte</h1>
            <p className="text-xs text-slate-400">Approvisionnez votre solde par dépôt sécurisé</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Solde d'affichage */}
          <div className="bg-gradient-to-br from-gold-900/30 to-slate-950 border border-gold-500/15 rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Solde de Recharge Actuel
              </span>
              <span id="solde-recharge-affichage" className="text-2xl font-black font-mono text-gold-400">
                {currentBalance.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div className="p-3 bg-gold-500/10 rounded-xl border border-gold-500/20">
              <Wallet className="w-6 h-6 text-gold-400 animate-pulse" />
            </div>
          </div>

          {/* Amount input block */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">Montant du Dépôt (FCFA)</label>
            <div className="relative">
              <input
                type="number"
                id="input-montant-recharge"
                placeholder="Ex: 5000"
                value={amount}
                onChange={handleInputChange}
                className="w-full pl-4 pr-16 py-3.5 bg-slate-950/80 border border-slate-800 focus:border-gold-500/50 rounded-xl text-lg font-bold font-mono text-white placeholder:text-slate-600 outline-none transition-all"
                min="3000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gold-400 font-mono">
                FCFA
              </span>
            </div>
          </div>

          {/* Preset Buttons Grid */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">Montants Recommandés</span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSelectPreset(preset)}
                  className={`py-2 px-3 text-xs font-bold font-mono rounded-xl border transition-all cursor-pointer ${
                    amount === preset.toString()
                      ? 'bg-gold-500 border-gold-500 text-slate-950 shadow-md shadow-gold-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {preset.toLocaleString('fr-FR')}
                </button>
              ))}
            </div>
          </div>

          {/* Guidelines info box */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-2.5 text-xs text-slate-400">
            <span className="text-gold-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <AlertCircle className="w-3.5 h-3.5" /> Instructions importantes
            </span>
            <ul className="list-disc pl-4 space-y-1">
              <li>Le dépôt minimum requis est de <strong className="text-white">3 000 FCFA</strong>.</li>
              <li>Toutes les recharges sont supervisées par le support officiel de Gold Yield.</li>
              <li>Après clic sur valider, transmettez le montant exact sur Telegram pour recevoir les informations de transfert (Wave, MTN, Orange, Moov).</li>
              <li>Votre portefeuille sera crédité immédiatement après confirmation du reçu de dépôt.</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={onBack}
              className="flex-1 py-3 px-4 border border-slate-800 bg-slate-950 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-900 transition-all cursor-pointer"
            >
              Retour
            </button>

            <button
              onClick={handleRecharge}
              className="flex-1 py-3.5 px-6 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-gold-500/10 hover:shadow-gold-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Demander le Dépôt</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
