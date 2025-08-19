import { Router } from "express";
import { DriverBookingController } from "../controllers";

const DriverBookingRoute = Router()

DriverBookingRoute.post("/create", DriverBookingController.createDriverBooking)
DriverBookingRoute.get("/all", DriverBookingController.getDriverBooking)
DriverBookingRoute.get("/:id", DriverBookingController.getDriverBookingById)
DriverBookingRoute.put("/:id", DriverBookingController.processDriverBooking)


export default DriverBookingRoute