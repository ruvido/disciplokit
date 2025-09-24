# Disciplo

Piattaforma di membership per Telegram con gestione centralizzata dei gruppi.

## Stack
- **Backend**: PocketBase + Bot Telegram
- **Frontend**: SvelteKit
- **Deploy**: Docker Compose + Caddy reverse proxy


## STRICT CODE VERIFICATION PROTOCOL

### MANDATORY RULE FOR ALL CODE EXAMPLES
**NO CODE SHALL BE WRITTEN WITHOUT LITERAL VERIFICATION FROM OFFICIAL DOCS**

1. **BEFORE writing any code**:
   - Use WebFetch to get the EXACT example from official docs
   - Copy the LITERAL syntax, don't modify or "improve" it
   - If docs don't have the exact pattern needed, DON'T INVENT IT, but combine what's official to achieve the end result

1. **VERIFICATION SOURCES (in order of priority)**:
   - Official API docs: https://pocketbase.io/docs/js-overview/
   - JSVM docs: https://pocketbase.io/jsvm/
   - pocketbase SDK: https://github.com/pocketbase/js-sdk
   - Sveltekit docs: https://svelte.dev/docs/kit/introduction
   - Shadcn-svelte: https://github.com/huntabyte/shadcn-svelte

3. **FORBIDDEN PRACTICES**:
   - ❌ Writing code from memory
   - ❌ "Improving" official examples
   - ❌ Mixing different SDK patterns
   - ❌ Assuming API methods exist without verification



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
2. **Widget Flow**: Dashboard → Telegram Login Widget → `/api/telegram-callback` → collegamento diretto + auto-sync gruppi
3. **Invite Link Flow**: Dashboard → invite link → join gruppo → collegamento automatico
4. **Group Auto-Sync**: Post telegram login → bot verifica membership → aggiunta automatica group_members

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
- `/api/custom/get-groups` - Bot accesso gruppi con HMAC security
- `/api/custom/find-user-by-telegram` - Find user by telegram ID
- `/api/custom/add-group-member` - Add user to group membership
- `/api/telegram-callback` - Telegram Login Widget callback + trigger auto-sync

## Hooks PocketBase
- `settings.pb.js` - Notifica bot quando config cambia
- `members_defaults.pb.js` - Ruoli default e admin detection
- `link_telegram.pb.js` - Gestione collegamento dual-flow
- `groups_bot_sync.pb.js` - Sincronizzazione gruppi da bot
- `get_groups.pb.js` - Custom API per bot accesso gruppi con HMAC
- `find_user_by_telegram.pb.js` - Custom API ricerca user by telegram ID
- `add_group_member.pb.js` - Custom API aggiunta member a gruppo

## Pattern Architetturali
- **Fail-fast validation**: Tutte le variabili ENV obbligatorie → log + exit se mancanti
- **DynamicModel PocketBase**: Go wrapped objects → JSON conversion per accesso JS
- **HMAC token security**: Tutti gli endpoint bot-web usano token temporizzati
- **Dual auth flow**: Bot deeplink + Telegram Widget per UX flessibile
- **Auto-sync**: Bot come admin → sync automatico gruppi in PocketBase

## Group Auto-Sync System
**Flusso completo automatico:**
1. **Signup-Direct**: Bot posta link semplice (no token/gruppo) quando aggiunto a gruppo
2. **User Registration**: Utente si registra via signup-direct (temporaneamente abilitato)
3. **Telegram Login**: Utente completa login Telegram via widget
4. **Auto-Sync Trigger**: telegram-callback webhook chiama bot API `/sync-user-groups`
5. **Membership Check**: Bot verifica membership utente in TUTTI i gruppi via Telegram API
6. **Auto-Join**: Se utente è membro gruppo, viene aggiunto automaticamente a group_members

**Bot HTTP API:**
- `POST /sync-user-groups` - Endpoint per auto-sync membership post login
- `GET /health` - Health check bot status
- Architettura sicura: solo HMAC token, mai credenziali admin
- Comunicazione asincrona: SvelteKit → Bot API → PocketBase custom endpoints

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
- mai usare questa emoji  🤖  e' orribile
