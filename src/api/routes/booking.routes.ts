import { Router } from "express";
import { BookingController } from "../controllers";

const bookingRoute = Router();

bookingRoute.post("/create", BookingController.createBooking)
bookingRoute.get("/all", BookingController.getAllBooking)
bookingRoute.get("/:id", BookingController.getBookingById)
bookingRoute.put("/:id", BookingController.processOrder)

export default bookingRoute;