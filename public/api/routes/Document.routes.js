"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const documentRoute = (0, express_1.Router)();
documentRoute.post("/documents", controllers_1.UserController.verifyDocument);
documentRoute.get("/:userId", controllers_1.UserController.getDocumentByUserId);
exports.default = documentRoute;
