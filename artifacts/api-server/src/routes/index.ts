import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import reportsRouter from "./reports";
import paymentsRouter from "./payments";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(reportsRouter);
router.use(paymentsRouter);
router.use(adminRouter);

export default router;
