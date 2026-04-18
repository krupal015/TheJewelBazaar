import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { verifyMailTransport } from "./config/mailer.js";
import { ensureAdminUser, ensureDefaultCategories } from "./services/bootstrap.service.js";

const bootstrap = async () => {
  await connectDatabase();
  await ensureAdminUser();
  await ensureDefaultCategories();
  await verifyMailTransport();

  app.listen(env.port, () => {
    console.log(`Server running on http://thejewelbazaar.vercel.app `);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to bootstrap application", error);
  process.exit(1);
});
