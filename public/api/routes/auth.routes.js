"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoute = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const userRoute = (0, express_1.Router)();
exports.userRoute = userRoute;
userRoute.post("/request-otp", controllers_1.userController.requestOtp);
userRoute.post("/user/login", controllers_1.userController.userLogin);
