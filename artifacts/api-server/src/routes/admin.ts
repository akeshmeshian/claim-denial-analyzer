import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, reportsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/admin/reports", async (req, res): Promise<void> => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!adminPassword || token !== adminPassword) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const reports = await db
    .select({
      id: reportsTable.id,
      email: reportsTable.email,
      claimType: reportsTable.claimType,
      paymentStatus: reportsTable.paymentStatus,
      createdAt: reportsTable.createdAt,
    })
    .from(reportsTable)
    .orderBy(desc(reportsTable.createdAt));

  res.json(reports);
});

export default router;
