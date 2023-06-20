import { Router } from "express";
import controller from "../controllers/kpis";

const router = Router();

router.get(
  "/:repoName/:workflowName",
  controller.getKPIs
);
export default router;