import express = require("express");
import PingController from "../controllers/ping.controller";
import DownloadRouter from "./download.router";
import CharacteristicsRouter from "./characteristics.router";
import WorkflowsRouter from "./workflows.router";


const router = express.Router();

router.get("/ping", async (_req, res) => {
    const controller = new PingController();
    const response = await controller.getMessage();
    return res.send(response);
});

router.use("/download", DownloadRouter);
router.use("/characteristics", CharacteristicsRouter);
router.use("/workflows", WorkflowsRouter);


export default router;