import { Application } from "express";
import express = require("express");
import morgan = require("morgan");
import Router from "./routes";
import swaggerUi = require("swagger-ui-express");

const PORT = process.env.PORT || 8001;

const app: Application = express();

app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
        swaggerOptions: {
        url: "/swagger.json",
        },
    })
);

app.use(Router);

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});