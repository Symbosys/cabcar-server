import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { errorMiddleware } from "./api/middlewares";
import { authRoute } from "./api/routes/auth.routes";
import bookingRoute from "./api/routes/booking.routes";
import DriverRoute from "./api/routes/driver.routes";
import DriverBookingRoute from "./api/routes/driverBooking.routes";
import userRoute from "./api/routes/user.routes";
import vehicleRoute from "./api/routes/vechile.route";
import vehicleTypeRoute from "./api/routes/vechileType.route";
import { ENV } from "./config";

// 🚀 Initialize express application
const app = express();



// 🛡️ Security and utility middlewares
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: [ENV.FRONTEND_URL as string, ENV.FRONTEND_URL1 as string],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, //⌛ 15 minutes
    max: 1000, // limit each IP to 100 requests per windowMs
    message: {
      status: 429,
      message: "Too many requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// 🩺 Health check endpoint
app.get("/", (_, res) => {
  res.send("Hello Worldsss");
});


app.use("/api/auth", authRoute);
app.use("/api/vehicle-types", vehicleTypeRoute);
app.use("/api/vehicles", vehicleRoute)
app.use("/api/drivers", DriverRoute)
app.use("/api/users", userRoute)
app.use("/api/order", bookingRoute)
app.use("/api/driver-booking", DriverBookingRoute)

// ⚠️ Global error handling middleware
app.use(errorMiddleware);

// 📤 Export the configured app
export default app;
