import express = require("express");
import DownloadController from "../controllers/download.controller";

const router = express.Router();

router.post("/", async (req, res) => {
  const controller = new DownloadController();
  const response = await controller.downloadGHAFilesAndLogs(req.body);
  return res.send(response);

});

export default router;
