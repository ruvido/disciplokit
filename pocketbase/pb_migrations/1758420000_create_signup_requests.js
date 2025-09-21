migrate((app) => {
  let collection = new Collection({
    type: "base",
    name: "signup_requests_new",
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
        type: "text",
        name: "location",
        required: true
      },
      {
        type: "text",
        name: "location_details",
        required: false
      },
      {
        type: "text",
        name: "relationship_status",
        required: true
      },
      {
        type: "text",
        name: "motivation",
        required: true
      },
      {
        type: "text",
        name: "status",
        required: true
      }
    ]
  });
  app.save(collection);
}, (app) => {
  let collection = app.findCollectionByNameOrId("signup_requests_new");
  app.delete(collection);
});