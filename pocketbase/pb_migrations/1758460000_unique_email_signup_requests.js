migrate((app) => {
  // Add unique index on email field for signup_requests using raw SQL
  app.db().newQuery("CREATE UNIQUE INDEX idx_unique_email_signup_requests ON signup_requests (email)").execute();

  // Add unique index on email field for members using raw SQL
  app.db().newQuery("CREATE UNIQUE INDEX idx_unique_email_members ON members (email)").execute();
}, (app) => {
  // Remove unique index on email field for signup_requests using raw SQL
  app.db().newQuery("DROP INDEX IF EXISTS idx_unique_email_signup_requests").execute();

  // Remove unique index on email field for members using raw SQL
  app.db().newQuery("DROP INDEX IF EXISTS idx_unique_email_members").execute();
});