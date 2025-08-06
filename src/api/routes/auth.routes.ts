import { Router } from "express";
import { AuthController } from "../controllers";

const authRoute = Router();

authRoute.post("/request-otp", AuthController.requestOtp)
authRoute.post("/user/login", AuthController.userLogin)

export {authRoute}