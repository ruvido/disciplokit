migrate((app) => {
  // Delete existing signup_requests collection
  let oldCollection = app.findCollectionByNameOrId("signup_requests");
  if (oldCollection) {
    app.delete(oldCollection);
  }

  // Create new signup_requests collection with correct field types
  let collection = new Collection({
    type: "base",
    name: "signup_requests",
    listRule: "@request.auth.admin = true",
    viewRule: "@request.auth.admin = true",
    createRule: "",
    updateRule: "@request.auth.admin = true",
    deleteRule: "@request.auth.admin = true",
    fields: [
      {
        type: "text",
        name: "name",
        required: true,
        max: 100
      },
      {
        type: "email",
        name: "email",
        required: true
      },
      {
        type: "date",
        name: "date_of_birth",
        required: true
      },
      {
        type: "select",
        name: "location",
        required: true,
        maxSelect: 1,
        values: [
          "Lombardia", "Lazio", "Campania", "Veneto", "Emilia-Romagna",
          "Piemonte", "Sicilia", "Toscana", "Puglia", "Calabria",
          "Sardegna", "Liguria", "Marche", "Abruzzo", "Friuli-Venezia Giulia",
          "Trentino-Alto Adige", "Umbria", "Basilicata", "Molise",
          "Valle d'Aosta", "Estero"
        ]
      },
      {
        type: "text",
        name: "location_details",
        required: false,
        max: 100
      },
      {
        type: "select",
        name: "relationship_status",
        required: true,
        maxSelect: 1,
        values: ["Celibe", "Sposato", "Fidanzato"]
      },
      {
        type: "editor",
        name: "motivation",
        required: true,
        max: 1000
      },
      {
        type: "relation",
        name: "assigned_group",
        required: false,
        maxSelect: 1,
        collectionId: "pbc_3346940990"
      },
      {
        type: "select",
        name: "status",
        required: true,
        maxSelect: 1,
        values: ["pending", "assigned", "reviewed", "accepted"]
      }
    ]
  });
  app.save(collection);
}, (app) => {
  let collection = app.findCollectionByNameOrId("signup_requests");
  app.delete(collection);
});