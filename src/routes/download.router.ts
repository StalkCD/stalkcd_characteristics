import express = require("express");
import DownloadController from "../controllers/download.controller";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("Request received.");
    const controller = new DownloadController();
    const response = await controller.downloadGHAFilesAndLogs(req.body);    
    return res.send(response);
  } catch (error) {
    console.log("Error occured while sending: " + error);
  } finally {
    console.log("Request finished.");
  }

});

export default router;
