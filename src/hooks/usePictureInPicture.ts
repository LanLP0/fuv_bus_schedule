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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const hasDocumentPip = typeof window !== 'undefined' && 'documentPictureInPicture' in window;
  const hasVideoPip =
    typeof document !== 'undefined' &&
    'pictureInPictureEnabled' in document &&
    document.pictureInPictureEnabled;

  const isSupported = hasDocumentPip || hasVideoPip;

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

  // Open Document Picture-in-Picture
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
          // Cross-origin stylesheet access might fail gracefully
        }
      });

      // Inherit background and reset margin
      pip.document.body.style.margin = '0';
      pip.document.body.style.padding = '0';
      pip.document.body.style.backgroundColor = '#0a0e17';
      pip.document.body.style.overflow = 'hidden';

      // Detect when PiP window is closed by user
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

  // Open Canvas Video PiP Fallback
  const openVideoPip = useCallback(async (): Promise<boolean> => {
    if (!canvasRef.current || !videoRef.current) return false;

    try {
      const stream = canvasRef.current.captureStream(30);
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      await video.requestPictureInPicture();

      video.addEventListener('leavepictureinpicture', () => {
        setIsPipActive(false);
        setPipMode(null);
      });

      setIsPipActive(true);
      setPipMode('video');
      return true;
    } catch (err) {
      console.warn('Video Picture-in-Picture fallback failed:', err);
      return false;
    }
  }, []);

  // Toggle PiP mode
  const togglePip = useCallback(async () => {
    if (isPipActive) {
      closePip();
      return;
    }

    if (hasDocumentPip) {
      const success = await openDocumentPip();
      if (success) return;
    }

    if (hasVideoPip) {
      await openVideoPip();
    }
  }, [isPipActive, hasDocumentPip, hasVideoPip, openDocumentPip, openVideoPip, closePip]);

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
    isSupported,
    togglePip,
    closePip,
    canvasRef,
    videoRef,
  };
}
