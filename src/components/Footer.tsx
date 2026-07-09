/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Coins, Shield, MessageSquare, Clock, Globe } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 space-y-8">
        
        {/* Upper Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-900/60">
          
          {/* Brand Presentation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-amber-600 p-0.5 shadow-md shadow-gold-500/10">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <Coins className="w-4 h-4 text-gold-400" />
                </div>
              </div>
              <span className="text-base font-bold font-display tracking-tight text-white">
                Gold <span className="text-gold-400">Yield</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Votre partenaire de confiance pour des investissements premium dans l'or physique et numérique. Fructifiez votre épargne de manière stable avec des versements journaliers sécurisés.
            </p>
          </div>

          {/* Core Values / Features */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-300">Garanties de Sécurité</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Protocoles de chiffrement SSL avancés</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Versements et retraits automatisés 24h/7j</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Couverture et support international</span>
              </div>
            </div>
          </div>

          {/* Quick Support Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-300">Nous Contacter</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pour toute question relative à vos investissements ou transactions, notre support officiel est disponible en continu sur Telegram.
            </p>
            <a
              href="https://t.me/Goldyields"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/30 text-xs font-semibold text-slate-300 hover:text-sky-400 rounded-xl transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>Support Telegram</span>
            </a>
          </div>

        </div>

        {/* Lower Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            <p>© {currentYear} Gold Yield. Tous droits réservés.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors">Politique de Confidentialité</span>
            <span className="text-slate-800">•</span>
            <span className="hover:text-slate-400 transition-colors">Conditions Générales</span>
            <span className="text-slate-800">•</span>
            <span className="text-gold-500/50 font-semibold font-mono">v1.1.0</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
