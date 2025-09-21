migrate((app) => {
  // Delete the empty signup_requests collection if it exists
  try {
    let oldCollection = app.findCollectionByNameOrId("signup_requests");
    if (oldCollection) {
      app.delete(oldCollection);
    }
  } catch (e) {
    // Collection doesn't exist, that's fine
  }

  // Rename signup_requests_new to signup_requests
  let newCollection = app.findCollectionByNameOrId("signup_requests_new");
  newCollection.name = "signup_requests";
  app.save(newCollection);
}, (app) => {
  // Rollback: rename back to signup_requests_new
  let collection = app.findCollectionByNameOrId("signup_requests");
  collection.name = "signup_requests_new";
  app.save(collection);
});