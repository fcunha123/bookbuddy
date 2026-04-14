// src/components/PWABanners.tsx
// Two components:
//   <InstallBanner /> — prompts user to add app to home screen
//   <OfflineToast />  — shows when the device goes offline

import { useState } from "react";
import { usePWAInstall, useOnlineStatus } from "../hooks/usePWA";

const C = {
  coral:  "#FF4757",
  navy:   "#1A2025",
  yellow: "#FFD93D",
  green:  "#6BCB77",
  cream:  "#FFFBF0",
  white:  "#FFFFFF",
};

// ── Install Banner ────────────────────────────────────────────
export function InstallBanner() {
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || isInstalled || dismissed) return null;

  return (
    <div
      role="banner"
      aria-label="Adicionar BookBuddy à tela inicial"
      style={{
        position:   "fixed",
        bottom:     84, // above the bottom nav
        left:       "50%",
        transform:  "translateX(-50%)",
        width:      "calc(100% - 32px)",
        maxWidth:   358,
        background: C.yellow,
        border:     `3px solid ${C.navy}`,
        borderRadius: 20,
        padding:    "14px 16px",
        display:    "flex",
        alignItems: "center",
        gap:        12,
        boxShadow:  `4px 6px 0px ${C.navy}`,
        zIndex:     500,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 32, flexShrink: 0 }}>📱</span>

      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 15, color: C.navy, margin: 0 }}>
          Adicionar à tela inicial!
        </p>
        <p style={{ fontFamily: "'Boogaloo', cursive", fontSize: 12, color: C.navy, opacity: 0.8, margin: "2px 0 0" }}>
          Acessa o BookBuddy como um app 🚀
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={install}
          aria-label="Instalar BookBuddy"
          style={{
            background:   C.coral,
            color:        C.white,
            border:       `2.5px solid ${C.navy}`,
            borderRadius: 12,
            padding:      "8px 14px",
            fontFamily:   "'Fredoka One', cursive",
            fontSize:     13,
            cursor:       "pointer",
            minHeight:    44,
            minWidth:     44,
            boxShadow:    `2px 3px 0 ${C.navy}`,
          }}
        >
          Instalar
        </button>

        <button
          onClick={() => setDismissed(true)}
          aria-label="Fechar banner de instalação"
          style={{
            background:   "transparent",
            color:        C.navy,
            border:       `2px solid ${C.navy}`,
            borderRadius: 10,
            padding:      "8px 10px",
            fontFamily:   "'Fredoka One', cursive",
            fontSize:     13,
            cursor:       "pointer",
            minHeight:    44,
            minWidth:     44,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Offline Toast ─────────────────────────────────────────────
export function OfflineToast() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position:     "fixed",
        top:          60,
        left:         "50%",
        transform:    "translateX(-50%)",
        background:   C.navy,
        color:        C.white,
        border:       `3px solid ${C.yellow}`,
        borderRadius: 16,
        padding:      "10px 18px",
        display:      "flex",
        alignItems:   "center",
        gap:          10,
        zIndex:       600,
        boxShadow:    `3px 4px 0 ${C.yellow}`,
        whiteSpace:   "nowrap",
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 20 }}>📵</span>
      <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 14, margin: 0 }}>
        Sem conexão — modo offline
      </p>
    </div>
  );
}

// ── iOS Install Instructions ──────────────────────────────────
// iOS doesn't support beforeinstallprompt — show manual instructions instead
export function IOSInstallInstructions() {
  const [show, setShow]       = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { isInstalled }       = usePWAInstall();

  // Detect iOS Safari
  const isIOS    = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  if (!isIOS || !isSafari || isStandalone || isInstalled || dismissed) return null;

  return (
    <>
      {!show && (
        <div
          role="banner"
          style={{
            position:   "fixed",
            bottom:     84,
            left:       "50%",
            transform:  "translateX(-50%)",
            width:      "calc(100% - 32px)",
            maxWidth:   358,
            background: C.yellow,
            border:     `3px solid ${C.navy}`,
            borderRadius: 20,
            padding:    "14px 16px",
            display:    "flex",
            alignItems: "center",
            gap:        12,
            boxShadow:  `4px 6px 0px ${C.navy}`,
            zIndex:     500,
          }}
        >
          <span aria-hidden="true" style={{ fontSize: 32 }}>📱</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: 15, color: C.navy, margin: 0 }}>
              Adicionar à tela inicial!
            </p>
            <p style={{ fontFamily: "'Boogaloo', cursive", fontSize: 12, color: C.navy, opacity: 0.8, margin: "2px 0 0" }}>
              Funciona como um app no iPhone 🍎
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setShow(true)}
              style={{ background: C.coral, color: C.white, border: `2.5px solid ${C.navy}`, borderRadius: 12, padding: "8px 14px", fontFamily: "'Fredoka One', cursive", fontSize: 13, cursor: "pointer", minHeight: 44 }}>
              Como?
            </button>
            <button onClick={() => setDismissed(true)} aria-label="Fechar"
              style={{ background: "transparent", color: C.navy, border: `2px solid ${C.navy}`, borderRadius: 10, padding: "8px 10px", fontFamily: "'Fredoka One', cursive", fontSize: 13, cursor: "pointer", minHeight: 44 }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {show && (
        <div role="dialog" aria-modal="true" aria-labelledby="ios-titulo"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 600 }}
          onClick={() => setShow(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: C.cream, borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 480, border: `3px solid ${C.navy}`, borderBottom: "none" }}>
            <h2 id="ios-titulo" style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: C.navy, textAlign: "center", marginBottom: 20 }}>
              Adicionar ao iPhone 📱
            </h2>
            {[
              { n: "1", emoji: "⬆️", text: 'Toca no ícone "Partilhar" na barra do Safari' },
              { n: "2", emoji: "➕", text: 'Desliza para baixo e toca em "Adicionar ao ecrã de início"' },
              { n: "3", emoji: "✅", text: 'Toca em "Adicionar" no canto superior direito' },
            ].map(s => (
              <div key={s.n} style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: C.yellow, border: `2.5px solid ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: `2px 3px 0 ${C.navy}` }}>{s.emoji}</div>
                <p style={{ fontFamily: "'Boogaloo', cursive", fontSize: 15, color: C.navy, margin: 0, lineHeight: 1.5 }}>{s.text}</p>
              </div>
            ))}
            <button onClick={() => { setShow(false); setDismissed(true); }}
              style={{ width: "100%", background: C.coral, color: C.white, border: `3px solid ${C.navy}`, borderRadius: 18, padding: "14px", fontFamily: "'Fredoka One', cursive", fontSize: 18, cursor: "pointer", boxShadow: `4px 6px 0 ${C.navy}`, minHeight: 56, marginTop: 8 }}>
              Entendido! 👍
            </button>
          </div>
        </div>
      )}
    </>
  );
}
