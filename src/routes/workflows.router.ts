import express = require("express");
import WorkflowsController from "../controllers/workflows.controller";

const router = express.Router();

router.post("/", async (req, res) => {
    const controller = new WorkflowsController();
    const response = await controller.getWorkflows();
    return res.send(response);
});

export default router;