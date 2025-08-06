"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const controllers_1 = require("../controllers");
const vehicleRoute = (0, express_1.Router)();
vehicleRoute.post("/", middlewares_1.multerUpload.single("image"), controllers_1.VehicleController.createCar);
vehicleRoute.get("/", controllers_1.VehicleController.getALlCar);
vehicleRoute
    .route("/:id")
    .get(controllers_1.VehicleController.getCarByID)
    .put(middlewares_1.multerUpload.single("image"), controllers_1.VehicleController.updateCar);
exports.default = vehicleRoute;
