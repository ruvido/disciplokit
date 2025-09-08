# SvelteCo MVP

Un MVP funzionante per testare un'architettura completa con PocketBase + SvelteKit.

## Struttura Progetto

```
project/
├── pocketbase/                 # Backend PocketBase
│   ├── pb_hooks/              # Hooks per logica custom
│   │   ├── init-admin.pb.js   # Crea admin iniziale
│   │   └── users.pb.js        # Gestione utenti
│   ├── pb_migrations/         # Migrazioni database
│   │   └── add_role_field.js  # Aggiunge campo role
│   └── .env                   # Variabili ambiente
└── frontend/                  # Frontend SvelteKit
    ├── src/lib/
    │   ├── components/ui/     # Componenti shadcn-svelte
    │   ├── stores/auth.ts     # Store autenticazione
    │   └── pocketbase.ts      # Client PocketBase
    └── src/routes/           # Pagine applicazione
```

## Features MVP Implementate

✅ **Autenticazione Completa**
- Registrazione nuovi utenti (role="user" default)
- Login con email/password
- Logout funzionante
- Store reattivo per stato auth

✅ **Gestione Ruoli**
- Admin pre-creato via hook
- Campo role (admin/user) con validation
- UI diversa basata su ruolo

✅ **Protezione Route**
- Redirect automatico se non autenticato
- Hook client-side per navigation
- Load function per route protette

✅ **UI Professionale**
- Design system con shadcn-svelte
- Layout responsive
- Form validation
- Loading states

## Come Avviare

### 1. PocketBase Backend

```bash
cd pocketbase

# Scarica PocketBase (se non l'hai già)
# https://pocketbase.io/docs/

# Avvia con le variabili ambiente
./pocketbase serve --http=127.0.0.1:8090
```

### 2. Frontend SvelteKit

```bash
cd frontend

# Installa dependencies
npm install

# Avvia dev server
npm run dev
```

## Accesso Demo

**Admin:** admin@test.com / admin123456
**Nuovo User:** Registrazione via /signup

## Obiettivi Raggiunti

- ✅ Registrazione nuovo utente (role="user")
- ✅ Login admin pre-creato (role="admin") 
- ✅ Dashboard mostra email + role utente
- ✅ Logout funzionante
- ✅ Route protection
- ✅ UI pulita con shadcn

## Prossimi Step

Con questo MVP funzionante puoi aggiungere:
- Email notifications
- User management per admin
- Password reset
- Profile editing
- Role permissions granulari

Il foundation è solido e pronto per l'espansione! 🚀