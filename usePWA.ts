// src/hooks/usePWA.ts
// Provides: install prompt, notification permission, online/offline state

import { useState, useEffect, useCallback } from "react";

// ── Install prompt ────────────────────────────────────────────
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already installed (running in standalone mode)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Prompt was already captured in index.html
    if (window.__pwaInstallPrompt) setCanInstall(true);

    const onAvailable = () => setCanInstall(true);
    window.addEventListener("pwaInstallAvailable", onAvailable);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setCanInstall(false);
    });

    return () => window.removeEventListener("pwaInstallAvailable", onAvailable);
  }, []);

  const install = useCallback(async () => {
    const prompt = window.__pwaInstallPrompt;
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setCanInstall(false);
      window.__pwaInstallPrompt = null;
    }
  }, []);

  return { canInstall, isInstalled, install };
}

// ── Push Notifications ────────────────────────────────────────
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied";
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const subscribe = useCallback(async (userId: string) => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;

    try {
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:     true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Save the subscription to Supabase so the server can send pushes
      // await saveSubscription(userId, sub.toJSON());

      return sub;
    } catch (err) {
      console.error("[Push] Subscription failed:", err);
      return null;
    }
  }, []);

  return { permission, requestPermission, subscribe };
}

// ── Online / Offline ──────────────────────────────────────────
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online",  on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return isOnline;
}

// ── Helpers ───────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// ── Type augmentation for global install prompt ───────────────
declare global {
  interface Window {
    __pwaInstallPrompt: any;
  }
}
