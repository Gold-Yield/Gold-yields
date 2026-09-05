/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  Crown,
  ShieldCheck,
  Smartphone,
  Flame,
  Check
} from 'lucide-react';

import imgGoldRefineryHero from '../assets/images/gold_refinery_hero_1788513421267.jpg';
import imgGoldVaultBars from '../assets/images/gold_vault_bars_1788513437955.jpg';
import imgGoldMiningRig from '../assets/images/gold_mining_rig_1788513458483.jpg';
import imgWithdrawalAd from '../assets/images/mobile_money_withdrawal_ad_1788535760951.jpg';

interface VideoAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
}

interface Scene {
  id: number;
  duration: number; // in seconds
  title: string;
  badge: string;
  narration: string;
  image: string;
}

const SCENES: Scene[] = [
  {
    id: 1,
    duration: 6,
    title: "Opportunité Exclusive dans l'Or Numérique",
    badge: "INNOVATION 2026",
    narration: "Bienvenue sur Gold Yield, la première plateforme certifiée d'investissement dans l'or physique et le raffinage aurifère en Afrique.",
    image: imgGoldRefineryHero
  },
  {
    id: 2,
    duration: 7,
    title: "Des Revenus Massifs & Quotidiens",
    badge: "GAINS CERTIFIÉS",
    narration: "Gagnez jusqu'à 100 000 FCFA avec le VIP 1, et plus de 500 000 FCFA avec le VIP 2. Les membres VIP 3 perçoivent un salaire quotidien de 35 000 à 65 000 FCFA !",
    image: imgGoldVaultBars
  },
  {
    id: 3,
    duration: 8,
    title: "Retraits Instantanés sur Mobile Money",
    badge: "0 FRAIS • 3 MIN CHRONO",
    narration: "Recevez vos gains directement sur votre compte Wave, Orange Money, MTN MoMo ou Moov en moins de 3 minutes chrono.",
    image: imgWithdrawalAd
  },
  {
    id: 4,
    duration: 7,
    title: "Rejoignez l'Élite & Encaissez Vos Gains",
    badge: "OFFRE LIMITÉE",
    narration: "Inscrivez-vous aujourd'hui et recevez immédiatement 500 FCFA de bonus d'accueil offert. Ne manquez pas cette opportunité !",
    image: imgGoldMiningRig
  }
];

const TOTAL_DURATION = SCENES.reduce((acc, s) => acc + s.duration, 0); // 28s

export function VideoAdModal({ isOpen, onClose, onOpenRegister }: VideoAdModalProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'script'>('video');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Animated counters for scenes
  const [counterBalance, setCounterBalance] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Sound generator using Web Audio API
  const playSoundEffect = (type: 'cash' | 'chime' | 'notification' | 'swoosh') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'cash') {
        // High sparkle bell
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(2400, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'chime') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.1); // A5
        osc.frequency.setValueAtTime(1174.66, now + 0.2); // D6
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'notification') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'swoosh') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Audio playback fails silently if restricted
    }
  };

  // Determine current scene from currentTime
  let accumulated = 0;
  let currentSceneIndex = 0;
  for (let i = 0; i < SCENES.length; i++) {
    if (currentTime < accumulated + SCENES[i].duration) {
      currentSceneIndex = i;
      break;
    }
    accumulated += SCENES[i].duration;
    if (i === SCENES.length - 1) currentSceneIndex = SCENES.length - 1;
  }
  const currentScene = SCENES[currentSceneIndex];

  // Speech synthesis voice-over
  const currentVoiceSceneRef = useRef<number>(-1);

  const speakNarration = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignored
    }
  };

  // When scene index changes, speak narration and trigger sound effect
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    if (currentVoiceSceneRef.current !== currentSceneIndex) {
      currentVoiceSceneRef.current = currentSceneIndex;
      if (!isMuted) {
        speakNarration(currentScene.narration);
      }
      if (currentSceneIndex === 0) playSoundEffect('swoosh');
      if (currentSceneIndex === 1) playSoundEffect('cash');
      if (currentSceneIndex === 2) playSoundEffect('notification');
      if (currentSceneIndex === 3) playSoundEffect('chime');
    }
  }, [currentSceneIndex, isOpen, isPlaying, isMuted]);

  // Main video ticker loop
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= TOTAL_DURATION) {
          return 0; // Loop or stay at end
        }
        return Math.min(TOTAL_DURATION, prev + 0.1);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  // Handle counter animations in scene 2 & 3
  useEffect(() => {
    if (currentSceneIndex === 1) {
      // Ramp from 10 000 to 500 000
      let start = 10000;
      const end = 500000;
      const step = 25000;
      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setCounterBalance(end);
          clearInterval(timer);
        } else {
          setCounterBalance(start);
        }
      }, 70);
      return () => clearInterval(timer);
    } else if (currentSceneIndex === 2) {
      setCounterBalance(250000);
    } else {
      setCounterBalance(100000);
    }
  }, [currentSceneIndex]);

  // Cleanup speech when closed
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      currentVoiceSceneRef.current = -1;
      setCurrentTime(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, (currentTime / TOTAL_DURATION) * 100);

  const fullVideoScriptText = `🔥 SPOT PUBLICITAIRE OFFICIEL — GOLD YIELD AFRIQUE 🔥
[FORMAT REELS / TIKTOK / WHATSAPP STATUS - 30 SECONDES]

🎬 SCÈNE 1 (00:00 - 00:06) : L'OPPORTUNITÉ
[Visuel : Lingots d'or 24K étincelants et ouvriers de la raffinerie industrielle]
🗣️ VOIX-OFF :
"Vous cherchez comment gagner de l'argent réel chaque jour depuis votre téléphone ? Découvrez GOLD YIELD, la plateforme numéro 1 d'investissement dans l'or physique en Afrique de l'Ouest !"

🎬 SCÈNE 2 (00:06 - 00:13) : LES GAINS
[Visuel : Compteur de gains qui explose à +500 000 FCFA avec le statut VIP]
🗣️ VOIX-OFF :
"Avec le VIP 1, touchez 100 000 FCFA ! Avec le VIP 2, empochez plus de 500 000 FCFA ! Et devenez membre officiel au VIP 3 pour percevoir un salaire quotidien de 35 000 à 65 000 FCFA par jour !"

🎬 SCÈNE 3 (00:13 - 00:21) : LES RETRAITS INSTANTANÉS
[Visuel : Notifications push Wave, Orange Money et MTN MoMo qui tombent en direct]
🗣️ VOIX-OFF :
"Les retraits sont 100% instantanés ! Vous retirez vos gains directement sur Wave, Orange Money, MTN ou Moov en moins de 3 minutes chrono, 7 jours sur 7."

🎬 SCÈNE 4 (00:21 - 00:30) : APPEL À L'ACTION
[Visuel : 500 FCFA offerts à l'inscription et lien cliquable]
🗣️ VOIX-OFF :
"Rejoignez dès aujourd'hui plus de 15 000 membres et recevez 500 FCFA de bonus offert dès votre inscription ! Cliquez sur le lien pour commencer immédiatement !"

👉 Lien : ${typeof window !== 'undefined' ? window.location.origin : 'https://goldyield.com'}
#GoldYield #Investissement #WaveMoney #OrangeMoney #MTNMoney #RevenusEnLigne #GainsQuotidiens`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(fullVideoScriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopyShareLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://goldyield.com';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        className="w-full max-w-4xl bg-slate-950 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.25)] flex flex-col my-auto"
      >
        {/* Header bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/60 p-4 px-5 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/30">
              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white font-display">
                  Spot Vidéo Publicitaire Officiel
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                  HD 1080P
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80 font-medium">
                Campagne Gros Gains & Preuves de Retraits Mobile Money
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('video')}
              className={`text-xs px-3 sm:px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'video'
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/20'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Lecteur Vidéo</span>
            </button>

            <button
              onClick={() => setActiveTab('script')}
              className={`text-xs px-3 sm:px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'script'
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/20'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Script Réseaux</span>
            </button>

            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {activeTab === 'video' ? (
          <div className="flex flex-col">
            {/* Cinematic Video Screen (16:9 Aspect Ratio) */}
            <div className="relative aspect-video w-full bg-black overflow-hidden select-none flex items-center justify-center">
              {/* Active Scene Background with smooth transitions and subtle pan/zoom */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScene.id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1.0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <img
                    src={currentScene.image}
                    alt={currentScene.title}
                    className="w-full h-full object-cover brightness-75 contrast-110"
                    referrerPolicy="no-referrer"
                  />
                  {/* Luxury gradient overlays for cinema contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-black/80" />
                </motion.div>
              </AnimatePresence>

              {/* Gold light sweeps & spark particle accents */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

              {/* Watermark Logo Top Left */}
              <div className="absolute top-3 sm:top-5 left-3 sm:left-5 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/30">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-black font-display tracking-wider text-white">
                  GOLD <span className="text-amber-400">YIELD</span>
                </span>
                <span className="text-[9px] font-mono font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded">
                  24K
                </span>
              </div>

              {/* Scene Badge Top Right */}
              <div className="absolute top-3 sm:top-5 right-3 sm:right-5 z-20 flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-mono font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-2.5 py-1 rounded-lg shadow-lg shadow-amber-500/30">
                  {currentScene.badge}
                </span>
              </div>

              {/* DYNAMIC SCENE OVERLAYS */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 sm:p-8 pb-12 pointer-events-none">
                {/* SCENE 1: INTRODUCTION & PURITY */}
                {currentSceneIndex === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-xl space-y-2.5"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full backdrop-blur-md">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-black text-amber-300 tracking-wide">
                        OR PUR 99.99% • RENDEMENTS QUOTIDIENS
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-display text-white leading-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
                      L'Opportunité Financière <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">
                        La Plus Lucrative d'Afrique
                      </span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-lg drop-shadow">
                      Investissez directement dans l'extraction et le raffinage d'or avec des gains garantis versés chaque jour sur votre solde.
                    </p>
                  </motion.div>
                )}

                {/* SCENE 2: MASSIVE EARNINGS COUNTER */}
                {currentSceneIndex === 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-full text-xs font-black font-mono">
                        VIP 1 : +100 000 FCFA
                      </span>
                      <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-black font-mono">
                        VIP 2 : +500 000 FCFA
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-3">
                      <div className="text-3xl sm:text-5xl md:text-6xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_35px_rgba(245,158,11,0.6)]">
                        +{counterBalance.toLocaleString('fr-FR')} <span className="text-amber-400 text-2xl sm:text-4xl">FCFA</span>
                      </div>
                      <span className="text-xs sm:text-sm text-emerald-400 font-bold bg-slate-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        ✓ Collecte Quotidienne Active
                      </span>
                    </div>

                    <div className="bg-slate-950/85 backdrop-blur-md p-3 px-4 rounded-2xl border border-amber-500/30 max-w-lg">
                      <div className="flex items-center gap-2 text-amber-300 font-black text-xs sm:text-sm">
                        <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
                        <span>Statut VIP 3 Société : Salaire de 35 000 à 65 000 FCFA/jour !</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SCENE 3: LIVE MOBILE MONEY WITHDRAWALS */}
                {currentSceneIndex === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase font-mono">
                        Retraits Instantanés
                      </span>
                      <span className="text-xs font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded-md border border-white/10">
                        Temps d'exécution : 2m 45s
                      </span>
                    </div>

                    {/* Simulated live push notifications */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl">
                      <div className="bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-emerald-500/40 shadow-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                          W
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white">Wave CI • Retrait Réussi</p>
                          <p className="text-sm font-black font-mono text-emerald-400">+250 000 FCFA</p>
                          <p className="text-[9px] text-slate-400">Reçu aujourd'hui • Frais : 0 F</p>
                        </div>
                      </div>

                      <div className="bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-orange-500/40 shadow-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                          OM
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white">Orange Money • Reçu</p>
                          <p className="text-sm font-black font-mono text-orange-400">+150 000 FCFA</p>
                          <p className="text-[9px] text-slate-400">Paiement Gold Yield validé</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SCENE 4: CALL TO ACTION */}
                {currentSceneIndex === 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-3"
                  >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase shadow-lg shadow-red-500/30">
                      <Flame className="w-4 h-4" />
                      <span>500 FCFA Offerts Dès L'Inscription !</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-display text-white leading-tight">
                      Commencez à Encaisser <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                        Dès Aujourd'hui !
                      </span>
                    </h2>

                    <div className="pt-1 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {
                          if (onOpenRegister) onOpenRegister();
                          onClose();
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Créer Mon Compte (Bonus 500F)</span>
                      </button>

                      <button
                        onClick={handleCopyShareLink}
                        className="px-4 py-3 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                        <span>{copiedLink ? 'Lien Copié !' : 'Partager la Vidéo'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Subtitles / Speech caption bar at the bottom */}
              <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-none">
                <div className="bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-xl py-1.5 px-3 max-w-2xl mx-auto text-center shadow-lg">
                  <p className="text-[11px] sm:text-xs font-semibold text-amber-200/95 leading-snug">
                    « {currentScene.narration} »
                  </p>
                </div>
              </div>
            </div>

            {/* VIDEO PLAYER CONTROLS & TIMELINE SCRUBBER */}
            <div className="bg-slate-900 p-4 border-t border-slate-800 space-y-3">
              {/* Timeline bar with scene markers */}
              <div className="relative">
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newPercent = clickX / rect.width;
                    setCurrentTime(newPercent * TOTAL_DURATION);
                  }}
                  className="w-full h-2 bg-slate-950 rounded-full overflow-hidden cursor-pointer relative group"
                >
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md shadow-black" />
                  </div>
                </div>

                {/* Scene indicators */}
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                  <span className="text-amber-400 font-bold">
                    0:{Math.floor(currentTime).toString().padStart(2, '0')} / 0:{TOTAL_DURATION}
                  </span>
                  <div className="flex gap-4">
                    {SCENES.map((sc, idx) => (
                      <button
                        key={sc.id}
                        onClick={() => {
                          const start = SCENES.slice(0, idx).reduce((a, b) => a + b.duration, 0);
                          setCurrentTime(start);
                        }}
                        className={`hover:text-amber-300 transition-colors cursor-pointer ${
                          currentSceneIndex === idx ? 'text-amber-300 font-black' : 'text-slate-500'
                        }`}
                      >
                        Scène {sc.id}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsPlaying(!isPlaying);
                      if (isPlaying && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.pause();
                      } else if (!isPlaying && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.resume();
                      }
                    }}
                    className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
                    title={isPlaying ? 'Mettre en pause' : 'Lire la vidéo'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTime(0);
                      setIsPlaying(true);
                      currentVoiceSceneRef.current = -1;
                      if (!isMuted) speakNarration(SCENES[0].narration);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 cursor-pointer transition-colors"
                    title="Recommencer depuis le début"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      const nextMute = !isMuted;
                      setIsMuted(nextMute);
                      if (nextMute && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                      } else if (!nextMute) {
                        speakNarration(currentScene.narration);
                      }
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-1.5 cursor-pointer text-xs font-bold transition-colors ${
                      isMuted
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        : 'bg-slate-950 border-slate-800 text-amber-300 hover:bg-slate-800'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                    <span>{isMuted ? 'Son Coupé' : 'Voix-Off & Effets Actifs'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('script')}
                    className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-amber-300 hover:text-white text-xs font-bold rounded-xl border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Voir Script & Storyboard</span>
                    <span className="sm:hidden">Script</span>
                  </button>

                  <button
                    onClick={handleCopyShareLink}
                    className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="hidden sm:inline">{copiedLink ? 'Lien copié !' : 'Partager Lien'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenRegister) onOpenRegister();
                      onClose();
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>S'inscrire (Bonus 500F)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SCRIPT & STORYBOARD TAB FOR CAPCUT / TIKTOK / WHATSAPP */
          <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Script Vidéo & Storyboard pour Vos Réseaux Sociaux</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Utilisez ce texte professionnel pour enregistrer votre voix dans CapCut, publier sur WhatsApp Status, TikTok ou créer des publicités Facebook Ads percutantes.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono">
                  Découpage Scène par Scène (30 secondes)
                </h4>
                <button
                  onClick={handleCopyScript}
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl hover:bg-amber-400 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copié dans le presse-papier' : 'Copier Tout le Script'}</span>
                </button>
              </div>

              {SCENES.map((scene) => (
                <div key={scene.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white font-display">
                      Scène {scene.id} : {scene.title}
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 bg-slate-950 border border-amber-500/20 px-2 py-0.5 rounded">
                      Durée : {scene.duration}s
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/90 font-medium bg-slate-950 p-3 rounded-xl border border-slate-850 italic">
                    🗣️ Voix-off : « {scene.narration} »
                  </p>
                  <p className="text-[11px] text-slate-400">
                    🎬 <strong className="text-slate-300">Visuel suggéré :</strong> {scene.id === 1 ? "Gros plan sur les lingots d'or 24K et le logo Gold Yield." : scene.id === 2 ? "Capture d'écran du solde montant à +500 000 FCFA avec les packs VIP." : scene.id === 3 ? "Notification SMS Wave et Orange Money confirmant la réception des fonds." : "Affichage du lien d'inscription avec le bonus de 500 FCFA."}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end items-center">
              <button
                onClick={() => setActiveTab('video')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Retour au Lecteur Vidéo
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
