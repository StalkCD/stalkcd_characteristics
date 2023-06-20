import { Router } from "express";
import controller from "../controllers/download";

const router = Router();

router.get(
  "/:repoOwner/:repoName/:workflowName/:gitHubToken",
  controller.downloadGHAFilesAndLogs
);
export default router;
