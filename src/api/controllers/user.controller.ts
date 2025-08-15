import { prisma } from "../../config";
import { asyncHandler } from "../middlewares";
import { statusCode } from "../types/types";
import { ErrorResponse } from "../utils";
import { SuccessResponse } from "../utils/response.util";
import { VerifyUserIdentitySchema } from "../validators/document.validator";

export const verifyDocument = asyncHandler(async (req, res, next) => {
    const validData = VerifyUserIdentitySchema.parse(req.body);

    const { userId, aadhaarNumber, drivingLicenseNumber } = validData;

     // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return next(new ErrorResponse("User not found", statusCode.Not_Found));
    }
    
     // Check for duplicate Aadhaar number (if provided and verified elsewhere)
  if (aadhaarNumber) {
    const existingAadhaar = await prisma.document.findFirst({
      where: { aadhaarNumber, aadhaarVerified: true },
    });
    if (existingAadhaar && existingAadhaar.userId !== userId) {
      return next(new ErrorResponse("Aadhaar number is already verified for another user", statusCode.Bad_Request));
    }
    }
    
     // Check for duplicate Driving License number (if provided and verified elsewhere)
  if (drivingLicenseNumber) {
    const existingDL = await prisma.document.findFirst({
      where: { drivingLicenseNumber, drivingLicenseVerified: true },
    });
    if (existingDL && existingDL.userId !== userId) {
      return next(new ErrorResponse("Driving license number is already verified for another user", statusCode.Bad_Request));
    }
    }
    
    // Check if UserIdentity record exists for the user
  const existingIdentity = await prisma.document.findUnique({ where: { userId } });

    if (existingIdentity) {
    // Check if provided numbers match verified ones
    if (aadhaarNumber && existingIdentity.aadhaarNumber === aadhaarNumber && existingIdentity.aadhaarVerified) {
      return next(new ErrorResponse("Aadhaar number is already verified for this user", statusCode.Bad_Request));
    }
    if (
      drivingLicenseNumber &&
      existingIdentity.drivingLicenseNumber === drivingLicenseNumber &&
      existingIdentity.drivingLicenseVerified
    ) {
      return next(new ErrorResponse("Driving license number is already verified for this user", statusCode.Bad_Request));
    }
    const updatedIdentity = await prisma.document.update({
      where: { userId },
      data: {
        aadhaarNumber: aadhaarNumber || existingIdentity.aadhaarNumber || null,
        drivingLicenseNumber: drivingLicenseNumber || existingIdentity.drivingLicenseNumber || null,
        aadhaarVerified: aadhaarNumber ? true : existingIdentity.aadhaarVerified,
        drivingLicenseVerified: drivingLicenseNumber ? true : existingIdentity.drivingLicenseVerified,
      },
    });

    return SuccessResponse(res, "User identity updated successfully", updatedIdentity, statusCode.OK);
    }
    
    // Create new UserIdentity record
  const newIdentity = await prisma.document.create({
    data: {
      userId: userId as number,
      aadhaarNumber: aadhaarNumber || null,
      drivingLicenseNumber: drivingLicenseNumber || null,
      aadhaarVerified: aadhaarNumber ? true : false, // Default to true (no external API)
      drivingLicenseVerified: drivingLicenseNumber ? true : false, // Default to true (no external API)
    },
  });

  return SuccessResponse(res, "User identity created successfully", newIdentity, statusCode.Created);
})

export const getDocumentByUserId = asyncHandler(async (req, res, next) => {
    const userId = Number(req.params.userId);
    
    if(!userId || isNaN(userId)){
        return next(new ErrorResponse("Invalid user id", statusCode.Bad_Request));
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(new ErrorResponse("User not found", statusCode.Not_Found));
    }

    const document = await prisma.document.findUnique({ where: { userId } });
    if (!document) {
      return next(new ErrorResponse("Document not found", statusCode.Not_Found));
    }

    return SuccessResponse(res, "Document found", document, statusCode.OK);
})


// get ALl users
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const page = Number(req.params.page);
  const limit = Number(req.params.limit);
  const search = req.params.search;

  const where: any = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search} },
      { email: { contains: search} },
    ];
  }
  
  const skip = (page - 1) * limit;

  const [totalUser, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })
  ])

  return SuccessResponse(res, "All user Retrived successfully", {
    users,
    totalUser,
    currentPage: page,
    totalPages: Math.ceil(totalUser / limit),
    count: users.length
  })

})

export const getUserById = asyncHandler(async (req, res, next) => {
  const userId = Number(req.params.userId);

  if(!userId || isNaN(userId)){
      return next(new ErrorResponse("Invalid user id", statusCode.Bad_Request));
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, include: {documents: true} });
  if (!user) {
    return next(new ErrorResponse("User not found", statusCode.Not_Found));
  }

  return SuccessResponse(res, "User found", user, statusCode.OK);
})