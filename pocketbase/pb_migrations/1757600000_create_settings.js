/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
        type:     "base",
        name:     "settings",
        // listRule: "@request.auth.role = 'admin'",
        // viewRule: "@request.auth.role = 'admin'",
        // createRule: "@request.auth.role = 'admin'",
        // updateRule: "@request.auth.role = 'admin'",
        // deleteRule: "@request.auth.role = 'admin'",
        fields: [
            {
                type:        "text",
                name:        "key",
                required:    true,
                unique:      true,
            }, 
            {
                type:        "json",
                name:        "data",
            }, 
            {
                type:        "text",
                name:        "description",
            }, 
        ],
    })

    console.log("Creating Settings collection")
    app.save(collection);

    
    const tgBotName    = $os.getenv("TELEGRAM_BOT_NAME")
    const tgBotToken   = $os.getenv("TELEGRAM_BOT_TOKEN")
    // const tgBotLinkSecret = $os.getenv("TELEGRAM_LINK_SECRET")
    
    // add default member
    console.log("Updating telegram bot config token")
    // const colle = app.findCollectionByNameOrId("settings")
    const record = new Record(collection)
    record.set("key", "telegram_bot")
    record.set("data", {
        name:  tgBotName,
        token: tgBotToken
        // secret: tgBotLinkSecret
    })
    record.set("description", "Telegram bot settings")
    app.save(record)

    // Create signup-steps configuration record
    console.log("Creating signup-steps configuration")
    const signupRecord = new Record(collection)
    signupRecord.set("key", "signup-steps")
    signupRecord.set("data", {
        "enabled": true,
        "progress_bar": true,
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
                        "placeholder": "1990",
                        "required": true,
                        "min": 1950,
                        "max": 2010
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
                        "required": true,
                        "options": [
                            "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
                            "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
                            "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
                            "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto", "Estero"
                        ]
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
                        "required": true,
                        "options": [
                            "Dipendente", "Libero professionista", "Imprenditore", 
                            "Studente", "Disoccupato", "Pensionato", "Altro"
                        ]
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
                        "required": true,
                        "maxLength": 500
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
                        "required": true,
                        "options": [
                            "Sport", "Musica", "Lettura", "Viaggi", "Tecnologia", 
                            "Arte", "Cucina", "Gaming", "Fotografia", "Cinema", 
                            "Teatro", "Scrittura", "Giardinaggio", "Altro"
                        ]
                    },
                    {
                        "name": "professional_skills",
                        "type": "checkbox", 
                        "label": "Competenze professionali (seleziona almeno una)",
                        "required": true,
                        "options": [
                            "Marketing", "Tech/Sviluppo", "Design", "Business", 
                            "Finanza", "Vendite", "Comunicazione", "HR", 
                            "Project Management", "Consulenza", "Formazione", "Altro"
                        ]
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
                        "required": true,
                        "accept": "image/*",
                        "maxSize": "5MB"
                    }
                ]
            }
        ],
        "completion": {
            "message": "Profilo completato al 100%! 🎉",
            "redirect": "/dashboard"
        }
    })
    signupRecord.set("description", "Multistep signup flow configuration")
    app.save(signupRecord)
})

//   // Insert default bot configuration
//   let record = new Record(collection);
//   record.set("key", "bot_config");
//   record.set("data", {"token": "", "name": ""});
//   record.set("description", "Telegram bot token and username");
//   app.save(record);
//
//   record = new Record(collection);
//   record.set("key", "bot_enabled");
//   record.set("data", true);
//   record.set("description", "Enable/disable telegram bot");
//   app.save(record);
//
// }, (app) => {
//   const collection = app.findCollectionByNameOrId("settings");
//   return app.delete(collection);
// });
