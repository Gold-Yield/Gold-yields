import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Headphones, Send, BookOpen, HelpCircle, Sparkles, ChevronRight, Share2 } from 'lucide-react';

export function AssistantBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'guide' | 'faq'>('main');

  const faqs = [
    {
      q: "Comment puis-je investir ?",
      a: "Choisissez un plan dans l'onglet 'Plans d'investissement' (à partir de 3 000 FCFA), cliquez sur 'Acheter' et suivez les instructions de recharge."
    },
    {
      q: "Quels sont les moyens de retrait ?",
      a: "Nous prenons en charge les retraits instantanés par Orange Money, MTN MoMo et Wave."
    },
    {
      q: "Combien puis-je gagner avec le parrainage ?",
      a: "Vous gagnez 10% de commission instantanée sur chaque recharge de vos parrainés. De plus, votre filleul reçoit un bonus de bienvenue de 1 000 FCFA."
    },
    {
      q: "Quand puis-je retirer mes gains ?",
      a: "Vous pouvez collecter vos gains de raffinage en temps réel à tout moment et effectuer une demande de retrait dès le seuil minimal atteint."
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[340px] bg-slate-900/95 border border-slate-800 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-tr from-gold-600 to-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-gold-500/10">
                    <Headphones className="w-5 h-5 text-slate-950" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white flex items-center gap-1">
                    Assistante Gold Yield <Sparkles className="w-3 h-3 text-gold-400" />
                  </h5>
                  <span className="text-[10px] text-emerald-400 font-semibold">Conseillère en ligne • active</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setActiveTab('main');
                }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4 max-h-[380px] overflow-y-auto custom-scrollbar space-y-4">
              {activeTab === 'main' && (
                <>
                  {/* Greeting Box */}
                  <div className="bg-slate-950/50 border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-300 space-y-2">
                    <p>
                      👋 Bonjour ! Je suis votre conseillère virtuelle <strong>Gold Yield</strong>.
                    </p>
                    <p>
                      Notre plateforme vous permet de participer au raffinage d'or physique certifié et d'obtenir des rendements journaliers stables et sécurisés.
                    </p>
                    <p className="font-semibold text-gold-400">
                      Comment puis-je vous guider aujourd'hui ?
                    </p>
                  </div>

                  {/* Quick Action Menus */}
                  <div className="space-y-2">
                    <a
                      href="https://t.me/goldyieldservice"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-sky-600/10 to-sky-500/5 hover:from-sky-600/20 hover:to-sky-500/10 border border-sky-500/20 hover:border-sky-500/40 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-sky-500/25 rounded-xl flex items-center justify-center text-sky-400">
                          <Send className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-white block">Support Telegram Direct</span>
                          <span className="text-[10px] text-sky-400">Parlez à un humain 24h/24</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </a>

                    <button
                      onClick={() => setActiveTab('guide')}
                      className="w-full flex items-center justify-between p-3 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gold-500/10 rounded-xl flex items-center justify-center text-gold-400">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-white block">Guide de démarrage</span>
                          <span className="text-[10px] text-slate-400">3 étapes simples pour débuter</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <button
                      onClick={() => setActiveTab('faq')}
                      className="w-full flex items-center justify-between p-3 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-white block">Foire Aux Questions</span>
                          <span className="text-[10px] text-slate-400">Toutes les réponses à vos questions</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </>
              )}

              {/* Guide Tab */}
              {activeTab === 'guide' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gold-400">Guide de Démarrage</span>
                    <button
                      onClick={() => setActiveTab('main')}
                      className="text-[10px] text-slate-400 hover:text-white underline"
                    >
                      Retour
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xs text-gold-400 font-bold shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="space-y-0.5">
                        <h6 className="text-xs font-bold text-white">Rechargez votre compte</h6>
                        <p className="text-[11px] text-slate-400">Créditez votre portefeuille via Orange, MTN ou Wave dans la section Recharge.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xs text-gold-400 font-bold shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="space-y-0.5">
                        <h6 className="text-xs font-bold text-white">Sélectionnez un plan de raffinage</h6>
                        <p className="text-[11px] text-slate-400">Choisissez le plan adapté à votre budget pour lancer vos machines de raffinage.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xs text-gold-400 font-bold shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="space-y-0.5">
                        <h6 className="text-xs font-bold text-white">Récupérez et retirez vos gains</h6>
                        <p className="text-[11px] text-slate-400">Collectez vos bénéfices accumulés chaque seconde et retirez-les instantanément.</p>
                      </div>
                    </div>
                  </div>

                  <a
                    href="https://t.me/goldyieldservice"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center w-full py-2.5 bg-gold-500 hover:bg-gold-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Besoin d'aide ? Écrire sur Telegram
                  </a>
                </div>
              )}

              {/* FAQ Tab */}
              {activeTab === 'faq' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">FAQ Complète</span>
                    <button
                      onClick={() => setActiveTab('main')}
                      className="text-[10px] text-slate-400 hover:text-white underline"
                    >
                      Retour
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {faqs.map((faq, i) => (
                      <div key={i} className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl space-y-1">
                        <h6 className="text-xs font-bold text-slate-200">{faq.q}</h6>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Telegram Link */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 text-center">
              <span className="text-[9px] text-slate-500">
                Canal officiel Telegram : <a href="https://t.me/goldyieldservice" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">@goldyieldservice</a>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-slate-950 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_12px_35px_rgba(245,158,11,0.45)] cursor-pointer relative z-50 group border border-amber-300/30"
      >
        <span className="absolute inset-0 rounded-full bg-gold-400/20 animate-ping opacity-75 group-hover:opacity-0 transition-opacity" />
        
        {isOpen ? (
          <X className="w-6 h-6 text-slate-950 transition-transform duration-300 rotate-90" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-slate-950" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-bold text-[8px] px-1 rounded-full border border-gold-500 animate-pulse">
              1
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
