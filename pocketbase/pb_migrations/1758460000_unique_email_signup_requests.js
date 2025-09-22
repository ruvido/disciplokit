migrate((app) => {
  // Add unique index on email field using raw SQL
  app.db().newQuery("CREATE UNIQUE INDEX idx_unique_email ON signup_requests (email)").execute();
}, (app) => {
  // Remove unique index on email field using raw SQL
  app.db().newQuery("DROP INDEX IF EXISTS idx_unique_email").execute();
});