import { prisma } from "../../config";
import { AdminService } from "../services";
import { statusCode } from "../types/types";
import { ErrorResponse, jwt } from "../utils";
import { asyncHandler } from "./error.middleware";

export const authenticateUser = asyncHandler(async (req, res, next) => {
  const tokenFromCookie = req.cookies?.token;
  const tokenFromHeader =
    req.headers["authorization"]?.split("Bearer ")[1]?.trim() ||
    req.headers.cookie?.split("=")[1]?.trim();

  const tokenFromHeader2 = req.headers["authorization"]
    ?.split("Bearer ")[1]
    ?.trim();
  const token = tokenFromCookie || tokenFromHeader || tokenFromHeader2;
  if (!token) {
    return next(
      new ErrorResponse(
        "Not authorized, token missing",
        statusCode.Unauthorized
      )
    );
  }

  let decoded;
  try {
    decoded = jwt.verifyToken(token) as { id: number };
  } catch (error) {
    return next(
      new ErrorResponse("Invalid or expired token", statusCode.Unauthorized)
    );
  }
    //   const admin = await AdminService.findById(decoded?.id);
    const user = await prisma.user.findUnique({
        where: { id: decoded?.id },
        select: {
            id: true,
            name: true,
            email: true
        }
    })
  if (!user) {
    return next(
      new ErrorResponse(
        "Not authorized, admin or Sub Admin not found",
        statusCode.Unauthorized
      )
    );  
  }

  req.user = {
    id: String(user.id),
    name: user.name,
    email: user.email || ""
  };
  next();
});

// export const isAdmin = asyncHandler(async (req, res, next) => {
//   if (req.admin?.role === "admin") next();
//   else {
//     return next(new ErrorResponse("Permission Denied", statusCode.Forbidden));
//   }
// });

// export const allowSubAdmin = asyncHandler(async (req, res, next) => {
//   if (req.admin?.role === "admin" || req.admin?.role === "sub_admin") next();
//   else {
//     return next(new ErrorResponse("Permission Denied", statusCode.Forbidden));
//   }
// });
