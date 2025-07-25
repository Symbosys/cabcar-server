"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const vehicleTypeRoute = (0, express_1.Router)();
vehicleTypeRoute.post("/", controllers_1.VehicleTypeController.createVehicleType);
vehicleTypeRoute.get("/", controllers_1.VehicleTypeController.getVehicleTypes);
vehicleTypeRoute
    .route("/:id")
    .get(controllers_1.VehicleTypeController.getVehicleTypeById)
    .put(controllers_1.VehicleTypeController.updateVehicleType).delete();
exports.default = vehicleTypeRoute;
