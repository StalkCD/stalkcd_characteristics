import express = require("express");
import CharacteristicsController from "../controllers/characteristics.controller";

const router = express.Router();

router.post("/", async (req, res) => {
    const controller = new CharacteristicsController();
    const response = await controller.getCharacteristics(req.body);
    return res.send(response);
});

export default router;