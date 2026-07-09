/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Award, Check } from 'lucide-react';

interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BonusModal({ isOpen, onClose }: BonusModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            id="bonus-modal"
            className="w-full max-w-sm bg-slate-900 border-2 border-gold-400/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden text-center z-10"
          >
            {/* Sparkle backgrounds */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Trophy Icon */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold-500/10 mb-5 border border-gold-400/20">
              <div className="absolute inset-0 rounded-full bg-gold-400/10 blur-xl animate-pulse" />
              <Award className="w-10 h-10 text-gold-400 relative z-10 animate-bounce" />
            </div>

            {/* Header */}
            <h3 className="text-xl font-bold font-display text-white mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-400" />
              <span>Cadeau de Bienvenue !</span>
              <Sparkles className="w-5 h-5 text-gold-400" />
            </h3>

            <p className="text-sm text-slate-300 px-2 mb-6">
              Félicitations ! Pour célébrer votre inscription sur <span className="text-gold-400 font-semibold">Gold Yield</span>, nous avons crédité votre portefeuille d'un bonus exclusif de démarrage.
            </p>

            {/* Bonus Box */}
            <div className="bg-gradient-to-br from-gold-900/40 to-slate-950 border border-gold-500/20 rounded-2xl py-4 px-6 mb-6">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                Solde de Bienvenue Offert
              </span>
              <span className="text-3xl font-extrabold font-mono text-gold-400">
                1,000 FCFA
              </span>
            </div>

            {/* Action button */}
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-gold-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Récupérer mon Bonus</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
