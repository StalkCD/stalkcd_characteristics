import { Express } from "express";
import downloadRoutes from "./routes/download";
import kPIRoutes from "./routes/kpis";
import * as http from "http";
import express = require("express");

const router: Express = express();

router.use(express.urlencoded({ extended: false }));
router.use(express.json());

/** Rules of the API */
router.use((req, res, next) => {
  /** set CORS policy */
  res.header("Access-Control-Allow-Origin", "*");
  /** set CORS heaaders */
  res.header(
    "Access-Control-Allow-Headers",
    "origin, X-Requested-With,Content-Type,Accept, Authorization"
  );
  /** set CORS method headers */
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST");
    return res.status(200).json({});
  }
  next();
});

/** Routes */
router.use("/download", downloadRoutes);
router.use("/kpis", kPIRoutes);

/** Error handling */
router.use((req, res, next) => {
  const error = new Error("not found");
  return res.status(404).json({
    message: error.message,
  });
});

/** Server */
const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 6060;
httpServer.listen(PORT, () =>
  console.log(`The server is running on port ${PORT}`)
);
