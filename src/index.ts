import { Application } from "express";
import express = require("express");
import morgan = require("morgan");
import Router from "./routes";
import swaggerUi = require("swagger-ui-express");
var cors = require("cors");

const PORT = process.env.PORT || 8082;

const app: Application = express();

app.use(cors({
    origin: ["http://localhost:4200","http://localhost:8080", "http://18.193.68.144:8080"],
    optionsSuccessStatus: 200,
}));
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