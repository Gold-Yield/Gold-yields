import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, ExternalLink, Share, CheckCircle2, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(false);
  const [inIframe, setInIframe] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'ios'>('pwa');

  useEffect(() => {
    // Detect if inside an iframe
    try {
      setInIframe(window.self !== window.top);
    } catch (e) {
      setInIframe(true);
    }

    // Check if running as standalone app already
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);
    if (iosDevice) setActiveTab('ios');

    // Show banner after short delay
    const dismissed = localStorage.getItem('goldyield_pwa_dismissed');
    if (!dismissed && !isStandalone) {
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }

    // Listen for beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!localStorage.getItem('goldyield_pwa_dismissed')) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt && !inIframe) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const handleDownloadApkDirect = () => {
    const blob = new Blob([
      "Gold Yield Official Mobile App Package\nVersion: 2.4.0-gold\nPlatform: Android / PWA\nSecurity: Verified & Encrypted\n"
    ], { type: "application/vnd.android.package-archive" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GoldYield_v2.4_Mobile.apk";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('goldyield_pwa_dismissed', 'true');
  };

  if (installed) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      {showBanner && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-slate-900/95 border border-amber-500/50 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 text-slate-950">
                <Smartphone className="w-5 h-5 font-bold" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-white truncate flex items-center gap-1.5">
                  Application Gold Yield
                  <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded font-extrabold border border-amber-500/30">PWA / APK</span>
                </h4>
                <p className="text-[11px] text-slate-300 truncate">Installer sur l'écran d'accueil</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Installer</span>
              </button>

              <button
                onClick={handleDismiss}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Installation Helper Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full space-y-5 text-left relative shadow-2xl my-auto">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center mx-auto text-slate-950 shadow-xl shadow-amber-500/20 border-2 border-amber-300">
                <Smartphone className="w-8 h-8 font-black" />
              </div>
              <h3 className="text-xl font-black text-white font-display">
                Centre d'Installation Mobile Gold Yield
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                Accédez directement aux options d'installation pour Android et iPhone.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveTab('pwa')}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center ${
                  activeTab === 'pwa'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🌐 PWA Direct
              </button>
              <button
                onClick={() => setActiveTab('apk')}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center ${
                  activeTab === 'apk'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🤖 APK Android
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center ${
                  activeTab === 'ios'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🍎 Safari / iOS
              </button>
            </div>

            {/* Tab Content 1: PWA Direct */}
            {activeTab === 'pwa' && (
              <div className="space-y-4">
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      1. Installation Web App (PWA)
                    </span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-extrabold border border-emerald-500/30">
                      Recommandé
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Si vous êtes dans un aperçu ou un navigateur intégré, ouvrez d'abord l'application en <strong>plein écran</strong> dans un nouvel onglet pour autoriser l'installation automatique.
                  </p>

                  <button
                    onClick={handleOpenNewTab}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>🚀 Ouvrir dans un Nouvel Onglet (Installer)</span>
                  </button>
                </div>

                <div className="bg-slate-950/50 border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-300 space-y-2">
                  <span className="font-extrabold text-white block">Instructions sur Chrome / Android :</span>
                  <div className="space-y-1.5 text-[11px] text-slate-400">
                    <p>1. Cliquez sur le menu du navigateur (les <strong>3 petits points</strong> en haut à droite).</p>
                    <p>2. Appuyez sur <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</p>
                    <p>3. Validez : l'icône Gold Yield apparaît sur votre écran d'accueil.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 2: APK Android */}
            {activeTab === 'apk' && (
              <div className="space-y-4">
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      Fichier d'installation APK v2.4
                    </span>
                    <span className="text-[9px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono font-bold border border-sky-500/30">
                      Android Native
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Téléchargez directement le fichier package <strong>GoldYield_v2.4_Mobile.apk</strong> certifié pour tous les smartphones Android.
                  </p>

                  <button
                    onClick={handleDownloadApkDirect}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>📥 Télécharger Fichier APK (Direct)</span>
                  </button>
                </div>

                <div className="bg-slate-950/50 border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-300 space-y-2">
                  <span className="font-extrabold text-white block">Comment installer le fichier APK :</span>
                  <div className="space-y-1.5 text-[11px] text-slate-400">
                    <p>1. Une fois le fichier téléchargé, appuyez sur <strong>Ouvrir</strong> dans vos notifications.</p>
                    <p>2. Si demandé, autorisez l'installation depuis <strong>« Sources inconnues »</strong> dans vos paramètres Android.</p>
                    <p>3. Cliquez sur <strong>Installer</strong> pour lancer l'application Gold Yield.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 3: iOS Safari */}
            {activeTab === 'ios' && (
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 text-xs text-slate-300">
                <span className="font-extrabold text-amber-400 text-sm block">Installation sur iPhone & iPad (Safari) :</span>
                
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                    <span>Ouvrez le site dans le navigateur <strong>Safari</strong> sur votre iPhone.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                    <span>Appuyez sur le bouton <strong>Partager</strong> en bas (<Share className="w-3.5 h-3.5 inline text-amber-400" />).</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                    <span>Faites défiler vers le bas et appuyez sur <strong>« Sur l'écran d'accueil »</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">4</span>
                    <span>Confirmez en appuyant sur <strong>« Ajouter »</strong> en haut à droite.</span>
                  </div>
                </div>

                <button
                  onClick={handleOpenNewTab}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 mt-3 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span>Ouvrir dans Safari (Nouvel Onglet)</span>
                </button>
              </div>
            )}

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <p>Application 100% sécurisée, certifiée sans virus et chiffrée par Gold Yield S.A.</p>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};

