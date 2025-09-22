migrate((app) => {
  const settingsCollection = app.findCollectionByNameOrId("settings");

  // Config 1: signup-simple (form moderator approval)
  let simpleRecord = new Record(settingsCollection);
  simpleRecord.set("key", "signup-simple");
  simpleRecord.set("data", {
    "enabled": true,
    "target_collection": "signup_requests",
    "completion": {
      "message": "Richiesta inviata! Riceverai una email quando approvata.",
      "redirect": "/signup-success"
    },
    "steps": [
      {
        "id": "simple",
        "title": "Richiesta di Iscrizione",
        "description": "Compila i dati per richiedere l'accesso",
        "fields": [
          {
            "name": "name",
            "type": "text",
            "label": "Nome completo",
            "placeholder": "Mario Rossi",
            "required": true
          },
          {
            "name": "email",
            "type": "email",
            "label": "Email",
            "placeholder": "mario@esempio.com",
            "required": true
          },
          {
            "name": "birth_year",
            "type": "number",
            "label": "Anno di nascita",
            "min": 1930,
            "max": 2007,
            "placeholder": "1990",
            "required": true
          },
          {
            "name": "location",
            "type": "select",
            "label": "Regione",
            "options_ref": "signup-options.regions",
            "required": true
          },
          {
            "name": "relationship_status",
            "type": "select",
            "label": "Stato civile",
            "options": ["Celibe", "Sposato", "Fidanzato"],
            "required": true
          },
          {
            "name": "motivation",
            "type": "textarea",
            "label": "Perché vuoi entrare nei gruppi?",
            "placeholder": "Racconta la tua motivazione...",
            "maxLength": 500,
            "required": true
          }
        ]
      }
    ]
  });
  app.save(simpleRecord);

  // Config 2: signup-completion (post-approval completion)
  let completionRecord = new Record(settingsCollection);
  completionRecord.set("key", "signup-completion");
  completionRecord.set("data", {
    "enabled": true,
    "target_collection": "members",
    "prefill_from": "signup_requests",
    "completion": {
      "message": "Profilo completato! Benvenuto nella community!",
      "redirect": "/dashboard"
    },
    "steps": [
      {
        "id": "credentials",
        "title": "Credenziali di Accesso",
        "description": "Imposta le tue credenziali per il login",
        "fields": [
          {
            "name": "email",
            "type": "email",
            "label": "Email",
            "readonly": true,
            "required": true
          },
          {
            "name": "password",
            "type": "password",
            "label": "Password",
            "placeholder": "Crea una password sicura",
            "minLength": 8,
            "required": true
          }
        ]
      },
      {
        "id": "profile",
        "title": "Completa il Profilo",
        "description": "Aggiungi foto e interessi",
        "fields": [
          {
            "name": "profile_picture",
            "type": "file",
            "label": "Foto profilo",
            "accept": "image/*",
            "maxSize": "5MB",
            "required": true
          },
          {
            "name": "hobbies",
            "type": "checkbox",
            "label": "Hobby (seleziona almeno uno)",
            "options_ref": "signup-options.hobbies",
            "required": true
          },
          {
            "name": "professional_skills",
            "type": "checkbox",
            "label": "Competenze professionali",
            "options_ref": "signup-options.professional_skills",
            "required": true
          }
        ]
      },
      {
        "id": "telegram",
        "title": "Collega Telegram",
        "description": "Ultimo passaggio per accedere ai gruppi",
        "fields": [
          {
            "name": "telegram_widget",
            "type": "telegram_login",
            "label": "Login con Telegram",
            "required": true
          }
        ]
      }
    ]
  });
  app.save(completionRecord);

  // Config 3: signup-direct (bot invite diretto)
  let directRecord = new Record(settingsCollection);
  directRecord.set("key", "signup-direct");
  directRecord.set("data", {
    "enabled": true,
    "target_collection": "members",
    "prefill_telegram": true,
    "completion": {
      "message": "Account creato! Benvenuto nella community!",
      "redirect": "/dashboard"
    },
    "steps": [
      {
        "id": "basic",
        "title": "Informazioni di base",
        "description": "Crea il tuo account",
        "fields": [
          {
            "name": "email",
            "type": "email",
            "label": "Email",
            "placeholder": "mario@esempio.com",
            "required": true
          },
          {
            "name": "password",
            "type": "password",
            "label": "Password",
            "placeholder": "Crea una password sicura",
            "minLength": 8,
            "required": true
          },
          {
            "name": "name",
            "type": "text",
            "label": "Nome completo",
            "placeholder": "Mario Rossi",
            "required": true
          },
          {
            "name": "birth_year",
            "type": "number",
            "label": "Anno di nascita",
            "min": 1930,
            "max": 2007,
            "placeholder": "1990",
            "required": true
          }
        ]
      },
      {
        "id": "location",
        "title": "Dove abiti?",
        "description": "La tua regione di residenza",
        "fields": [
          {
            "name": "region",
            "type": "select",
            "label": "Regione",
            "options_ref": "signup-options.regions",
            "required": true
          }
        ]
      },
      {
        "id": "work",
        "title": "Il tuo lavoro",
        "description": "Situazione lavorativa attuale",
        "fields": [
          {
            "name": "job_type",
            "type": "select",
            "label": "Tipo di occupazione",
            "options_ref": "signup-options.job_types",
            "required": true
          }
        ]
      },
      {
        "id": "motivation",
        "title": "Motivazione",
        "description": "Perché vuoi partecipare?",
        "fields": [
          {
            "name": "why_participate",
            "type": "textarea",
            "label": "Racconta brevemente cosa ti porta qui",
            "placeholder": "Voglio crescere professionalmente, incontrare persone interessanti...",
            "maxLength": 500,
            "required": true
          }
        ]
      },
      {
        "id": "interests",
        "title": "I tuoi interessi",
        "description": "Hobby e competenze professionali",
        "fields": [
          {
            "name": "hobbies",
            "type": "checkbox",
            "label": "Hobby (seleziona almeno uno)",
            "options_ref": "signup-options.hobbies",
            "required": true
          },
          {
            "name": "professional_skills",
            "type": "checkbox",
            "label": "Competenze professionali (seleziona almeno una)",
            "options_ref": "signup-options.professional_skills",
            "required": true
          }
        ]
      },
      {
        "id": "photo",
        "title": "Foto profilo",
        "description": "Carica la tua foto",
        "fields": [
          {
            "name": "profile_picture",
            "type": "file",
            "label": "Foto profilo",
            "accept": "image/*",
            "maxSize": "5MB",
            "required": true
          }
        ]
      }
    ]
  });
  app.save(directRecord);

  // Config 4: signup-options (opzioni riutilizzabili)
  let optionsRecord = new Record(settingsCollection);
  optionsRecord.set("key", "signup-options");
  optionsRecord.set("data", {
    "regions": [
      "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
      "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
      "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
      "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto", "Estero"
    ],
    "hobbies": [
      "Sport", "Musica", "Lettura", "Viaggi", "Tecnologia", "Arte",
      "Cucina", "Gaming", "Fotografia", "Cinema", "Teatro", "Scrittura",
      "Giardinaggio", "Altro"
    ],
    "professional_skills": [
      "Marketing", "Tech/Sviluppo", "Design", "Business", "Finanza",
      "Vendite", "Comunicazione", "HR", "Project Management",
      "Consulenza", "Formazione", "Altro"
    ],
    "job_types": [
      "Dipendente", "Libero professionista", "Imprenditore",
      "Studente", "Disoccupato", "Pensionato", "Altro"
    ]
  });
  app.save(optionsRecord);

}, (app) => {
  // Rollback - delete all signup config records
  const configKeys = ["signup-simple", "signup-completion", "signup-direct", "signup-options"];
  configKeys.forEach(key => {
    const record = app.findFirstRecordByFilter("settings", `key='${key}'`);
    if (record) {
      app.delete(record);
    }
  });
});