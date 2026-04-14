# BookBuddy PWA — Deploy Gratuito no Vercel

Tempo estimado: **15 minutos** do zero ao ar.

---

## Passo 1 — Estrutura do projeto

Copia os ficheiros desta pasta para o teu projeto existente:

```
bookbuddy/
├── index.html                        ← substitui o teu index.html
├── vercel.json                       ← novo
├── vite.config.ts                    ← substitui ou cria
├── package.json                      ← substitui ou actualiza
├── public/
│   ├── manifest.json                 ← novo
│   ├── sw.js                         ← novo
│   └── icons/                        ← cria esta pasta (ver Passo 2)
│       ├── icon-72.png
│       ├── icon-96.png
│       ├── icon-128.png
│       ├── icon-144.png
│       ├── icon-152.png
│       ├── icon-192.png
│       ├── icon-384.png
│       └── icon-512.png
└── src/
    ├── hooks/
    │   └── usePWA.ts                 ← novo
    └── components/
        └── PWABanners.tsx            ← novo
```

---

## Passo 2 — Gerar os ícones

Precisas de um PNG quadrado do logótipo (mínimo 512×512px).

**Opção A — Online, grátis:**
1. Vai a **pwabuilder.com**
2. Clica em "Generate Icons"
3. Faz upload do teu PNG 512×512
4. Descarrega o ZIP e extrai os PNGs para `public/icons/`

**Opção B — Gerador de emoji (para protótipo rápido):**
```bash
# Instala a ferramenta
npm install -g sharp-cli

# Cria um PNG placeholder a partir do emoji
# (usa o Figma, Canva ou qualquer editor para criar o ícone real)
```

---

## Passo 3 — Instalar dependências

```bash
cd bookbuddy
npm install
```

---

## Passo 4 — Variáveis de ambiente

Cria o ficheiro `.env.local` na raiz:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_VAPID_PUBLIC_KEY=BxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxHxx
```

Os valores do Supabase encontras em:
**Supabase Dashboard → Settings → API**

A chave VAPID é opcional (só necessária para push notifications).
Gera com: `npx web-push generate-vapid-keys`

---

## Passo 5 — Testar localmente

```bash
npm run dev
# Abre http://localhost:3000
```

Para testar o Service Worker em modo dev:
```bash
npm run build && npm run preview
# Abre http://localhost:4173
```

---

## Passo 6 — Adicionar os banners PWA ao App

No teu componente raiz (`src/App.tsx`), adiciona:

```tsx
import { InstallBanner, OfflineToast, IOSInstallInstructions } from "./components/PWABanners";

export default function App() {
  return (
    <>
      {/* ... o teu app existente ... */}

      {/* Banners PWA — ficam por cima de tudo */}
      <InstallBanner />
      <IOSInstallInstructions />
      <OfflineToast />
    </>
  );
}
```

---

## Passo 7 — Deploy no Vercel

### 7a. Via GitHub (recomendado — auto-deploy em cada push)

1. Cria um repositório no GitHub e faz push do código:
   ```bash
   git init
   git add .
   git commit -m "feat: bookbuddy pwa"
   git remote add origin https://github.com/SEU_USER/bookbuddy.git
   git push -u origin main
   ```

2. Vai a **vercel.com** e faz login (pode usar a conta GitHub)

3. Clica **"Add New → Project"**

4. Importa o repositório `bookbuddy`

5. Em **Environment Variables**, adiciona as 3 variáveis do `.env.local`

6. Clica **Deploy** — em ~2 minutos está no ar

7. O URL será algo como `bookbuddy-xxx.vercel.app`

### 7b. Via CLI (mais rápido para testar)

```bash
npm install -g vercel
vercel login
vercel --prod
# Segue as instruções no terminal
# Adiciona as env vars quando pedido
```

---

## Passo 8 — Domínio personalizado (opcional, ~$10/ano)

1. No Vercel → **Settings → Domains**
2. Adiciona o teu domínio (ex: `bookbuddy.pt`)
3. O Vercel fornece os registos DNS para configurares no teu registrar
4. HTTPS é automático e gratuito (Let's Encrypt)

---

## Passo 9 — Verificar que a PWA está correcta

Abre o Chrome DevTools → **Lighthouse**:
1. Selecciona "Mobile" e "Progressive Web App"
2. Clica "Analyse page load"
3. Deves obter **100/100 na categoria PWA**

---

## Resumo do que cada ficheiro faz

| Ficheiro | O que faz |
|---|---|
| `manifest.json` | Diz ao browser o nome, ícones, cor, modo standalone |
| `sw.js` | Cache offline, push notifications, background sync |
| `index.html` | Meta tags para iOS, Android, Open Graph |
| `vercel.json` | Routing SPA, headers de segurança, cache de assets |
| `vite.config.ts` | Build com injecção do service worker |
| `usePWA.ts` | Hooks para instalar, notificações, estado offline |
| `PWABanners.tsx` | UI para prompt de instalação (Android + iOS) |

---

## Checklist final antes de partilhar

- [ ] Ícones em `public/icons/` (todos os tamanhos)
- [ ] `.env.local` com as chaves do Supabase
- [ ] `npm run build` sem erros
- [ ] Lighthouse PWA score ≥ 90
- [ ] Testado no iPhone (Safari) e Android (Chrome)
- [ ] URL partilhado com os primeiros utilizadores 🚀
