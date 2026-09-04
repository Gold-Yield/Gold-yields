import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Flame, ArrowUpRight, Award, Zap } from 'lucide-react';
import heroRefineryImg from '../assets/images/gold_refinery_hero_1788513421267.jpg';

interface RefineryHeroBannerProps {
  onOpenPlans?: () => void;
  onOpenTasks?: () => void;
}

export function RefineryHeroBanner({ onOpenPlans, onOpenTasks }: RefineryHeroBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-3xl overflow-hidden border border-amber-500/35 shadow-2xl shadow-black/50 group"
    >
      {/* Background Image with Depth Gradients */}
      <div className="relative h-56 sm:h-64 md:h-72 w-full overflow-hidden">
        <img
          src={heroRefineryImg}
          alt="Raffinerie Aurifère Certifiée Gold Yield"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Layered luxury gradient masks for maximum contrast & aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-yellow-500/10" />

        {/* Content Overlaid on the Image */}
        <div className="absolute inset-0 p-5 sm:p-6 md:p-8 flex flex-col justify-between z-10">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-[11px] font-bold text-amber-300 font-mono shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              <span>RAFFINAGE EN CONTINU 24H/24</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-[11px] font-black text-amber-200 font-mono">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>OR PUR 999.9 CERTIFIÉ</span>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-2 max-w-xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-display leading-tight tracking-tight drop-shadow-md">
              Complexe Minier & Raffinerie Aurifère{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200">
                Gold Yield
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none font-medium">
              Investissez dans des équipements réels d'extraction aurifère en Afrique de l'Ouest et recevez vos rendements quotidiens par Mobile Money.
            </p>
          </div>

          {/* Bottom Highlights & Fast Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.1]">
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">100% Garanti</span>
              </div>
              <div className="hidden xs:flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-emerald-400 font-bold">+100k F à 500k F VIP</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenTasks && (
                <button
                  type="button"
                  onClick={onOpenTasks}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Missions VIP</span>
                </button>
              )}
              {onOpenPlans && (
                <button
                  type="button"
                  onClick={onOpenPlans}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-950/80 hover:bg-slate-900 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Équipements</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
