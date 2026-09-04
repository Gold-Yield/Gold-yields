import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Palette, Sparkles, Sun, Moon, Gem, Shield } from 'lucide-react';

export type AppTheme = 'royal' | 'emerald' | 'obsidian' | 'light';

interface ThemeOption {
  id: AppTheme;
  name: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  previewBg: string;
  previewCard: string;
  previewAccent: string;
  textColor: string;
}

const THEMES: ThemeOption[] = [
  {
    id: 'royal',
    name: 'Or Royal & Saphir Nocturne',
    badge: 'Recommandé • Haute Joaillerie',
    description: 'Bleu saphir profond, reflets or pur 24K et contrastes haute précision.',
    icon: Sparkles,
    previewBg: 'bg-[#080e1e]',
    previewCard: 'bg-[#0f1a36]',
    previewAccent: 'bg-amber-400',
    textColor: 'text-amber-300'
  },
  {
    id: 'emerald',
    name: 'Or Impérial & Émeraude Minière',
    badge: 'Chantier Minier de Luxe',
    description: 'Vert émeraude profond, éclats d\'or jaune et touches minérales prestigieuses.',
    icon: Gem,
    previewBg: 'bg-[#04140e]',
    previewCard: 'bg-[#09261d]',
    previewAccent: 'bg-emerald-400',
    textColor: 'text-emerald-300'
  },
  {
    id: 'obsidian',
    name: 'Or Pur & Carbone Obsidienne',
    badge: 'Noir Velours Prestige',
    description: 'Noir profond ultra-contrasté, or métallisé éclatant et ambiance coffre-fort.',
    icon: Moon,
    previewBg: 'bg-[#06070a]',
    previewCard: 'bg-[#12141c]',
    previewAccent: 'bg-yellow-400',
    textColor: 'text-yellow-300'
  },
  {
    id: 'light',
    name: 'Or Solaire & Champagne (Mode Clair)',
    badge: 'Clair & Lumineux',
    description: 'Écrin ivoire doux, cartes blanches immaculées et finitions dorées éclatantes.',
    icon: Sun,
    previewBg: 'bg-[#f7f5ed]',
    previewCard: 'bg-white',
    previewAccent: 'bg-amber-500',
    textColor: 'text-amber-700'
  }
];

interface ThemeSelectorModalProps {
  isOpen: boolean;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  onClose: () => void;
}

export function ThemeSelectorModal({
  isOpen,
  currentTheme,
  onSelectTheme,
  onClose
}: ThemeSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-lg bg-slate-900 border border-white/[0.1] rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/90 overflow-hidden text-slate-100"
      >
        {/* Decorative Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display leading-tight">
                Personnaliser l'Ambiance & Couleurs
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Choisissez l'esthétique visuelle qui vous convient le mieux
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme List Options */}
        <div className="space-y-3 mb-6">
          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            const Icon = theme.icon;

            return (
              <div
                key={theme.id}
                onClick={() => onSelectTheme(theme.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-850 border-amber-400 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-white/[0.06] hover:border-white/[0.15] hover:bg-slate-900/80'
                }`}
              >
                {/* Left Mini Preview Chip & Description */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-12 h-12 rounded-xl ${theme.previewBg} p-1 border border-white/10 shrink-0 shadow-inner flex flex-col justify-between overflow-hidden`}>
                    <div className="flex items-center justify-between">
                      <div className={`w-2 h-2 rounded-full ${theme.previewAccent}`} />
                      <Icon className={`w-3.5 h-3.5 ${theme.textColor}`} />
                    </div>
                    <div className={`h-4 rounded-md ${theme.previewCard} border border-white/5`} />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {theme.name}
                      </h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {theme.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                      {theme.description}
                    </p>
                  </div>
                </div>

                {/* Selected Checkmark */}
                <div className="shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                        : 'border border-slate-700 text-transparent group-hover:border-slate-500'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
          <span className="text-[11px] text-slate-400 font-mono">
            Sauvegardé automatiquement sur votre appareil
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-300 transition-all cursor-pointer active:scale-95"
          >
            Appliquer & Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
