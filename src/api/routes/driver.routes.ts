import { Router } from "express";
import { DriverController } from "../controllers";
import { multerUpload } from "../middlewares";

const DriverRoute = Router();

DriverRoute.post("/", multerUpload.single("image"), DriverController.createDriver);
DriverRoute.get("/", DriverController.getAllDriver);
DriverRoute.get("/:id", DriverController.getDriverById);
DriverRoute.put("/:id", multerUpload.single("image"), DriverController.updateDriver);

export default DriverRoute;