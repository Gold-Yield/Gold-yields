/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Coins, LogOut, User, HelpCircle, Palette, Play } from 'lucide-react';

interface TopBarProps {
  userName: string;
  userPhone: string;
  onLogout: () => void;
  onOpenTutorial?: () => void;
  onOpenThemeSelector?: () => void;
  onOpenVideoAd?: () => void;
  currentTheme?: string;
}

export function TopBar({
  userName,
  userPhone,
  onLogout,
  onOpenTutorial,
  onOpenThemeSelector,
  onOpenVideoAd,
  currentTheme = 'royal'
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-white/[0.07] px-4 py-3 md:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Live Network Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[1.5px] shadow-md shadow-amber-500/15">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent" />
              <Coins className="w-5 h-5 text-amber-400 relative z-10" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black font-display tracking-tight text-white block leading-none">
                Gold <span className="text-amber-400">Yield</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>En Ligne</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block mt-0.5">
              Système Minier Certifié
            </span>
          </div>
        </div>

        {/* User Card, Palette, Tutorial & Log Out */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {onOpenVideoAd && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenVideoAd}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-red-600/20 via-amber-500/20 to-yellow-500/15 hover:from-red-600/30 hover:to-amber-500/30 border border-amber-500/40 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-amber-500/10 group"
              title="Regarder le Spot Publicitaire (Preuves & Retraits)"
            >
              <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                <Play className="w-2.5 h-2.5 fill-slate-950 ml-0.5 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-mono uppercase tracking-wide text-[11px] hidden sm:inline">Pub Vidéo</span>
              <span className="text-[9px] font-mono bg-red-600 text-white px-1 rounded font-black animate-pulse">HD</span>
            </motion.button>
          )}

          {onOpenThemeSelector && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenThemeSelector}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-white/[0.1] hover:border-amber-400/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Changer de thème et couleurs"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline font-mono text-[11px]">Couleurs</span>
            </motion.button>
          )}

          {onOpenTutorial && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenTutorial}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/10 hover:from-amber-500/25 hover:to-yellow-500/20 border border-amber-500/35 text-amber-300 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-amber-500/10"
              title="Guide Officiel & Niveaux VIP"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
              <span className="font-mono uppercase tracking-wide text-[11px]">Guide</span>
            </motion.button>
          )}

          <div className="hidden sm:flex items-center gap-2.5 bg-slate-900/80 border border-white/[0.06] rounded-xl px-3 py-1.5">
            <div className="text-right">
              <p className="text-xs font-bold text-white leading-tight">{userName}</p>
              <p className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">{userPhone}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-slate-900 border border-amber-500/30 flex items-center justify-center">
              <User className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLogout}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all cursor-pointer flex items-center gap-1.5"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-bold hidden md:inline">Déconnexion</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
