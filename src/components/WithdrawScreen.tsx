/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Landmark, Send, AlertCircle, Percent, ShieldCheck } from 'lucide-react';

interface WithdrawScreenProps {
  currentBalance: number;
  onBack: () => void;
  onWithdrawSuccess: (amount: number) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function WithdrawScreen({ currentBalance, onBack, onWithdrawSuccess, showToast }: WithdrawScreenProps) {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fees, setFees] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);

  // Live calculation of 10% fee and Net amount
  useEffect(() => {
    const parsedAmount = parseInt(amount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      const computedFee = Math.round(parsedAmount * 0.10);
      setFees(computedFee);
      setNetAmount(parsedAmount - computedFee);
    } else {
      setFees(0);
      setNetAmount(0);
    }
  }, [amount]);

  const handleFillMax = () => {
    setAmount(currentBalance.toString());
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setError(null);
  };

  const handleWithdraw = () => {
    const parsedAmount = parseInt(amount);

    if (isNaN(parsedAmount) || parsedAmount < 1000) {
      setError('❌ Le montant minimum pour un retrait est de 1 000 FCFA.');
      return;
    }

    if (parsedAmount > 5000000) {
      setError('❌ Le montant maximum par retrait est de 5 000 000 FCFA.');
      return;
    }

    if (parsedAmount > currentBalance) {
      setError('❌ Solde insuffisant pour effectuer ce retrait.');
      return;
    }

    // Trigger the parent state update
    onWithdrawSuccess(parsedAmount);

    const computedFee = Math.round(parsedAmount * 0.10);
    const computedNet = parsedAmount - computedFee;
    const telegramUsername = 'Goldyields';

    const message = `Bonjour Gold Yield ! 💸\n\n` +
                    `Je souhaite effectuer un retrait de mon compte.\n` +
                    `📉 *Montant Brut :* ${parsedAmount.toLocaleString('fr-FR')} FCFA\n` +
                    `⚡ *Frais de retrait (10%) :* ${computedFee.toLocaleString('fr-FR')} FCFA\n` +
                    `💰 *Montant Net à recevoir :* ${computedNet.toLocaleString('fr-FR')} FCFA\n\n` +
                    `Merci de valider ma demande de retrait.`;

    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/${telegramUsername}?text=${encodedMessage}`;

    if (showToast) {
      showToast(`🔄 Redirection... Vous allez être dirigé vers le support Telegram pour valider votre demande de retrait.`, 'info');
    } else {
      alert(`🔄 Redirection... Vous allez être dirigé vers le support Telegram pour valider votre demande de retrait.`);
    }
    window.open(telegramUrl, '_blank');
    onBack();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-amber-950/10 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md"
        id="retrait-container"
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
            <h1 className="text-xl font-bold font-display text-white">Demande de Retrait</h1>
            <p className="text-xs text-slate-400">Transférez vos profits vers votre compte mobile money</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Solde d'affichage */}
          <div className="bg-gradient-to-br from-amber-900/20 to-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Solde Retirable Disponible
              </span>
              <span id="solde-retrait-affichage" className="text-2xl font-black font-mono text-gold-400 animate-pulse">
                {currentBalance.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <Landmark className="w-6 h-6 text-gold-400" />
            </div>
          </div>

          {/* Amount input block with Fill All Button */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Montant à Retirer (FCFA)</label>
              <button
                type="button"
                onClick={handleFillMax}
                className="text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors cursor-pointer"
              >
                Retirer Tout
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                id="input-montant-retrait"
                placeholder="Ex: 2500"
                value={amount}
                onChange={handleInputChange}
                className="w-full pl-4 pr-24 py-3.5 bg-slate-950/80 border border-slate-800 focus:border-gold-500/50 rounded-xl text-lg font-bold font-mono text-white placeholder:text-slate-600 outline-none transition-all"
                min="1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gold-400 font-mono">
                FCFA
              </span>
            </div>
          </div>

          {/* Live Payout Breakdown statistics */}
          <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-gold-400" />
              Calcul des Frais de Retrait (10%)
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Montant Brut demandé</span>
                <span className="font-mono text-white">
                  {(parseInt(amount) || 0).toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="flex justify-between text-amber-500 font-medium">
                <span>Frais administratifs (10%)</span>
                <span className="font-mono">
                  -{fees.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="border-t border-slate-800/60 my-2 pt-2 flex justify-between font-bold text-white">
                <span className="flex items-center gap-1 text-gold-400">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  Montant Net à recevoir
                </span>
                <span className="font-mono text-green-400 text-lg">
                  {netAmount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Guidelines info box */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-2.5 text-xs text-slate-400">
            <span className="text-amber-500 font-semibold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <AlertCircle className="w-3.5 h-3.5" /> Conditions d'exécution des retraits
            </span>
            <ul className="list-disc pl-4 space-y-1">
              <li>Le montant minimum est de <strong className="text-white">1 000 FCFA</strong>.</li>
              <li>Le montant maximum par transaction est de <strong className="text-white">5 000 000 FCFA</strong>.</li>
              <li>Des frais de service de <strong className="text-white">10%</strong> sont appliqués sur chaque retrait.</li>
              <li>Tous les retraits sont validés manuellement par notre support technique sur Telegram sous 2 à 24 heures.</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
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
              onClick={handleWithdraw}
              className="flex-1 py-3.5 px-6 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-gold-500/10 hover:shadow-gold-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Valider le Retrait</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
