/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Coins, Shield, Sparkles, User, Lock, Phone, Gift } from 'lucide-react';

const COUNTRIES = [
  { code: 'CI', dial: '+225', name: 'Côte d’Ivoire', flag: '🇨🇮' },
  { code: 'SN', dial: '+221', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'BF', dial: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'ML', dial: '+223', name: 'Mali', flag: '🇲🇱' },
  { code: 'BJ', dial: '+229', name: 'Bénin', flag: '🇧🇯' },
  { code: 'TG', dial: '+228', name: 'Togo', flag: '🇹🇬' },
  { code: 'NE', dial: '+227', name: 'Niger', flag: '🇳🇪' },
  { code: 'CM', dial: '+237', name: 'Cameroun', flag: '🇨🇲' },
  { code: 'GA', dial: '+241', name: 'Gabon', flag: '🇬🇦' },
  { code: 'CG', dial: '+242', name: 'Congo', flag: '🇨🇬' },
  { code: 'CD', dial: '+243', name: 'RDC', flag: '🇨🇩' },
  { code: 'FR', dial: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'BE', dial: '+32', name: 'Belgique', flag: '🇧🇪' },
  { code: 'CH', dial: '+41', name: 'Suisse', flag: '🇨🇭' },
  { code: 'CA', dial: '+1', name: 'Canada', flag: '🇨🇦' },
];

interface AuthScreenProps {
  onLoginSuccess: (user: any, activeInvestments: any[], transactions: any[]) => void;
}

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState('');
  const [countryDial, setCountryDial] = useState('+225');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('GOLDYIELD');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || !password) {
      setError('Veuillez remplir les champs obligatoires.');
      return;
    }

    setLoading(true);

    // Format phone number with country dial prefix
    let finalPhone = phone.trim();
    if (!finalPhone.startsWith('+')) {
      let cleaned = finalPhone.replace(/\s+/g, '');
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      finalPhone = `${countryDial}${cleaned}`;
    } else {
      finalPhone = finalPhone.replace(/\s+/g, '');
    }

    try {
      if (isSignUp) {
        if (!name) {
          setError('Veuillez saisir votre nom complet.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: finalPhone, name, password, inviteCode }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors de l\'inscription.');
        }

        // Proceed with login success
        onLoginSuccess(data.user, [], []);
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: finalPhone, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erreur de connexion.');
        }

        onLoginSuccess(data.user, data.activeInvestments || [], data.transactions || []);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur de connexion au serveur s\'est produite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Gold Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-gold-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(212,175,55,0.08)] relative z-10"
      >
        {/* App Logo & Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-amber-600 p-0.5 shadow-lg shadow-gold-500/15 mb-4"
          >
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Coins className="w-8 h-8 text-gold-400" />
            </div>
          </motion.div>

          <h1 id="auth-title" className="text-3xl font-bold font-display tracking-tight text-white mb-2">
            {isSignUp ? 'Créer un compte' : 'Gold Yield'}
          </h1>
          <p id="auth-subtitle" className="text-slate-400 text-sm">
            {isSignUp ? 'Rejoignez Gold Yield dès aujourd’hui et investissez malin' : 'Connectez-vous pour gérer vos investissements dans l’or'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 mb-5 flex items-center gap-2"
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Sign Up only) */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1"
            >
              <label className="text-xs font-semibold text-slate-300 block">Nom Complet</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ex: Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-gold-500/50 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>
            </motion.div>
          )}

          {/* Phone Number / Account with Country Code Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Numéro de Téléphone</label>
            <div className="flex gap-2">
              {/* Country select */}
              <div className="relative shrink-0 w-32">
                <select
                  value={countryDial}
                  onChange={(e) => setCountryDial(e.target.value)}
                  className="w-full h-full pl-3 pr-7 py-3 bg-slate-950/50 border border-slate-800 focus:border-gold-500/50 rounded-xl text-xs text-white outline-none transition-all cursor-pointer appearance-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.dial} className="bg-slate-900 text-white text-xs">
                      {c.flag} {c.dial} ({c.code})
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                  ▼
                </div>
              </div>

              {/* Main Phone Input */}
              <div className="relative flex-1">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="Ex: 0102030405"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-gold-500/50 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-gold-500/50 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Invitation Code (Sign Up only) */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1"
              id="invitation-group"
            >
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 block">Code de Parrainage (Optionnel)</label>
                <span className="text-[10px] text-gold-400 flex items-center gap-1">
                  <Gift className="w-3 h-3" /> +1000 FCFA Bonus
                </span>
              </div>
              <div className="relative">
                <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ex: GOLDYIELD"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-gold-500/50 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={loading ? {} : { scale: 1.01 }}
            whileTap={loading ? {} : { scale: 0.99 }}
            type="submit"
            id="submit-btn"
            disabled={loading}
            className={`w-full py-3.5 px-4 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-gold-500/10 hover:shadow-gold-500/20 transition-all mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {loading ? "Traitement..." : (isSignUp ? "S'inscrire" : "Se connecter")}
          </motion.button>
        </form>

        {/* Auth Toggle */}
        <div className="text-center mt-6">
          <button
            onClick={handleToggle}
            id="toggle-btn"
            className="text-xs text-slate-400 hover:text-gold-400 transition-colors duration-150 cursor-pointer underline underline-offset-4"
          >
            {isSignUp ? 'Déjà inscrit ? Se connecter' : 'Pas de compte ? S’inscrire'}
          </button>
        </div>

        {/* Security / Trust Note */}
        <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-slate-800/60 text-[10px] text-slate-500">
          <Shield className="w-3.5 h-3.5 text-gold-500/40" />
          <span>Plateforme cryptée et investissements sécurisés</span>
        </div>
      </motion.div>
    </div>
  );
}
