import React, { useState, useEffect } from 'react';
import { Download, X, WifiOff, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [showInstalledToast, setShowInstalledToast] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed in this session
    if (sessionStorage.getItem('fuv_pwa_dismissed') === 'true') {
      setIsDismissed(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstalledToast(true);
      setTimeout(() => setShowInstalledToast(false), 4000);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('fuv_pwa_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="offline-banner">
          <WifiOff size={16} />
          <span>You are offline. Showing cached schedule — full timetable remains active.</span>
        </div>
      )}

      {/* Installed Confirmation Toast */}
      {showInstalledToast && (
        <div className="install-toast">
          <CheckCircle2 size={16} color="#34d399" />
          <span>FUV Shuttle installed successfully! Accessible from your home screen.</span>
        </div>
      )}

      {/* In-App Install Prompt Banner */}
      {deferredPrompt && !isInstalled && !isDismissed && (
        <div className="pwa-install-banner glass-panel">
          <div className="pwa-install-content">
            <div className="pwa-install-icon">
              <img
                src="./fuv-shuttle-icon.svg"
                alt="FUV Shuttle"
                width={38}
                height={38}
                style={{ borderRadius: '8px' }}
              />
            </div>
            <div className="pwa-install-text">
              <h4>Install FUV Shuttle App</h4>
              <p>Instant access to live bus schedule, offline support & quick home screen launch.</p>
            </div>
          </div>

          <div className="pwa-install-actions">
            <button className="btn-install" onClick={handleInstallClick}>
              <Download size={15} />
              <span>Install</span>
            </button>
            <button
              className="btn-dismiss"
              onClick={handleDismiss}
              title="Dismiss"
              aria-label="Dismiss installation prompt"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
