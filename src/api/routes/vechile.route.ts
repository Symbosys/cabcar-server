import { Router } from "express";
import { multerUpload } from "../middlewares";
import { VehicleController } from "../controllers";

const vehicleRoute = Router();

vehicleRoute.post(
  "/",
  multerUpload.single("image"),
  VehicleController.createCar
);
vehicleRoute.get("/", VehicleController.getALlCar);

vehicleRoute
  .route("/:id")
  .get(VehicleController.getCarByID)
  .put(multerUpload.single("image") ,VehicleController.updateCar);

export default vehicleRoute;
