# Disciplo

Piattaforma di membership per Telegram con gestione centralizzata dei gruppi.

## Stack
- **Backend**: PocketBase + Bot Telegram
- **Frontend**: SvelteKit
- **Deploy**: Docker Compose + Caddy reverse proxy

## Architettura

```
Web App (SvelteKit) ←→ PocketBase API ←→ Bot Telegram
                                ↕
                            Database
```

## Collections PocketBase
- `members` - Utenti registrati (email + telegram_id + telegram_name + telegram_username)
- `groups` - Gruppi Telegram sincronizzati automaticamente
- `config` - Configurazione app (telegram_bot settings)
- `settings` - Hook triggers per notifiche bot

## Bot Telegram (Processo separato)
**Funzioni essenziali:**
1. **Admin gruppi** - Quando aggiunto come admin, sincronizza gruppo in PocketBase
2. **Linking membri** - Doppio flusso: deeplink bot + Telegram Login Widget
3. **Invite links** - Genera link singolo uso per collegamento automatico
4. **Config reload** - Webhook per ricaricamento configurazione live

**Come funziona:**
- Legge token da PocketBase collection `settings` (key: telegram_bot)
- Gestisce `/start` con parametro per collegare utenti (bot flow)
- Gestisce chat_member events per invite link flow
- HTTP server per webhooks (/webhook/config-reload, /create-invite, /health)
- Sincronizza automaticamente quando aggiunto a gruppi
- Usa PocketBase REST API per tutti gli aggiornamenti

## Flussi di Collegamento Utente
1. **Bot Flow**: Dashboard → deeplink → `/start` bot → collegamento
2. **Widget Flow**: Dashboard → Telegram Login Widget → `/api/telegram-callback` → collegamento diretto
3. **Invite Link Flow**: Dashboard → invite link → join gruppo → collegamento automatico

## Setup Sviluppo

```bash
# Terminal 1: Backend
cd pocketbase && ./pocketbase serve --http=127.0.0.1:8090

# Terminal 2: Bot Telegram
cd telegram-bot && bun install && bun start

# Terminal 3: Frontend
cd sveltekit && bun install && bun run dev
```

## Configurazione Ambiente
File `.env` nel root del progetto condiviso da tutti i componenti con **fail-fast validation**:
- **POCKETBASE_URL**: URL completo PocketBase per connessioni esterne
- **POCKETBASE_ADMIN_EMAIL/PASSWORD**: Credenziali admin per setup iniziale
- **TELEGRAM_LINK_SECRET**: Chiave HMAC per validazione token sicuri
- **BOT_HOST/BOT_PORT**: Configurazione HTTP server bot
- **BOT_WEBHOOK_SECRET**: Autenticazione webhook PocketBase → Bot

## Deploy Produzione (VPS)
```bash
docker compose up -d
```

## API Principali
- `/api/collections/members/records` - CRUD membri con telegram data
- `/api/collections/groups/records` - CRUD gruppi sincronizzati
- `/api/collections/settings/records` - Configurazione bot (key: telegram_bot)
- `/api/custom/link-telegram` - Endpoint collegamento (bot + web app flow)
- `/api/telegram-callback` - Telegram Login Widget callback

## Hooks PocketBase
- `settings.pb.js` - Notifica bot quando config cambia
- `members_defaults.pb.js` - Ruoli default e admin detection
- `link_telegram.pb.js` - Gestione collegamento dual-flow
- `groups_bot_sync.pb.js` - Sincronizzazione gruppi da bot

## Pattern Architetturali
- **Fail-fast validation**: Tutte le variabili ENV obbligatorie → log + exit se mancanti
- **DynamicModel PocketBase**: Go wrapped objects → JSON conversion per accesso JS
- **HMAC token security**: Tutti gli endpoint bot-web usano token temporizzati
- **Dual auth flow**: Bot deeplink + Telegram Widget per UX flessibile
- **Auto-sync**: Bot come admin → sync automatico gruppi in PocketBase

Sistema simile a MightyNetworks/Circle ma specifico per Telegram.

## TODO Futuro
- [ ] **Produzione optimized**: Creare Dockerfile.prod per build ottimizzato in produzione
- [ ] **CI/CD Pipeline**: Setup automatico build/deploy separato dev/prod
- [ ] **Performance**: Implementare SSG per pagine statiche
- [ ] **Monitoring**: Aggiungere health checks e logging produzione

## Best Practices
- **MAI hardcoded variables!** → fail-fast validation obbligatoria
- **PocketBase docs sono SACRI**: https://pocketbase.io/docs/ e https://pocketbase.io/jsvm/
  - MAI inventare sintassi o API non documentate
  - Controllare SEMPRE docs ufficiali prima di scrivere codice PocketBase
  - Molte funzionalità (CORS, auth, etc.) sono built-in - non reinventare
- **SvelteKit produzione**: @sveltejs/adapter-node + csrf: false per reverse proxy