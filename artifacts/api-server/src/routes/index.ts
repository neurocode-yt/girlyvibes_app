import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import logRouter from "./log";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(logRouter);

export default router;
