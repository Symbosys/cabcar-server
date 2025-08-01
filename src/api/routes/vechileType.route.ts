import { Router } from "express";
import { VehicleTypeController } from "../controllers";

const vehicleTypeRoute = Router();

vehicleTypeRoute.post("/", VehicleTypeController.createVehicleType);
vehicleTypeRoute.get("/", VehicleTypeController.getVehicleTypes);

vehicleTypeRoute
  .route("/:id")
  .get(VehicleTypeController.getVehicleTypeById)
  .put(VehicleTypeController.updateVehicleType).delete(VehicleTypeController.deleteVehicleType)

export default vehicleTypeRoute;


