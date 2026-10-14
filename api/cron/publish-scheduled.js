// Daily Vercel Cron (vercel.json): publishes scheduled posts whose
// publishAt has passed, dated to their scheduled time. Hobby plans run
// crons once a day, so a post goes out on the first run after its time.
// Vercel sends "Authorization: Bearer <CRON_SECRET>"; set CRON_SECRET in
// the project's environment variables.
import { getDb } from "../_lib/firestore.js";

const SCHEDULED = 5;
const APPROVED = 1;

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const db = getDb();
    const due = await db
      .collection("posts")
      .where("status", "==", SCHEDULED)
      .where("publishAt", "<=", new Date())
      .get();
    // Batches hold at most 500 writes
    for (let i = 0; i < due.docs.length; i += 400) {
      const batch = db.batch();
      due.docs.slice(i, i + 400).forEach((post) =>
        batch.update(post.ref, {
          status: APPROVED,
          createdAt: post.data().publishAt,
        })
      );
      await batch.commit();
    }
    res.status(200).json({ published: due.size });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not publish scheduled posts." });
  }
}
