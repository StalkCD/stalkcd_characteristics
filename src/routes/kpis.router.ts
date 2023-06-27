import express = require("express");
import KPIsController from "../controllers/kpis.controller";

const router = express.Router();

router.post("/", async (req, res) => {
    const controller = new KPIsController();
    const response = await controller.getKPIs(req.body);
    return res.send(response);
});

export default router;