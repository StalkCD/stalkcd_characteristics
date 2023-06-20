"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const download_1 = __importDefault(require("./routes/download"));
const kpis_1 = __importDefault(require("./routes/kpis"));
const http = __importStar(require("http"));
const express = require("express");
const router = express();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
/** Rules of the API */
router.use((req, res, next) => {
    /** set CORS policy */
    res.header("Access-Control-Allow-Origin", "*");
    /** set CORS heaaders */
    res.header("Access-Control-Allow-Headers", "origin, X-Requested-With,Content-Type,Accept, Authorization");
    /** set CORS method headers */
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST");
        return res.status(200).json({});
    }
    next();
});
/** Routes */
router.use("/download", download_1.default);
router.use("/kpis", kpis_1.default);
/** Error handling */
router.use((req, res, next) => {
    const error = new Error("not found");
    return res.status(404).json({
        message: error.message,
    });
});
/** Server */
const httpServer = http.createServer(router);
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 6060;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
