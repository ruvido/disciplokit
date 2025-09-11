# Disciplo

Piattaforma di membership per Telegram con gestione centralizzata dei gruppi.

## Stack
- **Backend**: PocketBase + Bot Telegram
- **Frontend**: SvelteKit

## Architettura

```
Web App (SvelteKit) ←→ PocketBase API ←→ Bot Telegram
                                ↕
                            Database
```

## Collections PocketBase
- `members` - Utenti registrati (email + telegram_id)
- `groups` - Gruppi Telegram sincronizzati automaticamente  
- `config` - Configurazione app (telegram_bot_token, etc.)

## Bot Telegram (Processo separato)
**Funzioni essenziali:**
1. **Admin gruppi** - Quando aggiunto come admin, sincronizza gruppo in PocketBase
2. **Linking membri** - Collega email member con telegram_id tramite deeplink

**Come funziona:**
- Legge token da PocketBase collection `config`
- Gestisce `/start` con parametro per collegare utenti
- Sincronizza automaticamente quando aggiunto a gruppi
- Usa PocketBase REST API per tutti gli aggiornamenti

## Flusso Utente
1. Registrazione su web app
2. Dashboard mostra "Collega Telegram" (deeplink)
3. Bot associa telegram_id al member
4. Admin può gestire membership da web app

## Setup Sviluppo

```bash
# Terminal 1: Backend
cd pocketbase
./pocketbase serve --http=127.0.0.1:8090

# Terminal 2: Bot Telegram
cd telegram-bot
npm install
npm start

# Terminal 3: Frontend
cd sveltekit
npm install
npm run dev
```

## Deploy Produzione (VPS)
```bash
docker-compose up -d
```

## API Principali
- `/api/collections/members/records` - CRUD membri
- `/api/collections/groups/records` - CRUD gruppi
- `/api/collections/config/records` - Configurazione bot

Sistema simile a MightyNetworks/Circle ma specifico per Telegram.