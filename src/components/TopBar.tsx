/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Coins, LogOut, User, Shield } from 'lucide-react';

interface TopBarProps {
  userName: string;
  userPhone: string;
  onLogout: () => void;
}

export function TopBar({ userName, userPhone, onLogout }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-amber-600 p-0.5 shadow-md shadow-gold-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Coins className="w-4.5 h-4.5 text-gold-400" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold font-display tracking-tight text-white block leading-none">
              Gold <span className="text-gold-400">Yield</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              Premium Investment
            </span>
          </div>
        </div>

        {/* User Card & Log Out */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-right">
            <div>
              <p className="text-xs font-semibold text-white leading-none mb-0.5">{userName}</p>
              <p className="text-[10px] text-slate-400 font-mono leading-none">{userPhone}</p>
            </div>
            <div className="w-8.5 h-8.5 rounded-full bg-slate-900 border border-gold-500/15 flex items-center justify-center">
              <User className="w-4 h-4 text-gold-400" />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer flex items-center gap-2"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-semibold hidden md:inline">Déconnexion</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
