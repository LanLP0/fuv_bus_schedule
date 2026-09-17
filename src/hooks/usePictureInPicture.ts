import { useState, useCallback, useRef, useEffect } from 'react';

// Type definitions for Document Picture-in-Picture API
interface DocumentPictureInPictureOptions {
  width?: number;
  height?: number;
  disallowReturnToOpener?: boolean;
}

interface DocumentPictureInPicture {
  requestWindow(options?: DocumentPictureInPictureOptions): Promise<Window>;
  window: Window | null;
  onenter: ((this: DocumentPictureInPicture, ev: Event) => unknown) | null;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

export type PipMode = 'document' | 'video' | null;

export function usePictureInPicture() {
  const [isPipActive, setIsPipActive] = useState<boolean>(false);
  const [pipMode, setPipMode] = useState<PipMode>(null);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipError, setPipError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const hasDocumentPip = typeof window !== 'undefined' && 'documentPictureInPicture' in window;
  const hasVideoPip =
    typeof document !== 'undefined' &&
    'pictureInPictureEnabled' in document &&
    document.pictureInPictureEnabled;

  const isSupported = hasDocumentPip || hasVideoPip;

  const clearError = useCallback(() => setPipError(null), []);

  // Close PiP
  const closePip = useCallback(() => {
    if (pipWindow) {
      try {
        pipWindow.close();
      } catch {
        // ignore if already closed
      }
      setPipWindow(null);
    }

    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    }

    setIsPipActive(false);
    setPipMode(null);
  }, [pipWindow]);

  // Open Document Picture-in-Picture (Desktop only)
  const openDocumentPip = useCallback(async (): Promise<boolean> => {
    if (!window.documentPictureInPicture) return false;

    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: 360,
        height: 220,
      });

      // Copy stylesheets from main window to PiP window
      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          if (styleSheet.href) {
            const link = pip.document.createElement('link');
            link.rel = 'stylesheet';
            link.type = styleSheet.type;
            link.media = styleSheet.media.mediaText;
            link.href = styleSheet.href;
            pip.document.head.appendChild(link);
          } else if (styleSheet.cssRules) {
            const style = pip.document.createElement('style');
            Array.from(styleSheet.cssRules).forEach((rule) => {
              style.appendChild(pip.document.createTextNode(rule.cssText));
            });
            pip.document.head.appendChild(style);
          }
        } catch {
          // Cross-origin stylesheet access fails gracefully
        }
      });

      // Inherit background and reset margin
      pip.document.body.style.margin = '0';
      pip.document.body.style.padding = '0';
      pip.document.body.style.backgroundColor = '#0a0e17';
      pip.document.body.style.overflow = 'hidden';

      pip.addEventListener('pagehide', () => {
        setIsPipActive(false);
        setPipMode(null);
        setPipWindow(null);
      });

      setPipWindow(pip);
      setIsPipActive(true);
      setPipMode('document');
      return true;
    } catch (err) {
      console.warn('Document Picture-in-Picture failed:', err);
      return false;
    }
  }, []);

  // Open Canvas Video PiP Fallback (Mobile & standard browsers)
  const openVideoPip = useCallback(
    async (preRender?: () => void): Promise<boolean> => {
      if (!canvasRef.current || !videoRef.current) {
        setPipError('Media elements not initialized. Please try again.');
        return false;
      }

      try {
        // Method 3: Pre-draw canvas immediately before stream capture
        if (preRender) {
          preRender();
        }

        const canvas = canvasRef.current;
        const video = videoRef.current;

        // Ensure stream is captured with a stable framerate
        const stream = canvas.captureStream(20);
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        await video.play();
        await video.requestPictureInPicture();

        const onLeavePip = () => {
          setIsPipActive(false);
          setPipMode(null);
          video.removeEventListener('leavepictureinpicture', onLeavePip);
        };

        video.addEventListener('leavepictureinpicture', onLeavePip);

        setIsPipActive(true);
        setPipMode('video');
        return true;
      } catch (err) {
        console.error('Video Picture-in-Picture failed:', err);
        let message = 'Failed to start Picture-in-Picture.';

        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') {
            message =
              'Picture-in-Picture was blocked. Ensure Chrome has Picture-in-Picture permission in Android App Settings.';
          } else if (err.name === 'InvalidStateError') {
            message = 'Video stream not ready. Please try tapping the button once more.';
          } else {
            message = err.message || message;
          }
        } else if (err instanceof Error) {
          message = err.message;
        }

        setPipError(message);
        return false;
      }
    },
    []
  );

  // Toggle PiP mode
  const togglePip = useCallback(
    async (preRender?: () => void) => {
      setPipError(null);

      if (isPipActive) {
        closePip();
        return;
      }

      const isMobile =
        typeof navigator !== 'undefined' &&
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      // On desktop, try Document PiP first if available
      if (!isMobile && hasDocumentPip) {
        const success = await openDocumentPip();
        if (success) return;
      }

      // On mobile or if Document PiP unavailable, use Video PiP fallback
      if (hasVideoPip) {
        await openVideoPip(preRender);
      } else {
        setPipError('Picture-in-Picture is not supported on this browser.');
      }
    },
    [isPipActive, hasDocumentPip, hasVideoPip, openDocumentPip, openVideoPip, closePip]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pipWindow) {
        try {
          pipWindow.close();
        } catch {}
      }
    };
  }, [pipWindow]);

  return {
    isPipActive,
    pipMode,
    pipWindow,
    pipError,
    clearError,
    isSupported,
    togglePip,
    closePip,
    canvasRef,
    videoRef,
  };
}
