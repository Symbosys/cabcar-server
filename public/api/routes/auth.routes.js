"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoute = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const authRoute = (0, express_1.Router)();
exports.authRoute = authRoute;
authRoute.post("/request-otp", controllers_1.AuthController.requestOtp);
authRoute.post("/user/login", controllers_1.AuthController.userLogin);
