"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if app is running as PWA
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true;
      setIsStandalone(isStandaloneMode);
    };

    // Check online status
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    // Register service worker
    const registerSW = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js");
          setRegistration(reg);

          // Check for updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  setShowUpdatePrompt(true);
                }
              });
            }
          });
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      }
    };

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show install prompt if not already installed and user hasn't dismissed recently
      const lastDismissed = localStorage.getItem("pwa-install-dismissed");
      const daysSinceLastDismissal = lastDismissed
        ? (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24)
        : Infinity;

      if (!isStandalone && daysSinceLastDismissal > 7) {
        setTimeout(() => setShowInstallPrompt(true), 2000); // Show after 2 seconds
      }
    };

    // Initialize
    checkStandalone();
    updateOnlineStatus();
    registerSW();

    // Event listeners
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
    } else {
      localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleUpdateClick = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      setShowUpdatePrompt(false);
      window.location.reload();
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  return (
    <>
      {children}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 px-4 text-sm font-medium z-50 safe-area-inset">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            You&apos;re currently offline. Changes will sync when connection is
            restored.
          </div>
        </div>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && !isStandalone && (
        <div className="fixed bottom-4 left-4 right-4 z-50 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm">
          <Card className="border-2 border-brand-teal/20 bg-background/95 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-teal/10 rounded-lg flex-shrink-0">
                  <Download className="h-5 w-5 text-brand-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1">
                    Install Clarity Done
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Get faster access and work offline by installing the app on
                    your device.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleInstallClick}
                      size="sm"
                      className="text-xs h-8"
                    >
                      Install App
                    </Button>
                    <Button
                      onClick={dismissInstallPrompt}
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8"
                    >
                      Not now
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={dismissInstallPrompt}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0 -mt-1 -mr-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Update Prompt */}
      {showUpdatePrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm">
          <Card className="border-2 border-brand-teal/20 bg-background/95 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-teal/10 rounded-lg flex-shrink-0">
                  <RefreshCw className="h-5 w-5 text-brand-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1">
                    App Update Available
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    A new version of Clarity Done is available with improvements
                    and bug fixes.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateClick}
                      size="sm"
                      className="text-xs h-8"
                    >
                      Update Now
                    </Button>
                    <Button
                      onClick={() => setShowUpdatePrompt(false)}
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8"
                    >
                      Later
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => setShowUpdatePrompt(false)}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0 -mt-1 -mr-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PWA Status Indicator (development only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-2 right-2 z-50">
          <div
            className={cn(
              "px-2 py-1 rounded text-xs font-mono",
              isStandalone
                ? "bg-green-500 text-white"
                : "bg-gray-500 text-white"
            )}
          >
            {isStandalone ? "PWA" : "Web"}
          </div>
        </div>
      )}
    </>
  );
}
