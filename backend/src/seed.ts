import mongoose from "mongoose";
import { User } from "./models/User";
import { Idea } from "./models/Idea";
import { Analysis } from "./models/Analysis";
import { connectDatabase } from "./config/database";
import { DEMO_EMAIL, DEMO_IDEAS, purgeExpiredDemoSpaces } from "./demo/demoAccount";

/**
 * Demo data no longer needs seeding: every "Essayer la démo" click (or login
 * with the published demo credentials) opens a fresh, pre-filled demo space.
 *
 * This script only tidies demo data, and never touches real accounts:
 *  - removes the legacy shared demo user (older versions created one), with its data;
 *  - deletes expired demo spaces.
 */
async function tidyDemoData(): Promise<void> {
  await connectDatabase();

  const legacy = await User.findOne({ email: DEMO_EMAIL });
  if (legacy) {
    await Promise.all([Analysis.deleteMany({ userId: legacy._id }), Idea.deleteMany({ userId: legacy._id })]);
    await legacy.deleteOne();
    console.info(`🧹 Removed the legacy shared demo user (${DEMO_EMAIL}) and its data`);
  }

  const purged = await purgeExpiredDemoSpaces();
  console.info(`🧹 Purged ${purged} expired demo space(s)`);
  console.info(`✅ Done. Each demo now opens its own space with ${DEMO_IDEAS.length} showcase ideas.`);

  await mongoose.disconnect();
}

tidyDemoData().catch((err) => {
  console.error("Tidy failed:", err);
  process.exit(1);
});
