import { Router } from "express";
import { userController } from "../controllers";

const userRoute = Router();

userRoute.post("/request-otp", userController.requestOtp)
userRoute.post("/user/login", userController.userLogin)

export {userRoute}