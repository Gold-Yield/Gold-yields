/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Wallet, Send, Sparkles, AlertCircle, CheckCircle2, CreditCard, Smartphone, ShieldCheck, Zap, AlertTriangle, X, Copy, Check, ExternalLink, QrCode } from 'lucide-react';

interface RechargeScreenProps {
  currentBalance: number;
  onBack: () => void;
  onAddTransaction: (amount: number) => void;
}

const PRESETS = [3000, 5000, 10000, 25000, 50000, 100000, 250000];

const PAYMENT_METHODS = [
  { id: 'wave', name: 'Wave', color: 'from-sky-500 to-blue-600', badge: 'Populaire & Sans Frais', icon: '🌊' },
  { id: 'orange', name: 'Orange Money', color: 'from-orange-500 to-amber-600', badge: 'Instantané', icon: '🟧' },
  { id: 'mtn', name: 'MTN MoMo', color: 'from-yellow-400 to-yellow-600 text-slate-950', badge: 'Rapide', icon: '🟨' },
  { id: 'moov', name: 'Moov Money', color: 'from-emerald-500 to-teal-600', badge: 'Sécurisé', icon: '🟩' },
];

export function RechargeScreen({ currentBalance, onBack, onAddTransaction }: RechargeScreenProps) {
  const [amount, setAmount] = useState<string>('3000');
  const [selectedMethod, setSelectedMethod] = useState<string>('wave');
  const [unavailableMethod, setUnavailableMethod] = useState<string | null>(null);
  const [showWaveModal, setShowWaveModal] = useState<boolean>(false);
  const [waveSenderPhone, setWaveSenderPhone] = useState<string>('');
  const [waveTxId, setWaveTxId] = useState<string>('');
  const [waveCopiedPhone, setWaveCopiedPhone] = useState<boolean>(false);
  const [waveCopiedAmount, setWaveCopiedAmount] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Merchant Wave receiving phone number
  const WAVE_MERCHANT_PHONE = "+225 05 04 40 21 02";
  const WAVE_RAW_PHONE = "0504402102";

  const handleSelectPreset = (value: number) => {
    setAmount(value.toString());
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setError(null);
  };

  const handleMethodSelect = (methodId: string) => {
    if (methodId !== 'wave') {
      const methodObj = PAYMENT_METHODS.find(m => m.id === methodId);
      setUnavailableMethod(methodObj ? methodObj.name : methodId);
      setSelectedMethod('wave');
    } else {
      setSelectedMethod('wave');
      setUnavailableMethod(null);
    }
    setError(null);
  };

  const handleDirectPayment = () => {
    const parsedAmount = parseInt(amount);

    if (isNaN(parsedAmount) || parsedAmount < 3000) {
      setError('❌ Le montant minimum de dépôt est de 3 000 FCFA.');
      return;
    }

    setError(null);
    if (selectedMethod === 'wave') {
      setShowWaveModal(true);
    }
  };

  const handleConfirmWavePayment = () => {
    const parsedAmount = parseInt(amount);
    setIsSubmitting(true);

    setTimeout(() => {
      onAddTransaction(parsedAmount);
      setIsSubmitting(false);
      setShowWaveModal(false);
      setSuccess(true);
    }, 600);
  };

  const handleTelegramRecharge = () => {
    const parsedAmount = parseInt(amount);

    if (isNaN(parsedAmount) || parsedAmount < 3000) {
      setError('❌ Le montant minimum de dépôt est de 3 000 FCFA.');
      return;
    }

    onAddTransaction(parsedAmount);

    const methodObj = PAYMENT_METHODS.find(m => m.id === selectedMethod);
    const methodName = methodObj ? methodObj.name : 'Moyen Direct';

    const telegramUsername = 'goldyieldservice';
    const message = `Bonjour Gold Yield ! 👋\n\n` +
                    `Je souhaite recharger mon compte.\n` +
                    `💰 *Montant du dépôt :* ${parsedAmount.toLocaleString('fr-FR')} FCFA\n` +
                    `💳 *Moyen sélectionné :* ${methodName}\n\n` +
                    `Merci de me donner les instructions pour finaliser mon paiement. ✨`;

    const encodedMessage = encodeURIComponent(message);
    const telegramUrl = `https://t.me/${telegramUsername}?text=${encodedMessage}`;

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
            <p className="text-xs text-slate-400">Paiement direct sécurisé Wave & Mobile Money</p>
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

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-4"
            >
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Demande de Dépôt Initiée !</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Votre recharge de <strong className="text-emerald-400 font-mono">{parseInt(amount).toLocaleString('fr-FR')} FCFA</strong> via {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name} est en cours de validation automatique.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setSuccess(false)}
                  className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Faire un autre dépôt
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 py-3 px-4 bg-gold-500 hover:bg-gold-400 text-slate-950 rounded-xl text-xs font-bold transition-all"
                >
                  Retour au tableau de bord
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Payment Method Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-300 block flex items-center justify-between">
                  <span>Moyen de Paiement Direct</span>
                  <span className="text-[10px] text-emerald-400 font-normal flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Chiffrement SSL 256-bit
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => handleMethodSelect(method.id)}
                      className={`p-3.5 rounded-2xl border transition-all text-left relative overflow-hidden flex flex-col justify-between gap-2 cursor-pointer ${
                        selectedMethod === method.id
                          ? 'bg-slate-800/90 border-gold-500 ring-1 ring-gold-500/50 shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-lg">{method.icon}</span>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                          method.id === 'wave' 
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' 
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}>
                          {method.badge}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{method.name}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {method.id === 'wave' ? 'Disponible - Direct' : 'Paiement direct'}
                        </span>
                      </div>
                    </button>
                  ))}
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
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs text-slate-400">
                <span className="text-gold-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <AlertCircle className="w-3.5 h-3.5" /> Instructions de dépôt
                </span>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Dépôt minimum : <strong className="text-white">3 000 FCFA</strong>.</li>
                  <li>Cliquez sur <strong className="text-gold-400">Payer directement avec {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}</strong> pour être redirigé vers la page de paiement sécurisée.</li>
                  <li>Alternativement, vous pouvez contacter le support Telegram direct pour tout paiement manuel assisté.</li>
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
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleDirectPayment}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-gold-500 via-amber-500 to-gold-400 hover:from-gold-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-gold-500/15 hover:shadow-gold-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>
                    {isSubmitting
                      ? "Connexion au service de paiement..."
                      : `Payer directement avec ${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}`}
                  </span>
                </button>

                <button
                  onClick={handleTelegramRecharge}
                  className="w-full py-3 px-4 border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ou recharger via assistance Telegram</span>
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Popup Modal for Unavailable Payment Methods */}
      <AnimatePresence>
        {unavailableMethod && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5"
            >
              <button
                onClick={() => setUnavailableMethod(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">Moyen de paiement indisponible</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Le paiement direct automatique via <strong className="text-amber-400">{unavailableMethod}</strong> est actuellement indisponible ou en cours de maintenance réseau.
                </p>
                <p className="text-xs text-slate-400">
                  Veuillez utiliser <strong className="text-sky-400 font-semibold">Wave</strong> pour effectuer votre rechargement direct instantané et sans frais, ou passer par l'assistance Telegram.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedMethod('wave');
                    setUnavailableMethod(null);
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Payer directement avec Wave</span>
                </button>

                <button
                  onClick={() => setUnavailableMethod(null)}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal GUI for Direct Wave Payment */}
      <AnimatePresence>
        {showWaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-full max-w-md bg-slate-900 border border-sky-500/30 rounded-3xl p-6 shadow-2xl relative space-y-5 my-auto"
            >
              <button
                onClick={() => setShowWaveModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sky-500/20 border border-sky-500/40 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-sky-500/10">
                  🌊
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Paiement Direct Wave <span className="text-[10px] bg-sky-500/20 text-sky-400 font-semibold px-2 py-0.5 rounded-full border border-sky-500/30">0% Frais</span>
                  </h3>
                  <p className="text-xs text-slate-400">Effectuez votre dépôt en quelques secondes</p>
                </div>
              </div>

              {/* Step 1: Amount and Number to transfer */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-xs text-slate-400">Montant exact à envoyer :</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-gold-400 font-mono">
                      {parseInt(amount).toLocaleString('fr-FR')} FCFA
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(amount);
                        setWaveCopiedAmount(true);
                        setTimeout(() => setWaveCopiedAmount(false), 2000);
                      }}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                      title="Copier le montant"
                    >
                      {waveCopiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-300 block">Envoyer au numéro Wave :</span>
                  <div className="flex items-center justify-between bg-slate-900 border border-sky-500/30 rounded-xl p-3">
                    <span className="text-sm font-mono font-bold text-sky-300">{WAVE_MERCHANT_PHONE}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(WAVE_RAW_PHONE);
                        setWaveCopiedPhone(true);
                        setTimeout(() => setWaveCopiedPhone(false), 2000);
                      }}
                      className="flex items-center gap-1 py-1 px-2.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold rounded-lg border border-sky-500/30 transition-all cursor-pointer"
                    >
                      {waveCopiedPhone ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Open Wave App direct button with robust deep link & copy */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    // 1. Copy merchant number to clipboard
                    navigator.clipboard.writeText(WAVE_RAW_PHONE);
                    setWaveCopiedPhone(true);

                    // 2. Try launching Wave app via native app schemes
                    const waveAppScheme = `wave://send?phone=+2250504402102`;
                    const waveAndroidIntent = `intent://send?phone=+2250504402102#Intent;scheme=wave;package=com.wave.personal;end`;

                    // Attempt opening Wave app safely
                    const isAndroid = /Android/i.test(navigator.userAgent);
                    if (isAndroid) {
                      window.location.href = waveAndroidIntent;
                    } else {
                      window.location.href = waveAppScheme;
                    }

                    setTimeout(() => setWaveCopiedPhone(false), 4000);
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-500/20 active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>
                    {waveCopiedPhone ? "✓ Numéro 05 04 40 21 02 copié !" : `Ouvrir l'application Wave (${parseInt(amount).toLocaleString('fr-FR')} FCFA)`}
                  </span>
                </button>

                {/* Helpful tip box */}
                <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl space-y-1.5 text-left">
                  <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1">
                    💡 Comment effectuer le transfert sans erreur :
                  </span>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    1. Cliquez sur le bouton bleu ci-dessus : le numéro <strong className="text-sky-400 font-mono">05 04 40 21 02</strong> sera <strong>automatiquement copié</strong> et l'application Wave s'ouvrira.<br />
                    2. Dans l'application Wave, collez le numéro <strong className="text-white font-mono">0504402102</strong> et envoyez <strong className="text-gold-400 font-bold">{parseInt(amount).toLocaleString('fr-FR')} FCFA</strong>.<br />
                    3. Revenez ici, saisissez votre numéro puis cliquez sur « J'ai effectué le transfert ».
                  </p>
                </div>
              </div>

              {/* Step 2: Form submission / Confirmation */}
              <div className="space-y-3 pt-1 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block">Confirmation de la transaction</span>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Votre numéro de téléphone Wave (Ex: 0708091011)"
                    value={waveSenderPhone}
                    onChange={(e) => setWaveSenderPhone(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="ID / Référence de transaction Wave (Optionnel)"
                    value={waveTxId}
                    onChange={(e) => setWaveTxId(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                <button
                  onClick={handleConfirmWavePayment}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Validation en cours...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>J'ai effectué le transfert (Valider le dépôt)</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
