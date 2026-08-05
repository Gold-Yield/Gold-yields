/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  Share2, 
  FileText, 
  Coins, 
  ArrowUpRight, 
  Plus, 
  Award,
  Sparkles
} from 'lucide-react';
import { Transaction } from '../types';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function ReceiptModal({ transaction, isOpen, onClose, showToast }: ReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const formattedDate = new Date(transaction.date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const isDeposit = transaction.type === 'deposit';
  const isWithdrawal = transaction.type === 'withdrawal';
  const isInvestment = transaction.type === 'investment';
  const isCollect = transaction.type === 'collect';

  const titleType = isDeposit
    ? 'Reçu de Dépôt / Recharge'
    : isWithdrawal
    ? 'Reçu de Retrait de Fonds'
    : isInvestment
    ? 'Attestation d\'Achat & Contrat Minier'
    : 'Reçu de Collecte de Gains';

  const feeAmount = isWithdrawal ? Math.round(transaction.amount * 0.10) : 0;
  const netAmount = isWithdrawal ? transaction.amount - feeAmount : transaction.amount;

  const receiptReference = `GY-REF-${transaction.id.replace(/[^a-zA-Z0-9]/g, '').slice(-10).toUpperCase()}`;

  const fullReceiptText = `
========================================
📜 GOLD YIELD S.A. - REÇU OFFICIEL & PREUVE
========================================
N° Référence : ${receiptReference}
ID Transaction : ${transaction.id}
Date & Heure  : ${formattedDate}
Type          : ${titleType}
Statut        : ${transaction.status === 'completed' ? 'VALIDÉ & DÉPOUSSIÉRÉ' : 'EN COURS DE TRAITEMENT'}
Détails       : ${transaction.details || 'Opération certifiée par le système Gold Yield'}

----------------------------------------
MONTANT & DÉTAILS FINANCIERS :
----------------------------------------
Montant Brut  : ${transaction.amount.toLocaleString('fr-FR')} FCFA
${isWithdrawal ? `Frais de Retrait (10%) : -${feeAmount.toLocaleString('fr-FR')} FCFA\nMontant Net Reçu     : ${netAmount.toLocaleString('fr-FR')} FCFA` : ''}

========================================
Authentifié par la Raffinerie Gold Yield 🛡️
========================================
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(fullReceiptText);
    setCopied(true);
    if (showToast) showToast('Reçu et preuve de paiement copié !', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (showToast) {
      showToast('📄 Reçu PDF / Imprimable généré avec succès !', 'success');
    }
    // Trigger standard browser print window for receipt
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:text-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6 my-auto print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none"
        >
          {/* Close button (Hidden during print) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer print:hidden"
            title="Fermer le reçu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Official Gold Yield Header */}
          <div className="text-center space-y-2 pb-4 border-b border-slate-800 print:border-black">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-black uppercase tracking-widest print:border-black print:text-black">
              <Award className="w-4 h-4 text-amber-400 print:text-black" />
              <span>Gold Yield S.A. • Reçu Officiel</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-white print:text-black">
              {titleType}
            </h2>
            <p className="text-xs text-slate-400 font-mono print:text-gray-700">
              Réf : <span className="text-amber-400 font-bold print:text-black">{receiptReference}</span>
            </p>
          </div>

          {/* Stamp Seal / Status Badge */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden print:bg-gray-100 print:border-black">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                transaction.status === 'completed'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
              } print:text-black`}>
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block print:text-gray-600">
                  Statut du Règlement
                </span>
                <span className={`text-sm font-extrabold ${
                  transaction.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'
                } print:text-black`}>
                  {transaction.status === 'completed' ? 'PAIEMENT VALIDÉ & APPRUVÉ ✓' : 'TRAITEMENT EN COURS...'}
                </span>
              </div>
            </div>

            {/* Official Watermark Badge */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/80 border border-amber-400/40 px-2 py-0.5 rounded print:text-black">
                CERTIFIÉ CONFORME
              </span>
              <span className="text-[8px] text-slate-500 font-mono mt-0.5">Gold Yield Refinery</span>
            </div>
          </div>

          {/* Financial Details Table */}
          <div className="space-y-3 bg-slate-950/50 border border-slate-850 rounded-2xl p-5 print:bg-gray-50 print:border-black">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 print:text-black">
              <FileText className="w-4 h-4 text-amber-400 print:text-black" />
              <span>Détails de la Preuve de Paiement</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60 print:border-gray-300">
                <span className="text-slate-400 print:text-gray-700">Date & Heure</span>
                <span className="font-mono text-white font-semibold print:text-black">{formattedDate}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60 print:border-gray-300">
                <span className="text-slate-400 print:text-gray-700">Identifiant Transaction</span>
                <span className="font-mono text-amber-300 font-semibold print:text-black">{transaction.id}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60 print:border-gray-300">
                <span className="text-slate-400 print:text-gray-700">Mode de Réseau</span>
                <span className="font-semibold text-white print:text-black">{transaction.details || 'Wave / Mobile Money / Solde'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60 print:border-gray-300">
                <span className="text-slate-400 print:text-gray-700">Montant Principal</span>
                <span className="font-mono font-bold text-white print:text-black">
                  {transaction.amount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              {isWithdrawal && (
                <div className="flex justify-between py-1 border-b border-slate-800/60 text-amber-400 print:text-black">
                  <span>Frais de Gestion Retrait (10%)</span>
                  <span className="font-mono">-{feeAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center text-sm font-extrabold">
                <span className="text-slate-300 flex items-center gap-1.5 print:text-black">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-black" />
                  Net Comptabilisé
                </span>
                <span className="text-lg font-mono text-emerald-400 print:text-black">
                  {netAmount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Footer Security Guarantee */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 print:border-black print:text-black">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 print:text-black" />
            <p className="leading-tight">
              Ce reçu constitue une preuve numérique de transaction officielle émise par <strong>Gold Yield S.A.</strong>. Conservez cette référence.
            </p>
          </div>

          {/* Action Buttons (Hidden when printing) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 print:hidden">
            <button
              onClick={handleCopy}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-700 active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Preuve Copiée !' : 'Copier le Reçu / Preuve'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="py-3 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Imprimer / Télécharger Reçu</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
