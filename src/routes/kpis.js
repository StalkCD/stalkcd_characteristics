"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kpis_1 = __importDefault(require("../controllers/kpis"));
const router = (0, express_1.Router)();
router.get("/:repoName/:workflowName", kpis_1.default.getKPIs);
exports.default = router;
