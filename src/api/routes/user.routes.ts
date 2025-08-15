import { Router } from "express";
import { UserController } from "../controllers";
import { authenticateUser } from "../middlewares/auth.middleware";

const userRoute = Router();

userRoute.post("/documents", UserController.verifyDocument)
userRoute.get("/", UserController.getAllUsers)
userRoute.get("/:id", UserController.getUserById)
userRoute.get("docments/:userId", UserController.getDocumentByUserId)

export default userRoute;