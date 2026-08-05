/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Landmark, Send, AlertCircle, Percent, ShieldCheck, CheckCircle2, Copy, Check, ExternalLink, Award, FileText, X, Crown, Clock } from 'lucide-react';
import { ActiveInvestment, Transaction } from '../types';

interface WithdrawScreenProps {
  currentBalance: number;
  userPhone?: string;
  activeInvestments?: ActiveInvestment[];
  transactions?: Transaction[];
  onBack: () => void;
  onWithdrawSuccess: (amount: number, vipLevel?: string) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function WithdrawScreen({
  currentBalance,
  userPhone,
  activeInvestments = [],
  transactions = [],
  onBack,
  onWithdrawSuccess,
  showToast
}: WithdrawScreenProps) {
  const phone = userPhone || (typeof window !== 'undefined' ? localStorage.getItem('gy_current_phone') || '' : '');

  // Determine VIP level
  const isVip2 =
    (phone && localStorage.getItem(`gy_${phone}_vip1_finished`) === 'true') ||
    (phone && localStorage.getItem(`gy_${phone}_vip2_finished`) === 'true') ||
    (phone && !!localStorage.getItem(`gy_${phone}_vip2_step`)) ||
    activeInvestments.some((inv) => inv.planName?.includes('VIP 2') || inv.price >= 25000);

  const vipLevelName = isVip2 ? 'VIP 2' : 'VIP 1';
  const maxDailyLimit = isVip2 ? 3000 : 1000;

  const [amount, setAmount] = useState<string>(maxDailyLimit.toString());
  const [error, setError] = useState<string | null>(null);
  const [fees, setFees] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);

  const [receiptData, setReceiptData] = useState<{
    id: string;
    grossAmount: number;
    fee: number;
    net: number;
    date: string;
    telegramUrl: string;
  } | null>(null);
  const [copiedProof, setCopiedProof] = useState(false);

  // Check if user already made a withdrawal today
  const todayStr = new Date().toDateString();
  const txListToUse = transactions.length > 0
    ? transactions
    : phone && typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem(`gy_${phone}_transactions`) || '[]')
    : [];

  const hasWithdrawnToday = txListToUse.some((tx: Transaction) => {
    if (tx.type !== 'withdrawal') return false;
    const txDate = new Date(tx.date).toDateString();
    return txDate === todayStr;
  });

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
    setAmount(maxDailyLimit.toString());
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setError(null);
  };

  const handleWithdraw = () => {
    setError(null);

    if (hasWithdrawnToday) {
      setError("❌ Vous avez déjà effectué votre retrait aujourd'hui. La limite est de 1 retrait par jour.");
      return;
    }

    const parsedAmount = parseInt(amount);

    if (isNaN(parsedAmount) || parsedAmount < 1000) {
      setError('❌ Le montant minimum pour un retrait est de 1 000 FCFA.');
      return;
    }

    if (parsedAmount > maxDailyLimit) {
      setError(`❌ En ${vipLevelName}, le montant maximal autorisé pour un retrait est de ${maxDailyLimit.toLocaleString('fr-FR')} FCFA par jour.`);
      return;
    }

    if (parsedAmount > currentBalance) {
      setError('❌ Solde insuffisant pour effectuer ce retrait.');
      return;
    }

    // Trigger the parent state update
    onWithdrawSuccess(parsedAmount, vipLevelName);

    const computedFee = Math.round(parsedAmount * 0.10);
    const computedNet = parsedAmount - computedFee;
    const telegramUsername = 'goldyieldservice';
    const txRef = `GY-WDR-${Date.now().toString().slice(-8)}`;

    const message = `Bonjour Gold Yield ! 💸\n\n` +
                    `Je souhaite effectuer un retrait de mon compte.\n` +
                    `👑 *Niveau VIP :* ${vipLevelName}\n` +
                    `🆔 *Réf Transaction :* ${txRef}\n` +
                    `📉 *Montant Brut :* ${parsedAmount.toLocaleString('fr-FR')} FCFA\n` +
                    `⚡ *Frais de retrait (10%) :* ${computedFee.toLocaleString('fr-FR')} FCFA\n` +
                    `💰 *Montant Net à recevoir :* ${computedNet.toLocaleString('fr-FR')} FCFA\n\n` +
                    `Merci de valider ma demande de retrait.`;

    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/${telegramUsername}?text=${encodedMessage}`;

    setReceiptData({
      id: txRef,
      grossAmount: parsedAmount,
      fee: computedFee,
      net: computedNet,
      date: new Date().toLocaleString('fr-FR'),
      telegramUrl
    });

    if (showToast) {
      showToast(`✅ Reçu de retrait généré avec succès !`, 'success');
    }
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
          {/* VIP Level & Quota Status Badge */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Statut Actuel : {vipLevelName}
                  </span>
                  {hasWithdrawnToday ? (
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Retrait du jour effectué
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 1 Retrait disponible
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Limite quotidienne : <strong className="text-amber-300 font-mono font-bold">{maxDailyLimit.toLocaleString('fr-FR')} FCFA</strong> / jour (1 retrait)
                </p>
              </div>
            </div>
          </div>

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
                Max Autorisé ({maxDailyLimit.toLocaleString('fr-FR')} FCFA)
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                id="input-montant-retrait"
                placeholder={`Ex: ${maxDailyLimit}`}
                value={amount}
                onChange={handleInputChange}
                className="w-full pl-4 pr-24 py-3.5 bg-slate-950/80 border border-slate-800 focus:border-gold-500/50 rounded-xl text-lg font-bold font-mono text-white placeholder:text-slate-600 outline-none transition-all"
                min="1000"
                max={maxDailyLimit}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gold-400 font-mono">
                FCFA
              </span>
            </div>

            {/* Quick preset selector for exact VIP amount */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setAmount(maxDailyLimit.toString()); setError(null); }}
                className="w-full py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Sélectionner le montant {vipLevelName} : {maxDailyLimit.toLocaleString('fr-FR')} FCFA</span>
              </button>
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
              <AlertCircle className="w-3.5 h-3.5" /> Conditions d'exécution des retraits par VIP
            </span>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong className="text-amber-400">VIP 1 :</strong> 1 retrait par jour d'un montant de <strong className="text-white">1 000 FCFA</strong>.</li>
              <li><strong className="text-amber-400">VIP 2 :</strong> 1 retrait par jour d'un montant de <strong className="text-white">3 000 FCFA</strong>.</li>
              <li>Des frais de service de <strong className="text-white">10%</strong> sont appliqués sur chaque retrait.</li>
              <li><strong className="text-emerald-400">Note :</strong> Le solde n'est pas déduit automatiquement lors de la demande. Le solde sera ajusté par l'administrateur sur Supabase lors du traitement.</li>
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

      {/* Official Withdrawal Receipt & Proof Modal */}
      <AnimatePresence>
        {receiptData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6 my-auto"
            >
              <button
                onClick={() => {
                  setReceiptData(null);
                  onBack();
                }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2 pb-3 border-b border-slate-800">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-black uppercase tracking-widest">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Gold Yield S.A. • Reçu de Retrait</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black font-display text-white">
                  Preuve & Demande de Retrait
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Réf : <span className="text-amber-400 font-bold">{receiptData.id}</span>
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Statut du Reçu</span>
                    <span className="text-xs font-black text-amber-400">DEMANDE SOUMISE (EN ENVOI TELEGRAM)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl p-5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Date de la transaction</span>
                  <span className="font-mono text-white font-semibold">{receiptData.date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Montant Brut demandé</span>
                  <span className="font-mono text-white font-bold">{receiptData.grossAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60 text-amber-400">
                  <span>Frais administratifs (10%)</span>
                  <span className="font-mono">-{receiptData.fee.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="pt-2 flex justify-between items-center text-sm font-extrabold">
                  <span className="text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Montant Net à recevoir
                  </span>
                  <span className="text-lg font-mono text-emerald-400">
                    {receiptData.net.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={receiptData.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (showToast) showToast('Validation en cours sur Telegram...', 'info');
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-400 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmettre ce Reçu sur Telegram (Validation Express)</span>
                </a>

                <button
                  onClick={() => {
                    const text = `📜 REÇU DE RETRAIT GOLD YIELD\nRéf: ${receiptData.id}\nMontant Brut: ${receiptData.grossAmount} FCFA\nFrais: ${receiptData.fee} FCFA\nNet à recevoir: ${receiptData.net} FCFA\nDate: ${receiptData.date}`;
                    navigator.clipboard.writeText(text);
                    setCopiedProof(true);
                    if (showToast) showToast('Preuve de retrait copiée dans le presse-papier !', 'success');
                    setTimeout(() => setCopiedProof(false), 2500);
                  }}
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {copiedProof ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedProof ? 'Preuve Copiée !' : 'Copier la Preuve du Reçu'}</span>
                </button>

                <button
                  onClick={() => {
                    setReceiptData(null);
                    onBack();
                  }}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs rounded-xl border border-slate-800 transition-all cursor-pointer"
                >
                  Fermer & Terminer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
