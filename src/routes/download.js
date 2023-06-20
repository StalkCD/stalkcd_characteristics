"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const download_1 = __importDefault(require("../controllers/download"));
const router = (0, express_1.Router)();
router.get("/:repoOwner/:repoName/:workflowName/:gitHubToken", download_1.default.downloadGHAFilesAndLogs);
exports.default = router;
